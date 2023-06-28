import { Col, Card, Typography, Image, Dropdown, Menu } from 'antd';
import { CalendarOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';

export default ({
  thumbnail,
  label,
  price,
  loading,
  setSideDrawer,
  availableModes,
  selectedOffer,
}) => {
  return (
    <Col xs={24} sm={12} md={8} lg={6}>
      <Card
        style={{
          borderRadius: '5%',
          maxWidth: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        onClick={() => {}}
        loading={loading}
        hoverable
        extra={
          <Dropdown
            placement="bottom"
            overlay={
              <Menu>
                <Menu.Item
                  icon={<EditOutlined />}
                  onClick={() => {
                    setSideDrawer({
                      isOpen: true,
                      mode: availableModes.EDIT_PACKAGE,
                      data: selectedOffer,
                    });
                  }}
                >
                  Edit
                </Menu.Item>
                <Menu.Item
                  icon={<CalendarOutlined />}
                  onClick={() => {
                    setSideDrawer({
                      isOpen: true,
                      mode: availableModes.EDIT_PACKAGE_BLOCKED_DATE,
                      data: selectedOffer,
                    });
                  }}
                >
                  {' '}
                  Block date
                </Menu.Item>
              </Menu>
            }
          >
            <MoreOutlined style={{ fontSize: '1.5em' }} />
          </Dropdown>
        }
      >
        <Image
          src={thumbnail}
          alt={label}
          style={{ height: 'auto', maxWidth: '100%', objectFit: 'cover' }}
        />
        <div style={{ padding: '3px' }}>
          <Typography.Title level={5} ellipsis={{ tooltip: label }}>
            {label}
          </Typography.Title>
          <Typography.Text>
            <span> &#8369; </span>{' '}
            {price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')}
          </Typography.Text>
        </div>
      </Card>
    </Col>
  );
};
