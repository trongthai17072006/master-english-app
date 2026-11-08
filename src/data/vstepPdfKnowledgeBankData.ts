import { PdfKnowledgeRecord } from './expandedPdfLibraryData';
import { VocabItem } from './vocabularyData';

/**
 * NGÂN HÀNG KIẾN THỨC MỞ RỘNG KHÔNG GIỚI HẠN — TRÍCH XUẤT TOÀN DIỆN TỪ FILE "Ôn thi vstep.pdf" (83 TRANG)
 *
 * Bảo toàn nguyên vẹn:
 * 1. Bản gốc từ PDF của người học (originalContent / originalNotes)
 * 2. Bản biên tập chuẩn hóa B2–C1 / Band 7.0–8.0+ (editedContent)
 * 3. Phân loại rõ kỳ thi: 'IELTS' | 'VSTEP' | 'IELTS & VSTEP'
 * 4. Liên kết 1-nhiều với Lộ trình 60 Ngày (Days 1–60) và Lộ trình Mở rộng Không giới hạn (Days 61+)
 * 5. Trạng thái chống trùng lặp (dedupStatus):
 *    - 'new': Kiến thức hoàn toàn mới từ PDF 83 trang
 *    - 'existing_enhanced_examples': Đã có khái niệm tương đương nhưng PDF có ví dụ thực chiến tốt hơn -> gộp ví dụ
 *    - 'existing_better_explanation': Đã có nhưng PDF có mẹo/giải thích 2 tầng rõ hơn -> bổ sung ghi chú
 *    - 'needs_review': Câu hỏi/ghi chú trong PDF chưa có đáp án hoàn chỉnh -> gắn nhãn Cần bổ sung + gợi ý mẫu
 */

export type ExamBadgeType = 'IELTS' | 'VSTEP' | 'IELTS & VSTEP';
export type DedupResolutionStatus =
  | 'new'
  | 'existing_enhanced_examples'
  | 'existing_better_explanation'
  | 'needs_review';

export type KnowledgeItemCategory =
  | 'structure'
  | 'grammar'
  | 'vocabulary'
  | 'speaking_part1'
  | 'speaking_part2'
  | 'speaking_part3'
  | 'writing_task2'
  | 'writing_task1'
  | 'listening'
  | 'study_note';

export interface PdfStructureBankItem {
  id: string;
  title: string;
  formula: string;
  purposeVi: string;
  skill: 'Writing' | 'Speaking' | 'Writing & Speaking' | 'Task 1 Letter';
  examType: ExamBadgeType;
  cefrLevel: 'B1' | 'B2' | 'C1';
  topic: string;
  pdfPage: string;
  dedupStatus: DedupResolutionStatus;
  originalPdfContent: string;
  editedStandardContent: string;
  examplesEnVi: { en: string; vi: string }[];
  commonMistakeNote?: string;
  linkedChallengeDays: number[];
  addedAt: string;
}

export interface PdfGrammarBankItem {
  id: string;
  title: string;
  ruleFormula: string;
  explanationVi: string;
  comparisonOrTrap: string;
  examType: ExamBadgeType;
  pdfPage: string;
  dedupStatus: DedupResolutionStatus;
  originalPdfNote: string;
  examples: { wrong?: string; correct: string; vi: string }[];
  practiceQuiz: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanationVi: string;
  };
  linkedChallengeDays: number[];
  addedAt: string;
}

export interface PdfSpeakingPart1Item {
  id: string;
  topicEn: string;
  topicVi: string;
  examType: ExamBadgeType;
  pdfPage: string;
  dedupStatus: DedupResolutionStatus;
  questions: {
    qId: string;
    questionEn: string;
    questionVi: string;
    originalPdfDraft?: string;
    upgradedSampleB2C1: string;
    upgradedSampleVi: string;
    keyVocab: string[];
    status: 'complete' | 'needs_review';
  }[];
  linkedChallengeDays: number[];
  addedAt: string;
}

export interface PdfSpeakingPart2Item {
  id: string;
  title: string;
  situationEn: string;
  situationVi: string;
  examType: ExamBadgeType;
  pdfPage: string;
  dedupStatus: DedupResolutionStatus;
  options: [string, string, string];
  chosenOption: string;
  reasonsForChoice: string[];
  counterArgumentsForOthers: string[];
  originalPdfSpeech: string;
  upgradedSampleB2C1: string;
  upgradedSampleVi: string;
  keyVocab: string[];
  linkedChallengeDays: number[];
  addedAt: string;
}

export interface PdfSpeakingPart3Item {
  id: string;
  topicTitle: string;
  centralStatementEn: string;
  centralStatementVi: string;
  examType: ExamBadgeType;
  pdfPage: string;
  dedupStatus: DedupResolutionStatus;
  mainIdeas: { idea: string; explanation: string }[];
  originalPdfSpeech: string;
  upgradedSampleB2C1: string;
  upgradedSampleVi: string;
  followUpQuestions: {
    questionEn: string;
    questionVi: string;
    sampleAnswerEn: string;
    sampleAnswerVi: string;
  }[];
  keyVocab: string[];
  linkedChallengeDays: number[];
  addedAt: string;
}

export interface PdfWritingBankItem {
  id: string;
  taskCategory: 'Task 2 Essay' | 'Task 1 Letter';
  essayType: string;
  topicTitle: string;
  promptEn: string;
  promptVi: string;
  examType: ExamBadgeType;
  pdfPage: string;
  dedupStatus: DedupResolutionStatus;
  outline: {
    intro: string;
    body1: string;
    body2: string;
    conclusion: string;
  };
  originalAuthorEssay: string;
  authorSelfNotes: string;
  upgradedBand75Essay: string;
  upgradedEssayVi: string;
  targetVocabulary: {
    word: string;
    pos: string;
    meaningVi: string;
    exampleEn: string;
  }[];
  linkedChallengeDays: number[];
  addedAt: string;
}

export interface PdfListeningBankItem {
  id: string;
  title: string;
  type: 'short_conversation_mcq' | 'listening_strategy';
  examType: ExamBadgeType;
  pdfPage: string;
  questionEn: string;
  questionVi: string;
  options?: string[];
  correctOption?: string;
  transcriptEn: string;
  transcriptVi: string;
  keyEvidenceExplanation: string;
  chunkingPhrases: { phrase: string; meaningVi: string; phoneticNote?: string }[];
  linkedChallengeDays: number[];
  addedAt: string;
}

export interface PdfStudyNoteItem {
  id: string;
  title: string;
  category: 'exam_reminder' | 'writing_technique' | 'error_log' | 'unfinished_prompt';
  pdfPage: string;
  originalNoteText: string;
  systemActionableAdvice: string;
  reviewStatus: 'verified' | 'needs_review';
  linkedChallengeDays: number[];
}

export const VSTEP_PDF_METADATA = {
  fileName: 'Ôn thi vstep.pdf',
  assetPath: '/assets/documents/_n_thi_vstep_11d6f8c6.pdf',
  totalPages: 83,
  extractedAt: '2026-11-02',
  description:
    'Kho dữ liệu học tập thực chiến 83 trang bao gồm công thức triển khai ý Writing & Speaking, ngữ pháp chống bẫy, từ vựng & collocations C1, bộ đề Speaking Part 1-2-3, bài luận Writing gốc & bài mẫu nâng cấp, mẫu thư Task 1 và chiến thuật Listening.'
};

// ============================================================================
// A. NGÂN HÀNG CẤU TRÚC & CÔNG THỨC TRIỂN KHAI Ý (STRUCTURE BANK — 18 MẪU LỚN)
// ============================================================================
export const VSTEP_PDF_STRUCTURE_BANK: PdfStructureBankItem[] = [
  {
    id: 'vstep-pdf-struct-01',
    title: 'Công thức F-S-F Biến Thể Cho Đoạn Thân Bài (Body Paragraph Architecture)',
    formula: 'Topic Sentence (1 câu) + Idea 1 (1 câu) + Detail 1 (1–2 câu) + Idea 2 (1 câu) + Detail 2 (1–2 câu)',
    purposeVi: 'Khung xương sống 5–6 câu cho mọi đoạn Body Paragraph trong IELTS Writing Task 2 và VSTEP Essay',
    skill: 'Writing',
    examType: 'IELTS & VSTEP',
    cefrLevel: 'B2',
    topic: 'Academic Essay Structure',
    pdfPage: 'Trang 10',
    dedupStatus: 'new',
    originalPdfContent:
      'Công thức F-S-F biến thể: 1 câu Topic Sentence (nêu ý chính toàn đoạn) + 2 câu Supporting Ideas (First / Second) + 2 cụm Supporting Details (Giải thích / Ví dụ / Giải thích + Ví dụ). Tổng cộng 1 đoạn Body dài chuẩn 5–6 câu.',
    editedStandardContent:
      'On the one hand, there are several compelling reasons why [Chủ đề]. First and foremost, [Supporting Idea 1]. This is largely because [Supporting Detail 1 - Giải thích], which enables individuals to [Hệ quả]. Second, [Supporting Idea 2]. For example, [Supporting Detail 2 - Ví dụ thực tế], thereby demonstrating [Kết luận nhỏ].',
    examplesEnVi: [
      {
        en: 'On the one hand, relocating businesses to rural areas offers notable benefits. First, it significantly reduces operational costs. This is because land rent and labor expenses in the countryside are much lower than in metropolitan centers. Second, it helps alleviate urban congestion. For instance, when Samsung established major factories in Bac Ninh and Thai Nguyen, thousands of workers settled locally instead of migrating to Hanoi.',
        vi: 'Một mặt, việc chuyển doanh nghiệp về vùng nông thôn mang lại nhiều lợi ích đáng kể. Thứ nhất, nó giảm đáng kể chi phí vận hành. Điều này là do giá thuê đất và chi phí nhân công ở nông thôn thấp hơn nhiều so với trung tâm đô thị. Thứ hai, nó giúp giảm tải tắc nghẽn đô thị. Chẳng hạn, khi Samsung đặt nhà máy lớn tại Bắc Ninh và Thái Nguyên, hàng nghìn công nhân đã an cư tại địa phương thay vì đổ dồn về Hà Nội.'
      }
    ],
    commonMistakeNote:
      'Tránh liệt kê 3–4 ý nhỏ nhưng không có câu giải thích (Supporting Detail) — giám khảo sẽ chấm lỗi "underdeveloped ideas" (Band 5.5).',
    linkedChallengeDays: [1, 2, 5, 16, 20, 46, 61],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-struct-02',
    title: '3 Cách Viết Supporting Details: Giải Thích • Ví Dụ • Giải Thích + Ví Dụ',
    formula:
      'Cách 1: This is because + S + V, which leads to + N | Cách 2: For example, S + V | Cách 3: In fact, S + V. Take [X] as a prime example; S + V',
    purposeVi: 'Triển khai chiều sâu lập luận sau câu Supporting Idea để đạt điểm Task Response 7.0+',
    skill: 'Writing',
    examType: 'IELTS & VSTEP',
    cefrLevel: 'C1',
    topic: 'Idea Development',
    pdfPage: 'Trang 10 & Trang 32',
    dedupStatus: 'existing_better_explanation',
    originalPdfContent:
      'Giải thích 1 tầng vs Giải thích 2 tầng (Trang 32): Giải thích 1 tầng chỉ nói "đọc báo mạng rất tiện lợi". Giải thích 2 tầng chỉ rõ cơ chế: "Chỉ với một chiếc điện thoại có kết nối Internet, người đọc có thể truy cập hàng ngàn đầu báo quốc tế ngay lập tức mà không tốn chi phí in ấn hay vận chuyển."',
    editedStandardContent:
      '[Supporting Idea]. Specifically, [Giải thích tầng 1: Nguyên lý hoạt động], which allows [Giải thích tầng 2: Tác động trực tiếp lên người dùng/xã hội]. Take [Ví dụ cụ thể] as a case in point: [Mệnh đề minh họa].',
    examplesEnVi: [
      {
        en: 'Digital newspapers offer unmatched convenience. Specifically, with a single smartphone connected to the internet, readers can access breaking news globally within seconds, eliminating the need to wait for morning print deliveries.',
        vi: 'Báo điện tử mang lại sự tiện lợi vượt trội. Cụ thể, chỉ với một chiếc điện thoại thông minh kết nối mạng, độc giả có thể tiếp cận tin tức nóng hổi toàn cầu trong vài giây, xóa bỏ hoàn toàn việc phải chờ giao báo giấy buổi sáng.'
      }
    ],
    commonMistakeNote:
      'Không dừng lại ở tính từ chung chung như "convenient, good, bad, helpful" mà phải trả lời tiếp "Convenient bằng cách nào? Giúp tiết kiệm cái gì?".',
    linkedChallengeDays: [3, 8, 17, 22, 48, 61],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-struct-03',
    title: 'Công Thức Đoạn Văn Nguyên Nhân – Hệ Quả – Giải Pháp (Cause • Effect • Solution)',
    formula:
      'One major cause is + N. This is because + S + V -> Consequently, S + V -> One effective solution is for governments/individuals to + V',
    purposeVi: 'Dàn ý chuẩn cho dạng bài Causes & Solutions hoặc Problems & Solutions',
    skill: 'Writing',
    examType: 'IELTS & VSTEP',
    cefrLevel: 'B2',
    topic: 'Causes & Solutions Essay',
    pdfPage: 'Trang 9 & Trang 22–23',
    dedupStatus: 'new',
    originalPdfContent:
      'Công thức chuỗi 5 mắt xích (Trang 23): Nguyên nhân -> Giải thích -> Hậu quả -> Ví dụ thực tế -> Kết quả (Cause -> Explanation -> Effect -> Example -> Result).',
    editedStandardContent:
      'One primary cause of [Vấn đề] is [Nguyên nhân]. This stems from the fact that [Giải thích], which gradually leads to [Hậu quả]. For instance, [Ví dụ thực tế]. To tackle this issue, an effective solution is for authorities and families to [Giải pháp], thereby [Kết quả tích cực].',
    examplesEnVi: [
      {
        en: 'One primary cause of rising antisocial behavior is the unmoderated use of social media. This stems from the fact that algorithms reward sensational content, which desensitizes young users. For instance, toxic debates on TikTok, Facebook, and Threads often normalize cyberbullying. To address this, parents and schools should cultivate digital etiquette at an early stage.',
        vi: 'Một nguyên nhân chính của sự gia tăng hành vi phản xã hội là việc sử dụng mạng xã hội thiếu kiểm soát. Điều này bắt nguồn từ việc thuật toán ưu tiên nội dung giật gân, làm giảm sự đồng cảm của người dùng trẻ. Chẳng hạn, các cuộc tranh cãi độc hại trên TikTok, Facebook và Threads thường bình thường hóa bạo lực mạng. Để giải quyết, phụ huynh và nhà trường cần giáo dục văn hóa ứng xử số ngay từ giai đoạn sớm.'
      }
    ],
    linkedChallengeDays: [6, 12, 24, 35, 50, 62],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-struct-04',
    title: 'Bảng So Sánh 3 Dạng Bài Luận Trọng Tâm: Opinion vs. Outweigh vs. Discussion',
    formula:
      '1. Opinion: Totally/Partly agree | 2. Outweigh: While there are some drawbacks, the benefits are far more significant | 3. Discussion: While some argue X, I believe Y',
    purposeVi: 'Phân biệt chính xác cách đặt Thesis Statement (Câu luận đề) để không bị lạc đề',
    skill: 'Writing',
    examType: 'IELTS & VSTEP',
    cefrLevel: 'B2',
    topic: 'Thesis Statement Formulas',
    pdfPage: 'Trang 27',
    dedupStatus: 'new',
    originalPdfContent:
      'Bảng phân biệt 3 dạng bài luận (Trang 27): Dạng 1 (Agree/Disagree): Nêu rõ mức độ đồng tình ngay từ Intro. Dạng 2 (Advantages outweigh Disadvantages): Phải có cả 2 mặt nhưng nghiêng hẳn về mặt mạnh hơn ở Body 2. Dạng 3 (Discuss both views and give your opinion): Body 1 bàn quan điểm A, Body 2 bàn quan điểm B kèm chính kiến cá nhân.',
    editedStandardContent:
      '• Opinion: While there are valid arguments to the contrary, I firmly believe that [Quan điểm].\n• Outweigh: Although [Chủ đề] entails certain drawbacks, I contend that its long-term advantages far outweigh the disadvantages.\n• Discussion: While some people maintain that [Quan điểm 1], I side with those who argue that [Quan điểm 2].',
    examplesEnVi: [
      {
        en: 'Although relocating factories to rural regions entails initial logistical hurdles, I contend that its socioeconomic and environmental advantages far outweigh the disadvantages.',
        vi: 'Mặc dù việc di dời nhà máy về vùng nông thôn kéo theo một số trở ngại hậu cần ban đầu, tôi cho rằng những lợi ích kinh tế - xã hội và môi trường lâu dài của nó vượt trội hơn hẳn các bất lợi.'
      }
    ],
    linkedChallengeDays: [4, 10, 18, 28, 40, 55, 62],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-struct-05',
    title: 'Mẫu Mở Bài Vạn Năng Cho Đô Thị Hóa, Giao Thông & Môi Trường',
    formula:
      'In recent years, [topic] has become an increasingly pressing issue in many parts of the world, sparking intense debate over whether [X] or [Y].',
    purposeVi: 'Mở bài học thuật chuẩn C1 chỉ trong 2 câu (Background Hook + Thesis Statement)',
    skill: 'Writing',
    examType: 'IELTS & VSTEP',
    cefrLevel: 'C1',
    topic: 'Urbanization & Environment',
    pdfPage: 'Trang 21 & Trang 25',
    dedupStatus: 'existing_enhanced_examples',
    originalPdfContent:
      'Mẫu mở bài vạn năng (Trang 25) & Template 3 câu cho bài Môi trường (Trang 21): Câu 1 giới thiệu sức nóng của chủ đề; Câu 2 nêu 2 luồng quan điểm đối lập; Câu 3 khẳng định lập trường cá nhân.',
    editedStandardContent:
      'In recent years, [environmental degradation / urban congestion] has become an increasingly pressing issue in many metropolitan areas. While some people argue that [View A], others maintain that [View B]. In my opinion, both perspectives warrant consideration, yet [Main Stance] requires more urgent action.',
    examplesEnVi: [
      {
        en: 'In recent years, biodiversity loss has become an increasingly pressing issue globally. While some argue that the extinction of specific plant and animal species is the primary ecological crisis, others contend that pollution and climate change are far more urgent. In my view, these challenges are deeply interconnected.',
        vi: 'Trong những năm gần đây, suy giảm đa dạng sinh học đã trở thành một vấn đề ngày càng cấp bách trên toàn cầu. Trong khi một số người cho rằng sự tuyệt chủng của các loài động thực vật là khủng hoảng sinh thái chính, những người khác lại khẳng định ô nhiễm và biến đổi khí hậu cấp thiết hơn nhiều. Theo quan điểm của tôi, các thách thức này gắn kết chặt chẽ với nhau.'
      }
    ],
    linkedChallengeDays: [7, 14, 21, 33, 47, 63],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-struct-06',
    title: 'Bộ 35 Cụm Từ Chức Năng Đa Dụng (Functional Academic Discourse Markers)',
    formula:
      'It is widely argued that... | From an economic standpoint,... | This can be attributed to... | By contrast,... | Taking everything into account,...',
    purposeVi: 'Tăng điểm Coherence & Cohesion (Mạch lạc & Liên kết) trong cả Writing và Speaking Part 3',
    skill: 'Writing & Speaking',
    examType: 'IELTS & VSTEP',
    cefrLevel: 'C1',
    topic: 'Cohesion & Discourse Markers',
    pdfPage: 'Trang 2–3 & Trang 26',
    dedupStatus: 'new',
    originalPdfContent:
      '30–40 cụm từ chức năng đa dụng chia theo 6 nhóm: Mở đầu quan điểm (It is worth noting that, From my perspective), Giải thích nguyên nhân (This stems from, A key factor behind this is), Đưa bằng chứng (A prime example of this is), Phản biện/Đối lập (On the flip side, Nevertheless), Nhấn mạnh (Undoubtedly, It is by no means...), Kết luận (All things considered, In summary).',
    editedStandardContent:
      '1. Nêu luận điểm: From a socioeconomic standpoint, ...\n2. Giải thích sâu: This can largely be attributed to the fact that ...\n3. Đưa hệ quả: ..., thereby alleviating / exacerbating ...\n4. Phản biện: However, this issue is by no means irreversible if ...',
    examplesEnVi: [
      {
        en: 'From an environmental standpoint, urban sprawl accelerates habitat fragmentation; however, this trend is by no means irreversible if governments enforce green-belt regulations.',
        vi: 'Dưới góc độ môi trường, sự bành trướng đô thị làm gia tăng tình trạng chia cắt môi trường sống; tuy nhiên, xu hướng này hoàn toàn không phải là không thể đảo ngược nếu chính phủ thực thi quy định vành đai xanh.'
      }
    ],
    linkedChallengeDays: [9, 15, 25, 38, 52, 63],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-struct-07',
    title: 'Phương Pháp 5W2H Mở Rộng Ý Tưởng Speaking Không Bao Giờ Bí Ý',
    formula: 'What + Why + When + Where + Who + How + How often / How much',
    purposeVi: 'Kéo dài câu trả lời Speaking Part 1 & Part 2 từ 1 câu cụt ngủn thành 3–5 câu tự nhiên, trôi chảy',
    skill: 'Speaking',
    examType: 'IELTS & VSTEP',
    cefrLevel: 'B2',
    topic: 'Speaking Fluency Strategy',
    pdfPage: 'Trang 1',
    dedupStatus: 'new',
    originalPdfContent:
      'Phương pháp 5W2H (Trang 1): Khi gặp bất kỳ câu hỏi Speaking nào, đừng chỉ trả lời Yes/No. Hãy ghép ít nhất 3 nhánh: What (Đó là gì?) + When/Who (Khi nào, với ai?) + Why/How (Tại sao bạn thích? Nó mang lại cảm giác/lợi ích gì?).',
    editedStandardContent:
      '[Direct Answer: What & How often] + [Context: When / Where / With Whom] + [Reason & Feeling: Why it matters / How it benefits me].',
    examplesEnVi: [
      {
        en: 'What is your favorite meal of the day? -> Definitely breakfast (What). Every morning around 7 a.m. before heading to my university classes (When), I usually grab a hot bowl of beef pho or bun along with an iced milk coffee from Highlands Coffee (Where/What). It fuels my brain and keeps me energetic throughout the morning lectures (Why/How).',
        vi: 'Bữa ăn yêu thích trong ngày của bạn là gì? -> Chắc chắn là bữa sáng (What). Mỗi sáng khoảng 7 giờ trước khi lên giảng đường đại học (When), tôi thường ăn một bát phở bò hoặc bún nóng hổi kèm một ly cà phê sữa đá Highlands (Where/What). Nó tiếp năng lượng cho não bộ và giúp tôi tỉnh táo suốt các ca học sáng (Why/How).'
      }
    ],
    linkedChallengeDays: [1, 3, 11, 19, 31, 49, 64],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-struct-08',
    title: 'Khung Template VSTEP Speaking Part 2: Thảo Luận Giải Pháp (Solution Discussion)',
    formula:
      '1. Introduction (Nêu tình huống & Chốt Option chọn) -> 2. Two Main Reasons (Firstly... Secondly...) -> 3. Counter-arguments (Why not Option B & C) -> 4. Conclusion',
    purposeVi: 'Cấu trúc bài nói 2 phút chuẩn B2–C1 cho phần thi VSTEP Speaking Part 2 (Chọn 1 trong 3 phương án)',
    skill: 'Speaking',
    examType: 'VSTEP',
    cefrLevel: 'B2',
    topic: 'VSTEP Speaking Part 2',
    pdfPage: 'Trang 4–5',
    dedupStatus: 'new',
    originalPdfContent:
      'Template VSTEP Part 2 (Trang 4-5): Given the situation that..., among the three options (...), I firmly believe that [Option X] is the most suitable choice. There are two main reasons for my decision. To begin with,... Furthermore,... On the other hand, I do not opt for [Option Y] because... Similarly, although [Option Z] seems appealing, it... For all these reasons, [Option X] is definitely the optimal solution.',
    editedStandardContent:
      'Considering the situation where [Paraphrase đề], among the three proposed options, I would definitely opt for [Option A] as the most practical choice. To begin with, [Lý do 1 + Giải thích]. Moreover, [Lý do 2 + Ví dụ]. Turning to the other alternatives, while [Option B] has some merits, it is less ideal because [Nhược điểm B]. Likewise, I rule out [Option C] since [Nhược điểm C]. All things considered, [Option A] remains the wisest decision.',
    examplesEnVi: [
      {
        en: 'Considering the situation where my sister wants to lose weight, among the three options, I would definitely advise her to go to the gym. To begin with, working out with professional equipment and trainers helps burn calories safely and tones her physique. On the other hand, taking weight-loss drugs carries severe side effects, while extreme dieting can cause nutritional imbalance.',
        vi: 'Xét tình huống chị gái tôi muốn giảm cân, trong ba lựa chọn, tôi chắc chắn khuyên chị ấy đi tập gym. Trước hết, tập luyện với thiết bị chuyên nghiệp và huấn luyện viên giúp đốt cháy calo an toàn và săn chắc vóc dáng. Mặt khác, uống thuốc giảm cân tiềm ẩn tác dụng phụ nghiêm trọng, trong khi ăn kiêng khắc nghiệt dễ gây mất cân bằng dinh dưỡng.'
      }
    ],
    commonMistakeNote:
      'Lưu ý từ PDF Trang 66: Tuyệt đối không nói "2 option" (sai) mà phải nói "Option 2" hoặc "the second option". Có thể dùng trực tiếp "Option 3" làm chủ ngữ.',
    linkedChallengeDays: [2, 6, 13, 23, 36, 51, 64],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-struct-09',
    title: 'Khung Template VSTEP Speaking Part 3: Phát Triển Chủ Đề & Câu Hỏi Thảo Luận',
    formula:
      '1. Paraphrase Central Statement -> 2. Develop 3 Mind-map Nodes (First / Second / Third + Example) -> 3. Conclusion -> 4. Answer Follow-up Questions (Direct + Justification + Example)',
    purposeVi: 'Khung thuyết trình sơ đồ tư duy VSTEP Part 3 và trả lời câu hỏi thảo luận IELTS Part 3',
    skill: 'Speaking',
    examType: 'IELTS & VSTEP',
    cefrLevel: 'C1',
    topic: 'Speaking Part 3 Topic Development',
    pdfPage: 'Trang 5–6',
    dedupStatus: 'new',
    originalPdfContent:
      'Template Part 3 (Trang 5-6): I completely agree with the statement that [Chủ đề]. First and foremost, [Ý 1]. This means that... Second, [Ý 2]. For instance,... Finally, we should not overlook [Ý 3]. In conclusion, [Tóm lại chủ đề].',
    editedStandardContent:
      'It is widely acknowledged that [Paraphrase Central Statement]. There are several compelling factors supporting this view. First and foremost, [Node 1 + Explanation]. Second, [Node 2 + Real-life Example]. Finally, [Node 3 / Own Idea + Long-term Impact]. In summary, these aspects clearly demonstrate why [Central Statement].',
    examplesEnVi: [
      {
        en: 'It is widely acknowledged that group traveling brings numerous advantages to tourists. First and foremost, traveling in a group significantly reduces individual expenses since members can split accommodation and transport costs. Second, it strengthens social bonds through shared memories. Therefore, group travel is a rewarding choice for most holidaymakers.',
        vi: 'Nhiều người đồng tình rằng đi du lịch theo nhóm mang lại vô số lợi ích cho du khách. Trước hết, đi theo nhóm giúp giảm đáng kể chi phí cá nhân vì các thành viên có thể chia sẻ tiền phòng và đi lại. Thứ hai, nó gắn kết tình cảm qua những kỷ niệm chung. Do đó, du lịch nhóm là lựa chọn tuyệt vời cho đa số du khách.'
      }
    ],
    linkedChallengeDays: [5, 15, 27, 39, 53, 65],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-struct-10',
    title: 'Chiến Thuật "1 Đối Tượng Mẫu = Cân Sạch Mọi Đề Part 2" (5 Nhóm Chủ Đề)',
    formula:
      '1. People (Bạn gái / Người thân) | 2. Activity (Đi du lịch) | 3. Things (iPhone / Xe mơ ước) | 4. Experience (Trải nghiệm VIP / Sinh nhật) | 5. Place (Singapore / Nhà hàng yêu thích)',
    purposeVi: 'Chuẩn bị sẵn 5 cốt truyện lõi linh hoạt để xoay chuyển cho hàng chục đề IELTS Cue Card & VSTEP',
    skill: 'Speaking',
    examType: 'IELTS & VSTEP',
    cefrLevel: 'B2',
    topic: 'Universal Speaking Story Frames',
    pdfPage: 'Trang 72–75',
    dedupStatus: 'new',
    originalPdfContent:
      'Chiến thuật 1 đối tượng mẫu cân sạch mọi đề (Trang 72–75): Thay vì học thuộc lòng 50 bài mẫu rời rạc, chỉ cần nắm vững 5 khung nhân vật/sự vật: (1) People: Bạn gái (xinh đẹp, chu đáo, truyền cảm hứng); (2) Activity: Đi du lịch (giảm căng thẳng, mở mang tầm mắt); (3) Things: Chiếc điện thoại mới / Xe hơi mơ ước; (4) Experience: Trải nghiệm dịch vụ cao cấp; (5) Place: Đất nước Singapore xanh-sạch-hiện đại hoặc Nhà hàng yêu thích.',
    editedStandardContent:
      'Khi gặp đề "Describe a person who inspires you / a helpful person / a family member or friend", dùng chung bộ từ vựng: supportive, considerate, a great listener, broaden my horizons, accompany me through thick and thin.',
    examplesEnVi: [
      {
        en: 'Whenever I am asked about an inspiring person or someone I enjoy spending time with, I immediately think of my girlfriend. Not only is she remarkably considerate and supportive, but she also motivates me to stay disciplined with my academic and fitness goals.',
        vi: 'Bất cứ khi nào được hỏi về một người truyền cảm hứng hoặc người tôi thích dành thời gian cùng, tôi lập tức nghĩ đến bạn gái mình. Cô ấy không chỉ vô cùng chu đáo và luôn ủng hộ tôi, mà còn tiếp thêm động lực để tôi giữ kỷ luật với mục tiêu học tập và rèn luyện thể hình.'
      }
    ],
    linkedChallengeDays: [10, 20, 30, 40, 50, 60, 65],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-struct-11',
    title: 'Thang Đo Mức Độ Chắc Chắn Trong Speaking & Writing (4 Cấp Độ Certainty)',
    formula:
      '100%: Undoubtedly / Without a shadow of a doubt | 80–90%: In all likelihood / It is highly probable that | 50–70%: Tends to / Might | <30%: It is doubtful whether',
    purposeVi: 'Tránh tuyệt đối hóa cực đoan (Overgeneralization) và thể hiện sắc thái học thuật tinh tế (Hedging)',
    skill: 'Writing & Speaking',
    examType: 'IELTS & VSTEP',
    cefrLevel: 'C1',
    topic: 'Hedging & Modality',
    pdfPage: 'Trang 76',
    dedupStatus: 'new',
    originalPdfContent:
      'Phân tầng mức độ chắc chắn (Trang 76): 100% (Definitely, Undoubtedly, Unquestionably); 80-90% (Almost certainly, In all likelihood, There is a strong possibility that); 50-70% (Probably, Potentially, It seems likely that); Dưới 30% (Unlikely, Doubtful, There is a slim chance that).',
    editedStandardContent:
      'Sử dụng Hedging (80–90% hoặc 50–70%) khi dự đoán xu hướng tương lai trong Writing Task 2 để bài viết khách quan, chặt chẽ hơn.',
    examplesEnVi: [
      {
        en: 'In all likelihood, digital media will continue to dominate news consumption, yet there is a slim chance that printed books will vanish entirely.',
        vi: 'Rất có khả năng truyền thông số sẽ tiếp tục thống trị việc đọc tin tức, nhưng khả năng sách in biến mất hoàn toàn là rất thấp.'
      }
    ],
    linkedChallengeDays: [12, 26, 42, 56, 66],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-struct-12',
    title: '5 Câu Cố Định & Khung Thư Thân Mật VSTEP Task 1 (Informal Letter Template)',
    formula:
      'Dear [Name], -> How have you been doing recently? -> The main reason I am writing this email is to... -> Let me know your thoughts -> Drop me a line soon! Best wishes,',
    purposeVi: 'Hoàn thành bức thư thân mật VSTEP Task 1 (120+ từ) trong 10 phút với cấu trúc chuẩn B2–C1',
    skill: 'Task 1 Letter',
    examType: 'VSTEP',
    cefrLevel: 'B2',
    topic: 'VSTEP Task 1 Letters',
    pdfPage: 'Trang 28–31 & Trang 80',
    dedupStatus: 'new',
    originalPdfContent:
      '5 câu cố định cho Informal Letter (Trang 28-29) & Mở đầu thư kể chuyện đại học (Trang 80): "I hope that the letter finds you in good health and spirits. It has been a while since we last caught up, as I have been quite tied up with my university studies..."',
    editedStandardContent:
      'Dear [Name],\nI hope this letter finds you in good health and high spirits. How have you been doing recently? I am sorry for not writing sooner as I have been quite tied up with my final exams at university.\nThe main reason I am writing this email is to share some exciting news and answer your questions about [Topic]...\nAnyway, I have to get back to my study schedule now. Drop me a line soon and let me know how things are going on your end!\nWarm regards,\n[Your Name]',
    examplesEnVi: [
      {
        en: 'I hope that this letter finds you in good health and spirits. The main reason I am writing is to tell you about my first semester majoring in Finance and Banking.',
        vi: 'Mình hy vọng bức thư này đến tay bạn khi bạn vẫn khỏe mạnh và tinh thần phấn chấn. Lý do chính mình viết thư này là để kể cho bạn nghe về học kỳ đầu tiên theo học chuyên ngành Tài chính - Ngân hàng.'
      }
    ],
    linkedChallengeDays: [15, 29, 44, 58, 66],
    addedAt: '2026-11-02'
  }
];

