import { useEffect, useRef, useState } from 'react'
import { PlayerBar, type TrainerSettings } from './components/PlayerBar'
import { TrackList } from './components/TrackList'
import { useAlphaTab } from './hooks/useAlphaTab'
import { demoTex } from './lib/demoTex'
import './App.css'

const ACCEPTED_FILES = '.gp,.gp3,.gp4,.gp5,.gpx,.xml,.musicxml,.mxl,.cap'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [speed, setSpeed] = useState(1)
  const [isLooping, setIsLooping] = useState(false)
  const [metronome, setMetronome] = useState(false)
  const [countIn, setCountIn] = useState(false)
  const [trainer, setTrainer] = useState<TrainerSettings>({
    enabled: false,
    step: 5,
    target: 100,
  })
  const [isDragging, setIsDragging] = useState(false)

  const at = useAlphaTab(containerRef, viewportRef, {
    speed,
    isLooping,
    metronome,
    countIn,
  })
  const { api, score } = at

  // Carga el ejercicio de demo al arrancar.
  useEffect(() => {
    api?.tex(demoTex)
  }, [api])

  // Entrenador de velocidad: sube la velocidad al terminar cada repetición.
  useEffect(() => {
    if (!api || !trainer.enabled) return
    return api.playerFinished.on(() => {
      setSpeed((s) => Math.min(trainer.target / 100, s + trainer.step / 100))
    })
  }, [api, trainer])

  // Atajos de teclado.
  useEffect(() => {
    if (!api) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select')) return
      switch (e.key) {
        case ' ':
          e.preventDefault()
          api.playPause()
          break
        case 'l':
        case 'L':
          setIsLooping((v) => !v)
          break
        case 'm':
        case 'M':
          setMetronome((v) => !v)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSpeed((s) => Math.min(1.5, Math.round((s + 0.05) * 100) / 100))
          break
        case 'ArrowDown':
          e.preventDefault()
          setSpeed((s) => Math.max(0.25, Math.round((s - 0.05) * 100) / 100))
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [api])

  const loadFile = async (file: File) => {
    at.loadFile(new Uint8Array(await file.arrayBuffer()))
  }

  return (
    <div
      className="app"
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setIsDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) void loadFile(file)
      }}
    >
      <header className="topbar">
        <div className="brand">🎸 Guitar Practicer</div>
        <div className="song">
          {score && (
            <>
              <strong>{score.title || 'Sin título'}</strong>
              {score.artist && <span className="muted"> — {score.artist}</span>}
            </>
          )}
        </div>
        <button className="primary" onClick={() => fileInputRef.current?.click()}>
          Abrir archivo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILES}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void loadFile(file)
            e.target.value = ''
          }}
        />
      </header>

      <div className="main">
        {api && score && (
          <TrackList
            api={api}
            score={score}
            renderedTrack={at.renderedTrack}
            onShowTrack={at.showTrack}
          />
        )}
        <div className="viewport" ref={viewportRef}>
          {at.error && <div className="banner error">No se pudo cargar: {at.error}</div>}
          {at.isLoading && <div className="banner">Cargando…</div>}
          <div className="sheet" ref={containerRef} />
        </div>
      </div>

      {api && (
        <PlayerBar
          api={api}
          isPlayerReady={at.isPlayerReady}
          soundFontProgress={at.soundFontProgress}
          isPlaying={at.isPlaying}
          position={at.position}
          range={at.range}
          onSeek={at.seek}
          onClearRange={at.clearRange}
          speed={speed}
          onSpeedChange={setSpeed}
          isLooping={isLooping}
          onLoopingChange={setIsLooping}
          metronome={metronome}
          onMetronomeChange={setMetronome}
          countIn={countIn}
          onCountInChange={setCountIn}
          trainer={trainer}
          onTrainerChange={setTrainer}
        />
      )}

      {isDragging && (
        <div className="dropzone">Suelta aquí tu archivo Guitar Pro o MusicXML</div>
      )}
    </div>
  )
}
