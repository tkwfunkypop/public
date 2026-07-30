import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// パネルはCDN画像。読み込みに時間がかかる回線では下げる
Config.setDelayRenderTimeoutInMilliseconds(60000);
