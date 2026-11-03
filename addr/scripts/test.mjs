import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = path.join(root, 'output/playwright/address-module-unit');
await mkdir(output, { recursive: true });
await writeFile(path.join(output, 'package.json'), '{"type":"commonjs"}\n');
const source = path.join(root, 'addr');
const program = ts.createProgram(
  [
    'shared/address.ts',
    'client/api.ts',
    'client/storage.ts',
    'client/export.ts',
    'server/service.ts',
    'worker.js',
  ]
    .map((file) => path.join(source, file))
    .concat([
      path.join(root, 'functions/api/address/catalog.ts'),
      path.join(root, 'functions/api/address/generate.ts'),
    ]),
  {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    strict: true,
    allowJs: true,
    checkJs: false,
    noUncheckedIndexedAccess: true,
    esModuleInterop: true,
    resolveJsonModule: true,
    skipLibCheck: true,
    noEmitOnError: true,
    rootDir: root,
    outDir: output,
  },
);
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
    ['--test', fileURLToPath(new URL('../tests/core.test.mjs', import.meta.url))],
    { cwd: root, stdio: 'inherit' },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
