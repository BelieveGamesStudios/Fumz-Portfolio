'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectsManager } from './projects-manager'
import { AboutEditor } from './about-editor'
import { ContactSubmissions } from './contact-submissions'
import { SkillsEditor } from './skills-editor'
import { CertificationsManager } from './certifications-manager'
import { ExperiencesManager } from './experiences-manager'
import { LinksManager } from './links-manager'

export function AdminDashboard() {
  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your portfolio content, projects, and contact submissions
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Back to Homepage
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto gap-1.5 p-1.5 bg-neutral-100 border border-neutral-200/90 rounded-xl shadow-xs">
            <TabsTrigger
              value="projects"
              className="text-neutral-700 hover:text-neutral-900 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm px-2 py-2.5 h-10 w-full cursor-pointer rounded-lg transition-all"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="experiences"
              className="text-neutral-700 hover:text-neutral-900 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm px-2 py-2.5 h-10 w-full cursor-pointer rounded-lg transition-all"
            >
              XP
            </TabsTrigger>
            <TabsTrigger
              value="skills"
              className="text-neutral-700 hover:text-neutral-900 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm px-2 py-2.5 h-10 w-full cursor-pointer rounded-lg transition-all"
            >
              Skills
            </TabsTrigger>
            <TabsTrigger
              value="certs"
              className="text-neutral-700 hover:text-neutral-900 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm px-2 py-2.5 h-10 w-full cursor-pointer rounded-lg transition-all"
            >
              Certs
            </TabsTrigger>
            <TabsTrigger
              value="links"
              className="text-neutral-700 hover:text-neutral-900 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm px-2 py-2.5 h-10 w-full cursor-pointer rounded-lg transition-all"
            >
              Links
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="text-neutral-700 hover:text-neutral-900 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm px-2 py-2.5 h-10 w-full cursor-pointer rounded-lg transition-all"
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="text-neutral-700 hover:text-neutral-900 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm font-semibold text-xs sm:text-sm px-2 py-2.5 h-10 w-full cursor-pointer rounded-lg transition-all"
            >
              Contacts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <ProjectsManager />
          </TabsContent>

          <TabsContent value="experiences" className="space-y-4">
            <ExperiencesManager />
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <SkillsEditor />
          </TabsContent>

          <TabsContent value="certs" className="space-y-4">
            <CertificationsManager />
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <LinksManager />
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <AboutEditor />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <ContactSubmissions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
