import {
  CollocationQuestion,
  ContextQuestion,
  DistinctionPair,
  GRAMMAR_TIPS
} from './vocabularyData';
import { PdfKnowledgeRecord } from './expandedPdfLibraryData';

export type GrammarTipItem = (typeof GRAMMAR_TIPS)[number] & {
  wrongExample2?: string;
  correctExample2?: string;
};

/**
 * Nhân đôi kho Ngữ Pháp Học Thuật (Quy Chuẩn Hành Văn & Tab Ngữ Pháp trong Tổng Kho Tư Liệu)
 */
export const EXTRA_GRAMMAR_TIPS: GrammarTipItem[] = [
  {
    title: 'Đảo ngữ học thuật với "Not only ... but also" ở đầu câu (Band 8.0+)',
    rule: 'Khi đặt "Not only" ở đầu câu để nhấn mạnh luận điểm trong IELTS Writing Task 2, mệnh đề thứ nhất bắt buộc phải đảo ngữ (Trợ động từ + S + V), mệnh đề thứ hai giữ nguyên trật tự bình thường.',
    wrongExample: 'Not only renewable energy reduces carbon emissions, but it also creates jobs.',
    correctExample: 'Not only does renewable energy reduce carbon emissions, but it also creates green jobs.',
    wrongExample2: 'Not only governments invested in railways, but they also subsidized buses.',
    correctExample2: 'Not only did governments invest in railways, but they also subsidized public buses.',
    takeaway: 'Luôn kiểm tra thì của động từ để mượn trợ động từ (do/does/did/have/can) chính xác ngay sau "Not only".'
  },
  {
    title: 'Cấu trúc Giả định thức (Subjunctive Mood) sau "It is imperative / paramount that..."',
    rule: 'Sau các tính từ chỉ sự cấp thiết học thuật (imperative, paramount, essential, vital, crucial, mandatory) + that + S + V(nguyên mẫu không chia số ít/thì).',
    wrongExample: 'It is imperative that the government enacts stricter environmental laws.',
    correctExample: 'It is imperative that the government enact stricter environmental laws.',
    wrongExample2: 'It is vital that every citizen participates in waste sorting.',
    correctExample2: 'It is vital that every citizen participate in municipal waste sorting.',
    takeaway: 'Dù chủ ngữ là ngôi thứ 3 số ít (the government, every citizen), động từ sau "that" vẫn giữ nguyên mẫu (enact, participate) hoặc "be + V3/ed".'
  },
  {
    title: 'Mệnh đề Phân từ Hoàn thành (Having + V3/ed) diễn tả nguyên nhân / hành động xảy ra trước',
    rule: 'Dùng "Having + V3/ed" (chủ động) hoặc "Having been + V3/ed" (bị động) ở đầu câu để rút gọn hai mệnh đề cùng chủ ngữ khi hành động thứ nhất xảy ra trước hoặc là nguyên nhân của hành động thứ hai.',
    wrongExample: 'Depleted its natural resources, the nation faced severe economic stagnation.',
    correctExample: 'Having depleted its natural resources, the nation faced severe economic stagnation.',
    wrongExample2: 'Exposed to prolonged industrial noise, workers suffered hearing loss.',
    correctExample2: 'Having been exposed to prolonged industrial noise, workers suffered chronic hearing loss.',
    takeaway: 'Giúp câu văn cô đọng và đạt điểm tuyệt đối ở tiêu chí Grammatical Range & Accuracy.'
  },
  {
    title: 'Cấu trúc Câu chẻ nhấn mạnh (Cleft Sentences: "It is ... that ...")',
    rule: 'Dùng "It is/was + [Thành phần cần nhấn mạnh] + that/who + [Mệnh đề còn lại]" để hướng sự chú ý của giám khảo vào nguyên nhân cốt lõi.',
    wrongExample: 'Socioeconomic disparity is that drives urban crime rates.',
    correctExample: 'It is socioeconomic disparity that drives urban crime rates in megacities.',
    wrongExample2: 'Early childhood education shapes long-term cognitive development.',
    correctExample2: 'It is early childhood education that shapes long-term cognitive resilience.',
    takeaway: 'Rất hiệu quả khi viết câu Topic Sentence hoặc câu khẳng định quan điểm ở đoạn Conclusion.'
  },
  {
    title: 'Danh từ hóa (Nominalisation) để chuyển văn phong Speaking sang Academic Writing',
    rule: 'Thay vì dùng nhiều động từ và trạng từ đơn lẻ, hãy biến động từ/tính từ thành Cụm Danh Từ làm chủ ngữ hoặc tân ngữ cho các động từ học thuật (precipitate, necessitate, hinder).',
    wrongExample: 'Because cities grow too fast, hospitals and schools cannot work well.',
    correctExample: 'Rapid urban proliferation places an unsustainable strain on municipal infrastructure.',
    wrongExample2: 'When people use too many antibiotics, bacteria become resistant.',
    correctExample2: 'The overprescription of antibiotics accelerates antimicrobial resistance.',
    takeaway: 'Nominalisation là ranh giới rõ nhất giữa bài viết Band 6.5 và bài viết Band 8.0+.'
  },
  {
    title: 'Giới từ "Despite / In spite of" vs Liên từ "Although / Even though / Much as"',
    rule: 'Sau "Despite / In spite of" bắt buộc là Cụm Danh Từ hoặc V-ing (hoặc "the fact that + S + V"). Tuyệt đối không dùng "Despite + S + V" hoặc "Despite of".',
    wrongExample: 'Despite of the government invested heavily, poverty remained high.',
    correctExample: 'Despite substantial government investment, systemic poverty remained entrenched.',
    wrongExample2: 'Although the stringent regulations, illegal logging persists.',
    correctExample2: 'Notwithstanding the stringent regulations, illegal logging persists in remote regions.',
    takeaway: 'Có thể nâng cấp "Despite" thành "Notwithstanding" (đứng trước hoặc sau danh từ) để đạt C2.'
  },
  {
    title: 'Cấu trúc Nhượng bộ đảo ngữ với "Much as / Adj + as/though + S + V"',
    rule: 'Để thừa nhận một mặt của vấn đề trước khi phản biện (Counter-argument), dùng "Much as + S + V" hoặc "Adj + as/though + S + V".',
    wrongExample: 'Lucrative as is technological automation, it displaces low-skilled workers.',
    correctExample: 'Lucrative as technological automation may be, it inevitably displaces low-skilled workers.',
    wrongExample2: 'Much as artificial intelligence is beneficial, it raises ethical concerns.',
    correctExample2: 'Much as artificial intelligence enhances productivity, it raises profound ethical concerns.',
    takeaway: 'Cấu trúc "Adj + as + S + may be" cực kỳ ăn điểm trong đoạn phản biện (Counter-argument) của Task 2.'
  },
  {
    title: 'Sự hòa hợp Chủ ngữ - Động từ với "The number of" vs "A number of"',
    rule: '"The number of + N(số nhiều)" mang nghĩa "Con số thống kê" ➔ Động từ chia SỐ ÍT. "A number of + N(số nhiều)" mang nghĩa "Nhiều (= Many)" ➔ Động từ chia SỐ NHIỀU.',
    wrongExample: 'The number of university graduates seeking remote jobs have risen sharply.',
    correctExample: 'The number of university graduates seeking remote employment has risen sharply.',
    wrongExample2: 'A growing number of empirical studies confirms this hypothesis.',
    correctExample2: 'A growing number of empirical studies confirm this macroeconomic hypothesis.',
    takeaway: 'Rất hay gặp trong IELTS Writing Task 1 (mô tả biểu đồ) và Task 2.'
  },
  {
    title: 'Cấu trúc "Were + S + to V" (Câu điều kiện loại 2 đảo ngữ học thuật)',
    rule: 'Trong văn viết trang trọng, thay vì dùng "If governments implemented...", hãy đảo "Were + S + to V" để giả định một kịch bản chính sách.',
    wrongExample: 'Were authorities ignore climate warnings, coastal cities would flood.',
    correctExample: 'Were authorities to ignore climate warnings, coastal metropolises would face inundation.',
    wrongExample2: 'If public transit were free, carbon emissions would plummet.',
    correctExample2: 'Were municipal transit to be fully subsidized, vehicular emissions would plummet.',
    takeaway: 'Dùng "Were + S + to V" ở đoạn Kết bài (Conclusion) để đưa ra cảnh báo hoặc khuyến nghị chính sách.'
  },
  {
    title: 'Cấu trúc "Had + S + V3/ed" (Câu điều kiện loại 3 đảo ngữ)',
    rule: 'Dùng để phân tích nguyên nhân - hệ quả trong quá khứ: "Had + S + (not) + V3/ed, S + would have + V3/ed".',
    wrongExample: 'Had the central bank intervened earlier, the recession would be averted.',
    correctExample: 'Had the central bank intervened earlier, the fiscal recession would have been averted.',
    wrongExample2: 'If regulators had scrutinized the data, the discrepancy would be detected.',
    correctExample2: 'Had regulators scrutinized the audit data, the discrepancy would have been detected.',
    takeaway: 'Loại bỏ hoàn toàn "If" và đưa "Had" lên đầu câu để tạo nhịp điệu báo chí học thuật.'
  },
  {
    title: 'Mệnh đề quan hệ rút gọn với "whereby" và "in which" trong văn bản học thuật',
    rule: 'Dùng "whereby" (= by which / through which) sau các danh từ chỉ hệ thống, quy trình, chính sách (mechanism, system, policy, process) để giải thích cơ chế vận hành.',
    wrongExample: 'The government introduced a scheme where companies pay carbon taxes.',
    correctExample: 'The government enacted a regulatory mechanism whereby corporations pay carbon levies.',
    wrongExample2: 'Peer review is a process which scientists evaluate research.',
    correctExample2: 'Peer review constitutes a rigorous process whereby scholars scrutinize empirical findings.',
    takeaway: 'Không dùng "where" cho các danh từ trừu tượng không chỉ địa điểm vật lý; hãy dùng "whereby" hoặc "in which".'
  },
  {
    title: 'Phân biệt "Comprise" vs "Consist of" vs "Be composed of"',
    rule: 'Ở nghĩa chủ động, "comprise" = "consist of" (bao gồm), TUYỆT ĐỐI không viết "comprise of". Ở dạng bị động chính thống, ưu tiên dùng "be composed of" hoặc "be להרכיב / made up of".',
    wrongExample: 'The academic committee comprises of twelve distinguished linguists.',
    correctExample: 'The academic committee comprises twelve distinguished linguists.',
    wrongExample2: 'The index is consisted of five macroeconomic indicators.',
    correctExample2: 'The composite index is composed of five macroeconomic indicators.',
    takeaway: 'Nhớ quy tắc vàng: "Consist of" (luôn chủ động, có of) — "Comprise" (không có of).'
  }
];

