// frontend/src/app/contact/page.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from '@/lib/notifications';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

// ============================================================
// Form validation schema
// ============================================================
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

// ============================================================
// Contact Page
// ============================================================
export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Contact form data:', data);
      setIsSuccess(true);
      toast.success('Message Sent', 'Thank you for contacting us. We\'ll respond as soon as possible.');
      reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      toast.error('We couldn’t send your message.', 'Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contact details
  const contactDetails = [
    {
      icon: <MapPin className="w-5 h-5 text-gold-dark" />,
      label: 'Address',
      value: 'Bhagat Singh Circle Near Kunda Mandir, Govindgarh (Alwar) Raj 301604',
    },
    {
      icon: <Phone className="w-5 h-5 text-gold-dark" />,
      label: 'Phone',
      value: '+91 72403 64772',
      link: 'tel:+917240364772',
    },
    {
      icon: <Mail className="w-5 h-5 text-gold-dark" />,
      label: 'Email',
      value: 'rajeshasd45@gmail.com',
      link: 'mailto:rajeshasd45@gmail.com',
    },
    {
      icon: <Clock className="w-5 h-5 text-gold-dark" />,
      label: 'Working Hours',
      value: 'Mon–Sat: 9:00 AM – 7:00 PM IST',
    },
  ];

  return (
    <div className="bg-ivory min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-brown via-brown-dark to-brown text-white overflow-hidden">
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
              ✦ Get in Touch
            </span>
            <h1 className="font-cinzel text-4xl md:text-5xl font-bold mt-4">
              Connect with <span className="text-gold">Divine Energy</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mt-4">
              Have a question, need a custom murti, or want to visit our workshop?
              We&apos;re here to guide you on your spiritual journey.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Contact Content */}
      <Container className="py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gold/5 h-full">
              <h2 className="font-cinzel text-2xl font-bold text-brown mb-6">
                Reach Out to Us
              </h2>
              <p className="text-brown-light text-sm mb-8">
                Whether you&apos;re looking for a specific murti, need a custom order,
                or just want to know more about our craft – we&apos;d love to hear from you.
              </p>

              <div className="space-y-6">
                {contactDetails.map((detail) => (
                  <div key={detail.label} className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">{detail.icon}</div>
                    <div>
                      <p className="text-xs text-brown-light/60 uppercase tracking-wider">
                        {detail.label}
                      </p>
                      {detail.link ? (
                        <a
                          href={detail.link}
                          className="text-brown hover:text-gold-dark transition-colors"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <p className="text-brown">{detail.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social / Quick links */}
              <div className="mt-8 pt-6 border-t border-gold/10">
                <p className="text-xs text-brown-light/60 uppercase tracking-wider mb-3">
                  Follow Us
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/panditjimarblemurtiart/"
                    className="w-10 h-10 rounded-full bg-sand/50 flex items-center justify-center text-brown-light hover:bg-gold hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <span className="sr-only">Instagram</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.youtube.com/@panditjimurtiart/featured"
                    className="w-10 h-10 rounded-full bg-sand/50 flex items-center justify-center text-brown-light hover:bg-gold hover:text-white transition-colors"
                    aria-label="YouTube"
                  >
                    <span className="sr-only">YouTube</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=100064126055158&rdid=ybHDz0Nl5EfCKqKi&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1CFWK2Ddiu%2F#"
                    className="w-10 h-10 rounded-full bg-sand/50 flex items-center justify-center text-brown-light hover:bg-gold hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gold/5">
              <h2 className="font-cinzel text-2xl font-bold text-brown mb-6">
                Send a Message
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-brown mb-1">
                      Full Name *
                    </label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      {...register('name')}
                      className={errors.name ? 'border-red-400' : ''}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brown mb-1">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register('email')}
                      className={errors.email ? 'border-red-400' : ''}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-brown mb-1">
                    Phone Number (optional)
                  </label>
                  <Input
                    id="phone"
                    placeholder="+91 72403 64772"
                    {...register('phone')}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-brown mb-1">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    placeholder="What is this about?"
                    {...register('subject')}
                    className={errors.subject ? 'border-red-400' : ''}
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-brown mb-1">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us about your requirement, inquiry, or feedback..."
                    {...register('message')}
                    className={errors.message ? 'border-red-400' : ''}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className="btn-gold w-full sm:w-auto px-8"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Sent Successfully!
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gold/5">
            <div className="relative w-full h-80 md:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3538.827786826741!2d76.98830753261099!3d27.505730782175753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3972ef60ac7bd48b%3A0x196c780ce3ec5ae0!2sPandit%20Ji%20marble%20murti%20art%20govindgarh%20Alwar%20Rajasthan!5e0!3m2!1sen!2sin!4v1783504428474!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Pandit Ji Marble Murti Arts Location"
              />
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}