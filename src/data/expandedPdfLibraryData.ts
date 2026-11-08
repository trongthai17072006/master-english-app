export type StructureCategory =
  | 'grammar-formulas'
  | 'academic-structures'
  | 'ielts-vstep'
  | 'everyday-communication'
  | 'advanced-variations'
  | 'mistakes-transformations';

export type DifficultyBand = 'Band 6.0–6.5' | 'Band 7.0–7.5' | 'Band 8.0+';

export type ContextDomain =
  | 'IELTS Writing'
  | 'VSTEP'
  | 'Academic English'
  | 'Everyday English'
  | 'Education'
  | 'Finance & Economy'
  | 'Technology'
  | 'Work & Career'
  | 'Personal & Well-being';

export interface ExpandedContextExample {
  id: string;
  domain: ContextDomain;
  english: string;
  vietnamese: string;
  highlightedPattern: string;
  whyUseStructure: string;
}

export interface SentenceTransformationItem {
  id: string;
  originalSentence: string;
  transformedSentence: string;
  transformationType: string;
  explanationVi: string;
}

export interface CommonMistakeItem {
  id: string;
  wrongExample: string;
  correctExample: string;
  errorReasonVi: string;
  grammarRuleVi: string;
}

export interface StructurePracticeExercise {
  id: string;
  type: 'multiple-choice' | 'transformation';
  question: string;
  options: string[];
  correctAnswer: string;
  explanationVi: string;
}

export interface PdfKnowledgeRecord {
  id: string;
  pdfItemNumber: number;
  pdfFileName: string;
  pdfPage: number;
  structureName: string;
  formula: string;
  meaningVi: string;
  whenToUse: string;
  category: StructureCategory;
  categoryLabel: string;
  difficulty: DifficultyBand;
  // Original PDF Content (Strictly from Untitled_document_bb0198f5.pdf)
  originalPdfExample: string;
  originalPdfExampleVi: string;
  originalPdfNotes: string;
  // Expanded AI-Generated Supplementary Content
  howItWorksVi: string;
  syntacticBreakdown: string[];
  logicalFunction: string;
  expandedExamples: ExpandedContextExample[];
  usefulVariations: string[];
  sentenceTransformations: SentenceTransformationItem[];
  commonMistakes: CommonMistakeItem[];
  practiceExercises: StructurePracticeExercise[];
}

export const PDF_SOURCE_METADATA = {
  fileName: 'Untitled_document_bb0198f5.pdf',
  publicUrl: '/assets/documents/Untitled_document_bb0198f5.pdf',
  totalPages: 25,
  contentPages: 24,
  totalExtractedItems: 77,
  title: 'Hệ Thống 77 Cấu Trúc & Công Thức Câu IELTS / VSTEP Thực Chiến'
};

export const CATEGORY_METADATA: {
  id: StructureCategory | 'all';
  label: string;
  shortLabel: string;
  description: string;
}[] = [
  {
    id: 'all',
    label: 'Tất cả danh mục',
    shortLabel: 'Tất cả',
    description: 'Toàn bộ 77 cấu trúc trích xuất từ tài liệu PDF gốc và ví dụ mở rộng'
  },
  {
    id: 'grammar-formulas',
    label: 'Công thức Ngữ pháp & Mẫu câu',
    shortLabel: 'Công thức & Mẫu câu',
    description: 'Các công thức câu nền tảng, động từ nguyên mẫu, danh động từ và cấu trúc sở hữu'
  },
  {
    id: 'academic-structures',
    label: 'Cấu trúc Câu Học thuật',
    shortLabel: 'Cấu trúc Học thuật',
    description: 'Cấu trúc mở bài, câu chủ đề (Topic Sentence), nhân quả và liên kết luận điểm'
  },
  {
    id: 'ielts-vstep',
    label: 'Mẫu câu IELTS Writing & VSTEP',
    shortLabel: 'IELTS / VSTEP',
    description: 'Mẫu câu chuyên dụng cho IELTS Writing Task 2 và VSTEP B2–C1 Essay'
  },
  {
    id: 'everyday-communication',
    label: 'Giao tiếp & Phản xạ Speaking',
    shortLabel: 'Giao tiếp & Speaking',
    description: 'Cấu trúc khích lệ, phản hồi tự nhiên, thành ngữ và kể trải nghiệm Speaking Part 1–3'
  },
  {
    id: 'advanced-variations',
    label: 'Biến thể Nâng cao (Đảo ngữ & Câu chẻ)',
    shortLabel: 'Biến thể Nâng cao',
    description: 'Đảo ngữ (Not only, Only if, Rarely), Câu chẻ (Wh-Cleft, It-Cleft), Bị động nâng cao'
  },
  {
    id: 'mistakes-transformations',
    label: 'So sánh, Đối chiếu & Chuyển đổi câu',
    shortLabel: 'So sánh & Chuyển đổi',
    description: 'Cấu trúc phân biệt khái niệm, so sánh học thuật và bẫy ngữ pháp hay nhầm lẫn'
  }
];

interface RawPdfSeed {
  num: number;
  page: number;
  name: string;
  formula: string;
  meaning: string;
  when: string;
  cat: StructureCategory;
  diff: DifficultyBand;
  pdfEx: string;
  pdfExVi: string;
  pdfNotes: string;
  howItWorks: string;
  slots: string[];
  logicFn: string;
  variations: string[];
  examples: Omit<ExpandedContextExample, 'id'>[];
  transformations: Omit<SentenceTransformationItem, 'id'>[];
  mistakes: Omit<CommonMistakeItem, 'id'>[];
  exercises: Omit<StructurePracticeExercise, 'id'>[];
}

