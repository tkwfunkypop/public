import React from 'react';
import {
  AbsoluteFill,
  Img,
  Series,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import data from './cuts.json';

const SERIF = "'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif";
const SANS = "'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif";

type Cut = (typeof data.cuts)[number];

const pad = (n: number) => String(n).padStart(2, '0');
const timecode = (sec: number) => `${pad(Math.floor(sec / 60))}:${pad(Math.floor(sec % 60))}`;

const CutView: React.FC<{cut: Cut; frames: number; startSec: number}> = ({
  cut,
  frames,
  startSec,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // わずかなプッシュインで静止画に呼吸を与える
  const scale = interpolate(frame, [0, frames], [1, 1.03]);

  return (
    <AbsoluteFill style={{backgroundColor: '#0b0b12', opacity: fadeIn}}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Img
          src={cut.url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${scale})`,
          }}
        />
      </AbsoluteFill>

      {/* 上部インフォバー */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '18px 28px',
          background: 'linear-gradient(rgba(11,11,18,0.85), rgba(11,11,18,0))',
          color: '#e8e6df',
          fontFamily: SANS,
        }}
      >
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <span style={{fontSize: 34, fontWeight: 700, letterSpacing: 2}}>
            C{pad(cut.no)}
          </span>
          <span style={{fontSize: 22, opacity: 0.9}}>
            {cut.seq}｜{cut.seqTitle}
          </span>
          <span
            style={{
              fontSize: 18,
              border: '1px solid rgba(232,230,223,0.6)',
              borderRadius: 4,
              padding: '1px 10px',
            }}
          >
            {cut.size}
          </span>
          <span style={{fontSize: 18, opacity: 0.8}}>
            {cut.sec}s（{timecode(startSec)}–{timecode(startSec + cut.sec)}）
          </span>
        </div>
        <div style={{fontSize: 19, opacity: 0.85, marginTop: 8, maxWidth: 1500}}>
          {cut.action}
        </div>
        {cut.note ? (
          <div style={{fontSize: 16, opacity: 0.6, marginTop: 4, maxWidth: 1500}}>
            ※ {cut.note}
          </div>
        ) : null}
      </div>

      {/* セリフ（字幕） */}
      {cut.dialogue ? (
        <div
          style={{
            position: 'absolute',
            bottom: 64,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: SERIF,
            fontSize: 40,
            color: '#ffffff',
            textShadow:
              '0 0 6px rgba(0,0,0,0.9), 0 0 14px rgba(0,0,0,0.8), 0 2px 3px rgba(0,0,0,0.9)',
            padding: '0 120px',
            opacity: interpolate(frame, [3, 10], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {cut.dialogue}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Animatic: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  let acc = 0;
  const timeline = data.cuts.map((cut) => {
    const startSec = acc;
    acc += cut.sec;
    return {cut, startSec, frames: Math.round(cut.sec * fps)};
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#0b0b12'}}>
      <Series>
        {timeline.map(({cut, startSec, frames}) => (
          <Series.Sequence key={cut.panel} durationInFrames={frames}>
            <CutView cut={cut} frames={frames} startSec={startSec} />
          </Series.Sequence>
        ))}
      </Series>

      {/* 全体プログレスバーとタイムコード */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'rgba(232,230,223,0.15)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${(frame / durationInFrames) * 100}%`,
            background: '#C2493C',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          right: 20,
          fontFamily: SANS,
          fontSize: 18,
          color: 'rgba(232,230,223,0.75)',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        }}
      >
        {timecode(frame / fps)} / {timecode(data.totalSec)}
      </div>
    </AbsoluteFill>
  );
};
