import { Request, Response } from 'express';
import { Banner } from '../models/Banner';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Testimonial } from '../models/Testimonial';
import { FAQ } from '../models/FAQ';
import { asyncHandler } from '../middlewares/errorHandler';

export default class HomeController {
  static getAllHomeData = asyncHandler(async (_req: Request, res: Response) => {
    const [
      banners,
      categories,
      featuredProducts,
      trendingProducts,
      testimonials,
      faqs,
    ] = await Promise.all([
      Banner.find({ isActive: true })
        .sort({ displayOrder: 1 })
        .lean(),

      Category.find({ isFeatured: true, isActive: true })
        .sort({ displayOrder: 1 })
        .lean(),

      Product.find({ isFeatured: true, isActive: true })
        .limit(8)
        .sort({ createdAt: -1 })
        .lean(),

      Product.find({ isActive: true })
        .limit(8)
        .sort({ viewCount: -1 })
        .lean(),

      Testimonial.find({ isActive: true })
        .limit(6)
        .sort({ createdAt: -1 })
        .lean(),

      FAQ.find({ isActive: true })
        .sort({ displayOrder: 1 })
        .lean(),
    ]);

    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat: any) => ({
        ...cat,
        productCount: await Product.countDocuments({
          category: cat._id,
          isActive: true,
        }),
      }))
    );

    const stats = {
      totalCustomers: 12000,
      totalProducts: await Product.countDocuments({ isActive: true }),
      totalOrders: 3500,
      yearsOfExperience: 35,
    };

    res.status(200).json({
      banners,
      categories: categoriesWithCounts,
      featuredProducts,
      trendingProducts,
      testimonials,
      faqs,
      stats,
      instagramPosts: [],
      youtubeVideos: [],
    });
  });

  static getBanners = asyncHandler(async (_req: Request, res: Response) => {
    const banners = await Banner.find({ isActive: true })
      .sort({ displayOrder: 1 })
      .lean();

    res.json(banners);
  });

  static getCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await Category.find({
      isFeatured: true,
      isActive: true,
    }).lean();

    res.json(categories);
  });

  static getFeaturedProducts = asyncHandler(async (_req: Request, res: Response) => {
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    })
      .limit(8)
      .lean();

    res.json(products);
  });

  static getTestimonials = asyncHandler(async (_req: Request, res: Response) => {
    const testimonials = await Testimonial.find({
      isActive: true,
    })
      .limit(6)
      .lean();

    res.json(testimonials);
  });

  static getFAQs = asyncHandler(async (_req: Request, res:Response) => {
    const faqs = await FAQ.find({
      isActive: true,
    })
      .sort({ displayOrder: 1 })
      .lean();

    res.json(faqs);
  });

  static getStats = asyncHandler(async (_req: Request, res: Response) => {
    res.json({
      totalCustomers: 12000,
      totalProducts: await Product.countDocuments({ isActive: true }),
      totalOrders: 3500,
      yearsOfExperience: 35,
    });
  });

  static getInstagramPosts = asyncHandler(async (_req: Request, res: Response) => {
    res.json([]);
  });

  static getYouTubeVideos = asyncHandler(async (_req: Request, res: Response) => {
    res.json([]);
  });
}