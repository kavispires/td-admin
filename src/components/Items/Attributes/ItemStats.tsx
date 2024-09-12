import { Button, Progress, Rate, Space, Table, TableProps, Tabs, Tag, Typography } from 'antd';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { useMemo } from 'react';
import { ItemAtributesValues, ItemAttribute } from 'types';
import { TabsProps } from 'antd/lib';
import { useNavigate } from 'react-router-dom';

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

      <Typography.Paragraph></Typography.Paragraph>

      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}

const calculateAttributeStats = (attribute: ItemAttribute, itemsAttributes: ItemAtributesValues[]) => {
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
        <span>
          {name.en}
          {record.default ? <Tag className="ml-1">default</Tag> : ''}
          {record.limited ? <Tag className="ml-1">limited</Tag> : ''}
        </span>
      ),
      sorter: (a, b) => a.name.en.localeCompare(b.name.en),
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
      sorter: (a, b) => parseFloat(a.positivePercentage) - parseFloat(b.positivePercentage),
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
      sorter: (a, b) => parseFloat(a.tensPercentage) - parseFloat(b.tensPercentage),
    },
    {
      title: '5',
      dataIndex: 'fivesPercentage',
      key: 'fivesPercentage',
      render: (fivesPercentage: string) => `${fivesPercentage}%`,
      sorter: (a, b) => parseFloat(a.fivesPercentage) - parseFloat(b.fivesPercentage),
    },
    {
      title: '-1',
      dataIndex: 'negativeOnesPercentage',
      key: 'negativeOnesPercentage',
      render: (negativeOnesPercentage: string) => `${negativeOnesPercentage}%`,
      sorter: (a, b) => parseFloat(a.negativeOnesPercentage) - parseFloat(b.negativeOnesPercentage),
    },
    {
      title: '-3',
      dataIndex: 'negativeThreesPercentage',
      key: 'negativeThreesPercentage',
      render: (negativeThreesPercentage: string) => `${negativeThreesPercentage}%`,
      sorter: (a, b) => parseFloat(a.negativeThreesPercentage) - parseFloat(b.negativeThreesPercentage),
    },
    {
      title: '-10',
      dataIndex: 'negativeTensPercentage',
      key: 'negativeTensPercentage',
      render: (negativeTensPercentage: string) => `${negativeTensPercentage}%`,
      sorter: (a, b) => parseFloat(a.negativeTensPercentage) - parseFloat(b.negativeTensPercentage),
    },
    {
      title: 'Completion',
      dataIndex: 'completionPercentage',
      key: 'completionPercentage',
      render: (completionPercentage: string) => (
        <Progress percent={parseFloat(completionPercentage)} size="small" />
      ),
      sorter: (a, b) => parseFloat(a.completionPercentage) - parseFloat(b.completionPercentage),
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

  return <Table columns={columns} dataSource={rows} pagination={false} rowKey="id" size="small" />;
}
