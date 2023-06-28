import { Button } from 'antd';
import { StarOutlined, StarTwoTone } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

export default ({ openButton, reviews }) => {
  const [mouseOver, setMouseOver] = useState(false);

  return (
    <Button
      icon={mouseOver ? <StarTwoTone /> : <StarOutlined />}
      style={{ borderRadius: 10 }}
      onClick={openButton}
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
    >
      Reviews ({reviews?.length} reviews)
    </Button>
  );
};
