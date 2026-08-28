# TAC Search

**TAC Search — Encontrá la mejor foto para poner al aire.**

TAC Search es una aplicación web especializada en producción audiovisual y programas de fútbol. Busca fotografías en varias fuentes, las puntúa según su utilidad durante una transmisión y presenta primero las imágenes profesionales, limpias, relevantes y con buena resolución.

No es un editor de imágenes: su objetivo es ayudar al operador a encontrar y comprobar la foto correcta en pocos segundos.

## Funciones incluidas

- Búsqueda progresiva y concurrente: cada proveedor aparece apenas responde.
- Google Images mediante SerpApi y Brave Image Search para cobertura web amplia.
- Wikimedia Commons y Openverse sin claves privadas.
- Integraciones con Flickr, Pexels, Unsplash y Pixabay.
- Modo demostración automático si las fuentes de Internet no responden.
- `broadcastScore`, `qualityScore`, `broadcastCleanScore` y `watermarkScore` de 0 a 100.
- Ranking “Mejor para el programa”, filtros y bonus para composición 16:9.
- Deduplicación por URL canónica y dHash perceptual opcional.
- Vista previa en canvas simulado 1920×1080.
- Guardadas, historial reciente y colecciones en almacenamiento local.
- Caché inmediata en memoria y Redis opcional.
- Atajos: `/` enfoca el buscador; `Esc` cierra; `←` y `→` navegan; `F` guarda.
- Dark mode minimalista en grises neutros, con un único acento verde y el logo oficial intacto.
- Manifest PWA y arquitectura preparada para una integración futura con OBS WebSocket.

## Requisitos

- Node.js 22.19 o posterior.
- npm 10 o posterior.

## Instalación local

