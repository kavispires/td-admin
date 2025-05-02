import { Flex, Table, type TableProps } from 'antd';
import { IdField } from 'components/Common/EditableFields';
import { CanvasSVG } from 'components/Daily/CanvasSVG';
import { useQueryParams } from 'hooks/useQueryParams';
import { orderBy } from 'lodash';
import moment from 'moment';
import {
  ARTIST_ID_ALIAS,
  type DrawingPerArtist,
  type useDrawingsResourceData,
} from 'pages/ArteRuim/useArteRuimDrawings';
import { useMemo } from 'react';
import type { DrawingData } from 'types';

type ArteRuimDrawingsContentProps = ReturnType<typeof useDrawingsResourceData>;

export function ArteRuimDrawingsContent(query: ArteRuimDrawingsContentProps) {
  const { queryParams } = useQueryParams();

  if (queryParams.get('view') === 'drawings') {
    return <ByDrawingContent {...query} />;
  }

  return <ByArtistContent {...query} />;
}

function ByArtistContent(query: ArteRuimDrawingsContentProps) {
  const sortedRows = useMemo(() => {
    return orderBy(Object.values(query.drawingsPerArtist), ['drawingsCount'], ['desc']);
  }, [query.drawingsPerArtist]);

  const columns: TableProps<DrawingPerArtist>['columns'] = [
    {
      title: 'Artist',
      dataIndex: 'artistId',
      key: 'artistId',
      render: (artistId: string) => <IdField value={artistId} />,
    },
    {
      title: 'Alias',
      dataIndex: 'artistId',
      key: 'artistId',
      render: (artistId: string) => ARTIST_ID_ALIAS?.[artistId.substring(0, 5)] ?? '',
    },
    {
      title: 'Drawings',
      dataIndex: 'drawingsCount',
      key: 'drawingsCount',
    },
    {
      title: 'First Drawing',
      dataIndex: 'firstDrawingAt',
      key: 'firstDrawingAt',
      render: (date: string) => (
        <span>
          {moment(date).format('MM/DD/YYYY HH:mm:ss')} <IdField value={date} />
        </span>
      ),
    },
    {
      title: 'Last Drawing',
      dataIndex: 'lastDrawingAt',
      key: 'lastDrawingAt',
      render: (date: string) => moment(date).format('MM/DD/YYYY HH:mm:ss'),
    },
  ];

  return (
    <div>
      <h1>Drawings Per Artist</h1>
      <Table columns={columns} dataSource={sortedRows} rowKey="artistId" />
    </div>
  );
}

function ByDrawingContent(query: ArteRuimDrawingsContentProps) {
  const sortedRows = useMemo(() => {
    return orderBy(Object.values(query.drawings), [(e) => Number(e.id.split('-')[1])], ['asc']);
  }, [query.drawings]);

  const columns: TableProps<DrawingData>['columns'] = [
    {
      title: 'Card',
      dataIndex: 'id',
      key: 'id',
      render: (cardId: string) => <IdField value={cardId} />,
    },
    {
      title: 'Text',
      dataIndex: 'text',
      key: 'text',
    },
    {
      title: 'Drawings',
      dataIndex: 'drawings',
      key: 'drawings',
      render: (drawings: DrawingData['drawings']) => (
        <Flex gap={8}>
          {drawings.map((drawing) => (
            <div key={drawing.id}>
              <CanvasSVG key={drawing.id} drawing={drawing.drawing} width={50} className="canvas" />
              <pre>{drawing.artistId.substring(0, 5)}</pre>
            </div>
          ))}
        </Flex>
      ),
    },
  ];

  return (
    <div>
      <h1>Drawings Per Card</h1>
      <Table columns={columns} dataSource={sortedRows} rowKey="cardId" />
    </div>
  );
}
