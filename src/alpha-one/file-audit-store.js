import fs from 'node:fs/promises';
import path from 'node:path';

export class FileAuditStore {
  constructor(file) {
    this.file = path.resolve(file);
  }

  async append(record) {
    await fs.mkdir(path.dirname(this.file), {recursive: true});
    await fs.appendFile(this.file, `${JSON.stringify(record)}\n`, {encoding: 'utf8', mode: 0o600});
    return JSON.parse(JSON.stringify(record));
  }

  async list({tenantId}) {
    let body = '';
    try { body = await fs.readFile(this.file, 'utf8'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    return body.split('\n').filter(Boolean).map(line => JSON.parse(line)).filter(record => record.tenantId === tenantId);
  }
}
