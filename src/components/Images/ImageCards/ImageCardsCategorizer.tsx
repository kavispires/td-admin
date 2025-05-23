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
              title={cardId}
              extra={hasCardAchievedMinimumRequirements(card) && <CheckCircleFilled />}
              key={cardId}
            >
              <div className="image-card-card">
                <div className="image-card-card__image">
                  <ImageCard id={cardId} width={cardWidth} />
                </div>
                <div className="image-card-card__data">
                  <div className="image-card-card__item">
                    <label htmlFor="focus">Focus</label>
                    <Select
                      id="focus"
                      mode="tags"
                      className="image-card-card__select"
                      placeholder="Focus"
                      onChange={handleFocusChange}
                      options={elements}
                      defaultValue={card.focus}
                    />
                  </div>

                  <div className="image-card-card__item">
                    <label htmlFor="actions">Actions</label>
                    <Select
                      id="actions"
                      mode="tags"
                      className="image-card-card__select"
                      placeholder="Actions"
                      onChange={handleActionsChange}
                      options={actions}
                      defaultValue={card.actions}
                    />
                  </div>

                  <div className="image-card-card__item">
                    <label htmlFor="colors">Colors</label>
                    <Select
                      id="colors"
                      mode="tags"
                      className="image-card-card__select"
                      placeholder="Colors"
                      onChange={handleColorChange}
                      options={colors}
                      defaultValue={card.colors}
                    />
                  </div>

                  <div className="image-card-card__item">
                    <label htmlFor="mood">Mood</label>
                    <Select
                      id="mood"
                      mode="tags"
                      className="image-card-card__select"
                      placeholder="Mood"
                      onChange={handleMoodChange}
                      options={mood}
                      defaultValue={card.mood}
                    />
                  </div>

                  <div className="image-card-card__item">
                    <label htmlFor="elements">Elements</label>
                    <Select
                      id="elements"
                      mode="tags"
                      className="image-card-card__select"
                      placeholder="Elements"
                      onChange={handleElementsChange}
                      options={elements}
                      defaultValue={card.elements}
                    />
                  </div>

                  <div className="image-card-card__item">
                    <label htmlFor="highlight-switch">Highlight</label>
                    <div>
                      <Switch id="highlight-switch" checked={card.highlight} onChange={toggleHighlight} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Button type="primary" onClick={() => save({})} disabled={!isDirty} loading={isSaving}>
              Save
            </Button>
          </Space>
        )}
      </Layout.Content>
    </Layout>
  );
}

export default ImageCardsCategorizerPage;
