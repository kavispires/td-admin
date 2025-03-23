import { Space } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import type { useTestimoniesResource } from 'pages/Testimonies/useTestimoniesResource';
import { SuspectAnswersTable } from './SuspectAnswersTable';
import { TestimoniesTable } from './TestimoniesTable';

export type TestimoniesContentProps = ReturnType<typeof useTestimoniesResource>;

export function TestimoniesContent(query: TestimoniesContentProps) {
  const { queryParams, is } = useQueryParams();

  return (
    <Space direction="vertical">
      {(is('display', 'questions') || !queryParams.get('display')) && <TestimoniesTable {...query} />}
      {is('display', 'suspects') && <SuspectAnswersTable {...query} />}
    </Space>
  );
}
