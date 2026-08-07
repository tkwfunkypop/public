# SJinn Video Models

Use these public model names with `sjinn video generate --model`.

| Model | Best for | Supported options and values |
| --- | --- | --- |
| `veo3` | General text-to-video and image-to-video | `--prompt`, `--image`; `--aspect` `16:9`, `9:16`; `--end-image` for image-to-video |
| `gemini-omni-video` | Full-modality video with reference images and audio-native output | `--prompt`, `--image-urls` up to 7 reference images, `--video-urls` at most 1 reference video; `--aspect` `16:9`, `9:16`; `--duration` `4`, `6`, `8`, `10` |
| `grok` | Flexible short video generation | `--prompt`, `--image`; `--aspect` `16:9`, `9:16`, `1:1`; `--duration` 3-15 seconds |
| `kling3` | Image animation and controlled video | `--prompt`, `--image`; text-to-video `--aspect` `16:9`, `9:16`, `1:1`; `--duration` 3-15 seconds; `--mode` `standard`, `pro`; `--multi-shot` `true`, `false`; `--end-image` for image-to-video |
| `seedance2` | Multi-reference video generation | `--prompt`, `--image`, `--media-urls` up to 9 total image/video/audio reference paths or URLs; `--aspect` `16:9`, `9:16`, `1:1`, `4:3`, `3:4`; `--duration` 4-15 seconds; `--mode` `pro`, `fast`; `--resolution` `480p`, `720p`, `1080p` |

## Common Options

- `--prompt <text>`: Required video description.
- `--image <path-or-url>`: Optional starting image. Local paths and URLs are supported.
- `--end-image <path-or-url>`: Optional end frame for `veo3` and `kling3` image-to-video.
- `--duration <seconds>`: Video duration. Use only values or ranges listed for the selected model.
- `--aspect <ratio>`: Output aspect ratio. Use only values listed for the selected model.
- `--mode <mode>`: Model quality or speed mode. Use only values listed for the selected model.
- `--resolution <res>`: Output resolution for `seedance2`.
- `--media-urls <paths-or-urls>`: Comma-separated image, video, or audio reference paths or URLs for `seedance2`, up to 9 total items across all media types. Supported local extensions are `.jpg`, `.jpeg`, `.png`, `.webp`, `.mp4`, `.mov`, `.mp3`, `.m4a`, and `.wav`. Requires `@sjinn-build/cli` 0.1.15 or newer. For `seedance2`, use either `--image` or `--media-urls`; put all multi-reference inputs in `--media-urls`.
- `--image-urls <paths-or-urls>`: Comma-separated reference images for `gemini-omni-video`, up to 7 total. Local `.jpg`, `.jpeg`, `.png`, `.webp` are uploaded automatically; a single `--image` is merged into this set.
- `--video-urls <paths-or-urls>`: Reference video for `gemini-omni-video`, at most 1 (`.mp4`, `.mov`).
- `--multi-shot <true|false>`: Multi-shot mode for `kling3`.
- `--async`: Return a task ID without waiting.
- `--download [path]`: Download the result when complete.
- `--json`: Emit machine-readable output.
