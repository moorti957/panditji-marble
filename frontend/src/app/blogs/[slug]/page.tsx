// frontend/src/app/blogs/[slug]/page.tsx

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, User, Tag, ArrowLeft, Share2, Clock } from 'lucide-react';

// Components
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

// Services (server-side fetch)
import { blogApi, type BlogPost } from '@/services/blogApi';

// ============================================================
// Generate static params (optional – for static generation)
// ============================================================
export async function generateStaticParams() {
  try {
    const posts = await blogApi.getAll(); // This would be server-side
    return posts.map((post: BlogPost) => ({
      slug: post.slug,
    }));
  } catch {
    return []; // fallback to dynamic rendering
  }
}

// ============================================================
// Generate metadata for SEO
// ============================================================
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await blogApi.getBySlug(slug).catch(() => null);
  if (!post) {
    return {
      title: 'Blog Post Not Found | Pandit Ji Marble Murti Arts',
    };
  }

  return {
    title: `${post.title} | Pandit Ji Marble Murti Arts Blog`,
    description: post.excerpt || `Read about ${post.title} on our divine blog.`,
    keywords: post.tags?.join(', ') || '',
    openGraph: {
      title: post.title,
      description: post.excerpt || `Read about ${post.title}`,
      images: [{ url: post.coverImage }],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '',
      images: [post.coverImage],
    },
  };
}

// ============================================================
// Blog Detail Page (Server Component)
// ============================================================
export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post: BlogPost | null = null;
  let error = false;

  try {
    post = await blogApi.getBySlug(slug);
  } catch {
    error = true;
  }

  // If post not found or error, trigger 404
  if (!post || error) {
    notFound();
  }

  // Format date
  const formattedDate = format(new Date(post.publishedAt), 'MMMM d, yyyy');

  return (
    <Container className="py-12 md:py-20">
      {/* Back to blogs */}
      <Link
        href="/blogs"
        className="inline-flex items-center gap-2 text-brown-light hover:text-gold-dark transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all articles</span>
      </Link>

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 text-sm text-brown-light/70 mb-4">
            <span className="bg-gold/10 text-gold-dark px-3 py-1 rounded-full text-xs font-semibold">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime} min read
            </span>
          </div>

          <h1 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold text-brown leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-brown-light/80">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex items-center gap-1.5 text-gold-dark hover:text-gold transition-colors ml-auto"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-lg mb-10">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>

        {/* Content */}
        <div
          className="prose prose-lg prose-brown max-w-none
                     prose-headings:font-cinzel prose-headings:text-brown
                     prose-a:text-gold-dark hover:prose-a:text-gold
                     prose-strong:text-brown
                     prose-blockquote:border-l-gold prose-blockquote:text-brown-light
                     prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gold/10">
            <Tag className="w-4 h-4 text-brown-light shrink-0 mt-1" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm bg-sand/60 px-3 py-1 rounded-full text-brown-light"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio (optional) */}
        <div className="mt-12 p-6 bg-sand/30 rounded-2xl border border-gold/10 flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center text-2xl shrink-0">
            {post.authorAvatar ? (
              <Image
                src={post.authorAvatar}
                alt={post.author}
                width={56}
                height={56}
                className="rounded-full"
              />
            ) : (
              <User className="w-6 h-6 text-brown-light" />
            )}
          </div>
          <div>
            <h4 className="font-cinzel text-lg font-semibold text-brown">
              {post.author}
            </h4>
            <p className="text-sm text-brown-light/80 mt-1">
              Handcrafted with devotion since 1991. Sharing stories from the heart of govindgarh.
            </p>
          </div>
        </div>
      </article>

      {/* Related Posts (if available from API) */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="mt-20 pt-10 border-t border-gold/10">
          <h2 className="font-cinzel text-2xl font-bold text-brown mb-8">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {post.relatedPosts.map((related) => (
              <Link
                key={related.id}
                href={`/blogs/${related.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gold/5 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[16/9] bg-sand">
                  <Image
                    src={related.coverImage}
                    alt={related.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-cinzel text-base font-semibold text-brown group-hover:text-gold-dark transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-xs text-brown-light/70 mt-1">
                    {format(new Date(related.publishedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}