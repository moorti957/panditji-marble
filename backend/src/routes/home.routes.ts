// backend/src/routes/home.routes.ts

import { Router } from 'express';
import HomeController from '../controllers/Home.controller';

const router = Router();

// ============================================================
// Home Routes
// ============================================================

// Get complete homepage data
router.get('/', HomeController.getAllHomeData);

// Individual sections
router.get('/banners', HomeController.getBanners);
router.get('/categories', HomeController.getCategories);
router.get('/products', HomeController.getFeaturedProducts);
router.get('/testimonials', HomeController.getTestimonials);
router.get('/faqs', HomeController.getFAQs);
router.get('/stats', HomeController.getStats);
router.get('/instagram', HomeController.getInstagramPosts);
router.get('/youtube', HomeController.getYouTubeVideos);

export default router;
