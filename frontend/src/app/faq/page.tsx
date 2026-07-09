// frontend/src/app/faq/page.tsx

'use client';

import { useState, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, HelpCircle, Package, Truck, CreditCard, Shield, User, Building } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Input } from '@/components/ui/Input';

// ============================================================
// FAQ Data
// ============================================================
const faqData = [
  // General Questions
  {
    id: 'general-1',
    category: 'general',
    question: 'What type of murtis do you offer?',
    answer: 'We offer a wide range of handcrafted murtis including Ganesh Ji, Radha Krishna, Shiv Ji, Hanuman Ji, Ram Darbar, Durga Maa, Kali Maa, Sai Baba, Vishnu, Lakshmi, Saraswati, and Marble Shivling. Each murti is crafted with devotion and precision by our master artisans in govindgarh.',
  },
  {
    id: 'general-2',
    category: 'general',
    question: 'What materials are used to make the murtis?',
    answer: 'We use premium quality materials including marble (Makrana, White, and Pink), brass, bronze, wood (Sandalwood and Teak), and stone. Each material is carefully selected for its durability, beauty, and spiritual significance.',
  },
  {
    id: 'general-3',
    category: 'general',
    question: 'Are the murtis handcrafted or machine-made?',
    answer: 'All our murtis are 100% handcrafted by master artisans who have inherited this sacred art form through generations. Each piece undergoes a meticulous process of carving, detailing, and finishing to ensure perfection.',
  },

  // Ordering Questions
  {
    id: 'ordering-1',
    category: 'ordering',
    question: 'How do I place an order?',
    answer: 'You can place an order directly through our website by browsing our collection, selecting your desired murti, choosing the quantity, and proceeding to checkout. You can also WhatsApp us or call us for personalized assistance.',
  },
  {
    id: 'ordering-2',
    category: 'ordering',
    question: 'Can I customize a murti?',
    answer: 'Yes, we specialize in custom murtis. You can request a custom size, design, material, or even a completely new design. Simply reach out to us via WhatsApp, email, or the contact form with your requirements.',
  },
  {
    id: 'ordering-3',
    category: 'ordering',
    question: 'Do you offer bulk orders for temples?',
    answer: 'Absolutely! We have extensive experience in fulfilling bulk orders for temples, ashrams, and spiritual organizations. Please contact us directly for special pricing and bulk shipping arrangements.',
  },

  // Shipping Questions
  {
    id: 'shipping-1',
    category: 'shipping',
    question: 'Do you ship worldwide?',
    answer: 'Yes, we ship worldwide! We have experience shipping to over 50 countries including USA, UK, Canada, Australia, UAE, Singapore, and many more. Each murti is carefully packed to ensure safe delivery.',
  },
  {
    id: 'shipping-2',
    category: 'shipping',
    question: 'How much does shipping cost?',
    answer: 'Shipping costs vary based on the destination and the size of the murti. Exact shipping charges are calculated at checkout and can be configured from the admin panel.',
  },
  {
    id: 'shipping-3',
    category: 'shipping',
    question: 'How long does delivery take?',
    answer: 'Domestic deliveries typically take 5-7 business days. International deliveries take 7-14 business days depending on the destination and customs clearance. Express shipping options are available for urgent orders.',
  },

  // Payment Questions
  {
    id: 'payment-1',
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept multiple payment methods including Credit/Debit Cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), Net Banking, Cash on Delivery (COD) for domestic orders, and Bank Transfers for international orders.',
  },
  {
    id: 'payment-2',
    category: 'payment',
    question: 'Is my payment information secure?',
    answer: 'Yes, we use industry-standard encryption and secure payment gateways to protect your payment information. We do not store any credit card details on our servers.',
  },

  // Return & Refund
  {
    id: 'returns-1',
    category: 'returns',
    question: 'What is your return policy?',
    answer: 'We have a 7-day return policy for unused and undamaged murtis. If you are not satisfied with your purchase, please contact us within 7 days of delivery. Custom orders are non-returnable.',
  },
  {
    id: 'returns-2',
    category: 'returns',
    question: 'What if my murti arrives damaged?',
    answer: 'We take great care in packaging, but if your murti arrives damaged, please take photos and contact us immediately. We will arrange for a replacement or refund based on your preference.',
  },
  {
    id: 'returns-3',
    category: 'returns',
    question: 'How do I initiate a return?',
    answer: 'To initiate a return, please contact our support team via WhatsApp or email with your order details and reason for return. We will guide you through the process.',
  },

  // Product Care
  {
    id: 'care-1',
    category: 'care',
    question: 'How do I care for my marble murti?',
    answer: 'To maintain the beauty of your marble murti, dust it regularly with a soft cloth. Avoid using harsh chemicals or abrasive materials. For deep cleaning, use mild soap and water, and dry thoroughly. Apply marble polish occasionally for extra shine.',
  },
  {
    id: 'care-2',
    category: 'care',
    question: 'Can I keep the murti outdoors?',
    answer: 'Most marble and stone murtis can be kept outdoors, but we recommend protecting them from extreme weather conditions. Brass and wood murtis are best kept indoors to prevent oxidation and damage.',
  },
  {
    id: 'care-3',
    category: 'care',
    question: 'Do you offer maintenance services?',
    answer: 'We offer maintenance and restoration services for murtis purchased from us. Please contact us for more details about our maintenance packages.',
  },

  // Account & Privacy
  {
    id: 'account-1',
    category: 'account',
    question: 'How do I create an account?',
    answer: 'You can create an account by clicking on the "Register" link at the top of the page, or by visiting our registration page. You\'ll need to provide your name, email address, and create a password.',
  },
  {
    id: 'account-2',
    category: 'account',
    question: 'Is my personal information safe?',
    answer: 'Yes, we take your privacy very seriously. Your personal information is securely stored and will never be shared with third parties. Please refer to our Privacy Policy for more details.',
  },
  {
    id: 'account-3',
    category: 'account',
    question: 'How do I reset my password?',
    answer: 'If you\'ve forgotten your password, click on "Forgot Password" on the login page. We\'ll send you a link to reset your password via email.',
  },
];

