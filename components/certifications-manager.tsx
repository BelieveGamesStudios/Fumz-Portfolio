'use client'

import { useState, useEffect } from 'react'
import { getCertifications, addCertification, deleteCertification } from '@/app/actions/admin'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Trash2, Plus } from 'lucide-react'

interface Certification {
  id: string
  title: string
  issuer: string
  issued_date?: string
  credential_url?: string
}

export function CertificationsManager() {
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({ title: '', issuer: '', issued_date: '', file: null as File | null })

  useEffect(() => {
    loadCerts()
  }, [])

  async function loadCerts() {
    try {
      setLoading(true)
      const data = await getCertifications()
      setCerts(data)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load certifications', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleUploadAndAdd() {
    if (!form.title.trim() || !form.issuer.trim()) {
      toast({ title: 'Error', description: 'Title and Issuer are required', variant: 'destructive' })
      return
    }

    try {
      setLoading(true)
      let publicUrl: string | undefined

      if (form.file) {
        const supabase = createClient()
        const filePath = `certifications/${Date.now()}_${form.file.name}`
        const { error: uploadError } = await supabase.storage.from('certifications').upload(filePath, form.file, { upsert: true })
        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          throw new Error(`Storage upload failed: ${uploadError.message}`)
        }

        const { data: urlData } = supabase.storage.from('certifications').getPublicUrl(filePath)
        publicUrl = urlData.publicUrl
      }

      console.log('Adding certification:', { title: form.title, issuer: form.issuer, issued_date: form.issued_date, credential_url: publicUrl })
      
      await addCertification({
        title: form.title,
        issuer: form.issuer,
        issued_date: form.issued_date || undefined,
        credential_url: publicUrl,
      })

      console.log('Certification added successfully')
      toast({ title: 'Success', description: 'Certification added successfully!' })
      setForm({ title: '', issuer: '', issued_date: '', file: null })
      setIsOpen(false)
      await loadCerts()
    } catch (error: any) {
      console.error('Full error in handleUploadAndAdd:', error)
      const errorMessage = error.message || error.toString() || 'Failed to add certification'
      toast({ 
        title: 'Error', 
        description: errorMessage,
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this certification?')) return
    try {
      await deleteCertification(id)
      toast({ title: 'Success', description: 'Certification deleted' })
      await loadCerts()
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete certification', variant: 'destructive' })
    }
  }

  if (loading) return <div>Loading certifications...</div>

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Certification
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Certification</DialogTitle>
            <DialogDescription>Upload certificate image and metadata</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cert-title">Title</Label>
              <Input id="cert-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cert-issuer">Issuer</Label>
              <Input id="cert-issuer" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cert-date">Issued Date</Label>
              <Input id="cert-date" type="date" value={form.issued_date} onChange={(e) => setForm({ ...form, issued_date: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cert-file">Certificate Image</Label>
              <input id="cert-file" type="file" accept="image/*" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })} />
              <p className="text-sm text-muted-foreground">Images are uploaded to the Supabase storage bucket <code>certifications</code>. Create that bucket or configure it for public access if you want images to be visible to visitors.</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleUploadAndAdd}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certs.length > 0 ? (
          certs.map((c) => (
            <Card key={c.id} className="p-4 flex items-start gap-4">
              {c.credential_url ? (
                <img src={c.credential_url} alt={c.title} className="w-24 h-16 object-cover rounded-md" />
              ) : (
                <div className="w-24 h-16 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">No image</div>
              )}

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.issuer} • {c.issued_date ?? '—'}</p>
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-4 text-muted-foreground">No certifications yet</Card>
        )}
      </div>
    </div>
  )
}
