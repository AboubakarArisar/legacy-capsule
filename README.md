# Legacy Capsule

A beautiful website for creating and selling interactive PDF time capsules. Preserve your memories with customizable templates that include text, pictures, photo galleries, audio, video, and personal letters.

## Features

- **Premium PDF Templates**: Beautifully designed templates for various life occasions
- **Bundle Deals**: Save money with curated template bundles
- **Reseller Program**: Earn commission selling our templates
- **Custom Designs**: Request custom templates for unique needs
- **Music Integration**: Add your favorite music to PDFs
- **Admin Dashboard**: Manage templates, orders, and revenue (admin only)
- **Payment Integration**: Secure Stripe payment processing
- **File Upload**: Cloudinary integration for media files
- **User Authentication**: Simple signup/login system with JWT
- **User Profiles**: Dicebear avatars with user initials
- **Admin Access**: Secure admin panel for template management

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **UI Components**: shadcn/ui components
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Cloudinary
- **Payment**: Stripe
- **Authentication**: JWT-based with bcrypt
- **Styling**: Tailwind CSS with custom design system

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Cloudinary account
- Stripe account
- pnpm (recommended package manager)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd legacy-capsule
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

## Environment Setup

Create a `.env.local` file in the root directory by copying from the example:

```bash
# Option 1: Use the setup script (recommended)
pnpm setup-env

# Option 2: Manual copy
cp env.example .env.local
```

Then configure the following environment variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/legacy-capsule

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Application Configuration
NODE_ENV=development
```

**Important Notes:**

- The application automatically loads environment variables using dotenv
- Never commit your `.env.local` file to version control
- Use strong, unique values for `JWT_SECRET` in production
- For production, use MongoDB Atlas or a production MongoDB instance

4. **Database Setup**

   - Start MongoDB locally or use MongoDB Atlas
   - The application will automatically create collections on first run
   - Test your connection: `pnpm test-connection`

5. **Create Admin User**
   Run the admin creation script:

   ```bash
   pnpm add-admin
   ```

   This will create an admin user with:

   - Email: `email@legacycapsule.com`
   - Password: `admin123`
   - Role: `admin`

### Running the Application

1. **Development Mode**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

2. **Production Build**
   ```bash
   pnpm build
   pnpm start
   ```

## Project Structure

```
legacy-capsule/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── dashboard/         # User dashboard
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── orders/        # Order management
│   │   ├── payment/       # Stripe integration
│   │   ├── templates/     # Template management
│   │   └── upload/        # File upload endpoints
│   ├── components/        # Reusable UI components
│   │   └── ui/            # shadcn/ui components
│   ├── lib/               # Utility functions
│   ├── models/            # Mongoose models
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Homepage
├── scripts/                # Utility scripts
│   └── add-admin.js       # Admin user creation script
├── public/                 # Static assets
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
└── README.md               # This file
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout

### Templates

- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create new template
- `GET /api/templates?category=<category>` - Get templates by category
- `GET /api/templates?search=<query>` - Search templates

### Orders

- `GET /api/orders` - Get user orders (authenticated)
- `POST /api/orders` - Create new order (authenticated)

### Payment

- `POST /api/payment/create-session` - Create Stripe checkout session
- `POST /api/payment/webhook` - Stripe webhook handler

### File Upload

- `POST /api/upload` - Upload files to Cloudinary

## Database Models

### User Model

- **Fields**: name, email, password, role, isActive, lastLogin, profilePicture
- **Features**: Password hashing, email validation, role-based access
- **Methods**: comparePassword, toJSON

### Template Model

- **Fields**: title, description, price, category, features, imageUrl, pdfUrl, sampleUrl, isActive
- **Features**: Category validation, search indexing, rating system
- **Methods**: incrementDownloadCount, updateRating, search

### Order Model

- **Fields**: userId, templateId, stripeSessionId, amount, status, paymentStatus
- **Features**: Payment tracking, download management, revenue analytics
- **Methods**: markAsPaid, markAsFailed, generateDownloadUrl

## Authentication System

The application uses a JWT-based authentication system:

- **Signup**: Users can create accounts with name, email, and password
- **Login**: Users authenticate with email and password
- **JWT Tokens**: Secure tokens stored in HTTP-only cookies
- **Role-based Access**: Admin and user roles with different permissions
- **Password Security**: Bcrypt hashing for secure password storage
- **Session Management**: Automatic token expiration and renewal

## Admin Dashboard

Access the admin dashboard at `/admin` to:

- View revenue and order statistics
- Manage PDF templates
- Monitor customer orders
- Track sales performance

**Admin Login:**

- Email: `email@legacycapsule.com`
- Password: `admin123`

## Customization

### Adding New Templates

1. Use the admin dashboard to create templates
2. Set pricing, features, and categories
3. Upload template files and sample PDFs

### Styling

- Modify `app/globals.css` for global styles
- Update `tailwind.config.js` for theme customization
- Use shadcn/ui components for consistent UI

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

- Build the project: `pnpm build`
- Start production server: `pnpm start`
- Set environment variables for production

## Security Features

- JWT-based authentication
- Role-based access control
- Secure file upload validation
- Stripe webhook signature verification
- Mongoose injection protection
- Bcrypt password hashing
- HTTP-only cookies for tokens
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support and questions:

- Email: hello@legacycapsule.com
- Phone: (555) 123-4567
- Hours: Mon-Fri 9AM-6PM

## License

This project is proprietary software. All rights reserved.

---

**Start preserving your legacy today with Legacy Capsule!**
