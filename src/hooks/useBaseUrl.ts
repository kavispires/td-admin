/**
 * Returns the base url for the given library and path
 * @param library
 * @param path
 * @returns
 */
export function useBaseUrl(library: 'images' | 'sprites' | 'resources' | 'classic') {
  const baseUrl: string | undefined = import.meta.env.VITE__TD_BASE_URL;
  let folder: string | undefined = '';

  switch (library) {
    case 'images':
      folder = import.meta.env.VITE__TD_IMAGES;
      break;
    case 'sprites':
      folder = import.meta.env.VITE__TD_SPRITES;
      break;
    case 'resources':
      folder = import.meta.env.VITE__TD_RESOURCES;
      break;
    case 'classic':
      folder = import.meta.env.VITE__TD_CLASSIC;
      break;
    default:
      // TODO: The default should be removed
      // baseUrl =
      //   process.env.NODE_ENV === 'development'
      //     ? import.meta.env.VITE__LOCAL_URL
      //     : import.meta.env.VITE__TD_BASE_URL;
      // folder = import.meta.env.VITE__TD_RESOURCES;
      throw new Error('Invalid library');
  }

  return {
    baseUrl,
    getUrl: (path: string) => [baseUrl, folder, path].join('/'),
  };
}
