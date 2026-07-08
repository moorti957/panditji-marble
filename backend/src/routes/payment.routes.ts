import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { auth } from '../middlewares/auth';

const router = Router();

router.post('/create-order', auth, PaymentController.createOrder);
router.post('/verify', auth, PaymentController.verify);

export default router;
