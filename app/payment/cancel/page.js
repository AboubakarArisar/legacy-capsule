export default function PaymentCancel() {
  return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center px-4'>
      <div className='max-w-lg w-full bg-white rounded-xl shadow p-8 text-center'>
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
        <h1 className='text-2xl font-bold text-black mb-2'>Payment Canceled</h1>
        <p className='text-black mb-6'>
          Your payment was canceled. You can try again or continue browsing
          templates.
        </p>
        <div className='flex gap-3 justify-center'>
          <a
            href='/'
            className='px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700'
          >
            Return Home
          </a>
          <a
            href='/#templates'
            className='px-4 py-2 rounded-md border border-slate-300 text-black hover:bg-slate-50'
          >
            Browse Templates
          </a>
        </div>
      </div>
    </div>
  );
}
