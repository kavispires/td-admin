// Ant Design Resources
import { Popover } from 'antd';
import clsx from 'clsx';
// Types
import type { CrimesHediondosCard } from 'types/tdr';
// Sass
import './CrimeItemCard.scss';
import { Item } from 'components/Sprites';
import { useBaseUrl } from 'hooks/useBaseUrl';
import { capitalize } from 'lodash';

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
  const { getUrl } = useBaseUrl('images');
  const backgroundImage = `back/crime${capitalize(item.type)}`;

  if (item.itemId) {
    return (
      <div
        className={clsx(
          'crime-item-card',
          `crime-item-card--${item.type}`,
          isSelected && 'crime-item-card--selected',
          className,
        )}
        style={{
          width: cardWidth,
          backgroundImage: `url(${getUrl(`${backgroundImage}.jpg`)})`,
          ...(activeColor && isSelected ? { borderColor: activeColor, backgroundColor: activeColor } : {}),
        }}
      >
        <Popover
          content={
            <>
              {item.name.pt} | {item.name.en}
            </>
          }
        >
          <div className="crime-item-card__name" style={{ maxWidth: `${cardWidth}px` }}>
            <span>{item.name.en}</span>
          </div>
        </Popover>
        <div
          className={clsx('crime-item-card__item-container', `crime-item-card__item-container--${item.type}`)}
        >
          <Item id={item.itemId} width={cardWidth * 0.75} className="crime-item-card__item" />
        </div>
      </div>
    );
  }

  // Fallback, not really used
  return <>{item.id}</>;
}

// export function CrimeItemCard2({
//   item,
//   cardWidth,
//   activeColor,
//   isSelected = false,
//   className = '',
// }: CrimeItemCardProps) {
//   const { baseUrl } = useBaseUrl('images');
//   const backgroundImage = `back/crime${capitalize(item.type)}`;

//   return (
//     <ImageBlurButtonContainer cardId={item.id}>
//       <div
//         className={clsx(
//           'crime-item-card',
//           `crime-item-card--${item.type}`,
//           isSelected && 'crime-item-card--selected',
//           className,
//         )}
//         style={{
//           width: cardWidth,
//           backgroundImage: `url(${baseUrl}/${backgroundImage}.jpg)`,
//           ...(activeColor && isSelected ? { borderColor: activeColor, backgroundColor: activeColor } : {}),
//         }}
//       >
//         <Popover content={item.name.en.toUpperCase()}>
//           <div className="crime-item-card__name" style={{ maxWidth: `${cardWidth}px` }}>
//             <span>{item.name.en}</span>
//           </div>
//         </Popover>
//         <div
//           className={clsx('crime-item-card__item-container', `crime-item-card__item-container--${item.type}`)}
//         >
//           <Item id={item.itemId ?? '0'} width={cardWidth * 0.75} className="crime-item-card__item" />
//         </div>
//       </div>
//     </ImageBlurButtonContainer>
//   );
// }
