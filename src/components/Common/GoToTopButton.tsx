import { VerticalAlignTopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { ButtonProps } from 'antd/lib/button';
import { useState } from 'react';
import { useEffectOnce } from 'react-use';

export function GoToTopButton(props: ButtonProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleScroll = () => {
    setIsVisible(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffectOnce(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  return (
    <Button
      className={`go-to-top-button ${isVisible ? 'visible' : ''}`}
      icon={<VerticalAlignTopOutlined />}
      onClick={scrollToTop}
      {...props}
    >
      Go to Top
    </Button>
  );
}
