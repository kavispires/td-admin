// Ant Design Resources
import { App } from 'antd';
import type { ReactNode } from 'react';

type TransLateProps = {
  /**
   * The content of the component in english
   */
  en: ReactNode;
  /**
   * The content of the component in portuguese
   */
  pt: ReactNode;
  /**
   * Optional custom content that overrides the `pt` and `en` props
   */
  custom?: ReactNode;
};

/**
 * Delegate between two strings depending on the active language
 * @returns the text/element according to the current language
 */
export function Translate({ en, pt, custom }: TransLateProps) {
  const { message } = App.useApp();
  const language = 'pt'; // useLanguage();

  if (!language) {
    const errorMessage = 'Could not reach the useLanguage hook';
    console.error(errorMessage);
    message.error(errorMessage);
    return <span>?</span>;
  }

  if (custom) {
    return <span>{custom}</span>;
  }

  if (!pt || !en) {
    const errorMessage = '`pt` or `en` translation was not provided';
    console.error(errorMessage);
    message.error(errorMessage);
    return <span>?</span>;
  }

  return language === 'pt' ? <span>{pt}</span> : <span>{en}</span>;
}
