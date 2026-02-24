import imageCompression from "browser-image-compression";
import { supabase } from "./supabase";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 0.1; // 100KB
const MAX_WIDTH = 1024;
const QUALITY = 0.8;

export interface UploadResult {
  success: boolean;
  urls?: string[];
  thumb?: string;
  error?: string;
}

export async function uploadImages(files: File[]): Promise<UploadResult> {
  if (!supabase) {
    return { success: false, error: "Supabase not configured" };
  }

  if (files.length === 0) {
    return { success: true, urls: [], thumb: undefined };
  }

  if (files.length > MAX_IMAGES) {
    return { success: false, error: `画像は最大${MAX_IMAGES}枚までです` };
  }

  try {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      // 画像を圧縮
      const compressedFile = await imageCompression(file, {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: MAX_WIDTH,
        useWebWorker: true,
        fileType: file.type,
        initialQuality: QUALITY,
      });

      // ファイル名を生成（タイムスタンプ + ランダム文字列）
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${timestamp}_${randomStr}.${fileExt}`;

      // Supabase Storageにアップロード
      const { data, error } = await supabase.storage
        .from("listing-images")
        .upload(fileName, compressedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        return { success: false, error: `画像のアップロードに失敗しました: ${error.message}` };
      }

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    // 1枚目をthumbとして使用
    const thumb = uploadedUrls[0] || undefined;

    return {
      success: true,
      urls: uploadedUrls,
      thumb,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "画像のアップロードに失敗しました",
    };
  }
}
