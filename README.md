# PulseOps Healthcare Marketplace

A comprehensive healthcare marketplace platform for nursing credentialing and job matching.

## Features

- **For Nurses**: Profile management, document upload, job browsing, and application tracking
- **For Healthcare Organizations**: Post jobs, review applicants, and manage credentialing
- **For Administrators**: System management, user oversight, and compliance monitoring

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Build Tool**: Vite
- **Deployment**: Modern web hosting platforms

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/          # React components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components
│   ├── hco/            # Healthcare organization components
│   ├── nurse/          # Nurse-specific components
│   ├── messaging/      # Messaging system
│   ├── notifications/  # Notification components
│   └── subscription/   # Subscription management
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary and confidential.
