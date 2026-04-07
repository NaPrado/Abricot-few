# Abricot

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Pre-commit Hooks

This project uses [pre-commit](https://pre-commit.com/) to enforce code quality and branch conventions.

### Install

```sh
pip install pre-commit
pre-commit install
```

### Hooks

| Hook | Description |
|------|-------------|
| `eslint` | Runs ESLint with `--fix` on staged `.vue`, `.js`, and `.ts` files |
| `check-protected-branches` | Blocks direct commits to `main` |
| `check-branch-naming` | Enforces branch name format: `<type>/<desc>` |

Valid branch types: `feature`, `bugfix`, `refactor`, `hotfix`, `release`, `chore`.

Examples: `feature/add-login`, `bugfix/fix-header`
