import { Router } from 'express';
import { Setting } from '../models/Setting';
import { auth } from '../middlewares/auth';

const router = Router();

// Get settings
router.get('/', async (_req, res) => {
  try {
    let settings = await Setting.findOne({});
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
});

// Update Store Settings
router.put('/store', auth, async (req, res) => {
  try {
    const { storeName, storeEmail, storePhone, storeAddress, storeDescription, currency } = req.body;
    const settings = await Setting.findOneAndUpdate(
      {},
      { 
        $set: { 
          storeName, 
          storeEmail, 
          storePhone, 
          storeAddress, 
          storeDescription, 
          currency 
        } 
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update store settings' });
  }
});

// Update Payment Settings
router.put('/payment', auth, async (req, res) => {
  try {
    const { taxRate, codEnabled, codFee, upiEnabled, cardEnabled } = req.body;
    const settings = await Setting.findOneAndUpdate(
      {},
      { 
        $set: { 
          taxRate, 
          gstPercentage: taxRate,
          codEnabled, 
          codFee, 
          upiEnabled, 
          cardEnabled,
          'paymentMethods.cod': codEnabled,
          'paymentMethods.upi': upiEnabled,
          'paymentMethods.card': cardEnabled
        } 
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update payment settings' });
  }
});

// Update Shipping Settings
router.put('/shipping', auth, async (req, res) => {
  try {
    const { freeShippingThreshold, standardShippingCost, expressShippingCost, internationalShippingEnabled } = req.body;
    const settings = await Setting.findOneAndUpdate(
      {},
      { 
        $set: { 
          freeShippingThreshold, 
          standardShippingCost, 
          expressShippingCost, 
          internationalShippingEnabled,
          'shipping.standard': standardShippingCost,
          'shipping.express': expressShippingCost
        } 
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update shipping settings' });
  }
});

// Update Social Settings
router.put('/social', auth, async (req, res) => {
  try {
    const { facebook, instagram, youtube, twitter, whatsapp } = req.body;
    const settings = await Setting.findOneAndUpdate(
      {},
      { 
        $set: { 
          'socialLinks.facebook': facebook,
          'socialLinks.instagram': instagram,
          'socialLinks.youtube': youtube,
          'socialLinks.twitter': twitter,
          'socialLinks.whatsapp': whatsapp
        } 
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update social settings' });
  }
});

// Update SEO Settings
router.put('/seo', auth, async (req, res) => {
  try {
    const { metaTitle, metaDescription, metaKeywords, googleAnalyticsId } = req.body;
    const settings = await Setting.findOneAndUpdate(
      {},
      { 
        $set: { 
          'seo.metaTitle': metaTitle,
          'seo.metaDescription': metaDescription,
          'seo.metaKeywords': metaKeywords,
          'seo.googleAnalyticsId': googleAnalyticsId
        } 
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update SEO settings' });
  }
});

// Update Contact Settings
router.put('/contact', auth, async (req, res) => {
  try {
    const { contactEmail, contactPhone, contactAddress, whatsappNumber } = req.body;
    const settings = await Setting.findOneAndUpdate(
      {},
      { 
        $set: { 
          'contact.email': contactEmail,
          'contact.phone': contactPhone,
          'contact.address': contactAddress,
          'contact.whatsapp': whatsappNumber
        } 
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update contact settings' });
  }
});

export default router;

