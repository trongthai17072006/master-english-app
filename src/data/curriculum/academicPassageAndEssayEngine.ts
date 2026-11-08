import {
  CompactWordSeed,
  DayCurriculumBlueprint,
  compileDayBlueprint
} from './topicContentBuilder';
import { ChallengeDay, WritingTaskType } from './types';
import { CANONICAL_SPEAKING_SETS_1_TO_5 } from './speakingSets1To5';

export interface RichTopicSeed {
  day: number;
  themeVi: string;
  themeEn: string;
  description: string;
  words: [
    string, // word
    string, // ipa
    'n.' | 'v.' | 'adj.' | 'adv.' | 'phr.', // pos
    string, // meaningVi
    string, // collocation 1
    string, // collocation 2
    string, // collocation 3
    string, // exampleEn
    string  // exampleVi
  ][];
  readingTitle: string;
  readingHookEn: string;
  readingHookVi: string;
  readingBodyEn: string;
  readingBodyVi: string;
  readingConclusionEn: string;
  readingConclusionVi: string;
  questionType: WritingTaskType;
  wPromptEn: string;
  wPromptVi: string;
  wIntroOutline: string;
  wBody1Outline: string;
  wBody2Outline: string;
  wConclusionOutline: string;
  wCoreArgument1En: string;
  wCoreArgument1Vi: string;
  wCoreArgument2En: string;
  wCoreArgument2Vi: string;
  sTopic1En: string;
  sTopic1Vi: string;
  sTopic2En: string;
  sTopic2Vi: string;
  sPart1Q1En: string;
  sPart1Q1Vi: string;
  sPart1Q2En: string;
  sPart1Q2Vi: string;
  sPart1Q3En: string;
  sPart1Q3Vi: string;
  sPart2Q1En: string;
  sPart2Q1Vi: string;
  sPart2Q2En: string;
  sPart2Q2Vi: string;
  sPart2Q3En: string;
  sPart2Q3Vi: string;
  sSituationEn: string;
  sSituationVi: string;
  sOptionATitle: string;
  sOptionADescVi: string;
  sOptionAProsVi: string;
  sOptionAConsVi: string;
  sOptionBTitle: string;
  sOptionBDescVi: string;
  sOptionBProsVi: string;
  sOptionBConsVi: string;
  sOptionCTitle: string;
  sOptionCDescVi: string;
  sOptionCProsVi: string;
  sOptionCConsVi: string;
  customBand65Essay?: [string, string, string, string];
  customBand65Trans?: [string, string, string, string];
  customBand80Essay?: [string, string, string, string];
  customBand80Trans?: [string, string, string, string];
}

