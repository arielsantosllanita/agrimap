import { Button } from 'antd';
import { EyeOutlined, LeftCircleOutlined } from '@ant-design/icons';

export default ({ show, onButtonClick }) => {
  const buttonText = show === 'card' ? 'Show Summary' : show === 'list' ? 'Back' : 'Show requests';
  const icon = show === 'list' ? <LeftCircleOutlined /> : <EyeOutlined />;
  return (
    <Button
      type="primary"
      shape="round"
      size="middle"
      style={{ borderRadius: 10 }}
      onClick={onButtonClick}
      icon={icon}
    >
      {buttonText}
    </Button>
  );
};
