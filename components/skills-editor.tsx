'use client'

import { useEffect, useState } from 'react'
import { getSkillCategories, saveSkillCategories } from '@/app/actions/admin'
import { moveItem, validateSkillCategories, type SkillCategory, type SkillItem } from '@/lib/skills'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from 'lucide-react'

function OrderButtons({ name, index, total, onMove }: {
  name: string
  index: number
  total: number
  onMove: (direction: -1 | 1) => void
}) {
  return (
    <div className="flex gap-1">
      <Button type="button" variant="outline" size="icon" disabled={index === 0}
        aria-label={`Move ${name} up`} title="Move up" onClick={() => onMove(-1)}>
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button type="button" variant="outline" size="icon" disabled={index === total - 1}
        aria-label={`Move ${name} down`} title="Move down" onClick={() => onMove(1)}>
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function SkillsEditor() {
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [savedSnapshot, setSavedSnapshot] = useState('[]')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const dirty = JSON.stringify(categories) !== savedSnapshot

  async function loadCategories() {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await getSkillCategories()
      setCategories(data)
      setSavedSnapshot(JSON.stringify(data))
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load skills.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadCategories() }, [])

  useEffect(() => {
    if (!dirty) return
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [dirty])

  function updateCategory(id: string, update: Partial<SkillCategory>) {
    setCategories((current) => current.map((category) => category.id === id ? { ...category, ...update } : category))
  }

  function updateSkill(categoryId: string, skillId: string, update: Partial<SkillItem>) {
    setCategories((current) => current.map((category) => category.id === categoryId ? {
      ...category,
      skills: category.skills.map((skill) => skill.id === skillId ? { ...skill, ...update } : skill),
    } : category))
  }

  function addCategory() {
    const name = newCategoryName.trim()
    if (!name) return
    if (categories.some((category) => category.name.trim().toLowerCase() === name.toLowerCase())) {
      toast({ title: 'Category already exists', description: 'Choose a different category name.', variant: 'destructive' })
      return
    }
    setCategories((current) => [...current, { id: crypto.randomUUID(), name, skills: [] }])
    setNewCategoryName('')
  }

  async function saveChanges() {
    setSaving(true)
    try {
      const validated = validateSkillCategories(categories)
      const saved = await saveSkillCategories(validated)
      setCategories(saved)
      setSavedSnapshot(JSON.stringify(saved))
      toast({ title: 'Changes saved', description: 'Your skills section has been updated.' })
    } catch (error) {
      toast({ title: 'Unable to save changes', description: error instanceof Error ? error.message : 'Please try again. Your edits are still here.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p role="status">Loading skills…</p>
  if (loadError) return (
    <Card className="p-6 space-y-3">
      <p role="alert" className="text-sm text-destructive">{loadError}</p>
      <Button variant="outline" onClick={() => void loadCategories()}>Try again</Button>
    </Card>
  )

  return (
    <fieldset disabled={saving} className="space-y-5 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Technical Arsenal &amp; Capabilities</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage categories, skills, and percentages. Save to publish your changes.</p>
        </div>
        <Button type="button" onClick={() => void saveChanges()} disabled={!dirty || saving} className="gap-2 shrink-0">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      <Card className="p-4 space-y-2">
        <Label htmlFor="new-skill-category">New category</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input id="new-skill-category" placeholder="e.g., Web Development" value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault()
                addCategory()
              }
            }} />
          <Button type="button" variant="outline" className="gap-2" onClick={addCategory} disabled={!newCategoryName.trim()}>
            <Plus className="h-4 w-4" />Add category
          </Button>
        </div>
      </Card>

      <p role="status" className="text-sm text-muted-foreground">{dirty ? 'You have unsaved changes.' : 'No unsaved changes.'}</p>

      {categories.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">No categories. Add one above, then add skills to it.</Card>
      )}

      {categories.map((category, categoryIndex) => (
        <Card key={category.id} className="p-4 sm:p-6 space-y-5 border-neutral-200/90 bg-white">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 min-w-0 space-y-2">
              <Label htmlFor={`category-${category.id}`}>Category name</Label>
              <Input id={`category-${category.id}`} value={category.name} className="font-semibold"
                onChange={(event) => updateCategory(category.id, { name: event.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <OrderButtons name={`category ${category.name}`} index={categoryIndex} total={categories.length}
                onMove={(direction) => setCategories((current) => moveItem(current, categoryIndex, direction))} />
              <Button type="button" variant="outline" size="icon" className="text-destructive"
                aria-label={`Delete category ${category.name}`} title="Delete category"
                onClick={() => {
                  if (confirm(`Delete category “${category.name}” and its ${category.skills.length} skill(s)? This will be published when you save changes.`)) {
                    setCategories((current) => current.filter((item) => item.id !== category.id))
                  }
                }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="space-y-3">
            {category.skills.map((skill, skillIndex) => (
              <div key={skill.id} className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <Label htmlFor={`skill-${skill.id}`}>Skill name</Label>
                    <Input id={`skill-${skill.id}`} value={skill.skill_name} placeholder="e.g., TypeScript"
                      autoFocus={!skill.skill_name}
                      onChange={(event) => updateSkill(category.id, skill.id, { skill_name: event.target.value })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderButtons name={`skill ${skill.skill_name || 'Untitled'}`} index={skillIndex} total={category.skills.length}
                      onMove={(direction) => updateCategory(category.id, { skills: moveItem(category.skills, skillIndex, direction) })} />
                    <Button type="button" variant="outline" size="icon" className="text-destructive"
                      aria-label={`Delete skill ${skill.skill_name || 'Untitled'}`} title="Delete skill"
                      onClick={() => {
                        if (!skill.skill_name.trim() || confirm(`Delete skill “${skill.skill_name}”? This will be published when you save changes.`)) {
                          updateCategory(category.id, { skills: category.skills.filter((item) => item.id !== skill.id) })
                        }
                      }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <input type="range" min="0" max="100" step="1" value={skill.level}
                    aria-label={`${skill.skill_name || 'Untitled skill'} proficiency in ${category.name}`}
                    aria-valuetext={`${skill.level}%`}
                    onChange={(event) => updateSkill(category.id, skill.id, { level: Number(event.target.value) })}
                    className="flex-1 min-w-0 accent-[#E31B23] cursor-pointer" />
                  <span className="w-12 text-right font-semibold text-sm text-[#E31B23] tabular-nums">{skill.level}%</span>
                </div>
              </div>
            ))}
            {category.skills.length === 0 && <p className="text-sm text-muted-foreground">No skills yet. Empty categories stay hidden on your public page.</p>}
          </div>

          <Button type="button" variant="outline" className="gap-2"
            onClick={() => updateCategory(category.id, {
              skills: [...category.skills, { id: crypto.randomUUID(), skill_name: '', level: 50 }],
            })}><Plus className="h-4 w-4" />Add skill</Button>
        </Card>
      ))}

      {categories.length > 0 && (
        <div className="flex justify-end">
          <Button type="button" onClick={() => void saveChanges()} disabled={!dirty || saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      )}
    </fieldset>
  )
}
