import { useEffect, useRef, useState } from 'react'

export default function ShabbosSchedule({ scheduleUrl }) {
  const pdfCanvas = useRef(null)
  const [pdfFailed, setPdfFailed] = useState(false)

  useEffect(() => {
    if (!scheduleUrl) return undefined
    let cancelled = false
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
          canvas.style.width = '100%'
          canvas.style.height = 'auto'
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
    <section className="h-full bg-[#f7f3ec] px-5 sm:px-7 pt-7 pb-10" aria-labelledby="schedule-heading">
      <div className="font-display text-[26px] font-semibold text-[#1e2d4e]" id="schedule-heading">
        Shabbos Schedule
      </div>
      <div className="gold-rule mt-2 mb-5" />
      {scheduleUrl ? (
        <>
          <div className={`bg-white border border-[#ddd5c4] rounded-sm overflow-hidden shadow-[0_3px_10px_rgba(0,0,0,.08)] ${pdfFailed ? 'p-10 text-center' : ''}`}>
            {pdfFailed ? (
              <div className="text-[#7a7068]">
                <div className="font-display text-[17px] text-[#1e2d4e] mb-1.5">This week&apos;s schedule is ready</div>
                <div className="text-[13px]">Tap below to open it.</div>
              </div>
            ) : (
              <canvas
                ref={pdfCanvas}
                onClick={() => window.open('/shabbos-schedule.pdf', '_blank')}
                title="Tap to open full schedule"
                className="block w-full cursor-pointer"
              />
            )}
          </div>
          <div className="text-center mt-4">
            <a href="/shabbos-schedule.pdf" target="_blank" rel="noreferrer" className="btn-navy inline-block text-[12px] font-medium tracking-wide px-5 py-2.5 rounded-sm">
              Open / Download PDF
            </a>
          </div>
        </>
      ) : (
        <div className="bg-white border border-dashed border-[#ddd5c4] rounded-sm px-5 py-12 text-center text-[#7a7068]">
          <div className="font-display text-[17px] text-[#1e2d4e] mb-1.5">Posted each week</div>
          <div className="text-[12.5px] leading-relaxed">This week&apos;s Shabbos schedule will appear here as a PDF — viewable and downloadable.</div>
        </div>
      )}
    </section>
  )
}
