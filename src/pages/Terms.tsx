export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-8">利用規約</h1>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. サービス概要</h2>
          <p className="text-gray-700 mb-4">
            NekoList（以下「本サービス」）は、NYC・LA・ロンドンを中心とした地域コミュニティ向けの掲示板プラットフォームです。
            ユーザー間の直接取引を仲介せず、情報掲載の場のみを提供します。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. 禁止事項</h2>
          <p className="text-gray-700 mb-2">以下の行為を厳格に禁止します：</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>違法物品の売買・勧誘（薬物、武器、偽造品等）</li>
            <li>性的サービスの勧誘・売買春関連投稿（FOSTA/SESTA準拠）</li>
            <li>差別的表現（人種・国籍・宗教・性別・障害等に基づく）</li>
            <li>著作権・商標権・肖像権の侵害</li>
            <li>詐欺・マルチ商法・ネズミ講</li>
            <li>個人情報の無断公開・ストーキング</li>
            <li>18歳未満の利用</li>
            <li>その他法令・公序良俗に反する行為</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">3. 投稿内容の責任</h2>
          <p className="text-gray-700 mb-4">
            投稿内容の正確性・合法性は投稿者が全責任を負います。本サービスは投稿内容を保証せず、
            ユーザー間トラブルについて一切の責任を負いません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">4. 住宅・求人広告の遵守事項</h2>
          <p className="text-gray-700 mb-4">
            <strong>住宅広告：</strong> Fair Housing Act準拠。人種・宗教・国籍・性別・家族構成・障害を理由とした差別的表現を禁止します。
          </p>
          <p className="text-gray-700 mb-4">
            <strong>求人広告：</strong> EEOC準拠。国籍・出自・年齢・性別等での差別的募集を禁止します。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">5. 著作権侵害への対応（DMCA）</h2>
          <p className="text-gray-700 mb-4">
            DMCA §512に基づき、著作権侵害の通知を受理します。通知先：<br/>
            <strong>dmca@nekolist.com</strong>（準備中）
          </p>
          <p className="text-gray-700 mb-4">
            繰り返し侵害者のアカウントは停止します。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">6. 投稿の削除・アカウント停止</h2>
          <p className="text-gray-700 mb-4">
            本サービスは、違反投稿を予告なく削除し、アカウントを停止する権利を有します。
            通報受理後24時間以内に初動対応を実施します。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">7. 免責事項</h2>
          <p className="text-gray-700 mb-4">
            本サービスは「現状有姿」で提供され、可用性・正確性を保証しません。
            ユーザー間取引によるトラブル・損害について一切の責任を負いません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">8. 準拠法・管轄</h2>
          <p className="text-gray-700 mb-4">
            本規約は米国カリフォルニア州法に準拠します。紛争はカリフォルニア州裁判所を専属管轄とします。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">9. 規約の変更</h2>
          <p className="text-gray-700 mb-4">
            本規約は予告なく変更される場合があります。継続利用をもって変更への同意とみなします。
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-12">最終更新：2025年10月27日</p>
      </div>
    </div>
  );
}
