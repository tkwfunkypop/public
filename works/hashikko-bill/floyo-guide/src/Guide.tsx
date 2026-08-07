import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Series,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import slides from './slides.json';

const SERIF = "'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', 'Noto Serif CJK JP', serif";
const SANS = "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', 'Noto Sans CJK JP', sans-serif";
const INK = '#151320';
const PAPER = '#e8e6df';
const ORANGE = '#E8A13C';
const RED = '#C2493C';

type Slide = (typeof slides)[number];

const Chip: React.FC<{n?: string; children: React.ReactNode; on?: boolean}> = ({n, children, on}) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: on ? ORANGE : 'rgba(232,230,223,0.08)',
      color: on ? INK : PAPER,
      border: `1px solid ${on ? ORANGE : 'rgba(232,230,223,0.35)'}`,
      borderRadius: 10, padding: '14px 22px', fontFamily: SANS, fontSize: 27, fontWeight: 600,
    }}
  >
    {n ? <span style={{fontSize: 21, opacity: 0.75}}>{n}</span> : null}
    {children}
  </div>
);

const Frame: React.FC<{title: string; sub?: string; children: React.ReactNode}> = ({title, sub, children}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const y = interpolate(frame, [0, 10], [16, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: INK, color: PAPER, opacity: op}}>
      <div style={{position: 'absolute', top: 54, left: 80, right: 80, transform: `translateY(${y}px)`}}>
        <div style={{fontFamily: SERIF, fontSize: 54, letterSpacing: 2}}>{title}</div>
        {sub ? <div style={{fontFamily: SANS, fontSize: 26, opacity: 0.7, marginTop: 10}}>{sub}</div> : null}
        <div style={{height: 3, width: 130, background: RED, marginTop: 18}} />
      </div>
      <div style={{position: 'absolute', top: 215, left: 80, right: 80, bottom: 60}}>{children}</div>
    </AbsoluteFill>
  );
};

