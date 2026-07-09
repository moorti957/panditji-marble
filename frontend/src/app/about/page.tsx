// frontend/src/app/about/page.tsx

'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Calendar, Award, Users, Gem, Shield, Truck, Heart, Star } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import logo from '../../assets/logo.jpg';
import banner from '../../assets/banner.jpg';

// ============================================================
// ABOUT PAGE – Client Component with animations
// ============================================================
export default function AboutPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.2 });

  // Stats data
  const stats = [
    { icon: <Calendar className="w-6 h-6" />, number: '35+', label: 'Years of Craftsmanship' },
    { icon: <Users className="w-6 h-6" />, number: '120+', label: 'Master Artisans' },
    { icon: <Gem className="w-6 h-6" />, number: '15K+', label: 'Murtis Created' },
    { icon: <Award className="w-6 h-6" />, number: '500+', label: 'Temple Projects' },
  ];

  // Values data
  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Devotion in Every Detail',
      description: 'Each murti is crafted with deep spiritual reverence, infusing divine energy into every curve.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Authentic Materials',
      description: 'We source only the finest marble, brass, and wood, ensuring durability and sanctity.',
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Worldwide Delivery',
      description: 'Safely packaged and shipped globally, bringing divinity to your doorstep.',
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'Generational Legacy',
      description: 'Over three decades of passed-down skills and sacred traditions in every piece.',
    },
  ];

  // Timeline events
  const timeline = [
    { year: '1991', event: 'Founded by Pandit Ji in govindgarh, starting with a small workshop.' },
    { year: '2005', event: 'Expanded to a larger facility, training the next generation of artisans.' },
    { year: '2015', event: 'Completed our 100th temple project – a milestone of divine craftsmanship.' },
    { year: '2025', event: 'Launched our online presence to share our art with the world.' },
  ];

  return (
    <>
      {/* ================================
          HERO SECTION
      ================================ */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
        <Image
  src={banner}
  alt="Pandit Ji Marble Murti Arts Workshop"
  fill
  className="object-cover object-[center_20%]"
  priority
/>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>

        <Container className="relative z-10 py-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <span className="tag bg-white/20 text-white backdrop-blur-sm border-white/30">
              ✦ Our Story
            </span>
            <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mt-4">
              Crafting Divinity <br />
              <span className="text-gold">Since 1991</span>
            </h1>
            <p className="text-white/80 text-lg mt-4 max-w-xl">
              From the heart of govindgarh, we bring you handcrafted murtis that embody 
              centuries of tradition, devotion, and artistic excellence.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/products" className="btn-gold">
                Explore Our Murtis
              </Link>
              <Link href="/gallery" className="btn-outline-gold text-white border-white hover:bg-white/10">
                View Gallery
              </Link>
            </div>
          </motion.div>
        </Container>

        {/* Decorative floating elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ivory to-transparent z-10" />
      </section>

      {/* ================================
          OUR STORY
      ================================ */}
      <section className="py-20 bg-ivory">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="tag">✦ Our Legacy</span>
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-brown mt-2">
                A Journey of <br className="hidden sm:block" />
                <span className="text-gold-dark">Devotion &amp; Artistry</span>
              </h2>
              <div className="w-20 h-1 bg-gold/50 rounded-full mt-4" />
              <div className="space-y-4 text-brown-light leading-relaxed mt-6">
                <p>
                  Pandit Ji Marble Murti Arts began in the narrow lanes of govindgarh, 
                  where a young artisan, Pandit Ji, started sculpting divine forms 
                  with his bare hands and unwavering faith.
                </p>
                <p>
                  What started as a one‑man workshop has blossomed into a family 
                  of over 120 master craftsmen, each carrying forward the sacred 
                  knowledge of murti carving passed down through generations.
                </p>
                <p>
                  Today, our murtis grace temples, homes, and hearts across the 
                  globe – from small family shrines to grand temple sanctums.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={logo}
                  alt="Artisan at work"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-gold text-white px-6 py-3 rounded-xl shadow-lg">
                <p className="font-cinzel text-2xl font-bold">35+</p>
                <p className="text-xs uppercase tracking-wider">Years of Craft</p>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ================================
          STATS (animated counter)
      ================================ */}
      <section ref={statsRef} className="py-16 bg-brown text-white">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-center text-gold">{stat.icon}</div>
                <div className="font-cinzel text-3xl md:text-4xl font-bold text-gold">
                  {stat.number}
                </div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================
          OUR VALUES
      ================================ */}
      <section className="py-20 bg-ivory">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="tag">✦ Why Us</span>
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-brown mt-2">
              Built on Faith &amp; <span className="text-gold-dark">Excellence</span>
            </h2>
            <p className="text-brown-light mt-4">
              Our values are rooted in devotion, quality, and the relentless pursuit of artistic perfection.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gold/5 hover:shadow-xl transition-all duration-300 text-center group"
              >
                <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center text-gold-dark group-hover:bg-gold group-hover:text-white transition-all duration-300">
                  {value.icon}
                </div>
                <h3 className="font-cinzel text-lg font-semibold text-brown mt-4">
                  {value.title}
                </h3>
                <p className="text-sm text-brown-light/80 mt-2 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================
          TIMELINE
      ================================ */}
      <section className="py-20 bg-sand/30">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="tag">✦ Our Journey</span>
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-brown mt-2">
              Milestones of <span className="text-gold-dark">Divine Craft</span>
            </h2>
            <p className="text-brown-light mt-4">
              A timeline of dedication, growth, and spreading divinity across the world.
            </p>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gold/20 transform -translate-x-1/2" />

            {timeline.map((item, index) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row items-start gap-4 mb-12 ${
                  index % 2 === 0 ? 'md:pr-12' : 'md:pl-12 md:flex-row-reverse'
                }`}
              >
                {/* Dot on the line */}
                <div className="absolute left-4 md:left-1/2 top-0 w-4 h-4 rounded-full bg-gold border-4 border-ivory transform -translate-x-1/2 z-10" />

                <div className="flex-1 pl-12 md:pl-0">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold/5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                      <span className="font-cinzel text-2xl font-bold text-gold-dark">{item.year}</span>
                      <span className="text-brown-light text-sm">—</span>
                      <span className="text-brown-light">{item.event}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================
          CTA – Connect with us
      ================================ */}
      <section className="py-20 bg-gradient-to-r from-gold/10 via-ivory to-gold/10">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-brown">
              Join Our <span className="text-gold-dark">Divine Family</span>
            </h2>
            <p className="text-brown-light mt-4 text-lg">
              Whether you seek a murti for your home, temple, or a custom creation,
              we&apos;re here to bring your vision to life.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link href="/contact" className="btn-gold">
                Get in Touch
              </Link>
              <Link href="/products" className="btn-outline-gold">
                Browse Collection
              </Link>
            </div>
            <p className="text-brown-light/60 text-sm mt-6">
              🌐 Worldwide shipping · Handcrafted with devotion · 100% authentic
            </p>
          </motion.div>
        </Container>
      </section>
    </>
  );
}