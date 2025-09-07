import Image from "next/image";

export default function AboutContent() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-700">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="About Legacy"
            fill
            className="object-cover opacity-60"
            priority
          />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            About <span className="italic font-light">Legacy</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Crafting timeless spaces that inspire and endure
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
                Our <span className="italic font-light">Story</span>
              </h2>
              <p className="text-lg text-neutral-600 mb-6 leading-relaxed">
                Founded with a vision to transform spaces into extraordinary experiences, 
                Legacy Interiors and Developers has been at the forefront of innovative 
                design for over a decade.
              </p>
              <p className="text-lg text-neutral-600 leading-relaxed">
                We believe that great design is not just about aesthetics—it's about 
                creating environments that enhance lives, inspire creativity, and stand 
                the test of time.
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1600607687644-c7171b42498b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Our design process"
                fill
                className="object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
              Our <span className="italic font-light">Values</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              The principles that guide every project and relationship we build
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Excellence</h3>
              <p className="text-neutral-600 leading-relaxed">We pursue perfection in every detail, from concept to completion.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Innovation</h3>
              <p className="text-neutral-600 leading-relaxed">We embrace new ideas and technologies to create unique solutions.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Sustainability</h3>
              <p className="text-neutral-600 leading-relaxed">We design with the future in mind, prioritizing eco-friendly practices.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
