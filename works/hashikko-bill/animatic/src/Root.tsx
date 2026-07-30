import React from 'react';
import {Composition} from 'remotion';
import {Animatic} from './Animatic';
import data from './cuts.json';

const FPS = data.fps;
const totalFrames = data.cuts.reduce((a, c) => a + Math.round(c.sec * FPS), 0);

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Animatic"
      component={Animatic}
      durationInFrames={totalFrames}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
