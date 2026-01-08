'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectsManager } from './projects-manager'
import { AboutEditor } from './about-editor'
import { ContactSubmissions } from './contact-submissions'
import { SkillsEditor } from './skills-editor'
import { CertificationsManager } from './certifications-manager'

export function AdminDashboard() {
  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your portfolio content, projects, and contact submissions
          </p>
        </div>

        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="certs">Certifications</TabsTrigger>
            <TabsTrigger value="about">About Section</TabsTrigger>
            <TabsTrigger value="contacts">Contact Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <ProjectsManager />
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <SkillsEditor />
          </TabsContent>

          <TabsContent value="certs" className="space-y-4">
            <CertificationsManager />
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
