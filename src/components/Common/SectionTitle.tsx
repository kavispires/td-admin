import { Typography } from 'antd';
import { TitleProps } from 'antd/lib/typography/Title';

export function SectionTitle({ children, level, ...rest }: TitleProps) {
  return (
    <Typography.Title level={level ?? 3} {...rest}>
      {children}
    </Typography.Title>
  );
}
