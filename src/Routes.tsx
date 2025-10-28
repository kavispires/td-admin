import { LoadingPage } from 'pages/LoadingPage';
import { lazy, Suspense } from 'react';
import { createHashRouter, type RouteObject } from 'react-router-dom';
import { RouteError } from './components/RouteError';

// Helper function to wrap lazy components with Suspense
const withSuspense = (lazyComponent: () => Promise<{ default: React.ComponentType }>) => {
  const Component = lazy(lazyComponent);
  return (
    <Suspense fallback={<LoadingPage />}>
      <Component />
    </Suspense>
  );
};

// Route configuration using React Router DOM v7 approach with inlined lazy imports
export const routeConfig: RouteObject[] = [
  {
    path: '/',
    element: withSuspense(() => import('pages/Home' /* webpackChunkName: "Home" */)),
  },
  // Resources Group
  {
    path: '/resources',
    children: [
      {
        path: 'listing',
        element: withSuspense(() => import('pages/Resources/Resource' /* webpackChunkName: "Resource" */)),
      },
      {
        path: 'generator',
        element: withSuspense(
          () => import('pages/Resources/ResourceGenerator' /* webpackChunkName: "ResourceGenerator" */),
        ),
      },
      {
        path: 'single-words',
        element: withSuspense(
          () => import('pages/Resources/SingleWordsExpander' /* webpackChunkName: "SingleWordsExpander" */),
        ),
      },
    ],
  },
  // Daily Group
  {
    path: '/daily',
    children: [
      {
        index: true, // This matches /daily exactly
        element: withSuspense(() => import('pages/Daily/DailyPage' /* webpackChunkName: "DailyPage" */)),
      },
      {
        path: 'diagrams',
        element: withSuspense(
          () => import('pages/Items/ItemsDiagramSets' /* webpackChunkName: "ItemsDiagramSets" */),
        ),
      },
      {
        path: 'discs',
        element: withSuspense(
          () => import('pages/Items/ItemsDiscSets' /* webpackChunkName: "ItemsDiscSets" */),
        ),
      },
      {
        path: 'movies',
        element: withSuspense(
          () => import('pages/Items/ItemsMovieSets' /* webpackChunkName: "ItemsMovieSets" */),
        ),
      },
      {
        path: 'quartets',
        element: withSuspense(
          () => import('pages/Items/ItemsQuartets' /* webpackChunkName: "ItemsQuartets" */),
        ),
      },
    ],
  },
  // Game Group
  {
    path: '/game',
    children: [
      {
        path: 'arte-ruim/parser',
        element: withSuspense(
          () => import('pages/Games/ArteRuim/ArteRuimParser' /* webpackChunkName: "ArteRuimParser" */),
        ),
      },
      {
        path: 'arte-ruim/groups',
        element: withSuspense(
          () => import('pages/Games/ArteRuim/ArteRuimGroups' /* webpackChunkName: "ArteRuimGroups" */),
        ),
      },
      {
        path: 'arte-ruim/drawings',
        element: withSuspense(
          () => import('pages/Games/ArteRuim/ArteRuimDrawings' /* webpackChunkName: "ArteRuimDrawings" */),
        ),
      },
      {
        path: 'crimes-hediondos',
        element: withSuspense(
          () => import('pages/Games/CrimesHediondos' /* webpackChunkName: "CrimesHediondos" */),
        ),
      },
      {
        path: 'escape-room',
        element: withSuspense(
          () => import('pages/Games/EscapeRoom/EscapeRoom' /* webpackChunkName: "EscapeRoom" */),
        ),
      },
      {
        path: 'fofoca-quente',
        element: withSuspense(
          () => import('pages/Games/FofocaQuente' /* webpackChunkName: "FofocaQuente" */),
        ),
      },
    ],
  },
  // Libraries Group
  {
    path: '/libraries',
    children: [
      {
        path: 'sprites',
        element: withSuspense(() => import('pages/Libraries/Sprites' /* webpackChunkName: "Sprites" */)),
      },
      {
        path: 'suspects',
        element: withSuspense(() => import('pages/Libraries/Suspects' /* webpackChunkName: "Suspects" */)),
      },
      {
        path: 'contenders',
        element: withSuspense(
          () => import('pages/Libraries/Contenders' /* webpackChunkName: "Contenders" */),
        ),
      },
      {
        path: 'testimonies',
        element: withSuspense(
          () =>
            import('pages/Libraries/Testimonies/TestimoniesPage' /* webpackChunkName: "TestimoniesPage" */),
        ),
      },
    ],
  },
  // Items Group
  {
    path: '/items',
    children: [
      {
        index: true, // This matches /items exactly
        element: withSuspense(() => import('pages/Items/Items' /* webpackChunkName: "Items" */)),
      },
      {
        path: 'groups',
        element: withSuspense(() => import('pages/Items/ItemsGroups' /* webpackChunkName: "ItemsGroups" */)),
      },
      {
        path: 'attribution',
        element: withSuspense(
          () => import('pages/Items/ItemsAttribution' /* webpackChunkName: "ItemsAttribution" */),
        ),
      },
    ],
  },
  // Images routes
  {
    path: '/image',
    children: [
      {
        path: 'decks',
        element: withSuspense(() => import('pages/Images/ImageCards' /* webpackChunkName: "ImageCards" */)),
      },
      {
        path: 'descriptor',
        element: withSuspense(
          () => import('pages/Images/ImageCardsDescriptor' /* webpackChunkName: "ImageCardsDescriptor" */),
        ),
      },
      {
        path: 'passcode',
        element: withSuspense(
          () => import('pages/Images/ImageCardsPasscode' /* webpackChunkName: "ImageCardsPasscode" */),
        ),
      },
      {
        path: 'relationships',
        element: withSuspense(
          () =>
            import('pages/Images/ImageCardsRelationships' /* webpackChunkName: "ImageCardsRelationships" */),
        ),
      },
      {
        path: 'comparator',
        element: withSuspense(
          () => import('pages/Images/ImageCardsComparator' /* webpackChunkName: "ImageCardsComparator" */),
        ),
      },
      {
        path: 'connections',
        element: withSuspense(
          () => import('pages/Images/ImageCardsConnections' /* webpackChunkName: "ImageCardsConnections" */),
        ),
      },
    ],
  },
  {
    path: '/fun',
    children: [
      // Other routes
      {
        path: 'playground',
        element: withSuspense(() => import('pages/Fun/Playground' /* webpackChunkName: "Playground" */)),
      },
      {
        path: 'movie-maker',
        element: withSuspense(() => import('pages/Fun/MovieMaker' /* webpackChunkName: "MovieMaker" */)),
      },
      {
        path: 'crimes-history',
        element: withSuspense(
          () => import('pages/Fun/ItemsCrimeHistory' /* webpackChunkName: "ItemsCrimeHistory" */),
        ),
      },
    ],
  },
];

// Add global error boundary to all routes
routeConfig.forEach((route) => {
  if (!route.errorElement) {
    route.errorElement = <RouteError />;
  }
  // Also add to children if they exist
  if (route.children) {
    route.children.forEach((child) => {
      if (!child.errorElement) {
        child.errorElement = <RouteError />;
      }
    });
  }
});

// Create the router using createHashRouter (since you're using HashRouter)
export const router = createHashRouter(routeConfig, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});
