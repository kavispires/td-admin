import { SaveOutlined } from '@ant-design/icons';
import { Button, type ButtonProps } from 'antd';
import moment from 'moment';
import { useEffect } from 'react';
import { useTimeoutFn } from 'react-use';
import { togglePendingSave } from 'store/globalSave';

type SaveButtonProps = {
  isDirty: boolean;
  dirt?: string | number;
  onSave: (args?: unknown) => void;
  isSaving: boolean;
  interval?: number;
} & Omit<ButtonProps, 'icon' | 'type' | 'danger'>;

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

  // Reset the timeout if `isDirty` is true and dirt has
  // biome-ignore lint/correctness/useExhaustiveDependencies: a function shouldn't retrigger the effect
  useEffect(() => {
    if (isDirty) {
      togglePendingSave(true);
      console.log('Save Reset', moment(Date.now()).format('MM/DD/YYYY HH:mm:ss'));
      reset(); // Start or reset the timeout if `isDirty` is true and dirt has changed
    } else {
      togglePendingSave(false);
      cancel(); // Cancel the timeout if `isDirty` becomes false
    }
  }, [isDirty, reset, cancel, dirt]);

  // Prevents the user from leaving the page if there are unsaved changes (browser navigation or refresh)
  useEffect(() => {
    const handleBeforeUnload = (event: any) => {
      if (isDirty) {
        const message = 'You have unsaved changes, are you sure you want to leave?';
        // alert(message);
        event.returnValue = message; // Standard way to set message
        return message; // For some browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  return (
    <Button
      block
      danger
      disabled={!isDirty}
      icon={<SaveOutlined />}
      loading={isSaving}
      onClick={onSave}
      size="large"
      type="primary"
      {...buttonProps}
    >
      Save
    </Button>
  );
}
