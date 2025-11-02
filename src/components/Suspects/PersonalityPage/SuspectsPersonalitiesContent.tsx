import { EnterOutlined } from '@ant-design/icons';
import { Alert, Divider, Flex, Image, Space, Tooltip, Typography } from 'antd';
import { orderBy, truncate } from 'lodash';
import { useMemo } from 'react';
import { SuspectImageCard } from '../SuspectImageCard';
import type { useSuspectPersonalitiesData } from './useSuspectPersonalitiesData';

export function SuspectsPersonalitiesContent({ data }: ReturnType<typeof useSuspectPersonalitiesData>) {
  const filteredData = useMemo(() => {
    return orderBy(Object.values(data.suspects), [(o) => Number(o.id.split('-')[1])], ['asc']);
  }, [data.suspects]);

  return (
    <>
      <Flex align="center" justify="space-between">
        <Typography.Title level={2}>{/* Deck {variant} ({deck.length}) */}IDK</Typography.Title>
        {/* <Segmented
          onChange={(value) => setView(value)}
          options={[
            { value: 'cards', icon: <AppstoreOutlined /> },
            { value: 'table', icon: <BarsOutlined /> },
          ]}
        /> */}
      </Flex>
      <Space style={{ position: 'sticky', top: 0, background: 'black', zIndex: 1, width: '100%' }}>
        Filters and Sorters come here
      </Space>

      <Image.PreviewGroup>
        <Flex gap={16} style={{ marginBottom: 16 }} wrap>
          {filteredData.map((suspect) => {
            const { zodiacSign, ascendantSign, mbtiType, notEnoughData } =
              data.personalities[suspect.id] || {};
            return (
              <Flex key={suspect.id} vertical>
                <SuspectImageCard cardId={suspect.id} cardWidth={120} className="suspect__image" />
                <Typography.Text>
                  {truncate(suspect.name.pt, { length: 10 })} ({suspect.age})
                </Typography.Text>
                {notEnoughData ? (
                  <Alert message="N/A" type="warning" />
                ) : (
                  <>
                    <Tooltip title={data.zodiacCrossReference[zodiacSign || 'N/A']?.description || ''}>
                      <Typography.Text type={!ZODIAC_SIGNS?.[zodiacSign] ? 'danger' : undefined}>
                        {ZODIAC_SIGNS?.[zodiacSign] || 'N/A'}
                      </Typography.Text>
                    </Tooltip>
                    <Tooltip title={data.zodiacCrossReference[ascendantSign || 'N/A']?.description || ''}>
                      <Typography.Text type="secondary">
                        <EnterOutlined style={{ transform: 'scaleX(-1)' }} />{' '}
                        {ZODIAC_SIGNS?.[ascendantSign] || 'N/A'}
                      </Typography.Text>
                    </Tooltip>
                    <Divider className="my-1" />
                    <Typography.Text type={mbtiType.includes('X') ? 'danger' : undefined}>
                      {mbtiType || 'N/A'}
                    </Typography.Text>

                    {/* <Typography.Text>
                  Zodiac: {data.personalities[suspect.id]?.zodiacSign || 'N/A'}
                </Typography.Text> */}
                  </>
                )}
              </Flex>
            );
          })}
        </Flex>
      </Image.PreviewGroup>
    </>
  );
}

const ZODIAC_SIGNS: Dictionary<string> = {
  aries: 'Áries ♈',
  touro: 'Touro ♉',
  gemeos: 'Gêmeos ♊',
  cancer: 'Câncer ♋',
  leao: 'Leão ♌',
  virgem: 'Virgem ♍',
  libra: 'Libra ♎',
  escorpiao: 'Escorpião ♏',
  sagitario: 'Sagitário ♐',
  capricornio: 'Capricórnio ♑',
  aquario: 'Aquário ♒',
  peixes: 'Peixes ♓',
};
