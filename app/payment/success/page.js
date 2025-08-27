"use client";
import { useEffect, useState } from "react";

export default function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setError("Missing session id");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `/api/payment/confirm?session_id=${encodeURIComponent(sessionId)}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (data.success) {
          setDownloadUrl(data.downloadUrl);
          setTemplateTitle(data.templateTitle || "Template");
        } else {
          setError(data.error || "Failed to confirm payment");
        }
      } catch (e) {
        setError("Failed to confirm payment");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center px-4'>
      <div className='max-w-lg w-full bg-white rounded-xl shadow p-8 text-center'>
        {loading ? (
          <>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6'></div>
            <p className='text-black'>Finalizing your order...</p>
          </>
        ) : error ? (
          <>
            <div className='w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8'
                viewBox='0 0 24 24'
                fill='currentColor'
              >
                <path d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.47 6.72a.75.75 0 0 1 1.06 0L12 10.44l1.41-1.47a.75.75 0 1 1 1.08 1.04L13.06 11.5l1.47 1.41a.75.75 0 1 1-1.04 1.08L12 12.56l-1.47 1.41a.75.75 0 1 1-1.06-1.06L10.94 11.5 9.53 10.09a.75.75 0 0 1 0-1.06Z' />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-black mb-2'>
              Payment Confirm Error
            </h1>
            <p className='text-black mb-6'>{error}</p>
            <div className='flex gap-3 justify-center'>
              <a
                href='/'
                className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700'
              >
                Return Home
              </a>
            </div>
          </>
        ) : (
          <>
            <div className='w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8'
                viewBox='0 0 24 24'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-2.59a.75.75 0 1 0-1.22-.86l-3.91 5.54-1.89-1.89a.75.75 0 0 0-1.06 1.06l2.5 2.5c.34.34.89.3 1.17-.09l4.41-6.26Z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-black mb-2'>
              Payment Successful
            </h1>
            <p className='text-black mb-6'>
              Your purchase of {templateTitle} is complete. Click below to
              download your template now.
            </p>
            <div className='flex gap-3 justify-center'>
              <a
                href={downloadUrl}
                target='_blank'
                rel='noopener'
                className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700'
              >
                Download Template
              </a>
              <a
                href='/'
                className='px-4 py-2 rounded-md border border-slate-300 text-black hover:bg-slate-50'
              >
                Return Home
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
