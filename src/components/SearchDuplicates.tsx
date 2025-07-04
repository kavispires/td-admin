import { Input } from 'antd';
import { useState } from 'react';
import { findSimilar, stringRemoveAccents } from '../utils';
import { SEARCH_THRESHOLD } from '../utils/constants';
import { SectionTitle } from './Common/SectionTitle';

type SearchDuplicatesProps = {
  response: ObjectDictionary;
  property: string;
};

export function SearchDuplicates({ response, property }: SearchDuplicatesProps) {
  const [searchResults, setSearchResults] = useState({});

  const onSearchSimilar = (e: any) => {
    const { value = '' } = e.target;
    const str = stringRemoveAccents(value.trim().toLowerCase());

    if (str && str.length >= SEARCH_THRESHOLD) {
      setSearchResults(findSimilar(str, response, property));
    } else {
      setSearchResults({});
    }
  };

  return (
    <div className="parser-flex-column">
      <SectionTitle>Search Similar</SectionTitle>
      <Input onChange={onSearchSimilar} placeholder="Type here" type="text" />
      <Input.TextArea
        cols={10}
        id=""
        name="search-results"
        readOnly
        rows={10}
        value={JSON.stringify(searchResults, null, 4)}
      />
    </div>
  );
}
