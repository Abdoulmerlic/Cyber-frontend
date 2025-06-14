# Cyber Savvy Admin Dashboard

This is the admin dashboard for the Cyber Savvy application. It provides a user interface for managing users, articles, and other administrative tasks.

## Features

- User management (view, delete users)
- Article management (view, delete articles)
- Admin statistics and overview
- Secure authentication
- Responsive design

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following content:
   ```
   VITE_API_URL=http://localhost:3000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The admin dashboard will be available at `http://localhost:3001/admin`.

## Building for Production

To build the admin dashboard for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
admin/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── public/            # Static assets
├── index.html         # HTML template
└── package.json       # Project configuration
```

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Headless UI
- Heroicons 