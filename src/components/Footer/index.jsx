import { useIntl, useModel } from 'umi';
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';
import FloatActionButton from '../FloatActionButton';
import { IS_UNDER_MAINTENANCE } from '../../../config/constants';

const Footer = () => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { currentUser: user } = initialState;

  return (
    <>
      <DefaultFooter
        links={[
          {
            title: 'Visitant Corporation',
            href: 'https://api.visitour.ph',
            blankTarget: true,
          },
        ]}
      />

      {!IS_UNDER_MAINTENANCE && <FloatActionButton />}
    </>
  );
};

export default Footer;
