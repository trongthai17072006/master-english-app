export type {
  ChallengeVocabWord,
  ChallengeReadingQuestion,
  ChallengeReadingPassage,
  WritingTaskType,
  WritingStructureItem,
  WritingSampleEssayBlock,
  ChallengeWritingTask,
  SpeakingVocabItem,
  SpeakingCollocationItem,
  SpeakingBilingualQuestion,
  SpeakingPart1Topic as VstepSpeakingPart1Topic,
  SpeakingPart1Topic,
  SpeakingPart2Option as VstepSpeakingPart2Option,
  SpeakingPart2Option,
  SpeakingPart2Step,
  SpeakingPart3PromptNode,
  SpeakingPart3FollowUpQuestion,
  SpeakingPart3TopicDevelopment,
  VstepSpeakingTask,
  ChallengeDay
} from './curriculum/types';

import {
  ChallengeDay,
  ChallengeVocabWord,
  ChallengeReadingQuestion
} from './curriculum/types';
import { DAYS_01_TO_15 } from './curriculum/days01To15';
import { DAYS_16_TO_60 } from './curriculum/days16To60';
import { VOCAB_DATABASE, VocabItem } from './vocabularyData';
import { loadCustomContentStore } from '../services/customContentStore';
import { VSTEP_PDF_WRITING_BANK } from './vstepPdfKnowledgeBankData';

// 60-Day Themes breakdown across 9 weeks
export const THEMES_METADATA = [
  { week: 1, title: 'Tuần 1: Giáo Dục Hiện Đại & Phương Pháp Học Tập', count: 7 },
  { week: 2, title: 'Tuần 2: Công Nghệ, Kỷ Nguyên Số & Trí Tuệ Nhân Tạo', count: 7 },
  { week: 3, title: 'Tuần 3: Môi Trường, Biến Đổi Khí Hậu & Năng Lượng Xanh', count: 7 },
  { week: 4, title: 'Tuần 4: Xã Hội, Đô Thị Hóa & Cơ Sở Hạ Tầng', count: 7 },
  { week: 5, title: 'Tuần 5: Kinh Tế, Toàn Cầu Hóa & Thị Trường Lao Động', count: 7 },
  { week: 6, title: 'Tuần 6: Sức Khỏe Cộng Đồng, Y Học & Lối Sống', count: 7 },
  { week: 7, title: 'Tuần 7: Văn Hóa, Di Sản, Du Lịch & Nghệ Thuật', count: 7 },
  { week: 8, title: 'Tuần 8: Truyền Thông, Mạng Xã Hội & Quảng Cáo', count: 7 },
  { week: 9, title: 'Tuần 9: Pháp Luật, Đạo Đức & Các Vấn Đề Trừu Tượng', count: 4 }
];

function mapPosToChallengePos(pos: string | undefined): ChallengeVocabWord['pos'] {
  const p = (pos || 'n.').toLowerCase();
  if (p.startsWith('v')) return 'v.';
  if (p.startsWith('adj')) return 'adj.';
  if (p.startsWith('adv')) return 'adv.';
  if (p.startsWith('phr') || p.startsWith('idiom')) return 'phr.';
  return 'n.';
}

function convertRepoItemToChallengeWord(
  repoItem: VocabItem,
  dayNum: number,
  idx: number,
  themeEn: string,
  themeVi: string
): ChallengeVocabWord {
  const cleanWord = repoItem.word.trim();
  const collocations =
    Array.isArray(repoItem.collocations) && repoItem.collocations.length >= 2
      ? repoItem.collocations.slice(0, 3)
      : [
          `${cleanWord.toLowerCase()} in ${themeEn.toLowerCase()}`,
          `promote ${cleanWord.toLowerCase()}`,
          `academic ${cleanWord.toLowerCase()}`
        ];

  return {
    id: `d${dayNum}_v${idx + 1}`,
    word: cleanWord,
    ipa: repoItem.ipa || `/ˈ${cleanWord.toLowerCase()}/`,
    pos: mapPosToChallengePos(repoItem.pos),
    meaning: repoItem.meaning,
    collocations,
    exampleEn:
      repoItem.exampleEn ||
      `Addressing ${themeEn.toLowerCase()} effectively requires a clear understanding of ${cleanWord}.`,
    exampleVi:
      repoItem.exampleVi ||
      `Giải quyết hiệu quả vấn đề ${themeVi.toLowerCase()} đòi hỏi sự thấu hiểu sâu sắc về ${repoItem.meaning.toLowerCase()}.`,
    detailedNote:
      repoItem.detailedNote ||
      `Từ vựng học thuật Band 7.5+ trọng tâm thuộc chủ đề "${themeVi}" (Ngày ${dayNum}/60).`
  };
}

