import { useState } from 'react';
import { useAsync } from 'react-use';
import { LOCALHOST_RESOURCE_URL } from '../utils/constants';

export function useResourceState(availableResources, initialState = {}) {
  const [resourceName, setResourceName] = useState(initialState.resourceName ?? null);
  const [language, setLanguage] = useState(initialState.language ?? 'pt');
  const [response, setResponse] = useState({});

  const { value, loading, error } = useAsync(async () => {
    if (availableResources && resourceName && language) {
      const url = process.env.NODE_ENV === 'development' ? LOCALHOST_RESOURCE_URL : process.env.PUBLIC_URL;
      const res = await fetch(`${url}/${resourceName}-${language}.json`);
      const result = res.body ? await res.json() : {};
      setResponse(result);
      return result;
    }
  }, [resourceName, language]);

  const updateResource = (obj) => {
    if (obj.language && obj.language !== language) setLanguage(obj.language);
    if (obj.resourceName && obj.resourceName !== resourceName) setResourceName(obj.resourceName);
  };

  return {
    resourceName,
    setResourceName,
    language,
    setLanguage,
    response,
    loading,
    error,
    hasResponseData: Boolean(value),
    updateResource,
  };
}
