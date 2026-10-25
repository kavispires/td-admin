export const LANGUAGE_PREFIX = {
  SUFFIX_DATA: {
    pt: 'drawingsPT',
    en: 'drawingsEN',
  },
  DAILY: {
    pt: 'diario',
    en: 'daily',
  },
};

export const DAILY_GAMES_KEYS = {
  AQUI_O: 'aqui-o',
  ARTE_RUIM: 'arte-ruim',
  // COMUNICACAO_ALIENIGENA: 'comunicacao-alienigena', // Renamed to ALIENADO
  ALIENADO: 'alienado',
  // CONTROLE_DE_ESTOQUE: 'controle-de-estoque', // Renamed to ESTOQUISTA
  ESTOQUISTA: 'estoquista',
  FILMACO: 'filmaco',
  // ESPIONAGEM: 'espionagem', // Renamed to INVESTIGACAO
  INVESTIGACAO: 'investigacao',
  MAPEAMENTO: 'mapeamento',
  ORGANIKU: 'organiku',
  PALAVREADO: 'palavreado',
  PANICO: 'panico',
  PIRRALHOS: 'pirralhos',
  // PORTAIS_MAGICOS: 'portais-magicos', // Renamed to PORTAIS
  PORTAIS: 'portais',
  QUARTETOS: 'quartetos',
  // TEORIA_DE_CONJUNTOS: 'teoria-de-conjuntos', // Renamed to CONJUNTOS
  CONJUNTOS: 'conjuntos',
  // VITRAIS: 'vitrais', // Renamed to VITRAL
  VITRAL: 'vitral',
  // Contributions
  CONEXOES: 'conexoes',
  // ARTISTA: 'artista', // Renamed to PICACO
  PICACO: 'picaco',
  TA_NA_CARA: 'ta-na-cara',
};

export const ATTEMPTS_THRESHOLD = 500;

/** Fallback when neither local preferences nor history supplies a valid version. */
export const DEFAULT_MIN_APP_VERSION = '2.0.35';

/** Reserved history entry; its used field contains a JSON singleton version array. */
export const APP_VERSION_HISTORY_KEY = '_app-version';

/** App-wide preference shared by the daily population language sources. */
export const MIN_APP_VERSION_STORAGE_KEY = 'td-admin-daily-min-app-version';
