
// مكتبة مساعدة لتوحيد تنسيق التواريخ الميلادية في جميع أنحاء التطبيق

export const formatDateForDisplay = (date: string | Date): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
};

export const formatDateTimeForDisplay = (date: string | Date): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return `${dateObj.toISOString().split('T')[0]} ${dateObj.toLocaleTimeString('en-US', { hour12: false })}`;
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getCurrentDateTime = (): string => {
  return new Date().toISOString();
};

export const parseExcelDate = (excelDate: any): string => {
  if (!excelDate) return getCurrentDate();
  
  // إذا كان التاريخ رقم Excel
  if (typeof excelDate === 'number') {
    // Excel dates are days since 1900-01-01
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  
  // إذا كان نص أو تاريخ عادي
  const date = new Date(excelDate);
  if (isNaN(date.getTime())) {
    return getCurrentDate();
  }
  
  return date.toISOString().split('T')[0];
};

export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

export const formatDateForExcel = (date: string | Date): string => {
  return formatDateForDisplay(date);
};
