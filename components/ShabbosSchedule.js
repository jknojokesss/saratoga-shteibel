import { useEffect, useRef, useState } from 'react'

export default function ShabbosSchedule({ scheduleUrl, compact = false }) {
  const pdfCanvas = useRef(null)
  const [pdfFailed, setPdfFailed] = useState(false)

  useEffect(() => {
    if (!scheduleUrl) return undefined
    let cancelled = false
    function fitCanvas(canvas) {
      canvas.style.width = '100%'
      canvas.style.height = 'auto'
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
    return () => { cancelled = true }
  }, [scheduleUrl])

  return (
    <section aria-labelledby="schedule-heading">
      <div className={`mb-4 ${compact
        ? 'flex flex-wrap items-end justify-between gap-3'
        : 'flex flex-col items-center text-center mb-6'}`}>
        <div className={compact ? 'min-w-0 text-left' : ''}>
          <p className={`flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-[#c9a84c] ${compact ? '' : 'justify-center'}`}>
            {compact ? null : <span className="block h-px w-8 bg-[#c9a84c]" />}
            This week
            {compact ? null : <span className="block h-px w-8 bg-[#c9a84c]" />}
          </p>
          <h2 id="schedule-heading" className={`font-display font-semibold text-[#1e2d4e] mt-1 ${compact ? 'text-[22px] sm:text-[26px] leading-tight' : 'text-[30px] sm:text-[36px] mt-2'}`}>
            Shabbos Schedule
          </h2>
        </div>
        {scheduleUrl ? (
          <a href="/shabbos-schedule.pdf" target="_blank" rel="noreferrer" className={`btn-outline shrink-0 text-[12px] font-medium tracking-[0.12em] uppercase px-4 py-2 rounded-sm ${compact ? '' : 'mt-4'}`}>
            Open PDF
          </a>
        ) : null}
      </div>
      {scheduleUrl && !pdfFailed ? (
        <div className="flyer-frame overflow-hidden">
          <canvas
            ref={pdfCanvas}
            onClick={() => window.open('/shabbos-schedule.pdf', '_blank')}
            title="Open full schedule"
            className="block w-full cursor-pointer"
          />
        </div>
      ) : (
        <div className="flyer-frame">
          <div className="text-[#7a7068] text-[14px] text-center px-5 py-12">
            {scheduleUrl && pdfFailed
              ? 'Tap Open PDF for this week\'s schedule.'
              : 'This week\'s schedule will be posted here.'}
          </div>
        </div>
      )}
    </section>
  )
}
