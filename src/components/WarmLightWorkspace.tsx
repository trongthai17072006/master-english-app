import React, { useState, useMemo, useEffect } from 'react';
import {
  Target,
  BookOpen,
  Flame,
  Calendar,
  Plus,
  ArrowRight,
  Volume2,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  PenTool,
  Mic,
  ClipboardCheck,
  Sparkles,
  BarChart2,
  Edit3,
  Trash2,
  Search,
  X
} from 'lucide-react';
import { AppLayout, WorkspaceMode as LayoutWorkspaceMode } from './AppLayout';
import { SpeedQuiz } from './SpeedQuiz';
import { DistinctionsQuiz } from './DistinctionsQuiz';
import { CollocationsQuiz } from './CollocationsQuiz';
import { ContextQuiz } from './ContextQuiz';
import { FlashcardsMode } from './FlashcardsMode';
import { MistakeBank } from './MistakeBank';
import { InteractiveNodeMatching } from './InteractiveNodeMatching';
import { ExpandedExamplesLibrary } from './ExpandedExamplesLibrary';
import { VocabDirectory, removeVietnameseTones } from './VocabDirectory';
import { IeltsChallengePage } from './challenge/IeltsChallengePage';
import { TutorExplanationData } from './LiveAiTutorModal';
import { CHALLENGE_60_DAYS } from '../data/challenge60Data';
import { VOCAB_DATABASE, VocabItem } from '../data/vocabularyData';
import { getOxford30AsVocabItems } from '../data/academicLexiconEnrichment';
import { loadCustomContentStore, CUSTOM_CONTENT_EVENT } from '../services/customContentStore';
import { speakWord } from '../utils/soundAndSpeech';
import { UserStats, getStats } from '../utils/storage';
import { getLocalDateString } from '../services/learningStorage';
import { useAnalytics } from '../context/AnalyticsContext';
import { TaskItem, getDayTaskProgress, createDefaultRoadmapDay } from '../services/milestoneEngine';
import {
  VINTAGE_EDITORIAL_ASSETS,
  VintageEngravingFrame,
  VintageCatHeadphonesBanner,
  VintageBigBenKeepGoingBanner,
  VintageTowerBridgeEngraving
} from './VintageNewspaperIllustrations';

export type WorkspaceMode =
  | 'dashboard'
  | 'speed'
  | 'structures'
  | 'structure'
  | 'example-library'
  | 'flashcards'
  | 'collocations'
  | 'distinctions'
  | 'matching'
  | 'node-matching'
  | 'context'
  | 'directory'
  | 'mistakes'
  | 'challenge-60'
  | 'schedule';

export interface WarmLightWorkspaceProps {
  initialMode?: WorkspaceMode;
  activeMode?: WorkspaceMode;
  onModeChange?: (mode: WorkspaceMode) => void;
  onSelectMode?: (mode: WorkspaceMode) => void;
  onOpenAnalytics?: () => void;
  onOpenProfile?: () => void;
  onOpenTutor?: (data?: TutorExplanationData) => void;
  onOpenChallenge?: () => void;
  stats?: UserStats;
  masteredCount?: number;
  totalWords?: number;
  mistakesCount?: number;
  onRefreshStats?: () => void;
}

interface SpotlightWordItem {
  id: string;
  word: string;
  ipa: string;
  pos: string;
  posShort: string;
  meaning: string;
  collocationPattern: string;
  collocationExample: string;
  example: string;
  wordFamily: string[];
  synonyms: string;
  antonyms: string;
  register: string;
  writingTask: string;
  speakingPart: string;
}

