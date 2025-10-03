import * as crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const ivLength = 16;
const tagLength = 16;
const defaultSaltLength = 64;
const defaultPbkdf2Iterations = 100000;

type Options = { pbkdf2Iterations?: number; saltLength?: number };

export default class Cryptr {
  private secret: string;
  private saltLength: number;
  private pbkdf2Iterations: number;
  private tagPosition: number;
  private encryptedPosition: number;

  constructor(secret: string, options?: Options) {
    if (!secret || typeof secret !== 'string') {
      throw new Error('Cryptr: secret must be a non-0-length string');
    }

    this.secret = secret;
    this.saltLength = options?.saltLength ?? defaultSaltLength;
    this.pbkdf2Iterations =
      options?.pbkdf2Iterations ?? defaultPbkdf2Iterations;

    this.tagPosition = this.saltLength + ivLength;
    this.encryptedPosition = this.tagPosition + tagLength;
  }

  private getKey(salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      this.secret,
      salt,
      this.pbkdf2Iterations,
      32,
      'sha512',
    );
  }

  encrypt(value: string): string {
    if (value == null) throw new Error('value must not be null or undefined');

    const iv = crypto.randomBytes(ivLength);
    const salt = crypto.randomBytes(this.saltLength);

    const key = this.getKey(salt);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(String(value), 'utf8'),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
  }

  decrypt(value: string): string {
    if (value == null) {
      throw new Error('value must not be null or undefined');
    }

    const stringValue = Buffer.from(String(value), 'hex');

    const salt = stringValue.slice(0, this.saltLength);
    const iv = stringValue.slice(this.saltLength, this.tagPosition);
    const tag = stringValue.slice(this.tagPosition, this.encryptedPosition);
    const encrypted = stringValue.slice(this.encryptedPosition);

    const key = this.getKey(salt);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(encrypted) + decipher.final('utf8');
  }
}
