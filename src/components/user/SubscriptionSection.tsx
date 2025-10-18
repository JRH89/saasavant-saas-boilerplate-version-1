'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createCheckoutSession } from '@/lib/stripe/client';
import { initFirebase } from '../../../firebase';
import { useAuth } from '../../context/AuthProvider';
import LoginForm from './SignIn';
import { PricingPlan } from '@/types/user';

// Pricing Plan Data
const pricingPlans: PricingPlan[] = [
  {
    title: 'Monthly',
    price: process.env.NEXT_PUBLIC_MONTHLY_PRICE || '9.99',
    description: 'Unlimited projects. Analytics.',
    isPopular: false,
    url: null,
    features: ['Unlimited projects', 'Full analytics', '24/7 support'],
    priceId: process.env.NEXT_PUBLIC_MONTHLY_PRICE_ID || '',
  },
  {
    title: 'Yearly',
    price: process.env.NEXT_PUBLIC_YEARLY_PRICE || '99.99',
    description: 'Save 15%!',
    isPopular: true,
    url: null,
    features: ['Unlimited projects', 'Full analytics', '24/7 support'],
    priceId: process.env.NEXT_PUBLIC_YEARLY_PRICE_ID || '',
  },
];

const SubscriptionSection = () => {
  const { user } = useAuth();
  const router = useRouter();
  const app = initFirebase();

  const [loadingPlanIndex, setLoadingPlanIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, index: number) => {
    if (!priceId) {
      setError('Invalid price ID');
      return;
    }

    setLoadingPlanIndex(index);
    setError(null);

    try {
      const checkoutUrl = await createCheckoutSession(app, priceId);
      router.push(checkoutUrl);
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      setError(error.message || 'Failed to create checkout session');
    } finally {
      setLoadingPlanIndex(null);
    }
  };

  const handleClick = (url: string | null, priceId: string, index: number) => {
    if (url === null && priceId) {
      handleCheckout(priceId, index);
    } else if (url) {
      window.location.href = url;
    }
  };

  return (
    <div
      id="pricing"
      className="min-h-screen h-full text-center text-black flex flex-col w-full mx-auto justify-center items-center my-auto align-middle py-8 sm:py-0 px-5 max-w-6xl"
    >
      {user ? (
        <>
          <h2 className="font-extrabold text-3xl md:text-4xl mb-8">
            Choose the plan that works best for you
          </h2>

          {error && (
            <div className="w-full max-w-2xl mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 items-center w-full mx-auto sm:grid-cols-2 lg:grid-cols-2 justify-center gap-5">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className="border max-w-xs flex flex-col h-full rounded-lg p-6 px-4 md:px-6 text-left relative bg-white text-slate-900 mx-auto w-full justify-center shadow-md shadow-black"
              >
                {plan.isPopular && (
                  <p className="text-lg mb-8 text-white font-bold absolute top-0 right-0 px-2 md:px-4 py-1 rounded-bl-lg rounded-tr-lg bg-destructive md:text-xl shadow-md shadow-black">
                    Popular
                  </p>
                )}
                
                <div className="flex flex-col justify-center items-center h-full">
                  <div className="inline-flex items-end">
                    <h1 className="font-extrabold text-2xl md:text-4xl">
                      ${plan.price}
                    </h1>
                  </div>
                  
                  <h2 className="font-extrabold text-xl md:text-3xl">
                    {plan.title}
                  </h2>
                  
                  <div className="flex-grow h-full border-t border-gray-600 opacity-25 my-3"></div>
                  
                  <ul className="h-full font-semibold flex flex-col my-auto">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex flex-row items-center text-gray-900 gap-2 my-2 text-sm sm:text-lg"
                      >
                        <div className="rounded-full flex items-center justify-center bg-destructive w-5 h-5 mr-2">
                          <span className="text-white">✓</span>
                        </div>
                        <p>{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <button
                    onClick={() => handleClick(plan.url, plan.priceId, index)}
                    className="bg-confirm py-2 mt-4 rounded-lg text-black w-full font-semibold duration-300 shadow-md shadow-black hover:shadow-black hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loadingPlanIndex === index}
                  >
                    {loadingPlanIndex === index ? 'Processing...' : 'Select Plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <LoginForm route="/Dashboard/subscribe" />
      )}
    </div>
  );
};

export default SubscriptionSection;