const SPOTLIGHT_WORDS: SpotlightWordItem[] = [
  {
    id: 'spot-conducive',
    word: 'conducive',
    ipa: '/kənˈdʒuː.sɪv/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Tạo điều kiện thuận lợi, thúc đẩy kết quả tích cực',
    collocationPattern: 'be conducive to learning / growth',
    collocationExample: 'create an environment conducive to productivity',
    example: 'Quiet library spaces are highly conducive to deep academic concentration.',
    wordFamily: ['conducive (adj)', 'conduciveness (n)'],
    synonyms: 'favorable',
    antonyms: 'unfavorable',
    register: 'Formal',
    writingTask: 'Task 2',
    speakingPart: 'Part 2 & 3'
  },
  {
    id: 'spot-impeccable',
    word: 'impeccable',
    ipa: '/ɪmˈpek.ə.bəl/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Hoàn hảo, chuẩn mực, không một chút tì vết hay sai sót',
    collocationPattern: 'maintain impeccable standards / credentials',
    collocationExample: 'demonstrate impeccable academic integrity and precision',
    example: 'Her research paper demonstrated impeccable methodological rigor and analytical depth.',
    wordFamily: ['impeccable (adj)', 'impeccably (adv)', 'impeccability (n)'],
    synonyms: 'flawless',
    antonyms: 'defective',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 2 & 3'
  },
  {
    id: 'spot-discrepancy',
    word: 'discrepancy',
    ipa: '/dɪsˈkrep.ən.si/',
    pos: 'noun',
    posShort: 'n.',
    meaning: 'Sự sai lệch, bất nhất giữa các số liệu/tài liệu',
    collocationPattern: 'discrepancy between A and B',
    collocationExample: 'a significant discrepancy between the reports',
    example: 'The auditor identified a notable discrepancy between the invoice and the inventory.',
    wordFamily: ['discrepant (adj)', 'discrepancy (n)', 'discrepancies (n)'],
    synonyms: 'inconsistency',
    antonyms: 'conformity',
    register: 'Formal',
    writingTask: 'Task 1 & 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-mitigate',
    word: 'mitigate',
    ipa: '/ˈmɪt.ɪ.ɡeɪt/',
    pos: 'verb',
    posShort: 'v.',
    meaning: 'Làm dịu, giảm thiểu mức độ nghiêm trọng của rủi ro',
    collocationPattern: 'mitigate the impact of A',
    collocationExample: 'mitigate the adverse effects of climate change',
    example: 'Strict urban regulations are enacted to mitigate industrial pollution.',
    wordFamily: ['mitigate (v)', 'mitigation (n)', 'mitigating (adj)'],
    synonyms: 'alleviate',
    antonyms: 'aggravate',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-pragmatic',
    word: 'pragmatic',
    ipa: '/præɡˈmæt.ɪk/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Thực tế, thực dụng, ưu tiên tính ứng dụng cao',
    collocationPattern: 'adopt a pragmatic approach',
    collocationExample: 'take a pragmatic stance on economic reform',
    example: 'The government took a pragmatic stance to stimulate post-crisis economic growth.',
    wordFamily: ['pragmatic (adj)', 'pragmatically (adv)', 'pragmatism (n)'],
    synonyms: 'practical',
    antonyms: 'idealistic',
    register: 'Formal',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-ubiquitous',
    word: 'ubiquitous',
    ipa: '/juːˈbɪk.wɪ.təs/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Hiện diện ở khắp mọi nơi, phổ biến toàn cầu',
    collocationPattern: 'become ubiquitous in modern life',
    collocationExample: 'ubiquitous digital connectivity across societies',
    example: 'Smartphones have become ubiquitous in both developing and advanced economies.',
    wordFamily: ['ubiquitous (adj)', 'ubiquitously (adv)', 'ubiquity (n)'],
    synonyms: 'omnipresent',
    antonyms: 'rare',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-unprecedented',
    word: 'unprecedented',
    ipa: '/ʌnˈpres.ɪ.den.tɪd/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Chưa từng có tiền lệ, mang quy mô đột phá trong lịch sử',
    collocationPattern: 'at an unprecedented rate / scale',
    collocationExample: 'witness unprecedented technological transformation',
    example: 'Artificial intelligence is reshaping the global workforce at an unprecedented pace.',
    wordFamily: ['unprecedented (adj)', 'unprecedentedly (adv)', 'precedent (n)'],
    synonyms: 'unparalleled',
    antonyms: 'conventional',
    register: 'Academic',
    writingTask: 'Task 1 & 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-corroborate',
    word: 'corroborate',
    ipa: '/kəˈrɒb.ə.reɪt/',
    pos: 'verb',
    posShort: 'v.',
    meaning: 'Củng cố, xác nhận tính chính xác của giả thuyết bằng bằng chứng',
    collocationPattern: 'corroborate a hypothesis / finding',
    collocationExample: 'empirical data to corroborate the initial claim',
    example: 'Recent longitudinal studies corroborate the link between sleep deprivation and cognitive decline.',
    wordFamily: ['corroborate (v)', 'corroboration (n)', 'corroborative (adj)'],
    synonyms: 'substantiate',
    antonyms: 'contradict',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-exacerbate',
    word: 'exacerbate',
    ipa: '/ɪɡˈzæs.ə.beɪt/',
    pos: 'verb',
    posShort: 'v.',
    meaning: 'Làm trầm trọng thêm một vấn đề hoặc tình trạng tiêu cực',
    collocationPattern: 'exacerbate existing disparities',
    collocationExample: 'exacerbate urban traffic congestion and emissions',
    example: 'Unchecked urbanization can exacerbate socioeconomic inequalities in megacities.',
    wordFamily: ['exacerbate (v)', 'exacerbation (n)'],
    synonyms: 'aggravate',
    antonyms: 'ameliorate',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-proliferation',
    word: 'proliferation',
    ipa: '/prəˌlɪf.əˈreɪ.ʃən/',
    pos: 'noun',
    posShort: 'n.',
    meaning: 'Sự gia tăng nhanh chóng, bùng nổ về số lượng',
    collocationPattern: 'the rapid proliferation of A',
    collocationExample: 'the proliferation of short-form digital media',
    example: 'The proliferation of e-commerce platforms has revolutionized consumer purchasing habits.',
    wordFamily: ['proliferate (v)', 'proliferation (n)', 'prolific (adj)'],
    synonyms: 'escalation',
    antonyms: 'depletion',
    register: 'Academic',
    writingTask: 'Task 1 & 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-catalyst',
    word: 'catalyst',
    ipa: '/ˈkæt.əl.ɪst/',
    pos: 'noun',
    posShort: 'n.',
    meaning: 'Chất xúc tác, nhân tố thúc đẩy sự thay đổi nhanh chóng',
    collocationPattern: 'act as a catalyst for change',
    collocationExample: 'serve as a primary catalyst for innovation',
    example: 'Public investment in renewable energy acts as a powerful catalyst for green job creation.',
    wordFamily: ['catalyst (n)', 'catalyze (v)', 'catalytic (adj)'],
    synonyms: 'stimulus',
    antonyms: 'deterrent',
    register: 'Formal',
    writingTask: 'Task 2',
    speakingPart: 'Part 2 & 3'
  },
  {
    id: 'spot-indispensable',
    word: 'indispensable',
    ipa: '/ˌɪn.dɪˈspen.sə.bəl/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Cực kỳ thiết yếu, không thể thiếu được',
    collocationPattern: 'play an indispensable role in A',
    collocationExample: 'an indispensable component of modern education',
    example: 'Critical thinking is an indispensable skill for navigating online misinformation.',
    wordFamily: ['indispensable (adj)', 'indispensability (n)', 'dispensable (adj)'],
    synonyms: 'vital',
    antonyms: 'superfluous',
    register: 'Formal',
    writingTask: 'Task 2',
    speakingPart: 'Part 1, 2 & 3'
  },
  {
    id: 'spot-scrutinize',
    word: 'scrutinize',
    ipa: '/ˈskruː.tɪ.naɪz/',
    pos: 'verb',
    posShort: 'v.',
    meaning: 'Xem xét, kiểm tra, phân tích tỉ mỉ từng chi tiết',
    collocationPattern: 'closely scrutinize the evidence',
    collocationExample: 'scrutinize corporate environmental claims',
    example: 'Regulators must closely scrutinize the privacy policies of multinational tech firms.',
    wordFamily: ['scrutinize (v)', 'scrutiny (n)', 'unscrutinized (adj)'],
    synonyms: 'inspect',
    antonyms: 'overlook',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-detrimental',
    word: 'detrimental',
    ipa: '/ˌdet.rɪˈmen.təl/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Gây hại, bất lợi, có tác động tiêu cực rõ rệt',
    collocationPattern: 'have a detrimental effect on A',
    collocationExample: 'prove detrimental to adolescent mental health',
    example: 'Excessive screen time before sleep is detrimental to neurological recovery.',
    wordFamily: ['detrimental (adj)', 'detrimentally (adv)', 'detriment (n)'],
    synonyms: 'deleterious',
    antonyms: 'beneficial',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-paradigm',
    word: 'paradigm',
    ipa: '/ˈpær.ə.daɪm/',
    pos: 'noun',
    posShort: 'n.',
    meaning: 'Mô hình mẫu, hệ quy chiếu tư duy chuẩn mực',
    collocationPattern: 'a fundamental paradigm shift in A',
    collocationExample: 'trigger a paradigm shift in remote healthcare',
    example: 'Cloud computing has triggered a paradigm shift in how enterprises manage infrastructure.',
    wordFamily: ['paradigm (n)', 'paradigmatic (adj)'],
    synonyms: 'framework',
    antonyms: 'anomaly',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-meticulous',
    word: 'meticulous',
    ipa: '/məˈtɪk.jə.ləs/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Tỉ mỉ, kỹ lưỡng, cẩn trọng đến từng chi tiết nhỏ',
    collocationPattern: 'require meticulous planning / attention',
    collocationExample: 'meticulous attention to architectural detail',
    example: 'Restoring ancient historical manuscripts requires meticulous care and specialized expertise.',
    wordFamily: ['meticulous (adj)', 'meticulously (adv)', 'meticulousness (n)'],
    synonyms: 'thorough',
    antonyms: 'negligent',
    register: 'Formal',
    writingTask: 'Task 2',
    speakingPart: 'Part 2'
  },
  {
    id: 'spot-empirical',
    word: 'empirical',
    ipa: '/ɪmˈpɪr.ɪ.kəl/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Dựa trên quan sát, số liệu thực nghiệm thay vì suy đoán lý thuyết',
    collocationPattern: 'provide empirical evidence / findings',
    collocationExample: 'substantiate a claim with empirical data',
    example: 'Policy reforms should be grounded in rigorous empirical evidence rather than ideological assumptions.',
    wordFamily: ['empirical (adj)', 'empirically (adv)', 'empiricism (n)'],
    synonyms: 'observational',
    antonyms: 'conjectural',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-ameliorate',
    word: 'ameliorate',
    ipa: '/əˈmiː.li.ə.reɪt/',
    pos: 'verb',
    posShort: 'v.',
    meaning: 'Cải thiện, làm cho một tình trạng khó khăn trở nên tốt đẹp hơn',
    collocationPattern: 'ameliorate living conditions / poverty',
    collocationExample: 'targeted subsidies to ameliorate housing shortages',
    example: 'Targeted social welfare programs can significantly ameliorate urban poverty.',
    wordFamily: ['ameliorate (v)', 'amelioration (n)', 'ameliorative (adj)'],
    synonyms: 'alleviate',
    antonyms: 'exacerbate',
    register: 'Formal',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-ramification',
    word: 'ramification',
    ipa: '/ˌræm.ɪ.fɪˈkeɪ.ʃən/',
    pos: 'noun',
    posShort: 'n.',
    meaning: 'Hệ lụy phức tạp, hệ quả dây chuyền khó lường của một quyết định',
    collocationPattern: 'far-reaching ramifications for society',
    collocationExample: 'assess the long-term economic ramifications',
    example: 'Unregulated genetic engineering carries profound ethical ramifications for future generations.',
    wordFamily: ['ramification (n)', 'ramifications (n)', 'ramify (v)'],
    synonyms: 'consequence',
    antonyms: 'origin',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-substantiate',
    word: 'substantiate',
    ipa: '/səbˈstæn.ʃi.eɪt/',
    pos: 'verb',
    posShort: 'v.',
    meaning: 'Chứng minh, làm rõ tính xác thực của luận điểm bằng dẫn chứng cụ thể',
    collocationPattern: 'substantiate an allegation / argument',
    collocationExample: 'provide statistical proof to substantiate the thesis',
    example: 'Candidates must substantiate their central arguments with concrete real-world examples.',
    wordFamily: ['substantiate (v)', 'substantiation (n)', 'unsubstantiated (adj)'],
    synonyms: 'corroborate',
    antonyms: 'refute',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-equivocal',
    word: 'equivocal',
    ipa: '/ɪˈkwɪv.ə.kəl/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Mập mờ, đa nghĩa, chưa rõ ràng hoặc có nhiều cách hiểu trái chiều',
    collocationPattern: 'remain equivocal about the outcome',
    collocationExample: 'yield equivocal empirical results',
    example: 'Initial clinical trials yielded equivocal results regarding the long-term efficacy of the treatment.',
    wordFamily: ['equivocal (adj)', 'equivocally (adv)', 'unequivocal (adj)'],
    synonyms: 'ambiguous',
    antonyms: 'unambiguous',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-foster',
    word: 'foster',
    ipa: '/ˈfɒs.tər/',
    pos: 'verb',
    posShort: 'v.',
    meaning: 'Nuôi dưỡng, thúc đẩy sự hình thành và phát triển bền vững',
    collocationPattern: 'foster a sense of community / innovation',
    collocationExample: 'foster interdisciplinary collaboration in universities',
    example: 'Inclusive educational curricula foster critical inquiry and cross-cultural empathy among students.',
    wordFamily: ['foster (v)', 'fostering (n)'],
    synonyms: 'cultivate',
    antonyms: 'stifle',
    register: 'Formal',
    writingTask: 'Task 2',
    speakingPart: 'Part 2 & 3'
  },
  {
    id: 'spot-egalitarian',
    word: 'egalitarian',
    ipa: '/ɪˌɡæl.ɪˈteə.ri.ən/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Bình đẳng, đảm bảo mọi công dân đều có quyền lợi và cơ hội ngang nhau',
    collocationPattern: 'build an egalitarian society / system',
    collocationExample: 'promote egalitarian access to higher education',
    example: 'Universal public healthcare is a cornerstone of a truly egalitarian society.',
    wordFamily: ['egalitarian (adj/n)', 'egalitarianism (n)'],
    synonyms: 'equitable',
    antonyms: 'elitist',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-stringent',
    word: 'stringent',
    ipa: '/ˈstrɪn.dʒənt/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Nghiêm ngặt, chặt chẽ, đòi hỏi tuân thủ cao (luật lệ, tiêu chuẩn)',
    collocationPattern: 'impose stringent regulations / criteria',
    collocationExample: 'meet stringent environmental safety standards',
    example: 'Governments must enforce stringent carbon emission standards on heavy manufacturing industries.',
    wordFamily: ['stringent (adj)', 'stringently (adv)', 'stringency (n)'],
    synonyms: 'rigorous',
    antonyms: 'lenient',
    register: 'Formal',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-culminate',
    word: 'culminate',
    ipa: '/ˈkʌl.mɪ.neɪt/',
    pos: 'verb',
    posShort: 'v.',
    meaning: 'Đạt đến đỉnh điểm, kết thúc bằng một kết quả trọng đại sau quá trình dài',
    collocationPattern: 'culminate in a historic agreement',
    collocationExample: 'decades of research culminating in a breakthrough',
    example: 'Months of diplomatic negotiations culminated in a landmark multilateral climate treaty.',
    wordFamily: ['culminate (v)', 'culmination (n)'],
    synonyms: 'climax',
    antonyms: 'commence',
    register: 'Academic',
    writingTask: 'Task 1 & 2',
    speakingPart: 'Part 2 & 3'
  },
  {
    id: 'spot-dichotomy',
    word: 'dichotomy',
    ipa: '/daɪˈkɒt.ə.mi/',
    pos: 'noun',
    posShort: 'n.',
    meaning: 'Sự phân chia đối lập thành hai thái cực tách biệt nhau',
    collocationPattern: 'a false dichotomy between A and B',
    collocationExample: 'the dichotomy between economic growth and conservation',
    example: 'Modern policymakers reject the false dichotomy between economic prosperity and ecological preservation.',
    wordFamily: ['dichotomy (n)', 'dichotomous (adj)'],
    synonyms: 'polarity',
    antonyms: 'harmony',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-repercussion',
    word: 'repercussion',
    ipa: '/ˌriː.pəˈkʌʃ.ən/',
    pos: 'noun',
    posShort: 'n.',
    meaning: 'Hậu quả, tác động dội ngược lại (thường là tiêu cực) sau một sự kiện',
    collocationPattern: 'suffer severe economic repercussions',
    collocationExample: 'unintended repercussions of monetary tightening',
    example: 'Protectionist trade tariffs often trigger severe repercussions across global supply chains.',
    wordFamily: ['repercussion (n)', 'repercussions (n)'],
    synonyms: 'fallout',
    antonyms: 'cause',
    register: 'Formal',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-bolster',
    word: 'bolster',
    ipa: '/ˈbəʊl.stər/',
    pos: 'verb',
    posShort: 'v.',
    meaning: 'Củng cố, nâng đỡ, tăng cường sức mạnh hoặc niềm tin',
    collocationPattern: 'bolster public confidence / the economy',
    collocationExample: 'bolster the credibility of empirical research',
    example: 'Infrastructure investment is essential to bolster long-term regional competitiveness.',
    wordFamily: ['bolster (v/n)'],
    synonyms: 'reinforce',
    antonyms: 'undermine',
    register: 'Formal',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-viable',
    word: 'viable',
    ipa: '/ˈvaɪ.ə.bəl/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Khả thi, có khả năng thực hiện và duy trì hiệu quả lâu dài',
    collocationPattern: 'a economically viable alternative',
    collocationExample: 'offer a viable solution to urban congestion',
    example: 'Solar and wind power have become economically viable alternatives to fossil fuels.',
    wordFamily: ['viable (adj)', 'viably (adv)', 'viability (n)'],
    synonyms: 'feasible',
    antonyms: 'impractical',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  },
  {
    id: 'spot-intrinsic',
    word: 'intrinsic',
    ipa: '/ɪnˈtrɪn.zɪk/',
    pos: 'adjective',
    posShort: 'adj.',
    meaning: 'Nội tại, thuộc về bản chất cốt lõi bên trong của sự vật',
    collocationPattern: 'have intrinsic value / merit',
    collocationExample: 'an intrinsic component of cultural heritage',
    example: 'Arts education possesses intrinsic value beyond its immediate economic utility.',
    wordFamily: ['intrinsic (adj)', 'intrinsically (adv)'],
    synonyms: 'inherent',
    antonyms: 'extrinsic',
    register: 'Academic',
    writingTask: 'Task 2',
    speakingPart: 'Part 3'
  }
];

