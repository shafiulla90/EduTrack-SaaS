"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto = require("crypto");
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_needs_32_bytes!';
const IV_LENGTH = 16;
function getValidKey() {
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'utf8');
    if (keyBuffer.length === 32) {
        return keyBuffer;
    }
    return crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
}
function encrypt(text) {
    if (!text)
        return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getValidKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
function decrypt(hash) {
    if (!hash)
        return hash;
    try {
        const parts = hash.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted format');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encryptedText = Buffer.from(parts[2], 'hex');
        const key = getValidKey();
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText);
        const finalBuffer = decipher.final();
        return Buffer.concat([decrypted, finalBuffer]).toString('utf8');
    }
    catch (error) {
        console.error('Decryption failed:', error.message);
        return '';
    }
}
//# sourceMappingURL=crypto.util.js.map