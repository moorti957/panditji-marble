// frontend/src/app/refund-policy/page.tsx

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import  Container  from '../../components/ui/Container';
import  GlassCard  from '../../components/ui/GlassCard';
import { ArrowLeft, Shield, RotateCcw, Clock, Truck, AlertCircle, CheckCircle, XCircle, Mail } from 'lucide-react';

// ============================================================
// Refund Policy Page
// ============================================================
export default function RefundPolicyPage() {
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
                <RotateCcw className="w-6 h-6 text-gold-dark dark:text-gold" />
              </div>
              <span className="tag">✦ Your Satisfaction Matters</span>
            </div>
            <h1 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold text-brown dark:text-ivory">
              Refund &amp; Return Policy
            </h1>
            <p className="text-brown-light dark:text-ivory/60 mt-3 text-sm md:text-base max-w-2xl">
              Last updated: January 1, 2025
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Introduction */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Our Commitment to You
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                At Pandit Ji Marble Murti Arts, we take great pride in the quality and craftsmanship of
                our handcrafted murtis. Each piece is created with devotion and care by our master artisans
                in Jaipur. We want you to be completely satisfied with your purchase.
              </p>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed mt-3">
                If for any reason you are not satisfied with your purchase, we offer a fair and transparent
                refund and return policy. Please read this policy carefully before making a purchase.
              </p>
            </GlassCard>

            {/* Return Eligibility */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Return Eligibility
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                To be eligible for a return, the following conditions must be met:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>
                  <strong>Timeframe:</strong> Returns must be initiated within <strong>7 days</strong> of delivery.
                </li>
                <li>
                  <strong>Condition:</strong> The murti must be unused, undamaged, and in its original packaging.
                </li>
                <li>
                  <strong>Proof of Purchase:</strong> A valid order number or invoice is required for all returns.
                </li>
                <li>
                  <strong>Custom Orders:</strong> Custom-made murtis are <strong>non-returnable</strong> unless damaged during shipping.
                </li>
              </ul>
            </GlassCard>

            {/* Non-Returnable Items */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-maroon dark:text-maroon-light" />
                Non-Returnable Items
              </h2>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>Custom-ordered murtis (unless damaged in transit)</li>
                <li>Items that have been used, installed, or damaged by the customer</li>
                <li>Items returned without original packaging</li>
                <li>Items returned after the 7-day return window</li>
                <li>Items that were purchased during clearance or final sale</li>
              </ul>
            </GlassCard>

            {/* Return Process */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-gold-dark dark:text-gold" />
                How to Initiate a Return
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                To initiate a return, please follow these steps:
              </p>
              <ol className="list-decimal list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-2 ml-4">
                <li>
                  <strong>Contact Us:</strong> Email us at{' '}
                  <a
                    href="mailto:info@panditjimurti.com"
                    className="text-gold-dark dark:text-gold hover:text-gold transition-colors"
                  >
                    info@panditjimurti.com
                  </a>
                  {' '}or WhatsApp us at +91 72403 64772 with your order number and reason for return.
                </li>
                <li>
                  <strong>Receive Approval:</strong> Our team will review your request and provide return authorization
                  and instructions.
                </li>
                <li>
                  <strong>Pack Securely:</strong> Package the item securely in its original packaging to prevent damage
                  during transit.
                </li>
                <li>
                  <strong>Ship Back:</strong> Ship the item back to us using a trackable shipping method.
                  Return shipping costs are the responsibility of the customer unless the item is defective or damaged.
                </li>
              </ol>
            </GlassCard>

            {/* Refund Processing */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Refund Processing
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                Once we receive and inspect your returned item, we will process your refund. Please note:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>
                  <strong>Processing Time:</strong> Refunds are processed within <strong>5-7 business days</strong>{' '}
                  of receiving the returned item.
                </li>
                <li>
                  <strong>Refund Method:</strong> Refunds are issued to the original payment method used for the purchase.
                </li>
                <li>
                  <strong>Shipping Costs:</strong> Original shipping costs are non-refundable unless the return is due
                  to our error or a defective product.
                </li>
                <li>
                  <strong>Restocking Fee:</strong> A 10% restocking fee may apply for non-defective returns.
                </li>
              </ul>
            </GlassCard>

            {/* Damaged or Defective Items */}
            <GlassCard variant="gold" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-maroon dark:text-maroon-light" />
                Damaged or Defective Items
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                If your murti arrives damaged or defective, we sincerely apologize. We take great care in packaging
                our products, but occasionally damage can occur during shipping.
              </p>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed mt-3">
                Please follow these steps:
              </p>
              <ol className="list-decimal list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-2 ml-4">
                <li>
                  <strong>Document:</strong> Take clear photos of the damaged item and packaging showing the damage.
                </li>
                <li>
                  <strong>Contact Us:</strong> Email us at{' '}
                  <a
                    href="mailto:info@panditjimurti.com"
                    className="text-gold-dark dark:text-gold hover:text-gold transition-colors"
                  >
                    info@panditjimurti.com
                  </a>
                  {' '}within 48 hours of delivery with your photos and order number.
                </li>
                <li>
                  <strong>Resolution:</strong> We will arrange for a replacement or full refund, including shipping costs.
                </li>
              </ol>
            </GlassCard>

            {/* Cancellation Policy */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Cancellation Policy
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                You may cancel your order within <strong>24 hours</strong> of placing it for a full refund.
                After 24 hours, if the order has not yet been shipped, a cancellation fee of 10% may apply.
              </p>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed mt-3">
                Once the order has been shipped, it cannot be canceled and will be subject to our standard return policy.
              </p>
            </GlassCard>

            {/* Exchange Policy */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Exchange Policy
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                If you would like to exchange your murti for a different design or size, please contact us
                within 7 days of delivery. Exchanges are subject to availability and may incur additional
                shipping costs.
              </p>
            </GlassCard>

            {/* International Returns */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-gold-dark dark:text-gold" />
                International Returns
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                For international orders, the customer is responsible for return shipping costs and any
                customs duties or taxes. Please ensure all customs forms are properly completed to avoid delays.
              </p>
            </GlassCard>

            {/* Contact Us */}
            <GlassCard variant="gold" hover={false}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gold-dark dark:text-gold" />
                    Need Help?
                  </h2>
                  <p className="text-brown-light dark:text-ivory/70 text-sm">
                    If you have any questions about our refund and return policy, please don&apos;t hesitate to contact us:
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-brown-light dark:text-ivory/70">
                    <p>
                      <strong>Email:</strong>{' '}
                      <a
                        href="mailto:info@panditjimurti.com"
                        className="text-gold-dark dark:text-gold hover:text-gold transition-colors"
                      >
                        info@panditjimurti.com
                      </a>
                    </p>
                    <p>
                      <strong>WhatsApp:</strong>{' '}
                      <a
                        href="https://wa.me/917240364772"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-dark dark:text-gold hover:text-gold transition-colors"
                      >
                        +91 72403 64772
                      </a>
                    </p>
                    <p>
                      <strong>Phone:</strong>{' '}
                      <a
                        href="tel:+917240364772"
                        className="text-gold-dark dark:text-gold hover:text-gold transition-colors"
                      >
                        +91 72403 64772
                      </a>
                    </p>
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