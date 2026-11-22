// Smoke: projected FFI query keeps ORDER BY on an unselected field (hakodb #237).
import { loadNativeBindings } from './src/native.ts';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'hakojs-order-'));
try {
  const n = await loadNativeBindings(process.env.HAKODB_LIB ?? 'C:/Dev/libs/hakodb/target/release/hakodb.dll');
  const engine = n.engineOpen(dir);
  for (const [id, name, age] of [['u1', 'alice', 30], ['u2', 'bob', 40]]) {
    const doc = n.docNew();
    n.docInsertStr(doc, 'name', name);
    n.docInsertInt(doc, 'age', age);
    if (n.engineInsert(engine, 'users', id, doc) !== 0) throw new Error('insert failed');
    n.docFree(doc);
  }
  const q = n.queryNew('users');
  n.queryOrderBy(q, 'age', false);
  n.querySelectField(q, 'name');
  n.queryLimit(q, 10);
  const rows = JSON.parse(n.queryExecute(engine, q) ?? '[]');
  n.queryFree(q);
  if (rows.length !== 2) throw new Error(`expected 2 rows, got ${rows.length}`);
  if (rows[0].name !== 'bob') throw new Error(`wrong first row: ${JSON.stringify(rows)}`);
  if ('age' in rows[0]) throw new Error(`age must be pruned: ${JSON.stringify(rows)}`);
  console.log('OK: order-by-outside-select projected query', JSON.stringify(rows));
  const cancel = n.cancelNew();
  n.cancel(cancel);
  const q2 = n.queryNew('users');
  n.queryLimit(q2, 10);
  const cancelled = n.queryExecuteWithCancel(engine, q2, cancel);
  n.queryFree(q2);
  n.cancelFree(cancel);
  if (cancelled !== null) throw new Error(`cancelled query should return null: ${cancelled}`);
  n.engineFree(engine);
  console.log('OK: cancel token aborts query');
} finally {
  rmSync(dir, { recursive: true, force: true });
}
