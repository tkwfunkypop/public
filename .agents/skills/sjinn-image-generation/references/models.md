# SJinn Image Models

Use these public model names with `sjinn image generate --model`.

| Model | Best for | Supported options and values |
| --- | --- | --- |
| `gpt-image-2` | General image generation and edits | `--prompt`, `--image`; `--aspect` `auto`, `1:1`, `16:9`, `9:16`, `3:2`, `2:3` |
| `nano-banana` | Fast image generation and variations | `--prompt`, `--image`; `--aspect` `auto`, `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `9:21`, `21:9`, `2:3`, `3:2` |
| `nano-banana-pro` | Higher quality image generation | `--prompt`, `--image`; `--aspect` same as `nano-banana`; `--resolution` `1K`, `2K` |
| `nano-banana-2` | Higher resolution image generation | `--prompt`, `--image`; `--aspect` same as `nano-banana`; `--resolution` `1K`, `2K`, `4K` |
| `seedream` | Stylized image generation | `--prompt`, `--image`; `--aspect` `16:9`, `9:16`, `1:1`, `4:3`, `3:2`, `2:3`, `3:4` |
| `seedream-v4` | Image generation and edits | `--prompt`, `--image`; `--aspect` `16:9`, `9:16`, `1:1`, `4:3`, `3:2`, `2:3`, `3:4` |

## Common Options

- `--prompt <text>`: Required image description.
- `--image <paths-or-urls>`: Optional reference images. Local paths and HTTP(S) URLs are supported. Multiple values are comma-separated.
- `--aspect <ratio>`: Output aspect ratio. Use only values listed for the selected model.
- `--resolution <res>`: Supported by `nano-banana-pro` (`1K`, `2K`) and `nano-banana-2` (`1K`, `2K`, `4K`).
- `--async`: Return a task ID without waiting.
- `--download [path]`: Download the result when complete.
- `--json`: Emit machine-readable output.
