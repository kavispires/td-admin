import { LoadingPage } from 'pages/LoadingPage';
import { lazy, Suspense } from 'react';
import { createHashRouter, type RouteObject } from 'react-router-dom';

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
  {
    path: '/resources/listing',
    element: withSuspense(() => import('pages/Resource' /* webpackChunkName: "Resource" */)),
  },
  {
    path: '/resources/generator',
    element: withSuspense(
      () => import('pages/ResourceGenerator' /* webpackChunkName: "ResourceGenerator" */),
    ),
  },
  // Game routes
  {
    path: '/game',
    children: [
      {
        path: 'arte-ruim-parser',
        element: withSuspense(
          () => import('pages/ArteRuim/ArteRuimParser' /* webpackChunkName: "ArteRuimParser" */),
        ),
      },
      {
        path: 'arte-ruim-groups',
        element: withSuspense(
          () => import('pages/ArteRuim/ArteRuimGroups' /* webpackChunkName: "ArteRuimGroups" */),
        ),
      },
      {
        path: 'arte-ruim-drawings',
        element: withSuspense(
          () => import('pages/ArteRuim/ArteRuimDrawings' /* webpackChunkName: "ArteRuimDrawings" */),
        ),
      },
      {
        path: 'crimes-hediondos',
        element: withSuspense(
          () => import('pages/CrimesHediondos' /* webpackChunkName: "CrimesHediondos" */),
        ),
      },
      {
        path: 'fofoca-quente',
        element: withSuspense(() => import('pages/FofocaQuente' /* webpackChunkName: "FofocaQuente" */)),
      },
      {
        path: 'contenders',
        element: withSuspense(() => import('pages/Contenders' /* webpackChunkName: "Contenders" */)),
      },
      {
        path: 'daily',
        element: withSuspense(() => import('pages/DailyPage' /* webpackChunkName: "DailyPage" */)),
      },
      {
        path: 'testimonies',
        element: withSuspense(
          () => import('pages/Testimonies/TestimoniesPage' /* webpackChunkName: "TestimoniesPage" */),
        ),
      },
    ],
  },
  // Items routes
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
        path: 'crimes-history',
        element: withSuspense(
          () => import('pages/Items/ItemsCrimeHistory' /* webpackChunkName: "ItemsCrimeHistory" */),
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
  // Images routes
  {
    path: '/images',
    children: [
      {
        path: 'sprites',
        element: withSuspense(() => import('pages/Images/Sprites' /* webpackChunkName: "Sprites" */)),
      },
      {
        path: 'suspects',
        element: withSuspense(() => import('pages/Images/Suspects' /* webpackChunkName: "Suspects" */)),
      },
    ],
  },
  // Image Cards routes
  {
    path: '/image-cards',
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
  // Other routes
  {
    path: '/single-words',
    element: withSuspense(
      () => import('pages/SingleWordsExpander' /* webpackChunkName: "SingleWordsExpander" */),
    ),
  },
  {
    path: '/playground',
    element: withSuspense(() => import('pages/Playground' /* webpackChunkName: "Playground" */)),
  },
  {
    path: '/movie-maker',
    element: withSuspense(() => import('pages/MovieMaker' /* webpackChunkName: "MovieMaker" */)),
  },
];

// Create the router using createHashRouter (since you're using HashRouter)
export const router = createHashRouter(routeConfig);
