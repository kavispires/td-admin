import { Input } from 'antd';
import type { InputProps } from 'antd';
import { debounce } from 'lodash';
import { useCallback, useMemo } from 'react';

type DebouncedInputProps = {
  debounceDelay?: number;
  onDebouncedChange?: (value: string) => void;
} & Omit<InputProps, 'onChange'>;

export const DebouncedInput: React.FC<DebouncedInputProps> = ({
  debounceDelay = 300,
  onDebouncedChange,
  ...inputProps
}) => {
  // Create a debounced handler
  const debouncedHandler = useMemo(
    () =>
      debounce((value: string) => {
        if (onDebouncedChange) {
          onDebouncedChange(value);
        }
      }, debounceDelay),
    [debounceDelay, onDebouncedChange],
  );

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      debouncedHandler(value);
    },
    [debouncedHandler],
  );

  return <Input {...inputProps} onChange={handleChange} />;
};
