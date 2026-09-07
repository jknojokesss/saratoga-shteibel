import Link from 'next/link'
import { GIVING } from './brand'

export default function GivingCards({ href = '/donate#give' }) {
  const Tag = href.startsWith('#') ? 'a' : Link
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {GIVING.map((g) => (
        <Tag
          key={g.id}
          href={href}
          className="group giving-card bg-white border border-[#ddd5c4] border-l-[3px] border-l-[#c9a84c] rounded-sm p-5 hover:border-[#c9a84c] hover:shadow-[0_8px_24px_rgba(30,45,78,0.08)] transition-all"
        >
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[#c9a84c]">{g.eyebrow}</span>
            <span className="font-display text-[20px] text-[#1e2d4e] font-semibold whitespace-nowrap">{g.amount}</span>
          </div>
          <h3 className="font-display text-[22px] text-[#1e2d4e] font-semibold leading-tight mb-2">{g.label}</h3>
          <p className="text-[13.5px] text-[#7a7068] leading-relaxed">{g.blurb}</p>
          <span className="mt-4 inline-block text-[11px] tracking-[0.14em] uppercase text-[#1e2d4e] group-hover:text-[#c9a84c] transition-colors">
            Give this way →
          </span>
        </Tag>
      ))}
    </div>
  )
}
