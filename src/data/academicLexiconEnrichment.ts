import { VocabItem } from './vocabularyData';
import {
  ALL_600_AUTHORITATIVE_SEEDS,
  AuthoritativeCorpusSource,
  CompactAcademicSeed
} from './awlOxford600Corpus';

export type { AuthoritativeCorpusSource };

export type CollocationCategory =
  | 'Verb + Noun'
  | 'Adj + Noun'
  | 'Adv + Adj/Verb'
  | 'Noun + Prep'
  | 'Academic Phrase';

export interface EnrichedCollocationItem {
  category: CollocationCategory;
  phrase: string;
  meaning_vi: string;
}

export interface EnrichedExampleItem {
  context_type:
    | 'Giao tiếp / Speaking thực tế'
    | 'Học thuật / IELTS Writing'
    | 'Ngữ cảnh mở rộng / Collocation in action';
  sentence_en: string;
  translation_vi: string;
  highlight_keyword: string;
}

export interface EnrichedWordEntry {
  id: string;
  word: string;
  pos: string;
  ipa_uk: string;
  ipa_us: string;
  cefr_level: 'B1' | 'B2' | 'C1' | 'C2';
  topic: 'economy' | 'technology' | 'psychology' | 'environment' | 'academic_verbs' | string;
  source_corpus?: AuthoritativeCorpusSource;
  core_meaning_vi: string;
  feynman_explanation: string;
  academic_nuance: {
    register: 'Formal' | 'Neutral' | 'Informal';
    exam_application: string;
    usage_note: string;
  };
  upgrade_from: string;
  current_word: string;
  synonyms_upgrade: {
    basic_b1: string;
    academic_b2_c1: string[];
    mastery_c2: string[];
  };
  word_family: {
    noun?: string[];
    verb?: string[];
    adj?: string[];
    adv?: string[];
  };
  collocations: EnrichedCollocationItem[];
  examples: EnrichedExampleItem[];
}

/**
 * GÓI 30 TỪ VỰNG HỌC THUẬT CHUẨN OXFORD COLLOCATIONS, CAMBRIDGE & LONGMAN (B2 - C2)
 * Phân bổ đều 5 chuyên đề trọng tâm:
 * 1. Economy & Macroeconomics (6 từ)
 * 2. Technology & Digital Era (6 từ)
 * 3. Psychology & Cognitive Science (6 từ)
 * 4. Environment & Sustainability (6 từ)
 * 5. High-Impact Academic Verbs (6 từ)
 */
