import { Modal } from 'antd';
import DocViewer, { PDFRenderer } from 'react-doc-viewer';

const LguGuide = ({ close, visible }) => {
  const docs = [{ uri: '/docs/lgu-guides.pdf' }];

  return (
    <>
      {visible ? (
        <Modal width={720} visible={visible} closable footer={null} onCancel={close}>
          <DocViewer
            pluginRenderers={[PDFRenderer]}
            documents={docs}
            config={{ header: { disableFileName: true } }}
          />
        </Modal>
      ) : null}
    </>
  );
};

export default LguGuide;