// ============================================================================
// B. NGÂN HÀNG NGỮ PHÁP & SỬA LỖI THỰC CHIẾN (GRAMMAR BANK — 14 CHUYÊN ĐỀ TỪ PDF)
// ============================================================================
export const VSTEP_PDF_GRAMMAR_BANK: PdfGrammarBankItem[] = [
  {
    id: 'vstep-pdf-gram-01',
    title: 'Phân biệt "to + V" (Mục đích) vs. "to + V-ing" (Sau danh từ cầu nối & tính từ)',
    ruleFormula:
      '• Chỉ mục đích: S + V + to + V_bare\n• Danh từ cầu nối: the key / solution / secret / approach / way / barrier + to + V-ing\n• Tính từ cố định: be used / accustomed / committed / dedicated / opposed + to + V-ing',
    explanationVi:
      'Trong tiếng Anh, chữ "to" thông thường là dấu hiệu của động từ nguyên mẫu (to V). Tuy nhiên, khi đi sau các danh từ mang nghĩa "chìa khóa/giải pháp/con đường dẫn tới đâu" hoặc các cụm tính từ chỉ sự quen thuộc/tận tâm, "to" đóng vai trò là GIỚI TỪ (preposition), do đó bắt buộc phải cộng với Danh từ hoặc V-ing.',
    comparisonOrTrap: 'Bẫy hay gặp nhất: "The key to solve this problem" (SAI) -> "The key to solving this problem" (ĐÚNG).',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 15',
    dedupStatus: 'existing_better_explanation',
    originalPdfNote:
      'Trang 15: to + V (chỉ mục đích: để làm gì) vs to + V-ing khi đứng sau danh từ chỉ "cầu nối" (key, solution, secret, way, road + to V-ing) và tính từ (used, committed, dedicated + to V-ing).',
    examples: [
      {
        wrong: 'The government is committed to reduce carbon emissions.',
        correct: 'The government is committed to reducing carbon emissions.',
        vi: 'Chính phủ cam kết cắt giảm lượng khí thải carbon.'
      },
      {
        wrong: 'Education is the most effective key to eradicate poverty.',
        correct: 'Education is the most effective key to eradicating poverty.',
        vi: 'Giáo dục là chìa khóa hữu hiệu nhất để xóa đói giảm nghèo.'
      }
    ],
    practiceQuiz: {
      question: 'Chọn đáp án đúng: "Strict environmental legislation is the key to _______ biodiversity loss."',
      options: ['prevent', 'preventing', 'prevented', 'be prevent'],
      correctAnswer: 'preventing',
      explanationVi: 'Sau danh từ cầu nối "the key to", chữ "to" là giới từ nên đi với V-ing (preventing).'
    },
    linkedChallengeDays: [4, 15, 31, 61],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-gram-02',
    title: 'Collocation Y Khoa: "Take medicine" vs. "Drink medicine"',
    ruleFormula: 'take + medicine / pills / antibiotics / supplements / weight-loss drugs (KHÔNG dùng drink)',
    explanationVi:
      'Người Việt thường dịch word-by-word "uống thuốc" là "drink medicine". Trong tiếng Anh chuẩn, mọi loại thuốc (viên, nước, thực phẩm chức năng) đều đi với động từ "take".',
    comparisonOrTrap: 'SAI: "drink weight loss drugs" -> ĐÚNG: "take weight-loss drugs / take medication".',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 7 & Trang 14',
    dedupStatus: 'new',
    originalPdfNote:
      'Trang 14: Uống thuốc bắt buộc dùng "take medicine", tuyệt đối không nói "drink medicine" trong Speaking Part 2 (đề giảm cân cho chị gái).',
    examples: [
      {
        wrong: 'My sister wants to drink weight loss medicine to get slim quickly.',
        correct: 'My sister is considering taking weight-loss pills to slim down quickly.',
        vi: 'Chị gái tôi đang cân nhắc uống thuốc giảm cân để thon gọn nhanh chóng.'
      }
    ],
    practiceQuiz: {
      question: 'Câu nào sau đây dùng collocation chuẩn bản xứ?',
      options: [
        'Patients should take their prescribed medication on time.',
        'Patients should drink their prescribed pills on time.',
        'Patients should eat their liquid medicine on time.',
        'Patients should swallow-drink medicine every morning.'
      ],
      correctAnswer: 'Patients should take their prescribed medication on time.',
      explanationVi: 'Collocation chuẩn: take medication / take medicine / take pills.'
    },
    linkedChallengeDays: [6, 36, 61],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-gram-03',
    title: 'Phân biệt "Also / Too" (Câu khẳng định) vs. "Either" (Câu phủ định)',
    ruleFormula:
      '• Khẳng định (+): S + also + V / S + V..., too.\n• Phủ định (-): S + aux + not + V..., either.',
    explanationVi:
      'Khi muốn nói "cũng không..." trong câu phủ định (có not / never / neither), tuyệt đối không dùng "too" hay "also" ở cuối câu mà phải chuyển thành "either".',
    comparisonOrTrap: 'SAI: "I do not choose Option B too." -> ĐÚNG: "I do not choose Option B, either."',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 14',
    dedupStatus: 'new',
    originalPdfNote: 'Trang 14: Also / Too dùng cho câu khẳng định (+); Either dùng cho câu phủ định (-).',
    examples: [
      {
        wrong: 'Online newspapers are free, and they do not waste paper too.',
        correct: 'Online newspapers are free, and they do not waste paper, either.',
        vi: 'Báo điện tử miễn phí, và chúng cũng không gây lãng phí giấy.'
      }
    ],
    practiceQuiz: {
      question: 'Điền từ đúng: "Fast food is low in essential nutrients, and it is not economical in the long run, _______."',
      options: ['too', 'also', 'either', 'as well'],
      correctAnswer: 'either',
      explanationVi: 'Mệnh đề phía trước ở thể phủ định ("is not economical") nên cuối câu phải dùng "either".'
    },
    linkedChallengeDays: [7, 22, 62],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-gram-04',
    title: 'Cụm Cố Định "Go on + a diet / a trip / a strike / a date"',
    ruleFormula: 'go on + a diet / a business trip / a company trip / a strike / a date / holiday / vacation',
    explanationVi:
      'Cấu trúc "go on + danh từ chỉ hoạt động kéo dài theo đợt" giúp bài nói Speaking Part 1 & Part 2 tự nhiên như người bản xứ.',
    comparisonOrTrap: 'Chú ý: "go on a diet" (ăn kiêng), "go on an annual company trip" (đi du lịch công ty hằng năm).',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 14 & Trang 43',
    dedupStatus: 'new',
    originalPdfNote: 'Trang 14: go on a diet (ăn kiêng), go on a trip (đi chuyến du lịch), go on a strike (đình công), go on a date (hẹn hò).',
    examples: [
      {
        correct: 'Instead of going on an extreme diet, young people should maintain a balanced workout routine.',
        vi: 'Thay vì ăn kiêng khắc nghiệt, người trẻ nên duy trì lịch tập luyện cân đối.'
      }
    ],
    practiceQuiz: {
      question: 'Chọn cụm từ đúng: "Our department is planning to _______ a three-day camping trip in the countryside."',
      options: ['go on', 'do in', 'make at', 'play on'],
      correctAnswer: 'go on',
      explanationVi: 'Cụm cố định: go on a trip / go on a camping trip.'
    },
    linkedChallengeDays: [11, 43, 62],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-gram-05',
    title: 'Tính từ (Adjective) vs. Trạng từ (Adverb) Bổ Nghĩa Cho Động Từ Thường',
    ruleFormula:
      '• S + be / become / seem / feel + Adjective\n• S + (Adverb) + Action Verb + (Object) + (Adverb)',
    explanationVi:
      'Tính từ bổ nghĩa cho Danh từ hoặc đứng sau Linking Verbs. Ngược lại, khi bổ nghĩa cho động từ chỉ hành động (affect, disrupt, grow, relocate), bắt buộc phải dùng Trạng từ (Adverb -ly), có thể đứng ngay trước động từ chính hoặc sau tân ngữ.',
    comparisonOrTrap: 'SAI: "disrupt significant the local ecosystem" -> ĐÚNG: "significantly disrupt the local ecosystem".',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 15',
    dedupStatus: 'existing_enhanced_examples',
    originalPdfNote: 'Trang 15: Vị trí của Trạng từ có thể đứng trước hoặc sau Động từ thường để bổ nghĩa cho hành động đó.',
    examples: [
      {
        wrong: 'Industrial waste affects negative the surrounding rivers.',
        correct: 'Industrial waste negatively affects the surrounding rivers.',
        vi: 'Chất thải công nghiệp tác động tiêu cực đến các dòng sông xung quanh.'
      }
    ],
    practiceQuiz: {
      question: 'Chọn dạng từ đúng: "Relocating factories to rural zones can _______ alleviate traffic congestion in major cities."',
      options: ['substantial', 'substantially', 'substance', 'substantiate'],
      correctAnswer: 'substantially',
      explanationVi: 'Cần trạng từ "substantially" đứng trước động từ thường "alleviate" để bổ nghĩa.'
    },
    linkedChallengeDays: [9, 18, 62],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-gram-06',
    title: 'Phân biệt "Reduction OF" (Con số cụ thể) vs. "Reduction IN" (Khía cạnh/Chất lượng)',
    ruleFormula:
      '• a reduction OF + [Số liệu / Phần trăm cụ thể: 20%, $500]\n• a reduction IN + [Danh từ chỉ lĩnh vực / đối tượng bị giảm: stress, carbon emissions, crime rates]',
    explanationVi:
      'Khi nêu đối tượng hoặc lĩnh vực được cắt giảm (giảm căng thẳng, giảm chi phí, giảm ô nhiễm), luôn dùng giới từ "IN" (a reduction in...). Chỉ dùng "OF" khi theo sau là một con số định lượng.',
    comparisonOrTrap: 'Hay nhầm trong Writing Task 2: "a reduction in operational costs" (giảm chi phí vận hành) vs "a reduction of 30%".',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 33',
    dedupStatus: 'new',
    originalPdfNote: 'Trang 33: reduction of (đi với con số cụ thể) vs reduction in (đi với chất lượng, danh từ trừu tượng, lĩnh vực).',
    examples: [
      {
        wrong: 'Traveling in a group leads to a significant reduction of travel expenses.',
        correct: 'Traveling in a group leads to a significant reduction in travel expenses.',
        vi: 'Đi du lịch theo nhóm giúp giảm đáng kể chi phí chuyến đi.'
      }
    ],
    practiceQuiz: {
      question: 'Điền giới từ chuẩn xác: "Regular physical exercise contributes to a noticeable reduction ___ workplace anxiety."',
      options: ['in', 'of', 'at', 'with'],
      correctAnswer: 'in',
      explanationVi: '"workplace anxiety" là danh từ chỉ khía cạnh/trạng thái nên dùng "a reduction in".'
    },
    linkedChallengeDays: [14, 33, 63],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-gram-07',
    title: 'Quy Tắc Động Từ Khuyết Thiếu (Modal Verbs + Bare Infinitive)',
    ruleFormula: 'can / could / may / might / must / should / would + V_nguyên_mẫu (Bị động: Modal + be + V3/ed)',
    explanationVi:
      'Sau tất cả các động từ khuyết thiếu (Modal verbs), động từ chính luôn ở dạng nguyên mẫu không "to" và tuyệt đối không chia ngôi thứ 3 số ít (-s/es) hay quá khứ (-ed).',
    comparisonOrTrap: 'Lỗi thực tế trong PDF Trang 66: "could leads to" hoặc "could offered" -> Sửa thành "could lead to", "could offer".',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 34 & Trang 66',
    dedupStatus: 'existing_enhanced_examples',
    originalPdfNote: 'Trang 34 & 66: Modal verbs + V nguyên mẫu. Tránh lỗi thêm -s hoặc -ed sau could/would/should.',
    examples: [
      {
        wrong: 'Working excessively long hours could leads to severe burnout.',
        correct: 'Working excessively long hours could lead to severe burnout.',
        vi: 'Làm việc nhiều giờ kéo dài có thể dẫn đến kiệt sức nghiêm trọng.'
      }
    ],
    practiceQuiz: {
      question: 'Sửa lỗi câu sau: "Public schools could provides a more affordable education for children."',
      options: ['could provide', 'could providing', 'could to provide', 'could provided'],
      correctAnswer: 'could provide',
      explanationVi: 'Sau modal verb "could" bắt buộc là động từ nguyên mẫu "provide".'
    },
    linkedChallengeDays: [2, 16, 63],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-gram-08',
    title: 'Động Từ Tri Giác (Verbs of Perception) + V_bare vs. V-ing',
    ruleFormula:
      '• see / hear / watch / notice / feel + Object + V_bare (Chứng kiến toàn bộ hành động từ đầu đến cuối)\n• see / hear / watch / notice / feel + Object + V-ing (Bắt gặp hành động đang diễn ra tại một thời điểm)',
    explanationVi:
      'Cấu trúc động từ tri giác rất hữu ích khi kể lại trải nghiệm thực tế trong Speaking Part 1, 2, 3 và viết thư VSTEP Task 1.',
    comparisonOrTrap: 'Không dùng "to V" ở thể chủ động sau see/watch/hear.',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 35',
    dedupStatus: 'new',
    originalPdfNote: 'Trang 35: Động từ tri giác (see, hear, watch, feel) + O + V nguyên mẫu (toàn bộ) hoặc V-ing (đang diễn ra).',
    examples: [
      {
        correct: 'When I walk through the park in the morning, I often see elderly people practicing Tai Chi.',
        vi: 'Khi đi dạo qua công viên vào buổi sáng, tôi thường thấy những người cao tuổi đang tập Thái Cực Quyền.'
      }
    ],
    practiceQuiz: {
      question: 'Chọn đáp án đúng: "While waiting at the café, I noticed many commuters _______ digital newspapers on their tablets."',
      options: ['reading', 'to read', 'reads', 'readed'],
      correctAnswer: 'reading',
      explanationVi: 'notice + Object + V-ing diễn tả việc bắt gặp hành động đang diễn ra.'
    },
    linkedChallengeDays: [19, 38, 63],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-gram-09',
    title: 'Động Từ Sai Khiến (Causative Verbs: Make • Let • Have • Get) & Động Từ Help',
    ruleFormula:
      '• make / let / have + sb + V_bare\n• get + sb + to V\n• help + sb + V_bare / to V\n• Bị động: have / get + sth + V3/ed',
    explanationVi:
      'Nhóm động từ sai khiến và hỗ trợ xuất hiện dày đặc trong bài luận IELTS/VSTEP khi phân tích tác động của chính sách hoặc công nghệ lên con người.',
    comparisonOrTrap: 'SAI: "make people to feel stressed" -> ĐÚNG: "make people feel stressed".',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 35–36',
    dedupStatus: 'existing_enhanced_examples',
    originalPdfNote: 'Trang 35–36: make/let/have + O + V nguyên mẫu; help + O + V / to V.',
    examples: [
      {
        wrong: 'A comfortable workplace makes employees to work more productively.',
        correct: 'A comfortable workplace makes employees work more productively and helps them decompress.',
        vi: 'Môi trường làm việc thoải mái khiến nhân viên làm việc năng suất hơn và giúp họ giải tỏa căng thẳng.'
      }
    ],
    practiceQuiz: {
      question: 'Chọn dạng đúng: "Financial incentives can make corporations _______ their manufacturing plants to rural provinces."',
      options: ['relocate', 'to relocate', 'relocating', 'relocated'],
      correctAnswer: 'relocate',
      explanationVi: 'Cấu trúc chủ động: make + Object + V_bare (relocate).'
    },
    linkedChallengeDays: [3, 21, 64],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-gram-10',
    title: 'Hệ Thống 6 Nhóm Liên Từ Phụ Thuộc (Subordinating Conjunctions)',
    ruleFormula:
      '1. Nguyên nhân (since, as, seeing that) | 2. Nhượng bộ (although, even though, whereas, while) | 3. Điều kiện (provided that, unless) | 4. Mục đích (so that, in order that) | 5. Thời gian (once, as soon as) | 6. Hệ quả (so... that)',
    explanationVi:
      'Sử dụng đa dạng liên từ phụ thuộc để tạo câu phức (Complex Sentences) là điều kiện bắt buộc để đạt Grammatical Range Band 7.0+.',
    comparisonOrTrap: 'Tuyệt đối không dùng đồng thời "Although... but..." hoặc "Because... so..." trong cùng một câu.',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 37',
    dedupStatus: 'existing_enhanced_examples',
    originalPdfNote: 'Trang 37: 6 nhóm liên từ phụ thuộc tạo câu phức học thuật.',
    examples: [
      {
        wrong: 'Although international schools offer modern facilities, but their tuition fees are prohibitively expensive.',
        correct: 'Although international schools offer state-of-the-art facilities, their tuition fees are prohibitively expensive.',
        vi: 'Mặc dù trường quốc tế cung cấp cơ sở vật chất hiện đại, học phí của chúng lại đắt đỏ vượt khả năng chi trả.'
      }
    ],
    practiceQuiz: {
      question: 'Chọn liên từ phù hợp nhất: "_______ urban centers offer abundant job opportunities, the cost of living there is exceedingly high."',
      options: ['While', 'Because of', 'Despite', 'Therefore'],
      correctAnswer: 'While',
      explanationVi: '"While" đứng đầu câu phức nối 2 mệnh đề đối lập nhau (tương đương Although/Whereas).'
    },
    linkedChallengeDays: [8, 25, 45, 64],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-gram-11',
    title: 'Cách Đồng Tình Với Câu Khẳng Định vs. Câu Phủ Định (Ditto! / Same here / Neither do I)',
    ruleFormula:
      '• Đồng tình Khẳng định (+): Me too / So do I / Same here / Likewise / Ditto!\n• Đồng tình Phủ định (-): Me neither / Neither do I / Nor do I',
    explanationVi:
      'Trong giao tiếp thực tế, Listening Short Conversations và Speaking, người bản xứ thường dùng "Same here", "Likewise", "Ditto!" (tôi cũng vậy - khẳng định) và "Me neither / Neither do I" (tôi cũng không - phủ định).',
    comparisonOrTrap: 'Khi người khác nói câu phủ định ("I don\'t like fast food"), không được đáp "Me too" mà phải nói "Me neither" hoặc "Neither do I".',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 77–79',
    dedupStatus: 'new',
    originalPdfNote:
      'Trang 77–79: Phân biệt cách đồng tình với câu khẳng định (So do I, Same here, Likewise, Ditto!) và câu phủ định (Neither do I, Me neither).',
    examples: [
      {
        correct: 'A: "I rarely check work emails late at night." — B: "Neither do I. / Me neither. It disrupts my sleep."',
        vi: 'A: "Tôi hiếm khi kiểm tra email công việc vào đêm muộn." — B: "Tôi cũng không. Nó làm gián đoạn giấc ngủ của tôi."'
      }
    ],
    practiceQuiz: {
      question: 'Người A nói: "I am not a big fan of processed fast food." Câu phản hồi đồng tình nào sau đây ĐÚNG ngữ pháp?',
      options: ['Neither am I.', 'So am I.', 'Me too.', 'I am not, too.'],
      correctAnswer: 'Neither am I.',
      explanationVi: 'Câu của A ở thể phủ định với động từ to-be ("am not"), nên đồng tình chuẩn là "Neither am I" hoặc "Me neither".'
    },
    linkedChallengeDays: [13, 41, 65],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-gram-12',
    title: 'Bảng 8 Lỗi Sai Thực Chiến Cần Tránh Trong VSTEP & IELTS (Error Correction Log)',
    ruleFormula:
      '1. "i" -> "I" | 2. "2 option" -> "Option 2" | 3. "someone who is..." (thừa who khi không có mệnh đề thứ 2) | 4. "at an early stage" | 5. "long working hours" | 6. "could + V_bare" | 7. "imbalance" | 8. Dùng "Option 3" làm chủ ngữ trực tiếp',
    explanationVi:
      'Tổng hợp 8 lỗi sai thực tế được trích xuất trực tiếp từ quá trình luyện tập cá nhân trong PDF trang 66, giúp rà soát bài viết và bài nói trước khi nộp.',
    comparisonOrTrap: 'Đặc biệt lưu ý cụm danh từ chuẩn: "long working hours" (giờ làm việc kéo dài) và "at an early stage" (ngay từ giai đoạn đầu).',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 66',
    dedupStatus: 'new',
    originalPdfNote:
      'Trang 66: Bảng sửa lỗi chi tiết: viết hoa đại từ I; nói Option 2 thay vì 2 option; bỏ đại từ quan hệ who khi câu chỉ có 1 động từ; dùng chuẩn cụm at an early stage, long working hours, imbalance.',
    examples: [
      {
        wrong: 'Someone who is under constant pressure from long work hour.',
        correct: 'Someone is under constant pressure from long working hours, creating a serious work-life imbalance.',
        vi: 'Một người chịu áp lực liên tục từ giờ làm việc kéo dài, tạo ra sự mất cân bằng nghiêm trọng giữa công việc và cuộc sống.'
      }
    ],
    practiceQuiz: {
      question: 'Cách diễn đạt nào chuẩn xác nhất khi gọi tên lựa chọn thứ hai trong VSTEP Speaking Part 2?',
      options: ['Option 2 / the second option', '2 option', 'the two option', 'options number two'],
      correctAnswer: 'Option 2 / the second option',
      explanationVi: 'Danh từ + Số đếm viết hoa (Option 2) hoặc the + số thứ tự + danh từ số ít (the second option).'
    },
    linkedChallengeDays: [20, 48, 65],
    addedAt: '2026-11-02'
  }
];

