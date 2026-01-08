"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Linkedin, Github, Twitter, Send } from "lucide-react"
import { submitContactForm } from "@/app/actions/admin"
import { useToast } from "@/components/ui/use-toast"

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
        title: "Success",
        description: "Your message has been sent successfully!",
      })
      setFormData({ name: "", email: "", subject: "", message: "" })
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitStatus("error")
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      })
      setTimeout(() => setSubmitStatus("idle"), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const socialLinks = [
    { icon: Mail, label: "Email", href: "mailto:hello@xrdev.com" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
    { icon: Github, label: "GitHub", href: "#" },
    { icon: Twitter, label: "Twitter", href: "#" },
  ]

  return (
    <section id="contact" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden">
      <div className="absolute top-20 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="space-y-4 mb-16 text-center" data-scroll-animate data-animation="slide-up">
          <h2 className="text-4xl sm:text-5xl font-bold">Let's Create Something Amazing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you have a game idea, need VR/AR expertise, or want to collaborate on an immersive project, I'd love
            to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8" data-scroll-animate data-animation="slide-left">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 glass rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 glass rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-foreground">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What's this about?"
                  className="w-full px-4 py-3 glass rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-foreground">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell me about your project..."
                  rows={6}
                  className="w-full px-4 py-3 glass rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Sending..." : submitStatus === "success" ? "Message Sent!" : "Send Message"}
              </button>

              {submitStatus === "error" && <p className="text-red-500 text-sm">Failed to send. Try again.</p>}
            </form>
          </div>

          <div className="space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Get In Touch</h3>
              <p className="text-muted-foreground">I'm always open to new opportunities and collaborations.</p>
            </div>

            <div className="space-y-4">
              {socialLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-3 p-4 glass rounded-lg hover:glass-sm transition-all"
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{link.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