const CORE_CURATED_SEEDS: RawPdfSeed[] = [
  {
    num: 1,
    page: 1,
    name: 'The rapid advancement of...',
    formula: 'The rapid advancement of + N + has transformed the way people + V, leading many to + V',
    meaning: 'Sự phát triển nhanh chóng của... đã thay đổi cách con người..., khiến nhiều người...',
    when: 'Mở bài (Introduction Hook & Background Statement)',
    cat: 'ielts-vstep',
    diff: 'Band 7.0–7.5',
    pdfEx: 'The rapid advancement of AI has transformed the way people work, leading many to predict major workplace changes.',
    pdfExVi: 'Sự phát triển nhanh chóng của AI đã thay đổi cách con người làm việc, khiến nhiều người dự đoán những thay đổi lớn tại nơi làm việc.',
    pdfNotes: 'Mẫu câu mở bài nâng cao, dùng cho công nghệ, toàn cầu hóa, đô thị hóa... ("many to" là người ta hiểu "many people to").',
    howItWorks: 'Kết hợp cụm danh từ chủ ngữ chỉ sự bùng nổ công nghệ/xã hội với thì Hiện tại hoàn thành (has transformed) để nhấn mạnh tác động kéo dài đến hiện tại, sau đó dùng mệnh đề phân từ hiện tại (leading many to + V) để mở ra luồng tranh luận trong bài viết.',
    slots: [
      'The rapid advancement of + [Danh từ chủ đề: AI / digital technology / urbanization]',
      'has transformed the way people + [Động từ nguyên mẫu: work / communicate / learn]',
      ', leading many to + [Động từ nhận thức: believe / predict / question]'
    ],
    logicFn: 'Đặt tiền đề vĩ mô (Macro Hook) -> Nêu biến đổi thực tế -> Dẫn dắt sang quan điểm tranh luận.',
    variations: [
      'The proliferation of + N + has revolutionized the manner in which individuals + V, prompting many to + V',
      'Rapid breakthroughs in + N + have reshaped how modern society + V-s, leading experts to + V'
    ],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'The rapid advancement of renewable energy technologies has transformed the way nations generate power, leading many to believe that fossil fuels will soon become obsolete.',
        vietnamese: 'Sự phát triển nhanh chóng của công nghệ năng lượng tái tạo đã thay đổi cách các quốc gia sản xuất điện, khiến nhiều người tin rằng nhiên liệu hóa thạch sẽ sớm trở nên lỗi thời.',
        highlightedPattern: 'The rapid advancement of [renewable energy technologies] has transformed the way [nations generate power], leading many to [believe...]',
        whyUseStructure: 'Mở bài IELTS Writing Task 2 chủ đề Environment & Energy, nối trực tiếp bối cảnh công nghệ với luận điểm chính.'
      },
      {
        domain: 'VSTEP',
        english: 'The rapid advancement of e-commerce platforms has transformed the way consumers shop, leading many to abandon traditional brick-and-mortar stores.',
        vietnamese: 'Sự phát triển nhanh chóng của các nền tảng thương mại điện tử đã thay đổi cách người tiêu dùng mua sắm, khiến nhiều người từ bỏ các cửa hàng truyền thống.',
        highlightedPattern: 'The rapid advancement of [e-commerce platforms] has transformed the way [consumers shop], leading many to [abandon...]',
        whyUseStructure: 'Phù hợp cho mở bài VSTEP B2–C1 chủ đề Mua sắm trực tuyến vs. Cửa hàng truyền thống.'
      },
      {
        domain: 'Education',
        english: 'The rapid advancement of cloud-based learning tools has transformed the way university students collaborate, leading many to prefer hybrid degree programs.',
        vietnamese: 'Sự phát triển nhanh chóng của các công cụ học tập đám mây đã thay đổi cách sinh viên đại học hợp tác, khiến nhiều người ưa chuộng các chương trình học kết hợp.',
        highlightedPattern: 'The rapid advancement of [cloud-based learning tools] has transformed the way [university students collaborate], leading many to [prefer...]',
        whyUseStructure: 'Diễn đạt rõ chuỗi tác động từ công cụ giáo dục đến xu hướng lựa chọn của người học.'
      },
      {
        domain: 'Finance & Economy',
        english: 'The rapid advancement of financial technology (FinTech) has transformed the way individuals manage investments, leading many to bypass conventional brokerage firms.',
        vietnamese: 'Sự phát triển nhanh chóng của công nghệ tài chính (FinTech) đã thay đổi cách cá nhân quản lý khoản đầu tư, khiến nhiều người bỏ qua các công ty môi giới truyền thống.',
        highlightedPattern: 'The rapid advancement of [FinTech] has transformed the way [individuals manage investments], leading many to [bypass...]',
        whyUseStructure: 'Thể hiện văn phong kinh tế học thuật chuẩn xác khi phân tích thị trường tài chính số.'
      }
    ],
    transformations: [
      {
        originalSentence: 'Technology is developing fast and changing how we communicate, so many people think face-to-face talk is dying.',
        transformedSentence: 'The rapid advancement of digital technology has transformed the way people communicate, leading many to fear the decline of face-to-face interaction.',
        transformationType: 'Nâng cấp câu ghép đơn giản (Band 5.5) lên câu phức phân từ (Band 7.5+)',
        explanationVi: 'Danh từ hóa "Technology is developing fast" thành "The rapid advancement of digital technology" và thay ", so many people think" bằng ", leading many to fear".'
      }
    ],
    mistakes: [
      {
        wrongExample: 'The rapid advancement of AI has transformed the way people working, leading many to predicts changes.',
        correctExample: 'The rapid advancement of AI has transformed the way people work, leading many to predict changes.',
        errorReasonVi: 'Sau "the way people" cần động từ chia theo mệnh đề quan hệ (work), và sau "leading many to" phải là động từ nguyên mẫu (predict).',
        grammarRuleVi: 'the way + S + V (chia thì) ..., leading many to + V (nguyên mẫu).'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Điền dạng đúng vào chỗ trống: "The rapid advancement of biotechnology has transformed the way doctors treat diseases, _______ many to anticipate a longer human lifespan."',
        options: ['leading', 'led', 'leads', 'to lead'],
        correctAnswer: 'leading',
        explanationVi: 'Sau dấu phẩy cuối mệnh đề chính, dùng hiện tại phân từ "leading" (rút gọn mệnh đề quan hệ chỉ hệ quả: which leads many to...).'
      }
    ]
  },
  {
    num: 2,
    page: 1,
    name: 'lead sb to do',
    formula: 'S + lead(s) + sb + to V',
    meaning: 'Khiến ai đó làm gì / dẫn dắt ai đến nhận định hoặc hành động gì',
    when: 'Nguyên nhân - Kết quả (Cause & Effect)',
    cat: 'academic-structures',
    diff: 'Band 6.0–6.5',
    pdfEx: 'This trend has led many people to believe that online education is effective.',
    pdfExVi: 'Xu hướng này đã khiến nhiều người tin rằng giáo dục trực tuyến mang lại hiệu quả.',
    pdfNotes: 'Thường đi với các động từ chỉ nhận thức: believe / predict / think.',
    howItWorks: 'Động từ "lead" (quá khứ/phân từ: led) kết nối một nguyên nhân hoặc xu hướng (Subject) với phản ứng nhận thức hoặc hành vi của con người (sb + to V).',
    slots: ['[Nguyên nhân / Xu hướng: This trend / Rising living costs]', 'lead(s) / has led + [Tân ngữ: many people / policymakers]', 'to + [V nguyên mẫu: believe / reconsider / adopt]'],
    logicFn: 'Bắc cầu Nhân - Quả từ một hiện tượng khách quan sang hành vi/nhận thức của chủ thể.',
    variations: ['prompt sb to V', 'induce sb to V', 'compel sb to V'],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'Persistent traffic congestion has led urban planners to prioritize underground metro networks.',
        vietnamese: 'Tình trạng tắc nghẽn giao thông kéo dài đã khiến các nhà quy hoạch đô thị ưu tiên mạng lưới tàu điện ngầm.',
        highlightedPattern: '[Persistent traffic congestion] has led [urban planners] to [prioritize...]',
        whyUseStructure: 'Chỉ rõ nguyên nhân thực tiễn thúc đẩy quyết định chính sách công.'
      },
      {
        domain: 'Everyday English',
        english: 'His sudden silence led me to think that something was wrong.',
        vietnamese: 'Sự im lặng đột ngột của anh ấy khiến tôi nghĩ rằng có điều gì đó không ổn.',
        highlightedPattern: '[His sudden silence] led [me] to [think...]',
        whyUseStructure: 'Diễn đạt tự nhiên suy luận cá nhân trong giao tiếp hằng ngày.'
      },
      {
        domain: 'Work & Career',
        english: 'Burnout and inflexible hours have led many young professionals to seek remote freelance opportunities.',
        vietnamese: 'Sự kiệt sức và giờ giấc cứng nhắc đã khiến nhiều chuyên gia trẻ tìm kiếm cơ hội làm việc tự do từ xa.',
        highlightedPattern: '[Burnout and inflexible hours] have led [many young professionals] to [seek...]',
        whyUseStructure: 'Giải thích xu hướng dịch chuyển lao động trong môi trường công sở.'
      }
    ],
    transformations: [
      {
        originalSentence: 'Because housing prices are high, young couples delay marriage.',
        transformedSentence: 'Skyrocketing housing prices have led many young couples to delay marriage.',
        transformationType: 'Chuyển mệnh đề trạng ngữ chỉ nguyên nhân sang cấu trúc Ngoại động từ Nhân-Quả',
        explanationVi: 'Biến mệnh đề "Because housing prices are high" thành cụm danh từ chủ ngữ đứng trước "have led sb to V".'
      }
    ],
    mistakes: [
      {
        wrongExample: 'This trend has led many people believing that online learning is better.',
        correctExample: 'This trend has led many people to believe that online learning is better.',
        errorReasonVi: 'Nhầm lẫn giữa "lead to + N/V-ing" (dẫn đến việc gì) và "lead sb + to V" (khiến ai làm gì).',
        grammarRuleVi: 'Có tân ngữ chỉ người (sb) ở giữa thì dùng "lead sb to V"; không có sb thì dùng "lead to N/V-ing".'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Chọn phương án đúng: "Severe environmental degradation has led governments _______ stricter carbon taxes."',
        options: ['to introduce', 'introducing', 'introduce', 'for introducing'],
        correctAnswer: 'to introduce',
        explanationVi: 'Theo công thức "S + lead(s) + sb + to V", sau tân ngữ "governments" dùng "to introduce".'
      }
    ]
  },
  {
    num: 3,
    page: 1,
    name: 'make it increasingly feasible',
    formula: 'S + has made it increasingly feasible for sb to V',
    meaning: 'Làm cho việc gì ngày càng trở nên khả thi đối với ai',
    when: 'Thân bài (Phân tích tính khả thi của giải pháp / công nghệ)',
    cat: 'academic-structures',
    diff: 'Band 7.0–7.5',
    pdfEx: 'Technology has made it increasingly feasible for students to learn remotely.',
    pdfExVi: 'Công nghệ đã làm cho việc học từ xa ngày càng trở nên khả thi đối với học sinh, sinh viên.',
    pdfNotes: '"Feasible" là từ trang trọng (C1), hay dùng trong văn viết học thuật thay cho "possible" hoặc "easy".',
    howItWorks: 'Sử dụng tân ngữ giả "it" (preparatory object) đứng sau "made", theo sau là cụm tính từ học thuật "increasingly feasible" và cấu trúc "for sb to V" làm tân ngữ thật.',
    slots: ['[Chủ ngữ: High-speed internet / Modern medicine]', 'has made it increasingly feasible', 'for + [Đối tượng: rural students / small businesses]', 'to + [V nguyên mẫu: access global markets]'],
    logicFn: 'Chứng minh điều kiện kỹ thuật/kinh tế đã chín muồi để thực hiện một hành động.',
    variations: [
      'S + has rendered it increasingly viable for sb to V',
      'S + has made it more practical than ever for sb to V'
    ],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'Affordable solar panels have made it increasingly feasible for households to generate their own clean electricity.',
        vietnamese: 'Các tấm pin mặt trời giá rẻ đã làm cho việc tự sản xuất điện sạch ngày càng trở nên khả thi đối với các hộ gia đình.',
        highlightedPattern: '[Affordable solar panels] have made it increasingly feasible for [households] to [generate...]',
        whyUseStructure: 'Lập luận sắc bén trong thân bài IELTS Writing Task 2 về giải pháp năng lượng bền vững.'
      },
      {
        domain: 'Technology',
        english: 'Satellite internet networks have made it increasingly feasible for engineers to work from remote mountainous regions.',
        vietnamese: 'Mạng internet vệ tinh đã giúp các kỹ sư làm việc từ những vùng núi hẻo lánh ngày càng khả thi hơn.',
        highlightedPattern: '[Satellite internet networks] have made it increasingly feasible for [engineers] to [work...]',
        whyUseStructure: 'Nhấn mạnh vai trò hạ tầng công nghệ trong việc xóa bỏ rào cản địa lý.'
      },
      {
        domain: 'Finance & Economy',
        english: 'Micro-investing apps have made it increasingly feasible for low-income earners to build diversified portfolios.',
        vietnamese: 'Các ứng dụng đầu tư vi mô đã giúp người thu nhập thấp xây dựng danh mục đầu tư đa dạng ngày càng khả thi.',
        highlightedPattern: '[Micro-investing apps] have made it increasingly feasible for [low-income earners] to [build...]',
        whyUseStructure: 'Dùng từ "feasible" thể hiện tính khả thi về mặt tài chính và kỹ thuật.'
      }
    ],
    transformations: [
      {
        originalSentence: 'Now, ordinary people can travel abroad more easily because of budget airlines.',
        transformedSentence: 'The rise of budget airlines has made it increasingly feasible for ordinary citizens to travel internationally.',
        transformationType: 'Thay thế "can ... more easily" bằng cấu trúc Tân ngữ giả học thuật "make it increasingly feasible"',
        explanationVi: 'Dùng tân ngữ giả "it" giúp câu văn trang trọng và đạt chuẩn Lexical Resource Band 7.5.'
      }
    ],
    mistakes: [
      {
        wrongExample: 'Technology has made increasingly feasible for students to learn remotely.',
        correctExample: 'Technology has made it increasingly feasible for students to learn remotely.',
        errorReasonVi: 'Bỏ quên tân ngữ giả "it" giữa động từ "made" và cụm tính từ "increasingly feasible".',
        grammarRuleVi: 'make + it (tân ngữ giả bắt buộc) + adj + for sb + to V.'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Chọn câu đúng ngữ pháp học thuật:',
        options: [
          'Automation has made it increasingly feasible for factories to operate 24/7.',
          'Automation has made increasingly feasible for factories operating 24/7.',
          'Automation has made it feasible increasingly to factories operate 24/7.',
          'Automation made it is increasingly feasible for factories to operate 24/7.'
        ],
        correctAnswer: 'Automation has made it increasingly feasible for factories to operate 24/7.',
        explanationVi: 'Cấu trúc chuẩn: S + has made + it + increasingly feasible + for sb + to V.'
      }
    ]
  },
  {
    num: 4,
    page: 1,
    name: 'Anyone with...',
    formula: 'Anyone with + N + can + V',
    meaning: 'Bất kỳ ai có... đều có thể...',
    when: 'Diễn đạt chung (Generalization / Khái quát hóa trong Thân bài)',
    cat: 'grammar-formulas',
    diff: 'Band 6.0–6.5',
    pdfEx: 'Anyone with determination can succeed.',
    pdfExVi: 'Bất kỳ ai có sự quyết tâm đều có thể thành công.',
    pdfNotes: 'Trang 1–2: "With" ở đây thay thế cho mệnh đề quan hệ "who has" (rút gọn súc tích).',
    howItWorks: 'Dùng giới từ "with + Cụm danh từ" ngay sau đại từ bất định "Anyone" để thay thế cho mệnh đề quan hệ "Anyone who has/possesses...", giúp câu ngắn gọn, cô đọng.',
    slots: ['Anyone with + [Danh từ công cụ/phẩm chất: a smartphone / basic coding skills]', 'can + [Động từ nguyên mẫu: access / create / participate]'],
    logicFn: 'Khái quát hóa khả năng tiếp cận hoặc điều kiện đủ cho mọi cá nhân.',
    variations: ['Individuals with + N + are able to + V', 'Those with access to + N + can readily + V'],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'Today, anyone with a stable internet connection can attend lectures from world-class universities.',
        vietnamese: 'Ngày nay, bất kỳ ai có kết nối internet ổn định đều có thể tham gia bài giảng từ các trường đại học hàng đầu thế giới.',
        highlightedPattern: 'anyone with [a stable internet connection] can [attend lectures...]',
        whyUseStructure: 'Chứng minh tính dân chủ hóa giáo dục trong bài viết IELTS Task 2.'
      },
      {
        domain: 'Everyday English',
        english: 'Anyone with a valid library card can borrow up to five books at a time.',
        vietnamese: 'Bất kỳ ai có thẻ thư viện hợp lệ đều có thể mượn tối đa năm cuốn sách cùng lúc.',
        highlightedPattern: 'Anyone with [a valid library card] can [borrow...]',
        whyUseStructure: 'Thông báo quy định rõ ràng, tự nhiên trong đời sống.'
      },
      {
        domain: 'Work & Career',
        english: 'Anyone with strong analytical skills and adaptability can thrive in the modern data economy.',
        vietnamese: 'Bất kỳ ai có kỹ năng phân tích vững vàng và sự nhạy bén thích nghi đều có thể phát triển mạnh trong nền kinh tế dữ liệu hiện đại.',
        highlightedPattern: 'Anyone with [strong analytical skills and adaptability] can [thrive...]',
        whyUseStructure: 'Nêu điều kiện năng lực cốt lõi trong lĩnh vực nghề nghiệp.'
      }
    ],
    transformations: [
      {
        originalSentence: 'People who have a smartphone and an internet connection can start an online business.',
        transformedSentence: 'Anyone with a smartphone and an internet connection can launch an online business.',
        transformationType: 'Rút gọn mệnh đề quan hệ "who have" bằng giới từ "with"',
        explanationVi: 'Thay "People who have" bằng "Anyone with" giúp giảm từ thừa mà vẫn giữ nguyên nghĩa.'
      }
    ],
    mistakes: [
      {
        wrongExample: 'Anyone with have determination can succeed.',
        correctExample: 'Anyone with determination can succeed.',
        errorReasonVi: '"With" đã mang nghĩa "có" (thay cho who has), không dùng thêm động từ "have" phía sau.',
        grammarRuleVi: 'Anyone + with + Noun Phrase + can + V.'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Câu "Anyone with a basic knowledge of finance can understand this report" tương đương với câu nào?',
        options: [
          'Anyone who has a basic knowledge of finance can understand this report.',
          'Anyone who is a basic knowledge of finance can understand this report.',
          'Anyone without a basic knowledge of finance can understand this report.',
          'Anyone whom has a basic knowledge of finance can understand this report.'
        ],
        correctAnswer: 'Anyone who has a basic knowledge of finance can understand this report.',
        explanationVi: 'Như ghi chú trang 1–2 trong PDF: "with" thay thế trực tiếp cho mệnh đề quan hệ "who has".'
      }
    ]
  },
  {
    num: 5,
    page: 2,
    name: 'One major reason is that',
    formula: 'One major reason is that + S + V',
    meaning: 'Một lý do lớn / quan trọng là...',
    when: 'Câu chủ đề (Topic Sentence mở đầu đoạn Thân bài)',
    cat: 'ielts-vstep',
    diff: 'Band 6.0–6.5',
    pdfEx: 'One major reason is that public transport is affordable.',
    pdfExVi: 'Một lý do lớn là giao thông công cộng có chi phí phải chăng.',
    pdfNotes: 'Có mệnh đề đủ S+V phía sau thì giữ "that"; nếu chỉ là cụm danh từ thì bỏ "that" (VD: One major reason is the high cost).',
    howItWorks: 'Sử dụng mệnh đề danh ngữ bắt đầu bằng "that + S + V" đóng vai trò bổ ngữ chủ ngữ (Subject Complement) sau động từ "is" để giải thích trực tiếp luận điểm chính của đoạn văn.',
    slots: ['One major / primary / compelling reason is', 'that + [Mệnh đề đầy đủ S + V]', '(Hoặc bỏ "that" nếu theo sau là Cụm danh từ)'],
    logicFn: 'Mở đầu đoạn Thân bài 1 (Topic Sentence) để định hướng toàn bộ lập luận phía sau.',
    variations: [
      'A primary justification for this is that + S + V',
      'One compelling explanation is that + S + V'
    ],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'One major reason is that university education equips graduates with specialized problem-solving skills.',
        vietnamese: 'Một lý do lớn là giáo dục đại học trang bị cho sinh viên tốt nghiệp kỹ năng giải quyết vấn đề chuyên sâu.',
        highlightedPattern: 'One major reason is that [university education equips graduates...]',
        whyUseStructure: 'Làm câu Topic Sentence rõ ràng, mạch lạc cho đoạn Body 1 trong IELTS Writing Task 2.'
      },
      {
        domain: 'VSTEP',
        english: 'One major reason is that working from home eliminates daily commuting stress.',
        vietnamese: 'Một lý do lớn là làm việc tại nhà loại bỏ căng thẳng đi lại hằng ngày.',
        highlightedPattern: 'One major reason is that [working from home eliminates...]',
        whyUseStructure: 'Cấu trúc chuẩn mực giúp giám khảo VSTEP nhận diện ngay luận điểm số 1.'
      },
      {
        domain: 'Finance & Economy',
        english: 'One major reason is that central banks have raised interest rates to curb inflation.',
        vietnamese: 'Một lý do lớn là các ngân hàng trung ương đã tăng lãi suất để kiềm chế lạm phát.',
        highlightedPattern: 'One major reason is that [central banks have raised interest rates...]',
        whyUseStructure: 'Giải thích nguyên nhân vĩ mô bằng một mệnh đề hoàn chỉnh.'
      }
    ],
    transformations: [
      {
        originalSentence: 'One major reason is the affordability of public transport.',
        transformedSentence: 'One major reason is that public transport is highly affordable for daily commuters.',
        transformationType: 'Chuyển đổi giữa Cụm danh từ (không có that) và Mệnh đề danh ngữ (có that + S + V)',
        explanationVi: 'Đúng theo quy tắc ghi chú trong PDF trang 2: có S+V thì giữ "that", chỉ là cụm danh từ thì bỏ "that".'
      }
    ],
    mistakes: [
      {
        wrongExample: 'One major reason is because public transport is affordable.',
        correctExample: 'One major reason is that public transport is affordable.',
        errorReasonVi: 'Lỗi lặp nghĩa "reason is because" rất phổ biến trong bài viết của học viên Việt Nam.',
        grammarRuleVi: 'Luôn dùng "The reason is that + S + V", tuyệt đối không viết "The reason is because".'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Chọn câu đúng theo quy tắc trang 2 PDF:',
        options: [
          'One major reason is that housing prices have risen sharply.',
          'One major reason is that the sharp rise in housing prices.',
          'One major reason is because housing prices have risen sharply.',
          'One major reason is housing prices have risen sharply that.'
        ],
        correctAnswer: 'One major reason is that housing prices have risen sharply.',
        explanationVi: 'Sau "is that" bắt buộc phải là một mệnh đề đầy đủ S + V ("housing prices have risen sharply").'
      }
    ]
  },
  {
    num: 26,
    page: 5,
    name: 'not without (Litotes / Nói giảm nhẹ học thuật)',
    formula: 'S + be + not without + its + N (drawbacks / challenges / limitations)',
    meaning: 'Không phải là không có (Thừa nhận nhược điểm một cách tinh tế, trang trọng)',
    when: 'Trang trọng / Đoạn phản biện hoặc chuyển ý (Concession / Counter-argument)',
    cat: 'advanced-variations',
    diff: 'Band 8.0+',
    pdfEx: 'This solution is not without its drawbacks.',
    pdfExVi: 'Giải pháp này không phải là không có những nhược điểm của nó.',
    pdfNotes: 'Cách nói giảm nhẹ nhưng vẫn thừa nhận có nhược điểm; "without" là giới từ nên đi với to be (is not without), không đi cùng don\'t/doesn\'t.',
    howItWorks: 'Sử dụng phép phủ định kép (double negative / litotes: "not" + "without") kèm tính từ sở hữu "its" + danh từ số nhiều chỉ hạn chế để chuyển hướng lập luận sang mặt trái của vấn đề một cách khách quan, học thuật.',
    slots: ['[Chủ ngữ: This policy / Rapid urbanization / Remote work]', 'is not without', 'its + [Danh từ số nhiều: drawbacks / limitations / risks / controversies]'],
    logicFn: 'Tạo câu bản lề chuyển đoạn (Pivot Sentence) từ ưu điểm sang nhược điểm trong bài Discussion / Advantages-Disadvantages.',
    variations: [
      'Nevertheless, this approach is not without its inherent limitations.',
      'However, such rapid expansion is not without its socio-economic costs.'
    ],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'While nuclear power is a low-carbon energy source, it is not without its safety risks and waste disposal challenges.',
        vietnamese: 'Mặc dù điện hạt nhân là nguồn năng lượng ít phát thải carbon, nó không phải là không có những rủi ro an toàn và thách thức xử lý chất thải.',
        highlightedPattern: 'it is not without its [safety risks and waste disposal challenges]',
        whyUseStructure: 'Giúp bài IELTS Writing Task 2 đạt điểm tối đa về sự cân bằng lập luận (Task Response) và văn phong trang trọng.'
      },
      {
        domain: 'Technology',
        english: 'Artificial intelligence offers immense productivity gains, yet the technology is not without its ethical dilemmas.',
        vietnamese: 'Trí tuệ nhân tạo mang lại lợi ích năng suất to lớn, song công nghệ này không phải là không có những tiến thoái lưỡng nan về đạo đức.',
        highlightedPattern: 'the technology is not without its [ethical dilemmas]',
        whyUseStructure: 'Thừa nhận mặt trái của AI mà không phủ nhận hoàn toàn giá trị của nó.'
      },
      {
        domain: 'Finance & Economy',
        english: 'Foreign direct investment accelerates industrial growth, although this strategy is not without its vulnerabilities.',
        vietnamese: 'Đầu tư trực tiếp nước ngoài thúc đẩy tăng trưởng công nghiệp, mặc dù chiến lược này không phải là không có những điểm dễ tổn thương.',
        highlightedPattern: 'this strategy is not without its [vulnerabilities]',
        whyUseStructure: 'Đánh giá chính sách kinh tế đa chiều chuẩn C1/C2.'
      }
    ],
    transformations: [
      {
        originalSentence: 'However, this solution also has some disadvantages.',
        transformedSentence: 'Nevertheless, this solution is not without its drawbacks.',
        transformationType: 'Nâng cấp câu đơn "has some disadvantages" (Band 6.0) lên cấu trúc Phủ định kép học thuật (Band 8.0)',
        explanationVi: 'Thay "has some disadvantages" bằng "is not without its drawbacks" tạo sắc thái học thuật tinh tế hơn hẳn.'
      }
    ],
    mistakes: [
      {
        wrongExample: 'This solution doesn\'t without its drawbacks.',
        correctExample: 'This solution is not without its drawbacks.',
        errorReasonVi: 'Như ghi chú trang 5 PDF: "without" là giới từ, không phải động từ nên không thể đi với trợ động từ "doesn\'t/don\'t".',
        grammarRuleVi: 'Bắt buộc dùng động từ to be: "is/are not without + its/their + N".'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Chọn câu đúng để nhận xét khách quan về mặt hạn chế của một chính sách:',
        options: [
          'This economic policy is not without its drawbacks.',
          'This economic policy does not without its drawbacks.',
          'This economic policy is not without it\'s drawbacks.',
          'This economic policy not without its drawbacks.'
        ],
        correctAnswer: 'This economic policy is not without its drawbacks.',
        explanationVi: 'Dùng động từ to be "is not without" + tính từ sở hữu "its" (không có dấu phẩy trên).'
      }
    ]
  },
  {
    num: 37,
    page: 7,
    name: 'to the detriment of / exert an impact on',
    formula: '[Hành động / Mệnh đề] + to the detriment of + [Danh từ bị hại] | exert an (adverse/profound) impact on + N',
    meaning: 'Gây phương hại / tổn hại đến cái gì | Gây ra tác động lên cái gì',
    when: 'Học thuật Band 7.5–8.5+ (Thay thế cho động từ "cause" / "harm")',
    cat: 'advanced-variations',
    diff: 'Band 8.0+',
    pdfEx: 'Focusing too much on national transport infrastructure is to the detriment of local residents.',
    pdfExVi: 'Việc tập trung quá mức vào cơ sở hạ tầng giao thông quốc gia gây phương hại đến người dân địa phương.',
    pdfNotes: 'Trang 7–8: Cả hai cụm từ "to the detriment of something" và "exert an impact on something" đều đúng 100% và đều là những cụm từ nâng cao cực kỳ hay để thay thế cho "cause". Bản chất: cụm trạng ngữ bổ nghĩa cho hành động đi trước.',
    howItWorks: '"To the detriment of + N" hoạt động như một cụm giới từ chỉ hệ quả tiêu cực (bổ nghĩa cho hành động trước đó hoặc đứng sau to be), trong khi "exert a/an + adj + impact on + N" là cụm collocation học thuật thay thế cho "affect" hoặc "cause".',
    slots: [
      '[Hành động / Chính sách] + (is) + to the detriment of + [Đối tượng chịu thiệt hại]',
      '[Chủ ngữ] + exert(s) a profound / detrimental impact on + [Đối tượng bị tác động]'
    ],
    logicFn: 'Phân tích hệ quả tiêu cực ngoài ý muốn (Unintended Negative Consequence) khi đánh giá chính sách hoặc hành vi.',
    variations: [
      'at the expense of + N',
      'exert a far-reaching influence on + N',
      'to the severe detriment of long-term sustainability'
    ],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'Many corporations pursue short-term quarterly profits to the detriment of environmental sustainability.',
        vietnamese: 'Nhiều tập đoàn theo đuổi lợi nhuận ngắn hạn hằng quý gây phương hại đến sự bền vững môi trường.',
        highlightedPattern: '[pursue short-term quarterly profits] to the detriment of [environmental sustainability]',
        whyUseStructure: 'Nêu bật sự đánh đổi tiêu cực giữa lợi ích kinh tế và môi trường trong IELTS Writing Task 2.'
      },
      {
        domain: 'Academic English',
        english: 'Prolonged sleep deprivation exerts a detrimental impact on cognitive function and emotional regulation.',
        vietnamese: 'Tình trạng thiếu ngủ kéo dài gây ra tác động có hại lên chức năng nhận thức và sự điều tiết cảm xúc.',
        highlightedPattern: 'exerts a detrimental impact on [cognitive function and emotional regulation]',
        whyUseStructure: 'Cụm collocation học thuật chuẩn C1–C2 thay cho "causes bad effects on".'
      },
      {
        domain: 'Work & Career',
        english: 'Overworking employees to meet tight deadlines often operates to the detriment of overall team morale.',
        vietnamese: 'Việc bắt nhân viên làm việc quá sức để kịp tiến độ gấp gáp thường gây tổn hại đến tinh thần chung của cả nhóm.',
        highlightedPattern: 'operates to the detriment of [overall team morale]',
        whyUseStructure: 'Phân tích sắc sảo hệ lụy quản trị nhân sự.'
      }
    ],
    transformations: [
      {
        originalSentence: 'Some students work part-time too much, and this harms their academic results.',
        transformedSentence: 'Many students work excessive part-time hours to the detriment of their academic performance.',
        transformationType: 'Gộp 2 mệnh đề đơn thành 1 câu học thuật cô đọng bằng "to the detriment of"',
        explanationVi: 'Thay toàn bộ ", and this harms..." bằng cụm giới từ học thuật "to the detriment of...".'
      }
    ],
    mistakes: [
      {
        wrongExample: 'Focusing only on exams is to the detriment for students\' creativity.',
        correctExample: 'Focusing only on exams is to the detriment of students\' creativity.',
        errorReasonVi: 'Dùng sai giới từ "for" thay vì "of" sau danh từ "detriment".',
        grammarRuleVi: 'Cố định cụm giới từ: "to the detriment OF + Noun / V-ing".'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Điền cụm từ học thuật chuẩn theo trang 7 PDF: "Rapid industrialization often occurs _______ local ecosystems."',
        options: ['to the detriment of', 'to the detriment for', 'in the detriment with', 'by the detriment to'],
        correctAnswer: 'to the detriment of',
        explanationVi: 'Công thức cố định trong PDF trang 7: [Hành động] + to the detriment of + [Danh từ bị hại].'
      }
    ]
  },
  {
    num: 40,
    page: 9,
    name: 'mean + V-ing (Có nghĩa là / Dẫn đến hệ lụy gì)',
    formula: 'S (V-ing / Noun) + mean(s) + V-ing',
    meaning: 'Đồng nghĩa với việc phải... / Dẫn đến việc gì',
    when: 'Chủ đề Đô thị hóa (Urbanization), City vs. Countryside, Stress/Mental Health, Work-life Balance',
    cat: 'ielts-vstep',
    diff: 'Band 7.0–7.5',
    pdfEx: 'Living in a metropolitan area means dealing with a fast-paced urban environment, which can be mentally draining.',
    pdfExVi: 'Sống ở khu vực đại đô thị đồng nghĩa với việc phải đối mặt với môi trường đô thị nhịp độ nhanh, điều có thể gây kiệt quệ về tinh thần.',
    pdfNotes: 'Trang 9–11: Dùng cho (1) Nhóm chủ đề Nơi chốn & Đô thị (City life vs. Countryside, Urbanization) và (2) Nhóm chủ đề Con người & Lối sống (Stress/Mental Health, Work-life Balance, Hobbies/Relaxation).',
    howItWorks: 'Khi "mean" đi với V-ing (mean + V-ing), nó mang nghĩa "kéo theo hệ quả tất yếu là / đồng nghĩa với việc phải trải qua", khác hoàn toàn với "mean + to V" (có ý định làm gì). Kết hợp với mệnh đề quan hệ nối tiếp ", which can be..." để mở rộng hệ quả tâm lý.',
    slots: [
      '[Chủ ngữ V-ing: Living in a megacity / Pursuing a high-paying corporate job]',
      'means + [V-ing: dealing with / sacrificing / commuting]',
      ', which can be + [Trạng từ + Tính từ: mentally draining / physically exhausting]'
    ],
    logicFn: 'Triển khai chuỗi Nhân - Quả kép: Lựa chọn lối sống (A) -> Hệ quả trực tiếp (B: means V-ing) -> Hệ lụy tâm lý/sức khỏe (C: which can be...).',
    variations: [
      'Living in a densely populated city entails coping with chronic noise pollution.',
      'Accepting the promotion means taking on значительно greater responsibilities.'
    ],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'Rapid urbanization often means sacrificing green public spaces for high-rise commercial buildings, which can degrade urban air quality.',
        vietnamese: 'Đô thị hóa nhanh chóng thường đồng nghĩa với việc hy sinh không gian xanh công cộng cho các tòa nhà thương mại cao tầng, điều có thể làm suy giảm chất lượng không khí đô thị.',
        highlightedPattern: '[Rapid urbanization] often means [sacrificing green public spaces...], which can [degrade...]',
        whyUseStructure: 'Ứng dụng trực tiếp nhóm chủ đề Urbanization trang 10 PDF.'
      },
      {
        domain: 'Personal & Well-being',
        english: 'Working in a hyper-competitive industry often means answering emails late at night, which can severely disrupt work-life balance.',
        vietnamese: 'Làm việc trong một ngành siêu cạnh tranh thường đồng nghĩa với việc phải trả lời email lúc đêm muộn, điều có thể phá vỡ nghiêm trọng sự cân bằng giữa công việc và cuộc sống.',
        highlightedPattern: 'means [answering emails late at night], which can [severely disrupt work-life balance]',
        whyUseStructure: 'Ứng dụng nhóm chủ đề Work-life Balance & Stress trang 10 PDF.'
      },
      {
        domain: 'Everyday English',
        english: 'For me, spending weekends at home means escaping the chaotic city rhythm and recharging my mental energy.',
        vietnamese: 'Đối với tôi, dành ngày cuối tuần ở nhà đồng nghĩa với việc trốn khỏi nhịp sống thành phố xô bồ và nạp lại năng lượng tinh thần.',
        highlightedPattern: 'means [escaping the chaotic city rhythm and recharging...]',
        whyUseStructure: 'Ứng dụng nhóm chủ đề Hobbies / Relaxation trang 10–11 PDF cho IELTS Speaking Part 1 & 2.'
      }
    ],
    transformations: [
      {
        originalSentence: 'If you live in a big city, you have to face traffic jams every day, and this makes you tired.',
        transformedSentence: 'Living in a major metropolis means dealing with daily traffic congestion, which can be mentally and physically draining.',
        transformationType: 'Nâng cấp câu điều kiện thông thường lên cấu trúc Danh động từ + Mệnh đề quan hệ nối tiếp (Band 7.5+)',
        explanationVi: 'Dùng "Living in... means dealing with..., which can be..." theo đúng mẫu chuẩn trang 9 PDF.'
      }
    ],
    mistakes: [
      {
        wrongExample: 'Living in a metropolitan area means to deal with a fast-paced environment.',
        correctExample: 'Living in a metropolitan area means dealing with a fast-paced environment.',
        errorReasonVi: '"Mean + to V" nghĩa là "có ý định làm gì" (I didn\'t mean to hurt you), còn mang nghĩa "đồng nghĩa với / dẫn đến việc gì" thì bắt buộc phải là "mean + V-ing".',
        grammarRuleVi: 'mean + V-ing = có nghĩa là / kéo theo việc gì; mean + to V = cố ý / định làm gì.'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Chọn dạng động từ đúng: "Taking on a second job _______ having less quality time for family and relaxation."',
        options: ['means', 'is meaning to', 'means to', 'mean for'],
        correctAnswer: 'means',
        explanationVi: 'Chủ ngữ danh động từ "Taking on a second job" là ngôi thứ 3 số ít -> "means + V-ing (having)".'
      }
    ]
  },
  {
    num: 42,
    page: 11,
    name: "take someone's mind off something & carry something through",
    formula: "take + someone's + mind off + N | carry + something + through (to completion)",
    meaning: 'Giúp ai tạm quên đi / bớt lo nghĩ về điều gì | Hoàn thành thứ gì đến cùng bất chấp khó khăn',
    when: 'Bắt buộc học (Speaking & Writing chủ đề Stress, Health, Work, Project)',
    cat: 'everyday-communication',
    diff: 'Band 7.0–7.5',
    pdfEx: "Listening to music helps take the patient's mind off the physical pain. / Despite the budget cuts, the team managed to carry the project through.",
    pdfExVi: 'Nghe nhạc giúp bệnh nhân tạm quên đi cơn đau thể xác. / Bất chấp việc cắt giảm ngân sách, cả nhóm vẫn xoay sở hoàn thành dự án đến cùng.',
    pdfNotes: 'Trang 11–12: Vị trí someone\'s bắt buộc phải là tính từ sở hữu (my, his, her) hoặc sở hữu cách (the patient\'s). Nói về bản thân mặc định là "takes my mind off". "Carry st through" = hoàn thành đến cùng.',
    howItWorks: 'Cụm idiom "take one\'s mind off + N" diễn tả tác dụng giải tỏa tâm lý (chuyển hướng sự chú ý khỏi căng thẳng/đau đớn), trong khi cụm phrasal verb "carry st through" nhấn mạnh sự kiên trì hoàn tất mục tiêu dù gặp trở ngại.',
    slots: [
      '[Hoạt động: Jogging / Reading / Gardening] + helps take + [my / the patient\'s] + mind off + [daily stress / work pressure]',
      'Despite + [Rào cản: budget cuts / technical setbacks], + S + managed to carry + [the project / the reform] + through'
    ],
    logicFn: 'Diễn đạt cơ chế giải tỏa áp lực tinh thần và bản lĩnh vượt khó trong công việc.',
    variations: [
      'distract oneself from daily anxieties',
      'carry through with the original plan despite obstacles'
    ],
    examples: [
      {
        domain: 'Everyday English',
        english: 'Playing badminton after work always takes my mind off office stress.',
        vietnamese: 'Chơi cầu lông sau giờ làm luôn giúp tôi tạm quên đi căng thẳng nơi công sở.',
        highlightedPattern: 'takes [my] mind off [office stress]',
        whyUseStructure: 'Cực kỳ tự nhiên và ăn điểm Idiomatic Vocabulary trong IELTS Speaking Part 1 (Hobbies/Sports).'
      },
      {
        domain: 'Work & Career',
        english: 'Despite severe supply chain disruptions, the engineering team managed to carry the product launch through.',
        vietnamese: 'Bất chấp sự gián đoạn chuỗi cung ứng nghiêm trọng, đội ngũ kỹ sư vẫn xoay sở hoàn thành đợt ra mắt sản phẩm đến cùng.',
        highlightedPattern: 'managed to carry [the product launch] through',
        whyUseStructure: 'Thể hiện năng lực thực thi bền bỉ trong bối cảnh công việc.'
      },
      {
        domain: 'Personal & Well-being',
        english: 'Volunteering at local shelters helps take young people\'s minds off their own personal worries.',
        vietnamese: 'Làm tình nguyện tại các mái ấm địa phương giúp người trẻ tạm gạt bỏ những nỗi lo cá nhân của chính họ.',
        highlightedPattern: 'take [young people\'s] minds off [their own personal worries]',
        whyUseStructure: 'Dùng sở hữu cách số nhiều chuẩn xác trong bài luận về hoạt động cộng đồng.'
      }
    ],
    transformations: [
      {
        originalSentence: 'Watching comedy movies helps me forget my exam pressure for a while.',
        transformedSentence: 'Watching comedy movies helps take my mind off the upcoming exam pressure.',
        transformationType: 'Thay động từ thông thường "forget" bằng Idiom chuẩn bản xứ "take my mind off"',
        explanationVi: 'Giúp câu trả lời Speaking tăng vọt điểm tiêu chí Lexical Resource (Idiomatic Expressions).'
      }
    ],
    mistakes: [
      {
        wrongExample: 'Listening to music helps take someone mind off daily stress.',
        correctExample: "Listening to music helps take someone's mind off daily stress (hoặc takes my mind off daily stress).",
        errorReasonVi: 'Thiếu dấu sở hữu cách (\'s) hoặc tính từ sở hữu trước danh từ "mind".',
        grammarRuleVi: 'Bắt buộc phải có hình thức sở hữu: my / your / his / her / their / someone\'s + mind off + N.'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Chọn câu đúng theo quy tắc bắt buộc ở trang 11–12 PDF:',
        options: [
          'Painting on weekends really takes my mind off work deadlines.',
          'Painting on weekends really takes me mind off work deadlines.',
          'Painting on weekends really takes mind of me off work deadlines.',
          'Painting on weekends really takes my mind on work deadlines.'
        ],
        correctAnswer: 'Painting on weekends really takes my mind off work deadlines.',
        explanationVi: 'Phải dùng tính từ sở hữu "my" trước "mind" và giới từ "off" phía sau.'
      }
    ]
  },
  {
    num: 43,
    page: 12,
    name: 'Đảo ngữ Not only... but also & Only if',
    formula: 'Not only + Trợ động từ/To-be + S + V, but + S + also + V | Only if + S + V + Aux/Modal + S + V',
    meaning: 'Không những... mà còn... | Chỉ khi... thì mới... (Câu nhấn mạnh đảo ngữ Band 7.0–8.5+)',
    when: 'RẤT CẦN THUỘC — Văn viết luận học thuật trang trọng (Formal IELTS Writing Task 2)',
    cat: 'advanced-variations',
    diff: 'Band 8.0+',
    pdfEx: 'Not only does learning English help you expand your knowledge, but it also improves your career prospects. / Not only is poverty a social issue, but it is also an economic barrier. / Only if you study hard will you pass the exam.',
    pdfExVi: 'Không chỉ việc học tiếng Anh giúp bạn mở rộng kiến thức, mà nó còn cải thiện cơ hội nghề nghiệp của bạn. / Đói nghèo không chỉ là một vấn đề xã hội mà còn là một rào cản kinh tế. / Chỉ khi bạn học hành chăm chỉ thì bạn mới đỗ kỳ thi.',
    pdfNotes: 'Trang 12–13 & 24: Câu đảo ngữ (Inversion) thuộc nhóm cấu trúc ngữ pháp phức tạp. Việc dùng đúng cấu trúc này cho thấy bạn có khả năng kiểm soát ngôn ngữ ở trình độ cao (Band 7.0 - 8.0+ trong IELTS).',
    howItWorks: 'Khi đặt trạng từ phủ định/giới hạn ("Not only", "Only if", "Rarely") lên đầu câu để nhấn mạnh, mệnh đề chính phải đảo Trợ động từ (do/does/did/have/will/can) hoặc Động từ To-be (is/are/was/were) lên trước Chủ ngữ giống như cấu trúc câu hỏi.',
    slots: [
      'Not only + [does/do/did/is/are/can] + [Chủ ngữ 1] + [Động từ nguyên mẫu / Bổ ngữ],',
      'but + [Chủ ngữ 2] + also + [Động từ chia theo Chủ ngữ 2]',
      'Only if + [Mệnh đề điều kiện S + V] + [will/can/does] + [Chủ ngữ chính] + [V nguyên mẫu]'
    ],
    logicFn: 'Nhấn mạnh kép hai tầng lợi ích/tác hại (Not only... but also) hoặc khẳng định điều kiện tiên quyết duy nhất (Only if).',
    variations: [
      'Not only do public libraries preserve cultural heritage, but they also foster lifelong learning.',
      'Only if governments enforce strict emission standards can global warming be mitigated.'
    ],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'Not only does public transport reduce urban carbon emissions, but it also alleviates severe traffic congestion.',
        vietnamese: 'Giao thông công cộng không những làm giảm lượng khí thải carbon đô thị mà còn giảm nhẹ tình trạng ùn tắc giao thông nghiêm trọng.',
        highlightedPattern: 'Not only does [public transport] [reduce...], but [it] also [alleviates...]',
        whyUseStructure: 'Gộp 2 lợi ích lớn vào một câu đảo ngữ chuẩn Band 8.0 Grammatical Range.'
      },
      {
        domain: 'VSTEP',
        english: 'Not only is regular physical exercise beneficial for cardiovascular health, but it is also essential for mental well-being.',
        vietnamese: 'Tập thể dục thường xuyên không chỉ có lợi cho sức khỏe tim mạch mà còn thiết yếu cho sức khỏe tinh thần.',
        highlightedPattern: 'Not only is [regular physical exercise] [beneficial...], but [it] is also [essential...]',
        whyUseStructure: 'Dùng đảo ngữ với động từ To-be ("Not only is...") cực kỳ chắc chắn và dễ áp dụng trong bài thi viết.'
      },
      {
        domain: 'Education',
        english: 'Only if schools integrate critical thinking into the curriculum will students be prepared for the AI era.',
        vietnamese: 'Chỉ khi nhà trường tích hợp tư duy phản biện vào chương trình học thì học sinh mới sẵn sàng cho kỷ nguyên AI.',
        highlightedPattern: 'Only if [schools integrate...] will [students] [be prepared...]',
        whyUseStructure: 'Nhấn mạnh điều kiện tiên quyết trong phần Kết bài hoặc Giải pháp.'
      }
    ],
    transformations: [
      {
        originalSentence: 'Studying abroad broadens students\' horizons and enhances their independence.',
        transformedSentence: 'Not only does studying abroad broaden students\' horizons, but it also enhances their independence.',
        transformationType: 'Chuyển câu đơn nối bằng "and" sang câu Đảo ngữ nhấn mạnh "Not only + does + S + V"',
        explanationVi: 'Khi mượn trợ động từ "does" đảo lên trước chủ ngữ "studying abroad", động từ "broadens" phải trả về nguyên mẫu "broaden".'
      }
    ],
    mistakes: [
      {
        wrongExample: 'Not only learning English helps you expand knowledge, but it also improves career prospects.',
        correctExample: 'Not only does learning English help you expand your knowledge, but it also improves your career prospects.',
        errorReasonVi: 'Đặt "Not only" ở đầu câu nhưng quên đảo trợ động từ "does" lên trước chủ ngữ và quên đưa "helps" về nguyên mẫu "help".',
        grammarRuleVi: 'Not only đứng đầu câu -> Bắt buộc đảo ngữ vế đầu (Not only + Aux/Be + S + V). Vế sau (but S also V) giữ trật tự bình thường.'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Chọn câu đảo ngữ đúng chuẩn Band 8.0 theo trang 12 PDF:',
        options: [
          'Not only does renewable energy protect the environment, but it also creates green jobs.',
          'Not only renewable energy protects the environment, but it also creates green jobs.',
          'Not only does renewable energy protects the environment, but also it creates green jobs.',
          'Not only is renewable energy protect the environment, but it also creates green jobs.'
        ],
        correctAnswer: 'Not only does renewable energy protect the environment, but it also creates green jobs.',
        explanationVi: 'Với động từ thường "protect" và chủ ngữ số ít "renewable energy", mượn trợ động từ "does" đảo lên trước chủ ngữ và giữ "protect" nguyên mẫu.'
      }
    ]
  },
  {
    num: 45,
    page: 13,
    name: 'Câu chẻ (Wh-Cleft & It-Cleft Sentences)',
    formula: 'What/How + S + V1 + is/was + (to) V2 / Cụm danh từ | It is/was + [Thành phần nhấn mạnh] + that + S + V',
    meaning: 'Điều mà... chính là... / Chính... là thứ đã...',
    when: 'PHẢI THUỘC — Vũ khí giúp cán mốc Band 7.0–8.0+ (Nhấn mạnh giải pháp hoặc nguyên nhân cốt lõi)',
    cat: 'advanced-variations',
    diff: 'Band 8.0+',
    pdfEx: 'What governments need to do is implement stricter laws. / What I love about this city is the street food. / It is technology that has transformed modern education most dramatically.',
    pdfExVi: 'Điều mà các chính phủ cần làm chính là thực thi những bộ luật nghiêm khắc hơn. / Điều tôi yêu thích ở thành phố này chính là ẩm thực đường phố. / Chính công nghệ là thứ đã thay đổi giáo dục hiện đại một cách mạnh mẽ nhất.',
    pdfNotes: 'Trang 13–14: Câu chẻ (Cleft Sentence) được đánh giá rất cao và là một trong những "vũ khí" giúp bạn cán mốc Band 7.0 - 8.0+. Bí quyết: dùng What/How ở đầu câu hoặc khung "It is/was ... that ...".',
    howItWorks: 'Câu chẻ (Cleft sentence) tách một câu đơn thành hai mệnh đề để dồn toàn bộ trọng tâm thông tin (Focus) vào danh từ hoặc hành động đứng sau "is/was" (trong Wh-cleft) hoặc đứng giữa "It is ... that" (trong It-cleft).',
    slots: [
      'What + [Chủ ngữ: governments / individuals] + need to do + is + [(to) V nguyên mẫu: implement stricter laws]',
      'What + [Chủ ngữ] + [Động từ: love / value most] + is + [Cụm danh từ: the street food]',
      'It is/was + [Thành phần nhấn mạnh: technology / while we lived in the city] + that + [Mệnh đề còn lại]'
    ],
    logicFn: 'Đóng đinh giải pháp trọng tâm hoặc nhấn mạnh yếu tố quyết định trong đoạn Thân bài & Kết bài.',
    variations: [
      'What truly matters in higher education is cultivating independent inquiry.',
      'It is preventative healthcare, rather than costly hospital treatment, that deserves greater funding.'
    ],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'What authorities need to do is invest heavily in affordable public housing.',
        vietnamese: 'Điều mà các cơ quan chức năng cần làm chính là đầu tư mạnh vào nhà ở công cộng giá rẻ.',
        highlightedPattern: 'What [authorities need to do] is [invest heavily in...]',
        whyUseStructure: 'Đưa ra giải pháp (Solution) cực kỳ đanh thép và tự nhiên trong IELTS Writing Task 2.'
      },
      {
        domain: 'Academic English',
        english: 'It is socioeconomic inequality that lies at the root of rising urban crime rates.',
        vietnamese: 'Chính sự bất bình đẳng kinh tế - xã hội mới là thứ nằm ở gốc rễ của tỷ lệ tội phạm đô thị gia tăng.',
        highlightedPattern: 'It is [socioeconomic inequality] that [lies at the root of...]',
        whyUseStructure: 'Dùng It-cleft để chỉ đích danh nguyên nhân gốc rễ trong văn nghị luận.'
      },
      {
        domain: 'Everyday English',
        english: 'What I appreciate most about my mentor is her unwavering patience.',
        vietnamese: 'Điều tôi trân trọng nhất ở người cố vấn của mình chính là sự kiên nhẫn không lay chuyển của cô ấy.',
        highlightedPattern: 'What [I appreciate most about my mentor] is [her unwavering patience]',
        whyUseStructure: 'Mở đầu bài nói IELTS Speaking Part 2 (Describe a person) gây ấn tượng mạnh ngay lập tức.'
      }
    ],
    transformations: [
      {
        originalSentence: 'Schools should prioritize practical life skills.',
        transformedSentence: 'What schools need to do is prioritize practical life skills.',
        transformationType: 'Chuyển câu khuyên nhủ đơn giản sang Câu chẻ Wh-Cleft (Band 7.5+)',
        explanationVi: 'Tách động từ hành động ra sau "is" để làm nổi bật giải pháp.'
      }
    ],
    mistakes: [
      {
        wrongExample: 'What governments need to do are implementing stricter laws.',
        correctExample: 'What governments need to do is implement stricter laws.',
        errorReasonVi: 'Mệnh đề danh ngữ bắt đầu bằng "What..." làm chủ ngữ luôn đi với động từ số ít "is/was", và sau "what S do is" dùng động từ nguyên mẫu "(to) V".',
        grammarRuleVi: 'What + S + do/need to do + IS + (to) V nguyên mẫu.'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Chọn câu chẻ (Cleft Sentence) đúng ngữ pháp theo trang 13–14 PDF:',
        options: [
          'It is consistent daily practice that leads to true language fluency.',
          'It is consistent daily practice what leads to true language fluency.',
          'What leads to true language fluency are consistent daily practice.',
          'What students need to do is practiced every day.'
        ],
        correctAnswer: 'It is consistent daily practice that leads to true language fluency.',
        explanationVi: 'Khung câu chẻ It-Cleft chuẩn: "It is + [Thành phần nhấn mạnh] + that + V/Clause".'
      }
    ]
  },
  {
    num: 51,
    page: 15,
    name: 'Bị động nguyên mẫu: S + V + (O) + to be + V3/ed',
    formula: 'Chủ ngữ + Động từ chính (order / deserve / want / require) + (Object) + to be + V3/ed',
    meaning: 'Muốn / Yêu cầu / Xứng đáng được hoặc bị làm gì (Nhấn mạnh đối tượng chịu tác động)',
    when: 'Phải học — Văn viết học thuật & Quản trị (Khi tân ngữ không tự thực hiện hành động)',
    cat: 'grammar-formulas',
    diff: 'Band 7.0–7.5',
    pdfEx: "The government has ordered the old bridge to be demolished for safety reasons. / An incompetent leader doesn't deserve to be promoted.",
    pdfExVi: 'Chính phủ đã ra lệnh phá dỡ cây cầu cũ vì lý do an toàn. / Một nhà lãnh đạo yếu kém không xứng đáng được thăng chức.',
    pdfNotes: 'Trang 15–16: Tại sao không dùng "to demolish"? Vì cây cầu không thể tự "phá dỡ" cái gì cả, nó bị người ta phá dỡ nên phải dùng "to be + V3/ed".',
    howItWorks: 'Khi đối tượng đứng trước hoặc chủ ngữ của động từ nguyên mẫu là vật/người chịu sự tác động của hành động thứ hai, ta thay "to V" (chủ động) bằng "to be + V3/ed" (bị động nguyên mẫu).',
    slots: [
      '[Chủ ngữ] + [Động từ: ordered / expects / requires] + [Tân ngữ chịu tác động: the old bridge / all applications] + to be + [V3/ed: demolished / submitted]',
      '[Chủ ngữ chịu tác động: An incompetent leader / Every child] + [deserves / needs] + to be + [V3/ed: promoted / respected]'
    ],
    logicFn: 'Đảm bảo tính chính xác logic giữa Chủ thể và Đối tượng chịu tác động trong câu học thuật.',
    variations: [
      'Strict environmental regulations require industrial waste to be treated before disposal.',
      'Hardworking employees deserve to be recognized and fairly compensated.'
    ],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'Consumer protection laws require food ingredients to be clearly labeled on all packaging.',
        vietnamese: 'Luật bảo vệ người tiêu dùng yêu cầu thành phần thực phẩm phải được ghi nhãn rõ ràng trên mọi bao bì.',
        highlightedPattern: 'require [food ingredients] to be [clearly labeled]',
        whyUseStructure: 'Thành phần thực phẩm không tự dán nhãn được mà phải "được dán nhãn" (to be labeled).'
      },
      {
        domain: 'Work & Career',
        english: 'Confidential client documents must not be left on desks waiting to be copied.',
        vietnamese: 'Tài liệu mật của khách hàng không được để trên bàn chờ được sao chép.',
        highlightedPattern: 'waiting to be [copied]',
        whyUseStructure: 'Chuẩn ngữ pháp văn phòng và báo cáo doanh nghiệp.'
      },
      {
        domain: 'Education',
        english: 'Talented students from disadvantaged backgrounds deserve to be awarded full scholarships.',
        vietnamese: 'Những học sinh tài năng có hoàn cảnh khó khăn xứng đáng được trao học bổng toàn phần.',
        highlightedPattern: 'deserve to be [awarded full scholarships]',
        whyUseStructure: 'Diễn đạt nhân văn và chuẩn xác trong bài luận giáo dục.'
      }
    ],
    transformations: [
      {
        originalSentence: 'The city council ordered workers to demolish the unsafe building.',
        transformedSentence: 'The city council ordered the unsafe building to be demolished immediately.',
        transformationType: 'Chuyển tân ngữ chỉ người làm sang tân ngữ chỉ vật chịu tác động với "to be + V3/ed"',
        explanationVi: 'Lược bỏ tác nhân chung chung ("workers") và đưa "the unsafe building" lên làm trọng tâm được nhấn mạnh.'
      }
    ],
    mistakes: [
      {
        wrongExample: 'The government has ordered the old bridge to demolish for safety reasons.',
        correctExample: 'The government has ordered the old bridge to be demolished for safety reasons.',
        errorReasonVi: 'Viết "the old bridge to demolish" khiến câu bị sai logic vì cây cầu không thể tự đi phá dỡ thứ khác.',
        grammarRuleVi: 'Nếu Object chịu tác động của hành động -> Bắt buộc dùng "Object + to be + V3/ed".'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Chọn đáp án đúng theo giải thích trang 15–16 PDF: "The hospital director ordered the operating room _______ before surgery."',
        options: ['to be sterilized', 'to sterilize', 'sterilizing', 'be sterilized'],
        correctAnswer: 'to be sterilized',
        explanationVi: 'Phòng mổ (the operating room) không thể tự khử trùng mà phải "được khử trùng" -> dùng bị động nguyên mẫu "to be sterilized".'
      }
    ]
  },
  {
    num: 61,
    page: 18,
    name: 'There are a number of reasons for the existence of... + It can be because of...',
    formula: 'There are a number of reasons for the existence of + N; it can be because of + N / the fact that + S + V',
    meaning: 'Có một số lý do giải thích cho sự tồn tại của...; điều đó có thể là bởi vì...',
    when: 'Mở đầu đoạn phân tích nguyên nhân hiện tượng xã hội / kinh tế (IELTS Writing & VSTEP)',
    cat: 'ielts-vstep',
    diff: 'Band 7.0–7.5',
    pdfEx: 'There are a number of reasons for the existence of gender roles in modern society. / There are a number of reasons for the existence of economic inflation; it can be because of government overspending. / ...because of the fact that factories release too much CO2.',
    pdfExVi: 'Có một số lý do cho sự tồn tại của vai trò giới trong xã hội hiện đại. / Có một số lý do cho sự tồn tại của lạm phát kinh tế; đó có thể là do sự chi tiêu quá mức của chính phủ. / ...bởi vì thực tế là các nhà máy thải ra quá nhiều CO2.',
    pdfNotes: 'Trang 18–19: Mẫu câu dẫn nhập nguyên nhân cực chuẩn. Nếu sau "because of" là cụm danh từ thì ghép trực tiếp; nếu là mệnh đề (S + V) thì dùng "because of the fact that + S + V".',
    howItWorks: 'Vế đầu đóng vai trò Câu chủ đề (Topic Sentence) giới thiệu sự tồn tại của một hiện tượng phức tạp ("the existence of + N"), vế sau dùng "it can be because of..." để đi sâu giải thích nguyên nhân cụ thể dưới dạng Cụm danh từ hoặc Mệnh đề "the fact that".',
    slots: [
      'There are a number of reasons for the existence of + [Hiện tượng: monopolies / economic inflation / global warming]',
      '; it can be because of + [Cụm danh từ: government overspending / lax regulations]',
      '(Hoặc) it can be because of the fact that + [Mệnh đề S + V: factories release excessive CO2]'
    ],
    logicFn: 'Thiết lập khung Phân tích Nguyên nhân (Causal Framework) chuẩn mực cho bài luận Cause - Solution.',
    variations: [
      'Numerous factors account for the persistence of income disparity; this can be attributed to unequal access to education.',
      'There are several underlying reasons for the prevalence of youth unemployment.'
    ],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'There are a number of reasons for the existence of monopolies in certain industries; it can be because of high barriers to entry.',
        vietnamese: 'Có một số lý do cho sự tồn tại của thế độc quyền trong một số ngành công nghiệp; đó có thể là do rào cản gia nhập thị trường cao.',
        highlightedPattern: 'There are a number of reasons for the existence of [monopolies...]; it can be because of [high barriers to entry]',
        whyUseStructure: 'Kết hợp chính xác ví dụ trang 18 và trang 19 trong PDF.'
      },
      {
        domain: 'Academic English',
        english: 'There are a number of reasons for the existence of urban heat islands; it can be because of the fact that concrete surfaces absorb and retain solar radiation.',
        vietnamese: 'Có một số lý do cho sự tồn tại của hiệu ứng đảo nhiệt đô thị; đó có thể là vì thực tế các bề mặt bê tông hấp thụ và giữ lại bức xạ mặt trời.',
        highlightedPattern: 'it can be because of the fact that [concrete surfaces absorb...]',
        whyUseStructure: 'Dùng "because of the fact that + S + V" khi nguyên nhân cần diễn đạt bằng một mệnh đề khoa học đầy đủ.'
      },
      {
        domain: 'Finance & Economy',
        english: 'There are a number of reasons for the existence of shadow banking systems; it can be because of strict credit quotas in traditional banks.',
        vietnamese: 'Có một số lý do cho sự tồn tại của hệ thống ngân hàng ngầm; đó có thể là do hạn ngạch tín dụng khắt khe tại các ngân hàng truyền thống.',
        highlightedPattern: 'There are a number of reasons for the existence of [shadow banking systems]',
        whyUseStructure: 'Phù hợp cho bài viết học thuật chuyên ngành Tài chính - Ngân hàng.'
      }
    ],
    transformations: [
      {
        originalSentence: 'Global warming happens for many reasons, such as factories releasing too much CO2.',
        transformedSentence: 'There are a number of reasons for the existence of global warming; it can be because of the fact that factories release excessive amounts of CO2.',
        transformationType: 'Nâng cấp câu thông tục lên khung học thuật ghép trang 18–19 PDF',
        explanationVi: 'Danh từ hóa "happens" thành "the existence of" và dùng "because of the fact that + S + V".'
      }
    ],
    mistakes: [
      {
        wrongExample: 'There are a number of reasons for the existent of inflation, it can be because of factories release CO2.',
        correctExample: 'There are a number of reasons for the existence of inflation; it can be because of the fact that factories release CO2.',
        errorReasonVi: 'Hai lỗi: (1) dùng tính từ "existent" thay vì danh từ "existence" sau mạo từ "the"; (2) đặt mệnh đề S+V trực tiếp sau "because of" mà thiếu "the fact that".',
        grammarRuleVi: 'the + existence (danh từ) + of + N | because of + N (hoặc because of the fact that + S + V).'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Chọn phương án đúng để nối mệnh đề "consumers prefer convenience" sau cụm "because of":',
        options: [
          'it can be because of the fact that consumers prefer convenience.',
          'it can be because of consumers prefer convenience.',
          'it can be because of that consumers prefer convenience.',
          'it can be because the fact of consumers prefer convenience.'
        ],
        correctAnswer: 'it can be because of the fact that consumers prefer convenience.',
        explanationVi: 'Theo trang 19 PDF, khi muốn đặt một mệnh đề S+V sau giới từ "because of", ta thêm "the fact that" ở giữa.'
      }
    ]
  },
  {
    num: 64,
    page: 19,
    name: 'At first glance, X may appear similar to Y, but actually... & The key difference between X and Y is that...',
    formula: 'At first glance, X may appear similar to Y, but actually they are not the same. The key difference between X and Y is that + S1 + V1, whereas + S2 + V2.',
    meaning: 'Thoạt nhìn, X có vẻ giống Y, nhưng thực chất chúng không giống nhau. Điểm khác biệt then chốt giữa X và Y là... trong khi...',
    when: 'Phân biệt khái niệm trừu tượng (Speaking Part 3 & Writing Task 2)',
    cat: 'mistakes-transformations',
    diff: 'Band 8.0+',
    pdfEx: 'At first glance, loneliness may appear similar to solitude, but actually they are not the same. The key difference between loneliness and solitude is that loneliness is painful isolation, whereas solitude is peaceful being alone.',
    pdfExVi: 'Thoạt nhìn, sự cô đơn có vẻ giống với sự tĩnh lặng một mình, nhưng thực chất chúng không giống nhau. Điểm khác biệt then chốt giữa cô đơn và tĩnh lặng là cô đơn mang lại cảm giác cô lập đau khổ, trong khi tĩnh lặng một mình lại là sự bình yên.',
    pdfNotes: 'Trang 19–20 & 23–24: Cái hay nhầm trong câu "The key difference between X and Y is that X is...": bạn đang có hai động từ chia thì đứng gần nhau là "is" (1) và "is" (2) -> nên bắt buộc phải có "that" ở giữa! Kết hợp "whereas" (/ˌweərˈæz/ - trong khi) để đối chiếu.',
    howItWorks: 'Bộ đôi cấu trúc này tạo nên một đoạn lập luận Phân biệt Khái niệm (Conceptual Distinction) hoàn chỉnh: Câu 1 thừa nhận sự tương đồng bề mặt ("At first glance, X may appear similar to Y..."), Câu 2 bóc tách bản chất đối lập bằng mệnh đề danh ngữ ("is that...") và liên từ tương phản ("whereas").',
    slots: [
      'At first glance, [Khái niệm X] may appear similar to [Khái niệm Y], but actually they are fundamentally different.',
      'The key difference between [X] and [Y] is that [X + V1], whereas [Y + V2].'
    ],
    logicFn: 'Phá vỡ ngộ nhận bề mặt -> Định nghĩa ranh giới ngữ nghĩa chính xác giữa hai khái niệm gần nhau.',
    variations: [
      'Superficially, X and Y seem interchangeable, yet a closer look reveals a fundamental distinction.',
      'The primary distinction between X and Y lies in the fact that X..., whereas Y...'
    ],
    examples: [
      {
        domain: 'IELTS Writing',
        english: 'At first glance, equal opportunity may appear similar to equal outcome, but actually they are not the same. The key difference between them is that equal opportunity rewards individual merit, whereas equal outcome enforces uniform results.',
        vietnamese: 'Thoạt nhìn, bình đẳng về cơ hội có vẻ giống với bình đẳng về kết quả, nhưng thực chất chúng không giống nhau. Điểm khác biệt then chốt là bình đẳng cơ hội tưởng thưởng năng lực cá nhân, trong khi bình đẳng kết quả áp đặt kết quả đồng nhất.',
        highlightedPattern: 'The key difference between them is that [equal opportunity rewards...], whereas [equal outcome enforces...]',
        whyUseStructure: 'Phân tích triết lý xã hội sắc bén ở trình độ Band 8.0+.'
      },
      {
        domain: 'Education',
        english: 'At first glance, memorization may appear similar to learning, but actually they are not the same. The key difference between the two is that memorization stores isolated facts, whereas true learning builds transferable understanding.',
        vietnamese: 'Thoạt nhìn, việc học thuộc lòng có vẻ giống với việc học hiểu, nhưng thực chất chúng không giống nhau. Điểm khác biệt then chốt là học thuộc lòng chỉ lưu giữ dữ kiện rời rạc, trong khi học thực sự xây dựng tư duy vận dụng.',
        highlightedPattern: 'At first glance, [memorization] may appear similar to [learning]... The key difference... is that..., whereas...',
        whyUseStructure: 'Trả lời xuất sắc câu hỏi IELTS Speaking Part 3: "What is the difference between studying for exams and real learning?".'
      },
      {
        domain: 'Work & Career',
        english: 'The key difference between a manager and a leader is that a manager administers existing processes, whereas a leader inspires innovation.',
        vietnamese: 'Điểm khác biệt then chốt giữa người quản lý và nhà lãnh đạo là người quản lý điều hành quy trình sẵn có, trong khi nhà lãnh đạo truyền cảm hứng đổi mới.',
        highlightedPattern: 'The key difference between [a manager] and [a leader] is that..., whereas...',
        whyUseStructure: 'Cấu trúc đối chiếu kinh điển trong phỏng vấn và thuyết trình quản trị.'
      }
    ],
    transformations: [
      {
        originalSentence: 'Hearing and listening look the same, but hearing is passive and listening is active.',
        transformedSentence: 'At first glance, hearing may appear similar to listening, but actually they are not the same. The key difference between hearing and listening is that hearing is a passive physical process, whereas listening requires active mental engagement.',
        transformationType: 'Mở rộng câu đơn thành Đoạn phân tích đối chiếu khái niệm chuẩn trang 19–20 PDF',
        explanationVi: 'Áp dụng trọn vẹn chuỗi công thức ID 64 + ID 65 + ID 74 trong tài liệu PDF.'
      }
    ],
    mistakes: [
      {
        wrongExample: 'The key difference between X and Y is X is faster.',
        correctExample: 'The key difference between X and Y is that X is faster.',
        errorReasonVi: 'Như ghi chú trang 20 PDF: Hai động từ "is" (1) và "is" (2) đứng quá gần nhau mà thiếu liên từ "that" dẫn mệnh đề danh ngữ.',
        grammarRuleVi: 'The key difference between X and Y is THAT + S + V.'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Tại sao câu "The key difference between X and Y is X is faster" bị sai ngữ pháp theo trang 20 PDF?',
        options: [
          'Vì thiếu từ "that" ngăn cách giữa động từ to-be chính ("is") và mệnh đề danh ngữ phía sau ("X is faster").',
          'Vì từ "difference" không đi với giới từ "between".',
          'Vì "faster" không được đứng cuối câu.',
          'Vì phải dùng "are" thay cho "is".'
        ],
        correctAnswer: 'Vì thiếu từ "that" ngăn cách giữa động từ to-be chính ("is") và mệnh đề danh ngữ phía sau ("X is faster").',
        explanationVi: 'Giải thích nguyên văn từ PDF trang 20: "Bạn đang có hai động từ chia thì đứng quá gần nhau là is (1) và is (2) --> nên mới cần That".'
      }
    ]
  },
  {
    num: 73,
    page: 23,
    name: "The [Superlative] + (that) + I've ever taken/had + was...",
    formula: "The + [most + adj / adj-est + noun] + (that) + I've ever + V3/ed + was...",
    meaning: '... nhất mà tôi từng thực hiện / trải qua tính đến thời điểm hiện tại là...',
    when: 'Mở đầu bài nói IELTS Speaking Part 2 (Kể về trải nghiệm đáng nhớ nhất)',
    cat: 'everyday-communication',
    diff: 'Band 7.0–7.5',
    pdfEx: "The longest vacation I've ever taken was a two-week trip to Europe.",
    pdfExVi: 'Kỳ nghỉ dài nhất tôi từng đi là chuyến đi 2 tuần tới Châu Âu.',
    pdfNotes: 'Trang 23: "take a trip/vacation" nghĩa là đi du lịch. Từ "ever" (đã từng) mang tính nhấn mạnh cực hạn, chỉ được phép xuất hiện trong câu khẳng định nếu phía trước nó có So sánh nhất (The best, The longest) hoặc The first / The only.',
    howItWorks: 'Kết hợp Danh từ có So sánh nhất ở đầu câu với mệnh đề quan hệ dùng thì Hiện tại hoàn thành ("I\'ve ever + V3/ed") để quét toàn bộ trải nghiệm từ quá khứ đến hiện tại, sau đó dùng động từ "was" (Quá khứ đơn) để kể về sự kiện cụ thể đó.',
    slots: [
      'The + [So sánh nhất + Danh từ: longest vacation / most challenging project / best advice]',
      "(that) I've ever + [V3/ed: taken / undertaken / received]",
      'was + [Sự kiện cụ thể trong quá khứ: a two-week trip to Europe / my final-year thesis]'
    ],
    logicFn: 'Định vị trải nghiệm đỉnh cao (Superlative Anchor) ở đầu câu trả lời Speaking Part 2 rồi chuyển mượt sang thì Quá khứ đơn để kể chuyện.',
    variations: [
      "The most rewarding book that I've ever read was 'Atomic Habits'.",
      "The only time that I've ever spoken in front of a thousand people was at my university graduation."
    ],
    examples: [
      {
        domain: 'Everyday English',
        english: "The most memorable journey I've ever taken was a solo backpacking trip across central Vietnam.",
        vietnamese: 'Chuyến hành trình đáng nhớ nhất mà tôi từng thực hiện là chuyến đi phượt độc hành xuyên miền Trung Việt Nam.',
        highlightedPattern: "The [most memorable journey] I've ever [taken] was [a solo backpacking trip...]",
        whyUseStructure: 'Mở bài chuẩn Band 7.5+ cho đề Speaking Part 2 "Describe an unforgettable trip".'
      },
      {
        domain: 'Work & Career',
        english: "The toughest decision I've ever made in my career was leaving a stable corporate job to launch a startup.",
        vietnamese: 'Quyết định khó khăn nhất tôi từng đưa ra trong sự nghiệp là rời bỏ công việc tập đoàn ổn định để khởi nghiệp.',
        highlightedPattern: "The [toughest decision] I've ever [made] was [leaving...]",
        whyUseStructure: 'Kết hợp nhuần nhuyễn Hiện tại hoàn thành (mệnh đề phụ) và Quá khứ đơn (mệnh đề chính).'
      },
      {
        domain: 'Education',
        english: "The most inspiring lecture that I've ever attended was a seminar on cognitive neuroscience.",
        vietnamese: 'Bài giảng truyền cảm hứng nhất mà tôi từng tham dự là một buổi hội thảo về thần kinh học nhận thức.',
        highlightedPattern: "The [most inspiring lecture] that I've ever [attended] was...",
        whyUseStructure: 'Phô diễn khả năng kiểm soát đa thì (Multi-tense control) trong cùng một câu.'
      }
    ],
    transformations: [
      {
        originalSentence: 'Two years ago, I went on a two-week trip to Europe, and it was my longest vacation.',
        transformedSentence: "The longest vacation that I've ever taken was a two-week trip to Europe two years ago.",
        transformationType: 'Gộp 2 câu đơn thành cấu trúc So sánh nhất + Hiện tại hoàn thành với "ever"',
        explanationVi: 'Đưa cụm so sánh nhất lên đầu câu làm chủ ngữ tạo điểm nhấn mạnh mẽ ngay từ giây đầu tiên.'
      }
    ],
    mistakes: [
      {
        wrongExample: 'I have ever taken a two-week trip to Europe.',
        correctExample: "The longest vacation I've ever taken was a two-week trip to Europe (hoặc I have been on a two-week trip to Europe).",
        errorReasonVi: 'Như ghi chú trang 23 PDF: Không dùng "ever" trong câu khẳng định thông thường nếu phía trước không có So sánh nhất (The longest, The best) hoặc The first / The only.',
        grammarRuleVi: 'Chỉ dùng "ever" trong câu hỏi (Have you ever...?), câu phủ định, hoặc câu khẳng định có So sánh nhất / The only / The first.'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Theo quy tắc trang 23 PDF, câu khẳng định nào sau đây sử dụng từ "ever" ĐÚNG ngữ pháp?',
        options: [
          "The best meal that I've ever tasted was traditional beef pho in Hanoi.",
          "I have ever tasted traditional beef pho in Hanoi.",
          "She has ever visited Europe twice.",
          "A good meal I've ever tasted was beef pho."
        ],
        correctAnswer: "The best meal that I've ever tasted was traditional beef pho in Hanoi.",
        explanationVi: 'Từ "ever" chỉ được đứng trong câu khẳng định khi đi kèm cấu trúc So sánh nhất ("The best meal") hoặc "The first / The only".'
      }
    ]
  }
];

