'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '../../lib/utils';
import Container from '../../components/ui/Container';

export interface StatItem {
  id: string;
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
}

interface StatsSectionProps {
  stats?: StatItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  loading?: boolean;
}

const defaultStats: StatItem[] = [
  { id: 'years', icon: '', value: 35, label: 'Years of Craftsmanship', suffix: '+' },
  { id: 'murtis', icon: '', value: 15000, label: 'Murtis Created', suffix: '+' },
  { id: 'temples', icon: '', value: 350, label: 'Temple Projects', suffix: '+' },
  { id: 'devotees', icon: '', value: 12000, label: 'Happy Devotees', suffix: '+' },
];

function AnimatedCounter({
  value,
  suffix = '',
  duration = 2,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold text-gold-dark">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection({
  stats = defaultStats,
  title = 'Our Legacy in Numbers',
  subtitle = 'Decades of devotion, thousands of divine creations.',
  className,
  loading = false,
}: StatsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  if (loading) {
    return (
      <section className={cn('section-padding bg-sand/30 dark:bg-brown/20', className)}>
        <Container>
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-sand/50 dark:bg-brown/50 rounded animate-pulse mx-auto" />
            <div className="h-4 w-64 bg-sand/30 dark:bg-brown/30 rounded animate-pulse mx-auto mt-2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-12 w-12 bg-sand/50 dark:bg-brown/50 rounded-full animate-pulse mx-auto" />
                <div className="h-8 w-20 bg-sand/50 dark:bg-brown/50 rounded animate-pulse mx-auto" />
                <div className="h-4 w-24 bg-sand/30 dark:bg-brown/30 rounded animate-pulse mx-auto" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={cn('section-padding bg-gradient-to-b from-sand/30 to-ivory dark:from-brown/20 dark:to-brown', className)}
    >
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="ornate-divider justify-center">
            <span className="diamond">✦</span>
          </div>
          <h2 className="font-cinzel text-2xl md:text-3xl lg:text-4xl font-bold text-brown dark:text-ivory">
            {title}
          </h2>
          <p className="text-brown-light dark:text-ivory/60 text-sm md:text-base mt-2">
            {subtitle}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex justify-center text-4xl md:text-5xl">{stat.icon}</div>
              <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} duration={2} />
              <p className="text-sm md:text-base text-brown-light dark:text-ivory/70 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}