// ============================================================
// FAQ Page
// ============================================================
export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(faqData.map((item) => item.category))];
    return cats.map((cat) => ({
      id: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
    }));
  }, []);

  // Filter FAQ items based on search and category
  const filteredFaqs = useMemo(() => {
    return faqData.filter((item) => {
      const matchesSearch = 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // Toggle FAQ item
  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  // Category icon mapping
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, ReactNode> = {
      general: <HelpCircle className="w-5 h-5" />,
      ordering: <Package className="w-5 h-5" />,
      shipping: <Truck className="w-5 h-5" />,
      payment: <CreditCard className="w-5 h-5" />,
      returns: <Shield className="w-5 h-5" />,
      care: <Building className="w-5 h-5" />,
      account: <User className="w-5 h-5" />,
    };
    return icons[category] || <HelpCircle className="w-5 h-5" />;
  };

  return (
    <div className="bg-ivory min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 bg-gradient-to-br from-brown via-brown-dark to-brown text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-gold/20 blur-3xl" />
        </div>
        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="tag bg-white/20 text-white backdrop-blur-sm border-white/30">
              ✦ Help Center
            </span>
            <h1 className="font-cinzel text-4xl md:text-5xl font-bold mt-4">
              Frequently Asked <span className="text-gold">Questions</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mt-4">
              Find answers to the most common questions about our murtis, ordering process, shipping, and more.
            </p>
          </motion.div>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        {/* Search and filters */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-light" />
              <Input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white border-gold/10 rounded-full focus:border-gold"
              />
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? 'bg-gold text-white shadow-gold'
                      : 'bg-white text-brown-light hover:bg-gold/10 border border-gold/10'
                  }`}
                >
                  {cat.id !== 'all' && getCategoryIcon(cat.id)}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-brown-light/70 mb-4">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'answer' : 'answers'} found
          </p>

          {/* FAQ Accordion */}
          <AnimatePresence>
            {filteredFaqs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-2xl border border-gold/5"
              >
                <HelpCircle className="w-12 h-12 text-brown-light/30 mx-auto mb-3" />
                <p className="text-brown-light">No results found for your search.</p>
                <p className="text-sm text-brown-light/60 mt-1">Try adjusting your search or filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="btn-gold inline-block mt-4 text-sm px-6 py-2"
                >
                  Reset Filters
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((item, index) => {
                  const isOpen = openItems.has(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="bg-white rounded-2xl border border-gold/5 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full px-4 md:px-6 py-4 text-left flex items-start gap-3 hover:bg-gold/5 transition-colors"
                      >
                        <div className="shrink-0 mt-1 text-gold-dark">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <span className="font-medium text-brown pr-4">
                              {item.question}
                            </span>
                            <span className="shrink-0 text-brown-light">
                              {isOpen ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </span>
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-4 md:px-6 pb-4 pt-1">
                              <div className="pl-8 border-l-2 border-gold/20">
                                <p className="text-brown-light text-sm leading-relaxed">
                                  {item.answer}
                                </p>
                                {/* Category tag */}
                                <span className="inline-block mt-3 text-xs bg-sand/60 px-2.5 py-0.5 rounded-full text-brown-light/60">
                                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>

          {/* Still have questions? */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 p-6 md:p-8 bg-gradient-to-r from-gold/10 via-ivory to-gold/10 rounded-2xl text-center border border-gold/10"
          >
            <h3 className="font-cinzel text-xl font-bold text-brown">Still Have Questions?</h3>
            <p className="text-brown-light text-sm mt-1 max-w-md mx-auto">
              Can&apos;t find the answer you&apos;re looking for? We&apos;re here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <a
                href="https://wa.me/917240364772"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-sm font-medium"
              >
                <span className="text-lg">💬</span>
                WhatsApp Us
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 btn-gold text-sm"
              >
                Contact Support
              </a>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}