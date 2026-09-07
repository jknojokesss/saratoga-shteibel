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
    <section className="px-5 pt-5 pb-8" aria-labelledby="schedule-heading">
      <div className="font-display text-[22px] font-semibold text-[#1e2d4e] mb-3" id="schedule-heading">
        Shabbos Schedule
      </div>
      {scheduleUrl ? (
        <>
          <div className={`bg-white border border-[#ddd5c4] rounded-sm overflow-hidden ${pdfFailed ? 'p-8 text-center' : ''}`}>
            {pdfFailed ? (
              <div className="text-[#7a7068] text-[14px]">Tap below to open this week&apos;s schedule.</div>
            ) : (
              <canvas
                ref={pdfCanvas}
                onClick={() => window.open('/shabbos-schedule.pdf', '_blank')}
                title="Open full schedule"
                className="block w-full cursor-pointer"
              />
            )}
          </div>
          <div className="text-center mt-3">
            <a href="/shabbos-schedule.pdf" target="_blank" rel="noreferrer" className="btn-navy inline-block text-[12px] font-medium tracking-wide px-5 py-2.5 rounded-sm">
              Open PDF
            </a>
          </div>
        </>
      ) : (
        <div className="bg-white border border-dashed border-[#ddd5c4] rounded-sm px-5 py-8 text-center text-[#7a7068] text-[14px]">
          This week&apos;s schedule will be posted here.
        </div>
      )}
    </section>
  )
}
