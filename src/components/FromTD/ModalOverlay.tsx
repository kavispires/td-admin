// Ant Design Resources
import {
  CloseOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import { Button, Space } from 'antd';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
// Sass
import './ModalOverlay.scss';
import { useKeyPressEvent } from 'react-use';

type ModalOverlayProps = {
  children: React.ReactNode;
  onClose: () => void;
  open: boolean;
};

/**
 * ModalOverlay component provides a modal with various transformation controls.
 * @param props.children - The content to be displayed inside the modal.
 * @param props.onClose - The function to call when the modal is closed.
 * @param props.open - A boolean indicating whether the modal is open or not.
 * @returns The rendered modal overlay component or null if not open.
 */
export const ModalOverlay: React.FC<ModalOverlayProps> = ({ children, onClose, open }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  const zoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.1, 2));
  const zoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
  const rotateLeft = () => setRotation((prevRotation) => prevRotation - 45);
  const rotateRight = () => setRotation((prevRotation) => prevRotation + 45);
  const toggleFlipX = () => setFlipX((prevFlipX) => !prevFlipX);
  const toggleFlipY = () => setFlipY((prevFlipY) => !prevFlipY);

  if (!open) return null;

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="simple-modal-overlay"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={handleOverlayClick}
        transition={{ duration: 0.1 }}
      >
        <EscapeClose onClose={onClose} />
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="simple-modal-overlay__content"
          exit={{ opacity: 0, scale: 0.3 }}
          initial={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.05 }}
        >
          <Button
            className="simple-modal-overlay__close"
            ghost
            icon={<CloseOutlined />}
            onClick={onClose}
            shape="circle"
            size="large"
            variant="outlined"
          />
          <div
            className="simple-modal-overlay__body"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
            }}
          >
            {children}
          </div>
          <div className="simple-modal-overlay__controls-container">
            <Space.Compact className="simple-modal-overlay__controls">
              <Button ghost icon={<ZoomInOutlined />} onClick={zoomIn} />

              <Button ghost icon={<ZoomOutOutlined />} onClick={zoomOut} />

              <Button ghost icon={<RotateLeftOutlined />} onClick={rotateLeft} />
              <Button ghost icon={<RotateRightOutlined />} onClick={rotateRight} />

              <Button ghost icon={<SwapOutlined />} onClick={toggleFlipX} />
              <Button ghost icon={<SwapOutlined style={{ rotate: '90deg' }} />} onClick={toggleFlipY} />
            </Space.Compact>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

function EscapeClose({ onClose }: Pick<ModalOverlayProps, 'onClose'>) {
  useKeyPressEvent('Escape', () => {
    onClose();
  });

  return null;
}
