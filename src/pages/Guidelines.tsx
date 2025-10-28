export default function Guidelines() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-8">コミュニティガイドライン</h1>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🎯 NekoListの目的</h2>
          <p className="text-gray-700 mb-4">
            NekoListは、NYC・LA・ロンドンの日本語コミュニティが安全に情報交換できる場です。
            違法行為・差別・ハラスメントのない健全な環境を維持するため、以下のルールを遵守してください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">❌ 絶対禁止事項</h2>
          <div className="space-y-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h3 className="font-semibold text-red-800 mb-2">違法行為</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>薬物・武器・偽造品の売買</li>
                <li>性的サービスの勧誘（FOSTA/SESTA違反）</li>
                <li>マルチ商法・ネズミ講</li>
                <li>盗品の売買</li>
              </ul>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h3 className="font-semibold text-red-800 mb-2">差別・ハラスメント</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>人種・国籍・宗教・性別・障害に基づく差別的表現</li>
                <li>特定個人への誹謗中傷・脅迫</li>
                <li>ストーキング・執拗な連絡</li>
              </ul>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <h3 className="font-semibold text-red-800 mb-2">知的財産権侵害</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>他人の写真・文章の無断転載</li>
                <li>偽ブランド品の販売</li>
                <li>著作権・商標権の侵害</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">⚠️ 注意事項</h2>
          <div className="space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">住宅広告</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>「日本人のみ」「女性限定」等の差別的条件は違法</li>
                <li>Equal Housing Opportunity準拠</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">求人広告</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>国籍・年齢・性別での差別的募集は違法</li>
                <li>EEOC準拠</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">✅ 推奨事項</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>正確な情報を記載する</li>
            <li>丁寧な言葉遣いを心がける</li>
            <li>取引は公共の場で行う</li>
            <li>高額取引は身分確認を行う</li>
            <li>怪しい投稿は通報する</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🚨 違反時の対応</h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li><strong>警告：</strong> 初回軽微な違反</li>
            <li><strong>投稿削除：</strong> ガイドライン違反投稿</li>
            <li><strong>アカウント停止：</strong> 重大な違反・繰り返し違反</li>
            <li><strong>法執行機関への通報：</strong> 違法行為</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">📢 通報方法</h2>
          <p className="text-gray-700 mb-4">
            各投稿の「通報」ボタンから以下を選択：
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>違法行為</li>
            <li>差別的表現</li>
            <li>著作権侵害</li>
            <li>詐欺・スパム</li>
            <li>その他</li>
          </ul>
          <p className="text-gray-700 mt-4">
            24時間以内に初動対応を実施します。
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-12">最終更新：2025年10月27日</p>
      </div>
    </div>
  );
}
