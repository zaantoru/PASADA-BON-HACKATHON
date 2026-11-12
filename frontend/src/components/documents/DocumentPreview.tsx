import { ExternalLink, FileText } from 'lucide-react'

export function DocumentPreview({
  url,
  mimeType,
  fileName,
  className = '',
}: {
  url: string | null
  mimeType: string
  fileName: string
  className?: string
}) {
  if (!url) {
    return (
      <div className={`grid place-items-center rounded-2xl bg-pale p-6 text-center ${className}`}>
        <div>
          <FileText className="mx-auto size-10 text-royal" aria-hidden />
          <p className="mt-2 break-all text-sm font-semibold text-ink">{fileName}</p>
          <p className="mt-1 text-xs text-ink/70">Preview isn't available for this saved file in the prototype.</p>
        </div>
      </div>
    )
  }
  if (mimeType === 'application/pdf') {
    return (
      <div className={`overflow-hidden rounded-2xl bg-pale ${className}`}>
        <object data={url} type="application/pdf" className="h-full min-h-[420px] w-full" aria-label={`Preview of ${fileName}`}>
          <div className="grid h-full place-items-center p-6 text-center">
            <div>
              <FileText className="mx-auto size-10 text-royal" aria-hidden />
              <p className="mt-2 break-all text-sm font-semibold">{fileName}</p>
              <a href={url} target="_blank" rel="noreferrer" className="btn btn-sm mt-3 min-h-11 rounded-full">
                <ExternalLink className="size-4" aria-hidden /> Open PDF
              </a>
            </div>
          </div>
        </object>
      </div>
    )
  }
  return (
    <div className={`overflow-hidden rounded-2xl bg-pale ${className}`}>
      <img src={url} alt={`Original document: ${fileName}`} className="mx-auto h-full max-h-[70dvh] w-full object-contain" />
    </div>
  )
}
