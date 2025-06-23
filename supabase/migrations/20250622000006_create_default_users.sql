
-- إنشاء المستخدمين الافتراضيين
INSERT INTO users (username, password, role, permissions) VALUES
('admin', 'admin123', 'مدير النظام', '{"level":"edit","scope":"full","pages":[]}'),
('abdulsalam', 'Alramz2025', 'مدير ادارة راحة العملاء', '{"level":"edit","scope":"full","pages":[]}'),
('aljawhara', 'Alramz2025', 'موظف ادارة راحة العملاء', '{"level":"edit","scope":"full","pages":[]}'),
('khulood', 'Alramz2025', 'موظف ادارة راحة العملاء', '{"level":"edit","scope":"full","pages":[]}'),
('adnan', 'Alramz2025', 'موظف ادارة راحة العملاء', '{"level":"edit","scope":"full","pages":[]}'),
('lateefa', 'Alramz2025', 'موظف ادارة راحة العملاء', '{"level":"edit","scope":"full","pages":[]}'),
('nawaf', 'Alramz2025', 'موظف ادارة راحة العملاء', '{"level":"read","scope":"limited","pages":["delivery"]}')
ON CONFLICT (username) DO NOTHING;
