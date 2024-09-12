import { Button, ButtonProps } from 'antd';
import moment from 'moment';
import { useEffect } from 'react';
import { useTimeoutFn } from 'react-use';

import { SaveOutlined } from '@ant-design/icons';
import { useGlobalContext } from 'context/GlobalContext';

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
  const { togglePendingSave } = useGlobalContext();

  // It saves after 10 minutes of the first time of being dirty, unless 'dirt' is provided and changed
  const [, cancel, reset] = useTimeoutFn(() => {
    if (isDirty) {
      onSave();
    }
  }, interval); // 10 minutes in milliseconds

  // Reset the timeout if `isDirty` is true and dirt has
  useEffect(() => {
    if (isDirty) {
      togglePendingSave(true);
      console.log('Save Reset', moment(Date.now()).format('MM/DD/YYYY HH:mm:ss'));
      reset(); // Start or reset the timeout if `isDirty` is true and dirt has changed
    } else {
      togglePendingSave(false);
      cancel(); // Cancel the timeout if `isDirty` becomes false
    }
  }, [isDirty, reset, cancel, dirt]); // eslint-disable-line react-hooks/exhaustive-deps

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
