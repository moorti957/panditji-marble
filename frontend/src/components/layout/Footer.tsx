// frontend/src/components/layout/Footer.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from '@/lib/notifications';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  ArrowRight,
  Shield,
  Truck,
  Award,
  Heart,
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// ============================================================
// Footer Component
// ============================================================
export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Newsletter subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.', 'We’ll only use it for updates from our studio.');
      return;
    }
    setIsSubscribing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('You’re on the list!', 'Thank you for subscribing to our updates.');
      setEmail('');
    } catch (error) {
      toast.error('We couldn’t subscribe you right now.', 'Please try again in a moment.');
    } finally {
      setIsSubscribing(false);
    }
  };

  // Footer sections data
  const quickLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/products', label: 'Products' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/blogs', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
  ];

  const categoryLinks = [
    { href: '/products?category=ganesh', label: 'Ganesh Ji' },
    { href: '/products?category=krishna', label: 'Radha Krishna' },
    { href: '/products?category=shiv', label: 'Shiv Ji' },
    { href: '/products?category=hanuman', label: 'Hanuman Ji' },
    { href: '/products?category=ram', label: 'Ram Darbar' },
    { href: '/products?category=durga', label: 'Durga Maa' },
  ];

  const legalLinks = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/refund-policy', label: 'Refund Policy' },
    { href: '/shipping-policy', label: 'Shipping Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/panditjimurti',
      icon: FaInstagram,
      color: 'hover:text-pink-500',
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/panditjimurti',
      icon: FaYoutube,
      color: 'hover:text-red-600',
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/panditjimurti',
      icon: FaFacebook,
      color: 'hover:text-blue-600',
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/panditjimurti',
      icon: FaTwitter,
      color: 'hover:text-blue-400',
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="
    relative
    overflow-hidden

    bg-white
    text-brown

    border-t
    border-gold/20

    shadow-[0_-20px_50px_rgba(212,175,55,0.12)]

    dark:bg-gradient-to-b
    dark:from-brown-dark
    dark:to-brown
    dark:text-white

    dark:border-gold/10
    dark:shadow-[0_-25px_60px_rgba(212,175,55,0.18)]
  "
    >    {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-black/5 rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Main Footer */}
        <div className="container pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand & About */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <div className="font-cinzel text-2xl font-bold text-brown dark:text-white">
                  Pandit ji Marble <span className="text-gold">Murti Art</span>
                </div>
              </Link>
              <p className="text-brown-light dark:text-white/60 text-sm leading-relaxed max-w-sm">
               Crafting premium marble murtis with devotion, precision, and timeless artistry. Every sculpture is handcrafted by skilled artisans to bring divine beauty and spiritual grace to your home, temple, and sacred spaces.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-brown-light/40 text-xs">
                  <Shield className="w-4 h-4" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex items-center gap-1.5 text-brown-light/40 text-xs">
                  <Truck className="w-4 h-4" />
                  <span>Worldwide Shipping</span>
                </div>
                <div className="flex items-center gap-1.5 text-brown-light/40 text-xs">
                  <Award className="w-4 h-4" />
                  <span>35+ Years</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center transition-all hover:bg-white/20 ${social.color}`}
                      aria-label={social.name}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-cinzel text-lg font-semibold text-brown dark:text-white mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60text-brown-light
dark:text-white/60 hover:text-gold transition-colors text-sm flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-cinzel text-lg font-semibold text-brown dark:text-white mb-4">
                Categories
              </h4>
              <ul className="space-y-2.5">
                {categoryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60text-brown-light
dark:text-white/60 hover:text-gold transition-colors text-sm flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/categories"
                    className="text-gold hover:text-gold-light transition-colors text-sm font-medium flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3" />
                    View All Categories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div>
              <h4 className="font-cinzel text-lg font-semibold text-brown dark:text-white mb-4">
                Get In Touch
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3 text-white/60text-brown-light
dark:text-white/60">
                  <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>Bhagat Singh Circle Near Kunda Mandir, Govindgarh (Alwar) Raj 301604 </span>
                </li>
                <li className="flex items-center gap-3 text-brown-light
dark:text-white/60">
                  <Phone className="w-4 h-4 text-gold shrink-0" />
                  <a href="tel:+917240364772" className="hover:text-gold transition-colors">
                    +91 72403 64772
                  </a>
                </li>
                <li className="flex items-center gap-3 text-brown-light
dark:text-white/60">
                  <Mail className="w-4 h-4 text-gold shrink-0" />
                  <a href="mailto:sharmaravi2794@gmail.com" className="hover:text-gold transition-colors">
                    sharmaravi2794@gmail.com 


                  </a>
                </li>
                <li className="flex items-center gap-3 text-brown-light
dark:text-white/60">
                  <Clock className="w-4 h-4 text-gold shrink-0" />
                  <span>Mon–Sat: 9:00 AM – 7:00 PM IST</span>
                </li>
              </ul>

              {/* Newsletter */}
              <div className="mt-6">
                <p className="text-brown-light
dark:text-white/60 text-sm mb-3">
                  Subscribe for divine updates & offers
                </p>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubscribing}
                    className="
      flex-1
      rounded-full
      px-4
      py-2.5
      text-sm

      bg-sand
      border border-gold/20
      text-brown
      placeholder:text-brown-light

      focus:border-gold
      focus:ring-2
      focus:ring-gold/20

      dark:bg-white/10
      dark:border-white/10
      dark:text-white
      dark:placeholder:text-white/40
    "
                  />

                  <Button
                    type="submit"
                    disabled={isSubscribing}
                    className="
      rounded-full
      px-4
      py-2.5
      shrink-0

      bg-gold
      hover:bg-gold-dark
      text-white
      transition-all
      duration-300
      shadow-lg
      hover:shadow-xl
    "
                  >
                    {isSubscribing ? (
                      <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 pt-8 border-t border-black/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-gold" />
                </div>
                <p className="text-brown-light
dark:text-white/60 text-xs">Handcrafted with Devotion</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gold" />
                </div>
                <p className="text-brown-light
dark:text-white/60 text-xs">100% Authentic</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-gold" />
                </div>
                <p className="text-brown-light
dark:text-white/60 text-xs">Worldwide Shipping</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-gold" />
                </div>
                <p className="text-brown-light
dark:text-white/60 text-xs">35+ Years of Craft</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
         <div className="mt-8 pt-6 border-t border-gold/20 dark:border-black/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brown-light dark:text-white/50">
  <div className="text-center md:text-left">
    &copy; {currentYear} Pandit Ji Marble Murti Arts. All rights reserved.
  </div>

  <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
    {legalLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className="text-brown-light hover:text-gold dark:text-white/60 dark:hover:text-gold transition-colors"
      >
        {link.label}
      </Link>
    ))}
  </div>

  <div className="flex items-center gap-1 text-brown-light dark:text-white/60">
    <span>Made with</span>
    <Heart className="w-3 h-3 text-red-500 fill-red-500" />
    <span>in Rajasthan</span>
  </div>
</div>
        </div>
      </div>
    </footer>
  );
}