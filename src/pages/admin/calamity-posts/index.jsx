import { addCalamityWarning, getCalamityPost } from '@/services/calamity';
import {
  CommentOutlined,
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Comment,
  Input,
  List,
  message,
  Skeleton,
  Space,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import Responses from './components/responses';
import PageTitleLabel from '@/services/utilities/PageTitleLabel';
import { useModel } from 'umi';

export default () => {
  const [postContent, setPostContent] = useState({ title: '', content: '' });
  const [postList, setPostList] = useState([]);
  const [reFetchPost, setReFetchPost] = useState(0);
  const [showTable, setShowTable] = useState({ visible: false, postId: null });

  const { initialState } = useModel('@@initialState');
  const { currentUser: user } = initialState;

  // FETCH POSTS
  useEffect(() => {
    (async () => {
      const res = await getCalamityPost({ mode: 'super-admin' });
      if (!res?.success) {
        message.error('Failed to fetch posts');
      } else {
        setPostList(res.data);
      }
    })();
  }, [reFetchPost]);

  const addPostHandler = async () => {
    const res = await addCalamityWarning({ ...postContent });
    if (res?.success) {
      message.success(res?.message);
      setPostContent({ title: '', content: '' });
      setReFetchPost(reFetchPost + 1);
    } else {
      message.error(res?.message);
    }
  };

  return !showTable.visible ? (
    <Col span={15} style={{ margin: 'auto' }}>
      {/* ADD POST */}
      {/* <Card title="What's new?" style={{ padding: 5, marginBottom: '3rem' }}>
        <Space direction="vertical" style={{ display: 'flex' }}>
          <Input
            placeholder="Title..."
            value={postContent.title}
            required
            onChange={(e) => setPostContent({ ...postContent, title: e.target.value })}
          />
          <Input.TextArea
            rows={5}
            placeholder="Content..."
            required
            value={postContent.content}
            onChange={(e) => setPostContent({ ...postContent, content: e.target.value })}
          />
          <Button type="primary" style={{ float: 'right' }} onClick={addPostHandler}>
            Add Post
          </Button>
        </Space>
      </Card> */}

      {/* POST LIST */}
      <Card title={<PageTitleLabel name={'Posts'} />}>
        <Space direction="vertical" size="middle">
          {postList.map((v) => (
            <Card
              key={v?._id}
              title={v?.title}
              actions={[
                <CommentOutlined
                  key="comment"
                  onClick={() => setShowTable({ visible: true, postId: v?._id })}
                />,
              ]}
            >
              <Card.Meta
                description={`Posted by: ${v?.citymunicipality?.name} ${v?.citymunicipality?.type}`}
              />
              <div style={{ marginTop: '1rem' }}>
                <Typography.Text>{v?.content}</Typography.Text>
              </div>
            </Card>
          ))}
        </Space>
      </Card>
    </Col>
  ) : (
    <Responses
      postId={showTable.postId}
      closeTable={() => setShowTable({ visible: false, postId: null })}
    />
  );
};
