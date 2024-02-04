import { FilterSelect } from 'components/Common';
import { SiderContent } from 'components/Layout';
import { LANGUAGES } from 'utils/constants';

type SideFiltersProps = {
  language: string;
  setLanguage: (language: string) => void;
};

export function SideFilters({ language, setLanguage }: SideFiltersProps) {
  return (
    <SiderContent>
      <FilterSelect
        label="Language"
        value={language}
        onChange={setLanguage}
        options={LANGUAGES}
        placeholder="Select a language"
      />
    </SiderContent>
  );
}
