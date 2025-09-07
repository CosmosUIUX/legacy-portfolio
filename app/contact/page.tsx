"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { motion } from "@/lib/motion";
import { Reveal } from "@/components/reveal";
import { EnhancedContactForm } from "@/components/enhanced-contact-form";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+1 (555) 123-4567", "+1 (555) 987-6543"],
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@legacyinteriors.com", "projects@legacyinteriors.com"],
    },
    {
      icon: MapPin,
      title: "Address",
      details: ["123 Design Street", "Creative District, CD 12345"],
    },
    {
      icon: Clock,
      title: "Hours",
      details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"],
    },
  ];

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container-custom">
          <Reveal>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl lg:text-7xl font-bold text-neutral-900 mb-6">
                Get In <span className="italic font-light">Touch</span>
              </h1>
              <p className="text-xl text-neutral-600 leading-relaxed">
                Ready to start your next project? We&apos;d love to hear from
                you and discuss how we can bring your vision to life.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 lg:py-32">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Enhanced Contact Form */}
            <EnhancedContactForm />

            {/* Contact Information */}
            <Reveal delay={0.2}>
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-neutral-900 mb-6">
                    Contact Information
                  </h2>
                  <p className="text-lg text-neutral-600 leading-relaxed mb-8">
                    We&apos;re here to help bring your vision to life. Reach out
                    to us through any of the following channels.
                  </p>
                </div>

                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={info.title}
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <info.icon size={20} className="text-neutral-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {info.title}
                        </h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-neutral-600">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Map Placeholder */}
                <div className="mt-8">
                  <div className="aspect-video bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-lg flex items-center justify-center">
                    <span className="text-neutral-500">Map Location</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
