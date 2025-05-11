import { Flex } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { memoize } from 'lodash';
import type { Item as ItemT } from 'types';

type VerifyIfThingProps = {
  item: ItemT;
};

const verifyIfThingCheck = memoize((item: ItemT) => {
  const hasThing = !!item.decks?.includes('thing');
  const hasManufactured = !!item.decks?.includes('manufactured');
  const singleWordNameEn = item.name.en.split(' ').length === 1;
  const singleWordNamePt = item.name.pt.split(' ').length === 1;

  const result = {
    en: hasThing || (singleWordNameEn && hasManufactured),
    pt: hasThing || (singleWordNamePt && hasManufactured),
  };

  if (!result.pt && !result.en) return '';

  return (
    <>
      {result.en && <LanguageFlag language="en" width="1em" />}
      {result.pt && <LanguageFlag language="pt" width="1em" />}
    </>
  );
});

export const VerifyIfThing = ({ item }: VerifyIfThingProps) => {
  const result = verifyIfThingCheck(item);

  if (result) {
    return <Flex gap={6}>Thing: {result}</Flex>;
  }

  return <></>;
};
