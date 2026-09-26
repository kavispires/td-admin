import { useQueryParams } from '@hooks/useQueryParams';
import type { useTestimoniesResource } from '@pages/Libraries/Testimonies/useTestimoniesResource';
import { LoadingPage } from '@pages/LoadingPage';
import { EspionagemSimulator } from './EspionagemSimulator';
import { SuspectAnswersTable } from './SuspectAnswersTable';
import { TestimoniesTable } from './TestimoniesTable';

export type TestimoniesContentProps = ReturnType<typeof useTestimoniesResource>;

export function TestimoniesContent(query: TestimoniesContentProps) {
  const { queryParams, is } = useQueryParams();

  if (query.isLoading) return <LoadingPage />;

  return (
    <>
      {(is('display', 'questions') || !queryParams.get('display')) && <TestimoniesTable {...query} />}
      {is('display', 'suspects') && <SuspectAnswersTable {...query} />}
      {is('display', 'simulator') && <EspionagemSimulator />}
    </>
  );
}
