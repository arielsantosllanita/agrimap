import React, { useState, useRef } from 'react';
import ProForm, {
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  ModalForm,
} from '@ant-design/pro-form';
import { Modal, Typography, Spin, AutoComplete, Collapse, Radio, message } from 'antd';
import { getBase64, b64toBlob } from '@/services/utilities';
import { LoadingOutlined } from '@ant-design/icons';
import { searchPlaces, addNews, updateNews } from '@/services/featuredplaces';
import FloatLabel from '@/services/utilities/floatlabel';
import { isNil } from 'lodash';

export default ({ visible, onClose, actionRef, mode, data, selected, setSelected }) => {
  const [content, setContent] = useState('');
  const [contentNotEditing, setContentNotEditing] = useState(false);

  const [previewImage, setPrevImage] = useState('');
  const [previewTitle, setPrevTitle] = useState('');
  const [inputVal, setInputVal] = useState(mode == 'edit' ? data?.place?.name : '');
  const [previewVisible, setPrevVisible] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef(null);

  // const [selected, setSelected] = useState('featuredPlace');
  const [searchedPlaces, setSearchPlaces] = useState([]);
  const [places, setPlaces] = useState([]);

  const [selectedSearchedPlace, setSelectedSearchedPlace] = useState(null);

  const [editing, setEditing] = useState(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) file.preview = await getBase64(file.originFileObj);

    setPrevImage(file.url || file.preview);
    setPrevVisible(true);
    setPrevTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const requestPlace = async (val) => {
    setSearching(true);
    let res = await searchPlaces({ searchKeyword: val.split('(')[0].trim() }, true);
    if (res.success) {
      setPlaces(res.places);
      setSearchPlaces(
        res.places.map((el, i) => ({
          dataIndex: i,
          value: `${el.name} (${el.provinceId?.name}, ${el.regionId?.name.split('–')[0]})`,
        })),
      );
      setSearching(false);
    } else {
      message.error('Error in the server');
      setSearching(false);
    }
  };

  const runTimer = (searchKeyword) => {
    if (timerRef.current) {
      setSelectedSearchedPlace(null);
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(function () {
      requestPlace(searchKeyword);
    }, 300);
  };

  return (
    <>
      <Modal
        visible={previewVisible}
        title={previewTitle}
        footer={null}
        closable={false}
        onCancel={() => setPrevVisible(false)}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
      <ModalForm
        visible={visible}
        width={620}
        title={`${mode == 'edit' ? 'Edit ' : ''}Admin News/Articles`}
        modalProps={{
          bodyStyle: { maxHeight: 550, overflowY: 'scroll' },
          okText: isSaving ? <LoadingOutlined /> : mode == 'add' ? 'Add Article' : 'Save',
          onCancel: () => {
            onClose();
            setContent('');
            setContentNotEditing(false);
            setSelectedSearchedPlace(null);
            setInputVal('');
          },
          destroyOnClose: true,
        }}
        submitter={{
          submitButtonProps: {
            disabled: isSaving || !editing,
          },
        }}
        onFinish={async (val) => {
          const { title, content } = val;
          let placeId,
            photos = [],
            nonBlobs = [];

          if (val.photos?.length > 8) {
            message.error('Can only upload 8 images');
            return;
          }

          if (selected == 'featuredPlace' && mode != 'edit') {
            if (isNil(selectedSearchedPlace)) {
              message.error('Please select a valid place.');
              return;
            } else {
              placeId = selectedSearchedPlace;
            }
          }

          for (let i = 0; i < val.photos?.length; i++) {
            if (!val.photos[i].originFileObj) {
              nonBlobs.push(val.photos[i]);
              continue;
            }
            const src = await getBase64(val.photos[i].originFileObj);
            const block = src.split(';');
            const contentType = block[0].split(':')[1],
              realData = block[1].split(',')[1];
            let blob = b64toBlob({ b64Data: realData, contentType });
            photos.push(blob);
          }

          if (mode == 'add') {
            try {
              setIsSaving(true);
              let res = await addNews(
                {
                  info: {
                    title,
                    content,
                    articleType: selected,
                    place: placeId,
                  },
                  photos,
                },
                true,
              );
              if (res.success) {
                message.success(res.message);
                actionRef?.current?.reload();
                onClose();
              } else message.error(res.message);
            } catch (err) {
              // console.log(err);
              message.error('Error in adding the news');
            }
          } else {
            try {
              setIsSaving(true);
              let res = await updateNews(
                {
                  info: {
                    id: data?._id,
                    title: title || null,
                    content: content || null,
                  },
                  photos,
                  nonBlobs,
                },
                true,
              );
              console.log('nonblob', nonBlobs);

              if (res.success) {
                message.success(res.message);
                actionRef?.current?.reload();
                onClose();
              } else message.error(res.message);
            } catch (err) {
              // console.log(err);
              message.error('Error in adding the news');
            }
          }
          setIsSaving(false);
        }}
      >
        <Spin spinning={isSaving}>
          <ProForm.Group
            submitter={{
              render: () => {
                return [null];
              },
            }}
          >
            <Radio.Group
              defaultValue={mode == 'edit' ? data.articleType : 'featuredPlace'}
              buttonStyle="solid"
              style={{
                width: 560,
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
              onChange={(e) => {
                setSelected(e.target.value);
                setEditing(true);
                // console.log("ROW_DATA", data);
              }}
            >
              <Radio.Button style={{ width: '32%', textAlign: 'center' }} value="featuredPlace">
                Featured Place
              </Radio.Button>
              <Radio.Button
                style={{ width: '32%', textAlign: 'center' }}
                value="featuredTraditions"
              >
                Traditions
              </Radio.Button>
              <Radio.Button
                style={{ width: '32%', textAlign: 'center' }}
                value="featuredIntangibleHeritage"
              >
                Intangible Heritage
              </Radio.Button>
            </Radio.Group>
            {selected == 'featuredPlace' && (
              <FloatLabel label="Search Place" bool={inputVal != ''}>
                <AutoComplete
                  disabled={selected != 'featuredPlace'}
                  style={{
                    width: 560,
                  }}
                  options={searchedPlaces}
                  filterOption={(inputValue, option) =>
                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  onChange={(e) => {
                    setSearchPlaces([]);
                    setInputVal(e);
                    if (e.length != 0) runTimer(e);
                  }}
                  loading={searching}
                  className="customInput"
                  onSelect={(_, data) => {
                    setSelectedSearchedPlace(places[data?.dataIndex]);
                  }}
                  value={inputVal}
                  allowClear
                />
              </FloatLabel>
            )}

            <ProFormText
              name="title"
              label="Title"
              placeholder="Enter title"
              rules={[
                {
                  required: mode == 'edit' ? false : true,
                  message: 'Please enter title',
                },
              ]}
              fieldProps={{
                style: { width: 560 },
                onChange: () => {
                  setEditing(true);
                },
              }}
              value={mode == 'edit' ? data?.title : ''}
              allowClear
            />
          </ProForm.Group>
          <ProForm.Group>
            <ProFormTextArea
              name="content"
              label="Content"
              placeholder="Enter Content"
              fieldProps={{
                style: {
                  minHeight: 250,
                  width: 560,
                },
                value: mode == 'edit' && !contentNotEditing ? data?.content : content,
                onKeyDown: (e) => {
                  if (e.key.toLowerCase() == 'tab') {
                    e.preventDefault();
                    setContent(content + '\t');
                  }
                },
                onChange: (e) => {
                  setContent(e.target.value);
                  setContentNotEditing(true);
                  setEditing(true);
                },
              }}
              rules={[
                {
                  required: mode == 'edit' ? false : true,
                  message: 'Please enter Content',
                },
              ]}
              allowClear
            />
          </ProForm.Group>
          <ProForm.Group>
            {selected != 'featuredPlace' && (
              <Collapse defaultActiveKey={['1']}>
                <Collapse.Panel
                  showArrow={false}
                  header={
                    <div
                      style={{
                        width: 530,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography.Text>Click to add photos</Typography.Text>
                      <Typography.Text type="secondary"> (maximum upload: 8)</Typography.Text>
                    </div>
                  }
                >
                  <ProFormUploadButton
                    name="photos"
                    title="upload"
                    max={8}
                    customRequest={({ file, onSuccess }) => {
                      setTimeout(() => {
                        onSuccess('ok');
                      }, 0);
                    }}
                    fieldProps={{
                      listType: 'picture-card',
                      multiple: true,
                      onPreview: handlePreview,
                      ...(mode == 'edit'
                        ? {
                            defaultFileList: data?.photos.map((v, i) => ({
                              uid: i,
                              status: 'done',
                              url: v.original,
                            })),
                          }
                        : {}),
                    }}
                    style={{ display: 'flex', justifyContent: 'space-evenly' }}
                  />
                </Collapse.Panel>
              </Collapse>
            )}
          </ProForm.Group>
        </Spin>
      </ModalForm>
    </>
  );
};
