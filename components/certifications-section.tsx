'use client'

import { useEffect, useState } from 'react'
import { getPublicCertifications } from '@/app/actions/public'
import { ExternalLink, Award } from 'lucide-react'

interface Certification {
  id: string
  title: string
  issuer: string
  issued_date?: string
  credential_url?: string
}

export function CertificationsSection() {
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {certs.map((c) => (
            <div
              key={c.id}
              className="p-6 bg-white rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-[#E31B23] mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">{c.title}</h3>
                <p className="text-xs font-semibold text-neutral-500">{c.issuer}</p>
                {c.issued_date && (
                  <p className="text-[11px] text-neutral-400 mt-2 font-medium">Issued {c.issued_date}</p>
                )}
              </div>

              {c.credential_url && (
                <a
                  href={c.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#E31B23] hover:underline"
                >
                  <span>Verify Credential</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
