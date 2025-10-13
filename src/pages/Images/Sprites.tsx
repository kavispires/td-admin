import { Layout, Space, Typography } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { SpriteFilters } from 'components/Sprites/SpriteFilters';
import { useQueryParams } from 'hooks/useQueryParams';
import { useMemo } from 'react';
import { SPRITE_LIBRARY } from 'utils/constants';

function Sprites() {
  // Set default query params
  const { queryParams } = useQueryParams();
  const sprite = queryParams.get('sprite') ?? '';

  const activeSprite = useMemo(() => SPRITE_LIBRARY[sprite] ?? {}, [sprite]);

  const list = useMemo(() => {
    return Array(activeSprite?.quantity ?? 0)
      .fill(0)
      .map((_, i) => {
        const id = (activeSprite?.startAt ?? 0) + i;
        return `${activeSprite?.prefix}-${id}`;
      });
  }, [activeSprite]);

  const SpriteComponent = activeSprite?.component;

  return (
    <PageLayout subtitle="Sprites" title="Images">
      <Layout hasSider>
        <PageSider>
          <SpriteFilters />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper error={null} hasResponseData={true} isLoading={false}>
            <Typography.Title level={2}>
              {activeSprite?.name ?? 'Select a library'}{' '}
              {activeSprite?.quantity ? `(${activeSprite?.quantity})` : ''}
            </Typography.Title>

            <Space wrap>
              {list.map((id) => {
                if (!SpriteComponent || !activeSprite.idProperty) {
                  return null;
                }

                return <SpriteComponent key={id} {...{ [activeSprite.idProperty]: id }} />;
              })}
            </Space>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default Sprites;
