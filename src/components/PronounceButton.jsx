import { getYoudaoTtsUrl } from '../lib/deepseek'
import { IconVolume } from './Icons'

export default function PronounceButton({ word, className = '' }) {
  const play = () => {
    const audio = new Audio(getYoudaoTtsUrl(word))
    audio.play().catch(() => {})
  }

  return (
    <button
      type="button"
      onClick={play}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f2f2] text-[#7EB1B1] transition active:scale-95 ${className}`}
      aria-label="发音"
    >
      <IconVolume className="h-5 w-5" />
    </button>
  )
}
