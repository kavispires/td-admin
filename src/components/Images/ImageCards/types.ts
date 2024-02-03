export type ImageCardData = {
  focus?: string[];
  actions?: string[];
  elements?: string[];
  colors?: string[];
  mood?: string[];
  highlight?: boolean;
};

export type FirebaseImageCardLibrary = Record<ImageCardId, ImageCardData>;

export type ImageCardRelationship = Record<ImageCardId, ImageCardId[]>;