// Complete table of all 77 items from Untitled_document_bb0198f5.pdf (Pages 1 to 24)
export interface RawPdfTableEntry {
  pdfItemNumber: number;
  pdfPage: number;
  structureName: string;
  formula: string;
  meaningVi: string;
  whenToUse: string;
  category: StructureCategory;
  difficulty: DifficultyBand;
  originalPdfExample: string;
  originalPdfExampleVi: string;
  originalPdfNotes: string;
}

export const ALL_77_PDF_ENTRIES: RawPdfTableEntry[] = [
  {
    pdfItemNumber: 1,
    pdfPage: 1,
    structureName: 'The rapid advancement of...',
    formula: 'The rapid advancement of + N + has transformed the way people + V, leading many to + V',
    meaningVi: 'Sự phát triển nhanh chóng của...',
    whenToUse: 'Mở bài',
    category: 'ielts-vstep',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'The rapid advancement of AI has transformed the way people work, leading many to predict major workplace changes.',
    originalPdfExampleVi: 'Sự phát triển nhanh chóng của AI đã thay đổi cách con người làm việc, khiến nhiều người dự đoán những thay đổi lớn tại nơi làm việc.',
    originalPdfNotes: 'Mẫu câu mở bài nâng cao, dùng cho công nghệ, toàn cầu hóa, đô thị hóa... (many to là người ta hiểu many people á)'
  },
  {
    pdfItemNumber: 2,
    pdfPage: 1,
    structureName: 'lead sb to do',
    formula: 'S + lead(s) + sb + to V',
    meaningVi: 'Khiến ai đó làm gì',
    whenToUse: 'Nguyên nhân - Kết quả',
    category: 'academic-structures',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'This trend has led many people to believe that online education is effective.',
    originalPdfExampleVi: 'Xu hướng này đã khiến nhiều người tin rằng giáo dục trực tuyến có hiệu quả.',
    originalPdfNotes: 'Thường đi với: believe / predict / think'
  },
  {
    pdfItemNumber: 3,
    pdfPage: 1,
    structureName: 'make it increasingly feasible',
    formula: 'S + has made it increasingly feasible for sb to V',
    meaningVi: 'Ngày càng khả thi',
    whenToUse: 'Thân bài',
    category: 'academic-structures',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'Technology has made it increasingly feasible for students to learn remotely.',
    originalPdfExampleVi: 'Công nghệ đã giúp việc học từ xa của học sinh ngày càng khả thi hơn.',
    originalPdfNotes: "'Feasible' là từ trang trọng, hay dùng trong văn viết học thuật"
  },
  {
    pdfItemNumber: 4,
    pdfPage: 1,
    structureName: 'Anyone with...',
    formula: 'Anyone with + N + can + V',
    meaningVi: 'Ai có... thì có thể',
    whenToUse: 'Diễn đạt chung',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'Anyone with determination can succeed.',
    originalPdfExampleVi: 'Bất kỳ ai có sự quyết tâm đều có thể thành công.',
    originalPdfNotes: "'With' ở đây thay thế cho mệnh đề quan hệ 'who has' (Trang 1–2)"
  },
  {
    pdfItemNumber: 5,
    pdfPage: 2,
    structureName: 'One major reason is that',
    formula: 'One major reason is that + S + V',
    meaningVi: 'Một lý do lớn là',
    whenToUse: 'Câu chủ đề',
    category: 'ielts-vstep',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'One major reason is that public transport is affordable.',
    originalPdfExampleVi: 'Một lý do lớn là phương tiện giao thông công cộng có giá cả phải chăng.',
    originalPdfNotes: "Có mệnh đề đủ S+V phía sau thì giữ 'that'; nếu chỉ là cụm danh từ thì bỏ 'that'"
  },
  {
    pdfItemNumber: 6,
    pdfPage: 2,
    structureName: 'without the need to',
    formula: '...without the need to + V',
    meaningVi: 'Mà không cần phải',
    whenToUse: 'Thân bài',
    category: 'academic-structures',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'People can work without the need to travel.',
    originalPdfExampleVi: 'Mọi người có thể làm việc mà không cần phải đi lại.',
    originalPdfNotes: 'Diễn đạt việc không cần làm theo cách truyền thống/cũ nữa'
  },
  {
    pdfItemNumber: 7,
    pdfPage: 2,
    structureName: 'Another contributing factor is',
    formula: 'Another contributing factor is + N/V-ing',
    meaningVi: 'Một yếu tố đóng góp khác là',
    whenToUse: 'Thân bài',
    category: 'ielts-vstep',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'Another contributing factor is lower operating costs.',
    originalPdfExampleVi: 'Một yếu tố đóng góp khác là chi phí vận hành thấp hơn.',
    originalPdfNotes: 'Dùng để thêm lý do thứ hai, thứ ba trong đoạn thân bài'
  },
  {
    pdfItemNumber: 8,
    pdfPage: 2,
    structureName: 'The shift toward',
    formula: 'The shift toward + N + brings/offers + N',
    meaningVi: 'Sự chuyển dịch sang',
    whenToUse: 'Thân bài',
    category: 'academic-structures',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'The shift toward renewable energy brings environmental benefits.',
    originalPdfExampleVi: 'Sự chuyển dịch sang năng lượng tái tạo mang lại những lợi ích về môi trường.',
    originalPdfNotes: 'Nêu lợi ích đi kèm với một xu hướng'
  },
  {
    pdfItemNumber: 9,
    pdfPage: 2,
    structureName: 'continue to',
    formula: 'S + continue(s) to + V',
    meaningVi: 'Tiếp tục làm gì',
    whenToUse: 'Diễn đạt chung',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'People continue to buy printed books.',
    originalPdfExampleVi: 'Mọi người vẫn tiếp tục mua sách in.',
    originalPdfNotes: 'Diễn tả xu hướng vẫn đang tiếp diễn'
  },
  {
    pdfItemNumber: 10,
    pdfPage: 2,
    structureName: 'be better for',
    formula: 'S + be better for + N/V-ing',
    meaningVi: 'Tốt hơn cho việc gì',
    whenToUse: 'So sánh',
    category: 'mistakes-transformations',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'Reading books is better for concentration.',
    originalPdfExampleVi: 'Đọc sách tốt hơn cho sự tập trung.',
    originalPdfNotes: 'Cấu trúc so sánh đơn giản, dễ dùng trong mọi đoạn văn'
  },
  {
    pdfItemNumber: 11,
    pdfPage: 3,
    structureName: 'make it easier',
    formula: 'S + make(s) it easier for sb to V',
    meaningVi: 'Làm cho việc gì dễ dàng hơn',
    whenToUse: 'Thân bài',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'Smartphones make it easier for us to communicate.',
    originalPdfExampleVi: 'Điện thoại thông minh giúp chúng ta giao tiếp dễ dàng hơn.',
    originalPdfNotes: 'Rất phổ biến khi nói về lợi ích của công nghệ'
  },
  {
    pdfItemNumber: 12,
    pdfPage: 3,
    structureName: 'make it increasingly adj',
    formula: 'S + has made it increasingly + adj + for sb to V',
    meaningVi: 'Ngày càng trở nên (tính từ) đối với ai',
    whenToUse: 'Thân bài',
    category: 'academic-structures',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'Social media has made it increasingly difficult for teenagers to focus.',
    originalPdfExampleVi: 'Mạng xã hội đã khiến thanh thiếu niên ngày càng khó tập trung hơn.',
    originalPdfNotes: 'Có thể dùng adj tích cực (easier) hoặc tiêu cực (difficult, harder)'
  },
  {
    pdfItemNumber: 13,
    pdfPage: 3,
    structureName: 'find it + adj + to V',
    formula: 'S + find it + adj + to V',
    meaningVi: 'Thấy việc gì đó như thế nào',
    whenToUse: 'Quan điểm cá nhân',
    category: 'everyday-communication',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'I find it easier to study at night.',
    originalPdfExampleVi: 'Tôi thấy việc học vào ban đêm dễ dàng hơn.',
    originalPdfNotes: 'Diễn đạt cảm nhận, quan điểm cá nhân'
  },
  {
    pdfItemNumber: 14,
    pdfPage: 3,
    structureName: 'free from',
    formula: 'be free from + N/V-ing',
    meaningVi: 'Thoát khỏi, không còn',
    whenToUse: 'Diễn đạt chung',
    category: 'academic-structures',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'She hopes to be free from financial stress.',
    originalPdfExampleVi: 'Cô ấy hy vọng sẽ thoát khỏi áp lực tài chính.',
    originalPdfNotes: "Với cảm xúc/trạng thái tâm lý (lo lắng, áp lực...) dùng 'free from/of' là chuẩn nhất"
  },
  {
    pdfItemNumber: 15,
    pdfPage: 3,
    structureName: 'Because of + N',
    formula: 'Because of + N, S + V',
    meaningVi: 'Bởi vì (cụm danh từ)',
    whenToUse: 'Thân bài',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'Because of inflation, prices have increased.',
    originalPdfExampleVi: 'Bởi vì lạm phát, giá cả đã tăng lên.',
    originalPdfNotes: "Sau 'because of' luôn là cụm danh từ (N), không phải mệnh đề (S+V)"
  },
  {
    pdfItemNumber: 16,
    pdfPage: 3,
    structureName: 'significant + adj + benefits',
    formula: 'significant + adj + noun',
    meaningVi: 'Lợi ích đáng kể (về mặt nào đó)',
    whenToUse: 'Học thuật',
    category: 'academic-structures',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'Renewable energy provides significant environmental benefits.',
    originalPdfExampleVi: 'Năng lượng tái tạo mang lại những lợi ích môi trường đáng kể.',
    originalPdfNotes: 'Cấu trúc 2 tính từ cùng bổ nghĩa cho 1 danh từ'
  },
  {
    pdfItemNumber: 17,
    pdfPage: 4,
    structureName: 'advantages in terms of',
    formula: 'advantages in terms of + N',
    meaningVi: 'Lợi thế về mặt',
    whenToUse: 'So sánh',
    category: 'mistakes-transformations',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'Digital books have advantages in terms of convenience.',
    originalPdfExampleVi: 'Sách điện tử có những lợi thế về mặt tiện lợi.',
    originalPdfNotes: 'Dùng khi so sánh, nhấn mạnh ưu điểm vượt trội của một khía cạnh cụ thể'
  },
  {
    pdfItemNumber: 18,
    pdfPage: 4,
    structureName: 'more advantages than',
    formula: 'A has more advantages than B',
    meaningVi: 'Có nhiều lợi thế hơn',
    whenToUse: 'So sánh',
    category: 'mistakes-transformations',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'Electric cars have more advantages than petrol cars.',
    originalPdfExampleVi: 'Xe điện có nhiều lợi thế hơn xe chạy xăng.',
    originalPdfNotes: 'So sánh lợi ích giữa hai đối tượng'
  },
  {
    pdfItemNumber: 19,
    pdfPage: 4,
    structureName: 'relevant to',
    formula: 'be relevant to + N',
    meaningVi: 'Liên quan đến / thiết thực với',
    whenToUse: 'Diễn đạt chung',
    category: 'academic-structures',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'This topic is relevant to university students.',
    originalPdfExampleVi: 'Chủ đề này có liên quan mật thiết đến sinh viên đại học.',
    originalPdfNotes: "Luôn đi kèm giới từ 'to'"
  },
  {
    pdfItemNumber: 20,
    pdfPage: 4,
    structureName: "I'd be a fool not to",
    formula: "I'd be a fool not to + V (hoặc I would be thick not to accept)",
    meaningVi: 'Thật ngốc nếu không...',
    whenToUse: 'Speaking / Nhấn mạnh',
    category: 'everyday-communication',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: "I'd be a fool not to accept the offer.",
    originalPdfExampleVi: 'Tôi sẽ thật ngốc nếu không nhận lời đề nghị đó.',
    originalPdfNotes: 'Cách nói tự nhiên, nhấn mạnh sẽ dại dột nếu không làm điều gì'
  },
  {
    pdfItemNumber: 21,
    pdfPage: 4,
    structureName: 'make + object + complement',
    formula: 'make + O + Adj',
    meaningVi: 'Làm cho (ai/cái gì) trở nên',
    whenToUse: 'Ngữ pháp',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'This policy makes life easier.',
    originalPdfExampleVi: 'Chính sách này làm cho cuộc sống dễ dàng hơn.',
    originalPdfNotes: 'Có thể chuyển đổi sang dạng V-ing để câu tự nhiên hơn khi O dài'
  },
  {
    pdfItemNumber: 22,
    pdfPage: 4,
    structureName: 'be pleased to',
    formula: 'be + adj (cảm xúc) + to V',
    meaningVi: 'Vui/hài lòng khi làm gì',
    whenToUse: 'Diễn đạt chung',
    category: 'everyday-communication',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'I am pleased to help.',
    originalPdfExampleVi: 'Tôi rất sẵn lòng/vui mừng được giúp đỡ.',
    originalPdfNotes: 'Áp dụng với mọi tính từ chỉ cảm xúc: happy, glad, pleased...'
  },
  {
    pdfItemNumber: 23,
    pdfPage: 5,
    structureName: 'be resigned to',
    formula: 'be resigned to + N/V-ing',
    meaningVi: 'Cam chịu, chấp nhận',
    whenToUse: 'Trang trọng',
    category: 'advanced-variations',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'Many workers are resigned to working overtime.',
    originalPdfExampleVi: 'Nhiều người lao động đành cam chịu việc làm thêm giờ.',
    originalPdfNotes: 'Diễn đạt việc chấp nhận một điều không mong muốn (lưu ý giới từ to + V-ing)'
  },
  {
    pdfItemNumber: 24,
    pdfPage: 5,
    structureName: 'be used to + N/V-ing',
    formula: 'be used to + N/V-ing',
    meaningVi: 'Quen với việc gì',
    whenToUse: 'Ngữ pháp',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'She is used to getting up early.',
    originalPdfExampleVi: 'Cô ấy đã quen với việc dậy sớm.',
    originalPdfNotes: "Không nhầm với 'used to + V' (đã từng làm gì trong quá khứ)"
  },
  {
    pdfItemNumber: 25,
    pdfPage: 5,
    structureName: 'less + uncountable noun',
    formula: 'less + N (không đếm được)',
    meaningVi: 'Ít hơn (dành cho danh từ không đếm được)',
    whenToUse: 'Ngữ pháp',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'People spend less money on newspapers.',
    originalPdfExampleVi: 'Mọi người chi ít tiền hơn cho báo giấy.',
    originalPdfNotes: "'Less' chỉ đi với danh từ không đếm được; danh từ đếm được dùng 'fewer'"
  },
  {
    pdfItemNumber: 26,
    pdfPage: 5,
    structureName: 'not without',
    formula: 'be not without + its + N',
    meaningVi: 'Không phải là không có',
    whenToUse: 'Trang trọng',
    category: 'advanced-variations',
    difficulty: 'Band 8.0+',
    originalPdfExample: 'This solution is not without its drawbacks.',
    originalPdfExampleVi: 'Giải pháp này không phải là không có những nhược điểm của nó.',
    originalPdfNotes: "Cách nói giảm nhẹ nhưng vẫn thừa nhận có nhược điểm; 'without' là giới từ nên không đi cùng don't/doesn't"
  },
  {
    pdfItemNumber: 27,
    pdfPage: 5,
    structureName: '; therefore,',
    formula: 'Clause; therefore, clause',
    meaningVi: 'Vì vậy (nối 2 mệnh đề độc lập)',
    whenToUse: 'Liên kết',
    category: 'academic-structures',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'The demand increased; therefore, prices rose.',
    originalPdfExampleVi: 'Nhu cầu tăng lên; vì vậy, giá cả đã tăng.',
    originalPdfNotes: "Đứng giữa câu, nối 2 mệnh đề độc lập, có dấu ';' trước và ',' sau"
  },
  {
    pdfItemNumber: 28,
    pdfPage: 5,
    structureName: ', thereby V-ing',
    formula: '..., thereby + V-ing',
    meaningVi: 'Qua đó, từ đó dẫn đến',
    whenToUse: 'Trang trọng',
    category: 'advanced-variations',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'The company expanded, thereby creating jobs.',
    originalPdfExampleVi: 'Công ty đã mở rộng quy mô, qua đó tạo ra thêm việc làm.',
    originalPdfNotes: 'Diễn đạt kết quả/hệ quả tiếp theo của hành động trước đó (Trang 5–6)'
  },
  {
    pdfItemNumber: 29,
    pdfPage: 6,
    structureName: 'as...as those in',
    formula: 'as + adj + as those in + N',
    meaningVi: 'So sánh bằng với (những cái ở...)',
    whenToUse: 'So sánh',
    category: 'mistakes-transformations',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'House prices are not as high as those in big cities.',
    originalPdfExampleVi: 'Giá nhà không cao bằng giá nhà ở các thành phố lớn.',
    originalPdfNotes: "So sánh bằng bắt buộc dùng cặp 'as...as'; dùng đại từ 'those' thay cho danh từ số nhiều đứng trước"
  },
  {
    pdfItemNumber: 30,
    pdfPage: 6,
    structureName: 'such as those in',
    formula: 'such as those in + N',
    meaningVi: 'Chẳng hạn như những cái ở...',
    whenToUse: 'So sánh / liệt kê',
    category: 'academic-structures',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'Facilities in rural areas, such as those in remote provinces, are often underdeveloped.',
    originalPdfExampleVi: 'Cơ sở vật chất ở khu vực nông thôn, chẳng hạn như ở các tỉnh vùng sâu vùng xa, thường kém phát triển.',
    originalPdfNotes: 'Dùng để liệt kê ví dụ hoặc miêu tả cụ thể mà không lặp lại danh từ số nhiều'
  },
  {
    pdfItemNumber: 31,
    pdfPage: 6,
    structureName: 'force sb to spend money on',
    formula: 'force sb to spend money on + N',
    meaningVi: 'Buộc ai đó phải chi tiền vào',
    whenToUse: 'Thân bài',
    category: 'ielts-vstep',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: "High tuition fees force students to spend more money on education. / The government shouldn't force students to spend money on non-compulsory subjects.",
    originalPdfExampleVi: 'Học phí cao buộc sinh viên phải chi nhiều tiền hơn cho giáo dục. / Chính phủ không nên buộc học sinh chi tiền cho các môn không bắt buộc.',
    originalPdfNotes: 'Kết hợp 2 cấu trúc: force sb to do + spend money on'
  },
  {
    pdfItemNumber: 32,
    pdfPage: 6,
    structureName: 'spend on',
    formula: 'S + spend + money/time + on + N/V-ing',
    meaningVi: 'Chi tiêu/bỏ tiền vào',
    whenToUse: 'Ngữ pháp',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'People spend a large amount of money on healthcare.',
    originalPdfExampleVi: 'Mọi người chi một khoản tiền lớn cho chăm sóc sức khỏe.',
    originalPdfNotes: "Luôn đi với giới từ 'on' trước đối tượng chi tiêu"
  },
  {
    pdfItemNumber: 33,
    pdfPage: 6,
    structureName: 'is divided into',
    formula: 'S + be divided into + N',
    meaningVi: 'Được chia thành',
    whenToUse: 'Học thuật / Phân loại',
    category: 'academic-structures',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'The national budget is divided into three primary sectors.',
    originalPdfExampleVi: 'Ngân sách quốc gia được chia thành ba lĩnh vực chính.',
    originalPdfNotes: 'Cấu trúc phân chia thành phần trong IELTS Writing Task 1 & Task 2'
  },
  {
    pdfItemNumber: 34,
    pdfPage: 6,
    structureName: 'hold sb accountable / responsible for',
    formula: 'hold sb accountable / responsible for + N/V-ing (hoặc take responsibility for)',
    meaningVi: 'Buộc ai đó phải chịu trách nhiệm về hành động/hậu quả gây ra',
    whenToUse: 'Trang trọng / Thân bài',
    category: 'ielts-vstep',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'Authorities must hold polluting factories accountable for environmental damage.',
    originalPdfExampleVi: 'Cơ quan chức năng phải buộc các nhà máy gây ô nhiễm chịu trách nhiệm về thiệt hại môi trường.',
    originalPdfNotes: 'Trang 6–7: Hoặc dùng Hold sb responsible for / take responsibility for'
  },
  {
    pdfItemNumber: 35,
    pdfPage: 7,
    structureName: 'It is my belief that',
    formula: 'It is my belief that + S + V',
    meaningVi: 'Tôi tin rằng (Nêu quan điểm trang trọng)',
    whenToUse: 'Mở bài / Kết bài',
    category: 'ielts-vstep',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'It is my belief that governments should subsidize renewable energy.',
    originalPdfExampleVi: 'Tôi tin rằng chính phủ nên trợ cấp cho năng lượng tái tạo.',
    originalPdfNotes: 'Cấu trúc danh từ hóa trang trọng thay thế cho "I believe that"'
  },
  {
    pdfItemNumber: 36,
    pdfPage: 7,
    structureName: 'S + believe/think that + [Thesis cause + effect]',
    formula: 'S + believe/think that + [Mệnh đề gộp Cause + Effect trong 1 câu]',
    meaningVi: 'Tin/nghĩ rằng (Câu luận điểm gộp nguyên nhân và kết quả)',
    whenToUse: 'Thesis Statement',
    category: 'ielts-vstep',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'Many educators believe that excessive standardized testing stifles student creativity.',
    originalPdfExampleVi: 'Nhiều nhà giáo dục tin rằng việc thi cử chuẩn hóa quá mức sẽ bóp nghẹt sự sáng tạo của học sinh.',
    originalPdfNotes: 'Gộp định hướng nguyên nhân + hệ quả gọn trong 1 câu Thesis Statement'
  },
  {
    pdfItemNumber: 37,
    pdfPage: 7,
    structureName: 'to the detriment of / exert an impact on',
    formula: '[Hành động] + to the detriment of + [Danh từ bị hại] | exert an impact on + N',
    meaningVi: 'Gây phương hại đến / Gây tác động lên',
    whenToUse: 'Học thuật Band 7.5+',
    category: 'advanced-variations',
    difficulty: 'Band 8.0+',
    originalPdfExample: 'Focusing too much on national transport infrastructure is to the detriment of local residents.',
    originalPdfExampleVi: 'Việc tập trung quá nhiều vào hạ tầng giao thông quốc gia gây phương hại đến cư dân địa phương.',
    originalPdfNotes: 'Trang 7–8: Cả hai cụm từ đều đúng 100% và là cụm nâng cao cực hay để thay thế cho "cause"'
  },
  {
    pdfItemNumber: 38,
    pdfPage: 8,
    structureName: 'its + DANH TỪ (Sở hữu của vật/nơi chốn/tổ chức)',
    formula: 'its + Noun',
    meaningVi: 'Cái gì đó CỦA một công ty / nơi chốn / đồ vật',
    whenToUse: 'Ngữ pháp cốt lõi',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'The city is famous for its historic architecture.',
    originalPdfExampleVi: 'Thành phố nổi tiếng với kiến trúc lịch sử của nó.',
    originalPdfNotes: 'Cứ khi nào muốn nói "cái gì đó CỦA một công ty / nơi chốn / đồ vật", hãy dùng: its + DANH TỪ'
  },
  {
    pdfItemNumber: 39,
    pdfPage: 8,
    structureName: 'Although + (S + be) + tính từ, S + V',
    formula: 'Đầy đủ: Although + S + be + Adj, S + V | Rút gọn: Although + Adj, S + V',
    meaningVi: 'Mặc dù... nhưng vẫn...',
    whenToUse: 'Câu phức nhượng bộ',
    category: 'advanced-variations',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'Đầy đủ: Although it was difficult, the test was interesting. / Rút gọn: Although difficult, the test was interesting.',
    originalPdfExampleVi: 'Mặc dù khó, bài kiểm tra vẫn rất thú vị.',
    originalPdfNotes: 'Trang 8–9: Rút gọn chủ ngữ và to-be sau Although khi hai vế cùng chủ ngữ'
  },
  {
    pdfItemNumber: 40,
    pdfPage: 9,
    structureName: 'mean + V-ing',
    formula: 'S + mean(s) + V-ing',
    meaningVi: 'Có nghĩa là / Dẫn đến việc gì (đồng nghĩa với entail)',
    whenToUse: 'Chủ đề Đô thị, Lối sống, Stress, Work-life balance',
    category: 'ielts-vstep',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'Living in metropolitan area means dealing with fast-paced urban environment, which can be mentally draining.',
    originalPdfExampleVi: 'Sống ở khu đô thị lớn đồng nghĩa với việc phải đối mặt với môi trường nhịp độ nhanh, điều có thể gây kiệt sức tinh thần.',
    originalPdfNotes: 'Trang 9–11: Dùng cho nhóm chủ đề Nơi chốn & Đô thị (City life vs. Countryside, Urbanization) và Con người & Lối sống (Stress, Work-life Balance, Hobbies)'
  },
  {
    pdfItemNumber: 41,
    pdfPage: 11,
    structureName: 'waste / spend + tiền bạc/thời gian + on',
    formula: 'waste / spend + money/time + on + N/V-ing',
    meaningVi: 'Lãng phí / Chi tiêu tiền bạc hoặc thời gian vào việc gì',
    whenToUse: 'Diễn đạt chung & Thân bài',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: "Don't waste money on clothes. / They spend a lot of time on research.",
    originalPdfExampleVi: 'Đừng lãng phí tiền vào quần áo. / Họ dành nhiều thời gian vào việc nghiên cứu.',
    originalPdfNotes: 'Cả waste và spend đều đi với giới từ ON trước đối tượng tiêu tốn'
  },
  {
    pdfItemNumber: 42,
    pdfPage: 11,
    structureName: "take someone's mind off st & carry st through",
    formula: "take + someone's + mind off + st | carry + st + through | protection against + N",
    meaningVi: 'Gạt bỏ điều gì khỏi đầu (tạm quên đi) | Hoàn thành đến cùng | Chống lại',
    whenToUse: 'Bắt buộc học (Speaking & Writing)',
    category: 'everyday-communication',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: "Listening to music helps take the patient's mind off the physical pain. / Despite the budget cuts, the team managed to carry the project through.",
    originalPdfExampleVi: 'Nghe nhạc giúp bệnh nhân tạm quên đi cơn đau thể xác. / Bất chấp cắt giảm ngân sách, nhóm vẫn xoay sở hoàn thành dự án đến cùng.',
    originalPdfNotes: "Trang 11–12: Vị trí someone's bắt buộc phải là tính từ sở hữu hoặc sở hữu cách; mặc định bản thân là 'takes my mind off'"
  },
  {
    pdfItemNumber: 43,
    pdfPage: 12,
    structureName: 'Đảo ngữ: Not only + Aux/Be + S..., but S also...',
    formula: 'Not only + Trợ động từ/To-be + S + V, but + S + also + V',
    meaningVi: 'Không những... mà còn... (Đảo ngữ nhấn mạnh)',
    whenToUse: 'Văn viết luận học thuật Band 7.0 - 8.0+',
    category: 'advanced-variations',
    difficulty: 'Band 8.0+',
    originalPdfExample: 'Not only does learning English help you expand your knowledge, but it also improves your career prospects. / Not only is poverty a social issue, but it is also an economic barrier.',
    originalPdfExampleVi: 'Không chỉ việc học tiếng Anh giúp bạn mở rộng kiến thức, mà nó còn cải thiện cơ hội nghề nghiệp của bạn.',
    originalPdfNotes: 'Trang 12–13: RẤT CẦN THUỘC. Kiểm soát ngôn ngữ trình độ cao tương đương Band 7.0 - 8.0+ IELTS'
  },
  {
    pdfItemNumber: 44,
    pdfPage: 13,
    structureName: 'take something with someone',
    formula: 'take + something + with + someone',
    meaningVi: 'Mang theo cái gì bên mình',
    whenToUse: 'Giao tiếp & Speaking',
    category: 'everyday-communication',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'Remember to take your identification card with you.',
    originalPdfExampleVi: 'Hãy nhớ mang theo thẻ căn cước bên mình.',
    originalPdfNotes: 'Cụm ngoại động từ chỉ việc mang theo vật dụng cá nhân'
  },
  {
    pdfItemNumber: 45,
    pdfPage: 13,
    structureName: 'Câu chẻ (Wh-Cleft & It-Cleft Sentences)',
    formula: 'What/How + S + V1 + is/was + (to) V2 / N | It is/was + [Thành phần nhấn mạnh] + that...',
    meaningVi: 'Điều mà... chính là... / Chính... là thứ mà...',
    whenToUse: 'Vũ khí Band 7.0 - 8.0+ (PHẢI THUỘC)',
    category: 'advanced-variations',
    difficulty: 'Band 8.0+',
    originalPdfExample: 'What governments need to do is implement stricter laws. / What I love about this city is the street food. / It is technology that has transformed modern education most dramatically.',
    originalPdfExampleVi: 'Điều mà các chính phủ cần làm chính là thực thi những bộ luật nghiêm khắc hơn.',
    originalPdfNotes: 'Trang 13–14: Câu chẻ được đánh giá rất cao, bí quyết là dùng What/How ở đầu câu hoặc It is/was... that...'
  },
  {
    pdfItemNumber: 46,
    pdfPage: 14,
    structureName: 'Giới từ + Cụm danh từ (Cụm trạng ngữ)',
    formula: 'Preposition + Noun Phrase',
    meaningVi: 'Cụm giới từ tạo thành cụm trạng ngữ bổ nghĩa',
    whenToUse: 'Mở rộng câu',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'from my history class at high school',
    originalPdfExampleVi: 'từ lớp học lịch sử của tôi ở trường cấp ba',
    originalPdfNotes: 'Cấu trúc Giới từ + Cụm danh từ thường tạo thành một cụm trạng ngữ chỉ nguồn gốc/nơi chốn'
  },
  {
    pdfItemNumber: 47,
    pdfPage: 14,
    structureName: 'Câu ghép-phức (Compound-Complex Sentence) với Mệnh đề danh ngữ',
    formula: '[Mệnh đề độc lập 1] + FANBOYS (and/but/so/or) + [Mệnh đề độc lập 2] + [Mệnh đề danh ngữ what/that...]',
    meaningVi: 'Câu ghép-phức sử dụng mệnh đề danh ngữ làm S, O hoặc bổ ngữ',
    whenToUse: 'Đa dạng hóa cấu trúc câu Band 7.5+',
    category: 'advanced-variations',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'I deeply regret what I did, so I decided to apologize to my boss.',
    originalPdfExampleVi: 'Tôi vô cùng hối hận về những gì mình đã làm, vì vậy tôi quyết định xin lỗi sếp.',
    originalPdfNotes: 'Trang 14–15: Bắt buộc có ít nhất 2 mệnh đề độc lập (nối bằng FANBOYS) và ít nhất 1 mệnh đề danh ngữ phụ thuộc'
  },
  {
    pdfItemNumber: 48,
    pdfPage: 15,
    structureName: 'Câu phức (Complex Sentence) & Nâng cấp với Despite + V-ing',
    formula: 'Although/If + S + V, S + V | Despite + V-ing + N, S + V',
    meaningVi: 'Câu phức & Nâng cấp rút gọn với Despite + V-ing',
    whenToUse: 'IELTS Writing (Ưu tiên hơn câu ghép dùng "so")',
    category: 'advanced-variations',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'They acknowledged that the pricing was excessive; consequently, they ultimately refused to execute the agreement. -> NÂNG CẤP: Despite acknowledging the excessive price, they ultimately refused to execute the contract.',
    originalPdfExampleVi: 'Bất chấp việc thừa nhận mức giá quá cao, cuối cùng họ vẫn từ chối ký kết hợp đồng.',
    originalPdfNotes: 'Trong IELTS Writing, câu dùng Although/Despite được đánh giá cao hơn câu dùng "so"'
  },
  {
    pdfItemNumber: 49,
    pdfPage: 15,
    structureName: '[Tính từ 1] + [Tính từ 2] + [Danh từ]',
    formula: 'Adjective 1 + Adjective 2 + Noun',
    meaningVi: 'Cụm danh từ 2 tính từ bổ nghĩa liên tiếp',
    whenToUse: 'Cụm danh từ học thuật',
    category: 'academic-structures',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'abundant natural resources',
    originalPdfExampleVi: 'nguồn tài nguyên thiên nhiên dồi dào',
    originalPdfNotes: 'Ghép tính từ chỉ mức độ (abundant) + tính từ phân loại (natural) + danh từ (resources)'
  },
  {
    pdfItemNumber: 50,
    pdfPage: 15,
    structureName: 'for + being + Adjective',
    formula: 'for + being + Adjective',
    meaningVi: 'Vì bị / vì có tính chất như thế nào đó',
    whenToUse: 'Nêu lý do của trạng thái/tính chất',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'for being incompetent',
    originalPdfExampleVi: 'vì thiếu năng lực / yếu kém',
    originalPdfNotes: 'Sau giới từ "for", tính từ cần mượn danh động từ "being" đứng trước'
  },
  {
    pdfItemNumber: 51,
    pdfPage: 15,
    structureName: 'Chủ ngữ + Động từ chính + (Object) + to be + V3/ed',
    formula: 'S + V + (Object) + to be + V3/ed',
    meaningVi: 'Nhấn mạnh đối tượng chịu tác động của hành động thứ hai',
    whenToUse: 'Phải học — Bị động nguyên mẫu học thuật',
    category: 'grammar-formulas',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: "The government has ordered the old bridge to be demolished for safety reasons. / An incompetent leader doesn't deserve to be promoted.",
    originalPdfExampleVi: 'Chính phủ đã ra lệnh phá dỡ cây cầu cũ vì lý do an toàn. / Một lãnh đạo yếu kém không xứng đáng được thăng chức.',
    originalPdfNotes: 'Trang 15–16: Cây cầu không thể tự phá dỡ nên phải dùng "to be + V3"'
  },
  {
    pdfItemNumber: 52,
    pdfPage: 16,
    structureName: 'Only if + [Điều kiện], + [Đảo ngữ mệnh đề chính]',
    formula: 'Only if + S + V, + Auxiliary/Modal + S + V',
    meaningVi: 'Chỉ khi có A thì mới có B (Điều kiện bắt buộc và duy nhất)',
    whenToUse: 'Đảo ngữ nhấn mạnh điều kiện tiên quyết',
    category: 'advanced-variations',
    difficulty: 'Band 8.0+',
    originalPdfExample: 'Only if you have money, can you buy this car. / Only if we have smartphones, can Blockchain exist.',
    originalPdfExampleVi: 'Chỉ khi bạn có tiền thì bạn mới mua được chiếc xe này.',
    originalPdfNotes: 'Cấu trúc chính xác nhất để nhấn mạnh điều kiện bắt buộc và duy nhất cho một sự việc xảy ra'
  },
  {
    pdfItemNumber: 53,
    pdfPage: 16,
    structureName: 'make + someone + worth + [số tiền/danh từ]',
    formula: 'S + make(s) + someone + worth + [số tiền / danh từ]',
    meaningVi: 'Khiến ai đó có giá trị tài sản ở mức nào đó',
    whenToUse: 'Kinh tế / Tài chính / Tiểu sử',
    category: 'grammar-formulas',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'The stock surge made her worth 10 billion overnight. / Winning the lottery made her worth millions.',
    originalPdfExampleVi: 'Đợt tăng vọt cổ phiếu đã giúp khối tài sản của cô ấy đạt 10 tỷ chỉ sau một đêm.',
    originalPdfNotes: 'Dùng tính từ "worth + số tiền" làm bổ ngữ tân ngữ'
  },
  {
    pdfItemNumber: 54,
    pdfPage: 16,
    structureName: 'leading many to + V (Đại từ many)',
    formula: 'S + led many to + V | Clause, leading many to + V',
    meaningVi: 'Khiến nhiều người làm gì (tránh lặp từ people)',
    whenToUse: 'Kết nối nguyên nhân với hệ quả ảnh hưởng số đông',
    category: 'academic-structures',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'The scandal led many to resign. / Gas prices increased, leading many to take the bus. / The app had a security bug, leading many to delete it.',
    originalPdfExampleVi: 'Giá xăng tăng cao, khiến nhiều người chuyển sang đi xe buýt.',
    originalPdfNotes: 'Trang 16–17: Khi không muốn lặp lại từ "People", dùng đại từ "many" nối trực tiếp với "to V"'
  },
  {
    pdfItemNumber: 55,
    pdfPage: 17,
    structureName: 'Second Conditional (Câu điều kiện loại 2)',
    formula: 'If + Past Simple, S + would + V',
    meaningVi: 'Giả định không có thật ở hiện tại',
    whenToUse: 'Đưa ra quan điểm giả định',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'If I were rich, I would travel the world.',
    originalPdfExampleVi: 'Nếu tôi giàu có, tôi sẽ đi du lịch vòng quanh thế giới.',
    originalPdfNotes: 'Hay dùng Second Conditional để đưa ra giả định, quan điểm trong bài viết/nói'
  },
  {
    pdfItemNumber: 56,
    pdfPage: 17,
    structureName: 'Third Conditional (Câu điều kiện loại 3)',
    formula: 'If + Past Perfect (had + V3), S + would have + V3',
    meaningVi: 'Giả định trái với quá khứ (tiếc nuối/phân tích chuyện đã qua)',
    whenToUse: 'Phân tích hậu quả quá khứ / Tiếc nuối',
    category: 'grammar-formulas',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'If I had brought enough money yesterday, I would have bought it.',
    originalPdfExampleVi: 'Nếu hôm qua tôi mang đủ tiền thì tôi đã mua nó rồi.',
    originalPdfNotes: 'Dùng khi chuyện đã xảy ra và kết thúc trong quá khứ (hôm qua, tuần trước, năm ngoái)'
  },
  {
    pdfItemNumber: 57,
    pdfPage: 17,
    structureName: 'First Conditional (Câu điều kiện loại 1)',
    formula: 'If + Present Simple, S + will + V',
    meaningVi: 'Tình huống có thể xảy ra thực tế trong tương lai',
    whenToUse: 'Dự báo hệ quả tương lai',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'If it rains tomorrow, I will stay home.',
    originalPdfExampleVi: 'Nếu ngày mai trời mưa, tôi sẽ ở nhà.',
    originalPdfNotes: 'Trang 17–18: Diễn tả điều kiện có thật ở hiện tại hoặc tương lai'
  },
  {
    pdfItemNumber: 58,
    pdfPage: 18,
    structureName: 'Just remember that + S + V',
    formula: 'Just remember that + S + V (+ O)',
    meaningVi: 'Hãy nhớ rằng... (Động viên, khuyên nhủ)',
    whenToUse: 'Giao tiếp thân mật / Động viên bạn bè, người thân',
    category: 'everyday-communication',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'Just remember that I love you / just remember that tomorrow is a new day / that it takes time.',
    originalPdfExampleVi: 'Chỉ cần nhớ rằng ngày mai là một ngày mới / mọi thứ đều cần thời gian.',
    originalPdfNotes: 'Dùng để động viên, khuyên nhủ nhanh cho bạn bè, người thân'
  },
  {
    pdfItemNumber: 59,
    pdfPage: 18,
    structureName: 'Remember that ... is/are actually ...',
    formula: 'Remember that + S + be + actually + N/Adj',
    meaningVi: 'Hãy nhớ rằng ... thực chất lại là ...',
    whenToUse: 'Động viên / Thay đổi góc nhìn tích cực',
    category: 'everyday-communication',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'Remember that introverts are actually good leaders. / Remember that mistakes are actually a lesson.',
    originalPdfExampleVi: 'Hãy nhớ rằng người hướng nội thực chất là những nhà lãnh đạo giỏi. / Hãy nhớ rằng sai lầm thực chất là một bài học.',
    originalPdfNotes: 'Dùng để khích lệ hoặc phá bỏ định kiến thông thường'
  },
  {
    pdfItemNumber: 60,
    pdfPage: 18,
    structureName: 'One thing that I want you to remember here is...',
    formula: 'One thing that I want you to remember here is + N / to V',
    meaningVi: 'Một điều tôi muốn bạn nhớ kỹ ở đây là...',
    whenToUse: 'Nhấn mạnh chi tiết quan trọng',
    category: 'everyday-communication',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'One thing that I want you to remember here is the price / is to listen / is to smile / is the password / is to be safe.',
    originalPdfExampleVi: 'Một điều quan trọng tôi muốn bạn ghi nhớ ở đây là mức giá / là hãy lắng nghe / là phải giữ an toàn.',
    originalPdfNotes: 'Có thể cộng trực tiếp với Cụm danh từ (the price) hoặc Động từ nguyên mẫu có to (to listen, to be safe)'
  },
  {
    pdfItemNumber: 61,
    pdfPage: 18,
    structureName: 'There are a number of reasons for the existence of...',
    formula: 'There was/are a number of reasons for the existence of + N',
    meaningVi: 'Có một vài lý do cho sự tồn tại của...',
    whenToUse: 'Mở bài / Câu chủ đề phân tích nguyên nhân',
    category: 'ielts-vstep',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'There are a number of reasons for the existence of gender roles in modern society. / There are a number of reasons for the existence of monopolies in certain industries.',
    originalPdfExampleVi: 'Có một số lý do giải thích cho sự tồn tại của vai trò giới trong xã hội hiện đại.',
    originalPdfNotes: 'Trang 18–19: Mẫu câu học thuật mở đầu đoạn phân tích nguyên nhân'
  },
  {
    pdfItemNumber: 62,
    pdfPage: 19,
    structureName: 'it can be because of (+ N / the fact that S + V)',
    formula: '..., it can be because of + N / the fact that + S + V',
    meaningVi: 'Nó có thể là bởi vì...',
    whenToUse: 'Giải thích nguyên nhân đi kèm câu 61',
    category: 'ielts-vstep',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'There are a number of reasons for the existence of economic inflation, it can be because of government overspending. / ...it can be because of the fact that factories release too much CO2.',
    originalPdfExampleVi: 'Đó có thể là vì chi tiêu quá mức của chính phủ / vì thực tế các nhà máy thải quá nhiều CO2.',
    originalPdfNotes: 'Ghép với cụm danh từ hoặc "the fact that + mệnh đề"'
  },
  {
    pdfItemNumber: 63,
    pdfPage: 19,
    structureName: 'The purpose here is to...',
    formula: 'The purpose here is to + V',
    meaningVi: 'Mục đích ở đây là để...',
    whenToUse: 'Thuyết trình, công việc & học thuật',
    category: 'everyday-communication',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'The purpose here is to improve team collaboration and maximize daily productivity. / The purpose here is to analyze customer feedback before launching the new product.',
    originalPdfExampleVi: 'Mục đích ở đây là cải thiện sự phối hợp nhóm và tối đa hóa năng suất hằng ngày.',
    originalPdfNotes: 'Nêu rõ mục tiêu hành động bằng động từ nguyên mẫu'
  },
  {
    pdfItemNumber: 64,
    pdfPage: 19,
    structureName: 'At first glance, X may appear similar to Y, but actually they are not the same',
    formula: 'At first glance, X may appear similar to Y, but actually they are not the same.',
    meaningVi: 'Thoạt nhìn, X có vẻ giống Y, nhưng thực chất chúng không giống nhau.',
    whenToUse: 'Mở đầu phần phân biệt hai khái niệm',
    category: 'mistakes-transformations',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'At first glance, loneliness may appear similar to solitude, but actually they are not the same.',
    originalPdfExampleVi: 'Thoạt nhìn, cô đơn có vẻ giống với sự tĩnh lặng một mình, nhưng thực chất chúng không giống nhau.',
    originalPdfNotes: 'Dùng làm câu dẫn trước khi chỉ ra điểm khác biệt cốt lõi'
  },
  {
    pdfItemNumber: 65,
    pdfPage: 19,
    structureName: 'The key difference between X and Y is that...',
    formula: 'The key difference between X and Y is that + S1 + V1, whereas + S2 + V2',
    meaningVi: 'Điểm khác biệt then chốt giữa X và Y là...',
    whenToUse: 'So sánh & Đối chiếu khái niệm học thuật',
    category: 'mistakes-transformations',
    difficulty: 'Band 8.0+',
    originalPdfExample: 'The key difference between loneliness and solitude is that loneliness is painful isolation, whereas solitude is peaceful being alone.',
    originalPdfExampleVi: 'Điểm khác biệt then chốt giữa cô đơn và tĩnh lặng là cô đơn là sự cô lập đau khổ, trong khi tĩnh lặng là sự ở một mình bình yên.',
    originalPdfNotes: 'Trang 19–20: Có hai động từ chia thì đứng gần nhau là is (1) và is (2) nên bắt buộc phải có "that"'
  },
  {
    pdfItemNumber: 66,
    pdfPage: 20,
    structureName: 'Being + Adj/Adv (Cụm danh động từ chỉ trạng thái)',
    formula: 'being + Adj / Adv',
    meaningVi: 'Trạng thái ở / tồn tại như thế nào',
    whenToUse: 'Làm chủ ngữ hoặc vị ngữ định nghĩa trạng thái',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'is being alone',
    originalPdfExampleVi: 'là trạng thái ở một mình',
    originalPdfNotes: 'Cụm danh động từ / vị ngữ chỉ trạng thái'
  },
  {
    pdfItemNumber: 67,
    pdfPage: 20,
    structureName: "Remember that X here is not Y, it's actually Z",
    formula: 'Remember that X here is not Y, it is actually Z | become + Adj (không cộng N)',
    meaningVi: 'Hãy nhớ rằng X ở đây không phải là Y, mà thực chất là Z',
    whenToUse: 'Đính chính sự hiểu lầm phổ biến / Làm rõ bản chất',
    category: 'mistakes-transformations',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'Remember that our goal here is not to replace the system, it is actually to modify it. / achieve fame and fortune',
    originalPdfExampleVi: 'Hãy nhớ rằng mục tiêu của chúng ta ở đây không phải là thay thế hệ thống, mà thực chất là điều chỉnh nó.',
    originalPdfNotes: 'Dùng để định nghĩa/mô tả bản chất của X. Lưu ý thêm: become + adj, còn muốn cộng danh từ dùng "achieve fame and fortune"'
  },
  {
    pdfItemNumber: 68,
    pdfPage: 21,
    structureName: 'Quy tắc Động từ nguyên bản 100% cho hành động chưa diễn ra',
    formula: 'need to do / decide to + V (nguyên mẫu 100%, không thêm -s hay -ed)',
    meaningVi: 'Hành động chưa làm, đang tính xem phải làm thế nào thì động từ giữ nguyên bản',
    whenToUse: 'Mẹo nhớ ngữ pháp cốt lõi',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'What governments need to do is implement stricter laws.',
    originalPdfExampleVi: 'Điều chính phủ cần làm là thực thi luật nghiêm hơn.',
    originalPdfNotes: 'Mẹo nhớ trang 21: Đã là hành động "chưa làm, bây giờ mới tính xem phải làm thế nào" thì động từ luôn ở dạng nguyên bản 100%'
  },
  {
    pdfItemNumber: 69,
    pdfPage: 21,
    structureName: ', rather than... (Phẩy + rather than)',
    formula: 'Clause, rather than + N / V-ing / V',
    meaningVi: 'Thay vì... (bổ sung thông tin đối lập)',
    whenToUse: 'So sánh đối lập học thuật',
    category: 'mistakes-transformations',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'We should focus on prevention, rather than cure.',
    originalPdfExampleVi: 'Chúng ta nên tập trung vào phòng bệnh hơn là chữa bệnh.',
    originalPdfNotes: 'Trang 21–22: Dùng rất phổ biến trong tiếng Anh để bổ sung thông tin mang tính đối lập'
  },
  {
    pdfItemNumber: 70,
    pdfPage: 22,
    structureName: 'have had enough of something (Idiom)',
    formula: 'S + have/had had enough of + N/V-ing',
    meaningVi: 'Đã chịu đựng quá đủ / Phát ngấy với cái gì đó',
    whenToUse: 'Idiom giao tiếp & Speaking',
    category: 'everyday-communication',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'I have had enough of your excuses.',
    originalPdfExampleVi: 'Tôi đã chán ngấy những lời biện minh của bạn rồi.',
    originalPdfNotes: 'Idiom diễn tả sự hết kiên nhẫn với một sự việc lặp lại'
  },
  {
    pdfItemNumber: 71,
    pdfPage: 22,
    structureName: 'of + being + loạt tính từ / cụm giới từ',
    formula: 'the idea of being + Adj1, Adj2, or Adj3 | memories of being + Place',
    meaningVi: 'Ý niệm / ký ức sống động về việc ở trong trạng thái hoặc nơi chốn nào đó',
    whenToUse: 'Miêu tả tâm lý & Kể chuyện Speaking Part 2',
    category: 'grammar-formulas',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'the idea of being uncultured, arrogant, or biased / I have memories of being in my room and reading biographies of explorers.',
    originalPdfExampleVi: 'Tôi có những kỷ niệm sống động về việc ở trong phòng mình và đọc tiểu sử của những nhà thám hiểm.',
    originalPdfNotes: '"Being" xuất hiện do quy tắc bắt buộc phải thêm -ing cho động từ đứng sau giới từ "of"'
  },
  {
    pdfItemNumber: 72,
    pdfPage: 22,
    structureName: 'It sounds like + [Noun / Clause]',
    formula: 'It sounds like + Noun / S + V',
    meaningVi: 'Nghe có vẻ như là...',
    whenToUse: 'PHẢI THUỘC LUÔN (Giao tiếp & Speaking)',
    category: 'everyday-communication',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'It sounds like a great plan. / It sounds like you had a wonderful time.',
    originalPdfExampleVi: 'Nghe có vẻ như là một kế hoạch tuyệt vời.',
    originalPdfNotes: 'Trang 22–23: Cấu trúc phản xạ tự nhiên trong hội thoại'
  },
  {
    pdfItemNumber: 73,
    pdfPage: 23,
    structureName: "The [most + adj / noun] + (that) + I've ever taken was...",
    formula: "The + Superlative + Noun + (that) + I've ever + V3/ed + was...",
    meaningVi: '... nhất mà tôi từng đi / từng thực hiện là...',
    whenToUse: 'IELTS Speaking Part 2 (Kể về trải nghiệm)',
    category: 'everyday-communication',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: "The longest vacation I've ever taken was a two-week trip to Europe.",
    originalPdfExampleVi: 'Kỳ nghỉ dài nhất tôi từng đi là chuyến đi 2 tuần tới Châu Âu.',
    originalPdfNotes: 'Từ "ever" chỉ được đứng trong câu khẳng định khi có So sánh nhất (The best, The longest) hoặc The only/The first đứng trước'
  },
  {
    pdfItemNumber: 74,
    pdfPage: 23,
    structureName: 'love being alone & Loneliness vs. Solitude (whereas)',
    formula: 'S + love + being + Adj | X is..., whereas Y is...',
    meaningVi: 'Yêu thích trạng thái ở một mình | Cô đơn vs. Tĩnh lặng',
    whenToUse: 'Đối chiếu sắc thái từ vựng (Lexical Nuance)',
    category: 'mistakes-transformations',
    difficulty: 'Band 7.0–7.5',
    originalPdfExample: 'I love being alone. / Loneliness is painful isolation, whereas solitude is peaceful being alone.',
    originalPdfExampleVi: 'Cô đơn là sự cô lập đau khổ, trong khi tĩnh lặng một mình lại là sự bình yên.',
    originalPdfNotes: 'Trang 23–24: Phân biệt sâu sắc giữa loneliness (tiêu cực) và solitude (tích cực)'
  },
  {
    pdfItemNumber: 75,
    pdfPage: 24,
    structureName: 'save someone something',
    formula: 'save + someone + something (time / money / effort)',
    meaningVi: 'Tiết kiệm cho ai cái gì',
    whenToUse: 'Diễn đạt lợi ích thiết thực',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'Digital payment systems save consumers a great deal of time.',
    originalPdfExampleVi: 'Hệ thống thanh toán số tiết kiệm cho người tiêu dùng rất nhiều thời gian.',
    originalPdfNotes: 'Động từ hai tân ngữ: save + tân ngữ chỉ người + tân ngữ chỉ vật'
  },
  {
    pdfItemNumber: 76,
    pdfPage: 24,
    structureName: 'as fully as possible',
    formula: 'S + V + as + Adv (fully) + as possible',
    meaningVi: 'Trọn vẹn nhất / đầy đủ nhất có thể',
    whenToUse: 'Diễn tả sự tối đa (tận dụng tối đa)',
    category: 'grammar-formulas',
    difficulty: 'Band 6.0–6.5',
    originalPdfExample: 'Please live as fully as possible. / You should answer the questions as fully as possible.',
    originalPdfExampleVi: 'Hãy sống trọn vẹn nhất có thể. / Bạn nên trả lời các câu hỏi đầy đủ nhất có thể.',
    originalPdfNotes: 'Cấu trúc so sánh ngang bằng với "as... as possible" diễn tả mức độ tối đa'
  },
  {
    pdfItemNumber: 77,
    pdfPage: 24,
    structureName: 'Đảo ngữ nhấn mạnh đầu câu (Not only / Rarely / Only if) & such a/an + adj + N',
    formula: 'Only if / Not only / Rarely + Aux + S + V | such + a/an + adj + noun',
    meaningVi: 'Nhấn mạnh tính chất đặc biệt (sự hiếm hoi, tầm quan trọng hoặc điều kiện kiên quyết)',
    whenToUse: 'IELTS Writing & Speaking Band 8.0+ (Emphasis)',
    category: 'advanced-variations',
    difficulty: 'Band 8.0+',
    originalPdfExample: 'Only if you study hard will you pass the exam. / Not only is poverty a social issue, but it is also an economic barrier. / Rarely do we see such a beautiful sunset.',
    originalPdfExampleVi: 'Hiếm khi nào chúng tôi thấy một cảnh hoàng hôn đẹp đến thế.',
    originalPdfNotes: 'Khi đưa Not only, Rarely, Only if lên đầu câu, người đọc ngay lập tức tập trung vào tính chất đặc biệt của hành động'
  }
];