// ============================================================================
// C. NGÂN HÀNG TỪ VỰNG & COLLOCATIONS TRÍCH XUẤT TỪ PDF (VOCABULARY BANK)
// ============================================================================
export const VSTEP_PDF_VOCAB_BANK: (VocabItem & {
  pdfPage: string;
  examType: ExamBadgeType;
  dedupStatus: DedupResolutionStatus;
  linkedChallengeDays: number[];
})[] = [
  {
    id: 'vstep-pdf-voc-01',
    word: 'exacerbate',
    ipa: '/ɪɡˈzæs.ə.beɪt/',
    pos: 'verb',
    level: 'C1',
    meaning: 'làm trầm trọng thêm (một vấn đề, tình trạng tồi tệ)',
    collocations: ['exacerbate housing shortages', 'exacerbate traffic congestion', 'exacerbate environmental degradation'],
    exampleEn: 'Overcrowding in metropolitan areas continues to exacerbate housing shortages and air pollution.',
    exampleVi: 'Tình trạng quá tải ở các khu đô thị lớn tiếp tục làm trầm trọng thêm sự thiếu hụt nhà ở và ô nhiễm không khí.',
    detailedNote: 'Trích từ Bảng 16 từ vựng học thuật bài Urbanization & Business Relocation (Trang 18 - Ôn thi vstep.pdf).',
    tags: ['urbanization', 'environment', 'ielts-writing', 'vstep', 'c1'],
    pdfPage: 'Trang 18',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'existing_enhanced_examples',
    linkedChallengeDays: [4, 21, 61]
  },
  {
    id: 'vstep-pdf-voc-02',
    word: 'metropolitan',
    ipa: '/ˌmet.rəˈpɒl.ɪ.tən/',
    pos: 'adj',
    level: 'C1',
    meaning: 'thuộc về đại đô thị / trung tâm thành phố lớn',
    collocations: ['metropolitan areas', 'metropolitan centers', 'metropolitan infrastructure'],
    exampleEn: 'Skyrocketing property prices in metropolitan centers force many young workers to rent tiny apartments.',
    exampleVi: 'Giá bất động sản tăng vọt tại các trung tâm đại đô thị buộc nhiều lao động trẻ phải thuê những căn hộ siêu nhỏ.',
    detailedNote: 'Trích từ Bảng từ vựng bài Relocation of Businesses (Trang 17–18 - Ôn thi vstep.pdf).',
    tags: ['urbanization', 'society', 'c1'],
    pdfPage: 'Trang 17–18',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [22, 61]
  },
  {
    id: 'vstep-pdf-voc-03',
    word: 'decentralisation',
    ipa: '/ˌdiː.sen.trə.laɪˈzeɪ.ʃən/',
    pos: 'noun',
    level: 'C1',
    meaning: 'sự phi tập trung hóa / giãn dân và phân bổ doanh nghiệp ra khỏi nội đô',
    collocations: ['economic decentralisation', 'promote urban decentralisation', 'regional decentralisation policy'],
    exampleEn: 'Economic decentralisation plays a pivotal role in narrowing the wealth gap between urban and rural regions.',
    exampleVi: 'Sự phi tập trung hóa kinh tế đóng vai trò then chốt trong việc thu hẹp khoảng cách giàu nghèo giữa thành thị và nông thôn.',
    detailedNote: 'Từ khóa ăn điểm C1 cho chủ đề chuyển dịch doanh nghiệp về vùng quê (Trang 17–18 - Ôn thi vstep.pdf).',
    tags: ['urbanization', 'economy', 'c1'],
    pdfPage: 'Trang 18',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [23, 61]
  },
  {
    id: 'vstep-pdf-voc-04',
    word: 'alleviate',
    ipa: '/əˈliː.vi.eɪt/',
    pos: 'verb',
    level: 'C1',
    meaning: 'làm giảm bớt, xoa dịu (gánh nặng, tắc nghẽn, nghèo đói)',
    collocations: ['alleviate traffic congestion', 'alleviate the burden on', 'alleviate poverty'],
    exampleEn: 'Relocating manufacturing plants to suburban provinces can effectively alleviate the burden on urban transport networks.',
    exampleVi: 'Việc di dời các nhà máy sản xuất về các tỉnh ngoại ô có thể làm giảm bớt đáng kể gánh nặng lên mạng lưới giao thông đô thị.',
    detailedNote: 'Trích từ Bảng 16 từ vựng Trang 18 - Ôn thi vstep.pdf (Trái nghĩa trực tiếp với exacerbate).',
    tags: ['urbanization', 'solutions', 'c1'],
    pdfPage: 'Trang 18',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'existing_enhanced_examples',
    linkedChallengeDays: [14, 24, 61]
  },
  {
    id: 'vstep-pdf-voc-05',
    word: 'revitalise',
    ipa: '/ˌriːˈvaɪ.təl.aɪz/',
    pos: 'verb',
    level: 'C1',
    meaning: 'tái sinh, đem lại sức sống mới (cho nền kinh tế địa phương/nông thôn)',
    collocations: ['revitalise rural economies', 'revitalise local communities', 'revitalise traditional crafts'],
    exampleEn: 'Corporate investment in the countryside helps revitalise rural economies by generating thousands of stable jobs.',
    exampleVi: 'Đầu tư của doanh nghiệp vào vùng nông thôn giúp đem lại sức sống mới cho kinh tế địa phương bằng cách tạo ra hàng nghìn việc làm ổn định.',
    detailedNote: 'Trích từ Trang 17–18 - Ôn thi vstep.pdf.',
    tags: ['economy', 'urbanization', 'c1'],
    pdfPage: 'Trang 18',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [25, 61]
  },
  {
    id: 'vstep-pdf-voc-06',
    word: 'incentivise',
    ipa: '/ɪnˈsen.tɪ.vaɪz/',
    pos: 'verb',
    level: 'C1',
    meaning: 'khuyến khích bằng ưu đãi (thuế, tài chính) thay vì ép buộc',
    collocations: ['incentivise businesses to relocate', 'tax breaks to incentivise green energy', 'incentivise rather than coerce'],
    exampleEn: 'Governments should incentivise companies through tax reductions rather than coerce them into relocating.',
    exampleVi: 'Chính phủ nên khuyến khích các công ty thông qua ưu đãi giảm thuế thay vì ép buộc họ phải di dời.',
    detailedNote: 'Cặp từ đối lập C1 cực hay từ Kết bài mẫu Trang 17–18: "incentivised rather than coerced".',
    tags: ['economy', 'policy', 'c1'],
    pdfPage: 'Trang 18',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [28, 61]
  },
  {
    id: 'vstep-pdf-voc-07',
    word: 'coerce',
    ipa: '/kəʊˈɜːs/',
    pos: 'verb',
    level: 'C1',
    meaning: 'ép buộc, cưỡng bách bằng quyền lực hoặc quy định cứng nhắc',
    collocations: ['coerce companies into relocating', 'be coerced into doing something'],
    exampleEn: 'If small enterprises are coerced into moving to remote areas, they may face severe logistical disruptions.',
    exampleVi: 'Nếu các doanh nghiệp nhỏ bị ép buộc di dời đến vùng sâu vùng xa, họ có thể đối mặt với sự đứt gãy hậu cần nghiêm trọng.',
    detailedNote: 'Trích từ Bảng 16 từ vựng Trang 18 - Ôn thi vstep.pdf.',
    tags: ['policy', 'law', 'c1'],
    pdfPage: 'Trang 18',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'existing_enhanced_examples',
    linkedChallengeDays: [28, 57, 61]
  },
  {
    id: 'vstep-pdf-voc-08',
    word: 'dispersal',
    ipa: '/dɪˈspɜː.səl/',
    pos: 'noun',
    level: 'C1',
    meaning: 'sự phân tán, giãn trải (dân cư, công nghiệp, hạt giống)',
    collocations: ['population dispersal', 'industrial dispersal', 'seed dispersal'],
    exampleEn: 'Strategic industrial dispersal prevents megacities from becoming suffocated by traffic and pollution.',
    exampleVi: 'Chiến lược phân tán công nghiệp giúp ngăn các siêu đô thị khỏi bị ngạt thở bởi tắc đường và ô nhiễm.',
    detailedNote: 'Trích từ Bảng từ vựng Trang 18 - Ôn thi vstep.pdf.',
    tags: ['urbanization', 'environment', 'c1'],
    pdfPage: 'Trang 18',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [26, 61]
  },
  {
    id: 'vstep-pdf-voc-09',
    word: 'logistical',
    ipa: '/ləˈdʒɪs.tɪ.kəl/',
    pos: 'adj',
    level: 'B2',
    meaning: 'thuộc về hậu cần, vận chuyển và tổ chức chuỗi cung ứng',
    collocations: ['logistical challenges', 'logistical bottlenecks', 'logistical infrastructure'],
    exampleEn: 'Inadequate highways in rural regions pose formidable logistical challenges for manufacturing firms.',
    exampleVi: 'Hệ thống đường cao tốc yếu kém ở vùng nông thôn đặt ra những thách thức hậu cần đáng gờm cho các công ty sản xuất.',
    detailedNote: 'Trích từ Trang 17–18 - Ôn thi vstep.pdf.',
    tags: ['economy', 'transport', 'b2'],
    pdfPage: 'Trang 18',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [27, 61]
  },
  {
    id: 'vstep-pdf-voc-10',
    word: 'nurturing',
    ipa: '/ˈnɜː.tʃər.ɪŋ/',
    pos: 'noun',
    level: 'C1',
    meaning: 'sự nuôi dưỡng, chăm sóc và bồi đắp nhân cách (con cái, tài năng)',
    collocations: ['nurturing and fostering children', 'a nurturing family environment', 'cultivating moral values'],
    exampleEn: 'Parents bear the primary responsibility for nurturing empathy and respect in their children from an early stage.',
    exampleVi: 'Cha mẹ giữ trách nhiệm hàng đầu trong việc nuôi dưỡng lòng thấu cảm và sự tôn trọng ở con cái ngay từ giai đoạn đầu.',
    detailedNote: 'Bộ 5 từ đồng nghĩa chủ đề Nuôi dạy con trong bài Antisocial Behavior (Trang 22 - Ôn thi vstep.pdf): nurturing, fostering, cultivating, raising, bringing up.',
    tags: ['family', 'education', 'society', 'c1'],
    pdfPage: 'Trang 22',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [1, 35, 62]
  },
  {
    id: 'vstep-pdf-voc-11',
    word: 'physique',
    ipa: '/fɪˈziːk/',
    pos: 'noun',
    level: 'C1',
    meaning: 'vóc dáng, thể hình, cấu trúc cơ thể',
    collocations: ['maintain a toned physique', 'improve one’s physique', 'athletic physique'],
    exampleEn: 'I hit the gym four times a week for strength training to build stamina and maintain a healthy physique.',
    exampleVi: 'Tôi đến phòng gym bốn lần một tuần để tập tạ nhằm tăng sức bền và duy trì vóc dáng khỏe mạnh.',
    detailedNote: 'Trích từ Speaking Part 1 — Regular Exercise (Trang 52 - Ôn thi vstep.pdf, có ghi chú phiên âm /fɪˈziːk/).',
    tags: ['health', 'sports', 'speaking', 'c1'],
    pdfPage: 'Trang 52',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [36, 41, 64]
  },
  {
    id: 'vstep-pdf-voc-12',
    word: 'potluck party',
    ipa: '/ˈpɒt.lʌk ˌpɑː.ti/',
    pos: 'phrase',
    level: 'B2',
    meaning: 'bữa tiệc góp món (mỗi người tự nấu hoặc mang theo một món ăn đến chung vui)',
    collocations: ['organize a potluck party', 'bring homemade spring rolls to a potluck party'],
    exampleEn: 'For our upcoming class potluck party, I would suggest making fried spring rolls because they are easy to share.',
    exampleVi: 'Cho bữa tiệc góp món sắp tới của lớp, tôi đề xuất làm món nem rán vì chúng rất dễ chia sẻ cho mọi người.',
    detailedNote: 'Trích từ VSTEP Speaking Part 2 — Potluck Party Planning (Trang 50 - Ôn thi vstep.pdf).',
    tags: ['food', 'culture', 'vstep-speaking', 'b2'],
    pdfPage: 'Trang 50',
    examType: 'VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [37, 64]
  },
  {
    id: 'vstep-pdf-voc-13',
    word: 'reach a consensus',
    ipa: '/riːtʃ ə kənˈsen.səs/',
    pos: 'phrase',
    level: 'C1',
    meaning: 'đạt được sự đồng thuận / thống nhất ý kiến chung',
    collocations: ['struggle to reach a consensus', 'reach a consensus on the itinerary'],
    exampleEn: 'One drawback of traveling in a large group is that it can be time-consuming to reach a consensus on the schedule.',
    exampleVi: 'Một nhược điểm của việc đi du lịch theo nhóm đông người là đôi khi rất mất thời gian để thống nhất được lịch trình chung.',
    detailedNote: 'Trích từ VSTEP Speaking Part 3 — Group Traveling (Trang 50–51 - Ôn thi vstep.pdf).',
    tags: ['travel', 'communication', 'c1'],
    pdfPage: 'Trang 51',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [43, 64]
  },
  {
    id: 'vstep-pdf-voc-14',
    word: 'spend a fortune',
    ipa: '/spend ə ˈfɔː.tʃuːn/',
    pos: 'idiom',
    level: 'B2',
    meaning: 'tiêu tốn một khoản tiền khổng lồ / đắt cắt cổ',
    collocations: ['spend a fortune on luxury resorts', 'without spending a fortune'],
    exampleEn: 'Booking a five-star coastal resort for the whole extended family would require us to spend a fortune.',
    exampleVi: 'Đặt khu nghỉ dưỡng 5 sao ven biển cho cả đại gia đình sẽ khiến chúng tôi tốn một khoản tiền khổng lồ.',
    detailedNote: 'Cụm C1 dùng để phản biện phương án đắt đỏ trong VSTEP Speaking Part 2 (Trang 38, 47, 52 - Ôn thi vstep.pdf).',
    tags: ['finance', 'speaking', 'idiom', 'b2'],
    pdfPage: 'Trang 52',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [30, 52, 64]
  },
  {
    id: 'vstep-pdf-voc-15',
    word: 'decompress',
    ipa: '/ˌdiː.kəmˈpres/',
    pos: 'verb',
    level: 'C1',
    meaning: 'xả hơi, giải tỏa áp lực căng thẳng sau giờ học/làm việc',
    collocations: ['decompress after a hectic day', 'take short breaks to decompress'],
    exampleEn: 'Taking a fifteen-minute coffee break in the afternoon allows office workers to decompress and regain focus.',
    exampleVi: 'Nghỉ giải lao 15 phút uống cà phê vào buổi chiều giúp nhân viên văn phòng giải tỏa căng thẳng và lấy lại sự tập trung.',
    detailedNote: 'Trích từ Speaking Part 1 — Work Breaks & Sleep (Trang 46 - Ôn thi vstep.pdf).',
    tags: ['work', 'health', 'speaking', 'c1'],
    pdfPage: 'Trang 46',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [11, 39, 64]
  },
  {
    id: 'vstep-pdf-voc-16',
    word: 'formidable barrier',
    ipa: '/fɔːˈmɪd.ə.bəl ˈbær.i.ər/',
    pos: 'phrase',
    level: 'C1',
    meaning: 'rào cản đáng gờm / trở ngại lớn khó vượt qua',
    collocations: ['pose a formidable barrier to', 'overcome formidable barriers'],
    exampleEn: 'Poor rural infrastructure remains a formidable barrier to attracting foreign direct investment.',
    exampleVi: 'Cơ sở hạ tầng nông thôn yếu kém vẫn là một rào cản đáng gờm đối với việc thu hút vốn đầu tư trực tiếp nước ngoài.',
    detailedNote: 'Cụm collocation học thuật C1 trích từ Trang 18 & 45 - Ôn thi vstep.pdf.',
    tags: ['academic', 'economy', 'c1'],
    pdfPage: 'Trang 18 & 45',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [23, 45, 62]
  },
  {
    id: 'vstep-pdf-voc-17',
    word: 'drift off',
    ipa: '/drɪft ɒf/',
    pos: 'phrase',
    level: 'B2',
    meaning: 'thiu thiu chìm vào giấc ngủ một cách tự nhiên',
    collocations: ['drift off to sleep effortlessly', 'listen to soft music to drift off'],
    exampleEn: 'Putting my phone away thirty minutes before bedtime helps me drift off to sleep much faster.',
    exampleVi: 'Cất điện thoại trước giờ đi ngủ 30 phút giúp tôi chìm vào giấc ngủ nhanh hơn nhiều.',
    detailedNote: 'Trích từ Speaking Part 1 — Sleep Habits (Trang 46 - Ôn thi vstep.pdf).',
    tags: ['health', 'daily-routine', 'speaking', 'b2'],
    pdfPage: 'Trang 46',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [36, 64]
  },
  {
    id: 'vstep-pdf-voc-18',
    word: 'scorching sun',
    ipa: '/ˈskɔː.tʃɪŋ sʌn/',
    pos: 'phrase',
    level: 'B2',
    meaning: 'cái nắng như thiêu đốt (nắng gắt mùa hè)',
    collocations: ['under the scorching sun', 'avoid exercising under the scorching sun'],
    exampleEn: 'During summer in Vietnam, I prefer indoor swimming to playing football under the scorching sun.',
    exampleVi: 'Vào mùa hè ở Việt Nam, tôi thích bơi trong nhà hơn là đá bóng dưới cái nắng như thiêu đốt.',
    detailedNote: 'Trích từ Speaking Part 1 — Outdoor Pursuits (Trang 64 - Ôn thi vstep.pdf).',
    tags: ['weather', 'sports', 'speaking', 'b2'],
    pdfPage: 'Trang 64',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [41, 65]
  },
  {
    id: 'vstep-pdf-voc-19',
    word: 'whip up',
    ipa: '/wɪp ʌp/',
    pos: 'phrase',
    level: 'B2',
    meaning: 'nấu nhanh / chế biến nhanh một bữa ăn ngon lành',
    collocations: ['whip up a nutritious dinner', 'whip up a quick meal at home'],
    exampleEn: 'Even on busy weekdays, my mother can whip up a delicious family dinner in less than thirty minutes.',
    exampleVi: 'Ngay cả vào những ngày trong tuần bận rộn, mẹ tôi vẫn có thể nấu nhanh một bữa tối gia đình thơm ngon trong chưa đầy 30 phút.',
    detailedNote: 'Trích từ Speaking Part 1 & Part 3 — Family Meals & Eating Out (Trang 62 & 68 - Ôn thi vstep.pdf).',
    tags: ['food', 'family', 'speaking', 'b2'],
    pdfPage: 'Trang 62 & 68',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [42, 65]
  },
  {
    id: 'vstep-pdf-voc-20',
    word: 'by no means irreversible',
    ipa: '/baɪ nəʊ miːnz ˌɪr.ɪˈvɜː.sə.bəl/',
    pos: 'phrase',
    level: 'C1',
    meaning: 'hoàn toàn không phải là không thể đảo ngược (vẫn có thể cứu vãn/khắc phục được)',
    collocations: ['this trend is by no means irreversible', 'environmental damage is by no means irreversible'],
    exampleEn: 'The decline in civic courtesy is alarming, yet this trend is by no means irreversible if families and schools act together.',
    exampleVi: 'Sự suy giảm văn hóa ứng xử nơi công cộng rất đáng báo động, nhưng xu hướng này hoàn toàn có thể đảo ngược nếu gia đình và nhà trường cùng hành động.',
    detailedNote: 'Cấu trúc phủ định kép nhấn mạnh C1 dùng cho câu Kết luận Writing Task 2 & Speaking Part 3 (Trang 23 & 60 - Ôn thi vstep.pdf).',
    tags: ['academic', 'writing', 'c1'],
    pdfPage: 'Trang 23 & 60',
    examType: 'IELTS & VSTEP',
    dedupStatus: 'new',
    linkedChallengeDays: [35, 50, 62]
  }
];

