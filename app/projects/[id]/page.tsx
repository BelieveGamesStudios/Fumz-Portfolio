'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Screenshot {
  url: string
  caption?: string
}

interface Project {
  id: string
  title: string
  description: string
  category: string
  image: string
  platforms: string[]
  featured?: boolean
  video_url?: string
  download_url?: string
  screenshots?: Screenshot[]
  created_at?: string
}

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true)
        const response = await fetch('/api/projects')
        const projects: Project[] = await response.json()

        const found = projects.find(p => p.id === projectId)
        if (found) {
          setProject(found)
        } else {
          setError('Project not found')
        }
      } catch (err) {
        setError('Failed to load project')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  // Helper to convert YouTube/Vimeo URLs to embed format
  function getEmbedUrl(url: string): string | null {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || 'Project not found'}</p>
        <Link href="/#projects">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  const embedUrl = project.video_url ? getEmbedUrl(project.video_url) : null

  return (
    <main className="min-h-screen bg-background">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link href="/#projects" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        {/* Project header */}
        <div className="space-y-6 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold">{project.title}</h1>

          {/* Project image */}
          <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
            <img
              src={project.image || '/placeholder.jpg'}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Project metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Category</h3>
              <p className="text-lg uppercase">{project.category}</p>
            </div>

            <div className="glass rounded-xl p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {project.platforms && project.platforms.length > 0 ? (
                  project.platforms.map((platform) => (
                    <span key={platform} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                      {platform}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">Not specified</span>
                )}
              </div>

              {project.download_url && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <a href={project.download_url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full gap-2 group">
                      <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                      Download App
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Section */}
        {embedUrl && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Play className="w-6 h-6 text-primary" />
              Project Video
            </h2>
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
                <div className="relative aspect-video w-[600px] flex-shrink-0 rounded-2xl overflow-hidden bg-black">
                  <iframe
                    src={embedUrl}
                    title={`${project.title} video`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screenshots Section */}
        {project.screenshots && project.screenshots.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Screenshots</h2>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
                {project.screenshots.map((screenshot, index) => (
                  <div key={index} className="relative w-80 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 group">
                    <img
                      src={screenshot.url}
                      alt={screenshot.caption || `Screenshot ${index + 1}`}
                      className="w-full h-52 object-cover transition-transform group-hover:scale-105"
                    />
                    {screenshot.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-sm text-white">{screenshot.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Project description */}
        <div className="glass rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">About This Project</h2>
          <div className="prose prose-invert max-w-none">
            {project.description ? (
              <div dangerouslySetInnerHTML={{ __html: project.description }} />
            ) : (
              <p className="text-lg text-muted-foreground">No description available for this project.</p>
            )}
          </div>
        </div>

        {/* Featured badge */}
        {project.featured && (
          <div className="mt-8 p-4 bg-accent/10 rounded-xl border border-accent/20">
            <p className="text-sm font-semibold text-accent">⭐ This is a featured project</p>
          </div>
        )}
      </div>
    </main>
  )
}