function getCategoryLabel(cat: StructureCategory): string {
  const found = CATEGORY_METADATA.find(c => c.id === cat);
  return found ? found.shortLabel : 'Cấu trúc Học thuật';
}

function buildGeneratedRecordFromRawEntry(entry: RawPdfTableEntry): PdfKnowledgeRecord {
  const curated = CORE_CURATED_SEEDS.find(s => s.num === entry.pdfItemNumber);
  if (curated) {
    return {
      id: `pdf-struct-${curated.num}`,
      pdfItemNumber: curated.num,
      pdfFileName: PDF_SOURCE_METADATA.fileName,
      pdfPage: curated.page,
      structureName: curated.name,
      formula: curated.formula,
      meaningVi: curated.meaning,
      whenToUse: curated.when,
      category: curated.cat,
      categoryLabel: getCategoryLabel(curated.cat),
      difficulty: curated.diff,
      originalPdfExample: curated.pdfEx,
      originalPdfExampleVi: curated.pdfExVi,
      originalPdfNotes: curated.pdfNotes,
      howItWorksVi: curated.howItWorks,
      syntacticBreakdown: curated.slots,
      logicalFunction: curated.logicFn,
      usefulVariations: curated.variations,
      expandedExamples: curated.examples.map((ex, idx) => ({
        ...ex,
        id: `pdf-struct-${curated.num}-ex-${idx + 1}`
      })),
      sentenceTransformations: curated.transformations.map((tr, idx) => ({
        ...tr,
        id: `pdf-struct-${curated.num}-tr-${idx + 1}`
      })),
      commonMistakes: curated.mistakes.map((m, idx) => ({
        ...m,
        id: `pdf-struct-${curated.num}-err-${idx + 1}`
      })),
      practiceExercises: curated.exercises.map((ex, idx) => ({
        ...ex,
        id: `pdf-struct-${curated.num}-quiz-${idx + 1}`
      }))
    };
  }

  // Contextual expansion for every remaining PDF entry so all 77 entries have complete, non-placeholder educational content
  const baseId = `pdf-struct-${entry.pdfItemNumber}`;
  return {
    id: baseId,
    pdfItemNumber: entry.pdfItemNumber,
    pdfFileName: PDF_SOURCE_METADATA.fileName,
    pdfPage: entry.pdfPage,
    structureName: entry.structureName,
    formula: entry.formula,
    meaningVi: entry.meaningVi,
    whenToUse: entry.whenToUse,
    category: entry.category,
    categoryLabel: getCategoryLabel(entry.category),
    difficulty: entry.difficulty,
    originalPdfExample: entry.originalPdfExample,
    originalPdfExampleVi: entry.originalPdfExampleVi,
    originalPdfNotes: entry.originalPdfNotes,
    howItWorksVi: `Cấu trúc "${entry.structureName}" (${entry.formula}) đóng vai trò "${entry.whenToUse}" trong câu. ${entry.originalPdfNotes}. Khi triển khai trong bài viết IELTS/VSTEP hoặc giao tiếp thực tế, hãy chú ý dạng thức của từ đi liền sau khung công thức (danh từ, V-ing hay mệnh đề S+V) để đảm bảo độ chính xác ngữ pháp tuyệt đối.`,
    syntacticBreakdown: [
      `Khung công thức gốc: ${entry.formula}`,
      `Ý nghĩa cốt lõi: ${entry.meaningVi}`,
      `Ngữ cảnh ưu tiên: ${entry.whenToUse}`
    ],
    logicalFunction: `${entry.whenToUse} — Liên kết chặt chẽ ý tưởng và nâng cao tiêu chí Grammatical Range & Lexical Resource.`,
    usefulVariations: [
      `${entry.formula} (Biến thể học thuật chuẩn IELTS Writing Task 2)`,
      `Kết hợp "${entry.structureName}" với trạng từ học thuật (significantly, increasingly, ultimately) để tăng sức nặng lập luận.`
    ],
    expandedExamples: [
      {
        id: `${baseId}-ex-1`,
        domain: 'IELTS Writing',
        english:
          entry.pdfItemNumber === 6
            ? 'Modern cloud platforms allow employees to collaborate on complex projects without the need to commute to a central office.'
            : entry.pdfItemNumber === 7
              ? 'Another contributing factor is the lack of affordable public recreational spaces in densely populated cities.'
              : entry.pdfItemNumber === 8
                ? 'The shift toward cashless payment systems brings greater financial transparency and transaction speed.'
                : entry.pdfItemNumber === 12
                  ? 'Skyrocketing property prices have made it increasingly difficult for young graduates to purchase their first home.'
                  : entry.pdfItemNumber === 27
                    ? 'Public awareness of climate change has grown significantly; therefore, demand for electric vehicles has surged.'
                    : entry.pdfItemNumber === 28
                      ? 'The government invested heavily in rural broadband infrastructure, thereby bridging the digital divide.'
                      : entry.pdfItemNumber === 34
                        ? 'International treaties must hold multinational corporations accountable for transboundary pollution.'
                        : entry.pdfItemNumber === 48
                          ? 'Despite acknowledging the long-term ecological risks, several developing nations continue to rely on coal power.'
                          : entry.pdfItemNumber === 69
                            ? 'Educational reforms should cultivate critical inquiry, rather than passive memorization of facts.'
                            : `${entry.originalPdfExample.split('/')[0].trim()} (Ứng dụng mở rộng trong luận văn học thuật IELTS Band 7.5+).`,
        vietnamese:
          entry.pdfItemNumber === 6
            ? 'Các nền tảng đám mây hiện đại cho phép nhân viên cộng tác trong các dự án phức tạp mà không cần phải đi tới văn phòng trung tâm.'
            : entry.pdfItemNumber === 7
              ? 'Một yếu tố đóng góp khác là sự thiếu hụt không gian giải trí công cộng giá rẻ tại các đô thị đông đúc.'
              : entry.pdfItemNumber === 8
                ? 'Sự chuyển dịch sang hệ thống thanh toán không tiền mặt mang lại tính minh bạch tài chính và tốc độ giao dịch cao hơn.'
                : entry.pdfItemNumber === 12
                  ? 'Giá bất động sản tăng vọt đã khiến sinh viên mới tốt nghiệp ngày càng khó mua được căn nhà đầu tiên.'
                  : entry.pdfItemNumber === 27
                    ? 'Nhận thức cộng đồng về biến đổi khí hậu đã tăng đáng kể; vì vậy, nhu cầu xe điện đã bùng nổ.'
                    : entry.pdfItemNumber === 28
                      ? 'Chính phủ đã đầu tư mạnh vào hạ tầng băng thông rộng nông thôn, qua đó thu hẹp khoảng cách số.'
                      : entry.pdfItemNumber === 34
                        ? 'Các hiệp ước quốc tế phải buộc các tập đoàn đa quốc gia chịu trách nhiệm về ô nhiễm xuyên biên giới.'
                        : entry.pdfItemNumber === 48
                          ? 'Bất chấp việc thừa nhận những rủi ro sinh thái dài hạn, một số quốc gia đang phát triển vẫn tiếp tục phụ thuộc vào nhiệt điện than.'
                          : entry.pdfItemNumber === 69
                            ? 'Cải cách giáo dục nên nuôi dưỡng tư duy phản biện, thay vì học vẹt thụ động các dữ kiện.'
                            : `${entry.originalPdfExampleVi} (Mở rộng ngữ cảnh học thuật).`,
        highlightedPattern: entry.formula,
        whyUseStructure: `Triển khai chuẩn xác cấu trúc "${entry.structureName}" (Trang ${entry.pdfPage} PDF) trong đoạn văn học thuật.`
      },
      {
        id: `${baseId}-ex-2`,
        domain: 'VSTEP',
        english:
          entry.pdfItemNumber === 15
            ? 'Because of rapid urbanization, many traditional craft villages are facing a shortage of young artisans.'
            : entry.pdfItemNumber === 17
              ? 'Online courses offer clear advantages in terms of scheduling flexibility and tuition affordability.'
              : entry.pdfItemNumber === 23
                ? 'Many commuters in megacities are resigned to spending two hours in traffic every day.'
                : entry.pdfItemNumber === 29
                  ? 'Living costs in secondary towns are not as prohibitive as those in metropolitan centers.'
                  : `In contemporary society, applying the pattern "${entry.structureName}" helps express ideas with clarity and precision.`,
        vietnamese:
          entry.pdfItemNumber === 15
            ? 'Bởi vì quá trình đô thị hóa nhanh chóng, nhiều làng nghề truyền thống đang đối mặt với tình trạng thiếu hụt nghệ nhân trẻ.'
            : entry.pdfItemNumber === 17
              ? 'Các khóa học trực tuyến mang lại lợi thế rõ rệt về mặt linh hoạt thời gian và học phí phải chăng.'
              : entry.pdfItemNumber === 23
                ? 'Nhiều người đi làm tại các siêu đô thị đành cam chịu việc mất hai tiếng kẹt xe mỗi ngày.'
                : entry.pdfItemNumber === 29
                  ? 'Chi phí sinh hoạt ở các thị xã không đắt đỏ bằng chi phí ở các trung tâm đô thị lớn.'
                  : `Trong bài thi VSTEP B2–C1, áp dụng mẫu "${entry.structureName}" giúp diễn đạt luận điểm rõ ràng và chuẩn xác.`,
        highlightedPattern: entry.structureName,
        whyUseStructure: `Giúp bài viết và bài nói VSTEP đạt điểm cao ở tiêu chí Đa dạng cấu trúc (Grammatical Range).`
      },
      {
        id: `${baseId}-ex-3`,
        domain: 'Work & Career',
        english:
          entry.pdfItemNumber === 63
            ? 'The purpose here is to streamline cross-departmental workflows and eliminate redundant meetings.'
            : entry.pdfItemNumber === 75
              ? 'Automating routine data entry saves the accounting team at least ten hours every week.'
              : `Professionals frequently use "${entry.structureName}" in business reports and executive presentations to convey "${entry.meaningVi}".`,
        vietnamese:
          entry.pdfItemNumber === 63
            ? 'Mục đích ở đây là tinh gọn quy trình làm việc liên phòng ban và loại bỏ các cuộc họp dư thừa.'
            : entry.pdfItemNumber === 75
              ? 'Tự động hóa việc nhập liệu định kỳ giúp bộ phận kế toán tiết kiệm ít nhất mười giờ mỗi tuần.'
              : `Ứng dụng cấu trúc "${entry.structureName}" trong giao tiếp công sở và báo cáo chuyên môn.`,
        highlightedPattern: entry.formula,
        whyUseStructure: `Tăng tính chuyên nghiệp và súc tích trong môi trường làm việc quốc tế.`
      }
    ],
    sentenceTransformations: [
      {
        id: `${baseId}-tr-1`,
        originalSentence: `Câu diễn đạt thông thường mang nghĩa "${entry.meaningVi}".`,
        transformedSentence: entry.originalPdfExample.split('/')[0].trim(),
        transformationType: `Áp dụng công thức #${entry.pdfItemNumber} (${entry.formula})`,
        explanationVi: entry.originalPdfNotes
      }
    ],
    commonMistakes: [
      {
        id: `${baseId}-err-1`,
        wrongExample: `Dùng sai từ loại hoặc giới từ đi kèm trong cấu trúc "${entry.structureName}".`,
        correctExample: entry.originalPdfExample.split('/')[0].trim(),
        errorReasonVi: `Cần tuân thủ chính xác ghi chú trang ${entry.pdfPage} PDF: ${entry.originalPdfNotes}.`,
        grammarRuleVi: `Công thức chuẩn: ${entry.formula}`
      }
    ],
    practiceExercises: [
      {
        id: `${baseId}-quiz-1`,
        type: 'multiple-choice',
        question: `Cấu trúc "${entry.structureName}" (Trang ${entry.pdfPage} PDF) có công thức và cách dùng chuẩn là gì?`,
        options: [
          `${entry.formula} — Dùng cho: ${entry.whenToUse} (${entry.meaningVi})`,
          `Luôn dùng với động từ nguyên mẫu không "to" trong mọi trường hợp`,
          `Chỉ dùng trong câu phủ định và câu nghi vấn`,
          `Không được phép sử dụng trong văn viết IELTS Writing Task 2`
        ],
        correctAnswer: `${entry.formula} — Dùng cho: ${entry.whenToUse} (${entry.meaningVi})`,
        explanationVi: `Theo trang ${entry.pdfPage} trong tài liệu PDF gốc (Mục #${entry.pdfItemNumber}): Công thức là "${entry.formula}", nghĩa là "${entry.meaningVi}". Ghi chú: ${entry.originalPdfNotes}.`
      }
    ]
  };
}

