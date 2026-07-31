---
name: sjinn-task-status
description: Query SJinn task status and extract generated output URLs with the official sjinn status CLI command.
---

# SJinn Task Status

Use this skill when the user has a SJinn task ID and wants to check progress, inspect failure details, or retrieve generated output URLs.

## Prerequisites

Before querying, quickly verify the CLI and login:

```bash
sjinn --version
sjinn auth whoami
```

If either command fails, use `sjinn-setup` first.

## Workflow

1. Ask for the task ID if it is missing.
2. Query status with JSON output:

```bash
sjinn status <task_id> --json
```

3. Interpret the numeric or textual status in user-friendly language.
4. If output URLs are present, return them clearly.
5. If the task is still pending or processing, tell the user it is not finished yet.
6. If the task failed, summarize the error field from the CLI output.

## Status Guide

- `pending`: The task has been accepted and is waiting or running.
- `completed`: The task finished successfully and should include output URLs.
- `failed`: The task failed; report the error.
- `cancelled`: The task was cancelled or stopped.
- `deleted`: The task was deleted by the user.

## Command

```bash
sjinn status <task_id> --json
```
