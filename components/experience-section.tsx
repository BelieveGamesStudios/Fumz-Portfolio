'use client'

import { useState, useEffect } from 'react'
import { Briefcase, MapPin, Calendar, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
                setExperiences(data)
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

    if (loading) {
        return (
            <section id="experience" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/5">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-muted-foreground">Loading experience...</p>
                </div>
            </section>
        )
    }

    if (experiences.length === 0) return null

    return (
        <section id="experience" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/5">
            <div className="max-w-6xl mx-auto">
                <div className="space-y-4 mb-16 text-center" data-scroll-animate data-animation="slide-up">
                    <h2 className="text-4xl sm:text-5xl font-bold">Experience</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        My professional journey and work history
                    </p>
                </div>

                <div className="relative space-y-8 pl-8 md:pl-0">
                    {/* Vertical Line - Left aligned on mobile, slightly indented on desktop */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-border/50 via-border to-border/50 md:left-12 -translate-x-1/2" />

                    {experiences.map((exp, index) => (
                        <div
                            key={exp.id}
                            className="relative flex gap-6 md:gap-10 group"
                            data-scroll-animate
                            data-animation="slide-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Icon/Logo */}
                            <div className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-border bg-background shadow-lg shrink-0 z-10 relative ml-0 md:ml-4 overflow-hidden group-hover:border-primary/50 transition-colors">
                                {exp.company_logo ? (
                                    <img src={exp.company_logo} alt={exp.company} className="w-full h-full object-cover" />
                                ) : (
                                    <Briefcase className="w-6 h-6 text-primary" />
                                )}
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 p-6 glass rounded-2xl hover:bg-secondary/10 transition-colors border border-border/50 group-hover:border-primary/20">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-2">
                                    <div>
                                        <h3 className="font-bold text-xl text-foreground">{exp.role}</h3>
                                        <div className="flex items-center gap-2 text-primary font-medium mt-1 text-lg">
                                            <Building2 className="w-5 h-5" />
                                            <span>{exp.company}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start md:items-end text-sm text-muted-foreground gap-1">
                                        <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
                                            <Calendar className="w-4 h-4" />
                                            <span className="font-medium">
                                                {formatDate(exp.start_date)} - {exp.current ? 'Present' : formatDate(exp.end_date!)}
                                            </span>
                                        </div>
                                        {exp.location && (
                                            <div className="flex items-center gap-1.5 px-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{exp.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {exp.description && (
                                    <div className="prose prose-invert max-w-none text-muted-foreground text-base">
                                        <p className="whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
