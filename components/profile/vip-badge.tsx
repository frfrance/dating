import { BadgeCheck } from 'lucide-react'

export default function VipBadge({
  isVip,
  className = '',
}: {
  isVip?: boolean | null
  className?: string
}) {
  if (!isVip) return null

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full bg-pink-100 px-2.5 py-1 text-xs font-semibold text-pink-700',
        className,
      ].join(' ')}
    >
      <BadgeCheck className="h-3.5 w-3.5" />
      VIP
    </span>
  )
}