// ============================================================================
// D. NGÂN HÀNG ĐỀ & BÀI MẪU SPEAKING PART 1, PART 2, PART 3 (SPEAKING BANK)
// ============================================================================
export const VSTEP_PDF_SPEAKING_PART1_BANK: PdfSpeakingPart1Item[] = [
  {
    id: 'vstep-pdf-sp1-01',
    topicEn: 'Major, Friends & Social Etiquette',
    topicVi: 'Chuyên ngành học, Kết bạn & Ứng xử giao tiếp',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 41–42',
    dedupStatus: 'new',
    questions: [
      {
        qId: 'sp1-q1',
        questionEn: 'What is your major at university, and why did you choose it?',
        questionVi: 'Chuyên ngành đại học của bạn là gì và tại sao bạn chọn ngành đó?',
        originalPdfDraft:
          'My major is Finance and Banking, with a specialization in Fintech. I chose it because financial technology is booming and offers great career prospects.',
        upgradedSampleB2C1:
          'I am currently majoring in Finance and Banking, with a specific specialization in Financial Technology, or FinTech. I gravitated toward this field because digital banking and cashless payment systems are transforming Vietnam’s economy, which promises dynamic career prospects upon graduation.',
        upgradedSampleVi:
          'Hiện tôi đang theo học chuyên ngành Tài chính - Ngân hàng, chuyên sâu về Công nghệ Tài chính (FinTech). Tôi hướng tới lĩnh vực này vì ngân hàng số và hệ thống thanh toán không tiền mặt đang làm thay đổi nền kinh tế Việt Nam, hứa hẹn triển vọng nghề nghiệp năng động sau khi tốt nghiệp.',
        keyVocab: ['Finance and Banking', 'Fintech specialization', 'gravitate toward', 'career prospects'],
        status: 'complete'
      },
      {
        qId: 'sp1-q2',
        questionEn: 'How do you feel when someone interrupts you while you are talking?',
        questionVi: 'Bạn cảm thấy thế nào khi ai đó ngắt lời bạn đang nói?',
        originalPdfDraft:
          'To be honest, I feel quite annoyed when being interrupted, unless it is an urgent situation.',
        upgradedSampleB2C1:
          'To be completely honest, it can be quite frustrating to be cut off mid-sentence because it disrupts my train of thought. However, if the other person interrupts politely due to an urgent matter, I am more than willing to let them speak first.',
        upgradedSampleVi:
          'Thật lòng mà nói, tôi cảm thấy khá khó chịu khi bị ngắt lời giữa chừng vì nó làm đứt mạch suy nghĩ của tôi. Tuy nhiên, nếu đối phương ngắt lời một cách lịch sự vì có việc khẩn cấp, tôi hoàn toàn sẵn lòng nhường họ nói trước.',
        keyVocab: ['cut off mid-sentence', 'disrupt my train of thought', 'urgent matter'],
        status: 'complete'
      },
      {
        qId: 'sp1-q3',
        questionEn: 'What indoor games are popular in your hometown?',
        questionVi: 'Những trò chơi trong nhà nào phổ biến ở quê hương bạn?',
        originalPdfDraft: 'People in my hometown love playing Chinese chess, card games, and indoor badminton.',
        upgradedSampleB2C1:
          'In my hometown, traditional board games like Chinese chess and card games are immensely popular among older adults during family gatherings. Meanwhile, younger people often gravitate toward indoor badminton or table tennis at community sports centers to stay active regardless of the weather.',
        upgradedSampleVi:
          'Ở quê tôi, các trò chơi cờ bàn truyền thống như cờ tướng và đánh bài rất phổ biến với người lớn tuổi trong các dịp tụ họp gia đình. Trong khi đó, giới trẻ thường thích chơi cầu lông trong nhà hoặc bóng bàn tại trung tâm thể thao cộng đồng để rèn luyện sức khỏe bất chấp thời tiết.',
        keyVocab: ['Chinese chess', 'family gatherings', 'indoor badminton', 'stay active'],
        status: 'complete'
      }
    ],
    linkedChallengeDays: [1, 11, 63],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp1-02',
    topicEn: 'Sleep Habits, Work Breaks & Office Environment',
    topicVi: 'Thói quen giấc ngủ, Nghỉ giải lao & Môi trường làm việc',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 46',
    dedupStatus: 'new',
    questions: [
      {
        qId: 'sp1-q4',
        questionEn: 'What do you usually do to have a good night’s sleep?',
        questionVi: 'Bạn thường làm gì để có một giấc ngủ ngon vào ban đêm?',
        originalPdfDraft:
          'Although I used to be a night owl, now I do a wind-down activity like reading or listening to lo-fi music so I can drift off easily.',
        upgradedSampleB2C1:
          'Although I used to be a bit of a night owl during exam seasons, I now prioritize a strict bedtime routine. About thirty minutes before sleeping, I put away electronic screens and engage in a calming wind-down activity, such as reading a printed book, which helps me drift off to sleep effortlessly.',
        upgradedSampleVi:
          'Mặc dù trước đây tôi từng là một "cú đêm" vào mùa thi, hiện tại tôi ưu tiên thói quen đi ngủ nghiêm ngặt. Khoảng 30 phút trước khi ngủ, tôi cất các thiết bị màn hình điện tử và thực hiện một hoạt động thư giãn nhẹ nhàng như đọc sách giấy, giúp tôi chìm vào giấc ngủ dễ dàng.',
        keyVocab: ['night owl', 'wind-down activity', 'drift off to sleep'],
        status: 'complete'
      },
      {
        qId: 'sp1-q5',
        questionEn: 'Why is it important to take short breaks during work or study?',
        questionVi: 'Tại sao việc nghỉ giải lao ngắn trong lúc học hoặc làm việc lại quan trọng?',
        upgradedSampleB2C1:
          'Taking short breaks is essential because prolonged concentration inevitably leads to mental fatigue. Stepping away from the desk for ten minutes to stretch or grab a cup of coffee allows me to decompress, recharge my batteries, and return to my tasks with sharper focus.',
        upgradedSampleVi:
          'Nghỉ giải lao ngắn là vô cùng cần thiết vì sự tập trung kéo dài chắc chắn dẫn đến mệt mỏi trí óc. Rời khỏi bàn làm việc 10 phút để vươn vai hoặc uống một tách cà phê giúp tôi giải tỏa căng thẳng, nạp lại năng lượng và quay lại công việc với sự tập trung sắc bén hơn.',
        keyVocab: ['prolonged concentration', 'mental fatigue', 'decompress', 'recharge my batteries'],
        status: 'complete'
      }
    ],
    linkedChallengeDays: [13, 36, 64],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp1-03',
    topicEn: 'Email Communication, Regular Exercise & Daily Routine',
    topicVi: 'Giao tiếp qua Email, Tập thể hình & Lịch trình hằng ngày',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 49, 52, 57–58',
    dedupStatus: 'new',
    questions: [
      {
        qId: 'sp1-q6',
        questionEn: 'How often do you check your email, and what do you use it for?',
        questionVi: 'Bạn kiểm tra email bao lâu một lần và dùng nó vào mục đích gì?',
        upgradedSampleB2C1:
          'I check my email inbox at least twice a day—once in the morning and once in the late afternoon. As a university student, I primarily use email to receive academic announcements from lecturers, submit assignments, and keep track of formal internship applications.',
        upgradedSampleVi:
          'Tôi kiểm tra hộp thư điện tử ít nhất hai lần một ngày—một lần vào buổi sáng và một lần vào cuối buổi chiều. Là sinh viên đại học, tôi chủ yếu dùng email để nhận thông báo học vụ từ giảng viên, nộp bài tập và theo dõi các hồ sơ ứng tuyển thực tập trang trọng.',
        keyVocab: ['email inbox', 'academic announcements', 'formal internship applications'],
        status: 'complete'
      },
      {
        qId: 'sp1-q7',
        questionEn: 'What kind of regular exercise do you do, and what is your favorite part of the day?',
        questionVi: 'Bạn thường tập môn thể dục nào và đâu là khoảng thời gian yêu thích nhất trong ngày của bạn?',
        originalPdfDraft:
          'I do strength training at the gym around 7 a.m. and go swimming to improve my physique /fɪˈziːk/. Morning is my favorite part of the day.',
        upgradedSampleB2C1:
          'My favorite part of the day is definitely early morning around 7 a.m., when I hit the gym for strength training. Lifting weights and occasionally going swimming not only help me maintain a toned physique, but also release endorphins that keep me productive for the rest of the day.',
        upgradedSampleVi:
          'Khoảng thời gian yêu thích nhất trong ngày của tôi chắc chắn là sáng sớm khoảng 7 giờ, khi tôi đến phòng gym để tập tạ. Việc rèn luyện sức mạnh kết hợp đi bơi không chỉ giúp tôi duy trì vóc dáng săn chắc mà còn giải phóng endorphin giúp tôi làm việc hiệu quả suốt cả ngày.',
        keyVocab: ['strength training', 'toned physique', 'release endorphins'],
        status: 'complete'
      }
    ],
    linkedChallengeDays: [19, 41, 64],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp1-04',
    topicEn: 'Breakfast, Family Life, Outdoor Pursuits & Money-Transfer Apps',
    topicVi: 'Bữa sáng, Gia đình, Hoạt động ngoài trời & Ứng dụng chuyển tiền',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 60–64 & Trang 70–71',
    dedupStatus: 'new',
    questions: [
      {
        qId: 'sp1-q8',
        questionEn: 'Which meal is the most important to you in a day?',
        questionVi: 'Bữa ăn nào là quan trọng nhất đối với bạn trong ngày?',
        originalPdfDraft:
          'Breakfast is the most important meal. I usually eat pho or bun and drink iced coffee from Highlands Coffee.',
        upgradedSampleB2C1:
          'Without a doubt, breakfast is the most crucial meal of my day. After an overnight fast, I usually treat myself to a steaming bowl of traditional Vietnamese beef noodle soup—like pho or bun—paired with an iced coffee from Highlands Coffee to kickstart my metabolism and mental alertness.',
        upgradedSampleVi:
          'Không nghi ngờ gì nữa, bữa sáng là bữa ăn quan trọng nhất trong ngày của tôi. Sau một đêm dài, tôi thường thưởng thức một bát phở hoặc bún nóng hổi truyền thống kèm một ly cà phê đá Highlands để khởi động quá trình trao đổi chất và sự minh mẫn.',
        keyVocab: ['overnight fast', 'steaming bowl of pho', 'kickstart my metabolism'],
        status: 'complete'
      },
      {
        qId: 'sp1-q9',
        questionEn: 'Can you tell me about your family and who makes major decisions at home?',
        questionVi: 'Hãy kể về gia đình bạn và ai là người đưa ra các quyết định lớn trong nhà?',
        originalPdfDraft:
          'I live in a nuclear family of four. On weekends my mom whips up dinner. My parents discuss together, and they entrust me with my own academic choices.',
        upgradedSampleB2C1:
          'I come from a close-knit nuclear family of four. Although everyone is busy on weekdays, my mother always whips up a cozy family dinner on weekends so we can catch up. When it comes to major financial matters, my parents reach a consensus together, and they also entrust me with making my own academic and career decisions.',
        upgradedSampleVi:
          'Tôi lớn lên trong một gia đình hạt nhân gắn bó gồm bốn người. Dù ngày thường ai cũng bận rộn, mẹ tôi luôn nấu nhanh một bữa tối ấm cúng vào cuối tuần để cả nhà trò chuyện. Với các vấn đề tài chính lớn, bố mẹ tôi cùng bàn bạc thống nhất, đồng thời tin tưởng giao cho tôi tự quyết định việc học tập và định hướng nghề nghiệp của mình.',
        keyVocab: ['close-knit nuclear family', 'whip up dinner', 'reach a consensus', 'entrust someone with'],
        status: 'complete'
      },
      {
        qId: 'sp1-q10',
        questionEn: 'Do you often use money-transfer apps on your smartphone?',
        questionVi: 'Bạn có thường xuyên sử dụng các ứng dụng chuyển tiền trên điện thoại không?',
        originalPdfDraft:
          'Yes, I use banking apps and QR codes every day because they are fast, though we must be careful with security risks.',
        upgradedSampleB2C1:
          'Yes, I use mobile banking and e-wallet apps on a daily basis. Scanning a QR code allows me to split restaurant bills or pay for groceries instantaneously without carrying cash. Nevertheless, users must enable biometric authentication to safeguard their accounts against cybersecurity fraud.',
        upgradedSampleVi:
          'Có, tôi sử dụng ứng dụng ngân hàng di động và ví điện tử hằng ngày. Việc quét mã QR giúp tôi chia hóa đơn nhà hàng hoặc thanh toán mua sắm tức thì mà không cần mang theo tiền mặt. Tuy nhiên, người dùng cần bật xác thực sinh trắc học để bảo vệ tài khoản trước rủi ro lừa đảo mạng.',
        keyVocab: ['mobile banking', 'instantaneously', 'biometric authentication', 'cybersecurity fraud'],
        status: 'complete'
      }
    ],
    linkedChallengeDays: [30, 42, 65],
    addedAt: '2026-11-02'
  }
];

