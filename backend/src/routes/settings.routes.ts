import { Router } from 'express';
import { Setting } from '../models/Setting';
import { auth } from '../middlewares/auth';

const router = Router();

const normalizeSettingsPayload = (payload: any = {}) => {
  const paymentMethods = payload.paymentMethods || {};
  const shipping = payload.shipping || {};

  return {
    ...payload,
    paymentMethods: {
      cod: paymentMethods.cod ?? payload.codEnabled ?? true,
      upi: paymentMethods.upi ?? payload.upiEnabled ?? true,
      card: paymentMethods.card ?? payload.cardEnabled ?? true,
      wallet: paymentMethods.wallet ?? payload.walletEnabled ?? true,
      netBanking: paymentMethods.netBanking ?? payload.netBankingEnabled ?? true,
    },
    gstPercentage: payload.gstPercentage ?? payload.taxRate ?? 18,
    taxRate: payload.gstPercentage ?? payload.taxRate ?? 18,
    shipping: {
      standard: shipping.standard ?? payload.standardShippingCost ?? 500,
      express: shipping.express ?? payload.expressShippingCost ?? 1200,
    },
    freeShippingThreshold: payload.freeShippingThreshold ?? 5000,
    standardShippingCost: shipping.standard ?? payload.standardShippingCost ?? 500,
    expressShippingCost: shipping.express ?? payload.expressShippingCost ?? 1200,
    giftWrapCharge: payload.giftWrapCharge ?? payload.giftWrapCost ?? 99,
    advancePaymentPercentage: payload.advancePaymentPercentage ?? payload.advancePaymentPercent ?? 25,
    advancePaymentPercent: payload.advancePaymentPercentage ?? payload.advancePaymentPercent ?? 25,
    codEnabled: paymentMethods.cod ?? payload.codEnabled ?? true,
    upiEnabled: paymentMethods.upi ?? payload.upiEnabled ?? true,
    cardEnabled: paymentMethods.card ?? payload.cardEnabled ?? true,
    walletEnabled: paymentMethods.wallet ?? payload.walletEnabled ?? true,
    netBankingEnabled: paymentMethods.netBanking ?? payload.netBankingEnabled ?? true,
  };
};

router.get('/', async (_req, res) => {
  try {
    const settings = await Setting.findOne({});
    res.json({ success: true, data: settings || new Setting() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
});

router.patch('/admin/settings', auth, async (req, res) => {
  try {
    const payload = normalizeSettingsPayload(req.body || {});
    const settings = await Setting.findOneAndUpdate({}, { $set: payload }, { new: true, upsert: true });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

router.patch('/', auth, async (req, res) => {
  try {
    const payload = normalizeSettingsPayload(req.body || {});
    const settings = await Setting.findOneAndUpdate({}, { $set: payload }, { new: true, upsert: true });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

export default router;