export function getTwoGrammarExamplePairs(tip: GrammarTipItem): {
  wrong1: string;
  correct1: string;
  wrong2: string;
  correct2: string;
} {
  const wrong1 = tip.wrongExample || 'Incorrect grammatical structure in academic writing.';
  const correct1 = tip.correctExample || 'Accurate grammatical structure in IELTS Band 8.0+ writing.';
  const wrong2 =
    tip.wrongExample2 ||
    `[Biến thể lỗi thường gặp]: Applying "${tip.title.split('"')[1] || 'this structure'}" without proper syntactic agreement.`;
  const correct2 =
    tip.correctExample2 ||
    `[Câu mẫu Band 8.0+]: Policymakers must apply this grammatical rule accurately to ensure syntactic precision.`;
  return { wrong1, correct1, wrong2, correct2 };
}

/**
 * Nhân đôi kho câu hỏi Phối Ngữ & Mạch Văn (CollocationsQuiz)
 */
export const EXTRA_COLLOCATION_QUESTIONS: CollocationQuestion[] = [
  {
    id: 'col-ext-1',
    sentence: 'Stringent environmental legislation is required to ______ the adverse impacts of industrial deforestation.',
    targetMissing: 'mitigate',
    options: ['mitigate', 'exacerbate', 'proliferate', 'fluctuate'],
    correctAnswer: 'mitigate',
    explanation: 'Cụm Collocation chuẩn Pearson ACL: "mitigate the adverse impacts of" (giảm thiểu những tác động bất lợi của...).',
    vietnameseMeaning: 'Cần có luật môi trường nghiêm ngặt để giảm thiểu những tác động bất lợi của nạn phá rừng công nghiệp.'
  },
  {
    id: 'col-ext-2',
    sentence: 'Unchecked urban sprawl tends to ______ socioeconomic disparities between affluent suburbs and inner-city districts.',
    targetMissing: 'exacerbate',
    options: ['exacerbate', 'alleviate', 'corroborate', 'allocate'],
    correctAnswer: 'exacerbate',
    explanation: 'Cụm Collocation chuẩn: "exacerbate socioeconomic disparities" (làm trầm trọng thêm sự chênh lệch kinh tế - xã hội).',
    vietnameseMeaning: 'Sự đô thị hóa tự phát có xu hướng làm trầm trọng thêm sự bất bình đẳng kinh tế - xã hội.'
  },
  {
    id: 'col-ext-3',
    sentence: 'Longitudinal clinical trials were conducted to ______ the hypothesis regarding sleep deprivation and cognitive decline.',
    targetMissing: 'corroborate',
    options: ['corroborate', 'undermine', 'fluctuate', 'deviate'],
    correctAnswer: 'corroborate',
    explanation: 'Cụm Collocation học thuật: "corroborate the hypothesis / empirical findings" (củng cố, xác nhận giả thuyết bằng bằng chứng).',
    vietnameseMeaning: 'Các thử nghiệm lâm sàng dài hạn được tiến hành nhằm củng cố giả thuyết về mối liên hệ giữa thiếu ngủ và suy giảm nhận thức.'
  },
  {
    id: 'col-ext-4',
    sentence: 'A quiet, structured study environment is highly ______ to deep academic concentration and knowledge retention.',
    targetMissing: 'conducive',
    options: ['conducive', 'detrimental', 'susceptible', 'incompatible'],
    correctAnswer: 'conducive',
    explanation: 'Cấu trúc cố định: "be conducive to + Noun/V-ing" (tạo điều kiện thuận lợi cho...).',
    vietnameseMeaning: 'Một môi trường học tập yên tĩnh, có tổ chức rất thuận lợi cho sự tập trung học thuật sâu và ghi nhớ kiến thức.'
  },
  {
    id: 'col-ext-5',
    sentence: 'The independent audit revealed a glaring ______ between the corporation’s declared carbon offsets and actual emissions.',
    targetMissing: 'discrepancy',
    options: ['discrepancy', 'consensus', 'paradigm', 'incentive'],
    correctAnswer: 'discrepancy',
    explanation: 'Cụm Collocation chuẩn: "a glaring/significant discrepancy between A and B" (sự sai lệch rõ rệt giữa A và B).',
    vietnameseMeaning: 'Cuộc kiểm toán độc lập đã phơi bày sự sai lệch rõ rệt giữa lượng bù đắp carbon công bố và lượng phát thải thực tế.'
  },
  {
    id: 'col-ext-6',
    sentence: 'Municipal authorities must ______ fiscal resources equitably to upgrade deteriorating public transit networks.',
    targetMissing: 'allocate',
    options: ['allocate', 'deplete', 'erode', 'impede'],
    correctAnswer: 'allocate',
    explanation: 'Cụm Collocation chuẩn AWL Sublist 2: "allocate fiscal resources" (phân bổ nguồn lực tài khóa).',
    vietnameseMeaning: 'Chính quyền thành phố phải phân bổ nguồn lực tài chính một cách công bằng để nâng cấp mạng lưới giao thông công cộng đang xuống cấp.'
  },
  {
    id: 'col-ext-7',
    sentence: 'The rapid rise of generative artificial intelligence has triggered a fundamental ______ shift in higher education.',
    targetMissing: 'paradigm',
    options: ['paradigm', 'parameter', 'protocol', 'prevalence'],
    correctAnswer: 'paradigm',
    explanation: 'Cụm Collocation kinh điển: "trigger a paradigm shift in" (tạo ra bước chuyển dịch hệ quy chiếu tư duy trong...).',
    vietnameseMeaning: 'Sự trỗi dậy nhanh chóng của trí tuệ nhân tạo tạo sinh đã kích hoạt một bước chuyển dịch mô hình căn bản trong giáo dục đại học.'
  },
  {
    id: 'col-ext-8',
    sentence: 'Prolonged exposure to algorithmic echo chambers can ______ public trust in democratic institutions.',
    targetMissing: 'undermine',
    options: ['undermine', 'bolster', 'foster', 'cultivate'],
    correctAnswer: 'undermine',
    explanation: 'Cụm Collocation chuẩn Oxford C1: "undermine public trust / credibility" (làm xói mòn, suy yếu niềm tin công chúng).',
    vietnameseMeaning: 'Việc tiếp xúc lâu dài với các buồng vang thuật toán có thể làm suy yếu niềm tin của công chúng vào các định chế dân chủ.'
  },
  {
    id: 'col-ext-9',
    sentence: 'Developing economies remain disproportionately ______ to macroeconomic shocks and supply chain disruptions.',
    targetMissing: 'vulnerable',
    options: ['vulnerable', 'impervious', 'immune', 'indifferent'],
    correctAnswer: 'vulnerable',
    explanation: 'Cụm Collocation: "be disproportionately vulnerable/susceptible to" (dễ bị tổn thương trước...).',
    vietnameseMeaning: 'Các nền kinh tế đang phát triển vẫn dễ bị tổn thương một cách bất cân xứng trước các cú sốc kinh tế vĩ mô.'
  },
  {
    id: 'col-ext-10',
    sentence: 'Policymakers have reached a broad ______ on the necessity of phasing out fossil fuel subsidies.',
    targetMissing: 'consensus',
    options: ['consensus', 'controversy', 'contention', 'constraint'],
    correctAnswer: 'consensus',
    explanation: 'Cụm Collocation chuẩn: "reach a broad consensus on" (đạt được sự đồng thuận rộng rãi về...).',
    vietnameseMeaning: 'Các nhà hoạch định chính sách đã đạt được sự đồng thuận rộng rãi về sự cần thiết của việc loại bỏ trợ cấp nhiên liệu hóa thạch.'
  },
  {
    id: 'col-ext-11',
    sentence: 'Critical thinking and digital literacy are ______ skills for navigating contemporary information ecosystems.',
    targetMissing: 'indispensable',
    options: ['indispensable', 'superfluous', 'redundant', 'negligible'],
    correctAnswer: 'indispensable',
    explanation: 'Cụm Collocation: "indispensable skills / play an indispensable role" (kỹ năng không thể thiếu).',
    vietnameseMeaning: 'Tư duy phản biện và năng lực số là những kỹ năng không thể thiếu để định hướng trong hệ sinh thái thông tin đương đại.'
  },
  {
    id: 'col-ext-12',
    sentence: 'Regulatory bodies must closely ______ the algorithmic transparency of multinational technology conglomerates.',
    targetMissing: 'scrutinize',
    options: ['scrutinize', 'overlook', 'fabricate', 'speculate'],
    correctAnswer: 'scrutinize',
    explanation: 'Cụm Collocation: "closely scrutinize" (kiểm tra, giám sát kỹ lưỡng từng chi tiết).',
    vietnameseMeaning: 'Các cơ quan quản lý phải giám sát kỹ lưỡng tính minh bạch thuật toán của các tập đoàn công nghệ đa quốc gia.'
  }
];

