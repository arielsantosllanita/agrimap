import React from 'react';
import { Typography, Space } from 'antd';

export default ({ name }) => {
  return (
    <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography.Title
        level={3}
        style={{ display: 'flex', alignItems: 'center', marginTop: '5px', marginBottom: '0px' }}
      >
        {name}
      </Typography.Title>
    </Space>
  );
};
