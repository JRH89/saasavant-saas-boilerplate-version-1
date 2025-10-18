'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebase';

interface LoginFormProps {
  route?: string;
}

interface Credentials {
  email: string;
  password: string;
}

const LoginForm = ({ route }: LoginFormProps) => {
  const router = useRouter();
  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { email, password } = credentials;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Sign in user with email and password
      await signInWithEmailAndPassword(auth, email, password);

      // Redirect to the dashboard after successful login
      router.push(route || '/Dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { email } = credentials;

      if (!email) {
        throw new Error('Email is required');
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent. Check your inbox/spam folder.');
      setError(null);
      
      // Switch back to login form after a delay
      setTimeout(() => {
        setIsResetMode(false);
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4 max-w-xs justify-center h-full my-auto items-center min-h-screen font-semibold flex flex-col mx-auto w-screen px-10">
      <p className="pb-6 text-black text-2xl text-center">
        {isResetMode ? 'Reset Password' : 'Sign In'}
      </p>

      {error && (
        <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="w-full p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {isResetMode ? (
        <form onSubmit={handlePasswordReset} className="w-full space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={credentials.email}
            onChange={handleInputChange}
            className="border p-2 bg-white rounded w-full mx-auto flex text-neutral-950"
            required
            disabled={loading}
          />
          
          <button
            type="submit"
            className="bg-confirm shadow-black shadow-md hover:bg-opacity-60 hover:shadow-black hover:shadow-lg duration-300 text-white py-2 px-4 rounded w-full mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Submit'}
          </button>

          <div className="flex flex-col gap-1 w-full justify-center mx-auto items-center">
            <p className="text-black w-full text-center">Remember your password?</p>
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-destructive hover:opacity-60 duration-300"
              disabled={loading}
            >
              Back to Sign In
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={credentials.email}
            onChange={handleInputChange}
            className="border p-2 rounded w-full mx-auto flex text-neutral-950 bg-white"
            required
            disabled={loading}
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleInputChange}
            className="border bg-white p-2 rounded w-full mx-auto text-neutral-950"
            required
            disabled={loading}
          />

          <button
            type="submit"
            className="bg-confirm hover:bg-opacity-60 shadow-md shadow-black hover:shadow-lg hover:shadow-black duration-300 text-white py-2 px-4 rounded w-full mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Submit'}
          </button>

          <div className="flex flex-col gap-1 w-full justify-center mx-auto items-center">
            <a
              href="/Signup"
              className="text-destructive hover:opacity-60 duration-300"
            >
              Need An Account?
            </a>
            <button
              type="button"
              onClick={() => {
                setIsResetMode(true);
                setError(null);
              }}
              className="text-destructive hover:opacity-60 duration-300"
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