function normalizeLayoutMode(mode: WorkspaceMode): LayoutWorkspaceMode {
  if (mode === 'structure' || mode === 'example-library') return 'structures';
  if (mode === 'node-matching') return 'matching';
  if (mode === 'schedule') return 'dashboard';
  return mode as LayoutWorkspaceMode;
}

export const WarmLightWorkspace: React.FC<WarmLightWorkspaceProps> = ({
  initialMode = 'dashboard',
  activeMode: controlledMode,
  onModeChange,
  onSelectMode: propOnSelectMode,
  onOpenAnalytics,
  onOpenProfile,
  onOpenTutor,
  masteredCount: propMasteredCount,
  totalWords: propTotalWords,
  mistakesCount: propMistakesCount,
  onRefreshStats
}) => {
  const {
    realStreak,
    userLevel,
    roadmapDays,
    currentDayNumber,
    setCurrentDayNumber,
    toggleTask,
    cycleTaskStatus,
    updateTaskTitle,
    addCustomTask,
    deleteTask,
    mistakesCount: contextMistakesCount,
    totalUniqueMasteredWords,
    totalUniqueWordsInDatabase,
    challengeSummary,
    completedSessions,
    activeSession,
    userProfile,
    recordLearningWord,
    wordProgressMap,
    refreshStorageState,
    showToast
  } = useAnalytics();

  const [internalMode, setInternalMode] = useState<WorkspaceMode>(
    controlledMode || initialMode || 'dashboard'
  );

  useEffect(() => {
    if (controlledMode) {
      setInternalMode(controlledMode);
    }
  }, [controlledMode]);

  useEffect(() => {
    if (initialMode) {
      setInternalMode(initialMode);
    }
  }, [initialMode]);

  const activeMode = controlledMode || internalMode;

  const handleSelectMode = (nextMode: WorkspaceMode) => {
    setInternalMode(nextMode);
    onModeChange?.(nextMode);
    propOnSelectMode?.(nextMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onMistakesUpdated = () => {
      refreshStorageState();
      onRefreshStats?.();
    };
    const onAiNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        workspaceMode?: WorkspaceMode;
        filterKeyword?: string;
      }>;
      const targetMode = customEvent.detail?.workspaceMode;
      const kw = customEvent.detail?.filterKeyword || '';
      if (targetMode && targetMode !== ('analytics' as any) && targetMode !== ('profile' as any)) {
        setInternalMode(targetMode);
        onModeChange?.(targetMode);
      }
      if (kw && targetMode === 'structures') {
        const numMatch = kw.match(/(\d+)/);
        if (numMatch) {
          setSelectedLibraryPdfItem(Number(numMatch[1]));
        }
      }
      refreshStorageState();
    };

    window.addEventListener('master-english-mistakes-updated', onMistakesUpdated);
    window.addEventListener('master-english-ai-navigate', onAiNavigate);
    return () => {
      window.removeEventListener('master-english-mistakes-updated', onMistakesUpdated);
      window.removeEventListener('master-english-ai-navigate', onAiNavigate);
    };
  }, [refreshStorageState, onRefreshStats, onModeChange]);

  const verifiedMistakesCount =
    typeof contextMistakesCount === 'number'
      ? contextMistakesCount
      : typeof propMistakesCount === 'number'
        ? propMistakesCount
        : 0;

  const resolvedMasteredCount =
    typeof propMasteredCount === 'number' ? propMasteredCount : totalUniqueMasteredWords || 0;
  const resolvedTotalWords =
    typeof propTotalWords === 'number' ? propTotalWords : totalUniqueWordsInDatabase || 3666;

  const handleMasteryOrMistakeChange = () => {
    refreshStorageState();
    onRefreshStats?.();
  };

  // Spotlight state — starts at index 0 ('conductive') to match Reference Image 1
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [selectedLibraryPdfItem, setSelectedLibraryPdfItem] = useState<number | null>(null);

  const currentWord = SPOTLIGHT_WORDS[spotlightIndex] || SPOTLIGHT_WORDS[0];
  const isCurrentSpotlightSaved = Boolean(wordProgressMap[currentWord.id]?.status === 'mastered');

  const handleNextWord = () => {
    setSpotlightIndex((prev) => (prev + 1) % SPOTLIGHT_WORDS.length);
  };

  const handleSaveSpotlightWord = () => {
    recordLearningWord(currentWord.id, currentWord.word, 'mastered', 'Vocabulary Spotlight', {
      ipa: currentWord.ipa,
      meaning: currentWord.meaning,
      level: 'C1'
    });
    handleMasteryOrMistakeChange();
    showToast(`Đã lưu từ "${currentWord.word}" vào sổ từ vựng!`);
  };

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    speakWord(currentWord.word);
    setTimeout(() => setIsPlayingAudio(false), 1000);
  };

  // Milestone Roadmap Day Tasks Widget State
  const syncedActiveDay = currentDayNumber || challengeSummary.activeDay || 1;
  const handleChangeDayNumber = (nextDay: number) => {
    const clamped = Math.max(1, Math.min(CHALLENGE_60_DAYS.length, nextDay));
    setCurrentDayNumber(clamped);
  };

  const currentRoadmapDay = useMemo(
    () => roadmapDays[syncedActiveDay] || createDefaultRoadmapDay(syncedActiveDay),
    [roadmapDays, syncedActiveDay]
  );
  const todos = currentRoadmapDay.tasks;
  const dayProgress = useMemo(() => getDayTaskProgress(currentRoadmapDay), [currentRoadmapDay]);

  const [newTodoText, setNewTodoText] = useState<string>('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoText, setEditingTodoText] = useState<string>('');

  const handleToggleTodoItem = (taskId: string) => {
    if (editingTodoId === taskId) return;
    toggleTask(syncedActiveDay, taskId);
  };

  const handleCycleTodoItemStatus = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    cycleTaskStatus(syncedActiveDay, taskId);
  };

  const handleStartEditTodo = (e: React.MouseEvent, item: TaskItem) => {
    e.stopPropagation();
    setEditingTodoId(item.id);
    setEditingTodoText(item.title);
  };

  const handleSaveEditTodo = (taskId: string) => {
    const trimmed = editingTodoText.trim();
    if (trimmed) {
      updateTaskTitle(syncedActiveDay, taskId, trimmed);
    }
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  const handleDeleteTodo = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    deleteTask(syncedActiveDay, taskId);
    if (editingTodoId === taskId) {
      setEditingTodoId(null);
      setEditingTodoText('');
    }
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    addCustomTask(syncedActiveDay, newTodoText.trim());
    setNewTodoText('');
  };

  // Current week schedule
  const currentWeekSchedule = useMemo(() => {
    const now = new Date();
    const todayStr = getLocalDateString(now);
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const shortDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const targetModes: WorkspaceMode[] = [
      'collocations',
      'speed',
      'context',
      'distinctions',
      'mistakes',
      'flashcards',
      'challenge-60'
    ];

    return shortDays.map((shortDay, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const dateStr = getLocalDateString(d);
      const isToday = dateStr === todayStr;
      return {
        shortDay,
        dateNum: String(d.getDate()),
        dateStr,
        isToday,
        targetMode: targetModes[index]
      };
    });
  }, [completedSessions, activeSession]);

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(() => {
    const todayIdx = currentWeekSchedule.findIndex((d) => d.isToday);
    return todayIdx >= 0 ? todayIdx : 1; // Default T3 like Reference Image 1
  });

  const activeChallengeDayData = useMemo(() => {
    return CHALLENGE_60_DAYS.find((d) => d.day === syncedActiveDay) || CHALLENGE_60_DAYS[0];
  }, [syncedActiveDay]);

  const challengeProgressPercent = challengeSummary.percentCompleted || 0;
  const completedDaysCount = challengeSummary.completedDays || 0;

  // Progress Ring Math
  const challengeRadius = 31;
  const challengeCircumference = 2 * Math.PI * challengeRadius;
  const challengeDashoffset =
    challengeCircumference * (1 - Math.min(100, Math.max(0, challengeProgressPercent)) / 100);

  const safeTotalWords = Math.max(1, resolvedTotalWords || 3666);
  const masteredPercent =
    resolvedMasteredCount <= 0
      ? 0
      : Math.max(2, Math.min(100, Math.round((resolvedMasteredCount / safeTotalWords) * 100)));
  const masteredRadius = 18;
  const masteredCircumference = 2 * Math.PI * masteredRadius;
  const masteredDashoffset = masteredCircumference * (1 - masteredPercent / 100);

  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [directorySearchSeed, setDirectorySearchSeed] = useState<string>('');
  const [customVocab, setCustomVocab] = useState<VocabItem[]>(() => loadCustomContentStore().customVocab);

  useEffect(() => {
    const refreshCustom = () => setCustomVocab(loadCustomContentStore().customVocab);
    window.addEventListener(CUSTOM_CONTENT_EVENT, refreshCustom);
    return () => window.removeEventListener(CUSTOM_CONTENT_EVENT, refreshCustom);
  }, []);

  const allVocabPool = useMemo(() => {
    const oxfordItems = getOxford30AsVocabItems();
    const seen = new Set<string>();
    const combined: VocabItem[] = [];
    for (const item of [...oxfordItems, ...customVocab, ...VOCAB_DATABASE]) {
      const k = item.word.toLowerCase().trim();
      if (!seen.has(k)) {
        seen.add(k);
        combined.push(item);
      }
    }
    return combined;
  }, [customVocab]);

  const globalSearchResults = useMemo(() => {
    const raw = globalSearchQuery.trim().toLowerCase();
    if (!raw) return [];
    const norm = removeVietnameseTones(raw);
    return allVocabPool
      .filter((item) => {
        const w = item.word.toLowerCase();
        const m = item.meaning.toLowerCase();
        return (
          w.includes(raw) ||
          removeVietnameseTones(w).includes(norm) ||
          m.includes(raw) ||
          removeVietnameseTones(m).includes(norm) ||
          (item.collocations &&
            item.collocations.some(
              (c) => c.toLowerCase().includes(raw) || removeVietnameseTones(c).includes(norm)
            ))
        );
      })
      .slice(0, 12);
  }, [globalSearchQuery, allVocabPool]);

  const handleTriggerGlobalSearch = (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : globalSearchQuery).trim();
    setDirectorySearchSeed(q);
    handleSelectMode('directory');
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('open-vocab-directory-search', {
          detail: { query: q }
        })
      );
    }, 50);
  };

  const expPercent = useMemo(() => {
    const taskPct = Math.round(
      (dayProgress.completedCount / Math.max(1, dayProgress.totalCount)) * 45
    );
    const sessionBonus = (completedSessions.length * 25 + resolvedMasteredCount * 4) % 55;
    const rawTotal = taskPct + sessionBonus;
    if (rawTotal <= 0) return 0;
    return Math.min(98, rawTotal);
  }, [dayProgress.completedCount, dayProgress.totalCount, completedSessions.length, resolvedMasteredCount]);

  // If mode is 'directory' or 'challenge-60', render those dedicated pages inside AppLayout
  if (activeMode === 'directory') {
    return (
      <AppLayout
        activeMode="directory"
        onSelectMode={(m) => handleSelectMode(m)}
        onOpenProfile={() => onOpenProfile?.()}
        onOpenTutor={() => onOpenTutor?.()}
        onOpenAnalytics={onOpenAnalytics}
        mistakeCount={verifiedMistakesCount}
      >
        <VocabDirectory
          onBack={() => handleSelectMode('dashboard')}
          onMasteryChange={handleMasteryOrMistakeChange}
          initialSearchQuery={directorySearchSeed}
        />
      </AppLayout>
    );
  }

  if (activeMode === 'challenge-60') {
    return (
      <AppLayout
        activeMode="challenge-60"
        onSelectMode={(m) => handleSelectMode(m)}
        onOpenProfile={() => onOpenProfile?.()}
        onOpenTutor={() => onOpenTutor?.()}
        onOpenAnalytics={onOpenAnalytics}
        mistakeCount={verifiedMistakesCount}
      >
        <IeltsChallengePage
          onBackToWorkspace={() => handleSelectMode('dashboard')}
          onOpenTutor={(data) => onOpenTutor?.(data)}
        />
      </AppLayout>
    );
  }

  const isDashboardView = activeMode === 'dashboard';

  return (
    <AppLayout
      activeMode={normalizeLayoutMode(activeMode)}
      onSelectMode={(m) => handleSelectMode(m)}
      onOpenProfile={() => onOpenProfile?.()}
      onOpenTutor={() => onOpenTutor?.()}
      onOpenAnalytics={onOpenAnalytics}
      mistakeCount={verifiedMistakesCount}
    >
      <div className="w-full space-y-4">
        {/* =================================================================
            1. TOP EDITORIAL SEARCH & JOURNALIST HEADER BAR
               ("TRANG NHẤT — SỐ PHÁT HÀNH HÔM NAY")
           ================================================================= */}
        <header className="relative w-full newspaper-card border-2 border-[#181614] px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-[3px_3px_0px_#181614]">
          {/* Top Newspaper Edition Masthead Rule */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#493B2D]/50 pb-1.5 mb-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-[#181614] text-[#F1E7D3] font-mono font-bold tracking-widest text-[10px] uppercase">
                TRANG NHẤT — SỐ PHÁT HÀNH HÔM NAY
              </span>
              <span className="text-xs font-serif italic text-[#51483D]">
                “Bản tin tổng hợp tiêu điểm ngôn từ và lịch trình xuất bản hàng ngày.”
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider">
              <span className="text-[#C92532] font-extrabold">
                ACADEMIC
              </span>
            </div>
          </div>

          {/* Search Bar (Left) + Journalist Press Badge (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-3">
            {/* Left: Vintage Search Bar */}
            <div className="lg:col-span-8">
              <div className="relative w-full">
                <div className="flex items-center rounded-[2px] border-2 border-[#181614] bg-[#F1E7D3] overflow-hidden shadow-[2px_2px_0px_#181614]">
                  <Search className="w-4 h-4 text-[#2C2520] ml-3.5 shrink-0" />
                  <input
                    type="text"
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTriggerGlobalSearch();
                      }
                    }}
                    placeholder={`Tra cứu từ vựng, quy chuẩn hành văn hoặc thuật ngữ trong kho ${allVocabPool.length.toLocaleString('vi-VN')} tư liệu...`}
                    className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm font-dm font-medium text-[#181614] placeholder-[#51483D] focus:outline-none"
                  />
                  {globalSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setGlobalSearchQuery('')}
                      className="p-1.5 text-[#2C2520] hover:text-[#C92532] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTriggerGlobalSearch()}
                    className="px-4 py-2 bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] font-oswald font-bold text-xs sm:text-sm uppercase tracking-wider border-l-2 border-[#181614] cursor-pointer shrink-0"
                  >
                    Tra cứu
                  </button>
                </div>

                {globalSearchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-40 rounded-[2px] border-2 border-[#181614] bg-[#F1E7D3] shadow-[4px_4px_0px_#181614] divide-y divide-[#493B2D]/30 max-h-72 overflow-y-auto">
                    {globalSearchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setGlobalSearchQuery('');
                          handleTriggerGlobalSearch(item.word);
                        }}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-[#E9DCC2] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-extrabold text-sm sm:text-base text-[#181614]">
                              {item.word}
                            </span>
                            {item.ipa && (
                              <span className="font-mono text-xs text-[#2C2520]">
                                {item.ipa}
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded-none bg-[#E8B7AC]/70 border border-[#C92532] text-[10px] font-mono font-bold text-[#991D27] uppercase">
                              {item.pos}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm font-dm font-medium text-[#2C2520] truncate mt-0.5">
                            {item.meaning}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#C92532] shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Journalist Press Badge (Avatar + Name + Lv.X) */}
            <div className="lg:col-span-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => onOpenProfile?.()}
                className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-[2px] bg-[#F1E7D3] border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614] hover:border-[#C92532] transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full border-[1.5px] border-[#181614] overflow-hidden bg-[#E9DCC2] shrink-0">
                  <img
                    src={VINTAGE_EDITORIAL_ASSETS.mascot.graduationCap}
                    alt={userProfile.name || 'Nhà báo'}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover scale-[1.12] object-center block"
                  />
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-xs sm:text-sm font-serif font-extrabold text-[#181614]">
                    {userProfile.name || userProfile.email?.split('@')[0] || 'Học viên mới'}
                  </span>
                  <span className="inline-block mt-0.5 px-2 py-0.2 rounded-[2px] bg-[#C92532] text-[#F1E7D3] font-mono text-[10px] font-bold">
                    Lv.{userLevel || 1}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#181614] ml-0.5" />
              </button>
            </div>
          </div>
        </header>

        {/* =================================================================
            2. MAIN WORKSPACE AREA:
               - Internal Practice Modes (!isDashboardView): Mode Switcher + ActiveSessionBar + Active Component
               - Homepage (isDashboardView): 3 Clean Editorial Zones (Zone A, Zone B, Zone C)
           ================================================================= */}
        {!isDashboardView ? (
          <div className="space-y-4">
            {activeMode === 'speed' && (
              <SpeedQuiz
                onMasteryChange={handleMasteryOrMistakeChange}
                onGoToMistakes={() => handleSelectMode('mistakes')}
                onOpenDirectory={() => handleSelectMode('directory')}
                onBackToDashboard={() => handleSelectMode('dashboard')}
              />
            )}

            {(activeMode === 'matching' || activeMode === 'node-matching') && (
              <InteractiveNodeMatching onGoBack={() => handleSelectMode('dashboard')} />
            )}

            {activeMode === 'distinctions' && (
              <DistinctionsQuiz
                onMasteryChange={handleMasteryOrMistakeChange}
                onGoToMistakes={() => handleSelectMode('mistakes')}
                onBackToDashboard={() => handleSelectMode('dashboard')}
              />
            )}

            {activeMode === 'collocations' && (
              <CollocationsQuiz
                onMasteryChange={handleMasteryOrMistakeChange}
                onBackToDashboard={() => handleSelectMode('dashboard')}
              />
            )}

            {activeMode === 'context' && (
              <ContextQuiz
                onMasteryChange={handleMasteryOrMistakeChange}
                onBackToDashboard={() => handleSelectMode('dashboard')}
              />
            )}

            {activeMode === 'flashcards' && (
              <FlashcardsMode
                onMasteryChange={handleMasteryOrMistakeChange}
                onBackToDashboard={() => handleSelectMode('dashboard')}
              />
            )}

            {(activeMode === 'structures' ||
              activeMode === 'structure' ||
              activeMode === 'example-library') && (
              <ExpandedExamplesLibrary
                initialPdfItemNumber={selectedLibraryPdfItem}
                onBackToDashboard={() => handleSelectMode('dashboard')}
              />
            )}

            {activeMode === 'mistakes' && (
              <MistakeBank
                onMistakeChange={handleMasteryOrMistakeChange}
                onBackToDashboard={() => handleSelectMode('dashboard')}
              />
            )}
          </div>
        ) : (
          /* =================================================================
             TRANG NHẤT — 3 CLEAN EDITORIAL ZONES (MATCHING REFERENCE IMAGE)
             Strictly NO timers, NO study hours/session counts, NO duplicate mascots,
             NO cluttered subtext inside buttons/cards.
             ================================================================= */
          <div className="space-y-4">
            {/* ===============================================================
                ZONE A — THE FRONT PAGE HERO & LAUREL CREST (TOP ROW)
               =============================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Left (70% / 8 cols) – Main Editorial Cover Banner (Seamless Woodcut Architecture Composition) */}
              <section
                aria-label="Trang Nhất Hero Banner"
                className="lg:col-span-8 newspaper-card border-2 border-[#181614] shadow-[4px_4px_0px_#181614] relative overflow-hidden p-1.5 flex flex-col justify-between"
              >
                <div className="relative border border-[#493B2D] bg-[#F1E7D3] h-full p-5 sm:p-7 overflow-hidden flex items-center min-h-[248px]">
                  {/* ARCHETYPE A: Single Crisp 19th-Century Westminster Palace & River Thames Engraving on Right 55% */}
                  <div
                    className="pointer-events-none select-none absolute right-0 top-0 bottom-0 w-[62%] sm:w-[58%] overflow-hidden z-0"
                    style={{
                      WebkitMaskImage:
                        'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 18%, black 34%, black 100%)',
                      maskImage:
                        'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.45) 18%, black 34%, black 100%)',
                    }}
                    aria-hidden="true"
                  >
                    <img
                      src={VINTAGE_EDITORIAL_ASSETS.architecture.bigBen}
                      alt="Westminster Palace & Big Ben 19th-Century Engraving"
                      className="w-full h-full object-cover object-right-bottom mix-blend-multiply opacity-90"
                      style={{ filter: 'contrast(1.18) sepia(0.14)' }}
                    />
                  </div>

                  {/* Editorial Typography & Primary Red CTA Focal Point */}
                  <div className="relative z-10 max-w-xl space-y-3.5 text-left">
                    {/* Vintage Header Stamp ("★ MASTER ENGLISH ★") in #DCC9A8 Parchment & #181614 Ink */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div
                        className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#DCC9A8] text-[#181614] border-[1.5px] border-[#493B2D] font-serif font-bold text-xs uppercase tracking-[0.14em]"
                        style={{ backgroundImage: 'var(--grain)' }}
                      >
                        <span className="text-[#493B2D]">★</span>
                        <span className="text-[#181614]">MASTER ENGLISH</span>
                        <span className="text-[#493B2D]">★</span>
                      </div>
                      <span className="text-[#51483D] text-xs tracking-widest select-none" aria-hidden="true">
                        ★ ★ ★
                      </span>
                    </div>

                    {/* Oversized Serif Headline: "Learn English Smarter. Stronger." */}
                    <div className="space-y-1">
                      <h1 className="font-serif font-black text-3xl sm:text-4xl xl:text-[44px] text-[#181614] leading-[1.04] tracking-tight drop-shadow-[0_1px_0_rgba(241,231,211,0.9)]">
                        Learn English
                        <br />
                        <span className="text-[#C92532]">Smarter.</span>{' '}
                        <span className="text-[#181614]">Stronger.</span>
                      </h1>
                    </div>

                    {/* Clean Subtitle */}
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-[1.5px] bg-[#493B2D] hidden sm:inline-block" />
                      <p className="font-serif font-bold text-base sm:text-lg text-[#181614] drop-shadow-[0_1px_0_rgba(241,231,211,0.85)]">
                        Small steps. Big changes.
                      </p>
                      <span className="w-6 h-[1.5px] bg-[#493B2D] hidden sm:inline-block" />
                    </div>

                    {/* Primary Vintage Red Stamp CTA Button — Undisputed Main Focal Point */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleSelectMode('speed')}
                        className="px-6 py-3 rounded-[2px] bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border-2 border-[#181614] shadow-[3px_3px_0px_#181614] font-oswald font-bold text-sm sm:text-base uppercase tracking-wider inline-flex items-center gap-2.5 cursor-pointer transition-all active:translate-y-0.5"
                        style={{ backgroundImage: 'var(--grain)' }}
                      >
                        <span>BẮT ĐẦU SỐ BÁO HÔM NAY</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Right (30% / 4 cols) – Minimalist Editor's Crest (Laurel Wreath + Level + Rank + Streak ONLY — Strictly Preserved) */}
              <section
                aria-label="Dấu Ấn Bút Lực Tòa Soạn"
                className="lg:col-span-4 newspaper-card border-2 border-[#181614] shadow-[4px_4px_0px_#181614] p-1.5 flex flex-col justify-between"
              >
                <div className="relative border border-[#493B2D] bg-[#F1E7D3] h-full p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
                  {/* Subtle Atmospheric Mountain Pagoda Watermark in Background (8% Opacity) */}
                  <div
                    className="pointer-events-none select-none absolute -right-6 -bottom-4 w-48 h-40 opacity-[0.08]"
                    aria-hidden="true"
                  >
                    <img
                      src={VINTAGE_EDITORIAL_ASSETS.architecture.fansipanMountainPagoda}
                      alt=""
                      className="w-full h-full object-cover vintage-print-seamless mask-radial-soft"
                    />
                  </div>

                  {/* Crest Header */}
                  <div className="relative z-10 flex items-center justify-between border-b border-[#493B2D]/50 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[#C92532] text-base leading-none">♛</span>
                      <h2 className="font-serif font-black text-sm sm:text-base uppercase tracking-wider text-[#181614]">
                        DẤU ẤN BÚT LỰC
                      </h2>
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#51483D]">
                      PRESS CREST
                    </span>
                  </div>

                  {/* Center: Vintage Red Laurel Wreath Emblem + Streak Stamp */}
                  <div className="relative z-10 my-3 flex items-center justify-around gap-3">
                    {/* Vintage Red Laurel Wreath SVG Emblem */}
                    <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 140 140">
                        {/* Outer Double Ring */}
                        <circle
                          cx="70"
                          cy="70"
                          r="54"
                          fill="#E9DCC2"
                          stroke="#C92532"
                          strokeWidth="4"
                        />
                        <circle
                          cx="70"
                          cy="70"
                          r="48"
                          fill="none"
                          stroke="#181614"
                          strokeWidth="1.2"
                          strokeDasharray="3 2"
                        />
                        {/* Left & Right Vintage Laurel Branches */}
                        <path
                          d="M32 106 C14 84, 14 48, 38 26"
                          fill="none"
                          stroke="#C92532"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M108 106 C126 84, 126 48, 102 26"
                          fill="none"
                          stroke="#C92532"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Laurel Ribbon Knot at Bottom */}
                        <path
                          d="M52 114 Q70 106 88 114"
                          fill="none"
                          stroke="#991D27"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
                        <span className="font-serif font-black text-2xl sm:text-3xl text-[#181614] leading-none">
                          Lv.{userLevel || 1}
                        </span>
                        <span className="font-serif font-bold text-xs text-[#51483D] mt-1">
                          {(userLevel || 1) >= 10
                            ? 'Tổng Biên Tập'
                            : (userLevel || 1) >= 5
                              ? 'Biên Tập Viên'
                              : 'Phóng Viên Tập Sự'}
                        </span>
                      </div>
                    </div>

                    {/* Clean Streak Stamp Only (NO study hours or session counts) */}
                    <div className="flex flex-col justify-center space-y-2 border-l border-[#493B2D]/40 pl-4">
                      <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#C92532]">
                        <Flame className="w-4 h-4 fill-[#C92532] text-[#C92532]" />
                        <span>CHUỖI XUẤT BẢN</span>
                      </div>
                      <div className="font-serif font-black text-xl sm:text-2xl text-[#181614] leading-tight">
                        {realStreak ?? 0} Ngày Liên Tiếp
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-[#E9DCC2] border border-[#493B2D] font-mono text-[10px] font-bold uppercase text-[#51483D] w-fit">
                        {userProfile.targetBand || 'BAND 7.0+'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Thin Red Ink Progress Bar */}
                  <div className="relative z-10 space-y-1.5 pt-2 border-t border-[#493B2D]/40">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-2.5 bg-[#DCC9A8] border border-[#493B2D] rounded-[2px] overflow-hidden">
                        <div
                          className="h-full bg-[#C92532]"
                          style={{ width: `${expPercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-extrabold text-[#181614] tabular-nums">
                        {expPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* ===============================================================
                ZONE B — EDITORIAL QUICK DISPATCH & LITERARY QUOTE (MIDDLE ROW)
               =============================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Left (60% / 7 cols) – 3 Minimalist Editorial Columns (Quick Access) */}
              <section
                aria-label="Chuyên Mục Trọng Điểm"
                className="lg:col-span-7 newspaper-card border-2 border-[#181614] shadow-[4px_4px_0px_#181614] p-1.5 flex flex-col justify-between"
              >
                <div className="relative border border-[#493B2D] bg-[#F1E7D3] h-full p-4 sm:p-5 flex flex-col justify-between gap-3.5 overflow-hidden">
                  {/* Subtle Temple of Literature (Khuê Văn Các) Atmospheric Watermark */}
                  <div
                    className="pointer-events-none select-none absolute -right-4 -bottom-4 w-56 h-36 opacity-[0.09]"
                    aria-hidden="true"
                  >
                    <img
                      src={VINTAGE_EDITORIAL_ASSETS.architecture.khueVanCac}
                      alt=""
                      className="w-full h-full object-cover vintage-print-seamless mask-radial-soft"
                    />
                  </div>

                  <div className="relative z-10 flex items-center justify-between border-b border-[#493B2D]/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#C92532] text-sm">★</span>
                      <h2 className="font-serif font-black text-sm sm:text-base uppercase tracking-wider text-[#181614]">
                        CHUYÊN MỤC TRỌNG ĐIỂM
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectMode('speed')}
                      className="font-serif font-bold text-xs text-[#181614] hover:text-[#C92532] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Kho Chữ &amp; Thuật Ngữ</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C92532]" />
                    </button>
                  </div>

                  {/* 3 Sharp-Bordered Newspaper Feature Blocks (Icons + Titles ONLY, no filler subtext) */}
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 items-stretch">
                    {/* Block 1: Tổng Kho Tư Liệu */}
                    <button
                      type="button"
                      onClick={() => handleSelectMode('directory')}
                      className="p-4 rounded-[2px] bg-[#E9DCC2]/90 hover:bg-[#DCC9A8] border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614] flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-[2px] bg-[#F1E7D3] border border-[#181614] flex items-center justify-center shrink-0 text-[#C92532]">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="font-serif font-black text-sm sm:text-base text-[#181614] group-hover:text-[#C92532] leading-snug">
                          Tổng Kho Tư Liệu
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#C92532] shrink-0" />
                    </button>

                    {/* Block 2 (Center Highlighted in #C92532 Editorial Red): Kỳ Xuất Bản 60 Số */}
                    <button
                      type="button"
                      onClick={() => handleSelectMode('challenge-60')}
                      className="p-4 rounded-[2px] bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border-[1.5px] border-[#181614] shadow-[3px_3px_0px_#181614] flex items-center justify-between gap-3 text-left transition-all cursor-pointer"
                      style={{ backgroundImage: 'var(--grain)' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-[2px] bg-[#F1E7D3]/15 border border-[#F1E7D3]/60 flex items-center justify-center shrink-0 text-[#F1E7D3]">
                          <Target className="w-5 h-5" />
                        </div>
                        <span className="font-serif font-black text-sm sm:text-base text-[#F1E7D3] leading-snug">
                          Kỳ Xuất Bản 60 Số
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#F1E7D3] shrink-0" />
                    </button>

                    {/* Block 3: Báo Cáo Phát Hành */}
                    <button
                      type="button"
                      onClick={() => onOpenAnalytics?.()}
                      className="p-4 rounded-[2px] bg-[#E9DCC2]/90 hover:bg-[#DCC9A8] border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614] flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-[2px] bg-[#F1E7D3] border border-[#181614] flex items-center justify-center shrink-0 text-[#C92532]">
                          <BarChart2 className="w-5 h-5" />
                        </div>
                        <span className="font-serif font-black text-sm sm:text-base text-[#181614] group-hover:text-[#C92532] leading-snug">
                          Báo Cáo Phát Hành
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#C92532] shrink-0" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Right (40% / 5 cols) – Literary Quote Postcard (Seamless 2K Tower Bridge Engraving + Italic Quote) */}
              <section
                aria-label="Châm Ngôn Tòa Soạn"
                className="lg:col-span-5 newspaper-card border-2 border-[#181614] shadow-[4px_4px_0px_#181614] p-1.5 flex flex-col justify-between overflow-hidden"
              >
                <div className="relative border border-[#493B2D] bg-[#E9DCC2] h-full p-4 sm:p-5 flex items-center justify-between gap-3 overflow-hidden min-h-[146px]">
                  {/* Subtle Halftone Dot Accent */}
                  <div
                    className="pointer-events-none select-none absolute inset-0 halftone-dots opacity-[0.04]"
                    aria-hidden="true"
                  />

                  {/* Left: Red Quotation Marks + Italic Serif Quote + Red Underline Stroke */}
                  <div className="relative z-10 max-w-[58%] space-y-1.5">
                    <span className="block font-serif font-black text-4xl leading-none text-[#C92532] select-none">
                      “
                    </span>
                    <blockquote className="font-serif italic font-bold text-lg sm:text-xl text-[#181614] leading-snug -mt-2">
                      Believe in yourself,
                      <br />
                      and you will go further.”
                    </blockquote>
                    <svg
                      viewBox="0 0 160 10"
                      className="w-28 h-2.5 pt-0.5"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 7C48 2 104 2 156 5"
                        stroke="#C92532"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Right: Seamless 2K Tower Bridge Engraving Printed Directly onto Aged Parchment */}
                  <div className="pointer-events-none select-none absolute inset-y-0 right-0 w-[56%] flex items-center justify-end">
                    <span
                      className="absolute top-2.5 right-3 text-[#C92532] text-xl font-serif select-none z-20 risograph-red-accent"
                      aria-hidden="true"
                    >
                      ♛
                    </span>
                    <img
                      src={VINTAGE_EDITORIAL_ASSETS.architecture.towerBridgeLondon}
                      alt="Tower Bridge London Vintage Engraving"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center scale-[1.15] vintage-print-seamless mask-fade-left block"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* ===============================================================
                ZONE C — TODAY'S AGENDA & 60-ISSUE COUNTDOWN (BOTTOM ROW)
               =============================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Left (55% / 7 cols) – Tiêu Điểm Hôm Nay (Today's Agenda + Seamless Scholar Cat & Skyline Watermark) */}
              <section
                aria-label="Tiêu Điểm Hôm Nay"
                className="lg:col-span-7 newspaper-card border-2 border-[#181614] shadow-[4px_4px_0px_#181614] p-1.5 flex flex-col justify-between overflow-hidden"
              >
                <div className="relative border border-[#493B2D] bg-[#F1E7D3] h-full p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
                  {/* Header */}
                  <div className="relative z-10 flex items-center justify-between border-b border-[#493B2D]/50 pb-2.5">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#C92532]" />
                      <h2 className="font-serif font-black text-sm sm:text-base uppercase tracking-wider text-[#181614]">
                        TIÊU ĐIỂM HÔM NAY
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif italic font-bold text-xs sm:text-sm text-[#181614]">
                        Keep going!
                      </span>
                      <span className="font-mono text-xs font-bold text-[#C92532] px-1.5 py-0.5 bg-[#E9DCC2] border border-[#493B2D]">
                        Kỳ #{String(syncedActiveDay).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Body: Left Seamless Scholar Cat Woodcut Vignette + Right 4 Daily Checklist Items */}
                  <div className="relative z-10 my-3 grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
                    {/* Left (4 cols): Seamless Woodcut Scholar Cat Reading at Study Desk */}
                    <div className="sm:col-span-4 hidden sm:flex items-center justify-center relative">
                      <div className="w-36 h-36 -my-2 select-none pointer-events-none">
                        <img
                          src={VINTAGE_EDITORIAL_ASSETS.mascot.scholarReadingDesk}
                          alt="Scholar Cat Reading at Desk"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover scale-[1.12] object-center mix-blend-multiply mask-radial-soft block"
                          style={{ filter: 'contrast(1.12) sepia(0.14)' }}
                        />
                      </div>
                    </div>

                    {/* Right (8 cols): All 4 Daily Checklist Items with Vintage Ink Checkboxes */}
                    <div className="sm:col-span-8 space-y-2">
                      {todos.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleToggleTodoItem(item.id)}
                          className="flex items-center gap-3 p-2.5 rounded-[2px] bg-[#E9DCC2] hover:bg-[#DCC9A8] border border-[#493B2D]/60 cursor-pointer transition-colors"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTodoItem(item.id);
                            }}
                            className={`w-5 h-5 rounded-[2px] flex items-center justify-center shrink-0 border-[1.5px] ${
                              item.completed
                                ? 'bg-[#181614] border-[#181614] text-[#F1E7D3]'
                                : 'bg-[#F1E7D3] border-[#181614]'
                            }`}
                          >
                            {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <span
                            className={`text-xs sm:text-sm font-dm ${
                              item.completed
                                ? 'line-through text-[#51483D]'
                                : 'font-bold text-[#181614]'
                            }`}
                          >
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Single Bottom-Right Red Button */}
                  <div className="relative z-10 flex items-center justify-between pt-2 border-t border-[#493B2D]/40">
                    <span className="font-mono text-xs font-bold text-[#51483D]">
                      Hoàn tất: {dayProgress.completedCount}/{dayProgress.totalCount} hạng mục
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectMode('speed')}
                      className="px-5 py-2 rounded-[2px] bg-[#C92532] hover:bg-[#991D27] text-[#F1E7D3] border-[1.5px] border-[#181614] shadow-[2px_2px_0px_#181614] font-oswald font-bold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
                      style={{ backgroundImage: 'var(--grain)' }}
                    >
                      <span>Tiếp Tục Biên Tập</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>

              {/* Right (45% / 5 cols) – Kỳ Xuất Bản (60-Day Countdown Ring + 4 Skill Labels + Seamless 2K Red London Telephone Booth) */}
              <section
                aria-label="Kỳ Xuất Bản 60 Số"
                className="lg:col-span-5 newspaper-card border-2 border-[#181614] shadow-[4px_4px_0px_#181614] p-1.5 flex flex-col justify-between overflow-hidden"
              >
                <div className="relative border border-[#493B2D] bg-[#F1E7D3] h-full p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#493B2D]/50 pb-2.5 relative z-10">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C92532]" />
                      <h2 className="font-serif font-black text-sm sm:text-base uppercase tracking-wider text-[#181614]">
                        KỲ XUẤT BẢN (60 SỐ)
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectMode('challenge-60')}
                      className="font-serif font-bold text-xs text-[#C92532] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem Lịch Trình</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body: Circular Countdown Ring + 4 Core Skill Labels + Seamless 2K Red London Telephone Booth */}
                  <div className="my-3 grid grid-cols-12 items-center gap-2 relative z-10">
                    {/* Left (5 cols): Red-and-Ink Circular Countdown Ring */}
                    <div className="col-span-5 flex items-center justify-center">
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                          <circle
                            cx="40"
                            cy="40"
                            r={challengeRadius}
                            fill="#E9DCC2"
                            stroke="#C9B38E"
                            strokeWidth="6"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r={challengeRadius}
                            fill="none"
                            stroke="#C92532"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={challengeCircumference}
                            strokeDashoffset={challengeDashoffset}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="font-serif font-black text-2xl sm:text-3xl text-[#181614] leading-none tabular-nums">
                            {Math.max(0, 60 - completedDaysCount)}
                          </span>
                          <span className="font-serif font-bold text-[11px] text-[#181614] mt-1">
                            Kỳ Còn Lại
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Center (4 cols): 4 Core Skill Labels (Vocabulary, Writing, Listening, Reading) */}
                    <div className="col-span-4 space-y-2.5 border-l border-[#493B2D]/40 pl-3">
                      {[
                        { label: 'Vocabulary', icon: BookOpen },
                        { label: 'Writing', icon: PenTool },
                        { label: 'Listening', icon: Volume2 },
                        { label: 'Reading', icon: ClipboardCheck }
                      ].map((sk) => {
                        const SkIcon = sk.icon;
                        return (
                          <button
                            key={sk.label}
                            type="button"
                            onClick={() => handleSelectMode('challenge-60')}
                            className="flex items-center gap-2 text-left hover:text-[#C92532] transition-colors cursor-pointer w-full"
                          >
                            <SkIcon className="w-3.5 h-3.5 text-[#C92532] shrink-0" />
                            <span className="font-serif font-bold text-xs sm:text-sm text-[#181614]">
                              {sk.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right (3 cols): Seamless 2K Vivid Red London Telephone Booth Illustration */}
                    <div className="col-span-3 flex items-center justify-end relative">
                      <div className="w-24 sm:w-28 h-36 sm:h-40 -my-3 -mr-2 select-none pointer-events-none">
                        <img
                          src={VINTAGE_EDITORIAL_ASSETS.architecture.londonRedTelephoneBooth}
                          alt="Vintage Red London Telephone Booth"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover scale-[1.16] object-center vintage-print-seamless mask-radial-soft block"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
