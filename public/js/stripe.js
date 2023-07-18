import axios from 'axios';
import { showAlert } from './alert';

import { loadStripe } from '@stripe/stripe-js';

export const bookTour = async (tourId) => {
  try {
    const stripe = await loadStripe(
      'pk_test_51NUCfvIH6jXPMpb7bKELKOrhaH0yMABwHqJk5Uqeo40CHhJ39Brg0Dod88PHUM7cAZGk8JIRbO8vbGMAISjZ0TuN00Yctx6EGk'
    );

    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2) Create checkout form and charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
