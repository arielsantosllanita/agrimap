import { Space, Card, Avatar, Typography, Rate, Image, Empty, Drawer } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { getMerchantEstablishment, getReviews } from '@/services/establishments';
import { StarFilled } from '@ant-design/icons';

export default ({ onImageTap, setVisible, visible, setSelectedEstab, selectedEstab }) => {
  // const [selectedEstab, setSelectedEstab] = useState();
  const [avgRate, setAvgRate] = useState(0);
  const [establisments, setEstablisments] = useState([]);
  const [fetchingStablishment, setFetchingStablishment] = useState({
    loading: true,
    success: null,
    failed: null,
  });
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const { initialState } = useModel('@@initialState');
  const [trigger, setTrigger] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState();

  let { currentUser: user } = initialState;

  useEffect(() => {
    (async () => {
      const res = await getMerchantEstablishment({ merchantID: user?._id });
      if (res?.success) {
        let filteredEstablishment = res?.data.filter(
          (v) => !new RegExp('607564a97d84680d7f2b3a92', 'i').test(v?.primaryCategory),
        );
        setEstablisments(filteredEstablishment);
        setFetchingStablishment({ ...fetchingStablishment, loading: false });
        setSelectedPlace(filteredEstablishment[0]?._id);
        setSelectedEstab(filteredEstablishment[0]);
        setImages(
          filteredEstablishment[0]?.photos.map((e, i) => {
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
      } else {
        setEstablisments([]);
        setFetchingStablishment({ ...fetchingStablishment, loading: false, failed: err });
        message.error('Failed to fetch bookings.');
      }
    })();
  }, [user?._id, trigger]);

  useEffect(() => {
    (async () => {
      const res = await getReviews(selectedEstab?._id);
      if (res?.success) {
        setReviews(res?.reviews);
        setAvgRate(
          (res?.reviews.reduce((p, n) => p + n.rating, 0) / res?.reviews?.length)?.toFixed(1),
        );
      }
    })();
  }, [selectedEstab?._id]);
  return (
    <Drawer //reviews
      title={
        <Typography.Text>
          {selectedEstab?.name} Reviews ({isNaN(avgRate) ? 0.0 : avgRate}
          <StarFilled style={{ color: '#FADB13' }} />)
        </Typography.Text>
      }
      visible={visible}
      onClose={() => setVisible(false)}
      width={420}
      placement="right"
    >
      <Space direction="vertical">
        {reviews.map((v) => (
          <Card
            key={v?._id}
            style={{
              width: 370,
              background: '#F5F5F5',
              borderRadius: 10,
            }}
          >
            <div
              style={{
                paddingHorizontal: 15,
                paddingVertical: 15,
              }}
            >
              <div
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <Avatar
                  style={{ borderRadius: 100, width: 40, height: 40, marginRight: 10 }}
                  src={
                    v?.hide
                      ? 'https://visitour-staging.s3.ap-southeast-1.amazonaws.com/OfferPhotos/619f89b41dec816972b5ce6b/619f89b41dec816972b5ce6b_1664623843334/619f89b41dec816972b5ce6b_1664623843334_largeb'
                      : `${v?.userId?.photo?.small}`
                  }
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography.Text style={{ left: '20%', position: 'absolute', top: 25 }}>
                      {v?.hide ? 'Anonymous' : `${v?.userId?.firstName} ${v?.userId?.lastName}`}
                    </Typography.Text>
                    <Rate
                      style={{ position: 'absolute', top: 25, left: '60%' }}
                      value={v?.rating}
                      readonly
                      disabled
                    />
                  </div>
                  <Typography.Text
                    type="secondary"
                    style={{ left: '20%', position: 'absolute', top: 48 }}
                  >
                    {v?.createdAt != null ? moment(v?.createdAt).format('MMM Do YYYY') : 'No Date'}
                  </Typography.Text>
                </div>
              </div>
              <br />
              <Typography.Text
                style={{
                  fontSize: 15,
                  color: 'grey',
                }}
              >
                {v?.review}
              </Typography.Text>
              <br />
              <Space>
                {v.photos?.length > 0 && (
                  <div>
                    {v.photos?.map((el, i) => (
                      <Image
                        key={el}
                        style={{
                          width: v?.photos?.length === 1 ? 300 : 150,
                          height: v?.photos?.length === 1 ? 300 : 150,
                          borderRadius: 5,
                          // backgroundColor: 'grey',
                          marginRight: '2px',
                          marginBottom: '2px',
                          marginLeft: '2px',
                          marginTop: '2px',
                        }}
                        src={el.medium}
                        onClick={() => onImageTap({ imageIndex: i, imageSet: v?.photos })}
                      />
                    ))}
                  </div>
                )}
              </Space>
            </div>
          </Card>
        ))}
      </Space>
      {reviews.length == 0 && (
        <Empty description="No reviews yet." image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Drawer>
  );
};
