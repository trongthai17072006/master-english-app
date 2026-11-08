export interface VocabItem {
  id: string;
  word: string;
  ipa?: string;
  pos: 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'idiom' | 'grammar';
  level?: 'B1' | 'B2' | 'C1' | 'C2' | 'IELTS 7.0+' | 'IELTS 8.0+';
  meaning: string;
  detailedNote?: string;
  collocations?: string[];
  exampleEn?: string;
  exampleVi?: string;
  distinctionNote?: string; // comparison note (e.g. doubt vs suspicion)
  tags: string[];
}

export interface DistinctionPair {
  id: string;
  title: string;
  termA: string;
  termB: string;
  termC?: string;
  explanationA: string;
  explanationB: string;
  explanationC?: string;
  ruleSummary: string;
  testQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface CollocationQuestion {
  id: string;
  sentence: string; // e.g. "I'm swamped ___ emails after the vacation."
  targetMissing: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  vietnameseMeaning: string;
}

export interface ContextQuestion {
  id: string;
  contextType: 'IELTS Writing' | 'IELTS Speaking' | 'Business' | 'Daily English';
  sentence: string;
  blank: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  fullTranslation: string;
}


import vocabDatabaseData from './vocabDatabase.json';
import { VSTEP_PDF_VOCAB_BANK, VSTEP_PDF_GRAMMAR_BANK } from './vstepPdfKnowledgeBankData';

const baseVocabList = vocabDatabaseData as VocabItem[];
const existingWordsMap = new Map<string, VocabItem>();
for (const item of baseVocabList) {
  if (item && item.word) {
    existingWordsMap.set(item.word.trim().toLowerCase(), item);
  }
}

for (const pdfVoc of VSTEP_PDF_VOCAB_BANK) {
  const key = pdfVoc.word.trim().toLowerCase();
  const existing = existingWordsMap.get(key);
  if (existing) {
    // Gộp ví dụ & collocations từ PDF 83 trang nếu từ đã tồn tại
    existingWordsMap.set(key, {
      ...existing,
      collocations: Array.from(new Set([...(existing.collocations || []), ...(pdfVoc.collocations || [])])),
      detailedNote: `${existing.detailedNote ? existing.detailedNote + ' | ' : ''}${pdfVoc.detailedNote || ''}`,
      tags: Array.from(new Set([...(existing.tags || []), ...(pdfVoc.tags || []), 'vstep-pdf']))
    });
  } else {
    existingWordsMap.set(key, {
      id: pdfVoc.id,
      word: pdfVoc.word,
      ipa: pdfVoc.ipa,
      pos: pdfVoc.pos,
      level: pdfVoc.level,
      meaning: pdfVoc.meaning,
      collocations: pdfVoc.collocations,
      exampleEn: pdfVoc.exampleEn,
      exampleVi: pdfVoc.exampleVi,
      detailedNote: pdfVoc.detailedNote,
      tags: [...(pdfVoc.tags || []), 'vstep-pdf']
    });
  }
}

export const VOCAB_DATABASE: VocabItem[] = Array.from(existingWordsMap.values());

export const TRICKY_DISTINCTIONS: DistinctionPair[] = [
  {
    id: 'reduction-of-vs-reduction-in',
    title: 'Reduction OF vs. Reduction IN (Ôn thi VSTEP PDF - Trang 33)',
    termA: 'Reduction OF',
    termB: 'Reduction IN',
    explanationA: 'Đi với CON SỐ hoặc PHẦN TRĂM định lượng cụ thể (Ví dụ: a reduction of 20%, a reduction of $500).',
    explanationB: 'Đi với DANH TỪ CHỈ LĨNH VỰC, CHẤT LƯỢNG hoặc ĐỐI TƯỢNG bị cắt giảm (Ví dụ: a reduction in stress, a reduction in operational costs).',
    ruleSummary: 'Sau giới từ là CON SỐ (%) ➔ OF. Sau giới từ là LĨNH VỰC / CHẤT LƯỢNG (stress, pollution, cost) ➔ IN.',
    testQuestions: [
      {
        question: 'Relocating factories to rural zones leads to a significant reduction ______ urban traffic congestion.',
        options: ['of', 'in', 'at', 'with'],
        correctIndex: 1,
        explanation: '"urban traffic congestion" là danh từ chỉ khía cạnh/hiện tượng ➔ Dùng "reduction in".'
      },
      {
        question: 'The company announced a reduction ______ 15% in its annual carbon emissions.',
        options: ['in', 'of', 'for', 'by'],
        correctIndex: 1,
        explanation: 'Đi trực tiếp trước con số phần trăm "15%" ➔ Dùng "a reduction of 15%".'
      }
    ]
  },
  {
    id: 'to-v-vs-to-ving-bridge-nouns',
    title: 'To + V (Mục đích) vs. To + V-ing (Sau danh từ cầu nối - PDF Trang 15)',
    termA: 'To + V (Infinitive)',
    termB: 'To + V-ing (Preposition)',
    explanationA: 'Dùng sau động từ thường hoặc tính từ thông thường để chỉ MỤC ĐÍCH ("để làm gì"): decide to go, work hard to pass.',
    explanationB: 'Khi đứng sau các DANH TỪ CẦU NỐI (the key, solution, secret, way, approach, barrier + to) hoặc TÍNH TỪ (be used/committed/dedicated + to), chữ "to" là GIỚI TỪ nên bắt buộc cộng V-ing.',
    ruleSummary: 'Sau key / solution / secret / committed / dedicated / used + TO ➔ Bắt buộc dùng V-ING.',
    testQuestions: [
      {
        question: 'At an early stage of your career, continuous learning is the key to ______ long-term promotion.',
        options: ['achieve', 'achieving', 'achieved', 'be achieved'],
        correctIndex: 1,
        explanation: 'Sau danh từ cầu nối "the key to", chữ "to" là giới từ ➔ Dùng "achieving".'
      }
    ]
  },
  {
    id: 'also-too-vs-either',
    title: 'Also / Too (Khẳng định) vs. Either (Phủ định - PDF Trang 14)',
    termA: 'Also / Too',
    termB: 'Either',
    explanationA: 'Dùng trong câu KHẲNG ĐỊNH (+) để mang nghĩa "cũng vậy".',
    explanationB: 'Dùng ở cuối câu PHỦ ĐỊNH (-) có not/never để mang nghĩa "cũng không".',
    ruleSummary: 'Câu Khẳng định (+) ➔ TOO / ALSO. Câu Phủ định (not) ➔ EITHER.',
    testQuestions: [
      {
        question: 'Online newspapers are free of charge, and they do not waste paper, ______.',
        options: ['too', 'also', 'either', 'so'],
        correctIndex: 2,
        explanation: 'Mệnh đề mang nghĩa phủ định ("do not waste paper") ➔ Cuối câu bắt buộc dùng "either".'
      }
    ]
  },
  {
    id: 'doubt-vs-suspicion',
    title: 'Doubt vs. Suspicion (Hai sắc thái nghi ngờ)',
    termA: 'Doubt',
    termB: 'Suspicion',
    explanationA: 'Nghi ngờ vì chưa chắc chắn, không tin tưởng vào tính xác thực hoặc logic (Hình ảnh: dấu hỏi chấm ?).',
    explanationB: 'Nghi ngờ ai đó đang làm điều mờ ám, gian lận hoặc phạm tội (Hình ảnh: cảnh sát / thám tử 🕵️).',
    ruleSummary: 'Không chắc đúng/sai ➔ DOUBT. Nghi ngờ có người làm điều XẤU/tội phạm ➔ SUSPICION.',
    testQuestions: [
      {
        question: 'The police arrested the accountant because there was a strong ______ of fraud.',
        options: ['doubt', 'suspicion', 'hesitation', 'dispute'],
        correctIndex: 1,
        explanation: 'Gian lận/tội phạm (fraud) là điều xấu ➔ Bắt buộc dùng "suspicion".'
      },
      {
        question: 'I still have some lingering ______ about whether this investment theory actually works in practice.',
        options: ['suspicion', 'doubts', 'suspecting', 'crimes'],
        correctIndex: 1,
        explanation: 'Nghi ngờ về tính hiệu quả, tính đúng đắn logic của lý thuyết ➔ Dùng "doubts".'
      }
    ]
  },
  {
    id: 'implement-vs-execute',
    title: 'Implement vs. Execute (Triển khai & Thực thi)',
    termA: 'Implement',
    termB: 'Execute',
    explanationA: 'Làm cho nó TỒN TẠI (Đưa ý tưởng, chính sách, hệ thống vào thực tế để bắt đầu hoạt động).',
    explanationB: 'Làm cho nó XONG (Thực thi dứt khoát hoàn tất một kế hoạch; hoặc thực hiện một động tác thể thao/vũ đạo/âm nhạc).',
    ruleSummary: 'Chính sách, hệ thống ➔ IMPLEMENT. Động tác khó, cú sút, kế hoạch dứt khoát ➔ EXECUTE.',
    testQuestions: [
      {
        question: 'The dance crew spent hours practicing to ______ every movement flawlessly on stage.',
        options: ['implement', 'execute', 'construct', 'delegate'],
        correctIndex: 1,
        explanation: 'Quy tắc cốt lõi: Trong thể thao, biểu diễn vũ đạo khi thực hiện động tác khó ➔ Luôn dùng EXECUTE.'
      },
      {
        question: 'The management board plans to ______ a new flexible working policy next quarter.',
        options: ['execute', 'implement', 'coerce', 'vanish'],
        correctIndex: 1,
        explanation: 'Đưa chính sách mới vào đời sống thực tế ➔ Dùng IMPLEMENT a policy.'
      }
    ]
  },
  {
    id: 'forgo-vs-relinquish',
    title: 'Forgo vs. Relinquish (Từ bỏ & Buông tay)',
    termA: 'Forgo',
    termB: 'Relinquish',
    explanationA: 'Tự nguyện kiềm chế, bỏ qua một thứ bạn sắp nhận hoặc có quyền hưởng (bỏ qua món tráng miệng, từ chối tăng lương).',
    explanationB: 'Buông tay, nhượng lại một quyền lợi, tài sản hoặc quyền kiểm soát mà bạn ĐANG THỰC SỰ NẮM GIỮ.',
    ruleSummary: 'Nhịn/bỏ qua thứ chưa nhận (dessert, pay rise) ➔ FORGO. Buông quyền kiểm soát đang nắm ➔ RELINQUISH.',
    testQuestions: [
      {
        question: 'To help the startup survive the cash-flow crisis, the founders agreed to ______ their annual bonuses.',
        options: ['relinquish', 'forgo', 'execute', 'degrade'],
        correctIndex: 1,
        explanation: 'Bỏ qua, không nhận khoản thưởng sắp tới ➔ Dùng "forgo".'
      },
      {
        question: 'The aging monarch was eventually forced to ______ his throne and executive powers.',
        options: ['forgo', 'relinquish', 'incorporate', 'clarify'],
        correctIndex: 1,
        explanation: 'Từ bỏ ngai vàng và quyền lực đang sở hữu trong tay ➔ Dùng "relinquish".'
      }
    ]
  },
  {
    id: 'explore-vs-discover',
    title: 'Explore vs. Discover (Khám phá & Phát hiện)',
    termA: 'Explore',
    termB: 'Discover',
    explanationA: 'Đi trải nghiệm, thám hiểm, dạo quanh để tìm hiểu sâu về một nơi chốn/vấn đề đã có sẵn.',
    explanationB: 'Phát hiện, tìm ra một vật/sự thật hoàn toàn mới tinh mà trước đó chưa ai biết nó tồn tại.',
    ruleSummary: 'Nơi có sẵn đi dạo tìm hiểu ➔ EXPLORE. Thứ mới tinh lần đầu phát hiện ➔ DISCOVER.',
    testQuestions: [
      {
        question: 'Astronomers used the space telescope to ______ an Earth-like exoplanet never observed before.',
        options: ['explore', 'discover', 'incur', 'alleviate'],
        correctIndex: 1,
        explanation: 'Hành tinh mới tinh chưa từng biết tới ➔ Dùng "discover".'
      },
      {
        question: 'We rented bicycles to ______ the old alleys and historical temples of Hanoi.',
        options: ['discover', 'explore', 'specify', 'capture'],
        correctIndex: 1,
        explanation: 'Địa điểm đã tồn tại sẵn, đi dạo để trải nghiệm tìm hiểu ➔ Dùng "explore".'
      }
    ]
  },
  {
    id: 'feasible-vs-possible-vs-viable',
    title: 'Feasible vs. Possible vs. Viable (Bộ ba tính khả thi)',
    termA: 'Feasible',
    termB: 'Possible',
    termC: 'Viable',
    explanationA: 'Đủ công cụ, tiền bạc, sức lực và nguồn lực thực tế để làm được.',
    explanationB: 'Về mặt xác suất có cơ hội xảy ra (từ 0% đến 100%).',
    explanationC: 'Về tương lai lâu dài: làm xong sẽ sống sót tốt, sinh lời, bền vững.',
    ruleSummary: 'Có cơ hội ➔ Possible. Đủ tiền/công cụ làm ➔ Feasible. Làm xong sinh lời/sống tốt ➔ Viable.',
    testQuestions: [
      {
        question: 'Due to our limited budget, launching a satellite this year is technically not ______.',
        options: ['possible', 'feasible', 'sentimental', 'archaic'],
        correctIndex: 1,
        explanation: 'Nhấn mạnh vào giới hạn ngân sách và nguồn lực thực thi ➔ Dùng "feasible".'
      },
      {
        question: 'Without customer retention, this subscription model is simply not commercially ______ in the long run.',
        options: ['feasible', 'viable', 'tactile', 'speechless'],
        correctIndex: 1,
        explanation: 'Nói về sự sống sót và sinh lời lâu dài của mô hình kinh doanh ➔ Dùng "viable".'
      }
    ]
  },
  {
    id: 'solitude-vs-loneliness',
    title: 'Solitude vs. Loneliness (Tĩnh lặng vs. Cô đơn)',
    termA: 'Solitude',
    termB: 'Loneliness',
    explanationA: 'Trạng thái ở một mình TỰ NGUYỆN mang lại cảm giác an yên, nạp lại năng lượng tích cực.',
    explanationB: 'Cảm giác trống rỗng, buồn bã, bị cô lập tiêu cực do thiếu thốn kết nối xã hội.',
    ruleSummary: 'Một mình an nhiên, nạp năng lượng ➔ SOLITUDE (+). Một mình trống trải, buồn khổ ➔ LONELINESS (-).',
    testQuestions: [
      {
        question: 'He retreated to his cabin in the forest, finding peace and clarity in the quiet ______.',
        options: ['loneliness', 'solitude', 'fatigue', 'probation'],
        correctIndex: 1,
        explanation: 'Ở một mình tự nguyện để nạp năng lượng, tìm thấy bình yên ➔ Dùng "solitude".'
      },
      {
        question: 'Despite living in a crowded megacity, many elderly people suffer from severe ______.',
        options: ['solitude', 'loneliness', 'serenity', 'acclaim'],
        correctIndex: 1,
        explanation: 'Nỗi buồn khổ, trống trải vì thiếu gắn kết ➔ Dùng "loneliness".'
      }
    ]
  },
  {
    id: 'sentimental-vs-nostalgic',
    title: 'Sentimental vs. Nostalgic (Kỷ vật vs. Hoài niệm)',
    termA: 'Sentimental',
    termB: 'Nostalgic',
    explanationA: 'Gắn bó tình cảm sâu đậm với một ĐỒ VẬT, con người hoặc kỷ vật cụ thể (sentimental value).',
    explanationB: 'Cảm giác hoài niệm, nhớ nhung hướng về THỜI GIAN, quá khứ (school days, the 90s).',
    ruleSummary: 'Kỷ vật, đồ vật có giá trị tinh thần ➔ SENTIMENTAL. Nhớ về thời đã qua ➔ NOSTALGIC.',
    testQuestions: [
      {
        question: 'Looking through my old high school yearbooks makes me feel intensely ______.',
        options: ['sentimental', 'nostalgic', 'obsolete', 'deviant'],
        correctIndex: 1,
        explanation: 'Cảm xúc bồi hồi nhớ về khoảng thời gian quá khứ ➔ Dùng "nostalgic".'
      },
      {
        question: "The battered old watch is worthless financially, but it has great ______ value because it belonged to my grandfather.",
        options: ['nostalgic', 'sentimental', 'tactile', 'archaic'],
        correctIndex: 1,
        explanation: 'Giá trị tình cảm gắn liền với kỷ vật/đồ vật cụ thể ➔ Cụm chuẩn "sentimental value".'
      }
    ]
  },
  {
    id: 'eliminate-vs-discard',
    title: 'Eliminate vs. Discard (Xóa sổ vs. Vứt bỏ)',
    termA: 'Eliminate',
    termB: 'Discard',
    explanationA: 'Xóa sổ hoàn toàn một vấn đề, nhu cầu, căn bệnh, rào cản (eliminate the need, eliminate poverty).',
    explanationB: 'Vứt bỏ một vật thể cụ thể vào thùng rác vì không còn cần dùng nữa (discard old clothes).',
    ruleSummary: 'Triệt tiêu nhu cầu/vấn đề trừu tượng ➔ ELIMINATE. Vứt đồ vật cũ vào sọt rác ➔ DISCARD.',
    testQuestions: [
      {
        question: 'Digital signatures have helped to ______ the need for printing physical papers.',
        options: ['discard', 'eliminate', 'forgo', 'tackle'],
        correctIndex: 1,
        explanation: 'Loại bỏ hoàn toàn nhu cầu (the need for) ➔ Dùng "eliminate".'
      },
      {
        question: 'Before moving into the new apartment, I decided to ______ all damaged furniture and worn-out rags.',
        options: ['eliminate', 'discard', 'execute', 'delegate'],
        correctIndex: 1,
        explanation: 'Vứt bỏ đồ đạc cụ thể không dùng nữa ➔ Dùng "discard".'
      }
    ]
  },
  {
    id: 'remedy-vs-medicine-vs-cure',
    title: 'Remedy vs. Medicine vs. Cure (Phương thuốc)',
    termA: 'Remedy',
    termB: 'Medicine',
    termC: 'Cure',
    explanationA: 'Phương thuốc dân gian, mẹo chữa tại nhà không cần kê đơn (gừng, mật ong, nước muối).',
    explanationB: 'Thuốc men tây y, dược phẩm hóa học do bác sĩ kê đơn.',
    explanationC: 'Phương pháp điều trị chữa khỏi hoàn toàn, dứt điểm căn bệnh.',
    ruleSummary: 'Mẹo dân gian/tự chữa ➔ Remedy. Thuốc tây bác sĩ kê ➔ Medicine. Chữa dứt điểm ➔ Cure.',
    testQuestions: [
      {
        question: 'Drinking hot ginger tea with honey is a time-tested home ______ for treating mild colds.',
        options: ['cure', 'medicine', 'remedy', 'fatigue'],
        correctIndex: 2,
        explanation: 'Mẹo dân gian tại nhà ➔ Dùng "home remedy".'
      },
      {
        question: 'Scientists around the world are still striving to find a permanent ______ for Alzheimer’s disease.',
        options: ['remedy', 'prescription', 'cure', 'intake'],
        correctIndex: 2,
        explanation: 'Phương pháp chữa khỏi dứt điểm hoàn toàn ➔ Dùng "permanent cure".'
      }
    ]
  }
];

export const COLLOCATION_QUESTIONS: CollocationQuestion[] = [
  {
    id: 'c1',
    sentence: "Due to heavy workload, I am completely swamped ______ unread client emails.",
    targetMissing: 'with',
    options: ['with', 'by', 'of', 'in'],
    correctAnswer: 'with',
    explanation: 'Cấu trúc cố định: "be swamped WITH something" (ngập đầu trong việc gì).',
    vietnameseMeaning: 'ngập đầu trong email khách hàng'
  },
  {
    id: 'c2',
    sentence: "People say that she has an inability ______ adapt to rapid workplace transitions.",
    targetMissing: 'to',
    options: ['to', 'of', 'for', 'with'],
    correctAnswer: 'to',
    explanation: 'QUY TẮC BẮT BUỘC: inability + TO-infinitive (không bao giờ dùng "inability of doing").',
    vietnameseMeaning: 'sự không có khả năng thích nghi'
  },
  {
    id: 'c3',
    sentence: "High inflation exerts profound downward pressure ______ household consumer spending.",
    targetMissing: 'on',
    options: ['on', 'to', 'for', 'over'],
    correctAnswer: 'on',
    explanation: 'Cấu trúc: exert pressure/influence ON someone/something (đè nặng áp lực lên ai/cái gì).',
    vietnameseMeaning: 'đè nặng áp lực lên chi tiêu hộ gia đình'
  },
  {
    id: 'c4',
    sentence: "Faced with the inevitable restructuring, he was finally resigned ______ accepting the transfer.",
    targetMissing: 'to',
    options: ['to', 'with', 'for', 'about'],
    correctAnswer: 'to',
    explanation: 'Cấu trúc: "be resigned TO something / V-ing" (cam chịu số phận/chấp nhận thực tại).',
    vietnameseMeaning: 'cam chịu chấp nhận việc thuyên chuyển'
  },
  {
    id: 'c5',
    sentence: "The suspect claimed that detectives had coerced him ______ signing the false confession.",
    targetMissing: 'into',
    options: ['into', 'to', 'for', 'onto'],
    correctAnswer: 'into',
    explanation: 'Cấu trúc chuẩn người bản xứ: coerce someone INTO V-ing (ép buộc ai làm gì).',
    vietnameseMeaning: 'ép buộc anh ta ký vào lời thú tội sai sự thật'
  },
  {
    id: 'c6',
    sentence: "He was surprisingly ignorant ______ the legal risks involved in that contract.",
    targetMissing: 'of',
    options: ['of', 'about', 'with', 'to'],
    correctAnswer: 'of',
    explanation: 'Cấu trúc học thuật: "S + be + ignorant OF + noun" (kém hiểu biết / không biết về điều gì).',
    vietnameseMeaning: 'kém hiểu biết về các rủi ro pháp lý'
  },
  {
    id: 'c7',
    sentence: "After a thorough police investigation, the criminal was convicted ______ grand larceny.",
    targetMissing: 'of',
    options: ['of', 'for', 'with', 'by'],
    correctAnswer: 'of',
    explanation: 'Cấu trúc: "be convicted OF + tên tội danh" (bị kết án vì tội gì).',
    vietnameseMeaning: 'bị kết án vì tội trộm cắp tài sản lớn'
  },
  {
    id: 'c8',
    sentence: "The breakthrough in renewable battery storage paved the way ______ green mobility.",
    targetMissing: 'for',
    options: ['for', 'to', 'with', 'in'],
    correctAnswer: 'for',
    explanation: 'Thành ngữ C1: "pave the way FOR something" (mở đường / tạo tiền đề cho cái gì).',
    vietnameseMeaning: 'mở đường cho phương tiện giao thông xanh'
  },
  {
    id: 'c9',
    sentence: "The product team decided to incorporate biometric verification ______ their mobile app.",
    targetMissing: 'into',
    options: ['into', 'to', 'for', 'at'],
    correctAnswer: 'into',
    explanation: 'LỖI SAI HAY GẶP: Không dùng "incorporate to". Phải dùng "incorporate something INTO something".',
    vietnameseMeaning: 'tích hợp xác thực sinh trắc học vào ứng dụng'
  },
  {
    id: 'c10',
    sentence: "The committee finally reached a consensus ______ the revised conference itinerary.",
    targetMissing: 'on',
    options: ['on', 'with', 'for', 'at'],
    correctAnswer: 'on',
    explanation: 'Cụm từ C1: "reach a consensus ON something" (đạt được sự đồng thuận về việc gì).',
    vietnameseMeaning: 'đạt được sự đồng thuận về lịch trình hội nghị'
  },
  {
    id: 'c11',
    sentence: "Continuous loud engine noise will definitely interfere ______ your ability to concentrate.",
    targetMissing: 'with',
    options: ['with', 'to', 'on', 'against'],
    correctAnswer: 'with',
    explanation: 'Cấu trúc: "interfere WITH something" (gây cản trở / ảnh hưởng tiêu cực tới cái gì).',
    vietnameseMeaning: 'gây cản trở khả năng tập trung của bạn'
  },
  {
    id: 'c12',
    sentence: "While researching in the archives, she was deeply absorbed ______ old historical records.",
    targetMissing: 'in',
    options: ['in', 'with', 'at', 'into'],
    correctAnswer: 'in',
    explanation: 'Cụm từ: "absorbed IN something" (đầu óc say sưa, mải mê vào việc gì).',
    vietnameseMeaning: 'đắm chìm say sưa trong các tài liệu lịch sử cũ'
  },
  {
    id: 'c13',
    sentence: "Hey, what are you up ______ this upcoming holiday weekend?",
    targetMissing: 'to',
    options: ['to', 'for', 'with', 'about'],
    correctAnswer: 'to',
    explanation: 'Cụm khẩu ngữ rất tự nhiên: "be up to something" (đang dự định / toan tính làm gì).',
    vietnameseMeaning: 'bạn đang dự định làm gì vào kỳ nghỉ cuối tuần này?'
  },
  {
    id: 'c14',
    sentence: "The company strictly adheres to the principle ______ equal pay for equal work.",
    targetMissing: 'of',
    options: ['of', 'for', 'with', 'in'],
    correctAnswer: 'of',
    explanation: 'Cụm từ: "the principle of equal pay" (nguyên tắc trả lương bình đẳng).',
    vietnameseMeaning: 'nguyên tắc trả lương bình đẳng cho công việc như nhau'
  },
  {
    id: 'c15',
    sentence: "She has made an outstanding contribution ______ global environmental conservation.",
    targetMissing: 'to',
    options: ['to', 'for', 'with', 'in'],
    correctAnswer: 'to',
    explanation: 'Cấu trúc cố định: "make a contribution TO something" (đóng góp vào cái gì).',
    vietnameseMeaning: 'đóng góp nổi bật vào bảo tồn môi trường toàn cầu'
  },
  {
    id: 'c16',
    sentence: "The sudden hike in fuel costs poses a serious threat ______ sustainable transport systems.",
    targetMissing: 'to',
    options: ['to', 'for', 'with', 'against'],
    correctAnswer: 'to',
    explanation: 'Cấu trúc: "pose a threat TO someone/something" (gây ra mối đe dọa đối với ai/cái gì).',
    vietnameseMeaning: 'gây ra mối đe dọa nghiêm trọng đối với hệ thống giao thông bền vững'
  },
  {
    id: 'c17',
    sentence: "The researchers placed great emphasis ______ empirical laboratory evidence.",
    targetMissing: 'on',
    options: ['on', 'to', 'in', 'at'],
    correctAnswer: 'on',
    explanation: 'Cấu trúc: "place/put emphasis ON something" (chú trọng/nhấn mạnh vào điều gì).',
    vietnameseMeaning: 'chú trọng rất lớn vào bằng chứng thực nghiệm trong phòng thí nghiệm'
  },
  {
    id: 'c18',
    sentence: "The manufacturing plant was formally accused ______ dumping untreated toxic sludge.",
    targetMissing: 'of',
    options: ['of', 'for', 'with', 'by'],
    correctAnswer: 'of',
    explanation: 'Cấu trúc: "accuse someone OF doing something" (buộc tội ai vì hành vi gì).',
    vietnameseMeaning: 'bị chính thức cáo buộc vì xả bùn độc hại chưa qua xử lý'
  },
  {
    id: 'c19',
    sentence: "All corporate entities are legally required to comply ______ federal safety regulations.",
    targetMissing: 'with',
    options: ['with', 'to', 'for', 'in'],
    correctAnswer: 'with',
    explanation: 'Cấu trúc: "comply WITH rules/regulations" (tuân thủ theo quy định).',
    vietnameseMeaning: 'tuân thủ theo các quy định an toàn của liên bang'
  },
  {
    id: 'c20',
    sentence: "Automated machine learning has exerted a profound impact ______ modern employment trends.",
    targetMissing: 'on',
    options: ['on', 'to', 'for', 'over'],
    correctAnswer: 'on',
    explanation: 'Cấu trúc: "exert an impact ON something" (tạo ra tác động lên điều gì).',
    vietnameseMeaning: 'tạo ra tác động sâu sắc lên các xu hướng việc làm hiện đại'
  }
];

export const CONTEXT_QUESTIONS: ContextQuestion[] = [
  {
    id: 'ctx1',
    contextType: 'IELTS Writing',
    sentence: "The company's latest acquisition strategy aims to expand its market share and ______ direct competitors.",
    blank: 'eliminate',
    options: ['eliminate', 'discard', 'relinquish', 'interfere'],
    correctAnswer: 'eliminate',
    explanation: 'Loại bỏ hoàn toàn đối thủ cạnh tranh trên thị trường ➔ Dùng "eliminate direct competitors".',
    fullTranslation: 'Chiến lược sáp nhập và mua lại mới nhất của công ty nhằm mở rộng thị phần và loại bỏ các đối thủ cạnh tranh trực tiếp.'
  },
  {
    id: 'ctx2',
    contextType: 'IELTS Writing',
    sentence: "If greenhouse gases continue to accumulate unchecked, the damage inflicted on arctic ecosystems will be ______.",
    blank: 'irreversible',
    options: ['irreversible', 'portable', 'superficial', 'provisional'],
    correctAnswer: 'irreversible',
    explanation: 'Thiệt hại vĩnh viễn không thể khắc phục hay đảo ngược ➔ Dùng "irreversible damage".',
    fullTranslation: 'Nếu khí nhà kính tiếp tục tích tụ không kiểm soát, thiệt hại gây ra cho các hệ sinh thái bắc cực sẽ không thể đảo ngược.'
  },
  {
    id: 'ctx3',
    contextType: 'Business',
    sentence: "Injecting capital into research and development remains the single most effective catalyst for ______ economic growth.",
    blank: 'accelerating',
    options: ['accelerating', 'brightening', 'swamping', 'degrading'],
    correctAnswer: 'accelerating',
    explanation: 'Đẩy nhanh, tăng tốc tăng trưởng kinh tế ➔ "accelerating economic growth".',
    fullTranslation: 'Rót vốn vào nghiên cứu và phát triển vẫn là chất xúc tác hiệu quả nhất duy nhất để đẩy nhanh tăng trưởng kinh tế.'
  },
  {
    id: 'ctx4',
    contextType: 'IELTS Writing',
    sentence: "Non-profit organizations have launched microfinance initiatives to empower families living in ______ rural communities.",
    blank: 'impoverished',
    options: ['impoverished', 'archaic', 'speechless', 'monumental'],
    correctAnswer: 'impoverished',
    explanation: 'Thay thế cực tốt cho "very poor" trong IELTS Task 2 ➔ "impoverished communities".',
    fullTranslation: 'Các tổ chức phi lợi nhuận đã triển khai các sáng kiến tài chính vi mô để tiếp sức cho các gia đình sống tại những cộng đồng nông thôn nghèo khó.'
  },
  {
    id: 'ctx5',
    contextType: 'IELTS Speaking',
    sentence: "When the host announced that our university team took the first prize, I was completely ______.",
    blank: 'speechless',
    options: ['speechless', 'illiterate', 'obtuse', 'deviant'],
    correctAnswer: 'speechless',
    explanation: 'Lặng người, không thốt nên lời vì quá đỗi vui sướng hoặc kinh ngạc ➔ "completely speechless".',
    fullTranslation: 'Khi người dẫn chương trình thông báo đội trường đại học chúng tôi đạt giải nhất, tôi hoàn toàn lặng người không thốt nên lời.'
  },
  {
    id: 'ctx6',
    contextType: 'IELTS Writing',
    sentence: "Unlike digital e-books, physical paperbacks provide readers with a rich ______ experience through touch and texture.",
    blank: 'tactile',
    options: ['tactile', 'circadian', 'nocturnal', 'confidential'],
    correctAnswer: 'tactile',
    explanation: 'Trải nghiệm xúc giác từ việc chạm vào trang giấy ➔ "tactile experience".',
    fullTranslation: 'Không giống như sách điện tử kỹ thuật số, sách bìa mềm truyền thống mang lại cho độc giả trải nghiệm xúc giác phong phú thông qua việc chạm và cảm nhận chất liệu.'
  },
  {
    id: 'ctx7',
    contextType: 'Business',
    sentence: "The auditor found that the company lacked basic internal controls, thus failing to ensure corporate ______.",
    blank: 'accountability',
    options: ['accountability', 'narcissism', 'probation', 'serenity'],
    correctAnswer: 'accountability',
    explanation: 'Trách nhiệm giải trình của doanh nghiệp ➔ "corporate accountability".',
    fullTranslation: 'Kiểm toán viên phát hiện công ty thiếu các biện pháp kiểm soát nội bộ cơ bản, từ đó không đảm bảo được trách nhiệm giải trình của doanh nghiệp.'
  },
  {
    id: 'ctx8',
    contextType: 'Daily English',
    sentence: "Before rushing to the presentation room, let's stop at the cafeteria and grab a quick ______ to eat.",
    blank: 'bite',
    options: ['bite', 'pill', 'haste', 'rag'],
    correctAnswer: 'bite',
    explanation: 'Thành ngữ khẩu ngữ: "grab a bite" (ăn vội chút gì lót dạ).',
    fullTranslation: 'Trước khi vội vã đến phòng thuyết trình, hãy ghé vào căng tin và ăn vội chút gì lót dạ đi.'
  },
  {
    id: 'ctx9',
    contextType: 'IELTS Writing',
    sentence: "The newly drafted industrial regulations are ______ enough to ensure worker safety without crippling productivity.",
    blank: 'stringent',
    options: ['stringent', 'crispy', 'slender', 'flavorful'],
    correctAnswer: 'stringent',
    explanation: 'Quy định nghiêm ngặt, chặt chẽ ➔ "stringent regulations".',
    fullTranslation: 'Các quy định công nghiệp mới được soạn thảo đủ nghiêm ngặt để đảm bảo an toàn cho người lao động mà không làm tê liệt năng suất.'
  },
  {
    id: 'ctx10',
    contextType: 'IELTS Writing',
    sentence: "Establishing community green spaces and expanding cycle tracks will ______ urban traffic stress significantly.",
    blank: 'alleviate',
    options: ['alleviate', 'prosecute', 'torment', 'coerce'],
    correctAnswer: 'alleviate',
    explanation: 'Làm giảm nhẹ, xoa dịu áp lực/ô nhiễm ➔ Dùng "alleviate urban traffic stress".',
    fullTranslation: 'Thiết lập không gian xanh cộng đồng và mở rộng làn đường dành cho xe đạp sẽ giảm nhẹ đáng kể áp lực giao thông đô thị.'
  },
  {
    id: 'ctx11',
    contextType: 'IELTS Writing',
    sentence: "Substantial subsidies for renewable energy infrastructure will act as an indispensable ______ for clean energy transition.",
    blank: 'catalyst',
    options: ['catalyst', 'dilemma', 'remedy', 'solitude'],
    correctAnswer: 'catalyst',
    explanation: 'Chất xúc tác mạnh mẽ thúc đẩy sự chuyển đổi ➔ Dùng "catalyst".',
    fullTranslation: 'Các khoản trợ cấp đáng kể cho cơ sở hạ tầng năng lượng tái tạo sẽ đóng vai trò như một chất xúc tác không thể thiếu cho quá trình chuyển đổi năng lượng sạch.'
  },
  {
    id: 'ctx12',
    contextType: 'IELTS Writing',
    sentence: "Extensive scientific surveys were conducted to ______ the working hypothesis regarding ocean acidification.",
    blank: 'substantiate',
    options: ['substantiate', 'discard', 'deteriorate', 'interfere'],
    correctAnswer: 'substantiate',
    explanation: 'Chứng minh bằng bằng chứng thực nghiệm ➔ Dùng "substantiate the hypothesis".',
    fullTranslation: 'Các cuộc khảo sát khoa học quy mô lớn đã được tiến hành để chứng minh giả thuyết nghiên cứu liên quan đến sự axit hóa đại dương.'
  },
  {
    id: 'ctx13',
    contextType: 'Business',
    sentence: "Without steady recurring subscribers, this ambitious SaaS business model is simply not commercially ______.",
    blank: 'viable',
    options: ['viable', 'ignorant', 'tactile', 'speechless'],
    correctAnswer: 'viable',
    explanation: 'Có khả năng sinh lời và tồn tại lâu dài ➔ Dùng "commercially viable".',
    fullTranslation: 'Nếu không có lượng người đăng ký định kỳ ổn định, mô hình kinh doanh SaaS đầy tham vọng này đơn giản là không khả thi về mặt thương mại.'
  },
  {
    id: 'ctx14',
    contextType: 'IELTS Speaking',
    sentence: "Growing up in a peaceful coastal village gave me an enduring appreciation for quiet ______.",
    blank: 'solitude',
    options: ['solitude', 'loneliness', 'fatigue', 'probation'],
    correctAnswer: 'solitude',
    explanation: 'Sự tĩnh lặng một mình an yên tích cực ➔ Dùng "solitude".',
    fullTranslation: 'Lớn lên ở một ngôi làng ven biển thanh bình đã mang lại cho tôi sự trân trọng bền bỉ đối với sự tĩnh lặng an yên.'
  },
  {
    id: 'ctx15',
    contextType: 'IELTS Writing',
    sentence: "Smartphone ubiquity and social media overuse have become increasingly ______ among secondary school pupils.",
    blank: 'prevalent',
    options: ['prevalent', 'portable', 'meticulous', 'slender'],
    correctAnswer: 'prevalent',
    explanation: 'Thịnh hành, phổ biến rộng rãi trong một nhóm đối tượng ➔ Dùng "prevalent".',
    fullTranslation: 'Sự phổ biến của điện thoại thông minh và việc lạm dụng mạng xã hội đã trở nên ngày càng thịnh hành trong giới học sinh trung học.'
  }
];

export const GRAMMAR_TIPS = [
  {
    title: 'Cấu trúc "There will be / There can be" + Danh từ',
    rule: 'Sau cấu trúc "There will be / There can be", bắt buộc phải đi kèm với CỤM DANH TỪ, KHÔNG được cộng trực tiếp với một Tính từ (Adj) đứng trơ trọi.',
    wrongExample: 'There will be difficult in the upcoming semester.',
    correctExample: 'There will be significant difficulties in the upcoming semester. (hoặc There will be challenges...)',
    takeaway: 'Chỉ "There" dùng được cho cả số ít và số nhiều. "This" không thay thế được cho "There" trong cấu trúc tồn tại này.'
  },
  {
    title: 'Sở hữu cách bị động: "its destruction" thay vì "destruction of it"',
    rule: 'Người bản xứ và bài thi IELTS Band cao rất chuộng tính từ sở hữu đi với Danh từ chỉ hành động (its destruction, its excessive use).',
    wrongExample: 'The destruction of it was caused by the storm.',
    correctExample: 'The storm caused its destruction.',
    takeaway: 'Khi thấy "its + Noun chỉ hành động", dịch chuẩn xác là "Hành động tác động lên chính đối tượng đó" (its destruction = con người/thiên tai phá hủy nó).'
  },
  {
    title: 'Quy tắc "Inability + TO Verb" (Tuyệt đối không dùng "of doing")',
    rule: 'Danh từ "inability" (sự bất lực / không thể) bắt buộc đi với động từ nguyên mẫu có TO: inability to do something.',
    wrongExample: 'He has an inability of focusing during exams.',
    correctExample: 'He has an inability to focus during exams.',
    takeaway: 'Danh từ hóa động từ "cannot" thành "inability to do sth" là kỹ năng bắt buộc để đạt Band 7+ Writing.'
  },
  {
    title: 'Cấu trúc nhấn mạnh "Emphatic Do / Did"',
    rule: 'Trong câu khẳng định thì hiện tại đơn hoặc quá khứ đơn, ta có thể thêm do/does/did trước động từ nguyên thể để nhấn mạnh sự thật.',
    wrongExample: 'I remembered your birthday (bình thường).',
    correctExample: 'I did remember your birthday! (nhấn mạnh: Tôi thực sự có nhớ mà!) / I do hope you come.',
    takeaway: 'Sử dụng rất tự nhiên trong văn nói trang trọng hoặc phản biện để khẳng định lại sự việc.'
  },
  {
    title: 'Mẹo trạng từ "By far" với so sánh nhất và so sánh hơn',
    rule: '"By far" dùng để nhấn mạnh sự chênh lệch vượt trội rất lớn. Thường đứng trước hoặc sau so sánh nhất.',
    wrongExample: 'He is far the best candidate.',
    correctExample: 'He is by far the best candidate. / The population of USA is larger by far than that of Canada.',
    takeaway: 'Vị trí: By far + the + adj-est/most adj HOẶC The + adj-est/most adj + by far.'
  },
  ...VSTEP_PDF_GRAMMAR_BANK.map(gr => ({
    title: `[Ôn thi VSTEP PDF - ${gr.pdfPage}] ${gr.title}`,
    rule: `${gr.ruleFormula} — ${gr.explanationVi}`,
    wrongExample: gr.examples[0]?.wrong || gr.comparisonOrTrap,
    correctExample: gr.examples[0]?.correct || '',
    takeaway: gr.comparisonOrTrap
  }))
];

