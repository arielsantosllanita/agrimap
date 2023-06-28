import React, { useEffect, useState } from 'react';
import { Modal, Typography, message } from 'antd';
import moment from 'moment';
import _, { isEmpty } from 'lodash';
import MultiDatePicker from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import InputIcon from 'react-multi-date-picker/components/input_icon';
import { useModel } from 'umi';

import {
  getMerchantBlockedDates,
  getMerchantEstablishment,
  saveBlockDate,
} from '@/services/establishments';
const { Text, Title } = Typography;

export default ({ openDrawer, setOpenDrawer }) => {
  const [loading, setLoading] = useState('');
  const [values, setValues] = useState(null);
  const [establishmentBlockedDates, setEstablishmentBlockedDates] = useState([]);
  const [isWholeMonthBlocked, setIsWholeMonthBlocked] = useState(false);
  const [isWholeMonthUnblocked, setIsWholeMonthUnblocked] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(1);
  const [selectedEstablishment, setSeletectedEstablishment] = useState({});
  const [blockButtons, setBlockButtons] = useState({
    showBlockMonthButton: true,
    showUnblockMonthButton: false,
  });
  const [images, setImages] = useState([]);

  const { initialState } = useModel('@@initialState');

  let { currentUser: USER } = initialState;

  const saveBlockDateHandler = async () => {
    try {
      setLoading('saveBlockDate');
      const formattedDates = values?.map((a) => a?.format('MMMM DD, YYYY'));
      const toDelete = establishmentBlockedDates?.blocked?.filter((v) => {
        return formattedDates?.some(
          (a) => a == v?.date || a == moment(new Date(v?.date))?.format('MMMM DD, YYYY'),
        );
      });
      const toAdd = formattedDates?.filter((v) => {
        return !establishmentBlockedDates?.blocked?.some((a) => a?.date == v);
      });
      const payload = {
        placeId: selectedEstablishment?._id,
        ...(!_.isEmpty(toDelete) ? { toDelete: toDelete?.map((v) => v?._id) } : {}),
        ...(!_.isEmpty(toAdd) ? { toAdd: [...toAdd] } : {}),
      };

      if (isWholeMonthBlocked) delete payload.toDelete;
      else if (isWholeMonthUnblocked) delete payload.toAdd;

      await saveBlockDate(payload);

      setLoading('');

      setTimeout(() => {
        setReloadTrigger(reloadTrigger + 1);
        setOpenDrawer(false);
        setValues(null);
        setIsWholeMonthBlocked(false);
        setIsWholeMonthUnblocked(false);
      }, 500);
      message.success('Success changes saved.');
    } catch (error) {
      setLoading('');
      message.error('Problem occured while saving blocked date.');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading('fetchEstablishment');
        const response = await getMerchantEstablishment({ merchantID: USER._id });
        let filteredEstablishment = response?.data.filter(
          (v) => !new RegExp('607564a97d84680d7f2b3a92', 'i').test(v?.primaryCategory),
        );
        setLoading('');
        setSeletectedEstablishment(
          isEmpty(selectedEstablishment) ? filteredEstablishment[0] : selectedEstablishment,
        );
        setLoading('');
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
      } catch (error) {
        setLoading('');
        console.log(error);
        message.error('Problem occured while fetching data.');
      }
    })();
  }, [USER._id, reloadTrigger]);

  useEffect(() => {
    (async () => {
      try {
        if (selectedEstablishment?._id) {
          setLoading('fetchBlockedDates');
          const response = await getMerchantBlockedDates(selectedEstablishment._id);

          if (!response?.success) throw new Error();
          setLoading('');
          setEstablishmentBlockedDates(response);
          // console.log('establishmentBlockedDates', response);
        }
      } catch (error) {
        setLoading('');
        message.error('Problem occured while fetching blocked dates');
      }
    })();
  }, [selectedEstablishment?._id, reloadTrigger]);

  useEffect(() => {
    if (_.isEmpty(establishmentBlockedDates?.blocked)) return;

    const startDate = moment(new Date()).add(1, 'days');
    const endDate = moment(new Date()).endOf('month');

    if (moment(new Date()) == endDate) {
      setBlockButtons((v) => ({ ...v, showBlockMonthButton: false }));
      return;
    }

    let currentDate = startDate;
    const days = [];
    while (currentDate <= endDate) {
      days.push(moment(currentDate));
      currentDate = currentDate.add(1, 'days');
    }

    const formattedRemainingDaysInMonth = days.map((v) => v.format('MMMM DD, YYYY'));
    const formattedBlockedDays = establishmentBlockedDates?.blocked
      ?.map((v) => moment(new Date(v?.date))?.format('MMMM DD, YYYY'))
      ?.filter((v) => formattedRemainingDaysInMonth?.includes(v));

    // CHECK IF UNBLOCK BUTTON SHOULD DISPLAY
    if (formattedBlockedDays?.length > 0) {
      setBlockButtons((v) => ({ ...v, showUnblockMonthButton: true }));
    } else {
      setBlockButtons((v) => ({ ...v, showUnblockMonthButton: false }));
    }

    // CHECK IF BLOCK BUTTON SHOULD DISPLAY
    if (_.isEmpty(_.xor(formattedRemainingDaysInMonth, formattedBlockedDays))) {
      // console.log('EQUAL', { formattedRemainingDaysInMonth, formattedBlockedDays });
      setBlockButtons((v) => ({ ...v, showBlockMonthButton: false }));
    } else {
      // console.log('NOT EQUAL', { formattedRemainingDaysInMonth, formattedBlockedDays });
      setBlockButtons((v) => ({ ...v, showBlockMonthButton: true }));
    }
  }, [selectedEstablishment?._id, reloadTrigger, establishmentBlockedDates?.blocked?.length]);

  return (
    <Modal
      onCancel={() => {
        setOpenDrawer(false);
        setValues(null);
      }}
      visible={openDrawer}
      open={openDrawer}
      closable={false}
      onOk={saveBlockDateHandler}
      okButtonProps={{ disabled: loading === 'saveBlockDate' }}
      okText="Block/Unblock dates"
      destroyOnClose={true}
    >
      <Title level={4}>Your Calendar</Title>

      <MultiDatePicker
        multiple
        sort
        className="rmdp-mobile"
        plugins={[<DatePanel style={{ width: 180 }} />]}
        format="MMMM DD, YYYY"
        value={values}
        mapDays={({ date }) => {
          const props = {};
          if (
            establishmentBlockedDates?.blocked?.some(
              (a) =>
                moment(new Date(a?.date))?.format('MMMM DD, YYYY') == date.format('MMMM DD, YYYY'),
            )
          ) {
            props.style = { backgroundColor: '#D0312D', color: 'white' };
          }
          return props;
        }}
        onChange={(v) => {
          setValues(v);
        }}
        minDate={moment(new Date()).add(1, 'days').toDate()}
        render={<InputIcon />}
        mobileButtons={[
          blockButtons.showBlockMonthButton
            ? {
                label: 'BLOCK MONTH',
                type: 'button',
                className: 'rmdp-button rmdp-action-button',
                onClick: () => {
                  const startDate = moment(new Date()).add(1, 'days');
                  const endDate = moment(new Date()).endOf('month');

                  if (moment(new Date()) == endDate) return;

                  let currentDate = startDate;
                  const days = [];
                  while (currentDate <= endDate) {
                    days.push(moment(currentDate));
                    currentDate = currentDate.add(1, 'days');
                  }
                  setIsWholeMonthBlocked(true);
                  setIsWholeMonthUnblocked(false);
                  setValues(days?.map((v) => v?.toDate()));
                },
              }
            : null,
          blockButtons.showUnblockMonthButton
            ? {
                label: 'UNBLOCK MONTH',
                type: 'button',
                className: 'rmdp-button rmdp-action-button',
                onClick: () => {
                  const startDate = moment(new Date()).add(1, 'days');
                  const endDate = moment(new Date()).endOf('month');

                  if (moment(new Date()) == endDate) return;

                  let currentDate = startDate;
                  const days = [];
                  while (currentDate <= endDate) {
                    days.push(moment(currentDate));
                    currentDate = currentDate.add(1, 'days');
                  }
                  setIsWholeMonthUnblocked(true);
                  setIsWholeMonthBlocked(false);
                  setValues(days?.map((v) => v?.toDate()));
                },
              }
            : null,
        ].filter((v) => !_.isNil(v))}
      />
      <br />
      <Text italic style={{ opacity: 0.5 }}>
        *Select on the date you wish to block
      </Text>
      <br />
      <Text italic style={{ opacity: 0.5 }}>
        *Select on the date you wish to unblock
      </Text>
    </Modal>
  );
};