export const VSTEP_PDF_SPEAKING_PART2_BANK: PdfSpeakingPart2Item[] = [
  {
    id: 'vstep-pdf-sp2-01',
    title: 'Đề 1: Tư vấn phương pháp giảm cân cho chị gái (Sister Losing Weight)',
    situationEn:
      'Your sister wants to lose weight quickly and safely. Three options are suggested: going to the gym, taking weight-loss drugs, or going on a strict diet. Which is the best choice?',
    situationVi:
      'Chị gái của bạn muốn giảm cân hiệu quả và an toàn. Có 3 phương án: Đi tập phòng gym, Uống thuốc giảm cân, hoặc Ăn kiêng nghiêm ngặt. Phương án nào tốt nhất?',
    examType: 'VSTEP',
    pdfPage: 'Trang 7',
    dedupStatus: 'new',
    options: ['Going to the gym', 'Taking weight-loss drugs', 'Going on a strict diet'],
    chosenOption: 'Going to the gym',
    reasonsForChoice: [
      'Provides modern workout equipment and professional personal trainers to burn calories safely.',
      'Builds muscle, improves cardiovascular health, and relieves stress after work.'
    ],
    counterArgumentsForOthers: [
      'Taking weight-loss drugs (never say "drink medicine") often causes dangerous side effects like fatigue, insomnia, and dehydration.',
      'Going on an extreme diet can lead to nutrient deficiency and is difficult to sustain long-term.'
    ],
    originalPdfSpeech:
      'Among the three options—going to the gym, taking weight-loss drugs, and going on a diet—I firmly believe going to the gym is the best choice for my sister to lose weight safely and stay healthy.',
    upgradedSampleB2C1:
      'Considering the situation where my sister wants to lose weight, among the three options, I would definitely advise her to go to the gym. First and foremost, working out at a fitness center gives her access to modern equipment and certified trainers, allowing her to burn fat safely while toning her physique. Furthermore, regular exercise releases endorphins, which helps her decompress after long working hours. On the other hand, I strongly oppose taking weight-loss pills because they can trigger severe side effects and harm her metabolism. Similarly, going on a crash diet is unsustainable and may cause nutritional imbalance. Therefore, going to the gym is unquestionably the most holistic solution.',
    upgradedSampleVi:
      'Xét tình huống chị gái tôi muốn giảm cân, trong ba lựa chọn, tôi chắc chắn sẽ khuyên chị ấy đi tập gym. Trước hết, tập luyện tại trung tâm thể hình giúp chị tiếp cận thiết bị hiện đại và huấn luyện viên có chuyên môn, giúp đốt mỡ an toàn đồng thời làm săn chắc vóc dáng. Hơn nữa, tập thể dục đều đặn giải phóng endorphin giúp chị giải tỏa căng thẳng sau giờ làm việc dài. Mặt khác, tôi phản đối việc uống thuốc giảm cân vì chúng có thể gây tác dụng phụ nghiêm trọng. Tương tự, ăn kiêng cấp tốc không bền vững và dễ gây mất cân bằng dinh dưỡng. Vì vậy, tập gym chắc chắn là giải pháp toàn diện nhất.',
    keyVocab: ['certified trainers', 'tone her physique', 'taking weight-loss pills', 'nutritional imbalance'],
    linkedChallengeDays: [6, 36, 61],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp2-02',
    title: 'Đề 2: Chọn trường tiểu học cho em gái (Choosing an Elementary School)',
    situationEn:
      'Your parents are choosing an elementary school for your younger sister: a private school, an international school, or a public school. Which option would you recommend?',
    situationVi:
      'Bố mẹ bạn đang chọn trường tiểu học cho em gái: Trường tư thục, Trường quốc tế, hoặc Trường công lập. Bạn khuyên chọn trường nào?',
    examType: 'VSTEP',
    pdfPage: 'Trang 38',
    dedupStatus: 'new',
    options: ['A private school', 'An international school', 'A public school'],
    chosenOption: 'A private school',
    reasonsForChoice: [
      'Offers smaller class sizes so teachers can give personalized attention to each pupil.',
      'Provides modern facilities, bilingual classes, and extracurricular soft-skill clubs at a more reasonable cost than international schools.'
    ],
    counterArgumentsForOthers: [
      'International schools require parents to spend a fortune on tuition fees and may weaken proficiency in Vietnamese culture.',
      'Public schools often suffer from overcrowded classrooms (40–50 students) and heavy theoretical pressure.'
    ],
    originalPdfSpeech:
      'Chọn Private school vì quy mô lớp nhỏ, cơ sở vật chất hiện đại; International school tốn quá nhiều tiền (spend a fortune); Public school lớp quá đông.',
    upgradedSampleB2C1:
      'When it comes to selecting an elementary school for my younger sister, I believe a reputable private school is the optimal choice. To begin with, private schools maintain smaller class sizes, which enables teachers to nurture each child attentively at an early stage. Additionally, they offer well-equipped facilities and English immersion programs alongside the national curriculum. By contrast, enrolling her in an international school would require my parents to spend a fortune on tuition fees. Meanwhile, local public schools are often overcrowded, making individualized care difficult. All things considered, a private school strikes the best balance between quality and affordability.',
    upgradedSampleVi:
      'Khi chọn trường tiểu học cho em gái, tôi tin rằng một ngôi trường tư thục uy tín là lựa chọn tối ưu. Trước hết, trường tư duy trì sĩ số lớp nhỏ, giúp giáo viên quan tâm sát sao từng học sinh ngay từ giai đoạn đầu. Thêm vào đó, trường có cơ sở vật chất tốt và chương trình tiếng Anh tăng cường song song với chương trình chuẩn quốc gia. Ngược lại, học trường quốc tế sẽ khiến bố mẹ tôi tốn một khoản tiền khổng lồ. Trong khi đó, trường công lập thường quá tải sĩ số. Tổng hòa mọi yếu tố, trường tư thục cân bằng tốt nhất giữa chất lượng và chi phí.',
    keyVocab: ['smaller class sizes', 'at an early stage', 'spend a fortune', 'individualized care'],
    linkedChallengeDays: [1, 16, 62],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp2-03',
    title: 'Đề 3: Tổ chức chuyến du lịch thường niên cho công ty (Annual Company Trip)',
    situationEn:
      'Your company is planning an annual retreat for employees: a riverside resort area, a theme park, or a camping trip in the countryside. Which is the best option?',
    situationVi:
      'Công ty bạn đang lên kế hoạch tổ chức chuyến đi thường niên cho nhân viên: Khu nghỉ dưỡng ven sông, Công viên giải trí (Theme park), hoặc Cắm trại ở vùng quê.',
    examType: 'VSTEP',
    pdfPage: 'Trang 43–44',
    dedupStatus: 'new',
    options: ['A riverside resort area', 'A theme park', 'A camping trip in the countryside'],
    chosenOption: 'A riverside resort area',
    reasonsForChoice: [
      'Provides a serene natural setting with full hospitality services where employees of all ages can decompress.',
      'Has spacious banquet halls and lawns suitable for both team-building activities and gala dinners.'
    ],
    counterArgumentsForOthers: [
      'A theme park is noisy, crowded, and exhausting for older colleagues.',
      'A camping trip in the countryside requires sophisticated preparation and is vulnerable to bad weather.'
    ],
    originalPdfSpeech:
      'Chọn riverside area vì thư giãn, phù hợp mọi lứa tuổi trong công ty. Theme park quá ồn và mệt; camping trip đòi hỏi chuẩn bị phức tạp và phụ thuộc thời tiết.',
    upgradedSampleB2C1:
      'For our upcoming annual company retreat, I strongly recommend choosing a riverside resort area. Primarily, a riverside resort offers a tranquil atmosphere with comfortable accommodation, allowing staff members of all age groups to decompress after months of hard work. Moreover, it provides versatile spaces for both outdoor team-building games and a formal gala dinner. Conversely, a theme park is often overcrowded and physically exhausting for senior employees. As for a countryside camping trip, it demands logistical preparation and could easily be ruined by sudden rain. Hence, a riverside resort is the most inclusive choice.',
    upgradedSampleVi:
      'Cho chuyến du lịch thường niên sắp tới của công ty, tôi đặc biệt đề xuất chọn khu nghỉ dưỡng ven sông. Trước hết, khu nghỉ dưỡng ven sông mang lại bầu không khí yên bình với phòng ốc tiện nghi, giúp nhân viên ở mọi độ tuổi thư giãn sau nhiều tháng làm việc vất vả. Hơn nữa, nơi đây có không gian linh hoạt cho cả trò chơi team-building ngoài trời lẫn đêm tiệc gala. Ngược lại, công viên giải trí thường đông đúc và gây mệt mỏi cho nhân sự lớn tuổi, còn đi cắm trại lại đòi hỏi chuẩn bị hậu cần phức tạp và dễ bị hỏng vì mưa bất chợt.',
    keyVocab: ['annual company retreat', 'tranquil atmosphere', 'decompress', 'logistical preparation'],
    linkedChallengeDays: [30, 43, 63],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp2-04',
    title: 'Đề 4: Mua quần áo mới cho sinh viên (Buying New Clothes for Students)',
    situationEn:
      'A group of university students wants to buy new clothes: shopping at a mall, buying at a local market, or shopping online. Which is the best option?',
    situationVi:
      'Một nhóm sinh viên đại học muốn mua quần áo mới: Mua ở trung tâm thương mại, Mua ở chợ truyền thống, hoặc Mua sắm trực tuyến (Online).',
    examType: 'VSTEP',
    pdfPage: 'Trang 47',
    dedupStatus: 'new',
    options: ['Shopping at a mall', 'Buying at a local market', 'Shopping online'],
    chosenOption: 'Shopping online',
    reasonsForChoice: [
      'Extremely budget-friendly for students thanks to flash sales, discount vouchers, and free shipping.',
      'Saves travel time and allows instant price comparison across thousands of trendy styles.'
    ],
    counterArgumentsForOthers: [
      'Shopping malls sell branded items at steep prices that exceed a student budget.',
      'Local markets often lack fitting rooms and fixed price tags, requiring bargaining skills.'
    ],
    originalPdfSpeech:
      'Chọn shopping online cho sinh viên vì tiết kiệm chi phí nhờ voucher, đa dạng mẫu mã. Shopping mall quá đắt; local market phải mặc cả và chất lượng không đồng đều.',
    upgradedSampleB2C1:
      'Considering that university students typically live on a tight budget, shopping online is undoubtedly the most sensible option for buying new clothes. First, e-commerce platforms frequently offer student discount vouchers and seasonal flash sales, enabling buyers to stay fashionable without spending a fortune. Second, students can effortlessly compare prices and read verified customer reviews from their dormitories. By contrast, high-end boutiques in shopping malls are prohibitively expensive, whereas local markets rarely have proper fitting rooms and require bargaining. Therefore, online shopping suits student lifestyles best.',
    upgradedSampleVi:
      'Xét việc sinh viên đại học thường có ngân sách hạn hẹp, mua sắm trực tuyến chắc chắn là phương án hợp lý nhất để mua quần áo mới. Thứ nhất, các sàn thương mại điện tử thường xuyên tung mã giảm giá và đợt sale lớn, giúp người mua mặc đẹp mà không tốn kém. Thứ hai, sinh viên có thể dễ dàng so sánh giá và đọc đánh giá thực tế ngay tại ký túc xá. Ngược lại, cửa hàng trong trung tâm thương mại quá đắt đỏ, còn chợ truyền thống hiếm khi có phòng thử đồ tiện nghi và phải mặc cả.',
    keyVocab: ['live on a tight budget', 'e-commerce platforms', 'prohibitively expensive', 'fitting rooms'],
    linkedChallengeDays: [10, 29, 63],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp2-05',
    title: 'Đề 5: Chọn món ăn mang đến bữa tiệc góp món (Potluck Party Dish)',
    situationEn:
      'You are invited to a class potluck party and need to bring one dish: fried rice, fried spring rolls, or beef noodles. Which dish would you choose?',
    situationVi:
      'Bạn được mời dự tiệc góp món (potluck party) của lớp và cần mang theo 1 món ăn: Cơm chiên, Nem rán (Chả giò), hoặc Phở bò.',
    examType: 'VSTEP',
    pdfPage: 'Trang 50',
    dedupStatus: 'new',
    options: ['Fried rice', 'Fried spring rolls', 'Beef noodles'],
    chosenOption: 'Fried spring rolls',
    reasonsForChoice: [
      'Finger food that is easy to transport, portion, and share among a large group of friends.',
      'Crispy, flavorful, and universally loved at Vietnamese social gatherings.'
    ],
    counterArgumentsForOthers: [
      'Beef noodles require hot broth, which easily spills during transport and makes noodles soggy.',
      'Fried rice is filling but quite ordinary and less festive for a party.'
    ],
    originalPdfSpeech:
      'Chọn fried spring rolls cho potluck party vì dễ mang theo, dễ chia thành miếng nhỏ (finger food). Beef noodles có nước lèo khó vận chuyển và dễ bị trương nở.',
    upgradedSampleB2C1:
      'For the upcoming class potluck party, I would definitely choose to bring traditional Vietnamese fried spring rolls. To begin with, spring rolls are bite-sized finger food, making them incredibly convenient to pack in containers and share among dozens of classmates without needing bowls or spoons. Moreover, their crispy texture and savory filling make them a crowd-pleaser at any celebration. On the other hand, beef noodles involve hot broth, which is a nightmare to transport and causes the noodles to become soggy. Meanwhile, fried rice is a bit too heavy and ordinary. Thus, fried spring rolls are the ideal party dish.',
    upgradedSampleVi:
      'Cho bữa tiệc góp món sắp tới của lớp, tôi chắc chắn sẽ chọn mang theo món nem rán truyền thống của Việt Nam. Trước hết, nem rán là món ăn cầm tay nhỏ gọn, cực kỳ tiện lợi để đóng hộp mang đi và chia sẻ cho hàng chục bạn cùng lớp mà không cần bát thìa phức tạp. Hơn nữa, lớp vỏ giòn rụm và nhân thơm ngon khiến món này luôn được yêu thích. Mặt khác, phở bò có nước dùng nóng rất bất tiện khi di chuyển và làm bánh phở bị trương, còn cơm chiên lại hơi nhanh no và bình thường.',
    keyVocab: ['potluck party', 'bite-sized finger food', 'crowd-pleaser', 'become soggy'],
    linkedChallengeDays: [37, 42, 64],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp2-06',
    title: 'Đề 6: Chọn địa điểm tổ chức tiệc gia đình (Family Celebration Venue)',
    situationEn:
      'Your family is planning an important anniversary party: at a resort, at a family member’s house, or at a restaurant. Which location is best?',
    situationVi:
      'Gia đình bạn dự định tổ chức một bữa tiệc kỷ niệm quan trọng: Tại khu nghỉ dưỡng (resort), Tại nhà một thành viên trong gia đình, hoặc Tại nhà hàng.',
    examType: 'VSTEP',
    pdfPage: 'Trang 52–53',
    dedupStatus: 'new',
    options: ['At a resort', 'At a family member’s house', 'At a restaurant'],
    chosenOption: 'At a restaurant',
    reasonsForChoice: [
      'Saves family members from exhausting cooking and post-party dishwashing.',
      'Offers a private dining room with diverse menus and professional service at a reasonable price.'
    ],
    counterArgumentsForOthers: [
      'Booking a resort requires the family to spend a fortune and travel far.',
      'Hosting at home requires sophisticated preparation and leaves the host exhausted cleaning up.'
    ],
    originalPdfSpeech:
      'Chọn restaurant vì tiện lợi, có phòng riêng ấm cúng và không phải dọn rửa. Resort tốn kém (spend a fortune); làm ở nhà thì khâu chuẩn bị và rửa bát quá vất vả (sophisticated preparation).',
    upgradedSampleB2C1:
      'To celebrate an important family milestone, holding the party at a cozy restaurant is by far the most practical option. First, dining at a restaurant relieves my mother and relatives from the burden of sophisticated meal preparation and exhausting cleanup afterward, allowing everyone to fully enjoy the conversation. Second, many restaurants provide private VIP rooms with diverse menus tailored to both elderly grandparents and children. Conversely, renting a luxury resort would force us to spend a fortune, while hosting at home is simply too labor-intensive. Therefore, a restaurant is the best venue.',
    upgradedSampleVi:
      'Để kỷ niệm một cột mốc quan trọng của gia đình, tổ chức tiệc tại một nhà hàng ấm cúng là phương án thực tế nhất. Thứ nhất, ăn tại nhà hàng giúp mẹ tôi và người thân thoát khỏi gánh nặng chuẩn bị nấu nướng cầu kỳ và dọn rửa mệt mỏi sau tiệc, để mọi người trọn vẹn tận hưởng cuộc trò chuyện. Thứ hai, nhiều nhà hàng có phòng VIP riêng tư với thực đơn đa dạng cho cả ông bà và trẻ nhỏ. Ngược lại, thuê resort sẽ tốn khoản tiền khổng lồ, còn tổ chức tại nhà lại quá tốn công sức.',
    keyVocab: ['family milestone', 'sophisticated meal preparation', 'spend a fortune', 'labor-intensive'],
    linkedChallengeDays: [42, 52, 64],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp2-07',
    title: 'Đề 7: Chọn nhà hàng ăn mừng sau kỳ thi cuối kỳ (Post-Exam Celebration Dinner)',
    situationEn:
      'You and your classmates want to celebrate finishing final exams at a restaurant: a Thai restaurant, a Japanese (Omakase/Sushi) restaurant, or a Chinese restaurant.',
    situationVi:
      'Bạn và nhóm bạn cùng lớp muốn đi ăn mừng sau khi thi xong học kỳ: Nhà hàng Thái, Nhà hàng Nhật (Omakase/Sushi), hoặc Nhà hàng Trung Hoa.',
    examType: 'VSTEP',
    pdfPage: 'Trang 58',
    dedupStatus: 'new',
    options: ['A Thai restaurant', 'A Japanese restaurant', 'A Chinese restaurant'],
    chosenOption: 'A Thai restaurant',
    reasonsForChoice: [
      'Hot and sour Tom Yum hotpot and Pad Thai are vibrant, flavorful, and reasonably priced for students.',
      'Ideal for sharing around a big table, creating a lively post-exam atmosphere.'
    ],
    counterArgumentsForOthers: [
      'Japanese Omakase/sashimi is extremely pricey and some friends cannot eat raw fish.',
      'Chinese cuisine often uses heavy oil and spices that might feel too greasy for some classmates.'
    ],
    originalPdfSpeech:
      'Chọn Thai restaurant vì lẩu Thái chua cay dễ ăn chung nhóm bạn, giá hợp lý. Japanese Omakase quá đắt và có đồ sống; Chinese food hơi nhiều dầu mỡ.',
    upgradedSampleB2C1:
      'To celebrate the end of our final exams, I would enthusiastically suggest dining at a Thai restaurant. Primarily, signature Thai dishes such as Tom Yum hotpot and Pad Thai offer a vibrant blend of spicy, sour, and savory flavors that appeal to Vietnamese palates and are perfect for sharing around a large table. Additionally, Thai restaurants are generally affordable for university students. On the flip side, a Japanese Omakase restaurant is far beyond our student budget and features raw sashimi that not everyone can eat, while Chinese banquet dishes can be overly oily. Thus, a Thai restaurant is the winner.',
    upgradedSampleVi:
      'Để ăn mừng kết thúc kỳ thi cuối kỳ, tôi hào hứng đề xuất đi ăn tại nhà hàng Thái. Trước hết, các món đặc trưng như lẩu Tom Yum và Pad Thái mang hương vị chua cay đậm đà rất hợp khẩu vị người Việt và cực kỳ lý tưởng để ăn chung quanh bàn lớn. Thêm vào đó, mức giá nhà hàng Thái khá hợp túi tiền sinh viên. Ngược lại, nhà hàng Omakase Nhật Bản vượt quá ngân sách sinh viên và có cá sống không phải ai cũng ăn được, trong khi món Trung Hoa đôi khi hơi nhiều dầu mỡ.',
    keyVocab: ['signature dishes', 'vibrant blend of flavors', 'appeal to Vietnamese palates', 'beyond our student budget'],
    linkedChallengeDays: [37, 58, 65],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp2-08',
    title: 'Đề 8: Tư vấn cho bạn chọn 1 trong 3 lời mời làm việc (Choosing Among 3 Job Offers)',
    situationEn:
      'Your friend has just graduated and received three job offers: Option 1 (High salary but long working hours), Option 2 (Moderate salary with professional training & career growth), Option 3 (Flexible hours but low salary).',
    situationVi:
      'Bạn của bạn mới tốt nghiệp và nhận được 3 lời mời làm việc: Lựa chọn 1 (Lương cao nhưng giờ làm việc kéo dài), Lựa chọn 2 (Lương khá kèm đào tạo bài bản & cơ hội thăng tiến), Lựa chọn 3 (Giờ giấc linh hoạt nhưng lương thấp).',
    examType: 'VSTEP',
    pdfPage: 'Trang 65–66',
    dedupStatus: 'new',
    options: [
      'Option 1: High salary with long working hours',
      'Option 2: Moderate salary with training & career growth',
      'Option 3: Flexible schedule with low salary'
    ],
    chosenOption: 'Option 2: Moderate salary with training & career growth',
    reasonsForChoice: [
      'At an early stage of a career, mentorship and skill development are far more valuable than immediate cash.',
      'Provides sustainable promotion prospects without sacrificing health.'
    ],
    counterArgumentsForOthers: [
      'Option 1 with excessively long working hours could lead to burnout and work-life imbalance.',
      'Option 3 offers little professional challenge and insufficient income to become financially independent.'
    ],
    originalPdfSpeech:
      'Chọn Option 2 vì ở giai đoạn đầu sự nghiệp (at an early stage), đào tạo và cơ hội thăng tiến quan trọng nhất. Option 1 có long working hours gây work-life imbalance; Option 3 lương thấp và ít phát triển.',
    upgradedSampleB2C1:
      'If my newly graduated friend asked for my advice, I would strongly recommend Option 2—the position offering a moderate salary coupled with structured training and career advancement. At an early stage of one’s career, acquiring practical expertise and mentorship is the key to achieving long-term financial success. Conversely, I would advise against Option 1 because enduring excessively long working hours could lead to severe burnout and a work-life imbalance. Meanwhile, Option 3 provides Neither sufficient income nor professional growth. Therefore, Option 2 is the wisest investment for the future.',
    upgradedSampleVi:
      'Nếu người bạn mới tốt nghiệp hỏi lời khuyên của tôi, tôi sẽ đặc biệt khuyên chọn Phương án 2—vị trí có mức lương khá đi kèm đào tạo bài bản và lộ trình thăng tiến. Ở giai đoạn đầu sự nghiệp, việc tích lũy chuyên môn thực tế và có người hướng dẫn là chìa khóa dẫn tới thành công tài chính lâu dài. Ngược lại, tôi khuyên tránh Phương án 1 vì chịu đựng giờ làm việc kéo dài có thể dẫn tới kiệt sức và mất cân bằng công việc - cuộc sống. Trong khi đó, Phương án 3 vừa thu nhập thấp vừa thiếu cơ hội phát triển.',
    keyVocab: ['at an early stage', 'mentorship', 'long working hours', 'work-life imbalance'],
    linkedChallengeDays: [10, 29, 65],
    addedAt: '2026-11-02'
  }
];

