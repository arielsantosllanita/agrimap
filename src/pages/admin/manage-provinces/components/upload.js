import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Modal, Button } from 'antd';
import { changePhoto } from '@/services/provinces';
import { message } from 'antd';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default ({ state, setState, city, callback }) => {
  const [upImg, setUpImg] = useState();
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState({ unit: 'px', x: 0, y: 0, width: 200, height: 200 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  let ref = useRef();

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setUpImg(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    console.log(image.naturalWidth);
    console.log(image.naturalHeight);

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    );
  }, [completedCrop]);

  let createBlob = (canvas, crop) => {
    if (!crop || !canvas) {
      return;
    }

    canvas.toBlob(
      async (blob) => {
        setIsUploading(true);
        let res = await changePhoto({ blob, id: city?._id, type: 'city' }, true);
        if (res.success) {
          message.success('Image uploaded');
          setState(false);
          setUpImg('');
          ref.current.value = '';
          callback();
        } else {
          message.error(res?.message);
        }
        setIsUploading(false);
      },
      'image/png',
      1,
    );
  };

  return (
    <Modal
      onCancel={() => setState(false)}
      title={`Change "${city?.name}" Cover Photo`}
      visible={state}
      footer={[
        <Button
          key="submit"
          type="primary"
          loading={isUploading}
          onClick={() => createBlob(previewCanvasRef.current, completedCrop)}
        >
          Upload
        </Button>,
      ]}
    >
      <div>
        <input type="file" accept="image/*" onChange={onSelectFile} ref={ref} />
      </div>
      <ReactCrop
        src={upImg}
        onImageLoaded={onLoad}
        crop={crop}
        onChange={(c) => setCrop(c)}
        onComplete={(c) => setCompletedCrop(c)}
      />
      <div>
        <canvas
          ref={previewCanvasRef}
          // Rounding is important so the canvas width and height matches/is a multiple for sharpness.
          style={{
            width: Math.round(completedCrop?.width ?? 0),
            height: Math.round(completedCrop?.height ?? 0),
            display: 'none',
          }}
        />
      </div>
    </Modal>
  );
};
