import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DailyDataPopulation } from './DailyDataPopulation';

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  save: vi.fn(),
  version: vi.fn(),
}));

vi.mock('@components/Common', () => ({ FilterSelect: () => null }));
vi.mock('@components/Common/FirestoreConsoleLink', () => ({ FirestoreConsoleLink: () => null }));
vi.mock('@components/DataLoadingWrapper', () => ({
  DataLoadingWrapper: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock('antd', async (importOriginal) => ({
  ...(await importOriginal<typeof import('antd')>()),
  Table: () => null,
}));
vi.mock('./DailyColumns', () => ({ dailyColumns: [] }));
vi.mock('./hooks', () => ({
  useLoadDailySetup: mocks.load,
  useSaveDailySetup: mocks.save,
}));
vi.mock('./hooks/useDailyMinAppVersion', () => ({ useDailyMinAppVersion: mocks.version }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.load.mockReturnValue({
    entries: [{ id: '2026-10-27', minAppVersion: '2.0.40', challenges: {}, contributions: {} }],
    isLoading: false,
    isGenerating: false,
    isMissingEntries: false,
    missingEntries: [],
    errors: [],
  });
  mocks.save.mockReturnValue({ save: vi.fn(), isPending: false });
  mocks.version.mockReturnValue({
    value: '2.0.40',
    minAppVersion: '2.0.40',
    onChange: vi.fn(),
    reconcileHistory: vi.fn(),
  });
});

function renderPopulation() {
  const html = renderToStaticMarkup(createElement(DailyDataPopulation));
  const saveButton = html
    .match(/<button\b[^>]*>[\s\S]*?<\/button>/g)
    ?.find((button) => button.includes('Save</span>'));
  const input = html.match(/<input\b[^>]*>/g)?.find((element) => element.includes('placeholder="2.0.35"'));
  if (!saveButton || !input) {
    throw new Error('Population did not render the save button and version input.');
  }
  return { html, saveButton, input };
}

describe('Daily Population minimum app version controls', () => {
  it('passes the accepted version to generation and enables saving valid drafts', () => {
    const { html, saveButton, input } = renderPopulation();
    expect(html).toContain('Minimum App Version');
    expect(input).toContain('value="2.0.40"');
    expect(saveButton).not.toContain('disabled=""');
    expect(mocks.load).toHaveBeenCalledWith(false, '', 7, '2.0.40');
  });

  it.each([
    ['', 'Enter a version in major.minor.patch format.'],
    ['bad', 'Enter a version in major.minor.patch format.'],
    ['2.0.35', 'Minimum app version cannot be lower than 2.0.40.'],
  ])('blocks saving invalid draft %s while keeping its feedback visible', (value, error) => {
    mocks.version.mockReturnValue({
      value,
      minAppVersion: '2.0.40',
      error,
      onChange: vi.fn(),
      reconcileHistory: vi.fn(),
    });
    const { html, input, saveButton } = renderPopulation();
    expect(html).toContain(error);
    expect(input).toContain('aria-invalid="true"');
    expect(saveButton).toContain('disabled=""');
  });

  it('locks the version input and save button while a save is pending', () => {
    mocks.save.mockReturnValue({ save: vi.fn(), isPending: true });
    const { input, saveButton } = renderPopulation();
    expect(input).toContain('disabled=""');
    expect(saveButton).toContain('disabled=""');
  });

  it('surfaces localStorage and malformed history warnings', () => {
    mocks.version.mockReturnValue({
      value: '2.0.40',
      minAppVersion: '2.0.40',
      storageWarning: 'Could not save the minimum app version to localStorage.',
      onChange: vi.fn(),
      reconcileHistory: vi.fn(),
    });
    mocks.load.mockReturnValue({
      ...mocks.load(),
      historyVersionWarning: 'The saved _app-version history is invalid and has been ignored.',
    });
    const { html } = renderPopulation();
    expect(html).toContain('Could not save the minimum app version to localStorage.');
    expect(html).toContain('The saved _app-version history is invalid and has been ignored.');
  });
});