/**
 * Nhân đôi kho Thẩm Định Ngữ Nghĩa (DistinctionsQuiz)
 */
export const EXTRA_TRICKY_DISTINCTIONS: DistinctionPair[] = [
  {
    id: 'mitigate-vs-alleviate-vs-eradicate',
    title: 'Mitigate vs. Alleviate vs. Eradicate (Sắc thái Giảm thiểu & Xóa bỏ C1-C2)',
    termA: 'Mitigate',
    termB: 'Alleviate',
    termC: 'Eradicate',
    explanationA: 'Làm giảm mức độ nghiêm trọng, thiệt hại hoặc rủi ro của một tác động tiêu cực (mitigate climate change, mitigate risks).',
    explanationB: 'Làm dịu bớt nỗi đau, gánh nặng hoặc áp lực tức thời nhưng chưa xóa bỏ hoàn toàn nguyên nhân gốc rễ (alleviate poverty, alleviate pain/traffic congestion).',
    explanationC: 'Xóa sổ, tiêu diệt tận gốc hoàn toàn một dịch bệnh hoặc tệ nạn (eradicate illiteracy, eradicate malaria).',
    ruleSummary: 'Giảm rủi ro/hậu quả ➔ MITIGATE. Xoa dịu nỗi đau/gánh nặng ➔ ALLEVIATE. Xóa sổ tận gốc 100% ➔ ERADICATE.',
    testQuestions: [
      {
        question: 'Global vaccination campaigns have successfully ______ smallpox from the human population.',
        options: ['mitigated', 'alleviated', 'eradicated', 'fluctuated'],
        correctIndex: 2,
        explanation: 'Xóa sổ hoàn toàn 100% một căn bệnh khỏi nhân loại ➔ Dùng "eradicated".'
      },
      {
        question: 'Coastal mangrove forests serve as a natural buffer to ______ the destructive impact of tropical typhoons.',
        options: ['eradicate', 'mitigate', 'exacerbate', 'proliferate'],
        correctIndex: 1,
        explanation: 'Giảm thiểu mức độ tàn phá/rủi ro thiên tai ➔ Dùng cụm chuẩn "mitigate the destructive impact of".'
      }
    ]
  },
  {
    id: 'discrepancy-vs-disparity',
    title: 'Discrepancy vs. Disparity (Sai lệch số liệu vs. Bất bình đẳng xã hội)',
    termA: 'Discrepancy',
    termB: 'Disparity',
    explanationA: 'Sự khác biệt, không khớp nhau giữa hai con số, báo cáo hoặc lời khai lẽ ra phải giống nhau (a discrepancy between estimated and actual costs).',
    explanationB: 'Sự chênh lệch, bất bình đẳng lớn và thiếu công bằng về thu nhập, y tế, giáo dục giữa các nhóm xã hội (income disparity, regional disparities).',
    ruleSummary: 'Lệch số liệu/báo cáo kiểm toán ➔ DISCREPANCY. Bất bình đẳng thu nhập/giai cấp/vùng miền ➔ DISPARITY.',
    testQuestions: [
      {
        question: 'Policymakers must address the widening socioeconomic ______ between metropolitan hubs and rural provinces.',
        options: ['discrepancy', 'disparity', 'redundancy', 'complacency'],
        correctIndex: 1,
        explanation: 'Sự chênh lệch/bất bình đẳng kinh tế - xã hội giữa thành thị và nông thôn ➔ Dùng "socioeconomic disparity".'
      },
      {
        question: 'Researchers discovered a methodological ______ between the survey results and the official census data.',
        options: ['disparity', 'discrepancy', 'hegemony', 'autonomy'],
        correctIndex: 1,
        explanation: 'Sự sai lệch giữa hai nguồn số liệu thống kê ➔ Dùng "discrepancy".'
      }
    ]
  },
  {
    id: 'empirical-vs-theoretical-vs-hypothetical',
    title: 'Empirical vs. Theoretical vs. Hypothetical (Thực nghiệm vs. Lý thuyết vs. Giả định)',
    termA: 'Empirical',
    termB: 'Theoretical',
    termC: 'Hypothetical',
    explanationA: 'Dựa trên quan sát thực tế, số liệu khảo sát hoặc thí nghiệm kiểm chứng được (empirical evidence, empirical research).',
    explanationB: 'Dựa trên hệ thống lý thuyết và mô hình học thuật hơn là ứng dụng thực tế (theoretical framework).',
    explanationC: 'Mang tính giả định, tưởng tượng ra để thảo luận chứ chưa xảy ra trong thực tế (a hypothetical scenario).',
    ruleSummary: 'Bằng chứng thực tế đo lường được ➔ EMPIRICAL. Khung lý thuyết ➔ THEORETICAL. Tình huống giả định ➔ HYPOTHETICAL.',
    testQuestions: [
      {
        question: 'Without rigorous ______ data gathered from clinical trials, the new therapy cannot be approved.',
        options: ['hypothetical', 'empirical', 'ambiguous', 'superfluous'],
        correctIndex: 1,
        explanation: 'Dữ liệu thực nghiệm thu thập từ thử nghiệm lâm sàng ➔ Dùng "empirical data".'
      },
      {
        question: 'Let us consider a ______ situation in which all fossil fuels are banned overnight.',
        options: ['empirical', 'hypothetical', 'pragmatic', 'indigenous'],
        correctIndex: 1,
        explanation: 'Tình huống giả định chưa có thật để lập luận ➔ Dùng "a hypothetical situation".'
      }
    ]
  },
  {
    id: 'economic-vs-economical',
    title: 'Economic vs. Economical (Thuộc về nền kinh tế vs. Tiết kiệm, kinh tế)',
    termA: 'Economic',
    termB: 'Economical',
    explanationA: 'Liên quan đến thương mại, công nghiệp, tài chính quốc gia (economic growth, economic crisis, economic policy).',
    explanationB: 'Tiết kiệm chi phí, nhiên liệu, thời gian, không lãng phí (an economical car, an economical use of resources).',
    ruleSummary: 'Tăng trưởng/Khủng hoảng/Chính sách kinh tế vĩ mô ➔ ECONOMIC. Tiết kiệm tiền/nhiên liệu ➔ ECONOMICAL.',
    testQuestions: [
      {
        question: 'Hybrid vehicles are far more ______ than conventional SUVs in terms of fuel consumption.',
        options: ['economic', 'economical', 'economics', 'economically'],
        correctIndex: 1,
        explanation: 'Tiết kiệm nhiên liệu và chi phí vận hành ➔ Dùng "economical".'
      },
      {
        question: 'Prolonged inflation can severely destabilize a nation’s ______ trajectory.',
        options: ['economical', 'economic', 'economy', 'economize'],
        correctIndex: 1,
        explanation: 'Quỹ đạo phát triển của nền kinh tế vĩ mô ➔ Dùng "economic trajectory".'
      }
    ]
  },
  {
    id: 'adverse-vs-averse',
    title: 'Adverse vs. Averse (Bất lợi, có hại vs. Ngần ngại, phản đối)',
    termA: 'Adverse',
    termB: 'Averse',
    explanationA: 'Tính từ đi trước danh từ chỉ điều kiện, tác động tiêu cực, bất lợi (adverse weather conditions, adverse side effects).',
    explanationB: 'Tính từ vị ngữ (thường dùng "be averse to + Noun/V-ing") chỉ thái độ không thích, ngần ngại rủi ro (risk-averse investors).',
    ruleSummary: 'Tác động/Điều kiện bất lợi ➔ ADVERSE (effects/conditions). Ngại/Ghét cái gì ➔ BE AVERSE TO.',
    testQuestions: [
      {
        question: 'Institutional pension funds are notoriously risk-______ and prefer government bonds over volatile equities.',
        options: ['adverse', 'averse', 'inverse', 'diverse'],
        correctIndex: 1,
        explanation: 'Cụm từ chuyên ngành tài chính: "risk-averse" (ngại rủi ro).'
      },
      {
        question: ' Fiscal austerity measures may have ______ consequences for low-income households.',
        options: ['averse', 'adverse', 'converse', 'perverse'],
        correctIndex: 1,
        explanation: 'Hệ quả bất lợi/tiêu cực ➔ Dùng "adverse consequences".'
      }
    ]
  },
  {
    id: 'continual-vs-continuous',
    title: 'Continual vs. Continuous (Lặp đi lặp lại nhiều lần vs. Liên tục không ngắt quãng)',
    termA: 'Continual',
    termB: 'Continuous',
    explanationA: 'Diễn ra lặp đi lặp lại nhiều lần theo chu kỳ (có khoảng nghỉ ở giữa), thường dùng cho việc nâng cấp kỹ năng hoặc sự gián đoạn (continual professional development, continual interruptions).',
    explanationB: 'Diễn ra liền mạch 100% không có bất kỳ sự ngắt quãng nào (24 hours of continuous operation, a continuous line).',
    ruleSummary: 'Lặp lại nhiều lần có ngắt quãng ➔ CONTINUAL. Liền mạch không nghỉ giây nào ➔ CONTINUOUS.',
    testQuestions: [
      {
        question: 'The neonatal intensive care unit requires an uninterrupted, ______ power supply 24 hours a day.',
        options: ['continual', 'continuous', 'sporadic', 'intermittent'],
        correctIndex: 1,
        explanation: 'Nguồn điện liền mạch không ngắt quãng một giây nào ➔ Dùng "continuous".'
      },
      {
        question: 'In the digital era, employees must engage in ______ upskilling to remain competitive.',
        options: ['continuous', 'continual', 'simultaneous', 'spontaneous'],
        correctIndex: 1,
        explanation: 'Việc bồi dưỡng kỹ năng diễn ra đều đặn, lặp lại qua thời gian ➔ Dùng "continual upskilling".'
      }
    ]
  }
];

