import { List, Image, Card, Drawer, Button, Upload } from 'antd';

export default ({ item, isSelected, onSelect }) => {
  return (
    <div
      style={{
        flexDirection: 'row',
      }}
    >
      <Image
        width={30}
        height={30}
        style={{ objectFit: 'cover' }}
        src={item?.photo?.small + '?' + new Date() || ''}
      />
      <span>{item?.name}</span>
    </div>
  );
};
