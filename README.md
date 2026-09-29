# guitar-practicer

Visor de tablaturas para practicar guitarra, al estilo Songsterr: carga un archivo
Guitar Pro o MusicXML, escúchalo con el sintetizador y baja la velocidad, repite secciones
y usa el metrónomo. Construido con React + Vite + [alphaTab](https://alphatab.net).

## Uso

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción en dist/
```

Al abrir la app se carga un ejercicio de demo. Usa **Abrir archivo** o arrastra un archivo a la
ventana. Formatos: `.gp`, `.gp3`, `.gp4`, `.gp5`, `.gpx`, MusicXML (`.xml`, `.musicxml`, `.mxl`), `.cap`.

### Controles de práctica

| Función | Cómo |
| --- | --- |
| Reproducir / pausar | botón ▶ o `Espacio` |
| Velocidad (25–150 %) | slider, botones 50/75/90/100 %, o `↑` / `↓` (±5 %) |
| Loop de una sección | arrastra sobre la tablatura para seleccionar compases y activa **Loop** (`L`) |
| Metrónomo | botón **Metrónomo** o `M` |
| Cuenta de entrada | botón **Cuenta** |
| Entrenador de velocidad | sube la velocidad en X % en cada repetición del loop hasta el objetivo |
| Pistas | clic para mostrar una pista; **S** = solo, **M** = silenciar |

## Estructura

- `src/hooks/useAlphaTab.ts`: crea la instancia de alphaTab, expone su estado y aplica los ajustes de práctica
- `src/components/PlayerBar.tsx`: barra de reproducción y controles de práctica
- `src/components/TrackList.tsx`: lista de pistas con solo/silencio
- `src/lib/demoTex.ts`: ejercicio de demo escrito en alphaTex

## Próximas fases

- Practicar sobre la grabación original (audio sincronizado con la tab y ralentizado sin cambiar el tono)
