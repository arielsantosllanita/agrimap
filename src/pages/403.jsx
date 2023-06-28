import { Button, Result } from 'antd';
import { history } from 'umi';

const ForbiddenPage = () => (
  <Result
    status="403"
    title="403"
    subTitle="Sorry, only authorized person can access this page."
    extra={
      <Button type="primary" onClick={() => history.back()}>
        Go back
      </Button>
    }
  />
);

export default ForbiddenPage;