/**
 * Ensures every single day from Day 1 to Day 60 has 15 strictly unique, non-duplicated
 * academic vocabulary words across the entire 60-day curriculum (900 unique words total),
 * and synchronizes Reading, Listening, Writing Task 2, and Speaking so all 5 skills
 * revolve around that day's topic and directly incorporate & highlight that day's 15 words.
 */
export const sanitize60DaysData = (rawDays: ChallengeDay[]): ChallengeDay[] => {
  const shortenTopic = (text: string) =>
    text
      .replace(/\s*\([^)]*\)/g, '')
      .split(/[,&–—]/)[0]
      .replace(/\s+trong\s+gia\s+đình\s+hiện\s+đại$/i, '')
      .replace(/\s+vươn\s+tầm\s+thế\s+giới$/i, '')
      .trim();

  const usedWordsGlobal = new Set<string>();

  // Pre-filter rich candidates from VOCAB_DATABASE (single academic words or core phrases with examples)
  const academicPool = VOCAB_DATABASE.filter(
    item =>
      item &&
      typeof item.word === 'string' &&
      item.word.trim().length >= 4 &&
      item.meaning &&
      item.exampleEn &&
      item.exampleVi
  );
  let poolCursor = 0;

  const pickNextUniqueWordFromPool = (
    dayNum: number,
    slotIdx: number,
    themeEn: string,
    themeVi: string
  ): ChallengeVocabWord => {
    while (poolCursor < academicPool.length) {
      const candidate = academicPool[poolCursor++];
      const normalizedKey = candidate.word.trim().toLowerCase();
      if (!usedWordsGlobal.has(normalizedKey)) {
        usedWordsGlobal.add(normalizedKey);
        return convertRepoItemToChallengeWord(candidate, dayNum, slotIdx, themeEn, themeVi);
      }
    }
    // Fallback if pool exhausted
    const fallbackWord = `lexicon-term-${dayNum}-${slotIdx + 1}`;
    usedWordsGlobal.add(fallbackWord);
    return {
      id: `d${dayNum}_v${slotIdx + 1}`,
      word: fallbackWord,
      ipa: `/ˈlek.sɪ.kən/`,
      pos: 'n.',
      meaning: `thuật ngữ chuyên sâu chủ đề ${themeVi}`,
      collocations: [`academic ${fallbackWord}`, `apply ${fallbackWord}`],
      exampleEn: `Researchers apply this concept when examining ${themeEn.toLowerCase()}.`,
      exampleVi: `Các nhà nghiên cứu áp dụng khái niệm này khi phân tích ${themeVi.toLowerCase()}.`
    };
  };

  return rawDays.map((item, index) => {
    const dayNum = item.day || index + 1;
    const weekNum = Math.floor((dayNum - 1) / 7) + 1;

    // 1. Clean Vietnamese and English titles
    const rawTitle = item.title || item.themeVi || '';
    const strippedVi = rawTitle
      .replace(/^Ngày\s*\d+(?:\s*\/\s*60)?\s*[:\-–—]\s*/i, '')
      .replace(/^Ngày\s*\d+\s*[:\-–—]\s*/i, '')
      .trim();
    const cleanTitle = shortenTopic(strippedVi) || strippedVi;

    const strippedEn = (item.themeEn || '')
      .replace(/^Day\s*\d+(?:\s*\/\s*60)?\s*[:\-–—]\s*/i, '')
      .trim();
    const cleanTitleEn = shortenTopic(strippedEn) || strippedEn;
    const bilingualTopic = cleanTitleEn ? `${cleanTitleEn} (${cleanTitle})` : cleanTitle;

    // 2. Deduplicate and standardize the 15 vocabulary words for this day
    const uniqueDayVocab: ChallengeVocabWord[] = [];
    const rawVocabList = Array.isArray(item.vocab) ? item.vocab : [];

    for (let i = 0; i < 15; i++) {
      const existing = rawVocabList[i];
      const normalizedExisting = existing?.word?.trim().toLowerCase();

      if (existing && normalizedExisting && !usedWordsGlobal.has(normalizedExisting)) {
        usedWordsGlobal.add(normalizedExisting);
        uniqueDayVocab.push({
          ...existing,
          id: `d${dayNum}_v${i + 1}`,
          detailedNote:
            existing.detailedNote ||
            `Từ vựng học thuật trọng tâm Band 7.5+ thuộc chủ đề "${cleanTitle}" (Ngày ${dayNum}/60).`
        });
      } else {
        uniqueDayVocab.push(pickNextUniqueWordFromPool(dayNum, i, cleanTitleEn, cleanTitle));
      }
    }

    const w = uniqueDayVocab;

    // 3. Synchronize Reading Passage so it weaves in this day's 15 unique words & tests them
    const baseParagraphs = item.readingPassage?.paragraphs || ['', '', ''];
    const baseTrans = item.readingPassage?.translationParagraphs || ['', '', ''];

    // Ensure Paragraph 1, 2, 3 contain the day's actual unique vocabulary words so highlighting works across all 60 days
    const para1HasWords = w.slice(0, 5).some(vw =>
      baseParagraphs[0]?.toLowerCase().includes(vw.word.toLowerCase())
    );
    const para2HasWords = w.slice(5, 10).some(vw =>
      baseParagraphs[1]?.toLowerCase().includes(vw.word.toLowerCase())
    );
    const para3HasWords = w.slice(10, 15).some(vw =>
      baseParagraphs[2]?.toLowerCase().includes(vw.word.toLowerCase())
    );

    const enrichedPara1En = para1HasWords
      ? baseParagraphs[0]
      : `${baseParagraphs[0]} In contemporary academic discourse on ${cleanTitleEn.toLowerCase()}, scholars emphasize ${w[0].word} (${w[0].collocations[0]}) and ${w[1].word}. Specifically, ${w[2].exampleEn} At the same time, understanding ${w[3].word} and ${w[4].word} provides a rigorous foundation for policy analysis.`;

    const enrichedPara1Vi = para1HasWords
      ? baseTrans[0]
      : `${baseTrans[0]} Trong các thảo luận học thuật đương đại về ${cleanTitle.toLowerCase()}, giới nghiên cứu đặc biệt nhấn mạnh yếu tố ${w[0].meaning.toLowerCase()} (${w[0].word}) và ${w[1].meaning.toLowerCase()} (${w[1].word}). Cụ thể, ${w[2].exampleVi} Đồng thời, việc nắm vững ${w[3].meaning.toLowerCase()} và ${w[4].meaning.toLowerCase()} tạo nền tảng vững chắc cho việc hoạch định chính sách.`;

    const enrichedPara2En = para2HasWords
      ? baseParagraphs[1]
      : `${baseParagraphs[1]} Empirical investigations further demonstrate how ${w[5].word} and ${w[6].word} shape real-world outcomes. For instance, ${w[7].exampleEn} Moreover, addressing ${w[8].word} alongside ${w[9].word} enables institutions to balance innovation with social responsibility.`;

    const enrichedPara2Vi = para2HasWords
      ? baseTrans[1]
      : `${baseTrans[1]} Các nghiên cứu thực nghiệm cũng chỉ ra cách thức mà ${w[5].meaning.toLowerCase()} (${w[5].word}) và ${w[6].meaning.toLowerCase()} (${w[6].word}) định hình kết quả thực tiễn. Chẳng hạn, ${w[7].exampleVi} Hơn nữa, giải quyết bài toán ${w[8].meaning.toLowerCase()} song hành cùng ${w[9].meaning.toLowerCase()} giúp các tổ chức cân bằng giữa đổi mới và trách nhiệm xã hội.`;

    const enrichedPara3En = para3HasWords
      ? baseParagraphs[2]
      : `${baseParagraphs[2]} Looking ahead, long-term progress in ${cleanTitleEn.toLowerCase()} depends on integrating ${w[10].word}, ${w[11].word}, and ${w[12].word}. ${w[13].exampleEn} Ultimately, cultivating ${w[14].word} (${w[14].collocations[0]}) ensures resilient and sustainable development.`;

    const enrichedPara3Vi = para3HasWords
      ? baseTrans[2]
      : `${baseTrans[2]} Nhìn về tương lai, sự tiến bộ bền vững trong lĩnh vực ${cleanTitle.toLowerCase()} phụ thuộc vào việc kết hợp hài hòa giữa ${w[10].meaning.toLowerCase()} (${w[10].word}), ${w[11].meaning.toLowerCase()} (${w[11].word}) và ${w[12].meaning.toLowerCase()} (${w[12].word}). ${w[13].exampleVi} Sau cùng, việc thúc đẩy ${w[14].meaning.toLowerCase()} (${w[14].word}) sẽ đảm bảo sự phát triển vững chắc.`;

    const qTargets = [0, 5, 10];
    const syncedQuestions: ChallengeReadingQuestion[] = qTargets.map((targetIdx, qNum) => {
      const target = w[targetIdx];
      const d1 = w[(targetIdx + 3) % 15];
      const d2 = w[(targetIdx + 7) % 15];
      const d3 = w[(targetIdx + 11) % 15];
      const rawOptions = [target.meaning, d1.meaning, d2.meaning, d3.meaning];
      const shift = (dayNum + qNum) % 4;
      const options = [
        rawOptions[shift % 4],
        rawOptions[(shift + 1) % 4],
        rawOptions[(shift + 2) % 4],
        rawOptions[(shift + 3) % 4]
      ];
      return {
        id: `d${dayNum}_rq${qNum + 1}`,
        questionText: `Trong ngữ cảnh bài đọc "${item.readingPassage?.title || cleanTitleEn}", từ vựng mục tiêu "${target.word}" (${target.pos}) mang ý nghĩa sát nhất là gì?`,
        targetWord: target.word,
        correctMeaning: target.meaning,
        options,
        explanationVi: `"${target.word}" (${target.ipa}) có nghĩa là "${target.meaning}". Câu ngữ cảnh: "${target.exampleEn}"`
      };
    });

    const readingPassage = {
      title: item.readingPassage?.title || `${cleanTitleEn}: Analytical Perspectives`,
      paragraphs: [enrichedPara1En, enrichedPara2En, enrichedPara3En],
      translationParagraphs: [enrichedPara1Vi, enrichedPara2Vi, enrichedPara3Vi],
      questions: syncedQuestions
    };

    // 4. Synchronize Writing Task 2 with Outline, Target Vocab from the 15 words, and Band 7.5+ Model Answer
    const keyVocabulary = w.map(vw => vw.word);
    const recommendedCollocations = w.slice(0, 10).map(vw => vw.collocations[0]).filter(Boolean);

    const existingBand80 = item.writing?.sampleEssays?.band80;
    const band80HasTargetWords =
      existingBand80 &&
      w.slice(0, 6).filter(vw =>
        existingBand80.essayParagraphs.join(' ').toLowerCase().includes(vw.word.toLowerCase())
      ).length >= 3;

    const syncedBand80Paragraphs = band80HasTargetWords
      ? existingBand80!.essayParagraphs
      : [
          `In the contemporary era, debates surrounding ${cleanTitleEn.toLowerCase()} have intensified considerably. Specifically, understanding the interplay between ${w[0].word} (${w[0].collocations[0]}) and ${w[1].word} has become a central priority for policymakers and citizens alike. This essay contends that while structural modernization brings undeniable advantages, safeguarding long-term societal well-being requires proactive regulation and ethical foresight.`,
          `On the one hand, there are compelling arguments in favor of advancing ${cleanTitleEn.toLowerCase()}. First and foremost, ${w[0].exampleEn} Furthermore, prioritizing ${w[2].word} alongside ${w[3].word} empowers institutions to achieve higher efficiency and inclusivity. ${w[4].exampleEn} When communities actively cultivate ${w[5].word} and ${w[6].word}, the resulting socio-economic dividends are substantial.`,
          `On the other hand, overlooking the systemic risks associated with this trend can lead to severe repercussions. In particular, ${w[7].exampleEn} Compounding this issue, the absence of ${w[8].word} and ${w[9].word} often exacerbates inequality. ${w[10].exampleEn} Therefore, governments must implement stringent frameworks centering on ${w[11].word} and ${w[12].word} to mitigate potential harm.`,
          `In conclusion, navigating the complexities of ${cleanTitleEn.toLowerCase()} demands a balanced, evidence-based strategy. Only by harmonizing ${w[13].word} with long-term commitments to ${w[14].word} (${w[14].collocations[0]}) can society secure equitable and sustainable progress.`
        ];

    const syncedBand80Trans = band80HasTargetWords
      ? existingBand80!.translationParagraphs
      : [
          `Trong kỷ nguyên đương đại, các cuộc tranh luận xoay quanh chủ đề ${cleanTitle.toLowerCase()} ngày càng trở nên sâu sắc. Cụ thể, việc thấu hiểu mối tương quan giữa ${w[0].meaning.toLowerCase()} (${w[0].word}) và ${w[1].meaning.toLowerCase()} (${w[1].word}) đã trở thành ưu tiên trọng tâm của cả các nhà hoạch định chính sách lẫn người dân. Bài tiểu luận này lập luận rằng mặc dù quá trình hiện đại hóa mang lại lợi ích không thể phủ nhận, việc bảo vệ phúc lợi xã hội lâu dài đòi hỏi sự điều tiết chủ động và tầm nhìn đạo đức.`,
          `Một mặt, có những luận điểm thuyết phục ủng hộ việc thúc đẩy ${cleanTitle.toLowerCase()}. Trước hết, ${w[0].exampleVi} Hơn thế nữa, việc ưu tiên ${w[2].meaning.toLowerCase()} (${w[2].word}) song hành cùng ${w[3].meaning.toLowerCase()} (${w[3].word}) giúp các tổ chức đạt hiệu suất và tính bao trùm cao hơn. ${w[4].exampleVi} Khi cộng đồng chủ động vun đắp ${w[5].meaning.toLowerCase()} và ${w[6].meaning.toLowerCase()}, thành quả kinh tế - xã hội mang lại là vô cùng to lớn.`,
          `Mặt khác, việc xem nhẹ những rủi ro hệ thống gắn liền với xu hướng này có thể dẫn đến hệ lụy nghiêm trọng. Đặc biệt, ${w[7].exampleVi} Làm trầm trọng thêm vấn đề, sự thiếu hụt ${w[8].meaning.toLowerCase()} (${w[8].word}) và ${w[9].meaning.toLowerCase()} (${w[9].word}) thường làm gia tăng bất bình đẳng. ${w[10].exampleVi} Do đó, chính phủ cần thực thi khung pháp lý chặt chẽ tập trung vào ${w[11].meaning.toLowerCase()} và ${w[12].meaning.toLowerCase()} nhằm giảm thiểu tác hại.`,
          `Tóm lại, việc giải quyết những khía cạnh phức tạp của ${cleanTitle.toLowerCase()} đòi hỏi một chiến lược cân bằng và dựa trên bằng chứng thực tiễn. Chỉ bằng cách dung hòa giữa ${w[13].meaning.toLowerCase()} (${w[13].word}) với cam kết dài hạn về ${w[14].meaning.toLowerCase()} (${w[14].word}), xã hội mới có thể đảm bảo sự tiến bộ công bằng và bền vững.`
        ];

    const writing = {
      ...item.writing,
      topic: cleanTitleEn || item.writing.topic,
      keyVocabulary,
      recommendedCollocations,
      band8Outline: {
        introduction: `${item.writing.band8Outline.introduction} (Từ vựng mục tiêu: ${w[0].word}, ${w[1].word})`,
        bodyParagraph1: `${item.writing.band8Outline.bodyParagraph1} (Từ vựng mục tiêu: ${w[2].word}, ${w[3].word}, ${w[4].word}, ${w[5].word})`,
        bodyParagraph2: `${item.writing.band8Outline.bodyParagraph2} (Từ vựng mục tiêu: ${w[7].word}, ${w[8].word}, ${w[9].word}, ${w[10].word})`,
        conclusion: `${item.writing.band8Outline.conclusion} (Từ vựng mục tiêu: ${w[13].word}, ${w[14].word})`
      },
      sampleEssays: {
        band65: item.writing.sampleEssays?.band65 || {
          bandLabel: 'Band 6.5 (B2 Upper-Intermediate)',
          levelTag: 'B2' as const,
          essayParagraphs: syncedBand80Paragraphs,
          translationParagraphs: syncedBand80Trans,
          examinerCommentary: `Bài mẫu sử dụng chuẩn xác các từ vựng mục tiêu của Ngày ${dayNum} (${w.slice(0, 5).map(v => v.word).join(', ')}).`
        },
        band80: {
          bandLabel: 'Band 7.5 - 8.0+ (C1 Advanced Model Answer)',
          levelTag: 'C1' as const,
          essayParagraphs: syncedBand80Paragraphs,
          translationParagraphs: syncedBand80Trans,
          examinerCommentary: `Bài mẫu Band 7.5–8.0+ tích hợp trực tiếp hệ thống 15 từ vựng mục tiêu của Ngày ${dayNum} (${w.slice(0, 8).map(v => v.word).join(', ')}...) cùng cấu trúc học thuật C1.`
        }
      }
    };

    // 5. Synchronize Speaking with Target Vocab from the 15 words, Outline/Strategy, and Band 7.5+ Model Answer
    const fixTypo = (text: string) =>
      typeof text === 'string' ? text.replace(/belleve/gi, 'believe') : text;
    const rawSpeaking = item.speaking
      ? (JSON.parse(fixTypo(JSON.stringify(item.speaking))) as ChallengeDay['speaking'])
      : item.speaking;

    if (rawSpeaking?.part1) {
      rawSpeaking.part1.topic1.usefulVocab = w.slice(0, 5).map(vw => ({
        word: vw.word,
        pos: vw.pos,
        meaningVi: vw.meaning
      }));
      rawSpeaking.part1.topic1.collocations = w.slice(0, 4).map(vw => ({
        phrase: vw.collocations[0],
        meaningVi: vw.meaning
      }));
      if (Array.isArray(rawSpeaking.part1.topic1.bilingualQuestions)) {
        rawSpeaking.part1.topic1.bilingualQuestions = rawSpeaking.part1.topic1.bilingualQuestions.map(
          (bq, qIdx) => {
            const targetW = w[qIdx % 5];
            const nextW = w[(qIdx + 1) % 5];
            const c1HasWord = bq.samples.C1.answerEn
              .toLowerCase()
              .includes(targetW.word.toLowerCase());
            return {
              ...bq,
              highlightedVocab: [targetW.word, nextW.word],
              samples: {
                ...bq.samples,
                C1: {
                  answerEn: c1HasWord
                    ? bq.samples.C1.answerEn
                    : `${bq.samples.C1.answerEn} In particular, ${targetW.exampleEn}`,
                  answerVi: c1HasWord
                    ? bq.samples.C1.answerVi
                    : `${bq.samples.C1.answerVi} Đặc biệt, ${targetW.exampleVi}`
                }
              }
            };
          }
        );
      }

      rawSpeaking.part1.topic2.usefulVocab = w.slice(5, 10).map(vw => ({
        word: vw.word,
        pos: vw.pos,
        meaningVi: vw.meaning
      }));
      rawSpeaking.part1.topic2.collocations = w.slice(5, 9).map(vw => ({
        phrase: vw.collocations[0],
        meaningVi: vw.meaning
      }));
      if (Array.isArray(rawSpeaking.part1.topic2.bilingualQuestions)) {
        rawSpeaking.part1.topic2.bilingualQuestions = rawSpeaking.part1.topic2.bilingualQuestions.map(
          (bq, qIdx) => {
            const targetW = w[5 + (qIdx % 5)];
            const nextW = w[5 + ((qIdx + 1) % 5)];
            const c1HasWord = bq.samples.C1.answerEn
              .toLowerCase()
              .includes(targetW.word.toLowerCase());
            return {
              ...bq,
              highlightedVocab: [targetW.word, nextW.word],
              samples: {
                ...bq.samples,
                C1: {
                  answerEn: c1HasWord
                    ? bq.samples.C1.answerEn
                    : `${bq.samples.C1.answerEn} Specifically, ${targetW.exampleEn}`,
                  answerVi: c1HasWord
                    ? bq.samples.C1.answerVi
                    : `${bq.samples.C1.answerVi} Cụ thể, ${targetW.exampleVi}`
                }
              }
            };
          }
        );
      }
    }

    if (rawSpeaking?.part2) {
      rawSpeaking.part2.usefulVocab = w.slice(10, 15).map(vw => ({
        word: vw.word,
        pos: vw.pos,
        meaningVi: vw.meaning
      }));
      rawSpeaking.part2.collocations = w.slice(10, 14).map(vw => ({
        phrase: vw.collocations[0],
        meaningVi: vw.meaning
      }));
      if (rawSpeaking.part2.sampleAnswers?.C1) {
        const c1Speech = rawSpeaking.part2.sampleAnswers.C1.speechEn;
        if (!c1Speech.toLowerCase().includes(w[10].word.toLowerCase())) {
          rawSpeaking.part2.sampleAnswers.C1.speechEn = `${c1Speech} Furthermore, prioritizing ${w[10].word} (${w[10].collocations[0]}) and ${w[11].word} ensures sustainable long-term benefits. ${w[12].exampleEn}`;
          rawSpeaking.part2.sampleAnswers.C1.speechVi = `${rawSpeaking.part2.sampleAnswers.C1.speechVi} Hơn nữa, việc ưu tiên ${w[10].meaning.toLowerCase()} (${w[10].word}) và ${w[11].meaning.toLowerCase()} (${w[11].word}) đảm bảo lợi ích bền vững lâu dài. ${w[12].exampleVi}`;
        }
      }
    }

    return {
      ...item,
      day: dayNum,
      week: weekNum,
      themeEn: cleanTitleEn || item.themeEn,
      title: cleanTitle,
      themeVi: cleanTitle,
      displayLabel:
        dayNum <= 60
          ? `Day ${dayNum}/60: ${bilingualTopic}`
          : `Day ${dayNum} (Mở rộng PDF): ${bilingualTopic}`,
      vocab: uniqueDayVocab,
      readingPassage,
      writing,
      speaking: rawSpeaking
    };
  });
};

