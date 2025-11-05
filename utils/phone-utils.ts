// lib/phone-utils.ts

// Валидация телефона
export const validatePhone = (phone: string): string | null => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Базовые проверки
  if (!cleaned) return "Телефон обязателен";
  if (cleaned.length < 11) return "Телефон слишком короткий";
  if (cleaned.length > 12) return "Телефон слишком длинный";
  
  // Проверка формата российских номеров
  const phoneRegex = /^(\+7|8|7)[0-9]{10}$/;
  if (!phoneRegex.test(cleaned)) {
    return "Формат: +7 XXX XXX-XX-XX, 8 XXX XXX-XX-XX или 7 XXX XXX-XX-XX";
  }
  
  // Проверка кода оператора
  const operatorCode = cleaned.slice(-10, -7);
  const validCodes = [
    '900', '901', '902', '903', '904', '905', '906', '907', '908', '909',
    '910', '911', '912', '913', '914', '915', '916', '917', '918', '919',
    '920', '921', '922', '923', '924', '925', '926', '927', '928', '929',
    '930', '931', '932', '933', '934', '935', '936', '937', '938', '939',
    '950', '951', '952', '953', '954', '955', '956', '957', '958', '959',
    '960', '961', '962', '963', '964', '965', '966', '967', '968', '969',
    '970', '971', '972', '973', '974', '975', '976', '977', '978', '979',
    '980', '981', '982', '983', '984', '985', '986', '987', '988', '989',
    '990', '991', '992', '993', '994', '995', '996', '997', '998', '999'
  ];
  
  if (!validCodes.includes(operatorCode)) {
    return "Неверный код оператора";
  }
  
  return null;
};

// Форматирование телефона при вводе
export const formatPhone = (input: string): string => {
  const cleaned = input.replace(/\D/g, '');
  
  if (cleaned.length === 0) return '';
  
  let formatted = '';
  
  if (cleaned.startsWith('+7')) {
    formatted = '+7 ';
  } else if (cleaned.startsWith('7')) {
    formatted = '+7 ';
  } else if (cleaned.startsWith('8')) {
    formatted = '8 ';
  } else {
    formatted = '+7 ';
  }
  
  const numbers = cleaned.replace(/^(\+7|7|8)/, '').slice(0, 10);
  
  if (numbers.length > 0) {
    formatted += `(${numbers.slice(0, 3)}`;
  }
  if (numbers.length > 3) {
    formatted += `) ${numbers.slice(3, 6)}`;
  }
  if (numbers.length > 6) {
    formatted += `-${numbers.slice(6, 8)}`;
  }
  if (numbers.length > 8) {
    formatted += `-${numbers.slice(8, 10)}`;
  }
  
  return formatted;
};

// Нормализация телефона для отправки на сервер
export const normalizePhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  if (cleaned.startsWith('+7')) {
    return cleaned;
  } else if (cleaned.startsWith('8')) {
    return '+7' + cleaned.slice(1);
  } else if (cleaned.startsWith('7')) {
    return '+7' + cleaned.slice(1);
  } else {
    return '+7' + cleaned;
  }
};