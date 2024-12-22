/**
 * Returns the base url for the given library and path
 * @param library
 * @param path
 * @returns
 */
export function useBaseUrl(library: 'images' | 'sprites' | 'resources' | 'classic') {
  const baseUrl: string | undefined = process.env.REACT_APP_TD_BASE_URL;
  let folder: string | undefined = '';

  switch (library) {
    case 'images':
      folder = process.env.REACT_APP_TD_IMAGES;
      break;
    case 'sprites':
      folder = process.env.REACT_APP_TD_SPRITES;
      break;
    case 'resources':
      folder = process.env.REACT_APP_TD_RESOURCES;
      break;
    case 'classic':
      folder = process.env.REACT_APP_TD_CLASSIC;
      break;
    default:
      // TODO: The default should be removed
      // baseUrl =
      //   process.env.NODE_ENV === 'development'
      //     ? process.env.REACT_APP_LOCAL_URL
      //     : process.env.REACT_APP_TD_BASE_URL;
      // folder = process.env.REACT_APP_TD_RESOURCES;
      throw new Error('Invalid library');
  }

  return {
    baseUrl,
    getUrl: (path: string) => [baseUrl, folder, path].join('/'),
  };
}
