
import { Navigate } from "react-router-dom";

const Index = () => {
  // إعادة توجيه المستخدم مباشرة إلى لوحة التحكم
  return <Navigate to="/dashboard" replace />;
};

export default Index;
