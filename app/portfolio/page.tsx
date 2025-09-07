"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion } from "@/lib/motion"
import { Reveal } from "@/components/reveal"
import { ProjectShowcase } from "@/components/project-showcase"
import { useState } from "react"

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  
  const projects = [
    {
      id: 1,
      title: "Contemporary Staircase Design",
      category: "interior",
      image: "/contemporary-staircase.svg",
      description: "A stunning contemporary staircase featuring floating wood steps and elegant pendant lighting.",
      longDescription: "This breathtaking contemporary staircase design exemplifies modern elegance with its floating wood steps, sleek black metal railings, and cascading pendant lights. The design creates a dramatic focal point while maintaining functionality and safety. The warm wood tones contrast beautifully with the crisp white walls and black metal accents, creating a sophisticated architectural statement that elevates the entire space.",
      client: "Private Residence",
      location: "Seattle, Washington", 
      year: "2024",
      teamSize: "6 professionals",
      duration: "8 weeks",
      services: ["Interior Design", "Custom Millwork", "Lighting Design", "Structural Engineering"],
      gallery: ["/contemporary-staircase.svg", "/contemporary-staircase.svg", "/contemporary-staircase.svg"],
      results: [
        "Created a stunning architectural focal point",
        "Improved natural light flow throughout the space",
        "Enhanced property value with premium design",
        "Achieved perfect balance of form and function"
      ]
    },
    {
      id: 2,
      title: "Corporate Office Redesign",
      category: "commercial",
      image: "/placeholder-project-2.jpg",
      description: "Transforming a traditional office into a modern collaborative workspace.",
      longDescription: "A complete transformation of a 15,000 sq ft corporate office space, reimagining how teams collaborate and work together. The design incorporates flexible workstations, quiet zones, and dynamic meeting spaces that can be reconfigured based on project needs. Biophilic design elements and natural materials create a calming environment that boosts productivity and employee wellbeing.",
      client: "TechFlow Solutions",
      location: "Seattle, Washington",
      year: "2023",
      teamSize: "12 professionals",
      duration: "8 months",
      services: ["Space Planning", "Interior Design", "Furniture Selection", "Technology Integration"],
      gallery: ["/placeholder-project-2.jpg", "/placeholder-project-2.jpg", "/placeholder-project-2.jpg"],
      results: [
        "Increased employee satisfaction by 45%",
        "Improved collaboration efficiency by 35%",
        "Reduced real estate footprint by 20%",
        "Enhanced brand image and client impressions"
      ]
    },
    {
      id: 3,
      title: "Luxury Apartment Interior",
      category: "interior",
      image: "/placeholder-project-3.jpg",
      description: "Sophisticated interior design for a high-end urban apartment.",
      longDescription: "This 2,200 sq ft penthouse apartment embodies urban sophistication with its carefully curated blend of contemporary and classic elements. Rich textures, custom millwork, and statement lighting create an atmosphere of refined luxury. The design maximizes the stunning city views while creating intimate spaces for both entertaining and quiet reflection.",
      client: "Private Residence",
      location: "Manhattan, New York",
      year: "2024",
      teamSize: "6 professionals",
      duration: "10 months",
      services: ["Interior Design", "Custom Furniture", "Art Curation", "Lighting Design"],
      gallery: ["/placeholder-project-3.jpg", "/placeholder-project-3.jpg", "/placeholder-project-3.jpg"],
      results: [
        "Created a timeless design that reflects client's personality",
        "Maximized natural light and city views",
        "Integrated smart home technology seamlessly",
        "Achieved perfect balance of luxury and comfort"
      ]
    },
    {
      id: 4,
      title: "Boutique Hotel Development",
      category: "commercial",
      image: "/placeholder-project-4.jpg",
      description: "Complete development of a boutique hotel with unique character.",
      longDescription: "A ground-up development of a 45-room boutique hotel that celebrates local culture and craftsmanship. Each space tells a story through carefully selected materials, custom artwork, and thoughtful design details. The hotel features a rooftop restaurant, spa facilities, and flexible event spaces that cater to both business and leisure travelers.",
      client: "Artisan Hospitality Group",
      location: "Charleston, South Carolina",
      year: "2023",
      teamSize: "20 professionals",
      duration: "24 months",
      services: ["Architecture", "Interior Design", "Branding", "Construction Management"],
      gallery: ["/placeholder-project-4.jpg", "/placeholder-project-4.jpg", "/placeholder-project-4.jpg"],
      results: [
        "Achieved 85% occupancy rate in first year",
        "Won 3 design awards for hospitality excellence",
        "Created 40 local jobs",
        "Became a landmark destination in the city"
      ]
    },
    {
      id: 5,
      title: "Family Home Renovation",
      category: "residential",
      image: "/placeholder-project-5.jpg",
      description: "Comprehensive renovation preserving character while adding modern amenities.",
      longDescription: "This 1920s colonial home received a thoughtful renovation that honors its historical character while introducing modern functionality. Original hardwood floors were restored, period details were preserved, and the layout was reconfigured to create better flow for contemporary family living. The addition of a modern kitchen and master suite seamlessly blends old and new.",
      client: "The Martinez Family",
      location: "Boston, Massachusetts",
      year: "2024",
      teamSize: "10 professionals",
      duration: "16 months",
      services: ["Renovation Design", "Historical Preservation", "Kitchen Design", "Landscape Design"],
      gallery: ["/placeholder-project-5.jpg", "/placeholder-project-5.jpg", "/placeholder-project-5.jpg"],
      results: [
        "Preserved 90% of original architectural details",
        "Improved energy efficiency by 50%",
        "Added 800 sq ft of functional living space",
        "Maintained neighborhood character and charm"
      ]
    },
    {
      id: 6,
      title: "Restaurant Interior Design",
      category: "interior",
      image: "/placeholder-project-6.jpg",
      description: "Creating an inviting atmosphere for a fine dining establishment.",
      longDescription: "This 4,500 sq ft restaurant design creates an immersive dining experience that complements the chef's innovative cuisine. Warm materials, dramatic lighting, and acoustic design work together to create intimate dining zones within the larger space. The open kitchen concept allows diners to witness the culinary artistry while maintaining the sophisticated ambiance.",
      client: "Harvest & Hearth Restaurant",
      location: "San Francisco, California",
      year: "2024",
      teamSize: "8 professionals",
      duration: "6 months",
      services: ["Interior Design", "Kitchen Design", "Lighting Design", "Acoustic Planning"],
      gallery: ["/placeholder-project-6.jpg", "/placeholder-project-6.jpg", "/placeholder-project-6.jpg"],
      results: [
        "Increased seating capacity by 25%",
        "Improved kitchen efficiency by 40%",
        "Enhanced customer experience and reviews",
        "Created Instagram-worthy dining spaces"
      ]
    }
  ]

  const filters = [
    { id: "all", label: "All Projects" },
    { id: "residential", label: "Residential" },
    { id: "commercial", label: "Commercial" },
    { id: "interior", label: "Interior Design" }
  ]

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container-custom">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl lg:text-7xl font-bold text-neutral-900 mb-6">
                Our <span className="italic font-light">Portfolio</span>
              </h1>
              <p className="text-xl text-neutral-600 leading-relaxed">
                Explore our collection of completed projects showcasing our expertise in design and development.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pb-20">
        <div className="container-custom">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "150+", label: "Projects Completed" },
                { number: "12", label: "Years Experience" },
                { number: "98%", label: "Client Satisfaction" },
                { number: "25+", label: "Awards Won" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-neutral-600 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="pb-12">
        <div className="container-custom">
          <Reveal>
            <div className="flex flex-wrap justify-center gap-4">
              {filters.map((filter) => (
                <motion.button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeFilter === filter.id
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {filter.label}
                </motion.button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="pb-20 lg:pb-32">
        <div className="container-custom">
          <ProjectShowcase projects={projects} activeFilter={activeFilter} />
        </div>
      </section>

      <Footer />
    </main>
  )
}