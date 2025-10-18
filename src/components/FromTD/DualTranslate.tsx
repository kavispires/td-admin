// Ant Design Resources
import { App } from 'antd';

type DualTransLateProps = {
  children: DualLanguageValue;
};

/**
 * Delegate between two strings depending on the active language
 * @param props
 * @returns the text/element according to the current language
 */
export function DualTranslate({ children }: DualTransLateProps) {
  const { message } = App.useApp();
  // const { language } = useLanguage();
  const language = 'pt'; // The actual component dynamically gets the language from context.

  if (!language) {
    const errorMessage = 'Could not reach the useLanguage hook';
    console.error(errorMessage);
    message.error(errorMessage);
    return <span>?</span>;
  }

  return <>{children[language]}</>;
}
