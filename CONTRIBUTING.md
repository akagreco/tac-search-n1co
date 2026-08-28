# Contribuir a TAC Search

## Preparación

1. Instalá Node.js 22.19 o posterior.
2. Ejecutá `npm ci`.
3. Copiá `.env.example` como `.env.local`.
4. Ejecutá `npm run dev`.

La aplicación puede funcionar sin claves mediante Openverse, Wikimedia Commons y el modo de demostración.

## Antes de enviar cambios

```bash
npm run check
npm run build
```

No incluyas `.env.local`, claves de API, `node_modules`, `.next`, bases locales ni registros. Usá APIs oficiales, preservá la atribución y la licencia de cada imagen, y no agregues scraping ni mecanismos para evadir protecciones.

## Alcance de los cambios

Mantené cada propuesta enfocada en un problema. Si cambia la interfaz, comprobá al menos una pantalla grande y una pantalla móvil. Si cambia el ranking o un proveedor, agregá o actualizá sus pruebas.
