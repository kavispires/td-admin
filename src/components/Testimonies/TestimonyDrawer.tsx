import { Button, Flex, InputNumber, Modal, Segmented, Space, Typography } from 'antd';
import { SuspectImageCard } from 'components/Suspects/SuspectImageCard';
import { useQueryParams } from 'hooks/useQueryParams';
import { cloneDeep, sample, sampleSize } from 'lodash';
import type { useTestimoniesResource } from 'pages/Testimonies/useTestimoniesResource';
import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useEffectOnce, useStateWithHistory, useWindowSize } from 'react-use';

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
    <Flex vertical gap={8}>
      <Button onClick={() => addParam('testify', 'single')} block>
        Testify Drawer
      </Button>
      <Button onClick={() => addParam('testify', 'group')} block>
        Testify Group
      </Button>
      <SingleDrawerContent {...props} />
      <GroupDrawerContent {...props} />
    </Flex>
  );
}

function SingleDrawerContent({ suspects, questions, answers, addEntryToUpdate }: TestimonyDrawerProps) {
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
      open={is('testify', 'single')}
      onCancel={() => removeParam('testify')}
      maskClosable={false}
      width={width - 64}
      footer={null}
    >
      <div {...handlers}>
        {hasEntry && (
          <Flex vertical gap={8} className="mb-8" justify="center" align="center">
            <SuspectImageCard id={state.suspectId ?? ''} width={Math.max(height / 4, 128)} />
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

function GroupDrawerContent({ suspects, questions, answers, addEntryToUpdate }: TestimonyDrawerProps) {
  const { width, height } = useWindowSize();
  const { is, removeParam } = useQueryParams();
  const [state, setState, _stateHistory] = useStateWithHistory<{
    suspectsIds: Record<string, null | 0 | 1>;
    testimonyId: string | null;
  }>();
  const [numberOfSuspects, setNumberOfSuspects] = useState(6);

  const getRandom = () => {
    const suspectsSet = sampleSize(Object.keys(suspects), numberOfSuspects)?.reduce(
      (acc: Record<string, null | 0 | 1>, id) => {
        acc[id] = null;
        return acc;
      },
      {},
    );

    setState({
      suspectsIds: suspectsSet,
      testimonyId: sample(Object.keys(questions)) || null,
    });
  };

  useEffectOnce(() => getRandom());

  const onNext = () => {
    // From the judged suspects, only keep the ones that have a value (1 or 0) and add to the answers
    const judgedSuspects = Object.entries(state?.suspectsIds ?? {}).reduce(
      (acc: Record<string, (0 | 1)[]>, [id, value]) => {
        if (value !== null) {
          acc[id] = [value];
        }
        return acc;
      },
      {},
    );
    if (state?.testimonyId && Object.keys(judgedSuspects).length > 0) {
      const newAnswers = cloneDeep(answers[state.testimonyId] ?? {});
      Object.entries(judgedSuspects).forEach(([id, values]) => {
        newAnswers[id] = [...(newAnswers[id] || []), ...values];
      });

      addEntryToUpdate(state.testimonyId, newAnswers);
    } else {
      console.log('No testimonyId or no judged suspects found, likely skipped');
    }

    getRandom();
  };

  const hasEntry = !!state?.suspectsIds && !!state?.testimonyId;

  const onSetAllNullTo = (value: 0 | 1) => {
    setState((prev) => {
      if (!prev) return prev;

      const newSuspectsIds = Object.entries(prev.suspectsIds).reduce(
        (acc: Record<string, null | 0 | 1>, [id, val]) => {
          acc[id] = val === null ? value : val;
          return acc;
        },
        {},
      );

      return {
        ...prev,
        suspectsIds: newSuspectsIds,
      };
    });
  };

  return (
    <Modal
      title={<Typography>Do these people do this??</Typography>}
      open={is('testify', 'group')}
      onCancel={() => removeParam('testify')}
      maskClosable={false}
      width={width - 64}
      footer={null}
    >
      <div>
        {hasEntry && (
          <Flex vertical gap={8} className="mb-8" justify="center" align="center">
            <Typography.Text>
              Number of Suspects:
              <InputNumber value={numberOfSuspects} onChange={(value) => setNumberOfSuspects(value ?? 6)} />
            </Typography.Text>
            <Typography.Title level={4} className="text-center">
              {questions[state.testimonyId ?? '']?.question}
            </Typography.Title>
            <Flex wrap="wrap" justify="center" gap={8}>
              {Object.keys(state.suspectsIds).map((suspectId) => (
                <Flex key={suspectId} justify="center" align="center" vertical>
                  <Typography.Text className="text-center">
                    {suspects[suspectId]?.name?.pt || 'Unknown'}
                  </Typography.Text>
                  <SuspectImageCard
                    key={suspectId}
                    id={suspectId}
                    width={Math.min(Math.max(height / 3, 128), 128)}
                  />
                  <Segmented
                    shape="round"
                    size="large"
                    value={state.suspectsIds[suspectId]}
                    onChange={(value) =>
                      setState((prev) => {
                        if (!prev) return prev;

                        return {
                          ...prev,
                          suspectsIds: {
                            ...prev.suspectsIds,
                            [suspectId]: value as null | 0 | 1,
                          },
                        };
                      })
                    }
                    options={[
                      { value: 0, icon: '👎' },
                      { value: null, icon: '♾' },
                      { value: 1, icon: '👍' },
                    ]}
                  />
                </Flex>
              ))}
            </Flex>
          </Flex>
        )}

        <Flex justify="space-between" align="center" className="mt-8">
          <span />
          <Flex gap={8}>
            <Button onClick={() => onSetAllNullTo(0)}>Set all ♾ to 👎</Button>
            <Button onClick={() => onSetAllNullTo(1)}>Set all ♾ to 👍</Button>
          </Flex>
          <Button onClick={onNext} size="large">
            Next Set
          </Button>
        </Flex>
      </div>
    </Modal>
  );
}
