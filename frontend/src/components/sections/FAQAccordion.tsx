// frontend/src/components/sections/FAQAccordion.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils';

// ============================================================
// Types
// ============================================================
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  defaultOpen?: string | null;
  variant?: 'default' | 'compact' | 'bordered';
  allowMultiple?: boolean;
}

// ============================================================
// FAQAccordion Component
// ============================================================
export function FAQAccordion({
  faqs,
  title = 'Frequently Asked Questions',
  subtitle = 'Find answers to the most common questions about our murtis and services.',
  className,
  defaultOpen = null,
  variant = 'default',
  allowMultiple = false,
}: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    defaultOpen ? new Set([defaultOpen]) : new Set()
  );
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  // Toggle an item
  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (allowMultiple) {
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      } else {
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.clear();
          next.add(id);
        }
      }
      return next;
    });
  };

  // Check if an item is open
  const isOpen = (id: string) => openItems.has(id);

  // If no FAQs, don't render
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Variant styles
  const variantStyles = {
    default: 'bg-white dark:bg-brown-dark rounded-2xl shadow-sm border border-gold/5',
    compact: 'bg-transparent border-b border-gold/10 last:border-0',
    bordered: 'bg-white dark:bg-brown-dark rounded-2xl border-2 border-gold/20 shadow-lg',
  };

  const itemStyles = {
    default: 'border-b border-gold/10 last:border-0',
    compact: 'border-b border-gold/10 last:border-0',
    bordered: 'border-b border-gold/10 last:border-0',
  };

  return (
    <section
      ref={sectionRef}
      className={cn('py-12 md:py-16 bg-ivory dark:bg-brown', className)}
    >
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="ornate-divider justify-center">
            <span className="diamond">✦</span>
          </div>
          <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="text-brown-light dark:text-ivory/60 text-sm mt-2">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={cn('max-w-3xl mx-auto overflow-hidden', variantStyles[variant])}
        >
          {faqs.map((faq, index) => {
            const open = isOpen(faq.id);
            return (
              <div
                key={faq.id}
                className={cn(
                  'transition-colors',
                  itemStyles[variant],
                  open && variant !== 'compact' && 'bg-gold/5'
                )}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleItem(faq.id)}
                  className={cn(
                    'w-full px-5 py-4 md:px-6 md:py-5 flex items-start justify-between gap-4 text-left transition-colors',
                    'hover:bg-gold/5 focus:outline-none focus:ring-2 focus:ring-gold/20 rounded-lg',
                    open && 'text-gold-dark dark:text-gold'
                  )}
                  aria-expanded={open}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 mt-0.5 text-gold-dark">
                      <HelpCircle className="w-5 h-5" />
                    </span>
                    <span className="font-medium text-brown dark:text-ivory text-sm md:text-base">
                      {faq.question}
                    </span>
                  </div>
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0 text-brown-light dark:text-ivory/50"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.span>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`faq-answer-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 md:px-6 md:pb-6">
                        <div className="pl-8 border-l-2 border-gold/20 dark:border-gold/10">
                          <p className="text-sm text-brown-light dark:text-ivory/70 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-brown-light dark:text-ivory/60">
            Still have questions?{' '}
            <a
              href="/contact"
              className="text-gold-dark dark:text-gold hover:text-gold transition-colors font-medium"
            >
              Contact our support team
            </a>
          </p>
        </motion.div>
      </Container>
    </section>
  );
}

// ============================================================
// Compact version (no header, for sidebars or small spaces)
// ============================================================
interface CompactFAQAccordionProps {
  faqs: FAQItem[];
  className?: string;
  defaultOpen?: string | null;
}

export function CompactFAQAccordion({
  faqs,
  className,
  defaultOpen = null,
}: CompactFAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    defaultOpen ? new Set([defaultOpen]) : new Set()
  );

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const isOpen = (id: string) => openItems.has(id);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {faqs.map((faq) => {
        const open = isOpen(faq.id);
        return (
          <div
            key={faq.id}
            className="bg-white dark:bg-brown-dark rounded-xl border border-gold/5 overflow-hidden"
          >
            <button
              onClick={() => toggleItem(faq.id)}
              className={cn(
                'w-full px-4 py-3 flex items-start justify-between gap-3 text-left transition-colors',
                'hover:bg-gold/5 focus:outline-none focus:ring-2 focus:ring-gold/20',
                open && 'text-gold-dark dark:text-gold'
              )}
              aria-expanded={open}
            >
              <span className="text-sm font-medium text-brown dark:text-ivory">
                {faq.question}
              </span>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="shrink-0 text-brown-light dark:text-ivory/50"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-4 pb-4">
                    <p className="text-xs text-brown-light dark:text-ivory/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Default export
// ============================================================
export default FAQAccordion;