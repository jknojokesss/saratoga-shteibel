import { GOLD } from './brand'

const FALLBACK = [
  { tag: 'Welcome', title: 'Welcome to our new website', body: 'Announcements will be posted here on the bulletin board.', pin: GOLD },
]
const TILTS = [-1.3, 0.9, -0.6, 1.1, -1.0, 0.7]

function Pin({ color }) {
  return (
    <span
      aria-hidden
      className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
      style={{
        background: color,
        boxShadow: 'inset -2px -2px 3px rgba(0,0,0,.3), inset 2px 2px 3px rgba(255,255,255,.5), 0 2px 3px rgba(0,0,0,.3)',
      }}
    />
  )
}

export default function BulletinBoard({ announcements = FALLBACK }) {
  const notes = announcements.length ? announcements : FALLBACK
  return (
    <section
      className="cork-board h-full px-5 sm:px-7 pt-7 pb-12"
      aria-labelledby="bulletin-heading"
    >
      <div className="font-display text-[26px] font-semibold text-[#3f2a15]" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.15)' }} id="bulletin-heading">
        Bulletin Board
      </div>
      <div className="w-10 h-0.5 bg-[#6e4a29] mt-2 mb-8" />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,175px))] justify-center gap-x-[22px] gap-y-7">
        {notes.map((a, i) => (
          <article key={a.id || i} className="relative" style={{ transform: `rotate(${TILTS[i % TILTS.length]}deg)` }}>
            <Pin color={a.pin || GOLD} />
            <div className="bg-[#fffdf5] rounded-sm aspect-square flex flex-col justify-center overflow-hidden px-3 py-3.5 shadow-[0_7px_16px_rgba(40,25,10,0.42)]">
              {a.tag ? (
                <div className="text-[9.5px] tracking-widest text-[#b0762e] uppercase mb-1">{a.tag}</div>
              ) : null}
              <h3 className="font-display text-[16px] font-semibold text-[#1e2d4e] leading-tight mb-1">{a.title}</h3>
              <p className="text-[11.5px] text-[#5a5348] leading-snug">{a.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