```bash
cd tac-search
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). La aplicación funciona sin configurar claves. Si no hay conexión o las fuentes públicas fallan, `MOCK_MODE=auto` activa resultados de demostración.

## Variables de entorno

Copiá `.env.example` como `.env.local`. Nunca guardes claves reales en el repositorio.

| Variable | Uso |
| --- | --- |
| `MOCK_MODE` | `auto`, `true`/`only` o `false`. |
| `SERPAPI_API_KEY` | Activa Google Images mediante SerpApi; es la fuente principal de cobertura web. |
| `BRAVE_SEARCH_API_KEY` | Activa el índice independiente de Brave Image Search. |
| `FLICKR_API_KEY` | Activa la búsqueda de fotos públicas en Flickr. |
| `PEXELS_API_KEY` | Activa el proveedor oficial de Pexels. |
| `UNSPLASH_ACCESS_KEY` | Activa el proveedor oficial de Unsplash. |
| `PIXABAY_API_KEY` | Activa el proveedor oficial de Pixabay. |
| `SEARCH_COUNTRY` | País de la búsqueda web; por defecto `AR`. |
| `SEARCH_LANGUAGE` | Idioma preferido; por defecto `es`. |
| `WEB_RESULTS_PER_PROVIDER` | Cantidad solicitada a Brave, entre 10 y 200. |
| `DISABLED_PROVIDERS` | IDs separados por coma para desactivar fuentes sin borrar claves. |
| `USE_SYSTEM_CA` | Usa certificados confiables del sistema en Node moderno; útil en redes con proxy autorizado. |
| `DATABASE_URL` | SQLite durante desarrollo; PostgreSQL en producción. |
| `REDIS_URL` | Caché compartida opcional. |
| `SEARCH_CACHE_TTL_SECONDS` | Vida de los resultados cacheados. |
| `RATE_LIMIT_PER_MINUTE` | Límite por IP y minuto. |
| `ENABLE_REMOTE_IMAGE_ANALYSIS` | Activa dHash de thumbnails de hosts permitidos. |
| `RANK_*_WEIGHT` | Ajusta las ocho ponderaciones del broadcast score. |

## Proveedores de búsqueda

TAC Search admite ocho fuentes reales. No hace scraping directo: cada conector usa una API pública o autorizada y conserva el vínculo a la página de origen.

| Fuente | Cobertura | Variable / alta |
| --- | --- | --- |
| Google Images vía SerpApi | Web general; recomendada para nombres, eventos y actualidad | `SERPAPI_API_KEY` en [SerpApi](https://serpapi.com/users/sign_up) |
| Brave Image Search | Índice web independiente y hasta 200 candidatos | `BRAVE_SEARCH_API_KEY` en [Brave Search API](https://api.search.brave.com/) |
| Openverse | Contenido abierto y Creative Commons | Sin clave |
| Wikimedia Commons | Archivo enciclopédico con metadatos de licencia | Sin clave |
| Flickr | Fotos públicas y archivo comunitario | `FLICKR_API_KEY` en [Flickr App Garden](https://www.flickr.com/services/apps/create/) |
| Pexels | Banco fotográfico | `PEXELS_API_KEY` en [Pexels API](https://www.pexels.com/api/) |
| Unsplash | Banco fotográfico | `UNSPLASH_ACCESS_KEY` en [Unsplash Developers](https://unsplash.com/developers) |
| Pixabay | Banco fotográfico con caché obligatoria de 24 horas | `PIXABAY_API_KEY` en [Pixabay API](https://pixabay.com/api/docs/) |

Las claves son personales y deben obtenerse en cada servicio. Nunca se incluyen claves reales dentro del proyecto. Para una búsqueda fuerte conviene activar SerpApi o Brave; las otras fuentes amplían variedad y licencias, pero por sí solas no equivalen a buscar en toda la web.

Todos implementan la interfaz `SearchProvider` de `lib/providers/provider.ts`:

```ts
interface SearchProvider {
  id: ProviderId;
  coverage: "web" | "archive" | "stock" | "demo";
  isConfigured(): boolean;
  search(query: string, options: ProviderSearchOptions): Promise<RawImageResult[]>;
}
```

Para agregar una fuente:

1. Creá un archivo en `lib/providers` que implemente la interfaz.
2. Usá una API oficial y preservá fuente, autor, licencia y URL original.
3. Normalizá la respuesta a `RawImageResult`.
4. Registrala en `lib/providers/registry.ts`.
5. Agregá pruebas para errores, URL y metadatos incompletos.

Un error o timeout de una fuente no cancela a las demás.

## Ranking

`lib/ranking/score-image.ts` calcula las métricas y `config/ranking.ts` centraliza los pesos. Los valores predeterminados priorizan primero que la imagen sea exactamente la solicitada:

- coincidencia con la búsqueda: 24 %;
- calidad y resolución: 18 %;
- jugador claramente visible: 14 %;
- aspecto profesional: 12 %;
- composición: 10 %;
- limpieza visual: 8 %;
- ausencia probable de watermark: 7 %;
- actualidad: 7 %.

Las señales disponibles en la primera versión provienen de resolución, tamaño, relación de aspecto, fuente, fecha, título, etiquetas y metadatos. El análisis remoto opcional genera dHash sobre una lista cerrada de hosts. La UI habla siempre de estimaciones: TAC Search no elimina watermarks ni afirma que una imagen sea libre de derechos.

## Base de datos

La experiencia local guarda favoritos, colecciones e historial en el navegador para funcionar sin servidor adicional. `prisma/schema.prisma` deja preparado SQLite y `prisma/schema.postgres.prisma` replica el modelo para producción.

Prisma es una integración opcional y se instala bajo demanda al ejecutar los comandos de base de datos; no aumenta el peso ni el tiempo de arranque del buscador local.

```bash
npm run db:generate
npm run db:migrate
```

La interfaz `UserLibraryRepository` permite conectar autenticación y persistencia multiusuario sin acoplar los componentes.

## Caché

Sin configuración se usa memoria del proceso. Con `REDIS_URL`, las búsquedas se guardan en Redis. Si se repite una consulta, la API envía primero el resultado cacheado y revalida las fuentes durante la misma respuesta progresiva. Las solicitudes a Pixabay usan además una caché de 24 horas para respetar sus requisitos de API.

## Seguridad

- Validación estricta con Zod y límite de longitud.
- Rate limiting por IP.
- Claves solo en variables del servidor.
- Validación de protocolo y rechazo de destinos locales.
- El análisis remoto acepta únicamente HTTPS, hosts permitidos, DNS público, imágenes válidas y un tamaño máximo.
- Sin scraping ni evasión de protecciones.
- Cada fotografía conserva origen y licencia cuando están disponibles.

## Pruebas y verificación

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Las pruebas cubren ranking, filtros, validación, URL, dHash y deduplicación.

## Estructura principal

```text
app/                  páginas y API Routes de Next.js
components/           buscador, galería, detalle, colecciones y UI
config/               tokens y pesos de ranking
lib/providers/        conectores de búsqueda
lib/ranking/          scoring y ordenamiento
lib/image-analysis/   dHash y análisis remoto protegido
lib/deduplication/    agrupación de versiones
lib/cache/            memoria y Redis
lib/security/         validación, SSRF y rate limit
prisma/               modelos SQLite y PostgreSQL
tests/                pruebas unitarias
```

## Subir a GitHub

El repositorio está preparado para GitHub: excluye claves privadas, dependencias, compilaciones y archivos locales. Incluye además una validación automática que ejecuta pruebas, TypeScript, ESLint y el build en cada cambio.

La guía completa, tanto con GitHub Desktop como con la terminal, está en [DEPLOYMENT.md](./DEPLOYMENT.md).

## Despliegue

### Vercel

Importá el repositorio de GitHub, configurá las variables indicadas en `.env.example` y desplegá. Vercel entrega una dirección pública con HTTPS; también permite conectar un dominio propio. Redis debe ser un servicio externo compatible si se activa.

Consultá [DEPLOYMENT.md](./DEPLOYMENT.md) para seguir el procedimiento paso a paso sin exponer las claves.

### Docker / VPS

```bash
docker compose up --build
```

El `Dockerfile` produce la salida standalone de Next.js. En producción reemplazá las contraseñas del ejemplo y configurá las claves mediante secretos del proveedor.

## Próximos pasos previstos

- autenticación y repositorio PostgreSQL multiusuario;
- OCR o clasificador visual dedicado como microservicio;
- más APIs periodísticas con licencias adecuadas;
- telemetría de calidad y feedback del operador;
- control de OBS mediante WebSocket sin mezclar esa lógica con el buscador.