/**
 * Nhân đôi kho Chuyên Đề Học Thuật (ContextQuiz)
 */
export const EXTRA_CONTEXT_QUESTIONS: ContextQuestion[] = [
  {
    id: 'ctx-ext-16',
    contextType: 'IELTS Writing',
    sentence: 'While technological automation boosts industrial output, it simultaneously threatens to ______ millions of routine clerical workers.',
    blank: 'displace',
    options: ['displace', 'cultivate', 'corroborate', 'reconcile'],
    correctAnswer: 'displace',
    explanation: 'Trong ngữ cảnh tự động hóa & AI, "displace workers" là cụm học thuật chuẩn xác chỉ việc thay thế/đẩy người lao động khỏi vị trí việc làm.',
    fullTranslation: 'Mặc dù tự động hóa công nghệ thúc đẩy sản lượng công nghiệp, nó đồng thời đe dọa thay thế hàng triệu nhân viên văn phòng làm công việc lặp lại.'
  },
  {
    id: 'ctx-ext-17',
    contextType: 'IELTS Writing',
    sentence: 'To combat urban heat islands, municipal planners are integrating ______ surfaces and vertical forests into metropolitan architecture.',
    blank: 'permeable',
    options: ['permeable', 'volatile', 'redundant', 'arbitrary'],
    correctAnswer: 'permeable',
    explanation: '"Permeable surfaces" (bề mặt thấm nước/thoáng khí) là thuật ngữ quy hoạch đô thị bền vững trong IELTS Academic.',
    fullTranslation: 'Để chống lại hiệu ứng đảo nhiệt đô thị, các nhà quy hoạch thành phố đang tích hợp các bề mặt thấm nước và rừng thẳng đứng vào kiến trúc đô thị.'
  },
  {
    id: 'ctx-ext-18',
    contextType: 'Business',
    sentence: 'Central banks often raise benchmark interest rates to curb runaway inflation, albeit at the risk of triggering economic ______.',
    blank: 'stagnation',
    options: ['stagnation', 'proliferation', 'affluence', 'hegemony'],
    correctAnswer: 'stagnation',
    explanation: '"Economic stagnation" (sự trì trệ kinh tế) là thuật ngữ kinh tế vĩ mô chuẩn xác đi kèm với chính sách thắt chặt tiền tệ.',
    fullTranslation: 'Các ngân hàng trung ương thường tăng lãi suất chuẩn để kiềm chế lạm phát phi mã, dù phải đối mặt với rủi ro gây ra sự trì trệ kinh tế.'
  },
  {
    id: 'ctx-ext-19',
    contextType: 'IELTS Speaking',
    sentence: 'In an era of relentless digital notifications, carving out moments of uninterrupted ______ is essential for mental clarity.',
    blank: 'introspection',
    options: ['introspection', 'coercion', 'infringement', 'deterrence'],
    correctAnswer: 'introspection',
    explanation: '"Introspection" (sự chiêm nghiệm, tự vấn nội tâm) mang sắc thái C2 rất đắt giá cho chủ đề Psychology & Well-being.',
    fullTranslation: 'Trong kỷ nguyên của những thông báo kỹ thuật số dồn dập, việc dành ra những khoảng lặng chiêm nghiệm nội tâm không bị gián đoạn là điều thiết yếu cho sự minh mẫn tinh thần.'
  },
  {
    id: 'ctx-ext-20',
    contextType: 'IELTS Writing',
    sentence: 'International treaties on carbon emissions remain largely ineffective unless accompanied by binding enforcement ______.',
    blank: 'mechanisms',
    options: ['mechanisms', 'anomalies', 'dichotomies', 'fallacies'],
    correctAnswer: 'mechanisms',
    explanation: 'Cụm Collocation chuẩn AWL: "binding enforcement mechanisms" (cơ chế thực thi có tính ràng buộc pháp lý).',
    fullTranslation: 'Các hiệp ước quốc tế về phát thải carbon phần lớn vẫn kém hiệu quả trừ khi đi kèm với các cơ chế thực thi có tính ràng buộc.'
  },
  {
    id: 'ctx-ext-21',
    contextType: 'IELTS Writing',
    sentence: 'The ______ of ultra-processed foods in modern supermarkets has contributed directly to the global epidemic of metabolic disorders.',
    blank: 'ubiquity',
    options: ['ubiquity', 'scarcity', 'ambiguity', 'integrity'],
    correctAnswer: 'ubiquity',
    explanation: '"The ubiquity of..." (sự hiện diện tràn lan ở khắp mọi nơi của...) giúp nâng cấp trực tiếp cho cụm "the fact that ... is everywhere".',
    fullTranslation: 'Sự hiện diện tràn lan của thực phẩm siêu chế biến trong các siêu thị hiện đại đã góp phần trực tiếp vào đại dịch rối loạn chuyển hóa toàn cầu.'
  },
  {
    id: 'ctx-ext-22',
    contextType: 'Business',
    sentence: 'Before acquiring the rival startup, the board commissioned a forensic audit to verify its financial ______.',
    blank: 'solvency',
    options: ['solvency', 'complacency', 'redundancy', 'apathy'],
    correctAnswer: 'solvency',
    explanation: '"Financial solvency" (khả năng thanh toán nợ / sự lành mạnh tài chính) là thuật ngữ kinh doanh C1-C2.',
    fullTranslation: 'Trước khi mua lại công ty khởi nghiệp đối thủ, hội đồng quản trị đã ủy quyền kiểm toán chuyên sâu để xác minh khả năng thanh toán tài chính của công ty đó.'
  },
  {
    id: 'ctx-ext-23',
    contextType: 'IELTS Speaking',
    sentence: 'Rather than imposing a blanket ban on smartphones in classrooms, educators should adopt a more ______ pedagogical approach.',
    blank: 'nuanced',
    options: ['nuanced', 'draconian', 'obsolete', 'superficial'],
    correctAnswer: 'nuanced',
    explanation: '"A nuanced approach" (cách tiếp cận tinh tế, có xét đến nhiều khía cạnh) là cụm từ ăn điểm tuyệt đối trong Speaking Part 3 & Writing Task 2.',
    fullTranslation: 'Thay vì áp đặt lệnh cấm tuyệt đối điện thoại thông minh trong lớp học, các nhà giáo dục nên áp dụng một cách tiếp cận sư phạm tinh tế và đa chiều hơn.'
  },
  {
    id: 'ctx-ext-24',
    contextType: 'IELTS Writing',
    sentence: 'Preserving ______ languages is not merely a linguistic endeavor; it is vital for safeguarding humanity’s intangible cultural heritage.',
    blank: 'indigenous',
    options: ['indigenous', 'ephemeral', 'lucrative', 'mundane'],
    correctAnswer: 'indigenous',
    explanation: '"Indigenous languages / cultures" (ngôn ngữ / văn hóa bản địa) là cụm học thuật cốt lõi chủ đề Culture & Globalization.',
    fullTranslation: 'Bảo tồn các ngôn ngữ bản địa không chỉ đơn thuần là một nỗ lực ngôn ngữ học; đó là điều sống còn để bảo vệ di sản văn hóa phi vật thể của nhân loại.'
  },
  {
    id: 'ctx-ext-25',
    contextType: 'IELTS Writing',
    sentence: 'Critics argue that short-term electoral cycles incentivize politicians to prioritize immediate popularity over ______ structural reforms.',
    blank: 'far-reaching',
    options: ['far-reaching', 'short-sighted', 'negligible', 'sporadic'],
    correctAnswer: 'far-reaching',
    explanation: '"Far-reaching structural reforms" (những cải cách cấu trúc có tầm ảnh hưởng sâu rộng) là Collocation C1-C2 kinh điển.',
    fullTranslation: 'Giới phê bình cho rằng các chu kỳ bầu cử ngắn hạn thúc đẩy các chính trị gia ưu tiên sự ủng hộ tức thời hơn là những cải cách cấu trúc có tầm ảnh hưởng sâu rộng.'
  },
  {
    id: 'ctx-ext-26',
    contextType: 'Daily English',
    sentence: 'After months of burning the midnight oil for the bar exam, she decided to unwind and recharge her ______ in the countryside.',
    blank: 'batteries',
    options: ['batteries', 'engines', 'circuits', 'turbines'],
    correctAnswer: 'batteries',
    explanation: 'Thành ngữ tự nhiên trong IELTS Speaking Part 1 & 2: "recharge one’s batteries" (nạp lại năng lượng, nghỉ ngơi lấy lại sức).',
    fullTranslation: 'Sau nhiều tháng thức khuya học tập căng thẳng cho kỳ thi luật sư, cô ấy quyết định thư giãn và nạp lại năng lượng ở vùng ngoại ô.'
  },
  {
    id: 'ctx-ext-27',
    contextType: 'IELTS Writing',
    sentence: 'Empirical studies demonstrate an ______ link between early childhood nutrition and subsequent academic attainment.',
    blank: 'inextricable',
    options: ['inextricable', 'inconsequential', 'arbitrary', 'incompatible'],
    correctAnswer: 'inextricable',
    explanation: 'Cụm Collocation C2: "an inextricable link between A and B" (mối liên hệ mật thiết không thể tách rời giữa A và B).',
    fullTranslation: 'Các nghiên cứu thực nghiệm chứng minh mối liên hệ mật thiết không thể tách rời giữa dinh dưỡng đầu đời và thành tích học tập về sau.'
  },
  {
    id: 'ctx-ext-28',
    contextType: 'Business',
    sentence: 'To prevent monopolistic practices, antitrust regulators imposed ______ fines on the multinational pharmaceutical cartel.',
    blank: 'punitive',
    options: ['punitive', 'lenient', 'marginal', 'nominal'],
    correctAnswer: 'punitive',
    explanation: '"Punitive fines / tariffs / measures" (mức phạt / biện pháp mang tính trừng phạt, răn đe cao).',
    fullTranslation: 'Để ngăn chặn các hành vi độc quyền, cơ quan chống độc quyền đã áp đặt mức phạt mang tính răn đe nghiêm khắc đối với liên minh dược phẩm đa quốc gia.'
  },
  {
    id: 'ctx-ext-29',
    contextType: 'IELTS Speaking',
    sentence: 'When evaluating historical monuments, we must strike a delicate ______ between commercial tourism and architectural preservation.',
    blank: 'balance',
    options: ['balance', 'collision', 'margin', 'fraction'],
    correctAnswer: 'balance',
    explanation: 'Cụm Collocation cực kỳ thông dụng: "strike a delicate balance between A and B" (đạt được sự cân bằng tinh tế giữa A và B).',
    fullTranslation: 'Khi đánh giá các di tích lịch sử, chúng ta phải tìm được sự cân bằng tinh tế giữa du lịch thương mại và bảo tồn kiến trúc.'
  },
  {
    id: 'ctx-ext-30',
    contextType: 'IELTS Writing',
    sentence: 'Without equitable access to broadband infrastructure, the digital divide will continue to ______ marginalized rural communities.',
    blank: 'disenfranchise',
    options: ['disenfranchise', 'emancipate', 'subsidize', 'invigorate'],
    correctAnswer: 'disenfranchise',
    explanation: '"Disenfranchise marginalized communities" (tước đi cơ hội/quyền lợi của các cộng đồng yếu thế) là động từ C2 xuất sắc.',
    fullTranslation: 'Nếu không có quyền tiếp cận công bằng với cơ sở hạ tầng băng thông rộng, khoảng cách số sẽ tiếp tục tước đi cơ hội phát triển của các cộng đồng nông thôn yếu thế.'
  }
];

