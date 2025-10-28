# Firebase Hosting Deployment Guide

## Prerequisites

1. Install Firebase CLI globally (if not already installed):
```bash
npm install -g firebase-tools
```

2. Install project dependencies:
```bash
npm install
```

## Initial Setup

1. Login to Firebase:
```bash
firebase login
```

2. Verify your project configuration:
```bash
firebase projects:list
```

You should see `domains-71eab` in the list.

## Deployment

### Option 1: Deploy Everything (Recommended)
```bash
npm run deploy
```

This will:
- Build your React app
- Deploy to Firebase Hosting

### Option 2: Deploy Only Hosting
```bash
npm run deploy:hosting
```

### Option 3: Manual Deployment
```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy
```

## Hosting Configuration

Your app is configured to deploy to the hosting site: **aiprompts-my**

The hosting configuration includes:
- Public directory: `build`
- Single Page Application (SPA) routing
- Cache optimization for static assets
- Rewrites all routes to index.html

## View Your Deployed App

After deployment, your app will be available at:
- https://aiprompts-my.web.app
- https://aiprompts-my.firebaseapp.com

## Useful Commands

- `firebase hosting:channel:list` - List all hosting channels
- `firebase hosting:sites:list` - List all hosting sites
- `firebase serve` - Test locally before deploying

## Troubleshooting

### Target not found error
If you get a target error, run:
```bash
firebase target:apply hosting aiprompts-my aiprompts-my
```

### Build errors
Make sure to run `npm install` to install all dependencies before building.

### Authentication errors
Run `firebase login` to re-authenticate if needed.

## Environment Variables

The app uses the following Firebase configuration:
- Project ID: `domains-71eab`
- Hosting Site: `aiprompts-my`

All sensitive configuration is stored in the `.env` file (not committed to git).

