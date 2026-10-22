export const headers = ['Time submitted', 'Time', 'Platform', 'Name', 'email', 'phone number', 'Campaign', 'package', 'language', 'How old is the child who needs care?', 'Do you need a live-in or live-out babysitter?', 'Which babysitting package are you looking for?', 'كم عمر الطفل اللي يحتاج الرعاية؟', 'تحتاجين جليسة مقيمة في البيت أو غير مقيمة؟', 'أي باقة جليسات أطفال تبحثين عنها؟', 'ad account', 'Convert Numbers when needed', 'City', 'Agent', 'Remarks'];
export const row = (overrides = {}) => {
  const record = { 'Time submitted': '22/10/2026 14:38', Time: 1792669130277, Platform: 'snapchat', Name: 'Test parent', 'phone number': '0500000001', language: 'eng', 'How old is the child who needs care?': '1 month', 'Do you need a live-in or live-out babysitter?': 'Live-out', 'Which babysitting package are you looking for?': 'Monthly', City: 'Dubai', ...overrides };
  return headers.map(h => record[h] ?? '');
};

