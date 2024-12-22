import type { TableProps } from 'antd';
import type { ExpandableConfig } from 'antd/es/table/interface';
import { useState } from 'react';

type useTableExpandableRowsOptions<TRecord extends { id: string }> = {
  /**
   * The maximum number of expanded rows.
   * To make sure only one row is expanded at a time, set this to 1.
   */
  maxExpandedRows?: number;
} & TableProps<TRecord>['expandable'];

export function useTableExpandableRows<TRecord extends { id: string }>({
  maxExpandedRows,
  rowExpandable,
  defaultExpandAllRows,
  ...expandable
}: useTableExpandableRowsOptions<TRecord>): ExpandableConfig<TRecord> {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const onExpand = (expanded: boolean, record: TRecord) => {
    const newExpandedRowKeys = [...expandedRowKeys]; // Create a copy to avoid mutation

    if (!expanded) {
      return setExpandedRowKeys(newExpandedRowKeys.filter((key) => key !== record.id));
    }

    if (maxExpandedRows) {
      while (newExpandedRowKeys.length >= maxExpandedRows) {
        newExpandedRowKeys.shift();
      }
      newExpandedRowKeys.push(record.id);

      setExpandedRowKeys(newExpandedRowKeys);
    }
  };

  return {
    expandedRowKeys,
    rowExpandable: rowExpandable ?? (() => true),
    defaultExpandAllRows: defaultExpandAllRows ?? false,
    onExpand,
    ...expandable,
  };
}
