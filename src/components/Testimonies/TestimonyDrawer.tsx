import { Button, Flex, InputNumber, Modal, Segmented, Space, Switch, Typography } from 'antd';
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
    <Flex gap={8} vertical>
      <Button block onClick={() => addParam('testify', 'single')}>
        Testify Drawer
      </Button>
      <Button block onClick={() => addParam('testify', 'group')}>
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
      footer={null}
      maskClosable={false}
      onCancel={() => removeParam('testify')}
      open={is('testify', 'single')}
      title={<Typography>Does this person do this??</Typography>}
      width={width - 64}
    >
      <div {...handlers}>
        {hasEntry && (
          <Flex align="center" className="mb-8" gap={8} justify="center" vertical>
            <SuspectImageCard id={state.suspectId ?? ''} width={Math.max(height / 4, 128)} />
            <Typography.Title className="text-center" level={5}>
              {questions[state.testimonyId ?? '']?.question}
            </Typography.Title>
          </Flex>
        )}

        <Space.Compact block className="mb-8" size="large">
          <Button block disabled={!hasEntry} icon="👎" onClick={onNo} style={{ height: 64 }}>
            No
          </Button>
          <Button block onClick={onSkip} style={{ height: 64 }}>
            Skip
          </Button>
          <Button
            block
            disabled={!hasEntry}
            icon="👍"
            iconPosition="end"
            onClick={onYes}
            style={{ height: 64 }}
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
  const [isRandomQuestion, setRandomQuestion] = useState(true);

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
      testimonyId: (isRandomQuestion ? sample(Object.keys(questions)) : state?.testimonyId) ?? null,
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
      footer={null}
      maskClosable={false}
      onCancel={() => removeParam('testify')}
      open={is('testify', 'group')}
      title={<Typography>Do these people do this??</Typography>}
      width={width - 64}
    >
      <div>
        {hasEntry && (
          <Flex align="center" className="mb-8" gap={8} justify="center" vertical>
            <Flex align="center" gap={6} justify="center">
              <Typography.Text>Number of Suspects:</Typography.Text>
              <InputNumber
                onChange={(value) => setNumberOfSuspects(value ?? 6)}
                size="small"
                value={numberOfSuspects}
              />
              <Typography.Text>Random Questions:</Typography.Text>
              <Switch checked={isRandomQuestion} onChange={setRandomQuestion} size="small" />
            </Flex>
            <Typography.Title className="text-center" level={4}>
              {questions[state.testimonyId ?? '']?.question}
            </Typography.Title>
            <Flex gap={8} justify="center" wrap="wrap">
              {Object.keys(state.suspectsIds).map((suspectId) => (
                <Flex align="center" justify="center" key={suspectId} vertical>
                  <Typography.Text className="text-center">
                    {suspects[suspectId]?.name?.pt || 'Unknown'}
                  </Typography.Text>
                  <SuspectImageCard
                    id={suspectId}
                    key={suspectId}
                    width={Math.min(Math.max(height / 3, 128), 128)}
                  />
                  <Segmented
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
                    shape="round"
                    size="large"
                    value={state.suspectsIds[suspectId]}
                  />
                </Flex>
              ))}
            </Flex>
          </Flex>
        )}

        <Flex align="center" className="mt-8" justify="space-between">
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
