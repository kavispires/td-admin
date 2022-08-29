import { useState } from 'react';
import { useAsync } from 'react-use';
import { LOCALHOST_RESOURCE_URL } from '../utils/constants';

type InitialState = {
  resourceName?: string;
  language?: Language | null;
  [key: string]: any;
};

type ResourceState = {
  resourceName: string | null;
  setResourceName: Function;
  language?: Language | null;
  setLanguage: Function;
  response: any;
  loading: boolean;
  error?: {
    message: string;
  };
  hasResponseData: boolean;
  updateResource: Function;
};

export function useResourceState(
  availableResources: AvailableResources,
  initialState: InitialState = {}
): ResourceState {
  const [resourceName, setResourceName] = useState(initialState?.resourceName ?? null);
  const [language, setLanguage] = useState(initialState.language);
  const [response, setResponse] = useState({});

  const { value, loading, error } = useAsync(async () => {
    if (availableResources && resourceName && language) {
      const url = process.env.NODE_ENV === 'development' ? LOCALHOST_RESOURCE_URL : process.env.PUBLIC_URL;
      const res = language
        ? await fetch(`${url}/${resourceName}-${language}.json`)
        : await fetch(`${url}/${resourceName}.json`);
      const result = res.body ? await res.json() : {};
      setResponse(result);
      return result;
    }
  }, [resourceName, language]);

  const updateResource = (obj: InitialState) => {
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
