export default function LoadingSpinner({ text = '加载中...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-[#9CA3AF]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7EB1B1] border-t-transparent" />
      <span className="text-sm">{text}</span>
    </div>
  )
}
