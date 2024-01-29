import { Image } from 'antd';

type CHImageProps = {
  cardId: CardId;
};

export function CHImage({ cardId }: CHImageProps) {
  const imageURL = cardId.replace(/-/g, '/');
  const prefix = cardId.includes('wp') ? 'wp' : 'ev';
  const baseUrl = `${process.env.REACT_APP_TD_BASE_URL}/${process.env.REACT_APP_TDI_IMAGES}`;

  return (
    <Image
      width={100}
      src={`${baseUrl}/${imageURL}.jpg`}
      fallback={`${baseUrl}/dmhk/${prefix}/000.jpg`}
      preview={false}
    />
  );
}
