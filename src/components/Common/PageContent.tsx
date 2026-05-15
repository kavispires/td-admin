import { Flex, type FlexProps } from 'antd';

export function PageContent({ children, className, vertical = true, ...props }: FlexProps) {
  return (
    <Flex className={`full-width py-4 ${className}`} gap={12} vertical={vertical} {...props}>
      {children}
    </Flex>
  );
}
