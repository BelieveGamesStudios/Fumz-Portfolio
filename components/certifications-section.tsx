'use client'

import { useEffect, useState } from 'react'

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
    let mounted = true
    fetch('/api/certifications')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return
        setCerts(data)
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return null

  if (!certs || certs.length === 0) return null

  return (
    <section id="certifications" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-4 mb-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold">Certifications</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Selected certifications and issued credentials</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {certs.map((c) => (
            <div key={c.id} className="p-4 glass rounded-xl">
              {c.credential_url ? (
                <img src={c.credential_url} alt={c.title} className="w-full h-40 object-cover rounded-md" />
              ) : (
                <div className="w-full h-40 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">No image</div>
              )}
              <div className="mt-3">
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-muted-foreground">{c.issuer} {c.issued_date ? `• ${c.issued_date}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