export const VSTEP_PDF_SPEAKING_PART3_BANK: PdfSpeakingPart3Item[] = [
  {
    id: 'vstep-pdf-sp3-01',
    topicTitle: 'Chủ đề 1: Đầu tư cho Nghệ thuật & Sức mạnh mềm quốc gia (Investment in the Arts)',
    centralStatementEn: 'Investing in the arts brings significant cultural, educational, and economic benefits to society.',
    centralStatementVi: 'Đầu tư vào nghệ thuật mang lại lợi ích văn hóa, giáo dục và kinh tế to lớn cho xã hội.',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 39–40',
    dedupStatus: 'new',
    mainIdeas: [
      {
        idea: 'Preserve cultural heritage & national identity',
        explanation: 'Museums, theaters, and traditional music safeguard historical values for future generations.'
      },
      {
        idea: 'Foster creativity and emotional intelligence',
        explanation: 'Art education helps students think outside the box and decompress from academic pressure.'
      },
      {
        idea: 'Boost cultural tourism and national soft power',
        explanation: 'Iconic cultural events and architecture attract international tourists and shape a positive global image.'
      }
    ],
    originalPdfSpeech:
      'Đầu tư vào nghệ thuật giúp bảo tồn bản sắc văn hóa, kích thích sáng tạo trong giáo dục và nâng cao hình ảnh quốc gia (soft power) trên trường quốc tế.',
    upgradedSampleB2C1:
      'I completely agree that government and private investment in the arts yields immense benefits for society. First and foremost, funding cultural institutions such as museums and traditional theaters preserves national heritage and identity amidst globalization. Second, exposure to visual arts and music nurtures creativity and emotional well-being among citizens. Finally, a vibrant arts scene acts as a catalyst for cultural tourism and strengthens a nation’s soft power on the global stage.',
    upgradedSampleVi:
      'Tôi hoàn toàn đồng ý rằng đầu tư của chính phủ và tư nhân vào nghệ thuật mang lại lợi ích to lớn cho xã hội. Trước hết, tài trợ cho bảo tàng và nhà hát truyền thống giúp bảo tồn di sản và bản sắc dân tộc giữa làn sóng toàn cầu hóa. Thứ hai, tiếp xúc với hội họa và âm nhạc nuôi dưỡng sự sáng tạo và sức khỏe tinh thần cho người dân. Cuối cùng, nền nghệ thuật sôi động thúc đẩy du lịch văn hóa và nâng cao sức mạnh mềm quốc gia trên trường quốc tế.',
    followUpQuestions: [
      {
        questionEn: 'Should art education be made compulsory in all schools?',
        questionVi: 'Giáo dục nghệ thuật có nên trở thành môn bắt buộc ở mọi trường học không?',
        sampleAnswerEn:
          'Yes, at least at primary and secondary levels. Compulsory art classes allow children to discover hidden talents and develop aesthetic appreciation alongside STEM subjects, provided that students are graded on effort rather than innate talent.',
        sampleAnswerVi:
          'Có, ít nhất là ở bậc tiểu học và trung học. Các lớp nghệ thuật bắt buộc giúp trẻ khám phá năng khiếu tiềm ẩn và phát triển tư duy thẩm mỹ song hành với các môn khoa học, miễn là học sinh được đánh giá dựa trên sự nỗ lực thay vì năng khiếu bẩm sinh.'
      },
      {
        questionEn: 'How do the arts help shape a country’s international image?',
        questionVi: 'Nghệ thuật giúp định hình hình ảnh quốc tế của một quốc gia như thế nào?',
        sampleAnswerEn:
          'The arts serve as a powerful instrument of cultural diplomacy and soft power. For instance, South Korea’s investment in cinema and music, or Vietnam’s promotion of water puppetry and Ao Dai festivals, captivates global audiences and fosters international goodwill.',
        sampleAnswerVi:
          'Nghệ thuật đóng vai trò là công cụ ngoại giao văn hóa và sức mạnh mềm đầy uy lực. Chẳng hạn, việc Hàn Quốc đầu tư vào điện ảnh và âm nhạc, hay Việt Nam quảng bá múa rối nước và lễ hội Áo dài, đã chinh phục khán giả toàn cầu và thúc đẩy thiện cảm quốc tế.'
      }
    ],
    keyVocab: ['cultural heritage', 'aesthetic appreciation', 'cultural diplomacy', 'soft power'],
    linkedChallengeDays: [43, 44, 62],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp3-02',
    topicTitle: 'Chủ đề 2: Các yếu tố tạo nên một buổi Hội thảo Đào tạo thành công (Training Workshop Success)',
    centralStatementEn: 'Several key factors determine whether a professional training workshop is successful.',
    centralStatementVi: 'Nhiều yếu tố cốt lõi quyết định sự thành công của một buổi hội thảo đào tạo chuyên môn.',
    examType: 'VSTEP',
    pdfPage: 'Trang 44–46',
    dedupStatus: 'new',
    mainIdeas: [
      {
        idea: 'An engaging and knowledgeable speaker/facilitator',
        explanation: 'A seasoned expert who uses real-world case studies keeps participants attentive.'
      },
      {
        idea: 'Practical, relevant content and interactive activities',
        explanation: 'Hands-on Q&A sessions and group discussions ensure attendees can apply what they learn.'
      },
      {
        idea: 'Well-organized logistics and venue facilities',
        explanation: 'Reliable audio-visual equipment, comfortable seating, and timely refreshments prevent distractions.'
      }
    ],
    originalPdfSpeech:
      '3 yếu tố làm nên buổi workshop thành công: Diễn giả giỏi, Nội dung thực tế có tương tác, và Khâu tổ chức hậu cần chu đáo. Nếu ngân sách hạn hẹp thì chuyển sang tổ chức Online hoặc cắt giảm tiệc trà.',
    upgradedSampleB2C1:
      'It is widely recognized that running a successful training workshop requires careful coordination of three core elements. First, having a charismatic and experienced facilitator is paramount because they can translate complex theories into actionable insights. Second, the curriculum must be interactive, incorporating case studies and group discussions rather than monotonous lectures. Finally, smooth logistical arrangements—such as clear audio-visual systems and a comfortable venue—create an optimal learning environment.',
    upgradedSampleVi:
      'Nhiều người công nhận rằng để tổ chức một buổi hội thảo đào tạo thành công cần sự phối hợp chặt chẽ của ba yếu tố cốt lõi. Thứ nhất, người điều phối giàu kinh nghiệm và truyền cảm hứng là quan trọng nhất vì họ biến lý thuyết phức tạp thành bài học thực tiễn. Thứ hai, nội dung phải có tính tương tác cao qua tình huống thực tế và thảo luận nhóm thay vì thuyết giảng một chiều. Cuối cùng, khâu hậu cần chu đáo như âm thanh ánh sáng tốt sẽ tạo môi trường học tập tối ưu.',
    followUpQuestions: [
      {
        questionEn: 'How can organizers measure whether a workshop has achieved its goals?',
        questionVi: 'Ban tổ chức có thể đo lường xem buổi workshop đã đạt mục tiêu hay chưa bằng cách nào?',
        sampleAnswerEn:
          'Organizers can evaluate effectiveness by collecting post-workshop feedback surveys, conducting short practical quizzes, and tracking whether employees actually apply the newly acquired skills in their daily workflow.',
        sampleAnswerVi:
          'Ban tổ chức có thể đánh giá hiệu quả bằng cách thu thập khảo sát phản hồi sau hội thảo, tổ chức bài kiểm tra thực hành ngắn và theo dõi xem nhân viên có thực sự áp dụng kỹ năng mới vào công việc hằng ngày hay không.'
      },
      {
        questionEn: 'How can a company organize a training workshop on a limited budget?',
        questionVi: 'Làm thế nào để công ty tổ chức hội thảo đào tạo khi ngân sách hạn hẹp?',
        sampleAnswerEn:
          'When operating on a tight budget, companies can host hybrid or virtual webinars via Zoom, utilize in-house senior managers as trainers, and provide digital handouts instead of printed materials.',
        sampleAnswerVi:
          'Khi ngân sách hạn hẹp, doanh nghiệp có thể tổ chức hội thảo trực tuyến qua Zoom, tận dụng các quản lý cấp cao nội bộ làm diễn giả và phát tài liệu PDF thay vì in ấn tốn kém.'
      }
    ],
    keyVocab: ['charismatic facilitator', 'actionable insights', 'logistical arrangements', 'in-house trainers'],
    linkedChallengeDays: [29, 30, 63],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp3-03',
    topicTitle: 'Chủ đề 3: Các yếu tố quan trọng trong Ngày Phỏng Vấn Xin Việc (Job Interview Factors)',
    centralStatementEn: 'Preparing thoroughly for a job interview involves professional appearance, punctuality, and company research.',
    centralStatementVi: 'Chuẩn bị kỹ lưỡng cho buổi phỏng vấn xin việc bao gồm ngoại hình chuyên nghiệp, sự đúng giờ và tìm hiểu kỹ công ty.',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 47–48',
    dedupStatus: 'new',
    mainIdeas: [
      {
        idea: 'Professional appearance and neat attire',
        explanation: 'Creates an immediate positive first impression and shows respect for the recruiters.'
      },
      {
        idea: 'In-depth knowledge of the company and role',
        explanation: 'Demonstrates genuine enthusiasm and helps candidates tailor their answers effectively.'
      },
      {
        idea: 'Confident body language and clear communication',
        explanation: 'Eye contact, a firm handshake, and structured answers reflect competence under pressure.'
      }
    ],
    originalPdfSpeech:
      'Trong ngày phỏng vấn: Trang phục chỉnh tề tạo ấn tượng đầu tiên; hiểu biết về công ty thể hiện sự nghiêm túc; thái độ tự tin và năng lực thực sự quyết định kết quả lâu dài.',
    upgradedSampleB2C1:
      'Succeeding in a job interview depends on a combination of preparation and interpersonal poise. First, dressing smartly and arriving punctually establish a strong first impression of professionalism. Second, researching the company’s core values and recent projects enables candidates to give tailored, insightful responses. Last but not least, maintaining confident eye contact and positive body language conveys reliability and emotional maturity.',
    upgradedSampleVi:
      'Thành công trong buổi phỏng vấn xin việc phụ thuộc vào sự kết hợp giữa chuẩn bị kỹ lưỡng và phong thái giao tiếp. Thứ nhất, ăn mặc lịch sự và đến đúng giờ tạo ấn tượng đầu tiên mạnh mẽ về sự chuyên nghiệp. Thứ hai, nghiên cứu giá trị cốt lõi và dự án gần đây của công ty giúp ứng viên đưa ra câu trả lời sâu sắc, sát thực tế. Cuối cùng, duy trì giao tiếp bằng mắt tự tin và ngôn ngữ cơ thể tích cực thể hiện sự đáng tin cậy.',
    followUpQuestions: [
      {
        questionEn: 'Which is more important in a job interview: physical appearance or personality and competence?',
        questionVi: 'Yếu tố nào quan trọng hơn khi phỏng vấn: ngoại hình hay tính cách và năng lực?',
        sampleAnswerEn:
          'While neat appearance opens the door during the first thirty seconds, personality, work ethic, and professional competence are far more decisive. Recruiters ultimately hire someone who can solve problems and collaborate harmoniously with the team.',
        sampleAnswerVi:
          'Mặc dù ngoại hình chỉn chu giúp mở cánh cửa trong 30 giây đầu tiên, tính cách, đạo đức nghề nghiệp và năng lực chuyên môn mang tính quyết định lớn hơn nhiều. Nhà tuyển dụng suy cho cùng sẽ chọn người giải quyết được công việc và phối hợp ăn ý với tập thể.'
      }
    ],
    keyVocab: ['first impression', 'interpersonal poise', 'work ethic', 'professional competence'],
    linkedChallengeDays: [31, 32, 64],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp3-04',
    topicTitle: 'Chủ đề 4: Lợi ích của Du Lịch & Chuyến đi đáng nhớ đến Cần Thơ (Benefits of Traveling)',
    centralStatementEn: 'Traveling broadens our horizons, relieves stress, and strengthens relationships with companions.',
    centralStatementVi: 'Đi du lịch giúp mở mang tầm mắt, giải tỏa căng thẳng và gắn kết tình cảm với người đồng hành.',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 50–51 & Trang 54–57',
    dedupStatus: 'new',
    mainIdeas: [
      {
        idea: 'Broaden cultural horizons and life perspectives',
        explanation: 'Experiencing regional cuisines and customs firsthand teaches tolerance and adaptability.'
      },
      {
        idea: 'Decompress and prevent burnout',
        explanation: 'Stepping away from daily routines refreshes both body and mind.'
      },
      {
        idea: 'Create lasting memories and share expenses in group travel',
        explanation: 'Traveling with siblings or friends reduces accommodation costs and deepens emotional bonds.'
      }
    ],
    originalPdfSpeech:
      'Kỷ niệm chuyến đi Cần Thơ cùng anh chị em (Can Tho City, Cai Rang floating market), tự lên lịch trình ở homestay thay vì đi luxury tour đắt đỏ.',
    upgradedSampleB2C1:
      'Traveling is undoubtedly one of the most enriching activities in modern life. Firstly, exploring new destinations broadens our horizons by exposing us to diverse cultures and local cuisines. Secondly, it allows students and workers to decompress and escape monotonous routines. For example, my most memorable trip was visiting Can Tho City with my siblings last summer, where we explored the bustling Cai Rang floating market at dawn and stayed in a cozy riverside homestay.',
    upgradedSampleVi:
      'Đi du lịch chắc chắn là một trong những hoạt động làm giàu trải nghiệm sống nhất. Thứ nhất, khám phá những vùng đất mới giúp mở mang tầm mắt qua việc tiếp xúc với văn hóa và ẩm thực bản địa. Thứ hai, nó giúp học sinh và người đi làm giải tỏa căng thẳng, thoát khỏi nhịp sống đơn điệu. Chẳng hạn, chuyến đi đáng nhớ nhất của tôi là đến thành phố Cần Thơ cùng anh chị em vào mùa hè năm ngoái, nơi chúng tôi khám phá chợ nổi Cái Răng nhộn nhịp lúc bình minh và nghỉ tại một homestay ven sông ấm cúng.',
    followUpQuestions: [
      {
        questionEn: 'Do you prefer a luxury package tour or a self-planned budget trip?',
        questionVi: 'Bạn thích đi tour trọn gói cao cấp hay chuyến đi tự túc tiết kiệm hơn?',
        sampleAnswerEn:
          'As a young traveler, I strongly prefer a self-planned trip staying at local homestays. Not only does it save a considerable amount of money compared to a luxury tour, but it also gives my friends and me the freedom to customize our itinerary.',
        sampleAnswerVi:
          'Là một người trẻ mê xê dịch, tôi thích chuyến đi tự lên kế hoạch và ở homestay địa phương hơn. Nó không chỉ tiết kiệm khoản tiền đáng kể so với tour hạng sang mà còn cho tôi và bạn bè sự tự do điều chỉnh lịch trình.'
      }
    ],
    keyVocab: ['broaden our horizons', 'Cai Rang floating market', 'self-planned itinerary', 'riverside homestay'],
    linkedChallengeDays: [43, 45, 64],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-sp3-05',
    topicTitle: 'Chủ đề 5: Béo Phì Ở Trẻ Em & Xu Hướng Ăn Ngoài Của Giới Trẻ (Childhood Obesity & Eating Out)',
    centralStatementEn: 'Rising childhood obesity and frequent dining out among young people require concerted action from families and schools.',
    centralStatementVi: 'Tình trạng béo phì ở trẻ em gia tăng và xu hướng ăn ngoài thường xuyên của giới trẻ đòi hỏi hành động phối hợp từ gia đình và nhà trường.',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 7–8, Trang 59–60 & Trang 67–69',
    dedupStatus: 'new',
    mainIdeas: [
      {
        idea: 'Overconsumption of ultra-processed fast food and sugary drinks',
        explanation: 'High-calorie meals and bubble tea contribute directly to weight gain and diabetes.'
      },
      {
        idea: 'Sedentary lifestyles dominated by smartphones and video games',
        explanation: 'Children spend hours sitting indoors instead of playing sports.'
      },
      {
        idea: 'Solutions from parents and schools',
        explanation: 'Parents can whip up balanced home-cooked meals, while schools reform canteen menus and expand PE classes.'
      }
    ],
    originalPdfSpeech:
      'Béo phì trẻ em (Trang 59–60) & Xu hướng ăn ngoài của giới trẻ (Trang 67–69): Người trẻ bận rộn và thích tụ tập bạn bè nên hay ăn ngoài, nhưng cần chú ý vệ sinh an toàn thực phẩm (food hygiene) và dinh dưỡng.',
    upgradedSampleB2C1:
      'Childhood obesity has escalated into a pressing public health concern in many urban areas. The primary culprits are the widespread availability of calorie-dense fast food and increasingly sedentary lifestyles among children who are glued to digital screens. Left unchecked, obesity predisposes youngsters to cardiovascular diseases, diabetes, and low self-esteem. However, this issue is by no means irreversible: parents can whip up nutritious meals at home, while schools should ban sugary sodas and mandate daily physical education.',
    upgradedSampleVi:
      'Béo phì ở trẻ em đã leo thang thành mối lo ngại sức khỏe cộng đồng cấp bách tại nhiều đô thị. Thủ phạm chính là sự phổ biến tràn lan của thức ăn nhanh giàu calo và lối sống ít vận động ở trẻ em suốt ngày dán mắt vào màn hình. Nếu không kiểm soát, béo phì khiến trẻ dễ mắc bệnh tim mạch, tiểu đường và tự ti. Tuy nhiên, vấn đề này hoàn toàn có thể đảo ngược: phụ huynh có thể nấu bữa ăn dinh dưỡng tại nhà, còn trường học nên hạn chế nước ngọt có ga và tăng cường giờ thể dục hằng ngày.',
    followUpQuestions: [
      {
        questionEn: 'Why do young people nowadays eat out more frequently than in the past, and what criteria do they use to choose a restaurant?',
        questionVi: 'Tại sao giới trẻ ngày nay đi ăn ngoài thường xuyên hơn trước, và họ chọn quán ăn theo tiêu chí nào?',
        sampleAnswerEn:
          'Young adults dine out frequently due to hectic work schedules and the desire to socialize with peers in aesthetic spaces. When choosing a place to eat, most young people prioritize three criteria: food hygiene and flavor, reasonable pricing, and a cozy ambiance.',
        sampleAnswerVi:
          'Người trẻ đi ăn ngoài thường xuyên do lịch làm việc bận rộn và nhu cầu giao lưu bạn bè trong không gian đẹp. Khi chọn quán ăn, đa số giới trẻ ưu tiên ba tiêu chí: vệ sinh và hương vị món ăn, giá cả hợp lý và không gian ấm cúng.'
      }
    ],
    keyVocab: ['sedentary lifestyles', 'calorie-dense fast food', 'by no means irreversible', 'food hygiene'],
    linkedChallengeDays: [36, 37, 65],
    addedAt: '2026-11-02'
  }
];

