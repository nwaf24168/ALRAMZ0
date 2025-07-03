import { supabase } from './supabase';

export interface ThreeCXRecord {
  id?: number;
  callTime: string;
  callId: string;
  fromNumber?: string;
  toNumber?: string;
  direction: 'Inbound' | 'Outbound' | string;
  status: 'Answered' | 'Unanswered' | string;
  ringingDuration: number;
  talkingDuration: number;
  agentName?: string;
  isBusinessHours: boolean;
  responseTime: number;
  period: 'weekly' | 'yearly';
  createdBy?: string;
}

export interface CSATRecord {
  id?: number;
  score: number;
  source: string;
  period: 'weekly' | 'yearly';
  createdBy?: string;
}

export class ThreeCXService {
  // حفظ سجلات مكالمات 3CX
  static async saveCallRecords(records: ThreeCXRecord[]): Promise<void> {
    try {
      const recordsToInsert = records.map(record => ({
        call_time: record.callTime,
        call_id: record.callId,
        from_number: record.fromNumber || '',
        to_number: record.toNumber || '',
        direction: record.direction || 'Unknown',
        status: record.status || 'Unknown',
        ringing_duration: record.ringingDuration || 0,
        talking_duration: record.talkingDuration || 0,
        agent_name: record.agentName || '',
        is_business_hours: record.isBusinessHours || true,
        response_time: record.responseTime || 0,
        period: record.period || 'weekly',
        created_by: record.createdBy || 'System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      console.log('محاولة حفظ السجلات:', recordsToInsert);

      const { error } = await supabase
        .from('threecx_data')
        .insert(recordsToInsert);

      if (error) {
        console.error('خطأ في حفظ بيانات 3CX:', error);
        throw new Error(`خطأ في حفظ بيانات 3CX: ${error.message}`);
      }

      console.log(`تم حفظ ${recordsToInsert.length} سجل مكالمة بنجاح`);
    } catch (error) {
      console.error('خطأ في saveCallRecords:', error);
      throw error;
    }
  }

  // جلب سجلات المكالمات
  static async getCallRecords(period: 'weekly' | 'yearly' = 'weekly'): Promise<ThreeCXRecord[]> {
    try {
      const { data, error } = await supabase
        .from('threecx_data')
        .select('*')
        .eq('period', period)
        .order('call_time', { ascending: false });

      if (error) {
        console.error('خطأ في جلب بيانات 3CX:', error);
        throw new Error(`خطأ في جلب بيانات 3CX: ${error.message}`);
      }

      console.log(`تم تحميل ${data?.length || 0} سجل مكالمة للفترة ${period}`);

      return (data || []).map(record => ({
        id: record.id,
        callTime: record.call_time,
        callId: record.call_id,
        fromNumber: record.from_number,
        toNumber: record.to_number,
        direction: record.direction,
        status: record.status,
        ringingDuration: record.ringing_duration,
        talkingDuration: record.talking_duration,
        agentName: record.agent_name,
        isBusinessHours: record.is_business_hours,
        responseTime: record.response_time,
        period: record.period,
        createdBy: record.created_by
      }));
    } catch (error) {
      console.error('خطأ في getCallRecords:', error);
      throw error;
    }
  }

  // مسح بيانات فترة معينة
  static async clearPeriodData(period: 'weekly' | 'yearly'): Promise<void> {
    try {
      const { error } = await supabase
        .from('threecx_data')
        .delete()
        .eq('period', period);

      if (error) {
        console.error('خطأ في حذف بيانات 3CX:', error);
        throw new Error(`خطأ في حذف بيانات 3CX: ${error.message}`);
      }

      console.log(`تم مسح بيانات الفترة ${period}`);
    } catch (error) {
      console.error('خطأ في clearPeriodData:', error);
      throw error;
    }
  }

  // حفظ نقاط CSAT
  static async saveCSATScore(score: number, period: 'weekly' | 'yearly' = 'weekly', createdBy?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('csat_scores')
        .insert({
          score: score,
          source: 'whatsapp',
          period: period,
          created_by: createdBy || 'System',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('خطأ في حفظ نقاط CSAT:', error);
        throw new Error(`خطأ في حفظ نقاط CSAT: ${error.message}`);
      }

      console.log(`تم حفظ نقاط CSAT: ${score} للفترة ${period}`);
    } catch (error) {
      console.error('خطأ في saveCSATScore:', error);
      throw error;
    }
  }

  // جلب نقاط CSAT
  static async getCSATScores(period: 'weekly' | 'yearly' = 'weekly'): Promise<CSATRecord[]> {
    try {
      const { data, error } = await supabase
        .from('csat_scores')
        .select('*')
        .eq('period', period)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطأ في جلب نقاط CSAT:', error);
        throw new Error(`خطأ في جلب نقاط CSAT: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('خطأ في getCSATScores:', error);
      throw error;
    }
  }

  // تحليل بيانات المكالمات
  static analyzeCallData(records: ThreeCXRecord[]) {
    const totalCalls = records.length;
    const answeredCalls = records.filter(r => r.status === 'Answered' || r.status === 'أجيب').length;
    const unansweredCalls = totalCalls - answeredCalls;
    const answerRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;
    
    const totalTalkTime = records.reduce((sum, r) => sum + (r.talkingDuration || 0), 0);
    const averageResponseTime = records.length > 0 
      ? records.reduce((sum, r) => sum + (r.responseTime || 0), 0) / records.length 
      : 0;
    
    const businessHoursCalls = records.filter(r => r.isBusinessHours).length;
    const outsideHoursCalls = totalCalls - businessHoursCalls;

    return {
      totalCalls,
      answeredCalls,
      unansweredCalls,
      answerRate: Math.round(answerRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      totalTalkTime,
      businessHoursCalls,
      outsideHoursCalls
    };
  }

  // تحليل أداء الموظفين
  static analyzeEmployeePerformance(records: ThreeCXRecord[]) {
    const employeeStats: { [key: string]: any } = {};

    records.forEach(record => {
      const agent = record.agentName || 'غير محدد';
      
      if (!employeeStats[agent]) {
        employeeStats[agent] = {
          employeeName: agent,
          totalCalls: 0,
          answeredCalls: 0,
          totalTalkTime: 0,
          averageResponseTime: 0,
          responseTimeSum: 0
        };
      }

      employeeStats[agent].totalCalls++;
      
      if (record.status === 'Answered' || record.status === 'أجيب') {
        employeeStats[agent].answeredCalls++;
      }
      
      employeeStats[agent].totalTalkTime += record.talkingDuration || 0;
      employeeStats[agent].responseTimeSum += record.responseTime || 0;
    });

    // حساب المتوسطات
    Object.keys(employeeStats).forEach(agent => {
      const stats = employeeStats[agent];
      stats.averageResponseTime = stats.totalCalls > 0 
        ? Math.round((stats.responseTimeSum / stats.totalCalls) * 100) / 100 
        : 0;
      delete stats.responseTimeSum;
    });

    return Object.values(employeeStats);
  }
}