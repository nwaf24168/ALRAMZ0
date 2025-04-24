
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

const client = buildClient({
  databaseURL: 'https://workspace-a07nri.us-east-1.xata.sh/db/alramz2025:main',
  apiKey: 'xau_ACZ6dxgVC61Yj2ve7NINWFjCQVXzroI30',
  tables,
  enableBrowser: true
});

export const xataClient = {
  db: {
    users: client.db.users,
    metrics: client.db.metrics,
    customer_service: client.db.customer_service,
    maintenance_satisfaction: client.db.maintenance_satisfaction,
    complaints: client.db.complaints,
    settings: client.db.settings,
    email_templates: client.db.email_templates,
    email_logs: client.db.email_logs,
    notifications: client.db.notifications,
    audit_logs: client.db.audit_logs
  }
};

export const getXataClient = () => xataClient;
