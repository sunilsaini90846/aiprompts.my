# AI Prompts Manager

A beautiful React web app for storing and managing AI prompts with a liquid UI design, built using React, Framer Motion, and Firebase authentication.

## Features

- ✨ **Liquid UI Design**: Organic, fluid animations and gradients
- 📝 **Prompt Management**: Create notes with multiple AI prompts
- 📋 **Copy Functionality**: One-click copying of prompts
- 🔐 **Firebase Authentication**: Google sign-in (optional)
- 💾 **Local Storage**: Persistent storage across browser sessions
- 🎨 **Responsive Design**: Works on desktop and mobile
- ⚡ **Framer Motion**: Smooth animations and transitions

## Project Structure

```
ai-prompts/
├── index.html          # Main HTML file with CDN dependencies
├── src/               # Source files (for React app setup)
│   ├── App.tsx        # Main React component
│   ├── App.css        # Liquid UI styles
│   ├── index.tsx      # React entry point
│   ├── index.css      # Base styles
│   └── firebase.ts    # Firebase configuration
├── public/            # Public assets
└── package.json       # Dependencies
```

## Quick Start (CDN Version)

1. **Open the app immediately**:
   - Open `index.html` in your browser directly
   - The app uses CDN links for all dependencies

2. **For development with npm** (if you have npm working):
   ```bash
   npm install
   npm start
   ```

## Firebase Setup (Optional)

To enable Google authentication:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Google authentication in Authentication > Sign-in method
4. Get your Firebase config from Project settings
5. Replace the demo config in `index.html` and `src/firebase.ts`

## How to Use

### Creating Notes
1. Click "New Note" to create a prompt note
2. Give your note a title
3. Add multiple prompts within each note
4. Each prompt can have its own title and content

### Copying Prompts
- Click the 📋 icon next to any prompt to copy it to clipboard

### Authentication (Optional)
- Click "Sign In with Google" to authenticate
- Authenticated users get separate storage from local users
- Sign out anytime to return to local storage

### Storage
- **Not logged in**: Prompts saved to browser localStorage
- **Logged in**: Prompts saved per user account (persists across devices)

## Liquid UI Features

- **Animated gradients**: Shifting background colors
- **Floating elements**: Subtle movement animations
- **Glow effects**: Pulsing borders and shadows
- **Smooth transitions**: All interactions are animated
- **Lighting strip**: Animated copyright footer with light effects

## Browser Compatibility

Works in all modern browsers that support:
- ES6 modules
- CSS backdrop-filter
- Modern JavaScript features

## Development Notes

The app is built twice:
1. **CDN Version** (`index.html`): For immediate testing without npm
2. **React App Version** (`src/`): For full development workflow

The CDN version includes all React components inline for simplicity.

## Customization

### Colors
Modify CSS custom properties in the `:root` selector:
```css
--primary-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--secondary-bg: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--accent-bg: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
```

### Animations
Adjust animation durations and effects in the CSS keyframes and animation properties.

## License

© 2025 AI Prompts Manager. All rights reserved.
