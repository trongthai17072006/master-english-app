import {
  ChallengeDay,
  ChallengeVocabWord,
  ChallengeReadingPassage,
  ChallengeReadingQuestion,
  ChallengeWritingTask,
  VstepSpeakingTask,
  WritingTaskType,
  SpeakingPart1Topic,
  SpeakingPart2Option
} from './types';
import { STANDARD_PART2_STEPS } from './speakingSets1To5';
import { VSTEP_28_SPEAKING_BY_DAY } from './vstep28SpeakingBank';

export interface CompactWordSeed {
  word: string;
  ipa: string;
  pos: 'n.' | 'v.' | 'adj.' | 'adv.' | 'phr.';
  meaning: string;
  collocations: [string, string, string];
  exampleEn: string;
  exampleVi: string;
  note?: string;
}

export interface DayCurriculumBlueprint {
  day: number;
  themeVi: string;
  themeEn: string;
  description: string;
  words: CompactWordSeed[];
  reading: {
    title: string;
    paragraphs: [string, string, string];
    translationParagraphs: [string, string, string];
  };
  writing: {
    questionType: WritingTaskType;
    prompt: string;
    promptVi: string;
    outline: {
      introduction: string;
      bodyParagraph1: string;
      bodyParagraph2: string;
      conclusion: string;
    };
    band65Paragraphs: [string, string, string, string];
    band65Trans: [string, string, string, string];
    band80Paragraphs: [string, string, string, string];
    band80Trans: [string, string, string, string];
  };
  speakingOverride?: VstepSpeakingTask;
  speakingSeed?: {
    topic1TitleEn: string;
    topic1TitleVi: string;
    t1Questions: [
      {
        qEn: string;
        qVi: string;
        ideas: [string, string];
        b1En: string;
        b1Vi: string;
        b2En: string;
        b2Vi: string;
        c1En: string;
        c1Vi: string;
      },
      {
        qEn: string;
        qVi: string;
        ideas: [string, string];
        b1En: string;
        b1Vi: string;
        b2En: string;
        b2Vi: string;
        c1En: string;
        c1Vi: string;
      },
      {
        qEn: string;
        qVi: string;
        ideas: [string, string];
        b1En: string;
        b1Vi: string;
        b2En: string;
        b2Vi: string;
        c1En: string;
        c1Vi: string;
      }
    ];
    topic2TitleEn: string;
    topic2TitleVi: string;
    t2Questions: [
      {
        qEn: string;
        qVi: string;
        ideas: [string, string];
        b1En: string;
        b1Vi: string;
        b2En: string;
        b2Vi: string;
        c1En: string;
        c1Vi: string;
      },
      {
        qEn: string;
        qVi: string;
        ideas: [string, string];
        b1En: string;
        b1Vi: string;
        b2En: string;
        b2Vi: string;
        c1En: string;
        c1Vi: string;
      },
      {
        qEn: string;
        qVi: string;
        ideas: [string, string];
        b1En: string;
        b1Vi: string;
        b2En: string;
        b2Vi: string;
        c1En: string;
        c1Vi: string;
      }
    ];
    part2SituationEn: string;
    part2SituationVi: string;
    options: [
      {
        title: string;
        descVi: string;
        prosVi: string;
        consVi: string;
        prosEn: string[];
        consEn: string[];
      },
      {
        title: string;
        descVi: string;
        prosVi: string;
        consVi: string;
        prosEn: string[];
        consEn: string[];
      },
      {
        title: string;
        descVi: string;
        prosVi: string;
        consVi: string;
        prosEn: string[];
        consEn: string[];
      }
    ];
    chosenLetter: 'A' | 'B' | 'C';
    part2Samples: {
      b1En: string;
      b1Vi: string;
      b2En: string;
      b2Vi: string;
      c1En: string;
      c1Vi: string;
    };
  };
}