const PDF_EXTENSION_TOPICS = [
  {
    day: 61,
    themeEn: 'Printed Books vs. Digital Reading',
    themeVi: 'Sách In & Văn Hóa Đọc Thời Đại Số (PDF Trang 12–13)',
    description: 'Chuyên đề mở rộng từ Ôn thi vstep.pdf: Phân tích ưu nhược điểm của E-books và Sách giấy cùng công thức Adapted F-S-F.',
    pdfWritingIdx: 0
  },
  {
    day: 62,
    themeEn: 'Relocating Businesses to Rural Areas',
    themeVi: 'Dịch Chuyển Doanh Nghiệp Về Nông Thôn (PDF Trang 28–30)',
    description: 'Chuyên đề mở rộng từ Ôn thi vstep.pdf: Giảm tải hạ tầng đô thị, bài toán ô nhiễm và ví dụ thực tế Samsung Bắc Ninh.',
    pdfWritingIdx: 1
  },
  {
    day: 63,
    themeEn: 'Biodiversity Loss & Environmental Priorities',
    themeVi: 'Đa Dạng Sinh Học & Ưu Tiên Môi Trường (PDF Trang 31)',
    description: 'Chuyên đề mở rộng từ Ôn thi vstep.pdf: Phân tích 2 mặt quan điểm về sự tuyệt chủng sinh vật và biến đổi khí hậu toàn cầu.',
    pdfWritingIdx: 2
  },
  {
    day: 64,
    themeEn: 'Antisocial Behavior & Public Respect',
    themeVi: 'Hành Vi Phản Xã Hội & Văn Minh Công Cộng (PDF Trang 45–47)',
    description: 'Chuyên đề mở rộng từ Ôn thi vstep.pdf: Nguyên nhân gây suy giảm sự tôn trọng nơi công cộng và giải pháp từ gia đình – pháp luật.',
    pdfWritingIdx: 3
  },
  {
    day: 65,
    themeEn: 'Formal & Informal Letter Writing Mastery',
    themeVi: 'Nghệ Thuật Viết Thư VSTEP & IELTS GT Task 1 (PDF Trang 52–56)',
    description: 'Chuyên đề mở rộng từ Ôn thi vstep.pdf: Nắm vững bộ khung câu chức năng cho Thư thân mật (Informal) và Thư trang trọng (Formal).',
    pdfWritingIdx: 4
  },
  {
    day: 66,
    themeEn: 'VSTEP & IELTS Speaking Synthesis',
    themeVi: 'Tổng Duyệt Speaking Part 1, 2, 3 & Ngữ Pháp Sửa Lỗi (PDF Trang 59–83)',
    description: 'Chuyên đề mở rộng từ Ôn thi vstep.pdf: Hệ thống hóa công thức 5W2H, 1 Đối tượng mẫu, Thảo luận giải pháp Part 2 và Sơ đồ tư duy Part 3.',
    pdfWritingIdx: 1
  }
];

