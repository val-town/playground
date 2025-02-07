import { autocompletion } from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { Compartment } from "@codemirror/state";
import {
  tsAutocomplete,
  tsFacet,
  tsHover,
  tsLinter,
  tsSync,
} from "@valtown/codemirror-ts";
import type { WorkerShape } from "@valtown/codemirror-ts/worker";
import { basicSetup, EditorView } from "codemirror";
import * as Comlink from "comlink";

const innerWorker = new Worker("./worker.ts", {
  type: "module",
});
const worker = Comlink.wrap<WorkerShape>(innerWorker);

const container = new Compartment();

function mount(el, value) {
  const editor = new EditorView({
    doc: value,
    extensions: [
      basicSetup,
      javascript({
        typescript: true,
        jsx: true,
      }),
      container.of([]),
    ],
    parent: el,
  });

  worker.initialize().then(() => {
    editor.dispatch({
      effects: container.reconfigure([
        tsFacet.of({
          path: "/index.tsx",
          worker,
          debug(...args: unknown[]) {
            console.log(...args);
          },
        }),
        tsSync(),
        tsLinter(),
        autocompletion({
          override: [tsAutocomplete()],
        }),
        tsHover(),
      ]),
    });
  });
}

mount(
  document.querySelector("#editorSource"),
  `import { min } from "simple-statistics"`,
);

// <textarea id="editorSource" class="cm-editor" name="editorSource">Some filler text</textarea>
