'use client';

import { useAuth } from '../../context/AuthProvider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPremiumStatus } from '@/lib/stripe/getPremiumStatus';
import { createPortalSession } from '@/lib/stripe/client';
import {
  getAuth,
  sendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth';
import { initFirebase } from '../../../firebase';
import { getFirestore, getDoc, doc, collection } from 'firebase/firestore';
import Link from 'next/link';
import LoginForm from './SignIn';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Account = () => {
  const { user } = useAuth();
  const router = useRouter();
  const app = initFirebase();
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loadingPortal, setLoadingPortal] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);

  // Fetch premium status
  useEffect(() => {
    const fetchPremiumStatus = async () => {
      if (!user) {
        setIsPremium(false);
        setLoadingStatus(false);
        return;
      }

      try {
        const premiumStatus = await getPremiumStatus(app);
        setIsPremium(premiumStatus);
      } catch (error: any) {
        console.error('Error fetching premium status:', error.message);
        setIsPremium(false);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchPremiumStatus();
  }, [user, app]);

  const sendResetEmail = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      toast.error('Failed to send password reset email');
    }
  };

  const loadPortal = async () => {
    setLoadingPortal(true);

    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        throw new Error('User is not authenticated');
      }

      // Fetch the Stripe Customer ID from Firestore
      const customerRef = doc(collection(firestore, 'customers'), userId);
      const customerDoc = await getDoc(customerRef);

      if (!customerDoc.exists()) {
        throw new Error('Customer document not found. Please subscribe first.');
      }

      const customerData = customerDoc.data();
      const stripeCustomerId = customerData?.stripeId;

      console.log('Stripe Customer ID:', stripeCustomerId);

      if (!stripeCustomerId) {
        throw new Error('Stripe customer ID not found. Please contact support.');
      }

      // Create portal session using the new client
      const portalUrl = await createPortalSession(stripeCustomerId);
      router.push(portalUrl);
    } catch (error: any) {
      console.error('Error loading portal:', error);
      toast.error(error.message || 'Failed to load billing portal');
    } finally {
      setLoadingPortal(false);
    }
  };

  const deleteAccount = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log('No user is currently signed in.');
      toast.error('No user is currently signed in');
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (confirmDelete) {
      try {
        await deleteUser(currentUser);
        console.log('User account deleted successfully.');
        toast.success('Account deleted successfully');
        router.push('/');
      } catch (error: any) {
        console.error('Error deleting user account:', error);
        toast.error(
          'Failed to delete account. You may need to re-authenticate first.'
        );
      }
    } else {
      console.log('Account deletion canceled.');
    }
  };

  if (loadingStatus) {
    return (
      <div className="flex flex-col min-h-screen h-full my-auto w-full max-w-6xl mx-auto text-black items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="mt-4">Loading account information...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen h-full my-auto w-full max-w-6xl mx-auto text-black items-center justify-center">
      {user ? (
        <div className="mx-auto w-full flex flex-col justify-center item-center">
          <div className="flex flex-col gap-1 w-auto justify-center mx-auto max-w-xs text-xl sm:text-2xl">
            <p className="flex flex-row gap-1">
              <span className="font-bold">{user.email}</span>
            </p>
            
            <p className="capitalize flex flex-row gap-1 w-full justify-between">
              Subscribed:
              <span className="font-bold">{isPremium.toString()}</span>
            </p>

            <div className="flex flex-col gap-1 w-full justify-center mx-auto">
              <button
                className="bg-confirm duration-300 shadow-black shadow-md hover:shadow-black hover:shadow-lg hover:bg-confirm/80 font-bold py-2 px-4 rounded mt-4 text-slate-900 mx-auto flex w-full justify-center"
                onClick={() => sendResetEmail(user.email!)}
              >
                Reset Password
              </button>

              {isPremium && (
                <button
                  className="bg-confirm duration-300 shadow-black shadow-md hover:shadow-black hover:shadow-lg hover:bg-confirm/80 font-bold py-2 px-4 rounded mt-4 text-slate-900 mx-auto flex w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={loadPortal}
                  disabled={loadingPortal}
                >
                  {loadingPortal ? (
                    <Loader2 className="w-6 h-6 animate-spin duration-300" />
                  ) : (
                    'Manage Subscription'
                  )}
                </button>
              )}

              {!isPremium && (
                <Link
                  href="/Dashboard/subscribe"
                  className="bg-confirm duration-300 shadow-black shadow-md hover:shadow-black hover:shadow-lg hover:bg-confirm/80 font-bold py-2 px-4 rounded mt-4 text-slate-900 mx-auto flex w-full justify-center"
                >
                  Upgrade to Premium
                </Link>
              )}

              <button
                className="bg-destructive duration-300 shadow-black shadow-md hover:shadow-black hover:shadow-lg hover:bg-destructive/80 font-bold py-2 px-4 rounded mt-4 text-slate-900 mx-auto flex w-full justify-center"
                onClick={deleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      ) : (
        <LoginForm route="/Dashboard/account" />
      )}
    </div>
  );
};

export default Account;
