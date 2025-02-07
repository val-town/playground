import { setupTypeAcquisition } from "@typescript/ata";
import {
  createDefaultMapFromCDN,
  createSystem,
  createVirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import { createWorker } from "@valtown/codemirror-ts/worker";
import * as Comlink from "comlink";
import pLazy from "p-lazy";
import ts from "typescript";

// NOTE: do not use TypeScript syntax in this file, it is not auto-transpiled
// because we proxy this file and Deno thinks that Deno is making the request

console.log("Booting up");

const worker = createWorker({
  env: new pLazy(async (resolve) => {
    const fsMap = await createDefaultMapFromCDN(
      {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ES2022,
        moduleDetection: ts.ModuleDetectionKind.Force,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        allowJs: true,
      },
      "5.7.3",
      false,
      ts,
    );
    const system = createSystem(fsMap);
    const compilerOpts = {};
    resolve(createVirtualTypeScriptEnvironment(system, [], ts, compilerOpts));
  }),
  onFileUpdated(_env, _path, code) {
    ata(code);
  },
});

const ata = setupTypeAcquisition({
  projectName: "My ATA Project",
  typescript: ts,
  logger: console,
  delegate: {
    receivedFile: (code, path) => {
      console.log(code, path);
      worker.getEnv().createFile(path, code);
    },
  },
});

Comlink.expose(worker);
