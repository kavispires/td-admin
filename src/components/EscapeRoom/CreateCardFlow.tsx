import ReactJsonView from '@microlink/react-json-view';
import { Flex, Typography } from 'antd';

export function CreateCardFlow() {
  return (
    <Flex className="full-width py-1" gap={12} vertical>
      <Flex align="center" justify="space-between">
        <Typography.Title className="my-0" level={5}>
          Create Cards
        </Typography.Title>
      </Flex>

      <ReactJsonView collapsed={1} src={{}} theme="twilight" />
    </Flex>
  );
}
