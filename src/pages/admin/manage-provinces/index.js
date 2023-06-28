import {
  List,
  Image,
  Card,
  Drawer,
  Button,
  Tabs,
  Tooltip,
  Modal,
  message,
  Space,
  Dropdown,
  Menu,
} from 'antd';
import {
  FolderAddFilled,
  CameraOutlined,
  AppstoreAddOutlined,
  UserAddOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import { getProvinces, getCitiesByProvince, changePhoto } from '@/services/provinces';
import { b64toBlob } from '@/services/utilities';
import Cropper from 'react-cropper';
import AdminModal from './components/add-admin';
import ImageUpload from './components/upload';
import EditDescription from './components/description-edit';
import PageTitleLabel from '@/services/utilities/PageTitleLabel';
import { Link, useModel } from 'umi';
import store from 'store';

const { TabPane } = Tabs;

export default () => {
  // let user = store.get('user-admin');
  const { initialState } = useModel('@@initialState');
  let { currentUser: user } = initialState;
  const [cropper, setCropper] = useState();
  let [tabPosition, setTabposition] = useState('left');

  let [drawer, setDrawer] = useState(false);
  let [miniCardHover, setMiniCardHover] = useState(false);
  let [miniCardHoverIndex, setMiniCardHoverIndex] = useState(false);
  let [uploader, setUploader] = useState(false);
  let [isFetching, setFetching] = useState(false);
  let [cropperVisible, setCropperVisible] = useState(false);
  let [isModalVisible, setIsModalVisible] = useState(false);
  let [isFetchingCities, setFetchingCities] = useState(false);

  let [hover, setHover] = useState('');
  let [type, setType] = useState('');
  let [trigger, setTrigger] = useState(0);

  let [provinces, setProvinces] = useState([]);
  let [citiesByProvince, setCitiesByProvince] = useState([]);

  let [selectedCity, setSelectedCity] = useState({});
  let [selectedProvince, setSelectedProvince] = useState({});

  const [actionDrawer, setActionDrawer] = useState({ show: false, data: null });

  let [image, setImage] = useState('');
  const [loader, setLoader] = useState('');

  const [reloadPage, setReloadPage] = useState(0);

  const fetchProvinces = async () => {
    try {
      setFetching(true);
      let res = await getProvinces(true);
      setProvinces(res.provinces);
      fetchCities(res.provinces[0]?._id);
      setSelectedProvince(res.provinces[0]);
      setFetching(false);
    } catch (error) {
      setFetching(false);
      message.error('Failed to fetch provinces.');
    }
  };

  const fetchCities = async (provinceId) => {
    try {
      setFetchingCities(true);
      let res = await getCitiesByProvince(provinceId, true);
      setCitiesByProvince(res.cities);
      setFetchingCities(false);
    } catch (error) {
      setFetchingCities(false);
      message.error('Failed to fetch provinces.');
    }
  };

  useEffect(() => {
    if (!user.roles.includes('admin')) {
      window.location = '/lgu-featured-places';
    }

    fetchProvinces();
    changeTabPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadPage]);

  const changeTabPosition = () => {
    if (innerWidth <= 796) {
      setTabposition('top');
    }
  };

  const onChange = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(files[0]);
  };

  return (
    <div>
      {/* EDIT DESCRIPTION MODAL */}
      <EditDescription
        {...actionDrawer}
        closeHandler={() => {
          setActionDrawer({ show: false, data: null });
        }}
        reloadPage={() => setReloadPage(reloadPage + 1)}
      />

      <Modal
        visible={cropperVisible}
        width={700}
        footer={
          <Button
            loading={loader == 'update-province-img'}
            type="primary"
            onClick={async () => {
              setLoader('update-province-img');
              let dataURI = cropper.getCroppedCanvas().toDataURL();

              const block = dataURI.split(';');
              const contentType = block[0].split(':')[1],
                realData = block[1].split(',')[1];
              let blob = b64toBlob({ b64Data: realData, contentType });
              let res = await changePhoto(
                { blob, id: selectedProvince._id, type: 'province' },
                true,
              );
              if (res.success) {
                setLoader('');
                setCropperVisible(false);
                fetchProvinces(); // not working :(
              }
            }}
          >
            Update
          </Button>
        }
        title={`Change "${selectedProvince.name}" Cover Photo`}
        onCancel={() => setCropperVisible(false)}
      >
        <div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '80%' }}>
              <input type="file" onChange={onChange} />
              <br />
              <br />
              <Cropper
                style={{ height: 400, width: '100%' }}
                zoomTo={0.5}
                initialAspectRatio={1}
                preview=".img-preview"
                src={image}
                viewMode={1}
                minCropBoxHeight={10}
                minCropBoxWidth={10}
                background={false}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false}
                onInitialized={(instance) => {
                  setCropper(instance);
                }}
                guides={true}
              />
            </div>
            {image && (
              <div className="box" style={{ width: '20%' }}>
                <br />
                <br />
                <div className="img-preview" style={{ width: '100%', height: 300 }} />
                <h3>Preview</h3>
              </div>
            )}
          </div>
        </div>
      </Modal>
      <Card loading={isFetching}>
        <Tabs
          defaultActiveKey="0"
          style={{ height: '80vh' }}
          destroyInactiveTabPane={true}
          onChange={changeTabPosition}
          tabPosition={tabPosition}
          onTabClick={(e) => {
            fetchCities(provinces[e]?._id);
            setSelectedProvince(provinces[e]);
          }}
        >
          {provinces?.map((data, i) => {
            return (
              <TabPane
                style={{ width: '100%' }}
                tab={
                  <div>
                    <Image
                      height={30}
                      width={30}
                      style={{ objectFit: 'cover', borderRadius: 100 }}
                      src={data?.photo?.large + '?' + new Date() || ''}
                      preview={false}
                    />
                    <span style={{ marginLeft: 10 }}>{data?.name}</span>
                  </div>
                }
                key={i}
              >
                <Card
                  loading={isFetchingCities}
                  style={{ height: '85vh', width: '100%', overflowY: 'scroll' }}
                >
                  {selectedProvince.name && (
                    <>
                      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {/* <h2>{selectedProvince?.name}</h2> */}
                        <PageTitleLabel name={selectedProvince?.name} />
                        <Dropdown
                          placement="bottomRight"
                          overlay={
                            <Menu
                              onClick={(e) =>
                                setActionDrawer({
                                  show: true,
                                  data: selectedProvince,
                                  type: 'province',
                                  mode: e?.key,
                                })
                              }
                            >
                              <Menu.Item key="editDescription">Edit description</Menu.Item>
                            </Menu>
                          }
                          trigger={['click']}
                        >
                          <MenuOutlined />
                        </Dropdown>
                      </Space>

                      <div style={{ position: 'relative' }}>
                        <Image
                          height={300}
                          width={'100%'}
                          style={{ objectFit: 'cover' }}
                          src={selectedProvince?.photo?.large + '?' + new Date() || ''}
                          preview={false}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                          }}
                        >
                          <Button
                            style={{
                              marginRight: 5,
                              color: '#ffff',
                              background: 'rgba(0,0,0,0.4)',
                            }}
                            type="text"
                            icon={<UserAddOutlined />}
                            onMouseOver={() => setHover('add')}
                            onMouseLeave={() => setHover('')}
                            onClick={() => {
                              setType('update');
                              setTrigger(trigger + 1);
                              setIsModalVisible(true);
                            }}
                          >
                            <span style={{ textDecoration: hover == 'add' ? 'underline' : 'none' }}>
                              Add Provincial LGU
                            </span>
                          </Button>
                          <Button
                            style={{ color: '#ffff', background: 'rgba(0,0,0,0.4)' }}
                            type="text"
                            icon={<CameraOutlined />}
                            onMouseOver={() => setHover('update')}
                            onMouseLeave={() => setHover('')}
                            onClick={() => setCropperVisible(true)}
                          >
                            <span
                              style={{ textDecoration: hover == 'update' ? 'underline' : 'none' }}
                            >
                              Update picture
                            </span>
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                  <List
                    itemLayout="horizontal"
                    dataSource={citiesByProvince}
                    renderItem={(item, i) => (
                      <List.Item
                        actions={[
                          <Link
                            key={'manage-places-' + item?._id}
                            to={`/lgu-featured-places/${item?._id}?cityName=${item?.name}`}
                            target="_blank"
                          >
                            <Button
                              style={{ width: '100%' }}
                              type="primary"
                              danger
                              icon={<AppstoreAddOutlined />}
                            >
                              Manage Places
                            </Button>
                          </Link>,
                          <Button
                            key={'add-lgu-admin-' + item?._id}
                            style={{ width: '100%' }}
                            type="primary"
                            danger
                            icon={<FolderAddFilled />}
                            onClick={() => {
                              setType('municipal');
                              setIsModalVisible(true);
                              setSelectedCity(item);
                            }}
                          >
                            Add LGU Admin
                          </Button>,
                          <Link
                            key={'manage-news-' + item?._id}
                            to={`/lgu-news/${selectedCity._id}?provinceName=${selectedProvince.name}`}
                            target="_blank"
                          >
                            <Button
                              style={{ width: '100%' }}
                              type="primary"
                              icon={<AppstoreAddOutlined />}
                              onClick={() => {
                                setSelectedCity(item);
                              }}
                            >
                              Manage News
                            </Button>
                          </Link>,
                          <Dropdown
                            key={item?._id}
                            placement="bottomRight"
                            overlay={
                              <Menu
                                onClick={(e) =>
                                  setActionDrawer({
                                    show: true,
                                    type: 'city/municipality',
                                    data: item,
                                    mode: e?.key,
                                  })
                                }
                              >
                                {/* ADDITIONAL ACTIONS WILL BE ADDED HERE */}
                                <Menu.Item key="editDescription">Edit description</Menu.Item>
                              </Menu>
                            }
                            trigger={['click']}
                          >
                            <MenuOutlined />
                          </Dropdown>,
                          // <Button
                          //   style={{ width: '100%' }}
                          //   onClick={() => {
                          //     setSelectedCity(item);
                          //     setUploader(true);
                          //   }}
                          //   type="primary"
                          //   icon={<PictureFilled />}
                          // >
                          //   Change Picture
                          // </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div
                              onMouseOver={() => {
                                setMiniCardHover(true);
                                setMiniCardHoverIndex(i);
                              }}
                              onMouseLeave={() => setMiniCardHover(false)}
                            >
                              {miniCardHover && i == miniCardHoverIndex && (
                                <Tooltip title="Change Picture">
                                  <Button
                                    type="primary"
                                    shape="circle"
                                    icon={<CameraOutlined />}
                                    onClick={() => {
                                      setSelectedCity(item);
                                      setUploader(true);
                                    }}
                                    style={{
                                      position: 'absolute',
                                      zIndex: 2,
                                      margin: 5,
                                    }}
                                    size={'small'}
                                  />
                                </Tooltip>
                              )}
                              <Image
                                width={50}
                                height={50}
                                style={{ objectFit: 'cover' }}
                                src={item?.photo?.small + '?' + new Date() || ''}
                                preview={false}
                                fallback="https://visitour.s3.ap-southeast-1.amazonaws.com/Placeholder/visitour-logo/visitour-logo_small.jpeg"
                              />
                            </div>
                          }
                          title={<a>{item.name}</a>}
                          description={item?.provinceId?.name}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </TabPane>
            );
          })}
        </Tabs>
      </Card>

      <AdminModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        province={selectedProvince}
        city={selectedCity}
        type={type}
        trigger={trigger}
      />

      <ImageUpload
        state={uploader}
        setState={setUploader}
        city={selectedCity}
        callback={() => fetchCities(selectedProvince?._id)}
      />

      <Drawer
        title="Provinces"
        placement="right"
        onClose={() => {
          setDrawer(false);
        }}
        visible={drawer}
      >
        <Card loading={isFetching} style={{ width: '100%' }}>
          <List
            style={{ width: '100%' }}
            itemLayout="horizontal"
            dataSource={provinces}
            renderItem={(item, i) => (
              <List.Item key={i}>
                <List.Item.Meta
                  avatar={
                    <Image
                      width={70}
                      height={50}
                      src={item?.photo?.small}
                      fallback="https://visitour.s3.ap-southeast-1.amazonaws.com/Placeholder/visitour-logo/visitour-logo_small.jpeg"
                    />
                  }
                  title={
                    <a
                      onClick={() => {
                        fetchCities(item?._id);
                        setSelectedProvince(item);
                        setDrawer(false);
                      }}
                    >
                      {item.name}
                    </a>
                  }
                  description={item?.regionId?.name}
                />
              </List.Item>
            )}
          />
        </Card>
      </Drawer>
    </div>
  );
};