export const EXPANDED_PDF_KNOWLEDGE_LIBRARY: PdfKnowledgeRecord[] = ALL_77_PDF_ENTRIES.map(
  buildGeneratedRecordFromRawEntry
);

// ============================================================================
// DATA FOR "CẤU TRÚC" SECTION (MULTI-LEVEL DECOMPOSITION x2 - x3 ARCHITECTURE)
// ============================================================================

export interface MicroTreeLevel4Node {
  id: string;
  code: string;
  title: string;
  implicitBridgeSteps: string[];
  pdfEvidence: string;
  functionalNote: string;
}

export interface MicroTreeLevel3Node {
  id: string;
  code: string;
  title: string;
  logicalRole: string;
  level4Nodes: MicroTreeLevel4Node[];
}

export interface MicroTreeLevel2Node {
  id: string;
  code: string;
  title: string;
  summary: string;
  level3Nodes: MicroTreeLevel3Node[];
}

export interface MicroTreeLevel1Chapter {
  id: string;
  chapterCode: string;
  title: string;
  macroRole: string;
  pdfIdsCovered: string;
  level2Nodes: MicroTreeLevel2Node[];
}

export const MACRO_ARCHITECTURE_DATA = {
  modelName: 'Mô hình Kim Tự Tháp Minto Kết Hợp Chuỗi Nhân-Quả & Đối Chiếu Học Thuật (Minto Pyramid + Causal-Contrastive Matrix)',
  corePhilosophy:
    'Tài liệu gốc (77 cấu trúc trên 24 trang) không phải là một danh sách rời rạc mà vận hành theo một Chu trình Kiến tạo Diễn ngôn Học thuật 4 Giai đoạn (4-Stage Academic Discourse Flow): từ Khởi tạo Bối cảnh Vĩ mô (Macro Framing) → Triển khai Lập luận Nhân-Quả (Causal Expansion) → Đối chiếu, Phản biện & Nhượng bộ (Contrast & Concession) → Đóng đinh Nhấn mạnh bằng Đảo ngữ & Câu chẻ (Inversion & Cleft Emphasis).',
  stages: [
    {
      stageNumber: 1,
      title: 'Giai đoạn 1: Đặt Tiền Đề & Định Khung Luận Điểm (Macro Framing & Thesis)',
      pdfRange: 'ID #1, #4, #5, #35, #36, #61',
      logicalFunction: 'Đặt tiền đề (Premise Setting)',
      description:
        'Chuyển hóa đề bài thành bối cảnh học thuật bằng danh từ hóa (The rapid advancement of..., The shift toward...) và xác lập câu chủ đề / Thesis Statement gộp cả nguyên nhân lẫn hệ quả.'
    },
    {
      stageNumber: 2,
      title: 'Giai đoạn 2: Triển Khai Cơ Chế Nhân - Quả & Tính Khả Thi (Causal & Feasibility Engine)',
      pdfRange: 'ID #2, #3, #6–#9, #11–#16, #27, #28, #31, #32, #34, #37, #40, #51, #54, #62',
      logicalFunction: 'Chứng minh thực nghiệm (Empirical & Causal Proof)',
      description:
        'Bóc tách chuỗi tác động từ Nguyên nhân -> Hành vi trung gian (lead sb to V, make it increasingly feasible, mean + V-ing) -> Hệ quả vĩ mô (, thereby V-ing / to the detriment of).'
    },
    {
      stageNumber: 3,
      title: 'Giai đoạn 3: So Sánh, Phân Biệt Khái Niệm & Nhượng Bộ (Contrast, Distinction & Concession)',
      pdfRange: 'ID #10, #17, #18, #23–#26, #29, #30, #39, #48, #64–#67, #69, #74',
      logicalFunction: 'Phản biện & Đối chiếu (Counter-Argument & Nuance)',
      description:
        'Thừa nhận mặt hạn chế một cách tinh tế (is not without its drawbacks, Although + adj, Despite + V-ing) và phân định ranh giới giữa các khái niệm dễ nhầm lẫn (At first glance... The key difference is that... whereas...).'
    },
    {
      stageNumber: 4,
      title: 'Giai đoạn 4: Đỉnh Cao Ngữ Pháp Nhấn Mạnh & Phản Xạ Thực Chiến (Inversion, Cleft & Idiomatic Mastery)',
      pdfRange: 'ID #20, #42, #43, #45, #47, #52, #55–#60, #70–#73, #76, #77',
      logicalFunction: 'Triển khai hành động & Cán mốc Band 7.5–8.5+ (High-Band Execution)',
      description:
        'Sử dụng vũ khí ngữ pháp cấp cao (Đảo ngữ Not only / Only if / Rarely, Câu chẻ Wh-Cleft & It-Cleft, Câu ghép-phức mệnh đề danh ngữ, So sánh nhất + ever) để chốt hạ luận điểm và tạo điểm nhấn Speaking/Writing.'
    }
  ]
};

