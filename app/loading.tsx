import { LissajousLoader } from '@/components/LissajousLoader'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-zinc-950 text-zinc-100">
      <LissajousLoader size={200} />
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
        Loading
      </p>
    </div>
  )
}
