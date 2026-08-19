export const COURSE = {
  id: 'ae-short-course',
  title: 'ショート動画クリエイターのための\nAfter Effects Course',
  subtitle: '半年後、作れる映像を変える。',
  instructor: '高橋 健太',
  school: '高橋帝国',
  totalModules: 14,
};

// 各レッスンの videoType: 'youtube' | 'mp4' | 'vimeo'
// videoId / videoUrl は実際の素材URLを入れてください
export const MODULES = [
  {
    id: 'mod-00',
    number: '00',
    title: 'はじめに',
    description: 'この講座のゴール、完成作品を先に見る、配布ファイルの使い方、学習の進め方。',
    lessons: [
      { id: 'les-00-01', title: 'この講座のゴールと完成作品', duration: '8:30', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: true },
      { id: 'les-00-02', title: '配布ファイルの使い方', duration: '5:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-00-03', title: '学習の進め方・環境準備', duration: '6:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-01',
    number: '01',
    title: 'AEの全体構造を怖がらずに理解する',
    description: 'コンポ・レイヤー・プリコンポーズ・親子関係・調整レイヤーを、作品制作に必要な範囲で。',
    lessons: [
      { id: 'les-01-01', title: 'コンポジションとレイヤーの概念', duration: '12:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-01-02', title: 'プリコンポーズと親子関係', duration: '10:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-01-03', title: '調整レイヤーの使い方', duration: '8:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-02',
    number: '02',
    title: 'ショート動画の設計',
    description: '冒頭1秒の役割、視線誘導、情報の優先順位、余白、音との同期。AEを触る前に設計する。',
    lessons: [
      { id: 'les-02-01', title: '冒頭1秒で掴む設計', duration: '14:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-02-02', title: '視線誘導と情報の優先順位', duration: '11:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-02-03', title: '音との同期を設計する', duration: '9:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-03',
    number: '03',
    title: 'キーフレームとグラフエディター',
    description: 'イージング、入りと抜き、オーバーシュート、余韻。安っぽい動きとプロっぽい動きの違い。',
    lessons: [
      { id: 'les-03-01', title: 'キーフレームの基本とイージング', duration: '15:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-03-02', title: 'グラフエディターをマスターする', duration: '18:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-03-03', title: 'オーバーシュートと余韻', duration: '10:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-04',
    number: '04',
    title: '文字とテロップの見せ方',
    description: '読ませる文字と見せる文字、コントラスト、テキストアニメーター、マスク／トラックマット。',
    lessons: [
      { id: 'les-04-01', title: '読ませる文字と見せる文字', duration: '12:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-04-02', title: 'テキストアニメーターの使い方', duration: '16:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-04-03', title: 'マスクとトラックマット', duration: '13:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-05',
    number: '05',
    title: 'Shape Layerで画面を設計する',
    description: 'Trim Paths・Repeater・Merge Paths。図形を装飾ではなく情報整理に使う。',
    lessons: [
      { id: 'les-05-01', title: 'Trim Pathsで線を描く', duration: '11:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-05-02', title: 'RepeaterとMerge Paths', duration: '14:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-05-03', title: '情報整理としてのShape Layer', duration: '10:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-06',
    number: '06',
    title: '質感を作るエフェクト',
    description: 'Glow・各種Blur・Fractal Noise・Displacement・Curves・Lumetri。盛りすぎず、目的から逆算。',
    lessons: [
      { id: 'les-06-01', title: 'GlowとBlurの使い方', duration: '13:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-06-02', title: 'Fractal NoiseとDisplacement', duration: '15:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-06-03', title: 'CurvesとLumetriでカラーグレーディング', duration: '14:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-07',
    number: '07',
    title: 'トランジションとカットのつなぎ',
    description: 'スケール／ブラー／マスクワイプ／グリッチ／カメラシェイク。テンポと音ハメ。',
    lessons: [
      { id: 'les-07-01', title: 'スケール・ブラートランジション', duration: '12:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-07-02', title: 'グリッチとカメラシェイク', duration: '14:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-07-03', title: '音ハメとテンポの設計', duration: '11:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-08',
    number: '08',
    title: '奥行きとカメラ',
    description: '3Dレイヤー・カメラ・被写界深度・パララックス。平面の素材に立体感をつける。',
    lessons: [
      { id: 'les-08-01', title: '3Dレイヤーとカメラの設定', duration: '16:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-08-02', title: '被写界深度でシネマティックに', duration: '12:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-08-03', title: 'パララックスで立体感を出す', duration: '10:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-09',
    number: '09',
    title: 'AI素材をAEで仕上げる',
    description: '色合わせ・粒子感・光・スキャンライン・テロップ後乗せ。素材を作品に近づける。',
    lessons: [
      { id: 'les-09-01', title: 'AI素材の色合わせ・粒子感', duration: '14:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-09-02', title: '光とスキャンラインで質感を足す', duration: '12:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-09-03', title: 'テロップを後乗せして完成させる', duration: '10:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-10',
    number: '10',
    title: 'Expression入門',
    description: 'wiggle / time / loopOut / valueAtTime / Slider Control。怖がらず、作業を効率化する。',
    lessons: [
      { id: 'les-10-01', title: 'wiggleとtimeの基本', duration: '13:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-10-02', title: 'loopOutとvalueAtTime', duration: '11:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-10-03', title: 'Slider Controlで効率化', duration: '9:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-11',
    number: '11',
    title: '音、テンポ、間',
    description: '音ハメ、効果音、無音の使い方、停止時間。テンポだけでなく「間」を設計する。',
    lessons: [
      { id: 'les-11-01', title: '音ハメの技術', duration: '12:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-11-02', title: '効果音と無音の設計', duration: '10:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-11-03', title: '「間」を計算して設計する', duration: '11:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-12',
    number: '12',
    title: '案件で使う制作フロー',
    description: 'ヒアリング、素材整理、命名、修正に耐える構成、書き出し、SNS別の注意点。',
    lessons: [
      { id: 'les-12-01', title: 'ヒアリングと素材整理', duration: '11:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-12-02', title: '命名と修正に耐える構成', duration: '13:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-12-03', title: '書き出しとSNS別注意点', duration: '10:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
  {
    id: 'mod-13',
    number: '13',
    title: '総合制作',
    description: '構成からストーリーボード、仕上げ、書き出し、セルフレビューまで一本を作り切る。',
    lessons: [
      { id: 'les-13-01', title: '構成とストーリーボード', duration: '15:00', videoType: 'youtube', videoId: 'REPLACE_YOUTUBE_ID', free: false },
      { id: 'les-13-02', title: '制作パート：組み立てる', duration: '28:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
      { id: 'les-13-03', title: '仕上げ・書き出し・セルフレビュー', duration: '20:00', videoType: 'mp4', videoUrl: 'REPLACE_MP4_URL', free: false },
    ],
  },
];
