import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { DailyDataCheck } from './DailyDataCheck';
import type { DailyEntry } from './hooks';

type UpdateOptions = {
  onSuccess: (result: unknown, update: { minAppVersion: string }) => void;
  onError: (error: Error) => void;
};

const mocks = vi.hoisted(() => ({
  getDoc: vi.fn<() => { isLoading: boolean; data: DailyEntry | undefined; dataUpdatedAt: number }>(),
  update: vi.fn<(path: string, docId: string, options: UpdateOptions) => unknown>(),
  mutate: vi.fn(),
  onUpdate: vi.fn<() => void>(),
  onVersionChange: vi.fn<(value: string) => void>(),
  setQueryData:
    vi.fn<
      (key: string[], updater: (previous: DailyEntry | undefined) => DailyEntry | undefined) => unknown
    >(),
  invalidateQueries: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@hooks/useGetFirestoreDoc', () => ({ useGetFirestoreDoc: mocks.getDoc }));
vi.mock('@hooks/useUpdateFirestoreDoc', () => ({ useUpdateFirestoreDoc: mocks.update }));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    setQueryData: mocks.setQueryData,
    invalidateQueries: mocks.invalidateQueries,
  }),
}));
vi.mock('@components/Common/FirestoreConsoleLink', () => ({ FirestoreConsoleLink: () => null }));
vi.mock('@components/CopyToClipboardButton', () => ({ CopyToClipboardButton: () => null }));
vi.mock('@microlink/react-json-view', () => ({ default: () => null }));
vi.mock('./DailyColumns', () => ({ dailyColumns: [] }));
vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    App: { useApp: () => ({ notification: { success: mocks.success, error: mocks.error } }) },
    Button: (
      props: Omit<React.ComponentProps<typeof actual.Button>, 'onClick'> & { onClick?: () => void },
    ) => {
      if (props.children === 'Update' && props.onClick) {
        mocks.onUpdate.mockImplementation(props.onClick);
      }
      return createElement(actual.Button, props);
    },
    Input: Object.assign(
      (
        props: Omit<React.ComponentProps<typeof actual.Input>, 'onChange'> & {
          onChange?: (event: { target: { value: string } }) => void;
        },
      ) => {
        if (props.placeholder === '2.0.35') {
          mocks.onVersionChange.mockImplementation((value) => props.onChange?.({ target: { value } }));
        }
        return createElement(actual.Input, props);
      },
      { Search: actual.Input.Search },
    ),
    Table: () => createElement('div', { 'data-testid': 'daily-table' }),
  };
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 10, 2, 13, 26));
  mocks.getDoc.mockReturnValue({ isLoading: false, data: undefined, dataUpdatedAt: 0 });
  mocks.update.mockReturnValue({ mutate: mocks.mutate, isPending: false });
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

it('prefills the verification date with today in local YYYY-MM-DD format without loading automatically', () => {
  const html = renderToStaticMarkup(createElement(DailyDataCheck));
  const dateInput = html
    .match(/<input\b[^>]*>/g)
    ?.find((input) => input.includes('placeholder="YYYY-MM-DD"'));

  expect(dateInput).toContain('value="2026-11-02"');
  expect(mocks.getDoc).toHaveBeenCalledWith('diario', '2026-11-02', { enabled: false });
});

function loadedEntry(minAppVersion?: string): DailyEntry {
  return { id: '2026-11-02', challenges: {}, contributions: {}, minAppVersion };
}

function renderLoadedEntry(minAppVersion?: string) {
  mocks.getDoc.mockReturnValue({
    isLoading: false,
    data: loadedEntry(minAppVersion),
    dataUpdatedAt: 1,
  });
  return renderToStaticMarkup(createElement(DailyDataCheck));
}

it('shows the saved version after the loaded result table without updating on render', () => {
  const html = renderLoadedEntry('2.0.40');
  expect(html).toContain('value="2.0.40"');
  expect(html.indexOf('Minimum App Version')).toBeGreaterThan(html.indexOf('data-testid="daily-table"'));
  expect(mocks.mutate).not.toHaveBeenCalled();
});

it.each(['2.0.40', undefined])('disables Update when the input matches the saved version %s', (version) => {
  const html = renderLoadedEntry(version);
  const button = html
    .match(/<button\b[^>]*>[\s\S]*?<\/button>/g)
    ?.find((element) => element.includes('Update</span>'));
  expect(button).toContain('disabled=""');
  mocks.onUpdate();
  expect(mocks.mutate).not.toHaveBeenCalled();
});

it('keeps input edits local until Update is clicked', () => {
  renderLoadedEntry('2.0.40');
  mocks.onVersionChange('2.0.45');
  expect(mocks.mutate).not.toHaveBeenCalled();
  expect(mocks.setQueryData).not.toHaveBeenCalled();
});

it('does not show an editor when no daily document is loaded', () => {
  const html = renderToStaticMarkup(createElement(DailyDataCheck));
  expect(html).not.toContain('Minimum App Version');
  expect(mocks.update).not.toHaveBeenCalled();
});

it('allows adding a version to legacy documents that lack the field', () => {
  expect(renderLoadedEntry()).toContain('Minimum App Version');
});

it.each(['', '2.0', 'v2.0.40', '02.0.40', '2.0.40-beta', '2.0.40+build'])(
  'rejects invalid version %s before updating Firestore',
  (version) => {
    renderLoadedEntry(version);
    mocks.onUpdate();
    expect(mocks.mutate).not.toHaveBeenCalled();
  },
);

it('updates only the normalized version after clicking Update and refreshes the displayed result on success', () => {
  renderLoadedEntry(' 2.0.40 ');
  expect(mocks.mutate).not.toHaveBeenCalled();
  mocks.onUpdate();
  expect(mocks.mutate).toHaveBeenCalledWith({ minAppVersion: '2.0.40' });
  expect(mocks.update).toHaveBeenCalledWith('diario', '2026-11-02', expect.any(Object));

  const options = mocks.update.mock.calls[0][2];
  options.onSuccess(undefined, { minAppVersion: '2.0.40' });
  const [queryKey, updater] = mocks.setQueryData.mock.calls[0];
  expect(queryKey).toEqual(['firestore', 'diario', '2026-11-02']);
  expect(updater(loadedEntry('2.0.35'))).toEqual(loadedEntry('2.0.40'));
  expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey, exact: true });
  expect(mocks.success).toHaveBeenCalled();
});

it('prevents updates while a write is pending', () => {
  mocks.update.mockReturnValue({ mutate: mocks.mutate, isPending: true });
  const html = renderLoadedEntry('2.0.40');
  const input = html.match(/<input\b[^>]*>/g)?.find((element) => element.includes('placeholder="2.0.35"'));
  expect(input).toContain('disabled=""');
  mocks.onUpdate();
  expect(mocks.mutate).not.toHaveBeenCalled();
});

it('reports failed updates without changing the displayed result or reporting success', () => {
  renderLoadedEntry('2.0.40');
  mocks.update.mock.calls[0][2].onError(new Error('Permission denied'));
  expect(mocks.error).toHaveBeenCalledWith(expect.objectContaining({ description: 'Permission denied' }));
  expect(mocks.setQueryData).not.toHaveBeenCalled();
  expect(mocks.success).not.toHaveBeenCalled();
});
