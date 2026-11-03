'use client'

import { useState, useEffect } from 'react'
import { getExperiences, addExperience, updateExperience, deleteExperience } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Trash2, Edit2, Plus, Briefcase, Calendar, MapPin } from 'lucide-react'
import { FileUploadOrUrl } from '@/components/ui/file-upload-or-url'
import { RichTextEditor } from '@/components/rich-text-editor'

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
            setExperiences(data)
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
        if (!formData.company.trim() || !formData.role.trim() || !formData.start_date) {
            toast({
                title: 'Error',
                description: 'Company, Role, and Start Date are required',
                variant: 'destructive',
            })
            return
        }

        try {
            setLoading(true)

            if (editingId) {
                await updateExperience(editingId, {
                    company: formData.company,
                    role: formData.role,
                    location: formData.location || undefined,
                    start_date: formData.start_date,
                    end_date: formData.current ? undefined : (formData.end_date || undefined),
                    current: formData.current,
                    description: formData.description || undefined,
                    company_logo: formData.company_logo || undefined,
                })
                toast({
                    title: 'Success',
                    description: 'Experience updated successfully',
                })
            } else {
                await addExperience({
                    company: formData.company,
                    role: formData.role,
                    location: formData.location || undefined,
                    start_date: formData.start_date,
                    end_date: formData.current ? undefined : (formData.end_date || undefined),
                    current: formData.current,
                    description: formData.description || undefined,
                    company_logo: formData.company_logo || undefined,
                })
                toast({
                    title: 'Success',
                    description: 'Experience added successfully',
                })
            }

            resetForm()
            setIsOpen(false)
            await loadExperiences()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to save experience',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this experience?')) return

        try {
            await deleteExperience(id)
            toast({
                title: 'Success',
                description: 'Experience deleted successfully',
            })
            await loadExperiences()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete experience',
                variant: 'destructive',
            })
        }
    }

    function handleEdit(experience: Experience) {
        setEditingId(experience.id)
        setFormData({
            company: experience.company,
            role: experience.role,
            location: experience.location || '',
            start_date: experience.start_date,
            end_date: experience.end_date || '',
            current: experience.current,
            description: experience.description || '',
            company_logo: experience.company_logo || '',
        })
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

                <DialogContent className="w-[95vw] sm:w-[90vw] max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl bg-white border border-neutral-200 shadow-2xl">
                    {/* Dialog Header */}
                    <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-neutral-100 bg-neutral-50/70 shrink-0">
                        <DialogTitle className="text-lg sm:text-xl font-bold text-neutral-900">
                            {editingId ? 'Edit Experience' : 'Add New Experience'}
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm text-neutral-500">
                            {editingId ? 'Update your role details, achievements, and company branding' : 'Add a new career milestone to your timeline'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Scrollable Form Body */}
                    <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 min-w-0">
                        {/* Company & Role */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 min-w-0">
                                <Label htmlFor="company" className="text-xs font-bold text-neutral-800">
                                    Company *
                                </Label>
                                <Input
                                    id="company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="e.g. Imisi 3D, Google"
                                    className="h-10 text-xs sm:text-sm"
                                />
                            </div>

                            <div className="space-y-1.5 min-w-0">
                                <Label htmlFor="role" className="text-xs font-bold text-neutral-800">
                                    Role *
                                </Label>
                                <Input
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="e.g. XR Developer, Unity Specialist"
                                    className="h-10 text-xs sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5 min-w-0">
                            <Label htmlFor="location" className="text-xs font-bold text-neutral-800">
                                Location
                            </Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g. Lagos, Nigeria • Remote"
                                className="h-10 text-xs sm:text-sm"
                            />
                        </div>

                        {/* Dates & Current Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5 min-w-0">
                                <Label htmlFor="start_date" className="text-xs font-bold text-neutral-800">
                                    Start Date *
                                </Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="h-10 text-xs sm:text-sm"
                                />
                            </div>

                            <div className="space-y-1.5 min-w-0">
                                <Label htmlFor="end_date" className="text-xs font-bold text-neutral-800">
                                    End Date
                                </Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    disabled={formData.current}
                                    className="h-10 text-xs sm:text-sm"
                                />
                                <div className="flex items-center space-x-2 pt-1.5">
                                    <Checkbox
                                        id="current"
                                        checked={formData.current}
                                        onCheckedChange={(checked: boolean) =>
                                            setFormData({ ...formData, current: checked, end_date: checked ? '' : formData.end_date })
                                        }
                                    />
                                    <Label htmlFor="current" className="text-xs font-medium text-neutral-600 cursor-pointer">
                                        I currently work here
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Company Logo Upload (Dual Mode) */}
                        <FileUploadOrUrl
                            label="Company Logo"
                            value={formData.company_logo}
                            onChange={(url) => setFormData({ ...formData, company_logo: url })}
                            folder="uploads"
                            accept="image/*"
                            maxSizeMB={15}
                            placeholder="https://example.com/logo.png"
                            description="Direct upload to Cloudflare R2 or paste an external URL"
                        />

                        {/* Rich Text Description */}
                        <div className="space-y-1.5 min-w-0">
                            <Label htmlFor="description" className="text-xs font-bold text-neutral-800">
                                Description & Key Accomplishments
                            </Label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(html) => setFormData({ ...formData, description: html })}
                                placeholder="Describe your responsibilities, key achievements, technologies used..."
                            />
                        </div>
                    </div>

                    {/* Dialog Footer Actions */}
                    <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50/70 flex items-center justify-end gap-2.5 sm:gap-3 shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="h-9 sm:h-10 text-xs sm:text-sm font-semibold px-4"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            className="h-9 sm:h-10 text-xs sm:text-sm font-bold bg-[#E31B23] hover:bg-[#c9151c] text-white px-5 rounded-xl shadow-xs transition-colors"
                        >
                            {editingId ? 'Update Experience' : 'Save Experience'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Existing Experiences List */}
            <div className="grid gap-4">
                {experiences.map((exp) => (
                    <Card key={exp.id} className="p-4 sm:p-5 border border-neutral-200/90 shadow-xs hover:border-neutral-300 transition-all bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center shrink-0 border border-neutral-200 p-1">
                                    {exp.company_logo ? (
                                        <img src={exp.company_logo} alt={exp.company} className="w-full h-full object-contain rounded-lg" />
                                    ) : (
                                        <Briefcase className="w-5 h-5 text-neutral-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-base sm:text-lg text-neutral-900">{exp.role}</h3>
                                    <div className="text-neutral-600 font-semibold text-xs sm:text-sm">{exp.company}</div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1.5">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                            <span>
                                                {formatDate(exp.start_date)} - {exp.current ? 'Present' : formatDate(exp.end_date!)}
                                            </span>
                                        </div>
                                        {exp.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-[#E31B23]" />
                                                <span>{exp.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description Preview */}
                                    {exp.description && (
                                        <div
                                            className="rich-text-rendered text-xs text-neutral-600 mt-3 pt-2.5 border-t border-neutral-100 line-clamp-3 prose prose-neutral max-w-none"
                                            dangerouslySetInnerHTML={{ __html: exp.description }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(exp)}
                                    className="gap-1.5 font-semibold text-xs border-neutral-300 text-neutral-800 hover:bg-neutral-100 h-8"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(exp.id)}
                                    className="gap-1.5 font-semibold text-xs bg-red-600 hover:bg-red-700 text-white h-8"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
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