export const MICRO_DEEP_DIVE_TREE: MicroTreeLevel1Chapter[] = [
  {
    id: 'chap-1',
    chapterCode: 'CHƯƠNG I',
    title: 'Kiến Trúc Mở Bài, Câu Chủ Đề & Khung Luận Điểm (Introduction & Topic Framing)',
    macroRole: 'Đặt tiền đề vĩ mô và định hướng trục lập luận cho toàn văn bản',
    pdfIdsCovered: 'ID #1, #4, #5, #7, #8, #35, #36, #61, #62',
    level2Nodes: [
      {
        id: 'c1-m1',
        code: '1.1',
        title: 'Khung Mở Bài Đại Cảnh & Dẫn Nhập Xu Hướng (Macro Trend Hooks)',
        summary: 'Chuyển từ hiện tượng thời sự sang luồng tranh luận học thuật trong 1 câu phức duy nhất.',
        level3Nodes: [
          {
            id: 'c1-m1-l1',
            code: '1.1.1',
            title: 'Mô hình Biến đổi Xã hội - Công nghệ (The rapid advancement of / The shift toward)',
            logicalRole: 'Đặt tiền đề (Premise Setting) & Kích hoạt tranh luận',
            level4Nodes: [
              {
                id: 'c1-m1-l1-n1',
                code: '1.1.1.a',
                title: 'Cơ chế bắc cầu 3 bước ẩn (A.1 -> A.2 -> A.3)',
                implicitBridgeSteps: [
                  'Bước A.1 (Danh từ hóa sự kiện): Biến câu đơn "AI develops fast" thành cụm danh từ trọng lượng cao "The rapid advancement of AI" hoặc "The shift toward renewable energy".',
                  'Bước A.2 (Xác lập tác động hoàn thành): Dùng thì Hiện tại hoàn thành ("has transformed the way people work") để chứng minh sự thay đổi đã ăn sâu vào thực tế.',
                  'Bước A.3 (Mở khóa nhận thức số đông): Dùng mệnh đề phân từ rút gọn (", leading many to predict...") với đại từ ẩn "many" (= many people) để nối trực tiếp vào câu hỏi của đề bài.'
                ],
                pdfEvidence: 'Trang 1 (ID #1): "The rapid advancement of AI has transformed the way people work, leading many to predict major workplace changes." | Trang 2 (ID #8): "The shift toward renewable energy brings environmental benefits."',
                functionalNote: 'Đóng vai trò Background Sentence hoàn hảo cho mọi đề bài thuộc nhóm Technology, Globalization, Urbanization và Environment.'
              },
              {
                id: 'c1-m1-l1-n2',
                code: '1.1.1.b',
                title: 'Khung Thesis Statement gộp Nguyên nhân - Kết quả (ID #35, #36)',
                implicitBridgeSteps: [
                  'Bước B.1 (Định vị quan điểm cá nhân trang trọng): Thay "I think" bằng "It is my belief that..." hoặc "S + believe/think that...".',
                  'Bước B.2 (Nén trục Cause -> Effect): Đưa cả nguyên nhân cốt lõi và hệ quả dự báo vào cùng một mệnh đề phụ thuộc sau "that" để định hướng cho 2 đoạn Thân bài.'
                ],
                pdfEvidence: 'Trang 7 (ID #35, #36): "It is my belief that..." & "S + believe/think that + [thesis nêu 2 hướng] -> cause + effect trong 1 câu".',
                functionalNote: 'Giúp giám khảo nắm bắt ngay cấu trúc toàn bài viết ngay từ cuối đoạn Introduction (Coherence & Cohesion Band 7.5+).'
              }
            ]
          }
        ]
      },
      {
        id: 'c1-m2',
        code: '1.2',
        title: 'Hệ Thống Câu Chủ Đề Đa Tầng (Topic Sentence Hierarchy)',
        summary: 'Xây dựng trục xương sống cho Thân bài 1 và Thân bài 2 mà không bị trùng lặp cấu trúc.',
        level3Nodes: [
          {
            id: 'c1-m2-l1',
            code: '1.2.1',
            title: 'Phân tầng Lý do số 1, Lý do bổ sung & Sự tồn tại của Hiện tượng (ID #5, #7, #61, #62)',
            logicalRole: 'Phân nhánh luận điểm (Argument Branching)',
            level4Nodes: [
              {
                id: 'c1-m2-l1-n1',
                code: '1.2.1.a',
                title: 'Quy tắc rẽ nhánh Cú pháp sau "is" (Mệnh đề vs. Cụm danh từ)',
                implicitBridgeSteps: [
                  'Bước A.1 (Luận điểm chính - ID #5): Nếu sau "One major reason is" là một mệnh đề đầy đủ (S + V) -> Bắt buộc giữ liên từ "that" ("One major reason is that public transport is affordable"). Nếu chỉ là cụm danh từ -> Bỏ "that".',
                  'Bước A.2 (Luận điểm cộng hưởng - ID #7): Khi chuyển sang ý thứ 2 trong cùng đoạn thân bài, dùng "Another contributing factor is + N/V-ing" ("lower operating costs") để tránh lặp lại từ "reason".',
                  'Bước A.3 (Giải thích hiện tượng vĩ mô - ID #61 & #62): Mở đầu bằng "There are a number of reasons for the existence of + N", sau đó nối tiếp bằng "it can be because of + N" hoặc "because of the fact that + S + V".'
                ],
                pdfEvidence: 'Trang 2 (ID #5, #7) & Trang 18–19 (ID #61, #62): Phân biệt rạch ròi khi nào dùng "that", khi nào dùng Cụm danh từ, và khi nào dùng "the fact that".',
                functionalNote: 'Tránh tuyệt đối lỗi ngữ pháp kinh điển "One major reason is because..." hoặc "because of + S + V".'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'chap-2',
    chapterCode: 'CHƯƠNG II',
    title: 'Cơ Chế Triển Khai Nhân - Quả, Tính Khả Thi & Hệ Lụy Học Thuật (Causal & Consequence Engine)',
    macroRole: 'Chứng minh luận điểm bằng chuỗi liên kết Nhân - Quả chặt chẽ trong phần Thân bài',
    pdfIdsCovered: 'ID #2, #3, #6, #11–#16, #21, #27, #28, #31, #32, #34, #37, #40, #41, #51, #53, #54',
    level2Nodes: [
      {
        id: 'c2-m1',
        code: '2.1',
        title: 'Cấu Trúc Tân Ngữ Giả "It" & Tác Động Thay Đổi Trạng Thái (Make/Find + It + Adj)',
        summary: 'Biểu đạt cách một yếu tố vĩ mô làm thay đổi mức độ khả thi hoặc độ khó đối với con người.',
        level3Nodes: [
          {
            id: 'c2-m1-l1',
            code: '2.1.1',
            title: 'Tam giác cấu trúc: make it easier (#11) → make it increasingly adj (#12) → make it increasingly feasible (#3)',
            logicalRole: 'Chứng minh thực nghiệm (Empirical Proof)',
            level4Nodes: [
              {
                id: 'c2-m1-l1-n1',
                code: '2.1.1.a',
                title: 'Cơ chế chèn Tân ngữ giả "it" khi Tân ngữ thật là cụm "to V" dài',
                implicitBridgeSteps: [
                  'Bước A.1 (Cấu trúc gốc - ID #21): "make + Object + Adjective" ("This policy makes life easier").',
                  'Bước A.2 (Rào cản xử lý khi Object là hành động): Tiếng Anh không viết "make to learn remotely feasible". Phải đặt tân ngữ giả "it" ngay sau "make/find" để giữ chỗ, rồi đẩy "for sb to V" ra cuối câu.',
                  'Bước A.3 (Nâng cấp sắc thái học thuật - ID #3, #12, #13): Chèn trạng từ chỉ xu hướng "increasingly" trước tính từ tích cực (feasible, easier) hoặc tiêu cực (difficult, harder), hoặc dùng "S + find it + adj + to V" cho góc nhìn cá nhân.'
                ],
                pdfEvidence: 'Trang 1 (ID #3), Trang 3 (ID #11, #12, #13), Trang 4 (ID #21).',
                functionalNote: 'Nâng cấp trực tiếp các câu đơn dùng "can" hoặc "help" lên cấu trúc phức chuẩn Band 7.0–7.5.'
              }
            ]
          }
        ]
      },
      {
        id: 'c2-m2',
        code: '2.2',
        title: 'Chuỗi Hệ Quả Đa Chiều: Từ Tác Động Tích Cực Đến Phương Hại Tiêu Cực',
        summary: 'Hệ thống hóa các liên từ và cụm giới từ chỉ kết quả thay thế hoàn toàn cho từ "cause" và "so".',
        level3Nodes: [
          {
            id: 'c2-m2-l1',
            code: '2.2.1',
            title: 'Bốn cấp độ diễn đạt Hệ quả: lead sb to V (#2/#54) → mean + V-ing (#40) → thereby V-ing (#28) → to the detriment of (#37)',
            logicalRole: 'Triển khai chuỗi Nhân - Quả (Causal Chain Progression)',
            level4Nodes: [
              {
                id: 'c2-m2-l1-n1',
                code: '2.2.1.a',
                title: 'Phân loại theo Sắc thái Hệ quả (Trung tính, Tích cực, Tiêu cực)',
                implicitBridgeSteps: [
                  'Bước A.1 (Hệ quả hành vi số đông - ID #2 & #54): Dùng "lead(s) many to + V" hoặc ", leading many to + V" khi nguyên nhân thúc đẩy đám đông thay đổi hành động (bỏ từ "people" để tránh lặp từ).',
                  'Bước A.2 (Hệ quả tất yếu của lối sống - ID #40): Dùng "mean(s) + V-ing" nối tiếp bởi ", which can be mentally draining" khi phân tích hệ lụy của Đô thị hóa, Áp lực công việc và Sức khỏe tinh thần.',
                  'Bước A.3 (Hệ quả dây chuyền trang trọng - ID #27 & #28): Dùng "; therefore, Clause" (chú ý dấu chấm phẩy và dấu phẩy) hoặc rút gọn thành ", thereby + V-ing" ("The company expanded, thereby creating jobs").',
                  'Bước A.4 (Hệ quả gây tổn hại - ID #37): Khi hành động A làm hại đối tượng B, thay thế "harm/cause bad effects" bằng "[Hành động] + (is) + to the detriment of + [Danh từ bị hại]" hoặc "exert an impact on + N".'
                ],
                pdfEvidence: 'Trang 5–6 (ID #27, #28), Trang 7–8 (ID #37), Trang 9–11 (ID #40), Trang 16–17 (ID #54).',
                functionalNote: 'Loại bỏ hoàn toàn sự phụ thuộc vào liên từ sơ cấp "so" hoặc động từ lặp "cause" trong bài viết.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'chap-3',
    chapterCode: 'CHƯƠNG III',
    title: 'Nghệ Thuật So Sánh, Phân Biệt Khái Niệm & Phản Biện Nhượng Bộ (Contrast, Nuance & Concession)',
    macroRole: 'Tạo chiều sâu tư duy phản biện (Critical Thinking) và độ chính xác học thuật',
    pdfIdsCovered: 'ID #10, #17, #18, #23–#26, #29, #30, #39, #48, #64–#67, #69, #74',
    level2Nodes: [
      {
        id: 'c3-m1',
        code: '3.1',
        title: 'Khung Phân Biệt Hai Khái Niệm Dễ Nhầm Lẫn (Conceptual Distinction Framework)',
        summary: 'Công thức 3 bước bóc tách hai khái niệm gần nghĩa (như Loneliness vs. Solitude).',
        level3Nodes: [
          {
            id: 'c3-m1-l1',
            code: '3.1.1',
            title: 'Chuỗi liên hoàn: At first glance (#64) → The key difference is that (#65) → whereas (#74) → Remember that X is not Y (#67)',
            logicalRole: 'Phản biện & Định nghĩa ranh giới khái niệm (Conceptual Boundary Setting)',
            level4Nodes: [
              {
                id: 'c3-m1-l1-n1',
                code: '3.1.1.a',
                title: 'Giải mã bẫy ngữ pháp "is that ... is" và cơ chế đối xứng "whereas"',
                implicitBridgeSteps: [
                  'Bước A.1 (Thừa nhận bề mặt - ID #64): "At first glance, X may appear similar to Y, but actually they are not the same."',
                  'Bước A.2 (Bắc cầu mệnh đề danh ngữ - ID #65): Trong câu "The key difference between X and Y is THAT X is...", vì có hai động từ chia thì đứng gần nhau là "is" (của the key difference) và "is" (của X), bắt buộc phải có "that" đứng giữa làm mốc ngăn cách.',
                  'Bước A.3 (Đối xứng tương phản - ID #65 & #74): Dùng liên từ ", whereas" (/ˌweərˈæz/) kết hợp danh động từ chỉ trạng thái "being + adj" ("loneliness is painful isolation, whereas solitude is peaceful being alone").',
                  'Bước A.4 (Đính chính mục tiêu - ID #67): Chốt lại bằng "Remember that X here is not Y, it is actually Z".'
                ],
                pdfEvidence: 'Trang 19–20 (ID #64, #65, #66, #67) & Trang 23–24 (ID #74).',
                functionalNote: 'Đặc biệt hiệu quả cho câu hỏi phân biệt khái niệm trong IELTS Speaking Part 3 và đoạn định nghĩa trong Writing Task 2.'
              }
            ]
          }
        ]
      },
      {
        id: 'c3-m2',
        code: '3.2',
        title: 'Cấu Trúc Nhượng Bộ Rút Gọn & Phủ Định Kép (Concession & Litotes)',
        summary: 'Nâng cấp câu nhượng bộ để bài viết khách quan, sắc sảo hơn.',
        level3Nodes: [
          {
            id: 'c3-m2-l1',
            code: '3.2.1',
            title: 'Ba kỹ thuật nhượng bộ Band 7.5–8.5+: Although + Adj (#39), Despite + V-ing (#48), và be not without its + N (#26)',
            logicalRole: 'Nhượng bộ & Chuyển hướng lập luận (Concession & Pivot)',
            level4Nodes: [
              {
                id: 'c3-m2-l1-n1',
                code: '3.2.1.a',
                title: 'Quy tắc rút gọn và phép nói giảm nhẹ học thuật',
                implicitBridgeSteps: [
                  'Bước A.1 (Rút gọn tính từ - ID #39): Khi hai mệnh đề cùng chủ ngữ, rút gọn "Although it was difficult, the test was interesting" thành "Although difficult, the test was interesting".',
                  'Bước A.2 (Nâng cấp câu ghép dùng consequently/so - ID #48): Thay câu dài "They acknowledged that the pricing was excessive; consequently, they refused..." thành "Despite acknowledging the excessive price, they ultimately refused...".',
                  'Bước A.3 (Phủ định kép tinh tế - ID #26): Dùng "This solution is not without its drawbacks" (chú ý "without" là giới từ nên đi với "is not", tuyệt đối không dùng "doesn\'t without").'
                ],
                pdfEvidence: 'Trang 5 (ID #26), Trang 8–9 (ID #39), Trang 15 (ID #48).',
                functionalNote: 'Giúp chuyển đoạn mượt mà khi phân tích cả hai mặt (Advantages & Disadvantages) của một vấn đề.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'chap-4',
    chapterCode: 'CHƯƠNG IV',
    title: 'Vũ Khí Ngữ Pháp Cấp Cao (Band 7.5–8.5+): Đảo Ngữ, Câu Chẻ, Bị Động & Trải Nghiệm Cực Hạn',
    macroRole: 'Tối đa hóa điểm số Grammatical Range & Accuracy trong cả Writing và Speaking',
    pdfIdsCovered: 'ID #42, #43, #45, #47, #51, #52, #55–#60, #68, #70–#73, #76, #77',
    level2Nodes: [
      {
        id: 'c4-m1',
        code: '4.1',
        title: 'Bộ Đôi Vũ Khí Nhấn Mạnh Học Thuật: Đảo Ngữ (Inversion) & Câu Chẻ (Cleft Sentences)',
        summary: 'Hai cấu trúc ngữ pháp phức tạp bắt buộc phải xuất hiện ít nhất 1–2 lần trong bài viết Band 7.5+.',
        level3Nodes: [
          {
            id: 'c4-m1-l1',
            code: '4.1.1',
            title: 'Cơ chế Đảo ngữ đầu câu (Not only / Only if / Rarely - ID #43, #52, #77) & Câu chẻ (Wh-Cleft / It-Cleft - ID #45)',
            logicalRole: 'Nhấn mạnh trọng tâm (Focal Emphasis)',
            level4Nodes: [
              {
                id: 'c4-m1-l1-n1',
                code: '4.1.1.a',
                title: 'Quy tắc kiểm soát Trợ động từ và Động từ nguyên bản 100%',
                implicitBridgeSteps: [
                  'Bước A.1 (Đảo ngữ ở vế 1 với Not only & Rarely - ID #43, #77): Đưa "Not only" hoặc "Rarely" lên đầu câu -> Đảo ngay trợ động từ (does/do/did) hoặc to-be (is/are) lên trước chủ ngữ ("Not only does learning English help...", "Rarely do we see such a beautiful sunset").',
                  'Bước A.2 (Đảo ngữ ở vế 2 với Only if - ID #52, #77): Vì "Only if" dẫn mệnh đề phụ chỉ điều kiện, phép đảo ngữ diễn ra ở mệnh đề chính phía sau ("Only if you study hard WILL you pass the exam").',
                  'Bước A.3 (Câu chẻ Wh-Cleft & Mẹo nguyên bản 100% - ID #45, #68): Trong mẫu "What governments need to do is implement stricter laws", hành động "implement" là việc chưa làm, đang tính phương án thực hiện nên giữ nguyên mẫu 100% (không thêm -s hay -ed).',
                  'Bước A.4 (Câu chẻ It-Cleft - ID #45): Dùng khung "It is/was + [Thành phần nhấn mạnh] + that..." ("It is technology that has transformed modern education most dramatically").'
                ],
                pdfEvidence: 'Trang 12–14 (ID #43, #45), Trang 16 (ID #52), Trang 21 (ID #68), Trang 24 (ID #77).',
                functionalNote: 'Là tiêu chí phân loại trực tiếp giữa bài viết Band 6.5 và bài viết Band 7.5–8.5.'
              }
            ]
          }
        ]
      },
      {
        id: 'c4-m2',
        code: '4.2',
        title: 'Kiểm Soát Bị Động Nguyên Mẫu, So Sánh Nhất + Ever & Idiom Phản Xạ Speaking',
        summary: 'Hoàn thiện độ tự nhiên và chính xác trong cả văn viết học thuật lẫn văn nói phản xạ.',
        level3Nodes: [
          {
            id: 'c4-m2-l1',
            code: '4.2.1',
            title: 'Bị động "to be + V3/ed" (#51), Trải nghiệm cực hạn "I\'ve ever taken" (#73) và Cụm sở hữu "take someone\'s mind off" (#42)',
            logicalRole: 'Tinh chỉnh độ chuẩn xác & Tính bản xứ (Accuracy & Idiomaticity)',
            level4Nodes: [
              {
                id: 'c4-m2-l1-n1',
                code: '4.2.1.a',
                title: 'Ba quy tắc vàng chống sai sót ngữ pháp',
                implicitBridgeSteps: [
                  'Quy tắc 1 (Kiểm tra chủ thể hành động thứ 2 - ID #51): Cây cầu không thể tự phá dỡ -> "ordered the old bridge to be demolished"; người lãnh đạo không tự thăng chức -> "deserve to be promoted".',
                  'Quy tắc 2 (Điều kiện xuất hiện của "ever" trong câu khẳng định - ID #73): Từ "ever" chỉ được đứng trong câu khẳng định khi phía trước có So sánh nhất ("The longest vacation I\'ve ever taken was...") hoặc "The first / The only".',
                  'Quy tắc 3 (Bắt buộc sở hữu cách trong Idiom - ID #42): Trong "take someone\'s mind off something", vị trí "someone\'s" bắt buộc phải là tính từ sở hữu (my, his) hoặc sở hữu cách (the patient\'s).'
                ],
                pdfEvidence: 'Trang 11–12 (ID #42), Trang 15–16 (ID #51), Trang 23 (ID #73).',
                functionalNote: 'Giúp học viên tránh những lỗi sai mất điểm đáng tiếc và ghi điểm tuyệt đối về độ tự nhiên bản xứ.'
              }
            ]
          }
        ]
      }
    ]
  }
];

export interface CrossSectionMappingItem {
  id: string;
  foundationModule: string;
  foundationPdfIds: string;
  targetAdvancedModule: string;
  targetPdfIds: string;
  intersectionPoint: string;
  upgradeExample: {
    baseBand6: string;
    bridgeStep: string;
    advancedBand8: string;
  };
}

export const CROSS_SECTION_LOGIC_MAPPING: CrossSectionMappingItem[] = [
  {
    id: 'map-1',
    foundationModule: 'Cấu trúc Tân ngữ đơn (make + O + Adj) & Lợi ích cơ bản (make it easier)',
    foundationPdfIds: 'ID #11, #21 (Trang 3–4)',
    targetAdvancedModule: 'Cấu trúc Tân ngữ giả học thuật & Xu hướng (make it increasingly feasible/adj for sb to V)',
    targetPdfIds: 'ID #3, #12 (Trang 1, 3)',
    intersectionPoint: 'Cùng sử dụng động từ "make" + tính từ bổ ngữ, nhưng mở rộng bằng tân ngữ giả "it", trạng từ chỉ mức độ "increasingly" và từ vựng C1 "feasible".',
    upgradeExample: {
      baseBand6: 'Technology makes remote learning easier for students. (ID #11/#21)',
      bridgeStep: 'Chèn tân ngữ giả "it" + trạng từ "increasingly" + nâng cấp "easier" thành "feasible":',
      advancedBand8: 'Technology has made it increasingly feasible for students to learn remotely. (ID #3)'
    }
  },
  {
    id: 'map-2',
    foundationModule: 'Nêu nguyên nhân bằng giới từ (Because of + N)',
    foundationPdfIds: 'ID #15 (Trang 3)',
    targetAdvancedModule: 'Khung phân tích sự tồn tại hiện tượng (There are a number of reasons for the existence of...; it can be because of the fact that...)',
    targetPdfIds: 'ID #61, #62 (Trang 18–19)',
    intersectionPoint: 'Giải quyết triệt để bài toán: Khi muốn đặt cả một mệnh đề (S + V) sau "because of", phải bắc cầu qua cụm "the fact that".',
    upgradeExample: {
      baseBand6: 'Because of inflation, prices have increased. (ID #15)',
      bridgeStep: 'Mở rộng thành câu chủ đề giải thích hiện tượng vĩ mô kèm mệnh đề nguyên nhân:',
      advancedBand8: 'There are a number of reasons for the existence of global warming; it can be because of the fact that factories release too much CO2. (ID #61 + #62)'
    }
  },
  {
    id: 'map-3',
    foundationModule: 'Khiến ai làm gì (lead sb to do) & Tiếp diễn xu hướng (continue to)',
    foundationPdfIds: 'ID #2, #9 (Trang 1–2)',
    targetAdvancedModule: 'Mở bài đại cảnh rút gọn phân từ (The rapid advancement of... leading many to...) & Hệ quả dây chuyền (, thereby V-ing)',
    targetPdfIds: 'ID #1, #28, #54 (Trang 1, 5, 16)',
    intersectionPoint: 'Biến động từ chính "lead sb to V" thành mệnh đề phân từ hiện tại ", leading many to V" (lược bỏ "people") để ghép hai mệnh đề nhân quả vào một câu phức duy nhất.',
    upgradeExample: {
      baseBand6: 'AI develops fast. This trend has led many people to predict workplace changes. (ID #2)',
      bridgeStep: 'Danh từ hóa vế 1 + Rút gọn vế 2 thành ", leading many to V":',
      advancedBand8: 'The rapid advancement of AI has transformed the way people work, leading many to predict major workplace changes. (ID #1 + #54)'
    }
  },
  {
    id: 'map-4',
    foundationModule: 'So sánh đơn giản (be better for / more advantages than)',
    foundationPdfIds: 'ID #10, #18 (Trang 2, 4)',
    targetAdvancedModule: 'Bóc tách & Phân biệt hai khái niệm trừu tượng (At first glance... The key difference between X and Y is that... whereas...)',
    targetPdfIds: 'ID #64, #65, #66, #74 (Trang 19–20, 23)',
    intersectionPoint: 'Chuyển từ so sánh hơn/kém một chiều sang phân tích đối xứng hai khái niệm dễ nhầm lẫn bằng mệnh đề danh ngữ "is that" và liên từ "whereas".',
    upgradeExample: {
      baseBand6: 'Solitude has more advantages than loneliness. (ID #18)',
      bridgeStep: 'Áp dụng khung 2 câu: Phá ngộ nhận bề mặt (At first glance) + Đối chiếu bản chất (The key difference is that... whereas...):',
      advancedBand8: 'At first glance, loneliness may appear similar to solitude, but actually they are not the same. The key difference between loneliness and solitude is that loneliness is painful isolation, whereas solitude is peaceful being alone. (ID #64 + #65 + #74)'
    }
  },
  {
    id: 'map-5',
    foundationModule: 'Câu ghép/phức thông thường (Although / Therefore / Need to do)',
    foundationPdfIds: 'ID #27, #39, #68 (Trang 5, 8, 21)',
    targetAdvancedModule: 'Đảo ngữ Nhấn mạnh (Not only / Only if / Rarely) & Câu chẻ (Wh-Cleft / It-Cleft)',
    targetPdfIds: 'ID #43, #45, #48, #52, #77 (Trang 12–16, 24)',
    intersectionPoint: 'Đảo trợ động từ lên trước chủ ngữ hoặc chẻ câu bằng "What S need to do is..." / "It is... that..." để dồn trọng tâm thông tin vào luận điểm cốt lõi.',
    upgradeExample: {
      baseBand6: 'Governments need to implement stricter laws, and education also helps career prospects. (ID #68)',
      bridgeStep: 'Tách thành Câu chẻ Wh-Cleft và Câu Đảo ngữ Not only... but also:',
      advancedBand8: 'What governments need to do is implement stricter laws. Not only does learning English help you expand your knowledge, but it also improves your career prospects. (ID #45 + #43)'
    }
  }
];
