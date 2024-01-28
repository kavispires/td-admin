import { Image } from 'antd';

type CHImageProps = {
  cardId: CardId;
};

export function CHImage({ cardId }: CHImageProps) {
  const imageURL = cardId.replace(/-/g, '/');
  const prefix = cardId.includes('wp') ? 'wp' : 'ev';

  return (
    <Image
      width={100}
      src={`${process.env.REACT_APP_TDI_URL}/images/${imageURL}.jpg`}
      fallback={`${process.env.REACT_APP_TDI_URL}/images/dmhk/${prefix}/000.jpg`}
      preview={false}
    />
  );
}
