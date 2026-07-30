import React from 'react';
import {Composition} from 'remotion';
import {Guide} from './Guide';
import slides from './slides.json';

const FPS = 30;
const total = slides.reduce((a, s) => a + Math.round(s.durSec * FPS), 0);

export const RemotionRoot: React.FC = () => (
  <Composition id="Guide" component={Guide} durationInFrames={total} fps={FPS} width={1920} height={1080} />
);
