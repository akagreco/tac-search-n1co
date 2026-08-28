# Seguridad

## Informar una vulnerabilidad

No abras un issue público ni publiques claves, tokens o datos privados.

Usá la pestaña **Security** del repositorio y elegí **Report a vulnerability** para crear un aviso privado. Incluí una descripción, los pasos para reproducir el problema y el posible impacto, evitando datos personales o credenciales reales.

## Claves de API

- Las claves reales deben guardarse en `.env.local` durante el desarrollo.
- En Vercel deben cargarse en **Settings → Environment Variables**.
- `.env.local` está excluido de Git mediante `.gitignore`.
- `.env.example` solo documenta nombres y valores seguros de ejemplo.

Si una clave se publica accidentalmente, revocala en el proveedor correspondiente antes de eliminarla del historial.
