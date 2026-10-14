"""Mesa Visual: local image-generation backend. Run: python server.py.

OPENAI_API_KEY may be supplied in the environment or through the local UI.
Keys are held in memory only. No automatic retries of billable requests.
"""
import argparse
import base64
import io
import json
import os
from pathlib import Path
import re
import secrets
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from PIL import Image, ImageOps

MODEL = "gpt-image-2"
API = "https://api.openai.com/v1"
SIZES = {(1920, 1080): "1536x864", (1080, 1080): "1024x1024",
         (1080, 1920): "864x1536", (1200, 630): "1536x800", (800, 600): "1152x864"}
REFERENCES = ((1,), (2, 3, 4), (5, 6), (7,))


class AppError(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def upstream(path, key, body=None, content_type=None):
    headers = {"Authorization": "Bearer " + key}
    if content_type:
        headers["Content-Type"] = content_type
    request = urllib.request.Request(API + path, data=body, headers=headers)
    try:
        with urllib.request.build_opener(NoRedirect).open(request, timeout=300) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        messages = {
            400: "OpenAI no ha aceptado la solicitud. Revisa el prompt y los permisos del modelo.",
            401: "La clave no es válida. Revisa la conexión de OpenAI.",
            403: "Esta cuenta no tiene acceso al modelo de imágenes. Revisa los permisos del proyecto.",
            429: "OpenAI indica un límite de uso o saldo insuficiente. Revisa el saldo y vuelve a intentarlo.",
        }
        raise AppError(messages.get(error.code, "El generador no ha podido completar la petición. Inténtalo más tarde."), 502) from None
    except (urllib.error.URLError, TimeoutError):
        raise AppError("Se perdió la conexión con el generador. No se ha reintentado para evitar cargos duplicados; comprueba el uso antes de relanzar.", 502) from None


def multipart(fields, files):
    boundary = "mesa_" + secrets.token_hex(16)
    parts = []
    for name, value in fields.items():
        parts.append((f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n').encode())
    for filename, data in files:
        parts.append((f'--{boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="{filename}"\r\nContent-Type: image/png\r\n\r\n').encode() + data + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    return b"".join(parts), "multipart/form-data; boundary=" + boundary


class Engine:
    def __init__(self, root, transport=upstream):
        self.root = Path(root)
        self.dist = self.root / "dist"
        self.runtime = self.root / "runtime"
        self.runtime.mkdir(exist_ok=True)
        self.key = os.environ.get("OPENAI_API_KEY", "").strip()
        self.csrf = secrets.token_urlsafe(32)
        self.transport = transport
        self.jobs = {}
        self.requests = {}
        self.images = {}
        self.lock = threading.RLock()

    def configure(self, key):
        if not isinstance(key, str) or not key.startswith("sk-") or not 20 <= len(key) <= 512:
            raise AppError("Introduce una clave API válida de OpenAI.")
        # Read-only check: this does not generate images or spend image credits.
        self.transport("/models/" + MODEL, key)
        with self.lock:
            self.key = key

    def status(self):
        return {"service": "mesa-visual", "configured": bool(self.key), "model": MODEL, "csrf": self.csrf}

    def validate(self, data):
        if not self.key:
            raise AppError("Conecta tu clave de OpenAI para generar imágenes nuevas.", 428)
        if not isinstance(data, dict):
            raise AppError("Solicitud no válida.")
        prompt, headline = data.get("prompt"), data.get("headline")
        if not isinstance(prompt, str) or not prompt.strip():
            raise AppError("Escribe o genera un prompt.")
        if not isinstance(headline, str) or not headline.strip():
            raise AppError("El titular es obligatorio.")
        if len(prompt) > 31000:
            raise AppError("El campo de contexto admite texto largo, pero esta API limita el prompt. Reduce el prompt a 31.000 caracteres; no se ha enviado ni recortado.")
        style, count = data.get("style"), data.get("count", 1)
        if type(style) is not int or style not in range(4):
            raise AppError("Selecciona uno de los cuatro estilos.")
        if type(count) is not int or not 1 <= count <= 10:
            raise AppError("El número de versiones debe estar entre 1 y 10.")
        dims = (data.get("width"), data.get("height"))
        if any(type(x) is not int for x in dims) or dims not in SIZES:
            raise AppError("Formato no válido.")
        mode = data.get("mode", "launch")
        if mode not in ("launch", "more", "variation"):
            raise AppError("Acción no válida.")
        variation = data.get("variation", 35)
        if type(variation) is not int or not 0 <= variation <= 100:
            raise AppError("Variación no válida.")
        if mode == "variation" and data.get("source_id") not in self.images:
            raise AppError("La imagen seleccionada ya no está disponible. Genera una nueva.")
        request_id = data.get("request_id", "")
        if not isinstance(request_id, str) or not re.fullmatch(r"[a-zA-Z0-9_-]{16,80}", request_id):
            raise AppError("Identificador de solicitud no válido.")
        return {"prompt": prompt, "headline": headline, "style": style, "count": count,
                "width": dims[0], "height": dims[1], "mode": mode, "variation": variation,
                "source_id": data.get("source_id"), "request_id": request_id}

    def submit(self, payload, run_async=True):
        with self.lock:
            data = self.validate(payload)
            if data["request_id"] in self.requests:
                return self.requests[data["request_id"]]
            if any(j["status"] == "running" for j in self.jobs.values()):
                raise AppError("Hay una generación en curso. Espera a que termine.", 409)
            job_id = uuid.uuid4().hex
            self.requests[data["request_id"]] = job_id
            self.jobs[job_id] = {"id": job_id, "status": "running", "count": data["count"], "completed": 0, "images": [], "error": None}
            key = self.key
        if run_async:
            threading.Thread(target=self.run_job, args=(job_id, data, key), daemon=True).start()
        else:
            self.run_job(job_id, data, key)
        return job_id

    def run_job(self, job_id, data, key):
        try:
            for index in range(data["count"]):
                image = self.generate_one(data, key, index)
                with self.lock:
                    self.images[image["id"]] = image
                    self.jobs[job_id]["images"].append(image)
                    self.jobs[job_id]["completed"] += 1
            with self.lock:
                self.jobs[job_id]["status"] = "completed"
        except Exception as error:
            message = str(error) if isinstance(error, AppError) else "La respuesta del generador no se pudo procesar. No se ha sustituido por una muestra."
            with self.lock:
                self.jobs[job_id].update(status="failed", error=message)

    def generate_one(self, data, key, index):
        prompt = data["prompt"]
        if data["mode"] == "variation":
            source = self.images[data["source_id"]]
            files = [("resultado-seleccionado.png", (self.runtime / (source["id"] + ".png")).read_bytes())]
            amount = data["variation"]
            direction = "Preserva casi toda la composición y realiza ajustes muy sutiles" if amount <= 30 else "Conserva el concepto y cambia composición y detalles" if amount <= 70 else "Explora una reinterpretación creativa manteniendo el tema y lenguaje visual"
            prompt += f"\n\nLa imagen adjunta es el resultado a versionar. Intensidad de variación: {amount}/100. {direction}. Produce una imagen nueva."
        else:
            files = [(f"referencia-{n}.png", (self.dist / "assets/references" / f"referencia-{n}.png").read_bytes()) for n in REFERENCES[data["style"]]]
            prompt += "\n\nLas imágenes adjuntas son SOLO referencias de lenguaje visual. Crea desde cero una ilustración para el titular actual; no copies su escena ni reutilices su tema."
        prompt += f"\nPropuesta independiente {index + 1}. Desarrolla una solución editorial original, no una simple recoloración o recorte."
        fields = {"model": MODEL, "prompt": prompt, "size": SIZES[(data["width"], data["height"])], "quality": "medium", "n": "1", "output_format": "png"}
        body, content_type = multipart(fields, files)
        response = self.transport("/images/edits", key, body, content_type)
        try:
            raw = base64.b64decode(response["data"][0]["b64_json"], validate=True)
            original = Image.open(io.BytesIO(raw))
            original.load()
            # Request a model-supported resolution, then export the exact chosen format.
            image = ImageOps.fit(original.convert("RGB"), (data["width"], data["height"]), method=Image.Resampling.LANCZOS)
        except (KeyError, IndexError, ValueError, OSError) as error:
            raise AppError("El generador no devolvió una imagen válida.", 502) from error
        image_id = uuid.uuid4().hex
        image.save(self.runtime / (image_id + ".png"), "PNG")
        return {"id": image_id, "url": "/generated/" + image_id + ".png", "width": data["width"], "height": data["height"], "baseWidth": data["width"], "baseHeight": data["height"], "headline": data["headline"], "prompt": data["prompt"], "style": data["style"], "kind": "variation" if data["mode"] == "variation" else "original", "variation": data["variation"] if data["mode"] == "variation" else 0, "upscaled": False, "created_at": time.time()}


def handler_for(engine):
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(engine.dist), **kwargs)

        def log_message(self, *args):
            pass  # Do not log submitted briefs, headers or credentials.

        def end_headers(self):
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Referrer-Policy", "no-referrer")
            super().end_headers()

        def allowed_host(self):
            return self.headers.get("Host") in {f"127.0.0.1:{self.server.server_port}", f"localhost:{self.server.server_port}"}

        def json_response(self, data, status=200):
            body = json.dumps(data, ensure_ascii=False).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            if not self.allowed_host():
                return self.json_response({"error": "Host no permitido."}, 403)
            path = urllib.parse.urlsplit(self.path).path
            if path == "/api/status":
                return self.json_response(engine.status())
            if path == "/api/results":
                with engine.lock:
                    active = next((j["id"] for j in engine.jobs.values() if j["status"] == "running"), None)
                    return self.json_response({"images": list(engine.images.values())[-40:], "active_job": active})
            if path.startswith("/api/jobs/"):
                with engine.lock:
                    job = engine.jobs.get(path.rsplit("/", 1)[-1])
                    return self.json_response(job if job else {"error": "No se encuentra la generación."}, 200 if job else 404)
            if re.fullmatch(r"/generated/[a-f0-9]{32}\.png", path):
                file = engine.runtime / path.rsplit("/", 1)[-1]
                if not file.is_file():
                    return self.send_error(404)
                data = file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "image/png")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                return self.wfile.write(data)
            if path.startswith("/api/"):
                return self.json_response({"error": "Ruta no disponible."}, 404)
            return super().do_GET()

        def list_directory(self, path):
            self.send_error(404)

        def do_POST(self):
            origin = self.headers.get("Origin")
            expected = {f"http://127.0.0.1:{self.server.server_port}", f"http://localhost:{self.server.server_port}"}
            if not self.allowed_host() or (origin is not None and origin not in expected) or not secrets.compare_digest(self.headers.get("X-Mesa-Token", ""), engine.csrf):
                return self.json_response({"error": "Sesión no válida. Recarga el dashboard."}, 403)
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if not 0 < length <= 256000:
                    raise AppError("Solicitud demasiado grande.", 413)
                data = json.loads(self.rfile.read(length))
                if not isinstance(data, dict):
                    raise AppError("Solicitud no válida.")
                if self.path == "/api/connect":
                    engine.configure(data.get("key"))
                    return self.json_response({"configured": True, "model": MODEL})
                if self.path == "/api/disconnect":
                    with engine.lock:
                        if any(job["status"] == "running" for job in engine.jobs.values()):
                            raise AppError("Espera a que termine la generación antes de desconectar.", 409)
                        engine.key = ""
                    return self.json_response({"configured": False})
                if self.path == "/api/generate":
                    job_id = engine.submit(data)
                    return self.json_response({"job_id": job_id}, 202)
                raise AppError("Ruta no disponible.", 404)
            except AppError as error:
                self.json_response({"error": str(error)}, error.status)
            except (ValueError, TypeError):
                self.json_response({"error": "Solicitud no válida."}, 400)
    return Handler


def start_server(port=8765, root=None):
    engine = Engine(root or Path(__file__).parent)
    server = ThreadingHTTPServer(("127.0.0.1", port), handler_for(engine))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, engine


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mesa Visual — generador editorial local")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    server, engine = start_server(args.port)
    print(f"Mesa Visual: http://127.0.0.1:{server.server_port}", flush=True)
    print("Generación configurada." if engine.key else "Conecta OpenAI en el dashboard para generar imágenes.", flush=True)
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        server.shutdown()
        server.server_close()
