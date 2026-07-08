// frontend/src/app/shipping-policy/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import  Container  from '../../components/ui/Container';
import  GlassCard  from '../../components/ui/GlassCard';
import { get } from '@/services/apiClient';
import {
  ArrowLeft,
  Truck,
  Clock,
  MapPin,
  Globe,
  Package,
  Shield,
  CreditCard,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// ============================================================
// Shipping Policy Page
// ============================================================
export default function ShippingPolicyPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response: any = await get('/settings');
        setSettings(response?.data || response);
      } catch (error) {
        console.error('Failed to load shipping settings', error);
      }
    };

    fetchSettings();
  }, []);

  const standardShippingCost = settings?.shipping?.standard ?? settings?.standardShippingCost ?? 500;
  const expressShippingCost = settings?.shipping?.express ?? settings?.expressShippingCost ?? 1200;
  const freeShippingThreshold = settings?.freeShippingThreshold ?? 5000;
  const gstPercentage = settings?.gstPercentage ?? settings?.taxRate ?? 18;

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
                <Truck className="w-6 h-6 text-gold-dark dark:text-gold" />
              </div>
              <span className="tag">✦ Safe &amp; Secure Delivery</span>
            </div>
            <h1 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold text-brown dark:text-ivory">
              Shipping Policy
            </h1>
            <p className="text-brown-light dark:text-ivory/60 mt-3 text-sm md:text-base max-w-2xl">
              Last updated: January 1, 2025
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Introduction */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Our Shipping Commitment
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                At Pandit Ji Marble Murti Arts, we understand that your divine murti is more than just
                a purchase – it&apos;s a sacred addition to your home or temple. That&apos;s why we take the utmost
                care in packaging and shipping every order to ensure it arrives safely and on time.
              </p>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed mt-3">
                This Shipping Policy outlines our shipping methods, costs, delivery times, and related
                information to help you understand what to expect when you order from us.
              </p>
            </GlassCard>

            {/* Shipping Destinations */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-gold-dark dark:text-gold" />
                Shipping Destinations
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                We ship our handcrafted murtis to customers across the globe. Our shipping destinations include:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>
                  <strong>Domestic (India):</strong> All states and union territories across India.
                </li>
                <li>
                  <strong>International:</strong> We ship to over 50 countries including USA, UK, Canada,
                  Australia, UAE, Singapore, Germany, France, Japan, and many more.
                </li>
              </ul>
              <p className="text-brown-light dark:text-ivory/70 text-sm mt-3">
                If you are located in a country not listed, please contact us and we will do our best
                to arrange shipping to your location.
              </p>
            </GlassCard>

            {/* Shipping Methods & Delivery Times */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-gold-dark dark:text-gold" />
                Shipping Methods &amp; Delivery Times
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                We offer multiple shipping options to suit your needs. Delivery times vary based on
                destination and shipping method selected.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold/10 dark:border-gold/5">
                      <th className="text-left py-2 font-semibold text-brown dark:text-ivory">Shipping Method</th>
                      <th className="text-left py-2 font-semibold text-brown dark:text-ivory">Delivery Time</th>
                      <th className="text-left py-2 font-semibold text-brown dark:text-ivory">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="text-brown-light dark:text-ivory/70">
                    <tr className="border-b border-gold/5 dark:border-gold/5">
                      <td className="py-2">
                        <strong>Standard (Domestic)</strong>
                      </td>
                      <td className="py-2">5-7 business days</td>
                      <td className="py-2">₹{standardShippingCost === 0 ? '0' : standardShippingCost} (Free above ₹{freeShippingThreshold})</td>
                    </tr>
                    <tr className="border-b border-gold/5 dark:border-gold/5">
                      <td className="py-2">
                        <strong>Express (Domestic)</strong>
                      </td>
                      <td className="py-2">2-3 business days</td>
                      <td className="py-2">₹{expressShippingCost}</td>
                    </tr>
                    <tr className="border-b border-gold/5 dark:border-gold/5">
                      <td className="py-2">
                        <strong>International Standard</strong>
                      </td>
                      <td className="py-2">7-14 business days</td>
                      <td className="py-2">Calculated at checkout</td>
                    </tr>
                    <tr>
                      <td className="py-2">
                        <strong>International Express</strong>
                      </td>
                      <td className="py-2">5-7 business days</td>
                      <td className="py-2">Calculated at checkout</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-brown-light/50 dark:text-ivory/30 mt-3">
                * Delivery times are estimates and may vary due to unforeseen circumstances, customs delays, or holidays.
              </p>
            </GlassCard>

            {/* Order Processing Time */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-gold-dark dark:text-gold" />
                Order Processing Time
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                Every murti is handcrafted with care and devotion. Our order processing time includes
                the time needed for quality checks and packaging:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>
                  <strong>Standard Orders:</strong> 1-2 business days for processing.
                </li>
                <li>
                  <strong>Custom Orders:</strong> 5-10 business days for processing, depending on complexity.
                </li>
              </ul>
              <p className="text-brown-light dark:text-ivory/70 text-sm mt-3">
                <strong>Note:</strong> Processing time is separate from shipping time. Orders placed on weekends
                or holidays will be processed on the next business day.
              </p>
            </GlassCard>

            {/* Shipping Costs */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-gold-dark dark:text-gold" />
                Shipping Costs
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                Shipping costs are calculated based on the weight, size, and destination of your order.
                Here&apos;s what you can expect, with current store settings applied:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>
                  <strong>Domestic (India):</strong> Standard shipping is ₹{standardShippingCost} and becomes free above ₹{freeShippingThreshold}.
                </li>
                <li>
                  <strong>International:</strong> Shipping costs are calculated at checkout based on your
                  location and the weight of the package.
                </li>
                <li>
                  <strong>Express Shipping:</strong> Express delivery is available for ₹{expressShippingCost}.
                </li>
              </ul>
              <p className="text-brown-light dark:text-ivory/70 text-sm mt-3">
                GST of {gstPercentage}% is applied to the order subtotal, and the exact shipping cost is shown at checkout before payment.
              </p>
            </GlassCard>

            {/* Tracking Information */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-gold-dark dark:text-gold" />
                Tracking Your Order
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                We provide tracking information for all orders so you can monitor your package&apos;s journey:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>
                  Once your order is shipped, you will receive a confirmation email with a tracking number.
                </li>
                <li>
                  You can track your package using the link provided in the email or by visiting the
                  carrier&apos;s website.
                </li>
                <li>
                  Tracking updates may take 24-48 hours to appear after shipment.
                </li>
              </ul>
            </GlassCard>

            {/* International Shipping */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-gold-dark dark:text-gold" />
                International Shipping
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                For international orders, please note the following:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>
                  <strong>Customs &amp; Duties:</strong> International shipments may be subject to customs fees,
                  import duties, or taxes. These charges are the responsibility of the customer.
                </li>
                <li>
                  <strong>Customs Delays:</strong> Packages may be held by customs for inspection, which can
                  cause delivery delays. We are not responsible for such delays.
                </li>
                <li>
                  <strong>Shipping Restrictions:</strong> Some countries may have restrictions on importing
                  religious artifacts or certain materials. Please check with your local customs office
                  before placing an order.
                </li>
                <li>
                  <strong>Pricing:</strong> International shipping costs do not include customs fees or import taxes.
                </li>
              </ul>
            </GlassCard>

            {/* Shipping Address */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-gold-dark dark:text-gold" />
                Shipping Address Accuracy
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                Please ensure that your shipping address is accurate and complete to avoid delivery issues:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>Include full name, street address, apartment/suite number, city, state/province, pincode, and country.</li>
                <li>Provide a valid phone number for delivery updates.</li>
                <li>
                  If you need to change your shipping address after placing an order, please contact us immediately.
                  We cannot modify the address once the order has been shipped.
                </li>
                <li>
                  If a package is returned to us due to an incorrect address, you will be responsible for
                  the reshipping costs.
                </li>
              </ul>
            </GlassCard>

            {/* Delivery Delays */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-gold-dark dark:text-gold" />
                Delivery Delays
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                While we strive to ensure timely delivery, sometimes delays may occur due to:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>Weather conditions and natural disasters</li>
                <li>Customs clearance procedures</li>
                <li>Carrier operational issues</li>
                <li>High volume periods (holidays, festivals)</li>
                <li>Incorrect address or incomplete delivery information</li>
              </ul>
              <p className="text-brown-light dark:text-ivory/70 text-sm mt-3">
                If your delivery is delayed, please check your tracking information or contact us for assistance.
              </p>
            </GlassCard>

            {/* Packaging */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-gold-dark dark:text-gold" />
                Premium Packaging
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                Every murti is carefully packaged to ensure it reaches you in perfect condition. Our packaging includes:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>Custom-designed boxes with protective cushioning</li>
                <li>Bubble wrap and foam padding for fragile items</li>
                <li>Secure sealing and tamper-proof packaging</li>
                <li>Gift wrapping options available upon request</li>
              </ul>
              <p className="text-brown-light dark:text-ivory/70 text-sm mt-3">
                If you wish to add a personalized gift message or request special packaging, please add a note
                at checkout or contact us.
              </p>
            </GlassCard>

            {/* Contact Us */}
            <GlassCard variant="gold" hover={false}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gold-dark dark:text-gold" />
                    Need Help with Shipping?
                  </h2>
                  <p className="text-brown-light dark:text-ivory/70 text-sm">
                    If you have any questions about shipping, delivery, or tracking, please don&apos;t hesitate to contact us:
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
                    <p>
                      <strong>Business Hours:</strong> Mon–Sat, 9:00 AM – 7:00 PM IST
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