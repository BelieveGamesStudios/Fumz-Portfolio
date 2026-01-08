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

export function CertificationsSection() {
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
    <section id="certifications" className="relative w-full py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-4 mb-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">
            Certifications
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional certifications and credentials
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {certs.map((c) => (
            <div key={c.id} className="group relative p-6 glass rounded-xl overflow-hidden hover:bg-white/5 transition-colors">
              <div className="flex flex-col h-full">
                {c.credential_url && (
                  <div className="relative mb-4 overflow-hidden rounded-lg aspect-video bg-muted/20">
                    <img
                      src={c.credential_url}
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">{c.issuer}</p>
                  {c.issued_date && (
                    <p className="text-xs text-muted-foreground/60">
                      Issued {new Date(c.issued_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