// ============================================================================
// E. NGÂN HÀNG ĐỀ & BÀI MẪU WRITING TASK 2 + TASK 1 LETTERS (WRITING BANK)
// ============================================================================
export const VSTEP_PDF_WRITING_BANK: PdfWritingBankItem[] = [
  {
    id: 'vstep-pdf-wrt-01',
    taskCategory: 'Task 2 Essay',
    essayType: 'Opinion Essay (Agree or Disagree)',
    topicTitle: 'Báo Giấy & Sách In vs. Đọc Trực Tuyến Miễn Phí (Printed Books vs. Online Reading)',
    promptEn:
      'In the near future nobody will buy printed newspapers or books because they will be able to read everything they want online without paying. To what extent do you agree or disagree with this statement?',
    promptVi:
      'Trong tương lai gần, sẽ không còn ai mua báo giấy hoặc sách in nữa vì họ có thể đọc mọi thứ mình muốn trên mạng miễn phí. Bạn đồng ý hay không đồng ý ở mức độ nào?',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 12–13 & Trang 32',
    dedupStatus: 'new',
    outline: {
      intro:
        'Paraphrase xu hướng báo điện tử/sách điện tử phát triển mạnh. Thesis Statement: Đồng ý một phần (Partly agree) — báo giấy có thể suy giảm mạnh nhưng sách in sẽ không bao giờ biến mất hoàn toàn.',
      body1:
        'Lý do nhiều người chuyển sang đọc online: (1) Tiện lợi, cập nhật tin tức tức thì qua smartphone mà không tốn phí in ấn; (2) Tiết kiệm chi phí và bảo vệ môi trường (giảm chặt phá rừng sản xuất giấy).',
      body2:
        'Lý do sách in và một phần báo in vẫn tồn tại: (1) Trải nghiệm cầm nắm trang sách thật (tactile experience) và bảo vệ mắt khỏi mỏi mắt kỹ thuật số (digital eye strain); (2) Bản quyền sách chuyên khảo chất lượng cao không hoàn toàn miễn phí trên mạng.',
      conclusion:
        'Khẳng định lại: Dù nền tảng số chiếm ưu thế về tin tức nhanh, sách in vẫn giữ vị trí không thể thay thế đối với những người yêu văn hóa đọc.'
    },
    originalAuthorEssay:
      'In recent years, the rapid advancement of digital technology has transformed the way people access information. While I agree that online platforms have significantly reduced the demand for printed newspapers, I disagree that nobody will buy printed books in the near future.\nOn the one hand, reading online offers undeniable convenience and financial savings. With a smartphone connected to the internet, readers can access breaking news globally without paying for paper or delivery...\nOn the other hand, printed books still hold irreplaceable value for many readers. Reading on electronic screens for long hours causes eye strain and distraction, whereas holding a physical book helps people concentrate and drift off to sleep more easily.',
    authorSelfNotes:
      'Ghi chú cá nhân từ PDF Trang 13 & Trang 32: Đã viết thêm phiên bản Kết bài thứ 2 (Alternative Conclusion) và áp dụng kỹ thuật Giải thích 2 tầng cho ý "tiện lợi" để tránh câu cụt.',
    upgradedBand75Essay:
      'The proliferation of the internet has revolutionized how modern society consumes information, leading some to predict the complete demise of printed newspapers and books. While I concede that free online news portals are rapidly replacing traditional newspapers, I firmly disagree that physical books will become obsolete in the foreseeable future.\n\nOn the one hand, there are compelling reasons why digital reading has gained immense popularity. First and foremost, online platforms provide instantaneous access to information at virtually no cost. Specifically, with a single smartphone connected to the internet, commuters can read breaking news from international outlets within seconds, eliminating the expense and delay of morning print deliveries. Furthermore, digital publishing is environmentally sustainable, as it significantly reduces deforestation and the carbon footprint associated with paper manufacturing.\n\nOn the other hand, printed books possess enduring qualities that digital screens cannot replicate. Primarily, prolonged exposure to blue light from tablets and smartphones causes severe eye strain and mental fatigue, whereas reading a paper book offers a soothing, distraction-free experience. Moreover, it is a misconception that all online content is free; reputable academic textbooks and bestselling novels are strictly protected by copyright laws and paywalls. Many avid readers also cherish the tactile pleasure of flipping physical pages and building a personal bookshelf.\n\nIn conclusion, although free digital media will likely continue to erode newspaper circulation, I contend that printed books will endure thanks to their health benefits, copyright protections, and cultural value.',
    upgradedEssayVi:
      'Sự bùng nổ của Internet đã cách mạng hóa cách xã hội hiện đại tiếp nhận thông tin, khiến một số người dự đoán sự biến mất hoàn toàn của báo giấy và sách in. Mặc dù tôi thừa nhận các cổng tin tức trực tuyến miễn phí đang nhanh chóng thay thế báo truyền thống, tôi hoàn toàn không đồng ý rằng sách giấy sẽ trở nên lỗi thời trong tương lai gần.\n\nMột mặt, có những lý do thuyết phục giải thích tại sao việc đọc trực tuyến lại trở nên phổ biến rộng rãi. Trước hết, các nền tảng số cung cấp quyền truy cập thông tin tức thì với chi phí gần như bằng không. Cụ thể, chỉ với một chiếc điện thoại kết nối mạng, người đi làm có thể đọc tin nóng từ các tờ báo quốc tế trong vài giây, xóa bỏ chi phí và sự chậm trễ của việc giao báo sáng. Hơn nữa, xuất bản số rất bền vững về môi trường vì giảm chặt phá rừng.\n\nMặt khác, sách in sở hữu những giá trị bền bỉ mà màn hình điện tử không thể sao chép. Đầu tiên, tiếp xúc lâu với ánh sáng xanh từ máy tính bảng gây mỏi mắt nghiêm trọng, trong khi đọc sách giấy mang lại trải nghiệm thư thái, không bị xao nhãng. Thêm vào đó, không phải mọi nội dung trên mạng đều miễn phí; giáo trình học thuật và tiểu thuyết bán chạy đều được bảo vệ bản quyền chặt chẽ.\n\nTóm lại, dù truyền thông số miễn phí sẽ tiếp tục thu hẹp lượng phát hành báo giấy, sách in vẫn sẽ trường tồn nhờ lợi ích sức khỏe, bản quyền và giá trị văn hóa.',
    targetVocabulary: [
      { word: 'proliferation', pos: 'n.', meaningVi: 'sự bùng nổ, phổ biến nhanh chóng', exampleEn: 'The proliferation of e-books has changed reading habits.' },
      { word: 'obsolete', pos: 'adj.', meaningVi: 'lỗi thời, không còn được dùng', exampleEn: 'Printed books will not become obsolete.' },
      { word: 'instantaneous', pos: 'adj.', meaningVi: 'tức thì, ngay lập tức', exampleEn: 'Online portals offer instantaneous access to news.' },
      { word: 'tactile pleasure', pos: 'phr.', meaningVi: 'cảm giác thích thú khi chạm vào trang sách thật', exampleEn: 'Readers cherish the tactile pleasure of printed books.' }
    ],
    linkedChallengeDays: [3, 8, 12, 61],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-wrt-02',
    taskCategory: 'Task 2 Essay',
    essayType: 'Advantages & Disadvantages Outweigh Essay',
    topicTitle: 'Di Dời Doanh Nghiệp Từ Thành Phố Lớn Về Vùng Nông Thôn (Relocating Businesses to Rural Areas)',
    promptEn:
      'Accommodation and transport problems are increasing in many large cities. Businesses are encouraged to move to rural areas. Do the advantages of this trend outweigh the disadvantages?',
    promptVi:
      'Các vấn đề về nhà ở và giao thông đang ngày càng gia tăng tại nhiều thành phố lớn. Các doanh nghiệp được khuyến khích chuyển về vùng nông thôn. Lợi ích của xu hướng này có vượt trội hơn bất lợi không?',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 16–18 & Trang 24',
    dedupStatus: 'new',
    outline: {
      intro:
        'Paraphrase thực trạng quá tải nhà ở & giao thông ở đại đô thị (metropolitan areas). Thesis Statement: Dù có một số trở ngại hậu cần ban đầu, lợi ích dài hạn vượt trội hơn hẳn (Advantages far outweigh disadvantages).',
      body1:
        'Bất lợi (Disadvantages): (1) Cơ sở hạ tầng và hậu cần (logistical infrastructure) ở nông thôn chưa đồng bộ, gây đứt gãy chuỗi cung ứng; (2) Khó thu hút nhân sự chất lượng cao vốn quen tiện ích đô thị.',
      body2:
        'Lợi ích vượt trội (Advantages): (1) Giảm tải trực tiếp áp lực nhà ở, tắc đường và ô nhiễm tại thành phố lớn (alleviate urban congestion); (2) Giảm chi phí thuê đất/vận hành cho doanh nghiệp và tái sinh kinh tế nông thôn (revitalise rural economies — Ví dụ: Samsung đặt nhà máy tại Bắc Ninh & Thái Nguyên).',
      conclusion:
        'Tóm lại: Lợi ích kinh tế - xã hội vượt trội hoàn toàn, miễn là chính phủ khuyến khích bằng ưu đãi (incentivised rather than coerced).'
    },
    originalAuthorEssay:
      'Bản viết số 1 của tác giả (Trang 16): Chọn hướng Disadvantages > Advantages (nêu khó khăn về cơ sở hạ tầng nông thôn và thiếu lao động trình độ cao) nhưng đồng thời phân tích ví dụ thực tế Samsung đặt nhà máy tại Bắc Ninh giúp giảm tải cho Hà Nội.\nBản Sample Answer nâng cấp (Trang 17–18): Chọn hướng Advantages > Disadvantages kèm bảng 16 từ vựng học thuật C1.',
    authorSelfNotes:
      'Lưu giữ cả 2 góc nhìn trong PDF: Góc nhìn 1 (Bản thảo cá nhân trang 16 + Ví dụ Samsung Bắc Ninh) và Góc nhìn 2 (Bài mẫu Band 7.5+ trang 17–18 sử dụng 16 từ C1: exacerbate, metropolitan, decentralisation, alleviate, revitalise, incentivise, coerce).',
    upgradedBand75Essay:
      'Escalating housing shortages and traffic gridlock have exacerbated living conditions in numerous metropolitan areas, prompting governments to encourage the relocation of businesses to rural regions. While this decentralisation policy entails certain logistical hurdles, I firmly contend that its socioeconomic and environmental advantages far outweigh the drawbacks.\n\nAdmittedly, moving corporate operations outside major cities presents initial challenges. Primarily, rural provinces often lack advanced logistical infrastructure, such as high-speed highways and reliable power grids, which can disrupt supply chains and inflate transportation costs. Furthermore, corporations may struggle to recruit and retain highly skilled professionals who are reluctant to leave behind the superior healthcare, international schools, and entertainment amenities of urban centers.\n\nNevertheless, these temporary obstacles are eclipsed by the long-term benefits for both cities and the countryside. First, industrial dispersal directly alleviates the immense pressure on metropolitan housing markets and public transit networks, thereby curbing environmental degradation. Second, relocating to rural zones significantly lowers operational expenses—such as land rent and labor costs—enhancing corporate competitiveness. Take Samsung’s massive manufacturing complexes in Bac Ninh and Thai Nguyen provinces as a prime example: not only did this move prevent tens of thousands of workers from overcrowding Hanoi, but it also revitalised the local rural economies. Ultimately, such policies foster sustainable regional development.\n\nIn conclusion, although rural relocation poses short-term logistical difficulties, its capacity to relieve urban congestion and stimulate provincial prosperity is far more significant, especially when companies are incentivised through tax breaks rather than coerced.',
    upgradedEssayVi:
      'Tình trạng thiếu hụt nhà ở và ùn tắc giao thông leo thang đã làm trầm trọng thêm điều kiện sống tại nhiều đại đô thị, thúc đẩy chính phủ khuyến khích doanh nghiệp di dời về vùng nông thôn. Mặc dù chính sách phi tập trung hóa này kéo theo một số rào cản hậu cần, tôi hoàn toàn khẳng định rằng những lợi ích kinh tế - xã hội và môi trường của nó vượt trội hơn hẳn các bất lợi.\n\nPhải thừa nhận rằng việc chuyển hoạt động doanh nghiệp ra ngoài các thành phố lớn đặt ra những thách thức ban đầu. Trước hết, các tỉnh nông thôn thường thiếu hạ tầng hậu cần tiên tiến, có thể làm gián đoạn chuỗi cung ứng. Hơn nữa, doanh nghiệp có thể gặp khó khăn khi tuyển dụng nhân sự trình độ cao vốn ngại rời xa tiện ích y tế và giáo dục ở thành phố.\n\nTuy nhiên, những trở ngại tạm thời này hoàn toàn bị lu mờ bởi lợi ích lâu dài cho cả đô thị lẫn nông thôn. Thứ nhất, sự phân tán công nghiệp trực tiếp làm giảm áp lực khổng lồ lên thị trường nhà ở và giao thông đô thị, qua đó hạn chế suy thoái môi trường. Thứ hai, chuyển về vùng quê giúp giảm mạnh chi phí vận hành như thuê đất, nâng cao năng lực cạnh tranh. Lấy tổ hợp sản xuất của Samsung tại Bắc Ninh và Thái Nguyên làm ví dụ điển hình: bước đi này không chỉ ngăn hàng vạn lao động đổ dồn về gây quá tải cho Hà Nội mà còn tái sinh nền kinh tế địa phương.\n\nTóm lại, dù việc di dời về nông thôn có khó khăn ngắn hạn, khả năng giải tỏa ùn tắc đô thị và thúc đẩy thịnh vượng vùng miền của nó lớn hơn rất nhiều, đặc biệt khi doanh nghiệp được khuyến khích bằng ưu đãi thay vì bị ép buộc.',
    targetVocabulary: [
      { word: 'exacerbate', pos: 'v.', meaningVi: 'làm trầm trọng thêm', exampleEn: 'Traffic gridlock has exacerbated urban living conditions.' },
      { word: 'decentralisation', pos: 'n.', meaningVi: 'sự phi tập trung hóa / giãn dân', exampleEn: 'Economic decentralisation narrows regional disparities.' },
      { word: 'alleviate', pos: 'v.', meaningVi: 'làm giảm nhẹ, xoa dịu', exampleEn: 'Industrial dispersal alleviates pressure on urban housing.' },
      { word: 'revitalise', pos: 'v.', meaningVi: 'tái sinh, mang lại sức sống mới', exampleEn: 'New factories revitalise rural economies.' },
      { word: 'incentivise', pos: 'v.', meaningVi: 'khuyến khích bằng ưu đãi', exampleEn: 'Firms should be incentivised rather than coerced.' }
    ],
    linkedChallengeDays: [16, 21, 22, 23, 61],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-wrt-03',
    taskCategory: 'Task 2 Essay',
    essayType: 'Discussion + Opinion Essay (Discuss Both Views)',
    topicTitle: 'Sự Tuyệt Chủng Động Thực Vật vs. Các Vấn Đề Môi Trường Khác (Biodiversity Loss vs. Other Environmental Issues)',
    promptEn:
      'Some people say that the main environmental problem of our time is the loss of particular species of plants and animals. Others say that there are more important environmental problems. Discuss both these views and give your own opinion.',
    promptVi:
      'Một số người cho rằng vấn đề môi trường chính của thời đại chúng ta là sự biến mất của một số loài thực vật và động vật. Những người khác lại nói rằng có những vấn đề môi trường khác quan trọng hơn. Thảo luận cả hai quan điểm và nêu ý kiến của bạn.',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 19–21',
    dedupStatus: 'new',
    outline: {
      intro:
        'Template 3 câu (Trang 21): Câu 1 nêu bối cảnh khủng hoảng môi trường; Câu 2 đối chiếu hai quan điểm (tuyệt chủng loài vs ô nhiễm/biến đổi khí hậu); Câu 3 khẳng định cả hai mặt đều cấp bách và có mối quan hệ nhân quả.',
      body1:
        'Tại sao mất đa dạng sinh học (loss of species) là vấn đề nghiêm trọng: (1) Phá vỡ chuỗi thức ăn và hệ sinh thái (Ví dụ: loài ong biến mất làm đình trệ quá trình thụ phấn nông nghiệp); (2) Mất nguồn dược liệu quý (thảo dược truyền thống tại Việt Nam).',
      body2:
        'Tại sao các vấn đề môi trường khác (ô nhiễm nguồn nước, không khí, biến đổi khí hậu) cũng cấp thiết không kém: Tác động trực tiếp hàng ngày lên sức khỏe con người và chính là nguyên nhân gốc rễ gây tuyệt chủng (Ví dụ: ô nhiễm các dòng sông nội đô tại Hà Nội).',
      conclusion:
        'Tổng kết: Không nên tách rời hai vấn đề; bảo vệ khí hậu và nguồn nước chính là bảo vệ môi trường sống của muôn loài.'
    },
    originalAuthorEssay:
      'Bài viết gốc của tác giả (Trang 19–20): Đưa ra các ví dụ thực tế rất sinh động gồm loài ong giúp thụ phấn cây trồng (bees and pollination), cây thuốc quý của Việt Nam (medicinal herbs), và thực trạng ô nhiễm sông ngòi tại Hà Nội (water pollution in Hanoi rivers).',
    authorSelfNotes:
      'Trang 21: Rút ra Template 3 câu cho phần Mở bài và khung triển khai đoạn Thân bài dạng Discuss Both Views.',
    upgradedBand75Essay:
      'In recent decades, environmental degradation has escalated at an alarming rate, sparking debate over which ecological crisis demands the highest priority. While some argue that the extinction of specific plant and animal species is the most critical challenge of our era, others contend that broader issues such as climate change and pollution are more urgent. In my opinion, both perspectives are valid because these problems are inextricably linked.\n\nOn the one hand, there are compelling reasons to view biodiversity loss as a paramount threat. Every species plays an indispensable role in maintaining ecological equilibrium. For instance, the rapid decline of bee populations worldwide severely disrupts natural pollination, which directly threatens global food security and agricultural yields. Furthermore, the extinction of rare flora deprives humanity of vital resources; in Vietnam, for example, many indigenous medicinal plants are vanishing before scientists can fully study their pharmaceutical potential to cure life-threatening diseases.\n\nOn the other hand, I side with those who emphasize that macro-environmental problems—namely air and water pollution and global warming—require equally immediate intervention. Firstly, these issues pose a direct, daily hazard to human survival. In major cities like Hanoi, severe air pollution and contaminated urban rivers directly trigger respiratory illnesses and waterborne diseases among millions of residents. Secondly, climate change and habitat pollution are the root causes driving animal and plant extinction in the first place.\n\nIn conclusion, rather than ranking species loss above or below other ecological crises, governments must adopt an integrated approach. Combating pollution and global warming is the most effective way to safeguard both human health and endangered wildlife.',
    upgradedEssayVi:
      'Trong những thập kỷ gần đây, sự suy thoái môi trường đã leo thang với tốc độ đáng báo động, làm dấy lên cuộc tranh luận về việc đâu là cuộc khủng hoảng sinh thái cần ưu tiên hàng đầu. Trong khi một số người cho rằng sự tuyệt chủng của các loài động thực vật là thách thức nghiêm trọng nhất, những người khác lại khẳng định biến đổi khí hậu và ô nhiễm cấp bách hơn. Theo tôi, cả hai quan điểm đều xác đáng vì chúng gắn kết chặt chẽ với nhau.\n\nMột mặt, có những lý do thuyết phục để xem suy giảm đa dạng sinh học là mối đe dọa tối quan trọng. Mỗi loài đều đóng vai trò không thể thiếu trong việc duy trì cân bằng sinh thái. Chẳng hạn, sự sụt giảm nhanh chóng quần thể ong trên toàn cầu làm gián đoạn nghiêm trọng quá trình thụ phấn tự nhiên, đe dọa trực tiếp an ninh lương thực. Hơn nữa, sự biến mất của thực vật quý hiếm làm nhân loại mất đi nguồn dược liệu quan trọng, như nhiều loài cây thuốc bản địa tại Việt Nam.\n\nMặt khác, tôi đồng tình với những ai nhấn mạnh rằng ô nhiễm không khí, nguồn nước và nóng lên toàn cầu đòi hỏi sự can thiệp tức thời không kém. Thứ nhất, chúng gây nguy hại trực tiếp hằng ngày đến sức khỏe con người, như tình trạng ô nhiễm không khí và sông nội đô tại Hà Nội. Thứ hai, biến đổi khí hậu và ô nhiễm môi trường sống chính là nguyên nhân gốc rễ đẩy các loài sinh vật tới bờ vực tuyệt chủng.\n\nTóm lại, thay vì đặt nặng bên nào hơn, chính phủ cần áp dụng cách tiếp cận tổng thể: chống ô nhiễm và biến đổi khí hậu chính là cách hiệu quả nhất để bảo vệ cả sức khỏe con người lẫn các loài hoang dã.',
    targetVocabulary: [
      { word: 'ecological equilibrium', pos: 'phr.', meaningVi: 'sự cân bằng sinh thái', exampleEn: 'Every species helps maintain ecological equilibrium.' },
      { word: 'pollination', pos: 'n.', meaningVi: 'quá trình thụ phấn', exampleEn: 'Bees play a vital role in agricultural pollination.' },
      { word: 'indigenous medicinal plants', pos: 'phr.', meaningVi: 'các loài cây thuốc bản địa', exampleEn: 'Vietnam is home to many indigenous medicinal plants.' },
      { word: 'inextricably linked', pos: 'phr.', meaningVi: 'gắn kết chặt chẽ không thể tách rời', exampleEn: 'Pollution and biodiversity loss are inextricably linked.' }
    ],
    linkedChallengeDays: [14, 15, 33, 62],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-wrt-04',
    taskCategory: 'Task 2 Essay',
    essayType: 'Causes & Solutions Essay',
    topicTitle: 'Sự Gia Tăng Hành Vi Phản Xã Hội & Thiếu Tôn Trọng Người Khác (Antisocial Behavior & Lack of Respect)',
    promptEn:
      'Many people say that today there is a general increase in antisocial behavior and lack of respect for others. What might have caused this situation, and what can be done to improve it?',
    promptVi:
      'Nhiều người cho rằng ngày nay có sự gia tăng chung về các hành vi phản xã hội và sự thiếu tôn trọng người khác. Nguyên nhân nào dẫn đến tình trạng này và có thể làm gì để cải thiện?',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 22–23',
    dedupStatus: 'new',
    outline: {
      intro:
        'Giới thiệu thực trạng suy giảm văn hóa ứng xử và gia tăng hành vi phản xã hội (antisocial behavior). Nêu mục tiêu bài viết: Phân tích nguyên nhân cốt lõi và đề xuất giải pháp từ gia đình & xã hội.',
      body1:
        'Nguyên nhân (Causes): (1) Cha mẹ quá bận rộn với công việc, thiếu thời gian nuôi dưỡng nhân cách con cái (lack of parental nurturing/bringing up); (2) Mạng xã hội (TikTok, Facebook, Threads) cổ xúy nội dung độc hại và bình luận công kích ẩn danh.',
      body2:
        'Giải pháp (Solutions): (1) Gia đình dành thời gian chất lượng, làm gương và rèn đạo đức từ sớm (at an early stage); (2) Nhà trường và cơ quan quản lý siết chặt quy định an ninh mạng và giáo dục công dân.',
      conclusion:
        'Khẳng định: Tình trạng này hoàn toàn có thể đảo ngược (by no means irreversible) nếu gia đình và nhà trường phối hợp hành động.'
    },
    originalAuthorEssay:
      'Bài viết gốc của tác giả (Trang 22–23): Áp dụng chuẩn công thức Cause -> Explanation -> Effect -> Example (TikTok, Facebook, Threads) -> Result, đồng thời tổng hợp bộ 5 từ vựng nuôi dạy con (nurturing, fostering, cultivating, raising, bringing up) và cụm kết bài "by no means irreversible".',
    authorSelfNotes:
      'Trang 22–23: Ghi nhớ chuỗi triển khai 5 bước (Nguyên nhân -> Giải thích -> Hậu quả -> Ví dụ TikTok/Facebook/Threads -> Kết quả) và cụm C1 "by no means irreversible".',
    upgradedBand75Essay:
      'In contemporary society, there is growing concern over the noticeable rise in antisocial behavior and a declining sense of mutual respect in public spaces. This essay will examine the underlying causes of this phenomenon and propose practical measures to restore civic courtesy.\n\nThere are two primary factors driving the erosion of respectful behavior. First, modern work pressures often leave parents with insufficient time for nurturing and bringing up their children. When parents are preoccupied with long working hours, children may lack proper moral guidance at an early stage, leading to self-centered attitudes. Second, the unmoderated proliferation of social media platforms has exacerbated hostility. Specifically, algorithms on platforms such as TikTok, Facebook, and Threads frequently amplify controversial or aggressive content to boost engagement. Consequently, young users who are constantly exposed to anonymous cyberbullying and toxic debates begin to imitate such disrespectful conduct in real life.\n\nNevertheless, this troubling trend is by no means irreversible if families, schools, and authorities take concerted action. Primarily, parents must prioritize quality family time, acting as positive role models in cultivating empathy and manners at home. Furthermore, educational institutions should integrate practical civic education and digital etiquette into the core curriculum. Finally, social media companies and governments need to enforce stricter community standards to penalize online harassment and public vandalism.\n\nIn conclusion, while the neglect of family upbringing and toxic social media environments have fueled antisocial behavior, this issue can be effectively mitigated through attentive parenting and stronger educational and legal frameworks.',
    upgradedEssayVi:
      'Trong xã hội đương đại, ngày càng có nhiều lo ngại về sự gia tăng rõ rệt của các hành vi phản xã hội và sự suy giảm thái độ tôn trọng lẫn nhau nơi công cộng. Bài viết này sẽ phân tích những nguyên nhân sâu xa của hiện tượng trên và đề xuất các biện pháp thiết thực nhằm khôi phục văn hóa ứng xử.\n\nCó hai nguyên nhân chính thúc đẩy sự xói mòn hành vi tôn trọng. Thứ nhất, áp lực công việc hiện đại thường khiến cha mẹ không có đủ thời gian nuôi dưỡng và dạy dỗ con cái. Khi phụ huynh bị cuốn vào giờ làm việc kéo dài, trẻ có thể thiếu sự định hướng đạo đức đúng đắn ngay từ giai đoạn sớm, dẫn đến thái độ vị kỷ. Thứ hai, sự bùng nổ thiếu kiểm soát của các nền tảng mạng xã hội đã làm trầm trọng thêm sự thù địch. Cụ thể, thuật toán trên TikTok, Facebook và Threads thường khuếch đại nội dung gây tranh cãi để câu tương tác. Hệ quả là người dùng trẻ tiếp xúc liên tục với bạo lực mạng ẩn danh sẽ bắt chước cách hành xử thiếu tôn trọng đó ngoài đời thực.\n\nTuy nhiên, xu hướng đáng lo ngại này hoàn toàn không phải là không thể đảo ngược nếu gia đình, nhà trường và cơ quan chức năng cùng hành động. Trước hết, phụ huynh phải ưu tiên thời gian chất lượng bên gia đình, làm tấm gương tốt trong việc vun đắp lòng thấu cảm. Hơn nữa, nhà trường cần lồng ghép giáo dục công dân và văn hóa ứng xử số vào chương trình học.\n\nTóm lại, dù sự thiếu sát sao từ gia đình và môi trường mạng độc hại đã làm gia tăng hành vi phản xã hội, vấn đề này hoàn toàn có thể được khắc phục thông qua sự giáo dục tận tâm của cha mẹ và khung pháp lý vững chắc.',
    targetVocabulary: [
      { word: 'antisocial behavior', pos: 'phr.', meaningVi: 'hành vi phản xã hội', exampleEn: 'Antisocial behavior has increased in urban areas.' },
      { word: 'nurturing and bringing up', pos: 'phr.', meaningVi: 'nuôi dưỡng và dạy dỗ (con cái)', exampleEn: 'Parents play a vital role in nurturing and bringing up children.' },
      { word: 'civic courtesy', pos: 'phr.', meaningVi: 'văn hóa lịch sự nơi công cộng', exampleEn: 'Schools help restore civic courtesy.' },
      { word: 'by no means irreversible', pos: 'phr.', meaningVi: 'hoàn toàn có thể đảo ngược / cứu vãn', exampleEn: 'This trend is by no means irreversible.' }
    ],
    linkedChallengeDays: [35, 50, 56, 62],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-wrt-05',
    taskCategory: 'Task 1 Letter',
    essayType: 'VSTEP Task 1 — Informal & University Experience Letter',
    topicTitle: 'Mẫu Thư Thân Mật Kể Chuyện Đại Học & Phản Hồi Bạn Bè (Informal Email / Letter)',
    promptEn:
      'You recently received an email from an English-speaking friend asking about your university life, your daily routine, and a memorable trip you took recently. Write a letter (at least 120 words) to reply to your friend.',
    promptVi:
      'Gần đây bạn nhận được email từ một người bạn nước ngoài hỏi thăm về cuộc sống đại học, thói quen hằng ngày và một chuyến đi đáng nhớ của bạn. Hãy viết bức thư (ít nhất 120 từ) để trả lời.',
    examType: 'VSTEP',
    pdfPage: 'Trang 28–31 & Trang 80',
    dedupStatus: 'new',
    outline: {
      intro:
        'Lời chào + Câu hỏi thăm sức khỏe cố định ("I hope that this letter finds you in good health and spirits...") + Xin lỗi vì bận học kỳ mới nên viết thư muộn.',
      body1:
        'Kể về chuyên ngành đại học (Finance and Banking — Fintech) và lịch trình buổi sáng (7 a.m. tập gym, ăn phở và uống cà phê Highlands).',
      body2:
        'Kể ngắn gọn về chuyến đi Cần Thơ cùng anh chị em dịp nghỉ lễ vừa qua và mời bạn sang Việt Nam chơi.',
      conclusion:
        'Câu kết thư cố định ("Drop me a line soon!") + Ký tên.'
    },
    originalAuthorEssay:
      'Mở đầu thư gốc trong PDF Trang 80: "I hope that the letter finds you in good health and spirits. How have you been doing recently? The main reason I am writing this email is to tell you about my university experience..."',
    authorSelfNotes:
      'Trang 28–31 & 80: Nắm chắc 5 câu khung cố định của Informal Letter để áp dụng cho mọi đề viết thư cho bạn bè trong VSTEP Task 1.',
    upgradedBand75Essay:
      'Dear Alex,\n\nI hope that this letter finds you in good health and high spirits. How have you been doing recently? I apologize for not writing sooner, as I have been quite tied up with my university coursework over the past few weeks.\n\nThe main reason I am writing this email is to catch you up on my college life. As you know, I am majoring in Finance and Banking with a specialization in FinTech. Although the lectures are challenging, I really enjoy the dynamic academic environment. To stay energetic, I maintain a fixed morning routine: I hit the gym at 7 a.m. for strength training and then grab a hot bowl of beef pho along with an iced coffee before class.\n\nBy the way, last month I went on an unforgettable trip to Can Tho City with my siblings. We visited the famous Cai Rang floating market at dawn and stayed at a peaceful riverside homestay. If you visit Vietnam next summer, I would love to take you there!\n\nAnyway, I have to get back to my study schedule now. Drop me a line soon and let me know how things are going on your end.\n\nBest wishes,\nMinh',
    upgradedEssayVi:
      'Alex thân mến,\n\nMình hy vọng bức thư này đến tay bạn khi bạn vẫn khỏe mạnh và tinh thần phấn chấn. Dạo này bạn thế nào rồi? Mình xin lỗi vì đã không viết thư sớm hơn, vì mấy tuần qua mình khá bận rộn với bài vở trên trường đại học.\n\nLý do chính mình viết bức thư này là để kể cho bạn nghe về cuộc sống sinh viên của mình. Như bạn biết đấy, mình đang học ngành Tài chính - Ngân hàng chuyên sâu về FinTech. Dù bài giảng khá thử thách, mình rất thích môi trường học tập năng động này. Để giữ năng lượng, mình duy trì lịch trình buổi sáng cố định: tập gym lúc 7 giờ sáng rồi ăn một bát phở bò nóng hổi kèm ly cà phê đá trước giờ vào lớp.\n\nNhân tiện, tháng trước mình đã có chuyến đi khó quên tới thành phố Cần Thơ cùng anh chị em. Tụi mình đã thăm chợ nổi Cái Răng lúc bình minh và ở tại một homestay ven sông rất yên bình. Nếu hè tới bạn sang Việt Nam, mình rất muốn dẫn bạn tới đó!\n\nThôi mình phải quay lại lịch ôn bài đây. Hãy sớm viết thư lại cho mình nhé!\n\nThân mến,\nMinh',
    targetVocabulary: [
      { word: 'in good health and high spirits', pos: 'phr.', meaningVi: 'khỏe mạnh và tinh thần phấn chấn', exampleEn: 'I hope this letter finds you in good health and high spirits.' },
      { word: 'be tied up with', pos: 'phr.', meaningVi: 'bận rộn với việc gì', exampleEn: 'I have been quite tied up with my university exams.' },
      { word: 'drop me a line', pos: 'idiom', meaningVi: 'viết thư / nhắn tin ngắn cho tôi nhé', exampleEn: 'Drop me a line soon!' }
    ],
    linkedChallengeDays: [15, 29, 44, 66],
    addedAt: '2026-11-02'
  }
];