const RAW_PDF_EXTENSION_DAYS: ChallengeDay[] = PDF_EXTENSION_TOPICS.map((ext, idx) => {
  const template = JSON.parse(JSON.stringify(DAYS_01_TO_15[idx % DAYS_01_TO_15.length])) as ChallengeDay;
  const pdfW = VSTEP_PDF_WRITING_BANK[ext.pdfWritingIdx] || VSTEP_PDF_WRITING_BANK[0];
  return {
    ...template,
    day: ext.day,
    week: 10,
    themeEn: ext.themeEn,
    themeVi: ext.themeVi,
    title: ext.themeVi,
    description: ext.description,
    writing: {
      ...template.writing,
      prompt: pdfW.promptEn,
      promptVi: pdfW.promptVi,
      band8Outline: {
        introduction: pdfW.outline.intro || template.writing.band8Outline.introduction,
        bodyParagraph1: pdfW.outline.body1 || template.writing.band8Outline.bodyParagraph1,
        bodyParagraph2: pdfW.outline.body2 || template.writing.band8Outline.bodyParagraph2,
        conclusion: pdfW.outline.conclusion || template.writing.band8Outline.conclusion
      }
    }
  };
});

export const CHALLENGE_60_DAYS: ChallengeDay[] = sanitize60DaysData([
  ...DAYS_01_TO_15,
  ...DAYS_16_TO_60,
  ...RAW_PDF_EXTENSION_DAYS
]);

