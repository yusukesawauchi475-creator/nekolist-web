import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export default function ImageUpload({
  onImageSelected
}: {
  onImageSelected: (imageUrl: string) => void;
}) {
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const takePicture = async (source: CameraSource) => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source,
        width: 1200,
        height: 900,
      });

      if (image.dataUrl) {
        setPreview(image.dataUrl);
        // 実際のアップロード処理（後で実装）
        // 今はプレビューのみ
        onImageSelected(image.dataUrl);
      }
    } catch (error) {
      // カメラエラーは無視
      alert('画像の取得に失敗しました');
    }
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
          <button
            onClick={() => {
              setPreview("");
              onImageSelected("");
            }}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => takePicture(CameraSource.Camera)}
            className="flex-1 py-3 border-2 border-dashed rounded-lg text-sm font-medium"
          >
            📷 写真を撮る
          </button>
          <button
            type="button"
            onClick={() => takePicture(CameraSource.Photos)}
            className="flex-1 py-3 border-2 border-dashed rounded-lg text-sm font-medium"
          >
            🖼️ ギャラリー
          </button>
        </div>
      )}
    </div>
  );
}
