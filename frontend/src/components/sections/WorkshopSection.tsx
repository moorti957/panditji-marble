// frontend/src/components/sections/WorkshopSection.tsx

'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { cn } from '../../lib/utils';
import Container from '../../components/ui/Container';
import workshopImage from "../../assets/banner2.jpg";
import { StaticImageData } from "next/image";
// ============================================================
// Types
// ============================================================
export interface WorkshopStep {
  id: string;
  number: number;
  title: string;
  description: string;
}

interface WorkshopSectionProps {
  title?: string;
  subtitle?: string;
  tag?: string;
  imageSrc?: string | StaticImageData;
  imageAlt?: string;
  steps?: WorkshopStep[];
  className?: string;
  loading?: boolean;
}

// ============================================================
// Default Steps
// ============================================================
const defaultSteps: WorkshopStep[] = [
  {
    id: '1',
    number: 1,
    title: 'Clay Modeling & Refinement',
    description: 'Every murti begins as a vision, sculpted in clay to perfect every divine detail.',
  },
  {
    id: '2',
    number: 2,
    title: 'Mold Making & Casting',
    description: 'Precision molds are crafted to capture the essence of the original sculpture.',
  },
  {
    id: '3',
    number: 3,
    title: 'Hand Finishing & Detailing',
    description: 'Master artisans refine every curve and expression with meticulous hand tools.',
  },
  {
    id: '4',
    number: 4,
    title: 'Pran Pratishtha (Energization)',
    description: 'Each murti is consecrated through sacred rituals, infusing it with divine energy.',
  },
];

// ============================================================
// WorkshopSection Component
// ============================================================
export default function WorkshopSection({
  title = 'From Our Workshop to Your Home',
  subtitle = 'Every murti is hand-sculpted in Jaipur using traditional techniques passed down through generations.',
  tag = '✦ Behind the Art',
  imageSrc = workshopImage,
  imageAlt = 'Master artisan at work on a marble murti',
  steps = defaultSteps,
  className,
  loading = false,
}: WorkshopSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  // Loading skeleton
  if (loading) {
    return (
      <section className={cn('section-padding bg-sand/30 dark:bg-brown/20', className)}>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] bg-sand/50 dark:bg-brown/50 rounded-2xl animate-pulse" />
            <div className="space-y-6">
              <div className="h-6 w-32 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
              <div className="h-4 w-full bg-sand/30 dark:bg-brown/30 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-sand/30 dark:bg-brown/30 rounded animate-pulse" />
              <div className="space-y-4 mt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-sand/50 dark:bg-brown/50 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-sand/50 dark:bg-brown/50 rounded animate-pulse" />
                      <div className="h-3 w-2/3 bg-sand/30 dark:bg-brown/30 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={cn('section-padding bg-gradient-to-b from-ivory to-sand/30 dark:from-brown dark:to-brown/80', className)}
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-gold/10">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brown/20 to-transparent" />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-2 border-gold/20 rounded-full -z-10" />
            <div className="absolute -top-4 -right-4 w-32 h-32 border-2 border-gold/20 rounded-full -z-10" />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Tag */}
            <span className="tag">{tag}</span>

            {/* Title */}
            <h2 className="font-cinzel text-2xl md:text-3xl lg:text-4xl font-bold text-brown dark:text-ivory">
              {title}
            </h2>

            {/* Subtitle */}
            <p className="text-brown-light dark:text-ivory/70 text-sm md:text-base leading-relaxed max-w-lg">
              {subtitle}
            </p>

            {/* Steps */}
            <div className="space-y-4 mt-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="shrink-0 w-10 h-10 rounded-full bg-gold/10 dark:bg-gold/20 flex items-center justify-center text-gold-dark dark:text-gold font-cinzel font-bold text-sm group-hover:bg-gold group-hover:text-white transition-colors duration-300">
                    {step.number}
                  </div>
                  <div>
                    <h4 className="font-cinzel text-base font-semibold text-brown dark:text-ivory">
                      {step.title}
                    </h4>
                    <p className="text-sm text-brown-light dark:text-ivory/60 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}