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

export function ExperienceSection({ isModal = false }: { isModal?: boolean } = {}) {
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
            <section id="experience" className={isModal ? "py-4 px-2" : "py-24 px-4 sm:px-6 lg:px-8 bg-secondary/5"}>
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-muted-foreground">Loading experience...</p>
                </div>
            </section>
        )
    }

    if (experiences.length === 0) return null

    return (
        <section id="experience" className={isModal ? "py-2 px-1 w-full" : "py-24 px-4 sm:px-6 lg:px-8 bg-secondary/5"}>
            <div className={isModal ? "w-full" : "max-w-6xl mx-auto"}>
                {!isModal && (
                    <div className="space-y-4 mb-16 text-center" data-scroll-animate data-animation="slide-up">
                        <h2 className="text-4xl sm:text-5xl font-bold">Experience</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            My professional journey and work history
                        </p>
                    </div>
                )}

                <div className="relative space-y-6 sm:space-y-8 pl-4 sm:pl-8 md:pl-0">
                    {/* Vertical Line */}
                    <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-border/50 via-border to-border/50 md:left-10 -translate-x-1/2" />

                    {experiences.map((exp, index) => (
                        <div
                            key={exp.id}
                            className="relative flex gap-4 sm:gap-6 md:gap-8 group"
                            data-scroll-animate
                            data-animation="slide-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Icon/Logo */}
                            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-border bg-background shadow-lg shrink-0 z-10 relative ml-0 sm:ml-2 md:ml-3 overflow-hidden group-hover:border-primary/50 transition-colors">
                                {exp.company_logo ? (
                                    <img src={exp.company_logo} alt={exp.company} className="w-full h-full object-cover" />
                                ) : (
                                    <Briefcase className="w-5 h-5 text-primary" />
                                )}
                            </div>

                            {/* Content Card */}
                            <div className={`flex-1 rounded-2xl bg-card/60 hover:bg-card/80 transition-colors border border-border/80 group-hover:border-primary/30 shadow-md ${isModal ? "p-4 sm:p-5" : "p-6"}`}>
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 gap-2">
                                    <div>
                                        <h3 className="font-bold text-lg sm:text-xl text-foreground">{exp.role}</h3>
                                        <div className="flex items-center gap-1.5 text-primary font-medium mt-0.5 text-sm sm:text-base">
                                            <Building2 className="w-4 h-4" />
                                            <span>{exp.company}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start md:items-end text-xs sm:text-sm text-muted-foreground gap-1">
                                        <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-full border border-border/40">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="font-mono">
                                                {formatDate(exp.start_date)} - {exp.current ? 'Present' : formatDate(exp.end_date!)}
                                            </span>
                                        </div>
                                        {exp.location && (
                                            <div className="flex items-center gap-1.5 px-1 text-xs">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{exp.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {exp.description && (
                                    <div className="prose prose-invert max-w-none text-muted-foreground text-xs sm:text-sm pt-1">
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
