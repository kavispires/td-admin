import { Card } from 'antd';
import { Fragment, useMemo } from 'react';
import { Entry, EntryDualLanguage, EntryLanguage, EntryList, EntryListItem, EntryNSFW } from './Entry';

type CardEntryProps = {
  entry: PlainObject & { id: string };
  kind?: string;
};

export function CardEntry({ entry, kind }: CardEntryProps) {
  const keys = Object.keys(entry).filter((key) => key !== 'id');

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const entries = useMemo(() => {
    return keys.map((key) => {
      // Ignore id
      if (key === 'id') return null;

      const value = entry[key];

      // Ignore nullish values
      if (value === null || value === undefined) return null;

      // Prioritize nsfw
      if (key === 'nsfw') {
        return <EntryNSFW value={value} />;
      }

      // Render dual value
      if (isDualLanguage(value)) {
        return <EntryDualLanguage label={key}>{value}</EntryDualLanguage>;
      }

      // Render language
      if (isLanguage(value)) {
        return <EntryLanguage label={key}>{value}</EntryLanguage>;
      }

      // Render strings
      if (isPrimitive(value)) {
        return <Entry label={key}>{value}</Entry>;
      }

      if (isArrayOfStrings(value)) {
        return (
          <EntryList label={key}>
            {value.map((text: string, index: number) => (
              <EntryListItem key={`${entry.id}-${text}-${index}`}>{text}</EntryListItem>
            ))}
          </EntryList>
        );
      }

      if (isArrayOfDualLanguage(value)) {
        return (
          <EntryList label={key}>
            {Object.values(entry.values).map((text, index) => (
              <EntryListItem key={`${entry.id}-${text}-${index}`}>
                <EntryDualLanguage>{text as DualLanguageValue}</EntryDualLanguage>
              </EntryListItem>
            ))}
          </EntryList>
        );
      }

      console.log('Skip', key, value);
      return <Fragment key={key}></Fragment>;
    });
  }, [kind]);

  return (
    <Card className="resource-card" size="small" title={entry.id}>
      {entries}
    </Card>
  );
}

const isDualLanguage = (value: any) => {
  return typeof value === 'object' && value.pt && value.en;
};

const isPrimitive = (value: any) => {
  return typeof value === 'string' || typeof value === 'number';
};

const isArray = (value: any) => {
  return Array.isArray(value);
};

const isArrayOfStrings = (value: any) => {
  return isArray(value) && typeof value[0] === 'string';
};

const isLanguage = (value: any) => {
  return value === 'pt' || value === 'en';
};

const isArrayOfDualLanguage = (value: any) => {
  return isArray(value) && isDualLanguage(value[0]);
};
