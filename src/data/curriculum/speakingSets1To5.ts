import { VstepSpeakingTask, SpeakingPart2Step } from './types';

export const STANDARD_PART2_STEPS: SpeakingPart2Step[] = [
  {
    stepNumber: 1,
    title: 'Bước 1: Nêu tình huống & Khẳng định lựa chọn tối ưu (Introduction & Direct Choice)',
    guideEn: 'Paraphrase the situation briefly and state your chosen option right at the beginning.',
    guideVi: 'Diễn đạt lại tình huống ngắn gọn bằng từ vựng của bạn và nêu rõ phương án bạn chọn ngay mở đầu.'
  },
  {
    stepNumber: 2,
    title: 'Bước 2: Phân tích 2–3 ưu điểm cốt lõi của phương án chọn (Supporting Arguments)',
    guideEn: 'Provide 2–3 compelling reasons with concrete examples (effectiveness, convenience, long-term value).',
    guideVi: 'Đưa ra 2–3 lý do thuyết phục kèm ví dụ thực tế (tính hiệu quả, sự tiện lợi, giá trị lâu dài).'
  },
  {
    stepNumber: 3,
    title: 'Bước 3: Phản biện phương án thứ hai (Refuting First Alternative)',
    guideEn: 'Acknowledge one merit of the second option, then point out its main limitation.',
    guideVi: 'Công nhận một điểm cộng nhỏ của phương án thứ hai, sau đó chỉ ra nhược điểm lớn khiến bạn không chọn.'
  },
  {
    stepNumber: 4,
    title: 'Bước 4: Phản biện phương án thứ ba (Refuting Second Alternative)',
    guideEn: 'Explain why the third option is less suitable or impractical in this specific scenario.',
    guideVi: 'Giải thích vì sao phương án thứ ba kém phù hợp hoặc thiếu thực tế hơn trong hoàn cảnh này.'
  },
  {
    stepNumber: 5,
    title: 'Bước 5: Tóm tắt & Khẳng định lại quyết định (Conclusion)',
    guideEn: 'Summarize your main point and reaffirm why your chosen option is the best overall.',
    guideVi: 'Tóm lược lại luận điểm chính và chốt lại vì sao lựa chọn của bạn là tối ưu nhất.'
  }
];

