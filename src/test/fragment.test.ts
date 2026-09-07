import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFragmentFileName, fragmentFileName, fragmentTypeById } from '../fragment';

test('parseFragmentFileName accepts a valid name', () => {
  const result = parseFragmentFileName('123.feature.md');
  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.issueId, '123');
    assert.equal(result.type.id, 'feature');
  }
});

test('parseFragmentFileName accepts every recognized type', () => {
  for (const id of ['feature', 'bugfix', 'doc', 'removal', 'misc']) {
    const result = parseFragmentFileName(`1.${id}.md`);
    assert.equal(result.valid, true, `expected ${id} to be valid`);
  }
});

test('parseFragmentFileName rejects a missing issue number', () => {
  const result = parseFragmentFileName('feature.md');
  assert.equal(result.valid, false);
});

test('parseFragmentFileName rejects an unrecognized type', () => {
  const result = parseFragmentFileName('123.enhancement.md');
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.match(result.reason, /unrecognized type/);
  }
});

test('parseFragmentFileName rejects the wrong extension', () => {
  const result = parseFragmentFileName('123.feature.txt');
  assert.equal(result.valid, false);
});

test('fragmentFileName is the exact inverse of parseFragmentFileName', () => {
  const type = fragmentTypeById('bugfix')!;
  const name = fragmentFileName('456', type);
  assert.equal(name, '456.bugfix.md');
  const parsed = parseFragmentFileName(name);
  assert.equal(parsed.valid, true);
});
