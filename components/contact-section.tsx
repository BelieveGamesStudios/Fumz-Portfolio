"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Mail, Linkedin, Github, Instagram, Send, MessageSquare, ArrowUpRight } from "lucide-react"
import { submitContactForm } from "@/app/actions/admin"
import { useToast } from "@/components/ui/use-toast"

function XLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

export function ContactSection() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      await submitContactForm({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      })
      setSubmitStatus("success")
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. I'll get back to you shortly.",
      })
      setFormData({ name: "", email: "", subject: "", message: "" })
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitStatus("error")
      toast({
        title: "Submission Error",
        description: "Failed to send your message. Please try again or reach out via email.",
        variant: "destructive",
      })
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const [socialLinksMap, setSocialLinksMap] = useState<{
    github?: string
    linkedin?: string
    x?: string
    instagram?: string
  }>({
    github: "https://github.com/believegamesstudios",
    linkedin: "https://www.linkedin.com/in/believe-studios?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
  })

  useEffect(() => {
    fetch("/api/links")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (data && typeof data === "object") {
          setSocialLinksMap(data)
        }
      })
      .catch(() => {})
  }, [])

  const socialLinks: Array<{
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
    href: string
  }> = [
    {
      icon: Mail,
      label: "Direct Email",
      value: "afolabifunmilade229@gmail.com",
      href: "mailto:afolabifunmilade229@gmail.com",
    },
  ]

  if (socialLinksMap.x) {
    socialLinks.push({
      icon: XLogo,
      label: "𝕏 (Twitter)",
      value: socialLinksMap.x.replace(/^https?:\/\/(www\.)?(x\.com|twitter\.com)\//, "@"),
      href: socialLinksMap.x,
    })
  }

  if (socialLinksMap.linkedin) {
    socialLinks.push({
      icon: Linkedin,
      label: "LinkedIn Profile",
      value: "Believe Studios / Afolabi",
      href: socialLinksMap.linkedin,
    })
  }

  if (socialLinksMap.github) {
    socialLinks.push({
      icon: Github,
      label: "GitHub Repositories",
      value: "believegamesstudios",
      href: socialLinksMap.github,
    })
  }

  if (socialLinksMap.instagram) {
    socialLinks.push({
      icon: Instagram,
      label: "Instagram",
      value: socialLinksMap.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, ""),
      href: socialLinksMap.instagram,
    })
  }

  return (
    <section id="contact" className="relative w-full py-20 px-4 sm:px-8 lg:px-14 bg-white border-t border-neutral-200/80">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E31B23]" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Let's Connect
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight uppercase mb-4">
          Collaboration &amp; Inquiries
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mb-12">
          Available for contract development, XR experiences, Unity architecture, and creative collaborations.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="p-8 bg-[#FAFAFC] rounded-3xl border border-neutral-200/80 shadow-sm space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Project or Topic
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="VR Experience / Unity Consultation"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell me about your timeline, platform, and vision..."
                  className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-[#E31B23] hover:bg-[#c9151c] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Dispatching Message..." : submitStatus === "success" ? "Message Dispatched!" : "Dispatch Message"}
              </button>
            </form>
          </div>

          {/* Social / Direct Contacts */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {socialLinks.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-5 bg-[#FAFAFC] hover:bg-neutral-100 rounded-2xl border border-neutral-200/80 transition-all hover:border-[#E31B23]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-neutral-800 group-hover:text-[#E31B23] group-hover:scale-105 transition-all shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          {item.label}
                        </span>
                        <span className="text-sm font-bold text-neutral-900">
                          {item.value}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#E31B23] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                )
              })}
            </div>

            {/* Bottom Signature / Footer */}
            <div className="p-6 bg-neutral-900 text-white rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center p-1 shadow-sm">
                  <img
                    src="/apple-icon.png"
                    alt="App Logo"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div>
                  <span className="block text-xs font-black uppercase tracking-tight">Fumz Portfolio</span>
                  <span className="text-[10px] text-neutral-400">&copy; {new Date().getFullYear()} Believe Studios</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">v2.0 &bull; Editorial</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
