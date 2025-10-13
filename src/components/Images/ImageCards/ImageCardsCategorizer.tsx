import './dev-image-cards.scss';
import { CheckCircleFilled } from '@ant-design/icons';
import { Button, Card, Layout, Select, Space, Switch } from 'antd';
import { useCardWidth } from 'hooks/useCardWidth';
import { useMemo } from 'react';
import { useTitle } from 'react-use';
import { ImageCard } from '../ImageCard';
import { useImageCardsData, useRandomCard } from './hooks/hooks';
import { buildDictionaries, hasCardAchievedMinimumRequirements } from './utils';

function ImageCardsCategorizerPage() {
  useTitle('Image Cards Categorizer | Dev | Tarde Divertida');

  const [cardWidth] = useCardWidth(2);

  const { data, isLoading, isDirty, setDirty, isSuccess, isSaving, save } = useImageCardsData();
  // Selects a random deck, but gives option select for a specific deck (1-10)
  const { cardId, card, onRandomCard, update, toggleHighlight } = useRandomCard(data, setDirty);

  // Build local object of tags
  const dataKey = JSON.stringify(data);
  // biome-ignore lint/correctness/useExhaustiveDependencies: no need to update the dictionary on every render
  const { colors, mood, elements, actions } = useMemo(() => buildDictionaries(data), [dataKey]);

  const handleFocusChange = (value: string[]) => {
    update('focus', value);
  };

  const handleColorChange = (value: string[]) => {
    update('colors', value);
  };

  const handleMoodChange = (value: string[]) => {
    update('mood', value);
  };

  const handleElementsChange = (value: string[]) => {
    update('elements', value);
  };

  const handleActionsChange = (value: string[]) => {
    update('actions', value);
  };

  return (
    <Layout className="dev-layout">
      <Layout.Content className="dev-content">
        {isLoading && <div>Loading...</div>}
        {isSaving && <div>Saving...</div>}
        {isSuccess && !isSaving && (
          <Space className="space-container" direction="vertical">
            <Button onClick={onRandomCard}>Random Card</Button>

            <Card
              extra={hasCardAchievedMinimumRequirements(card) && <CheckCircleFilled />}
              key={cardId}
              title={cardId}
            >
              <div className="image-card-card">
                <div className="image-card-card__image">
                  <ImageCard cardId={cardId} cardWidth={cardWidth} />
                </div>
                <div className="image-card-card__data">
                  <div className="image-card-card__item">
                    <label htmlFor="focus">Focus</label>
                    <Select
                      className="image-card-card__select"
                      defaultValue={card.focus}
                      id="focus"
                      mode="tags"
                      onChange={handleFocusChange}
                      options={elements}
                      placeholder="Focus"
                    />
                  </div>

                  <div className="image-card-card__item">
                    <label htmlFor="actions">Actions</label>
                    <Select
                      className="image-card-card__select"
                      defaultValue={card.actions}
                      id="actions"
                      mode="tags"
                      onChange={handleActionsChange}
                      options={actions}
                      placeholder="Actions"
                    />
                  </div>

                  <div className="image-card-card__item">
                    <label htmlFor="colors">Colors</label>
                    <Select
                      className="image-card-card__select"
                      defaultValue={card.colors}
                      id="colors"
                      mode="tags"
                      onChange={handleColorChange}
                      options={colors}
                      placeholder="Colors"
                    />
                  </div>

                  <div className="image-card-card__item">
                    <label htmlFor="mood">Mood</label>
                    <Select
                      className="image-card-card__select"
                      defaultValue={card.mood}
                      id="mood"
                      mode="tags"
                      onChange={handleMoodChange}
                      options={mood}
                      placeholder="Mood"
                    />
                  </div>

                  <div className="image-card-card__item">
                    <label htmlFor="elements">Elements</label>
                    <Select
                      className="image-card-card__select"
                      defaultValue={card.elements}
                      id="elements"
                      mode="tags"
                      onChange={handleElementsChange}
                      options={elements}
                      placeholder="Elements"
                    />
                  </div>

                  <div className="image-card-card__item">
                    <label htmlFor="highlight-switch">Highlight</label>
                    <div>
                      <Switch checked={card.highlight} id="highlight-switch" onChange={toggleHighlight} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Button disabled={!isDirty} loading={isSaving} onClick={() => save({})} type="primary">
              Save
            </Button>
          </Space>
        )}
      </Layout.Content>
    </Layout>
  );
}

export default ImageCardsCategorizerPage;
