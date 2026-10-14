import base64
import io
from pathlib import Path
import tempfile
import unittest
import uuid

from PIL import Image
from server import Engine, AppError, REFERENCES, SIZES


class GenerationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        refs = self.root / "dist/assets/references"
        refs.mkdir(parents=True)
        for n in range(1, 8):
            Image.new("RGB", (8, 8), (n * 30, 20, 30)).save(refs / f"referencia-{n}.png")
        self.calls = []
        self.engine = Engine(self.root, self.transport)
        self.engine.key = "sk-test-only-not-a-real-key"

    def tearDown(self):
        self.temp.cleanup()

    def transport(self, path, key, body=None, content_type=None):
        self.calls.append((path, body, content_type))
        if path.startswith('/models/'):
            return {"id": "gpt-image-2"}
        output = io.BytesIO()
        Image.new("RGB", (24, 24), (len(self.calls)*20 % 255, 40, 70)).save(output, "PNG")
        return {"data": [{"b64_json": base64.b64encode(output.getvalue()).decode()}]}

    def payload(self, **kwargs):
        data = dict(request_id=str(uuid.uuid4()), prompt="Ilustra la vivienda inaccesible", headline="La vivienda se aleja de los jóvenes", style=0, count=1, width=800, height=600, mode="launch", variation=35)
        data.update(kwargs)
        return data

    def run_job(self, **kwargs):
        job = self.engine.submit(self.payload(**kwargs), run_async=False)
        return self.engine.jobs[job]

    def test_each_new_click_calls_provider_even_same_prompt(self):
        a, b = self.run_job(), self.run_job()
        c = self.run_job(prompt="Ilustra la sequía", headline="La sequía vacía los embalses")
        self.assertEqual(len(self.calls), 3)
        ids = {job['images'][0]['id'] for job in (a, b, c)}
        self.assertEqual(len(ids), 3)
        self.assertIn("Ilustra la sequía".encode(), self.calls[-1][1])
        self.assertNotIn("vivienda".encode(), self.calls[-1][1])
        self.assertNotEqual((self.engine.runtime / (a['images'][0]['id']+'.png')).read_bytes(), (self.engine.runtime / (b['images'][0]['id']+'.png')).read_bytes())

    def test_network_duplicate_is_idempotent(self):
        data = self.payload()
        first = self.engine.submit(data, run_async=False)
        second = self.engine.submit(data, run_async=False)
        self.assertEqual(first, second)
        self.assertEqual(len(self.calls), 1)

    def test_each_style_sends_only_its_references(self):
        for style, refs in enumerate(REFERENCES):
            self.run_job(style=style)
            body = self.calls[-1][1]
            for n in range(1, 8):
                self.assertEqual(f'filename="referencia-{n}.png"'.encode() in body, n in refs)
            self.assertNotIn(b"samples", body)

    def test_all_formats_export_exact_size(self):
        for width, height in SIZES:
            result = self.run_job(width=width, height=height)['images'][0]
            with Image.open(self.engine.runtime / (result['id']+'.png')) as image:
                self.assertEqual(image.size, (width, height))

    def test_variation_uses_selected_generated_image(self):
        source = self.run_job()['images'][0]
        job = self.run_job(mode="variation", source_id=source['id'], variation=90)
        self.assertEqual(job['status'], 'completed')
        body = self.calls[-1][1]
        self.assertIn(b'filename="resultado-seleccionado.png"', body)
        self.assertNotIn(b'filename="referencia-', body)
        self.assertIn(b'90/100', body)

    def test_count_and_partial_failure_preserve_only_real_results(self):
        original = self.engine.transport
        def fail_second(*args):
            if self.calls:
                raise AppError("Saldo insuficiente", 502)
            return original(*args)
        self.engine.transport = fail_second
        job = self.run_job(count=3)
        self.assertEqual(job['status'], 'failed')
        self.assertEqual(job['completed'], 1)
        self.assertEqual(len(job['images']), 1)
        self.assertEqual(len(self.engine.images), 1)
        self.assertEqual(job['error'], 'Saldo insuficiente')

    def test_failure_never_falls_back_to_sample(self):
        self.engine.transport = lambda *args: {"data": []}
        job = self.run_job()
        self.assertEqual(job['status'], 'failed')
        self.assertEqual(job['images'], [])
        self.assertEqual(list(self.engine.runtime.iterdir()), [])

    def test_validation_prevents_charge(self):
        for values in ({'count':0}, {'count':11}, {'width':True}, {'style':9}, {'mode':'other'}, {'prompt':'x'*31001}, {'mode':'variation','source_id':'missing'}, {'variation':101}):
            with self.assertRaises(AppError):
                self.engine.submit(self.payload(**values), run_async=False)
        self.engine.key = ''
        with self.assertRaises(AppError) as result:
            self.engine.submit(self.payload(), run_async=False)
        self.assertEqual(result.exception.status, 428)
        self.assertEqual(self.calls, [])

    def test_connect_does_not_generate_or_return_key(self):
        self.engine.configure('sk-local-test-key-not-a-secret')
        self.assertTrue(self.engine.status()['configured'])
        self.assertNotIn('key', self.engine.status())
        self.assertEqual(len(self.calls), 1)
        self.assertTrue(self.calls[0][0].startswith('/models/'))


if __name__ == '__main__':
    unittest.main()
