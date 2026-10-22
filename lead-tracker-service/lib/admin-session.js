import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { HttpError } from './core.js';
const derive = promisify(scrypt);
const digest = value => createHash('sha256').update(value).digest('hex');
const options = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
export async function passwordHash(password, salt = randomBytes(16).toString('hex')) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 256) throw new Error('Use a new password of 12–256 characters.');
  return salt + ':' + (await derive(password, salt, 32, options)).toString('hex');
}
export function createAdminSessions(db, encodedPassword, clock = Date.now, privatePassword) {
  const sessions = db.collection('adminSessions');
  const usePrivatePassword = typeof privatePassword === 'string' && privatePassword.length > 0;
  const passwordVersion = digest(usePrivatePassword ? 'private:' + privatePassword : encodedPassword || '');
  let derivedPassword;
  async function configured() {
    if (usePrivatePassword) {
      if (privatePassword.length < 12 || privatePassword.length > 256) throw new HttpError(503, 'Admin password must be 12–256 characters.');
      // Derive once per instance; only the version fingerprint is stored in sessions.
      derivedPassword ||= passwordHash(privatePassword);
      return derivedPassword;
    }
    if (!/^[a-f0-9]{32}:[a-f0-9]{64}$/.test(encodedPassword || '')) throw new HttpError(503, 'Admin sign-in is not configured.');
    return encodedPassword;
  }
  function refFor(header) {
    const match = /^Bearer ([a-f0-9]{64})$/.exec(header || '');
    if (!match) throw new HttpError(401, 'Please sign in to the dashboard.');
    return sessions.doc(digest(match[1]));
  }
  async function authorize(header) {
    await configured();
    const ref = refFor(header), record = (await ref.get()).data();
    if (!record || record.username !== 'valeo_admin' || record.expiresAt <= clock() || record.passwordVersion !== passwordVersion) {
      throw new HttpError(401, 'Your dashboard session has expired. Please sign in again.');
    }
    return ref;
  }
  return {
    authorize,
    async login(body) {
      const hash = await configured();
      if (body?.username !== 'valeo_admin' || typeof body.password !== 'string' || body.password.length < 12 || body.password.length > 256) throw new HttpError(401, 'Invalid username or password.');
      // Shared transactional limit persists across serverless instances.
      const rate = db.collection('system').doc('adminLoginRate');
      await db.runTransaction(async tx => {
        const previous = (await tx.get(rate)).data();
        const record = previous && previous.until > clock() ? previous : { count: 0, until: clock() + 15 * 60 * 1000 };
        if (record.count >= 20) throw new HttpError(429, 'Too many sign-in attempts. Try again in 15 minutes.');
        tx.set(rate, { ...record, count: record.count + 1 });
      });
      const [salt, expected] = hash.split(':');
      const actual = await derive(body.password, salt, 32, options);
      if (!timingSafeEqual(actual, Buffer.from(expected, 'hex'))) throw new HttpError(401, 'Invalid username or password.');
      const token = randomBytes(32).toString('hex'), expiresAt = clock() + 8 * 60 * 60 * 1000;
      await sessions.doc(digest(token)).set({ username: 'valeo_admin', expiresAt, passwordVersion: passwordVersion });
      return { token, expiresAt };
    },
    async logout(header) { const ref = await authorize(header); await ref.delete(); }
  };
}
