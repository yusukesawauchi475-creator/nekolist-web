export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. 収集する情報</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>メールアドレス：</strong> ログイン・投稿・メッセージ送信に使用</li>
            <li><strong>投稿内容：</strong> タイトル・説明・画像・カテゴリ・価格・エリア</li>
            <li><strong>IPアドレス・デバイス情報：</strong> 不正利用防止・法執行対応</li>
            <li><strong>Cookie：</strong> ログイン状態維持</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. 情報の利用目的</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>サービス提供・機能改善</li>
            <li>不正利用・違反投稿の監視</li>
            <li>法執行機関への情報提供（法的義務）</li>
            <li>ユーザーサポート</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. 情報の共有</h2>
          <p className="text-gray-700 mb-4">
            以下の場合を除き、第三者に情報を提供しません：
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく開示要請（裁判所命令・捜査令状等）</li>
            <li>サービス提供に必要なインフラ事業者（Supabase・Vercel）</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. 画像のメタデータ</h2>
          <p className="text-gray-700 mb-4">
            アップロード画像のEXIF（位置情報・撮影日時等）は自動削除されます。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. データ保持期間</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>投稿：削除まで保持</li>
            <li>メッセージ：90日間</li>
            <li>ログ：180日間</li>
            <li>削除済み投稿のバックアップ：30日間（違反調査用）</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. ユーザーの権利（GDPR・CCPA）</h2>
          <p className="text-gray-700 mb-4">
            EU・カリフォルニア州居住者は以下の権利を有します：
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>個人データへのアクセス</li>
            <li>訂正・削除の請求</li>
            <li>処理の制限・異議申立て</li>
            <li>データポータビリティ</li>
          </ul>
          <p className="text-gray-700 mt-4">
            請求先：<strong>privacy@nekolist.com</strong>（準備中）
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. セキュリティ</h2>
          <p className="text-gray-700 mb-4">
            業界標準の暗号化・アクセス制御を実施していますが、完全な安全性は保証できません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. 子供のプライバシー</h2>
          <p className="text-gray-700 mb-4">
            18歳未満からの情報収集を意図していません。発覚次第削除します。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. ポリシーの変更</h2>
          <p className="text-gray-700 mb-4">
            変更時はサイト上で通知します。継続利用をもって同意とみなします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">10. お問い合わせ</h2>
          <p className="text-gray-700 mb-4">
            <strong>privacy@nekolist.com</strong>（準備中）
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-12">最終更新：2025年10月27日</p>
      </div>
    </div>
  );
}
