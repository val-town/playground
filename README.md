# @valtown/playground

[![NPM Version](https://img.shields.io/npm/v/%40valtown%2Fplayground)](https://www.npmjs.com/package/@valtown/playground)

This repository provides a React component that you can use
to embed an interactive coding playground on a website that uses
[Val Town](https://www.val.town/) to execute code.

This component provides:

- TypeScript autocompletion, linting, and hover
- Auto-acquisition of types from NPM, for packages that provide types
- Ability to run code on Val Town

## Example

See [an interactive example on StackBlitz](https://stackblitz.com/edit/vt-playground-example?file=README.md).

```tsx
import { Playground } from "@valtown/playground";

export function MyPage() {
  return <div>
    <Playground code="console.log(1);" workerPath="/public/worker.ts" />
  </div>;
}
```

## Usage

**Install this as an NPM package:**

```
npm install @valtown/playground
```

Or with your package manager of choice.

**Copy the webworker**

This module relies on a WebWorker, to offload the CPU-intensive
work of running TypeScript, and there is no
commonly-adopted way to distribute and consume NPM modules which
package WebWorkers.

So, copy the file in `node_modules/@valtown/playground/dist/assets/`
from your `node_modules` directory to a public directory in your
application where it can be loaded.

**Use the component**

As with the example above, import the component and provide
it with `code` prop and a `workerPath` prop that points to the
worker file.
