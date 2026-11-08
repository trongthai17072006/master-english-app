export interface ChallengeVocabWord {
  id: string;
  word: string;
  ipa: string;
  pos: 'n.' | 'v.' | 'adj.' | 'adv.' | 'phr.';
  meaning: string;
  collocations: string[];
  exampleEn: string;
  exampleVi: string;
  detailedNote?: string;
}

export interface ChallengeReadingQuestion {
  id: string;
  questionText: string;
  targetWord: string;
  correctMeaning: string;
  options: string[];
  explanationVi: string;
}

export interface ChallengeReadingPassage {
  title: string;
  paragraphs: string[];
  translationParagraphs: string[];
  questions: ChallengeReadingQuestion[];
}

export type WritingTaskType =
  | 'Opinion (Agree / Disagree)'
  | 'Discussion (Discuss Both Views & Opinion)'
  | 'Problem & Solution (Causes & Solutions)'
  | 'Causes & Solutions / Problem-Solution'
  | 'Advantages & Disadvantages'
  | 'Two-Part Question'
  | 'Two-Part Direct Question';

export interface WritingStructureItem {
  pattern: string;
  meaningVi: string;
  exampleEn: string;
}

export interface WritingSampleEssayBlock {
  bandLabel: string;
  levelTag: 'B2' | 'C1';
  essayParagraphs: string[];
  translationParagraphs: string[];
  examinerCommentary: string;
}

export interface ChallengeWritingTask {
  topic: string;
  questionType: WritingTaskType;
  prompt: string;
  promptVi: string;
  band8Outline: {
    introduction: string;
    bodyParagraph1: string;
    bodyParagraph2: string;
    conclusion: string;
  };
  recommendedCollocations: string[];
  keyVocabulary: string[];
  usefulStructures?: WritingStructureItem[];
  sampleEssays?: {
    band65: WritingSampleEssayBlock;
    band80: WritingSampleEssayBlock;
  };
}

export interface SpeakingVocabItem {
  word: string;
  pos: string;
  meaningVi: string;
}

export interface SpeakingCollocationItem {
  phrase: string;
  meaningVi: string;
}

export interface SpeakingBilingualQuestion {
  questionEn: string;
  questionVi: string;
  suggestedIdeas: string[];
  samples: {
    B1: { answerEn: string; answerVi: string };
    B2: { answerEn: string; answerVi: string };
    C1: { answerEn: string; answerVi: string };
  };
  highlightedVocab?: string[];
}

export interface SpeakingPart1Topic {
  title: string;
  titleVi?: string;
  questions: string[];
  usefulVocab?: SpeakingVocabItem[];
  collocations?: SpeakingCollocationItem[];
  bilingualQuestions?: SpeakingBilingualQuestion[];
}

export interface SpeakingPart2Option {
  letter: 'A' | 'B' | 'C';
  title: string;
  description: string;
  strongPoints: string;
  drawbacks: string;
  advantagesEn?: string[];
  disadvantagesEn?: string[];
  isChosen?: boolean;
  reasoningEn?: string;
}

export interface SpeakingPart2Step {
  stepNumber: number;
  title: string;
  guideEn: string;
  guideVi: string;
}

export interface SpeakingPart3PromptNode {
  point: string;
  pointVi: string;
  explanation: string;
  explanationVi: string;
}

export interface SpeakingPart3FollowUpQuestion {
  question: string;
  questionVi: string;
  sampleB1: string;
  sampleB1Vi?: string;
  sampleB2C1: string;
  sampleB2C1Vi: string;
}

export interface SpeakingPart3TopicDevelopment {
  title: string;
  centralStatement: string;
  centralStatementVi: string;
  prompts: SpeakingPart3PromptNode[];
  yourOwnIdea: SpeakingPart3PromptNode;
  fullSampleB1: string;
  fullSampleB1Vi: string;
  fullSampleB2C1: string;
  fullSampleB2C1Vi: string;
  followUpQuestions: SpeakingPart3FollowUpQuestion[];
}

export interface VstepSpeakingTask {
  setCode?: string;
  sourceType?: 'vstep_28_bank' | 'ai_custom_generated';
  originalTestId?: number;
  part1: {
    topic1: SpeakingPart1Topic;
    topic2: SpeakingPart1Topic;
    part1Tips: string[];
  };
  part2: {
    situation: string;
    situationVi?: string;
    options: [SpeakingPart2Option, SpeakingPart2Option, SpeakingPart2Option];
    requirement: string;
    sampleStrategy: string;
    usefulConnectors: string[];
    usefulVocab?: SpeakingVocabItem[];
    collocations?: SpeakingCollocationItem[];
    answerStructure?: SpeakingPart2Step[];
    sampleAnswers?: {
      B1: { chosenOption: string; speechEn: string; speechVi: string };
      B2: { chosenOption: string; speechEn: string; speechVi: string };
      C1: { chosenOption: string; speechEn: string; speechVi: string };
    };
  };
  part3?: SpeakingPart3TopicDevelopment;
}

export interface ChallengeDay {
  day: number;
  week: number;
  title?: string;
  displayLabel?: string;
  themeVi: string;
  themeEn: string;
  description: string;
  vocab: ChallengeVocabWord[];
  readingPassage: ChallengeReadingPassage;
  writing: ChallengeWritingTask;
  speaking: VstepSpeakingTask;
}
