'use client'

import { useState, useEffect } from 'react'
import { getProjects, addProject, updateProject, deleteProject } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { RichTextEditor } from './rich-text-editor'
import { Trash2, Edit2, Plus, X, Film, Download } from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  category: string
  image_url: string
  platform?: string
  video_url?: string
  download_url?: string
  screenshots?: Array<{ url: string; caption?: string }>
}

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'xr',
    image: '',
    platforms: '',
    link: '',
    video_url: '',
    download_url: '',
    screenshots: [] as Array<{ url: string; caption?: string }>,
  })

  const [screenshotInput, setScreenshotInput] = useState('')
  const [screenshotCaption, setScreenshotCaption] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setLoading(true)
      const data = await getProjects()
      setProjects(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  function addScreenshot() {
    if (!screenshotInput.trim()) {
      toast({
        title: 'Error',
        description: 'Screenshot URL is required',
        variant: 'destructive',
      })
      return
    }

    const newScreenshot = {
      url: screenshotInput,
      caption: screenshotCaption || undefined,
    }

    setFormData({
      ...formData,
      screenshots: [...formData.screenshots, newScreenshot],
    })
    setScreenshotInput('')
    setScreenshotCaption('')
  }

  function removeScreenshot(index: number) {
    setFormData({
      ...formData,
      screenshots: formData.screenshots.filter((_, i) => i !== index),
    })
  }

  async function handleSubmit() {
    if (!formData.title || !formData.description) {
      console.log('Validation failed:', { title: !!formData.title, description: !!formData.description })
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      const platformArray = formData.platforms
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p)

      if (editingId) {
        console.log('Submitting update for:', editingId)
        await updateProject(editingId, {
          ...formData,
          platforms: platformArray,
        })
        toast({ title: 'Success', description: 'Project updated successfully' })
      } else {
        await addProject({
          ...formData,
          platforms: platformArray,
        })
        toast({ title: 'Success', description: 'Project added successfully' })
      }

      setIsOpen(false)
      setFormData({
        title: '',
        description: '',
        category: 'xr',
        image: '',
        platforms: '',
        link: '',
        video_url: '',
        download_url: '',
        screenshots: [],
      })
      setEditingId(null)
      await loadProjects()
    } catch (error) {
      console.error('Project submission error:', error)
      toast({
        title: 'Error',
        description: 'Failed to save project',
        variant: 'destructive',
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await deleteProject(id)
      toast({ title: 'Success', description: 'Project deleted successfully' })
      await loadProjects()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      })
    }
  }

  function handleEdit(project: Project) {
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      image: project.image_url || '',
      platforms: project.platform || '',
      link: '',
      video_url: project.video_url || '',
      download_url: project.download_url || '',
      screenshots: project.screenshots || [],
    })
    setEditingId(project.id)
    setIsOpen(true)
  }

  function handleNewProject() {
    setFormData({
      title: '',
      description: '',
      category: 'xr',
      image: '',
      platforms: '',
      link: '',
      video_url: '',
      download_url: '',
      screenshots: [],
    })
    setEditingId(null)
    setIsOpen(true)
  }

  if (loading) return <div>Loading projects...</div>

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleNewProject} className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Project
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0 gap-0">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Project' : 'Add New Project'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update project details' : 'Create a new portfolio project'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., VR Escape Room Experience"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="xr">XR Apps</option>
                  <option value="mobile">Mobile</option>
                  <option value="desktop">Desktop</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 flex flex-col flex-1 min-h-[400px]">
              <Label htmlFor="description">Description * (Rich Text)</Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Project description with formatting support..."
                className="flex-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platforms">Platforms (comma separated)</Label>
                <Input
                  id="platforms"
                  value={formData.platforms}
                  onChange={(e) => setFormData({ ...formData, platforms: e.target.value })}
                  placeholder="e.g., VR, Unity, PC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Featured Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL (YouTube/Vimeo)</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="download_url">Download Link</Label>
                <Input
                  id="download_url"
                  value={formData.download_url}
                  onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                  placeholder="https://example.com/game.zip"
                />
              </div>
            </div>

            {/* Screenshots Section */}
            <div className="space-y-4 border rounded-lg p-4 bg-secondary/10">
              <h4 className="font-semibold">Project Screenshots</h4>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="screenshot-url">Screenshot URL</Label>
                  <Input
                    id="screenshot-url"
                    value={screenshotInput}
                    onChange={(e) => setScreenshotInput(e.target.value)}
                    placeholder="https://example.com/screenshot.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshot-caption">Caption (Optional)</Label>
                  <Input
                    id="screenshot-caption"
                    value={screenshotCaption}
                    onChange={(e) => setScreenshotCaption(e.target.value)}
                    placeholder="e.g., Main gameplay view"
                  />
                </div>

                <Button
                  type="button"
                  onClick={addScreenshot}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Screenshot
                </Button>
              </div>

              {formData.screenshots.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Added Screenshots ({formData.screenshots.length})</p>
                  {formData.screenshots.map((screenshot, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-background rounded border border-input">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate text-muted-foreground">{screenshot.url}</p>
                        {screenshot.caption && (
                          <p className="text-xs text-primary font-medium">{screenshot.caption}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeScreenshot(index)}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
          <div className="p-6 border-t mt-auto bg-background">
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Create'} Project</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{project.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {project.description.replace(/<[^>]*>/g, '')}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-secondary px-2 py-1 rounded">{project.category}</span>
                  {project.platform && <span className="text-xs bg-secondary px-2 py-1 rounded">{project.platform}</span>}
                  {project.video_url && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      Video
                    </span>
                  )}
                  {project.download_url && (
                    <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Link
                    </span>
                  )}
                  {project.screenshots && project.screenshots.length > 0 && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {project.screenshots.length} screenshots
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(project)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(project.id)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <Card className="p-8 text-center text-muted-foreground">No projects yet. Create your first one!</Card>
      )}
    </div>
  )
}