export function getSecondContextExample(q: ContextQuestion): {
  sentenceEn: string;
  translationVi: string;
  collocations: string[];
} {
  const kw = q.correctAnswer;
  return {
    sentenceEn: `[Academic Extension]: Policymakers and scholars frequently emphasize how "${kw}" shapes institutional resilience in ${q.contextType} discourse.`,
    translationVi: `[Ví dụ mở rộng #2]: Các nhà hoạch định chính sách và học giả thường xuyên nhấn mạnh cách "${kw}" định hình năng lực thích ứng trong diễn ngôn ${q.contextType}.`,
    collocations: [
      `apply "${kw}" in context`,
      `academic nuance of ${kw}`,
      `critical role of ${kw}`,
      `evaluate ${kw} systematically`,
      `foster long-term ${kw}`,
      `demonstrate ${kw} effectively`
    ]
  };
}

/**
 * Nhân đôi dữ liệu cho mỗi cấu trúc trong Quy Chuẩn Hành Văn (ExpandedExamplesLibrary):
 * - Đảm bảo đủ 6 usefulVariations (cụm phối ngữ / biến thể cú pháp)
 * - Cung cấp câu ví dụ nguyên bản thứ 2 + dịch nghĩa thứ 2
 * - Nhân đôi danh sách expandedExamples cho từng cấu trúc
 */
