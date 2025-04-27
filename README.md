## Overview

This project uses the following tech stack:
- Next.js 15 (for client framework)
- React 19 (for frontend components)
- Tailwind v4 (for styling)
- Shadcn UI (for UI components library)
- Lucide Icons (for icons)
- Convex (for backend & database)
- Convex Auth (for authentication)
- Framer Motion (for animations)
- Three.js (for landing page 3D graphics)
- OpenAI API (for powering the chatbot)

All relevant files live in the 'src' directory.

## Setup

This project is set up already and running on a cloud environment.

To set it up yourself:

1. Clone the repository
2. Run `pnpm install` to install the dependencies
3. Run `pnpm dev` to start the development server
4. Run `npx convex dev` to start the Convex development server

Running the convex development server is critical for ensuring the backend convex functions are correctly updating.

## Environment Variables

The project is set up with project specific CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL environment variables on the client side.

The convex server has a separate set of environment variables that are accessible by the convex backend.

Currently, these variables include auth-specific keys: JWKS, JWT_PRIVATE_KEY, and SITE_URL.

