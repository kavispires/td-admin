import { Table } from 'antd';
import { useMemo } from 'react';

type ResourceCardsProps = {
  response: any;
  resourceName: string | null;
};

export function ResourceTable({ response, resourceName }: ResourceCardsProps) {
  const list: any[] = Object.values(response);

  const columns = useMemo(() => {
    const keys: Record<string, boolean> = {};

    list.forEach((entry) => {
      Object.keys(entry).forEach((key) => {
        if (keys[key] === undefined) {
          keys[key] = true;
        }
      });
    });

    return Object.keys(keys).map((key) => ({
      title: key,
      dataIndex: key,
      key,
      render: (v: any) => (typeof v === 'string' ? v : JSON.stringify(v)),
    }));
  }, [list]);

  return (
    <div className="page-content">
      <Table columns={columns} dataSource={list} />
    </div>
  );
}
