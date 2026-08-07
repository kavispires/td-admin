import { DynamicCard } from '@components/DynamicImageCard/DynamicCard';
import { useQueryParams } from '@hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from '@hooks/useResourceFirestoreData';
import type { SuspectCardData } from '@types';
import { Modal, Slider, Statistic, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getSuspectImageId } from './SuspectImageCard';

interface LabelPlacementEditorProps {
  suspect: SuspectCardData;
  onChange?: (packedString: SuspectCardData['labelTransform']) => void;
}

export function LabelPlacementEditor({
  suspect: { id, name, labelTransform: initialTransform },
  onChange,
}: LabelPlacementEditorProps) {
  const { Text, Title } = Typography;

  // State for our 3 variables
  const [y, setY] = useState<number>(85);
  const [angle, setAngle] = useState<number>(-2);
  const [scale, setScale] = useState<number>(1);
  console.log({ angle });

  // Parse initial transform string on mount
  useEffect(() => {
    if (initialTransform) {
      const [initY, initAngle, initScale] = initialTransform.split('|').map(Number);
      if (!Number.isNaN(initY)) setY(initY);
      if (!Number.isNaN(initAngle)) setAngle(initAngle);
      if (!Number.isNaN(initScale)) setScale(initScale);
      return;
    }

    setY(85);
    setAngle(-2);
    setScale(1);
  }, [initialTransform]);

  const packedTransform = useMemo<SuspectCardData['labelTransform']>(() => {
    // Omit scale if it's exactly 1 to support the `${number}|${number}` format
    return !scale || scale === 1 ? `${y}|${angle}` : `${y}|${angle}|${scale}`;
  }, [y, angle, scale]);

  // Generate the packed string format whenever values change
  useEffect(() => {
    if (!onChange) return;
    onChange(packedTransform);
  }, [onChange, packedTransform]);

  const imageId = getSuspectImageId(id, 'gb');

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      {/* PREVIEW AREA */}
      <div style={{ border: '1px dashed #ccc', padding: '16px' }}>
        <DynamicCard
          aspectRatio={1.5}
          backgroundImageId={imageId}
          width={300}
        >
          <DynamicCard.Span
            centerHorizontal // Keeps it centered using translate
            style={{
              // Apply our rotation and scaling
              // transform: `rotate(${angle}deg) scale(${scale})`, // TranslateX to keep it centered after rotation
              // Mock styling to match your Polaroid example
              rotate: `${angle}deg`,
              scale: `${scale}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'cursive',
              fontWeight: 'bold',
              fontSize: '30px',
              color: '#1a1a1a',
              whiteSpace: 'nowrap',
            }}
            top={`${y}%`}
          >
            {/* <span>♀️</span> */}
            <span>
              {name.pt}
              {name.pt}
              {name.pt}
            </span>
          </DynamicCard.Span>
        </DynamicCard>
      </div>

      {/* CONTROLS AREA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '250px' }}>
        <Title
          level={3}
          style={{ margin: 0 }}
        >
          Label Placement
        </Title>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Y Position (%)</Text>
            <Text strong>{y}%</Text>
          </div>
          <Slider
            max={100}
            min={0}
            onChange={(value) => setY(value)}
            step={0.5}
            value={y}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Angle (deg)</Text>
            <Text strong>{angle}°</Text>
          </div>
          <Slider
            max={10}
            min={-10}
            onChange={(value) => setAngle(value)}
            step={0.5}
            value={angle}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Scale</Text>
            <Text strong>{scale}x</Text>
          </div>
          <Slider
            max={2}
            min={0.5}
            onChange={(value) => setScale(value)}
            step={0.05}
            value={scale}
          />
        </div>

        <Statistic
          title="Output String:"
          value={packedTransform}
        />
      </div>
    </div>
  );
}

type SuspectLabelTransformEditorModalProps = {
  suspectsQuery: UseResourceFirestoreDataReturnType<SuspectCardData>;
};

export function SuspectLabelTransformEditorModal({ suspectsQuery }: SuspectLabelTransformEditorModalProps) {
  const { queryParams, removeParam } = useQueryParams();
  const [draftTransform, setDraftTransform] = useState<SuspectCardData['labelTransform']>('85|-2');

  const editLabelId = queryParams.get('editLabelId');

  if (!editLabelId || !suspectsQuery.data) {
    return null;
  }

  const suspect = suspectsQuery.data[editLabelId];

  if (!suspect) {
    return null;
  }

  const closeModal = () => {
    removeParam('editLabelId');
  };

  const handleSave = () => {
    if (!draftTransform || draftTransform === suspect.labelTransform) {
      closeModal();
      return;
    }

    suspectsQuery.addEntryToUpdate(suspect.id, {
      ...suspect,
      labelTransform: draftTransform,
    });

    closeModal();
  };

  return (
    <Modal
      okButtonProps={{ disabled: !draftTransform || draftTransform === suspect.labelTransform }}
      onCancel={closeModal}
      onOk={handleSave}
      open={!!editLabelId}
      width={800}
    >
      <LabelPlacementEditor
        onChange={setDraftTransform}
        suspect={suspect}
      />
    </Modal>
  );
}