export const CANONICAL_SPEAKING_SETS_1_TO_5: Record<number, VstepSpeakingTask> = {
  1: {
    setCode: 'SET 001',
    part1: {
      topic1: {
        title: 'Daily Routine',
        titleVi: 'Thói quen sinh hoạt hằng ngày',
        questions: [
          'What is your typical morning routine like?',
          'What part of the day do you like best, and why?',
          'Do you usually plan your days in advance, or do you prefer to be spontaneous?'
        ],
        usefulVocab: [
          { word: 'productive', pos: 'adj.', meaningVi: 'năng suất, hiệu quả' },
          { word: 'energized', pos: 'adj.', meaningVi: 'tràn đầy năng lượng' },
          { word: 'prioritize', pos: 'v.', meaningVi: 'ưu tiên việc quan trọng' },
          { word: 'spontaneous', pos: 'adj.', meaningVi: 'ngẫu hứng, tự nhiên' },
          { word: 'unwind', pos: 'v.', meaningVi: 'thư giãn, xả hơi cuối ngày' }
        ],
        collocations: [
          { phrase: 'early riser / morning person', meaningVi: 'người có thói quen dậy sớm' },
          { phrase: 'stick to a schedule', meaningVi: 'bám sát lịch trình đã định' },
          { phrase: 'recharge my batteries', meaningVi: 'nạp lại năng lượng' },
          { phrase: 'hectic daily grind', meaningVi: 'guồng quay bận rộn hằng ngày' }
        ],
        bilingualQuestions: [
          {
            questionEn: 'What is your typical morning routine like?',
            questionVi: 'Buổi sáng điển hình của bạn thường diễn ra như thế nào?',
            suggestedIdeas: [
              'Dậy lúc 6h30 sáng, uống một cốc nước ấm để kích hoạt cơ thể',
              'Tập giãn cơ nhẹ nhàng 15 phút và ăn sáng lành mạnh trước khi học/làm việc'
            ],
            samples: {
              B1: {
                answerEn: 'On weekdays, I usually wake up at 6:30 a.m. First, I brush my teeth and drink a glass of warm water. Then I have a quick breakfast like bread and eggs before going to class at 7:30.',
                answerVi: 'Vào các ngày trong tuần, tôi thường thức dậy lúc 6 giờ 30 sáng. Đầu tiên, tôi đánh răng và uống một cốc nước ấm. Sau đó tôi ăn sáng nhanh với bánh mì và trứng trước khi đến lớp lúc 7 giờ 30.'
              },
              B2: {
                answerEn: 'I consider myself an early riser, so my alarm goes off at 6:00 a.m. After doing some light stretching to wake up my body, I brew a cup of black coffee and review my to-do list so I can start the day feeling organized.',
                answerVi: 'Tôi tự thấy mình là người hay dậy sớm, nên chuông báo thức của tôi reo lúc 6 giờ sáng. Sau vài động tác giãn cơ nhẹ để đánh thức cơ thể, tôi pha một tách cà phê đen và xem lại danh sách việc cần làm để bắt đầu ngày mới thật ngăn nắp.'
              },
              C1: {
                answerEn: 'My morning ritual is deliberately structured to maximize mental clarity. Upon waking at dawn, I refrain from checking my smartphone and instead dedicate twenty minutes to mindfulness and a nutritious breakfast, which primes my cognitive focus for demanding academic tasks ahead.',
                answerVi: 'Thói quen buổi sáng của tôi được thiết kế có chủ đích nhằm tối ưu hóa sự minh mẫn. Khi thức dậy lúc bình minh, tôi tránh kiểm tra điện thoại mà dành 20 phút cho chánh niệm và bữa sáng giàu dinh dưỡng, giúp kích hoạt sự tập trung nhận thức cho các nhiệm vụ học thuật đòi hỏi cao phía trước.'
              }
            }
          },
          {
            questionEn: 'What part of the day do you like best, and why?',
            questionVi: 'Bạn thích khoảng thời gian nào nhất trong ngày, và tại sao?',
            suggestedIdeas: [
              'Buổi sáng sớm vì không khí trong lành, yên tĩnh và đầu óc tỉnh táo nhất',
              'Buổi tối muộn vì được thư giãn hoàn toàn sau khi hoàn thành mọi nghĩa vụ'
            ],
            samples: {
              B1: {
                answerEn: 'My favorite part of the day is the evening. After finishing my studies, I can relax, listen to music, and have dinner with my family without feeling rushed.',
                answerVi: 'Khoảng thời gian yêu thích nhất trong ngày của tôi là buổi tối. Sau khi học xong, tôi có thể thư giãn, nghe nhạc và ăn tối cùng gia đình mà không cảm thấy vội vã.'
              },
              B2: {
                answerEn: 'I am definitely fond of early mornings. Between 6 and 8 a.m., the neighborhood is wonderfully peaceful, and my mind is at its sharpest, allowing me to absorb complex English vocabulary effortlessly.',
                answerVi: 'Tôi đặc biệt yêu thích buổi sáng sớm. Khoảng từ 6 đến 8 giờ sáng, khu phố bình yên tuyệt vời và tâm trí tôi sắc bén nhất, cho phép tôi tiếp thu từ vựng tiếng Anh phức tạp một cách dễ dàng.'
              },
              C1: {
                answerEn: 'Twilight holds a special appeal for me. Once the relentless pace of daytime obligations subsides, late evening offers a tranquil sanctuary where I can unwind with classical literature and reflect on my personal growth.',
                answerVi: 'Khoảng chạng vạng tối luôn có sức hút đặc biệt với tôi. Khi nhịp độ hối hả của các nghĩa vụ ban ngày lắng xuống, đêm muộn mang lại một khoảng lặng yên bình nơi tôi có thể thư giãn cùng văn học cổ điển và chiêm nghiệm về sự phát triển bản thân.'
              }
            }
          },
          {
            questionEn: 'Do you usually plan your days in advance, or do you prefer to be spontaneous?',
            questionVi: 'Bạn thường lên kế hoạch trước cho ngày của mình hay thích sự ngẫu hứng hơn?',
            suggestedIdeas: [
              'Lập kế hoạch chi tiết cho ngày học/làm việc để tránh trì hoãn',
              'Cuối tuần thì để bản thân tự do ngẫu hứng để cân bằng cảm xúc'
            ],
            samples: {
              B1: {
                answerEn: 'I usually write down a simple plan the night before. It helps me remember my homework and appointments so I do not forget important things.',
                answerVi: 'Tôi thường viết ra một kế hoạch đơn giản vào tối hôm trước. Việc này giúp tôi nhớ bài tập về nhà và các cuộc hẹn để không quên những việc quan trọng.'
              },
              B2: {
                answerEn: 'I try to strike a balance between the two. During weekdays, I stick to a strict digital calendar to meet deadlines, whereas on weekends I embrace spontaneity to keep life exciting.',
                answerVi: 'Tôi cố gắng cân bằng giữa cả hai. Trong tuần, tôi bám sát lịch điện tử nghiêm ngặt để kịp tiến độ, trong khi vào cuối tuần tôi đón nhận sự ngẫu hứng để giữ cho cuộc sống thú vị.'
              },
              C1: {
                answerEn: 'By nature, I am a methodical planner when it comes to professional milestones; mapping out daily priorities prevents decision fatigue. Nevertheless, I deliberately leave room for serendipity during leisure hours so my routine never feels mechanical.',
                answerVi: 'Về bản chất, tôi là người lập kế hoạch bài bản khi xét đến các cột mốc công việc; vạch rõ các ưu tiên hằng ngày giúp ngăn ngừa sự mệt mỏi khi ra quyết định. Tuy nhiên, tôi chủ ý để dành không gian cho những điều bất ngờ thú vị vào giờ giải lao để lịch trình không bao giờ trở nên máy móc.'
              }
            }
          }
        ]
      },
      topic2: {
        title: 'Hometown',
        titleVi: 'Quê hương nơi bạn sinh sống',
        questions: [
          'Where are you from, and what is your hometown famous for?',
          'How has your hometown changed over the last ten years?',
          'Would you prefer to live in your hometown or a big metropolis in the future?'
        ],
        usefulVocab: [
          { word: 'picturesque', pos: 'adj.', meaningVi: 'đẹp như tranh vẽ' },
          { word: 'hospitality', pos: 'n.', meaningVi: 'lòng hiếu khách nồng hậu' },
          { word: 'urbanization', pos: 'n.', meaningVi: 'quá trình đô thị hóa' },
          { word: 'tranquil', pos: 'adj.', meaningVi: 'thanh bình, yên ả' },
          { word: 'heritage', pos: 'n.', meaningVi: 'di sản truyền thống' }
        ],
        collocations: [
          { phrase: 'tight-knit community', meaningVi: 'cộng đồng gắn bó khăng khít' },
          { phrase: 'rapidly modernizing infrastructure', meaningVi: 'hạ tầng hiện đại hóa nhanh chóng' },
          { phrase: 'cost of living', meaningVi: 'chi phí sinh hoạt' },
          { phrase: 'rich culinary tradition', meaningVi: 'truyền thống ẩm thực phong phú' }
        ],
        bilingualQuestions: [
          {
            questionEn: 'Where are you from, and what is your hometown famous for?',
            questionVi: 'Bạn đến từ đâu và quê hương bạn nổi tiếng về điều gì?',
            suggestedIdeas: [
              'Giới thiệu vị trí địa lý, cảnh quan thiên nhiên hoặc di tích lịch sử',
              'Nhắc đến ẩm thực đặc sản và sự thân thiện, mến khách của người dân'
            ],
            samples: {
              B1: {
                answerEn: 'I come from a coastal city in central Vietnam. It is famous for its long sandy beaches, fresh seafood, and very friendly local people.',
                answerVi: 'Tôi đến từ một thành phố biển ở miền Trung Việt Nam. Nơi đây nổi tiếng với những bãi cát dài, hải sản tươi ngon và người dân địa phương vô cùng thân thiện.'
              },
              B2: {
                answerEn: 'I hail from a vibrant province renowned for its centuries-old historical temples and signature local cuisine. Tourists flock there every spring to admire the picturesque river landscapes and experience our warm hospitality.',
                answerVi: 'Tôi sinh ra tại một tỉnh thành giàu sức sống, nổi danh với những ngôi đền lịch sử hàng trăm năm tuổi và ẩm thực địa phương đặc trưng. Du khách đổ về đây mỗi độ xuân về để chiêm ngưỡng cảnh sông nước đẹp như tranh và trải nghiệm lòng hiếu khách nồng hậu.'
              },
              C1: {
                answerEn: 'My roots lie in a culturally rich region celebrated for its intangible folk heritage and artisanal craftsmanship. Despite modern influences, the town retains an authentic charm and a tight-knit community spirit that captivates visitors.',
                answerVi: 'Cội nguồn của tôi nằm ở một vùng đất giàu truyền thống văn hóa, nổi tiếng với di sản dân gian phi vật thể và nghề thủ công tinh xảo. Bất chấp những ảnh hưởng hiện đại, thị trấn vẫn giữ được nét quyến rũ nguyên bản và tinh thần cộng đồng gắn kết làm say lòng du khách.'
              }
            }
          },
          {
            questionEn: 'How has your hometown changed over the last ten years?',
            questionVi: 'Quê hương bạn đã thay đổi như thế nào trong suốt 10 năm qua?',
            suggestedIdeas: [
              'Đường sá được mở rộng, xuất hiện nhiều khu đô thị mới, trung tâm thương mại',
              'Kinh tế phát triển hơn nhưng không gian xanh bị thu hẹp đôi chút'
            ],
            samples: {
              B1: {
                answerEn: 'In the last ten years, my hometown has become much more modern. Many new roads, supermarkets, and tall buildings have been built, making life more convenient.',
                answerVi: 'Trong mười năm qua, quê hương tôi đã trở nên hiện đại hơn rất nhiều. Nhiều con đường mới, siêu thị và tòa nhà cao tầng đã được xây dựng, giúp cuộc sống tiện lợi hơn.'
              },
              B2: {
                answerEn: 'It has undergone a dramatic transformation driven by urbanization. What used to be quiet paddy fields are now bustling commercial zones and modern residential complexes, significantly raising local living standards.',
                answerVi: 'Nơi đây đã trải qua một cuộc chuyển mình mạnh mẽ nhờ đô thị hóa. Những cánh đồng lúa yên tĩnh trước kia giờ đã trở thành khu thương mại sầm uất và khu dân cư hiện đại, nâng cao đáng kể mức sống của người dân.'
              },
              C1: {
                answerEn: 'Over the past decade, my hometown has witnessed unprecedented infrastructural expansion, transitioning from a sleepy agrarian town into a dynamic economic hub, though this modernization has inevitably brought greater traffic congestion.',
                answerVi: 'Trong thập kỷ qua, quê hương tôi đã chứng kiến sự mở rộng hạ tầng chưa từng có, chuyển mình từ một thị trấn nông nghiệp êm đềm thành trung tâm kinh tế năng động, dù quá trình hiện đại hóa này không tránh khỏi việc kéo theo ùn tắc giao thông.'
              }
            }
          },
          {
            questionEn: 'Would you prefer to live in your hometown or a big metropolis in the future?',
            questionVi: 'Trong tương lai, bạn thích sống ở quê hương hay tại một đại đô thị lớn hơn?',
            suggestedIdeas: [
              'Khi còn trẻ ưu tiên làm việc ở thành phố lớn để phát triển sự nghiệp',
              'Về lâu dài muốn quay về quê hương vì môi trường trong lành và gần gia đình'
            ],
            samples: {
              B1: {
                answerEn: 'For now, I want to work in a big city because there are more good jobs. Later in life, I hope to return to my hometown to enjoy a peaceful life.',
                answerVi: 'Hiện tại, tôi muốn làm việc ở một thành phố lớn vì có nhiều công việc tốt hơn. Sau này, tôi hy vọng sẽ trở về quê hương để tận hưởng cuộc sống bình yên.'
              },
              B2: {
                answerEn: 'In the short term, a major metropolis appeals to me due to its diverse career prospects and networking opportunities. However, once I settle down, I would prefer my hometown for its cleaner air and reasonable cost of living.',
                answerVi: 'Trong ngắn hạn, một đại đô thị thu hút tôi nhờ triển vọng nghề nghiệp đa dạng và cơ hội mở rộng mối quan hệ. Tuy nhiên, khi đã ổn định, tôi thích quê nhà hơn vì không khí trong lành và chi phí sinh hoạt hợp lý.'
              },
              C1: {
                answerEn: 'While a cosmopolitan metropolis is indispensable during my formative career years for professional exposure, I ultimately envision relocating back to my hometown, where remote work allows me to enjoy tranquil surroundings without sacrificing career trajectory.',
                answerVi: 'Mặc dù một đại đô thị sầm uất là không thể thiếu trong những năm đầu gây dựng sự nghiệp để cọ xát chuyên môn, về lâu dài tôi hình dung mình sẽ quay về quê hương, nơi công việc từ xa cho phép tôi tận hưởng không gian thanh bình mà không phải hy sinh đà thăng tiến.'
              }
            }
          }
        ]
      },
      part1Tips: [
        'Mở rộng câu trả lời theo công thức: Direct Answer (Trả lời trực tiếp) + Reason (Giải thích lý do) + Concrete Example (Ví dụ thực tế cá nhân).',
        'Sử dụng các trạng từ chỉ tần suất và cụm nối tự nhiên: "On a daily basis...", "What I cherish most about...", "Looking back over the past decade..."'
      ]
    },
    part2: {
      situation: 'You have an important university exam coming up next week, and you are looking for the best place to revise effectively. There are three options: (A) The university library, (B) A quiet coffee shop, or (C) Your own room at home. Which place would you choose and why?',
      situationVi: 'Bạn sắp có một kỳ thi đại học quan trọng vào tuần tới và đang tìm địa điểm lý tưởng nhất để ôn tập hiệu quả. Có 3 lựa chọn: (A) Thư viện trường đại học, (B) Một quán cà phê yên tĩnh, hoặc (C) Phòng riêng tại nhà. Bạn sẽ chọn nơi nào và tại sao?',
      options: [
        {
          letter: 'A',
          title: 'Option A: The university library (Thư viện trường đại học)',
          description: 'Không gian học thuật chuyên biệt với nguồn tài liệu tham khảo phong phú và kỷ luật im lặng tuyệt đối.',
          strongPoints: 'Môi trường nghiêm túc giúp tập trung tối đa, sẵn có sách tham khảo, máy lạnh và wifi tốc độ cao miễn phí.',
          drawbacks: 'Phải di chuyển đến trường và có thể hết chỗ ngồi đẹp vào mùa cao điểm thi cử.',
          advantagesEn: ['Zero domestic distractions and strict silence', 'Immediate access to academic reference books and journals', 'Peer motivation from seeing other hardworking students'],
          disadvantagesEn: ['Takes time to commute back and forth', 'Can get crowded during peak exam weeks']
        },
        {
          letter: 'B',
          title: 'Option B: A quiet coffee shop (Quán cà phê yên tĩnh)',
          description: 'Không gian thoải mái có đồ uống thơm ngon và tiếng nhạc nền nhẹ nhàng.',
          strongPoints: 'Tinh thần thư giãn, đỡ buồn ngủ nhờ có cà phê và không khí thoáng đãng.',
          drawbacks: 'Tốn chi phí mua đồ uống mỗi ngày, dễ bị phân tâm bởi khách ra vào và ổ cắm điện không phải lúc nào cũng sẵn.',
          advantagesEn: ['Relaxing ambiance with refreshing beverages', 'Less rigid atmosphere than a library'],
          disadvantagesEn: ['Costly if studying for many hours daily', 'Unpredictable background noise from incoming customers']
        },
        {
          letter: 'C',
          title: 'Option C: Your own room at home (Phòng riêng tại nhà)',
          description: 'Không gian cá nhân quen thuộc, không tốn thời gian đi lại và hoàn toàn riêng tư.',
          strongPoints: 'Tiện nghi, không mất thời gian di chuyển, có thể học bất cứ khung giờ nào.',
          drawbacks: 'Cực kỳ dễ buồn ngủ do có chiếc giường ngay cạnh, dễ bị gia đình gọi làm việc vặt hoặc xao nhãng bởi tivi, tủ lạnh.',
          advantagesEn: ['Maximum comfort and zero commuting time', 'Flexible study hours day or night'],
          disadvantagesEn: ['High temptation to nap on the bed or procrastinate', 'Frequent interruptions from family members or household chores']
        }
      ],
      requirement: 'Choose the best place to study for your upcoming exams, explain why you prefer it, and explain why you reject the other two options.',
      sampleStrategy: 'Chọn Phương án A (The university library) làm phương án tối ưu vì không khí học thuật nghiêm túc và kho tài liệu sẵn có. Phản biện Phương án B (Coffee shop) vì tốn tiền và tiếng ồn bất chợt; phản biện Phương án C (Own room at home) vì chiếc giường êm ái dễ gây buồn ngủ và sự trì hoãn.',
      usefulConnectors: [
        'Given the upcoming high-stakes exams, I would undoubtedly opt for studying at the university library.',
        'First and foremost, the library offers a distraction-free environment conducive to deep concentration.',
        'Turning to a quiet coffee shop, although the aroma of coffee is pleasant, buying drinks daily is costly for a student budget.',
        'As for my own room at home, the proximity of my comfortable bed is a constant temptation to procrastinate.'
      ],
      usefulVocab: [
        { word: 'conducive', pos: 'adj.', meaningVi: 'tạo điều kiện thuận lợi cho việc gì' },
        { word: 'distraction-free', pos: 'adj.', meaningVi: 'không có yếu tố gây xao nhãng' },
        { word: 'procrastinate', pos: 'v.', meaningVi: 'trì hoãn, chần chừ' },
        { word: 'peer motivation', pos: 'n.', meaningVi: 'động lực lan tỏa từ bạn bè xung quanh' }
      ],
      collocations: [
        { phrase: 'deep cognitive concentration', meaningVi: 'sự tập trung tư duy sâu' },
        { phrase: 'wealth of reference materials', meaningVi: 'kho tàng tài liệu tham khảo phong phú' },
        { phrase: 'strain on a tight student budget', meaningVi: 'gánh nặng cho túi tiền eo hẹp của sinh viên' }
      ],
      answerStructure: STANDARD_PART2_STEPS,
      sampleAnswers: {
        B1: {
          chosenOption: 'Option A: The university library',
          speechEn: 'To prepare for my important exam next week, I think the university library is the best choice for me. First, the library is very quiet, so I can focus on my lessons without any noise. Second, when I see other students studying hard around me, I also feel motivated to study harder. Besides, I can borrow useful textbooks and dictionaries there for free. On the other hand, I do not choose a coffee shop because buying drinks every day is quite expensive, and sometimes strangers talk loudly. I also avoid studying in my bedroom at home because my bed always makes me feel sleepy, and my family members might ask me to do housework. For these reasons, the university library is definitely the best place for my exam revision.',
          speechVi: 'Để chuẩn bị cho kỳ thi quan trọng vào tuần tới, tôi nghĩ thư viện trường đại học là lựa chọn tốt nhất cho mình. Thứ nhất, thư viện rất yên tĩnh nên tôi có thể tập trung vào bài học mà không bị ồn ào. Thứ hai, khi nhìn thấy các bạn sinh viên khác chăm chỉ học tập xung quanh, tôi cũng có thêm động lực để cố gắng hơn. Bên cạnh đó, tôi có thể mượn giáo trình và từ điển hữu ích hoàn toàn miễn phí. Ngược lại, tôi không chọn quán cà phê vì mua đồ uống mỗi ngày khá tốn kém, và đôi khi khách lạ nói chuyện to. Tôi cũng tránh học trong phòng ngủ ở nhà vì chiếc giường luôn làm tôi buồn ngủ, và người nhà có thể nhờ tôi làm việc vặt. Vì những lý do đó, thư viện trường chắc chắn là nơi lý tưởng nhất để ôn thi.'
        },
        B2: {
          chosenOption: 'Option A: The university library',
          speechEn: 'Considering the importance of my upcoming university exams, I would definitely choose the university library as my primary study spot. The main reason is that the library provides a disciplined, distraction-free environment. Surrounded by diligent peers who are also revising, I experience strong peer motivation that keeps me from checking social media. Furthermore, having instant access to academic journals, past exam papers, and reliable Wi-Fi makes my revision much more efficient. Regarding a quiet coffee shop, while the atmosphere can be cozy, spending money on beverages every single day puts a strain on my student budget, and background chatter is unpredictable. As for studying in my own room at home, it is far too comfortable; the sight of my bed often tempts me to take long naps. Therefore, the university library is by far the most effective option.',
          speechVi: 'Xét đến tầm quan trọng của kỳ thi đại học sắp tới, tôi chắc chắn sẽ chọn thư viện trường làm địa điểm ôn tập chính. Lý do hàng đầu là thư viện mang lại môi trường kỷ luật và không bị xao nhãng. Được bao quanh bởi những người bạn chăm chỉ cũng đang ôn bài, tôi nhận được động lực đồng trang lứa mạnh mẽ giúp mình không lướt mạng xã hội. Hơn nữa, việc tiếp cận tức thì với các tạp chí học thuật, đề thi các năm trước và Wi-Fi ổn định giúp việc ôn tập hiệu quả hơn nhiều. Về quán cà phê yên tĩnh, dù không gian có thể ấm cúng nhưng việc chi tiền mua đồ uống mỗi ngày gây áp lực lên ngân sách sinh viên, và tiếng trò chuyện xung quanh rất khó lường. Còn việc học trong phòng riêng ở nhà lại quá thoải mái; nhìn thấy chiếc giường thường cám dỗ tôi ngủ nướng. Do đó, thư viện trường là phương án hiệu quả nhất.'
        },
        C1: {
          chosenOption: 'Option A: The university library',
          speechEn: 'When preparing for high-stakes university examinations, selecting an environment conducive to deep cognitive concentration is paramount, which is why I unequivocally favor the university library. First and foremost, the library enforces an atmosphere of absolute academic rigor; witnessing fellow scholars immersed in their studies fosters a contagious sense of discipline that wards off procrastination. Additionally, the immediate availability of specialized reference literature and high-speed research databases streamlines the revision process tremendously. Conversely, while a quiet café may seem appealing for its ambient charm, the cumulative financial cost of daily refreshments is impractical, and sporadic noise from patrons can easily disrupt my train of thought. Similarly, studying in my own bedroom is counterproductive due to domestic distractions and the psychological association between my room and rest. Ultimately, the university library stands out as the optimal sanctuary for academic success.',
          speechVi: 'Khi chuẩn bị cho các kỳ thi đại học mang tính quyết định, việc lựa chọn một môi trường thuận lợi cho sự tập trung nhận thức sâu là tối quan trọng, và đó là lý do tôi hoàn toàn nghiêng về thư viện trường đại học. Trước hết, thư viện duy trì bầu không khí nghiêm túc học thuật tuyệt đối; chứng kiến các bạn đồng môn miệt mài nghiên cứu sẽ khơi dậy tinh thần kỷ luật lan tỏa giúp đẩy lùi sự trì hoãn. Thêm vào đó, nguồn tài liệu tham khảo chuyên ngành và cơ sở dữ liệu nghiên cứu tốc độ cao sẵn có giúp tối ưu hóa quá trình ôn luyện. Ngược lại, dù một quán cà phê yên tĩnh có vẻ hấp dẫn nhờ không gian dễ chịu, chi phí cộng dồn cho đồ uống hằng ngày là thiếu thực tế, và tiếng ồn bất chợt từ khách hàng dễ làm đứt mạch tư duy. Tương tự, học trong phòng ngủ riêng thường phản tác dụng do những xao nhãng việc nhà và tâm lý gắn liền phòng ngủ với sự nghỉ ngơi. Tóm lại, thư viện đại học là không gian tối ưu nhất cho thành công học thuật.'
        }
      }
    }
  },
  2: {
    setCode: 'SET 002',
    part1: {
      topic1: {
        title: 'Hobbies & Free Time',
        titleVi: 'Sở thích & Thời gian rảnh rỗi',
        questions: [
          'What do you usually do in your spare time to relax?',
          'Have your hobbies changed since you were a child?',
          'Do you think it is important for people to have a hobby outside of work or study?'
        ],
        usefulVocab: [
          { word: 'pastime', pos: 'n.', meaningVi: 'trò tiêu khiển, thú vui lúc rảnh' },
          { word: 'therapeutic', pos: 'adj.', meaningVi: 'có tính trị liệu, thư giãn tinh thần' },
          { word: 'cultivate', pos: 'v.', meaningVi: 'trau dồi, nuôi dưỡng sở thích' },
          { word: 'monotony', pos: 'n.', meaningVi: 'sự đơn điệu, nhàm chán' }
        ],
        collocations: [
          { phrase: 'let off steam', meaningVi: 'xả căng thẳng, giải tỏa áp lực' },
          { phrase: 'broaden my horizons', meaningVi: 'mở mang tầm mắt' },
          { phrase: 'avid reader', meaningVi: 'người say mê đọc sách' }
        ],
        bilingualQuestions: [
          {
            questionEn: 'What do you usually do in your spare time to relax?',
            questionVi: 'Bạn thường làm gì vào thời gian rảnh để thư giãn?',
            suggestedIdeas: [
              'Đọc sách phi hư cấu hoặc nghe podcast tiếng Anh để vừa giải trí vừa mở rộng kiến thức',
              'Chơi cầu lông hoặc chạy bộ ngoài công viên để giải tỏa căng thẳng'
            ],
            samples: {
              B1: {
                answerEn: 'In my free time, I love listening to pop music and reading adventure books. On weekends, I also play badminton with my friends in the park to stay healthy.',
                answerVi: 'Vào thời gian rảnh, tôi thích nghe nhạc pop và đọc truyện phiêu lưu. Vào cuối tuần, tôi cũng chơi cầu lông với bạn bè ở công viên để giữ gìn sức khỏe.'
              },
              B2: {
                answerEn: 'Whenever I have spare time, I gravitate toward reading biographies and jogging outdoors. Both activities help me let off steam after intense study sessions and keep me mentally refreshed.',
                answerVi: 'Mỗi khi có thời gian rảnh, tôi thường tìm đến việc đọc sách tiểu sử và chạy bộ ngoài trời. Cả hai hoạt động này đều giúp tôi xả căng thẳng sau những giờ học căng thẳng và giữ tinh thần sảng khoái.'
              },
              C1: {
                answerEn: 'My preferred pastime is immersing myself in non-fiction literature and practicing amateur photography. Capturing candid street moments acts as a therapeutic counterbalance to the analytical demands of my academic life.',
                answerVi: 'Thú tiêu khiển yêu thích của tôi là đắm mình vào các tác phẩm phi hư cấu và thực hành nhiếp ảnh nghiệp dư. Việc ghi lại những khoảnh khắc đời thường trên phố đóng vai trò như một đối trọng mang tính trị liệu trước những đòi hỏi phân tích căng thẳng của việc học.'
              }
            }
          },
          {
            questionEn: 'Have your hobbies changed since you were a child?',
            questionVi: 'Sở thích của bạn có thay đổi kể từ khi bạn còn nhỏ không?',
            suggestedIdeas: [
              'Hồi nhỏ thích xem hoạt hình, sưu tầm tem hoặc chơi trò chơi điện tử',
              'Khi trưởng thành chuyển sang các sở thích rèn luyện sức khỏe và phát triển bản thân'
            ],
            samples: {
              B1: {
                answerEn: 'Yes, they have changed a lot. When I was a child, I loved watching cartoons and playing video games all day. Now I prefer reading and learning new skills like cooking.',
                answerVi: 'Có, chúng đã thay đổi rất nhiều. Khi còn nhỏ, tôi thích xem phim hoạt hình và chơi điện tử cả ngày. Bây giờ tôi thích đọc sách và học các kỹ năng mới như nấu ăn hơn.'
              },
              B2: {
                answerEn: 'They have evolved considerably. As a kid, I was obsessed with comic books and outdoor hide-and-seek, whereas nowadays I gravitate toward more mindful pursuits like acoustic guitar and fitness training.',
                answerVi: 'Chúng đã thay đổi đáng kể. Hồi nhỏ, tôi mê mệt truyện tranh và trò trốn tìm ngoài trời, trong khi ngày nay tôi hướng tới những thú vui sâu lắng hơn như chơi đàn guitar acoustic và tập thể hình.'
              },
              C1: {
                answerEn: 'Undoubtedly, my recreational preferences have matured alongside my lifestyle. While my childhood revolved around carefree team games, adulthood has steered me toward intellectually stimulating pursuits such as learning foreign languages and culinary experimentation.',
                answerVi: 'Chắc chắn rồi, sở thích giải trí của tôi đã trưởng thành cùng với lối sống. Trong khi tuổi thơ xoay quanh những trò chơi đồng đội vô tư, tuổi trưởng thành đã hướng tôi tới những theo đuổi kích thích trí tuệ như học ngoại ngữ và thử nghiệm ẩm thực.'
              }
            }
          },
          {
            questionEn: 'Do you think it is important for people to have a hobby outside of work or study?',
            questionVi: 'Bạn có nghĩ việc có một sở thích ngoài công việc hoặc học tập là quan trọng không?',
            suggestedIdeas: [
              'Giúp cân bằng cuộc sống, ngăn ngừa kiệt sức (burnout)',
              'Tạo cơ hội kết nối với những người bạn có cùng đam mê'
            ],
            samples: {
              B1: {
                answerEn: 'Yes, I think it is very important. Having a hobby helps people forget their stress at work and makes their life happier and more colorful.',
                answerVi: 'Có, tôi nghĩ điều đó rất quan trọng. Có một sở thích giúp mọi người quên đi căng thẳng trong công việc và làm cho cuộc sống của họ vui vẻ, nhiều màu sắc hơn.'
              },
              B2: {
                answerEn: 'Absolutely. Cultivating a hobby outside work is essential for preventing psychological burnout. It breaks the monotony of daily routines and gives people a fulfilling sense of personal identity.',
                answerVi: 'Hoàn toàn đồng ý. Nuôi dưỡng một sở thích ngoài công việc là thiết yếu để ngăn ngừa sự kiệt sức về tâm lý. Nó phá vỡ sự đơn điệu của lịch trình hằng ngày và mang lại cho con người cảm giác trọn vẹn về bản sắc cá nhân.'
              },
              C1: {
                answerEn: 'Without question, engaging in a meaningful avocation is vital for holistic well-being. It serves as an emotional safety valve against occupational stress while fostering creativity and social connection beyond professional circles.',
                answerVi: 'Không còn nghi ngờ gì nữa, theo đuổi một thú vui có ý nghĩa là yếu tố sống còn cho sức khỏe toàn diện. Nó đóng vai trò như một van an toàn cảm xúc trước áp lực nghề nghiệp, đồng thời nuôi dưỡng sự sáng tạo và kết nối xã hội vượt ra ngoài phạm vi công việc.'
              }
            }
          }
        ]
      },
      topic2: {
        title: 'Food and Cooking',
        titleVi: 'Ẩm thực & Nấu nướng',
        questions: [
          'What is your favorite traditional dish in your country?',
          'Do you prefer eating home-cooked meals or dining out at restaurants?',
          'Should children be taught how to cook at school?'
        ],
        usefulVocab: [
          { word: 'nutritious', pos: 'adj.', meaningVi: 'giàu dinh dưỡng, bổ dưỡng' },
          { word: 'hygienic', pos: 'adj.', meaningVi: 'hợp vệ sinh, sạch sẽ' },
          { word: 'culinary', pos: 'adj.', meaningVi: 'thuộc về nghệ thuật ẩm thực' },
          { word: 'self-sufficient', pos: 'adj.', meaningVi: 'tự lập, tự lo được cho bản thân' }
        ],
        collocations: [
          { phrase: 'home-cooked meal', meaningVi: 'bữa cơm nấu tại nhà' },
          { phrase: 'fresh and wholesome ingredients', meaningVi: 'nguyên liệu tươi sạch, lành mạnh' },
          { phrase: 'essential life skill', meaningVi: 'kỹ năng sống thiết yếu' }
        ],
        bilingualQuestions: [
          {
            questionEn: 'What is your favorite traditional dish in your country?',
            questionVi: 'Món ăn truyền thống yêu thích của bạn ở đất nước mình là gì?',
            suggestedIdeas: [
              'Phở bò hoặc Bún chả truyền thống với nước dùng đậm đà ninh từ xương và thảo mộc',
              'Mang đậm bản sắc văn hóa ẩm thực Việt Nam'
            ],
            samples: {
              B1: {
                answerEn: 'My favorite traditional dish is Pho, which is Vietnamese beef noodle soup. The broth is very sweet and warm, and I love eating it with fresh herbs and lemon on a cool morning.',
                answerVi: 'Món ăn truyền thống yêu thích của tôi là Phở bò Việt Nam. Nước dùng rất ngọt và ấm, tôi thích ăn kèm với rau thơm tươi và chanh vào một buổi sáng mát trời.'
              },
              B2: {
                answerEn: 'I am a huge fan of Pho Bo, our iconic Vietnamese beef noodle soup. What makes it irresistible is the aromatic broth simmered for hours with cinnamon, star anise, and tender beef slices.',
                answerVi: 'Tôi là người cực kỳ mê Phở bò, món phở biểu tượng của Việt Nam. Điều làm nên sức hấp dẫn khó cưỡng của món ăn này là phần nước dùng thơm lừng được ninh nhiều giờ cùng quế, hồi và những lát thịt bò mềm ngọt.'
              },
              C1: {
                answerEn: 'Among Vietnam’s rich culinary repertoire, Pho holds an unrivaled place in my heart. It represents a harmonious balance of slow-simmered bone broth, delicate rice noodles, and vibrant herbs that epitomize our gastronomic heritage.',
                answerVi: 'Trong kho tàng ẩm thực phong phú của Việt Nam, Phở giữ một vị trí không gì sánh bằng trong trái tim tôi. Món ăn thể hiện sự cân bằng hài hòa giữa nước dùng xương ninh chậm, bánh phở mềm mại và các loại thảo mộc tươi mát, kết tinh di sản ẩm thực của dân tộc.'
              }
            }
          },
          {
            questionEn: 'Do you prefer eating home-cooked meals or dining out at restaurants?',
            questionVi: 'Bạn thích ăn cơm nấu tại nhà hay đi ăn ngoài hàng quán hơn?',
            suggestedIdeas: [
              'Thích ăn cơm nhà hơn vì kiểm soát được nguyên liệu tươi sạch, ít dầu mỡ và tiết kiệm',
              'Thỉnh thoảng đi ăn nhà hàng vào dịp cuối tuần để đổi gió cùng bạn bè'
            ],
            samples: {
              B1: {
                answerEn: 'I prefer eating home-cooked meals because they are healthier, cleaner, and cheaper. However, on special occasions like birthdays, I enjoy going to a restaurant with my friends.',
                answerVi: 'Tôi thích ăn các bữa cơm nấu tại nhà hơn vì chúng lành mạnh, sạch sẽ và rẻ hơn. Tuy nhiên, vào những dịp đặc biệt như sinh nhật, tôi thích đi ăn nhà hàng cùng bạn bè.'
              },
              B2: {
                answerEn: 'For daily meals, I strongly prefer home cooking since I can select fresh, hygienic ingredients and control the amount of oil and salt. Dining out is something I save for weekend social gatherings.',
                answerVi: 'Đối với các bữa ăn hằng ngày, tôi ưu tiên nấu ăn tại nhà vì có thể chọn nguyên liệu tươi sạch, hợp vệ sinh và kiểm soát lượng dầu mỡ, muối. Ăn ngoài hàng là dịp tôi dành riêng cho những buổi tụ họp cuối tuần.'
              },
              C1: {
                answerEn: 'While dining out offers culinary novelty and convenience, I predominantly favor home-prepared meals. Cooking at home guarantees nutritional transparency and fosters warmth around the family dinner table.',
                answerVi: 'Mặc dù ăn ngoài hàng mang lại sự mới lạ về ẩm thực và tính tiện lợi, tôi vẫn nghiêng hẳn về các bữa ăn chuẩn bị tại nhà. Nấu nướng tại gia đảm bảo sự minh bạch về dinh dưỡng và nuôi dưỡng sự ấm cúng bên mâm cơm gia đình.'
              }
            }
          },
          {
            questionEn: 'Should children be taught how to cook at school?',
            questionVi: 'Trẻ em có nên được dạy nấu ăn ở trường học không?',
            suggestedIdeas: [
              'Rất nên dạy vì nấu ăn là kỹ năng sinh tồn và tự lập cơ bản',
              'Giúp trẻ hiểu giá trị thực phẩm và hình thành thói quen ăn uống lành mạnh'
            ],
            samples: {
              B1: {
                answerEn: 'Yes, definitely. Cooking is an important life skill. If children learn to cook basic dishes at school, they can take care of themselves when their parents are busy.',
                answerVi: 'Có, chắc chắn rồi. Nấu ăn là một kỹ năng sống quan trọng. Nếu trẻ em học nấu những món cơ bản ở trường, các em có thể tự chăm sóc bản thân khi bố mẹ bận rộn.'
              },
              B2: {
                answerEn: 'I firmly believe culinary classes should be part of the school curriculum. Teaching kids basic food preparation makes them more self-sufficient and raises their awareness of balanced nutrition.',
                answerVi: 'Tôi tin chắc rằng các lớp học nấu ăn nên là một phần của chương trình học. Dạy trẻ cách chế biến món ăn cơ bản giúp các em tự lập hơn và nâng cao nhận thức về dinh dưỡng cân bằng.'
              },
              C1: {
                answerEn: 'Integrating practical culinary education into school curricula is highly beneficial. Not only does it equip youngsters with indispensable self-reliance for adulthood, but it also combats childhood obesity by demystifying wholesome nutrition.',
                answerVi: 'Việc tích hợp giáo dục ẩm thực thực hành vào chương trình phổ thông mang lại lợi ích to lớn. Nó không chỉ trang bị cho người trẻ khả năng tự lập không thể thiếu khi trưởng thành mà còn đẩy lùi béo phì học đường thông qua việc giúp trẻ hiểu rõ dinh dưỡng lành mạnh.'
              }
            }
          }
        ]
      },
      part1Tips: [
        'Sử dụng tính từ miêu tả sinh động khi nói về món ăn và sở thích (aromatic, nutritious, therapeutic, fulfilling).',
        'Đưa ra sự so sánh giữa các hoàn cảnh (예: Ngày thường vs. Cuối tuần; Hồi nhỏ vs. Hiện tại) để câu trả lời đạt chuẩn B2–C1.'
      ]
    },
    part2: {
      situation: 'Your class wants to buy a meaningful farewell gift for your English teacher at the end of the semester. Three options are suggested: (A) A bouquet of fresh flowers, (B) A reference book or novel, or (C) A handmade card signed by the whole class. Which gift would you choose and why?',
      situationVi: 'Lớp của bạn muốn mua một món quà chia tay ý nghĩa tặng giáo viên tiếng Anh vào cuối học kỳ. Có 3 gợi ý: (A) Một bó hoa tươi, (B) Một cuốn sách tham khảo hoặc tiểu thuyết, hoặc (C) Một tấm thiệp làm thủ công có chữ ký của cả lớp. Bạn sẽ chọn món quà nào và tại sao?',
      options: [
        {
          letter: 'A',
          title: 'Option A: A bouquet of fresh flowers (Bó hoa tươi)',
          description: 'Món quà truyền thống, rực rỡ và thích hợp để chụp ảnh kỷ niệm trên bục giảng.',
          strongPoints: 'Đẹp mắt, trang trọng và mang lại niềm vui tức thì trong buổi học cuối.',
          drawbacks: 'Hoa tươi nhanh héo chỉ sau vài ngày, không lưu giữ được lâu dài và giá khá đắt.',
          advantagesEn: ['Visually bright and celebratory for class photos', 'Traditional gesture of gratitude'],
          disadvantagesEn: ['Withers within a few days, lacking lasting value', 'Relatively expensive for temporary beauty']
        },
        {
          letter: 'B',
          title: 'Option B: A meaningful book (Một cuốn sách hay)',
          description: 'Món quà tri thức phù hợp với sở thích đọc sách của một giáo viên ngôn ngữ.',
          strongPoints: 'Bền lâu, thiết thực và thể hiện sự trân trọng đối với tâm hồn tri thức của thầy/cô.',
          drawbacks: 'Khó đoán chính xác gu đọc sách của giáo viên hoặc thầy/cô có thể đã sở hữu cuốn đó rồi.',
          advantagesEn: ['Lasting keepsake aligned with an educator’s love of reading', 'Practical and intellectually meaningful'],
          disadvantagesEn: ['Risk of buying a book the teacher already owns', 'Less collective touch than a group-made item']
        },
        {
          letter: 'C',
          title: 'Option C: A handmade card signed by the whole class (Thiệp thủ công có lời chúc cả lớp)',
          description: 'Tấm thiệp lớn do chính tay học sinh thiết kế, dán ảnh kỷ niệm và viết lời tri ân của từng thành viên.',
          strongPoints: 'Độc nhất vô nhị, chứa đựng tình cảm chân thành của tập thể, chi phí hợp lý và lưu giữ làm kỷ niệm suốt đời.',
          drawbacks: 'Đòi hỏi thời gian và sự khéo léo để cùng nhau chuẩn bị trước buổi học cuối.',
          advantagesEn: ['Deeply personal, heartfelt, and one-of-a-kind', 'Preserves collective memories and individual messages forever', 'Budget-friendly for students'],
          disadvantagesEn: ['Takes time and effort to design and collect everyone’s signatures']
        }
      ],
      requirement: 'Choose the most meaningful gift for your teacher, justify your choice with clear arguments, and explain why the other two options are less suitable.',
      sampleStrategy: 'Có thể chọn Phương án C (Handmade card) vì giá trị tinh thần độc bản và lưu giữ lời chúc của cả tập thể, hoặc Phương án B (A book) kết hợp lời đề tặng. Trong bài mẫu chuẩn này, chúng ta chọn Phương án C (A handmade card signed by the whole class) để làm nổi bật giá trị cảm xúc và kỷ niệm lâu dài.',
      usefulConnectors: [
        'Among the three thoughtful suggestions, I firmly believe a handmade card signed by the entire class is the most touching gift.',
        'What makes this option stand out is its irreplaceable sentimental value.',
        'While a bouquet of fresh flowers looks gorgeous in photos, it will unfortunately wither within a few days.',
        'Regarding a book, although it is intellectual, we might accidentally pick a title our teacher already owns.'
      ],
      usefulVocab: [
        { word: 'sentimental value', pos: 'n.', meaningVi: 'giá trị tinh thần, kỷ niệm sâu sắc' },
        { word: 'keepsake', pos: 'n.', meaningVi: 'kỷ vật lưu giữ lâu dài' },
        { word: 'wither', pos: 'v.', meaningVi: 'héo úa, tàn phai (hoa)' },
        { word: 'heartfelt gratitude', pos: 'n.', meaningVi: 'lòng biết ơn chân thành từ đáy lòng' }
      ],
      collocations: [
        { phrase: 'one-of-a-kind token of appreciation', meaningVi: 'món quà tri ân độc nhất vô nhị' },
        { phrase: 'cherish the memories for years to come', meaningVi: 'trân quý những kỷ niệm trong nhiều năm tới' }
      ],
      answerStructure: STANDARD_PART2_STEPS,
      sampleAnswers: {
        B1: {
          chosenOption: 'Option C: A handmade card signed by the whole class',
          speechEn: 'To thank our English teacher at the end of the term, I would choose a handmade card signed by the whole class. First, this gift is very special because every student can write their own wishes and thank-you messages inside. Whenever our teacher reads the card in the future, she will remember our class. Second, making a card together does not cost much money and shows our sincere effort. On the other hand, a bouquet of fresh flowers is beautiful, but flowers will die after a few days and be thrown away. As for buying a book, it is hard to know our teacher’s favorite topic, and she might already have that book at home. Therefore, a handmade card is the most meaningful gift.',
          speechVi: 'Để cảm ơn giáo viên tiếng Anh vào cuối học kỳ, tôi sẽ chọn một tấm thiệp thủ công có chữ ký của cả lớp. Thứ nhất, món quà này rất đặc biệt vì mỗi học sinh đều có thể viết lời chúc và lời cảm ơn riêng vào bên trong. Bất cứ khi nào cô giáo đọc lại tấm thiệp trong tương lai, cô sẽ nhớ đến lớp chúng tôi. Thứ hai, cùng nhau làm thiệp không tốn nhiều tiền mà lại thể hiện tâm huyết chân thành. Ngược lại, một bó hoa tươi tuy đẹp nhưng hoa sẽ héo sau vài ngày và phải bỏ đi. Còn về việc mua sách, rất khó để biết chủ đề yêu thích của cô, và có thể cô đã có sẵn cuốn sách đó ở nhà rồi. Vì vậy, thiệp làm tay là món quà ý nghĩa nhất.'
        },
        B2: {
          chosenOption: 'Option C: A handmade card signed by the whole class',
          speechEn: 'Looking at the three gift ideas for our beloved English teacher, I am convinced that a handmade card signed by the entire class is the best choice. First and foremost, a handcrafted card carries immense sentimental value. By decorating it with class photos and heartfelt handwritten notes from every student, we create a one-of-a-kind keepsake that our teacher can treasure for years. Moreover, it demonstrates genuine collective effort rather than just spending money. In contrast, although a bouquet of fresh flowers is visually appealing for farewell photos, it is short-lived and will wither within a week. As for a reference book or novel, while it suits an educator, we run the risk of purchasing a title she has already read. All things considered, the handmade card is the most memorable gesture.',
          speechVi: 'Nhìn vào ba gợi ý quà tặng dành cho giáo viên tiếng Anh kính yêu, tôi tin chắc rằng tấm thiệp thủ công có chữ ký của cả lớp là lựa chọn tuyệt vời nhất. Trước hết, một tấm thiệp làm tay mang giá trị tinh thần to lớn. Bằng cách trang trí thiệp với ảnh chụp chung của lớp và những dòng lưu bút chân thành từ mỗi học sinh, chúng ta tạo ra một kỷ vật độc nhất vô nhị mà cô có thể trân trọng suốt nhiều năm. Hơn nữa, nó thể hiện công sức tập thể chân thành chứ không chỉ đơn thuần là dùng tiền mua. Ngược lại, dù một bó hoa tươi trông rất bắt mắt khi chụp ảnh chia tay, nó lại chóng tàn và sẽ héo chỉ sau một tuần. Còn đối với sách tham khảo hay tiểu thuyết, dù hợp với nghề giáo nhưng chúng ta dễ gặp rủi ro mua trùng cuốn sách cô đã đọc rồi. Xét mọi khía cạnh, thiệp thủ công là nghĩa cử đáng nhớ nhất.'
        },
        C1: {
          chosenOption: 'Option C: A handmade card signed by the whole class',
          speechEn: 'When selecting a farewell token of appreciation for a dedicated English educator, emotional resonance far outweighs monetary price, which is why I wholeheartedly advocate crafting a handmade card signed by the entire class. Primarily, a bespoke card serves as an enduring keepsake encapsulating the unique bond between our teacher and each individual student. Reading personalized expressions of gratitude in English will undoubtedly fill our teacher with pride in our linguistic progress. Conversely, while a floral bouquet offers immediate aesthetic charm, its ephemeral nature means it will inevitably wilt within days, leaving no permanent memento. Similarly, gifting a book, though intellectually respectable, involves guesswork regarding the teacher’s literary preferences and existing collection. Consequently, a collaboratively designed card stands as the most authentic and timeless tribute.',
          speechVi: 'Khi lựa chọn một món quà tri ân chia tay dành cho người giáo viên tiếng Anh tận tụy, sự đồng điệu cảm xúc vượt xa giá trị vật chất, và đó là lý do tôi hoàn toàn ủng hộ việc làm một tấm thiệp thủ công có chữ ký của toàn thể lớp. Trước tiên, một tấm thiệp thiết kế riêng đóng vai trò như kỷ vật bền vững gói gọn sợi dây gắn kết độc đáo giữa giáo viên và từng học sinh. Đọc những lời tri ân cá nhân hóa viết bằng tiếng Anh chắc chắn sẽ khiến thầy cô tự hào về sự tiến bộ ngôn ngữ của học trò. Ngược lại, dù bó hoa tươi mang lại vẻ đẹp thẩm mỹ tức thì, bản chất chóng tàn khiến nó khó tránh khỏi việc héo úa sau vài ngày mà không để lại kỷ niệm lâu dài. Tương tự, tặng sách dù trang nhã về mặt tri thức nhưng lại mang tính phỏng đoán về gu văn học cũng như tủ sách sẵn có của giáo viên. Do đó, tấm thiệp do cả lớp cùng thiết kế là món quà tri ân chân thực và vượt thời gian nhất.'
        }
      }
    }
  },
  3: {
    setCode: 'SET 003',
    part1: {
      topic1: {
        title: 'Friends and Friendship',
        titleVi: 'Bạn bè & Tình bạn',
        questions: [
          'Do you prefer having a large circle of friends or just a few close friends?',
          'What qualities do you value most in a best friend?',
          'How do you maintain friendships when you and your friends are busy?'
        ],
        usefulVocab: [
          { word: 'trustworthy', pos: 'adj.', meaningVi: 'đáng tin cậy' },
          { word: 'empathetic', pos: 'adj.', meaningVi: 'biết thấu cảm, lắng nghe' },
          { word: 'confide in', pos: 'v.', meaningVi: 'tâm sự, giãi bày nỗi niềm' },
          { word: 'superficial', pos: 'adj.', meaningVi: 'hời hợt, xã giao bề nổi' }
        ],
        collocations: [
          { phrase: 'through thick and thin', meaningVi: 'đồng cam cộng khổ, lúc vui cũng như lúc buồn' },
          { phrase: 'tight-knit circle of confidants', meaningVi: 'nhóm nhỏ những người bạn tri kỷ gắn bó' },
          { phrase: 'keep in touch regularly', meaningVi: 'giữ liên lạc thường xuyên' }
        ],
        bilingualQuestions: [
          {
            questionEn: 'Do you prefer having a large circle of friends or just a few close friends?',
            questionVi: 'Bạn thích có một vòng tròn bạn bè rộng lớn hay chỉ một vài người bạn thân?',
            suggestedIdeas: [
              'Ưu tiên một vài người bạn tri kỷ thực sự thấu hiểu và có thể tin tưởng tuyệt đối',
              'Chất lượng tình bạn quan trọng hơn số lượng mối quan hệ xã giao'
            ],
            samples: {
              B1: {
                answerEn: 'I prefer having a few close friends rather than many normal friends. With close friends, I can share my secrets and feelings comfortably, and they are always ready to help me.',
                answerVi: 'Tôi thích có một vài người bạn thân hơn là nhiều người bạn xã giao. Với bạn thân, tôi có thể thoải mái chia sẻ bí mật cũng như cảm xúc của mình, và họ luôn sẵn sàng giúp đỡ tôi.'
              },
              B2: {
                answerEn: 'I definitely value quality over quantity when it comes to friendship. Having a small circle of three or four close confidants allows me to build deep, meaningful bonds rather than maintaining dozens of superficial acquaintances.',
                answerVi: 'Tôi chắc chắn đề cao chất lượng hơn số lượng khi xét đến tình bạn. Có một nhóm nhỏ ba hoặc bốn người bạn tri kỷ cho phép tôi xây dựng sự gắn kết sâu sắc, ý nghĩa thay vì duy trì hàng chục mối quan hệ xã giao hời hợt.'
              },
              C1: {
                answerEn: 'While a broad network of acquaintances is advantageous for social versatility, I gravitate toward cultivating an intimate circle of lifelong friends who stand by me through thick and thin with unconditional candor.',
                answerVi: 'Mặc dù mạng lưới quen biết rộng mang lại lợi thế cho sự linh hoạt xã hội, tôi vẫn nghiêng về việc vun đắp một nhóm nhỏ những người bạn tri kỷ trọn đời, những người luôn sát cánh bên tôi lúc thăng trầm với sự chân thành vô điều kiện.'
              }
            }
          },
          {
            questionEn: 'What qualities do you value most in a best friend?',
            questionVi: 'Bạn trân trọng những phẩm chất nào nhất ở một người bạn thân?',
            suggestedIdeas: [
              'Sự trung thực, đáng tin cậy (honesty & trustworthiness)',
              'Sự thấu cảm, biết lắng nghe mà không phán xét (empathy & non-judgmental listening)'
            ],
            samples: {
              B1: {
                answerEn: 'For me, honesty and kindness are the most important qualities. A true friend will always tell me the truth and support me when I have difficulties in life.',
                answerVi: 'Đối với tôi, sự trung thực và lòng tốt là những phẩm chất quan trọng nhất. Một người bạn thực sự sẽ luôn nói thật với tôi và ủng hộ tôi khi tôi gặp khó khăn trong cuộc sống.'
              },
              B2: {
                answerEn: 'Above all, I prize trustworthiness and empathy. Knowing that I can confide my vulnerabilities in a friend without fear of judgment or gossip is the foundation of any lasting friendship.',
                answerVi: 'Trên hết, tôi trân trọng sự đáng tin cậy và lòng thấu cảm. Biết rằng mình có thể giãi bày những góc yếu đuối với bạn mà không sợ bị phán xét hay bàn tán chính là nền tảng của mọi tình bạn bền vững.'
              },
              C1: {
                answerEn: 'Integrity and emotional reciprocity are paramount in my eyes. An authentic friend not only celebrates your triumphs without envy but also offers constructive honesty when you lose your way.',
                answerVi: 'Sự chính trực và sự đồng điệu cảm xúc từ hai phía là tối quan trọng trong mắt tôi. Một người bạn chân chính không chỉ mừng cho thành công của bạn mà không chút đố kỵ, mà còn đưa ra những lời khuyên thẳng thắn mang tính xây dựng khi bạn lạc hướng.'
              }
            }
          },
          {
            questionEn: 'How do you maintain friendships when you and your friends are busy?',
            questionVi: 'Bạn duy trì tình bạn như thế nào khi cả bạn và bạn bè đều bận rộn?',
            suggestedIdeas: [
              'Nhắn tin hỏi thăm ngắn gọn hoặc gọi video định kỳ mỗi cuối tuần',
              'Lên lịch hẹn cà phê hoặc ăn tối định kỳ mỗi tháng một lần'
            ],
            samples: {
              B1: {
                answerEn: 'Even when we are busy with study or work, we send messages in our group chat every day. We also try to meet at a coffee shop once a month to talk.',
                answerVi: 'Ngay cả khi bận học hay làm việc, chúng tôi vẫn gửi tin nhắn trong nhóm chat mỗi ngày. Chúng tôi cũng cố gắng gặp nhau ở quán cà phê mỗi tháng một lần để trò chuyện.'
              },
              B2: {
                answerEn: 'Despite our hectic schedules, we make a conscious effort to stay connected through voice notes and memes during the week, and we schedule a monthly dinner catch-up that nobody misses.',
                answerVi: 'Bất chấp lịch trình bận rộn, chúng tôi luôn chủ động giữ kết nối qua tin nhắn thoại và những bức ảnh vui trong tuần, đồng thời lên lịch một buổi ăn tối hàn huyên mỗi tháng mà không ai vắng mặt.'
              },
              C1: {
                answerEn: 'Sustaining adult friendships amidst demanding careers requires intentionality. My friends and I prioritize quality check-ins via video calls and honor quarterly weekend retreats to preserve the depth of our camaraderie.',
                answerVi: 'Duy trì tình bạn khi trưởng thành giữa công việc bận rộn đòi hỏi sự chủ tâm. Tôi và bạn bè ưu tiên những cuộc trò chuyện chất lượng qua video call và duy trì các chuyến đi ngắn ngày mỗi quý để giữ trọn chiều sâu của tình bằng hữu.'
              }
            }
          }
        ]
      },
      topic2: {
        title: 'Festivals and Celebrations',
        titleVi: 'Lễ hội & Các dịp kỷ niệm',
        questions: [
          'What is the most important traditional festival in your country?',
          'How do people in your family usually celebrate Lunar New Year (Tet)?',
          'Do you think traditional festivals are losing their meaning among young people?'
        ],
        usefulVocab: [
          { word: 'reunion', pos: 'n.', meaningVi: 'sự đoàn tụ, sum họp gia đình' },
          { word: 'ancestors', pos: 'n.', meaningVi: 'tổ tiên, ông bà' },
          { word: 'commercialized', pos: 'adj.', meaningVi: 'bị thương mại hóa' },
          { word: 'customs', pos: 'n.', meaningVi: 'phong tục tập quán' }
        ],
        collocations: [
          { phrase: 'family reunion dinner', meaningVi: 'bữa cơm tất niên đoàn viên' },
          { phrase: 'pay homage to ancestors', meaningVi: 'thành kính tưởng nhớ tổ tiên' },
          { phrase: 'preserve cultural identity', meaningVi: 'gìn giữ bản sắc văn hóa' }
        ],
        bilingualQuestions: [
          {
            questionEn: 'What is the most important traditional festival in your country?',
            questionVi: 'Lễ hội truyền thống quan trọng nhất ở đất nước bạn là gì?',
            suggestedIdeas: [
              'Tết Nguyên Đán (Lunar New Year / Tet Holiday) đánh dấu sự khởi đầu của mùa xuân mới',
              'Dịp để mọi người sum họp gia đình và tri ân tổ tiên'
            ],
            samples: {
              B1: {
                answerEn: 'The most important festival in Vietnam is Tet, or Lunar New Year. It usually takes place in late January or early February, and everyone gets a week off to go home to their families.',
                answerVi: 'Lễ hội quan trọng nhất ở Việt Nam là Tết Nguyên Đán. Tết thường diễn ra vào cuối tháng Một hoặc đầu tháng Hai, và mọi người đều được nghỉ một tuần để về quê sum họp gia đình.'
              },
              B2: {
                answerEn: 'Without a doubt, Tet or the Lunar New Year is the grandest celebration in Vietnam. It symbolizes renewal, gratitude to ancestors, and the cherished opportunity for family reunions after a year of hard work.',
                answerVi: 'Không nghi ngờ gì nữa, Tết Nguyên Đán là dịp lễ trọng đại nhất tại Việt Nam. Tết tượng trưng cho sự khởi đầu mới, lòng biết ơn tổ tiên và cơ hội quý giá để gia đình đoàn tụ sau một năm lao động vất vả.'
              },
              C1: {
                answerEn: 'Tet Nguyen Dan stands as the cornerstone of Vietnamese cultural and spiritual life. Marking the arrival of spring on the lunisolar calendar, it is a sacred period of familial homecoming, ancestral veneration, and collective optimism.',
                answerVi: 'Tết Nguyên Đán là trụ cột trong đời sống văn hóa và tâm linh của người Việt. Đánh dấu mùa xuân về theo lịch âm dương, đây là khoảng thời gian thiêng liêng của sự trở về sum họp gia đình, thờ cúng tổ tiên và niềm lạc quan chung của cộng đồng.'
              }
            }
          },
          {
            questionEn: 'How do people in your family usually celebrate Lunar New Year (Tet)?',
            questionVi: 'Gia đình bạn thường đón Tết Nguyên Đán như thế nào?',
            suggestedIdeas: [
              'Trang trí nhà cửa bằng hoa đào, hoa mai, cùng gói bánh chưng và ăn bữa cơm tất niên',
              'Đi chúc Tết họ hàng và trao phong bao lì xì đỏ may mắn đầu năm'
            ],
            samples: {
              B1: {
                answerEn: 'Before Tet, my family cleans and decorates the house with peach blossoms. On New Year’s Eve, we eat a big dinner together and watch fireworks. On the first day, we visit relatives and give lucky money to children.',
                answerVi: 'Trước Tết, gia đình tôi dọn dẹp và trang trí nhà cửa bằng hoa đào. Vào đêm Giao thừa, chúng tôi ăn bữa cơm lớn cùng nhau và xem pháo hoa. Ngày mồng một, chúng tôi đi thăm họ hàng và mừng tuổi cho trẻ nhỏ.'
              },
              B2: {
                answerEn: 'Our family upholds heartwarming traditions every Tet. Days beforehand, we tidy our home and prepare Chung cake together. Once the New Year arrives, we pay homage to our ancestors, exchange red envelopes for good fortune, and visit extended relatives.',
                answerVi: 'Gia đình tôi luôn gìn giữ những truyền thống ấm áp mỗi dịp Tết đến. Nhiều ngày trước Tết, chúng tôi dọn nhà và cùng gói bánh chưng. Khi năm mới gõ cửa, chúng tôi dâng hương tưởng nhớ tổ tiên, trao nhau phong bao lì xì may mắn và đi chúc Tết họ hàng.'
              },
              C1: {
                answerEn: 'Our Tet observance blends solemn ritual with festive warmth. We adorn the ancestral altar with five-fruit trays and blossom branches, gather for a sumptuous New Year’s Eve reunion banquet, and spend the ensuing days exchanging auspicious blessings across generations.',
                answerVi: 'Phong tục đón Tết của gia đình tôi hòa quyện giữa nghi lễ trang nghiêm và sự ấm áp lễ hội. Chúng tôi bày biện bàn thờ gia tiên với mâm ngũ quả và cành hoa xuân, quây quần bên bữa tiệc tất niên thịnh soạn và dành những ngày đầu năm trao nhau lời chúc cát tường giữa các thế hệ.'
              }
            }
          },
          {
            questionEn: 'Do you think traditional festivals are losing their meaning among young people?',
            questionVi: 'Bạn có nghĩ các lễ hội truyền thống đang dần mất đi ý nghĩa đối với giới trẻ không?',
            suggestedIdeas: [
              'Cách thức đón lễ có thể hiện đại hơn (đi du lịch, chụp ảnh áo dài truyền thống)',
              'Nhưng giá trị cốt lõi về tình thân và lòng tự hào văn hóa vẫn được người trẻ trân trọng'
            ],
            samples: {
              B1: {
                answerEn: 'I do not think so. Although some young people like traveling during holidays, most of them still love wearing traditional Ao Dai and spending time with their parents during Tet.',
                answerVi: 'Tôi không nghĩ vậy. Mặc dù một số bạn trẻ thích đi du lịch vào dịp lễ, phần lớn các bạn vẫn rất thích mặc Áo dài truyền thống và dành thời gian bên bố mẹ trong dịp Tết.'
              },
              B2: {
                answerEn: 'While festivals have become somewhat commercialized, I don’t believe young people are losing touch with their roots. In fact, there is a growing trend among youth to wear traditional costumes and promote heritage festivals on social media.',
                answerVi: 'Mặc dù các lễ hội đã phần nào bị thương mại hóa, tôi không tin rằng giới trẻ đang đánh mất cội nguồn. Thực tế, ngày càng có xu hướng mạnh mẽ trong giới trẻ mặc cổ phục truyền thống và quảng bá lễ hội di sản trên mạng xã hội.'
              },
              C1: {
                answerEn: 'Rather than eroding in significance, traditional festivals are undergoing a cultural renaissance among younger cohorts. While simplified rituals have replaced tedious formalities, youths actively reinterpret heritage through contemporary photography and cultural tourism.',
                answerVi: 'Thay vì mai một ý nghĩa, các lễ hội truyền thống đang trải qua một sự phục hưng văn hóa trong thế hệ trẻ. Dù các nghi thức giản lược đã thay thế những thủ tục rườm rà, người trẻ vẫn chủ động tái hiện di sản thông qua nhiếp ảnh đương đại và du lịch văn hóa.'
              }
            }
          }
        ]
      },
      part1Tips: [
        'Tận dụng các thuật ngữ văn hóa Việt Nam kèm lời giải thích ngắn bằng tiếng Anh (e.g., "Chung cake, a traditional square glutinous rice cake...").',
        'Thể hiện góc nhìn cân bằng giữa truyền thống và hiện đại ở câu hỏi số 3.'
      ]
    },
    part2: {
      situation: 'Your university class is planning a one-day weekend trip together to strengthen class bonding. Three destinations are proposed: (A) A national history museum, (B) A sandy beach, or (C) A national park in the mountains. Which destination would you choose and why?',
      situationVi: 'Lớp đại học của bạn đang lên kế hoạch cho chuyến dã ngoại 1 ngày vào cuối tuần để gắn kết tập thể. Có 3 địa điểm được đề xuất: (A) Bảo tàng lịch sử quốc gia, (B) Bãi biển cát trắng, hoặc (C) Vườn quốc gia trên núi. Bạn sẽ chọn điểm đến nào và tại sao?',
      options: [
        {
          letter: 'A',
          title: 'Option A: A history museum (Bảo tàng lịch sử)',
          description: 'Tham quan các hiện vật lịch sử, tìm hiểu văn hóa dân tộc trong không gian trưng bày.',
          strongPoints: 'Giàu tính giáo dục, chi phí vé vào cửa rẻ và không phụ thuộc vào thời tiết nắng mưa.',
          drawbacks: 'Phải giữ trật tự trong bảo tàng nên không thể tổ chức trò chơi tập thể (team-building) sôi động.',
          advantagesEn: ['Educational and inexpensive entry tickets', 'Indoors and unaffected by rain or heat'],
          disadvantagesEn: ['Strict quiet rules prevent lively team-building games', 'Some students may find it too academic for a weekend break']
        },
        {
          letter: 'B',
          title: 'Option B: A sandy beach (Bãi biển)',
          description: 'Không gian biển rộng mở, thoáng đãng, lý tưởng cho các trò chơi vận động tập thể và tiệc hải sản.',
          strongPoints: 'Rất phù hợp để tổ chức team-building, tắm biển, chụp ảnh kỷ yếu và xả stress sau giờ học.',
          drawbacks: 'Cần chú ý an toàn khi bơi lội và bôi kem chống nắng nếu trời nắng gắt.',
          advantagesEn: ['Spacious open area ideal for team-building games and sports', 'Refreshing sea breeze and great seafood dining', 'Appeals to almost every student in the class'],
          disadvantagesEn: ['Can be hot at midday without shade']
        },
        {
          letter: 'C',
          title: 'Option C: A national park (Vườn quốc gia)',
          description: 'Leo núi, đi bộ xuyên rừng (trekking) và cắm trại giữa thiên nhiên hoang dã.',
          strongPoints: 'Không khí rừng núi trong lành, cảnh sắc thiên nhiên hùng vĩ.',
          drawbacks: 'Đòi hỏi thể lực cao khi leo núi, những bạn sức khỏe yếu dễ bị mệt mỏi hoặc chấn thương, và có côn trùng.',
          advantagesEn: ['Fresh forest air and scenic nature trails', 'Good for eco-lovers and camping'],
          disadvantagesEn: ['Physically exhausting trekking for less athletic classmates', 'Risks of insect bites or sudden mountain rain']
        }
      ],
      requirement: 'Choose the best destination for your one-day class trip, explain your reasons, and compare it with the other two options.',
      sampleStrategy: 'Chọn Phương án B (A sandy beach) vì mục tiêu chính của chuyến đi là gắn kết tập thể (class bonding) qua các trò chơi team-building sôi động và thư giãn. Phản biện Phương án A (History museum) vì quá nghiêm túc, không hò reo chơi trò chơi được; phản biện Phương án C (National park) vì leo núi đòi hỏi thể lực cao không phù hợp với tất cả thành viên.',
      usefulConnectors: [
        'With the primary goal of strengthening class camaraderie, a day trip to the beach is undoubtedly the superior choice.',
        'First and foremost, the wide shoreline provides an ideal arena for energetic team-building activities.',
        'Regarding the history museum, while informative, its strict silence policy makes group bonding virtually impossible.',
        'As for the national park, arduous mountain trekking might exhaust classmates who are not physically fit.'
      ],
      usefulVocab: [
        { word: 'camaraderie', pos: 'n.', meaningVi: 'tình bạn thân thiết, sự gắn kết đồng đội' },
        { word: 'team-building', pos: 'n.', meaningVi: 'hoạt động xây dựng tinh thần đồng đội' },
        { word: 'arduous', pos: 'adj.', meaningVi: 'vất vả, đòi hỏi nhiều thể lực' },
        { word: 'rejuvenating', pos: 'adj.', meaningVi: 'giúp phục hồi năng lượng, sảng khoái' }
      ],
      collocations: [
        { phrase: 'foster class solidarity', meaningVi: 'thắt chặt tình đoàn kết của lớp' },
        { phrase: 'inclusive for all fitness levels', meaningVi: 'phù hợp cho mọi mức độ thể lực' }
      ],
      answerStructure: STANDARD_PART2_STEPS,
      sampleAnswers: {
        B1: {
          chosenOption: 'Option B: A sandy beach',
          speechEn: 'For our one-day class trip this weekend, I believe going to the beach is the best choice. First, the beach has a large space where our whole class can play fun team-building games like tug-of-war and beach volleyball together. This will help us become closer friends. Second, after a stressful week at school, swimming in the sea and eating fresh seafood together is very relaxing. On the other hand, a history museum is too quiet, so we cannot laugh loudly or play group games there. As for a national park, climbing mountains all day is too tiring for some students who are not strong at sports. Therefore, the beach is the most enjoyable destination for everyone.',
          speechVi: 'Cho chuyến dã ngoại một ngày của lớp vào cuối tuần này, tôi tin rằng đi biển là lựa chọn tuyệt vời nhất. Thứ nhất, bãi biển có không gian rộng lớn nơi cả lớp có thể cùng nhau chơi các trò chơi tập thể vui nhộn như kéo co và bóng chuyền bãi biển. Điều này sẽ giúp chúng tôi gắn kết hơn. Thứ hai, sau một tuần học tập căng thẳng, tắm biển và cùng thưởng thức hải sản tươi ngon vô cùng thư giãn. Ngược lại, bảo tàng lịch sử quá yên tĩnh nên chúng tôi không thể cười đùa thoải mái hay chơi trò chơi nhóm ở đó. Còn về vườn quốc gia, leo núi cả ngày quá mệt đối với một số bạn không khỏe về thể thao. Vì vậy, bãi biển là điểm đến thú vị nhất cho tất cả mọi người.'
        },
        B2: {
          chosenOption: 'Option B: A sandy beach',
          speechEn: 'Since the main objective of our weekend excursion is to foster class bonding, I strongly advocate choosing the beach as our destination. To begin with, the expansive sandy shore offers the perfect venue for interactive team-building games such as relay races and tug-of-war, which actively encourage teamwork and laughter. Furthermore, the coastal atmosphere allows everyone to unwind at their own pace—whether swimming, taking group photos, or sharing a seafood barbecue. In contrast, while a history museum has educational value, it requires visitors to stay quiet, leaving little room for social interaction. Meanwhile, trekking in a national park can be physically demanding and might exclude classmates with lower stamina. Thus, a beach trip guarantees an inclusive and unforgettable day.',
          speechVi: 'Vì mục tiêu chính của chuyến dã ngoại cuối tuần là thắt chặt tình đoàn kết của lớp, tôi hoàn toàn ủng hộ việc chọn bãi biển làm điểm đến. Đầu tiên, bờ cát rộng mênh mông mang lại không gian hoàn hảo cho các trò chơi team-building tương tác như chạy tiếp sức và kéo co, giúp khích lệ tinh thần đồng đội và tiếng cười. Hơn nữa, không khí miền biển cho phép mọi người thư giãn theo cách riêng—dù là bơi lội, chụp ảnh tập thể hay cùng thưởng thức tiệc nướng hải sản. Ngược lại, dù bảo tàng lịch sử có giá trị giáo dục, nơi đây đòi hỏi khách tham quan phải giữ trật tự nên rất ít cơ hội tương tác sôi nổi. Trong khi đó, đi bộ xuyên rừng ở vườn quốc gia khá tốn sức và có thể không phù hợp với những bạn thể lực yếu. Do đó, chuyến đi biển đảm bảo một ngày vui trọn vẹn cho tất cả mọi người.'
        },
        C1: {
          chosenOption: 'Option B: A sandy beach',
          speechEn: 'To maximize collective camaraderie during a single-day university excursion, a coastal getaway to a sandy beach is unequivocally the most versatile and inclusive option. Primarily, the open shoreline serves as a natural amphitheater for dynamic team-building competitions, which break down social barriers and forge lasting peer solidarity. Moreover, the rejuvenating sea breeze offers a welcome respite from academic pressure, catering simultaneously to thrill-seekers and those who simply wish to lounge by the waves. Conversely, although a history museum enriches cultural literacy, its solemn, hushed environment is fundamentally incompatible with lively group bonding. Likewise, a mountainous national park entails arduous hiking that risks exhausting less athletic students and exposing the group to mosquitoes or erratic weather. Ultimately, the beach strikes the ideal balance between recreation and inclusivity.',
          speechVi: 'Để tối ưu hóa sự gắn kết tập thể trong chuyến dã ngoại một ngày của lớp đại học, một chuyến đi tới bãi biển cát trắng chắc chắn là phương án linh hoạt và toàn diện nhất. Trước hết, bờ biển rộng mở đóng vai trò như một sân chơi tự nhiên cho các cuộc thi team-building sôi động, giúp xóa nhòa khoảng cách giao tiếp và hun đúc tình đoàn kết bền chặt. Hơn nữa, làn gió biển sảng khoái mang lại sự giải tỏa tuyệt vời khỏi áp lực học hành, đáp ứng đồng thời cả những bạn ưa vận động lẫn những ai chỉ muốn thư giãn bên sóng nước. Ngược lại, dù bảo tàng lịch sử làm giàu kiến thức văn hóa, không gian trang nghiêm yên tĩnh tại đây hoàn toàn không phù hợp để khuấy động tinh thần tập thể. Tương tự, vườn quốc gia trên núi đòi hỏi việc leo dốc vất vả, dễ làm kiệt sức những sinh viên ít vận động và tiềm ẩn nguy cơ côn trùng đốt hay thời tiết thất thường. Tóm lại, bãi biển tạo nên sự cân bằng lý tưởng giữa giải trí và tính gắn kết.'
        }
      }
    }
  },
  4: {
    setCode: 'SET 004',
    part1: {
      topic1: {
        title: 'Health and Exercise',
        titleVi: 'Sức khỏe & Tập luyện thể chất',
        questions: [
          'What do you usually do to keep fit and stay healthy?',
          'Why do many people nowadays suffer from stress and lifestyle diseases?',
          'What can governments or schools do to encourage people to exercise more?'
        ],
        usefulVocab: [
          { word: 'sedentary', pos: 'adj.', meaningVi: 'ít vận động, ngồi nhiều' },
          { word: 'cardiovascular', pos: 'adj.', meaningVi: 'thuộc về hệ tim mạch' },
          { word: 'wholesome', pos: 'adj.', meaningVi: 'lành mạnh, tốt cho sức khỏe' },
          { word: 'stamina', pos: 'n.', meaningVi: 'sức bền, thể lực dẻo dai' }
        ],
        collocations: [
          { phrase: 'maintain a balanced diet', meaningVi: 'duy trì chế độ ăn uống cân bằng' },
          { phrase: 'sedentary office lifestyle', meaningVi: 'lối sống văn phòng ít vận động' },
          { phrase: 'public recreational facilities', meaningVi: 'cơ sở vật chất thể thao công cộng' }
        ],
        bilingualQuestions: [
          {
            questionEn: 'What do you usually do to keep fit and stay healthy?',
            questionVi: 'Bạn thường làm gì để giữ dáng và duy trì sức khỏe?',
            suggestedIdeas: [
              'Tập thể dục ít nhất 30 phút mỗi ngày (chạy bộ, tập gym hoặc yoga)',
              'Uống đủ 2 lít nước, hạn chế đồ ăn nhanh nhiều đường mỡ và ngủ đủ 7–8 tiếng'
            ],
            samples: {
              B1: {
                answerEn: 'To stay healthy, I go jogging in the park three times a week and eat plenty of vegetables and fruits. I also try to sleep before 11 p.m. every night.',
                answerVi: 'Để giữ gìn sức khỏe, tôi đi bộ chạy chậm ở công viên ba lần một tuần và ăn nhiều rau củ quả. Tôi cũng cố gắng đi ngủ trước 11 giờ đêm mỗi ngày.'
              },
              B2: {
                answerEn: 'I follow a holistic approach to wellness by combining regular cardiovascular workouts with a balanced diet. Specifically, I swim twice a week, cut down on sugary beverages, and ensure I get seven hours of quality sleep.',
                answerVi: 'Tôi theo đuổi phương pháp chăm sóc sức khỏe toàn diện bằng cách kết hợp các bài tập tim mạch đều đặn với chế độ ăn cân bằng. Cụ thể, tôi đi bơi hai lần một tuần, cắt giảm đồ uống có đường và đảm bảo ngủ đủ 7 tiếng chất lượng.'
              },
              C1: {
                answerEn: 'Maintaining peak physical condition requires consistency; hence, I integrate high-intensity interval training into my weekly regimen alongside a nutrient-dense diet rich in whole grains and lean proteins, which fortifies both my immunity and mental stamina.',
                answerVi: 'Duy trì thể trạng đỉnh cao đòi hỏi sự kiên trì; do đó, tôi kết hợp các bài tập cường độ cao ngắt quãng vào lịch trình hằng tuần cùng chế độ ăn giàu dưỡng chất từ ngũ cốc nguyên hạt và đạm lành mạnh, giúp củng cố cả hệ miễn dịch lẫn sức bền tinh thần.'
              }
            }
          },
          {
            questionEn: 'Why do many people nowadays suffer from stress and lifestyle diseases?',
            questionVi: 'Tại sao ngày nay nhiều người mắc chứng căng thẳng và các bệnh do lối sống?',
            suggestedIdeas: [
              'Áp lực công việc cạnh tranh và thói quen ngồi trước màn hình máy tính suốt 8–10 tiếng',
              'Lạm dụng thức ăn nhanh chế biến sẵn và thiếu thời gian vận động ngoài trời'
            ],
            samples: {
              B1: {
                answerEn: 'I think it is because people work too hard and sit in front of computers all day. Also, many people eat too much fast food instead of cooking healthy meals.',
                answerVi: 'Tôi nghĩ đó là vì mọi người làm việc quá vất vả và ngồi trước máy tính cả ngày. Ngoài ra, nhiều người ăn quá nhiều đồ ăn nhanh thay vì nấu các bữa ăn lành mạnh.'
              },
              B2: {
                answerEn: 'The primary culprits are sedentary office routines and relentless career pressure. Many urban residents spend ten hours a day sitting at a desk and rely on ultra-processed convenience food, leading to obesity and chronic fatigue.',
                answerVi: 'Thủ phạm chính là thói quen văn phòng ít vận động và áp lực sự nghiệp không ngừng nghỉ. Nhiều cư dân đô thị dành 10 tiếng mỗi ngày ngồi bên bàn làm việc và phụ thuộc vào thực phẩm chế biến sẵn, dẫn đến béo phì và mệt mỏi mãn tính.'
              },
              C1: {
                answerEn: 'Modern chronic ailments stem largely from the convergence of hyper-competitive work cultures and sedentary digital lifestyles. Perpetual connectivity erodes restorative rest, while the ubiquity of calorie-dense fast food accelerates metabolic disorders.',
                answerVi: 'Các căn bệnh mãn tính hiện đại bắt nguồn phần lớn từ sự giao thoa giữa văn hóa làm việc cạnh tranh khốc liệt và lối sống số ít vận động. Sự kết nối liên tục bào mòn giấc ngủ phục hồi, trong khi sự phổ biến của đồ ăn nhanh giàu calo làm gia tăng các rối loạn chuyển hóa.'
              }
            }
          },
          {
            questionEn: 'What can governments or schools do to encourage people to exercise more?',
            questionVi: 'Chính phủ hoặc nhà trường có thể làm gì để khuyến khích mọi người tập thể dục nhiều hơn?',
            suggestedIdeas: [
              'Xây thêm công viên xanh, đường chạy bộ và lắp đặt dụng cụ tập thể dục miễn phí ngoài trời',
              'Trường học tổ chức các câu lạc bộ thể thao đa dạng thay vì chỉ học lý thuyết'
            ],
            samples: {
              B1: {
                answerEn: 'Governments can build more public parks with free exercise machines. Schools should organize more fun sports clubs like football, badminton, and swimming for students.',
                answerVi: 'Chính phủ có thể xây thêm nhiều công viên công cộng có máy tập thể dục miễn phí. Trường học nên tổ chức thêm các câu lạc bộ thể thao vui nhộn như bóng đá, cầu lông và bơi lội cho học sinh.'
              },
              B2: {
                answerEn: 'Municipalities should invest in accessible green parks, pedestrian walkways, and free outdoor fitness zones. Meanwhile, schools can reform physical education by offering diverse sports clubs that spark lifelong athletic habits.',
                answerVi: 'Chính quyền đô thị nên đầu tư vào các công viên xanh dễ tiếp cận, đường đi bộ và khu tập thể dục ngoài trời miễn phí. Trong khi đó, trường học có thể đổi mới môn thể dục bằng cách mở các câu lạc bộ thể thao đa dạng nhằm khơi dậy thói quen vận động suốt đời.'
              },
              C1: {
                answerEn: 'Authorities ought to spearhead urban planning initiatives that prioritize cycling lanes and subsidized community sports complexes, while educational institutions must embed experiential wellness programs into their curricula to cultivate a culture of preventative health.',
                answerVi: 'Các cơ quan chức năng cần đi đầu trong các sáng kiến quy hoạch đô thị ưu tiên làn đường xe đạp và khu liên hợp thể thao cộng đồng được trợ giá, đồng thời các cơ sở giáo dục phải đưa chương trình rèn luyện sức khỏe trải nghiệm vào giảng dạy để xây dựng văn hóa y tế dự phòng.'
              }
            }
          }
        ]
      },
      topic2: {
        title: 'Weather and Seasons',
        titleVi: 'Thời tiết & Các mùa trong năm',
        questions: [
          'What is your favorite season of the year, and why?',
          'Does the weather affect your mood and daily productivity?',
          'How do people in your country cope with extreme summer heat?'
        ],
        usefulVocab: [
          { word: 'breeze', pos: 'n.', meaningVi: 'làn gió nhẹ mát mẻ' },
          { word: 'scorching', pos: 'adj.', meaningVi: 'nóng như thiêu đốt' },
          { word: 'gloomy', pos: 'adj.', meaningVi: 'u ám, ảm đạm (trời mưa/mây mù)' },
          { word: 'foliage', pos: 'n.', meaningVi: 'tán lá cây đổi màu vào mùa thu' }
        ],
        collocations: [
          { phrase: 'crisp autumn breeze', meaningVi: 'làn gió thu se lạnh trong lành' },
          { phrase: 'scorching summer heatwave', meaningVi: 'đợt nắng nóng mùa hè gay gắt' },
          { phrase: 'lift my spirits', meaningVi: 'làm phấn chấn tinh thần' }
        ],
        bilingualQuestions: [
          {
            questionEn: 'What is your favorite season of the year, and why?',
            questionVi: 'Mùa yêu thích nhất trong năm của bạn là mùa nào, và tại sao?',
            suggestedIdeas: [
              'Mùa thu vì tiết trời mát mẻ, dễ chịu, bầu trời trong xanh và không quá nóng hay quá lạnh',
              'Thích hợp để đi dạo phố, chụp ảnh và thưởng thức cà phê ngoài trời'
            ],
            samples: {
              B1: {
                answerEn: 'My favorite season is autumn. The weather is cool and pleasant, with sunny skies and a gentle wind. It is the best time to go for a walk outdoors.',
                answerVi: 'Mùa yêu thích của tôi là mùa thu. Thời tiết mát mẻ và dễ chịu, bầu trời nắng nhẹ cùng làn gió dịu dàng. Đó là thời điểm tuyệt nhất để đi dạo ngoài trời.'
              },
              B2: {
                answerEn: 'I am particularly fond of autumn. After the scorching heat of summer, the crisp autumn breeze and golden foliage create a romantic atmosphere that is ideal for outdoor strolls and photography.',
                answerVi: 'Tôi đặc biệt yêu thích mùa thu. Sau cái nắng gay gắt của mùa hè, làn gió thu se lạnh và sắc lá vàng tạo nên bầu không khí lãng mạn, vô cùng lý tưởng để dạo phố và chụp ảnh.'
              },
              C1: {
                answerEn: 'Autumn holds an unmatched allure for me due to its temperate climate and serene aesthetic. The transition from oppressive summer humidity to mild, sunlit days invigorates my energy and inspires outdoor contemplation.',
                answerVi: 'Mùa thu luôn có sức quyến rũ không gì sánh bằng đối với tôi nhờ khí hậu ôn hòa và vẻ đẹp thanh bình. Sự chuyển giao từ cái nóng ẩm oi bức của mùa hè sang những ngày nắng dịu dàng giúp tiếp thêm sinh lực và khơi gợi cảm hứng chiêm nghiệm ngoài trời.'
              }
            }
          },
          {
            questionEn: 'Does the weather affect your mood and daily productivity?',
            questionVi: 'Thời tiết có ảnh hưởng đến tâm trạng và năng suất hằng ngày của bạn không?',
            suggestedIdeas: [
              'Những ngày nắng đẹp, mát mẻ giúp tinh thần hứng khởi và làm việc năng suất hơn',
              'Những ngày mưa dầm u ám dễ làm con người thấy uể oải, buồn ngủ'
            ],
            samples: {
              B1: {
                answerEn: 'Yes, it affects me a lot. On sunny and cool days, I feel happy and energetic. However, when it rains heavily all day, I feel a bit lazy and sleepy.',
                answerVi: 'Có, nó ảnh hưởng đến tôi khá nhiều. Vào những ngày nắng mát, tôi cảm thấy vui vẻ và tràn đầy năng lượng. Tuy nhiên, khi trời mưa to cả ngày, tôi thấy hơi lười và buồn ngủ.'
              },
              B2: {
                answerEn: 'Quite noticeably, yes. Bright, clear mornings instantly lift my spirits and sharpen my focus, whereas prolonged gloomy drizzles tend to make me feel sluggish and less motivated to go out.',
                answerVi: 'Khá rõ rệt là đằng khác. Những buổi sáng quang đãng, tươi sáng ngay lập tức vực dậy tinh thần và giúp tôi tập trung sắc bén, trong khi những ngày mưa phùn u ám kéo dài thường khiến tôi thấy uể oải và ngại ra ngoài.'
              },
              C1: {
                answerEn: 'My psychological state is undeniably sensitive to meteorological shifts. Abundant natural sunlight stimulates serotonin production and fuels my productivity, whereas overcast, humid spells require extra self-discipline to maintain momentum.',
                answerVi: 'Trạng thái tâm lý của tôi không thể phủ nhận là khá nhạy cảm với những biến chuyển thời tiết. Ánh nắng tự nhiên dồi dào kích thích sản sinh serotonin và thúc đẩy năng suất của tôi, trong khi những đợt trời âm u, nồm ẩm đòi hỏi kỷ luật tự giác cao hơn để duy trì đà làm việc.'
              }
            }
          },
          {
            questionEn: 'How do people in your country cope with extreme summer heat?',
            questionVi: 'Người dân ở đất nước bạn đối phó với cái nắng gay gắt mùa hè như thế nào?',
            suggestedIdeas: [
              'Sử dụng điều hòa, quạt mát, mặc quần áo chống nắng khi ra đường',
              'Uống nước mía, trà đá hoặc đi nghỉ mát ở vùng biển, vùng núi'
            ],
            samples: {
              B1: {
                answerEn: 'In summer, people stay indoors with air conditioners or electric fans. When going outside, they wear sun-protective jackets, hats, and sunglasses, and drink cold sugarcane juice.',
                answerVi: 'Vào mùa hè, mọi người thường ở trong nhà bật điều hòa hoặc quạt điện. Khi ra ngoài, họ mặc áo chống nắng, đội mũ, đeo kính râm và uống nước mía mát lạnh.'
              },
              B2: {
                answerEn: 'During scorching summer heatwaves, people rely heavily on air conditioning and avoid going out at midday. Commuters cover themselves head-to-toe in UV-blocking clothing, while families flock to coastal resorts on weekends.',
                answerVi: 'Trong những đợt nắng nóng mùa hè gay gắt, mọi người phụ thuộc nhiều vào điều hòa và tránh ra đường vào giữa trưa. Người đi đường che chắn kín từ đầu đến chân bằng trang phục chống tia UV, còn các gia đình đổ về các khu nghỉ dưỡng ven biển dịp cuối tuần.'
              },
              C1: {
                answerEn: 'To withstand oppressive tropical heatwaves, citizens adapt their daily rhythms by scheduling outdoor errands at dawn or dusk, utilizing protective UV apparel, and seeking refuge in air-conditioned spaces or highland retreats.',
                answerVi: 'Để chống chọi với những đợt nắng nóng nhiệt đới oi bức, người dân điều chỉnh nhịp sinh hoạt bằng cách sắp xếp công việc ngoài trời vào lúc bình minh hoặc chiều muộn, sử dụng trang phục chống tia UV và tìm đến các không gian máy lạnh hoặc khu nghỉ dưỡng vùng cao.'
              }
            }
          }
        ]
      },
      part1Tips: [
        'Kết hợp từ vựng miêu tả thời tiết (scorching, crisp breeze, overcast) với cảm xúc con người (invigorated, sluggish, lift my spirits).',
        'Liên hệ thực tế thói quen sinh hoạt tại Việt Nam (áo chống nắng UV-blocking clothing, nước giải khát mùa hè).'
      ]
    },
    part2: {
      situation: 'Your close friend has been feeling overwhelmed and stressed because of heavy workload and exam pressure. You want to suggest an activity to help your friend relax and recover. Three options are proposed: (A) Joining a sports club together, (B) Taking a short weekend trip to the countryside, or (C) Practicing daily meditation and yoga at home. Which option would you recommend and why?',
      situationVi: 'Người bạn thân của bạn đang cảm thấy quá tải và căng thẳng vì khối lượng công việc và áp lực thi cử nặng nề. Bạn muốn gợi ý một hoạt động giúp bạn mình thư giãn và phục hồi tinh thần. Có 3 lựa chọn: (A) Cùng tham gia một câu lạc bộ thể thao, (B) Đi du lịch ngắn ngày về vùng ngoại ô cuối tuần, hoặc (C) Tập thiền và yoga hằng ngày tại nhà. Bạn sẽ khuyên bạn mình chọn phương án nào và tại sao?',
      options: [
        {
          letter: 'A',
          title: 'Option A: Joining a sports club together (Tham gia câu lạc bộ thể thao)',
          description: 'Chơi cầu lông, bơi lội hoặc chạy bộ định kỳ cùng bạn bè vài buổi mỗi tuần.',
          strongPoints: 'Giải phóng hormone endorphin giảm stress bền vững, rèn luyện thể lực và có bạn bè trò chuyện đều đặn mỗi tuần.',
          drawbacks: 'Cần duy trì lịch tập đều đặn hàng tuần.',
          advantagesEn: ['Releases endorphins regularly to combat chronic stress', 'Provides social interaction and long-term physical fitness', 'Affordable and sustainable week after week'],
          disadvantagesEn: ['Requires scheduling 2–3 sessions per week']
        },
        {
          letter: 'B',
          title: 'Option B: Taking a short trip (Đi du lịch ngắn ngày)',
          description: 'Đi nghỉ dưỡng 2 ngày cuối tuần ở vùng ngoại ô hoặc bãi biển để đổi gió.',
          strongPoints: 'Tạm thoát khỏi môi trường áp lực ngay lập tức và có trải nghiệm mới mẻ.',
          drawbacks: 'Chỉ giải quyết tạm thời trong 2 ngày; khi quay về công việc chất đống có thể làm bạn càng áp lực hơn, lại tốn kém chi phí.',
          advantagesEn: ['Immediate change of scenery and temporary escape'],
          disadvantagesEn: ['Only a temporary fix; unfinished tasks pile up upon return', 'Costs money and travel planning effort']
        },
        {
          letter: 'C',
          title: 'Option C: Practicing meditation at home (Tập thiền tại nhà)',
          description: 'Ngồi thiền tĩnh tâm một mình trong phòng 15–20 phút mỗi ngày.',
          strongPoints: 'Miễn phí, có thể thực hiện ngay tại nhà bất cứ lúc nào.',
          drawbacks: 'Khi đang quá căng thẳng, việc ngồi yên một mình dễ khiến người mới tập suy nghĩ quẩn quanh (overthinking) và cảm thấy cô đơn.',
          advantagesEn: ['Free of charge and convenient at home'],
          disadvantagesEn: ['Beginners under high stress often struggle to quiet their racing thoughts alone', 'Lacks social warmth and physical movement']
        }
      ],
      requirement: 'Choose the best way to help your stressed friend, justify your choice with clear arguments, and explain why the other two options are less suitable.',
      sampleStrategy: 'Chọn Phương án A (Joining a sports club together) vì hoạt động thể chất kết hợp giao lưu bạn bè giúp giải phóng endorphin giảm căng thẳng một cách lâu dài, bền vững. Phản biện Phương án B (Short trip) vì chỉ là giải pháp tạm thời tốn kém; phản biện Phương án C (Meditation) vì người đang rối bời ngồi một mình rất khó tĩnh tâm.',
      usefulConnectors: [
        'To help my close friend overcome chronic stress, I would strongly recommend joining a sports club together.',
        'Scientifically speaking, regular physical exercise releases endorphins that naturally elevate mood and relieve anxiety.',
        'While a short weekend trip sounds tempting, it is merely a temporary escape, and the backlog of work waiting upon return might worsen the stress.',
        'As for practicing meditation alone at home, a beginner whose mind is racing with worries often finds it frustrating to sit still in silence.'
      ],
      usefulVocab: [
        { word: 'endorphins', pos: 'n.', meaningVi: 'hormone hạnh phúc giúp giảm căng thẳng tự nhiên' },
        { word: 'let off steam', pos: 'phr.', meaningVi: 'xả hơi, giải tỏa áp lực tích tụ' },
        { word: 'temporary escape', pos: 'n.', meaningVi: 'sự trốn chạy/giải khuây tạm thời' },
        { word: 'backlog', pos: 'n.', meaningVi: 'khối lượng công việc tồn đọng' }
      ],
      collocations: [
        { phrase: 'sustainable stress relief', meaningVi: 'giải pháp giảm căng thẳng bền vững lâu dài' },
        { phrase: 'racing thoughts and anxiety', meaningVi: 'những suy nghĩ dồn dập và sự âu lo' }
      ],
      answerStructure: STANDARD_PART2_STEPS,
      sampleAnswers: {
        B1: {
          chosenOption: 'Option A: Joining a sports club together',
          speechEn: 'To help my friend reduce stress from work and exams, I think joining a sports club together is the best choice. First, playing sports like badminton or swimming helps the body release happy hormones, so my friend will feel much more relaxed and sleep better at night. Second, since we join the club together, we can talk, laugh, and support each other regularly every week. On the other hand, taking a short trip is expensive and only lasts for two days; when my friend comes back, the heavy workload is still there. As for meditation at home, sitting still alone is very difficult when someone is worried and stressed. Therefore, joining a sports club is the most helpful solution.',
          speechVi: 'Để giúp người bạn của tôi giảm căng thẳng từ công việc và thi cử, tôi nghĩ cùng nhau tham gia một câu lạc bộ thể thao là lựa chọn tốt nhất. Thứ nhất, chơi thể thao như cầu lông hay bơi lội giúp cơ thể tiết ra hormone hạnh phúc, nhờ đó bạn tôi sẽ cảm thấy thư giãn hơn nhiều và ngủ ngon hơn vào ban đêm. Thứ hai, vì chúng tôi tham gia câu lạc bộ cùng nhau, chúng tôi có thể trò chuyện, cười đùa và động viên nhau đều đặn mỗi tuần. Ngược lại, đi du lịch ngắn ngày vừa tốn kém lại chỉ kéo dài hai ngày; khi bạn tôi trở về, khối lượng công việc nặng nề vẫn còn nguyên đó. Còn về việc tập thiền tại nhà, ngồi yên một mình là rất khó khi một người đang lo lắng và căng thẳng. Vì vậy, tham gia câu lạc bộ thể thao là giải pháp hữu ích nhất.'
        },
        B2: {
          chosenOption: 'Option A: Joining a sports club together',
          speechEn: 'Seeing my best friend overwhelmed by academic and work pressure, I would wholeheartedly advise joining a sports club together. The primary benefit is that engaging in regular physical exercise, such as badminton or swimming, triggers the release of endorphins, which act as natural stress relievers and improve sleep quality. Moreover, working out in a club setting offers uplifting social interaction, allowing my friend to let off steam and share worries with me after each match. In contrast, although a short weekend trip provides a change of scenery, it is merely a temporary escape that costs money and leaves unfinished tasks piling up. Meanwhile, practicing meditation alone at home requires immense mental discipline, and a stressed beginner might end up overthinking in silence. Hence, a sports club offers the most sustainable recovery.',
          speechVi: 'Chứng kiến người bạn thân bị quá tải bởi áp lực học tập và công việc, tôi hoàn toàn khuyên bạn ấy nên cùng mình tham gia một câu lạc bộ thể thao. Lợi ích hàng đầu là việc vận động thể chất đều đặn như đánh cầu lông hay bơi lội giúp kích hoạt sản sinh endorphin, đóng vai trò như chất giảm căng thẳng tự nhiên và cải thiện chất lượng giấc ngủ. Hơn nữa, tập luyện trong môi trường câu lạc bộ mang lại sự tương tác xã hội tích cực, giúp bạn tôi xả hơi và tâm sự nỗi lo với tôi sau mỗi trận đấu. Ngược lại, dù một chuyến đi ngắn ngày cuối tuần giúp thay đổi không khí, đó chỉ là sự giải khuây tạm thời gây tốn kém và khiến công việc dở dang chất đống thêm. Trong khi đó, tập thiền một mình ở nhà đòi hỏi sự tĩnh tâm cao độ, và một người mới tập đang căng thẳng rất dễ rơi vào trạng thái suy nghĩ quẩn quanh trong im lặng. Do đó, câu lạc bộ thể thao mang lại sự phục hồi bền vững nhất.'
        },
        C1: {
          chosenOption: 'Option A: Joining a sports club together',
          speechEn: 'When addressing chronic occupational and academic burnout, cultivating an active outlet is far superior to passive avoidance, which is why I strongly endorse joining a sports club together. Physiologically, vigorous athletic activity metabolizes stress hormones like cortisol while flooding the brain with mood-enhancing endorphins. Equally important is the interpersonal dimension: participating alongside a trusted friend fosters accountability and emotional camaraderie, transforming workouts into a therapeutic weekly ritual. Conversely, a brief weekend getaway, while momentarily pleasant, addresses only the symptoms rather than the root cause of stress and may even exacerbate anxiety by delaying impending deadlines. Similarly, solitary meditation can prove counterproductive for novices experiencing acute anxiety, as unstructured silence often amplifies racing thoughts. Ultimately, a sports club delivers holistic and enduring rejuvenation.',
          speechVi: 'Khi giải quyết tình trạng kiệt sức kéo dài do công việc và học tập, việc xây dựng một kênh giải tỏa năng động vượt trội hơn hẳn sự né tránh thụ động, và đó là lý do tôi hoàn toàn ủng hộ phương án cùng tham gia câu lạc bộ thể thao. Về mặt sinh lý học, hoạt động thể thao sôi nổi giúp phân giải các hormone gây căng thẳng như cortisol đồng thời cung cấp cho não bộ lượng endorphin cải thiện tâm trạng. Quan trọng không kém là khía cạnh tương tác xã hội: tập luyện cùng một người bạn tin cậy tạo ra động lực duy trì và sự đồng hành cảm xúc, biến các buổi tập thành nghi thức trị liệu hằng tuần. Ngược lại, một chuyến đi ngắn ngày cuối tuần dù dễ chịu trong chốc lát nhưng chỉ giải quyết phần ngọn thay vì gốc rễ của stress, thậm chí còn làm trầm trọng thêm nỗi lo do trì hoãn các hạn chót đang tới gần. Tương tự, ngồi thiền một mình có thể phản tác dụng với người mới đang lo âu cấp tính, bởi sự tĩnh lặng dễ khuếch đại những dòng suy nghĩ dồn dập. Tóm lại, câu lạc bộ thể thao mang lại sự phục hồi toàn diện và bền lâu nhất.'
        }
      }
    }
  },
  5: {
    setCode: 'SET 005',
    part1: {
      topic1: {
        title: 'Shopping Habits',
        titleVi: 'Thói quen mua sắm',
        questions: [
          'Do you prefer shopping online or shopping at traditional brick-and-mortar stores?',
          'Are you someone who compares prices carefully before buying something?',
          'How have shopping habits in your country changed in recent years?'
        ],
        usefulVocab: [
          { word: 'brick-and-mortar', pos: 'adj.', meaningVi: 'cửa hàng truyền thống ngoài đời thực' },
          { word: 'bargain', pos: 'n.', meaningVi: 'món hời, hàng giảm giá tốt' },
          { word: 'impulsive', pos: 'adj.', meaningVi: 'bốc đồng, mua không suy nghĩ' },
          { word: 'cashless', pos: 'adj.', meaningVi: 'không dùng tiền mặt (chuyển khoản/quét QR)' }
        ],
        collocations: [
          { phrase: 'compare customer reviews', meaningVi: 'so sánh đánh giá của người mua trước' },
          { phrase: 'doorstep delivery', meaningVi: 'giao hàng tận cửa nhà' },
          { phrase: 'value for money', meaningVi: 'đáng đồng tiền bát gạo' }
        ],
        bilingualQuestions: [
          {
            questionEn: 'Do you prefer shopping online or shopping at traditional brick-and-mortar stores?',
            questionVi: 'Bạn thích mua sắm trực tuyến hay mua tại các cửa hàng truyền thống hơn?',
            suggestedIdeas: [
              'Mua sách vở, đồ gia dụng và điện tử trên sàn thương mại điện tử vì tiện lợi và nhiều mã giảm giá',
              'Riêng quần áo, giày dép vẫn thích ra cửa hàng thử trực tiếp để vừa vặn chất vải'
            ],
            samples: {
              B1: {
                answerEn: 'It depends on what I buy. For books and household items, I prefer online shopping because it is cheap and delivered to my home. For clothes and shoes, I like going to real shops to try them on.',
                answerVi: 'Điều đó phụ thuộc vào thứ tôi mua. Với sách vở và đồ gia dụng, tôi thích mua trực tuyến vì rẻ và được giao tận nhà. Với quần áo và giày dép, tôi thích ra cửa hàng thực tế để mặc thử.'
              },
              B2: {
                answerEn: 'I combine both depending on the product category. E-commerce platforms are unbeatable for books and electronics thanks to discount vouchers and doorstep delivery, whereas I still visit brick-and-mortar boutiques to inspect fabric quality and fit when buying clothes.',
                answerVi: 'Tôi kết hợp cả hai tùy thuộc vào danh mục sản phẩm. Các sàn thương mại điện tử là số một khi mua sách và đồ điện tử nhờ mã giảm giá và giao hàng tận cửa, trong khi tôi vẫn ghé cửa hàng truyền thống để kiểm tra chất vải và độ vừa vặn khi mua quần áo.'
              },
              C1: {
                answerEn: 'My consumer behavior is pragmatic: for standardized commodities, online marketplaces offer superior price transparency and logistical convenience. Conversely, when purchasing tailored apparel, nothing substitutes the tactile experience of a physical storefront.',
                answerVi: 'Hành vi tiêu dùng của tôi khá thực tế: đối với các mặt hàng tiêu chuẩn hóa, sàn thương mại điện tử mang lại sự minh bạch về giá và tiện lợi vận chuyển vượt trội. Ngược lại, khi mua trang phục may đo, không gì thay thế được trải nghiệm chạm thử trực tiếp tại cửa hàng.'
              }
            }
          },
          {
            questionEn: 'Are you someone who compares prices carefully before buying something?',
            questionVi: 'Bạn có phải là người hay so sánh giá kỹ lưỡng trước khi mua một món đồ không?',
            suggestedIdeas: [
              'Luôn kiểm tra giá ở 2–3 gian hàng uy tín và đọc kỹ bình luận có ảnh thật của khách hàng',
              'Giúp tránh mua hớ và kiểm soát ngân sách cá nhân hiệu quả'
            ],
            samples: {
              B1: {
                answerEn: 'Yes, I always compare prices before buying, especially for expensive things like a phone or laptop. I also read customer reviews to make sure the quality is good.',
                answerVi: 'Có, tôi luôn so sánh giá trước khi mua, đặc biệt là với những món đồ đắt tiền như điện thoại hay máy tính xách tay. Tôi cũng đọc đánh giá của khách hàng để chắc chắn chất lượng tốt.'
              },
              B2: {
                answerEn: 'Definitely. Being a budget-conscious student, I always browse multiple sellers and scrutinize verified buyer reviews before checking out. It prevents impulsive spending and ensures I get the best value for money.',
                answerVi: 'Chắc chắn rồi. Là một sinh viên chi tiêu có kế hoạch, tôi luôn lướt xem nhiều người bán và đọc kỹ các đánh giá xác thực trước khi thanh toán. Thói quen này giúp ngăn chi tiêu bốc đồng và đảm bảo đáng đồng tiền bát gạo.'
              },
              C1: {
                answerEn: 'I pride myself on being a discerning consumer. Prior to making any substantial purchase, I conduct thorough price comparisons across platforms and analyze long-term durability reviews to avoid falling prey to flashy marketing.',
                answerVi: 'Tôi tự hào mình là một người tiêu dùng tỉnh táo. Trước khi thực hiện bất kỳ khoản mua sắm lớn nào, tôi đều đối chiếu giá kỹ lưỡng giữa các nền tảng và phân tích đánh giá về độ bền lâu dài nhằm tránh sập bẫy tiếp thị hào nhoáng.'
              }
            }
          },
          {
            questionEn: 'How have shopping habits in your country changed in recent years?',
            questionVi: 'Thói quen mua sắm ở đất nước bạn đã thay đổi như thế nào trong những năm gần đây?',
            suggestedIdeas: [
              'Sự bùng nổ của mua sắm qua livestream, sàn thương mại điện tử',
              'Thanh toán không tiền mặt qua mã QR và ví điện tử trở thành chuẩn mực ở khắp nơi'
            ],
            samples: {
              B1: {
                answerEn: 'In recent years, people in Vietnam shop online much more than before. Also, instead of using cash, almost everyone now pays by scanning QR codes on their smartphones.',
                answerVi: 'Trong những năm gần đây, người dân Việt Nam mua sắm trực tuyến nhiều hơn trước rất nhiều. Ngoài ra, thay vì dùng tiền mặt, hầu như ai bây giờ cũng thanh toán bằng cách quét mã QR trên điện thoại.'
              },
              B2: {
                answerEn: 'Vietnam’s retail landscape has undergone a digital revolution. Livestream shopping on social media has skyrocketed in popularity, and cashless payments via QR codes have become ubiquitous even at traditional wet markets.',
                answerVi: 'Bức tranh bán lẻ tại Việt Nam đã trải qua một cuộc cách mạng số. Mua sắm qua livestream trên mạng xã hội tăng vọt về độ phổ biến, và thanh toán không tiền mặt qua mã QR đã trở nên quen thuộc ngay cả ở các chợ truyền thống.'
              },
              C1: {
                answerEn: 'Consumer habits have shifted dramatically toward omnichannel commerce and frictionless fintech payments. From flash-sale livestreams to universal QR transactions, digital convenience has fundamentally reshaped how Vietnamese households procure daily necessities.',
                answerVi: 'Thói quen tiêu dùng đã dịch chuyển mạnh mẽ sang thương mại đa kênh và thanh toán công nghệ tài chính siêu mượt. Từ các phiên livestream săn sale đến giao dịch QR toàn dân, sự tiện lợi kỹ thuật số đã định hình lại căn bản cách các gia đình Việt mua sắm nhu yếu phẩm.'
              }
            }
          }
        ]
      },
      topic2: {
        title: 'Technology and the Internet',
        titleVi: 'Công nghệ & Mạng Internet',
        questions: [
          'How do you use the Internet for your daily study or work?',
          'What is the most useful mobile app on your smartphone right now?',
          'What are the dangers of spending too much time on the Internet?'
        ],
        usefulVocab: [
          { word: 'indispensable', pos: 'adj.', meaningVi: 'không thể thiếu được' },
          { word: 'versatile', pos: 'adj.', meaningVi: 'đa năng, linh hoạt' },
          { word: 'cybersecurity', pos: 'n.', meaningVi: 'an ninh mạng, bảo mật thông tin' },
          { word: 'screen time', pos: 'n.', meaningVi: 'thời lượng sử dụng màn hình' }
        ],
        collocations: [
          { phrase: 'wealth of online resources', meaningVi: 'kho tàng tài nguyên trực tuyến phong phú' },
          { phrase: 'digital distraction and eye strain', meaningVi: 'sự xao nhãng kỹ thuật số và mỏi mắt' },
          { phrase: 'verify information credibility', meaningVi: 'kiểm chứng độ tin cậy của thông tin' }
        ],
        bilingualQuestions: [
          {
            questionEn: 'How do you use the Internet for your daily study or work?',
            questionVi: 'Bạn sử dụng Internet như thế nào cho việc học hoặc công việc hằng ngày?',
            suggestedIdeas: [
              'Tra cứu từ điển học thuật, đọc báo quốc tế và xem bài giảng chuyên ngành',
              'Làm việc nhóm trực tuyến qua Google Docs và lưu trữ tài liệu đám mây'
            ],
            samples: {
              B1: {
                answerEn: 'I use the Internet every day to look up new English words, watch educational videos on YouTube, and submit my homework to teachers via email.',
                answerVi: 'Tôi sử dụng Internet mỗi ngày để tra từ mới tiếng Anh, xem các video giáo dục trên YouTube và nộp bài tập về nhà cho giáo viên qua email.'
              },
              B2: {
                answerEn: 'The Internet is an indispensable study companion for me. I rely on it daily to access online dictionaries, read international news articles for IELTS preparation, and collaborate with classmates on cloud documents.',
                answerVi: 'Internet là người bạn đồng hành học tập không thể thiếu đối với tôi. Tôi dựa vào nó hằng ngày để truy cập từ điển trực tuyến, đọc báo quốc tế ôn luyện IELTS và làm việc nhóm với bạn cùng lớp trên tài liệu đám mây.'
              },
              C1: {
                answerEn: 'Digital connectivity underpins my entire academic workflow, enabling me to query scholarly databases, participate in interactive language platforms, and synchronize collaborative research across cloud ecosystems in real time.',
                answerVi: 'Kết nối kỹ thuật số là nền tảng cho toàn bộ quy trình học thuật của tôi, cho phép tôi truy vấn cơ sở dữ liệu học thuật, tham gia các nền tảng ngôn ngữ tương tác và đồng bộ hóa nghiên cứu hợp tác trên hệ sinh thái đám mây theo thời gian thực.'
              }
            }
          },
          {
            questionEn: 'What is the most useful mobile app on your smartphone right now?',
            questionVi: 'Ứng dụng di động hữu ích nhất trên điện thoại của bạn hiện nay là gì?',
            suggestedIdeas: [
              'Ứng dụng từ điển & học tiếng Anh tích hợp phát âm IPA và thẻ ghi nhớ (Flashcards)',
              'Giúp tận dụng thời gian rảnh trên xe buýt hoặc trước khi ngủ để ôn từ vựng'
            ],
            samples: {
              B1: {
                answerEn: 'The most useful app on my phone is my English dictionary and flashcard app. It helps me check pronunciation and review new vocabulary whenever I have free time.',
                answerVi: 'Ứng dụng hữu ích nhất trên điện thoại của tôi là ứng dụng từ điển tiếng Anh và thẻ ghi nhớ. Nó giúp tôi kiểm tra phát âm và ôn lại từ vựng mới bất cứ khi nào có thời gian rảnh.'
              },
              B2: {
                answerEn: 'Hands down, my favorite app is an all-in-one English learning workspace. It combines phonetic audio dictionaries with spaced-repetition flashcards, allowing me to turn short daily commutes into productive review sessions.',
                answerVi: 'Chắc chắn ứng dụng yêu thích nhất của tôi là không gian học tiếng Anh tích hợp. Nó kết hợp từ điển âm thanh phiên âm với thẻ ghi nhớ lặp lại ngắt quãng, giúp tôi biến thời gian di chuyển ngắn hằng ngày thành các phiên ôn tập hiệu quả.'
              },
              C1: {
                answerEn: 'The single most indispensable application on my device is a lexical workspace powered by spaced-repetition algorithms. It systematically consolidates my active C1 vocabulary and provides contextual audio exemplars on the go.',
                answerVi: 'Ứng dụng không thể thiếu nhất trên thiết bị của tôi là không gian học từ vựng vận hành bởi thuật toán lặp lại ngắt quãng. Nó hệ thống hóa vốn từ C1 chủ động của tôi và cung cấp các câu ví dụ âm thanh giàu ngữ cảnh mọi lúc mọi nơi.'
              }
            }
          },
          {
            questionEn: 'What are the dangers of spending too much time on the Internet?',
            questionVi: 'Những mối nguy hại của việc dành quá nhiều thời gian trên Internet là gì?',
            suggestedIdeas: [
              'Về thể chất: gây mỏi mắt, đau cổ vai gáy, thiếu ngủ và lối sống ít vận động',
              'Về tinh thần: giảm khả năng tập trung sâu, xa cách giao tiếp đời thực và nguy cơ lộ thông tin cá nhân'
            ],
            samples: {
              B1: {
                answerEn: 'Spending too much time online is bad for our eyes and makes us sleep late. Also, people may talk less with their family members in real life.',
                answerVi: 'Dành quá nhiều thời gian trực tuyến có hại cho mắt và khiến chúng ta ngủ muộn. Ngoài ra, mọi người có thể ít trò chuyện với người thân trong đời thực hơn.'
              },
              B2: {
                answerEn: 'Excessive screen time carries both physical and psychological risks. Physically, it leads to eye strain and disrupted sleep cycles; mentally, endless scrolling shortens attention spans and alienates people from face-to-face relationships.',
                answerVi: 'Thời gian sử dụng màn hình quá mức tiềm ẩn rủi ro cả về thể chất lẫn tâm lý. Về thể chất, nó gây mỏi mắt và rối loạn chu kỳ giấc ngủ; về tinh thần, việc lướt mạng vô tận làm giảm khả năng tập trung và khiến con người xa cách các mối quan hệ trực tiếp.'
              },
              C1: {
                answerEn: 'Unregulated immersion in the virtual sphere poses multifaceted hazards, ranging from fragmented cognitive attention and sleep deprivation to heightened vulnerability to cyber-scams and emotional alienation from real-world communities.',
                answerVi: 'Việc đắm chìm không kiểm soát vào không gian ảo đặt ra nhiều mối nguy đa chiều, từ sự phân mảnh khả năng tập trung nhận thức và thiếu ngủ cho đến nguy cơ cao bị lừa đảo mạng và sự cô lập cảm xúc khỏi cộng đồng đời thực.'
              }
            }
          }
        ]
      },
      part1Tips: [
        'Sử dụng từ vựng công nghệ & thương mại điện tử hiện đại (brick-and-mortar, cashless QR payments, spaced-repetition).',
        'Khi nói về mặt trái của Internet, hãy chia rõ tác động Thể chất (Physical) và Tinh thần (Psychological).'
      ]
    },
    part2: {
      situation: 'You want to improve your English communication skills significantly over the next three months. Three learning methods are suggested: (A) Using a mobile language learning app on your own, (B) Joining an evening English class at a language center, or (C) Hiring a one-on-one private tutor. Which method would you choose and why?',
      situationVi: 'Bạn muốn cải thiện đáng kể kỹ năng giao tiếp tiếng Anh của mình trong 3 tháng tới. Có 3 phương pháp học được gợi ý: (A) Tự học bằng ứng dụng di động trên điện thoại, (B) Tham gia lớp học tiếng Anh buổi tối tại trung tâm ngoại ngữ, hoặc (C) Thuê gia sư dạy kèm 1-kèm-1. Bạn sẽ chọn phương pháp nào và tại sao?',
      options: [
        {
          letter: 'A',
          title: 'Option A: Using a language learning app (Học qua ứng dụng di động)',
          description: 'Tự học từ vựng và mẫu câu trên điện thoại mọi lúc mọi nơi với chi phí thấp.',
          strongPoints: 'Linh hoạt thời gian, chi phí rẻ hoặc miễn phí, tốt để ôn từ vựng.',
          drawbacks: 'Thiếu môi trường đối thoại trực tiếp với người thật và dễ bỏ cuộc nếu thiếu kỷ luật tự giác.',
          advantagesEn: ['Highly flexible schedule and very low cost', 'Great for daily vocabulary flashcards'],
          disadvantagesEn: ['Lacks real human interaction and spontaneous speaking practice', 'Easy to lose motivation without a teacher or classmates']
        },
        {
          letter: 'B',
          title: 'Option B: Joining an evening English class (Học lớp buổi tối tại trung tâm)',
          description: 'Tham gia lớp học giao tiếp 10–15 học viên vào buổi tối với giảng viên và bạn cùng lớp.',
          strongPoints: 'Có giáo viên hướng dẫn bài bản, có nhiều bạn học để luyện nói theo cặp/nhóm, học phí hợp lý và tạo kỷ luật đi học đều đặn.',
          drawbacks: 'Phải theo lịch cố định của lớp vào các buổi tối trong tuần.',
          advantagesEn: ['Structured curriculum with professional teacher feedback', 'Abundant pair and group speaking practice with diverse classmates', 'Reasonable tuition fee and strong peer motivation'],
          disadvantagesEn: ['Fixed evening schedule requires commuting']
        },
        {
          letter: 'C',
          title: 'Option C: Hiring a private tutor (Thuê gia sư 1-kèm-1)',
          description: 'Học riêng một thầy một trò, được sửa lỗi chi tiết suốt buổi học.',
          strongPoints: 'Được giáo viên kèm sát 100% thời gian và cá nhân hóa lộ trình.',
          drawbacks: 'Học phí cực kỳ đắt đỏ đối với sinh viên và thiếu sự đa dạng giọng điệu giao tiếp từ bạn bè đồng trang lứa.',
          advantagesEn: ['100% personalized attention and instant error correction'],
          disadvantagesEn: ['Prohibitively expensive tuition over three months', 'Lacks dynamic group discussions and peer networking']
        }
      ],
      requirement: 'Choose the best way to improve your English communication skills, justify your choice, and explain why you do not choose the other two options.',
      sampleStrategy: 'Chọn Phương án B (Joining an evening English class) vì giao tiếp đòi hỏi môi trường tương tác thực tế với giáo viên và nhiều bạn học ở mức chi phí hợp lý. Phản biện Phương án A (Language app) vì không có người thật đối thoại phản xạ; phản biện Phương án C (Private tutor) vì học phí 1-kèm-1 quá đắt đỏ và thiếu thảo luận nhóm.',
      usefulConnectors: [
        'To achieve a breakthrough in my English communication within three months, enrolling in an evening class at a language center is the optimal choice.',
        'Language acquisition thrives on authentic human interaction, and a classroom setting provides diverse partners for role-play and debates.',
        'While a mobile language app is convenient and budget-friendly, it cannot replicate spontaneous face-to-face conversation.',
        'On the other hand, hiring a one-on-one private tutor is prohibitively expensive for my budget and lacks the lively energy of group discussions.'
      ],
      usefulVocab: [
        { word: 'spontaneous', pos: 'adj.', meaningVi: 'tự nhiên, phản xạ tức thì không kịch bản' },
        { word: 'prohibitively expensive', pos: 'phr.', meaningVi: 'đắt đỏ vượt quá khả năng chi trả' },
        { word: 'peer interaction', pos: 'n.', meaningVi: 'sự tương tác, thực hành cùng bạn học' },
        { word: 'accountability', pos: 'n.', meaningVi: 'tính cam kết, kỷ luật đi học đều đặn' }
      ],
      collocations: [
        { phrase: 'authentic communicative environment', meaningVi: 'môi trường giao tiếp thực tế sống động' },
        { phrase: 'strike a balance between quality and affordability', meaningVi: 'cân bằng giữa chất lượng và chi phí hợp lý' }
      ],
      answerStructure: STANDARD_PART2_STEPS,
      sampleAnswers: {
        B1: {
          chosenOption: 'Option B: Joining an evening English class',
          speechEn: 'To improve my English communication skills in the next three months, I would choose to join an evening English class at a language center. First, in an evening class, I can practice speaking face-to-face with the teacher and many classmates through fun games and group discussions. This helps me become more confident when talking to people. Second, the tuition fee of a group class is reasonable for me, and having a fixed schedule keeps me disciplined. On the other hand, learning alone on a mobile app can get boring, and there is no real person to talk with me. As for hiring a private tutor, the cost is too high for a student, and studying alone with one teacher feels quite stressful. Therefore, an evening English class is the best option.',
          speechVi: 'Để cải thiện kỹ năng giao tiếp tiếng Anh trong ba tháng tới, tôi sẽ chọn tham gia một lớp học tiếng Anh buổi tối tại trung tâm. Thứ nhất, ở lớp học buổi tối, tôi có thể luyện nói trực tiếp với giáo viên và nhiều bạn cùng lớp thông qua các trò chơi vui nhộn và thảo luận nhóm. Điều này giúp tôi tự tin hơn khi trò chuyện với mọi người. Thứ hai, học phí của lớp học nhóm khá hợp lý với tôi, và lịch học cố định giúp tôi duy trì kỷ luật. Ngược lại, tự học một mình trên ứng dụng điện thoại dễ gây nhàm chán và không có người thật để đối thoại. Còn về việc thuê gia sư riêng, chi phí quá cao đối với sinh viên, và học một mình với một giáo viên cũng khá áp lực. Vì vậy, lớp học buổi tối là phương án tốt nhất.'
        },
        B2: {
          chosenOption: 'Option B: Joining an evening English class',
          speechEn: 'With the goal of boosting my English fluency over the next three months, enrolling in an evening class at a reputable language center is definitely my top choice. Primarily, mastering spoken English requires real-time human interaction. In a classroom setting, I can engage in pair work, debates, and role-plays with various classmates, which exposes me to different accents and builds my confidence. Furthermore, an evening class strikes the perfect balance between professional teacher feedback and an affordable tuition fee. By contrast, although a mobile learning app is great for memorizing vocabulary on the go, it lacks authentic two-way conversation. Meanwhile, hiring a private tutor is prohibitively expensive over a three-month period and misses out on dynamic group synergy. Thus, the evening class is the most practical pathway.',
          speechVi: 'Với mục tiêu nâng cao sự trôi chảy tiếng Anh trong ba tháng tới, đăng ký một lớp học buổi tối tại trung tâm ngoại ngữ uy tín chắc chắn là lựa chọn hàng đầu của tôi. Trước hết, làm chủ tiếng Anh giao tiếp đòi hỏi sự tương tác trực tiếp giữa người với người. Trong môi trường lớp học, tôi có thể thực hành theo cặp, tranh biện và đóng vai tình huống cùng nhiều bạn học, giúp tôi làm quen với các ngữ điệu khác nhau và xây dựng sự tự tin. Hơn nữa, lớp buổi tối cân bằng hoàn hảo giữa sự chỉnh sửa chuyên môn của giáo viên và mức học phí vừa túi tiền. Ngược lại, dù ứng dụng di động rất tốt để nhẩm từ vựng mọi lúc mọi nơi, nó lại thiếu đi cuộc hội thoại hai chiều thực thụ. Trong khi đó, thuê gia sư riêng suốt 3 tháng lại quá đắt đỏ và thiếu đi không khí thảo luận nhóm sôi nổi. Do đó, lớp học buổi tối là lộ trình thiết thực nhất.'
        },
        C1: {
          chosenOption: 'Option B: Joining an evening English class',
          speechEn: 'To achieve a tangible leap in communicative competence within a three-month timeframe, I would unequivocally opt for an evening English course at a language institute. Fundamentally, oral fluency flourishes in an interactive social ecosystem; participating in structured debates and collaborative discussions with peers simulates real-world communication and eliminates the fear of public speaking. Moreover, group tuition offers an optimal return on investment by combining expert pedagogical guidance with peer accountability. Conversely, while mobile applications excel at gamified lexical review, they remain a passive medium incapable of cultivating spontaneous conversational reflexes. As for one-on-one private tutoring, despite its bespoke attention, the exorbitant hourly rates are financially unsustainable, and the absence of peer interaction limits exposure to diverse communicative styles. Consequently, an evening class represents the most holistic solution.',
          speechVi: 'Để đạt được bước tiến rõ rệt về năng lực giao tiếp trong khung thời gian ba tháng, tôi hoàn toàn nghiêng về việc đăng ký khóa học tiếng Anh buổi tối tại trung tâm ngoại ngữ. Về bản chất, sự lưu loát khẩu ngữ phát triển mạnh mẽ nhất trong một hệ sinh thái xã hội tương tác; tham gia các cuộc tranh biện có cấu trúc và thảo luận hợp tác cùng bạn đồng môn giúp mô phỏng giao tiếp đời thực và xóa bỏ nỗi sợ nói trước đám đông. Hơn nữa, lớp học nhóm mang lại hiệu quả đầu tư tối ưu khi kết hợp sự hướng dẫn sư phạm chuyên sâu với động lực cam kết từ tập thể. Ngược lại, dù các ứng dụng di động rất xuất sắc trong việc ôn tập từ vựng trò chơi hóa, chúng vẫn là phương tiện thụ động không thể rèn luyện phản xạ hội thoại tự nhiên. Còn đối với gia sư 1-kèm-1, bất chấp sự kèm cặp sát sao, mức học phí tính theo giờ quá đắt đỏ là không bền vững về tài chính, đồng thời sự thiếu vắng bạn học làm hạn chế cơ hội tiếp xúc với nhiều phong cách giao tiếp đa dạng. Do đó, lớp học buổi tối là giải pháp toàn diện nhất.'
        }
      }
    }
  }
};
