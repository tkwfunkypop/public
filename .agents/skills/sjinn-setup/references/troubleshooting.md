# SJinn Setup Troubleshooting

## `node` is missing or too old

Install Node.js 18 or newer, then run:

```bash
node --version
```

## `sjinn` command not found after install

Run:

```bash
npm config get prefix
```

Make sure the printed prefix has its `bin` directory on the shell `PATH`, then open a new terminal and retry:

```bash
sjinn --version
```

## npm global install permission error

Use the user's normal Node.js package manager setup. For npm-managed Node installs, the usual fix is to repair the global npm prefix or use a Node version manager.

After fixing npm permissions, retry:

```bash
npm install -g @sjinn-build/cli
```

## Browser authorization did not complete

Run the login command again:

```bash
sjinn auth login
```

Wait for the browser flow to finish, then verify:

```bash
sjinn auth whoami
```

## Still not authenticated

Run:

```bash
sjinn auth logout
sjinn auth login
sjinn auth whoami
```
