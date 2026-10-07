'use client'

import { useEffect, useState } from 'react'
import { getPublicCertifications } from '@/app/actions/public'
import { ExternalLink } from 'lucide-react'

interface Certification {
  id: string
  title: string
  issuer: string
  issued_date?: string
  credential_url?: string
}

export function CertificationsSection({ isModal = false }: { isModal?: boolean } = {}) {
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getPublicCertifications()
        setCerts(data)
      } catch (error) {
        console.error('Failed to load certifications', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return null

  if (!certs || certs.length === 0) return null

  return (
    <section id="certifications" className={isModal ? "py-2 px-1 w-full" : "relative w-full py-24 px-4 sm:px-6 lg:px-8"}>
      <div className={isModal ? "w-full" : "max-w-6xl mx-auto"}>
        {!isModal && (
          <div className="space-y-4 mb-12 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
              Certifications
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional certifications and credentials
            </p>
          </div>
        )}

        <div className={isModal ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"}>
          {certs.map((c) => (
            <div
              key={c.id}
              className="group relative p-4 sm:p-5 rounded-2xl bg-card/60 border border-border/80 hover:border-primary/40 backdrop-blur-md overflow-hidden hover:bg-white/5 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                {c.credential_url ? (
                  <div className="relative mb-3.5 overflow-hidden rounded-xl aspect-video bg-muted/30 border border-border/50">
                    <img
                      src={c.credential_url}
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="mb-3.5 rounded-xl aspect-video bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <ExternalLink className="w-8 h-8 opacity-40" />
                  </div>
                )}

                <h3 className="font-bold text-base sm:text-lg leading-snug mb-1.5 group-hover:text-primary transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{c.issuer}</p>
              </div>

              {c.issued_date && (
                <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground/70">
                    Issued {new Date(c.issued_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
