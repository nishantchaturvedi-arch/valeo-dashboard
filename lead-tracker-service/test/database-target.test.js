import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDatabaseTarget } from '../lib/core.js';

test('default lead database is isolated from the existing dashboard project', () => {
  assert.doesNotThrow(() => validateDatabaseTarget({project_id: 'dedicated-leads'}, 'dedicated-leads', '(default)'));
  assert.throws(() => validateDatabaseTarget({project_id: 'valeo-dashboard'}, 'valeo-dashboard', '(default)'));
  assert.throws(() => validateDatabaseTarget({project_id: 'valeo-dashboard'}, 'dedicated-leads', '(default)'));
  assert.throws(() => validateDatabaseTarget({project_id: 'dedicated-leads'}, '', '(default)'));
  assert.throws(() => validateDatabaseTarget({project_id: 'dedicated-leads'}, 'dedicated-leads', ''));
});
