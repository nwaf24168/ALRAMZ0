import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في تسجيل الدخول",
        description: "يرجى التحقق من اسم المستخدم وكلمة المرور"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-8 sm:px-6 md:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      
      <div className="relative w-full max-w-xl mx-auto space-y-8 sm:space-y-10 md:space-y-12">
        <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
          <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
            <img
              src="imag/3.svg"
              alt="شركة الرمز العقارية"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          
          <div className="text-center space-y-2 sm:space-y-3 md:space-y-4 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              مرحباً بك في منصة قسم إدارة راحة العملاء
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 font-semibold">
              شركة الرمز العقارية
            </p>
          </div>
        </div>

        <Card className="p-6 sm:p-8 md:p-10 bg-white/10 backdrop-blur-xl border-0 shadow-[0_0_40px_rgba(0,0,0,0.2)] rounded-2xl mx-4 sm:mx-6 md:mx-8">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <Label 
                htmlFor="username" 
                className="text-lg sm:text-xl font-semibold text-white block"
              >
                اسم المستخدم
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 sm:h-14 text-base sm:text-lg bg-white/20 border-2 border-white/20 text-white placeholder:text-gray-300 rounded-xl focus:bg-white/30 focus:border-white/40 transition-all duration-300"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Label 
                htmlFor="password" 
                className="text-lg sm:text-xl font-semibold text-white block"
              >
                كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 sm:h-14 text-base sm:text-lg bg-white/20 border-2 border-white/20 text-white placeholder:text-gray-300 rounded-xl focus:bg-white/30 focus:border-white/40 transition-all duration-300"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 sm:h-14 md:h-16 text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 rounded-xl transition-all duration-300 shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.4)]"
            >
              تسجيل الدخول
            </Button>
          </form>
        </Card>

        <div className="text-center text-sm sm:text-base text-gray-400 px-4">
          جميع الحقوق محفوظة © {new Date().getFullYear()} شركة الرمز العقارية
        </div>
      </div>
    </div>
  );
}
