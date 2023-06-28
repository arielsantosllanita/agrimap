import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { getRegions } from '@/services/featuredplaces';
import { getEmergencyData } from '@/services/emergency';
import PageTitleLabel from '@/services/utilities/PageTitleLabel';

import { TreeSelect, Typography, Card, Progress, message, Button, Table } from 'antd';
import Form from './components/form';
const { TreeNode } = TreeSelect;

export default () => {
  const [data, setData] = useState([]);
  const [value, setValue] = useState('all');
  const [isFetching, setIsFetching] = useState(false);
  const [progressData, setProgressData] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [expandedRow, setExpandedRow] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [currentSelectedContacts, setCurrentSelectedContact] = useState([]);
  const [seletedId, setSelectedId] = useState('');
  const [_selectedId, _setSelectedId] = useState('');
  const [call, _call] = useState(0);

  const handleChange = async (id, isProv) => {
    setIsFetching(true);
    try {
      let res = await getEmergencyData({ id, isProv });
      if (res.success) {
        setProgressData(() => {
          return {
            totalConfirmed: res.data.reduce((p, n) => p + (n.contactNumbers.length > 0 ? 1 : 0), 0),
            total: res.data.reduce((p, n) => p + 1, 0),
          };
        });
      }
    } catch (e) {
      console.log(e);
    }
    setIsFetching(false);
  };

  useEffect(async () => {
    setIsFetching(true);
    try {
      let res = await getRegions();
      if (res.success) {
        setData(res.data);
        setIsFetching(false);
        setProgressData(() => {
          return {
            totalConfirmed: res.data.reduce((p, n) => {
              return (
                p +
                n.provinces.reduce((p2, n2) => {
                  return (
                    p2 +
                    n2.citymunicipalities.reduce((p3, n3) => {
                      return p3 + (n3.contactNumbers?.length > 0 ? 1 : 0);
                    }, 0)
                  );
                }, 0)
              );
            }, 0),
            total: res.data.reduce((p, n) => {
              return (
                p +
                n.provinces.reduce((p2, n2) => {
                  return (
                    p2 +
                    n2.citymunicipalities.reduce((p3, n3) => {
                      return p3 + 1;
                    }, 0)
                  );
                }, 0)
              );
            }, 0),
          };
        });
      }
    } catch (e) {
      message.error(e);
      console.log(e);
      setIsFetching(false);
    }
  }, [call]);

  const calculateRegionCompletion = (prov) => {
    let totalConfirmed = data
      .filter((el) => el.name == prov)
      .reduce((p, n) => {
        return (
          p +
          n.provinces.reduce((p2, n2) => {
            return (
              p2 +
              n2.citymunicipalities.reduce((p3, n3) => {
                return p3 + (n3.contactNumbers?.length > 0 ? 1 : 0);
              }, 0)
            );
          }, 0)
        );
      }, 0);

    let total = data
      .filter((el) => el.name == prov)
      .reduce((p, n) => {
        return (
          p +
          n.provinces.reduce((p2, n2) => {
            return (
              p2 +
              n2.citymunicipalities.reduce((p3, n3) => {
                return p3 + 1;
              }, 0)
            );
          }, 0)
        );
      }, 0);

    return ((totalConfirmed / total) * 100).toFixed(2);
  };

  const calculateProvinceCompletion = (prov) => {
    let _;

    data.forEach((el) => {
      el.provinces.forEach((el2) => {
        if (el2.name == prov) _ = el2.citymunicipalities;
      });
    });

    const totalConfirmed = _.filter(
      (el) => el.contactNumbers && el.contactNumbers.length > 0,
    ).length;
    return ((totalConfirmed / _.length) * 100).toFixed(2);
  };

  const handleTreeChange = (e) => {
    console.log(e);
    setProvinces([]);
    setValue(e);
    data.forEach((el) => {
      let el2 = el.provinces.filter((el2) => el2.name == e.substr(0, e.length - 1));
      if (el2.length > 0) setProvinces(el2[0].citymunicipalities);
    });

    if (e[e.length - 1].search(/[0-9]/) == 0) {
      data.forEach((el) => {
        el.provinces.forEach((el2) => {
          if (el2.name == e.substr(0, e.length - 1)) _setSelectedId(el2._id);
        });
      });
    } else {
      data.forEach((el) => {
        if (el.name == e) _setSelectedId(el._id);
      });
    }
    handleChange(_selectedId, e[e.length - 1].search(/[0-9]/) == 0);
  };

  const Tree = () => {
    return (
      <TreeSelect
        style={{
          width: '25em',
        }}
        dropdownStyle={{
          maxHeight: 400,
          overflow: 'auto',
        }}
        value={value}
        placeholder="Please select"
        onChange={handleTreeChange}
        allowClear
        showSearch
      >
        {data.map((e) => (
          <TreeNode
            title={
              <Typography.Text>
                {e?.name} <strong>{calculateRegionCompletion(e?.name)}%</strong>
              </Typography.Text>
            }
            value={e?.name}
            key={e?.name}
          >
            {e?.provinces.map((e2, key2) => (
              <TreeNode
                title={
                  <Typography.Text>
                    {e2?.name} <strong>{calculateProvinceCompletion(e2?.name)}%</strong>
                  </Typography.Text>
                }
                value={e2?.name + key2}
                key={e2?.name + key2}
              />
            ))}
          </TreeNode>
        ))}
      </TreeSelect>
    );
  };
  return (
    <PageContainer
      title={<PageTitleLabel name={'Emergency Hotlines of Municipalities'} />}
      extra={[<Tree />]}
      loading={isFetching}
    >
      <Form
        visible={openForm}
        close={() => setOpenForm(false)}
        data={currentSelectedContacts}
        id={seletedId}
        trigger={() => {
          _call(call + 1);
        }}
      />
      <Card title={value.replace(/[0-9]/g, '').toUpperCase()}>
        <Card.Grid
          style={{ width: '100%', textAlign: 'center', boxShadow: 'none' }}
          hoverable={false}
        >
          <Typography.Text>
            {progressData.totalConfirmed}/{progressData.total}
          </Typography.Text>
          <br />
          <Typography.Text strong>
            {((progressData.totalConfirmed / progressData.total) * 100).toFixed(2)}%
          </Typography.Text>
          <Progress
            strokeColor={{
              from: '#108ee9',
              to: '#87d068',
            }}
            percent={((progressData.totalConfirmed / progressData.total) * 100).toFixed(2)}
            status="active"
            showInfo={false}
          />
        </Card.Grid>
        {provinces.length > 0 && (
          <Table
            dataSource={provinces}
            showHeader={false}
            expandable={{
              expandedRowRender: (row) => (
                <React.Fragment>
                  {row?.contactNumbers?.map((el, key) => (
                    <div key={key}>
                      <Typography.Text>
                        {el.name}: <strong>{el.number}</strong>
                      </Typography.Text>
                      <br />
                    </div>
                  ))}
                </React.Fragment>
              ),
              onExpandedRowsChange: (e) => setExpandedRow(e),
            }}
            columns={[
              {
                render: (_, row) => row?.name,
              },
              {
                render: (_, row) => {
                  if (expandedRow.includes(row?.name)) {
                    setCurrentSelectedContact(row?.contactNumbers);
                    setSelectedId(row?._id);
                    return <Button onClick={() => setOpenForm(true)}>Update</Button>;
                  }
                },
              },
            ]}
            rowKey={(e) => e.name}
          />
        )}
      </Card>
    </PageContainer>
  );
};