const Pic: React.FC<{src: string; label: string; w?: number; h?: number}> = ({src, label, w = 390, h = 300}) => (
  <div style={{width: w, fontFamily: SANS}}>
    <div style={{width: w, height: h, background: '#0b0b12', borderRadius: 8, overflow: 'hidden',
      border: '1px solid rgba(232,230,223,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
    <div style={{fontSize: 21, opacity: 0.8, marginTop: 8, textAlign: 'center'}}>{label}</div>
  </div>
);

const Arrow: React.FC = () => (
  <div style={{fontSize: 52, color: ORANGE, alignSelf: 'center', fontFamily: SANS}}>→</div>
);

const Node: React.FC<{children: React.ReactNode; accent?: boolean}> = ({children, accent}) => (
  <div style={{
    background: accent ? RED : 'rgba(232,230,223,0.1)', color: PAPER,
    border: `1.5px solid ${accent ? RED : 'rgba(232,230,223,0.45)'}`,
    borderRadius: 10, padding: '16px 20px', fontFamily: SANS, fontSize: 25,
    fontWeight: 600, textAlign: 'center', lineHeight: 1.4,
  }}>{children}</div>
);

const STEPS = ['素材を揃える', '開始フレーム', 'Floyoで動かす', '二コマ打ち', '検品', '台帳に記録'];

const SlideView: React.FC<{s: Slide}> = ({s}) => {
  switch (s.id) {
    case 'title':
      return (
        <AbsoluteFill style={{backgroundColor: INK, color: PAPER}}>
          <Img src={s.imgs![0]} style={{position: 'absolute', right: 0, top: 0, height: '100%', opacity: 0.55}} />
          <div style={{position: 'absolute', left: 90, top: 320, maxWidth: 900}}>
            <div style={{fontFamily: SERIF, fontSize: 84, lineHeight: 1.3}}>Floyoでの作り方</div>
            <div style={{fontFamily: SANS, fontSize: 32, opacity: 0.85, marginTop: 26}}>
              はしっこビルの明日づくり — 本番カット制作フロー
            </div>
            <div style={{fontFamily: SANS, fontSize: 25, color: ORANGE, marginTop: 14}}>
              workflow: hashikko-i2v-stopmotion
            </div>
          </div>
        </AbsoluteFill>
      );
    case 'flow':
      return (
        <Frame title="全体の流れ" sub="6ステップ。順番を変えない">
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 22, maxWidth: 1500, marginTop: 30}}>
            {STEPS.map((t, i) => (
              <Chip key={t} n={`STEP ${i + 1}`} on={false}>{t}</Chip>
            ))}
          </div>
          <div style={{fontFamily: SANS, fontSize: 26, opacity: 0.75, marginTop: 60, lineHeight: 1.9}}>
            設計の正 = CHARACTER BIBLE（CORE／EMBERシート02〜06）<br />
            尺の正 = 動画コンテ（78カット・299秒）　／　台帳 = generated.json
          </div>
        </Frame>
      );
    case 'assets':
      return (
        <Frame title="STEP 1 — 素材を揃える" sub="すべて generated.json のURLが正">
          <div style={{display: 'flex', gap: 30}}>
            {s.imgs!.map((u, i) => (
              <Pic key={u} src={u} label={['01 CORE（設計の正）', '承認済み図版', 'EMBERシート（プロップ・所作）', '絵コンテ（構図の正）'][i]} />
            ))}
          </div>
          <div style={{marginTop: 44, fontFamily: 'monospace', fontSize: 30, background: '#0b0b12',
            border: '1px solid rgba(232,230,223,0.3)', borderRadius: 8, padding: '18px 26px', width: 'fit-content'}}>
            $ node fetch-assets.mjs　<span style={{opacity: 0.6, fontFamily: SANS, fontSize: 24}}># assets/ に一括取得</span>
          </div>
        </Frame>
      );
    case 'startframe':
      return (
        <Frame title="STEP 2 — 開始フレームを作る" sub="鉛筆パネルではなく、正典準拠スチルから">
          <div style={{display: 'flex', gap: 26, alignItems: 'flex-start'}}>
            <Pic src={s.imgs![0]} label="第1参照：承認済み図版" w={360} h={280} />
            <div style={{fontSize: 46, color: ORANGE, alignSelf: 'center'}}>＋</div>
            <Pic src={s.imgs![1]} label="第2参照：CORE" w={360} h={280} />
            <div style={{fontSize: 46, color: ORANGE, alignSelf: 'center'}}>＋</div>
            <div style={{alignSelf: 'center', fontFamily: SANS, fontSize: 26, background: 'rgba(232,230,223,0.08)',
              border: '1px dashed rgba(232,230,223,0.5)', borderRadius: 10, padding: '20px 24px', width: 330, lineHeight: 1.7}}>
              顔の要点を<b>1行だけ</b>言語化<br />
              <span style={{opacity: 0.7, fontSize: 22}}>例：白目にワイン虹彩、口なし</span>
            </div>
            <Arrow />
            <Pic src={s.imgs![2]} label="開始フレーム（CANON準拠）" w={360} h={280} />
          </div>
          <div style={{marginTop: 40, fontFamily: SANS, fontSize: 25, color: ORANGE}}>
            ※ ビル外観カットは外形CANON承認後に着手（building/WORLD_REFERENCE.md）
          </div>
        </Frame>
      );
    case 'graph':
      return (
        <Frame title="STEP 3 — Floyoグラフ（この1本だけ）" sub="wfaia/floyo-workflow.md のとおりに組む">
          <div style={{display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', maxWidth: 1760}}>
            <Node>Load Image<br /><span style={{fontWeight: 400, fontSize: 21}}>開始フレーム</span></Node>
            <Arrow />
            <Node>Resize / Pad<br /><span style={{fontWeight: 400, fontSize: 21}}>16:9 に整える</span></Node>
            <Arrow />
            <Node accent>Image → Video<br /><span style={{fontWeight: 400, fontSize: 21}}>Kling / Wan・5秒</span></Node>
            <Arrow />
            <Node>2コマ打ち化<br /><span style={{fontWeight: 400, fontSize: 21}}>12fps相当</span></Node>
            <Arrow />
            <Node>Film Grain<br /><span style={{fontWeight: 400, fontSize: 21}}>弱〜中</span></Node>
            <Arrow />
            <Node>書き出し<br /><span style={{fontWeight: 400, fontSize: 21}}>ProRes / 高bps</span></Node>
          </div>
          <div style={{marginTop: 46, display: 'flex', gap: 26}}>
            <div style={{flex: 1, fontFamily: SANS, fontSize: 23, background: 'rgba(232,161,60,0.12)',
              border: `1px solid ${ORANGE}`, borderRadius: 10, padding: '18px 24px', lineHeight: 1.7}}>
              <b style={{color: ORANGE}}>共通サフィックス（毎回後置）</b><br />
              stop-motion puppet, shot on twos, felt &amp; fabric texture,
              miniature set lighting, film grain… <b>keep the exact puppet design</b>
            </div>
            <div style={{flex: 1, fontFamily: SANS, fontSize: 23, background: 'rgba(194,73,60,0.12)',
              border: `1px solid ${RED}`, borderRadius: 10, padding: '18px 24px', lineHeight: 1.7}}>
              <b style={{color: RED}}>negative（毎回）</b><br />
              morphing / redesign / <b>extra facial features</b> / text / watermark
            </div>
          </div>
        </Frame>
      );
    case 'twos':
      return (
        <Frame title="STEP 4 — 二コマ打ち＋グレイン" sub="ストップモーションの質感はこの2つで決まる">
          <div style={{display: 'flex', gap: 8, marginTop: 20}}>
            {['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F'].map((c, i) => (
              <div key={i} style={{width: 130, height: 96, borderRadius: 6, fontFamily: SANS,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 700,
                background: i % 4 < 2 ? 'rgba(232,161,60,0.25)' : 'rgba(232,230,223,0.1)',
                border: '1px solid rgba(232,230,223,0.35)', color: PAPER}}>{c}</div>
            ))}
          </div>
          <div style={{fontFamily: SANS, fontSize: 25, opacity: 0.8, marginTop: 16}}>
            24fps出力 → 偶数フレームを間引き、各フレームを2連持続（＝12fps相当の「2コマ打ち」）
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 46}}>
            <Chip on>Select Every Nth Frame → Frame Duplicate（または fps=12 で出力）</Chip>
            <Chip>Film Grain：弱〜中 — 既存スチルの粒子感に合わせる</Chip>
          </div>
        </Frame>
      );
    case 'runs':
      return (
        <Frame title="STEP 5 — ラン運用" sub="ラン履歴 ＝ 制作ログ ＝ WFAIAプロセス評価の提出物">
          <div style={{display: 'flex', flexDirection: 'column', gap: 20, marginTop: 10}}>
            <Chip on>1ショット ＝ 1ラン</Chip>
            <Chip>ラン名 ＝ ショットID（例：<span style={{fontFamily: 'monospace'}}>a02_hiiragi</span> / <span style={{fontFamily: 'monospace'}}>sb14_hikari</span>）</Chip>
            <Chip>リテイク ＝ ランを複製して <b>seed だけ</b>変える</Chip>
            <Chip>OKカットのみ generated.json に追記（ラン名・URL・使用参照）</Chip>
          </div>
        </Frame>
      );
    case 'faces':
      return (
        <Frame title="STEP 6 — 検品（最重要）" sub="I2Vは顔を「補完」しがち — 1フレーム目をCOREと突合">
          <div style={{display: 'flex', gap: 24}}>
            {s.imgs!.map((u, i) => (
              <Pic key={u} src={u} label={['大和：口なし', '雲井：黒点2・口なし', '李：顔なし', 'トメ：ほぼ無地', '鵜飼家：縫い目の口'][i]} w={310} h={310} />
            ))}
          </div>
          <div style={{marginTop: 40, fontFamily: SANS, fontSize: 34, color: RED, fontWeight: 700}}>
            ✕ 顔にパーツを足させない（口・鼻・眉の自動追加は即リテイク）
          </div>
        </Frame>
      );
    case 'outro':
      return (
        <Frame title="仕上げと開始点" sub="">
          <div style={{display: 'flex', gap: 40, alignItems: 'flex-start'}}>
            <Pic src={s.imgs![0]} label="尺の正：動画コンテ（299秒）" w={620} h={349} />
            <div style={{fontFamily: SANS, fontSize: 29, lineHeight: 2.1, marginTop: 8}}>
              ・音は仮アフレコwav（narration_audio）をそのまま編集へ<br />
              ・最初のラン：<b style={{color: ORANGE}}>wfaia/anime-shots.json・ad-shots.json</b><br />
              ・迷ったら <b>FLOYO_MIGRATION.md</b> と <b>floyo-workflow.md</b>
            </div>
          </div>
        </Frame>
      );
    default:
      return null;
  }
};

export const Guide: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      <Series>
        {slides.map((s) => (
          <Series.Sequence key={s.id} durationInFrames={Math.round(s.durSec * fps)}>
            <SlideView s={s} />
            {s.audio ? <Audio src={s.audio} /> : null}
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