export const OXFORD_ACADEMIC_30_LEXICON: EnrichedWordEntry[] = [
  // ===========================================================================
  // CHỦ ĐỀ 1: ECONOMY & MACROECONOMICS (6 TỪ)
  // ===========================================================================
  {
    id: 'oxf-econ-01',
    word: 'stagflation',
    pos: 'noun',
    ipa_uk: '/stæɡˈfleɪ.ʃən/',
    ipa_us: '/stæɡˈfleɪ.ʃən/',
    cefr_level: 'C2',
    topic: 'economy',
    core_meaning_vi: 'Lạm phát đình trệ (kinh tế trì trệ đi kèm giá cả leo thang và thất nghiệp cao)',
    feynman_explanation:
      'Thông thường khi kinh tế chậm lại thì giá cả sẽ giảm. Nhưng "stagflation" là cơn ác mộng kép: nền kinh tế vừa đứng im (stagnation), thất nghiệp tăng, mà giá hàng hóa lại vẫn tăng vọt (inflation).',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Economy / Government Policy) & Academic Reading',
      usage_note:
        'Dùng thay cho cụm dài dòng "high inflation combined with slow economic growth" để đạt điểm tuyệt đối tiêu chí Lexical Resource.'
    },
    upgrade_from: 'bad economy with high prices (B1)',
    current_word: 'stagflation (C2)',
    synonyms_upgrade: {
      basic_b1: 'economic slowdown',
      academic_b2_c1: ['economic stagnation', 'recessionary pressure'],
      mastery_c2: ['stagflation', 'macroeconomic malaise']
    },
    word_family: {
      noun: ['stagflation'],
      adj: ['stagflationary']
    },
    collocations: [
      { category: 'Verb + Noun', phrase: 'combat persistent stagflation', meaning_vi: 'chống lại tình trạng lạm phát đình trệ kéo dài' },
      { category: 'Verb + Noun', phrase: 'slide into stagflation', meaning_vi: 'trượt dài vào vòng xoáy lạm phát đình trệ' },
      { category: 'Adj + Noun', phrase: 'prolonged stagflation', meaning_vi: 'lạm phát đình trệ dai dẳng' },
      { category: 'Adj + Noun', phrase: 'stagflationaryspiral', meaning_vi: 'vòng xoáy lạm phát đình trệ' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Ordinary households feel the pinch of stagflation when grocery bills soar while job opportunities shrink.',
        translation_vi: 'Các hộ gia đình bình thường cảm nhận rõ sức ép của lạm phát đình trệ khi hóa đơn thực phẩm tăng vọt trong khi cơ hội việc làm thu hẹp.',
        highlight_keyword: 'stagflation'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Central banks face a formidable policy dilemma when attempting to curb stagflation without triggering a severe recession.',
        translation_vi: 'Các ngân hàng trung ương đối mặt với bài toán chính sách nan giải khi tìm cách kiềm chế lạm phát đình trệ mà không kích hoạt một cuộc suy thoái nghiêm trọng.',
        highlight_keyword: 'stagflation'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Supply-chain disruptions and surging energy costs have pushed several industrial economies to slide into stagflation.',
        translation_vi: 'Sự đứt gãy chuỗi cung ứng và chi phí năng lượng tăng vọt đã đẩy nhiều nền kinh tế công nghiệp trượt vào lạm phát đình trệ.',
        highlight_keyword: 'slide into stagflation'
      }
    ]
  },
  {
    id: 'oxf-econ-02',
    word: 'austerity',
    pos: 'noun',
    ipa_uk: '/ɒsˈter.ə.ti/',
    ipa_us: '/ɔːˈster.ə.t̬i/',
    cefr_level: 'C1',
    topic: 'economy',
    core_meaning_vi: 'Chính sách thắt lưng buộc bụng (cắt giảm chi tiêu công để giảm thâm hụt ngân sách)',
    feynman_explanation:
      'Hãy tưởng tượng một quốc gia đang nợ nần chồng chất và chính phủ quyết định cắt giảm ngân sách y tế, phúc lợi và tăng thuế. Chính sách nghiêm khắc đó gọi là "austerity".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Public Spending / Taxation) & Speaking Part 3',
      usage_note: 'Thường đi kèm với danh từ "measures", "policies", hoặc "programme".'
    },
    upgrade_from: 'cutting government spending (B1)',
    current_word: 'fiscal austerity (C1)',
    synonyms_upgrade: {
      basic_b1: 'budget cuts',
      academic_b2_c1: ['fiscal restraint', 'public spending cuts'],
      mastery_c2: ['austerity measures', 'fiscal consolidation']
    },
    word_family: {
      noun: ['austerity'],
      adj: ['austere'],
      adv: ['austerely']
    },
    collocations: [
      { category: 'Verb + Noun', phrase: 'impose strict austerity', meaning_vi: 'áp đặt chính sách thắt lưng buộc bụng nghiêm ngặt' },
      { category: 'Adj + Noun', phrase: 'fiscal austerity measures', meaning_vi: 'các biện pháp thắt chặt tài khóa' },
      { category: 'Adj + Noun', phrase: 'harsh austerity programme', meaning_vi: 'chương trình cắt giảm chi tiêu khắc nghiệt' },
      { category: 'Noun + Prep', phrase: 'backlash against austerity', meaning_vi: 'làn sóng phản đối chính sách thắt lưng buộc bụng' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'After years of austerity, local libraries and public parks in my city are finally receiving new funding.',
        translation_vi: 'Sau nhiều năm thắt lưng buộc bụng, các thư viện địa phương và công viên công cộng ở thành phố tôi cuối cùng cũng nhận được nguồn vốn mới.',
        highlight_keyword: 'austerity'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Critics contend that prolonged fiscal austerity disproportionately burdens low-income citizens who rely on state welfare.',
        translation_vi: 'Các nhà phê bình cho rằng việc thắt chặt tài khóa kéo dài tạo gánh nặng bất cân xứng lên nhóm công dân thu nhập thấp vốn phụ thuộc vào phúc lợi nhà nước.',
        highlight_keyword: 'fiscal austerity'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'When the government decided to impose strict austerity, public-sector unions immediately staged nationwide demonstrations.',
        translation_vi: 'Khi chính phủ quyết định áp đặt chính sách thắt lưng buộc bụng nghiêm ngặt, các công đoàn khu vực công lập tức tổ chức biểu tình trên toàn quốc.',
        highlight_keyword: 'impose strict austerity'
      }
    ]
  },
  {
    id: 'oxf-econ-03',
    word: 'lucrative',
    pos: 'adj',
    ipa_uk: '/ˈluː.krə.tɪv/',
    ipa_us: '/ˈluː.krə.t̬ɪv/',
    cefr_level: 'C1',
    topic: 'economy',
    core_meaning_vi: 'Sinh lời cao, béo bở, mang lại nguồn thu tài chính lớn',
    feynman_explanation:
      'Khi một công việc, hợp đồng hay thị trường kiếm ra rất nhiều tiền một cách hiệu quả, thay vì nói "well-paid" hay "makes a lot of money", giới học thuật và báo chí dùng "lucrative".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Career / Globalization) & Speaking Part 2, 3',
      usage_note: 'Dùng bổ nghĩa cho danh từ chỉ công việc, hợp đồng, thị trường (contract, career, market, venture).'
    },
    upgrade_from: 'making a lot of money / well-paid (B1)',
    current_word: 'lucrative (C1)',
    synonyms_upgrade: {
      basic_b1: 'profitable',
      academic_b2_c1: ['financially rewarding', 'high-yielding'],
      mastery_c2: ['lucrative', 'remunerative']
    },
    word_family: {
      adj: ['lucrative'],
      adv: ['lucratively'],
      noun: ['lucrativeness']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'a lucrative career path', meaning_vi: 'con đường sự nghiệp thu nhập cao' },
      { category: 'Adj + Noun', phrase: 'lucrative commercial contracts', meaning_vi: 'các hợp đồng thương mại béo bở' },
      { category: 'Adv + Adj/Verb', phrase: 'immensely lucrative', meaning_vi: 'cực kỳ sinh lời' },
      { category: 'Verb + Noun', phrase: 'tap into a lucrative market', meaning_vi: 'khai thác một thị trường màu mỡ' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Many graduates gravitate toward software engineering because it offers a remarkably lucrative career path.',
        translation_vi: 'Nhiều sinh viên mới tốt nghiệp hướng tới ngành kỹ thuật phần mềm vì nó mang lại con đường sự nghiệp có thu nhập rất cao.',
        highlight_keyword: 'lucrative career path'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Multinational corporations frequently lobby for deregulation in order to secure lucrative commercial contracts in emerging markets.',
        translation_vi: 'Các tập đoàn đa quốc gia thường xuyên vận động hành lang để nới lỏng quy định nhằm giành được các hợp đồng thương mại béo bở tại các thị trường mới nổi.',
        highlight_keyword: 'lucrative commercial contracts'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Renewable energy storage has proven to be an immensely lucrative sector for institutional investors over the past decade.',
        translation_vi: 'Lưu trữ năng lượng tái tạo đã chứng tỏ là một lĩnh vực cực kỳ sinh lời đối với các nhà đầu tư tổ chức trong thập kỷ qua.',
        highlight_keyword: 'immensely lucrative'
      }
    ]
  },
  {
    id: 'oxf-econ-04',
    word: 'affluent',
    pos: 'adj',
    ipa_uk: '/ˈæf.lu.ənt/',
    ipa_us: '/ˈæf.lu.ənt/',
    cefr_level: 'C1',
    topic: 'economy',
    core_meaning_vi: 'Giàu có, thịnh vượng, sung túc (thường nói về tầng lớp xã hội hoặc quốc gia)',
    feynman_explanation:
      'Thay vì dùng từ "rich" quá đơn giản, "affluent" miêu tả những cộng đồng, gia đình hoặc quốc gia có mức sống cao, dư dả tài chính một cách trang trọng.',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Socio-economic Inequality / Living Standards)',
      usage_note: 'Cực kỳ hữu ích khi so sánh khoảng cách giàu nghèo ("affluent nations" vs "impoverished regions").'
    },
    upgrade_from: 'rich / wealthy (B1)',
    current_word: 'affluent (C1)',
    synonyms_upgrade: {
      basic_b1: 'rich',
      academic_b2_c1: ['wealthy', 'prosperous', 'well-off'],
      mastery_c2: ['affluent', 'opulent']
    },
    word_family: {
      noun: ['affluence'],
      adj: ['affluent'],
      adv: ['affluently']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'affluent neighbourhoods', meaning_vi: 'các khu dân cư thượng lưu, sung túc' },
      { category: 'Adj + Noun', phrase: 'affluent industrialized nations', meaning_vi: 'các quốc gia công nghiệp thịnh vượng' },
      { category: 'Adj + Noun', phrase: 'increasingly affluent middle class', meaning_vi: 'tầng lớp trung lưu ngày càng khá giả' },
      { category: 'Adv + Adj/Verb', phrase: 'financially affluent', meaning_vi: 'dư dả về mặt tài chính' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Housing prices in affluent neighbourhoods have risen so rapidly that young families can no longer afford them.',
        translation_vi: 'Giá nhà ở các khu dân cư khá giả đã tăng nhanh đến mức các gia đình trẻ không còn đủ khả năng chi trả.',
        highlight_keyword: 'affluent neighbourhoods'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Affluent industrialized nations bear a moral obligation to assist developing countries in transitioning to clean energy.',
        translation_vi: 'Các quốc gia công nghiệp thịnh vượng mang nghĩa vụ đạo đức trong việc hỗ trợ các nước đang phát triển chuyển đổi sang năng lượng sạch.',
        highlight_keyword: 'Affluent industrialized nations'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'The rapid expansion of an increasingly affluent middle class has transformed consumer spending patterns across Southeast Asia.',
        translation_vi: 'Sự mở rộng nhanh chóng của tầng lớp trung lưu ngày càng khá giả đã làm thay đổi mô hình chi tiêu tiêu dùng khắp Đông Nam Á.',
        highlight_keyword: 'increasingly affluent middle class'
      }
    ]
  },
  {
    id: 'oxf-econ-05',
    word: 'disparity',
    pos: 'noun',
    ipa_uk: '/dɪˈspær.ə.ti/',
    ipa_us: '/dɪˈsper.ə.t̬i/',
    cefr_level: 'C1',
    topic: 'economy',
    core_meaning_vi: 'Sự chênh lệch lớn, sự bất bình đẳng (về thu nhập, cơ hội, y tế)',
    feynman_explanation:
      'Không chỉ là sự khác biệt bình thường ("difference"), "disparity" chỉ một khoảng cách chênh lệch bất công giữa hai nhóm (ví dụ: thu nhập giữa nông thôn và thành thị).',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 1 (So sánh số liệu) & Task 2 (Social Inequality)',
      usage_note: 'Luôn đi kèm giới từ "between" (disparity between A and B) hoặc "in" (disparity in income).'
    },
    upgrade_from: 'big difference / gap (B1)',
    current_word: 'disparity (C1)',
    synonyms_upgrade: {
      basic_b1: 'unfair difference',
      academic_b2_c1: ['inequality', 'imbalance', 'discrepancy'],
      mastery_c2: ['disparity', 'asymmetry']
    },
    word_family: {
      noun: ['disparity'],
      adj: ['disparate'],
      adv: ['disparately']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'widening wealth disparity', meaning_vi: 'khoảng cách giàu nghèo ngày càng nới rộng' },
      { category: 'Adj + Noun', phrase: 'stark regional disparity', meaning_vi: 'sự chênh lệch vùng miền rõ rệt' },
      { category: 'Verb + Noun', phrase: 'bridge the socioeconomic disparity', meaning_vi: 'thu hẹp khoảng cách kinh tế - xã hội' },
      { category: 'Verb + Noun', phrase: 'exacerbate income disparities', meaning_vi: 'làm trầm trọng thêm sự chênh lệch thu nhập' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'There is still a noticeable disparity between the quality of healthcare in major cities and that in remote villages.',
        translation_vi: 'Vẫn còn một sự chênh lệch đáng kể giữa chất lượng y tế ở các thành phố lớn và ở các vùng quê hẻo lánh.',
        highlight_keyword: 'disparity'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Targeted educational subsidies are indispensable if policymakers wish to bridge the socioeconomic disparity dividing urban and rural youth.',
        translation_vi: 'Các khoản trợ cấp giáo dục có trọng tâm là không thể thiếu nếu các nhà hoạch định chính sách muốn thu hẹp khoảng cách kinh tế - xã hội ngăn cách thanh thiếu niên thành thị và nông thôn.',
        highlight_keyword: 'bridge the socioeconomic disparity'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'The statistical table illustrates a stark regional disparity in broadband infrastructure investment between 2015 and 2025.',
        translation_vi: 'Bảng thống kê minh họa sự chênh lệch vùng miền rõ rệt trong đầu tư hạ tầng băng thông rộng giai đoạn 2015 - 2025.',
        highlight_keyword: 'stark regional disparity'
      }
    ]
  },
  {
    id: 'oxf-econ-06',
    word: 'precarious',
    pos: 'adj',
    ipa_uk: '/prɪˈkeə.ri.əs/',
    ipa_us: '/prɪˈker.i.əs/',
    cefr_level: 'C2',
    topic: 'economy',
    core_meaning_vi: 'Bấp bênh, thiếu ổn định, đầy rủi ro (việc làm, tài chính, hoàn cảnh)',
    feynman_explanation:
      'Hãy hình dung một chiếc cốc đặt mấp mé ở rìa bàn, chỉ cần chạm nhẹ là rơi vỡ. Khi thu nhập hoặc công việc của một người mong manh như vậy (không bảo hiểm, có thể mất việc bất cứ lúc nào), ta gọi là "precarious".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Gig Economy / Employment Security)',
      usage_note: 'Cụm "precarious employment" và "precarious financial position" là cụm từ tủ Band 8.0+.'
    },
    upgrade_from: 'unstable / unsafe (B1)',
    current_word: 'precarious (C2)',
    synonyms_upgrade: {
      basic_b1: 'unstable',
      academic_b2_c1: ['insecure', 'uncertain', 'volatile'],
      mastery_c2: ['precarious', 'tenuous']
    },
    word_family: {
      noun: ['precariousness', 'precarity'],
      adj: ['precarious'],
      adv: ['precariously']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'precarious employment', meaning_vi: 'việc làm bấp bênh (thiếu phúc lợi/bảo hiểm)' },
      { category: 'Adj + Noun', phrase: 'precarious financial footing', meaning_vi: 'nền tảng tài chính mong manh' },
      { category: 'Verb + Noun', phrase: 'eke out a precarious living', meaning_vi: 'kiếm sống một cách chật vật, bấp bênh' },
      { category: 'Adv + Adj/Verb', phrase: 'remain precariously balanced', meaning_vi: 'duy trì trạng thái cân bằng đầy mong manh' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Working as a full-time freelancer can leave you in a precarious financial position if clients delay their payments.',
        translation_vi: 'Làm nghề tự do toàn thời gian có thể đẩy bạn vào tình thế tài chính bấp bênh nếu khách hàng chậm thanh toán.',
        highlight_keyword: 'precarious'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'The proliferation of the gig economy has trapped millions of young workers in precarious employment devoid of social security.',
        translation_vi: 'Sự bùng nổ của nền kinh tế tự do đã giam chân hàng triệu lao động trẻ trong những công việc bấp bênh không có bảo hiểm xã hội.',
        highlight_keyword: 'precarious employment'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Smallholder farmers in drought-prone regions often eke out a precarious living dependent on unpredictable rainfall.',
        translation_vi: 'Các hộ nông dân nhỏ tại vùng hay hạn hán thường kiếm sống một cách bấp bênh phụ thuộc vào lượng mưa thất thường.',
        highlight_keyword: 'eke out a precarious living'
      }
    ]
  },

  // ===========================================================================
  // CHỦ ĐỀ 2: TECHNOLOGY & DIGITAL ERA (6 TỪ)
  // ===========================================================================
  {
    id: 'oxf-tech-01',
    word: 'ubiquitous',
    pos: 'adj',
    ipa_uk: '/juːˈbɪk.wɪ.təs/',
    ipa_us: '/juːˈbɪk.wə.t̬əs/',
    cefr_level: 'C1',
    topic: 'technology',
    core_meaning_vi: 'Hiện diện ở khắp mọi nơi, phổ biến toàn cầu (công nghệ, thiết bị số)',
    feynman_explanation:
      'Khi một thứ gì đó xuất hiện ở mọi ngóc ngách đến mức bạn đi đâu cũng thấy (như điện thoại thông minh, Wi-Fi, hay AI), thay vì nói "everywhere", hãy dùng "ubiquitous".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Technology / Media) & Speaking Part 3',
      usage_note: 'Danh từ "ubiquity" (sự hiện diện khắp nơi) rất hay dùng làm chủ ngữ mở đầu câu Topic Sentence.'
    },
    upgrade_from: 'everywhere / very common (B1)',
    current_word: 'ubiquitous (C1)',
    synonyms_upgrade: {
      basic_b1: 'everywhere',
      academic_b2_c1: ['widespread', 'pervasive', 'omnipresent'],
      mastery_c2: ['ubiquitous', 'all-pervading']
    },
    word_family: {
      noun: ['ubiquity'],
      adj: ['ubiquitous'],
      adv: ['ubiquitously']
    },
    collocations: [
      { category: 'Verb + Noun', phrase: 'become increasingly ubiquitous', meaning_vi: 'trở nên hiện diện rộng khắp' },
      { category: 'Adj + Noun', phrase: 'ubiquitous digital connectivity', meaning_vi: 'kết nối kỹ thuật số ở khắp mọi nơi' },
      { category: 'Noun + Prep', phrase: 'the ubiquity of smartphones', meaning_vi: 'sự phổ biến khắp nơi của điện thoại thông minh' },
      { category: 'Adv + Adj/Verb', phrase: 'virtually ubiquitous', meaning_vi: 'hầu như có mặt ở khắp mọi nơi' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'QR-code payments have become so ubiquitous in Vietnam that I rarely carry cash anymore.',
        translation_vi: 'Thanh toán bằng mã QR đã trở nên phổ biến khắp nơi ở Việt Nam đến mức tôi hiếm khi mang theo tiền mặt nữa.',
        highlight_keyword: 'ubiquitous'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'While the ubiquity of smartphones facilitates instantaneous communication, it simultaneously erodes face-to-face social intimacy.',
        translation_vi: 'Mặc dù sự hiện diện khắp nơi của điện thoại thông minh tạo điều kiện cho giao tiếp tức thời, nó đồng thời làm xói mòn sự gắn kết xã hội trực tiếp.',
        highlight_keyword: 'the ubiquity of smartphones'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Cloud-based collaboration tools are now virtually ubiquitous across modern corporate workplaces.',
        translation_vi: 'Các công cụ cộng tác trên nền tảng đám mây hiện nay hầu như có mặt ở khắp mọi môi trường doanh nghiệp hiện đại.',
        highlight_keyword: 'virtually ubiquitous'
      }
    ]
  },
  {
    id: 'oxf-tech-02',
    word: 'obsolescence',
    pos: 'noun',
    ipa_uk: '/ˌɒb.səlˈes.əns/',
    ipa_us: '/ˌɑːb.səlˈes.əns/',
    cefr_level: 'C2',
    topic: 'technology',
    core_meaning_vi: 'Sự lỗi thời, quá trình trở nên lạc hậu và không còn được sử dụng',
    feynman_explanation:
      'Tại sao chiếc điện thoại dùng 2 năm đã chậm và hỏng pin? Các hãng công nghệ cố tình thiết kế sản phẩm nhanh lỗi thời để bạn phải mua mới — hiện tượng đó gọi là "planned obsolescence".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Consumerism / E-waste / Automation)',
      usage_note: 'Dùng cực đắt trong cả chủ đề Công nghệ (thiết bị lỗi thời) lẫn Việc làm (kỹ năng lỗi thời).'
    },
    upgrade_from: 'becoming old and useless (B1)',
    current_word: 'obsolescence (C2)',
    synonyms_upgrade: {
      basic_b1: 'outdatedness',
      academic_b2_c1: ['outmodedness', 'technological decay'],
      mastery_c2: ['obsolescence', 'planned obsolescence']
    },
    word_family: {
      noun: ['obsolescence'],
      adj: ['obsolete', 'obsolescent']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'planned obsolescence', meaning_vi: 'sự lỗi thời có tính toán (của nhà sản xuất)' },
      { category: 'Adj + Noun', phrase: 'rapid technological obsolescence', meaning_vi: 'sự lỗi thời công nghệ nhanh chóng' },
      { category: 'Verb + Noun', phrase: 'accelerate skill obsolescence', meaning_vi: 'đẩy nhanh sự lỗi thời của kỹ năng lao động' },
      { category: 'Academic Phrase', phrase: 'render traditional methods obsolete', meaning_vi: 'khiến các phương pháp truyền thống trở nên lỗi thời' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'I prefer repairing my laptop rather than buying a new one every year because I dislike the culture of planned obsolescence.',
        translation_vi: 'Tôi thích sửa chiếc laptop của mình hơn là mua máy mới mỗi năm vì tôi không thích văn hóa thiết kế lỗi thời có tính toán.',
        highlight_keyword: 'planned obsolescence'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Planned obsolescence not only exploits consumers financially but also generates millions of tonnes of hazardous electronic waste.',
        translation_vi: 'Sự lỗi thời có tính toán không chỉ bóc lột người tiêu dùng về mặt tài chính mà còn tạo ra hàng triệu tấn rác thải điện tử độc hại.',
        highlight_keyword: 'Planned obsolescence'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Lifelong learning is the only viable defence against rapid technological obsolescence in an AI-driven labour market.',
        translation_vi: 'Học tập suốt đời là lá chắn khả thi duy nhất trước sự lỗi thời công nghệ nhanh chóng trong thị trường lao động vận hành bởi AI.',
        highlight_keyword: 'rapid technological obsolescence'
      }
    ]
  },
  {
    id: 'oxf-tech-03',
    word: 'algorithmic',
    pos: 'adj',
    ipa_uk: '/ˌæl.ɡəˈrɪð.mɪk/',
    ipa_us: '/ˌæl.ɡəˈrɪð.mɪk/',
    cefr_level: 'C1',
    topic: 'technology',
    core_meaning_vi: 'Thuộc về thuật toán, được điều phối bởi thuật toán máy tính',
    feynman_explanation:
      'Khi mạng xã hội tự động chọn video bạn thích hoặc hệ thống AI tự động chấm hồ sơ xin việc, mọi thứ đang được vận hành bởi thuật toán ("algorithmic").',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Social Media / AI Ethics / Privacy)',
      usage_note: 'Kết hợp với "bias" (thiên kiến thuật toán) hoặc "curation" (sự chọn lọc nội dung bằng thuật toán).'
    },
    upgrade_from: 'computer-decided (B1)',
    current_word: 'algorithmic (C1)',
    synonyms_upgrade: {
      basic_b1: 'automated',
      academic_b2_c1: ['computational', 'data-driven'],
      mastery_c2: ['algorithmic', 'heuristically driven']
    },
    word_family: {
      noun: ['algorithm'],
      adj: ['algorithmic'],
      adv: ['algorithmically']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'algorithmic bias', meaning_vi: 'sự thiên kiến/định kiến của thuật toán' },
      { category: 'Adj + Noun', phrase: 'algorithmic content curation', meaning_vi: 'sự phân phối nội dung bằng thuật toán' },
      { category: 'Adj + Noun', phrase: 'algorithmic transparency', meaning_vi: 'tính minh bạch của thuật toán' },
      { category: 'Adv + Adj/Verb', phrase: 'algorithmically tailored feeds', meaning_vi: 'bảng tin được cá nhân hóa bằng thuật toán' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Sometimes I feel trapped in an echo chamber because of algorithmic content curation on short-video apps.',
        translation_vi: 'Đôi khi tôi cảm thấy bị mắc kẹt trong một buồng vang thông tin do sự phân phối nội dung bằng thuật toán trên các ứng dụng video ngắn.',
        highlight_keyword: 'algorithmic content curation'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Unchecked algorithmic bias in automated recruitment systems risks perpetuating historical discrimination against minority applicants.',
        translation_vi: 'Sự thiên kiến thuật toán không được kiểm soát trong các hệ thống tuyển dụng tự động có nguy cơ duy trì sự phân biệt đối xử đối với các ứng viên thiểu số.',
        highlight_keyword: 'algorithmic bias'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Regulators are demanding greater algorithmic transparency from tech giants to protect adolescent mental health.',
        translation_vi: 'Các cơ quan quản lý đang yêu cầu tính minh bạch thuật toán cao hơn từ các gã khổng lồ công nghệ nhằm bảo vệ sức khỏe tâm thần của thanh thiếu niên.',
        highlight_keyword: 'algorithmic transparency'
      }
    ]
  },
  {
    id: 'oxf-tech-04',
    word: 'autonomous',
    pos: 'adj',
    ipa_uk: '/ɔːˈtɒn.ə.məs/',
    ipa_us: '/ɑːˈtɑː.nə.məs/',
    cefr_level: 'C1',
    topic: 'technology',
    core_meaning_vi: 'Tự hành, tự chủ, vận hành độc lập không cần con người can thiệp',
    feynman_explanation:
      'Có 2 ngữ cảnh chính: (1) Trong công nghệ: xe tự lái, robot tự vận hành; (2) Trong giáo dục/tâm lý: người học có khả năng tự giác, độc lập ("autonomous learner").',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Future Transport / AI / Education)',
      usage_note: 'Danh từ là "autonomy" (quyền tự chủ / tính độc lập).'
    },
    upgrade_from: 'self-driving / independent (B1)',
    current_word: 'autonomous (C1)',
    synonyms_upgrade: {
      basic_b1: 'self-operating',
      academic_b2_c1: ['self-governing', 'independent'],
      mastery_c2: ['autonomous', 'self-directed']
    },
    word_family: {
      noun: ['autonomy'],
      adj: ['autonomous'],
      adv: ['autonomously']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'autonomous vehicles', meaning_vi: 'các phương tiện giao thông tự hành (xe tự lái)' },
      { category: 'Adj + Noun', phrase: 'autonomous learning', meaning_vi: 'việc học tập tự chủ, độc lập' },
      { category: 'Adv + Adj/Verb', phrase: 'operate fully autonomously', meaning_vi: 'vận hành hoàn toàn tự động' },
      { category: 'Verb + Noun', phrase: 'foster learner autonomy', meaning_vi: 'nuôi dưỡng tính tự chủ của người học' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Online courses have helped me become a much more autonomous learner because I have to manage my own schedule.',
        translation_vi: 'Các khóa học trực tuyến đã giúp tôi trở thành một người học tự chủ hơn rất nhiều vì tôi phải tự quản lý lịch trình của mình.',
        highlight_keyword: 'autonomous'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'The widespread deployment of autonomous vehicles promises to drastically reduce traffic fatalities caused by human error.',
        translation_vi: 'Việc triển khai rộng rãi các phương tiện tự hành hứa hẹn sẽ giảm thiểu đáng kể số vụ tai nạn giao thông chết người do lỗi con người gây ra.',
        highlight_keyword: 'autonomous vehicles'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Modern universities should prioritize inquiry-based projects that foster learner autonomy rather than rote memorization.',
        translation_vi: 'Các trường đại học hiện đại nên ưu tiên các dự án dựa trên truy vấn nhằm nuôi dưỡng tính tự chủ của người học thay vì học vẹt.',
        highlight_keyword: 'foster learner autonomy'
      }
    ]
  },
  {
    id: 'oxf-tech-05',
    word: 'intrusive',
    pos: 'adj',
    ipa_uk: '/ɪnˈtruː.sɪv/',
    ipa_us: '/ɪnˈtruː.sɪv/',
    cefr_level: 'C1',
    topic: 'technology',
    core_meaning_vi: 'Xâm phạm quyền riêng tư, gây phiền nhiễu không mong muốn',
    feynman_explanation:
      'Khi quảng cáo bám đuổi bạn khắp nơi, hoặc camera giám sát theo dõi quá mức khiến bạn thấy mất tự do cá nhân, sự xâm nhập khó chịu đó chính là "intrusive".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Surveillance / Digital Privacy / Advertising)',
      usage_note: 'Từ cực kỳ ăn điểm khi phê phán mặt trái của quảng cáo số ("intrusive advertising") hoặc giám sát dữ liệu ("intrusive surveillance").'
    },
    upgrade_from: 'annoying and invading privacy (B1)',
    current_word: 'intrusive (C1)',
    synonyms_upgrade: {
      basic_b1: 'annoying',
      academic_b2_c1: ['invasive', 'meddlesome'],
      mastery_c2: ['intrusive', 'encroaching']
    },
    word_family: {
      noun: ['intrusion', 'intrusiveness'],
      verb: ['intrude'],
      adj: ['intrusive'],
      adv: ['intrusively']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'intrusive digital surveillance', meaning_vi: 'sự giám sát kỹ thuật số xâm phạm quyền riêng tư' },
      { category: 'Adj + Noun', phrase: 'intrusive targeted advertisements', meaning_vi: 'quảng cáo nhắm mục tiêu gây phiền nhiễu' },
      { category: 'Adv + Adj/Verb', phrase: 'increasingly intrusive', meaning_vi: 'ngày càng mang tính xâm phạm' },
      { category: 'Noun + Prep', phrase: 'unwarranted intrusion into privacy', meaning_vi: 'sự xâm phạm vô cớ vào đời tư' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'I installed an ad blocker because pop-up banners on news websites were becoming unbearably intrusive.',
        translation_vi: 'Tôi đã cài trình chặn quảng cáo vì các biểu ngữ bật lên trên các trang báo điện tử ngày càng gây phiền nhiễu không chịu nổi.',
        highlight_keyword: 'intrusive'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Civil liberties advocates warn that intrusive digital surveillance under the guise of public safety may erode democratic freedoms.',
        translation_vi: 'Những người bảo vệ quyền tự do dân sự cảnh báo rằng sự giám sát kỹ thuật số mang tính xâm phạm dưới danh nghĩa an toàn công cộng có thể làm xói mòn các quyền tự do dân chủ.',
        highlight_keyword: 'intrusive digital surveillance'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Strict data-protection legislation is required to prevent corporate data harvesting from becoming an unwarranted intrusion into privacy.',
        translation_vi: 'Luật bảo vệ dữ liệu nghiêm ngặt là cần thiết để ngăn chặn việc thu thập dữ liệu của các tập đoàn trở thành sự xâm phạm vô cớ vào đời tư.',
        highlight_keyword: 'unwarranted intrusion into privacy'
      }
    ]
  },
  {
    id: 'oxf-tech-06',
    word: 'paradigm',
    pos: 'noun',
    ipa_uk: '/ˈpær.ə.daɪm/',
    ipa_us: '/ˈper.ə.daɪm/',
    cefr_level: 'C2',
    topic: 'technology',
    core_meaning_vi: 'Mô thức, hệ hình tư duy, khuôn mẫu chuẩn mực trong khoa học hoặc xã hội',
    feynman_explanation:
      'Khi một phát minh (như Internet hoặc AI tạo sinh) thay đổi hoàn toàn cách cả thế giới tư duy, làm việc và vận hành, ta không chỉ gọi đó là "big change", mà gọi là "a paradigm shift" (bước chuyển dịch hệ hình).',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Science / Education / Technology)',
      usage_note: 'Lưu ý phát âm âm cuối là /-daɪm/ (chữ g câm).'
    },
    upgrade_from: 'basic model / way of thinking (B1)',
    current_word: 'paradigm (C2)',
    synonyms_upgrade: {
      basic_b1: 'model',
      academic_b2_c1: ['framework', 'archetype'],
      mastery_c2: ['paradigm', 'epistemological model']
    },
    word_family: {
      noun: ['paradigm'],
      adj: ['paradigmatic']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'a fundamental paradigm shift', meaning_vi: 'một bước chuyển dịch tư duy mang tính nền tảng' },
      { category: 'Adj + Noun', phrase: 'dominant educational paradigm', meaning_vi: 'mô thức giáo dục chủ đạo' },
      { category: 'Verb + Noun', phrase: 'challenge the prevailing paradigm', meaning_vi: 'thách thức hệ tư tưởng/khuôn mẫu hiện hành' },
      { category: 'Verb + Noun', phrase: 'establish a new paradigm', meaning_vi: 'thiết lập một chuẩn mực/hệ hình mới' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Remote work has triggered a genuine paradigm shift in how young professionals balance career and family life.',
        translation_vi: 'Làm việc từ xa đã tạo ra một bước chuyển dịch tư duy thực sự trong cách những người trẻ đi làm cân bằng giữa sự nghiệp và gia đình.',
        highlight_keyword: 'paradigm shift'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Generative artificial intelligence represents a fundamental paradigm shift in knowledge production and academic research.',
        translation_vi: 'Trí tuệ nhân tạo tạo sinh đại diện cho một bước chuyển dịch hệ hình mang tính nền tảng trong việc sản xuất tri thức và nghiên cứu học thuật.',
        highlight_keyword: 'a fundamental paradigm shift'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Pioneering scientists must often challenge the prevailing paradigm despite initial scepticism from their peers.',
        translation_vi: 'Các nhà khoa học tiên phong thường phải thách thức hệ hình tư duy hiện hành bất chấp sự hoài nghi ban đầu từ giới đồng môn.',
        highlight_keyword: 'challenge the prevailing paradigm'
      }
    ]
  },

  // ===========================================================================
  // CHỦ ĐỀ 3: PSYCHOLOGY & COGNITIVE SCIENCE (6 TỪ)
  // ===========================================================================
  {
    id: 'oxf-psyc-01',
    word: 'cognitive',
    pos: 'adj',
    ipa_uk: '/ˈkɒɡ.nə.tɪv/',
    ipa_us: '/ˈkɑːɡ.nə.t̬ɪv/',
    cefr_level: 'C1',
    topic: 'psychology',
    core_meaning_vi: 'Thuộc về nhận thức, tư duy và quá trình xử lý thông tin của não bộ',
    feynman_explanation:
      'Mọi hoạt động của trí não như ghi nhớ, tập trung, suy luận, giải quyết vấn đề và học ngôn ngữ đều thuộc về "cognitive processes" (quá trình nhận thức).',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Child Development / Education / Ageing)',
      usage_note: 'Thay thế hoàn hảo cho từ "mental" hoặc "thinking" trong các bài viết về giáo dục trẻ em và sức khỏe trí tuệ.'
    },
    upgrade_from: 'mental / thinking (B1)',
    current_word: 'cognitive (C1)',
    synonyms_upgrade: {
      basic_b1: 'mental',
      academic_b2_c1: ['intellectual', 'perceptual'],
      mastery_c2: ['cognitive', 'metacognitive']
    },
    word_family: {
      noun: ['cognition'],
      adj: ['cognitive'],
      adv: ['cognitively']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'cognitive development', meaning_vi: 'sự phát triển nhận thức (đặc biệt ở trẻ nhỏ)' },
      { category: 'Adj + Noun', phrase: 'cognitive overload', meaning_vi: 'sự quá tải nhận thức (do tiếp nhận quá nhiều thông tin)' },
      { category: 'Adj + Noun', phrase: 'age-related cognitive decline', meaning_vi: 'sự suy giảm nhận thức do tuổi tác' },
      { category: 'Adj + Noun', phrase: 'cognitive dissonance', meaning_vi: 'sự bất hòa nhận thức (mâu thuẫn giữa niềm tin và hành vi)' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Switching between ten browser tabs while studying gives me severe cognitive overload.',
        translation_vi: 'Việc chuyển qua lại giữa mười tab trình duyệt trong lúc học khiến tôi bị quá tải nhận thức nghiêm trọng.',
        highlight_keyword: 'cognitive overload'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Empirical studies demonstrate that bilingualism significantly enhances executive function and stimulates early cognitive development.',
        translation_vi: 'Các nghiên cứu thực nghiệm chứng minh rằng việc thông thạo hai ngôn ngữ giúp tăng cường đáng kể chức năng điều hành và kích thích sự phát triển nhận thức sớm.',
        highlight_keyword: 'cognitive development'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Regular intellectual engagement and social interaction can mitigate age-related cognitive decline among senior citizens.',
        translation_vi: 'Sự vận động trí tuệ thường xuyên và tương tác xã hội có thể làm giảm thiểu sự suy giảm nhận thức do tuổi tác ở người cao tuổi.',
        highlight_keyword: 'age-related cognitive decline'
      }
    ]
  },
  {
    id: 'oxf-psyc-02',
    word: 'resilience',
    pos: 'noun',
    ipa_uk: '/rɪˈzɪl.i.əns/',
    ipa_us: '/rɪˈzɪl.jəns/',
    cefr_level: 'C1',
    topic: 'psychology',
    core_meaning_vi: 'Khả năng phục hồi tinh thần, sức bền bỉ vượt qua nghịch cảnh',
    feynman_explanation:
      'Giống như một chiếc lò xo bị nén mạnh nhưng vẫn bật trở lại hình dáng ban đầu: "resilience" là năng lực đứng dậy mạnh mẽ sau thất bại, áp lực hoặc khủng hoảng.',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Parenting / Education / Economy) & Speaking Part 2, 3',
      usage_note: 'Dùng được cho cả tâm lý con người ("psychological resilience") và hệ thống kinh tế/sinh thái ("economic/ecological resilience").'
    },
    upgrade_from: 'ability to recover from problems (B1)',
    current_word: 'resilience (C1)',
    synonyms_upgrade: {
      basic_b1: 'toughness',
      academic_b2_c1: ['grit', 'fortitude', 'adaptability'],
      mastery_c2: ['resilience', 'psychological hardiness']
    },
    word_family: {
      noun: ['resilience', 'resiliency'],
      adj: ['resilient'],
      adv: ['resiliently']
    },
    collocations: [
      { category: 'Verb + Noun', phrase: 'cultivate emotional resilience', meaning_vi: 'rèn luyện/vun đắp sức bền tâm lý' },
      { category: 'Adj + Noun', phrase: 'remarkable psychological resilience', meaning_vi: 'khả năng phục hồi tâm lý đáng kinh ngạc' },
      { category: 'Verb + Noun', phrase: 'demonstrate resilience in the face of adversity', meaning_vi: 'thể hiện bản lĩnh kiên cường trước nghịch cảnh' },
      { category: 'Adj + Noun', phrase: 'resilient supply chains', meaning_vi: 'các chuỗi cung ứng có khả năng chống chịu cao' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Preparing for the IELTS exam taught me not just academic English, but also mental resilience.',
        translation_vi: 'Quá trình ôn thi IELTS đã dạy tôi không chỉ tiếng Anh học thuật mà còn cả sự bền bỉ về tinh thần.',
        highlight_keyword: 'resilience'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Overprotective parenting deprives children of the opportunity to experience manageable failure and cultivate emotional resilience.',
        translation_vi: 'Cách nuôi dạy bao bọc quá mức tước đi của trẻ cơ hội trải nghiệm những thất bại trong tầm kiểm soát và rèn luyện sức bền tâm lý.',
        highlight_keyword: 'cultivate emotional resilience'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Communities that demonstrate resilience in the face of adversity often possess strong social cohesion and mutual trust.',
        translation_vi: 'Những cộng đồng thể hiện sự kiên cường trước nghịch cảnh thường sở hữu sự gắn kết xã hội bền chặt và niềm tin lẫn nhau.',
        highlight_keyword: 'demonstrate resilience in the face of adversity'
      }
    ]
  },
  {
    id: 'oxf-psyc-03',
    word: 'intrinsic',
    pos: 'adj',
    ipa_uk: '/ɪnˈtrɪn.zɪk/',
    ipa_us: '/ɪnˈtrɪn.zɪk/',
    cefr_level: 'C1',
    topic: 'psychology',
    core_meaning_vi: 'Nội tại, bản chất bên trong (đối lập với tác động bên ngoài - extrinsic)',
    feynman_explanation:
      'Nếu bạn học tiếng Anh vì yêu thích cảm giác khám phá tri thức, đó là động lực tự thân bên trong ("intrinsic motivation"). Ngược lại, nếu chỉ học vì sợ bị phạt hay vì tiền thưởng, đó là "extrinsic motivation".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Education / Work Motivation / Art & Culture)',
      usage_note: 'Đi với giới từ "to" khi mang nghĩa gắn liền với bản chất của cái gì ("intrinsic to human nature").'
    },
    upgrade_from: 'inner / natural (B1)',
    current_word: 'intrinsic (C1)',
    synonyms_upgrade: {
      basic_b1: 'inner',
      academic_b2_c1: ['inherent', 'innate', 'inborn'],
      mastery_c2: ['intrinsic', 'consubstantial']
    },
    word_family: {
      adj: ['intrinsic'],
      adv: ['intrinsically']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'intrinsic motivation', meaning_vi: 'động lực nội tại (xuất phát từ đam mê tự thân)' },
      { category: 'Adj + Noun', phrase: 'intrinsic cultural value', meaning_vi: 'giá trị văn hóa tự thân' },
      { category: 'Academic Phrase', phrase: 'be intrinsic to human nature', meaning_vi: 'thuộc về bản chất tự nhiên của con người' },
      { category: 'Adv + Adj/Verb', phrase: 'intrinsically rewarding', meaning_vi: 'mang lại sự thỏa mãn từ chính bản chất công việc' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'For me, teaching is intrinsically rewarding because I get to witness my students grow every single day.',
        translation_vi: 'Đối với tôi, giảng dạy mang lại niềm vui tự thân vì tôi được chứng kiến học trò của mình trưởng thành mỗi ngày.',
        highlight_keyword: 'intrinsically rewarding'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Pedagogical research confirms that intrinsic motivation yields far more sustainable academic achievement than external financial rewards.',
        translation_vi: 'Nghiên cứu sư phạm khẳng định rằng động lực nội tại mang lại thành tích học tập bền vững hơn nhiều so với các phần thưởng tài chính bên ngoài.',
        highlight_keyword: 'intrinsic motivation'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Museums should be preserved for their intrinsic cultural value rather than evaluated solely on commercial profitability.',
        translation_vi: 'Các bảo tàng cần được bảo tồn vì giá trị văn hóa tự thân của chúng thay vì chỉ bị đánh giá dựa trên khả năng sinh lời thương mại.',
        highlight_keyword: 'intrinsic cultural value'
      }
    ]
  },
  {
    id: 'oxf-psyc-04',
    word: 'altruism',
    pos: 'noun',
    ipa_uk: '/ˈæl.tru.ɪ.zəm/',
    ipa_us: '/ˈæl.tru.ɪ.zəm/',
    cefr_level: 'C2',
    topic: 'psychology',
    core_meaning_vi: 'Lòng vị tha, sự hy sinh vì lợi ích của người khác mà không vụ lợi',
    feynman_explanation:
      'Khi một người làm từ thiện hoặc giúp đỡ người lạ hoàn toàn xuất phát từ lòng nhân ái mà không mong nhận lại danh tiếng hay tiền bạc, phẩm chất cao quý đó gọi là "altruism".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Volunteering / Community Service / Human Nature)',
      usage_note: 'Tính từ "altruistic" cực kỳ hữu ích khi bàn về hoạt động tình nguyện của học sinh và trách nhiệm xã hội.'
    },
    upgrade_from: 'selflessness / helping others (B1)',
    current_word: 'altruism (C2)',
    synonyms_upgrade: {
      basic_b1: 'kindness',
      academic_b2_c1: ['selflessness', 'benevolence', 'philanthropy'],
      mastery_c2: ['altruism', 'magnanimity']
    },
    word_family: {
      noun: ['altruism', 'altruist'],
      adj: ['altruistic'],
      adv: ['altruistically']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'pure altruism', meaning_vi: 'lòng vị tha thuần khiết, không vụ lợi' },
      { category: 'Adj + Noun', phrase: 'altruistic behaviour', meaning_vi: 'hành vi vị tha vì cộng đồng' },
      { category: 'Verb + Noun', phrase: 'instil a sense of altruism', meaning_vi: 'gieo mầm tinh thần vị tha' },
      { category: 'Adj + Noun', phrase: 'reciprocal altruism', meaning_vi: 'lòng vị tha có đi có lại (trong tâm lý học tiến hóa)' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Volunteering at the community kitchen during university really opened my eyes to the power of everyday altruism.',
        translation_vi: 'Việc làm tình nguyện tại bếp ăn cộng đồng thời đại học thực sự giúp tôi nhận ra sức mạnh của lòng vị tha thường nhật.',
        highlight_keyword: 'altruism'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Incorporating community service into high-school curricula can instil a sense of altruism and civic responsibility in adolescents.',
        translation_vi: 'Việc lồng ghép hoạt động phục vụ cộng đồng vào chương trình trung học có thể gieo mầm tinh thần vị tha và trách nhiệm công dân ở thanh thiếu niên.',
        highlight_keyword: 'instil a sense of altruism'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Evolutionary psychologists have long debated whether human charity stems from pure altruism or subtle social signalling.',
        translation_vi: 'Các nhà tâm lý học tiến hóa từ lâu đã tranh luận liệu hoạt động từ thiện của con người bắt nguồn từ lòng vị tha thuần khiết hay sự khẳng định vị thế xã hội tinh vi.',
        highlight_keyword: 'pure altruism'
      }
    ]
  },
  {
    id: 'oxf-psyc-05',
    word: 'Alienation',
    pos: 'noun',
    ipa_uk: '/ˌeɪ.li.əˈneɪ.ʃən/',
    ipa_us: '/ˌeɪ.li.əˈneɪ.ʃən/',
    cefr_level: 'C2',
    topic: 'psychology',
    core_meaning_vi: 'Sự xa lánh, cảm giác cô lập và tách biệt khỏi cộng đồng hoặc xã hội',
    feynman_explanation:
      'Sống giữa một thành phố đông đúc hàng triệu người nhưng bạn vẫn cảm thấy hoàn toàn lạc lõng, không thuộc về nơi đó — trạng thái tâm lý cô độc giữa đám đông ấy chính là "social alienation".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Urbanization / Social Media / Modern Lifestyles)',
      usage_note: 'Dùng danh từ "alienation" hoặc động từ "alienate" để phân tích hệ lụy tâm lý của đô thị hóa và nghiện mạng xã hội.'
    },
    upgrade_from: 'feeling lonely and separated (B1)',
    current_word: 'alienation (C2)',
    synonyms_upgrade: {
      basic_b1: 'loneliness',
      academic_b2_c1: ['social isolation', 'detachment', 'estrangement'],
      mastery_c2: ['alienation', 'anomie']
    },
    word_family: {
      noun: ['alienation'],
      verb: ['alienate'],
      adj: ['alienated', 'alienating']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'profound social alienation', meaning_vi: 'sự cô lập/tách biệt xã hội sâu sắc' },
      { category: 'Adj + Noun', phrase: 'urban alienation', meaning_vi: 'cảm giác lạc lõng nơi đô thị' },
      { category: 'Verb + Noun', phrase: 'combat feelings of alienation', meaning_vi: 'đẩy lùi cảm giác bị cô lập' },
      { category: 'Verb + Noun', phrase: 'exacerbate youth alienation', meaning_vi: 'làm trầm trọng thêm sự xa lánh xã hội ở giới trẻ' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Moving to a megacity where neighbours barely greet each other can initially cause a strong sense of urban alienation.',
        translation_vi: 'Chuyển đến một siêu đô thị nơi hàng xóm hiếm khi chào hỏi nhau ban đầu có thể gây ra cảm giác lạc lõng đô thị rất lớn.',
        highlight_keyword: 'urban alienation'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Excessive reliance on virtual interactions can inadvertently breed profound social alienation among digitally native teenagers.',
        translation_vi: 'Sự phụ thuộc quá mức vào các tương tác ảo có thể vô tình nuôi dưỡng sự cô lập xã hội sâu sắc ở thế hệ thanh thiếu niên thời đại số.',
        highlight_keyword: 'profound social alienation'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Accessible community centres and green public spaces play a vital role in helping elderly residents combat feelings of alienation.',
        translation_vi: 'Các trung tâm sinh hoạt cộng đồng dễ tiếp cận và không gian xanh công cộng đóng vai trò thiết yếu giúp cư dân cao tuổi đẩy lùi cảm giác bị cô lập.',
        highlight_keyword: 'combat feelings of alienation'
      }
    ]
  },
  {
    id: 'oxf-psyc-06',
    word: 'Conformity',
    pos: 'noun',
    ipa_uk: '/kənˈfɔː.mə.ti/',
    ipa_us: '/kənˈfɔːr.mə.t̬i/',
    cefr_level: 'C1',
    topic: 'psychology',
    core_meaning_vi: 'Sự tuân thủ đám đông, xu hướng hành xử giống số đông để được chấp nhận',
    feynman_explanation:
      'Khi bạn mặc một kiểu áo hoặc đồng tình với một ý kiến chỉ vì sợ khác biệt với bạn bè xung quanh (peer pressure), hành vi hòa tan theo số đông đó gọi là "conformity".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Education / Creativity / Peer Pressure / Advertising)',
      usage_note: 'Đối lập trực tiếp với "individuality" (cá tính riêng) và "divergent thinking" (tư duy khác biệt).'
    },
    upgrade_from: 'following the crowd (B1)',
    current_word: 'conformity (C1)',
    synonyms_upgrade: {
      basic_b1: 'copying others',
      academic_b2_c1: ['compliance', 'conventionality'],
      mastery_c2: ['social conformity', 'homogenization']
    },
    word_family: {
      noun: ['conformity', 'conformist', 'nonconformist'],
      verb: ['conform'],
      adj: ['conformist']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'rigid social conformity', meaning_vi: 'sự khuôn mẫu xã hội cứng nhắc' },
      { category: 'Verb + Noun', phrase: 'enforce strict conformity', meaning_vi: 'áp đặt sự tuân thủ khuôn phép nghiêm ngặt' },
      { category: 'Academic Phrase', phrase: 'stifle creativity through conformity', meaning_vi: 'bóp nghẹt sự sáng tạo thông qua thói rập khuôn' },
      { category: 'Academic Phrase', phrase: 'conform to societal norms', meaning_vi: 'tuân theo các chuẩn mực xã hội' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Social media trends often pressure teenagers into blind conformity rather than encouraging them to express their own style.',
        translation_vi: 'Các xu hướng mạng xã hội thường gây áp lực khiến thanh thiếu niên chạy theo đám đông một cách mù quáng thay vì khuyến khích các em thể hiện phong cách riêng.',
        highlight_keyword: 'conformity'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'An education system that rewards rote memorization and rigid social conformity inevitably stifles original scientific inquiry.',
        translation_vi: 'Một hệ thống giáo dục chỉ khen thưởng lối học vẹt và sự rập khuôn cứng nhắc tất yếu sẽ bóp nghẹt tinh thần nghiên cứu khoa học độc창.',
        highlight_keyword: 'rigid social conformity'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'While individuals must conform to societal norms to maintain public order, excessive pressure to fit in can erode personal authenticity.',
        translation_vi: 'Mặc dù mỗi cá nhân cần tuân theo các chuẩn mực xã hội để duy trì trật tự chung, áp lực hòa nhập quá mức có thể làm mai một bản sắc cá nhân.',
        highlight_keyword: 'conform to societal norms'
      }
    ]
  },

  // ===========================================================================
  // CHỦ ĐỀ 4: ENVIRONMENT & SUSTAINABILITY (6 TỪ)
  // ===========================================================================
  {
    id: 'oxf-env-01',
    word: 'anthropogenic',
    pos: 'adj',
    ipa_uk: '/ˌæn.θrə.pəˈdʒen.ɪk/',
    ipa_us: '/ˌæn.θrə.pəˈdʒen.ɪk/',
    cefr_level: 'C2',
    topic: 'environment',
    core_meaning_vi: 'Do con người gây ra (biến đổi khí hậu, ô nhiễm môi trường)',
    feynman_explanation:
      'Gốc Hy Lạp "anthropo-" nghĩa là con người, "-genic" nghĩa là sinh ra. Thay vì viết "caused by human activities" dài 4 từ, các báo cáo khoa học của Liên Hợp Quốc dùng đúng 1 từ: "anthropogenic".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Climate Change / Biodiversity) & Academic Reading',
      usage_note: 'Từ vựng chuẩn C2 giúp câu mở bài chủ đề Môi trường lập tức gây ấn tượng mạnh với giám khảo.'
    },
    upgrade_from: 'caused by humans / man-made (B1)',
    current_word: 'anthropogenic (C2)',
    synonyms_upgrade: {
      basic_b1: 'man-made',
      academic_b2_c1: ['human-induced', 'human-generated'],
      mastery_c2: ['anthropogenic']
    },
    word_family: {
      adj: ['anthropogenic'],
      adv: ['anthropogenically']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'anthropogenic climate change', meaning_vi: 'biến đổi khí hậu do con người gây ra' },
      { category: 'Adj + Noun', phrase: 'anthropogenic greenhouse gas emissions', meaning_vi: 'lượng phát thải khí nhà kính do hoạt động của con người' },
      { category: 'Adj + Noun', phrase: 'anthropogenic habitat destruction', meaning_vi: 'sự tàn phá sinh cảnh do con người' },
      { category: 'Adj + Noun', phrase: 'anthropogenic stressors on marine ecosystems', meaning_vi: 'các tác nhân gây áp lực từ con người lên hệ sinh thái biển' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Documentaries about coral bleaching really highlight how severe anthropogenic impacts on our oceans have become.',
        translation_vi: 'Các bộ phim tài liệu về hiện tượng tẩy trắng san hô thực sự làm nổi bật mức độ nghiêm trọng của những tác động do con người gây ra đối với đại dương.',
        highlight_keyword: 'anthropogenic'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'There is an overwhelming scientific consensus that anthropogenic greenhouse gas emissions are the primary driver of global warming.',
        translation_vi: 'Có một sự đồng thuận khoa học áp đảo rằng lượng phát thải khí nhà kính do con người gây ra là tác nhân chính thúc đẩy sự nóng lên toàn cầu.',
        highlight_keyword: 'anthropogenic greenhouse gas emissions'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Mitigating anthropogenic habitat destruction requires stringent international treaties and enforceable penalties for illegal logging.',
        translation_vi: 'Việc giảm thiểu sự tàn phá sinh cảnh do con người đòi hỏi các hiệp ước quốc tế nghiêm ngặt và chế tài thực thi đối với nạn khai thác gỗ trái phép.',
        highlight_keyword: 'anthropogenic habitat destruction'
      }
    ]
  },
  {
    id: 'oxf-env-02',
    word: 'depletion',
    pos: 'noun',
    ipa_uk: '/dɪˈpliː.ʃən/',
    ipa_us: '/dɪˈpliː.ʃən/',
    cefr_level: 'C1',
    topic: 'environment',
    core_meaning_vi: 'Sự cạn kiệt, sự suy giảm nghiêm trọng trữ lượng tài nguyên thiên nhiên',
    feynman_explanation:
      'Khi chúng ta khai thác nước ngầm, dầu mỏ hay rừng nhanh hơn tốc độ tự nhiên có thể tái tạo, kho tài nguyên bị rút cạn dần — quá trình vơi cạn đó gọi là "depletion".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Natural Resources / Overpopulation / Energy)',
      usage_note: 'Kết hợp rất chuẩn với "resource", "ozone", "groundwater", và "soil fertility".'
    },
    upgrade_from: 'using up / running out of (B1)',
    current_word: 'depletion (C1)',
    synonyms_upgrade: {
      basic_b1: 'using up',
      academic_b2_c1: ['exhaustion', 'diminution', 'dwindling'],
      mastery_c2: ['depletion', 'overexploitation']
    },
    word_family: {
      noun: ['depletion'],
      verb: ['deplete'],
      adj: ['depleted']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'rapid resource depletion', meaning_vi: 'sự cạn kiệt tài nguyên nhanh chóng' },
      { category: 'Noun + Prep', phrase: 'depletion of natural reserves', meaning_vi: 'sự suy kiệt các nguồn dự trữ tự nhiên' },
      { category: 'Adj + Noun', phrase: 'groundwater depletion', meaning_vi: 'sự cạn kiệt nguồn nước ngầm' },
      { category: 'Verb + Noun', phrase: 'halt the depletion of biodiversity', meaning_vi: 'ngăn chặn đà suy giảm đa dạng sinh học' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'In the Mekong Delta, excessive sand mining and groundwater depletion are causing serious riverbank erosion.',
        translation_vi: 'Tại Đồng bằng sông Cửu Long, việc khai thác cát quá mức và sự cạn kiệt nước ngầm đang gây ra sạt lở bờ sông nghiêm trọng.',
        highlight_keyword: 'groundwater depletion'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Unfettered industrial expansion has accelerated the depletion of natural reserves, jeopardising the ecological security of future generations.',
        translation_vi: 'Sự mở rộng công nghiệp không kiểm soát đã đẩy nhanh sự cạn kiệt các nguồn dự trữ tự nhiên, đe dọa an ninh sinh thái của các thế hệ tương lai.',
        highlight_keyword: 'depletion of natural reserves'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Transitioning to a circular economy is essential to counter rapid resource depletion and minimise landfill waste.',
        translation_vi: 'Chuyển đổi sang nền kinh tế tuần hoàn là điều thiết yếu để chống lại sự cạn kiệt tài nguyên nhanh chóng và giảm thiểu rác thải chôn lấp.',
        highlight_keyword: 'rapid resource depletion'
      }
    ]
  },
  {
    id: 'oxf-env-03',
    word: 'degradation',
    pos: 'noun',
    ipa_uk: '/ˌdeɡ.rəˈdeɪ.ʃən/',
    ipa_us: '/ˌdeɡ.rəˈdeɪ.ʃən/',
    cefr_level: 'C1',
    topic: 'environment',
    core_meaning_vi: 'Sự suy thoái, sự xuống cấp nghiêm trọng về chất lượng môi trường hoặc đất đai',
    feynman_explanation:
      'Nếu "depletion" là bị vơi đi về số lượng (cạn kiệt), thì "degradation" là bị hỏng đi về chất lượng (đất bạc màu, sông ngòi ô nhiễm, rừng suy thoái).',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Environment / Agriculture / Urbanization)',
      usage_note: 'Cụm "environmental degradation" là cụm danh từ chuẩn mực nhất để thay thế cho từ "pollution" lặp đi lặp lại.'
    },
    upgrade_from: 'damage to the environment (B1)',
    current_word: 'environmental degradation (C1)',
    synonyms_upgrade: {
      basic_b1: 'environmental damage',
      academic_b2_c1: ['deterioration', 'ecological decline'],
      mastery_c2: ['environmental degradation', 'despoliation']
    },
    word_family: {
      noun: ['degradation'],
      verb: ['degrade'],
      adj: ['degraded', 'degrading']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'irreversible environmental degradation', meaning_vi: 'sự suy thoái môi trường không thể đảo ngược' },
      { category: 'Adj + Noun', phrase: 'severe soil degradation', meaning_vi: 'sự thoái hóa/bạc màu đất nghiêm trọng' },
      { category: 'Verb + Noun', phrase: 'reverse ecological degradation', meaning_vi: 'đảo ngược quá trình suy thoái sinh thái' },
      { category: 'Noun + Prep', phrase: 'degradation of marine habitats', meaning_vi: 'sự xuống cấp của các môi trường sống dưới biển' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Mass tourism without proper waste management often leads to the rapid degradation of coastal beaches.',
        translation_vi: 'Du lịch đại chúng mà không có quản lý rác thải hợp lý thường dẫn đến sự xuống cấp nhanh chóng của các bãi biển ven bờ.',
        highlight_keyword: 'degradation'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Prioritising short-term GDP growth at the expense of conservation inevitably results in irreversible environmental degradation.',
        translation_vi: 'Ưu tiên tăng trưởng GDP ngắn hạn bất chấp công tác bảo tồn tất yếu sẽ dẫn đến sự suy thoái môi trường không thể đảo ngược.',
        highlight_keyword: 'irreversible environmental degradation'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Overuse of synthetic chemical fertilisers has caused severe soil degradation across intensive farming regions.',
        translation_vi: 'Việc lạm dụng phân bón hóa học tổng hợp đã gây ra tình trạng thoái hóa đất nghiêm trọng trên khắp các vùng canh tác thâm canh.',
        highlight_keyword: 'severe soil degradation'
      }
    ]
  },
  {
    id: 'oxf-env-04',
    word: 'finite',
    pos: 'adj',
    ipa_uk: '/ˈfaɪ.naɪt/',
    ipa_us: '/ˈfaɪ.naɪt/',
    cefr_level: 'C1',
    topic: 'environment',
    core_meaning_vi: 'Hữu hạn, có giới hạn nhất định (sớm muộn cũng cạn kiệt)',
    feynman_explanation:
      'Trái Đất chỉ có một lượng dầu mỏ, than đá và nước ngọt nhất định — chúng không phải vô tận. Từ học thuật chính xác nhất để chỉ tính "hữu hạn" đó là "finite" (đối lập với "infinite").',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Energy / Space Exploration / Public Budget)',
      usage_note: 'Chữ "i" đầu tiên đọc là /aɪ/ (/ˈfaɪ.naɪt/), khác với cách đọc của "infinite" (/ˈɪn.fɪ.nət/).'
    },
    upgrade_from: 'limited (B1)',
    current_word: 'finite (C1)',
    synonyms_upgrade: {
      basic_b1: 'limited',
      academic_b2_c1: ['restricted', 'exhaustible', 'scarce'],
      mastery_c2: ['finite', 'non-renewable']
    },
    word_family: {
      noun: ['finitude', 'finiteness'],
      adj: ['finite', 'infinite'],
      adv: ['finitely']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'finite natural resources', meaning_vi: 'nguồn tài nguyên thiên nhiên hữu hạn' },
      { category: 'Adj + Noun', phrase: 'finite fossil-fuel reserves', meaning_vi: 'trữ lượng nhiên liệu hóa thạch hữu hạn' },
      { category: 'Adj + Noun', phrase: 'a finite planetary capacity', meaning_vi: 'sức chứa hữu hạn của hành tinh' },
      { category: 'Adj + Noun', phrase: 'finite public funds', meaning_vi: 'nguồn ngân sách công có hạn' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'We all have a finite amount of energy each day, so learning to prioritise important tasks is crucial.',
        translation_vi: 'Tất cả chúng ta đều có một quỹ năng lượng hữu hạn mỗi ngày, vì vậy học cách ưu tiên các nhiệm vụ quan trọng là rất cần thiết.',
        highlight_keyword: 'finite'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Infinite economic expansion is fundamentally incompatible with a biosphere governed by finite natural resources.',
        translation_vi: 'Sự mở rộng kinh tế vô hạn về cơ bản là không tương thích với một sinh quyển bị giới hạn bởi các nguồn tài nguyên thiên nhiên hữu hạn.',
        highlight_keyword: 'finite natural resources'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Governments must allocate finite public funds judiciously between immediate healthcare needs and long-term infrastructure.',
        translation_vi: 'Chính phủ phải phân bổ nguồn ngân sách công hữu hạn một cách khôn ngoan giữa nhu cầu y tế trước mắt và cơ sở hạ tầng dài hạn.',
        highlight_keyword: 'finite public funds'
      }
    ]
  },
  {
    id: 'oxf-env-05',
    word: 'viable',
    pos: 'adj',
    ipa_uk: '/ˈvaɪ.ə.bəl/',
    ipa_us: '/ˈvaɪ.ə.bəl/',
    cefr_level: 'C1',
    topic: 'environment',
    core_meaning_vi: 'Khả thi, có thể thực hiện và duy trì hiệu quả lâu dài trên thực tế',
    feynman_explanation:
      'Một giải pháp không chỉ thực hiện được trên lý thuyết ("possible") mà còn đủ kinh phí, công nghệ để sống tốt và phát triển bền vững ngoài đời thực thì gọi là "viable".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Đề xuất giải pháp - Problem/Solution Essays)',
      usage_note: 'Cụm "a viable alternative" (một giải pháp thay thế khả thi) là vũ khí sắc bén trong mọi bài luận IELTS.'
    },
    upgrade_from: 'possible / workable (B1)',
    current_word: 'viable (C1)',
    synonyms_upgrade: {
      basic_b1: 'possible',
      academic_b2_c1: ['feasible', 'workable', 'practical'],
      mastery_c2: ['viable', 'economically tenable']
    },
    word_family: {
      noun: ['viability'],
      adj: ['viable'],
      adv: ['viably']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'a viable alternative to fossil fuels', meaning_vi: 'một giải pháp thay thế khả thi cho nhiên liệu hóa thạch' },
      { category: 'Adv + Adj/Verb', phrase: 'economically viable', meaning_vi: 'khả thi về mặt kinh tế' },
      { category: 'Adv + Adj/Verb', phrase: 'commercially viable', meaning_vi: 'có tính khả thi thương mại' },
      { category: 'Verb + Noun', phrase: 'assess the long-term viability', meaning_vi: 'đánh giá tính khả thi dài hạn' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'With improved metro lines, commuting by public transport is finally becoming a viable option for city residents.',
        translation_vi: 'Với các tuyến tàu điện được cải thiện, việc đi làm bằng phương tiện công cộng cuối cùng đã trở thành một lựa chọn khả thi cho cư dân thành phố.',
        highlight_keyword: 'viable'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Technological breakthroughs in battery storage have made solar and wind power a viable alternative to fossil fuels.',
        translation_vi: 'Những đột phá công nghệ trong lưu trữ pin đã biến điện mặt trời và điện gió thành một giải pháp thay thế khả thi cho nhiên liệu hóa thạch.',
        highlight_keyword: 'a viable alternative to fossil fuels'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'State subsidies are often necessary during the initial phase until green hydrogen becomes commercially viable.',
        translation_vi: 'Trợ cấp nhà nước thường cần thiết trong giai đoạn đầu cho đến khi năng lượng hydro xanh trở nên khả thi về mặt thương mại.',
        highlight_keyword: 'commercially viable'
      }
    ]
  },
  {
    id: 'oxf-env-06',
    word: 'catastrophic',
    pos: 'adj',
    ipa_uk: '/ˌkæt.əˈstrɒf.ɪk/',
    ipa_us: '/ˌkæt̬.əˈstrɑː.fɪk/',
    cefr_level: 'C1',
    topic: 'environment',
    core_meaning_vi: 'Mang tính thảm khốc, gây hậu quả tai hại khôn lường',
    feynman_explanation:
      'Mạnh hơn "bad" hay "serious" rất nhiều: "catastrophic" chỉ những biến cố hoặc hậu quả có sức tàn phá trên diện rộng (như mực nước biển dâng nhấn chìm đồng bằng hay sụp đổ hệ sinh thái).',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Climate Crisis / Global Risks)',
      usage_note: 'Chỉ dùng cho các vấn đề vĩ mô thực sự nghiêm trọng (biến đổi khí hậu, dịch bệnh, sụp đổ sinh thái).'
    },
    upgrade_from: 'very bad / terrible (B1)',
    current_word: 'catastrophic (C1)',
    synonyms_upgrade: {
      basic_b1: 'terrible',
      academic_b2_c1: ['devastating', 'disastrous', 'calamitous'],
      mastery_c2: ['catastrophic', 'apocalyptic']
    },
    word_family: {
      noun: ['catastrophe'],
      adj: ['catastrophic'],
      adv: ['catastrophically']
    },
    collocations: [
      { category: 'Adj + Noun', phrase: 'catastrophic consequences', meaning_vi: 'những hậu quả thảm khốc' },
      { category: 'Adj + Noun', phrase: 'catastrophic biodiversity loss', meaning_vi: 'sự suy giảm đa dạng sinh học ở mức thảm họa' },
      { category: 'Verb + Noun', phrase: 'avert a catastrophic climate crisis', meaning_vi: 'ngăn chặn một cuộc khủng hoảng khí hậu thảm khốc' },
      { category: 'Adj + Noun', phrase: 'catastrophic weather events', meaning_vi: 'các hiện tượng thời tiết cực đoan thảm khốc' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Recent super typhoons have shown how catastrophic extreme weather can be for coastal communities.',
        translation_vi: 'Những cơn siêu bão gần đây đã cho thấy thời tiết cực đoan có thể gây hậu quả thảm khốc như thế nào đối với các cộng đồng ven biển.',
        highlight_keyword: 'catastrophic'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Failure to limit global temperature rise to 1.5 degrees Celsius will entail catastrophic consequences for low-lying island nations.',
        translation_vi: 'Việc không thể giới hạn mức tăng nhiệt độ toàn cầu ở ngưỡng 1,5 độ C sẽ kéo theo những hậu quả thảm khốc cho các quốc đảo vùng trũng.',
        highlight_keyword: 'catastrophic consequences'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Decisive multilateral cooperation is the only way humanity can avert a catastrophic climate crisis.',
        translation_vi: 'Hợp tác đa phương quyết liệt là con đường duy nhất để nhân loại ngăn chặn một cuộc khủng hoảng khí hậu thảm khốc.',
        highlight_keyword: 'avert a catastrophic climate crisis'
      }
    ]
  },

  // ===========================================================================
  // CHỦ ĐỀ 5: HIGH-IMPACT ACADEMIC VERBS (6 TỪ)
  // ===========================================================================
  {
    id: 'oxf-verb-01',
    word: 'exacerbate',
    pos: 'verb',
    ipa_uk: '/ɪɡˈzæs.ə.beɪt/',
    ipa_us: '/ɪɡˈzæs.ɚ.beɪt/',
    cefr_level: 'C2',
    topic: 'academic_verbs',
    core_meaning_vi: 'Làm trầm trọng thêm, làm tồi tệ hơn (một vấn đề, căn bệnh hoặc khủng hoảng)',
    feynman_explanation:
      'Khi một vấn đề vốn đã xấu (như kẹt xe hoặc bất bình đẳng) lại bị một yếu tố khác đổ thêm dầu vào lửa khiến nó tệ hơn nữa, động từ chuẩn xác nhất là "exacerbate".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Mọi chủ đề nguyên nhân - hệ quả)',
      usage_note: 'Chỉ đi với tân ngữ mang nghĩa tiêu cực (problem, crisis, inequality, congestion, tension).'
    },
    upgrade_from: 'make worse (B1)',
    current_word: 'exacerbate (C2)',
    synonyms_upgrade: {
      basic_b1: 'make worse',
      academic_b2_c1: ['worsen', 'aggravate', 'compound'],
      mastery_c2: ['exacerbate', 'inflame']
    },
    word_family: {
      noun: ['exacerbation'],
      verb: ['exacerbate'],
      adj: ['exacerbated']
    },
    collocations: [
      { category: 'Verb + Noun', phrase: 'exacerbate social inequalities', meaning_vi: 'làm trầm trọng thêm sự bất bình đẳng xã hội' },
      { category: 'Verb + Noun', phrase: 'exacerbate urban traffic congestion', meaning_vi: 'làm trầm trọng thêm tình trạng ùn tắc giao thông đô thị' },
      { category: 'Adv + Adj/Verb', phrase: 'further exacerbate the crisis', meaning_vi: 'làm cuộc khủng hoảng thêm phần trầm trọng' },
      { category: 'Verb + Noun', phrase: 'exacerbate existing tensions', meaning_vi: 'làm leo thang những căng thẳng sẵn có' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Lack of sleep will only exacerbate your stress levels during the final exam week.',
        translation_vi: 'Thiếu ngủ sẽ chỉ làm trầm trọng thêm mức độ căng thẳng của bạn trong tuần thi cuối kỳ.',
        highlight_keyword: 'exacerbate'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Unregulated rural-to-urban migration tends to exacerbate urban traffic congestion and strain municipal housing infrastructure.',
        translation_vi: 'Làn sóng di cư từ nông thôn ra thành thị không được quy hoạch có xu hướng làm trầm trọng thêm nạn ùn tắc giao thông đô thị và gây quá tải hạ tầng nhà ở thành phố.',
        highlight_keyword: 'exacerbate urban traffic congestion'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Skyrocketing tuition fees threaten to further exacerbate social inequalities by pricing disadvantaged students out of higher education.',
        translation_vi: 'Học phí tăng vọt đe dọa làm trầm trọng thêm sự bất bình đẳng xã hội khi đẩy sinh viên nghèo ra khỏi cánh cửa đại học.',
        highlight_keyword: 'exacerbate social inequalities'
      }
    ]
  },
  {
    id: 'oxf-verb-02',
    word: 'mitigate',
    pos: 'verb',
    ipa_uk: '/ˈmɪt.ɪ.ɡeɪt/',
    ipa_us: '/ˈmɪt̬.ə.ɡeɪt/',
    cefr_level: 'C1',
    topic: 'academic_verbs',
    core_meaning_vi: 'Giảm thiểu, làm dịu bớt mức độ nghiêm trọng hoặc tác hại của một vấn đề',
    feynman_explanation:
      'Đôi khi chúng ta không thể xóa bỏ hoàn toàn 100% thiên tai hay rủi ro kinh tế, nhưng chúng ta có thể làm cho thiệt hại của nó nhẹ đi rất nhiều — hành động "giảm nhẹ tác hại" đó là "mitigate".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Đoạn thân bài nêu giải pháp) & Speaking Part 3',
      usage_note: 'Cặp bài trùng đối nghĩa hoàn hảo với "exacerbate": exacerbate a problem vs mitigate the impact.'
    },
    upgrade_from: 'reduce / make less bad (B1)',
    current_word: 'mitigate (C1)',
    synonyms_upgrade: {
      basic_b1: 'reduce',
      academic_b2_c1: ['alleviate', 'lessen', 'curb'],
      mastery_c2: ['mitigate', 'attenuate', 'ameliorate']
    },
    word_family: {
      noun: ['mitigation'],
      verb: ['mitigate'],
      adj: ['mitigating']
    },
    collocations: [
      { category: 'Verb + Noun', phrase: 'mitigate the adverse effects', meaning_vi: 'giảm thiểu các tác động bất lợi' },
      { category: 'Verb + Noun', phrase: 'mitigate environmental risks', meaning_vi: 'giảm thiểu rủi ro môi trường' },
      { category: 'Verb + Noun', phrase: 'mitigate financial hardship', meaning_vi: 'làm dịu bớt khó khăn tài chính' },
      { category: 'Adj + Noun', phrase: 'effective mitigation strategies', meaning_vi: 'các chiến lược giảm thiểu hiệu quả' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Planting more trees along city streets is a simple way to mitigate the summer heat.',
        translation_vi: 'Trồng thêm cây xanh dọc các tuyến phố là một cách đơn giản để làm dịu bớt cái nóng mùa hè.',
        highlight_keyword: 'mitigate'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Proactive government intervention is indispensable to mitigate the adverse effects of automation on low-skilled labourers.',
        translation_vi: 'Sự can thiệp chủ động của chính phủ là không thể thiếu nhằm giảm thiểu các tác động bất lợi của tự động hóa đối với lao động phổ thông.',
        highlight_keyword: 'mitigate the adverse effects'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Coastal cities must invest in mangrove restoration and seawalls as effective mitigation strategies against rising sea levels.',
        translation_vi: 'Các thành phố ven biển phải đầu tư phục hồi rừng ngập mặn và đê biển như những chiến lược giảm thiểu hiệu quả trước mực nước biển dâng.',
        highlight_keyword: 'effective mitigation strategies'
      }
    ]
  },
  {
    id: 'oxf-verb-03',
    word: 'corroborate',
    pos: 'verb',
    ipa_uk: '/kəˈrɒb.ə.reɪt/',
    ipa_us: '/kəˈrɑː.bə.reɪt/',
    cefr_level: 'C2',
    topic: 'academic_verbs',
    core_meaning_vi: 'Củng cố, xác nhận tính xác thực của một giả thuyết/luận điểm bằng bằng chứng thực nghiệm',
    feynman_explanation:
      'Khi một nhà khoa học đưa ra ý kiến và một nghiên cứu độc lập khác cung cấp số liệu chứng minh ý kiến đó hoàn toàn đúng, hành động "cung cấp bằng chứng xác nhận" đó gọi là "corroborate".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Đưa dẫn chứng học thuật) & Academic Reading',
      usage_note: 'Thay thế xuất sắc cho "prove" hoặc "support" khi trích dẫn nghiên cứu khoa học.'
    },
    upgrade_from: 'prove / support (B1)',
    current_word: 'corroborate (C2)',
    synonyms_upgrade: {
      basic_b1: 'support',
      academic_b2_c1: ['confirm', 'validate', 'substantiate'],
      mastery_c2: ['corroborate', 'buttress']
    },
    word_family: {
      noun: ['corroboration'],
      verb: ['corroborate'],
      adj: ['corroborative', 'corroborating']
    },
    collocations: [
      { category: 'Verb + Noun', phrase: 'corroborate the hypothesis', meaning_vi: 'củng cố/xác nhận giả thuyết' },
      { category: 'Adj + Noun', phrase: 'corroborating empirical evidence', meaning_vi: 'bằng chứng thực nghiệm củng cố luận điểm' },
      { category: 'Adv + Adj/Verb', phrase: 'strongly corroborate the claim', meaning_vi: 'xác nhận mạnh mẽ nhận định' },
      { category: 'Verb + Noun', phrase: 'corroborate witness testimony', meaning_vi: 'xác thực lời khai nhân chứng' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Before sharing a sensational news story online, I always check reputable sources to corroborate the facts.',
        translation_vi: 'Trước khi chia sẻ một bản tin giật gân trên mạng, tôi luôn kiểm tra các nguồn uy tín để xác thực thông tin.',
        highlight_keyword: 'corroborate'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Longitudinal neurological studies strongly corroborate the claim that chronic sleep deprivation impairs memory consolidation.',
        translation_vi: 'Các nghiên cứu thần kinh học dài hạn xác nhận mạnh mẽ nhận định rằng tình trạng thiếu ngủ mãn tính làm suy giảm quá trình củng cố trí nhớ.',
        highlight_keyword: 'strongly corroborate the claim'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Archaeological excavations in the region have provided corroborating empirical evidence of ancient maritime trade routes.',
        translation_vi: 'Các cuộc khai quật khảo cổ trong khu vực đã cung cấp bằng chứng thực nghiệm xác thực các tuyến giao thương hàng hải cổ đại.',
        highlight_keyword: 'corroborating empirical evidence'
      }
    ]
  },
  {
    id: 'oxf-verb-04',
    word: 'proliferate',
    pos: 'verb',
    ipa_uk: '/prəˈlɪf.ə.reɪt/',
    ipa_us: '/prəˈlɪf.ə.reɪt/',
    cefr_level: 'C2',
    topic: 'academic_verbs',
    core_meaning_vi: 'Sinh sôi, bùng nổ nhanh chóng về số lượng trong thời gian ngắn',
    feynman_explanation:
      'Khi các quán trà sữa, ứng dụng AI hay tin giả mọc lên như nấm sau mưa khắp mọi nơi chỉ trong thời gian ngắn, động từ chuẩn C2 để miêu tả sự bùng nổ số lượng đó là "proliferate".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 1 & Task 2 (Mô tả xu hướng tăng bùng nổ)',
      usage_note: 'Nội động từ (intransitive verb) — không có dạng bị động. Danh từ "proliferation" dùng cực kỳ phổ biến.'
    },
    upgrade_from: 'increase quickly / spread fast (B1)',
    current_word: 'proliferate (C2)',
    synonyms_upgrade: {
      basic_b1: 'grow fast',
      academic_b2_c1: ['multiply', 'mushroom', 'escalate'],
      mastery_c2: ['proliferate', 'burgeon']
    },
    word_family: {
      noun: ['proliferation'],
      verb: ['proliferate'],
      adj: ['prolific']
    },
    collocations: [
      { category: 'Noun + Prep', phrase: 'the rapid proliferation of', meaning_vi: 'sự bùng nổ nhanh chóng của...' },
      { category: 'Adv + Adj/Verb', phrase: 'proliferate at an unprecedented rate', meaning_vi: 'sinh sôi/phát triển với tốc độ chưa từng có' },
      { category: 'Verb + Noun', phrase: 'prevent nuclear proliferation', meaning_vi: 'ngăn chặn sự phổ biến vũ khí hạt nhân' },
      { category: 'Noun + Prep', phrase: 'proliferation of misinformation', meaning_vi: 'sự lan tràn của thông tin sai lệch' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Co-working spaces have begun to proliferate in my neighbourhood as more people switch to remote jobs.',
        translation_vi: 'Các không gian làm việc chung đã bắt đầu mọc lên nhanh chóng ở khu phố của tôi khi ngày càng nhiều người chuyển sang làm việc từ xa.',
        highlight_keyword: 'proliferate'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'The rapid proliferation of unverified misinformation on social media platforms poses a grave threat to public health campaigns.',
        translation_vi: 'Sự bùng nổ nhanh chóng của các thông tin sai lệch chưa kiểm chứng trên mạng xã hội đặt ra mối đe dọa nghiêm trọng cho các chiến dịch y tế cộng đồng.',
        highlight_keyword: 'The rapid proliferation of'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Short-form video applications have continued to proliferate at an unprecedented rate, reshaping global advertising revenue.',
        translation_vi: 'Các ứng dụng video ngắn tiếp tục bùng nổ với tốc độ chưa từng có, định hình lại doanh thu quảng cáo toàn cầu.',
        highlight_keyword: 'proliferate at an unprecedented rate'
      }
    ]
  },
  {
    id: 'oxf-verb-05',
    word: 'engender',
    pos: 'verb',
    ipa_uk: '/ɪnˈdʒen.dər/',
    ipa_us: '/ɪnˈdʒen.dɚ/',
    cefr_level: 'C2',
    topic: 'academic_verbs',
    core_meaning_vi: 'Sản sinh ra, khơi dậy, làm nảy sinh (một cảm xúc, thái độ hoặc hoàn cảnh xã hội)',
    feynman_explanation:
      'Thay vì dùng "cause" hay "create" ở mọi câu, khi bạn muốn nói một chính sách hoặc sự kiện làm nảy sinh niềm tin, sự thù địch, hay lòng tự hào dân tộc, hãy dùng "engender".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 (Văn phong học thuật trang trọng C2)',
      usage_note: 'Tân ngữ đi sau "engender" thường là danh từ trừu tượng (trust, hostility, controversy, sense of belonging).'
    },
    upgrade_from: 'cause / create (B1)',
    current_word: 'engender (C2)',
    synonyms_upgrade: {
      basic_b1: 'create',
      academic_b2_c1: ['generate', 'foster', 'induce'],
      mastery_c2: ['engender', 'beget']
    },
    word_family: {
      verb: ['engender']
    },
    collocations: [
      { category: 'Verb + Noun', phrase: 'engender mutual trust', meaning_vi: 'tạo dựng/khơi dậy niềm tin lẫn nhau' },
      { category: 'Verb + Noun', phrase: 'engender a sense of belonging', meaning_vi: 'nuôi dưỡng cảm giác gắn kết, thuộc về cộng đồng' },
      { category: 'Verb + Noun', phrase: 'engender fierce controversy', meaning_vi: 'làm dấy lên cuộc tranh cãi gay gắt' },
      { category: 'Verb + Noun', phrase: 'engender social cohesion', meaning_vi: 'tạo nên sự gắn kết xã hội' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Open and honest communication from a team leader always helps engender mutual trust among colleagues.',
        translation_vi: 'Sự giao tiếp cởi mở và chân thành từ người trưởng nhóm luôn giúp tạo dựng niềm tin lẫn nhau giữa các đồng nghiệp.',
        highlight_keyword: 'engender mutual trust'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Inclusive urban planning that preserves historical landmarks can engender a sense of belonging among diverse city dwellers.',
        translation_vi: 'Quy hoạch đô thị bao trùm gắn liền với bảo tồn các di tích lịch sử có thể khơi dậy cảm giác gắn kết cộng đồng giữa những cư dân thành phố đa dạng.',
        highlight_keyword: 'engender a sense of belonging'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Proposals to replace human judges with automated sentencing algorithms continue to engender fierce controversy.',
        translation_vi: 'Các đề xuất thay thế thẩm phán con người bằng thuật toán tuyên án tự động tiếp tục làm dấy lên cuộc tranh cãi gay gắt.',
        highlight_keyword: 'engender fierce controversy'
      }
    ]
  },
  {
    id: 'oxf-verb-06',
    word: 'undermine',
    pos: 'verb',
    ipa_uk: '/ˌʌn.dəˈmaɪn/',
    ipa_us: '/ˌʌn.dɚˈmaɪn/',
    cefr_level: 'C1',
    topic: 'academic_verbs',
    core_meaning_vi: 'Làm suy yếu ngầm, làm xói mòn dần nền tảng, uy tín hoặc hiệu quả',
    feynman_explanation:
      'Hình ảnh gốc của từ này là đào hầm bên dưới chân một bức tường ("under-mine") khiến bức tường yếu dần rồi sụp đổ. Khi tham nhũng làm suy yếu niềm tin công chúng, hay thiếu ngủ làm suy yếu sức khỏe, ta dùng "undermine".',
    academic_nuance: {
      register: 'Formal',
      exam_application: 'IELTS Writing Task 2 & Speaking Part 3 (Phân tích tác hại ngầm)',
      usage_note: 'Một trong những động từ học thuật linh hoạt và ăn điểm cao nhất trong IELTS Writing.'
    },
    upgrade_from: 'weaken / damage (B1)',
    current_word: 'undermine (C1)',
    synonyms_upgrade: {
      basic_b1: 'weaken',
      academic_b2_c1: ['erode', 'compromise', 'impair'],
      mastery_c2: ['undermine', 'subvert']
    },
    word_family: {
      verb: ['undermine'],
      adj: ['undermined']
    },
    collocations: [
      { category: 'Verb + Noun', phrase: 'undermine public confidence', meaning_vi: 'làm xói mòn niềm tin của công chúng' },
      { category: 'Verb + Noun', phrase: 'undermine academic integrity', meaning_vi: 'làm tổn hại sự liêm chính học thuật' },
      { category: 'Verb + Noun', phrase: 'undermine social stability', meaning_vi: 'làm suy yếu sự ổn định xã hội' },
      { category: 'Adv + Adj/Verb', phrase: 'severely undermine the credibility of', meaning_vi: 'làm suy giảm nghiêm trọng uy tín của...' }
    ],
    examples: [
      {
        context_type: 'Giao tiếp / Speaking thực tế',
        sentence_en: 'Constantly comparing yourself to influencers on Instagram can quietly undermine your self-esteem.',
        translation_vi: 'Việc liên tục so sánh bản thân với những người nổi tiếng trên Instagram có thể âm thầm làm suy yếu lòng tự trọng của bạn.',
        highlight_keyword: 'undermine'
      },
      {
        context_type: 'Học thuật / IELTS Writing',
        sentence_en: 'Unchecked plagiarism using artificial intelligence tools threatens to undermine academic integrity across higher education institutions.',
        translation_vi: 'Nạn đạo văn không kiểm soát bằng các công cụ trí tuệ nhân tạo đe dọa làm tổn hại sự liêm chính học thuật tại các cơ sở giáo dục đại học.',
        highlight_keyword: 'undermine academic integrity'
      },
      {
        context_type: 'Ngữ cảnh mở rộng / Collocation in action',
        sentence_en: 'Frequent policy reversals and lack of transparency can severely undermine the credibility of regulatory authorities.',
        translation_vi: 'Việc đảo ngược chính sách thường xuyên và thiếu minh bạch có thể làm suy giảm nghiêm trọng uy tín của các cơ quan quản lý.',
        highlight_keyword: 'severely undermine the credibility of'
      }
    ]
  }
];

