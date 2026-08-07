---
name: sjinn-audio-generation
description: Generate audio with SJinn using the official sjinn audio generate CLI command.
---

# SJinn Audio Generation

Use this skill when the user wants to create audio from text, optionally guided by reference audios or a reference image, through SJinn.

## Prerequisites

Before generating, quickly verify the CLI and login:

```bash
sjinn --version
sjinn auth whoami
```

If either command fails, use `sjinn-setup` first.

## Model and Parameters

Only one audio model is currently available:

**seed-audio-1-0** (Seed Audio 1.0 by ByteDance) - generates an `.mp3`.

| Parameter | Required | Support in seed-audio-1-0 |
| --- | --- | --- |
| `--prompt` | Yes | Text description of the audio. Cite reference audios as `@Audio1` / `@Audio2` / `@Audio3` in the order passed to `--audio-urls`. |
| `--audio-urls` | No | Up to **3** reference audio files or URLs (mp3, m4a, wav), comma-separated. Mutually exclusive with `--image-urls`. |
| `--image-urls` | No | A single reference image (jpg, jpeg, png, webp). Mutually exclusive with `--audio-urls`. |

Reference audios and a reference image cannot be used together.

## Workflow

1. Prefer JSON output so results are easy to parse.
2. Use `--async` for long-running jobs unless the user explicitly wants to wait.
3. Use `--download [path]` only when the user asks to save the result locally.

## Commands

Text to audio:

```bash
sjinn audio generate --prompt "a calm female voice reading a bedtime story" --model seed-audio-1-0 --async --json
```

With reference audios (cited in the prompt):

```bash
sjinn audio generate --prompt "narrate in the style of @Audio1 with the energy of @Audio2" --audio-urls "./ref-a.mp3,./ref-b.wav" --model seed-audio-1-0 --json
```

With a reference image:

```bash
sjinn audio generate --prompt "background music matching the mood of this scene" --image-urls "./scene.png" --model seed-audio-1-0 --async --json
```

Download the result locally:

```bash
sjinn audio generate --prompt "short upbeat jingle" --model seed-audio-1-0 --download ./jingle.mp3 --json
```

## Output Handling

On success, return the task ID, primary URL, any additional URLs, model, and elapsed time. If `status` is `created`, tell the user to query the task with `sjinn-task-status`.

On error, summarize the CLI error plainly and suggest `sjinn-setup` only when the error indicates the CLI is missing or unauthenticated.
