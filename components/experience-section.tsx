'use client'

import { useState, useEffect } from 'react'
import { Briefcase, MapPin, Calendar, Building2 } from 'lucide-react'

interface Experience {
  id: string
  company: string
  role: string
  location?: string
  start_date: string
  end_date?: string
  current: boolean
  description?: string
  company_logo?: string
}

export function ExperienceSection() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const response = await fetch('/api/experiences')
        const data = await response.json()
        setExperiences(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load experiences:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchExperiences()
  }, [])

  function formatDate(dateString: string) {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  if (loading || experiences.length === 0) return null

  return (
    <section id="experience" className="py-20 px-4 sm:px-8 lg:px-14 bg-white border-t border-neutral-200/80">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E31B23]" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Career Timeline
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight uppercase mb-12">
          Experience
        </h2>

        <div className="space-y-6">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="p-6 sm:p-8 bg-[#FAFAFC] rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E31B23] text-white text-[10px] font-bold uppercase">
                    {exp.current ? 'Current' : 'Completed'}
                  </span>
                  <span className="text-sm font-semibold text-neutral-500">
                    {formatDate(exp.start_date)} - {exp.current ? 'Present' : formatDate(exp.end_date || '')}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-neutral-900">{exp.role}</h3>
                <p className="text-sm font-bold text-neutral-600">{exp.company}</p>
                {exp.description && (
                  <p className="text-sm text-neutral-600 leading-relaxed pt-2 max-w-3xl">
                    {exp.description}
                  </p>
                )}
              </div>
              {exp.location && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#E31B23]" />
                  <span>{exp.location}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
