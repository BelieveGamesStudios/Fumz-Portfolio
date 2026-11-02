'use client'

import { useEffect, useState } from 'react'
import { getPublicCertifications } from '@/app/actions/public'
import { Eye, Maximize2, X } from 'lucide-react'

interface Certification {
  id: string
  title: string
  issuer: string
  issued_date?: string
  credential_url?: string
}

function resolveCertificateImage(url?: string): string | null {
  if (!url) return null
  const lower = url.toLowerCase()
  if (lower.includes('mentor%20certificate.heic') || lower.includes('mentor certificate.heic')) {
    return '/mentor-certificate.jpg'
  }
  if (lower.endsWith('.heic')) {
    return `/api/heic-to-jpeg?url=${encodeURIComponent(url)}`
  }
  return url
}

export function CertificationsSection() {
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublicCertifications()
        setCerts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load certifications', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Close lightbox on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedCert(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (loading || !certs || certs.length === 0) return null

  return (
    <section id="certifications" className="relative w-full py-20 px-4 sm:px-8 lg:px-14 bg-[#FAFAFC] border-t border-neutral-200/80">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E31B23]" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Credentials
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight uppercase mb-12">
          Certifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {certs.map((c) => {
            const imgSrc = resolveCertificateImage(c.credential_url)

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCert(c)}
                className="group relative bg-white rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Certificate Image Preview Frame */}
                  <div
                    className="relative w-full aspect-[16/11] bg-neutral-100 overflow-hidden border-b border-neutral-100 select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={c.title}
                        draggable={false}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 pointer-events-none select-none"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-400">
                        <span className="text-xs font-semibold text-neutral-400">Certificate Preview</span>
                      </div>
                    )}

                    {/* Hover preview pill overlay */}
                    <div className="absolute inset-0 bg-neutral-900/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 text-xs font-bold text-neutral-900 shadow-md backdrop-blur-sm">
                        <Maximize2 className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span>View</span>
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-[#E31B23] transition-colors leading-snug mb-1.5 line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-neutral-500">{c.issuer}</p>
                    {c.issued_date && (
                      <p className="text-[11px] text-neutral-400 mt-2 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                        Issued {c.issued_date}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer preview action */}
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 flex items-center justify-between border-t border-neutral-100 mt-2 pt-4">
                  <span className="text-xs font-bold text-neutral-600 group-hover:text-neutral-900 flex items-center gap-1.5 transition-colors">
                    <Eye className="w-3.5 h-3.5 text-[#E31B23]" />
                    <span>View Certificate</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-neutral-200 bg-neutral-50">
              <div className="pr-4">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">{selectedCert.title}</h3>
                <p className="text-xs font-semibold text-neutral-500">
                  {selectedCert.issuer} {selectedCert.issued_date ? `• Issued ${selectedCert.issued_date}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/80 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Image Preview (Protected from download/context menu) */}
            <div
              className="relative flex-1 overflow-auto bg-neutral-950 flex items-center justify-center p-4 sm:p-6 min-h-[300px] select-none"
              onContextMenu={(e) => e.preventDefault()}
            >
              <img
                src={resolveCertificateImage(selectedCert.credential_url) || ''}
                alt={selectedCert.title}
                draggable={false}
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg shadow-lg select-none pointer-events-none"
              />
            </div>

            {/* Lightbox Footer */}
            <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-medium">Certificate Document</span>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
