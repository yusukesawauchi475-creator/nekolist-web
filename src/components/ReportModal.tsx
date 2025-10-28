import { useState } from 'react';

type ReportReason = 'illegal' | 'discrimination' | 'copyright' | 'spam' | 'other';

const REASONS: Record<ReportReason, string> = {
  illegal: '違法行為（薬物・武器・性的サービス等）',
  discrimination: '差別的表現',
  copyright: '著作権侵害',
  spam: '詐欺・スパム',
  other: 'その他'
};

export default function ReportModal({
  open,
  onClose,
  onSubmit
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason) => void;
}) {
  const [selected, setSelected] = useState<ReportReason>('other');

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">通報理由を選択</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">×</button>
        </div>

        <div className="space-y-3 mb-6">
          {(Object.keys(REASONS) as ReportReason[]).map(reason => (
            <label key={reason} className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={selected === reason}
                onChange={() => setSelected(reason)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium text-sm">{REASONS[reason]}</div>
                {reason === 'illegal' && <div className="text-xs text-gray-500 mt-1">24時間以内に法執行機関へ通報</div>}
                {reason === 'copyright' && <div className="text-xs text-gray-500 mt-1">DMCA手続きに従い対応</div>}
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-full border font-semibold">
            キャンセル
          </button>
          <button onClick={handleSubmit} className="flex-1 py-3 rounded-full bg-red-600 text-white font-semibold">
            通報する
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          虚偽の通報は利用規約違反となります
        </p>
      </div>
    </div>
  );
}
