# US Legal Timeline Visualizer

A Next.js 14 TypeScript application for visualizing US legal status timelines by state, featuring interactive maps and timeline controls.

## Features

- **Interactive US Map**: Visualize legal status changes across states using react-simple-maps
- **Timeline Player**: Scrub through years with play/pause functionality and custom slider
- **File Upload**: Upload custom JSON datasets to visualize different legal factors
- **Zustand State Management**: Efficient client-side state management
- **Comprehensive Testing**: Unit tests with Jest/RTL and e2e tests with Cypress
- **Responsive Design**: Beautiful, modern UI with Tailwind CSS

## Demo Data

The application loads with cannabis legalization data by default, showing medical and recreational cannabis legal status across US states from 1996 to present. The timeline defaults to year 2020 to show meaningful data.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

Run unit tests:
```bash
npm test
```

Run e2e tests (requires dev server running):
```bash
npm run dev  # In one terminal
npx cypress run  # In another terminal
```

## Dataset Format

Upload JSON files in this format:

```json
{
  "title": "Your Dataset Title",
  "factor": "Legal Factor Name",
  "data": [
    {
      "state": "StateName",
      "events": [
        { "year": 2020, "status": "legal" },
        { "year": 2010, "status": "medical" }
      ]
    }
  ]
}
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience  
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **react-simple-maps** - SVG map components
- **d3** - Data visualization utilities
- **Jest & React Testing Library** - Unit testing
- **Cypress** - End-to-end testing

## Architecture

- `/src/app/page.tsx` - Main application page with Zustand integration
- `/components/` - Reusable React components (LegalMap, TimelinePlayer)
- `/lib/` - Utilities, types, and store logic
- `/data/` - US states TopoJSON data
- `/public/demo/` - Demo datasets
- `/__tests__/` - Unit tests
- `/cypress/` - E2e test specifications

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
