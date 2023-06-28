import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
export default ({ setSideDrawer, DRAWER_MODES, offerTab, offerTabLabels }) => {
  return (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => {
        setSideDrawer({
          isOpen: true,
          mode: DRAWER_MODES.ADD_PACKAGE,
          offerType: offerTab,
        });
      }}
    >
      Add {offerTabLabels?.find((v) => v?.tab == offerTab)?.tab}
    </Button>
  );
};
