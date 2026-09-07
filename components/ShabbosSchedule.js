import { useEffect, useRef, useState } from 'react'

export default function ShabbosSchedule({ scheduleUrl, embedded = false }) {
  const pdfCanvas = useRef(null)
  const frameRef = useRef(null)
  const [pdfFailed, setPdfFailed] = useState(false)

  useEffect(() => {
    if (!scheduleUrl) return undefined
    let cancelled = false
    function fitCanvas(canvas) {
      if (!embedded) {
        canvas.style.width = '100%'
        canvas.style.height = 'auto'
        return
      }
      const wrap = frameRef.current
      if (!wrap || !canvas.width || !canvas.height) return
      const maxW = Math.max(0, wrap.clientWidth - 24)
      const maxH = Math.max(0, wrap.clientHeight - 24)
      if (!maxW || !maxH) return
      const scale = Math.min(maxW / canvas.width, maxH / canvas.height)
      canvas.style.width = `${Math.floor(canvas.width * scale)}px`
      canvas.style.height = `${Math.floor(canvas.height * scale)}px`
    }
    function render() {
      const lib = window.pdfjsLib
      if (!lib) { setPdfFailed(true); return }
      try { lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js' } catch (e) {}
      lib.getDocument(scheduleUrl).promise
        .then((pdf) => pdf.getPage(1))
        .then((page) => {
          if (cancelled) return
          const canvas = pdfCanvas.current
          if (!canvas) return
          const base = page.getViewport({ scale: 1 })
          const vp = page.getViewport({ scale: 2200 / base.width })
          canvas.width = vp.width
          canvas.height = vp.height
          fitCanvas(canvas)
          return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
        })
        .then(() => {
          if (!cancelled && pdfCanvas.current) fitCanvas(pdfCanvas.current)
        })
        .catch(() => { if (!cancelled) setPdfFailed(true) })
    }
    if (window.pdfjsLib) {
      render()
    } else {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      s.onload = render
      s.onerror = () => { if (!cancelled) setPdfFailed(true) }
      document.body.appendChild(s)
    }
    const wrap = frameRef.current
    let ro
    if (embedded && wrap) {
      ro = new ResizeObserver(() => {
        if (pdfCanvas.current) fitCanvas(pdfCanvas.current)
      })
      ro.observe(wrap)
    }
    return () => {
      cancelled = true
      if (ro) ro.disconnect()
    }
  }, [scheduleUrl, embedded])

  const pdfLink = scheduleUrl ? (
    <a href="/shabbos-schedule.pdf" target="_blank" rel="noreferrer" className={embedded
      ? 'shrink-0 text-[11px] font-medium tracking-[0.12em] uppercase px-3.5 py-2 rounded-sm border border-[#e8d5a3] text-[#e8d5a3] hover:bg-[#e8d5a3] hover:text-[#1e2d4e] transition-colors'
      : 'btn-navy shrink-0 text-[12px] font-medium tracking-wide px-5 py-2.5 rounded-sm'}
    >
      Open PDF
    </a>
  ) : null

  const flyer = scheduleUrl ? (
    pdfFailed ? (
      <div className={`text-[#7a7068] text-[14px] text-center ${embedded ? 'p-8' : 'p-10'}`}>
        Tap Open PDF for this week&apos;s schedule.
      </div>
    ) : (
      <canvas
        ref={pdfCanvas}
        onClick={() => window.open('/shabbos-schedule.pdf', '_blank')}
        title="Open full schedule"
        className={embedded
          ? 'schedule-fit cursor-pointer'
          : 'block w-full cursor-pointer'}
      />
    )
  ) : (
    <div className={`text-[#7a7068] text-[14px] text-center ${embedded ? 'px-5 py-10' : 'px-5 py-12'}`}>
      This week&apos;s schedule will be posted here.
    </div>
  )

  if (embedded) {
    return (
      <section
        className="h-full min-h-[280px] flex flex-col bg-[#faf7f2] text-[#1e2d4e] rounded-sm overflow-hidden shadow-[0_28px_64px_rgba(8,12,24,0.45)] border border-[#e8d5a3]/40"
        aria-labelledby="schedule-heading"
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-[#1e2d4e] text-[#faf7f2] shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#c9a84c]">This week</p>
            <h2 id="schedule-heading" className="font-display text-[22px] sm:text-[26px] font-semibold leading-tight">
              Shabbos Schedule
            </h2>
          </div>
          {pdfLink}
        </div>
        <div
          ref={frameRef}
          className={`flex-1 min-h-0 bg-white flex items-center justify-center ${scheduleUrl && !pdfFailed ? 'overflow-hidden p-2 sm:p-3' : ''}`}
        >
          {flyer}
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="schedule-heading">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div className="font-display text-[28px] sm:text-[32px] font-semibold text-[#1e2d4e]" id="schedule-heading">
            Shabbos Schedule
          </div>
          <div className="gold-rule mt-3" />
        </div>
        {pdfLink}
      </div>
      {scheduleUrl ? (
        <div className="bg-white border border-[#ddd5c4] rounded-sm overflow-hidden shadow-[0_8px_28px_rgba(30,45,78,0.08)]">
          {flyer}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-[#ddd5c4] rounded-sm">
          {flyer}
        </div>
      )}
    </section>
  )
}
