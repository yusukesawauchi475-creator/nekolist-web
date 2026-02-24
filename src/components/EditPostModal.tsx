import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { updateListing } from "../api/listings";
import { uploadImages } from "../lib/imageUpload";
import type { Listing } from "../types";

const AREA_OPTIONS: Record<string, string[]> = {
  nyc: ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"],
  la: ["Downtown", "West LA", "South Bay", "East LA", "San Fernando Valley"],
  ldn: ["Central", "East", "West", "North", "South"],
};

const CATEGORIES = [
  { value: "home", label: "住まい" },
  { value: "job", label: "求人" },
  { value: "sell", label: "売ります" },
  { value: "buy", label: "買います" },
  { value: "service", label: "サービス" },
  { value: "study", label: "留学" },
];

export default function EditPostModal({
  listingId,
  userEmail,
  onClose,
  onSuccess,
}: {
  listingId: string;
  userEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("home");
  const [area, setArea] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingListing, setLoadingListing] = useState(true);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (error) {
        alert("投稿の読み込みに失敗しました");
        onClose();
        return;
      }

      if (data.contact_email !== userEmail) {
        alert("この投稿を編集する権限がありません");
        onClose();
        return;
      }

      setListing(data);
      setTitle(data.title || "");
      setSummary(data.summary || "");
      setDescription(data.excerpt || "");
      setPrice(data.price || "");
      setCategory(data.cat || "home");
      setArea(data.area || "");
      setExistingImages(data.images || [data.thumb].filter(Boolean));
    } catch (error) {
      alert("投稿の読み込みに失敗しました");
      onClose();
    } finally {
      setLoadingListing(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages = existingImages.length + newImages.length;
    const remainingSlots = 5 - totalImages;
    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(`画像は最大5枚までです。最初の${remainingSlots}枚を追加します。`);
    }

    const updatedNewImages = [...newImages, ...filesToAdd];
    setNewImages(updatedNewImages);

    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));
    setNewImagePreviews([...newImagePreviews, ...newPreviews]);
  };

  const removeExistingImage = (index: number) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
  };

  const removeNewImage = (index: number) => {
    const updatedImages = newImages.filter((_, i) => i !== index);
    const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(newImagePreviews[index]);

    setNewImages(updatedImages);
    setNewImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("タイトルを入力してください");
    if (!summary.trim()) return alert("簡潔な説明を入力してください");
    if (summary.length > 30) return alert("簡潔な説明は30文字以内にしてください");
    if (!description.trim()) return alert("詳細説明を入力してください");

    setLoading(true);
    setUploadProgress("画像をアップロード中...");

    try {
      let finalImages = [...existingImages];
      let thumb = existingImages[0] || "";

      if (newImages.length > 0) {
        const uploadResult = await uploadImages(newImages);

        if (!uploadResult.success) {
          alert(uploadResult.error || "画像のアップロードに失敗しました");
          setLoading(false);
          setUploadProgress("");
          return;
        }

        finalImages = [...existingImages, ...(uploadResult.urls || [])];
        thumb = uploadResult.thumb || existingImages[0] || "";
      }

      setUploadProgress("投稿を更新中...");

      const result = await updateListing(listingId, {
        title,
        summary,
        description,
        price,
        category,
        area,
        imageUrl: thumb,
        images: finalImages,
        userEmail,
      });

      if (!result.success) {
        alert(result.error || "更新に失敗しました");
        setLoading(false);
        setUploadProgress("");
        return;
      }

      // プレビューURLを解放
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));

      alert("投稿を更新しました！");
      onSuccess();
    } catch (error) {
      alert("更新に失敗しました");
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  if (loadingListing) {
    return (
      <div
        className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="bg-white rounded-3xl p-8">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  const totalImages = existingImages.length + newImages.length;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">投稿を編集</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">タイトル *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="例: 1BR Sublet in Manhattan"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              簡潔な説明（ホーム画面用） * 
              <span className="text-xs text-gray-500 ml-2">
                {summary.length}/30文字
              </span>
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              maxLength={30}
              className="w-full p-3 border rounded-lg"
              placeholder="例: 綺麗なベッドルーム、2月末まで"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">詳細説明 *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={12}
              maxLength={500}
              placeholder="物件・仕事・商品の詳細を記入してください"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">カテゴリー</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">エリア</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                {listing && AREA_OPTIONS[listing.city]?.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">価格</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="例: $1500/mo"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              画像（最大5枚）
            </label>
            
            {existingImages.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">既存の画像:</p>
                <div className="grid grid-cols-5 gap-2">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        disabled={loading}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalImages < 5 && (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={loading}
                className="w-full p-3 border rounded-lg disabled:opacity-50"
              />
            )}

            {newImagePreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">新しい画像:</p>
                <div className="grid grid-cols-5 gap-2">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        disabled={loading}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              ※画像は自動で圧縮されます（最大1024px、100KB以下）
            </p>
          </div>

          {uploadProgress && (
            <div className="mb-4 text-center text-sm text-blue-600">
              {uploadProgress}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "更新中..." : "更新する"}
          </button>
        </form>
      </div>
    </div>
  );
}
