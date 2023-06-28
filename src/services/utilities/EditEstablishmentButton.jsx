import { useState } from 'react';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export default ({
  establishment,
  offerTypes,
  setImages,
  setAvailableOfferTypes,
  setOpenDrawer,
  setSelectedEstab,
}) => {
  const handleEditClick = () => {
    setOpenDrawer(true);
    setSelectedEstab(establishment);
    setImages(
      establishment?.photos.map((e, i) => {
        return {
          uid: i,
          name: e?.medium?.split(
            'https://visitour-staging.s3.ap-southeast-1.amazonaws.com/PlacePhotos/',
          )[1],
          status: 'done',
          url: e?.medium,
        };
      }),
    );
    setAvailableOfferTypes(() => {
      let _offers = [],
        ids = establishment?.secondaryCategory?.concat(establishment?.primaryCategory);
      offerTypes?.forEach((e) => {
        if (e.applicableCategories.filter((_) => ids?.includes(_?._id)).length > 0) _offers.push(e);
      });
      return _offers;
    });
  };

  return (
    <Button
      icon={<EditOutlined />}
      style={{
        borderRadius: 10,
        alignSelf: 'flex-end',
      }}
      onClick={handleEditClick}
    >
      Edit Establishment
    </Button>
  );
};
