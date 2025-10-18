'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../../firebase';
import { UserData } from '@/types/user';

interface UserFormData {
  email: string;
  password: string;
}

const SignUpForm = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { email, password } = user;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Save user info to Firestore
      const userDocRef = doc(db, 'users', userId);
      const userData: UserData = {
        userId,
        email,
        isPremium: false,
        isSubscribed: true,
        isAdmin: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(userDocRef, userData, { merge: true });

      // Send welcome email
      const response = await fetch('/api/sendWelcomeEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Failed to send welcome email:', data.error);
        // Don't throw error - user is created, just email failed
      }

      // Redirect to the dashboard after successful sign-up
      router.push('/Dashboard');
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4 max-w-xs justify-center h-full my-auto items-center min-h-screen font-semibold flex flex-col mx-auto w-screen px-10">
      <p className="pb-6 text-black text-2xl text-center">Sign Up</p>
      
      {error && (
        <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="w-full space-y-4">
        <input
          type="email"
          name="email"
          autoFocus
          placeholder="Email"
          value={user.email}
          onChange={handleInputChange}
          className="border p-2 rounded w-full mx-auto flex text-neutral-950 bg-white"
          required
          disabled={loading}
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password (min 6 characters)"
          value={user.password}
          onChange={handleInputChange}
          className="border p-2 rounded w-full mx-auto text-neutral-950 bg-white"
          required
          minLength={6}
          disabled={loading}
        />

        <button
          type="submit"
          className="bg-confirm hover:bg-opacity-60 shadow-black shadow-md hover:shadow-black hover:shadow-lg duration-300 text-white py-2 px-4 rounded w-full mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Submit'}
        </button>
      </form>

      <div className="flex flex-col gap-1 w-full justify-center mx-auto items-center">
        <p className="text-black w-full text-center">Already have an account?</p>
        <a
          href="/Signin"
          className="text-destructive hover:opacity-60 duration-300"
        >
          Sign In
        </a>
      </div>
    </div>
  );
};

export default SignUpForm;
