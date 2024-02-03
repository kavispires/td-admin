import { useTitle } from 'react-use';
// Ant Design Resources
import { Segmented } from 'antd';

// Components
import './dev-image-cards.scss';
import { useImageCardsRelationshipData } from './hooks';
import { useEffect, useState } from 'react';

import { isEmpty } from 'lodash';

import { useQueryParams } from 'hooks/useQueryParams';
import { Comparator } from './Comparator';
import { Grouping } from './Grouping';

function ImageCardsRelationshipsPage() {
  useTitle('Image Cards Relationships | Dev | Tarde Divertida');
  const [view, setView] = useState('default');
  const qp = useQueryParams({ view: 'grouping' });

  useEffect(() => {
    setView(qp.queryParams.view ?? 'grouping');
  }, [qp.queryParams.view]);

  const query = useImageCardsRelationshipData();

  if (isEmpty(query.data) && query.isLoading) {
    return <div>Loading....</div>;
  }

  if (query.isError) {
    return <div>Error</div>;
  }

  const segments = [
    { label: 'Compare', value: 'default', disabled: view === 'compare' },
    { label: 'Grouping', value: 'grouping', disabled: view === 'grouping' },
  ];

  return (
    <div>
      <Segmented options={segments} defaultValue={view} onChange={(v: any) => qp.addParam('view', v)} />

      {view === 'default' && <Comparator query={query} />}
      {view === 'grouping' && <Grouping query={query} />}
    </div>
  );
}

export default ImageCardsRelationshipsPage;
