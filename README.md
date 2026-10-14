# Mesa Visual

Dashboard de producción visual para redacciones y diseñadores gráficos. Convierte una noticia en una dirección de arte editable y genera nuevas ilustraciones con cada lanzamiento.

## Funciones

- Titular obligatorio y contexto editorial de texto libre.
- Cuatro estilos seleccionables: surrealismo pictórico, poesía visual, minimalismo conceptual e infografía de pictogramas.
- Referencias visuales incorporadas a la generación y consultables desde el dashboard.
- Prompt editable que se actualiza con el titular y contexto actuales. Si se modifica a mano y después cambia la noticia, la aplicación avisa antes de enviarlo.
- Una petición nueva por lanzamiento, con entre 1 y 10 resultados.
- Variaciones a partir del resultado seleccionado y nuevas opciones desde su prompt.
- Descarga en PNG y ampliación 2× mediante interpolación.

## Puesta en marcha

Necesitas Python 3.10 o posterior. Desde la carpeta del proyecto:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python server.py
```

En Windows, activa el entorno con `.venv\Scripts\activate`.

Abre **http://127.0.0.1:8765** y pulsa **Conectar OpenAI**. Introduce tu clave en ese panel local. La generación necesita acceso a GPT Image 2 y saldo en la API de OpenAI, independiente de una suscripción a ChatGPT.

La clave se conserva en memoria mientras se ejecuta el servidor. También se puede proporcionar mediante la variable de entorno `OPENAI_API_KEY`. No se carga un archivo `.env` automáticamente.

Para usar otro puerto:

```sh
python server.py --port 8766
```

### Entrada opcional con Streamlit

```sh
streamlit run app.py --server.address 127.0.0.1
```

El dashboard se integra en Streamlit y arranca su servidor local de imágenes automáticamente. La interfaz y el servidor deben ejecutarse en el mismo ordenador que el navegador.

## Uso

1. Escribe el titular y, si lo necesitas, el contexto de la noticia.
2. Selecciona un estilo y un formato.
3. Genera y ajusta el prompt, o pulsa directamente **Lanzar Prompt** para prepararlo automáticamente.
4. Espera la generación y selecciona una propuesta en la galería.
5. Usa **Versionar**, **Generar Más Opciones**, **Hacer Upscale** o **Descargar Imagen**.

Los ejemplos iniciales del lienzo ilustran el lenguaje de cada estilo. Solo las imágenes devueltas por el generador se incorporan a la galería. Los errores se muestran sin sustituir el resultado por una muestra y sin reintentar automáticamente una petición de pago.

## Formatos y límites

| Formato | Descarga |
| --- | --- |
| Web horizontal | 1920 × 1080 px |
| Cuadrado | 1080 × 1080 px |
| Story vertical | 1080 × 1920 px |
| Miniatura de enlace | 1200 × 630 px |
| Prensa tradicional | 800 × 600 px |

El servidor solicita una resolución compatible con el modelo y ajusta la imagen al tamaño de descarga. La miniatura de enlace puede tener un recorte mínimo centrado. El upscale duplica las dimensiones por interpolación; no genera detalle adicional con IA.

El campo de contexto admite texto sin límite en la interfaz. El prompt enviado tiene un límite de 31.000 caracteres para reservar espacio a las instrucciones de referencia. Si lo supera, la aplicación pide resumirlo y no lo recorta automáticamente.

## Datos y credenciales

- Cada generación envía el prompt y sus referencias pertinentes a la API de OpenAI.
- La clave no se incorpora a la interfaz guardada ni al almacenamiento del navegador.
- Los resultados se guardan en `runtime/`, excluido del repositorio.
- La galería y los trabajos se mantienen en memoria del servidor; recargar la página los recupera mientras siga abierto. Tras reiniciarlo, los PNG siguen en `runtime/`.
- Las ampliaciones locales se conservan hasta recargar la página; descárgalas para guardarlas.
- `.gitignore` excluye claves locales, archivos `.env`, secretos de Streamlit y carpetas de trabajo.

## Repositorio y alojamiento web

Este repositorio contiene el código de una aplicación **local**. Subirlo a GitHub permite guardar versiones y compartir el proyecto.

La generación necesita el servidor Python. [GitHub Pages sirve contenido estático](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), por lo que no ejecuta este servidor. La entrada actual de Streamlit también utiliza un servidor local: no basta con desplegar `app.py` tal cual en un alojamiento remoto.

Un despliegue público requiere adaptar la aplicación para un servidor remoto, autenticar a los usuarios y separar sus claves, trabajos y archivos. El proyecto mantiene su configuración local y no publica un generador compartido.

## Desarrollo y pruebas

Las pruebas usan respuestas simuladas, no necesitan claves y no consumen saldo de imágenes:

```sh
python -m unittest discover -p test_server.py -v
node --test test_frontend.cjs
node --check dist/app.js
```

Node.js 22 o posterior se utiliza únicamente para las pruebas de la interfaz. No hace falta Node para ejecutar el dashboard. El flujo de GitHub Actions ejecuta estas comprobaciones en los cambios enviados al repositorio.

Se comprueban nuevos lanzamientos, renovación del titular, referencias por estilo, variaciones, errores, validación, tamaños de exportación e idempotencia de solicitudes duplicadas. La generación con OpenAI debe validarse con una clave del usuario; las pruebas simuladas no sustituyen esa comprobación.

## Estructura

```text
app.py                  Entrada opcional de Streamlit
server.py               Servidor local y API de imágenes
requirements.txt        Dependencias de Python
dist/                   Interfaz HTML, CSS y JavaScript
  assets.js             Rutas a los recursos visuales
  assets/references/    Referencias de dirección de arte
  assets/samples/       Ejemplos de estilo
test_server.py          Pruebas del servidor
test_frontend.cjs       Pruebas de la lógica de interfaz
.github/workflows/      Comprobaciones automáticas
```

## Referencias visuales

Los siete archivos de `dist/assets/references/` fueron aportados como referencias de dirección de arte. Pertenecen a sus respectivos autores; su inclusión no implica una cesión de derechos ni una licencia de reutilización. Los ejemplos de `dist/assets/samples/` se crearon con IA para mostrar los estilos.

Documentación de la integración: [API de edición y generación con imágenes de referencia](https://developers.openai.com/api/reference/resources/images/methods/edit).
