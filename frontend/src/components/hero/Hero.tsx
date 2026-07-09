// frontend/src/components/hero/Hero.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../assets/logo.jpg';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { MagneticButton } from '@/components/animations/MagneticButton';
import heroImage from "../../assets/banner1.png";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================================
// Hero Component
// ============================================================
export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const particlesContainerRef = useRef<HTMLDivElement>(null);
  const floatingGlowRef = useRef<HTMLDivElement>(null);
  const particleTweensRef = useRef<gsap.core.Tween[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const originalScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      });
    };

    resetScroll();
    const timeoutId = window.setTimeout(resetScroll, 60);

    return () => {
      window.clearTimeout(timeoutId);
      window.history.scrollRestoration = originalScrollRestoration;
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const ctx = gsap.context(() => {
      const title = titleRef.current;
      const subtitle = subtitleRef.current;
      const buttons = buttonsRef.current;
      const heroImage = imageRef.current;
      const glow = floatingGlowRef.current;

      gsap.set([title, subtitle, buttons, heroImage], { opacity: 1, y: 0, clearProps: 'transform,opacity' });

      if (title) {
        gsap.fromTo(
          title,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.2 }
        );
      }

      if (subtitle) {
        gsap.fromTo(
          subtitle,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
        );
      }

      if (buttons) {
        gsap.fromTo(
          buttons,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.7 }
        );
      }

      if (heroImage) {
        gsap.fromTo(
          heroImage,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.4, ease: 'power3.out', delay: 0.3 }
        );
      }

      if (glow) {
        gsap.to(glow, {
          scale: 1.2,
          opacity: 0.6,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      if (heroImage) {
        gsap.to(heroImage, {
          y: 80,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    }, heroRef);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      particleTweensRef.current.forEach((tween) => tween.kill());
      particleTweensRef.current = [];
      ctx.revert();
    };
  }, [isMounted]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      } as const,
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: 'easeOut' as const,
      },
    },
  } as const;

  useEffect(() => {
    if (!isMounted || !particlesContainerRef.current) return;

    const container = particlesContainerRef.current;
    container.replaceChildren();
    particleTweensRef.current.forEach((tween) => tween.kill());
    particleTweensRef.current = [];

    const particleCount = 30;

    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = 3 + Math.random() * 6;
      const colors = ['#D4AF37', '#FFFCF7', '#7B1E1E', '#F5EDDF', '#B8962E'];
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        bottom: -10%;
        opacity: ${0.1 + Math.random() * 0.2};
        pointer-events: none;
        filter: blur(${Math.random() > 0.7 ? '2px' : '0'});
      `;
      container.appendChild(particle);

      const duration = 8 + Math.random() * 12;
      const delay = Math.random() * 5;
      const xOffset = (Math.random() - 0.5) * 100;
      const tween = gsap.to(particle, {
        y: -window.innerHeight,
        x: xOffset,
        rotation: 360 * (Math.random() > 0.5 ? 1 : -1),
        duration,
        delay,
        repeat: -1,
        ease: 'none',
        opacity: 0,
      });
      particleTweensRef.current.push(tween);
    }
  }, [isMounted]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-ivory via-sand/30 to-ivory"
    >
      {/* ============================================================
          BACKGROUND DECORATIVE ELEMENTS
      ============================================================ */}

      {/* Mandala-like background rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-gold/5 rounded-full animate-spin-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-gold/5 rounded-full animate-spin-slower" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gold/5 rounded-full animate-spin-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-gold/10 rounded-full animate-spin-slower" />

        {/* Gradient orbs */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-maroon/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
      </div>

      {/* ============================================================
          PARTICLES
      ============================================================ */}
      <div
        ref={particlesContainerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 1 }}
      />

      {/* ============================================================
          FLOATING DIVINE GLOW
      ============================================================ */}
      <div
        ref={floatingGlowRef}
        className="absolute top-1/3 right-1/4 w-72 h-72 bg-gold/20 rounded-full blur-3xl pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}
      <Container className="relative z-10 py-20 md:py-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left: Text Content */}
          <div className="space-y-6">
            {/* Divine Tag */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 tag">
                <Sparkles className="w-3.5 h-3.5" />
                Divine Craftsmanship
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              ref={titleRef}
              variants={itemVariants}
              className="font-cinzel text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight"
            >
              <span className="text-brown dark:text-ivory">Handcrafted</span>
              <br />
              <span className="relative inline-block">
                <span className="text-gold-dark">Sacred Murtis</span>
                {/* Underline decorative */}
                <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-gold/30 rounded-full" />
                <span className="absolute -bottom-2 left-0 w-1/3 h-1.5 bg-gold rounded-full" />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              ref={subtitleRef}
              variants={itemVariants}
              className="text-base sm:text-lg text-brown-light dark:text-ivory/70 max-w-md leading-relaxed"
            >
              Each sculpture is carved with devotion by master artisans in govindgarh,
              bringing divine energy into your home and temple.
            </motion.p>

            {/* Stats */}
            <motion.div variants={itemVariants} className="flex items-center gap-8 pt-2">
              <div>
                <p className="font-cinzel text-2xl font-bold text-gold-dark">35+</p>
                <p className="text-xs text-brown-light dark:text-ivory/50">Years of Craft</p>
              </div>
              <div className="w-px h-10 bg-gold/20" />
              <div>
                <p className="font-cinzel text-2xl font-bold text-gold-dark">15K+</p>
                <p className="text-xs text-brown-light dark:text-ivory/50">Murtis Created</p>
              </div>
              <div className="w-px h-10 bg-gold/20" />
              <div>
                <p className="font-cinzel text-2xl font-bold text-gold-dark">500+</p>
                <p className="text-xs text-brown-light dark:text-ivory/50">Temple Projects</p>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              ref={buttonsRef}
              variants={itemVariants}
              className="flex flex-wrap gap-4 pt-2"
            >
              <MagneticButton>
                <Link href="/products" className="btn-gold inline-flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Explore Murtis
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticButton>

              <MagneticButton>
                <Link
                  href="/about"
                  className="btn-outline-gold inline-flex items-center gap-2"
                >

                  Our Story
                </Link>
              </MagneticButton>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-xs text-brown-light dark:text-ivory/50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                In Stock
              </div>
              <div className="flex items-center gap-2 text-xs text-brown-light dark:text-ivory/50">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                Handcrafted
              </div>
              <div className="flex items-center gap-2 text-xs text-brown-light dark:text-ivory/50">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Worldwide Shipping
              </div>
            </motion.div>
          </div>

          {/* Right: Hero Image */}
          <motion.div
  ref={imageRef}
  variants={itemVariants}
  className="relative flex justify-center lg:justify-end"
>
  <div className="relative w-full max-w-md lg:max-w-lg aspect-[3/4]">

    {/* Main Image / Video */}
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-gold/10 border border-gold/20">

     {!playVideo ? (
  <>
    <Image
      src={heroImage}
      alt="Pandit Ji Marble Murti Art"
      fill
      className="object-cover"
      priority
      sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
    />

    {/* Play Button */}
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setPlayVideo(true)}
      className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-all duration-300"
      aria-label="Play Video"
    >
      <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur shadow-2xl flex items-center justify-center">
        <Play className="w-7 h-7 text-gold-dark fill-current" />
      </div>
    </motion.button>
  </>
) : (
  <iframe
    className="absolute inset-0 w-full h-full rounded-2xl"
    src="https://www.youtube.com/embed/UsCcS0JMZCg?autoplay=1&mute=1&rel=0&playsinline=1"
    title="Pandit Ji Marble Murti Art"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  />
)}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brown/10 via-transparent to-transparent pointer-events-none" />

      {/* Decorative Corner Ornaments */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gold/30 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gold/30 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gold/30 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gold/30 rounded-br-lg pointer-events-none" />
    </div>

    {/* Floating Badge */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="absolute -bottom-4 -right-4 bg-white dark:bg-brown-dark shadow-xl rounded-xl px-4 py-3 border border-gold/20"
    >
      <div className="flex items-center gap-3">
        <Image
          src={logo}
          alt="Pandit Ji Marble Murti Art"
          width={42}
          height={42}
          className="w-10 h-10 rounded-full object-cover border border-gold/20"
        />

        <div>
          <p className="font-cinzel text-sm font-bold text-brown dark:text-ivory leading-none">
            Pandit Ji Marble
          </p>
          <p className="text-[10px] text-gold-dark font-medium tracking-wide">
            Murti Art
          </p>
        </div>
      </div>
    </motion.div>

  </div>
</motion.div>
          
        </motion.div>
      </Container>

      {/* ============================================================
          BOTTOM DECORATIVE WAVE
      ============================================================ */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto opacity-20"
        >
          <path
            d="M0 40C240 80 480 80 720 40C960 0 1200 0 1440 40V80H0V40Z"
            fill="url(#gradient)"
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ============================================================
          ADDITIONAL STYLES (for animations)
      ============================================================ */}
      <style>{`
        @keyframes spin-slow {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spin-slower {
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 40s linear infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 60s linear infinite;
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
      `}</style>
    </section>
  );
}