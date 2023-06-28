import React from 'react';
import { Result, Button } from 'antd';

const MaintenancePage = () => {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
    >
      <Result
        status="500"
        title="We are currently performing maintenance on our website. Please check back later."
        subTitle={
          <div>
            <p>Visitour PH</p>
          </div>
        }
      />
    </div>
  );
};

export default MaintenancePage;