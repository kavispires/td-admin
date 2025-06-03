import { Button, Flex, Modal, Space, Typography } from 'antd';
import { ImageCard } from 'components/Images/ImageCard';
import { getSuspectImageId } from 'components/Suspects/utils';
import { useQueryParams } from 'hooks/useQueryParams';
import { cloneDeep, sample } from 'lodash';
import type { useTestimoniesResource } from 'pages/Testimonies/useTestimoniesResource';
import { useSwipeable } from 'react-swipeable';
import { useStateWithHistory, useWindowSize } from 'react-use';

export type TestimoniesContentProps = ReturnType<typeof useTestimoniesResource>;

type TestimonyDrawerProps = {
  suspects: TestimoniesContentProps['suspects'];
  questions: TestimoniesContentProps['questions'];
  answers: TestimoniesContentProps['data'];
  addEntryToUpdate: TestimoniesContentProps['addEntryToUpdate'];
};

export function TestimonyDrawer(props: TestimonyDrawerProps) {
  const { addParam } = useQueryParams();

  return (
    <>
      <Button onClick={() => addParam('testimonyDrawer', true)} block>
        Testify Drawer
      </Button>
      <DrawerContent {...props} />
    </>
  );
}

function DrawerContent({ suspects, questions, answers, addEntryToUpdate }: TestimonyDrawerProps) {
  const { width, height } = useWindowSize();
  const { is, removeParam } = useQueryParams();
  const [state, setState, _stateHistory] = useStateWithHistory<{
    suspectId: string | null;
    testimonyId: string | null;
  }>();
  const handlers = useSwipeable({
    onSwipedLeft: () => alert('Swiped Left'),
    onSwipedRight: () => alert('Swiped Right'),
    onSwipedUp: () => alert('Swiped Up'),
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: true,
  });

  const getRandom = () => {
    setState({
      suspectId: sample(Object.keys(suspects)) || null,
      testimonyId: sample(Object.keys(questions)) || null,
    });
  };

  const onSkip = () => {
    getRandom();
  };

  const onYes = () => {
    if (state?.suspectId && state?.testimonyId) {
      const newAnswers = cloneDeep(answers[state?.testimonyId ?? ''] ?? {});
      newAnswers[state.suspectId] = [...(newAnswers[state.suspectId] || []), 1];
      addEntryToUpdate(state.testimonyId ?? '', newAnswers);
      getRandom();
    }
  };

  const onNo = () => {
    if (state?.suspectId && state?.testimonyId) {
      const newAnswers = cloneDeep(answers[state?.testimonyId ?? ''] ?? {});
      newAnswers[state.suspectId] = [...(newAnswers[state.suspectId] || []), 0];
      addEntryToUpdate(state.testimonyId ?? '', newAnswers);
      getRandom();
    }
  };

  const hasEntry = !!state?.suspectId && !!state?.testimonyId;

  return (
    <Modal
      title={<Typography>Does this person do this??</Typography>}
      open={is('testimonyDrawer')}
      onCancel={() => removeParam('testimonyDrawer')}
      maskClosable={false}
      width={width - 64}
      footer={null}
    >
      <div {...handlers}>
        {hasEntry && (
          <Flex vertical gap={8} className="mb-8" justify="center" align="center">
            <ImageCard
              id={getSuspectImageId(state.suspectId ?? '', 'gb')}
              width={Math.max(height / 4, 128)}
            />
            <Typography.Title level={5} className="text-center">
              {questions[state.testimonyId ?? '']?.question}
            </Typography.Title>
          </Flex>
        )}

        <Space.Compact block size="large" className="mb-8">
          <Button block icon="👎" disabled={!hasEntry} style={{ height: 64 }} onClick={onNo}>
            No
          </Button>
          <Button block onClick={onSkip} style={{ height: 64 }}>
            Skip
          </Button>
          <Button
            block
            icon="👍"
            iconPosition="end"
            disabled={!hasEntry}
            style={{ height: 64 }}
            onClick={onYes}
          >
            Yes
          </Button>
        </Space.Compact>
      </div>
    </Modal>
  );
}
