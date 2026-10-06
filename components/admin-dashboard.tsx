'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Map, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectsManager } from './projects-manager'
import { AboutEditor } from './about-editor'
import { ContactSubmissions } from './contact-submissions'
import { SkillsEditor } from './skills-editor'
import { CertificationsManager } from './certifications-manager'
import { ExperiencesManager } from './experiences-manager'
import { MapEditor } from './map-editor/MapEditor'

export function AdminDashboard() {
  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your portfolio content, projects, city map 3D layout, and traffic
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/map">
              <Button className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-md">
                <Map className="w-4 h-4" />
                Open 3D Map Editor
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="gap-2 cursor-pointer">
                <Home className="w-4 h-4" />
                Back to Homepage
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto gap-1.5 p-1.5">
            <TabsTrigger value="projects" className="text-white text-xs sm:text-sm px-2 py-2 h-10 w-full cursor-pointer">Projects</TabsTrigger>
            <TabsTrigger value="experiences" className="text-white text-xs sm:text-sm px-2 py-2 h-10 w-full cursor-pointer">XP</TabsTrigger>
            <TabsTrigger value="skills" className="text-white text-xs sm:text-sm px-2 py-2 h-10 w-full cursor-pointer">Skills</TabsTrigger>
            <TabsTrigger value="certs" className="text-white text-xs sm:text-sm px-2 py-2 h-10 w-full cursor-pointer">Certs</TabsTrigger>
            <TabsTrigger value="about" className="text-white text-xs sm:text-sm px-2 py-2 h-10 w-full cursor-pointer">About</TabsTrigger>
            <TabsTrigger value="contacts" className="text-white text-xs sm:text-sm px-2 py-2 h-10 w-full cursor-pointer">Contacts</TabsTrigger>
            <TabsTrigger value="map" className="text-white text-xs sm:text-sm px-2 py-2 h-10 w-full cursor-pointer">Map Editor</TabsTrigger>
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

          <TabsContent value="about" className="space-y-4">
            <AboutEditor />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <ContactSubmissions />
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-border shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Map className="w-5 h-5 text-cyan-400" />
                    City 3D Map & Traffic Editor
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                    Import custom .glb building models, drag & drop transforms in 3D, and customize road traffic waypoints with live vehicle test drive.
                  </p>
                </div>
                <Link href="/admin/map">
                  <Button className="bg-cyan-600 hover:bg-cyan-500 text-white gap-2 shadow-lg cursor-pointer">
                    <Maximize2 className="w-4 h-4" />
                    <span>Launch Full View Editor (/admin/map)</span>
                  </Button>
                </Link>
              </div>
            </Card>
            <MapEditor fullScreen={false} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
