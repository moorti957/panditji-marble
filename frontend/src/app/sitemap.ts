import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.panditjimarblemurtiarts.in";

  const currentDate = new Date();

  return [
    // Home
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1,
    },

    // Products
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.95,
    },

    // Categories
    {
      url: `${baseUrl}/categories`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    // Gallery
    {
      url: `${baseUrl}/gallery`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },

    // Blogs
    {
      url: `${baseUrl}/blogs`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.85,
    },

    // About
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // Contact
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // FAQ
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.75,
    },

    // Track Order
    {
      url: `${baseUrl}/track-order`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Privacy Policy
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.4,
    },

    // Shipping Policy
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.4,
    },

    // Refund Policy
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.4,
    },

    // Terms & Conditions
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}