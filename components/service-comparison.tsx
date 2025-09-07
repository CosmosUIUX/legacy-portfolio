"use client";

import { useMotion } from "@/lib/motion/hooks";
import { motion } from "@/lib/motion";
import { Check, X } from "lucide-react";
import { Reveal } from "./reveal";

interface ServiceTier {
  name: string;
  description: string;
  price: string;
  features: {
    name: string;
    included: boolean;
  }[];
  popular?: boolean;
}

const serviceTiers: ServiceTier[] = [
  {
    name: "Consultation",
    description: "Perfect for getting expert advice and initial planning",
    price: "Starting at $500",
    features: [
      { name: "Initial consultation (2 hours)", included: true },
      { name: "Design concept presentation", included: true },
      { name: "Material recommendations", included: true },
      { name: "Budget estimation", included: true },
      { name: "3D visualizations", included: false },
      { name: "Project management", included: false },
      { name: "Construction oversight", included: false },
      { name: "Post-completion support", included: false },
    ],
  },
  {
    name: "Design Package",
    description:
      "Complete design solution with detailed plans and specifications",
    price: "Starting at $5,000",
    popular: true,
    features: [
      { name: "Initial consultation (2 hours)", included: true },
      { name: "Design concept presentation", included: true },
      { name: "Material recommendations", included: true },
      { name: "Budget estimation", included: true },
      { name: "3D visualizations", included: true },
      { name: "Detailed drawings & specifications", included: true },
      { name: "Project management", included: false },
      { name: "Construction oversight", included: false },
      { name: "Post-completion support", included: true },
    ],
  },
  {
    name: "Full Service",
    description: "End-to-end project management from design to completion",
    price: "Starting at $15,000",
    features: [
      { name: "Initial consultation (2 hours)", included: true },
      { name: "Design concept presentation", included: true },
      { name: "Material recommendations", included: true },
      { name: "Budget estimation", included: true },
      { name: "3D visualizations", included: true },
      { name: "Detailed drawings & specifications", included: true },
      { name: "Project management", included: true },
      { name: "Construction oversight", included: true },
      { name: "Post-completion support", included: true },
      { name: "1-year warranty", included: true },
    ],
  },
];

export function ServiceComparison() {
  return (
    <section className="py-20 lg:py-32 bg-neutral-50">
      <div className="container-custom">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              Choose Your{" "}
              <span className="italic font-light">Service Level</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              We offer flexible service packages to meet your specific needs and
              budget requirements.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {serviceTiers.map((tier, index) => (
            <Reveal key={tier.name} delay={index * 0.1}>
              <ServiceTierCard tier={tier} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4}>
          <div className="text-center mt-12">
            <p className="text-neutral-600 mb-6">
              Not sure which package is right for you? We&apos;d be happy to
              discuss your specific needs.
            </p>
            <ConsultationButton />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ServiceTierCard({ tier }: { tier: ServiceTier }) {
  const { ref, eventHandlers } = useMotion({
    trigger: "hover",
    duration: 300,
  });

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      {...eventHandlers}
      className={`relative bg-white p-8 rounded-2xl shadow-sm border-2 transition-all duration-300 ${
        tier.popular
          ? "border-neutral-900 transform scale-105"
          : "border-neutral-100 hover:border-neutral-200"
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-neutral-900 text-white px-4 py-2 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          {tier.name}
        </h3>
        <p className="text-neutral-600 mb-4">{tier.description}</p>
        <div className="text-3xl font-bold text-neutral-900">{tier.price}</div>
      </div>

      <ul className="space-y-4 mb-8">
        {tier.features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-center">
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                feature.included ? "bg-green-100" : "bg-neutral-100"
              }`}
            >
              {feature.included ? (
                <Check size={12} className="text-green-600" />
              ) : (
                <X size={12} className="text-neutral-400" />
              )}
            </div>
            <span
              className={`text-sm ${
                feature.included ? "text-neutral-900" : "text-neutral-400"
              }`}
            >
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <ServiceButton tier={tier} />
    </motion.div>
  );
}

function ServiceButton({ tier }: { tier: ServiceTier }) {
  const { ref, eventHandlers } = useMotion({
    trigger: "hover",
    duration: 200,
  });

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      {...eventHandlers}
      className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 ${
        tier.popular
          ? "bg-neutral-900 text-white hover:bg-neutral-800"
          : "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
      }`}
    >
      Get Started
    </motion.button>
  );
}

function ConsultationButton() {
  const { ref, eventHandlers } = useMotion({
    trigger: "hover",
    duration: 200,
  });

  return (
    <motion.a
      ref={ref as React.RefObject<HTMLAnchorElement>}
      {...eventHandlers}
      href="/contact"
      className="inline-block bg-neutral-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors duration-200"
    >
      Schedule a Consultation
    </motion.a>
  );
}
