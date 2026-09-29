import type * as alphaTab from '@coderline/alphatab'
import type { PlaybackRange, Position } from '../hooks/useAlphaTab'

export type TrainerSettings = {
  enabled: boolean
  step: number // en %
  target: number // en %
}

type Props = {
  api: alphaTab.AlphaTabApi
  isPlayerReady: boolean
  soundFontProgress: number
  isPlaying: boolean
  position: Position
  range: PlaybackRange | null
  onSeek: (ms: number) => void
  onClearRange: () => void
  speed: number
  onSpeedChange: (speed: number) => void
  isLooping: boolean
  onLoopingChange: (value: boolean) => void
  metronome: boolean
  onMetronomeChange: (value: boolean) => void
  countIn: boolean
  onCountInChange: (value: boolean) => void
  trainer: TrainerSettings
  onTrainerChange: (value: TrainerSettings) => void
}

const SPEED_PRESETS = [50, 75, 90, 100]

function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PlayerBar(props: Props) {
  const { api, isPlayerReady, isPlaying, position, range, speed, trainer } = props
  const disabled = !isPlayerReady

  return (
    <footer className="player">
      <div className="row">
        <button
          className="primary play"
          disabled={disabled}
          onClick={() => api.playPause()}
          title="Reproducir / pausar (Espacio)"
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button disabled={disabled} onClick={() => api.stop()} title="Detener">
          ■
        </button>

        <span className="time">{formatTime(position.currentTime)}</span>
        <input
          className="progress"
          type="range"
          min={0}
          max={position.endTime || 1}
          value={position.currentTime}
          disabled={disabled}
          onChange={(e) => props.onSeek(Number(e.target.value))}
        />
        <span className="time">{formatTime(position.endTime)}</span>

        {!isPlayerReady && (
          <span className="muted">
            Cargando sonidos… {Math.round(props.soundFontProgress * 100)}%
          </span>
        )}
      </div>

      <div className="row controls">
        <div className="group">
          <label htmlFor="speed">Velocidad</label>
          <input
            id="speed"
            type="range"
            min={25}
            max={150}
            step={5}
            value={Math.round(speed * 100)}
            onChange={(e) => props.onSpeedChange(Number(e.target.value) / 100)}
          />
          <strong className="speed-value">{Math.round(speed * 100)}%</strong>
          {position.modifiedTempo > 0 && (
            <span className="muted">{Math.round(position.modifiedTempo)} BPM</span>
          )}
          {SPEED_PRESETS.map((p) => (
            <button
              key={p}
              className={`chip ${Math.round(speed * 100) === p ? 'on' : ''}`}
              onClick={() => props.onSpeedChange(p / 100)}
            >
              {p}%
            </button>
          ))}
        </div>

        <div className="group">
          <button
            className={`toggle ${props.isLooping ? 'on' : ''}`}
            onClick={() => props.onLoopingChange(!props.isLooping)}
            title="Repetir (L). Arrastra sobre la tablatura para elegir la sección."
          >
            ⟳ Loop
          </button>
          {range ? (
            <button className="link" onClick={props.onClearRange}>
              Quitar selección
            </button>
          ) : (
            <span className="muted hint">Arrastra sobre la tab para elegir una sección</span>
          )}
        </div>

        <div className="group">
          <button
            className={`toggle ${props.metronome ? 'on' : ''}`}
            onClick={() => props.onMetronomeChange(!props.metronome)}
            title="Metrónomo (M)"
          >
            Metrónomo
          </button>
          <button
            className={`toggle ${props.countIn ? 'on' : ''}`}
            onClick={() => props.onCountInChange(!props.countIn)}
            title="Cuenta de entrada antes de empezar"
          >
            Cuenta
          </button>
        </div>

        <div className="group trainer">
          <button
            className={`toggle ${trainer.enabled ? 'on' : ''}`}
            onClick={() => {
              const enabled = !trainer.enabled
              props.onTrainerChange({ ...trainer, enabled })
              // El entrenador solo tiene sentido repitiendo la sección.
              if (enabled) props.onLoopingChange(true)
            }}
            title="Sube la velocidad en cada repetición del loop"
          >
            Entrenador
          </button>
          <label>
            +
            <input
              type="number"
              min={1}
              max={25}
              value={trainer.step}
              onChange={(e) =>
                props.onTrainerChange({ ...trainer, step: Number(e.target.value) })
              }
            />
            % hasta
            <input
              type="number"
              min={25}
              max={150}
              step={5}
              value={trainer.target}
              onChange={(e) =>
                props.onTrainerChange({ ...trainer, target: Number(e.target.value) })
              }
            />
            %
          </label>
        </div>
      </div>
    </footer>
  )
}
