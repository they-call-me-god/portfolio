'use client'

import { usePostHog } from 'posthog-js/react'
import { PROJECTS } from '@/lib/content'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const SITE_VERSION = process.env.NEXT_PUBLIC_SITE_VERSION ?? 'iteration-0'

export function Projects() {
  const posthog = usePostHog()

  return (
    <section id="projects" className="py-32 px-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-12 text-zinc-100">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                posthog?.capture('project_card_clicked', {
                  project_name: project.name,
                  version: SITE_VERSION,
                })
              }
              className="group block"
            >
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors h-full">
                <CardHeader>
                  <CardTitle className="text-zinc-100 group-hover:text-white">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-zinc-700 text-zinc-400">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
