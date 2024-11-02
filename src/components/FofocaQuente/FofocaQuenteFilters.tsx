import { Divider, Flex, Typography } from 'antd';
import { FilterSelect, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useItemsContext } from 'context/ItemsContext';
import { capitalize, cloneDeep, orderBy } from 'lodash';
import { useEffect, useMemo } from 'react';
import { Item, TeenageStudent } from 'types';
import { sortJsonKeys } from 'utils';
import { useQueryParams } from 'hooks/useQueryParams';
import { SaveButton } from 'components/Common/SaveButton';
import { OpenAIOutlined } from '@ant-design/icons';
import { useTDResource } from 'hooks/useTDResource';
import { buildDataFilters, DataFilters } from 'components/Common/DataFilters';
import Sider from 'antd/es/layout/Sider';

export type FofocaQuenteFiltersProps = ReturnType<typeof useTDResource<TeenageStudent>>;

export function FofocaQuenteFilters({ data }: FofocaQuenteFiltersProps) {
  const dataFilters = useMemo(() => buildDataFilters(data), [data]);

  return (
    <SiderContent>
      <DataFilters data={data} />
    </SiderContent>
  );
}
