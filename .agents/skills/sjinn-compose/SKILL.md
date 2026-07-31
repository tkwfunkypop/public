---
name: sjinn-compose
description: Concatenate multiple videos in order with the official sjinn compose CLI command. Use when a user wants to merge 2 or more video files or URLs into one video.
---

# SJinn Compose

## Prerequisites

This skill requires `@sjinn-build/cli` 0.1.16 or newer. If the CLI is not installed, is older, or is unauthenticated, use `sjinn-setup` first.

## Workflow

1. Confirm there are at least 2 videos and preserve their requested order.
2. Pass local `.mp4`/`.mov` files or HTTPS URLs as one comma-separated `--video-urls` value.
3. Prefer JSON output so results are easy to parse.
4. Use `--async` for long-running jobs unless the user explicitly wants to wait.
5. Use `--download [path]` only when the user asks to save the result locally.

Do not add separate audio, voiceover, background music, or transitions; the first release does not support them.

## Commands

Concatenate videos:

```bash
sjinn compose --video-urls "intro.mp4,outro.mp4" --json
```

Download the result locally:

```bash
sjinn compose --video-urls "a.mp4,b.mp4" --download ./final.mp4 --json
```

## Output Handling

On success, return the task ID, primary URL, any additional URLs, and elapsed time. If `status` is `created`, tell the user to query the task with `sjinn-task-status`.

On error, summarize the CLI error plainly and suggest `sjinn-setup` only when the error indicates the CLI is missing or unauthenticated.
