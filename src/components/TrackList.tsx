import type * as alphaTab from '@coderline/alphatab'
import { useState } from 'react'

type Props = {
  api: alphaTab.AlphaTabApi
  score: alphaTab.model.Score
  renderedTrack: alphaTab.model.Track | null
  onShowTrack: (track: alphaTab.model.Track) => void
}

type MixState = {
  score: alphaTab.model.Score | null
  muted: Set<number>
  soloed: Set<number>
}

const emptyMix: MixState = { score: null, muted: new Set(), soloed: new Set() }

export function TrackList({ api, score, renderedTrack, onShowTrack }: Props) {
  // changeTrackMute/Solo solo afectan al sintetizador, no al modelo, así que guardamos
  // el estado aquí. Se descarta automáticamente al cargar otra canción.
  const [stored, setMix] = useState<MixState>(emptyMix)
  const mix = stored.score === score ? stored : { ...emptyMix, score }

  const toggle = (track: alphaTab.model.Track, kind: 'muted' | 'soloed') => {
    const next = new Set(mix[kind])
    const enabled = !next.has(track.index)
    if (enabled) next.add(track.index)
    else next.delete(track.index)

    if (kind === 'muted') api.changeTrackMute([track], enabled)
    else api.changeTrackSolo([track], enabled)
    setMix({ ...mix, [kind]: next })
  }

  return (
    <aside className="tracks">
      <h2>Pistas</h2>
      <ul>
        {score.tracks.map((track) => (
          <li
            key={track.index}
            className={track === renderedTrack ? 'active' : undefined}
          >
            <button
              className="track-name"
              title="Mostrar esta pista"
              onClick={() => onShowTrack(track)}
            >
              {track.name || `Pista ${track.index + 1}`}
            </button>
            <button
              className={`chip ${mix.soloed.has(track.index) ? 'on' : ''}`}
              title="Solo"
              onClick={() => toggle(track, 'soloed')}
            >
              S
            </button>
            <button
              className={`chip ${mix.muted.has(track.index) ? 'on mute' : ''}`}
              title="Silenciar"
              onClick={() => toggle(track, 'muted')}
            >
              M
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
