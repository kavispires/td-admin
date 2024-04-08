import { Input } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { Item as ItemT } from 'types';

import { FireFilled, IdcardOutlined } from '@ant-design/icons';

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
  return (
    <Input
      prefix={item.nsfw ? <FireFilled style={{ color: 'hotPink' }} /> : <IdcardOutlined />}
      placeholder="Id"
      variant="borderless"
      size="small"
      value={item.id}
      readOnly
    />
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