const SPEAKING_DISCOURSE_MARKERS = [
  'From a practical standpoint',
  'Frankly speaking, when we examine modern society',
  'When it comes to long-term development',
  'It is worth noting that in everyday life',
  'Looking at the bigger picture'
];

const ECONOMIST_WRITING_FRAMES = [
  (word: string, acl: string, topic: string) =>
    `Not only does the failure to ${acl} undermine ${topic} resilience, but it also exacerbates systemic disparities across developing nations.`,
  (word: string, acl: string, topic: string) =>
    `Rarely have policymakers confronted a more pressing imperative than the need to ${acl}, without which sustainable ${topic} reform remains elusive.`,
  (word: string, acl: string, topic: string) =>
    `Viewed through the lens of macroeconomic stability, the capacity to ${acl} constitutes a cornerstone of contemporary ${topic} governance.`
];

function buildSeedEnrichedEntry(seed: CompactAcademicSeed, idx: number): EnrichedWordEntry {
  const cleanWord = seed.word.trim();
  const ipaUk = seed.ipa;
  const ipaUs = ipaUk.replace(/ɒ/g, 'ɑː').replace(/ə\(r\)|ər\//g, 'ɚ/');
  const shortMeaning = seed.meaningVi.split(',')[0].toLowerCase().trim();

  const collocations: EnrichedCollocationItem[] = [
    {
      category: seed.pos === 'verb' ? 'Adv + Adj/Verb' : seed.pos === 'adj' ? 'Adj + Noun' : 'Verb + Noun',
      phrase: seed.aclCollocation,
      meaning_vi: `${seed.aclMeaningVi} (Pearson ACL)`
    }
  ];

  if (seed.pos === 'verb') {
    collocations.push(
      {
        category: 'Adv + Adj/Verb',
        phrase: `systematically ${cleanWord}`,
        meaning_vi: `${shortMeaning} một cách có hệ thống`
      },
      {
        category: 'Verb + Noun',
        phrase: `${cleanWord} structural reforms`,
        meaning_vi: `${shortMeaning} các cuộc cải cách mang tính cấu trúc`
      },
      {
        category: 'Academic Phrase',
        phrase: `seek to ${cleanWord} long-term outcomes`,
        meaning_vi: `nỗ lực ${shortMeaning} các kết quả dài hạn`
      },
      {
        category: 'Adv + Adj/Verb',
        phrase: `effectively ${cleanWord} institutional capacity`,
        meaning_vi: `${shortMeaning} năng lực thể chế một cách hiệu quả`
      },
      {
        category: 'Academic Phrase',
        phrase: `collectively ${cleanWord} socioeconomic resilience`,
        meaning_vi: `cùng nhau ${shortMeaning} sức chống chịu kinh tế - xã hội`
      }
    );
  } else if (seed.pos === 'adj') {
    collocations.push(
      {
        category: 'Adv + Adj/Verb',
        phrase: `inherently ${cleanWord}`,
        meaning_vi: `vốn dĩ mang tính ${shortMeaning} về bản chất`
      },
      {
        category: 'Adj + Noun',
        phrase: `${cleanWord} policy implications`,
        meaning_vi: `những hàm ý chính sách mang tính ${shortMeaning}`
      },
      {
        category: 'Academic Phrase',
        phrase: `remain ${cleanWord} to sustainable growth`,
        meaning_vi: `vẫn giữ vai trò ${shortMeaning} đối với tăng trưởng bền vững`
      },
      {
        category: 'Adv + Adj/Verb',
        phrase: `increasingly ${cleanWord} in modern governance`,
        meaning_vi: `ngày càng trở nên ${shortMeaning} trong quản trị hiện đại`
      },
      {
        category: 'Adj + Noun',
        phrase: `${cleanWord} socioeconomic transformation`,
        meaning_vi: `sự chuyển dịch kinh tế - xã hội mang tính ${shortMeaning}`
      }
    );
  } else {
    collocations.push(
      {
        category: 'Adj + Noun',
        phrase: `profound ${cleanWord}`,
        meaning_vi: `sự ${shortMeaning} sâu sắc`
      },
      {
        category: 'Verb + Noun',
        phrase: `address the question of ${cleanWord}`,
        meaning_vi: `giải quyết bài toán về ${shortMeaning}`
      },
      {
        category: 'Noun + Prep',
        phrase: `implications of ${cleanWord} for society`,
        meaning_vi: `những tác động của ${shortMeaning} đối với xã hội`
      },
      {
        category: 'Verb + Noun',
        phrase: `foster sustainable ${cleanWord}`,
        meaning_vi: `thúc đẩy ${shortMeaning} bền vững`
      },
      {
        category: 'Academic Phrase',
        phrase: `serve as a catalyst for ${cleanWord}`,
        meaning_vi: `đóng vai trò chất xúc tác cho ${shortMeaning}`
      }
    );
  }

  const discourseMarker = SPEAKING_DISCOURSE_MARKERS[idx % SPEAKING_DISCOURSE_MARKERS.length];
  const writingBuilder = ECONOMIST_WRITING_FRAMES[idx % ECONOMIST_WRITING_FRAMES.length];

  const actionPhrase =
    seed.pos === 'verb'
      ? seed.aclCollocation
      : `address ${seed.aclCollocation}`;

  const examples: EnrichedExampleItem[] = [
    {
      context_type: 'Giao tiếp / Speaking thực tế',
      sentence_en: `${discourseMarker}, people are starting to realize how vital it is to ${actionPhrase} in our daily lives.`,
      translation_vi: `[IELTS Speaking Part 3 / VSTEP] Xét trên góc độ thực tế, mọi người đang dần nhận ra tầm quan trọng sống còn của việc "${seed.aclMeaningVi}" trong đời sống hàng ngày.`,
      highlight_keyword: seed.aclCollocation
    },
    {
      context_type: 'Học thuật / IELTS Writing',
      sentence_en: writingBuilder(cleanWord, actionPhrase, seed.topic),
      translation_vi: `[IELTS Writing Task 2 / The Economist Style] Không những việc không thể "${seed.aclMeaningVi}" làm suy yếu sức chống chịu của lĩnh vực ${seed.topic}, mà nó còn làm trầm trọng thêm những bất bình đẳng hệ thống.`,
      highlight_keyword: cleanWord
    },
    {
      context_type: 'Ngữ cảnh mở rộng / Collocation in action',
      sentence_en: `Empirical studies published in leading journals underscore that institutions must ${actionPhrase} to navigate 21st-century challenges.`,
      translation_vi: `[Collocation in Context - Pearson ACL] Các nghiên cứu thực nghiệm công bố trên tạp chí hàng đầu nhấn mạnh rằng các định chế phải "${seed.aclMeaningVi}" để vượt qua thách thức thế kỷ 21.`,
      highlight_keyword: seed.aclCollocation
    }
  ];

  return {
    id: `awl-oxf-${idx + 1}-${cleanWord.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    word: cleanWord,
    pos: seed.pos,
    ipa_uk: ipaUk,
    ipa_us: ipaUs,
    cefr_level: seed.cefr,
    topic: seed.topic,
    source_corpus: seed.source,
    core_meaning_vi: seed.meaningVi,
    feynman_explanation: `Thay vì dùng cụm từ phổ thông "${seed.upgradeFromB1}" (B1), các bài báo học thuật trên The Economist và giám khảo IELTS 8.0+ dùng "${cleanWord}" (${seed.source}) để diễn đạt chính xác sắc thái "${seed.meaningVi.toLowerCase()}" chỉ trong một từ đắt giá.`,
    academic_nuance: {
      register: 'Formal',
      exam_application: `${seed.source} • IELTS Writing Task 2 (${seed.topic.toUpperCase()}) & Academic Reading`,
      usage_note: `Kết hợp trực tiếp trong cụm Pearson ACL "${seed.aclCollocation}" (${seed.aclMeaningVi}) để ăn trọn điểm tiêu chí Lexical Resource.`
    },
    upgrade_from: `${seed.upgradeFromB1} (B1)`,
    current_word: `${cleanWord} (${seed.cefr})`,
    synonyms_upgrade: {
      basic_b1: seed.upgradeFromB1,
      academic_b2_c1: [cleanWord, seed.aclCollocation.split(' ')[0]],
      mastery_c2: [cleanWord, seed.aclCollocation]
    },
    word_family: {
      [seed.pos === 'adj' ? 'adj' : seed.pos === 'verb' ? 'verb' : seed.pos === 'adv' ? 'adv' : 'noun']: [cleanWord]
    },
    collocations: collocations.slice(0, 6),
    examples
  };
}

function padCollocationsToSix(entry: EnrichedWordEntry): EnrichedCollocationItem[] {
  const existing = [...entry.collocations];
  if (existing.length >= 6) return existing.slice(0, 6);
  const w = entry.word;
  const shortVi = entry.core_meaning_vi.split(',')[0].toLowerCase().trim();
  const extras: EnrichedCollocationItem[] =
    entry.pos === 'verb'
      ? [
          {
            category: 'Adv + Adj/Verb',
            phrase: `systematically ${w}`,
            meaning_vi: `${shortVi} một cách có hệ thống`
          },
          {
            category: 'Academic Phrase',
            phrase: `seek to ${w} long-term stability`,
            meaning_vi: `nỗ lực ${shortVi} sự ổn định dài hạn`
          },
          {
            category: 'Verb + Noun',
            phrase: `${w} institutional reforms`,
            meaning_vi: `${shortVi} các cải cách thể chế`
          }
        ]
      : entry.pos === 'adj'
      ? [
          {
            category: 'Adv + Adj/Verb',
            phrase: `increasingly ${w}`,
            meaning_vi: `ngày càng mang tính ${shortVi}`
          },
          {
            category: 'Adj + Noun',
            phrase: `${w} policy framework`,
            meaning_vi: `khung chính sách mang tính ${shortVi}`
          },
          {
            category: 'Academic Phrase',
            phrase: `prove ${w} in contemporary society`,
            meaning_vi: `chứng tỏ tính ${shortVi} trong xã hội đương đại`
          }
        ]
      : [
          {
            category: 'Adj + Noun',
            phrase: `far-reaching ${w}`,
            meaning_vi: `sự ${shortVi} có tầm ảnh hưởng sâu rộng`
          },
          {
            category: 'Verb + Noun',
            phrase: `examine the dynamics of ${w}`,
            meaning_vi: `phân tích động lực của ${shortVi}`
          },
          {
            category: 'Noun + Prep',
            phrase: `implications of ${w} for public policy`,
            meaning_vi: `những hàm ý của ${shortVi} đối với chính sách công`
          }
        ];
  for (const ex of extras) {
    if (existing.length >= 6) break;
    if (!existing.some((c) => c.phrase.toLowerCase() === ex.phrase.toLowerCase())) {
      existing.push(ex);
    }
  }
  return existing.slice(0, 6);
}

/**
 * HỢP NHẤT ĐỢT 1: 600+ TỪ VỰNG C1-C2 TỪ AWL (COXHEAD), OXFORD 5000 & PEARSON ACL
 */
export const AUTHORITATIVE_600_LEXICON: EnrichedWordEntry[] = (() => {
  const seen = new Set<string>();
  const merged: EnrichedWordEntry[] = [];

  for (const entry of OXFORD_ACADEMIC_30_LEXICON) {
    const key = entry.word.toLowerCase().trim();
    seen.add(key);
    merged.push({
      ...entry,
      collocations: padCollocationsToSix(entry),
      source_corpus: entry.source_corpus || 'Oxford 5000 (CEFR C1-C2)'
    });
  }

  ALL_600_AUTHORITATIVE_SEEDS.forEach((seed, idx) => {
    const key = seed.word.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(buildSeedEnrichedEntry(seed, idx));
    } else {
      const existingIdx = merged.findIndex((m) => m.word.toLowerCase().trim() === key);
      if (existingIdx >= 0) {
        merged[existingIdx] = {
          ...merged[existingIdx],
          collocations: padCollocationsToSix(merged[existingIdx]),
          source_corpus: seed.source
        };
      }
    }
  });

  return merged;
})();

const ENRICHED_BY_WORD_MAP = new Map<string, EnrichedWordEntry>(
  AUTHORITATIVE_600_LEXICON.map((entry) => [entry.word.toLowerCase().trim(), entry])
);

const POS_UPGRADE_FALLBACK: Record<string, { b1: string; c1: string[]; c2: string[] }> = {
  noun: {
    b1: 'important factor / issue',
    c1: ['pivotal determinant', 'structural dimension'],
    c2: ['salient phenomenon', 'cornerstone']
  },
  verb: {
    b1: 'change / affect',
    c1: ['transform', 'facilitate', 'cultivate'],
    c2: ['catalyse', 'engender', 'reconfigure']
  },
  adj: {
    b1: 'important / big',
    c1: ['substantial', 'compelling', 'pronounced'],
    c2: ['paramount', 'indispensable', 'far-reaching']
  },
  adv: {
    b1: 'very / really',
    c1: ['significantly', 'markedly', 'considerably'],
    c2: ['profoundly', 'exponentially', 'inextricably']
  }
};

function getCorpusTagSlug(source?: AuthoritativeCorpusSource): string {
  switch (source) {
    case 'AWL Sublist 1 (Coxhead)':
      return 'awl-sublist-1';
    case 'AWL Sublist 2 (Coxhead)':
      return 'awl-sublist-2';
    case 'AWL Sublist 3-5 (Coxhead)':
      return 'awl-sublist-3-5';
    case 'Pearson ACL Corpus':
      return 'pearson-acl';
    default:
      return 'oxford-5000-c1';
  }
}

/**
 * Chuyển đổi trọn bộ 600+ từ học thuật C1-C2 (AWL Sublists 1-5, Oxford 5000, Pearson ACL)
 * sang định dạng VocabItem để hợp nhất trực tiếp vào Tổng Kho Từ Điển mà không chạm vào 17 file gốc.
 */
export function getAuthoritative600AsVocabItems(): VocabItem[] {
  return AUTHORITATIVE_600_LEXICON.map((entry) => ({
    id: entry.id,
    word: entry.word,
    pos: (entry.pos as any) || 'noun',
    ipa: entry.ipa_uk,
    meaning: entry.core_meaning_vi,
    level: entry.cefr_level,
    tags: [
      entry.topic === 'academic_verbs' ? 'science' : entry.topic,
      'oxford-c1-c2',
      getCorpusTagSlug(entry.source_corpus)
    ],
    collocations: entry.collocations.slice(0, 6).map((c) => `${c.phrase} (${c.meaning_vi})`),
    exampleEn: entry.examples[1]?.sentence_en || entry.examples[0]?.sentence_en || '',
    exampleVi: entry.examples[1]?.translation_vi || entry.examples[0]?.translation_vi || '',
    detailedNote: `[${entry.source_corpus || 'Oxford 5000'}] ${entry.feynman_explanation} • [Nâng cấp từ: ${entry.upgrade_from} → ${entry.current_word}]`
  }));
}

/** Backward-compatible alias trả về trọn bộ 600+ từ học thuật C1-C2 */
export function getOxford30AsVocabItems(): VocabItem[] {
  return getAuthoritative600AsVocabItems();
}

/**
 * Đảm bảo 100% tương thích ngược (Backward Compatibility):
 * Nếu một từ trong kho 3.666+ từ khớp với 600+ từ AWL/Oxford/Pearson ACL, trả về hồ sơ chuẩn quốc tế;
 * nếu chưa có, tự động tổng hợp đầy đủ các trường Oxford/Cambridge/Longman (6 collocations & 3 examples).
 */
export function resolveEnrichedWordEntry(item: VocabItem): EnrichedWordEntry {
  const cleanKey = (item.word || '').toLowerCase().trim();
  const matched = ENRICHED_BY_WORD_MAP.get(cleanKey);
  if (matched) {
    return matched;
  }

  const word = item.word || 'academic term';
  const pos = item.pos || 'noun';
  const ipaUk = item.ipa || `/${word.toLowerCase()}/`;
  const ipaUs = ipaUk.replace(/ɒ/g, 'ɑː').replace(/ə\(r\)|ər\//g, 'ɚ/');
  const level = (item.level as 'B1' | 'B2' | 'C1' | 'C2') || 'C1';
  const topic = (item.tags && item.tags[0]) || 'academic';
  const coreMeaning = item.meaning || 'Thuật ngữ học thuật IELTS trọng tâm';
  const shortMeaning = coreMeaning.split(',')[0].toLowerCase().trim();

  // Xây dựng danh sách 6 Collocations chuẩn phân loại từ dữ liệu hiện có + mẫu học thuật theo từ loại
  const rawColls = Array.isArray(item.collocations) ? item.collocations : [];
  const enrichedCollocations: EnrichedCollocationItem[] = rawColls.slice(0, 6).map((raw, idx) => {
    const categories: CollocationCategory[] = [
      'Verb + Noun',
      'Adj + Noun',
      'Adv + Adj/Verb',
      'Academic Phrase',
      'Noun + Prep',
      'Academic Phrase'
    ];
    return {
      category: categories[idx % categories.length],
      phrase: raw,
      meaning_vi: `Cụm kết hợp thực chiến với "${word}" (${shortMeaning})`
    };
  });

  if (enrichedCollocations.length < 6) {
    if (pos === 'verb') {
      enrichedCollocations.push(
        {
          category: 'Adv + Adj/Verb',
          phrase: `significantly ${word}`,
          meaning_vi: `${shortMeaning} một cách đáng kể`
        },
        {
          category: 'Academic Phrase',
          phrase: `seek to ${word} long-term outcomes`,
          meaning_vi: `hướng tới việc ${shortMeaning} các kết quả dài hạn`
        },
        {
          category: 'Verb + Noun',
          phrase: `${word} sustainable development`,
          meaning_vi: `${shortMeaning} sự phát triển bền vững`
        },
        {
          category: 'Adv + Adj/Verb',
          phrase: `effectively ${word}`,
          meaning_vi: `${shortMeaning} một cách hiệu quả`
        },
        {
          category: 'Verb + Noun',
          phrase: `${word} institutional capacity`,
          meaning_vi: `${shortMeaning} năng lực thể chế`
        },
        {
          category: 'Academic Phrase',
          phrase: `systematically ${word} policy frameworks`,
          meaning_vi: `${shortMeaning} các khung chính sách một cách có hệ thống`
        }
      );
    } else if (pos === 'adj') {
      enrichedCollocations.push(
        {
          category: 'Adv + Adj/Verb',
          phrase: `increasingly ${word}`,
          meaning_vi: `ngày càng trở nên ${shortMeaning}`
        },
        {
          category: 'Adj + Noun',
          phrase: `${word} socioeconomic implications`,
          meaning_vi: `những hệ lụy kinh tế - xã hội mang tính ${shortMeaning}`
        },
        {
          category: 'Adv + Adj/Verb',
          phrase: `profoundly ${word}`,
          meaning_vi: `${shortMeaning} một cách sâu sắc`
        },
        {
          category: 'Academic Phrase',
          phrase: `remain ${word} in modern society`,
          meaning_vi: `vẫn duy trì tính ${shortMeaning} trong xã hội hiện đại`
        },
        {
          category: 'Adj + Noun',
          phrase: `${word} policy reforms`,
          meaning_vi: `các cuộc cải cách chính sách mang tính ${shortMeaning}`
        },
        {
          category: 'Adv + Adj/Verb',
          phrase: `inherently ${word}`,
          meaning_vi: `vốn dĩ mang tính ${shortMeaning} về bản chất`
        }
      );
    } else {
      enrichedCollocations.push(
        {
          category: 'Adj + Noun',
          phrase: `marked ${word}`,
          meaning_vi: `sự ${shortMeaning} rõ rệt`
        },
        {
          category: 'Verb + Noun',
          phrase: `address the issue of ${word}`,
          meaning_vi: `giải quyết bài toán về ${shortMeaning}`
        },
        {
          category: 'Noun + Prep',
          phrase: `implications of ${word} for society`,
          meaning_vi: `những tác động của ${shortMeaning} đối với xã hội`
        },
        {
          category: 'Verb + Noun',
          phrase: `foster sustainable ${word}`,
          meaning_vi: `thúc đẩy ${shortMeaning} bền vững`
        },
        {
          category: 'Adj + Noun',
          phrase: `profound ${word} in public policy`,
          meaning_vi: `sự ${shortMeaning} sâu sắc trong chính sách công`
        },
        {
          category: 'Academic Phrase',
          phrase: `serve as a catalyst for ${word}`,
          meaning_vi: `đóng vai trò chất xúc tác cho ${shortMeaning}`
        }
      );
    }
  }

  const finalCollocations = enrichedCollocations.slice(0, 6);
  const primaryCollocation = finalCollocations[0]?.phrase.replace(/\s*\(.*?\)\s*/g, '') || word;

  const examples: EnrichedExampleItem[] = [
    {
      context_type: 'Học thuật / IELTS Writing',
      sentence_en:
        item.exampleEn ||
        `Empirical research underscores the pivotal role of ${word} in shaping contemporary public policy and institutional reform.`,
      translation_vi:
        item.exampleVi ||
        `Các nghiên cứu thực nghiệm nhấn mạnh vai trò trọng tâm của "${word}" (${shortMeaning}) trong việc định hình chính sách công và cải cách thể chế đương đại.`,
      highlight_keyword: word
    },
    {
      context_type: 'Ngữ cảnh mở rộng / Collocation in action',
      sentence_en: `Policymakers and educators must collaborate closely to ${
        pos === 'verb' ? primaryCollocation : `leverage ${primaryCollocation}`
      } in a rapidly evolving global landscape.`,
      translation_vi: `Các nhà hoạch định chính sách và nhà giáo dục cần hợp tác chặt chẽ để vận dụng cụm "${primaryCollocation}" (${shortMeaning}) trong bối cảnh toàn cầu biến đổi nhanh chóng.`,
      highlight_keyword: primaryCollocation
    },
    {
      context_type: 'Giao tiếp / Speaking thực tế',
      sentence_en: `In everyday discussions about ${topic}, people increasingly recognise how ${word} shapes our daily choices.`,
      translation_vi: `Trong các cuộc trò chuyện thường ngày về chủ đề ${topic}, mọi người ngày càng nhận ra cách "${word}" (${shortMeaning}) định hình những lựa chọn hàng ngày của chúng ta.`,
      highlight_keyword: word
    }
  ];

  const upgradeTemplate = POS_UPGRADE_FALLBACK[pos] || POS_UPGRADE_FALLBACK.noun;

  return {
    id: item.id,
    word,
    pos,
    ipa_uk: ipaUk,
    ipa_us: ipaUs,
    cefr_level: level,
    topic,
    core_meaning_vi: coreMeaning,
    feynman_explanation:
      item.detailedNote ||
      `Hãy dùng "${word}" (${coreMeaning.toLowerCase()}) khi bạn muốn diễn đạt ý tưởng một cách cô đọng, chuẩn văn phong học thuật thay vì dùng các cụm từ miêu tả dài dòng ở mức B1.`,
    academic_nuance: {
      register: level === 'C1' || level === 'C2' ? 'Formal' : 'Neutral',
      exam_application: `IELTS Writing Task 2 (${topic.toUpperCase()}), Academic Reading & Speaking Part 3`,
      usage_note: `Ưu tiên đặt "${word}" trong câu Topic Sentence hoặc câu luận cứ để nâng điểm tiêu chí Lexical Resource lên Band 7.5 - 8.0+.`
    },
    upgrade_from: `${upgradeTemplate.b1} (B1)`,
    current_word: `${word} (${level})`,
    synonyms_upgrade: {
      basic_b1: upgradeTemplate.b1,
      academic_b2_c1: upgradeTemplate.c1,
      mastery_c2: [word, ...upgradeTemplate.c2]
    },
    word_family: {
      [pos === 'adj' ? 'adj' : pos === 'verb' ? 'verb' : 'noun']: [word]
    },
    collocations: finalCollocations,
    examples
  };
}

/**
 * Helper đồng bộ toàn ứng dụng: Trả về đúng 6 Collocations học thuật cho bất kỳ từ vựng nào
 */
export function getSixCollocationsForWord(item: {
  id?: string;
  word: string;
  pos?: string;
  ipa?: string;
  meaning?: string;
  level?: string;
  tags?: string[];
  collocations?: string[];
  exampleEn?: string;
  exampleVi?: string;
}): string[] {
  const raw = Array.isArray(item.collocations) ? item.collocations.filter(Boolean) : [];
  if (raw.length >= 6) {
    return raw.slice(0, 6);
  }
  const enriched = resolveEnrichedWordEntry({
    id: item.id || item.word,
    word: item.word,
    pos: (item.pos as any) || 'noun',
    ipa: item.ipa || `/${item.word}/`,
    meaning: item.meaning || '',
    level: (item.level as any) || 'C1',
    tags: item.tags || ['academic'],
    collocations: raw,
    exampleEn: item.exampleEn || '',
    exampleVi: item.exampleVi || ''
  });
  const merged: string[] = [...raw];
  for (const c of enriched.collocations) {
    if (merged.length >= 6) break;
    const formatted = c.phrase.includes('(') ? c.phrase : `${c.phrase} (${c.meaning_vi})`;
    const cleanTarget = c.phrase.toLowerCase().trim();
    if (!merged.some((m) => m.toLowerCase().includes(cleanTarget))) {
      merged.push(formatted);
    }
  }
  return merged.slice(0, 6);
}

/**
 * Helper đồng bộ toàn ứng dụng: Trả về 2 câu ví dụ tiếng Anh hoàn chỉnh + 2 câu dịch nghĩa tiếng Việt tương ứng
 */
export function getTwoExamplesForWord(item: {
  id?: string;
  word: string;
  pos?: string;
  ipa?: string;
  meaning?: string;
  level?: string;
  tags?: string[];
  collocations?: string[];
  exampleEn?: string;
  exampleVi?: string;
}): { en1: string; vi1: string; en2: string; vi2: string } {
  const enriched = resolveEnrichedWordEntry({
    id: item.id || item.word,
    word: item.word,
    pos: (item.pos as any) || 'noun',
    ipa: item.ipa || `/${item.word}/`,
    meaning: item.meaning || '',
    level: (item.level as any) || 'C1',
    tags: item.tags || ['academic'],
    collocations: item.collocations || [],
    exampleEn: item.exampleEn || '',
    exampleVi: item.exampleVi || ''
  });

  const en1 =
    item.exampleEn?.trim() ||
    enriched.examples[0]?.sentence_en ||
    `Empirical research underscores the pivotal role of ${item.word} in shaping contemporary policy.`;
  const vi1 =
    item.exampleVi?.trim() ||
    enriched.examples[0]?.translation_vi ||
    `Các nghiên cứu thực nghiệm nhấn mạnh vai trò trọng tâm của "${item.word}" trong việc định hình chính sách đương đại.`;

  // Chọn câu ví dụ thứ 2 khác hoàn toàn với câu ví dụ thứ 1
  const candidate2 =
    enriched.examples.find((ex) => ex.sentence_en.trim() !== en1.trim()) ||
    enriched.examples[1] ||
    enriched.examples[2];

  const en2 =
    candidate2?.sentence_en ||
    `From a macroeconomic perspective, policymakers must carefully evaluate ${item.word} to ensure sustainable long-term outcomes.`;
  const vi2 =
    candidate2?.translation_vi ||
    `Dưới góc nhìn kinh tế vĩ mô, các nhà hoạch định chính sách cần đánh giá kỹ lưỡng "${item.word}" để đảm bảo kết quả bền vững lâu dài.`;

  return { en1, vi1, en2, vi2 };
}

