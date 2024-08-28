import { FilterSelect } from 'components/Common';
import { SiderContent } from 'components/Layout';
import { DEFAULT_LANGUAGE } from 'utils/constants';

type SideFiltersProps = {
  language: string;
  setLanguage: (language: string) => void;
  drawingsCount: number;
  setDrawingsCount: (drawingsCount: number) => void;
  batchSize: number;
  setBatchSize: (batchSize: number) => void;
};

export function SideFilters({
  language,
  setLanguage,
  drawingsCount,
  setDrawingsCount,
  batchSize,
  setBatchSize,
}: SideFiltersProps) {
  return (
    <SiderContent>
      <FilterSelect
        label="Language"
        value={language}
        onChange={setLanguage}
        options={[DEFAULT_LANGUAGE]}
        placeholder="Select a language"
      />
      <FilterSelect
        label="Minimum Drawings"
        value={drawingsCount}
        onChange={setDrawingsCount}
        options={[2, 3, 4]}
        placeholder="Select a number"
      />
      <FilterSelect
        label="Batch Size"
        value={batchSize}
        onChange={setBatchSize}
        options={[3, 7, 14, 21, 28]}
        placeholder="Select a number"
      />
    </SiderContent>
  );
}
