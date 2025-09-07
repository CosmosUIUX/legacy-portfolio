"use client"
import { useMotion } from "@/lib/motion"
import { Instagram, Twitter, Facebook, ArrowUpRight } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Shop: [
      { name: "New Arrivals", href: "#" },
      { name: "Chairs", href: "#" },
      { name: "Tables", href: "#" },
      { name: "Storage", href: "#" },
      { name: "Lighting", href: "#" },
    ],
    Company: [
      { name: "About", href: "#" },
      { name: "Craftsmanship", href: "#" },
      { name: "Sustainability", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
    ],
    Support: [
      { name: "Contact", href: "#" },
      { name: "Size Guide", href: "#" },
      { name: "Care Instructions", href: "#" },
      { name: "Shipping", href: "#" },
      { name: "Returns", href: "#" },
    ],
  }

  const socialLinks = [
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "Facebook", icon: Facebook, href: "#" },
  ]

  return (
    <footer className="bg-white/[0.02] border-t border-white/[0.02]">
      <div className="container-custom py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-12">
          {/* Brand Section */}
          <BrandSection socialLinks={socialLinks} />

          {/* Links Sections */}
          <LinksSection footerLinks={footerLinks} />
        </div>

        {/* Bottom Section */}
        <BottomSection currentYear={currentYear} />
      </div>
    </footer>
  )
}

function BrandSection({ socialLinks }: { socialLinks: any[] }) {
  const { ref, animationProps, eventHandlers } = useMotion({
    trigger: 'viewport',
    duration: 600
  })

  return (
    <div className="lg:col-span-4">
      <div ref={ref as React.RefObject<HTMLDivElement>} {...eventHandlers}>
        <h3 className="text-2xl font-bold text-neutral-900 mb-4">LEGACY</h3>
        <p className="text-neutral-600 mb-6 leading-relaxed">
          Creating beautiful spaces through expert interior design and development services. Timeless design, exceptional craftsmanship, and personalized service.
        </p>
        <div className="flex space-x-4">
          {socialLinks.map((social) => (
            <SocialLink key={social.name} social={social} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SocialLink({ social }: { social: any }) {
  const { ref, eventHandlers } = useMotion({
    trigger: 'hover',
    duration: 200
  })

  return (
    <a
      ref={ref as React.RefObject<HTMLAnchorElement>}
      {...eventHandlers}
      href={social.href}
      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-200"
    >
      <social.icon size={18} />
      <span className="sr-only">{social.name}</span>
    </a>
  )
}

function LinksSection({ footerLinks }: { footerLinks: any }) {
  return (
    <div className="lg:col-span-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
        {Object.entries(footerLinks).map(([category, links], index) => (
          <LinkCategory key={category} category={category} links={links as any[]} index={index} />
        ))}
      </div>
    </div>
  )
}

function LinkCategory({ category, links, index }: { category: string; links: any[]; index: number }) {
  const { ref, eventHandlers } = useMotion({
    trigger: 'viewport',
    duration: 600,
    delay: index * 100
  })

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} {...eventHandlers}>
      <h4 className="font-semibold text-neutral-900 mb-4">{category}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 group flex items-center"
            >
              {link.name}
              <ArrowUpRight
                size={14}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BottomSection({ currentYear }: { currentYear: number }) {
  const { ref, eventHandlers } = useMotion({
    trigger: 'viewport',
    duration: 600,
    delay: 300
  })

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      {...eventHandlers}
      className="pt-8 pb-4 border-t border-neutral-200 flex justify-center items-center"
    >
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-neutral-500 text-center">
        <p>&copy; {currentYear} Legacy Interiors and Developers. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-neutral-700 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-neutral-700 transition-colors">
            Terms of Service
          </a>
          <a href="#" className="hover:text-neutral-700 transition-colors">
            Cookies
          </a>
        </div>
      </div>
    </div>
  )
}
