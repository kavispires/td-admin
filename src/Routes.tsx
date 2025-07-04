import { LoadingPage } from 'pages/LoadingPage';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

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
const ImageCardsPasscode = lazy(
  () => import('pages/Images/ImageCardsPasscode' /* webpackChunkName: "ImageCardsPasscode" */),
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
const DailyPage = lazy(() => import('pages/DailyPage' /* webpackChunkName: "DailyPage" */));
const CrimesHediondos = lazy(() => import('pages/CrimesHediondos' /* webpackChunkName: "CrimesHediondos" */));
const MovieMaker = lazy(() => import('pages/MovieMaker' /* webpackChunkName: "MovieMaker" */));
const FofocaQuente = lazy(() => import('pages/FofocaQuente' /* webpackChunkName: "FofocaQuente" */));
const Contenders = lazy(() => import('pages/Contenders' /* webpackChunkName: "Contenders" */));
const TestimoniesPage = lazy(
  () => import('pages/Testimonies/TestimoniesPage' /* webpackChunkName: "TestimoniesPage" */),
);

export const routes = (
  <Routes>
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <Home />
        </Suspense>
      }
      path="/"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <Resource />
        </Suspense>
      }
      path="/resources/listing"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ResourceGenerator />
        </Suspense>
      }
      path="/resources/generator"
    />

    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ArteRuimParser />
        </Suspense>
      }
      path="/game/arte-ruim-parser"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ArteRuimGroups />
        </Suspense>
      }
      path="/game/arte-ruim-groups"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ArteRuimDrawings />
        </Suspense>
      }
      path="/game/arte-ruim-drawings"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <CrimesHediondos />
        </Suspense>
      }
      path="/game/crimes-hediondos"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <FofocaQuente />
        </Suspense>
      }
      path="/game/fofoca-quente"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <Contenders />
        </Suspense>
      }
      path="/game/contenders"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <DailyPage />
        </Suspense>
      }
      path="/game/daily"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <TestimoniesPage />
        </Suspense>
      }
      path="/game/testimonies"
    />

    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <Items />
        </Suspense>
      }
      path="/items"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsGroups />
        </Suspense>
      }
      path="/items/groups"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsAttribution />
        </Suspense>
      }
      path="/items/attribution"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsDiagramSets />
        </Suspense>
      }
      path="/items/diagrams"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsDiscSets />
        </Suspense>
      }
      path="/items/discs"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsMovieSets />
        </Suspense>
      }
      path="/items/movies"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsCrimeHistory />
        </Suspense>
      }
      path="/items/crimes-history"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ItemsQuartets />
        </Suspense>
      }
      path="/items/quartets"
    />

    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <Sprites />
        </Suspense>
      }
      path="/images/sprites"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <Suspects />
        </Suspense>
      }
      path="/images/suspects"
    />

    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ImageCards />
        </Suspense>
      }
      path="/image-cards/decks"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ImageCardsDescriptor />
        </Suspense>
      }
      path="/image-cards/descriptor"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ImageCardsPasscode />
        </Suspense>
      }
      path="/image-cards/passcode"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ImageCardsRelationships />
        </Suspense>
      }
      path="/image-cards/relationships"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ImageCardsComparator />
        </Suspense>
      }
      path="/image-cards/comparator"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <ImageCardsConnections />
        </Suspense>
      }
      path="/image-cards/connections"
    />

    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <SingleWordsExpander />
        </Suspense>
      }
      path="/single-words"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <Playground />
        </Suspense>
      }
      path="/playground"
    />
    <Route
      element={
        <Suspense fallback={<LoadingPage />}>
          <MovieMaker />
        </Suspense>
      }
      path="/movie-maker"
    />
  </Routes>
);
