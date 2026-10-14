import { useEffect, useRef, useState } from 'react'

export default function ShabbosSchedule({ scheduleUrl, previewUrl, compact = false, hideTitle = false }) {
  const pdfCanvas = useRef(null)
  const [pdfFailed, setPdfFailed] = useState(false)

  useEffect(() => {
    if (!scheduleUrl || previewUrl) return undefined
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
  }, [scheduleUrl, previewUrl])

  const headingId = hideTitle ? undefined : 'schedule-heading'

  return (
    <section aria-labelledby={headingId}>
      {hideTitle ? null : (
        <div className={`mb-4 ${compact
          ? 'flex flex-wrap items-end justify-between gap-3'
          : 'flex flex-col items-center text-center mb-6'}`}>
          <div className={compact ? 'min-w-0 text-left' : ''}>
            <p className={`flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-gold ${compact ? '' : 'justify-center'}`}>
              {compact ? null : <span className="block h-px w-8 bg-gold" />}
              This week
              {compact ? null : <span className="block h-px w-8 bg-gold" />}
            </p>
            <h2 id="schedule-heading" className={`font-display font-semibold text-navy mt-1 ${compact ? 'text-[22px] sm:text-[26px] leading-tight' : 'text-[30px] sm:text-[36px] mt-2'}`}>
              Zmanim
            </h2>
          </div>
        </div>
      )}
      {previewUrl ? (
        <a
          href={scheduleUrl || previewUrl}
          target="_blank"
          rel="noreferrer"
          className="flyer-frame block overflow-hidden"
          title="Open PDF"
        >
          <img src={previewUrl} alt="This week's zmanim — tap to open PDF" className="block w-full" />
        </a>
      ) : scheduleUrl && !pdfFailed ? (
        <a
          href={scheduleUrl}
          target="_blank"
          rel="noreferrer"
          className="flyer-frame block overflow-hidden"
          title="Open PDF"
        >
          <canvas
            ref={pdfCanvas}
            title="This week's zmanim — tap to open PDF"
            className="block w-full cursor-pointer pointer-events-none"
          />
        </a>
      ) : scheduleUrl ? (
        <div className="flyer-frame">
          <div className="text-muted text-[14px] text-center px-5 py-12 leading-relaxed">
            The flyer preview did not load in your browser.
            <br />
            <a href={scheduleUrl} target="_blank" rel="noreferrer" className="inline-block mt-4 text-navy font-medium underline">
              Open PDF
            </a>
          </div>
        </div>
      ) : (
        <div className="flyer-frame">
          <div className="text-muted text-[14px] text-center px-5 py-12">
            This week&apos;s zmanim will be posted here.
          </div>
        </div>
      )}
    </section>
  )
}
