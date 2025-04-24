
import { buildClient } from '@xata.io/client';

const tables = {
  users: {
    id: 'string',
    username: 'string',
    password: 'string',
    role: 'string',
    email: 'string?',
    full_name: 'string?',
    department: 'string?',
    is_active: 'string?',
    last_login: 'Date?'
  },
  metrics: {},
  customer_service: {},
  maintenance_satisfaction: {},
  complaints: {},
  settings: {},
  email_templates: {},
  email_logs: {},
  notifications: {},
  audit_logs: {}
};

export const xataClient = buildClient({
  databaseURL: 'https://workspace-a07nri.us-east-1.xata.sh/db/alramz2025:main',
  apiKey: 'xau_ACZ6dxgVC61Yj2ve7NINWFjCQVXzroI30',
  tables,
  enableBrowser: true
});

export const getXataClient = () => xataClient;
