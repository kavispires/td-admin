import { Button, Flex, Progress, Rate, Space, Table, type TableProps, Tabs, Tag, Typography } from 'antd';
import type { TabsProps } from 'antd/lib';
import { PopoverInfo } from 'components/Common/PopoverInfo';
import { AlienSign } from 'components/Sprites';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useQueryParams } from 'hooks/useQueryParams';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ItemAttributesValues, ItemAttribute } from 'types';

export function ItemStats() {
  // console.log(attributesList);
  // console.log(attributes);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'All Attributes',
      children: <AttributesStatsTable type="all" />,
    },
    {
      key: '2',
      label: 'Default Attributes',
      children: <AttributesStatsTable type="default" />,
    },
    {
      key: '3',
      label: 'Custom Attributes',
      children: <AttributesStatsTable type="custom" />,
    },
  ];

  return (
    <div className="my-4">
      <Typography.Title level={5}>Stats</Typography.Title>

      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}

const calculateAttributeStats = (attribute: ItemAttribute, itemsAttributes: ItemAttributesValues[]) => {
  let completionCount = 0;
  let tensCount = 0;
  let fivesCount = 0;
  let zerosCount = 0;
  let negativeOnesCount = 0;
  let negativeThreesCount = 0;
  let negativeTensCount = 0;
  let positiveCount = 0;

  itemsAttributes.forEach(({ attributes }) => {
    if (attributes[attribute.id]) {
      completionCount++;

      const value = attributes[attribute.id];
      if (value === 10) {
        tensCount++;
      } else if (value === 5) {
        fivesCount++;
      } else if (value === 0 || !value) {
        zerosCount++;
      } else if (value === -1) {
        negativeOnesCount++;
      } else if (value === -3) {
        negativeThreesCount++;
      } else if (value === -10) {
        negativeTensCount++;
      }

      if (value > 0) {
        positiveCount++;
      }
    }
  });

  const total = itemsAttributes.length;
  const completionPercentage = (completionCount / total) * 100;
  const tensPercentage = (tensCount / total) * 100;
  const fivesPercentage = (fivesCount / total) * 100;
  const zerosPercentage = (zerosCount / total) * 100;
  const negativeOnesPercentage = (negativeOnesCount / total) * 100;
  const negativeThreesPercentage = (negativeThreesCount / total) * 100;
  const negativeTensPercentage = (negativeTensCount / total) * 100;
  const positivePercentage = (positiveCount / total) * 100;

  return {
    completionPercentage: completionPercentage.toFixed(1),
    tensPercentage: tensPercentage.toFixed(1),
    fivesPercentage: fivesPercentage.toFixed(1),
    zerosPercentage: zerosPercentage.toFixed(1),
    negativeOnesPercentage: negativeOnesPercentage.toFixed(1),
    negativeThreesPercentage: negativeThreesPercentage.toFixed(1),
    negativeTensPercentage: negativeTensPercentage.toFixed(1),
    positivePercentage: positivePercentage.toFixed(1),
  };
};

type AttributesStatsTableProps = {
  type: 'all' | 'default' | 'custom';
};

