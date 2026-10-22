// Supply a NEW password on stdin; do not put it in command arguments or git.
import { readFileSync } from 'node:fs';
import { passwordHash } from '../lib/admin-session.js';
const password = readFileSync(0, 'utf8').replace(/\r?\n$/, '');
process.stdout.write(await passwordHash(password));
