import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

it('adds Pânico defaults to saved debugger preferences and persists toggles and resets', async () => {
  let savedState = JSON.stringify({ organiku: true });
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => savedState),
    setItem: vi.fn((_key: string, value: string) => {
      savedState = value;
    }),
  });
  const { debugDailyStore, toggleDebugMode, resetAllDebugModes } = await import('./debug-daily');

  expect(debugDailyStore.state.organiku).toBe(true);
  expect(debugDailyStore.state.panico).toBe(false);

  toggleDebugMode('panico');
  expect(debugDailyStore.state.panico).toBe(true);
  expect(JSON.parse(savedState)).toMatchObject({ organiku: true, panico: true });

  resetAllDebugModes();
  expect(debugDailyStore.state.panico).toBe(false);
  expect(JSON.parse(savedState)).toMatchObject({ organiku: false, panico: false });
});
