import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'output/playwright/tools-unit');
await mkdir(output, { recursive: true });
await writeFile(path.join(output, 'package.json'), '{"type":"commonjs"}\n');

const entries = [
  'src/tools/developer/json-formatter/utils.ts',
  'src/tools/developer/base64/utils.ts',
  'src/tools/developer/url-codec/utils.ts',
  'src/tools/developer/timestamp/utils.ts',
  'src/tools/developer/uuid-generator/utils.ts',
  'src/tools/text/word-counter/utils.ts',
  'src/tools/text/text-deduplicator/utils.ts',
  'src/tools/converter/radix-converter/utils.ts',
  'src/utils/navigationWidgetData.ts',
].map((file) => path.join(root, file));

const program = ts.createProgram(entries, {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.Node10,
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
  strict: true,
  noUncheckedIndexedAccess: true,
  esModuleInterop: true,
  resolveJsonModule: true,
  skipLibCheck: true,
  noEmitOnError: true,
  rootDir: root,
  outDir: output,
});

const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  process.stderr.write(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (file) => file,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }),
  );
  process.exitCode = 1;
} else {
  program.emit();
  const result = spawnSync(
    process.execPath,
    ['--test', fileURLToPath(new URL('./tools.test.mjs', import.meta.url))],
    { cwd: root, stdio: 'inherit' },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
