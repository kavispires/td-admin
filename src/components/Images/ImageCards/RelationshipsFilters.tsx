import { BarChartOutlined, SaveOutlined } from '@ant-design/icons';
import { Avatar, Button, Form } from 'antd';
import { PageSider, SiderContent } from 'components/Layout';
import { useImagesRelationshipsContext } from './ImagesRelationshipsContext';
import { FilterSelect, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { isEmpty } from 'lodash';

const TAGS_SELECTOR_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '= 0', value: 0 },
  { label: '< 3', value: 3 },
  { label: '< 5', value: 5 },
  { label: '< 10', value: 10 },
];

const SAMPLE_SIZE_OPTIONS = [
  {
    label: '9',
    value: 9,
  },
  {
    label: '15',
    value: 15,
  },
  {
    label: '30',
    value: 30,
  },
  {
    label: '50',
    value: 50,
  },
  {
    label: '100',
    value: 100,
  },
];

const CARD_SIZE_OPTIONS = [
  {
    label: 'Small',
    value: 100,
  },
  {
    label: 'Medium',
    value: 150,
  },
  {
    label: 'Large',
    value: 200,
  },
  {
    label: 'X-Large',
    value: 250,
  },
];

export function RelationshipsFilters() {
  const {
    query: { isDirty, isSaving, save, stats, data },
    randomGroups: { filters },
    showIds,
    setShowIds,
    tagThreshold,
    setTagThreshold,
    sampleSize,
    setSampleSize,
    cardSize,
    setCardSize,
  } = useImagesRelationshipsContext();

  return (
    <PageSider>
      <SiderContent>
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          onClick={() => save({})}
          disabled={!isDirty}
          loading={isSaving}
          danger
          block
        >
          Save
        </Button>
      </SiderContent>

      <SiderContent>
        <FilterSwitch
          label="Use Cycles"
          value={filters.useCycles}
          onChange={() => filters.toggleUseCycles()}
        />

        <FilterSwitch label="Show Ids" value={showIds} onChange={(c) => setShowIds(c)} />

        <FilterSelect
          onChange={(value) => setTagThreshold(value)}
          value={tagThreshold}
          options={TAGS_SELECTOR_OPTIONS}
          label="Tag Count"
        />

        <FilterSelect
          onChange={(value) => setSampleSize(value)}
          value={sampleSize}
          options={SAMPLE_SIZE_OPTIONS}
          label="Sample Size"
        />

        <FilterSelect
          onChange={(value) => setCardSize(value)}
          value={cardSize}
          options={CARD_SIZE_OPTIONS}
          label="Card Size"
        />
      </SiderContent>

      <SiderContent>
        <Form.Item
          label={
            <>
              <Avatar icon={<BarChartOutlined />} shape="square" size="small" style={{ marginRight: 6 }} />
              Stats
            </>
          }
        >
          <ul className="statistic__list">
            <li>Completion: {Math.floor((stats.total * 100) / (10 * 252))}%</li>
            <li>Total Relationships: {stats.total}</li>
            <li>Complete: {stats.complete}</li>
            <li>Overdone: {stats.overdone}</li>
            <li>Single Match: {stats.single}</li>
          </ul>
        </Form.Item>
      </SiderContent>

      <SiderContent>
        <DownloadButton
          data={data}
          fileName="imageCardsRelationships.json"
          loading={isSaving}
          disabled={isEmpty(data)}
          block
        />
      </SiderContent>
    </PageSider>
  );
}
