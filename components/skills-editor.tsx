'use client'

import { useState, useEffect, useRef } from 'react'
import { getSkills, updateSkillLevel, deleteSkill } from '@/app/actions/admin'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Trash2 } from 'lucide-react'

interface Skill {
  id: string
  skill_name: string
  level: number
  category: string
}

const DEFAULT_CATEGORIES = [
  'Game Development',
  'XR Development',
  'Platforms',
  'Tools',
]

const PREDEFINED_SKILLS: Record<string, string[]> = {
  'Game Development': [
    'Programming & Scripting',
    'Game Design Principles',
    'Asset Integration & Management',
    'Debugging & Testing',
  ],
  'XR Development': [
    'Unity XR SDKs & Tools',
    '3D Interaction & Input Handling',
    'Spatial Computing',
    'Performance & Latency Optimization',
  ],
  'Platforms': [
    'Windows/Mac/Linux',
    'iOS',
    'Android',
    'XR Headsets',
  ],
  'Tools': [
    'Unity Engine',
    'Blender',
    'GIMP',
    'Audacity',
  ],
}

export function SkillsEditor() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()
  const [isAuth, setIsAuth] = useState<boolean | null>(null)
  const [optimisticLevels, setOptimisticLevels] = useState<Record<string, number>>({})
  const debounceTimers = useRef<Record<string, number>>({})

  useEffect(() => {
    // Listen for auth state changes so the UI updates immediately after sign in/out
    let mounted = true
    let subscription: any

    try {
      const supabase = createClient()

      // Initial check
      supabase.auth.getUser().then(({ data }) => {
        if (!mounted) return
        setIsAuth(!!data.user)
      }).catch(() => {
        if (!mounted) return
        setIsAuth(false)
      })

      // Subscribe to auth changes
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return
        setIsAuth(!!session?.user)
      })

      subscription = data?.subscription
    } catch (err) {
      // If env is missing or client creation fails, surface via toast and set unauthenticated
      setIsAuth(false)
      toast({ title: 'Error', description: String((err as Error).message), variant: 'destructive' })
    }

    return () => {
      mounted = false
      if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    loadSkills()
  }, [isAuth])

  async function loadSkills() {
    try {
      setLoading(true)
      const data = await getSkills()
      setSkills(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load skills',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }





  async function handleDeleteSkill(skillName: string) {
    if (!confirm(`Delete skill "${skillName}"?`)) return

    try {
      await deleteSkill(skillName)
      toast({ title: 'Success', description: 'Skill deleted' })
      await loadSkills()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete skill',
        variant: 'destructive',
      })
    }
  }

  async function handleSetSkillLevel(skillName: string, category: string, newLevel: number) {
    try {
      // Optimistically update local state immediately
      const key = `${category}::${skillName}`
      setOptimisticLevels((prev) => ({ ...prev, [key]: newLevel }))

      // Call server action to update DB
      await updateSkillLevel(skillName, newLevel, category)
      
      // Reload skills from DB to sync
      await loadSkills()
      
      // Clear optimistic state once synced
      setOptimisticLevels((prev) => {
        const { [key]: _removed, ...rest } = prev
        return rest
      })
      
      toast({ title: 'Success', description: `${skillName} updated to ${newLevel}%` })
    } catch (error) {
      // On error, revert optimistic state and show error
      const key = `${category}::${skillName}`
      setOptimisticLevels((prev) => {
        const { [key]: _removed, ...rest } = prev
        return rest
      })
      
      toast({
        title: 'Error',
        description: 'Failed to update skill. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (loading) return <div>Loading skills...</div>

  // If not authenticated, show a small hint so users know they must sign in to edit
  const authNotice = isAuth === false ? (
    <Card className="p-4 mb-4">
      <p className="text-sm text-muted-foreground">You must be logged in as an admin to edit skill levels. Visit <a className="underline" href="/login">/login</a> to sign in.</p>
    </Card>
  ) : null

  const groupedSkills = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>
  )

  return (
    <div className="space-y-6">
      {/* Add New Skill */}


      {/* Skills by Category */}
      {DEFAULT_CATEGORIES.map((category) => {
        const categorySkills = groupedSkills[category] || []
        const predefined = PREDEFINED_SKILLS[category] || []
        return (
          <div key={category}>
            <h3 className="font-semibold text-lg mb-3">{category}</h3>
            <div className="grid gap-4">
              {predefined.length > 0 ? (
                predefined.map((skillName) => {
                  const skillObj = categorySkills.find((s) => s.skill_name === skillName)
                  const level = skillObj ? skillObj.level : 50

                  return (
                    <Card key={skillName} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{skillName}</p>
                          <div className="mt-2 flex items-center gap-4">
                            <div className="flex-1">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={optimisticLevels[`${category}::${skillName}`] ?? level}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value)
                                  // Immediately update local state for instant UI feedback
                                  setOptimisticLevels((prev) => ({ ...prev, [`${category}::${skillName}`]: val }))

                                  // Debounce the DB call
                                  const key = `${category}::${skillName}`
                                  if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key])
                                  debounceTimers.current[key] = window.setTimeout(() => {
                                    handleSetSkillLevel(skillName, category, val)
                                    delete debounceTimers.current[key]
                                  }, 500)
                                }}
                                className="w-full"
                                disabled={isAuth === false}
                                aria-disabled={isAuth === false}
                                title={isAuth === false ? 'Sign in to edit' : undefined}
                              />
                            </div>
                            <span className="text-sm font-semibold text-primary min-w-fit">{optimisticLevels[`${category}::${skillName}`] ?? level}%</span>
                          </div>
                        </div>

                        {skillObj ? (
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteSkill(skillName)} className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </Card>
                  )
                })
              ) : (
                <Card className="p-4 text-center text-muted-foreground">No skills in this category yet</Card>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
