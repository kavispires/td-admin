import { Flex, Tag } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { ReactNode } from 'react';

import { FireFilled } from '@ant-design/icons';

type LabelProps = {
  children: ReactNode;
};

export function Label({ children }: LabelProps) {
  return <Tag>{children}</Tag>;
}

export function Value({ children }: LabelProps) {
  return <span>{children}</span>;
}

type EntryProps = {
  label: string;
  children: ReactNode;
};

export function Entry({ label, children }: EntryProps) {
  return (
    <Flex>
      <div>
        <Label>{label}</Label>
      </div>
      <Value>{children}</Value>
    </Flex>
  );
}

export function EntryList({ label, children }: EntryProps) {
  return (
    <Flex>
      <div>
        <Label>{label}</Label>
      </div>
      <ul className="resource-card__list">{children}</ul>
    </Flex>
  );
}

export function EntryListItem({ children }: LabelProps) {
  return <li>{children}</li>;
}

type EntryDualLanguageProps = {
  label?: string;
  children: DualLanguageValue;
};

export function EntryDualLanguage({ label, children }: EntryDualLanguageProps) {
  const value = (
    <>
      <div>
        <LanguageFlag language="en" width="1em" /> {children.en}
      </div>

      <div>
        <LanguageFlag language="pt" width="1em" /> {children.pt}
      </div>
    </>
  );

  if (label) {
    return (
      <Flex>
        <div>
          <Label>{label}</Label>
        </div>
        <Value>{value}</Value>
      </Flex>
    );
  }

  return <Value>{value}</Value>;
}

type EntryLanguageProps = {
  label?: string;
  children?: string;
};

export function EntryLanguage({ label = 'language', children }: EntryLanguageProps) {
  if (!children) return <></>;

  return (
    <Flex>
      <div>
        <Label>{label}</Label>
      </div>
      <Value>
        <LanguageFlag language={children as Language} width="1em" />
      </Value>
    </Flex>
  );
}

type EntryNSFWProps = {
  value?: boolean;
};

export function EntryNSFW({ value }: EntryNSFWProps) {
  if (!value) return <></>;

  return (
    <Entry label="nsfw">
      <FireFilled style={{ color: 'hotpink' }} />
    </Entry>
  );
}

type EntryListTextProps = {
  label: string;
  children?: string[];
};

export function EntryListText({ label, children }: EntryListTextProps) {
  if (!children) return <></>;

  return <Entry label={label}>{children.join(', ')}</Entry>;
}
