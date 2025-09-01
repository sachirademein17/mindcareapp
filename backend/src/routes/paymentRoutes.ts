// 📁 backend/src/routes/paymentRoutes.ts
import express from 'express'
import { verifyToken } from '../middlewares/auth.middleware'
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentDetails,
  getUserPayments,
  processRefund,
  handleStripeWebhook,
  getStripePublicKey,
} from '../controllers/payment.controller'

const router = express.Router()

// Public routes
router.get('/stripe/public-key', getStripePublicKey)

// Webhook route (raw body needed for Stripe signature verification)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook)

// Protected routes
router.use(verifyToken)

// Payment Intent routes
router.post('/create-intent', createPaymentIntent)
router.post('/confirm', confirmPayment)

// Payment information routes
router.get('/user', getUserPayments)
router.get('/:paymentId', getPaymentDetails)

// Refund routes
router.post('/refund', processRefund)

export default router
