'use client'

import { useState, useEffect } from 'react'
import { getSocialLinks, updateSocialLinks } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Github, Linkedin, Instagram, ExternalLink, CheckCircle2, EyeOff, Loader2 } from 'lucide-react'

// Modern X (Twitter) Icon
function XIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const PLATFORMS = [
  {
    key: 'x',
    name: '𝕏 (Twitter)',
    placeholder: 'https://x.com/yourusername',
    icon: XIcon,
    description: 'Displays 𝕏 icon in header and footer',
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/yourprofile',
    icon: Linkedin,
    description: 'Displays LinkedIn icon in header and footer',
  },
  {
    key: 'github',
    name: 'GitHub',
    placeholder: 'https://github.com/yourusername',
    icon: Github,
    description: 'Displays GitHub icon in header and footer',
  },
  {
    key: 'instagram',
    name: 'Instagram',
    placeholder: 'https://instagram.com/yourprofile',
    icon: Instagram,
    description: 'Displays Instagram icon in header and footer',
  },
]

export function LinksManager() {
  const [links, setLinks] = useState<Record<string, string>>({
    x: '',
    linkedin: '',
    github: '',
    instagram: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadLinks()
  }, [])

  async function loadLinks() {
    try {
      setLoading(true)
      const data = await getSocialLinks()
      setLinks({
        x: data.x || '',
        linkedin: data.linkedin || '',
        github: data.github || '',
        instagram: data.instagram || '',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load social links',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      await updateSocialLinks(links)
      toast({
        title: 'Success',
        description: 'Social links updated successfully! Changes are live across the portfolio.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save social links',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const activeCount = Object.values(links).filter((url) => url.trim().length > 0).length

  if (loading) {
    return (
      <Card className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#E31B23]" />
        <span>Loading social links...</span>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white border border-neutral-200/90 shadow-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Social & Portfolio Links</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Provide direct profile links. Buttons will dynamically appear on your header and footer only when a URL is present.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold shrink-0 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>{activeCount} of 4 Active</span>
          </div>
        </div>

        {/* Platform Input Slots */}
        <div className="space-y-5 pt-6">
          {PLATFORMS.map((platform) => {
            const IconComponent = platform.icon
            const urlValue = links[platform.key] || ''
            const hasValue = urlValue.trim().length > 0

            return (
              <div
                key={platform.key}
                className={`p-4 rounded-xl border transition-all ${
                  hasValue
                    ? 'border-neutral-200 bg-neutral-50/50 shadow-2xs'
                    : 'border-neutral-200/60 bg-white opacity-85'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        hasValue
                          ? 'bg-[#E31B23] text-white'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <Label htmlFor={`link-${platform.key}`} className="font-bold text-sm text-neutral-900">
                        {platform.name}
                      </Label>
                      <span className="block text-[11px] text-neutral-400 font-medium">
                        {platform.description}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator Pill */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {hasValue ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200/80 text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        <span>Visible on Portfolio</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-400 text-[11px] font-medium">
                        <EyeOff className="w-3 h-3" />
                        <span>Hidden (No URL)</span>
                      </span>
                    )}

                    {hasValue && (
                      <a
                        href={urlValue}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#E31B23] hover:underline px-1 py-0.5"
                      >
                        <span>Test</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <Input
                    id={`link-${platform.key}`}
                    type="url"
                    value={urlValue}
                    onChange={(e) =>
                      setLinks((prev) => ({
                        ...prev,
                        [platform.key]: e.target.value,
                      }))
                    }
                    placeholder={platform.placeholder}
                    className="h-10 text-xs sm:text-sm bg-white border-neutral-300 focus-visible:ring-neutral-900"
                  />
                  {hasValue && (
                    <button
                      type="button"
                      onClick={() =>
                        setLinks((prev) => ({
                          ...prev,
                          [platform.key]: '',
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 hover:text-red-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-100">
          <Button
            type="button"
            variant="outline"
            onClick={loadLinks}
            disabled={saving}
            className="text-xs sm:text-sm"
          >
            Reset
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#E31B23] hover:bg-[#c9151c] text-white font-bold text-xs sm:text-sm px-6 h-10 rounded-xl shadow-xs transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Saving Links...</span>
              </>
            ) : (
              'Save Links'
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}

