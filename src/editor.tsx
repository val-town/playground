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
import { useCallback, useEffect, useRef, useState } from "react";
import * as Comlink from "comlink";
import { events } from "fetch-event-stream";

type Output =
  | {
      kind: "end";
    }
  | {
      kind: "error";
      err: string;
    }
  | {
      kind: "log";
      message: string;
    };

export function Playground({
  code,
  module,
  env = {},
  workerPath,
}: {
  module: string;
  env?: Record<string, string>;
  code: string;
  workerPath?: string | URL;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cmRef = useRef<EditorView>(null);
  const [output, setOutput] = useState<Output[] | null>(null);

  useEffect(() => {
    if (!ref.current || cmRef.current) return;
    const innerWorker = workerPath
      ? new Worker(workerPath, {
          type: "module",
        })
      : new Worker(new URL("./worker.ts?worker", import.meta.url), {
          type: "module",
        });
    const worker = Comlink.wrap<WorkerShape>(innerWorker);
    const container = new Compartment();
    cmRef.current = new EditorView({
      doc: code,
      extensions: [
        basicSetup,
        javascript({
          typescript: true,
          jsx: true,
        }),
        container.of([]),
      ],
      parent: ref.current,
    });

    const editor = cmRef.current;

    worker.initialize().then(() => {
      editor.dispatch({
        effects: container.reconfigure([
          tsFacet.of({
            path: "/index.tsx",
            worker,
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

    return () => {
      innerWorker.terminate();
      cmRef.current?.destroy();
      cmRef.current = null;
    };
  }, [code, workerPath]);

  const run = useCallback(async () => {
    if (!cmRef.current) return;
    const doc = cmRef.current.state.doc.toString();

    const res = await fetch(
      "https://tmcw--2daadabd3a9b408495520e46f7fbc6b2.web.val.run/submit",
      {
        method: "POST",
        body: JSON.stringify({
          code: doc,
          module,
          env,
        }),
      },
    );

    if (res.ok) {
      setOutput([]);
      const stream = events(res);
      for await (const event of stream) {
        if (!event.data) return;
        try {
          const d = JSON.parse(event.data);
          setOutput((output) =>
            (output ?? []).concat([d] as unknown as Output[]),
          );
        } catch (e) {
          setOutput((output) =>
            (output ?? []).concat([{ kind: "error", err: "Unexpected reply" }]),
          );
        }
      }
    } else {
      setOutput([{ kind: "error", err: "Failed to run code" }]);
    }
  }, [env, module]);

  return (
    <div className="vt-embed">
      <div ref={ref} className="vt-embed-cm" />

      <div className="vt-embed-output">
        {output === null ? (
          <div className="vt-embed-output-empty">Nothing run so far</div>
        ) : (
          output.map((o, i) => {
            switch (o.kind) {
              case "log": {
                return (
                  <div
                    className="vt-embed-output-line vt-embed-output-line--log"
                    key={i}
                  >
                    {o.message}
                  </div>
                );
              }
              case "error": {
                return (
                  <div
                    className="vt-embed-output-line vt-embed-output-line--error"
                    key={i}
                  >
                    {o.err}
                  </div>
                );
              }
              case "end": {
                return (
                  <div
                    className="vt-embed-output-line vt-embed-output-line--end"
                    key={i}
                  >
                    Evaluation finished
                  </div>
                );
              }
              default: {
                // o is never
                return <div key={i}>Unexpected: {JSON.stringify(o)}</div>;
              }
            }
          })
        )}
      </div>
      <div className="vt-embed-buttons">
        <button className="vt-embed-runButton" type="button" onClick={run}>
          Run
        </button>
      </div>
    </div>
  );
}
