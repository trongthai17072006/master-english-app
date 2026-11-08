import { VstepSpeakingTask, SpeakingPart2Step } from './types';
import { STANDARD_PART2_STEPS } from './speakingSets1To5';

export interface CompactVstepTestSeed {
  day: number;
  testId: number;
  t1Title: string;
  t1TitleVi: string;
  t1Questions: [
    { qEn: string; qVi: string; b1: string; b1Vi: string; b2c1: string; b2c1Vi: string; vocab: string[] },
    { qEn: string; qVi: string; b1: string; b1Vi: string; b2c1: string; b2c1Vi: string; vocab: string[] },
    { qEn: string; qVi: string; b1: string; b1Vi: string; b2c1: string; b2c1Vi: string; vocab: string[] }
  ];
  t2Title: string;
  t2TitleVi: string;
  t2Questions: [
    { qEn: string; qVi: string; b1: string; b1Vi: string; b2c1: string; b2c1Vi: string; vocab: string[] },
    { qEn: string; qVi: string; b1: string; b1Vi: string; b2c1: string; b2c1Vi: string; vocab: string[] },
    { qEn: string; qVi: string; b1: string; b1Vi: string; b2c1: string; b2c1Vi: string; vocab: string[] }
  ];
  p2Situation: string;
  p2SituationVi: string;
  p2Chosen: 'A' | 'B' | 'C';
  p2Options: [
    { letter: 'A'; title: string; descVi: string; prosVi: string; consVi: string; reasoningEn: string },
    { letter: 'B'; title: string; descVi: string; prosVi: string; consVi: string; reasoningEn: string },
    { letter: 'C'; title: string; descVi: string; prosVi: string; consVi: string; reasoningEn: string }
  ];
  p2SpeechB1: string;
  p2SpeechB1Vi: string;
  p2SpeechB2C1: string;
  p2SpeechB2C1Vi: string;
  p3Central: string;
  p3CentralVi: string;
  p3Prompts: [
    { point: string; pointVi: string; exp: string; expVi: string },
    { point: string; pointVi: string; exp: string; expVi: string },
    { point: string; pointVi: string; exp: string; expVi: string }
  ];
  p3OwnIdea: { point: string; pointVi: string; exp: string; expVi: string };
  p3SpeechB1: string;
  p3SpeechB1Vi: string;
  p3SpeechB2C1: string;
  p3SpeechB2C1Vi: string;
  p3FollowUps: [
    { q: string; qVi: string; b1: string; b2c1: string; vi: string },
    { q: string; qVi: string; b1: string; b2c1: string; vi: string },
    { q: string; qVi: string; b1: string; b2c1: string; vi: string }
  ];
}

function compileVstepSeed(seed: CompactVstepTestSeed): VstepSpeakingTask {
  const chosenOpt = seed.p2Options.find(o => o.letter === seed.p2Chosen) || seed.p2Options[0];

  return {
    setCode: `VSTEP ĐỀ #${String(seed.testId).padStart(2, '0')} (NGÀY ${seed.day})`,
    sourceType: 'vstep_28_bank',
    originalTestId: seed.testId,
    part1: {
      topic1: {
        title: seed.t1Title,
        titleVi: seed.t1TitleVi,
        questions: seed.t1Questions.map(q => q.qEn),
        bilingualQuestions: seed.t1Questions.map(q => ({
          questionEn: q.qEn,
          questionVi: q.qVi,
          suggestedIdeas: [
            `Trả lời trực tiếp trọng tâm câu hỏi kèm giải thích thực tế`,
            `Vận dụng từ vựng học thuật: ${q.vocab.join(', ')}`
          ],
          highlightedVocab: q.vocab,
          samples: {
            B1: { answerEn: q.b1, answerVi: q.b1Vi },
            B2: { answerEn: q.b2c1, answerVi: q.b2c1Vi },
            C1: { answerEn: q.b2c1, answerVi: q.b2c1Vi }
          }
        }))
      },
      topic2: {
        title: seed.t2Title,
        titleVi: seed.t2TitleVi,
        questions: seed.t2Questions.map(q => q.qEn),
        bilingualQuestions: seed.t2Questions.map(q => ({
          questionEn: q.qEn,
          questionVi: q.qVi,
          suggestedIdeas: [
            `Mở rộng câu trả lời theo cấu trúc: Quan điểm -> Nguyên nhân -> Ví dụ cá nhân`,
            `Từ vựng ăn điểm: ${q.vocab.join(', ')}`
          ],
          highlightedVocab: q.vocab,
          samples: {
            B1: { answerEn: q.b1, answerVi: q.b1Vi },
            B2: { answerEn: q.b2c1, answerVi: q.b2c1Vi },
            C1: { answerEn: q.b2c1, answerVi: q.b2c1Vi }
          }
        }))
      },
      part1Tips: [
        `Đề VSTEP gốc #${seed.testId} (Đã chuẩn hóa B1 & B2/C1): Trả lời 3–4 câu cho mỗi câu hỏi, tuyệt đối không trả lời cụt lủn 1 câu.`,
        `Kết hợp linh hoạt các từ vựng chủ đề được highlight để tối ưu hóa điểm Lexical Resource.`
      ]
    },
    part2: {
      situation: seed.p2Situation,
      situationVi: seed.p2SituationVi,
      options: seed.p2Options.map(opt => ({
        letter: opt.letter,
        title: opt.title,
        description: opt.descVi,
        strongPoints: opt.prosVi,
        drawbacks: opt.consVi,
        isChosen: opt.letter === seed.p2Chosen,
        reasoningEn: opt.reasoningEn
      })) as any,
      requirement: 'Choose the best option among the three alternatives, justify your choice with clear arguments, and explain why you do not choose the other two options.',
      sampleStrategy: `Khẳng định chọn phương án ${chosenOpt.letter} (${chosenOpt.title}) ngay câu mở đầu, phân tích ưu điểm vượt trội (${chosenOpt.prosVi}), đồng thời phản biện hạn chế của hai phương án còn lại.`,
      usefulConnectors: [
        `Considering the specific situation, I firmly believe that ${chosenOpt.title} is the most practical and effective choice.`,
        `The primary advantage of this option is that ${chosenOpt.reasoningEn}`,
        `While the other two options have certain merits on the surface, their practical drawbacks are hard to ignore.`,
        `All things considered, Option ${chosenOpt.letter} stands out as the optimal solution.`
      ],
      answerStructure: STANDARD_PART2_STEPS as SpeakingPart2Step[],
      sampleAnswers: {
        B1: {
          chosenOption: `Option ${chosenOpt.letter}: ${chosenOpt.title}`,
          speechEn: seed.p2SpeechB1,
          speechVi: seed.p2SpeechB1Vi
        },
        B2: {
          chosenOption: `Option ${chosenOpt.letter}: ${chosenOpt.title}`,
          speechEn: seed.p2SpeechB2C1,
          speechVi: seed.p2SpeechB2C1Vi
        },
        C1: {
          chosenOption: `Option ${chosenOpt.letter}: ${chosenOpt.title}`,
          speechEn: seed.p2SpeechB2C1,
          speechVi: seed.p2SpeechB2C1Vi
        }
      }
    },
    part3: {
      title: 'Part 3: Topic Development (5 mins)',
      centralStatement: seed.p3Central,
      centralStatementVi: seed.p3CentralVi,
      prompts: seed.p3Prompts.map(p => ({
        point: p.point,
        pointVi: p.pointVi,
        explanation: p.exp,
        explanationVi: p.expVi
      })),
      yourOwnIdea: {
        point: seed.p3OwnIdea.point,
        pointVi: seed.p3OwnIdea.pointVi,
        explanation: seed.p3OwnIdea.exp,
        explanationVi: seed.p3OwnIdea.expVi
      },
      fullSampleB1: seed.p3SpeechB1,
      fullSampleB1Vi: seed.p3SpeechB1Vi,
      fullSampleB2C1: seed.p3SpeechB2C1,
      fullSampleB2C1Vi: seed.p3SpeechB2C1Vi,
      followUpQuestions: seed.p3FollowUps.map(f => ({
        question: f.q,
        questionVi: f.qVi,
        sampleB1: f.b1,
        sampleB2C1: f.b2c1,
        sampleB2C1Vi: f.vi
      }))
    }
  };
}

