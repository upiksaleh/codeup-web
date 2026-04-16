# CodeUP - Web Personal Notion

> A modern personal site & digital garden powered by Next.js, Notion, and Vercel.
> 
> Fork & customization from [nextjs-notion-starter-kit](https://github.com/transitive-bullshit/nextjs-notion-starter-kit)

## 📚 Architecture

This project uses a **fork & mirror** workflow:

```
🍴 Fork: nextjs-notion-starter-kit
  └── 🌿 Branch: codeup
      └── 📦 Mirror to: codeup-web (main)
          └── 🚀 Deploy: Vercel
```

- **Fork Repository**: [upiksaleh/nextjs-notion-starter-kit](https://github.com/upiksaleh/nextjs-notion-starter-kit)
- **Mirror Repository**: [upiksaleh/codeup-web](https://github.com/upiksaleh/codeup-web) ← Production
- **Original Template**: [transitive-bullshit/nextjs-notion-starter-kit](https://github.com/transitive-bullshit/nextjs-notion-starter-kit)

## 🎯 Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 10.29.3

### Installation

```bash
# Clone the fork repository
git clone https://github.com/upiksaleh/nextjs-notion-starter-kit.git
cd nextjs-notion-starter-kit

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

### Build & Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🔄 Workflow: Codeup Branch → codeup-web Mirror

### For Development (personal branch)

```bash
# Work on the codeup branch
git checkout codeup
git add .
git commit -m "commit message"
git push origin codeup
```

### Mirror to codeup-web

The `codeup` branch automatically syncs to `codeup-web` repository's `main` branch.

**Manual sync** (if needed):

```bash
# Add codeup-web as remote
git remote add codeup-web https://github.com/upiksaleh/codeup-web.git

# Push codeup branch to codeup-web main
git push codeup-web codeup:main
```

## 📦 Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm test             # Run all tests
pnpm test:lint        # Run ESLint
pnpm test:prettier    # Check code formatting
pnpm deps:upgrade     # Upgrade Notion packages
```

## 🎨 Customization

- Update site config in [site.config.ts](site.config.ts)
- Modify components in [components/](components/)
- Update styles in [styles/](styles/)

## 🚀 Deployment

### Vercel (Recommended)

1. Connect [codeup-web](https://github.com/upiksaleh/codeup-web) to Vercel
2. Deploy on push to `main` branch

### Environment Variables

Optional:
- `NEXT_PUBLIC_FATHOM_ID` - Analytics (Fathom)
- `NEXT_PUBLIC_POSTHOG_KEY` - Product analytics (PostHog)

## 📄 License

MIT © [Original](https://github.com/transitive-bullshit/nextjs-notion-starter-kit) + Fork by [@upiksaleh](https://github.com/upiksaleh)

