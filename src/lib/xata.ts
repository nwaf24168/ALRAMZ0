
import { buildClient } from '@xata.io/client';

const tables = {
  users: {
    id: { type: 'string' },
    username: { type: 'string' },
    password: { type: 'string' },
    role: { type: 'string' },
    email: { type: 'string', optional: true },
    full_name: { type: 'string', optional: true },
    department: { type: 'string', optional: true },
    is_active: { type: 'string', optional: true },
    last_login: { type: 'datetime', optional: true }
  }
};

const client = buildClient({
  databaseURL: 'https://workspace-a07nri.us-east-1.xata.sh/db/alramz2025:main',
  apiKey: 'xau_ACZ6dxgVC61Yj2ve7NINWFjCQVXzroI30',
  tables,
  enableBrowser: true
});

export const xataClient = client;
export const getXataClient = () => client;
