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

/**
 * A hook that generates a URL for the Firestore console.
 */
export function useFirestoreConsoleUrl() {
  const firestoreUrl = import.meta.env.VITE__FIRESTORE_URL;
  const firestoreProjectId = import.meta.env.VITE__FIREBASE_PROJECT_ID;
  const firestorePath = import.meta.env.VITE__FIRESTORE_PATH;
  const baseConsoleUrl = `${firestoreUrl}/${firestoreProjectId}/${firestorePath}`;

  function encodeFirestorePath(documentPath: string): string {
    // Split the path by '/'
    // Remove any leading/trailing slashes and then split
    const pathSegments = documentPath.replace(/^\/+|\/+$/g, '').split('/');

    // URL-encode each segment and join with '~2F'
    // Firestore console uses '~2F' as an encoded '/' for the path part
    const encodedPath = pathSegments.map((segment) => encodeURIComponent(segment)).join('~2F');

    return encodedPath ? `~2F${encodedPath}` : '';
  }

  return {
    baseConsoleUrl: `${firestoreUrl}/${firestoreProjectId}/${firestorePath}`,
    getConsoleUrl: (path: string) => `${baseConsoleUrl}${encodeFirestorePath(path)}`,
    encodeFirestorePath,
  };
}