const VSTEP_28_SEEDS: CompactVstepTestSeed[] = [
  // DAY 1 -> TEST 21: Higher Education Should Be Free For Everyone
  {
    day: 1,
    testId: 21,
    t1Title: 'Reading Habits & Academic Books',
    t1TitleVi: 'Thói quen đọc sách & Tài liệu học thuật',
    t1Questions: [
      {
        qEn: 'Do you enjoy reading books in your free time? What kind of books do you like best?',
        qVi: 'Bạn có thích đọc sách vào thời gian rảnh không? Bạn thích thể loại sách nào nhất?',
        b1: 'Yes, I really enjoy reading books in my free time. I like non-fiction books about science and personal development because they give me useful knowledge for my university studies.',
        b1Vi: 'Có, tôi rất thích đọc sách vào thời gian rảnh. Tôi thích sách phi hư cấu về khoa học và phát triển bản thân vì chúng mang lại kiến thức hữu ích cho việc học đại học của tôi.',
        b2c1: 'Absolutely, I am an avid reader. I predominantly gravitate toward non-fiction literature, particularly cognitive psychology and popular science, as they cultivate an inquisitive mindset and sharpen my analytical thinking.',
        b2c1Vi: 'Hoàn toàn có, tôi là một người đam mê đọc sách. Tôi chủ yếu tìm đến các tác phẩm phi hư cấu, đặc biệt là tâm lý học nhận thức và khoa học thường thức, vì chúng nuôi dưỡng tư duy ham học hỏi và mài sắc khả năng phân tích của tôi.',
        vocab: ['avid reader', 'inquisitive', 'analytical thinking']
      },
      {
        qEn: 'Do you prefer reading printed books or e-books on digital devices?',
        qVi: 'Bạn thích đọc sách giấy in truyền thống hay sách điện tử (e-books) trên thiết bị số hơn?',
        b1: 'I prefer reading printed books when I am at home because holding a real book feels comfortable and does not hurt my eyes. However, I use e-books on my tablet when I travel to school.',
        b1Vi: 'Tôi thích đọc sách giấy khi ở nhà vì cầm một cuốn sách thật rất thoải mái và không làm mỏi mắt. Tuy nhiên, tôi dùng sách điện tử trên máy tính bảng khi đi học.',
        b2c1: 'I strike a balance between both formats depending on the context. For deep academic comprehension, I prefer physical paperbacks because tactile page-turning aids memory retention without digital eye strain, whereas e-books are unmatched for portability.',
        b2c1Vi: 'Tôi cân bằng cả hai định dạng tùy thuộc vào hoàn cảnh. Để đọc hiểu học thuật sâu, tôi thích sách giấy vì việc lật trang giúp ghi nhớ tốt hơn mà không gây mỏi mắt kỹ thuật số, trong khi sách điện tử lại vô địch về tính tiện lợi khi di chuyển.',
        vocab: ['comprehension', 'memory retention', 'portability']
      },
      {
        qEn: 'How have your reading habits changed since you entered university?',
        qVi: 'Thói quen đọc của bạn đã thay đổi như thế nào kể từ khi bước vào đại học?',
        b1: 'When I was in high school, I mostly read comic books and short stories. Since I entered university, I have had to read many academic journals and English textbooks for my major.',
        b1Vi: 'Khi còn học cấp ba, tôi chủ yếu đọc truyện tranh và truyện ngắn. Từ khi vào đại học, tôi phải đọc nhiều tạp chí học thuật và giáo trình tiếng Anh cho chuyên ngành của mình.',
        b2c1: 'My reading habits have shifted dramatically from recreational fiction to interdisciplinary scholarly journals. University pedagogy requires students to become autonomous researchers who critically evaluate empirical evidence rather than relying on rote learning.',
        b2c1Vi: 'Thói quen đọc của tôi đã chuyển dịch mạnh mẽ từ truyện giải trí sang các tạp chí học thuật liên ngành. Phương pháp sư phạm đại học đòi hỏi sinh viên trở thành những nhà nghiên cứu tự chủ, biết đánh giá bằng chứng thực nghiệm thay vì học vẹt.',
        vocab: ['interdisciplinary', 'pedagogy', 'autonomous']
      }
    ],
    t2Title: 'Higher Education & Career Preparation',
    t2TitleVi: 'Giáo dục đại học & Chuẩn bị nghề nghiệp',
    t2Questions: [
      {
        qEn: 'Why do so many young people choose to attend university after high school?',
        qVi: 'Tại sao rất nhiều người trẻ lựa chọn học đại học sau khi tốt nghiệp cấp ba?',
        b1: 'Most young people go to university because a bachelor degree helps them find a better job with a higher salary. Also, university life helps them make new friends and become more independent.',
        b1Vi: 'Hầu hết người trẻ vào đại học vì tấm bằng cử nhân giúp họ tìm được công việc tốt hơn với mức lương cao hơn. Ngoài ra, đời sống đại học giúp họ kết bạn mới và tự lập hơn.',
        b2c1: 'Tertiary education remains the primary springboard for upward social mobility. Beyond acquiring specialized credentials, undergraduates benefit from an intellectually stimulating curriculum and extracurricular networks that prepare them for leadership roles.',
        b2c1Vi: 'Giáo dục đại học vẫn là bệ phóng chính cho sự thăng tiến xã hội. Ngoài việc lấy bằng cấp chuyên môn, sinh viên còn hưởng lợi từ chương trình học kích thích trí tuệ và mạng lưới ngoại khóa chuẩn bị cho các vị trí lãnh đạo.',
        vocab: ['curriculum', 'extracurricular', 'upward mobility']
      },
      {
        qEn: 'Do you think vocational training is as valuable as a university degree?',
        qVi: 'Bạn có nghĩ đào tạo nghề thực hành cũng có giá trị ngang với bằng đại học không?',
        b1: 'Yes, I believe vocational training is very valuable. Not everyone wants to study theory for four years, and vocational schools teach practical skills that companies need immediately.',
        b1Vi: 'Có, tôi tin rằng đào tạo nghề rất có giá trị. Không phải ai cũng muốn học lý thuyết suốt 4 năm, và các trường nghề dạy những kỹ năng thực tế mà doanh nghiệp cần ngay lập tức.',
        b2c1: 'Unquestionably. Vocational training equips youths with hands-on technical competencies that are in acute demand across modern industries. A healthy economy needs both erudite academic researchers and skilled vocational technicians.',
        b2c1Vi: 'Không còn nghi ngờ gì nữa. Đào tạo nghề trang bị cho người trẻ năng lực kỹ thuật thực hành đang rất khan hiếm trong các ngành công nghiệp hiện đại. Một nền kinh tế lành mạnh cần cả những nhà nghiên cứu uyên bác lẫn kỹ thuật viên lành nghề.',
        vocab: ['vocational', 'erudite', 'technical competencies']
      },
      {
        qEn: 'Should university tuition fees be subsidized by the government?',
        qVi: 'Học phí đại học có nên được chính phủ trợ cấp tài chính không?',
        b1: 'Yes, the government should help pay tuition fees, especially for poor students. If tuition is too high, many talented students cannot afford to go to university.',
        b1Vi: 'Có, chính phủ nên hỗ trợ đóng học phí, đặc biệt là cho sinh viên nghèo. Nếu học phí quá cao, nhiều học sinh giỏi sẽ không đủ tiền đi học đại học.',
        b2c1: 'I strongly believe governments should subsidize university tuition fees to foster genuine meritocracy. When skyrocketing tuition deters underprivileged students, society loses immense cognitive talent.',
        b2c1Vi: 'Tôi tin chắc rằng chính phủ nên trợ cấp học phí đại học để thúc đẩy chế độ trọng dụng nhân tài thực chất. Khi học phí tăng vọt cản bước sinh viên nghèo, xã hội sẽ đánh mất nguồn nhân tài to lớn.',
        vocab: ['tuition', 'meritocracy', 'cognitive']
      }
    ],
    p2Situation: 'Your high school class is planning a 20th anniversary reunion next month. Three options are suggested for the celebration: (A) An evening luxury party at a five-star hotel, (B) A weekend camping trip in the mountains, or (C) A one-day return visit to your former high school campus. Which option do you think is best?',
    p2SituationVi: 'Lớp cấp 3 của bạn đang lên kế hoạch tổ chức họp lớp kỷ niệm 20 năm ra trường vào tháng tới. Có 3 phương án được đề xuất: (A) Tiệc tối sang trọng tại khách sạn 5 sao, (B) Chuyến cắm trại cuối tuần trên núi, hoặc (C) Chuyến về thăm lại trường cũ trong 1 ngày. Bạn chọn phương án nào?',
    p2Chosen: 'C',
    p2Options: [
      {
        letter: 'A',
        title: 'An evening party at a five-star hotel (Tiệc tối tại khách sạn 5 sao)',
        descVi: 'Tổ chức gala sang trọng, ẩm thực cao cấp và âm nhạc chuyên nghiệp trong 1 buổi tối.',
        prosVi: 'Không gian tiện nghi, sang trọng, không lo thời tiết xấu.',
        consVi: 'Chi phí đóng góp rất đắt đỏ và không khí trang trọng quá mức làm mất đi sự gần gũi tuổi học trò.',
        reasoningEn: 'it is prohibitively expensive for some classmates and lacks the nostalgic schoolyard atmosphere.'
      },
      {
        letter: 'B',
        title: 'A weekend camping trip (Chuyến cắm trại cuối tuần)',
        descVi: 'Đi dã ngoại 2 ngày 1 đêm ở vùng núi ngoại ô cùng cả lớp.',
        prosVi: 'Nhiều thời gian trò chuyện sâu và tham gia hoạt động ngoài trời.',
        consVi: 'Tốn toàn bộ 2 ngày cuối tuần nên nhiều bạn đã có gia đình, con nhỏ không thể sắp xếp đi xa được.',
        reasoningEn: 'a two-day trip requires heavy scheduling commitments that classmates with young children cannot easily manage.'
      },
      {
        letter: 'C',
        title: 'A one-day return visit to the former high school (Về thăm trường cũ 1 ngày)',
        descVi: 'Gặp mặt tại sân trường xưa, thăm lại thầy cô giáo cũ và tổ chức bữa trưa ấm cúng.',
        prosVi: 'Khơi gợi trọn vẹn ký ức thanh xuân, tri ân thầy cô giáo cũ, chi phí hợp lý và ai cũng tham gia được.',
        consVi: 'Cần xin phép ban giám hiệu nhà trường trước về lịch sử dụng hội trường.',
        reasoningEn: 'returning to our alma mater evokes cherished adolescent memories, allows us to express gratitude to former teachers, and is financially inclusive for every classmate.'
      }
    ],
    p2SpeechB1: 'My high school class is planning a reunion, and among the three choices, I believe a one-day return visit to our old high school is the best option. First, walking into our old classroom and sitting at our old desks will bring back wonderful memories from our youth. Second, we can invite our former teachers to join us and thank them for their pedagogy and care. Third, a one-day visit at school is affordable and fits everyone’s schedule. On the other hand, a party at a five-star hotel is too expensive for some classmates, while a two-day camping trip is too long for people who are busy with work and children. Therefore, visiting our former school is the most meaningful choice.',
    p2SpeechB1Vi: 'Lớp cấp ba của tôi đang lên kế hoạch họp lớp, và trong ba lựa chọn, tôi tin rằng chuyến về thăm trường cũ trong một ngày là phương án tốt nhất. Thứ nhất, bước vào lớp học cũ và ngồi lại bàn học xưa sẽ gợi lại những kỷ niệm tuyệt vời thời thanh xuân. Thứ hai, chúng tôi có thể mời các thầy cô giáo cũ cùng tham dự và cảm ơn công ơn dạy dỗ của thầy cô. Thứ ba, chuyến thăm một ngày tại trường có chi phí hợp lý và phù hợp với lịch trình của mọi người. Ngược lại, bữa tiệc ở khách sạn 5 sao quá đắt đỏ với một số bạn, còn chuyến cắm trại hai ngày lại quá dài đối với những người bận công việc và con nhỏ. Do đó, về thăm trường cũ là lựa chọn ý nghĩa nhất.',
    p2SpeechB2C1: 'When organizing a high school reunion, I am firmly convinced that a one-day return visit to our former high school campus is far superior to the other proposals. First and foremost, returning to our alma mater carries profound emotional resonance; strolling through the familiar corridors and sitting in our old homeroom naturally rekindles our fondest memories. Furthermore, this option provides a meaningful opportunity to invite our retired teachers and express our gratitude for their dedicated pedagogy. Equally important, a single-day gathering with a modest budget ensures maximum attendance. By contrast, a five-star hotel banquet is unnecessarily extravagant and may alienate classmates facing financial constraints, whereas a weekend camping excursion demands too much time away from family obligations. Ultimately, revisiting our former school strikes the ideal balance between nostalgia and inclusivity.',
    p2SpeechB2C1Vi: 'Khi tổ chức buổi họp lớp cấp ba, tôi hoàn toàn tin chắc rằng chuyến về thăm lại khuôn viên trường cũ trong một ngày vượt trội hơn hẳn các đề xuất còn lại. Trước hết, việc trở về mái trường xưa mang ý nghĩa cảm xúc sâu sắc; dạo bước qua những hành lang quen thuộc và ngồi lại phòng học cũ tự nhiên đánh thức những ký ức đẹp đẽ nhất. Hơn nữa, phương án này mang lại cơ hội ý nghĩa để mời các thầy cô giáo cũ và bày tỏ lòng biết ơn đối với sự dạy dỗ tận tâm của thầy cô. Quan trọng không kém, buổi gặp mặt một ngày với chi phí hợp lý đảm bảo tỷ lệ tham gia cao nhất. Ngược lại, bữa tiệc tại khách sạn 5 sao quá xa hoa không cần thiết và có thể tạo khoảng cách với những bạn đang khó khăn tài chính, trong khi chuyến cắm trại cuối tuần đòi hỏi quá nhiều thời gian xa gia đình. Tóm lại, về thăm trường cũ tạo nên sự cân bằng lý tưởng giữa hoài niệm và tính gắn kết.',
    p3Central: 'Higher education should be free for everyone.',
    p3CentralVi: 'Giáo dục đại học nên được miễn phí cho tất cả mọi người.',
    p3Prompts: [
      {
        point: 'Equal opportunity for all students',
        pointVi: 'Cơ hội bình đẳng cho mọi sinh viên',
        exp: 'Tuition-free universities remove financial barriers, ensuring that talented students from low-income families can pursue higher education based on meritocracy.',
        expVi: 'Đại học miễn học phí xóa bỏ rào cản tài chính, đảm bảo sinh viên tài năng từ gia đình thu nhập thấp có thể học đại học dựa trên thực tài.'
      },
      {
        point: 'A more educated workforce',
        pointVi: 'Lực lượng lao động có trình độ cao hơn',
        exp: 'When more citizens complete tertiary curricula, the nation gains highly skilled professionals who drive technological innovation and economic productivity.',
        expVi: 'Khi nhiều công dân hoàn thành chương trình đại học, quốc gia sẽ có đội ngũ chuyên gia trình độ cao thúc đẩy đổi mới công nghệ và năng suất kinh tế.'
      },
      {
        point: 'Solution to unemployment',
        pointVi: 'Giải pháp giảm tỷ lệ thất nghiệp',
        exp: 'Equipping young people with interdisciplinary knowledge and vocational competencies makes them more adaptable to shifting job markets.',
        expVi: 'Trang bị cho người trẻ kiến thức liên ngành và năng lực nghề nghiệp giúp họ thích ứng tốt hơn với thị trường việc làm biến đổi.'
      }
    ],
    p3OwnIdea: {
      point: 'Reduction of crushing student loan debt',
      pointVi: 'Giảm gánh nặng nợ vay sinh viên sau tốt nghiệp',
      exp: 'Graduates without heavy tuition debt can invest in housing, entrepreneurship, and lifelong learning immediately after entering the workforce.',
      expVi: 'Sinh viên tốt nghiệp không phải gánh khoản nợ học phí khổng lồ có thể đầu tư vào nhà ở, khởi nghiệp và học tập suốt đời ngay khi đi làm.'
    },
    p3SpeechB1: 'I agree with the statement that higher education should be free for everyone because it brings many benefits to individuals and society. First, free tuition creates equal opportunity for all students. Many smart students come from poor families, and without tuition fees, they can go to university and change their lives. Second, it builds a more educated workforce. When more people graduate from college, our country will have more good doctors, engineers, and teachers. Third, it is a good solution to unemployment because educated workers have better skills to find jobs. Finally, in my opinion, free university helps young people avoid student debt after graduation. Therefore, subsidizing higher education is a great investment.',
    p3SpeechB1Vi: 'Tôi đồng ý với nhận định rằng giáo dục đại học nên miễn phí cho tất cả mọi người vì nó mang lại nhiều lợi ích cho cá nhân và xã hội. Thứ nhất, miễn học phí tạo ra cơ hội bình đẳng cho mọi sinh viên. Nhiều học sinh thông minh xuất thân từ gia đình nghèo, và nếu không mất học phí, các em có thể vào đại học và thay đổi cuộc đời. Thứ hai, nó xây dựng lực lượng lao động có trình độ cao hơn. Khi nhiều người tốt nghiệp đại học, đất nước sẽ có thêm nhiều bác sĩ, kỹ sư và giáo viên giỏi. Thứ ba, đây là giải pháp tốt cho nạn thất nghiệp vì người lao động có học thức sẽ có kỹ năng tốt hơn để tìm việc. Cuối cùng, theo ý tôi, đại học miễn phí giúp người trẻ tránh được nợ vay sinh viên sau khi ra trường. Do đó, trợ cấp giáo dục đại học là một khoản đầu tư tuyệt vời.',
    p3SpeechB2C1: 'I wholeheartedly endorse the proposition that tertiary education should be universally tuition-free, as it serves as a catalyst for both social equity and macroeconomic prosperity. First and foremost, abolishing tuition fees guarantees equal opportunity by transforming higher education into a true meritocracy. Academic admission should be determined by a student’s cognitive potential and inquisitive drive rather than their parents’ bank balance. Secondly, universal access cultivates a highly educated workforce capable of spearheading interdisciplinary research and technological innovation. Thirdly, it acts as a long-term structural solution to unemployment, since graduates equipped with advanced literacy and problem-solving skills are far less vulnerable to automation. Additionally, from my own perspective, eliminating tuition prevents graduates from being shackled by crippling student debt, empowering them to start businesses and contribute to the economy immediately.',
    p3SpeechB2C1Vi: 'Tôi hoàn toàn ủng hộ quan điểm rằng giáo dục đại học nên được miễn học phí trên toàn diện, vì đây là chất xúc tác cho cả công bằng xã hội lẫn sự thịnh vượng kinh tế vĩ mô. Trước hết, việc xóa bỏ học phí đảm bảo cơ hội bình đẳng bằng cách biến giáo dục đại học thành một nền trọng dụng nhân tài thực thụ. Việc trúng tuyển đại học nên được quyết định bởi tiềm năng nhận thức và sự ham học hỏi của sinh viên thay vì số dư ngân hàng của cha mẹ họ. Thứ hai, tiếp cận phổ cập sẽ đào tạo nên lực lượng lao động trình độ cao có khả năng dẫn dắt các nghiên cứu liên ngành và đổi mới công nghệ. Thứ ba, nó đóng vai trò là giải pháp căn cơ lâu dài cho vấn nạn thất nghiệp, vì sinh viên tốt nghiệp được trang bị năng lực chuyên môn và giải quyết vấn đề sẽ ít bị tổn thương trước tự động hóa. Thêm vào đó, theo quan điểm riêng của tôi, miễn học phí giúp sinh viên ra trường không bị trói buộc bởi nợ nần chồng chất, trao quyền cho họ khởi nghiệp và đóng góp ngay cho nền kinh tế.',
    p3FollowUps: [
      {
        q: 'Can every country afford to provide free university education for all citizens?',
        qVi: 'Liệu mọi quốc gia đều đủ ngân sách để cung cấp giáo dục đại học miễn phí cho toàn bộ công dân không?',
        b1: 'I think rich countries in Europe can afford it easily through high taxes, but developing countries may not have enough budget. Developing countries can start by giving free tuition to poor students and important majors first.',
        b2c1: 'Realistically, implementing universal free tuition immediately is fiscally challenging for developing economies. However, governments can adopt a phased approach—offering targeted scholarships for underprivileged students and subsidizing strategic STEM and pedagogy degrees first.',
        vi: 'Thực tế mà nói, việc áp dụng miễn học phí toàn diện ngay lập tức là thách thức lớn về ngân sách đối với các nền kinh tế đang phát triển. Tuy nhiên, chính phủ có thể áp dụng lộ trình từng bước—cấp học bổng mục tiêu cho sinh viên nghèo và ưu tiên trợ cấp các ngành chiến lược như STEM và sư phạm trước.'
      },
      {
        q: 'If university is free, will students become less motivated to study hard?',
        qVi: 'Nếu đại học miễn phí, liệu sinh viên có trở nên kém động lực học tập chăm chỉ hơn không?',
        b1: 'Some students might take free classes for granted, so universities should set strict rules. For example, students must pass all exams to keep their free seat.',
        b2c1: 'That risk can be easily mitigated through rigorous academic standards. In countries like Germany, although tuition is free, universities enforce strict progression criteria—students must maintain strong empirical and exam performance to retain their enrollment.',
        vi: 'Rủi ro đó có thể dễ dàng được khắc phục thông qua các tiêu chuẩn học thuật nghiêm ngặt. Ở những nước như Đức, dù miễn học phí nhưng các trường đại học áp dụng điều kiện xét duyệt khắt khe—sinh viên phải duy trì kết quả thi cử và nghiên cứu tốt mới được giữ suất học.'
      },
      {
        q: 'Besides university, what other pathways can help young people succeed in their careers?',
        qVi: 'Ngoài đại học, những con đường nào khác có thể giúp người trẻ thành công trong sự nghiệp?',
        b1: 'Young people can attend vocational schools, join apprenticeships at companies, or take online courses to learn practical skills like coding, graphic design, or cooking.',
        b2c1: 'Vocational training institutes, industry apprenticeships, and accredited digital bootcamps offer highly lucrative alternatives. These pathways focus on hands-on competencies and autonomous skill acquisition, allowing young professionals to enter the job market debt-free.',
        vi: 'Các trường đào tạo nghề, chương trình học việc tại doanh nghiệp và các khóa đào tạo kỹ năng số được công nhận mang lại những lựa chọn thay thế rất triển vọng. Các lộ trình này tập trung vào năng lực thực hành và khả năng tự học, giúp người trẻ gia nhập thị trường lao động mà không mang nợ.'
      }
    ]
  },

  // DAY 2 -> TEST 20: Technology Has A Lot Of Benefits To Students (Filled all missing Part 1, Part 2, Part 3!)
  {
    day: 2,
    testId: 20,
    t1Title: 'Close Friends & Social Connections',
    t1TitleVi: 'Bạn thân & Kết nối xã hội (Đã bổ sung đầy đủ câu mẫu B1–C1)',
    t1Questions: [
      {
        qEn: 'Do you have many close friends, or do you prefer a small circle of friends?',
        qVi: 'Bạn có nhiều bạn thân hay thích một nhóm bạn nhỏ gắn bó hơn?',
        b1: 'I have a wide circle of acquaintances at university, but I prefer keeping a small group of three or four close friends whom I can trust completely.',
        b1Vi: 'Tôi có nhiều bạn bè xã giao ở trường đại học, nhưng tôi thích giữ một nhóm nhỏ gồm 3 hoặc 4 người bạn thân mà mình có thể tin tưởng tuyệt đối.',
        b2c1: 'While I maintain cordial relationships with many peers, I deliberately prioritize a tight-knit circle of confidants. Deep friendship requires mutual trust and emotional investment rather than superficial digital interactions.',
        b2c1Vi: 'Mặc dù tôi duy trì mối quan hệ hòa nhã với nhiều bạn đồng trang lứa, tôi chủ đích ưu tiên một nhóm nhỏ những người bạn tri kỷ. Tình bạn sâu sắc đòi hỏi sự tin cậy lẫn nhau và đầu tư cảm xúc hơn là những tương tác bề nổi trên mạng.',
        vocab: ['tight-knit', 'confidants', 'superficial']
      },
      {
        qEn: 'What qualities do you value most in a good friend?',
        qVi: 'Những phẩm chất nào bạn trân trọng nhất ở một người bạn tốt?',
        b1: 'For me, honesty and kindness are the most important qualities. A good friend will always tell me the truth and support me when I face difficulties.',
        b1Vi: 'Đối với tôi, sự trung thực và lòng tốt là những phẩm chất quan trọng nhất. Một người bạn tốt sẽ luôn nói thật và ủng hộ tôi khi gặp khó khăn.',
        b2c1: 'Above all, I prize integrity, empathy, and reliability. A genuine friend not only celebrates your milestones but also offers constructive honesty when you make mistakes.',
        b2c1Vi: 'Trên hết, tôi trân trọng sự chính trực, lòng thấu cảm và sự đáng tin cậy. Một người bạn thực sự không chỉ ăn mừng thành công cùng bạn mà còn đưa ra những góp ý chân thành mang tính xây dựng khi bạn mắc sai lầm.',
        vocab: ['integrity', 'empathy', 'constructive']
      },
      {
        qEn: 'How do you and your friends stay in touch when you are busy?',
        qVi: 'Bạn và bạn bè giữ liên lạc như thế nào khi bận rộn?',
        b1: 'When we are busy with work and exams, we use messaging apps and video calls every evening. On weekends, we try to meet at a coffee shop to talk face to face.',
        b1Vi: 'Khi bận rộn với công việc và thi cử, chúng tôi dùng ứng dụng nhắn tin và gọi video mỗi tối. Vào cuối tuần, chúng tôi cố gắng gặp nhau ở quán cà phê để trò chuyện trực tiếp.',
        b2c1: 'Thanks to ubiquitous instant messaging and video conferencing, we stay connected effortlessly throughout hectic weekdays. Nevertheless, we make a conscious effort to meet in person over weekend coffee to preserve authentic human warmth.',
        b2c1Vi: 'Nhờ các ứng dụng nhắn tin tức thời và gọi video phổ biến khắp nơi, chúng tôi giữ kết nối dễ dàng suốt những ngày trong tuần bận rộn. Tuy nhiên, chúng tôi luôn cố gắng gặp trực tiếp vào cuối tuần để giữ gìn sự ấm áp chân thực.',
        vocab: ['ubiquitous', 'video conferencing', 'authentic']
      }
    ],
    t2Title: 'High School Memories & Technology in Class',
    t2TitleVi: 'Kỷ niệm thời cấp 3 & Công nghệ trong lớp học (Đã bổ sung đầy đủ)',
    t2Questions: [
      {
        qEn: 'What was your favorite subject when you were in high school?',
        qVi: 'Môn học yêu thích nhất của bạn khi còn học cấp 3 là gì?',
        b1: 'My favorite subject in high school was English, and I also liked Information Technology. Learning English and computer skills helped me explore information from all over the world.',
        b1Vi: 'Môn học yêu thích của tôi thời cấp 3 là tiếng Anh, và tôi cũng thích môn Tin học. Học tiếng Anh và kỹ năng máy tính giúp tôi khám phá thông tin từ khắp nơi trên thế giới.',
        b2c1: 'During high school, I was particularly passionate about English and Computer Science. Mastering both foreign languages and algorithmic thinking opened the door to global digital resources.',
        b2c1Vi: 'Thời cấp 3, tôi đặc biệt đam mê môn Tiếng Anh và Khoa học Máy tính. Làm chủ cả ngoại ngữ lẫn tư duy thuật toán đã mở ra cánh cửa tiếp cận nguồn tài nguyên số toàn cầu.',
        vocab: ['algorithmic', 'digital resources', 'passionate']
      },
      {
        qEn: 'Did your high school teachers use technology in the classroom?',
        qVi: 'Giáo viên cấp 3 của bạn có sử dụng công nghệ trong lớp học không?',
        b1: 'Yes, our teachers used projectors, interactive slides, and online quizzes to make lessons more interesting and easier to understand.',
        b1Vi: 'Có, giáo viên của chúng tôi đã sử dụng máy chiếu, bài giảng trình chiếu tương tác và các bài kiểm tra trực tuyến để làm cho tiết học thú vị và dễ hiểu hơn.',
        b2c1: 'Yes, our school actively integrated multimedia projectors and interactive learning platforms into daily lessons. Visual simulations augmented our comprehension of abstract scientific concepts tremendously.',
        b2c1Vi: 'Có, trường tôi tích cực đưa máy chiếu đa phương tiện và các nền tảng học tập tương tác vào bài giảng hằng ngày. Các mô phỏng trực quan đã bổ trợ cực kỳ hiệu quả cho khả năng hiểu các khái niệm khoa học trừu tượng.',
        vocab: ['interactive', 'augment', 'simulations']
      },
      {
        qEn: 'Do you still keep in touch with your high school teachers?',
        qVi: 'Bạn có còn giữ liên lạc với các thầy cô giáo cấp 3 không?',
        b1: 'Yes, I still keep in touch with my homeroom teacher on social media, and my class visits her every year on Vietnamese Teachers Day.',
        b1Vi: 'Có, tôi vẫn giữ liên lạc với cô giáo chủ nhiệm qua mạng xã hội, và lớp tôi đều đến thăm cô hằng năm vào ngày Nhà giáo Việt Nam.',
        b2c1: 'Definitely. Digital platforms allow us to stay connected with our former mentors year-round, and our class reunites every November 20th to honor their lasting guidance.',
        b2c1Vi: 'Chắc chắn rồi. Các nền tảng số giúp chúng tôi giữ kết nối với các thầy cô giáo cũ quanh năm, và cả lớp đều hội ngộ vào mỗi dịp 20/11 để tri ân sự dìu dắt lâu dài của thầy cô.',
        vocab: ['mentors', 'reunite', 'digital platforms']
      }
    ],
    p2Situation: 'You have a two-day weekend holiday after a stressful week of technology projects and exams. Who would you prefer to spend your weekend holiday with: (A) With your family, (B) With your close friends, or (C) Alone by yourself? Explain your choice.',
    p2SituationVi: 'Bạn có kỳ nghỉ cuối tuần 2 ngày sau một tuần căng thẳng với các dự án công nghệ và thi cử. Bạn muốn dành kỳ nghỉ cuối tuần đó với ai: (A) Cùng gia đình, (B) Cùng nhóm bạn thân, hay (C) Ở một mình? (Đã bổ sung đầy đủ lập luận & bài nói mẫu).',
    p2Chosen: 'A',
    p2Options: [
      {
        letter: 'A',
        title: 'Spend the weekend with family (Dành cuối tuần bên gia đình)',
        descVi: 'Quây quần ăn cơm nhà, trò chuyện cùng bố mẹ và nạp lại năng lượng tinh thần ấm áp.',
        prosVi: 'Tình cảm gia đình vô điều kiện giúp giải tỏa căng thẳng sâu sắc, bữa ăn lành mạnh và tiết kiệm.',
        consVi: 'Ít các hoạt động náo nhiệt bên ngoài hơn so với đi cùng bạn bè.',
        reasoningEn: 'enjoying home-cooked meals and warm conversations with my parents provides unconditional emotional comfort after a hectic week.'
      },
      {
        letter: 'B',
        title: 'Spend the weekend with close friends (Đi chơi cuối tuần cùng bạn thân)',
        descVi: 'Đi dã ngoại, cà phê hoặc xem phim cùng nhóm bạn đồng trang lứa.',
        prosVi: 'Vui vẻ, sôi nổi, dễ chia sẻ chuyện học hành và xu hướng công nghệ.',
        consVi: 'Tốn kém chi phí ăn uống bên ngoài và lịch trình di chuyển liên tục có thể gây mệt mỏi thêm.',
        reasoningEn: 'hanging out with friends all weekend can be financially costly and physically exhausting.'
      },
      {
        letter: 'C',
        title: 'Spend the weekend alone (Ở một mình nghỉ ngơi)',
        descVi: 'Tự do ngủ nướng, đọc sách hoặc chơi game trong phòng riêng.',
        prosVi: 'Hoàn toàn tự do về giờ giấc, không phải chiều theo ý ai.',
        consVi: 'Dễ dẫn đến cảm giác cô đơn và sa đà vào việc lướt màn hình điện thoại cả ngày.',
        reasoningEn: 'spending the entire weekend in isolation often leads to excessive screen time and feelings of loneliness.'
      }
    ],
    p2SpeechB1: 'For my two-day weekend holiday, I would definitely choose to spend time with my family. First, during weekdays I am very busy with my studies and technology projects, so the weekend is a precious time to have warm home-cooked meals and talk with my parents. Second, being with my family makes me feel peaceful and recharges my energy without spending much money. On the other hand, going out with friends all weekend can be noisy and expensive. As for spending the holiday alone, I might feel lonely and just waste time on my phone. Therefore, spending the weekend with my family is the best choice.',
    p2SpeechB1Vi: 'Cho kỳ nghỉ cuối tuần hai ngày của mình, tôi chắc chắn sẽ chọn dành thời gian bên gia đình. Thứ nhất, trong tuần tôi rất bận rộn với việc học và các dự án công nghệ, nên cuối tuần là khoảng thời gian quý giá để ăn những bữa cơm nhà ấm áp và trò chuyện cùng bố mẹ. Thứ hai, ở bên gia đình giúp tôi cảm thấy bình yên và nạp lại năng lượng mà không tốn nhiều tiền. Ngược lại, đi chơi với bạn bè cả cuối tuần có thể ồn ào và tốn kém. Còn nếu ở một mình suốt kỳ nghỉ, tôi có thể cảm thấy cô đơn và chỉ lãng phí thời gian dán mắt vào điện thoại. Vì vậy, dành cuối tuần bên gia đình là lựa chọn tốt nhất.',
    p2SpeechB2C1: 'When deciding how to spend a rejuvenating weekend holiday after an intense week of work and study, I would wholeheartedly opt for spending quality time with my family. The primary reason is that throughout the week, ubiquitous digital demands keep me glued to my laptop, leaving little time for domestic connection. Sharing nutritious home-cooked meals and heartfelt conversations with my parents offers an emotional sanctuary that restores my mental balance. Conversely, while hanging out with friends is entertaining, a packed itinerary of cafés and outings can be both costly and physically draining. Meanwhile, spending the entire weekend alone risks turning into passive screen scrolling and isolation. All things considered, reconnecting with my family is the most fulfilling option.',
    p2SpeechB2C1Vi: 'Khi quyết định cách tận hưởng kỳ nghỉ cuối tuần phục hồi năng lượng sau một tuần học tập và làm việc căng thẳng, tôi hoàn toàn chọn dành thời gian chất lượng bên gia đình. Lý do chính là suốt cả tuần, những yêu cầu công việc số đã giữ chặt tôi bên chiếc laptop, còn rất ít thời gian gắn kết gia đình. Cùng thưởng thức những bữa cơm nhà bổ dưỡng và trò chuyện chân thành với bố mẹ mang lại điểm tựa tinh thần giúp cân bằng lại tâm trí. Ngược lại, dù đi chơi với bạn bè rất vui, lịch trình dày đặc ở các quán xá có thể vừa tốn kém vừa gây mệt mỏi thể chất. Trong khi đó, ở một mình cả cuối tuần dễ biến thành việc lướt màn hình thụ động và cô lập. Xét mọi khía cạnh, sum họp bên gia đình là lựa chọn trọn vẹn nhất.',
    p3Central: 'Technology has a lot of benefits to students.',
    p3CentralVi: 'Công nghệ mang lại rất nhiều lợi ích thiết thực cho học sinh, sinh viên.',
    p3Prompts: [
      {
        point: 'Improve self-study skills',
        pointVi: 'Nâng cao kỹ năng tự học chủ động',
        exp: 'Interactive learning platforms, AI tutors, and open educational resources empower students to learn autonomously at their own pace anytime, anywhere.',
        expVi: 'Các nền tảng học tập tương tác, gia sư AI và học liệu mở trao quyền cho sinh viên tự học chủ động theo tốc độ riêng mọi lúc, mọi nơi.'
      },
      {
        point: 'Save time in research and study',
        pointVi: 'Tiết kiệm thời gian tra cứu và học tập',
        exp: 'Digital databases, search algorithms, and electronic dictionaries allow learners to locate scholarly papers in seconds instead of spending hours in physical archives.',
        expVi: 'Cơ sở dữ liệu số, thuật toán tìm kiếm và từ điển điện tử giúp người học tìm bài báo khoa học trong vài giây thay vì mất hàng giờ ở kho lưu trữ giấy.'
      },
      {
        point: 'Provide a source of entertainment to reduce stress',
        pointVi: 'Cung cấp nguồn giải trí lành mạnh giảm căng thẳng',
        exp: 'After demanding classes, educational podcasts, music streaming, and creative apps help students unwind and recharge their mental batteries.',
        expVi: 'Sau những giờ học căng thẳng, podcast giáo dục, nhạc trực tuyến và các ứng dụng sáng tạo giúp sinh viên thư giãn và nạp lại năng lượng tinh thần.'
      }
    ],
    p3OwnIdea: {
      point: 'Facilitate global collaboration and future career readiness',
      pointVi: 'Thúc đẩy hợp tác toàn cầu và sự sẵn sàng cho nghề nghiệp tương lai',
      exp: 'Cloud workspaces and video conferencing enable students to collaborate on cross-border projects and upskill for the modern digital economy.',
      expVi: 'Không gian làm việc đám mây và hội nghị truyền hình giúp sinh viên hợp tác trong các dự án xuyên biên giới và nâng cao kỹ năng cho nền kinh tế số.'
    },
    p3SpeechB1: 'I strongly believe that technology brings a lot of important benefits to students today. First, technology helps students improve their self-study skills. With online courses and learning apps, students can study English, math, or coding by themselves at home at their own speed. Second, it saves a lot of time. Instead of spending hours looking for books in a library, students can use search engines and digital dictionaries to find information in a few seconds. Third, technology is a great source of entertainment. After stressful exams, students can listen to music or watch videos to relax. In addition, technology helps students work in groups online and prepare for future jobs. Therefore, technology is an indispensable tool for modern learners.',
    p3SpeechB1Vi: 'Tôi tin chắc rằng công nghệ mang lại rất nhiều lợi ích quan trọng cho học sinh, sinh viên ngày nay. Thứ nhất, công nghệ giúp người học nâng cao kỹ năng tự học. Với các khóa học trực tuyến và ứng dụng học tập, sinh viên có thể tự học tiếng Anh, toán hoặc lập trình tại nhà theo tốc độ của riêng mình. Thứ hai, nó tiết kiệm rất nhiều thời gian. Thay vì mất hàng giờ tìm sách trong thư viện, sinh viên có thể dùng công cụ tìm kiếm và từ điển điện tử để tra cứu thông tin chỉ trong vài giây. Thứ ba, công nghệ là nguồn giải trí tuyệt vời. Sau những kỳ thi căng thẳng, sinh viên có thể nghe nhạc hoặc xem video để thư giãn. Thêm vào đó, công nghệ giúp sinh viên làm việc nhóm trực tuyến và chuẩn bị cho công việc tương lai. Do đó, công nghệ là công cụ không thể thiếu đối với người học hiện đại.',
    p3SpeechB2C1: 'It is indisputable that modern technology has revolutionized education and brought multifaceted benefits to students. First and foremost, digital tools dramatically enhance autonomous self-study skills. Through adaptive e-learning platforms and AI-driven applications, learners can customize their study schedules and review complex lectures repeatedly until they achieve mastery. Secondly, technology saves an immense amount of time during academic research; sophisticated search algorithms and digital libraries grant instant access to global empirical studies that once took weeks to locate manually. Thirdly, technology serves as a healthy outlet for stress relief after intensive coursework, offering everything from mindfulness apps to educational podcasts. Furthermore, from my own perspective, mastering collaborative cloud tools and digital literacy equips students with the versatility required to thrive in an automated future workforce.',
    p3SpeechB2C1Vi: 'Không thể phủ nhận rằng công nghệ hiện đại đã cách mạng hóa giáo dục và mang lại lợi ích đa chiều cho học sinh, sinh viên. Trước hết, các công cụ số nâng cao mạnh mẽ kỹ năng tự học chủ động. Thông qua các nền tảng học trực tuyến thích ứng và ứng dụng tích hợp AI, người học có thể tùy chỉnh lịch trình và xem lại các bài giảng phức tạp nhiều lần cho đến khi nắm vững. Thứ hai, công nghệ tiết kiệm lượng thời gian khổng lồ trong quá trình nghiên cứu học thuật; các thuật toán tìm kiếm tinh vi và thư viện số cho phép truy cập tức thì vào các nghiên cứu thực nghiệm toàn cầu mà trước đây phải mất hàng tuần tìm kiếm thủ công. Thứ ba, công nghệ đóng vai trò là kênh giải tỏa căng thẳng lành mạnh sau giờ học, từ ứng dụng chánh niệm đến podcast bổ ích. Hơn nữa, theo góc nhìn của tôi, việc làm chủ các công cụ đám mây cộng tác và năng lực số trang bị cho sinh viên sự linh hoạt cần thiết để thành công trong thị trường lao động tự động hóa tương lai.',
    p3FollowUps: [
      {
        q: 'What are the potential drawbacks if students rely too much on technology and AI?',
        qVi: 'Những mặt trái tiềm ẩn là gì nếu sinh viên phụ thuộc quá mức vào công nghệ và AI?',
        b1: 'If students rely too much on technology and AI, they may become lazy to think by themselves and their attention span may become shorter because of social media distractions.',
        b2c1: 'Over-reliance on generative AI and digital devices can erode critical thinking and independent problem-solving capabilities. Moreover, constant notifications fragment students’ cognitive focus and can lead to academic plagiarism if used unethically.',
        vi: 'Sự phụ thuộc quá mức vào AI tạo sinh và thiết bị số có thể làm xói mòn tư duy phản biện và khả năng tự giải quyết vấn đề. Hơn nữa, thông báo liên tục làm phân mảnh sự tập trung nhận thức và dễ dẫn đến đạo văn nếu sử dụng thiếu đạo đức.'
      },
      {
        q: 'Should schools ban smartphones during classroom hours?',
        qVi: 'Các trường học có nên cấm điện thoại thông minh trong giờ học trên lớp không?',
        b1: 'I think primary and middle schools should restrict smartphones during lessons so children focus on the teacher, while university students can use them responsibly for looking up vocabulary.',
        b2c1: 'Rather than a blanket ban at all levels, age-appropriate regulation is ideal. For younger pupils, restricting smartphones minimizes classroom distractions, whereas university undergraduates should be guided to leverage mobile devices as productive research aids.',
        vi: 'Thay vì cấm tuyệt đối ở mọi cấp học, việc quản lý phù hợp theo độ tuổi là lý tưởng nhất. Với học sinh nhỏ tuổi, hạn chế điện thoại giúp giảm xao nhãng trong lớp, trong khi sinh viên đại học nên được định hướng tận dụng thiết bị di động như công cụ tra cứu hiệu quả.'
      },
      {
        q: 'Will artificial intelligence ever completely replace human teachers?',
        qVi: 'Liệu trí tuệ nhân tạo có bao giờ thay thế hoàn toàn giáo viên con người không?',
        b1: 'No, I do not think AI can replace teachers completely. AI can give information fast, but only human teachers can care about students’ feelings and inspire them.',
        b2c1: 'While AI excels at automating grading and personalizing drills, it can never supplant human educators. Teaching is fundamentally a relational endeavor that requires emotional empathy, moral mentorship, and the ability to inspire curiosity.',
        vi: 'Mặc dù AI rất giỏi trong việc tự động hóa chấm điểm và cá nhân hóa bài tập, nó không bao giờ có thể thay thế nhà giáo con người. Giảng dạy về bản chất là sự kết nối con người đòi hỏi lòng thấu cảm, sự dẫn dắt đạo đức và khả năng truyền cảm hứng.'
      }
    ]
  },

  // DAY 3 -> TEST 12: Trees Are Essential For The Existence Of Human Beings
  {
    day: 3,
    testId: 12,
    t1Title: 'Eco-Friendly Travel & Nature',
    t1TitleVi: 'Du lịch sinh thái & Thiên nhiên',
    t1Questions: [
      {
        qEn: 'Do you enjoy traveling to natural places like forests, mountains, or national parks?',
        qVi: 'Bạn có thích đi du lịch đến những nơi thiên nhiên như rừng, núi hoặc vườn quốc gia không?',
        b1: 'Yes, I love visiting national parks and mountains because the air is very fresh and clean. Seeing green trees helps me forget city noise and stress.',
        b1Vi: 'Có, tôi rất thích đến thăm các vườn quốc gia và vùng núi vì không khí rất trong lành và sạch sẽ. Ngắm nhìn cây xanh giúp tôi quên đi tiếng ồn và căng thẳng nơi phố thị.',
        b2c1: 'Without a doubt, immersing myself in pristine natural landscapes like national parks is my favorite way to unwind. Being surrounded by lush forestry rejuvenates my mental clarity and deepens my appreciation for biodiversity.',
        b2c1Vi: 'Không nghi ngờ gì nữa, đắm mình vào những cảnh quan thiên nhiên nguyên sơ như vườn quốc gia là cách thư giãn yêu thích của tôi. Được bao quanh bởi rừng cây xanh mát giúp phục hồi sự minh mẫn và làm sâu sắc thêm sự trân trọng đa dạng sinh học.',
        vocab: ['pristine', 'biodiversity', 'rejuvenates']
      },
      {
        qEn: 'How has the natural environment in your area changed since your childhood?',
        qVi: 'Môi trường tự nhiên ở khu vực bạn sống đã thay đổi thế nào từ khi bạn còn nhỏ?',
        b1: 'When I was a child, there were many big trees and small ponds near my house. Now, many trees have been cut down to build tall apartments and wide roads.',
        b1Vi: 'Khi tôi còn nhỏ, có rất nhiều cây cổ thụ và ao nhỏ gần nhà tôi. Bây giờ, nhiều cây đã bị chặt bỏ để xây chung cư cao tầng và mở rộng đường sá.',
        b2c1: 'Over the past decade, rapid urbanization has noticeably reduced green spaces in my neighborhood. However, municipal authorities have recently launched tree-planting initiatives to mitigate the urban heat island effect.',
        b2c1Vi: 'Trong thập kỷ qua, quá trình đô thị hóa nhanh chóng đã làm thu hẹp đáng kể không gian xanh ở khu phố tôi. Tuy nhiên, chính quyền thành phố gần đây đã phát động các chiến dịch trồng cây để giảm nhẹ hiệu ứng đảo nhiệt đô thị.',
        vocab: ['urbanization', 'mitigate', 'urban heat island']
      },
      {
        qEn: 'What daily habits do you practice to protect the environment?',
        qVi: 'Bạn thực hành những thói quen hằng ngày nào để bảo vệ môi trường?',
        b1: 'Every day, I bring my own reusable water bottle and cloth bag when I go shopping. I also turn off lights and fans when leaving a room to save electricity.',
        b1Vi: 'Mỗi ngày, tôi đều mang theo bình nước cá nhân và túi vải khi đi mua sắm. Tôi cũng tắt đèn và quạt khi ra khỏi phòng để tiết kiệm điện.',
        b2c1: 'In my daily routine, I consciously strive to minimize my carbon footprint by using biodegradable or reusable containers, conserving electricity, and supporting local green conservation campaigns.',
        b2c1Vi: 'Trong sinh hoạt hằng ngày, tôi chủ động giảm thiểu dấu chân carbon bằng cách sử dụng đồ đựng tái sử dụng hoặc phân hủy sinh học, tiết kiệm điện và ủng hộ các chiến dịch bảo tồn xanh tại địa phương.',
        vocab: ['carbon footprint', 'biodegradable', 'conservation']
      }
    ],
    t2Title: 'Weather & Climate Change Awareness',
    t2TitleVi: 'Thời tiết & Nhận thức về biến đổi khí hậu',
    t2Questions: [
      {
        qEn: 'Have you noticed any extreme weather events in your country recently?',
        qVi: 'Gần đây bạn có nhận thấy các hiện tượng thời tiết cực đoan nào ở đất nước mình không?',
        b1: 'Yes, summers have become much hotter than before, and there are stronger typhoons and floods in central and northern Vietnam.',
        b1Vi: 'Có, mùa hè đã trở nên nóng bức hơn trước rất nhiều, và xuất hiện nhiều cơn bão lớn cùng lũ lụt nặng nề hơn ở miền Trung và miền Bắc Việt Nam.',
        b2c1: 'Yes, the effects of climate change are increasingly tangible. We have witnessed prolonged heatwaves, erratic rainfall patterns, and catastrophic flash floods triggered by deforestation and global warming.',
        b2c1Vi: 'Có, những tác động của biến đổi khí hậu ngày càng hiện hữu rõ rệt. Chúng ta đã chứng kiến các đợt nắng nóng kéo dài, lượng mưa thất thường và lũ quét thảm khốc do nạn phá rừng và sự nóng lên toàn cầu.',
        vocab: ['catastrophic', 'deforestation', 'heatwaves']
      },
      {
        qEn: 'Do you think schools teach students enough about environmental protection?',
        qVi: 'Bạn có nghĩ nhà trường đã dạy học sinh đủ về bảo vệ môi trường chưa?',
        b1: 'Schools teach the theory in science classes, but I think they should organize more outdoor activities like planting trees or cleaning up parks.',
        b1Vi: 'Nhà trường đã dạy lý thuyết trong các tiết khoa học, nhưng tôi nghĩ trường nên tổ chức thêm nhiều hoạt động thực tế ngoài trời như trồng cây hoặc dọn rác công viên.',
        b2c1: 'While ecological awareness is included in textbooks, schools need more hands-on environmental stewardship programs, such as campus tree-planting and recycling labs, to turn knowledge into lifelong habits.',
        b2c1Vi: 'Dù kiến thức sinh thái đã có trong sách giáo khoa, các trường cần thêm nhiều chương trình quản lý môi trường thực tế như trồng cây trong khuôn viên và phân loại rác để biến kiến thức thành thói quen suốt đời.',
        vocab: ['ecological', 'stewardship', 'hands-on']
      },
      {
        qEn: 'Why are green parks important for people living in big cities?',
        qVi: 'Tại sao các công viên cây xanh lại quan trọng đối với người dân sống ở thành phố lớn?',
        b1: 'Green parks act like the lungs of a city. They clean the polluted air, give shade on hot days, and provide a peaceful place for residents to exercise.',
        b1Vi: 'Công viên xanh đóng vai trò như lá phổi của thành phố. Chúng làm sạch bầu không khí ô nhiễm, tỏa bóng mát vào ngày nắng nóng và mang lại nơi yên bình để người dân tập thể dục.',
        b2c1: 'Urban parks serve as vital ecological lungs that absorb airborne pollutants, regulate city temperatures, and offer residents a therapeutic sanctuary to alleviate urban stress.',
        b2c1Vi: 'Công viên đô thị đóng vai trò như lá phổi sinh thái thiết yếu giúp hấp thụ các chất ô nhiễm trong không khí, điều hòa nhiệt độ thành phố và mang lại không gian thư giãn giảm căng thẳng đô thị.',
        vocab: ['pollutants', 'ecological lungs', 'therapeutic']
      }
    ],
    p2Situation: 'You want to buy a meaningful birthday gift for your best friend who loves outdoor activities and nature. You are considering three places to buy a watch for him: (A) At a luxury brand store in a shopping mall, (B) At a convenient neighborhood watch shop, or (C) From a reputable online e-commerce store. Which option do you choose?',
    p2SituationVi: 'Bạn muốn mua một chiếc đồng hồ làm quà sinh nhật cho người bạn thân yêu thích hoạt động ngoài trời. Bạn phân vân giữa 3 nơi mua: (A) Cửa hàng thương hiệu cao cấp tại trung tâm thương mại, (B) Tiệm đồng hồ tiện lợi gần nhà, hoặc (C) Cửa hàng trực tuyến uy tín. Bạn chọn phương án nào?',
    p2Chosen: 'B',
    p2Options: [
      {
        letter: 'A',
        title: 'At a luxury brand store in a mall (Cửa hàng cao cấp tại trung tâm thương mại)',
        descVi: 'Mua đồng hồ tại showroom sang trọng trong trung tâm thương mại lớn.',
        prosVi: 'Đảm bảo hàng chính hãng 100%, hộp quà sang trọng.',
        consVi: 'Giá bán đội lên rất cao do chi phí thuê mặt bằng đắt đỏ, vượt quá ngân sách sinh viên.',
        reasoningEn: 'luxury mall boutiques charge exorbitant prices due to high overhead costs, which exceeds my student budget.'
      },
      {
        letter: 'B',
        title: 'At a reputable local watch shop nearby (Tiệm đồng hồ uy tín gần khu phố)',
        descVi: 'Đến trực tiếp cửa hàng đồng hồ quen thuộc gần nhà để kiểm tra và chọn mua.',
        prosVi: 'Được cầm tận tay kiểm tra chất lượng, giá cả hợp lý, dễ dàng mang ra bảo hành hoặc chỉnh dây ngay khi cần.',
        consVi: 'Không gian cửa hàng không hào nhoáng bằng trung tâm thương mại lớn.',
        reasoningEn: 'it allows me to inspect the watch in person, offers reasonable pricing, and provides convenient local warranty service.'
      },
      {
        letter: 'C',
        title: 'From an online store (Đặt mua qua cửa hàng trực tuyến)',
        descVi: 'Đặt hàng qua sàn thương mại điện tử và giao tận nhà.',
        prosVi: 'Nhiều mẫu mã và mã giảm giá, không mất công đi lại.',
        consVi: 'Không được kiểm tra thực tế trước khi tặng, rủi ro giao hàng trễ ngày sinh nhật hoặc gặp hàng giả.',
        reasoningEn: 'buying a watch online carries the risk of counterfeit products, shipping delays, or damage during transit.'
      }
    ],
    p2SpeechB1: 'To buy a birthday watch for my best friend, I would choose to buy it at a reputable watch shop near my house. First, by going to a real shop, I can hold the watch in my hand, check its quality carefully, and ask the shopkeeper for advice. Second, the price at a local shop is much more reasonable for a student than at a luxury shopping mall. Also, if my friend needs to adjust the strap or fix the battery later, it is very easy to go back there. I do not choose a luxury store in the mall because it is too expensive. I also avoid buying online because the delivery might be late for his birthday or the watch might look different from the photo. Therefore, the local shop is the safest and best choice.',
    p2SpeechB1Vi: 'Để mua một chiếc đồng hồ sinh nhật tặng bạn thân, tôi sẽ chọn mua tại một tiệm đồng hồ uy tín gần nhà. Thứ nhất, khi đến trực tiếp cửa hàng, tôi có thể cầm chiếc đồng hồ trên tay, kiểm tra kỹ chất lượng và nhờ chủ tiệm tư vấn. Thứ hai, mức giá ở cửa hàng địa phương hợp lý với sinh viên hơn nhiều so với trung tâm thương mại xa xỉ. Ngoài ra, nếu bạn tôi cần chỉnh dây hay thay pin sau này thì việc mang ra tiệm rất thuận tiện. Tôi không chọn cửa hàng cao cấp trong trung tâm thương mại vì quá đắt đỏ. Tôi cũng tránh mua online vì giao hàng có thể bị trễ ngày sinh nhật hoặc sản phẩm thực tế khác với ảnh mạng. Do đó, tiệm đồng hồ gần nhà là lựa chọn an toàn và tốt nhất.',
    p2SpeechB2C1: 'When purchasing a wristwatch as a birthday gift for my close friend, I would definitely opt for a reputable local watch shop in my neighborhood. First and foremost, visiting a physical store enables me to inspect the craftsmanship, water resistance, and strap durability firsthand, ensuring the gift suits his active outdoor lifestyle. Secondly, local specialty shops offer competitive pricing without the inflated markup of luxury shopping malls, while providing hassle-free after-sales warranty and strap adjustment. Conversely, luxury mall boutiques are prohibitively expensive for a student budget, whereas ordering a timepiece online entails the risk of counterfeit goods, transit damage, or delayed delivery right before his birthday. All things considered, the local watch shop combines reliability with financial practicality.',
    p2SpeechB2C1Vi: 'Khi mua một chiếc đồng hồ đeo tay làm quà sinh nhật cho người bạn thân, tôi chắc chắn sẽ chọn một cửa hàng đồng hồ uy tín tại địa phương. Trước hết, việc đến trực tiếp cửa hàng cho phép tôi kiểm tra tận mắt độ tinh xảo, khả năng chống nước và độ bền dây đeo, đảm bảo món quà phù hợp với lối sống năng động ngoài trời của bạn ấy. Thứ hai, các cửa hàng chuyên doanh địa phương có mức giá hợp lý mà không bị đội giá mặt bằng như trung tâm thương mại xa xỉ, đồng thời hỗ trợ bảo hành và chỉnh dây cực kỳ thuận tiện. Ngược lại, các showroom lớn có giá quá tầm với ngân sách sinh viên, còn đặt mua đồng hồ qua mạng lại tiềm ẩn rủi ro hàng giả, hư hỏng khi vận chuyển hoặc giao trễ sinh nhật. Tóm lại, cửa hàng đồng hồ địa phương kết hợp hoàn hảo giữa độ tin cậy và tính kinh tế.',
    p3Central: 'Trees are essential for the existence of human beings.',
    p3CentralVi: 'Cây xanh đóng vai trò sống còn đối với sự tồn tại của nhân loại.',
    p3Prompts: [
      {
        point: 'A good source of food and natural resources',
        pointVi: 'Nguồn cung cấp lương thực và tài nguyên quý giá',
        exp: 'Forests and orchards provide nutritious fruits, timber, and medicinal herbs that have sustained human civilizations for millennia.',
        expVi: 'Rừng và cây ăn quả cung cấp trái cây bổ dưỡng, gỗ và thảo dược quý đã nuôi sống các nền văn minh nhân loại qua hàng thiên niên kỷ.'
      },
      {
        point: 'Make the natural world nicer and greener',
        pointVi: 'Làm cho thế giới tự nhiên tươi đẹp và trong lành hơn',
        exp: 'Lush green canopies beautify urban and rural landscapes, offer cooling shade, and promote psychological well-being.',
        expVi: 'Những tán cây xanh mát làm đẹp cảnh quan đô thị lẫn nông thôn, tỏa bóng mát dịu nhẹ và nâng cao sức khỏe tinh thần.'
      },
      {
        point: 'Help protect the environment and combat climate change',
        pointVi: 'Bảo vệ môi trường và chống biến đổi khí hậu',
        exp: 'Trees absorb carbon dioxide emissions, generate life-sustaining oxygen, prevent soil erosion, and mitigate catastrophic floods.',
        expVi: 'Cây xanh hấp thụ khí thải carbon dioxide, tạo ra oxy duy trì sự sống, chống xói mòn đất và giảm nhẹ lũ lụt thảm khốc.'
      }
    ],
    p3OwnIdea: {
      point: 'Preserve biodiversity and wildlife habitats',
      pointVi: 'Bảo tồn đa dạng sinh học và môi trường sống hoang dã',
      exp: 'Forest ecosystems serve as the irreplaceable home for millions of animal and plant species, maintaining the delicate ecological balance of our planet.',
      expVi: 'Hệ sinh thái rừng là ngôi nhà không thể thay thế của hàng triệu loài động thực vật, duy trì sự cân bằng sinh thái mỏng manh của hành tinh.'
    },
    p3SpeechB1: 'I completely agree that trees are essential for the existence of human beings. First, trees are a great source of food and natural materials. They give us fresh fruits, nuts, wood for building houses, and even medicine. Second, trees make our world much nicer and greener. Cities with many trees look beautiful, and people feel happier and more relaxed when walking under green shade. Third, trees play a key role in protecting the environment. They absorb carbon dioxide, produce oxygen for us to breathe, and hold the soil to prevent floods. Finally, forests provide homes for wild animals. Without trees, humans and animals could not survive on Earth.',
    p3SpeechB1Vi: 'Tôi hoàn toàn đồng ý rằng cây xanh đóng vai trò sống còn đối với sự tồn tại của loài người. Thứ nhất, cây cối là nguồn cung cấp thực phẩm và nguyên liệu tự nhiên tuyệt vời. Chúng cho chúng ta trái cây tươi, các loại hạt, gỗ để xây nhà và cả thuốc chữa bệnh. Thứ hai, cây xanh làm cho thế giới của chúng ta tươi đẹp và xanh mát hơn nhiều. Những thành phố nhiều cây trông rất đẹp, và con người cảm thấy vui vẻ, thư thái hơn khi đi bộ dưới bóng râm. Thứ ba, cây cối đóng vai trò then chốt trong việc bảo vệ môi trường. Chúng hấp thụ khí carbon dioxide, tạo ra oxy cho chúng ta hít thở và giữ đất để ngăn lũ lụt. Cuối cùng, rừng còn là ngôi nhà của động vật hoang dã. Không có cây xanh, con người và động vật không thể tồn tại trên Trái Đất.',
    p3SpeechB2C1: 'It is an undeniable ecological truth that trees are indispensable for the survival and prosperity of humankind. First and foremost, arboreal ecosystems serve as a vital source of sustenance and raw materials, supplying everything from nutritious agricultural produce and sustainable timber to life-saving pharmaceutical compounds. Secondly, trees enhance the aesthetic and psychological quality of our surroundings; verdant urban canopies cool down scorching concrete streets and offer citizens a tranquil refuge. Thirdly, from an environmental standpoint, forests act as the planet’s primary carbon sink—absorbing greenhouse gases generated by fossil fuel combustion, releasing oxygen, and anchoring topsoil to prevent catastrophic landslides and floods. Furthermore, trees safeguard global biodiversity by providing habitats for countless terrestrial species.',
    p3SpeechB2C1Vi: 'Có một sự thật sinh thái không thể phủ nhận là cây xanh đóng vai trò không thể thiếu đối với sự sinh tồn và thịnh vượng của nhân loại. Trước hết, hệ sinh thái cây rừng là nguồn cung cấp lương thực và nguyên liệu thô thiết yếu, từ nông sản giàu dinh dưỡng, gỗ bền vững cho đến các hợp chất dược phẩm cứu người. Thứ hai, cây xanh nâng cao chất lượng thẩm mỹ và tâm lý cho không gian sống; những tán cây đô thị xanh mát làm dịu đi những con phố bê tông bỏng rát và mang lại khoảng lặng yên bình cho người dân. Thứ ba, dưới góc độ môi trường, rừng đóng vai trò là bể chứa carbon chính của hành tinh—hấp thụ khí nhà kính sinh ra từ quá trình đốt nhiên liệu hóa thạch, giải phóng oxy và giữ lớp đất mặt để ngăn chặn sạt lở đất và lũ lụt thảm khốc. Hơn nữa, cây xanh bảo vệ đa dạng sinh học toàn cầu bằng cách cung cấp nơi cư trú cho vô số loài sinh vật trên cạn.',
    p3FollowUps: [
      {
        q: 'What are the main causes of deforestation in developing countries?',
        qVi: 'Nguyên nhân chính dẫn đến nạn phá rừng ở các quốc gia đang phát triển là gì?',
        b1: 'The main causes are cutting down trees for farmland, illegal logging for expensive wood, and clearing land to build new roads and factories.',
        b2c1: 'Deforestation is primarily driven by agricultural expansion, illegal commercial logging, and rapid infrastructural development, as short-term economic gains are often prioritized over long-term conservation.',
        vi: 'Nạn phá rừng chủ yếu bắt nguồn từ việc mở rộng đất nông nghiệp, khai thác gỗ thương mại trái phép và phát triển hạ tầng nhanh chóng, khi lợi ích kinh tế trước mắt thường được đặt lên trên sự bảo tồn lâu dài.'
      },
      {
        q: 'How can governments encourage citizens to plant and protect more trees?',
        qVi: 'Chính phủ có thể làm gì để khuyến khích người dân trồng và bảo vệ nhiều cây xanh hơn?',
        b1: 'Governments can organize annual tree-planting festivals at schools and neighborhoods, and impose strict fines on companies that cut down forests illegally.',
        b2c1: 'Authorities should combine strict legislative penalties against illegal logging with community-led reforestation campaigns, while incentivizing urban developers to integrate green roofs and parks into every housing project.',
        vi: 'Các cơ quan chức năng nên kết hợp chế tài pháp lý nghiêm khắc đối với hành vi chặt phá rừng trái phép cùng các chiến dịch trồng rừng cộng đồng, đồng thời khuyến khích các nhà phát triển đô thị tích hợp mảng xanh và công viên vào mọi dự án nhà ở.'
      },
      {
        q: 'Can technology replace the role of natural trees in cleaning the air?',
        qVi: 'Liệu công nghệ có thể thay thế vai trò làm sạch không khí của cây xanh tự nhiên không?',
        b1: 'No, machines that filter air are very expensive and use electricity, while trees clean the air naturally for free and also give shelter to birds and animals.',
        b2c1: 'While carbon-capture machinery is a promising technological supplement, it can never replicate the holistic ecological functions of natural forests, which simultaneously regulate water cycles, cool microclimates, and sustain biodiversity.',
        vi: 'Mặc dù máy móc thu giữ carbon là giải pháp bổ trợ công nghệ đầy hứa hẹn, nó không bao giờ có thể sao chép toàn diện các chức năng sinh thái của rừng tự nhiên—vốn đồng thời điều hòa vòng tuần hoàn nước, làm mát vi khí hậu và duy trì đa dạng sinh học.'
      }
    ]
  },

  // DAY 4 -> TEST 4: Overpopulation in Big Cities
  {
    day: 4,
    testId: 4,
    t1Title: 'Neighborhood & Urban Living',
    t1TitleVi: 'Khu phố sinh sống & Đời sống đô thị',
    t1Questions: [
      {
        qEn: 'Can you describe the neighborhood where you are living now?',
        qVi: 'Bạn có thể miêu tả khu phố nơi bạn đang sinh sống hiện nay không?',
        b1: 'I live in a busy neighborhood in the city center. There are many convenience stores, schools, and bus stops near my house, so commuting is very easy.',
        b1Vi: 'Tôi sống ở một khu phố nhộn nhịp gần trung tâm thành phố. Có nhiều cửa hàng tiện lợi, trường học và trạm xe buýt gần nhà nên việc đi lại rất dễ dàng.',
        b2c1: 'I reside in a vibrant urban district characterized by well-developed civic amenities. Within walking distance, residents have access to public transit hubs, clinics, and lively local markets.',
        b2c1Vi: 'Tôi cư trú tại một quận đô thị sầm uất với các tiện ích dân sinh phát triển đồng bộ. Chỉ trong bán kính đi bộ, cư dân có thể tiếp cận các trạm giao thông công cộng, phòng khám và khu chợ địa phương nhộn nhịp.',
        vocab: ['reside', 'amenities', 'public transit']
      },
      {
        qEn: 'What do you like most and least about living in a crowded city?',
        qVi: 'Điều bạn thích nhất và không thích nhất khi sống ở một thành phố đông đúc là gì?',
        b1: 'I like the modern facilities and job opportunities in a big city. However, I dislike the heavy traffic jams during rush hours and the high cost of renting an apartment.',
        b1Vi: 'Tôi thích cơ sở vật chất hiện đại và cơ hội việc làm ở thành phố lớn. Tuy nhiên, tôi không thích cảnh tắc đường nghiêm trọng vào giờ cao điểm và chi phí thuê nhà đắt đỏ.',
        b2c1: 'What appeals to me most is the abundance of career prospects and cultural dynamism. Conversely, the biggest drawback is chronic traffic congestion during peak hours and the exorbitant cost of housing.',
        b2c1Vi: 'Điều thu hút tôi nhất là sự dồi dào về triển vọng nghề nghiệp và nhịp sống văn hóa năng động. Ngược lại, nhược điểm lớn nhất là tình trạng ùn tắc giao thông kinh niên vào giờ cao điểm và chi phí nhà ở đắt đỏ.',
        vocab: ['congestion', 'exorbitant', 'dynamism']
      },
      {
        qEn: 'Do people in your neighborhood know each other well?',
        qVi: 'Mọi người trong khu phố của bạn có quen biết nhau thân thiết không?',
        b1: 'Yes, my neighbors are quite friendly. Although everyone is busy working during the day, we often greet each other in the evening and help watch each other’s houses.',
        b1Vi: 'Có, hàng xóm của tôi khá thân thiện. Dù ban ngày ai cũng bận đi làm, buổi tối chúng tôi thường chào hỏi nhau và giúp trông nhà hộ nhau.',
        b2c1: 'Despite the fast pace of metropolitan life, my neighborhood maintains a warm sense of community solidarity. Neighbors regularly exchange greetings and organize seasonal street gatherings.',
        b2c1Vi: 'Bất chấp nhịp sống hối hả nơi đô thị lớn, khu phố của tôi vẫn giữ được tinh thần đoàn kết cộng đồng ấm áp. Hàng xóm thường xuyên chào hỏi và tổ chức các buổi họp mặt khu phố theo mùa.',
        vocab: ['metropolitan', 'solidarity', 'gatherings']
      }
    ],
    t2Title: 'Pets & Green Spaces in Apartments',
    t2TitleVi: 'Thú cưng & Không gian sống tại đô thị',
    t2Questions: [
      {
        qEn: 'Do you like keeping pets? Why or why not?',
        qVi: 'Bạn có thích nuôi thú cưng không? Tại sao có hoặc tại sao không?',
        b1: 'Yes, I love dogs and cats because they are very loyal and cute. Playing with a pet after school helps me feel less stressed.',
        b1Vi: 'Có, tôi rất yêu chó và mèo vì chúng rất trung thành và dễ thương. Chơi đùa với thú cưng sau giờ học giúp tôi bớt căng thẳng hơn.',
        b2c1: 'Yes, I am fond of companion animals, especially dogs. Not only do they offer unconditional companionship that alleviates urban loneliness, but walking a dog also encourages daily outdoor exercise.',
        b2c1Vi: 'Có, tôi rất yêu quý động vật đồng hành, đặc biệt là loài chó. Chúng không chỉ mang lại sự bầu bạn vô điều kiện giúp xoa dịu nỗi cô đơn nơi đô thị mà việc dắt chó đi dạo còn khuyến khích vận động ngoài trời mỗi ngày.',
        vocab: ['companion animals', 'alleviates', 'unconditional']
      },
      {
        qEn: 'Is it difficult to raise a pet in a small city apartment?',
        qVi: 'Nuôi thú cưng trong một căn hộ chung cư nhỏ ở thành phố có khó khăn không?',
        b1: 'Yes, it is quite difficult because apartments have limited space and some buildings do not allow noisy pets. Owners have to take their pets to the park every day.',
        b1Vi: 'Có, khá khó khăn vì căn hộ chung cư có diện tích hạn chế và một số tòa nhà không cho phép nuôi thú cưng gây ồn. Chủ nuôi phải đưa thú cưng ra công viên mỗi ngày.',
        b2c1: 'Indeed, raising pets in high-density high-rise apartments poses logistical challenges due to cramped living quarters and strict building regulations regarding noise and hygiene.',
        b2c1Vi: 'Thực sự vậy, nuôi thú cưng trong các căn hộ cao tầng mật độ cao đặt ra nhiều thách thức do không gian sống chật hẹp và quy định tòa nhà nghiêm ngặt về tiếng ồn cũng như vệ sinh.',
        vocab: ['high-density', 'cramped', 'hygiene']
      },
      {
        qEn: 'What facilities should be added to improve your neighborhood?',
        qVi: 'Cần bổ sung những tiện ích nào để cải thiện khu phố của bạn?',
        b1: 'I hope the local government will build more public parks, pedestrian walkways, and bicycle lanes so residents can exercise safely.',
        b1Vi: 'Tôi hy vọng chính quyền địa phương sẽ xây dựng thêm nhiều công viên công cộng, đường đi bộ và làn đường dành cho xe đạp để cư dân tập thể dục an toàn.',
        b2c1: 'Upgrading municipal infrastructure by expanding green recreational parks and dedicated pedestrian zones would significantly enhance the livability of our district.',
        b2c1Vi: 'Việc nâng cấp cơ sở hạ tầng đô thị thông qua mở rộng các công viên giải trí xanh và khu phố đi bộ chuyên biệt sẽ nâng cao đáng kể chất lượng sống cho quận của chúng tôi.',
        vocab: ['infrastructure', 'pedestrian zones', 'livability']
      }
    ],
    p2Situation: 'Your youth club is organizing a community event to raise awareness about urban cleanliness and green living. Three ways to promote the event are suggested: (A) Designing posters and flyers in public places, (B) Advertising on social media networks, or (C) Sending personal text messages/emails to residents. Which method is best?',
    p2SituationVi: 'Câu lạc bộ thanh niên của bạn đang tổ chức sự kiện cộng đồng nâng cao nhận thức về nếp sống văn minh đô thị. Có 3 cách quảng bá sự kiện: (A) Dán áp phích và phát tờ rơi ở nơi công cộng, (B) Quảng bá trên các mạng xã hội, hoặc (C) Gửi tin nhắn/email cá nhân. Bạn chọn cách nào?',
    p2Chosen: 'B',
    p2Options: [
      {
        letter: 'A',
        title: 'Posters and flyers in public places (Áp phích và tờ rơi nơi công cộng)',
        descVi: 'In ấn poster và phát tờ rơi giấy tại các ngã tư, chợ và bảng tin khu phố.',
        prosVi: 'Người lớn tuổi không dùng internet có thể nhìn thấy khi đi ngang qua.',
        consVi: 'Tốn chi phí in ấn và tờ rơi bị vứt bừa bãi lại gây xả rác phản tác dụng với thông điệp bảo vệ môi trường.',
        reasoningEn: 'printing thousands of paper flyers wastes money and creates street litter, which contradicts our environmental message.'
      },
      {
        letter: 'B',
        title: 'Advertising on social media networks (Quảng bá trên mạng xã hội)',
        descVi: 'Tạo trang sự kiện, video ngắn và bài đăng lan tỏa trên Facebook, TikTok, Zalo khu dân cư.',
        prosVi: 'Tiếp cận hàng ngàn người cực nhanh, hoàn toàn miễn phí, dễ chia sẻ và không xả rác giấy.',
        consVi: 'Cần thiết kế hình ảnh và nội dung bắt mắt để thu hút lượt tương tác.',
        reasoningEn: 'social media campaigns reach thousands of urban residents instantaneously at zero printing cost and allow interactive event registration.'
      },
      {
        letter: 'C',
        title: 'Sending personal text messages or emails (Gửi tin nhắn SMS/Email cá nhân)',
        descVi: 'Gửi tin nhắn hàng loạt vào số điện thoại hoặc hộp thư điện tử của từng người.',
        prosVi: 'Gửi trực tiếp đến thiết bị cá nhân.',
        consVi: 'Hầu hết mọi người đều coi tin nhắn/email lạ là thư rác (spam) và xóa ngay lập tức mà không đọc.',
        reasoningEn: 'unsolicited bulk text messages and emails are usually ignored or filtered out as annoying spam.'
      }
    ],
    p2SpeechB1: 'To promote our youth club’s community event, I strongly believe advertising on social media networks is the best choice. First, almost everyone in the city uses Facebook, Zalo, or TikTok every day, so our event post can reach thousands of young people and families within a few hours. Second, promoting on social media is free and eco-friendly because we do not waste paper. Viewers can also click "Join" and share the post with their friends easily. On the other hand, printing paper posters and flyers costs a lot of money and people often throw flyers on the street, which creates more trash. Sending bulk text messages or emails is also ineffective because people think they are spam. Therefore, social media is definitely the smartest option.',
    p2SpeechB1Vi: 'Để quảng bá sự kiện cộng đồng của câu lạc bộ thanh niên, tôi tin chắc rằng quảng cáo trên các mạng xã hội là lựa chọn tốt nhất. Thứ nhất, hầu như mọi người trong thành phố đều dùng Facebook, Zalo hoặc TikTok mỗi ngày, nên bài đăng sự kiện của chúng tôi có thể tiếp cận hàng ngàn bạn trẻ và gia đình chỉ trong vài giờ. Thứ hai, quảng bá trên mạng xã hội hoàn toàn miễn phí và thân thiện với môi trường vì không gây lãng phí giấy. Người xem cũng có thể bấm "Tham gia" và chia sẻ bài viết cho bạn bè dễ dàng. Ngược lại, việc in áp phích và tờ rơi giấy tốn nhiều tiền và người ta thường vứt tờ rơi ngay xuống đường làm phát sinh thêm rác. Gửi tin nhắn hay email hàng loạt cũng kém hiệu quả vì mọi người thường coi đó là tin nhắn rác. Do đó, mạng xã hội chắc chắn là phương án thông minh nhất.',
    p2SpeechB2C1: 'When selecting a promotional strategy for our club’s urban environmental event, I am convinced that leveraging social media networks is by far the most effective approach. First and foremost, social media platforms offer unmatched viral reach at minimal cost; an engaging short video or event page can reach thousands of local residents within minutes and allow participants to RSVP interactively. Furthermore, digital promotion aligns perfectly with our green mission by eliminating paper waste. Conversely, distributing printed posters and flyers is not only costly and labor-intensive, but discarded leaflets also end up littering the pavement—ironically undermining our cleanliness campaign. Similarly, bulk SMS messages and cold emails are widely perceived as intrusive spam and rarely opened. Consequently, social media marketing is the optimal choice.',
    p2SpeechB2C1Vi: 'Khi lựa chọn chiến lược quảng bá cho sự kiện môi trường đô thị của câu lạc bộ, tôi tin chắc rằng tận dụng mạng xã hội là phương pháp hiệu quả nhất. Trước hết, các nền tảng mạng xã hội mang lại độ phủ lan tỏa vượt trội với chi phí tối thiểu; một video ngắn hấp dẫn hoặc trang sự kiện có thể tiếp cận hàng ngàn cư dân địa phương chỉ trong vài phút và cho phép người tham gia đăng ký tương tác trực tiếp. Hơn nữa, quảng bá kỹ thuật số hoàn toàn nhất quán với sứ mệnh xanh của chúng tôi nhờ loại bỏ rác thải giấy. Ngược lại, việc phát tờ rơi và dán áp phích in sẵn không chỉ tốn kém tiền bạc, công sức mà những tờ rơi bị vứt bỏ còn làm bẩn vỉa hè—đi ngược lại chính chiến dịch làm sạch phố phường. Tương tự, tin nhắn SMS hàng loạt và email lạ thường bị xem là thư rác phiền phức và hiếm khi được mở đọc. Do đó, truyền thông mạng xã hội là lựa chọn tối ưu.',
    p3Central: 'Overpopulation in big cities leads to many negative effects.',
    p3CentralVi: 'Tình trạng quá tải dân số tại các đô thị lớn dẫn đến nhiều hệ lụy tiêu cực.',
    p3Prompts: [
      {
        point: 'Heavy pressure on urban infrastructure and traffic',
        pointVi: 'Áp lực nặng nề lên cơ sở hạ tầng và giao thông đô thị',
        exp: 'When millions of rural migrants flock to megacities, roads, hospitals, and public schools become severely overloaded, causing daily gridlock.',
        expVi: 'Khi hàng triệu người di cư từ nông thôn đổ về các siêu đô thị, đường sá, bệnh viện và trường công lập bị quá tải nghiêm trọng, gây tắc nghẽn hằng ngày.'
      },
      {
        point: 'Environmental degradation and severe pollution',
        pointVi: 'Suy thoái môi trường và ô nhiễm nghiêm trọng',
        exp: 'High population density generates massive household waste, exhaust fumes from millions of vehicles, and acute air and noise pollution.',
        expVi: 'Mật độ dân số cao thải ra lượng rác sinh hoạt khổng lồ, khí thải từ hàng triệu phương tiện cùng ô nhiễm không khí và tiếng ồn trầm trọng.'
      },
      {
        point: 'Skyrocketing housing costs and shrinking living space',
        pointVi: 'Giá nhà đất tăng vọt và không gian sống thu hẹp',
        exp: 'The mismatch between housing supply and surging demand pushes real estate prices beyond the reach of average workers, creating cramped slums.',
        expVi: 'Sự lệch pha giữa nguồn cung nhà ở và nhu cầu tăng vọt đẩy giá bất động sản vượt quá tầm với của người lao động, hình thành các khu nhà ổ chuột chật chội.'
      }
    ],
    p3OwnIdea: {
      point: 'Intense job competition and rising psychological stress',
      pointVi: 'Cạnh tranh việc làm khốc liệt và gia tăng căng thẳng tâm lý',
      exp: 'An oversupply of labor in major cities intensifies workplace pressure, lowers entry-level wages, and heightens urban mental exhaustion.',
      expVi: 'Tình trạng dư thừa nguồn cung lao động ở các thành phố lớn làm gay gắt thêm áp lực công việc, giảm mức lương khởi điểm và gia tăng sự kiệt sức tinh thần.'
    },
    p3SpeechB1: 'Overpopulation in big cities is a serious problem that causes many negative effects on people’s lives. First, it puts heavy pressure on urban infrastructure. Because too many people live in the same city, roads are always full of cars and motorbikes, leading to terrible traffic jams every day. Hospitals and schools are also overcrowded. Second, overpopulation damages the environment. Millions of people produce huge amounts of trash and vehicle smoke, making the air dirty and noisy. Third, housing becomes very expensive. Young workers cannot afford to buy a house and have to rent tiny, cramped rooms. Therefore, governments need to develop smaller cities and rural areas to reduce urban overcrowding.',
    p3SpeechB1Vi: 'Tình trạng quá tải dân số ở các thành phố lớn là một vấn đề nghiêm trọng gây ra nhiều tác động tiêu cực đến đời sống con người. Thứ nhất, nó đặt áp lực nặng nề lên cơ sở hạ tầng đô thị. Vì quá nhiều người cùng sống trong một thành phố, đường sá lúc nào cũng chật kín ô tô và xe máy, dẫn đến cảnh tắc đường kinh khủng mỗi ngày. Bệnh viện và trường học cũng bị quá tải. Thứ hai, quá tải dân số hủy hoại môi trường. Hàng triệu người tạo ra lượng rác thải khổng lồ và khói bụi xe cộ, làm không khí ô nhiễm và ồn ào. Thứ ba, nhà ở trở nên vô cùng đắt đỏ. Người lao động trẻ không đủ tiền mua nhà và phải thuê những căn phòng nhỏ hẹp. Do đó, chính phủ cần phát triển các thành phố vệ tinh và vùng nông thôn để giảm tải cho đô thị lớn.',
    p3SpeechB2C1: 'Rapid urban overpopulation has emerged as one of the most pressing socio-economic challenges of the twenty-first century, triggering severe repercussions across metropolitan areas. First and foremost, excessive population density places an unsustainable strain on civic infrastructure; transportation networks suffer from chronic gridlock, while public healthcare and schooling systems are stretched to their breaking point. Secondly, overpopulation accelerates environmental degradation, as the concentration of millions of commuters and households generates toxic exhaust emissions, unmanageable solid waste, and severe water contamination. Thirdly, the acute housing shortage drives real estate prices to astronomical levels, forcing low-income families into cramped, substandard living quarters. Finally, hyper-competition for jobs exacerbates psychological stress and widens urban wealth disparities.',
    p3SpeechB2C1Vi: 'Tình trạng quá tải dân số đô thị nhanh chóng đã nổi lên như một trong những thách thức kinh tế - xã hội cấp bách nhất của thế kỷ 21, gây ra những hệ lụy nặng nề trên khắp các đô thị lớn. Trước hết, mật độ dân số quá cao đặt gánh nặng không thể chịu nổi lên cơ sở hạ tầng dân sinh; mạng lưới giao thông chịu cảnh ùn tắc kinh niên, trong khi hệ thống y tế và trường học công lập bị kéo căng đến mức quá tải. Thứ hai, quá tải dân số đẩy nhanh sự suy thoái môi trường, khi sự tập trung của hàng triệu người đi làm và hộ gia đình thải ra khí thải độc hại, rác thải rắn khổng lồ và ô nhiễm nguồn nước. Thứ ba, sự thiếu hụt nhà ở trầm trọng đẩy giá bất động sản lên mức ngất ngưởng, buộc các gia đình thu nhập thấp phải sống trong những khu nhà chật hẹp, xuống cấp. Cuối cùng, sự cạnh tranh việc làm khốc liệt làm trầm trọng thêm căng thẳng tâm lý và nới rộng khoảng cách giàu nghèo.',
    p3FollowUps: [
      {
        q: 'Why do so many people continue to move from the countryside to big cities?',
        qVi: 'Tại sao rất nhiều người vẫn tiếp tục di cư từ nông thôn lên các thành phố lớn?',
        b1: 'People move to big cities mainly because there are better jobs, higher salaries, top universities, and modern hospitals that rural areas do not have.',
        b2c1: 'Rural-to-urban migration is primarily fueled by the concentration of lucrative employment, prestigious universities, and specialized medical facilities in major metropolises.',
        vi: 'Làn sóng di cư từ nông thôn ra thành thị chủ yếu được thúc đẩy bởi sự tập trung của các việc làm thu nhập cao, các trường đại học danh tiếng và cơ sở y tế chuyên sâu tại các đại đô thị.'
      },
      {
        q: 'What can governments do to solve the problem of urban overpopulation?',
        qVi: 'Chính phủ có thể thực hiện những giải pháp nào để giải quyết bài toán quá tải dân số đô thị?',
        b1: 'Governments should build satellite cities outside the center, improve public transport like subways, and invest in factories and schools in rural provinces.',
        b2c1: 'Policymakers must pursue decentralization by developing well-connected satellite cities, relocating industrial zones and universities to suburban provinces, and offering tax incentives for rural enterprises.',
        vi: 'Các nhà hoạch định chính sách cần theo đuổi chiến lược giãn dân bằng cách phát triển các đô thị vệ tinh kết nối đồng bộ, di dời khu công nghiệp và trường đại học ra vùng ven, đồng thời ưu đãi thuế cho doanh nghiệp về nông thôn.'
      },
      {
        q: 'In the future, will remote work reduce the number of people living in big cities?',
        qVi: 'Trong tương lai, liệu làm việc từ xa có giúp giảm số lượng người đổ về sống ở các thành phố lớn không?',
        b1: 'Yes, I think so. If people can work from home on their computers, many workers will move back to their hometowns where life is cheaper and cleaner.',
        b2c1: 'Undoubtedly. The normalization of telecommuting allows knowledge workers to earn metropolitan salaries while enjoying a lower cost of living and cleaner environment in smaller towns.',
        vi: 'Chắc chắn rồi. Việc bình thường hóa hình thức làm việc từ xa cho phép lao động tri thức hưởng mức lương đô thị trong khi tận hưởng chi phí sinh hoạt thấp và môi trường trong lành ở các thị trấn nhỏ.'
      }
    ]
  },

  // DAY 5 -> TEST 25: Having A Healthy Diet Is Good For Your Health (+ Answered Follow-Up Questions!)
  {
    day: 5,
    testId: 25,
    t1Title: 'Healthy Lifestyle & Nutrition',
    t1TitleVi: 'Lối sống lành mạnh & Dinh dưỡng',
    t1Questions: [
      {
        qEn: 'What do you usually do to stay healthy and fit?',
        qVi: 'Bạn thường làm gì để giữ gìn sức khỏe và vóc dáng cân đối?',
        b1: 'To stay healthy, I try to eat plenty of green vegetables and fruits, drink two liters of water a day, and jog in the park for thirty minutes every afternoon.',
        b1Vi: 'Để giữ sức khỏe, tôi cố gắng ăn nhiều rau xanh và trái cây, uống 2 lít nước mỗi ngày và chạy bộ ở công viên 30 phút mỗi buổi chiều.',
        b2c1: 'I maintain my physical well-being through a combination of balanced nutrition and regular cardiovascular exercise. Avoiding ultra-processed foods and sleeping seven hours nightly keeps my immune system strong.',
        b2c1Vi: 'Tôi duy trì thể trạng khỏe mạnh thông qua sự kết hợp giữa dinh dưỡng cân bằng và tập luyện tim mạch đều đặn. Tránh thực phẩm siêu chế biến và ngủ đủ 7 tiếng mỗi đêm giúp hệ miễn dịch của tôi luôn vững vàng.',
        vocab: ['cardiovascular', 'ultra-processed', 'immune system']
      },
      {
        qEn: 'Do you think people nowadays are healthier than people in the past?',
        qVi: 'Bạn có nghĩ con người ngày nay khỏe mạnh hơn thế hệ trước đây không?',
        b1: 'In some ways yes, because we have modern medicine and hospitals. However, people today sit too much in offices and eat too much fast food, which causes obesity.',
        b1Vi: 'Ở một số khía cạnh thì có, vì chúng ta có y học và bệnh viện hiện đại. Tuy nhiên, con người ngày nay ngồi quá nhiều ở văn phòng và ăn quá nhiều đồ ăn nhanh, dẫn đến béo phì.',
        b2c1: 'It is a paradox. While medical advancements have significantly extended life expectancy, modern sedentary lifestyles and the prevalence of sugary fast food have triggered an epidemic of chronic metabolic diseases.',
        b2c1Vi: 'Đó là một nghịch lý. Mặc dù tiến bộ y học đã kéo dài đáng kể tuổi thọ trung bình, lối sống ít vận động hiện đại và sự tràn lan của đồ ăn nhanh nhiều đường đã làm bùng phát các bệnh chuyển hóa mãn tính.',
        vocab: ['sedentary', 'life expectancy', 'metabolic']
      },
      {
        qEn: 'How do you usually deal with stress from study or work?',
        qVi: 'Bạn thường đối phó với căng thẳng từ việc học hoặc công việc như thế nào?',
        b1: 'When I feel stressed, I stop working for a while, listen to soft music, or play badminton with my friends to clear my mind.',
        b1Vi: 'Khi cảm thấy căng thẳng, tôi tạm dừng công việc một lát, nghe nhạc nhẹ hoặc đi đánh cầu lông với bạn bè để đầu óc thư thái.',
        b2c1: 'Whenever academic pressure mounts, I practice mindfulness meditation and engage in outdoor physical exercise, which releases endorphins and restores my emotional equilibrium.',
        b2c1Vi: 'Mỗi khi áp lực học tập dâng cao, tôi thực hành thiền chánh niệm và tham gia vận động thể chất ngoài trời, giúp giải phóng hormone endorphin và lấy lại sự cân bằng cảm xúc.',
        vocab: ['mindfulness', 'endorphins', 'equilibrium']
      }
    ],
    t2Title: 'Morning Habits & Daily Energy',
    t2TitleVi: 'Thói quen buổi sáng & Năng lượng mỗi ngày',
    t2Questions: [
      {
        qEn: 'Do you ever skip breakfast when you are in a hurry?',
        qVi: 'Bạn có bao giờ bỏ bữa sáng khi đang vội không?',
        b1: 'I rarely skip breakfast because if I do not eat in the morning, I feel tired and cannot concentrate on my lessons at school.',
        b1Vi: 'Tôi hiếm khi bỏ bữa sáng vì nếu không ăn vào buổi sáng, tôi sẽ thấy mệt mỏi và không thể tập trung vào bài học ở trường.',
        b2c1: 'I make it a strict rule never to skip breakfast. A nutrient-dense morning meal stabilizes blood glucose levels and fuels cognitive concentration throughout the morning.',
        b2c1Vi: 'Tôi đặt ra nguyên tắc nghiêm ngặt là không bao giờ bỏ bữa sáng. Một bữa sáng giàu dưỡng chất giúp ổn định đường huyết và cung cấp năng lượng cho sự tập trung nhận thức suốt cả buổi sáng.',
        vocab: ['nutrient-dense', 'stabilizes', 'cognitive']
      },
      {
        qEn: 'What is a typical healthy meal in Vietnam like?',
        qVi: 'Một bữa ăn lành mạnh điển hình ở Việt Nam thường như thế nào?',
        b1: 'A typical Vietnamese meal is very balanced. It includes steamed rice, a bowl of vegetable soup, boiled or stir-fried greens, and fish or lean meat.',
        b1Vi: 'Một bữa cơm Việt Nam điển hình rất cân bằng. Bữa ăn gồm cơm trắng, một bát canh rau, rau luộc hoặc xào, cùng cá hoặc thịt nạc.',
        b2c1: 'Traditional Vietnamese cuisine is renowned for its nutritional harmony, featuring steamed rice paired with fiber-rich seasonal greens, aromatic herbs, light broth, and lean protein.',
        b2c1Vi: 'Ẩm thực truyền thống Việt Nam nổi tiếng nhờ sự hài hòa dinh dưỡng, kết hợp cơm trắng với rau xanh theo mùa giàu chất xơ, thảo mộc thơm, canh thanh đạm và đạm nạc.',
        vocab: ['nutritional harmony', 'fiber-rich', 'lean protein']
      },
      {
        qEn: 'Should governments put higher taxes on sugary drinks and junk food?',
        qVi: 'Chính phủ có nên đánh thuế cao hơn đối với đồ uống có đường và đồ ăn vặt không?',
        b1: 'Yes, I agree. Higher taxes will make sugary drinks more expensive, so young people will buy less soda and drink more water or milk.',
        b1Vi: 'Có, tôi đồng ý. Thuế cao hơn sẽ làm đồ uống có đường đắt hơn, nhờ đó giới trẻ sẽ mua ít nước ngọt có ga hơn và uống nhiều nước lọc hoặc sữa hơn.',
        b2c1: 'Yes, levying a sugar tax is an effective preventive healthcare policy. It discourages excessive consumption of empty calories while generating revenue for public health campaigns.',
        b2c1Vi: 'Có, áp thuế tiêu thụ đặc biệt lên đồ uống có đường là chính sách y tế dự phòng hiệu quả. Nó hạn chế việc tiêu thụ quá mức calo rỗng đồng thời tạo nguồn thu cho các chiến dịch sức khỏe cộng đồng.',
        vocab: ['preventive healthcare', 'empty calories', 'levying']
      }
    ],
    p2Situation: 'Your class wants to buy a farewell gift for your beloved teacher who is retiring next month and cares deeply about health and wellness. Three options are proposed: (A) A smart health-tracking watch, (B) A premium box of herbal tea and organic honey, or (C) A voucher for a weekend resort spa trip. Which gift is the best choice?',
    p2SituationVi: 'Lớp bạn muốn mua quà chia tay thầy/cô giáo sắp nghỉ hưu và rất quan tâm đến sức khỏe. Có 3 lựa chọn: (A) Đồng hồ thông minh theo dõi sức khỏe, (B) Hộp trà thảo mộc và mật ong hữu cơ cao cấp, hoặc (C) Voucher nghỉ dưỡng spa cuối tuần. Bạn chọn quà nào?',
    p2Chosen: 'A',
    p2Options: [
      {
        letter: 'A',
        title: 'A smart health-tracking watch (Đồng hồ thông minh theo dõi sức khỏe)',
        descVi: 'Thiết bị đeo tay đo nhịp tim, huyết áp, giấc ngủ và đếm bước chân hằng ngày.',
        prosVi: 'Kỷ vật bền bỉ theo năm tháng, hỗ trợ thầy cô theo dõi sức khỏe và vận động mỗi ngày.',
        consVi: 'Cần hướng dẫn thầy cô cách kết nối với điện thoại trong lần đầu sử dụng.',
        reasoningEn: 'it serves as a lasting keepsake that actively monitors heart rate, sleep quality, and daily walking steps during retirement.'
      },
      {
        letter: 'B',
        title: 'Herbal tea and organic honey set (Bộ trà thảo mộc và mật ong hữu cơ)',
        descVi: 'Hộp quà sức khỏe truyền thống tốt cho giấc ngủ và cổ họng.',
        prosVi: 'Lành tính, dễ sử dụng và tốt cho sức khỏe.',
        consVi: 'Dùng vài tuần là hết nên không giữ làm kỷ niệm lâu dài được.',
        reasoningEn: 'consumable items like tea and honey are used up quickly and leave no permanent souvenir of our class.'
      },
      {
        letter: 'C',
        title: 'A weekend resort spa voucher (Voucher nghỉ dưỡng spa cuối tuần)',
        descVi: 'Phiếu trải nghiệm dịch vụ nghỉ dưỡng và massage thư giãn.',
        prosVi: 'Giúp thư giãn tinh thần sau nhiều năm đứng lớp.',
        consVi: 'Có thời hạn sử dụng cố định và chỉ trải nghiệm được một lần duy nhất.',
        reasoningEn: 'a spa voucher is a one-time experience with an expiration date that might not fit the teacher’s family schedule.'
      }
    ],
    p2SpeechB1: 'To celebrate our teacher’s retirement, I think buying a smart health-tracking watch is the most meaningful gift. First, since our teacher cares a lot about health, this watch can help measure heart rate, sleep quality, and daily walking steps every day. Second, a watch is a durable souvenir; whenever our teacher looks at the time, they will remember our class warmly. On the other hand, herbal tea and honey are healthy, but once they are finished, nothing remains as a keepsake. A resort spa voucher is also nice, but it only lasts for one weekend. Therefore, the smart health watch is definitely the best choice.',
    p2SpeechB1Vi: 'Để tri ân thầy/cô giáo nhân dịp nghỉ hưu, tôi nghĩ mua một chiếc đồng hồ thông minh theo dõi sức khỏe là món quà ý nghĩa nhất. Thứ nhất, vì thầy cô rất quan tâm đến sức khỏe, chiếc đồng hồ này giúp đo nhịp tim, chất lượng giấc ngủ và số bước đi bộ mỗi ngày. Thứ hai, đồng hồ là kỷ vật bền lâu; mỗi khi xem giờ, thầy cô sẽ nhớ đến tập thể lớp chúng tôi. Ngược lại, trà thảo mộc và mật ong tuy tốt cho sức khỏe nhưng dùng xong sẽ không còn kỷ vật lưu giữ. Voucher nghỉ dưỡng spa cũng tốt nhưng chỉ kéo dài trong một dịp cuối tuần. Do đó, đồng hồ theo dõi sức khỏe chắc chắn là lựa chọn tuyệt vời nhất.',
    p2SpeechB2C1: 'Among the three proposed retirement gifts for our respected teacher, I am convinced that a smart health-tracking watch is the most thoughtful and enduring option. First and foremost, as our teacher transitions into retirement and prioritizes wellness, a smartwatch provides practical daily utility by monitoring vital metrics such as heart rate, sleep cycles, and physical activity. Secondly, unlike ephemeral gifts, a timepiece serves as a lasting symbol of our gratitude that accompanies the teacher for years. By contrast, while organic herbal tea and honey are wholesome, they are consumable goods that disappear within weeks. Similarly, a weekend spa voucher offers only a fleeting experience and may impose scheduling inconveniences. Ultimately, the health-tracking watch combines caring practicality with sentimental value.',
    p2SpeechB2C1Vi: 'Trong ba món quà tri ân nghỉ hưu được đề xuất cho người thầy đáng kính của chúng tôi, tôi tin chắc rằng đồng hồ thông minh theo dõi sức khỏe là lựa chọn chu đáo và bền lâu nhất. Trước hết, khi thầy bước vào tuổi nghỉ hưu và ưu tiên chăm sóc sức khỏe, chiếc đồng hồ thông minh mang lại giá trị sử dụng thiết thực hằng ngày thông qua việc theo dõi các chỉ số quan trọng như nhịp tim, chu kỳ giấc ngủ và mức độ vận động. Thứ hai, không giống những món quà chóng qua, chiếc đồng hồ là biểu tượng lâu dài cho lòng biết ơn của tập thể lớp đồng hành cùng thầy qua nhiều năm. Ngược lại, dù trà thảo mộc và mật ong hữu cơ rất lành mạnh, chúng là thực phẩm tiêu dùng sẽ hết sau vài tuần. Tương tự, voucher nghỉ dưỡng spa chỉ mang lại trải nghiệm ngắn ngủi và có thể bất tiện về lịch trình. Tóm lại, đồng hồ sức khỏe kết hợp trọn vẹn giữa sự quan tâm thiết thực và giá trị kỷ niệm.',
    p3Central: 'Having a healthy diet is good for your health.',
    p3CentralVi: 'Duy trì chế độ ăn uống lành mạnh mang lại lợi ích to lớn cho sức khỏe.',
    p3Prompts: [
      {
        point: 'Keep fit and maintain an ideal body weight',
        pointVi: 'Giữ vóc dáng cân đối và duy trì cân nặng lý tưởng',
        exp: 'Consuming whole grains, lean proteins, and fiber-rich vegetables regulates calorie intake and prevents obesity.',
        expVi: 'Tiêu thụ ngũ cốc nguyên hạt, đạm nạc và rau giàu chất xơ giúp kiểm soát lượng calo nạp vào và ngăn ngừa béo phì.'
      },
      {
        point: 'Prevent chronic diseases',
        pointVi: 'Ngăn ngừa các bệnh lý mãn tính nguy hiểm',
        exp: 'Cutting down on refined sugar, trans fats, and sodium significantly reduces the risk of cardiovascular disease, diabetes, and hypertension.',
        expVi: 'Cắt giảm đường tinh luyện, chất béo chuyển hóa và muối giúp giảm đáng kể nguy cơ mắc bệnh tim mạch, tiểu đường và cao huyết áp.'
      },
      {
        point: 'Refresh the mind and boost daily energy',
        pointVi: 'Làm minh mẫn tinh thần và tăng cường năng lượng mỗi ngày',
        exp: 'Essential vitamins, minerals, and omega-3 fatty acids nourish brain function, improve mood, and prevent afternoon fatigue.',
        expVi: 'Các vitamin thiết yếu, khoáng chất và axit béo omega-3 nuôi dưỡng chức năng não bộ, cải thiện tâm trạng và chống mệt mỏi.'
      }
    ],
    p3OwnIdea: {
      point: 'Promote longevity and reduce medical expenses',
      pointVi: 'Kéo dài tuổi thọ và tiết kiệm chi phí y tế lâu dài',
      exp: 'Investing in wholesome nutrition today acts as preventive medicine that saves individuals from costly hospital treatments in old age.',
      expVi: 'Đầu tư vào dinh dưỡng lành mạnh hôm nay chính là y học dự phòng giúp tiết kiệm chi phí điều trị bệnh viện đắt đỏ khi về già.'
    },
    p3SpeechB1: 'I completely agree that having a healthy diet is essential for our health. First, eating a balanced diet helps us keep fit and control our weight. When we eat more vegetables, fruits, and lean meat instead of fast food, we avoid becoming overweight. Second, a healthy diet prevents dangerous diseases such as heart disease, high blood pressure, and diabetes. Third, nutritious food refreshes our mind and gives us stable energy to study and work productively all day. Finally, eating well helps us live a longer life and saves money on hospital bills in the future.',
    p3SpeechB1Vi: 'Tôi hoàn toàn đồng ý rằng duy trì chế độ ăn uống lành mạnh là vô cùng thiết yếu cho sức khỏe của chúng ta. Thứ nhất, ăn uống cân bằng giúp chúng ta giữ dáng và kiểm soát cân nặng. Khi ăn nhiều rau xanh, trái cây và thịt nạc thay vì đồ ăn nhanh, chúng ta tránh được tình trạng thừa cân. Thứ hai, chế độ ăn lành mạnh ngăn ngừa các căn bệnh nguy hiểm như bệnh tim, cao huyết áp và tiểu đường. Thứ ba, thực phẩm giàu dinh dưỡng giúp tinh thần minh mẫn và cung cấp nguồn năng lượng ổn định để học tập, làm việc hiệu quả cả ngày. Cuối cùng, ăn uống tốt giúp chúng ta sống thọ hơn và tiết kiệm tiền viện phí trong tương lai.',
    p3SpeechB2C1: 'It is a well-established scientific fact that adhering to a balanced, nutrient-dense diet is the cornerstone of human health. First and foremost, wholesome eating habits enable individuals to keep fit and maintain an optimal body mass index by prioritizing complex carbohydrates, lean proteins, and dietary fiber over empty calories. Secondly, a nutritious diet acts as a powerful shield against chronic illnesses; minimizing ultra-processed foods and refined sugars drastically lowers the incidence of cardiovascular disorders and type-2 diabetes. Thirdly, proper nutrition rejuvenates cognitive function—vital micronutrients and hydration keep the brain sharp and stabilize emotional mood. Furthermore, viewing healthy food as preventive medicine extends longevity and alleviates the financial burden on national healthcare systems.',
    p3SpeechB2C1Vi: 'Có một thực tế khoa học đã được chứng minh rõ ràng là việc duy trì chế độ ăn cân bằng, giàu dưỡng chất là nền tảng của sức khỏe con người. Trước hết, thói quen ăn uống lành mạnh giúp mỗi cá nhân giữ vóc dáng cân đối và duy trì chỉ số khối cơ thể tối ưu bằng cách ưu tiên tinh bột phức hợp, đạm nạc và chất xơ thay vì calo rỗng. Thứ hai, chế độ dinh dưỡng tốt đóng vai trò như tấm lá chắn vững chắc chống lại các bệnh mãn tính; giảm thiểu thực phẩm siêu chế biến và đường tinh luyện giúp hạ thấp đáng kể tỷ lệ mắc bệnh tim mạch và tiểu đường tuýp 2. Thứ ba, dinh dưỡng hợp lý làm trẻ hóa chức năng nhận thức—các vi chất thiết yếu và việc cấp đủ nước giữ cho não bộ sắc bén và ổn định tâm trạng. Hơn nữa, coi thực phẩm lành mạnh là y học dự phòng giúp kéo dài tuổi thọ và giảm gánh nặng tài chính cho hệ thống y tế quốc gia.',
    p3FollowUps: [
      {
        q: 'What makes a balanced diet, and why do many people still prefer fast food?',
        qVi: 'Điều gì tạo nên chế độ ăn cân bằng, và tại sao nhiều người vẫn thích đồ ăn nhanh? (Đã bổ sung câu trả lời mẫu)',
        b1: 'A balanced diet includes carbohydrates, protein, healthy fats, vitamins, and water. However, many people still eat fast food because they are too busy to cook and fast food is cheap and tasty.',
        b2c1: 'A balanced diet comprises a proportional intake of macronutrients, fiber, and micronutrients. Nevertheless, busy urbanites often gravitate toward fast food due to its unmatched convenience, aggressive marketing, and addictive hyper-palatable flavors.',
        vi: 'Một chế độ ăn cân bằng bao gồm tỷ lệ hợp lý giữa các chất đa lượng, chất xơ và vi chất. Tuy nhiên, cư dân đô thị bận rộn thường tìm đến đồ ăn nhanh vì sự tiện lợi tức thì, chiến dịch quảng cáo rầm rộ và hương vị kích thích vị giác gây nghiện.'
      },
      {
        q: 'Does traditional cuisine in your country encourage healthy eating habits?',
        qVi: 'Ẩm thực truyền thống ở đất nước bạn có khuyến khích thói quen ăn uống lành mạnh không? (Đã bổ sung câu trả lời mẫu)',
        b1: 'Yes, traditional Vietnamese food is very healthy because it uses a lot of fresh vegetables, herbs, fish, and soups rather than butter or deep-fried oil.',
        b2c1: 'Absolutely. Traditional Vietnamese gastronomy is celebrated worldwide for its emphasis on fresh seasonal herbs, steamed or boiled dishes, and light broths rather than heavy dairy or saturated fats.',
        vi: 'Hoàn toàn có. Ẩm thực truyền thống Việt Nam được ca ngợi trên toàn thế giới nhờ chú trọng vào các loại rau thơm theo mùa tươi sống, các món hấp hoặc luộc và nước dùng thanh đạm thay vì bơ sữa béo hay chất béo bão hòa.'
      },
      {
        q: 'Who should be responsible for teaching children about healthy eating: parents or schools?',
        qVi: 'Ai nên chịu trách nhiệm dạy trẻ em về ăn uống lành mạnh: cha mẹ hay nhà trường? (Đã bổ sung câu trả lời mẫu)',
        b1: 'Both parents and schools share this responsibility. Parents prepare daily meals at home, while schools provide healthy lunches and nutrition lessons.',
        b2c1: 'Cultivating healthy dietary habits in children requires a synergistic partnership between families and schools. Parents model wholesome eating at the dinner table, while schools reinforce nutritional literacy and ban junk food in canteens.',
        vi: 'Việc hình thành thói quen ăn uống lành mạnh cho trẻ đòi hỏi sự phối hợp chặt chẽ giữa gia đình và nhà trường. Cha mẹ làm gương qua bữa cơm gia đình, trong khi nhà trường củng cố kiến thức dinh dưỡng và hạn chế đồ ăn vặt trong căng tin.'
      }
    ]
  }
];

import { VSTEP_28_SEEDS_PART_2 } from './vstep28SpeakingBankPart2';
import { VSTEP_28_SEEDS_PART_3 } from './vstep28SpeakingBankPart3';
import { VSTEP_28_SEEDS_PART_4 } from './vstep28SpeakingBankPart4';

export const VSTEP_28_SEEDS_PART_1 = VSTEP_28_SEEDS;

export const ALL_VSTEP_28_SEEDS: CompactVstepTestSeed[] = [
  ...VSTEP_28_SEEDS_PART_1,
  ...VSTEP_28_SEEDS_PART_2,
  ...VSTEP_28_SEEDS_PART_3,
  ...VSTEP_28_SEEDS_PART_4
];

export const VSTEP_28_SPEAKING_BY_DAY: Record<number, VstepSpeakingTask> = ALL_VSTEP_28_SEEDS.reduce(
  (acc, seed) => {
    acc[seed.day] = compileVstepSeed(seed);
    return acc;
  },
  {} as Record<number, VstepSpeakingTask>
);

export { compileVstepSeed };

