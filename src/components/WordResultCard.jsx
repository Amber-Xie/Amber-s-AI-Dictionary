import PronounceButton from './PronounceButton'

function MeaningLines({ meaning, multiline = false }) {
  const lines = multiline
    ? (meaning || '').split('\n').map((line) => line.trim()).filter(Boolean)
    : []

  if (multiline && lines.length > 0) {
    return (
      <div className="space-y-2">
        {lines.map((line, i) => (
          <p key={i} className="leading-relaxed text-[#3d3d3d]">{line}</p>
        ))}
      </div>
    )
  }

  return <p className="leading-relaxed text-[#3d3d3d]">{meaning}</p>
}

export default function WordResultCard({ word, result, compact = false }) {
  return (
    <div className={`space-y-3 ${compact ? '' : 'mt-2'}`}>
      <article className="card">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-[#3d3d3d]">{word}</h2>
            <p className="mt-1 text-sm text-[#9CA3AF]">/{word.toLowerCase()}/</p>
          </div>
          <PronounceButton word={word} />
        </div>

        <p className="section-label">中文释义</p>
        <MeaningLines meaning={result.meaning} multiline={compact} />
      </article>

      {result.insight && (
        <article className="card">
          <p className="section-label">词根 / 近义词 / 洞察</p>
          <p className="text-sm leading-relaxed text-[#5a5a5a]">{result.insight}</p>
        </article>
      )}

      {result.examples?.length > 0 && (
        <article className="card">
          <p className="section-label">例句</p>
          <ul className="space-y-4">
            {result.examples.map((ex, i) => (
              <li key={i}>
                <p className="font-serif text-[15px] leading-snug text-[#3d3d3d]">{ex.en}</p>
                <p className="mt-1.5 text-sm text-[#9CA3AF]">{ex.zh}</p>
              </li>
            ))}
          </ul>
        </article>
      )}
    </div>
  )
}
