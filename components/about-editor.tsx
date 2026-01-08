'use client'

import { useState, useEffect } from 'react'
import { getAboutSection, updateAboutSection } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { RichTextEditor } from '@/components/rich-text-editor'

interface AboutData {
  id: string
  title: string
  content: string
  image_url?: string
}

export function AboutEditor() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
  })

  useEffect(() => {
    loadAboutSection()
  }, [])

  async function loadAboutSection() {
    try {
      setLoading(true)
      const data = await getAboutSection()
      setAboutData(data)
      if (data) {
        setFormData({
          title: data.title,
          content: data.content,
          image_url: data.image_url || '',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load about section',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!formData.title || !formData.content) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      await updateAboutSection({
        title: formData.title,
        content: formData.content,
        image_url: formData.image_url || undefined,
      })
      toast({
        title: 'Success',
        description: 'About section updated successfully',
      })
      await loadAboutSection()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save about section',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading about section...</div>

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Edit About Section</h2>
        <p className="text-sm text-muted-foreground">Update your about me content and image</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Section Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., About Me"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content *</Label>
          <RichTextEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Write your about me section content here..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Profile Image URL</Label>
          <Input
            id="image_url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://example.com/profile.jpg"
          />
          {formData.image_url && (
            <div className="mt-2">
              <img
                src={formData.image_url}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-border"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={loadAboutSection}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {aboutData && (
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-3">Preview</h3>
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-lg mb-2">{formData.title}</h4>
            <div className="text-sm prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formData.content }} />
          </div>
        </div>
      )}
    </Card>
  )
}
