import { FireFilled, IdcardOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
// TODO: replace
import { useSearchParams } from 'react-router-dom';
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
    <Item id={item.id} width={width} title={`${item.name.en} | ${item.name.pt}`} className={className} />
  );
}

export function ItemId({ item }: ItemBlockProps) {
  const copyToClipboard = useCopyToClipboardFunction();
  return (
    <span>
      <Input
        prefix={item.nsfw ? <FireFilled style={{ color: 'hotPink' }} /> : <IdcardOutlined />}
        placeholder="Id"
        variant="borderless"
        size="small"
        value={item.id}
        readOnly
        style={{ width: '8ch' }}
        onClick={() => copyToClipboard(item.id)}
      />
    </span>
  );
}

export function ItemName({ item, language }: ItemBlockProps & Pick<ItemBlocksAdditionalProps, 'language'>) {
  return (
    <Input
      prefix={<LanguageFlag language={language} width="1em" />}
      placeholder={`Name in ${language.toUpperCase()}`}
      variant="borderless"
      size="small"
      value={item.name[language]}
      readOnly
    />
  );
}

export function ItemNsfw({ item }: ItemBlockProps) {
  return item.nsfw ? <FireFilled style={{ color: 'hotpink' }} /> : <></>;
}

export function ItemGoTo({ item }: ItemBlockProps) {
  const [, setSearchParams] = useSearchParams();
  const onGoTo = () => {
    setSearchParams({ itemId: item.id, display: 'classifier' });
  };

  return (
    <span>
      <Button size="small" shape="round" onClick={onGoTo}>
        Go to
      </Button>
    </span>
  );
}
