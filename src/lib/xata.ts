
import { BaseClientOptions, buildClient } from '@xata.io/client';

const tables = [
  'users',
  'metrics',
  'customer_service',
  'maintenance_satisfaction',
  'complaints',
  'settings',
  'email_templates',
  'email_logs',
  'notifications',
  'audit_logs'
] as const;

const xataClient = buildClient({
  databaseURL: 'https://workspace-a07nri.us-east-1.xata.sh/db/alramz2025:main',
  apiKey: 'xau_ACZ6dxgVC61Yj2ve7NINWFjCQVXzroI30',
  tables,
  enableBrowser: true
});

export { xataClient };