export function buildDayFromRichSeed(seed: RichTopicSeed): ChallengeDay {
  const words: CompactWordSeed[] = seed.words.map(tuple => ({
    word: tuple[0],
    ipa: tuple[1],
    pos: tuple[2],
    meaning: tuple[3],
    collocations: [tuple[4], tuple[5], tuple[6]],
    exampleEn: tuple[7],
    exampleVi: tuple[8],
    note: `Từ vựng học thuật trọng tâm chủ đề "${seed.themeVi}" — kết hợp tốt nhất trong cụm "${tuple[4]}".`
  }));

  const w0 = words[0];
  const w1 = words[1];
  const w2 = words[2];
  const w3 = words[3];
  const w4 = words[4];
  const w5 = words[5];
  const w6 = words[6];
  const w7 = words[7];
  const w8 = words[8];
  const w9 = words[9];

  const band65Paragraphs: [string, string, string, string] = seed.customBand65Essay || [
    `In recent years, the question of ${seed.themeEn.toLowerCase()} has attracted widespread public attention. Specifically, ${seed.wCoreArgument1En.charAt(0).toLowerCase() + seed.wCoreArgument1En.slice(1)} In this essay, I will examine both sides of this issue and explain why a balanced approach combining individual responsibility and practical policy is essential.`,
    `On the one hand, there are clear reasons why this trend has become so significant. First, ${w0.exampleEn} When people and institutions focus on ${w1.collocations[0]}, they can achieve notable improvements in daily life. For example, ${w2.exampleEn} Furthermore, ${w3.exampleEn} As a result, many experts support practical investments in this area.`,
    `On the other hand, ignoring the potential downsides can lead to serious consequences. ${seed.wCoreArgument2En} Specifically, ${w4.exampleEn} Moreover, ${w5.exampleEn} If authorities fail to address ${w6.collocations[0]}, communities may face long-term challenges. Therefore, promoting ${w7.collocations[0]} and ${w8.collocations[0]} is necessary to protect the public interest.`,
    `In conclusion, ${seed.themeEn.toLowerCase()} brings both opportunities and challenges that require careful management. By encouraging ${w0.collocations[0]} while preventing negative side effects through ${w9.collocations[0]}, governments and citizens can build a more sustainable future.`
  ];

  const band65Trans: [string, string, string, string] = seed.customBand65Trans || [
    `Trong những năm gần đây, vấn đề ${seed.themeVi.toLowerCase()} đã thu hút sự quan tâm sâu rộng của công chúng. Cụ thể, ${seed.wCoreArgument1Vi.charAt(0).toLowerCase() + seed.wCoreArgument1Vi.slice(1)} Trong bài tiểu luận này, tôi sẽ phân tích các khía cạnh của vấn đề và giải thích vì sao cách tiếp cận cân bằng giữa trách nhiệm cá nhân và chính sách thực tế là vô cùng thiết yếu.`,
    `Một mặt, có những lý do rõ ràng giải thích vì sao xu hướng này lại trở nên quan trọng đến vậy. Thứ nhất, ${w0.exampleVi} Khi cá nhân và tổ chức chú trọng vào "${w1.collocations[0]}" (${w1.meaning}), họ có thể tạo ra những cải thiện đáng kể trong đời sống. Chẳng hạn, ${w2.exampleVi} Hơn nữa, ${w3.exampleVi} Do đó, nhiều chuyên gia ủng hộ việc đầu tư thiết thực vào lĩnh vực này.`,
    `Mặt khác, việc phớt lờ những hệ lụy tiềm ẩn có thể dẫn đến hậu quả nghiêm trọng. ${seed.wCoreArgument2Vi} Cụ thể, ${w4.exampleVi} Thêm vào đó, ${w5.exampleVi} Nếu các cơ quan quản lý không giải quyết bài toán "${w6.collocations[0]}", cộng đồng có thể đối mặt với nhiều thách thức dài hạn. Vì vậy, thúc đẩy "${w7.collocations[0]}" là điều cần thiết để bảo vệ lợi ích chung.`,
    `Tóm lại, ${seed.themeVi.toLowerCase()} mang đến cả cơ hội lẫn thách thức đòi hỏi sự quản lý thận trọng. Bằng cách khuyến khích "${w0.collocations[0]}" đồng thời ngăn ngừa các tác động tiêu cực thông qua "${w9.collocations[0]}", chính phủ và người dân có thể kiến tạo một tương lai bền vững hơn.`
  ];

  const band80Paragraphs: [string, string, string, string] = seed.customBand80Essay || [
    `${seed.readingHookEn} Against this backdrop, ${seed.wCoreArgument1En.charAt(0).toLowerCase() + seed.wCoreArgument1En.slice(1)} This essay contends that while the immediate benefits of this development are undeniable, safeguarding long-term societal well-being necessitates proactive institutional regulation and civic awareness.`,
    `To begin with, the primary catalyst behind this phenomenon lies in structural shifts across modern society. ${w0.exampleEn} Furthermore, ${w1.exampleEn} From an analytical perspective, prioritizing ${w2.collocations[0]} alongside ${w3.collocations[0]} empowers communities to adapt effectively. ${w4.exampleEn} Consequently, the tangible gains generated by these advancements cannot be overlooked.`,
    `Nevertheless, an uncritical embrace of these trends carries profound socio-economic and ethical risks. ${seed.wCoreArgument2En} In particular, ${w5.exampleEn} Compounding this concern, ${w6.exampleEn} Without targeted interventions such as ${w7.collocations[0]} and ${w8.collocations[0]}, these pressures could erode social cohesion. ${w9.exampleEn}`,
    `In conclusion, navigating the complexities of ${seed.themeEn.toLowerCase()} demands a nuanced, multi-pronged strategy. Only by harmonizing ${w0.collocations[0]} with rigorous safeguards for ${w8.collocations[0]} can policymakers and citizens ensure equitable and enduring progress.`
  ];

  const band80Trans: [string, string, string, string] = seed.customBand80Trans || [
    `${seed.readingHookVi} Trong bối cảnh đó, ${seed.wCoreArgument1Vi.charAt(0).toLowerCase() + seed.wCoreArgument1Vi.slice(1)} Bài tiểu luận này lập luận rằng mặc dù những lợi ích trước mắt của sự phát triển này là không thể phủ nhận, việc bảo vệ phúc lợi xã hội lâu dài đòi hỏi sự điều tiết chủ động từ thể chế cùng nhận thức sâu sắc của công dân.`,
    `Trước hết, động lực chính đằng sau hiện tượng này nằm ở những chuyển dịch mang tính cấu trúc trong xã hội hiện đại. ${w0.exampleVi} Hơn thế nữa, ${w1.exampleVi} Dưới góc độ phân tích chuyên sâu, việc ưu tiên "${w2.collocations[0]}" song hành cùng "${w3.collocations[0]}" trao quyền cho cộng đồng thích ứng hiệu quả. ${w4.exampleVi} Do đó, những thành tựu thực chất mà tiến bộ này mang lại là điều không thể phủ nhận.`,
    `Tuy nhiên, việc đón nhận thiếu chọn lọc các xu hướng này tiềm ẩn nhiều rủi ro kinh tế - xã hội và đạo đức sâu sắc. ${seed.wCoreArgument2Vi} Đặc biệt, ${w5.exampleVi} Làm trầm trọng thêm mối lo ngại này, ${w6.exampleVi} Nếu thiếu đi các giải pháp can thiệp trọng tâm như "${w7.collocations[0]}" và "${w8.collocations[0]}", những áp lực này có thể làm xói mòn sự gắn kết xã hội. ${w9.exampleVi}`,
    `Tóm lại, việc giải quyết những khía cạnh phức tạp của ${seed.themeVi.toLowerCase()} đòi hỏi một chiến lược đa chiều và sắc bén. Chỉ bằng cách dung hòa giữa "${w0.collocations[0]}" với các cơ chế bảo vệ nghiêm ngặt cho "${w8.collocations[0]}", các nhà hoạch định chính sách và người dân mới có thể đảm bảo sự tiến bộ công bằng và bền vững.`
  ];

  const bp: DayCurriculumBlueprint = {
    day: seed.day,
    themeVi: seed.themeVi,
    themeEn: seed.themeEn,
    description: seed.description,
    words,
    reading: {
      title: seed.readingTitle,
      paragraphs: [seed.readingHookEn, seed.readingBodyEn, seed.readingConclusionEn],
      translationParagraphs: [seed.readingHookVi, seed.readingBodyVi, seed.readingConclusionVi]
    },
    writing: {
      questionType: seed.questionType,
      prompt: seed.wPromptEn,
      promptVi: seed.wPromptVi,
      outline: {
        introduction: seed.wIntroOutline,
        bodyParagraph1: seed.wBody1Outline,
        bodyParagraph2: seed.wBody2Outline,
        conclusion: seed.wConclusionOutline
      },
      band65Paragraphs,
      band65Trans,
      band80Paragraphs,
      band80Trans
    },
    speakingOverride: undefined,
    speakingSeed: {
          topic1TitleEn: seed.sTopic1En,
          topic1TitleVi: seed.sTopic1Vi,
          t1Questions: [
            {
              qEn: seed.sPart1Q1En,
              qVi: seed.sPart1Q1Vi,
              ideas: [
                `Liên hệ thực tế đời sống tại Việt Nam xoay quanh ${seed.sTopic1Vi.toLowerCase()}`,
                `Sử dụng cụm "${w0.collocations[0]}" (${w0.meaning}) để làm nổi bật quan điểm`
              ],
              b1En: `In my daily life, I notice that ${seed.sTopic1En.toLowerCase()} plays an important role. ${w0.exampleEn} I think people are paying much more attention to this issue nowadays.`,
              b1Vi: `Trong cuộc sống hằng ngày, tôi nhận thấy ${seed.sTopic1Vi.toLowerCase()} đóng vai trò rất quan trọng. ${w0.exampleVi} Tôi nghĩ ngày nay mọi người đang quan tâm nhiều hơn tới vấn đề này.`,
              b2En: `From my observation, ${seed.sTopic1En.toLowerCase()} has become a major topic of discussion in my community. Specifically, ${w0.exampleEn} Furthermore, ${w1.exampleEn}`,
              b2Vi: `Qua quan sát của tôi, ${seed.sTopic1Vi.toLowerCase()} đã trở thành chủ đề thảo luận lớn trong cộng đồng. Cụ thể, ${w0.exampleVi} Hơn nữa, ${w1.exampleVi}`,
              c1En: `Undeniably, ${seed.sTopic1En.toLowerCase()} shapes contemporary lifestyles in profound ways. ${w0.exampleEn} Moreover, fostering ${w1.collocations[0]} is indispensable for long-term well-being.`,
              c1Vi: `Không thể phủ nhận rằng ${seed.sTopic1Vi.toLowerCase()} đang định hình lối sống đương đại một cách sâu sắc. ${w0.exampleVi} Hơn thế nữa, việc thúc đẩy "${w1.collocations[0]}" là yếu tố không thể thiếu cho phúc lợi lâu dài.`
            },
            {
              qEn: seed.sPart1Q2En,
              qVi: seed.sPart1Q2Vi,
              ideas: [
                `So sánh sự thay đổi nhận thức giữa thế hệ trẻ và thế hệ đi trước`,
                `Kết hợp từ vựng "${w2.word}" (${w2.meaning}) kèm ví dụ cụ thể`
              ],
              b1En: `I believe there is a clear difference in how people approach this. Today, young people are very active in learning about ${w2.word}. ${w2.exampleEn}`,
              b1Vi: `Tôi tin rằng có sự khác biệt rõ rệt trong cách mọi người tiếp cận vấn đề này. Ngày nay, giới trẻ rất chủ động tìm hiểu về ${w2.meaning}. ${w2.exampleVi}`,
              b2En: `There has been a noticeable shift in public attitudes over recent years. ${w2.exampleEn} In addition, ${w3.exampleEn}`,
              b2Vi: `Đã có một sự chuyển biến rõ nét trong thái độ của công chúng những năm gần đây. ${w2.exampleVi} Thêm vào đó, ${w3.exampleVi}`,
              c1En: `Public awareness regarding this domain has evolved considerably. ${w2.exampleEn} By prioritizing ${w3.collocations[0]}, individuals can navigate modern challenges far more effectively.`,
              c1Vi: `Nhận thức của công chúng về lĩnh vực này đã tiến bộ đáng kể. ${w2.exampleVi} Bằng cách ưu tiên "${w3.collocations[0]}", mỗi cá nhân có thể vượt qua các thách thức hiện đại hiệu quả hơn nhiều.`
            },
            {
              qEn: seed.sPart1Q3En,
              qVi: seed.sPart1Q3Vi,
              ideas: [
                `Đề xuất thói quen cá nhân hoặc giải pháp thiết thực có thể áp dụng ngay`,
                `Nhấn mạnh lợi ích bền vững qua cụm "${w4.collocations[0]}"`
              ],
              b1En: `In my opinion, everyone can take small steps every day to make a positive change. For example, ${w4.exampleEn}`,
              b1Vi: `Theo ý kiến của tôi, mỗi người đều có thể thực hiện những bước nhỏ hằng ngày để tạo ra thay đổi tích cực. Ví dụ, ${w4.exampleVi}`,
              b2En: `Personally, I try to adopt practical habits that align with sustainable values. ${w4.exampleEn} I also believe schools and families should encourage ${w4.collocations[0]}.`,
              b2Vi: `Cá nhân tôi luôn cố gắng xây dựng những thói quen thiết thực gắn với giá trị bền vững. ${w4.exampleVi} Tôi cũng tin rằng nhà trường và gia đình nên khuyến khích "${w4.collocations[0]}".`,
              c1En: `Cultivating proactive habits at an individual level is paramount. ${w4.exampleEn} When citizens consistently champion ${w4.collocations[0]}, the cumulative impact on society is transformative.`,
              c1Vi: `Việc hình thành thói quen chủ động ở cấp độ cá nhân là tối quan trọng. ${w4.exampleVi} Khi công dân kiên trì thúc đẩy "${w4.collocations[0]}", tác động cộng hưởng lên toàn xã hội sẽ vô cùng mạnh mẽ.`
            }
          ],
          topic2TitleEn: seed.sTopic2En,
          topic2TitleVi: seed.sTopic2Vi,
          t2Questions: [
            {
              qEn: seed.sPart2Q1En,
              qVi: seed.sPart2Q1Vi,
              ideas: [
                `Phân tích tác động trực tiếp của ${seed.sTopic2Vi.toLowerCase()} đến chất lượng sống`,
                `Đưa từ vựng "${w5.word}" (${w5.meaning}) vào câu trả lời`
              ],
              b1En: `I think ${seed.sTopic2En.toLowerCase()} affects all of us every day. Specifically, ${w5.exampleEn}`,
              b1Vi: `Tôi nghĩ ${seed.sTopic2Vi.toLowerCase()} ảnh hưởng đến tất cả chúng ta mỗi ngày. Cụ thể, ${w5.exampleVi}`,
              b2En: `This aspect of ${seed.sTopic2En.toLowerCase()} has a direct bearing on our quality of life. ${w5.exampleEn} Moreover, ${w6.exampleEn}`,
              b2Vi: `Khía cạnh này của ${seed.sTopic2Vi.toLowerCase()} có tác động trực tiếp đến chất lượng cuộc sống của chúng ta. ${w5.exampleVi} Hơn nữa, ${w6.exampleVi}`,
              c1En: `From a socio-economic standpoint, ${seed.sTopic2En.toLowerCase()} is deeply intertwined with community prosperity. ${w5.exampleEn} Addressing ${w6.collocations[0]} is therefore a top priority.`,
              c1Vi: `Dưới góc độ kinh tế - xã hội, ${seed.sTopic2Vi.toLowerCase()} gắn kết mật thiết với sự thịnh vượng của cộng đồng. ${w5.exampleVi} Do đó, giải quyết vấn đề "${w6.collocations[0]}" là ưu tiên hàng đầu.`
            },
            {
              qEn: seed.sPart2Q2En,
              qVi: seed.sPart2Q2Vi,
              ideas: [
                `Chỉ ra thách thức lớn nhất hiện nay và nguyên nhân cốt lõi`,
                `Vận dụng cụm "${w7.collocations[0]}" (${w7.meaning})`
              ],
              b1En: `The biggest challenge is that changing old habits takes time and effort. ${w7.exampleEn}`,
              b1Vi: `Thách thức lớn nhất là việc thay đổi thói quen cũ đòi hỏi nhiều thời gian và công sức. ${w7.exampleVi}`,
              b2En: `One major obstacle is balancing short-term convenience with long-term sustainability. ${w7.exampleEn} Furthermore, ${w8.exampleEn}`,
              b2Vi: `Một rào cản lớn là việc cân bằng giữa sự tiện lợi trước mắt và tính bền vững lâu dài. ${w7.exampleVi} Hơn nữa, ${w8.exampleVi}`,
              c1En: `The primary impediment lies in reconciling immediate economic pressures with ethical imperatives. ${w7.exampleEn} Consequently, institutions must champion ${w8.collocations[0]}.`,
              c1Vi: `Rào cản chính nằm ở việc dung hòa giữa áp lực kinh tế trước mắt và các chuẩn mực đạo đức. ${w7.exampleVi} Do vậy, các tổ chức cần đi đầu thúc đẩy "${w8.collocations[0]}".`
            },
            {
              qEn: seed.sPart2Q3En,
              qVi: seed.sPart2Q3Vi,
              ideas: [
                `Dự đoán xu hướng phát triển trong 5–10 năm tới`,
                `Sử dụng từ "${w9.word}" (${w9.meaning}) để kết luận ấn tượng`
              ],
              b1En: `In the future, I hope governments and citizens will work together more closely. ${w9.exampleEn}`,
              b1Vi: `Trong tương lai, tôi hy vọng chính phủ và người dân sẽ hợp tác chặt chẽ hơn. ${w9.exampleVi}`,
              b2En: `Looking ahead to the next decade, I am optimistic that better policies and education will make a difference. ${w9.exampleEn}`,
              b2Vi: `Nhìn về thập kỷ tới, tôi lạc quan rằng các chính sách tốt hơn cùng giáo dục sẽ tạo nên sự khác biệt. ${w9.exampleVi}`,
              c1En: `Over the coming decade, a combination of technological innovation and civic responsibility will likely reshape ${seed.sTopic2En.toLowerCase()}. ${w9.exampleEn}`,
              c1Vi: `Trong thập kỷ tới, sự kết hợp giữa đổi mới công nghệ và trách nhiệm công dân chắc chắn sẽ định hình lại ${seed.sTopic2Vi.toLowerCase()}. ${w9.exampleVi}`
            }
          ],
          part2SituationEn: seed.sSituationEn,
          part2SituationVi: seed.sSituationVi,
          options: [
            {
              title: seed.sOptionATitle,
              descVi: seed.sOptionADescVi,
              prosVi: seed.sOptionAProsVi,
              consVi: seed.sOptionAConsVi,
              prosEn: ['Creates immediate visibility and formal structure', 'Backed by institutional authority'],
              consEn: ['High implementation cost and rigid rules', 'May face resistance without community buy-in']
            },
            {
              title: seed.sOptionBTitle,
              descVi: seed.sOptionBDescVi,
              prosVi: seed.sOptionBProsVi,
              consVi: seed.sOptionBConsVi,
              prosEn: ['Addresses root causes through practical awareness and engagement', 'Cost-effective, inclusive, and sustainable in the long run'],
              consEn: ['Requires consistent effort over several weeks to see full results']
            },
            {
              title: seed.sOptionCTitle,
              descVi: seed.sOptionCDescVi,
              prosVi: seed.sOptionCProsVi,
              consVi: seed.sOptionCConsVi,
              prosEn: ['Convenient and modern approach', 'Appeals to tech-focused individuals'],
              consEn: ['Lacks personal human mentorship and hands-on accountability']
            }
          ],
          chosenLetter: 'B',
          part2Samples: {
            b1En: `Considering the situation regarding ${seed.themeEn.toLowerCase()}, I believe ${seed.sOptionBTitle} is the best choice. First, this option is very practical and helps people understand the issue deeply. ${w1.exampleEn} Second, it is affordable and easy for everyone in the community to join. On the other hand, ${seed.sOptionATitle} is too expensive and strict, while ${seed.sOptionCTitle} lacks face-to-face support. Therefore, Option B is definitely the most effective solution.`,
            b1Vi: `Xét tình huống liên quan đến ${seed.themeVi.toLowerCase()}, tôi tin rằng ${seed.sOptionBTitle} là lựa chọn tốt nhất. Thứ nhất, phương án này rất thiết thực và giúp mọi người hiểu sâu sắc vấn đề. ${w1.exampleVi} Thứ hai, chi phí hợp lý và dễ dàng để mọi người cùng tham gia. Ngược lại, ${seed.sOptionATitle} quá tốn kém và cứng nhắc, trong khi ${seed.sOptionCTitle} lại thiếu sự hỗ trợ trực tiếp. Vì vậy, Phương án B chắc chắn là giải pháp hiệu quả nhất.`,
            b2En: `When evaluating the three proposals for ${seed.themeEn.toLowerCase()}, I am convinced that ${seed.sOptionBTitle} stands out as the optimal choice. The primary advantage is that it fosters lasting behavioral change and practical engagement. Specifically, ${w1.exampleEn} Furthermore, ${w3.exampleEn} By contrast, although ${seed.sOptionATitle} sounds forceful on paper, it is costly and hard to maintain. Meanwhile, ${seed.sOptionCTitle} is somewhat superficial and lacks real-world interaction. All things considered, Option B offers the most sustainable outcome.`,
            b2Vi: `Khi đánh giá ba đề xuất cho chủ đề ${seed.themeVi.toLowerCase()}, tôi tin chắc rằng ${seed.sOptionBTitle} nổi bật là lựa chọn tối ưu nhất. Ưu điểm hàng đầu là phương án này thúc đẩy sự thay đổi hành vi lâu dài và sự tham gia thực chất. Cụ thể, ${w1.exampleVi} Hơn nữa, ${w3.exampleVi} Ngược lại, dù ${seed.sOptionATitle} nghe có vẻ mạnh mẽ trên lý thuyết nhưng lại tốn kém và khó duy trì. Trong khi đó, ${seed.sOptionCTitle} khá bề nổi và thiếu sự tương tác thực tế. Xét mọi khía cạnh, Phương án B mang lại kết quả bền vững nhất.`,
            c1En: `After weighing the merits and limitations of all three alternatives regarding ${seed.themeEn.toLowerCase()}, I unequivocally advocate ${seed.sOptionBTitle}. First and foremost, this approach tackles the root of the issue by cultivating ${w1.collocations[0]} and empowering participants with hands-on experience. ${w2.exampleEn} Additionally, it strikes an ideal balance between financial feasibility and long-term impact. Conversely, while ${seed.sOptionATitle} relies on top-down measures, its prohibitive cost and rigidity limit its effectiveness. Similarly, ${seed.sOptionCTitle}, despite its modern appeal, cannot substitute for authentic human engagement. Ultimately, Option B represents the most pragmatic and transformative pathway.`,
            c1Vi: `Sau khi cân nhắc kỹ lưỡng ưu và nhược điểm của cả ba phương án liên quan đến ${seed.themeVi.toLowerCase()}, tôi hoàn toàn ủng hộ ${seed.sOptionBTitle}. Trước hết, cách tiếp cận này giải quyết tận gốc vấn đề bằng cách vun đắp "${w1.collocations[0]}" và trao quyền cho người tham gia qua trải nghiệm thực tế. ${w2.exampleVi} Thêm vào đó, phương án này tạo ra sự cân bằng lý tưởng giữa tính khả thi về tài chính và tác động lâu dài. Ngược lại, dù ${seed.sOptionATitle} dựa vào các biện pháp áp đặt từ trên xuống, chi phí đắt đỏ và sự cứng nhắc làm hạn chế hiệu quả của nó. Tương tự, ${seed.sOptionCTitle}, bất chấp vẻ hiện đại, không thể thay thế sự gắn kết trực tiếp giữa con người. Tóm lại, Phương án B là lộ trình thực tế và giàu tính chuyển hóa nhất.`
          }
        }
  };

  return compileDayBlueprint(bp);
}
