import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { LoadingPage } from 'pages/LoadingPage';

const Home = lazy(() => import('pages/Home' /* webpackChunkName: "Home" */));
const Resource = lazy(() => import('pages/Resource' /* webpackChunkName: "Resource" */));
const ResourceGenerator = lazy(
  () => import('pages/ResourceGenerator' /* webpackChunkName: "ResourceGenerator" */),
);
const SingleWordsExpander = lazy(
  () => import('pages/SingleWordsExpander' /* webpackChunkName: "SingleWordsExpander" */),
);
const Playground = lazy(() => import('pages/Playground' /* webpackChunkName: "Playground" */));
const ImageCards = lazy(() => import('pages/Images/ImageCards' /* webpackChunkName: "ImageCards" */));
const Sprites = lazy(() => import('pages/Images/Sprites' /* webpackChunkName: "Sprites" */));
const Suspects = lazy(() => import('pages/Images/Suspects' /* webpackChunkName: "Suspects" */));
const ArteRuimParser = lazy(
  () => import('pages/ArteRuim/ArteRuimParser' /* webpackChunkName: "ArteRuimParser" */),
);
const ArteRuimGroups = lazy(
  () => import('pages/ArteRuim/ArteRuimGroups' /* webpackChunkName: "ArteRuimGroups" */),
);
const ArteRuimDrawings = lazy(
  () => import('pages/ArteRuim/ArteRuimDrawings' /* webpackChunkName: "ArteRuimDrawings" */),
);
const ImageCardsRelationships = lazy(
  () => import('pages/Images/ImageCardsRelationships' /* webpackChunkName: "ImageCardsRelationships" */),
);
const ImageCardsComparator = lazy(
  () => import('pages/Images/ImageCardsComparator' /* webpackChunkName: "ImageCardsComparator" */),
);
const ImageCardsConnections = lazy(
  () => import('pages/Images/ImageCardsConnections' /* webpackChunkName: "ImageCardsConnections" */),
);
const ImageCardsDescriptor = lazy(
  () => import('pages/Images/ImageCardsDescriptor' /* webpackChunkName: "ImageCardsDescriptor" */),
);
const Items = lazy(() => import('pages/Items/Items' /* webpackChunkName: "Items" */));
const ItemsAttribution = lazy(
  () => import('pages/Items/ItemsAttribution' /* webpackChunkName: "ItemsAttribution" */),
);
const ItemsDiagramSets = lazy(
  () => import('pages/Items/ItemsDiagramSets' /* webpackChunkName: "ItemsDiagramSets" */),
);
const ItemsGroups = lazy(() => import('pages/Items/ItemsGroups' /* webpackChunkName: "ItemsGroups" */));
const ItemsDiscSets = lazy(() => import('pages/Items/ItemsDiscSets' /* webpackChunkName: "ItemsDiscSets" */));
const ItemsMovieSets = lazy(
  () => import('pages/Items/ItemsMovieSets' /* webpackChunkName: "ItemsMovieSets" */),
);
const ItemsQuartets = lazy(() => import('pages/Items/ItemsQuartets' /* webpackChunkName: "ItemsQuartets" */));
const ItemsCrimeHistory = lazy(
  () => import('pages/Items/ItemsCrimeHistory' /* webpackChunkName: "ItemsCrimeHistory" */),
);

const DailySetup = lazy(() => import('pages/DailySetup' /* webpackChunkName: "DailySetup" */));
const CrimesHediondos = lazy(() => import('pages/CrimesHediondos' /* webpackChunkName: "CrimesHediondos" */));
const MovieMaker = lazy(() => import('pages/MovieMaker' /* webpackChunkName: "MovieMaker" */));
const FofocaQuente = lazy(() => import('pages/FofocaQuente' /* webpackChunkName: "FofocaQuente" */));
const Contenders = lazy(() => import('pages/Contenders' /* webpackChunkName: "Contenders" */));

export const routes = (
  <Routes>
    <Route
      path="/"
      element={
        <Suspense fallback={<LoadingPage />}>
          <Home />
        </Suspense>
      }
    />
    <Route
      path="/resources/listing"
      element={
        <Suspense fallback={<LoadingPage />}>
          <Resource />
        </Suspense>
      }
    />
    <Route
      path="/resources/generator"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ResourceGenerator />
        </Suspense>
      }
    />

    <Route
      path="/game/arte-ruim-parser"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ArteRuimParser />
        </Suspense>
      }
    />
    <Route
      path="/game/arte-ruim-groups"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ArteRuimGroups />
        </Suspense>
      }
    />
    <Route
      path="/game/arte-ruim-drawings"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ArteRuimDrawings />
        </Suspense>
      }
    />
    <Route
      path="/game/crimes-hediondos"
      element={
        <Suspense fallback={<LoadingPage />}>
          <CrimesHediondos />
        </Suspense>
      }
    />
    <Route
      path="/game/fofoca-quente"
      element={
        <Suspense fallback={<LoadingPage />}>
          <FofocaQuente />
        </Suspense>
      }
    />
    <Route
      path="/game/contenders"
      element={
        <Suspense fallback={<LoadingPage />}>
          <Contenders />
        </Suspense>
      }
    />
    <Route
      path="/game/daily-setup"
      element={
        <Suspense fallback={<LoadingPage />}>
          <DailySetup />
        </Suspense>
      }
    />

    <Route
      path="/items"
      element={
        <Suspense fallback={<LoadingPage />}>
          <Items />
        </Suspense>
      }
    />
    <Route
      path="/items/groups"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsGroups />
        </Suspense>
      }
    />
    <Route
      path="/items/attribution"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsAttribution />
        </Suspense>
      }
    />
    <Route
      path="/items/diagrams"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsDiagramSets />
        </Suspense>
      }
    />
    <Route
      path="/items/discs"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsDiscSets />
        </Suspense>
      }
    />
    <Route
      path="/items/movies"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsMovieSets />
        </Suspense>
      }
    />
    <Route
      path="/items/crimes-history"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsCrimeHistory />
        </Suspense>
      }
    />
    <Route
      path="/items/quartets"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsQuartets />
        </Suspense>
      }
    />

    <Route
      path="/images/sprites"
      element={
        <Suspense fallback={<LoadingPage />}>
          <Sprites />
        </Suspense>
      }
    />
    <Route
      path="/images/suspects"
      element={
        <Suspense fallback={<LoadingPage />}>
          <Suspects />
        </Suspense>
      }
    />

    <Route
      path="/image-cards/decks"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ImageCards />
        </Suspense>
      }
    />
    <Route
      path="/image-cards/descriptor"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ImageCardsDescriptor />
        </Suspense>
      }
    />
    <Route
      path="/image-cards/relationships"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ImageCardsRelationships />
        </Suspense>
      }
    />
    <Route
      path="/image-cards/comparator"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ImageCardsComparator />
        </Suspense>
      }
    />
    <Route
      path="/image-cards/connections"
      element={
        <Suspense fallback={<LoadingPage />}>
          <ImageCardsConnections />
        </Suspense>
      }
    />

    <Route
      path="/single-words"
      element={
        <Suspense fallback={<LoadingPage />}>
          <SingleWordsExpander />
        </Suspense>
      }
    />
    <Route
      path="/playground"
      element={
        <Suspense fallback={<LoadingPage />}>
          <Playground />
        </Suspense>
      }
    />
    <Route
      path="/movie-maker"
      element={
        <Suspense fallback={<LoadingPage />}>
          <MovieMaker />
        </Suspense>
      }
    />
  </Routes>
);
