import { Input, Typography } from 'antd';
import { useState } from 'react';
import { findSimilar, stringRemoveAccents } from '../utils';
import { SEARCH_THRESHOLD } from '../utils/constants';

export function SearchDuplicates({ response, property }) {
  const [searchResults, setSearchResults] = useState({});

  const onSearchSimilar = (e) => {
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
      <Typography.Title level={2}>Search Similar</Typography.Title>
      <Input type="text" onChange={onSearchSimilar} placeholder="Type here" />
      <Input.TextArea
        name="search-results"
        id=""
        cols="10"
        rows="10"
        readOnly
        value={JSON.stringify(searchResults, null, 4)}
      />
    </div>
  );
}
