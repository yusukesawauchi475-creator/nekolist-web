import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
        <div className="flex justify-center gap-6 mb-3">
          <Link to="/terms" className="hover:underline">利用規約</Link>
          <Link to="/privacy" className="hover:underline">プライバシーポリシー</Link>
          <Link to="/guidelines" className="hover:underline">コミュニティガイドライン</Link>
        </div>
        <p className="mb-1">© 2024 Nacho. All rights reserved.</p>
        <p className="text-xs text-gray-500">18歳未満禁止 | アダルトコンテンツ禁止 | 位置情報は都市レベルのみ使用</p>
      </div>
    </footer>
  );
}
