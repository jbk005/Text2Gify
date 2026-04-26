# Text to GIF

Create animated text GIFs directly in your browser. No APIs, no servers, 100% privacy-friendly.

![Dark mode UI with green accents](https://img.shields.io/badge/status-production-brightgreen)

## Features

- **100% Client-Side** - All processing happens in your browser
- **No APIs Required** - Works offline, no data sent to servers
- **Font Access** - Use your local system fonts (Chrome/Edge)
- **Transparency Support** - Create GIFs with transparent backgrounds
- **Customizable** - Colors, fonts, animation timing
- **Live Preview** - See your animation before generating

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

### Option 1: GitHub Pages (Recommended)

1. Fork or clone this repository
2. Install dependencies: `npm install`
3. Add `gh-pages` dev dependency: `npm install -D gh-pages`
4. Deploy: `npm run deploy`

Your site will be available at: `https://yourusername.github.io/text-to-gif`

### Option 2: Netlify

1. Push to GitHub
2. Connect repo to [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Option 3: Vercel

1. Push to GitHub
2. Import project at [Vercel](https://vercel.com)
3. Framework preset: Vite
4. Deploy

## Project Structure

```
src/
├── core/
│   ├── gifEncoder.ts      # GIF encoding with gif.js
│   ├── frameGenerator.ts   # Animation frame generation
│   └── textProcessor.ts    # Text wrapping & sizing
├── components/
│   ├── App.tsx            # Main app & routing
│   ├── InputPanel.tsx     # Text input form
│   ├── StylePanel.tsx     # Style customization
│   ├── PreviewCanvas.tsx  # Live animation preview
│   ├── ColorPicker.tsx    # Modern color picker
│   ├── FontPicker.tsx     # Font selection
│   └── DownloadButton.tsx # Download section
├── hooks/
│   ├── useGifGenerator.ts # GIF generation logic
│   └── useFonts.ts        # Font loading
├── utils/
│   └── constants.ts       # App configuration
└── types/
    └── index.ts           # TypeScript interfaces
```

## How It Works

### Animation Concept

1. **Frame 1**: Shows all text (configurable hold duration)
2. **Frames 2-N**: Progressively reveal characters (typewriter effect)
3. **Loop**: Animation repeats infinitely

### GIF Encoding

- Uses [gif.js](https://github.com/eugeneware/gif.js) library
- Runs in web workers for smooth performance
- Generates frames on canvas, encodes to GIF format

### Font Loading

- **Chrome/Edge**: Uses Font Access API for local fonts
- **Other browsers**: Falls back to web-safe fonts

## Technology Stack

- React 18
- TypeScript
- Vite
- gif.js
- Canvas API

## Browser Support

| Browser | Font Access | Transparency |
|---------|-------------|--------------|
| Chrome  | ✓ | ✓ |
| Edge | ✓ | ✓ |
| Firefox | ✗ (fallback) | ✓ |
| Safari | ✗ (fallback) | ✓ |

## License

MIT - Created by JBK, A Designer.

---

**Privacy**: Your text never leaves your device. Everything is processed locally in your browser.
