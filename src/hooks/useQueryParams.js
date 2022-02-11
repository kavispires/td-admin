import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useQueryParams(paramsState, updateFunction) {
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useState({});
  // const [prevParams, setPrevParams] = useState({});

  useEffect(() => {
    if (location.search && updateFunction) {
      const qp = new URLSearchParams(location.search);
      const currentParams = {};
      for (let pair of qp.entries()) {
        currentParams[pair[0]] = pair[1];
      }

      if (
        currentParams.resourceName !== paramsState?.resourceName ||
        currentParams.language !== paramsState?.language
      ) {
        updateFunction(currentParams);
        setParams(currentParams);
      }
    }
  }, [location.search, paramsState, updateFunction]);

  const updateQueryParams = (newParams) => {
    const qp = new URLSearchParams();
    Object.entries(newParams).forEach(([key, value]) => {
      qp.append(key, value);
    });
    setParams(newParams);

    navigate(`${location.pathname}?${qp.toString()}`);
  };

  return {
    params,
    updateQueryParams,
  };
}
