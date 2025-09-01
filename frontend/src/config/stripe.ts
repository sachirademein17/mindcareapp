// 📁 frontend/src/config/stripe.ts
import { loadStripe } from '@stripe/stripe-js'

// This is your test publishable API key.
const stripePublishableKey = 'pk_test_51S0dm9HBA6CHYnL5qzSNdXfI8qJmELx7qG0GrNIVLl7XNgb9WK6HfLjKr3PjAy2KKxkFoOVvQqZ8T2L6YGjq2YC100bYQjn4zL'

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
export const stripePromise = loadStripe(stripePublishableKey)

export default stripePromise
