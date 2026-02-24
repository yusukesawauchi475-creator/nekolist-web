-- YC デモ用: listings サンプルデータ（Supabase SQL Editor に貼って実行）
-- contact_email は demo@nacho.city で統一。画像は null。日本語UI向け。
-- id / created_at はテーブルの DEFAULT に任せる。owner_id がある場合は NOT NULL でなければ省略可。

INSERT INTO listings (
  city,
  cat,
  title,
  summary,
  excerpt,
  price,
  area,
  thumb,
  contact_email,
  status,
  visible
) VALUES
-- NYC（3件）
('nyc', 'home', 'マンハッタンでルームシェア募集中', '駅徒歩5分、清潔なアパートでルームメイトを募集しています。', '駅徒歩5分、清潔なアパートでルームメイトを募集しています。', '$1,200/月', 'Manhattan', NULL, 'demo@nacho.city', 'active', true),
('nyc', 'job', 'カフェのパートスタッフ募集', '週2〜3日からOK。英語話せなくても大丈夫です。', '週2〜3日からOK。英語話せなくても大丈夫です。', NULL, 'Brooklyn', NULL, 'demo@nacho.city', 'active', true),
('nyc', 'service', '引っ越し・荷物の運搬手伝います', '軽トラック持っています。市内・近郊なら対応可能です。', '軽トラック持っています。市内・近郊なら対応可能です。', '$50〜', 'Queens', NULL, 'demo@nacho.city', 'active', true),
-- LA（3件）
('la', 'sell', '自転車ゆずります', 'ほぼ新品のママチャリ。鍵付き。West LA で手渡し可能。', 'ほぼ新品のママチャリ。鍵付き。West LA で手渡し可能。', '$80', 'West LA', NULL, 'demo@nacho.city', 'active', true),
('la', 'service', '日本語でベビーシッター', '土日対応可。経験2年。Downtown 周辺でお迎え可能。', '土日対応可。経験2年。Downtown 周辺でお迎え可能。', '$25/時間', 'Downtown', NULL, 'demo@nacho.city', 'active', true),
('la', 'job', '日本食レストラン キッチンスタッフ', '調理補助・盛り付け。未経験OK、研修あり。', '調理補助・盛り付け。未経験OK、研修あり。', NULL, 'South Bay', NULL, 'demo@nacho.city', 'active', true),
-- LDN（3件）
('ldn', 'buy', '日本語の教科書を探しています', '中級向けの「みんなの日本語」または同等の教材。良い状態のものでお願いします。', '中級向けの「みんなの日本語」または同等の教材。', NULL, 'Central', NULL, 'demo@nacho.city', 'active', true),
('ldn', 'study', '語学学校の情報共有・体験談', 'IELTS対策で通った学校の比較や、安く通うコツをシェアします。', 'IELTS対策で通った学校の比較や、安く通うコツをシェアします。', NULL, 'East', NULL, 'demo@nacho.city', 'active', true),
('ldn', 'home', 'East で1Kアパート空き', '駅近、家具付き。即入居可。保証人不要可相談。', '駅近、家具付き。即入居可。保証人不要可相談。', '£1,100/月', 'East', NULL, 'demo@nacho.city', 'active', true);