export function enrichPdfStructureWithDoubledContent(record: PdfKnowledgeRecord): PdfKnowledgeRecord & {
  secondOriginalExampleEn: string;
  secondOriginalExampleVi: string;
} {
  const baseVariations = Array.isArray(record.usefulVariations) ? [...record.usefulVariations] : [];
  const fallbackVariations = [
    `${record.formula} (in IELTS Writing Task 2)`,
    `Apply [${record.structureName}] for Academic Cohesion`,
    ` Formal Register: ${record.formula.split('+')[0]?.trim() || record.structureName}`,
    `Syntactic Upgrade (${record.difficulty})`,
    ` Band 8.0+ Discourse Marker with ${record.structureName}`,
    `High-Scoring Clause Combination (${record.categoryLabel})`
  ];
  for (const fv of fallbackVariations) {
    if (baseVariations.length >= 6) break;
    if (!baseVariations.includes(fv)) {
      baseVariations.push(fv);
    }
  }

  const firstExpanded = record.expandedExamples[0];
  const secondOriginalExampleEn =
    firstExpanded?.english ||
    `From a macroeconomic standpoint, applying "${record.formula}" enables writers to articulate complex arguments with precision.`;
  const secondOriginalExampleVi =
    firstExpanded?.vietnamese ||
    `Dưới góc nhìn kinh tế vĩ mô, việc vận dụng cấu trúc "${record.formula}" giúp người viết diễn đạt các luận điểm phức tạp một cách chuẩn xác.`;

  const existingExpanded = Array.isArray(record.expandedExamples) ? record.expandedExamples : [];
  const doubledExpanded = [
    ...existingExpanded,
    ...existingExpanded.map((ex, idx) => ({
      ...ex,
      id: `${ex.id}-ext-${idx + 1}`,
      english:
        idx % 2 === 0
          ? `Viewed through the lens of contemporary policy, ${ex.english.charAt(0).toLowerCase()}${ex.english.slice(1)}`
          : `Empirical evidence further suggests that ${ex.english.charAt(0).toLowerCase()}${ex.english.slice(1)}`,
      vietnamese: `[Mở rộng C1–C2]: ${ex.vietnamese}`
    }))
  ];

  return {
    ...record,
    usefulVariations: baseVariations.slice(0, 6),
    expandedExamples: doubledExpanded,
    secondOriginalExampleEn,
    secondOriginalExampleVi
  };
}