/**
 * Returns the Curriculum (60 core days + Days 61–66 PDF Extension + any unlimited custom days > 66)
 * merged with user-imported vocabulary or day overrides from `master_english_custom_content_v1`.
 */
export function getMergedChallenge60Days(): ChallengeDay[] {
  const customStore = loadCustomContentStore();
  const overrides = customStore.customChallengeDays || {};

  const mergedBase = CHALLENGE_60_DAYS.map(dayItem => {
    const ov = overrides[dayItem.day];
    if (!ov) return dayItem;

    const mergedVocab = ov.replaceVocab?.length
      ? ov.replaceVocab
      : ov.extraVocab?.length
        ? [
            ...ov.extraVocab,
            ...dayItem.vocab.filter(
              w => !ov.extraVocab!.some(ew => ew.word.toLowerCase() === w.word.toLowerCase())
            )
          ]
        : dayItem.vocab;

    return {
      ...dayItem,
      themeVi: ov.themeVi || dayItem.themeVi,
      title: ov.themeVi || dayItem.title,
      themeEn: ov.themeEn || dayItem.themeEn,
      description: ov.description || dayItem.description,
      vocab: mergedVocab,
      readingPassage: {
        ...dayItem.readingPassage,
        title: ov.readingTitle || dayItem.readingPassage.title,
        paragraphs: ov.readingParagraphs?.length
          ? ov.readingParagraphs
          : dayItem.readingPassage.paragraphs,
        translationParagraphs: ov.readingTranslations?.length
          ? ov.readingTranslations
          : dayItem.readingPassage.translationParagraphs
      },
      writing: {
        ...dayItem.writing,
        prompt: ov.writingPrompt || dayItem.writing.prompt,
        promptVi: ov.writingPromptVi || dayItem.writing.promptVi,
        band8Outline: ov.writingOutline || dayItem.writing.band8Outline,
        keyVocabulary: mergedVocab.map(v => v.word)
      }
    };
  });

  // Also append any custom days beyond CHALLENGE_60_DAYS.length (e.g., Day 67, 68, ... unlimited)
  const existingDayNums = new Set(mergedBase.map(d => d.day));
  const extraCustomDays: ChallengeDay[] = Object.values(overrides)
    .filter(ov => ov && ov.day > 0 && !existingDayNums.has(ov.day))
    .sort((a, b) => a.day - b.day)
    .map(ov => {
      const fallback = mergedBase[(ov.day - 1) % mergedBase.length];
      const weekNum = Math.ceil(ov.day / 7);
      const customVocab = ov.replaceVocab?.length
        ? ov.replaceVocab
        : ov.extraVocab?.length
          ? [...ov.extraVocab, ...fallback.vocab.slice(0, Math.max(0, 15 - ov.extraVocab.length))]
          : fallback.vocab;
      return {
        ...fallback,
        day: ov.day,
        week: weekNum,
        themeEn: ov.themeEn || `Advanced Module Day ${ov.day}`,
        themeVi: ov.themeVi || `Chuyên đề mở rộng Ngày ${ov.day}`,
        title: ov.themeVi || `Chuyên đề mở rộng Ngày ${ov.day}`,
        displayLabel: `Day ${ov.day} (Mở rộng): ${ov.themeEn || ''} — ${ov.themeVi || ''}`,
        description: ov.description || fallback.description,
        vocab: customVocab,
        writing: {
          ...fallback.writing,
          prompt: ov.writingPrompt || fallback.writing.prompt,
          promptVi: ov.writingPromptVi || fallback.writing.promptVi,
          band8Outline: ov.writingOutline || fallback.writing.band8Outline,
          keyVocabulary: customVocab.map(v => v.word)
        }
      };
    });

  return [...mergedBase, ...extraCustomDays];
}
