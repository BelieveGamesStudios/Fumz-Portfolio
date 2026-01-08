'use client'

import { useState, useEffect } from 'react'
import { getContactSubmissions, markContactAsRead, archiveContact, deleteContact } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Trash2, Archive, Mail, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

interface ContactSubmission {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  read: boolean
  archived: boolean
  created_at: string
}

export function ContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')
  const { toast } = useToast()

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function loadSubmissions() {
    try {
      setLoading(true)
      const data = await getContactSubmissions()
      setSubmissions(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load contact submissions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await markContactAsRead(id)
      toast({ title: 'Success', description: 'Marked as read' })
      await loadSubmissions()
      setSelectedSubmission(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update submission',
        variant: 'destructive',
      })
    }
  }

  async function handleArchive(id: string) {
    try {
      await archiveContact(id)
      toast({ title: 'Success', description: 'Submission archived' })
      await loadSubmissions()
      setSelectedSubmission(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive submission',
        variant: 'destructive',
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this submission?')) return

    try {
      await deleteContact(id)
      toast({ title: 'Success', description: 'Submission deleted' })
      await loadSubmissions()
      setSelectedSubmission(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete submission',
        variant: 'destructive',
      })
    }
  }

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === 'unread') return !sub.read
    if (filter === 'archived') return sub.archived
    return !sub.archived
  })

  if (loading) return <div>Loading submissions...</div>

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({submissions.filter((s) => !s.archived).length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
          size="sm"
        >
          Unread ({submissions.filter((s) => !s.read && !s.archived).length})
        </Button>
        <Button
          variant={filter === 'archived' ? 'default' : 'outline'}
          onClick={() => setFilter('archived')}
          size="sm"
        >
          Archived ({submissions.filter((s) => s.archived).length})
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredSubmissions.map((submission) => (
          <Card
            key={submission.id}
            className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setSelectedSubmission(submission)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{submission.name}</h3>
                  {!submission.read && (
                    <Badge variant="default" className="flex-shrink-0">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{submission.email}</p>
                {submission.subject && <p className="text-sm font-medium mt-1">{submission.subject}</p>}
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{submission.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(submission.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!submission.read && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkAsRead(submission.id)
                    }}
                    className="gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleArchive(submission.id)
                  }}
                  className="gap-1"
                >
                  <Archive className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(submission.id)
                  }}
                  className="gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredSubmissions.length === 0 && !loading && (
        <Card className="p-8 text-center text-muted-foreground">
          No submissions found in this category
        </Card>
      )}

      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contact Submission</DialogTitle>
              <DialogDescription>From {selectedSubmission.name}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-secondary/20 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">{selectedSubmission.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${selectedSubmission.email}`} className="font-medium text-primary hover:underline">
                    {selectedSubmission.email}
                  </a>
                </div>
                {selectedSubmission.subject && (
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-medium">{selectedSubmission.subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-sm">{format(new Date(selectedSubmission.created_at), 'PPpp')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <div className="bg-secondary/10 rounded-lg p-4 whitespace-pre-wrap text-sm border border-border">
                  {selectedSubmission.message}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                {!selectedSubmission.read && (
                  <Button onClick={() => handleMarkAsRead(selectedSubmission.id)} variant="outline" className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Read
                  </Button>
                )}
                <Button onClick={() => handleArchive(selectedSubmission.id)} variant="outline" className="gap-2">
                  <Archive className="w-4 h-4" />
                  Archive
                </Button>
                <Button
                  onClick={() => handleDelete(selectedSubmission.id)}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
