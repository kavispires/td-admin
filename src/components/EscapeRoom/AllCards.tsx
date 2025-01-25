import { Button, Flex, Select, Typography } from 'antd';
import { useGridPagination } from 'hooks/useGridPagination';
import { useQueryParams } from 'hooks/useQueryParams';
import type { EscapeRoomCardType, EscapeRoomEpisode } from './types';
import { useOutletContext } from 'react-router-dom';
import type { EscapeRoomResourceContextType } from './EscapeRoomFilters';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { useMemo } from 'react';
import { CARD_TYPES } from './types';
import { capitalize } from 'lodash';
import { FileAddOutlined } from '@ant-design/icons';
import { EscapeRoomCard } from './Cards';
import { AddCardSelect } from './AddCardSelect';
import { AddCardDrawer, EditCardDrawer } from './EditCards';
import { generateCard, generateCardId } from './utils';

const { Option } = Select;

type AllCardsProps = {
  episode: EscapeRoomEpisode;
};

export function AllCards({ episode }: AllCardsProps) {
  const { data, addEntryToUpdate } = useOutletContext<EscapeRoomResourceContextType>();
  const { is, addParam } = useQueryParams();

  const cards = useMemo(() => Object.values(episode.cards ?? {}), [episode]);

  const { page, pagination } = useGridPagination({
    data: cards,
    resetter: '',
    defaultPageSize: 20,
  });

  const updateCard = (card: EscapeRoomCardType) => {
    const cardId = card.id || generateCardId(cards.length, episode.language);
    card.id = cardId;
    addEntryToUpdate(episode.id, {
      ...episode,
      cards: {
        ...episode.cards,
        [cardId]: card,
      },
    });
  };
  return (
    <div>
      <Typography.Title level={4}>All Cards ({cards.length})</Typography.Title>
      <AddCardSelect />
      <AddCardDrawer updateCard={updateCard} />
      <EditCardDrawer episode={episode} updateCard={updateCard} />

      <PaginationWrapper pagination={pagination} className="full-width">
        <Flex gap={16} wrap="wrap" className="m-2">
          {page.map((card) => (
            <Flex gap={3} key={card.id} vertical>
              <Button shape="round" size="small" onClick={() => addParam('editCard', card.id)}>
                Edit
              </Button>
              <EscapeRoomCard card={card} />
            </Flex>
          ))}
        </Flex>
      </PaginationWrapper>
    </div>
  );
}
