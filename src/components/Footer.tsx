export function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
        <div className="flex justify-center gap-6 mb-3">
          <a href="/terms" className="hover:underline">利用規約</a>
          <a href="/privacy" className="hover:underline">プライバシーポリシー</a>
          <a href="/help" className="hover:underline">ヘルプ</a>
        </div>
        <p className="mb-1">© 2024 NekoList. All rights reserved.</p>
        <p className="text-xs text-gray-500">18歳未満禁止 | アダルトコンテンツ禁止 | 位置情報は都市レベルのみ使用</p>
      </div>
    </footer>
  );
}
