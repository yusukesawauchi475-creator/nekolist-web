-- 「ユー」地獄からの脱却: 空の名前や「ユー」などの不自然な名前を持つプロフィールにランダムな名前を割り当て

-- ランダムな名前のリスト
WITH random_names AS (
  SELECT name FROM (VALUES
    ('タナカ'), ('サトウ'), ('ヤマダ'), ('スズキ'), ('ワタナベ'),
    ('イトウ'), ('ナカムラ'), ('コバヤシ'), ('カトウ'), ('ヨシダ'),
    ('Yoshi'), ('Mika'), ('Hiro'), ('Emi'), ('Ken'),
    ('Saki'), ('Taro'), ('Yuki'), ('Ryo'), ('Nao'),
    ('ケン'), ('ユキ'), ('リョウ'), ('ナオ'), ('サキ'),
    ('トモ'), ('マリ'), ('タカシ'), ('アキ'), ('ヨウコ')
  ) AS t(name)
),
-- ランダムな名前を生成する関数
random_name_function AS (
  SELECT name, row_number() OVER () as rn FROM random_names
)
-- プロフィールを更新（usernameまたはdisplay_nameが空、null、または1文字の場合）
UPDATE public.profiles
SET 
  username = COALESCE(
    (SELECT name FROM random_name_function 
     ORDER BY random() * (profiles.id::text)::bigint % (SELECT COUNT(*) FROM random_name_function) + 1 
     LIMIT 1),
    '名無しのナチョ'
  ),
  display_name = COALESCE(
    (SELECT name FROM random_name_function 
     ORDER BY random() * (profiles.id::text)::bigint % (SELECT COUNT(*) FROM random_name_function) + 1 
     LIMIT 1),
    '名無しのナチョ'
  )
WHERE 
  (username IS NULL OR username = '' OR length(trim(username)) < 2)
  OR (display_name IS NULL OR display_name = '' OR length(trim(display_name)) < 2)
  OR username = 'ユー'
  OR display_name = 'ユー'
  OR username = 'ユーザー'
  OR display_name = 'ユーザー';

-- より確実な方法: ハッシュベースでランダムな名前を割り当て
UPDATE public.profiles
SET 
  username = (
    SELECT name FROM (VALUES
      ('タナカ'), ('サトウ'), ('ヤマダ'), ('スズキ'), ('ワタナベ'),
      ('イトウ'), ('ナカムラ'), ('コバヤシ'), ('カトウ'), ('ヨシダ'),
      ('Yoshi'), ('Mika'), ('Hiro'), ('Emi'), ('Ken'),
      ('Saki'), ('Taro'), ('Yuki'), ('Ryo'), ('Nao'),
      ('ケン'), ('ユキ'), ('リョウ'), ('ナオ'), ('サキ'),
      ('トモ'), ('マリ'), ('タカシ'), ('アキ'), ('ヨウコ')
    ) AS names(name)
    ORDER BY abs(hashtext(profiles.id::text || names.name))
    LIMIT 1
  ),
  display_name = (
    SELECT name FROM (VALUES
      ('タナカ'), ('サトウ'), ('ヤマダ'), ('スズキ'), ('ワタナベ'),
      ('イトウ'), ('ナカムラ'), ('コバヤシ'), ('カトウ'), ('ヨシダ'),
      ('Yoshi'), ('Mika'), ('Hiro'), ('Emi'), ('Ken'),
      ('Saki'), ('Taro'), ('Yuki'), ('Ryo'), ('Nao'),
      ('ケン'), ('ユキ'), ('リョウ'), ('ナオ'), ('サキ'),
      ('トモ'), ('マリ'), ('タカシ'), ('アキ'), ('ヨウコ')
    ) AS names(name)
    ORDER BY abs(hashtext(profiles.id::text || names.name))
    LIMIT 1
  )
WHERE 
  (username IS NULL OR username = '' OR length(trim(username)) < 2)
  OR (display_name IS NULL OR display_name = '' OR length(trim(display_name)) < 2)
  OR username = 'ユー'
  OR display_name = 'ユー'
  OR username = 'ユーザー'
  OR display_name = 'ユーザー';
