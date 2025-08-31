# Gaanavykhari Music Management System

A Next.js application for managing music students, sessions, and payments with Google authentication.

## Features

- **Authentication**: Google OAuth integration with NextAuth.js
- **Student Management**: CRUD operations for student records
- **Session Tracking**: Track attendance and schedule sessions
- **Payment Management**: Monitor fees and payment status
- **Responsive Design**: Mobile-first UI with Mantine components
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Mantine v8
- **Authentication**: NextAuth.js with Google Provider
- **Database**: MongoDB
- **Code Quality**: ESLint, Prettier, Husky

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB instance
- Google OAuth credentials

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd gaanavykhari.next
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:

```bash
npm run dev
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=gaanavykhari
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Git Hooks

This project uses Git hooks to ensure code quality:

### Pre-commit Hook

- Automatically formats staged files with Prettier
- Runs ESLint on staged TypeScript/JavaScript files
- Fixes auto-fixable issues

### Pre-push Hook

- Runs TypeScript type checking
- Ensures no type errors before pushing

## Code Quality Tools

- **ESLint**: Code linting with Next.js and TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Git hooks management
- **lint-staged**: Run linters on staged files only

## Project Structure

```
app/
├── api/           # API routes
├── globals.css    # Global styles
├── layout.tsx     # Root layout
├── page.tsx       # Home page
├── login/         # Authentication pages
├── students/      # Student management
├── payments/      # Payment management
└── settings/      # Settings page

lib/
├── authOptions.ts # NextAuth configuration
└── mongo.ts       # MongoDB connection

types/
└── index.d.ts     # TypeScript type definitions
```

## API Endpoints

The application includes built-in API routes:

- `/api/student/*` - Student management
- `/api/sessions/*` - Session management
- `/api/payments/*` - Payment management
- `/api/holiday/*` - Holiday management
- `/api/user/*` - User authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure code passes linting and formatting
5. Submit a pull request

## License

This project is licensed under the MIT License.
