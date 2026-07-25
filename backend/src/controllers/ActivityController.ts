import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Product } from '../models/Product';
import { ProductClick } from '../models/ProductClick';
import { SearchHistory } from '../models/SearchHistory';
import { FavoriteActivity } from '../models/FavoriteActivity';
import { CartActivity } from '../models/CartActivity';
import { getSocketServer } from '../utils/socket';

const emitUserActivityUpdate = (userId: string, type: string, payload: unknown) => {
  const io = getSocketServer();
  if (!io || !userId) return;
  io.to(`user-${userId}`).emit('user-activity-updated', {
    userId,
    type,
    payload,
    timestamp: new Date(),
  });
};

export class ActivityController {
  static async trackClick(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = req.user?._id?.toString();

      const product = await Product.findById(id).select('name category');
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const update = {
        product: product._id,
        productName: product.name,
        category: typeof product.category === 'string' ? product.category : product.category?.toString(),
        lastClickedAt: new Date(),
      } as any;

      const filter: any = { product: product._id };
      if (userId) filter.user = userId;

      const click = await ProductClick.findOneAndUpdate(
        filter,
        {
          $inc: { clickCount: 1 },
          $set: update,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      if (userId) {
        emitUserActivityUpdate(userId, 'product_click', {
          productId: id,
          clickCount: click.clickCount,
          productName: product.name,
        });
      }

      return res.json({ success: true, data: click });
    } catch (error) {
      console.error('Track click error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async logSearch(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id?.toString();
      const { keyword, resultCount = 0, device, ip } = req.body;

      if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
        return res.status(400).json({ success: false, message: 'Search keyword is required' });
      }

      const search = await SearchHistory.create({
        user: userId,
        keyword: keyword.trim(),
        resultCount: Number(resultCount) || 0,
        device: device?.trim(),
        ip: ip?.trim(),
      });

      if (userId) {
        emitUserActivityUpdate(userId, 'search', {
          keyword: search.keyword,
          resultCount: search.resultCount,
        });
      }

      return res.status(201).json({ success: true, data: search });
    } catch (error) {
      console.error('Log search error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async logFavoriteActivity(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id?.toString();
      const { productId, action } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }
      if (action !== 'added' && action !== 'removed') {
        return res.status(400).json({ success: false, message: 'Action must be added or removed' });
      }

      const product = await Product.findById(productId).select('name category');
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const favorite = await FavoriteActivity.create({
        user: userId,
        product: product._id,
        action,
        timestamp: new Date(),
      });

      emitUserActivityUpdate(userId, 'favorite', {
        productId,
        action,
        productName: product.name,
      });

      return res.status(201).json({ success: true, data: favorite });
    } catch (error) {
      console.error('Log favorite activity error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async logCartActivity(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?._id?.toString();
      const { productId, action, quantity = 1 } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }
      if (action !== 'added' && action !== 'removed') {
        return res.status(400).json({ success: false, message: 'Action must be added or removed' });
      }

      const product = await Product.findById(productId).select('name category');
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const cartActivity = await CartActivity.create({
        user: userId,
        product: product._id,
        action,
        quantity: Number(quantity) || 1,
        addedAt: action === 'added' ? new Date() : undefined,
        removedAt: action === 'removed' ? new Date() : undefined,
        timestamp: new Date(),
      });

      emitUserActivityUpdate(userId, 'cart', {
        productId,
        action,
        quantity: cartActivity.quantity,
      });

      return res.status(201).json({ success: true, data: cartActivity });
    } catch (error) {
      console.error('Log cart activity error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
