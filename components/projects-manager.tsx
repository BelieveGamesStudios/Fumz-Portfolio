'use client'

import { useState, useEffect, useMemo } from 'react'
import { getProjects, addProject, updateProject, deleteProject } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { RichTextEditor } from './rich-text-editor'
import { Trash2, Edit2, Plus, X, Film, Download, ExternalLink } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { normalizeTags, normalizeWebsiteUrl, type ProjectActionType } from '@/lib/project-details'
import { FileUploadOrUrl } from '@/components/ui/file-upload-or-url'

interface Project {
  id: string
  title: string
  description: string
  category: string
  image_url: string
  platform?: string
  video_url?: string
  tags?: string[]
  action_type?: ProjectActionType
  website_url?: string
  download_url?: string
  screenshots?: Array<{ url: string; caption?: string }>
}

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [tagInput, setTagInput] = useState('')
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
    website_url: '',
    action_type: 'download' as ProjectActionType,
    tags: [] as string[],
    screenshots: [] as Array<{ url: string; caption?: string }>,
  })

  const DEFAULT_CATEGORIES = [
    { value: 'xr', label: 'XR Apps' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'desktop', label: 'Desktop' },
  ]

  const availableCategories = useMemo(() => {
    const list = [...DEFAULT_CATEGORIES]
    const defaultVals = new Set(['xr', 'mobile', 'desktop'])

    projects.forEach((p) => {
      if (p.category && !defaultVals.has(p.category.toLowerCase())) {
        const trimmed = p.category.trim()
        if (!list.some((c) => c.value.toLowerCase() === trimmed.toLowerCase())) {
          list.push({ value: trimmed, label: trimmed })
        }
      }
    })

    if (
      formData.category &&
      !list.some((c) => c.value.toLowerCase() === formData.category.toLowerCase()) &&
      formData.category !== '__new__'
    ) {
      list.push({ value: formData.category, label: formData.category })
    }

    return list
  }, [projects, formData.category])

  const availableTags = useMemo(
    () => normalizeTags(projects.flatMap((project) => project.tags || []))
      .sort((a, b) => a.localeCompare(b)),
    [projects],
  )

  function resolveTags(tags: string[]) {
    return normalizeTags(tags.map((tag) =>
      availableTags.find((existing) => existing.toLowerCase() === tag.trim().toLowerCase()) || tag,
    ))
  }

  function addTag(value = tagInput) {
    if (!value.trim()) return
    setFormData((current) => ({ ...current, tags: resolveTags([...current.tags, value]) }))
    setTagInput('')
  }

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
      const websiteUrl = normalizeWebsiteUrl(formData.website_url)
      const tags = resolveTags([...formData.tags, tagInput])
      const finalCategory =
        (isCreatingCategory && newCategoryName.trim())
          ? newCategoryName.trim()
          : (formData.category === '__new__' ? 'xr' : formData.category)

      const platformArray = formData.platforms
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p)

      if (editingId) {
        console.log('Submitting update for:', editingId)
        await updateProject(editingId, {
          ...formData,
          website_url: websiteUrl,
          tags,
          category: finalCategory,
          platforms: platformArray,
        })
        toast({ title: 'Success', description: 'Project updated successfully' })
      } else {
        await addProject({
          ...formData,
          website_url: websiteUrl,
          tags,
          category: finalCategory,
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
        website_url: '',
        action_type: 'download',
        tags: [],
        screenshots: [],
      })
      setTagInput('')
      setEditingId(null)
      setIsCreatingCategory(false)
      setNewCategoryName('')
      await loadProjects()
    } catch (error) {
      console.error('Project submission error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save project',
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
      website_url: project.website_url || '',
      action_type: project.action_type || 'download',
      tags: project.tags || [],
      screenshots: project.screenshots || [],
    })
    setTagInput('')
    setIsCreatingCategory(false)
    setNewCategoryName('')
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
      website_url: '',
      action_type: 'download',
      tags: [],
      screenshots: [],
    })
    setTagInput('')
    setIsCreatingCategory(false)
    setNewCategoryName('')
    setEditingId(null)
    setIsOpen(true)
  }

  if (loading) return <div>Loading projects...</div>

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleNewProject} className="gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium shadow-sm">
            <Plus className="w-4 h-4" />
            Add New Project
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-white border border-neutral-200 shadow-2xl">
          <div className="p-6 pb-2 shrink-0 border-b border-neutral-100 bg-neutral-50/70">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Project' : 'Add New Project'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update project details' : 'Create a new portfolio project'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Category *</Label>
                  {isCreatingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCategory(false)
                        setNewCategoryName('')
                        setFormData({ ...formData, category: availableCategories[0]?.value || 'xr' })
                      }}
                      className="text-xs text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                    >
                      Cancel custom category
                    </button>
                  )}
                </div>

                {!isCreatingCategory ? (
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setIsCreatingCategory(true)
                        setNewCategoryName('')
                      } else {
                        setFormData({ ...formData, category: e.target.value })
                      }
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm cursor-pointer"
                  >
                    <optgroup label="Existing Categories">
                      {availableCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </optgroup>
                    <option value="__new__" className="font-semibold text-primary">
                      + Create new category...
                    </option>
                  </select>
                ) : (
                  <div className="space-y-1.5">
                    <Input
                      id="new-category"
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value)
                        setFormData({ ...formData, category: e.target.value })
                      }}
                      placeholder="e.g. AI Tools, Web Apps, 3D Art"
                      className="w-full"
                      autoFocus
                    />
                    <p className="text-[11px] text-muted-foreground">
                      This category will be saved and will immediately appear in your portfolio filters.
                    </p>
                  </div>
                )}
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

            <div className="space-y-2">
              <Label htmlFor="project-tag">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Button key={tag} type="button" variant="secondary" size="sm"
                    className="max-w-full gap-1" aria-label={`Remove tag ${tag}`}
                    onClick={() => setFormData((current) => ({ ...current, tags: current.tags.filter((value) => value !== tag) }))}>
                    <span className="truncate">{tag}</span><X className="h-3 w-3 shrink-0" />
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input id="project-tag" value={tagInput} placeholder="Create or search tags…"
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                      event.preventDefault()
                      addTag()
                    }
                  }} />
                <Button type="button" variant="outline" disabled={!tagInput.trim()} onClick={() => addTag()}>Add tag</Button>
              </div>
              <p className="text-xs text-muted-foreground">Press Enter to create a tag, or select an existing tag below.</p>
              <div className="flex flex-wrap gap-2">
                {availableTags.filter((tag) =>
                  tag.toLowerCase().includes(tagInput.trim().toLowerCase()) &&
                  !formData.tags.some((selected) => selected.toLowerCase() === tag.toLowerCase())
                ).slice(0, 12).map((tag) => (
                  <Button key={tag} type="button" variant="outline" size="sm" className="max-w-full gap-1"
                    onClick={() => addTag(tag)}>
                    <Plus className="h-3 w-3 shrink-0" /><span className="truncate">{tag}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <FileUploadOrUrl
                  label="Featured Image"
                  value={formData.image}
                  onChange={(url) => setFormData((current) => ({ ...current, image: url }))}
                  folder="projects"
                  accept="image/*"
                  maxSizeMB={25}
                  placeholder="https://example.com/featured.jpg"
                  description="Upload featured image to Cloudflare R2 or paste URL"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label>Project action</Label>
                <ToggleGroup type="single" variant="outline" value={formData.action_type}
                  aria-label="Project action"
                  onValueChange={(value) => {
                    if (value === 'download' || value === 'website') {
                      setFormData((current) => ({ ...current, action_type: value }))
                    }
                  }}>
                  <ToggleGroupItem value="download" className="gap-2"><Download className="h-4 w-4" />Download</ToggleGroupItem>
                  <ToggleGroupItem value="website" className="gap-2"><ExternalLink className="h-4 w-4" />Website</ToggleGroupItem>
                </ToggleGroup>
                {formData.action_type === 'website' ? (
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input id="website_url" type="url" value={formData.website_url}
                      onChange={(event) => setFormData({ ...formData, website_url: event.target.value })}
                      placeholder="https://example.com" />
                    <p className="text-xs text-muted-foreground">Optional. Shows “Visit Website” and opens in a new tab.</p>
                  </div>
                ) : (
                  <FileUploadOrUrl
                    label="Build File / Download Link"
                    value={formData.download_url}
                    onChange={(url) => setFormData((current) => ({ ...current, download_url: url }))}
                    folder="builds"
                    accept=".zip,.rar,.7z,.tar,.gz,.apk,.exe,.dmg,.pkg,application/zip,application/x-zip-compressed,application/octet-stream"
                    maxSizeMB={1000}
                    placeholder="https://itch.io/..., https://example.com/game.zip"
                    description="Direct upload to Cloudflare R2 (up to 1GB) or paste external link"
                  />
                )}
                <p className="text-xs text-muted-foreground">Both links are remembered. Only the selected action appears; leave its link empty to hide the button.</p>
              </div>
            </div>

            {/* Screenshots Section */}
            <div className="space-y-4 border rounded-lg p-4 bg-secondary/10">
              <h4 className="font-semibold">Project Screenshots</h4>

              <div className="space-y-3">
                <div className="space-y-2">
                  <FileUploadOrUrl
                    label="Screenshot"
                    value={screenshotInput}
                    onChange={(url) => setScreenshotInput(url)}
                    folder="projects"
                    accept="image/*"
                    maxSizeMB={25}
                    placeholder="https://example.com/screenshot.jpg"
                    description="Upload screenshot to Cloudflare R2 or paste URL"
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
          <Card key={project.id} className="p-4 sm:p-5 border border-neutral-200/90 shadow-xs hover:border-neutral-300 transition-all bg-white">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg text-neutral-900 break-words">{project.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1 line-clamp-2 break-words leading-relaxed">
                  {project.description.replace(/<[^>]*>/g, '')}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                  <span className="text-[11px] sm:text-xs bg-neutral-100 text-neutral-700 font-medium px-2 py-0.5 sm:py-1 rounded border border-neutral-200/80">
                    {availableCategories.find((c) => c.value.toLowerCase() === project.category?.toLowerCase())?.label || project.category}
                  </span>
                  {project.platform && (
                    <span className="text-[11px] sm:text-xs bg-neutral-100 text-neutral-700 font-medium px-2 py-0.5 sm:py-1 rounded border border-neutral-200/80">
                      {project.platform}
                    </span>
                  )}
                  {(project.tags || []).map((tag) => (
                    <span key={tag} className="text-[11px] sm:text-xs bg-red-50 text-red-700 px-2 py-1 rounded break-words">{tag}</span>
                  ))}
                  {project.video_url && (
                    <span className="text-[11px] sm:text-xs bg-red-50 text-red-700 font-medium px-2 py-0.5 sm:py-1 rounded border border-red-200/80 flex items-center gap-1">
                      <Film className="w-3 h-3 text-red-600" />
                      Video
                    </span>
                  )}
                  {(project.action_type === 'website' ? project.website_url : project.download_url) && (
                    <span className="text-[11px] sm:text-xs bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 sm:py-1 rounded border border-emerald-200/80 flex items-center gap-1">
                      {project.action_type === 'website' ? <ExternalLink className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                      {project.action_type === 'website' ? 'Website' : 'Download'}
                    </span>
                  )}
                  {project.screenshots && project.screenshots.length > 0 && (
                    <span className="text-[11px] sm:text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 sm:py-1 rounded border border-blue-200/80">
                      {project.screenshots.length} screenshots
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto sm:flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(project)}
                  className="gap-1.5 sm:gap-2 flex-1 sm:flex-initial text-xs sm:text-sm font-medium border-neutral-300 text-neutral-800 hover:bg-neutral-100"
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(project.id)}
                  className="gap-1.5 sm:gap-2 flex-1 sm:flex-initial text-xs sm:text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
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
