---
name: sjinn-setup
description: Install the official SJinn CLI, complete browser authorization with sjinn auth login, and verify that SJinn is ready to use.
---

# SJinn Setup

Use this skill when the user needs to install SJinn, log in, fix an unauthenticated CLI, or prepare their machine before using other SJinn skills.

## Workflow

1. Check Node.js:

```bash
node --version
```

Node.js must be 18 or newer. If it is missing or older, ask the user to install or upgrade Node.js first.

2. Check whether the CLI is already available:

```bash
sjinn --version
```

The CLI must be `0.1.16` or newer for these skills. If the command is missing or the version is older, install or upgrade it:

```bash
npm install -g @sjinn-build/cli@latest
```

Then verify again:

```bash
sjinn --version
```

3. Start browser authorization:

```bash
sjinn auth login
```

Tell the user to finish the browser authorization flow if a browser opens or a login URL is printed.

4. Verify the login:

```bash
sjinn auth whoami
```

If this succeeds, SJinn is ready.

## Troubleshooting

See `references/troubleshooting.md` when setup fails.
