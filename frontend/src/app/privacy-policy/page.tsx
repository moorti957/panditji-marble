// frontend/src/app/privacy-policy/page.tsx

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import  Container  from '../../components/ui/Container';
import  GlassCard  from '../../components/ui/GlassCard';
import { ArrowLeft, Shield, Lock, Eye, Database, FileText, User, Mail } from 'lucide-react';

// ============================================================
// Privacy Policy Page
// ============================================================
export default function PrivacyPolicyPage() {
  return (
    <div className="bg-ivory dark:bg-brown min-h-screen py-12 md:py-20">
      <Container>
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brown-light dark:text-ivory/60 hover:text-gold-dark dark:hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-gold-dark dark:text-gold" />
              </div>
              <span className="tag">✦ Your Privacy Matters</span>
            </div>
            <h1 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold text-brown dark:text-ivory">
              Privacy Policy
            </h1>
            <p className="text-brown-light dark:text-ivory/60 mt-3 text-sm md:text-base max-w-2xl">
              Last updated: January 1, 2025
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Introduction */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Introduction
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                At Pandit Ji Marble Murti Arts (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;), we take your privacy seriously.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you visit our website or make a purchase from us.
              </p>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed mt-3">
                Please read this privacy policy carefully. If you do not agree with the terms of this
                privacy policy, please do not access the site or use our services.
              </p>
            </GlassCard>

            {/* Information We Collect */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-brown dark:text-ivory flex items-center gap-2">
                    <User className="w-4 h-4 text-gold-dark dark:text-gold" />
                    Personal Information
                  </h3>
                  <p className="text-brown-light dark:text-ivory/70 text-sm mt-1">
                    We may collect personal information that you voluntarily provide to us when you:
                  </p>
                  <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-2 space-y-1 ml-4">
                    <li>Register for an account</li>
                    <li>Place an order</li>
                    <li>Subscribe to our newsletter</li>
                    <li>Submit a contact form or inquiry</li>
                    <li>Request a custom murti</li>
                    <li>Write a review</li>
                  </ul>
                  <p className="text-brown-light dark:text-ivory/70 text-sm mt-2">
                    This information may include your name, email address, phone number, shipping address,
                    billing address, and payment information.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-brown dark:text-ivory flex items-center gap-2">
                    <Database className="w-4 h-4 text-gold-dark dark:text-gold" />
                    Automatically Collected Information
                  </h3>
                  <p className="text-brown-light dark:text-ivory/70 text-sm mt-1">
                    We may automatically collect certain information when you visit our website, including:
                  </p>
                  <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-2 space-y-1 ml-4">
                    <li>IP address</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Pages you visit on our site</li>
                    <li>Time and date of your visit</li>
                    <li>Referring website</li>
                  </ul>
                </div>
              </div>
            </GlassCard>

            {/* How We Use Your Information */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                How We Use Your Information
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                We use the information we collect for various purposes, including to:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Send you order confirmations and updates</li>
                <li>Manage your account</li>
                <li>Send you marketing communications (if you opt-in)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our website, products, and services</li>
                <li>Protect against fraud and unauthorized transactions</li>
                <li>Comply with legal obligations</li>
              </ul>
            </GlassCard>

            {/* Information Sharing */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Information Sharing
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties.
                We may share your information with:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>Service providers who assist with order processing, payment processing, shipping, and marketing</li>
                <li>Legal authorities when required by law or to protect our rights</li>
                <li>Third parties involved in business transfers (e.g., merger, acquisition, or sale of assets)</li>
              </ul>
              <p className="text-brown-light dark:text-ivory/70 text-sm mt-3">
                We require all third-party service providers to maintain the confidentiality and security of your personal information.
              </p>
            </GlassCard>

            {/* Data Security */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-gold-dark dark:text-gold" />
                Data Security
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Secure payment processing through trusted gateways</li>
                <li>Access controls and authentication measures</li>
                <li>Regular security assessments and updates</li>
              </ul>
              <p className="text-brown-light dark:text-ivory/70 text-sm mt-3">
                However, no method of transmission over the internet or electronic storage is 100% secure,
                and we cannot guarantee absolute security.
              </p>
            </GlassCard>

            {/* Your Rights */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Your Rights
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Objection:</strong> Object to the processing of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                <li><strong>Opt-out:</strong> Opt-out of marketing communications at any time</li>
              </ul>
              <p className="text-brown-light dark:text-ivory/70 text-sm mt-3">
                To exercise these rights, please contact us at{' '}
                <a
                  href="mailto:info@panditjimurti.com"
                  className="text-gold-dark dark:text-gold hover:text-gold transition-colors"
                >
                  info@panditjimurti.com
                </a>
              </p>
            </GlassCard>

            {/* Cookies */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Cookies
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our website.
                Cookies are small files that are stored on your device. We use cookies to:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Maintain your shopping cart</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Personalize content and advertisements</li>
              </ul>
              <p className="text-brown-light dark:text-ivory/70 text-sm mt-3">
                You can control cookie preferences through your browser settings.
                However, disabling cookies may affect the functionality of our website.
              </p>
            </GlassCard>

            {/* Children's Privacy */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Children&apos;s Privacy
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                Our website is not directed at children under 13 years of age. We do not knowingly collect
                personal information from children under 13. If we learn that we have collected personal
                information from a child under 13, we will delete it promptly.
              </p>
            </GlassCard>

            {/* International Users */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                International Users
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                Our website is operated from India. If you are accessing our website from outside India,
                please note that your information may be transferred to and processed in India.
                By using our website, you consent to the transfer and processing of your information in India.
              </p>
            </GlassCard>

            {/* Changes to Privacy Policy */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Changes to This Privacy Policy
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes
                by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </GlassCard>

            {/* Contact Us */}
            <GlassCard variant="gold" hover={false}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gold-dark dark:text-gold" />
                    Contact Us
                  </h2>
                  <p className="text-brown-light dark:text-ivory/70 text-sm">
                    If you have any questions about this Privacy Policy, please contact us:
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-brown-light dark:text-ivory/70">
                    <p><strong>Email:</strong> <a href="mailto:info@panditjimurti.com" className="text-gold-dark dark:text-gold hover:text-gold transition-colors">info@panditjimurti.com</a></p>
                    <p><strong>Phone:</strong> <a href="tel:+917240364772" className="text-gold-dark dark:text-gold hover:text-gold transition-colors">+91 72403 64772</a></p>
                    <p><strong>Address:</strong> 123, Murti Marg, govindgarh, Rajasthan 302001, India</p>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="btn-gold whitespace-nowrap text-sm"
                >
                  Contact Support
                </Link>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}