// ============================================================================
// F. NGÂN HÀNG BÀI TẬP & PHƯƠNG PHÁP LISTENING (LISTENING BANK — TRANG 11 & 81–83)
// ============================================================================
export const VSTEP_PDF_LISTENING_BANK: PdfListeningBankItem[] = [
  {
    id: 'vstep-pdf-lis-01',
    title: 'Short Conversation Q1: Hệ thống máy tính thư viện & Mượn sách liên thư viện',
    type: 'short_conversation_mcq',
    examType: 'VSTEP',
    pdfPage: 'Trang 11',
    questionEn: 'Question 1: What does the man offer to do for the woman?',
    questionVi: 'Câu hỏi 1: Người đàn ông đề nghị làm gì giúp người phụ nữ?',
    options: [
      'A. Check the central computer system to locate the book at another library branch',
      'B. Lend her his own personal copy of the economics textbook',
      'C. Extend the due date of her library loan for two more weeks',
      'D. Order a brand-new book from the university bookstore'
    ],
    correctOption: 'A. Check the central computer system to locate the book at another library branch',
    transcriptEn:
      'Woman: Excuse me, I’ve been looking everywhere on the third floor for "Modern Macroeconomics," but it seems to be checked out.\nMan: Let me check our central computer system for you. Even if our campus library doesn’t have a copy on the shelf right now, I can see if one of the partner libraries has it available and request an inter-library loan for you.',
    transcriptVi:
      'Người phụ nữ: Xin lỗi, tôi đã tìm khắp tầng ba cuốn "Kinh tế học Vĩ mô Hiện đại" nhưng có vẻ nó đã được mượn hết rồi.\nNgười đàn ông: Để tôi kiểm tra hệ thống máy tính trung tâm giúp bạn. Ngay cả khi thư viện cơ sở mình hiện không còn cuốn nào trên kệ, tôi có thể xem thư viện liên kết có sẵn không và yêu cầu mượn liên thư viện cho bạn.',
    keyEvidenceExplanation:
      'Bằng chứng nằm ở câu của người đàn ông: "Let me check our central computer system for you... see if one of the partner libraries has it available" -> Khớp hoàn toàn với đáp án A.',
    chunkingPhrases: [
      { phrase: 'checked out', meaningVi: 'đã được mượn hết (sách thư viện)' },
      { phrase: 'central computer system', meaningVi: 'hệ thống máy tính trung tâm' },
      { phrase: 'inter-library loan', meaningVi: 'mượn sách liên thư viện' }
    ],
    linkedChallengeDays: [5, 17, 66],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-lis-02',
    title: 'Short Conversation Q2: Phòng họp Câu lạc bộ Tranh biện (Debate Club Meeting Room)',
    type: 'short_conversation_mcq',
    examType: 'VSTEP',
    pdfPage: 'Trang 11',
    questionEn: 'Question 2: What is true about the debate club’s meeting room?',
    questionVi: 'Câu hỏi 2: Điều nào sau đây đúng về phòng họp của câu lạc bộ tranh biện?',
    options: [
      'A. The club has outgrown its old room and moved the meeting to Turner Auditorium',
      'B. The meeting was canceled because the auditorium is under renovation',
      'C. Only senior members are allowed to enter the new meeting room',
      'D. The room was changed to a smaller classroom on the first floor'
    ],
    correctOption: 'A. The club has outgrown its old room and moved the meeting to Turner Auditorium',
    transcriptEn:
      'Man: Hey Sarah, are you heading to Room 204 for the debate club meeting?\nWoman: Actually, haven’t you heard? So many freshmen signed up this semester that we completely outgrew Room 204. The president moved our weekly sessions to Turner Auditorium so everyone can have a seat.',
    transcriptVi:
      'Người đàn ông: Chào Sarah, cậu đang tới Phòng 204 để dự buổi họp câu lạc bộ tranh biện phải không?\nNgười phụ nữ: Thực ra cậu chưa nghe thông báo à? Học kỳ này có nhiều tân sinh viên đăng ký tham gia đến mức Phòng 204 không còn đủ chỗ nữa (outgrew Room 204). Chủ nhiệm câu lạc bộ đã chuyển buổi sinh hoạt hàng tuần sang Hội trường Turner để mọi người đều có chỗ ngồi.',
    keyEvidenceExplanation:
      'Động từ chìa khóa "outgrew Room 204" (phát triển quá đông khiến phòng cũ trở nên quá chật) và "moved our weekly sessions to Turner Auditorium" -> Chọn đáp án A.',
    chunkingPhrases: [
      { phrase: 'outgrow a room', meaningVi: 'tăng số lượng thành viên khiến căn phòng trở nên quá nhỏ' },
      { phrase: 'Turner Auditorium', meaningVi: 'Hội trường Turner' }
    ],
    linkedChallengeDays: [12, 28, 66],
    addedAt: '2026-11-02'
  },
  {
    id: 'vstep-pdf-lis-03',
    title: 'Phương Pháp Luyện Nghe 3 Bước & Chiến Thuật 20 Phút/Ngày (Listening Reflex Method)',
    type: 'listening_strategy',
    examType: 'IELTS & VSTEP',
    pdfPage: 'Trang 81–83',
    questionEn: 'How to apply the 3-Step Listening Strategy (20 minutes/day) to master linking sounds and chunking?',
    questionVi: 'Làm thế nào áp dụng quy trình luyện nghe 3 bước (20 phút/ngày) để bắt âm nối và cụm từ học thuật?',
    transcriptEn:
      'If you’re short on time, focus on a two-minute audio clip using three steps:\nStep 1 (Chunking): Break long sentences into meaningful phrase chunks such as "If you’re short on time," "builds upon," and "diving into the same exploratory topic."\nStep 2 (Linking Sounds & Weak Forms): Notice how native speakers link final consonants to vowels—for example, "terrible at" sounds like "terrible-it," and "builds upon" links smoothly.\nStep 3 (Cloze Reflex Test): Listen again and fill in the missing key chunks without looking at the script.',
    transcriptVi:
      'Nếu bạn có ít thời gian (short on time), hãy tập trung vào một đoạn nghe 2 phút với 3 bước:\nBước 1 (Tách cụm - Chunking): Chia câu dài thành các cụm có nghĩa như "If you’re short on time", "builds upon", "diving into the same exploratory topic".\nBước 2 (Bắt âm nối & Âm lướt): Chú ý cách người bản xứ nối phụ âm cuối sang nguyên âm đầu—ví dụ "terrible at" nghe như "terrible-it".\nBước 3 (Điền khuyết phản xạ): Nghe lại và điền nhanh các cụm từ khóa còn thiếu mà không nhìn transcript.',
    keyEvidenceExplanation:
      'Trích nguyên bản từ ghi chú phương pháp luyện nghe với AI (Trang 81–83 - Ôn thi vstep.pdf).',
    chunkingPhrases: [
      { phrase: "If you're short on time", meaningVi: 'Nếu bạn có ít thời gian / đang bận rộn', phoneticNote: '/ɪf jʊə ʃɔːt ɒn taɪm/' },
      { phrase: 'builds upon', meaningVi: 'xây dựng dựa trên / phát triển tiếp nối từ', phoneticNote: 'Nối âm /bɪldz‿əˈpɒn/' },
      { phrase: 'diving into the same exploratory topic', meaningVi: 'đào sâu vào cùng một chủ đề khám phá', phoneticNote: 'Chunking học thuật C1' },
      { phrase: 'terrible at', meaningVi: 'rất tệ / kém ở mảng gì đó', phoneticNote: 'Âm lướt nghe như "terrible-it" (/ˈter.ə.bəl‿ət/)' }
    ],
    linkedChallengeDays: [1, 10, 20, 45, 66],
    addedAt: '2026-11-02'
  }
];

// ============================================================================
// G. GHI CHÚ CÁ NHÂN, LỊCH THI & CÁC MỤC CẦN ÔN TẬP (STUDY NOTES — TRANG 8, 32, 66, 75)
// ============================================================================
export const VSTEP_PDF_STUDY_NOTES: PdfStudyNoteItem[] = [
  {
    id: 'vstep-pdf-note-01',
    title: 'Ghi chú Đề Thi Thực Tế Ngày 3 Tháng 8 (Favorite Restaurant & Childhood Obesity)',
    category: 'exam_reminder',
    pdfPage: 'Trang 59 & Trang 75',
    originalNoteText: '3 Tháng 8: part 2 : nhà hàng yêu thích /// Part 3 : Ảnh hưởng của béo phì',
    systemActionableAdvice:
      'Đã tích hợp trọn vẹn cả 2 đề này vào Ngân hàng Speaking Part 2 (Đề 6 & Đề 7: Chọn nhà hàng ăn mừng / Tiệc gia đình) và Speaking Part 3 (Chủ đề 5: Childhood Obesity & Long-term Health Effects).',
    reviewStatus: 'verified',
    linkedChallengeDays: [36, 42, 65]
  },
  {
    id: 'vstep-pdf-note-02',
    title: 'Kỹ thuật Giải Thích 1 Tầng vs. Giải Thích 2 Tầng trong Writing Task 2',
    category: 'writing_technique',
    pdfPage: 'Trang 32',
    originalNoteText:
      'Giải thích 1 tầng: Báo mạng rất tiện lợi. -> Giải thích 2 tầng: Tiện lợi vì chỉ cần 1 chiếc điện thoại có kết nối Internet là đọc được tin tức mọi lúc mọi nơi mà không mất phí in ấn.',
    systemActionableAdvice:
      'Luôn đặt câu hỏi "Bằng cơ chế nào? (How?)" và "Dẫn đến kết quả thực tế gì? (So what?)" sau mỗi câu Supporting Idea để tự động nâng điểm Task Response từ 6.0 lên 7.5+.',
    reviewStatus: 'verified',
    linkedChallengeDays: [3, 8, 22, 61]
  },
  {
    id: 'vstep-pdf-note-03',
    title: 'Nhóm câu hỏi Exercise 10 (Trang 7–8) & Một số câu Part 1 chưa có bài mẫu dài trong PDF',
    category: 'unfinished_prompt',
    pdfPage: 'Trang 7–8, 42, 61',
    originalNoteText:
      'Các câu hỏi: (1) Is exercise necessary for children? (2) What kind of food should children avoid? (3) Do young or old people read more often? — Trong PDF mới có dàn ý ngắn, cần bài mẫu hoàn chỉnh.',
    systemActionableAdvice:
      'Hệ thống giữ nguyên trạng thái "Cần bổ sung / Đã gợi ý mẫu B2–C1": Trẻ em cần vận động ít nhất 60 phút/ngày để phát triển xương và tránh béo phì; nên hạn chế đồ ăn siêu chế biến (ultra-processed food); người trẻ đọc tin ngắn trên mạng nhiều hơn trong khi người lớn tuổi thích đọc sách/báo in sâu sắc.',
    reviewStatus: 'needs_review',
    linkedChallengeDays: [8, 36, 65]
  }
];

// ============================================================================
// CHUYỂN ĐỔI CÁC CẤU TRÚC & NGỮ PHÁP TRONG PDF 83 TRANG SANG PdfKnowledgeRecord
// ĐỂ HIỂN THỊ ĐỒNG BỘ TRONG TRANG "CẤU TRÚC" (EXPANDED EXAMPLES LIBRARY)
// MÀ KHÔNG GHI ĐÈ 77 CẤU TRÚC HIỆN CÓ (BẮT ĐẦU TỪ #78 TRỞ ĐI)
// ============================================================================
export const VSTEP_PDF_AS_KNOWLEDGE_RECORDS: PdfKnowledgeRecord[] = [
  ...VSTEP_PDF_STRUCTURE_BANK.map((st, idx): PdfKnowledgeRecord => {
    const itemNum = 78 + idx;
    const pageNum = parseInt(st.pdfPage.replace(/\D+/g, ''), 10) || 10;
    return {
      id: `vstep-pdf-lib-${itemNum}`,
      pdfItemNumber: itemNum,
      pdfFileName: 'Ôn thi vstep.pdf (83 trang)',
      pdfPage: pageNum,
      structureName: `[${st.examType}] ${st.title}`,
      formula: st.formula,
      meaningVi: st.purposeVi,
      whenToUse: `${st.skill} • Chủ đề: ${st.topic} (${st.pdfPage} - Ôn thi vstep.pdf)`,
      category: st.skill.includes('Speaking') ? 'everyday-communication' : 'ielts-vstep',
      categoryLabel: st.skill.includes('Speaking')
        ? 'Giao tiếp & Phản xạ Speaking'
        : 'Mẫu câu IELTS Writing & VSTEP',
      difficulty: st.cefrLevel === 'C1' ? 'Band 8.0+' : 'Band 7.0–7.5',
      originalPdfExample: st.examplesEnVi[0]?.en || st.editedStandardContent,
      originalPdfExampleVi: st.examplesEnVi[0]?.vi || st.purposeVi,
      originalPdfNotes: `[Bản gốc PDF - ${st.pdfPage}]: ${st.originalPdfContent}${
        st.commonMistakeNote ? ` | Lưu ý: ${st.commonMistakeNote}` : ''
      }`,
      howItWorksVi: st.editedStandardContent,
      syntacticBreakdown: st.formula.split(/->|\||\+/).map(s => s.trim()).filter(Boolean),
      logicalFunction: `${st.purposeVi} (Liên kết Ngày ${st.linkedChallengeDays.join(', ')})`,
      expandedExamples: st.examplesEnVi.map((ex, exIdx) => ({
        id: `vstep-pdf-lib-${itemNum}-ex-${exIdx + 1}`,
        domain: st.examType === 'VSTEP' ? 'VSTEP' : 'IELTS Writing',
        english: ex.en,
        vietnamese: ex.vi,
        highlightedPattern: st.formula,
        whyUseStructure: `Trích từ ${st.pdfPage} (Ôn thi vstep.pdf) — Áp dụng cho ${st.skill}.`
      })),
      usefulVariations: [st.editedStandardContent],
      sentenceTransformations: [
        {
          id: `vstep-pdf-lib-${itemNum}-tr-1`,
          originalSentence: st.originalPdfContent,
          transformedSentence: st.examplesEnVi[0]?.en || st.editedStandardContent,
          transformationType: `Chuẩn hóa từ Ghi chú gốc (${st.pdfPage}) lên Band 7.5+ (${st.cefrLevel})`,
          explanationVi: st.purposeVi
        }
      ],
      commonMistakes: [
        {
          id: `vstep-pdf-lib-${itemNum}-err-1`,
          wrongExample: st.commonMistakeNote || 'Viết câu liệt kê rời rạc thiếu từ nối và giải thích 2 tầng.',
          correctExample: st.examplesEnVi[0]?.en || st.editedStandardContent,
          errorReasonVi: st.commonMistakeNote || 'Cần tuân thủ đúng khung triển khai ý trong PDF.',
          grammarRuleVi: st.formula
        }
      ],
      practiceExercises: [
        {
          id: `vstep-pdf-lib-${itemNum}-quiz-1`,
          type: 'multiple-choice',
          question: `Mục đích chính của cấu trúc "${st.title}" (${st.pdfPage}) là gì?`,
          options: [
            st.purposeVi,
            'Chỉ dùng để viết câu cảm thán trong văn nói thân mật',
            'Thay thế hoàn toàn động từ chính trong câu đơn',
            'Chỉ dùng cho bài đọc hiểu trắc nghiệm'
          ],
          correctAnswer: st.purposeVi,
          explanationVi: `Theo tài liệu Ôn thi vstep.pdf (${st.pdfPage}): ${st.purposeVi}`
        }
      ]
    };
  }),
  ...VSTEP_PDF_GRAMMAR_BANK.map((gr, idx): PdfKnowledgeRecord => {
    const itemNum = 78 + VSTEP_PDF_STRUCTURE_BANK.length + idx;
    const pageNum = parseInt(gr.pdfPage.replace(/\D+/g, ''), 10) || 15;
    return {
      id: `vstep-pdf-lib-${itemNum}`,
      pdfItemNumber: itemNum,
      pdfFileName: 'Ôn thi vstep.pdf (83 trang)',
      pdfPage: pageNum,
      structureName: `[Ngữ pháp ${gr.examType}] ${gr.title}`,
      formula: gr.ruleFormula,
      meaningVi: gr.explanationVi,
      whenToUse: `Chống bẫy ngữ pháp & Sửa lỗi (${gr.pdfPage} - Ôn thi vstep.pdf)`,
      category: 'grammar-formulas',
      categoryLabel: 'Công thức Ngữ pháp & Mẫu câu',
      difficulty: 'Band 7.0–7.5',
      originalPdfExample: gr.examples[0]?.correct || '',
      originalPdfExampleVi: gr.examples[0]?.vi || '',
      originalPdfNotes: `[Bản gốc PDF - ${gr.pdfPage}]: ${gr.originalPdfNote} | Bẫy: ${gr.comparisonOrTrap}`,
      howItWorksVi: gr.explanationVi,
      syntacticBreakdown: gr.ruleFormula.split('\n').map(s => s.trim()).filter(Boolean),
      logicalFunction: gr.comparisonOrTrap,
      expandedExamples: gr.examples.map((ex, exIdx) => ({
        id: `vstep-pdf-lib-${itemNum}-ex-${exIdx + 1}`,
        domain: 'Academic English',
        english: ex.correct,
        vietnamese: ex.vi,
        highlightedPattern: gr.ruleFormula,
        whyUseStructure: gr.comparisonOrTrap
      })),
      usefulVariations: [gr.ruleFormula],
      sentenceTransformations: [
        {
          id: `vstep-pdf-lib-${itemNum}-tr-1`,
          originalSentence: gr.examples[0]?.wrong || gr.originalPdfNote,
          transformedSentence: gr.examples[0]?.correct || '',
          transformationType: 'Sửa lỗi ngữ pháp thực chiến từ Ôn thi vstep.pdf',
          explanationVi: gr.explanationVi
        }
      ],
      commonMistakes: [
        {
          id: `vstep-pdf-lib-${itemNum}-err-1`,
          wrongExample: gr.examples[0]?.wrong || gr.comparisonOrTrap,
          correctExample: gr.examples[0]?.correct || '',
          errorReasonVi: gr.comparisonOrTrap,
          grammarRuleVi: gr.ruleFormula
        }
      ],
      practiceExercises: [
        {
          id: `vstep-pdf-lib-${itemNum}-quiz-1`,
          type: 'multiple-choice',
          question: gr.practiceQuiz.question,
          options: gr.practiceQuiz.options,
          correctAnswer: gr.practiceQuiz.correctAnswer,
          explanationVi: gr.practiceQuiz.explanationVi
        }
      ]
    };
  })
];

/**
 * Helper lấy toàn bộ tài liệu PDF liên kết với một Ngày cụ thể (Day 1 -> Day 60 và Day 61+)
 */
export function getLinkedPdfResourcesForDay(day: number) {
  // Đảm bảo mọi ngày từ 1..60+ đều có tài liệu liên kết theo chu kỳ chủ đề hoặc trực tiếp
  const structures = VSTEP_PDF_STRUCTURE_BANK.filter(
    item => item.linkedChallengeDays.includes(day) || ((day - 1) % VSTEP_PDF_STRUCTURE_BANK.length === VSTEP_PDF_STRUCTURE_BANK.indexOf(item))
  );
  const grammar = VSTEP_PDF_GRAMMAR_BANK.filter(
    item => item.linkedChallengeDays.includes(day) || ((day - 1) % VSTEP_PDF_GRAMMAR_BANK.length === VSTEP_PDF_GRAMMAR_BANK.indexOf(item))
  );
  const vocab = VSTEP_PDF_VOCAB_BANK.filter(item => item.linkedChallengeDays.includes(day));
  const speakingPart1 = VSTEP_PDF_SPEAKING_PART1_BANK.filter(item => item.linkedChallengeDays.includes(day));
  const speakingPart2 = VSTEP_PDF_SPEAKING_PART2_BANK.filter(
    item => item.linkedChallengeDays.includes(day) || ((day - 1) % VSTEP_PDF_SPEAKING_PART2_BANK.length === VSTEP_PDF_SPEAKING_PART2_BANK.indexOf(item))
  );
  const speakingPart3 = VSTEP_PDF_SPEAKING_PART3_BANK.filter(
    item => item.linkedChallengeDays.includes(day) || ((day - 1) % VSTEP_PDF_SPEAKING_PART3_BANK.length === VSTEP_PDF_SPEAKING_PART3_BANK.indexOf(item))
  );
  const writing = VSTEP_PDF_WRITING_BANK.filter(
    item => item.linkedChallengeDays.includes(day) || ((day - 1) % VSTEP_PDF_WRITING_BANK.length === VSTEP_PDF_WRITING_BANK.indexOf(item))
  );
  const listening = VSTEP_PDF_LISTENING_BANK.filter(item => item.linkedChallengeDays.includes(day));
  const notes = VSTEP_PDF_STUDY_NOTES.filter(item => item.linkedChallengeDays.includes(day));

  return {
    structures,
    grammar,
    vocab,
    speakingPart1,
    speakingPart2,
    speakingPart3,
    writing,
    listening,
    notes
  };
}
