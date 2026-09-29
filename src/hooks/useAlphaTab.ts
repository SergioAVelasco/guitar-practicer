import * as alphaTab from '@coderline/alphatab'
import { useEffect, useRef, useState, type RefObject } from 'react'

export type PlaybackRange = { startTick: number; endTick: number }

export type Position = {
  currentTime: number
  endTime: number
  currentTick: number
  endTick: number
  modifiedTempo: number
}

export type PracticeSettings = {
  speed: number
  isLooping: boolean
  metronome: boolean
  countIn: boolean
}

const emptyPosition: Position = {
  currentTime: 0,
  endTime: 0,
  currentTick: 0,
  endTick: 0,
  modifiedTempo: 0,
}

/**
 * Crea y gestiona una instancia de AlphaTabApi sobre `containerRef`.
 * `viewportRef` es el elemento con scroll que seguirá al cursor de reproducción.
 */
export function useAlphaTab(
  containerRef: RefObject<HTMLDivElement | null>,
  viewportRef: RefObject<HTMLDivElement | null>,
  settings: PracticeSettings,
) {
  const [api, setApi] = useState<alphaTab.AlphaTabApi | null>(null)
  const [score, setScore] = useState<alphaTab.model.Score | null>(null)
  const [renderedTrack, setRenderedTrack] = useState<alphaTab.model.Track | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [soundFontProgress, setSoundFontProgress] = useState(0)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState<Position>(emptyPosition)
  const [range, setRange] = useState<PlaybackRange | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastSecond = useRef(-1)
  // alphaTab se controla mutando propiedades; lo hacemos vía ref, no sobre el valor del estado.
  const apiRef = useRef<alphaTab.AlphaTabApi | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const viewport = viewportRef.current
    if (!container || !viewport) return

    const instance = new alphaTab.AlphaTabApi(container, {
      // Rutas explícitas: la autodetección falla con el pre-bundling de Vite en dev.
      core: { logLevel: alphaTab.LogLevel.Warning, fontDirectory: '/font/' },
      display: { layoutMode: alphaTab.LayoutMode.Page, scale: 1.0 },
      player: {
        playerMode: alphaTab.PlayerMode.EnabledSynthesizer,
        soundFont: '/soundfont/sonivox.sf2',
        scrollElement: viewport,
        scrollOffsetY: -40,
      },
    })

    instance.scoreLoaded.on((s) => {
      setScore(s)
      setRange(null)
      setError(null)
    })
    instance.renderStarted.on(() => setIsLoading(true))
    instance.renderFinished.on(() => {
      setIsLoading(false)
      setRenderedTrack(instance.tracks[0] ?? null)
    })
    instance.soundFontLoad.on((e) => setSoundFontProgress(e.loaded / e.total))
    instance.playerReady.on(() => setIsPlayerReady(true))
    instance.playerStateChanged.on((e) =>
      setIsPlaying(e.state === alphaTab.synth.PlayerState.Playing),
    )
    instance.playerPositionChanged.on((e) => {
      // Solo re-renderizamos React cuando cambia el segundo o hay un salto (seek).
      const second = Math.floor(e.currentTime / 1000)
      if (second === lastSecond.current && !e.isSeek) return
      lastSecond.current = second
      setPosition({
        currentTime: e.currentTime,
        endTime: e.endTime,
        currentTick: e.currentTick,
        endTick: e.endTick,
        modifiedTempo: e.modifiedTempo,
      })
    })
    instance.playbackRangeChanged.on((e) =>
      setRange(e.playbackRange ? { ...e.playbackRange } : null),
    )
    instance.error.on((e) => {
      setError(e.message)
      setIsLoading(false)
    })

    apiRef.current = instance
    setApi(instance)
    return () => {
      instance.destroy()
      apiRef.current = null
      setApi(null)
      setIsPlayerReady(false)
    }
  }, [containerRef, viewportRef])

  // Sincroniza los ajustes de práctica con alphaTab.
  const { speed, isLooping, metronome, countIn } = settings
  useEffect(() => {
    const instance = apiRef.current
    if (!instance) return
    instance.playbackSpeed = speed
    instance.isLooping = isLooping
    instance.metronomeVolume = metronome ? 1 : 0
    instance.countInVolume = countIn ? 1 : 0
  }, [api, speed, isLooping, metronome, countIn])

  const seek = (ms: number) => {
    if (apiRef.current) apiRef.current.timePosition = ms
  }
  const clearRange = () => {
    const instance = apiRef.current
    if (!instance) return
    instance.playbackRange = null
    instance.clearPlaybackRangeHighlight()
    // Workaround (alphaTab 1.8.4): la selección interna sobrevive a load()/renderTracks()
    // y al terminar el render intenta redibujarla sobre compases que ya no existen
    // ("Cannot read properties of undefined (reading 'realBounds')"). No hay API pública
    // para borrarla, así que la reiniciamos directamente.
    const internal = instance as unknown as { _selectionStart?: unknown; _selectionEnd?: unknown }
    internal._selectionStart = undefined
    internal._selectionEnd = undefined
  }
  const loadFile = (data: Uint8Array) => {
    const instance = apiRef.current
    if (!instance) return
    instance.stop()
    clearRange()
    instance.load(data)
  }
  const showTrack = (track: alphaTab.model.Track) => {
    clearRange()
    apiRef.current?.renderTracks([track])
  }

  return {
    api,
    seek,
    clearRange,
    loadFile,
    showTrack,
    score,
    renderedTrack,
    isLoading,
    soundFontProgress,
    isPlayerReady,
    isPlaying,
    position,
    range,
    error,
  }
}
