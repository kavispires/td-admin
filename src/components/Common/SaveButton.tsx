import { SaveOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import { useEffect } from 'react';
import { useTimeoutFn } from 'react-use';

type SaveButtonProps = {
  isDirty: boolean;
  dirt?: string | number;
  onSave: (args?: unknown) => void;
  isSaving: boolean;
  interval?: number;
} & Omit<ButtonProps, 'icon' | 'type' | 'size' | 'danger'>;

export function SaveButton({
  isDirty,
  onSave,
  isSaving,
  dirt,
  interval = 10 * 60 * 1000,
  ...buttonProps
}: SaveButtonProps) {
  // It saves after 10 minutes of the first time of being dirty, unless 'dirt' is provided and changed
  const [, cancel, reset] = useTimeoutFn(() => {
    if (isDirty) {
      onSave();
    }
  }, interval); // 10 minutes in milliseconds

  useEffect(() => {
    if (isDirty) {
      console.log('RESET!!');
      reset(); // Start or reset the timeout if `isDirty` is true and dirt has changed
    } else {
      cancel(); // Cancel the timeout if `isDirty` becomes false
    }
  }, [isDirty, reset, cancel, dirt]);

  return (
    <Button
      type="primary"
      size="large"
      icon={<SaveOutlined />}
      onClick={onSave}
      disabled={!isDirty}
      loading={isSaving}
      danger
      block
      {...buttonProps}
    >
      Save
    </Button>
  );
}
