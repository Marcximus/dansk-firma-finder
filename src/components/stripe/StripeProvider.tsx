import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51S7GeACiBj9ds2dSyxaVwJDD8zGPxKhWKjEgK9h0JlL1pGdlpFpJDpNMdeyEGVGWFnN0xO6yXfO8QBzJpFJfYvvj00qQQvN8XC');

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children, clientSecret }) => {
  const options = clientSecret ? { clientSecret } : undefined;

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};