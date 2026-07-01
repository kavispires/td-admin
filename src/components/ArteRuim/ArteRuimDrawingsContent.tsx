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
} from 'pages/Games/ArteRuim/useArteRuimDrawings';
import { useMemo } from 'react';
import type { DrawingData } from 'types';

type ArteRuimDrawingsContentProps = ReturnType<typeof useDrawingsResourceData>;

export function ArteRuimDrawingsContent(query: ArteRuimDrawingsContentProps) {
  const { queryParams } = useQueryParams();

  if (queryParams.get('display') === 'drawings') {
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
      sorter: (a, b) => a.artistId.localeCompare(b.artistId),
    },
    {
      title: 'Alias',
      dataIndex: 'artistId',
      key: 'artistId',
      render: (artistId: string) => ARTIST_ID_ALIAS?.[artistId.substring(0, 5)] ?? '',
      sorter: (a, b) => {
        const aliasA = ARTIST_ID_ALIAS?.[a.artistId.substring(0, 5)] ?? '';
        const aliasB = ARTIST_ID_ALIAS?.[b.artistId.substring(0, 5)] ?? '';
        return aliasA.localeCompare(aliasB);
      },
    },
    {
      title: 'Drawings',
      dataIndex: 'drawingsCount',
      key: 'drawingsCount',
      sorter: (a, b) => a.drawingsCount - b.drawingsCount,
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
      sorter: (a, b) => a.firstDrawingAt - b.firstDrawingAt,
    },
    {
      title: 'Last Drawing',
      dataIndex: 'lastDrawingAt',
      key: 'lastDrawingAt',
      render: (date: string) => moment(date).format('MM/DD/YYYY HH:mm:ss'),
      sorter: (a, b) => a.lastDrawingAt - b.lastDrawingAt,
    },
    {
      title: 'Days Between Entries',
      dataIndex: 'daysBetweenLastTwoDrawings',
      key: 'daysBetweenLastTwoDrawings',
      render: (days: number | undefined) => (days !== undefined ? days : 'N/A'),
      sorter: (a, b) => {
        const daysA = a.daysBetweenLastTwoDrawings ?? -1;
        const daysB = b.daysBetweenLastTwoDrawings ?? -1;
        return daysA - daysB;
      },
    },
    {
      title: 'Days Since Last Draw',
      dataIndex: 'daysSinceLastDraw',
      key: 'daysSinceLastDraw',
      render: (days: number) => (days !== undefined ? days : 'N/A'),
      sorter: (a, b) => a.daysSinceLastDraw - b.daysSinceLastDraw,
    },
  ];

  return (
    <div>
      <h1>Drawings Per Artist</h1>
      <Table
        columns={columns}
        dataSource={sortedRows}
        rowKey="artistId"
      />
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
      sorter: (a, b) => {
        const numA = Number(a.id.split('-')[1]);
        const numB = Number(b.id.split('-')[1]);
        return numA - numB;
      },
    },
    {
      title: 'Text',
      dataIndex: 'text',
      key: 'text',
      sorter: (a, b) => a.text.localeCompare(b.text),
    },
    {
      title: 'Drawings',
      dataIndex: 'drawings',
      key: 'drawings',
      render: (drawings: DrawingData['drawings']) => (
        <Flex gap={8}>
          {drawings.map((drawing) => (
            <div key={drawing.id}>
              <CanvasSVG
                className="canvas"
                drawing={drawing.drawing}
                key={drawing.id}
                width={50}
              />
              <pre>{drawing.artistId.substring(0, 5)}</pre>
            </div>
          ))}
        </Flex>
      ),
      sorter: (a, b) => a.drawings.length - b.drawings.length,
    },
  ];

  return (
    <div>
      <h1>Drawings Per Card</h1>
      <Table
        columns={columns}
        dataSource={sortedRows}
        rowKey="cardId"
      />
    </div>
  );
}
