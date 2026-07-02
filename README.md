# Libros

Libros HTML con estilo limpio tipo lector, publicados en GitHub Pages.

## Portal

https://parasolente.github.io/libros/

## Añadir un libro nuevo

```bash
./bin/deploy-book.sh "ruta/al/libro.html"
git add -A
git commit -m "deploy: slug-del-libro"
git push
```

El script `deploy-book.sh` hace todo: convierte imágenes a WebP (strip EXIF, quality 85), renombra a secuencial (`001.webp`…), copia el HTML actualizando rutas, y registra el enlace en el portal.

## Estructura del repo

```
libros/
├── README.md
├── index.html              ← portal
├── book-reader.css         ← estilo global tipo lector
├── book-reader.js          ← controles (temas sepia/blanco/oscuro, tamaño fuente)
│
└── <slug>/
    ├── index.html          ← libro
    └── imagenes/
        001.webp … N.webp   ← imágenes sin metadatos
```

## Convenciones

- **Slug**: minúsculas, guiones, max 60 caracteres. Ej: `where-wizards-stay-up-late`
- **Imágenes**: WebP, secuenciales, sin EXIF, quality 85
- **Commit message**: `deploy: <slug> — <descripción>`
