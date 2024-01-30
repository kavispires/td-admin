/**
 * Returns the base url for the given library and path
 * @param library
 * @param path
 * @returns
 */
export function useBaseUrl(library: 'tdr' | 'tdi' | 'tdi-data') {
  let baseUrl: string | undefined = '';
  let folder: string | undefined = '';

  switch (library) {
    case 'tdi':
      baseUrl = process.env.REACT_APP_TD_BASE_URL;
      folder = process.env.REACT_APP_TDI_IMAGES;
      break;
    case 'tdi-data':
      baseUrl = process.env.REACT_APP_TD_BASE_URL;
      folder = process.env.REACT_APP_TDI_DATA;
      break;
    default:
      baseUrl =
        process.env.NODE_ENV === 'development'
          ? process.env.REACT_APP_LOCAL_URL
          : process.env.REACT_APP_TD_BASE_URL;
      folder = process.env.REACT_APP_TD_RESOURCES;
  }

  return {
    baseUrl,
    getUrl: (path: string) => [baseUrl, folder, path].join('/'),
  };
}
