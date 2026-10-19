import { test, describe } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Security & Authentication Logic', () => {
  const secret = 'test_jwt_secret_token_123';

  test('Password hashing with bcrypt generates valid hash and verifies match', async () => {
    const rawPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    const matches = await bcrypt.compare(rawPassword, hash);
    const wrongMatches = await bcrypt.compare('wrongpass', hash);

    assert.strictEqual(matches, true);
    assert.strictEqual(wrongMatches, false);
  });

  test('JWT token generation and verification preserves payload role', () => {
    const payload = { id: 1, email: 'admin@samicafe.com', role: 'admin' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, 1);
    assert.strictEqual(decoded.email, 'admin@samicafe.com');
    assert.strictEqual(decoded.role, 'admin');
  });

  test('Expired or tampered JWT token throws verification error', () => {
    const payload = { id: 2, role: 'waiter' };
    const token = jwt.sign(payload, secret, { expiresIn: '1s' });
    const tampered = token + 'tampered';

    assert.throws(() => {
      jwt.verify(tampered, secret);
    });
  });
});