function AttributesStatsTable({ type }: AttributesStatsTableProps) {
  const { availableItemIds, getItemAttributeValues, attributesList } = useItemsAttributeValuesContext();
  const navigate = useNavigate();
  const { is } = useQueryParams();

  const attributesPool = useMemo(() => {
    if (type === 'default') {
      return attributesList.filter((attribute) => attribute.default);
    }

    if (type === 'custom') {
      return attributesList.filter((attribute) => !attribute.default);
    }

    return attributesList;
  }, [attributesList, type]);

  const rows = useMemo(() => {
    const itemsAttributes = availableItemIds.map((id) => getItemAttributeValues(id));

    return attributesPool.map((attribute) => {
      return {
        ...attribute,
        ...calculateAttributeStats(attribute, itemsAttributes),
      };
    });
  }, [attributesPool, availableItemIds, getItemAttributeValues]);

  const columns: TableProps['columns'] = [
    {
      title: 'Attribute',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Flex align="center" gap={8}>
          {is('showGlyphs') && <AlienSign id={record.spriteId} width={30} />}
          {name.en}
          {record.default ? <Tag className="ml-1">default</Tag> : ''}
          {record.limited ? <Tag className="ml-1">limited</Tag> : ''}
          <PopoverInfo title={record.description.en} />
        </Flex>
      ),
      sorter: (a, b) => a.name.en.localeCompare(b.name.en),
    },
    {
      title: '*',
      dataIndex: 'spriteId',
      key: 'spriteId',
      render: (spriteId) => <AlienSign id={spriteId} width={18} padding={0} />,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => a.priority - b.priority,
    },

    {
      title: 'Positive',
      dataIndex: 'positivePercentage',
      key: 'positivePercentage',
      render: (positivePercentage: string) => `${positivePercentage}%`,
      sorter: (a, b) => Number.parseFloat(a.positivePercentage) - Number.parseFloat(b.positivePercentage),
    },
    {
      title: '10',
      dataIndex: 'tensPercentage',
      key: 'tensPercentage',
      render: (tensPercentage: string, record) => {
        if (record.limited) {
          return '-';
        }

        return `${tensPercentage}%`;
      },
      sorter: (a, b) => Number.parseFloat(a.tensPercentage) - Number.parseFloat(b.tensPercentage),
    },
    {
      title: '5',
      dataIndex: 'fivesPercentage',
      key: 'fivesPercentage',
      render: (fivesPercentage: string) => `${fivesPercentage}%`,
      sorter: (a, b) => Number.parseFloat(a.fivesPercentage) - Number.parseFloat(b.fivesPercentage),
    },
    {
      title: '-1',
      dataIndex: 'negativeOnesPercentage',
      key: 'negativeOnesPercentage',
      render: (negativeOnesPercentage: string) => `${negativeOnesPercentage}%`,
      sorter: (a, b) =>
        Number.parseFloat(a.negativeOnesPercentage) - Number.parseFloat(b.negativeOnesPercentage),
    },
    {
      title: '-3',
      dataIndex: 'negativeThreesPercentage',
      key: 'negativeThreesPercentage',
      render: (negativeThreesPercentage: string) => `${negativeThreesPercentage}%`,
      sorter: (a, b) =>
        Number.parseFloat(a.negativeThreesPercentage) - Number.parseFloat(b.negativeThreesPercentage),
    },
    {
      title: '-10',
      dataIndex: 'negativeTensPercentage',
      key: 'negativeTensPercentage',
      render: (negativeTensPercentage: string) => `${negativeTensPercentage}%`,
      sorter: (a, b) =>
        Number.parseFloat(a.negativeTensPercentage) - Number.parseFloat(b.negativeTensPercentage),
    },
    {
      title: 'Completion',
      dataIndex: 'completionPercentage',
      key: 'completionPercentage',
      render: (completionPercentage: string) => (
        <Progress percent={Number.parseFloat(completionPercentage)} size="small" />
      ),
      sorter: (a, b) => Number.parseFloat(a.completionPercentage) - Number.parseFloat(b.completionPercentage),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => <Rate count={4} value={level} disabled />,
      sorter: (a, b) => a.level - b.level,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space>
          <Button.Group>
            <Button
              size="small"
              shape="round"
              onClick={() => navigate(`/items/attribution?view=grouping&attribute=${record.id}&page=1`)}
            >
              Grouping
            </Button>
            <Button
              size="small"
              shape="round"
              onClick={() => navigate(`/items/attribution?view=sampler&attribute=${record.id}&size=6`)}
            >
              Sample
            </Button>
          </Button.Group>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Typography.Paragraph>Total: {rows.length}</Typography.Paragraph>
      <Table columns={columns} dataSource={rows} pagination={false} rowKey="id" size="small" />
    </>
  );
}
