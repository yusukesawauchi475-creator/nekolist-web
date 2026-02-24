/**
 * ランダムな名前のリスト（「ユー」地獄からの脱却用）
 */
const RANDOM_NAMES = [
  'タナカ', 'サトウ', 'ヤマダ', 'スズキ', 'ワタナベ',
  'イトウ', 'ナカムラ', 'コバヤシ', 'カトウ', 'ヨシダ',
  'Yoshi', 'Mika', 'Hiro', 'Emi', 'Ken',
  'Saki', 'Taro', 'Yuki', 'Ryo', 'Nao',
  'ケン', 'ユキ', 'リョウ', 'ナオ', 'サキ',
  'トモ', 'マリ', 'タカシ', 'アキ', 'ヨウコ',
  'タクヤ', 'アヤカ', 'ダイキ', 'ミユキ', 'ショウタ',
  'リカ', 'ユウタ', 'ミナミ', 'カズキ', 'アオイ'
];

/**
 * 文字列からハッシュ値を生成してランダムな名前を選択
 */
function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * ユーザーのIDまたはemailからランダムな名前を取得
 */
export function getRandomName(userId: string): string {
  const hash = getHash(userId);
  const index = hash % RANDOM_NAMES.length;
  return RANDOM_NAMES[index];
}

/**
 * 名前が有効かチェック（2文字以上、かつ「ユー」「ゲス」などでない）
 */
export function isValidName(name: string | null | undefined): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  const invalidNames = [
    'ユー', 'ユーザー', 'ユーザ', 
    'ゲスト', 'ゲス', 
    '名無し', '名無',
    '未設定', '未',
    'ニックネーム未設定'
  ];
  if (invalidNames.includes(trimmed)) return false;
  if (trimmed.startsWith('ユー') || trimmed.startsWith('ゲス')) return false;
  return true;
}

/**
 * 名前を正規化（無効な場合はランダムな名前を返す）
 * 「ユー」「ゲス」「ゲスト」などの不自然な名前を除外
 */
export function normalizeName(name: string | null | undefined, fallbackId?: string): string {
  if (isValidName(name)) {
    return name.trim();
  }
  
  if (fallbackId) {
    return getRandomName(fallbackId);
  }
  
  return getRandomName('default-user-' + Math.random().toString(36).substring(7));
}
