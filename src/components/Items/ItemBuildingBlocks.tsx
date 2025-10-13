import { FireFilled, IdcardOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useSearchParams } from 'react-router-dom'; // TODO: replace with useQueryParams
import type { Item as ItemT } from 'types';

type ItemBlockProps = {
  item: ItemT;
};

type ItemBlocksAdditionalProps = {
  className?: string;
  width: number;
  language: 'en' | 'pt';
  to: string;
};

export function ItemSprite({
  item,
  width,
  className,
}: ItemBlockProps & Pick<ItemBlocksAdditionalProps, 'width' | 'className'>) {
  return (
    <Item className={className} itemId={item.id} title={`${item.name.en} | ${item.name.pt}`} width={width} />
  );
}

export function ItemId({ item }: ItemBlockProps) {
  const copyToClipboard = useCopyToClipboardFunction();
  return (
    <span>
      <Input
        onClick={() => copyToClipboard(item.id)}
        placeholder="Id"
        prefix={item.nsfw ? <FireFilled style={{ color: 'hotPink' }} /> : <IdcardOutlined />}
        readOnly
        size="small"
        style={{ width: '8ch' }}
        value={item.id}
        variant="borderless"
      />
    </span>
  );
}

export function ItemName({ item, language }: ItemBlockProps & Pick<ItemBlocksAdditionalProps, 'language'>) {
  return (
    <Input
      placeholder={`Name in ${language.toUpperCase()}`}
      prefix={<LanguageFlag language={language} width="1em" />}
      readOnly
      size="small"
      value={item.name[language]}
      variant="borderless"
    />
  );
}

export function ItemNsfw({ item }: ItemBlockProps) {
  return item.nsfw ? <FireFilled style={{ color: 'hotpink' }} /> : null;
}

export function ItemGoTo({ item }: ItemBlockProps) {
  const [, setSearchParams] = useSearchParams();
  const onGoTo = () => {
    setSearchParams({ itemId: item.id, display: 'classifier' });
  };

  return (
    <span>
      <Button onClick={onGoTo} shape="round" size="small">
        Go to
      </Button>
    </span>
  );
}
