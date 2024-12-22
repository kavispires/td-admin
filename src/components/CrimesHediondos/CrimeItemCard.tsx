// Ant Design Resources
import { Popover, Tag } from 'antd';
import clsx from 'clsx';
// Types
import type { CrimesHediondosCard } from 'types/tdr';
// Hooks

// Components

// Sass
import './CrimeItemCard.scss';
import { Item } from 'components/Sprites';

type CrimeItemCardProps = {
  /**
   * Crime item
   */
  item: CrimesHediondosCard;
  /**
   * Card width
   */
  cardWidth: number;
  /**
   * Whether the card is selected or not
   */
  isSelected?: boolean;
  /**
   * Optional custom class name
   */
  className?: string;
  /**
   * Optional active color
   */
  activeColor?: string;
};

export function CrimeItemCard({
  item,
  cardWidth,
  activeColor,
  isSelected = false,
  className = '',
}: CrimeItemCardProps) {
  if (item.itemId) {
    return (
      <div
        className={clsx('crime-item-card', isSelected && 'crime-item-card--selected', className)}
        style={activeColor && isSelected ? { borderColor: 'black', backgroundColor: activeColor } : {}}
      >
        <Popover
          content={
            <>
              {item.name.pt} | {item.name.en}
            </>
          }
        >
          <Tag
            className="crime-item-card__name"
            color={item.type === 'weapon' ? 'geekblue' : 'volcano'}
            style={{ maxWidth: `${cardWidth}px` }}
          >
            <span>{item.name.en}</span>
          </Tag>
        </Popover>
        <div
          className={clsx('crime-item-card__item-container', `crime-item-card__item-container--${item.type}`)}
        >
          <Item id={item.itemId} width={cardWidth * 0.85} className="crime-item-card__item" />
        </div>
      </div>
    );
  }

  // Fallback, not really used
  return <>{item.id}</>;
}
