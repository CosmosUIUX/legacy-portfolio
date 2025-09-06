"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ExternalLink, Calendar, MapPin } from "lucide-react"
import { Reveal } from "./reveal"

interface Project {
  id: number
  title: string
  category: string
  image: string
  description: string
  longDescription: string
  client: string
  location: string
  year: string
  teamSize: string
  duration: string
  services: string[]
  gallery: string[]
  results: string[]
}

interface ProjectShowcaseProps {
  projects: Project[]
  activeFilter: string
}

export function ProjectShowcase({ projects, activeFilter }: ProjectShowcaseProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const filteredProjects = activeFilter === "all" 
    ? projects 
    : projects.filter(project => project.category === activeFilter)

  const openProject = (project: Project) => {
    setSelectedProject(project)
    setCurrentImageIndex(0)
  }

  const closeProject = () => {
    setSelectedProject(null)
    setCurrentImageIndex(0)
  }

  const nextImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProject.gallery.length)
    }
  }

  const prevImage = () => {
    if (selectedProject) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProject.gallery.length) % selectedProject.gallery.length)
    }
  }

  return (
    <>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        layout
      >
        <AnimatePresence>
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Reveal delay={index * 0.1}>
                <motion.div 
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 cursor-pointer group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => openProject(project)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                      <span className="text-neutral-500">Project Image</span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <motion.div
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <ExternalLink className="text-white" size={24} />
                      </motion.div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                        {project.category}
                      </span>
                      <span className="text-xs text-neutral-400">{project.year}</span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-neutral-700 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed text-sm mb-4">
                      {project.description}
                    </p>
                    <div className="flex items-center text-xs text-neutral-500 space-x-4">
                      <div className="flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {project.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {project.duration}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeProject} />
            
            <motion.div
              className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white rounded-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
                {/* Image Gallery */}
                <div className="lg:w-2/3 relative">
                  <div className="aspect-video lg:aspect-auto lg:h-full relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                      <span className="text-neutral-500 text-lg">Project Gallery</span>
                    </div>
                    
                    {/* Navigation Arrows */}
                    {selectedProject.gallery.length > 1 && (
                      <>
                        <button
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 z-10"
                          onClick={prevImage}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15,18 9,12 15,6"></polyline>
                          </svg>
                        </button>
                        <button
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-200 z-10"
                          onClick={nextImage}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9,18 15,12 9,6"></polyline>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Image Indicators */}
                  {selectedProject.gallery.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {selectedProject.gallery.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${
                            currentImageIndex === index ? "bg-white" : "bg-white/50"
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div className="lg:w-1/3 p-8 overflow-y-auto">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
                        {selectedProject.category}
                      </span>
                      <h2 className="text-3xl font-bold text-neutral-900 mt-1">
                        {selectedProject.title}
                      </h2>
                    </div>
                    <button
                      className="p-2 hover:bg-neutral-100 rounded-full transition-colors duration-200"
                      onClick={closeProject}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Project Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-neutral-900">Client</span>
                        <p className="text-neutral-600">{selectedProject.client}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-900">Year</span>
                        <p className="text-neutral-600">{selectedProject.year}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-900">Location</span>
                        <p className="text-neutral-600">{selectedProject.location}</p>
                      </div>
                      <div>
                        <span className="font-medium text-neutral-900">Duration</span>
                        <p className="text-neutral-600">{selectedProject.duration}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">About This Project</h4>
                      <p className="text-neutral-600 leading-relaxed">
                        {selectedProject.longDescription}
                      </p>
                    </div>

                    {/* Services */}
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-3">Services Provided</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.services.map((service) => (
                          <span
                            key={service}
                            className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Results */}
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-3">Key Results</h4>
                      <ul className="space-y-2">
                        {selectedProject.results.map((result, index) => (
                          <li key={index} className="flex items-start text-sm text-neutral-600">
                            <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            {result}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}