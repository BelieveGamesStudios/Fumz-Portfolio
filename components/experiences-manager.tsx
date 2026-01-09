'use client'

import { useState, useEffect } from 'react'
import { getExperiences, addExperience, updateExperience, deleteExperience } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Trash2, Edit2, Plus, Briefcase, Calendar, MapPin } from 'lucide-react'

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

export function ExperiencesManager() {
    const [experiences, setExperiences] = useState<Experience[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        company: '',
        role: '',
        location: '',
        start_date: '',
        end_date: '',
        current: false,
        description: '',
        company_logo: '',
    })

    useEffect(() => {
        loadExperiences()
    }, [])

    async function loadExperiences() {
        try {
            setLoading(true)
            const data = await getExperiences()
            setExperiences(data as Experience[])
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load experiences',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit() {
        if (!formData.company || !formData.role || !formData.start_date) {
            toast({
                title: 'Error',
                description: 'Please fill in all required fields (Company, Role, Start Date)',
                variant: 'destructive',
            })
            return
        }

        try {
            if (editingId) {
                await updateExperience(editingId, {
                    ...formData,
                    end_date: formData.current ? null : formData.end_date,
                })
                toast({ title: 'Success', description: 'Experience updated successfully' })
            } else {
                await addExperience({
                    ...formData,
                    end_date: formData.current ? null : formData.end_date,
                })
                toast({ title: 'Success', description: 'Experience added successfully' })
            }

            setIsOpen(false)
            resetForm()
            await loadExperiences()
        } catch (error) {
            console.error('Experience submission error:', error)
            toast({
                title: 'Error',
                description: 'Failed to save experience',
                variant: 'destructive',
            })
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this experience?')) return

        try {
            await deleteExperience(id)
            toast({ title: 'Success', description: 'Experience deleted successfully' })
            await loadExperiences()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete experience',
                variant: 'destructive',
            })
        }
    }

    function handleEdit(exp: Experience) {
        setFormData({
            company: exp.company,
            role: exp.role,
            location: exp.location || '',
            start_date: exp.start_date,
            end_date: exp.end_date || '',
            current: exp.current || false,
            description: exp.description || '',
            company_logo: exp.company_logo || '',
        })
        setEditingId(exp.id)
        setIsOpen(true)
    }

    function handleNew() {
        resetForm()
        setIsOpen(true)
    }

    function resetForm() {
        setFormData({
            company: '',
            role: '',
            location: '',
            start_date: '',
            end_date: '',
            current: false,
            description: '',
            company_logo: '',
        })
        setEditingId(null)
    }

    function formatDate(dateString: string) {
        if (!dateString) return ''
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }

    if (loading) return <div>Loading experiences...</div>

    return (
        <div className="space-y-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button onClick={handleNew} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add New Experience
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Experience' : 'Add New Experience'}</DialogTitle>
                        <DialogDescription>
                            {editingId ? 'Update your work history' : 'Add a new role to your timeline'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company">Company *</Label>
                                <Input
                                    id="company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="e.g. Google"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Input
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="e.g. Senior Developer"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g. San Francisco, CA (Remote)"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date *</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <div className="space-y-2">
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        disabled={formData.current}
                                    />
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="current"
                                            checked={formData.current}
                                            onCheckedChange={(checked: boolean) =>
                                                setFormData({ ...formData, current: checked, end_date: checked ? '' : formData.end_date })
                                            }
                                        />
                                        <Label htmlFor="current" className="text-sm font-normal cursor-pointer">
                                            I currently work here
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company_logo">Company Logo URL</Label>
                            <Input
                                id="company_logo"
                                value={formData.company_logo}
                                onChange={(e) => setFormData({ ...formData, company_logo: e.target.value })}
                                placeholder="https://example.com/logo.png"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe your responsibilities and achievements..."
                                className="h-32"
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Save'} Experience</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="grid gap-4">
                {experiences.map((exp) => (
                    <Card key={exp.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center flex-shrink-0 border">
                                    {exp.company_logo ? (
                                        <img src={exp.company_logo} alt={exp.company} className="w-full h-full object-cover" />
                                    ) : (
                                        <Briefcase className="w-6 h-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{exp.role}</h3>
                                    <div className="text-muted-foreground font-medium">{exp.company}</div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>
                                                {formatDate(exp.start_date)} - {exp.current ? 'Present' : formatDate(exp.end_date!)}
                                            </span>
                                        </div>
                                        {exp.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                <span>{exp.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(exp)}
                                    className="gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(exp.id)}
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

            {experiences.length === 0 && !loading && (
                <Card className="p-8 text-center text-muted-foreground">
                    No experience listed yet. Add your work history!
                </Card>
            )}
        </div>
    )
}
