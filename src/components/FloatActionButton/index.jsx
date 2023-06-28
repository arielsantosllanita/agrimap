import { BugOutlined, QuestionOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import ReportModal from '../ReportModal';
import FAB from './FAB';
import LguGuide from './lgu-guide';
import { useModel } from 'umi';

const FloatActionButton = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser: user } = initialState;

  const [actions, setActions] = useState([
    { label: 'Report', icon: <BugOutlined />, onClick: () => setShowReportModal(true) },
  ]);
  const [showGuides, setShowGuides] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (['lgu-admin', 'lgu-province'].includes(user?.mode)) {
      setActions((prev) => {
        if (prev.some((v) => v.label == 'Guides')) return prev;

        return prev.concat({
          label: 'Guides',
          icon: <QuestionOutlined />,
          onClick: () => setShowGuides(true),
        });
      });
    } else {
      setActions((prev) => prev.filter((v) => v.label != 'Guides'));
    }
  }, [user?.mode]);

  return (
    <>
      <ReportModal visible={showReportModal} close={() => setShowReportModal(false)} />
      <LguGuide visible={showGuides} close={() => setShowGuides(false)} />
      <FAB actions={actions} />
    </>
  );
};

export default FloatActionButton;