export function compileDayBlueprint(bp: DayCurriculumBlueprint): ChallengeDay {
  const week = Math.floor((bp.day - 1) / 7) + 1;

  // 1. Compile 15 Vocabulary Words
  const vocab: ChallengeVocabWord[] = bp.words.map((w, idx) => ({
    id: `d${bp.day}_v${idx + 1}`,
    word: w.word,
    ipa: w.ipa,
    pos: w.pos,
    meaning: w.meaning,
    collocations: [...w.collocations],
    exampleEn: w.exampleEn,
    exampleVi: w.exampleVi,
    detailedNote:
      w.note ||
      `Từ vựng học thuật trọng tâm Band 7.5+ thuộc chủ đề ${bp.themeEn} (Ngày ${bp.day}).`
  }));

  // 2. Compile Reading Passage & 3 Contextual Questions (distractors strictly from the same day)
  const qIndices = [0, 5, 10];
  const questions: ChallengeReadingQuestion[] = qIndices.map((targetIdx, qNum) => {
    const target = vocab[targetIdx] || vocab[qNum];
    const distractor1 = vocab[(targetIdx + 3) % vocab.length];
    const distractor2 = vocab[(targetIdx + 7) % vocab.length];
    const distractor3 = vocab[(targetIdx + 11) % vocab.length];

    // Deterministic option order based on day + qNum
    const rawOptions = [
      target.meaning,
      distractor1.meaning,
      distractor2.meaning,
      distractor3.meaning
    ];
    const shift = (bp.day + qNum) % 4;
    const rotatedOptions = [
      rawOptions[shift % 4],
      rawOptions[(shift + 1) % 4],
      rawOptions[(shift + 2) % 4],
      rawOptions[(shift + 3) % 4]
    ];

    return {
      id: `d${bp.day}_rq${qNum + 1}`,
      questionText: `Trong ngữ cảnh bài đọc "${bp.reading.title}", thuật ngữ học thuật "${target.word}" (${target.pos}) mang ý nghĩa sát nhất là gì?`,
      targetWord: target.word,
      correctMeaning: target.meaning,
      options: rotatedOptions,
      explanationVi: `"${target.word}" (${target.ipa}) có nghĩa là "${target.meaning}". Ví dụ trong ngữ cảnh: "${target.exampleEn}"`
    };
  });

  const readingPassage: ChallengeReadingPassage = {
    title: bp.reading.title,
    paragraphs: [...bp.reading.paragraphs],
    translationParagraphs: [...bp.reading.translationParagraphs],
    questions
  };

  // 3. Compile Writing Task 2
  const recommendedCollocations = [
    vocab[0]?.collocations[0],
    vocab[1]?.collocations[0],
    vocab[2]?.collocations[0],
    vocab[3]?.collocations[0],
    vocab[4]?.collocations[0],
    vocab[5]?.collocations[0],
    vocab[6]?.collocations[0],
    vocab[7]?.collocations[0]
  ].filter(Boolean);

  const writing: ChallengeWritingTask = {
    topic: `${bp.themeEn}`,
    questionType: bp.writing.questionType,
    prompt: bp.writing.prompt,
    promptVi: bp.writing.promptVi,
    band8Outline: bp.writing.outline,
    recommendedCollocations,
    keyVocabulary: vocab.slice(0, 8).map(v => v.word),
    usefulStructures: [
      {
        pattern: `Not only does [${vocab[0]?.word || 'this trend'}] foster ..., but it also ...`,
        meaningVi: 'Cấu trúc đảo ngữ nhấn mạnh lợi ích kép hoặc tác động kép trong câu mở đoạn Body.',
        exampleEn: vocab[0]?.exampleEn || ''
      },
      {
        pattern: `While proponents of ... cite [${vocab[1]?.collocations[0] || 'economic growth'}], critics contend that ...`,
        meaningVi: 'Cấu trúc mệnh đề nhượng bộ đối lập hai luồng quan điểm chuẩn Band 7.5+.',
        exampleEn: vocab[1]?.exampleEn || ''
      },
      {
        pattern: `Without stringent measures to address [${vocab[2]?.collocations[0] || 'this issue'}], society risks ...`,
        meaningVi: 'Cấu trúc giả định nhấn mạnh hệ quả nếu thiếu giải pháp can thiệp kịp thời.',
        exampleEn: vocab[2]?.exampleEn || ''
      }
    ],
    sampleEssays: {
      band65: {
        bandLabel: 'Band 6.5 (B2 Upper-Intermediate)',
        levelTag: 'B2',
        essayParagraphs: [...bp.writing.band65Paragraphs],
        translationParagraphs: [...bp.writing.band65Trans],
        examinerCommentary: `Bài mẫu Band 6.5 trả lời đầy đủ yêu cầu đề bài chủ đề "${bp.themeVi}", bố cục 4 đoạn rõ ràng, sử dụng chính xác các từ vựng trọng tâm (${vocab.slice(0, 4).map(v => v.word).join(', ')}) và từ nối mạch lạc.`
      },
      band80: {
        bandLabel: 'Band 7.5 - 8.0 (C1 Advanced Mastery)',
        levelTag: 'C1',
        essayParagraphs: [...bp.writing.band80Paragraphs],
        translationParagraphs: [...bp.writing.band80Trans],
        examinerCommentary: `Bài mẫu Band 8.0 thể hiện tư duy phản biện sắc sảo, kết hợp nhuần nhuyễn collocations học thuật C1 (${recommendedCollocations.slice(0, 4).join(', ')}) cùng cấu trúc câu phức đa dạng.`
      }
    }
  };

  // 4. Compile Speaking Part 1, Part 2 & Part 3
  let speaking: VstepSpeakingTask;
  if (VSTEP_28_SPEAKING_BY_DAY[bp.day]) {
    speaking = VSTEP_28_SPEAKING_BY_DAY[bp.day];
  } else if (bp.speakingOverride) {
    speaking = bp.speakingOverride;
  } else if (bp.speakingSeed) {
    const s = bp.speakingSeed;
    const topic1: SpeakingPart1Topic = {
      title: s.topic1TitleEn,
      titleVi: s.topic1TitleVi,
      questions: s.t1Questions.map(q => q.qEn),
      usefulVocab: vocab.slice(0, 5).map(v => ({
        word: v.word,
        pos: v.pos,
        meaningVi: v.meaning
      })),
      collocations: vocab.slice(0, 4).map(v => ({
        phrase: v.collocations[0],
        meaningVi: v.meaning
      })),
      bilingualQuestions: s.t1Questions.map(q => ({
        questionEn: q.qEn,
        questionVi: q.qVi,
        suggestedIdeas: [...q.ideas],
        highlightedVocab: vocab.slice(0, 3).map(v => v.word),
        samples: {
          B1: { answerEn: q.b1En, answerVi: q.b1Vi },
          B2: { answerEn: q.b2En, answerVi: q.b2Vi },
          C1: { answerEn: q.c1En, answerVi: q.c1Vi }
        }
      }))
    };

    const topic2: SpeakingPart1Topic = {
      title: s.topic2TitleEn,
      titleVi: s.topic2TitleVi,
      questions: s.t2Questions.map(q => q.qEn),
      usefulVocab: vocab.slice(5, 10).map(v => ({
        word: v.word,
        pos: v.pos,
        meaningVi: v.meaning
      })),
      collocations: vocab.slice(5, 9).map(v => ({
        phrase: v.collocations[0],
        meaningVi: v.meaning
      })),
      bilingualQuestions: s.t2Questions.map(q => ({
        questionEn: q.qEn,
        questionVi: q.qVi,
        suggestedIdeas: [...q.ideas],
        highlightedVocab: vocab.slice(5, 8).map(v => v.word),
        samples: {
          B1: { answerEn: q.b1En, answerVi: q.b1Vi },
          B2: { answerEn: q.b2En, answerVi: q.b2Vi },
          C1: { answerEn: q.c1En, answerVi: q.c1Vi }
        }
      }))
    };

    const letters: ['A', 'B', 'C'] = ['A', 'B', 'C'];
    const options = s.options.map((opt, idx) => ({
      letter: letters[idx],
      title: opt.title,
      description: opt.descVi,
      strongPoints: opt.prosVi,
      drawbacks: opt.consVi,
      isChosen: letters[idx] === s.chosenLetter,
      reasoningEn: opt.prosEn[0] || `it provides the most practical and sustainable solution for ${bp.themeEn.toLowerCase()}.`,
      advantagesEn: opt.prosEn,
      disadvantagesEn: opt.consEn
    })) as [SpeakingPart2Option, SpeakingPart2Option, SpeakingPart2Option];

    const chosenOptObj = options.find(o => o.letter === s.chosenLetter) || options[0];

    const cleanThemeViForSpeaking = bp.themeVi.replace(/^Ngày\s*\d+\s*[:—-]\s*/i, '').trim();

    speaking = {
      setCode: `BỘ ĐỀ CHỦ ĐỀ NGÀY #${String(bp.day).padStart(2, '0')}`,
      sourceType: 'ai_custom_generated',
      part1: {
        topic1,
        topic2,
        part1Tips: [
          `Áp dụng trực tiếp các từ vựng chủ đề ${cleanThemeViForSpeaking} (${vocab.slice(0, 4).map(v => v.word).join(', ')}) để nâng band Lexical Resource.`,
          'Mở rộng câu trả lời 3–4 câu theo cấu trúc: Trả lời trực tiếp -> Giải thích nguyên nhân -> Ví dụ thực tế cá nhân.'
        ]
      },
      part2: {
        situation: s.part2SituationEn,
        situationVi: s.part2SituationVi,
        options,
        requirement: 'Choose the best option among the three proposals, justify your choice with clear arguments, and explain why the other two options are less suitable.',
        sampleStrategy: `Khẳng định lựa chọn tối ưu là ${chosenOptObj.title} ngay câu mở đầu, phân tích 2 ưu điểm cốt lõi (${chosenOptObj.strongPoints}), sau đó phản biện hạn chế của hai phương án còn lại.`,
        usefulConnectors: [
          `Taking all factors regarding ${bp.themeEn.toLowerCase()} into account, I firmly believe ${chosenOptObj.title} is the most viable option.`,
          `The primary merit of this approach lies in its ability to foster ${vocab[0]?.collocations[0] || 'sustainable progress'}.`,
          'While the other two alternatives have certain appeal on the surface, their practical drawbacks are difficult to overlook.',
          `All things considered, prioritizing ${chosenOptObj.title} guarantees the most enduring positive impact.`
        ],
        usefulVocab: vocab.slice(10, 15).map(v => ({
          word: v.word,
          pos: v.pos,
          meaningVi: v.meaning
        })),
        collocations: vocab.slice(10, 14).map(v => ({
          phrase: v.collocations[0],
          meaningVi: v.meaning
        })),
        answerStructure: STANDARD_PART2_STEPS,
        sampleAnswers: {
          B1: {
            chosenOption: chosenOptObj.title,
            speechEn: s.part2Samples.b1En,
            speechVi: s.part2Samples.b1Vi
          },
          B2: {
            chosenOption: chosenOptObj.title,
            speechEn: s.part2Samples.b2En,
            speechVi: s.part2Samples.b2Vi
          },
          C1: {
            chosenOption: chosenOptObj.title,
            speechEn: s.part2Samples.c1En,
            speechVi: s.part2Samples.c1Vi
          }
        }
      },
      part3: {
        title: `${bp.themeEn} — Topic Development`,
        centralStatement: `Promoting sustainable solutions in ${bp.themeEn.toLowerCase()} brings profound benefits to individuals and society.`,
        centralStatementVi: `Thúc đẩy các giải pháp bền vững trong lĩnh vực ${cleanThemeViForSpeaking.toLowerCase()} mang lại lợi ích sâu sắc cho cá nhân và toàn xã hội.`,
        prompts: [
          {
            point: `Enhance public awareness and ${vocab[0]?.collocations[0] || 'civic responsibility'}`,
            pointVi: `Nâng cao nhận thức cộng đồng và thúc đẩy "${vocab[0]?.collocations[0] || 'trách nhiệm công dân'}" (${vocab[0]?.meaning || ''})`,
            explanation: vocab[0]?.exampleEn || `Educating citizens creates lasting behavioral improvements.`,
            explanationVi: vocab[0]?.exampleVi || `Giáo dục người dân tạo ra những thay đổi hành vi tích cực lâu dài.`
          },
          {
            point: `Improve quality of life through ${vocab[1]?.collocations[0] || 'practical innovation'}`,
            pointVi: `Cải thiện chất lượng cuộc sống thông qua "${vocab[1]?.collocations[0] || 'đổi mới thiết thực'}" (${vocab[1]?.meaning || ''})`,
            explanation: vocab[1]?.exampleEn || `Applying modern solutions directly benefits daily living standards.`,
            explanationVi: vocab[1]?.exampleVi || `Ứng dụng các giải pháp hiện đại nâng cao trực tiếp mức sống hằng ngày.`
          },
          {
            point: `Prevent long-term risks by addressing ${vocab[2]?.collocations[0] || 'structural challenges'}`,
            pointVi: `Ngăn ngừa rủi ro dài hạn bằng cách giải quyết "${vocab[2]?.collocations[0] || 'thách thức cốt lõi'}" (${vocab[2]?.meaning || ''})`,
            explanation: vocab[2]?.exampleEn || `Proactive policies protect future generations from severe consequences.`,
            explanationVi: vocab[2]?.exampleVi || `Các chính sách chủ động bảo vệ thế hệ tương lai khỏi những hệ lụy nghiêm trọng.`
          }
        ],
        yourOwnIdea: {
          point: `Foster collaboration via ${vocab[3]?.collocations[0] || 'joint initiatives'}`,
          pointVi: `Tăng cường sự phối hợp giữa Nhà nước, nhà trường và người dân qua "${vocab[3]?.collocations[0] || 'sáng kiến chung'}"`,
          explanation: vocab[3]?.exampleEn || `Combining government policies with individual action ensures sustainable success.`,
          explanationVi: vocab[3]?.exampleVi || `Kết hợp chính sách quản lý vĩ mô với hành động của từng cá nhân đảm bảo thành công bền vững.`
        },
        fullSampleB1: `I completely agree that paying attention to ${bp.themeEn.toLowerCase()} is very important for our society today. First, it helps raise public awareness and encourages ${vocab[0]?.collocations[0]}. Specifically, ${vocab[0]?.exampleEn} Second, focusing on ${vocab[1]?.collocations[0]} improves our daily quality of life. ${vocab[1]?.exampleEn} Third, taking action early helps us avoid future problems related to ${vocab[2]?.collocations[0]}. Finally, when governments and citizens work together on ${vocab[3]?.collocations[0]}, we can build a much better and more sustainable community.`,
        fullSampleB1Vi: `Tôi hoàn toàn đồng ý rằng việc quan tâm đến ${cleanThemeViForSpeaking.toLowerCase()} là vô cùng quan trọng đối với xã hội ngày nay. Thứ nhất, điều này giúp nâng cao nhận thức cộng đồng và khuyến khích "${vocab[0]?.collocations[0]}". Cụ thể, ${vocab[0]?.exampleVi} Thứ hai, chú trọng vào "${vocab[1]?.collocations[0]}" giúp cải thiện chất lượng cuộc sống hằng ngày. ${vocab[1]?.exampleVi} Thứ ba, hành động sớm giúp chúng ta phòng tránh các hệ lụy liên quan đến "${vocab[2]?.collocations[0]}". Cuối cùng, khi chính phủ và người dân cùng chung tay thực hiện "${vocab[3]?.collocations[0]}", chúng ta sẽ xây dựng được một cộng đồng tốt đẹp và bền vững hơn.`,
        fullSampleB2C1: `It is an indisputable truism that spearheading sustainable reforms in ${bp.themeEn.toLowerCase()} is pivotal to long-term societal prosperity. First and foremost, prioritizing ${vocab[0]?.collocations[0]} reshapes public attitudes—${vocab[0]?.exampleEn} Secondly, institutionalizing ${vocab[1]?.collocations[0]} generates tangible improvements in living standards; specifically, ${vocab[1]?.exampleEn} Thirdly, addressing ${vocab[2]?.collocations[0]} preemptively safeguards communities against systemic crises. Above all, synergizing state regulation with grassroots participation through ${vocab[3]?.collocations[0]} ensures resilient, equitable development for future generations.`,
        fullSampleB2C1Vi: `Có một chân lý không thể phủ nhận là việc đi đầu thúc đẩy các cải cách bền vững trong lĩnh vực ${cleanThemeViForSpeaking.toLowerCase()} đóng vai trò then chốt đối với sự thịnh vượng lâu dài của xã hội. Trước hết, ưu tiên "${vocab[0]?.collocations[0]}" giúp định hình lại nhận thức công chúng—${vocab[0]?.exampleVi} Thứ hai, thể chế hóa "${vocab[1]?.collocations[0]}" tạo ra những cải thiện rõ rệt về chất lượng sống; cụ thể, ${vocab[1]?.exampleVi} Thứ ba, giải quyết "${vocab[2]?.collocations[0]}" từ sớm giúp bảo vệ cộng đồng khỏi các cuộc khủng hoảng hệ thống. Trên hết, sự cộng hưởng giữa chính sách vĩ mô và sự tham gia của người dân qua "${vocab[3]?.collocations[0]}" sẽ đảm bảo sự phát triển công bằng, vững chắc cho các thế hệ tương lai.`,
        followUpQuestions: [
          {
            question: `What is the biggest obstacle when addressing issues related to ${bp.themeEn.toLowerCase()}?`,
            questionVi: `Rào cản lớn nhất khi giải quyết các vấn đề liên quan đến ${cleanThemeViForSpeaking.toLowerCase()} là gì?`,
            sampleB1: `The biggest obstacle is that changing people’s habits and investing in new infrastructure require both time and financial resources. ${vocab[4]?.exampleEn || ''}`,
            sampleB2C1: `The primary impediment lies in reconciling short-term economic costs with long-term sustainability. ${vocab[4]?.exampleEn || ''} Overcoming this requires consistent policy enforcement and public education.`,
            sampleB2C1Vi: `Rào cản chính nằm ở việc dung hòa giữa chi phí kinh tế trước mắt và tính bền vững lâu dài. ${vocab[4]?.exampleVi || ''} Để vượt qua điều này cần sự thực thi chính sách nhất quán và giáo dục cộng đồng.`
          },
          {
            question: `How have attitudes toward ${bp.themeEn.toLowerCase()} changed in your country over recent years?`,
            questionVi: `Nhận thức về ${cleanThemeViForSpeaking.toLowerCase()} ở đất nước bạn đã thay đổi như thế nào trong những năm gần đây?`,
            sampleB1: `In recent years, people in Vietnam, especially the younger generation, have paid much more attention to this topic. ${vocab[5]?.exampleEn || ''}`,
            sampleB2C1: `Public consciousness in Vietnam has evolved considerably over the past decade, driven by higher education levels and digital media. ${vocab[5]?.exampleEn || ''}`,
            sampleB2C1Vi: `Nhận thức của công chúng tại Việt Nam đã chuyển biến rõ rệt trong thập kỷ qua nhờ trình độ học vấn nâng cao và truyền thông số. ${vocab[5]?.exampleVi || ''}`
          },
          {
            question: `Should governments or individuals take the main responsibility for improving ${bp.themeEn.toLowerCase()}?`,
            questionVi: `Chính phủ hay từng cá nhân nên chịu trách nhiệm chính trong việc cải thiện vấn đề ${cleanThemeViForSpeaking.toLowerCase()}?`,
            sampleB1: `Both governments and individuals must share this responsibility. Governments pass laws and invest budgets, while citizens follow rules in daily life. ${vocab[6]?.exampleEn || ''}`,
            sampleB2C1: `Achieving meaningful progress necessitates a synergistic partnership: governments must enact overarching legislation and fund infrastructure, while citizens must practice daily civic responsibility. ${vocab[6]?.exampleEn || ''}`,
            sampleB2C1Vi: `Để đạt được bước tiến thực chất đòi hỏi sự phối hợp chặt chẽ: chính phủ cần ban hành khung pháp lý và đầu tư hạ tầng, trong khi mỗi công dân cần thực hành trách nhiệm hằng ngày. ${vocab[6]?.exampleVi || ''}`
          }
        ]
      }
    };
  } else {
    throw new Error(`Missing speaking configuration for Day ${bp.day}`);
  }

  // Ensure themeVi NEVER starts with "Ngày X:"
  const cleanThemeVi = bp.themeVi.replace(/^Ngày\s*\d+\s*[:—-]\s*/i, '').trim();

  return {
    day: bp.day,
    week,
    themeVi: cleanThemeVi,
    themeEn: bp.themeEn,
    description: bp.description,
    vocab,
    readingPassage,
    writing,
    speaking
  };
}

