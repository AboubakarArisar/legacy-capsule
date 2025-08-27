"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const messageParam = searchParams.get("message");
    if (messageParam) {
      setMessage(messageParam);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect based on user role
        if (data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/"); // Normal users go to homepage
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <Link
            href='/'
            className='inline-flex items-center text-blue-600 hover:text-blue-500 mb-4'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Home
          </Link>
          <h2 className='text-3xl font-bold text-black'>Welcome Back</h2>
          <p className='mt-2 text-black'>Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {message && (
                <div className='bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md'>
                  {message}
                </div>
              )}

              {error && (
                <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md'>
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-black mb-2'
                >
                  Email Address
                </label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                  <input
                    id='email'
                    name='email'
                    type='email'
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className='w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Enter your email'
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-black mb-2'
                >
                  Password
                </label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                  <input
                    id='password'
                    name='password'
                    type='password'
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className='w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Enter your password'
                  />
                </div>
              </div>

              <Button type='submit' className='w-full' disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className='mt-6 text-center'>
              <p className='text-black'>
                Don't have an account?{" "}
                <Link
                  href='/auth/signup'
                  className='text-blue-600 hover:text-blue-500 font-medium'
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
