import { CompactVstepTestSeed } from './vstep28SpeakingBank';

export const VSTEP_28_SEEDS_PART_3: CompactVstepTestSeed[] = [
  // DAY 16 -> TEST 6: Weather Forecast, Where You Live [Filled], Birthday Wishes [Filled] & Facebook Is A Useful Tool
  {
    day: 16,
    testId: 6,
    t1Title: 'Weather Forecast & Daily Plans',
    t1TitleVi: 'Dự báo thời tiết & Kế hoạch hằng ngày',
    t1Questions: [
      {
        qEn: 'Do you check the weather forecast every day before going out?',
        qVi: 'Bạn có kiểm tra dự báo thời tiết mỗi ngày trước khi ra ngoài không?',
        b1: 'Yes, I check the weather app on my smartphone every morning so I know whether to bring a raincoat or an umbrella to university.',
        b1Vi: 'Có, tôi kiểm tra ứng dụng thời tiết trên điện thoại mỗi sáng để biết có nên mang áo mưa hoặc ô khi đi học hay không.',
        b2c1: 'Yes, glancing at the meteorological widget on my smartphone is part of my morning ritual, ensuring I dress appropriately and carry rain gear during unpredictable monsoon days.',
        b2c1Vi: 'Có, xem tiện ích dự báo thời tiết trên điện thoại là một phần thói quen buổi sáng của tôi, giúp tôi mặc trang phục phù hợp và mang theo đồ đi mưa vào những ngày thời tiết thất thường.',
        vocab: ['meteorological', 'morning ritual', 'unpredictable']
      },
      {
        qEn: 'How does the weather affect your mood and daily activities?',
        qVi: 'Thời tiết ảnh hưởng như thế nào đến tâm trạng và hoạt động hằng ngày của bạn?',
        b1: 'Sunny and cool weather makes me feel energetic and happy to go outside. On rainy days, I feel a bit lazy and prefer staying home to read or use social media.',
        b1Vi: 'Thời tiết nắng nhẹ và mát mẻ làm tôi thấy tràn đầy năng lượng và vui vẻ ra ngoài. Vào ngày mưa, tôi thấy hơi lười và thích ở nhà đọc sách hoặc lướt mạng xã hội.',
        b2c1: 'Crisp, sunlit mornings noticeably elevate my mood and productivity, whereas gloomy, torrential downpours tend to make me more introspective and inclined toward indoor study.',
        b2c1Vi: 'Những buổi sáng nắng dịu, mát mẻ làm tâm trạng và năng suất của tôi hứng khởi rõ rệt, trong khi những cơn mưa tầm tã ảm đạm thường khiến tôi hướng nội và thích học trong nhà hơn.',
        vocab: ['elevate', 'torrential downpours', 'introspective']
      },
      {
        qEn: 'Do you think weather forecasts nowadays are accurate?',
        qVi: 'Bạn có nghĩ dự báo thời tiết ngày nay chính xác không?',
        b1: 'Yes, thanks to modern satellites and supercomputers, weather forecasts for the next 24 to 48 hours are very accurate.',
        b1Vi: 'Có, nhờ vệ tinh hiện đại và siêu máy tính, dự báo thời tiết trong vòng 24 đến 48 giờ tới rất chính xác.',
        b2c1: 'Thanks to advanced satellite imagery and AI-powered climate modeling, short-term weather forecasts have achieved remarkable accuracy.',
        b2c1Vi: 'Nhờ hình ảnh vệ tinh tiên tiến và mô hình khí hậu tích hợp AI, các bản tin dự báo thời tiết ngắn hạn đã đạt độ chính xác đáng kinh ngạc.',
        vocab: ['satellite imagery', 'climate modeling', 'accuracy']
      }
    ],
    t2Title: 'Where You Live & Digital Community (Filled Missing Answers)',
    t2TitleVi: 'Nơi bạn sinh sống & Kết nối cộng đồng số (Đã bổ sung đầy đủ câu mẫu)',
    t2Questions: [
      {
        qEn: 'Do you live in a house or an apartment? What do you like most about it?',
        qVi: 'Bạn sống trong nhà mặt đất hay căn hộ chung cư? Bạn thích điều gì nhất ở nơi mình ở?',
        b1: 'I live in a three-story house with my parents. What I like most is my quiet bedroom with a balcony full of green plants where I can study comfortably.',
        b1Vi: 'Tôi sống trong một ngôi nhà ba tầng cùng bố mẹ. Điều tôi thích nhất là căn phòng ngủ yên tĩnh có ban công nhiều cây xanh nơi tôi có thể học bài thoải mái.',
        b2c1: 'I live with my family in a cozy townhouse. My favorite feature is our sunlit balcony adorned with potted plants, which serves as a tranquil corner for reading and unwinding.',
        b2c1Vi: 'Tôi sống cùng gia đình trong một ngôi nhà phố ấm cúng. Không gian yêu thích nhất của tôi là ban công ngập nắng với những chậu cây xanh, nơi trở thành góc nhỏ yên bình để đọc sách và thư giãn.',
        vocab: ['townhouse', 'adorned', 'tranquil']
      },
      {
        qEn: 'How do residents in your area share local news and announcements?',
        qVi: 'Cư dân ở khu vực bạn sống chia sẻ tin tức và thông báo địa phương bằng cách nào?',
        b1: 'Nowadays, our neighborhood has a Facebook group and a Zalo group where the community leader posts announcements quickly.',
        b1Vi: 'Ngày nay, khu phố của chúng tôi có nhóm Facebook và nhóm Zalo nơi tổ trưởng dân phố đăng các thông báo rất nhanh chóng.',
        b2c1: 'Our neighborhood utilizes a dedicated Facebook and Zalo community group to broadcast municipal notices, security alerts, and vaccination schedules instantaneously.',
        b2c1Vi: 'Khu phố của chúng tôi sử dụng nhóm cộng đồng trên Facebook và Zalo để thông báo nhanh các tin tức hành chính, cảnh báo an ninh và lịch tiêm chủng.',
        vocab: ['municipal notices', 'broadcast', 'instantaneously']
      },
      {
        qEn: 'If you could change one thing about the place where you live, what would it be?',
        qVi: 'Nếu có thể thay đổi một điều ở nơi bạn đang sống, đó sẽ là gì?',
        b1: 'I would like to reduce the traffic noise on the main street and have a larger community library nearby for students.',
        b1Vi: 'Tôi muốn giảm bớt tiếng ồn giao thông ngoài đường chính và có thêm một thư viện cộng đồng lớn hơn ở gần nhà cho học sinh.',
        b2c1: 'I would advocate for stricter noise control during rush hours and the establishment of a modern public co-working library within walking distance.',
        b2c1Vi: 'Tôi mong muốn kiểm soát chặt hơn tiếng ồn giao thông giờ cao điểm và xây dựng một thư viện không gian học tập chung hiện đại ngay trong bán kính đi bộ.',
        vocab: ['advocate', 'noise control', 'co-working']
      }
    ],
    p2Situation: 'Today is the birthday of a close friend who is studying in another city. Three ways to send birthday wishes are suggested: (A) Posting a birthday wish and photo collage on Facebook, (B) Making a direct phone/video call, or (C) Sending a paper birthday card by post. Which option do you choose? (Đã bổ sung đầy đủ lập luận).',
    p2SituationVi: 'Hôm nay là sinh nhật một người bạn thân đang học ở thành phố khác. Có 3 cách gửi lời chúc: (A) Đăng bài chúc mừng lên tường Facebook, (B) Gọi điện thoại/video trực tiếp trò chuyện, hoặc (C) Gửi thiệp giấy qua đường bưu điện. Bạn chọn cách nào?',
    p2Chosen: 'B',
    p2Options: [
      {
        letter: 'A',
        title: 'Posting a wish on Facebook (Đăng lời chúc trên tường Facebook)',
        descVi: 'Viết bài đăng công khai kèm ảnh kỷ niệm trên mạng xã hội.',
        prosVi: 'Nhanh chóng và bạn bè chung đều nhìn thấy.',
        consVi: 'Trôi lẫn giữa hàng chục lời chúc ngắn ngủi khác trên mạng xã hội, thiếu sự tâm tình sâu sắc.',
        reasoningEn: 'a public Facebook post easily gets lost among dozens of superficial comments and lacks personal warmth.'
      },
      {
        letter: 'B',
        title: 'Making a direct phone or video call (Gọi điện/video trực tiếp chúc mừng)',
        descVi: 'Gọi trực tiếp để nghe giọng nói, nhìn biểu cảm và hỏi thăm cuộc sống của bạn.',
        prosVi: 'Chân thành, ấm áp, nghe được giọng nói và cười nói trực tiếp ngay đúng ngày sinh nhật dù ở xa.',
        consVi: 'Cần chọn khung giờ buổi tối khi bạn đã tan học.',
        reasoningEn: 'hearing each other’s voice and seeing facial expressions in real time conveys genuine sincerity and closeness.'
      },
      {
        letter: 'C',
        title: 'Sending a paper card by post (Gửi thiệp giấy qua bưu điện)',
        descVi: 'Viết thiệp tay và gửi chuyển phát qua bưu điện.',
        prosVi: 'Mang nét cổ điển.',
        consVi: 'Mất từ 3–5 ngày mới tới nơi nên sẽ bị trễ ngày sinh nhật hôm nay, thậm chí dễ thất lạc.',
        reasoningEn: 'postal mail takes several days to arrive, meaning the card will miss the actual birthday today.'
      }
    ],
    p2SpeechB1: 'Since today is my close friend’s birthday and they are in another city, I will definitely choose to make a direct phone or video call. First, hearing my voice and seeing my face on a video call will make my friend feel much warmer and happier than just reading text on a screen. We can talk for twenty minutes about their birthday plans and university life. On the other hand, posting on Facebook is too common and impersonal because hundreds of acquaintances write short comments there. Sending a paper card by post takes several days, so it will arrive late after the birthday is over. Therefore, calling my friend directly is the most sincere choice.',
    p2SpeechB1Vi: 'Vì hôm nay là sinh nhật người bạn thân đang ở thành phố khác, tôi chắc chắn sẽ chọn gọi điện thoại hoặc gọi video trực tiếp. Thứ nhất, được nghe giọng nói và nhìn thấy gương mặt nhau qua cuộc gọi video sẽ làm bạn tôi cảm thấy ấm áp và hạnh phúc hơn nhiều so với chỉ đọc dòng chữ trên màn hình. Chúng tôi có thể trò chuyện hai mươi phút về kế hoạch đón sinh nhật và chuyện học hành. Ngược lại, đăng lời chúc trên Facebook quá phổ biến và thiếu sự riêng tư vì có hàng trăm bình luận xã giao trên đó. Gửi thiệp giấy qua bưu điện lại mất vài ngày nên sẽ bị trễ mất ngày sinh nhật hôm nay. Do đó, gọi trực tiếp cho bạn là lựa chọn chân thành nhất.',
    p2SpeechB2C1: 'To wish a close friend in another city a happy birthday today, I would wholeheartedly opt for making a direct phone or video call rather than posting on Facebook or mailing a card. First and foremost, a live conversation allows us to hear each other’s laughter, share personal updates, and convey genuine emotional warmth across the distance. Conversely, while posting on a Facebook wall is convenient, it often feels performative and gets buried beneath dozens of generic "Happy Birthday" comments. Meanwhile, sending a physical card via postal mail is impractical because it takes days to arrive, missing the birthday itself. Ultimately, a personal call is the most heartfelt way to celebrate our friendship.',
    p2SpeechB2C1Vi: 'Để chúc mừng sinh nhật người bạn thân đang ở xa ngay trong hôm nay, tôi hoàn toàn chọn gọi điện hoặc gọi video trực tiếp thay vì đăng bài lên Facebook hay gửi thiệp bưu điện. Trước hết, một cuộc trò chuyện trực tiếp cho phép chúng tôi nghe thấy tiếng cười của nhau, hỏi thăm cuộc sống riêng và truyền tải sự ấm áp chân thành bất chấp khoảng cách địa lý. Ngược lại, dù đăng bài trên tường Facebook rất tiện lợi, nó thường mang tính hình thức và dễ bị trôi đi giữa hàng chục bình luận chúc mừng giống nhau. Trong khi đó, gửi thiệp giấy qua bưu điện lại thiếu thực tế vì mất nhiều ngày vận chuyển, dẫn đến trễ ngày sinh nhật. Tóm lại, một cuộc gọi riêng tư là cách ý nghĩa nhất để trân trọng tình bạn.',
    p3Central: 'Facebook and social media are useful tools for modern life.',
    p3CentralVi: 'Facebook và các mạng xã hội là những công cụ hữu ích cho đời sống hiện đại.',
    p3Prompts: [
      {
        point: 'Connect with friends and family across distances',
        pointVi: 'Kết nối bạn bè và người thân vượt qua mọi khoảng cách địa lý',
        exp: 'Instant messaging, video calls, and photo sharing keep long-distance friendships and overseas relatives closely bonded.',
        expVi: 'Nhắn tin tức thời, gọi video và chia sẻ hình ảnh giúp những tình bạn ở xa và người thân ở nước ngoài luôn gắn kết.'
      },
      {
        point: 'Update news and share educational knowledge quickly',
        pointVi: 'Cập nhật tin tức và chia sẻ kiến thức học tập nhanh chóng',
        exp: 'Students can join academic study groups, follow reputable news pages, and download learning materials for free.',
        expVi: 'Sinh viên có thể tham gia các nhóm học thuật, theo dõi trang tin uy tín và tải tài liệu học tập hoàn toàn miễn phí.'
      },
      {
        point: 'Support online business, marketing, and job hunting',
        pointVi: 'Hỗ trợ kinh doanh trực tuyến, quảng bá thương hiệu và tìm kiếm việc làm',
        exp: 'Small businesses and freelancers use social platforms to reach customers cost-effectively and build professional networks.',
        expVi: 'Các doanh nghiệp nhỏ và người làm tự do tận dụng mạng xã hội để tiếp cận khách hàng tiết kiệm chi phí và mở rộng mạng lưới nghề nghiệp.'
      }
    ],
    p3OwnIdea: {
      point: 'Mobilize community charity and social awareness campaigns',
      pointVi: 'Huy động các chiến dịch thiện nguyện và lan tỏa ý thức cộng đồng',
      exp: 'Social media helps raise emergency funds for flood victims and promotes environmental cleanups rapidly.',
      expVi: 'Mạng xã hội giúp kêu gọi quyên góp khẩn cấp cho đồng bào vùng lũ và lan tỏa các chiến dịch bảo vệ môi trường cực kỳ nhanh chóng.'
    },
    p3SpeechB1: 'I agree that Facebook and social media are very useful tools when used properly. First, they help us stay connected with friends and relatives no matter how far away they live. We can chat, video call, and see their daily photos for free. Second, social media is a fast way to update news and learn new things. For example, I join many IELTS and VSTEP study groups on Facebook to download free books and tips. Third, Facebook is great for online shopping and small businesses to advertise their products. Finally, it helps spread charity campaigns to help poor people quickly.',
    p3SpeechB1Vi: 'Tôi đồng ý rằng Facebook và mạng xã hội là những công cụ rất hữu ích khi được sử dụng đúng cách. Thứ nhất, chúng giúp chúng ta giữ kết nối với bạn bè và người thân dù ở xa đến đâu. Chúng ta có thể nhắn tin, gọi video và xem ảnh hằng ngày miễn phí. Thứ hai, mạng xã hội là kênh nhanh chóng để cập nhật tin tức và học hỏi điều mới. Ví dụ, tôi tham gia nhiều nhóm ôn thi IELTS và VSTEP trên Facebook để tải tài liệu và mẹo học miễn phí. Thứ ba, Facebook rất tốt cho việc mua bán trực tuyến và giúp các cửa hàng nhỏ quảng bá sản phẩm. Cuối cùng, nó giúp lan tỏa các chiến dịch từ thiện hỗ trợ người khó khăn rất nhanh.',
    p3SpeechB2C1: 'When utilized mindfully, social media platforms like Facebook serve as indispensable utilities in contemporary society. First and foremost, they bridge geographical divides, enabling instantaneous communication with friends and relatives across the globe through multimedia messaging. Secondly, social networks democratize information sharing; millions of students participate in academic communities on Facebook to exchange scholarly resources and stay abreast of current affairs. Thirdly, social media acts as a powerful economic engine for e-commerce and digital marketing, allowing small entrepreneurs to reach targeted audiences with minimal capital. Furthermore, viral campaigns on Facebook can mobilize philanthropic relief and civic awareness within hours.',
    p3SpeechB2C1Vi: 'Khi được sử dụng một cách tỉnh thức, các nền tảng mạng xã hội như Facebook đóng vai trò là tiện ích không thể thiếu trong xã hội đương đại. Trước hết, chúng xóa nhòa khoảng cách địa lý, cho phép giao tiếp tức thì với bạn bè và người thân trên khắp thế giới qua tin nhắn đa phương tiện. Thứ hai, mạng xã hội bình đẳng hóa việc chia sẻ thông tin; hàng triệu sinh viên tham gia các cộng đồng học thuật trên Facebook để trao đổi tài liệu và nắm bắt thời sự. Thứ ba, mạng xã hội là động lực kinh tế mạnh mẽ cho thương mại điện tử và tiếp thị số, giúp các hộ kinh doanh nhỏ tiếp cận khách hàng mục tiêu với chi phí thấp. Hơn nữa, các chiến dịch lan tỏa trên Facebook có thể huy động cứu trợ từ thiện chỉ trong vài giờ.',
    p3FollowUps: [
      {
        q: 'What are the negative effects of spending too much time on Facebook?',
        qVi: 'Những tác hại tiêu cực của việc dành quá nhiều thời gian trên Facebook là gì?',
        b1: 'Spending too much time on Facebook wastes study time, hurts eyesight, causes sleep loss, and makes young people feel anxious when comparing themselves to others.',
        b2c1: 'Excessive social media consumption erodes academic productivity, disrupts circadian sleep rhythms, and fuels psychological anxiety through unhealthy social comparison and cyberbullying.',
        vi: 'Tiêu thụ mạng xã hội quá mức làm xói mòn năng suất học tập, gây rối loạn nhịp sinh học giấc ngủ và làm gia tăng lo âu tâm lý do sự so sánh xã hội độc hại cũng như bắt nạt qua mạng.'
      },
      {
        q: 'How can users protect their personal privacy on social media?',
        qVi: 'Người dùng có thể bảo vệ quyền riêng tư cá nhân trên mạng xã hội bằng cách nào?',
        b1: 'Users should set strong passwords, turn on two-factor authentication, set their profile to friends-only, and never post sensitive information like ID cards or home addresses.',
        b2c1: 'Individuals must practice strict digital hygiene by enabling two-factor authentication, restricting privacy settings to trusted contacts, and refraining from disclosing sensitive financial or location data.',
        vi: 'Mỗi cá nhân cần thực hành an toàn số nghiêm ngặt bằng cách bật xác thực hai lớp, giới hạn quyền riêng tư cho bạn bè tin cậy và tuyệt đối không tiết lộ dữ liệu tài chính hay địa chỉ nhạy cảm.'
      },
      {
        q: 'Will face-to-face communication be replaced by social media in the future?',
        qVi: 'Giao tiếp trực tiếp mặt đối mặt liệu có bị thay thế bởi mạng xã hội trong tương lai không?',
        b1: 'No, never. Online messages cannot replace real eye contact, warm hugs, and the genuine feelings of talking face to face.',
        b2c1: 'Never. While digital platforms supplement long-distance interaction, virtual emojis can never replicate the non-verbal nuances, eye contact, and emotional resonance of face-to-face human connection.',
        vi: 'Không bao giờ. Dù các nền tảng số hỗ trợ đắc lực cho giao tiếp từ xa, các biểu tượng cảm xúc ảo không bao giờ thay thế được sắc thái phi ngôn từ, ánh mắt và sự đồng điệu cảm xúc khi trò chuyện trực tiếp.'
      }
    ]
  },

  // DAY 17 -> TEST 14: Celebrities, Advertisement, Holiday Accommodation & Drawbacks of Online Shopping
  {
    day: 17,
    testId: 14,
    t1Title: 'Celebrities & Public Figures',
    t1TitleVi: 'Người nổi tiếng & Tầm ảnh hưởng công chúng',
    t1Questions: [
      {
        qEn: 'Who is your favorite celebrity or public figure in your country?',
        qVi: 'Người nổi tiếng hoặc nhân vật của công chúng mà bạn yêu thích nhất ở nước bạn là ai?',
        b1: 'I really admire MC Khanh Vy because she speaks English fluently, works very hard, and inspires millions of young students to learn foreign languages.',
        b1Vi: 'Tôi rất ngưỡng mộ MC Khánh Vy vì chị ấy nói tiếng Anh lưu loát, làm việc chăm chỉ và truyền cảm hứng học ngoại ngữ cho hàng triệu bạn trẻ.',
        b2c1: 'I hold educational content creator and television host Khanh Vy in high regard; her discipline, multilingual fluency, and positive energy inspire young Vietnamese learners.',
        b2c1Vi: 'Tôi rất trân trọng nhà sáng tạo nội dung giáo dục kiêm MC Khánh Vy; sự kỷ luật, khả năng thông thạo ngoại ngữ và năng lượng tích cực của cô ấy truyền cảm hứng mạnh mẽ cho người trẻ Việt Nam.',
        vocab: ['hold in high regard', 'multilingual', 'inspire']
      },
      {
        qEn: 'Do you think celebrities have a responsibility to be good role models for young people?',
        qVi: 'Bạn có nghĩ người nổi tiếng có trách nhiệm làm tấm gương tốt cho giới trẻ không?',
        b1: 'Yes, because millions of teenagers follow and copy what celebrities do. Therefore, famous people should behave politely and promote good values.',
        b1Vi: 'Có, vì hàng triệu thanh thiếu niên theo dõi và bắt chước những gì người nổi tiếng làm. Do đó, người của công chúng nên cư xử văn minh và lan tỏa giá trị tốt đẹp.',
        b2c1: 'Unquestionably. Since celebrities wield immense influence over impressionable youths, they bear a moral obligation to uphold ethical conduct and refrain from false advertising.',
        b2c1Vi: 'Không nghi ngờ gì nữa. Vì người nổi tiếng có sức ảnh hưởng rất lớn tới giới trẻ, họ mang nghĩa vụ đạo đức phải giữ gìn lối sống chuẩn mực và không quảng cáo sai sự thật.',
        vocab: ['wield influence', 'impressionable', 'moral obligation']
      },
      {
        qEn: 'Would you like to be famous one day? Why or why not?',
        qVi: 'Bạn có muốn trở nên nổi tiếng vào một ngày nào đó không? Tại sao?',
        b1: 'I would like to be respected in my profession, but I do not want to be a movie star because famous people lose their personal privacy.',
        b1Vi: 'Tôi muốn được tôn trọng trong lĩnh vực chuyên môn của mình, nhưng không muốn làm ngôi sao giải trí vì người nổi tiếng bị mất quyền riêng tư cá nhân.',
        b2c1: 'While I aspire to achieve recognition in my professional field, I would shun celebrity stardom, as constant media scrutiny strips away personal privacy.',
        b2c1Vi: 'Mặc dù tôi khao khát đạt được sự công nhận trong lĩnh vực chuyên môn, tôi không ham muốn hào quang ngôi sao giải trí vì sự soi mói liên tục của truyền thông sẽ tước đi quyền riêng tư.',
        vocab: ['recognition', 'shun', 'media scrutiny']
      }
    ],
    t2Title: 'Advertisements & Consumer Behavior',
    t2TitleVi: 'Quảng cáo thương mại & Hành vi tiêu dùng',
    t2Questions: [
      {
        qEn: 'Where do you usually see advertisements every day?',
        qVi: 'Bạn thường nhìn thấy quảng cáo ở đâu mỗi ngày?',
        b1: 'I see advertisements everywhere—on YouTube videos, Facebook feeds, street billboards, and even inside elevators.',
        b1Vi: 'Tôi nhìn thấy quảng cáo ở khắp mọi nơi—trên video YouTube, bảng tin Facebook, biển quảng cáo ngoài đường và cả trong thang máy.',
        b2c1: 'Commercial advertising has become ubiquitous, appearing across social media algorithms, streaming platforms, roadside billboards, and e-commerce apps.',
        b2c1Vi: 'Quảng cáo thương mại đã trở nên phổ biến khắp mọi nơi, xuất hiện trên thuật toán mạng xã hội, nền tảng xem video, biển bảng ven đường và ứng dụng mua sắm.',
        vocab: ['commercial', 'ubiquitous', 'billboards']
      },
      {
        qEn: 'Have you ever bought a product just because of an attractive advertisement?',
        qVi: 'Bạn đã bao giờ mua một sản phẩm chỉ vì một quảng cáo hấp dẫn chưa?',
        b1: 'Yes, once I bought a pair of shoes online after seeing a flashy video ad, but when it arrived, the quality was much worse than in the video.',
        b1Vi: 'Có, một lần tôi đã mua một đôi giày trên mạng sau khi xem quảng cáo bắt mắt, nhưng khi nhận hàng thì chất lượng tệ hơn nhiều so với video.',
        b2c1: 'Admittedly, I once made an impulse purchase after watching an influencer endorsement, only to discover that the product quality was heavily exaggerated.',
        b2c1Vi: 'Thú thật là tôi từng mua hàng bốc đồng một lần sau khi xem quảng cáo của người có sức ảnh hưởng, để rồi nhận ra chất lượng sản phẩm đã bị phóng đại quá mức.',
        vocab: ['impulse purchase', 'endorsement', 'exaggerated']
      },
      {
        qEn: 'What makes an advertisement memorable and trustworthy?',
        qVi: 'Điều gì làm nên một quảng cáo đáng nhớ và đáng tin cậy?',
        b1: 'A good advertisement tells a creative, honest story and shows the real quality and price of the product without lying to customers.',
        b1Vi: 'Một quảng cáo tốt kể một câu chuyện sáng tạo, trung thực và cho thấy chất lượng, giá cả thật của sản phẩm mà không lừa dối khách hàng.',
        b2c1: 'An impactful advertisement combines creative storytelling with transparent product specifications, earning consumer trust rather than relying on deceptive hype.',
        b2c1Vi: 'Một quảng cáo ấn tượng kết hợp cách kể chuyện sáng tạo với thông tin sản phẩm minh bạch, chinh phục niềm tin người tiêu dùng thay vì thổi phồng sai sự thật.',
        vocab: ['storytelling', 'transparent', 'deceptive']
      }
    ],
    p2Situation: 'You and a group of five university friends are planning a three-day holiday trip to Da Lat. Three accommodation options are available: (A) Booking a luxury five-star hotel, (B) Staying at a cozy local homestay or youth hostel, or (C) Camping in tents in the pine forest for all three nights. Which accommodation do you choose?',
    p2SituationVi: 'Bạn và nhóm 5 người bạn đại học đang lên kế hoạch đi du lịch Đà Lạt 3 ngày. Có 3 lựa chọn chỗ ở: (A) Đặt khách sạn 5 sao sang trọng, (B) Ở tại một homestay/nhà nghỉ địa phương ấm cúng, hoặc (C) Cắm trại ngủ lều trong rừng thông suốt 3 đêm. Bạn chọn chỗ ở nào?',
    p2Chosen: 'B',
    p2Options: [
      {
        letter: 'A',
        title: 'A luxury five-star hotel (Khách sạn 5 sao sang trọng)',
        descVi: 'Phòng nghỉ cao cấp với dịch vụ tiêu chuẩn quốc tế.',
        prosVi: 'Đầy đủ tiện nghi cao cấp.',
        consVi: 'Giá phòng quá đắt đỏ đối với túi tiền sinh viên, làm cạn kiệt ngân sách dành cho ăn uống và tham quan.',
        reasoningEn: 'a five-star hotel is prohibitively expensive for university students and drains the budget meant for sightseeing and local food.'
      },
      {
        letter: 'B',
        title: 'A cozy local homestay (Homestay địa phương ấm cúng)',
        descVi: 'Căn nhà gỗ nhỏ xinh có sân vườn nướng BBQ, nước nóng đầy đủ và giá hợp lý.',
        prosVi: 'Giá chia đầu người rất rẻ, an toàn ấm áp, có bếp chung để cả nhóm tự nướng BBQ và chụp ảnh cực đẹp.',
        consVi: 'Cần đặt phòng sớm trước chuyến đi 1–2 tuần.',
        reasoningEn: 'a local homestay is budget-friendly for students, provides warm beds and hot showers, and offers a common garden for evening BBQ parties.'
      },
      {
        letter: 'C',
        title: 'Camping in tents for all three nights (Ngủ lều ngoài rừng thông suốt 3 đêm)',
        descVi: 'Dựng lều ngủ ngoài trời không thuê phòng.',
        prosVi: 'Gần gũi thiên nhiên.',
        consVi: 'Đêm ở Đà Lạt rất lạnh và ẩm sương, ngủ lều suốt 3 đêm không có phòng tắm nước nóng sẽ khiến cả nhóm dễ cảm lạnh và mệt mỏi.',
        reasoningEn: 'sleeping in outdoor tents for three consecutive freezing nights in Da Lat without hot showers is exhausting and unhealthy.'
      }
    ],
    p2SpeechB1: 'For our three-day student trip to Da Lat, I would definitely choose staying at a cozy local homestay. First, the price of a homestay is very affordable when shared among five students, so we can save money for delicious local food and sightseeing tickets. Second, Da Lat is famosa for beautiful wooden homestays with flower gardens where our group can organize an evening BBQ party and take great photos together. Also, it has warm beds and hot water showers. On the other hand, a five-star hotel is way too expensive for students. Camping in tents for all three nights is too cold and dangerous at night in Da Lat. Therefore, a local homestay is the best choice.',
    p2SpeechB1Vi: 'Cho chuyến du lịch Đà Lạt ba ngày của nhóm sinh viên chúng tôi, tôi chắc chắn sẽ chọn ở tại một homestay địa phương ấm cúng. Thứ nhất, giá thuê homestay rất hợp lý khi chia đều cho năm sinh viên, giúp chúng tôi tiết kiệm tiền để thưởng thức ẩm thực và mua vé tham quan. Thứ hai, Đà Lạt nổi tiếng với những căn homestay gỗ xinh xắn có vườn hoa, nơi cả nhóm có thể tổ chức tiệc nướng BBQ buổi tối và chụp ảnh kỷ niệm. Ngoài ra, ở đó có chăn ấm và bình nóng lạnh đầy đủ. Ngược lại, khách sạn 5 sao quá đắt đỏ với sinh viên. Còn ngủ lều ngoài trời suốt 3 đêm ở Đà Lạt lại quá lạnh và thiếu an toàn. Do đó, homestay địa phương là lựa chọn tuyệt vời nhất.',
    p2SpeechB2C1: 'When selecting accommodation for our university group’s three-day getaway to Da Lat, I am convinced that booking a cozy local homestay is the optimal choice. First and foremost, a homestay strikes the ideal balance between affordability and comfort; splitting the cost of a group room fits our student budget while still guaranteeing warm beds, hot showers, and secure luggage storage. Secondly, Da Lat’s signature garden homestays provide a communal courtyard where our group can host an acoustic barbecue night and bond deeply. Conversely, a five-star hotel is financially extravagant for undergraduates, whereas camping outdoors for three consecutive nights in Da Lat’s chilly mountain fog without proper sanitation is physically exhausting. Thus, the homestay is unmatched.',
    p2SpeechB2C1Vi: 'Khi chọn chỗ ở cho chuyến đi Đà Lạt ba ngày của nhóm bạn đại học, tôi tin chắc rằng đặt một homestay địa phương ấm cúng là lựa chọn tối ưu. Trước hết, homestay tạo sự cân bằng hoàn hảo giữa chi phí hợp lý và sự tiện nghi; chia tiền phòng tập thể rất vừa túi tiền sinh viên trong khi vẫn đảm bảo giường ấm, nước nóng và chỗ cất hành lý an toàn. Thứ hai, những căn homestay sân vườn đặc trưng của Đà Lạt có khoảng sân chung để cả nhóm tổ chức đêm tiệc nướng BBQ đàn hát gắn kết. Ngược lại, khách sạn 5 sao quá xa xỉ với sinh viên, còn ngủ lều ngoài trời suốt 3 đêm liền trong sương lạnh vùng núi mà không có nhà tắm nước nóng sẽ gây kiệt sức. Vì vậy, homestay là lựa chọn số một.',
    p3Central: 'Online shopping has several notable drawbacks.',
    p3CentralVi: 'Mua sắm trực tuyến (Online shopping) tồn tại nhiều nhược điểm và rủi ro đáng lưu ý.',
    p3Prompts: [
      {
        point: 'Inability to try or inspect products firsthand',
        pointVi: 'Không được thử trực tiếp hoặc kiểm tra chất lượng thực tế trước khi mua',
        exp: 'Customers cannot touch the fabric, check the exact size, or verify durability, often receiving items that look completely different from edited photos.',
        expVi: 'Khách hàng không thể sờ chất liệu vải, thử kích cỡ hay kiểm tra độ bền, thường nhận về sản phẩm khác xa ảnh quảng cáo đã qua chỉnh sửa.'
      },
      {
        point: 'Shipping delays and complicated return procedures',
        pointVi: 'Giao hàng chậm trễ và thủ tục đổi trả hàng rắc rối',
        exp: 'Packages may be damaged or delayed during transit, and returning defective goods requires repackaging and waiting days for a refund.',
        expVi: 'Đơn hàng có thể bị móp méo hoặc giao trễ, và việc hoàn trả hàng lỗi đòi hỏi đóng gói lại, chờ đợi nhiều ngày mới được hoàn tiền.'
      },
      {
        point: 'Risk of online scams, counterfeit goods, and data theft',
        pointVi: 'Nguy cơ bị lừa đảo qua mạng, mua phải hàng giả và lộ thông tin cá nhân',
        exp: 'Fraudulent sellers may send fake products, steal credit card details, or disappear after receiving advance payment.',
        expVi: 'Những kẻ bán hàng gian lận có thể gửi hàng nhái kém chất lượng, đánh cắp thông tin thẻ thanh toán hoặc chặn liên lạc sau khi nhận tiền cọc.'
      }
    ],
    p3OwnIdea: {
      point: 'Encourage impulse buying and excessive packaging waste',
      pointVi: 'Kích thích mua sắm bốc đồng lãng phí tiền bạc và tạo ra lượng lớn rác thải nhựa bọc hàng',
      exp: 'Flash-sale notifications tempt young people to buy unnecessary items, generating mountains of plastic bubble wrap and cardboard boxes.',
      expVi: 'Các thông báo săn sale chớp nhoáng cám dỗ giới trẻ mua những món đồ không cần thiết, đồng thời thải ra hàng núi nilon chống sốc và hộp bìa.'
    },
    p3SpeechB1: 'Although online shopping is very convenient, it also has several serious drawbacks. First, buyers cannot try on clothes or touch the product before paying. Because sellers often use heavily edited photos, the real item we receive at home may have poor quality or the wrong size. Second, delivery can be delayed or damaged, especially during busy sale seasons, and returning a broken item takes a lot of time. Third, there is a high risk of online scams, fake goods, and losing personal bank information. Finally, online flash sales easily tempt people to waste money on things they do not really need.',
    p3SpeechB1Vi: 'Mặc dù mua sắm trực tuyến rất tiện lợi, nó cũng tồn tại nhiều nhược điểm nghiêm trọng. Thứ nhất, người mua không thể mặc thử quần áo hay chạm vào sản phẩm trước khi trả tiền. Vì người bán thường dùng ảnh đã chỉnh sửa kỹ, món hàng thực tế nhận được có thể kém chất lượng hoặc sai kích cỡ. Thứ hai, việc giao hàng có thể bị trễ hoặc hư hỏng trong các đợt giảm giá lớn, và thủ tục đổi trả hàng lỗi rất mất thời gian. Thứ ba, có nguy cơ cao gặp phải lừa đảo qua mạng, hàng giả và lộ thông tin tài khoản ngân hàng. Cuối cùng, các đợt săn sale dễ cám dỗ mọi người tiêu tiền lãng phí vào những thứ không thực sự cần thiết.',
    p3SpeechB2C1: 'Despite the undeniable convenience of e-commerce, online shopping entails significant drawbacks that consumers must navigate with caution. First and foremost, the inability to physically inspect or try on merchandise prior to purchase frequently leads to buyer disappointment; heavily retouched promotional photos often mask inferior fabric quality or inaccurate sizing. Secondly, logistical hiccups—ranging from transit damage and delivery delays to cumbersome return-and-refund procedures—can turn shopping into a frustrating ordeal. Thirdly, digital marketplaces expose shoppers to cybersecurity threats, including counterfeit products, phishing scams, and credit card fraud. Furthermore, algorithmic flash sales trigger compulsive impulse buying and generate massive amounts of plastic packaging waste.',
    p3SpeechB2C1Vi: 'Bất chấp sự tiện lợi không thể phủ nhận của thương mại điện tử, mua sắm trực tuyến vẫn tiềm ẩn nhiều mặt trái đáng kể mà người tiêu dùng phải thận trọng. Trước hết, việc không thể trực tiếp kiểm tra hay mặc thử hàng hóa trước khi mua thường dẫn đến sự thất vọng; những bức ảnh quảng cáo chỉnh sửa quá đà thường che giấu chất liệu vải kém hoặc sai lệch kích cỡ. Thứ hai, các sự cố vận chuyển—từ móp méo hàng hóa, giao trễ cho đến quy trình đổi trả hoàn tiền rườm rà—có thể biến việc mua sắm thành trải nghiệm mệt mỏi. Thứ ba, chợ mạng khiến người mua đối mặt với rủi ro an ninh mạng như hàng giả, lừa đảo chiếm đoạt tiền cọc và đánh cắp dữ liệu thẻ. Hơn nữa, các đợt giảm giá chớp nhoáng còn kích thích thói quen mua sắm bốc đồng và thải ra lượng lớn rác thải bao bì nhựa.',
    p3FollowUps: [
      {
        q: 'How can consumers avoid being cheated when shopping online?',
        qVi: 'Người tiêu dùng có thể làm gì để tránh bị lừa khi mua hàng trực tuyến?',
        b1: 'Buyers should only shop on reputable platforms, read real customer reviews with photos carefully, and choose cash-on-delivery (COD) so they can check the package.',
        b2c1: 'To safeguard themselves, consumers should patronize verified flagship stores, scrutinize authentic buyer reviews with unedited photos, and utilize Cash-on-Delivery or escrow payment protection.',
        vi: 'Để tự bảo vệ mình, người tiêu dùng nên mua tại các gian hàng chính hãng đã xác thực, xem kỹ đánh giá thực tế có kèm ảnh thật của người mua trước và chọn thanh toán khi nhận hàng hoặc ví đảm bảo.'
      },
      {
        q: 'Will online shopping completely replace traditional brick-and-mortar stores in the future?',
        qVi: 'Mua sắm trực tuyến liệu có thay thế hoàn toàn các cửa hàng truyền thống trong tương lai không?',
        b1: 'No, physical stores will still exist because people still enjoy going to malls with friends, trying on luxury clothes in person, and buying fresh food.',
        b2c1: 'Unlikely. While e-commerce will continue to grow, brick-and-mortar stores remain irreplaceable for fresh groceries, high-end luxury goods, and the tactile social experience of window shopping.',
        vi: 'Khó có khả năng đó. Dù thương mại điện tử sẽ tiếp tục mở rộng, các cửa hàng vật lý vẫn không thể thay thế đối với thực phẩm tươi sống, hàng cao cấp cần thử trực tiếp và trải nghiệm đi dạo trung tâm thương mại cùng bạn bè.'
      },
      {
        q: 'Which age group shops online the most, and why?',
        qVi: 'Nhóm tuổi nào mua sắm trực tuyến nhiều nhất, và tại sao?',
        b1: 'Young people aged 18 to 35 shop online the most because they use smartphones fluently, are busy with study or work, and love hunting for discount vouchers.',
        b2c1: 'Tech-savvy millennials and Gen Z adults aged 18 to 35 dominate online shopping due to their high digital literacy, busy schedules, and enthusiasm for livestream deals.',
        vi: 'Thế hệ trẻ am hiểu công nghệ từ 18 đến 35 tuổi chiếm tỷ trọng mua sắm trực tuyến lớn nhất nhờ kỹ năng số thành thạo, lịch trình bận rộn và sự hào hứng với các chương trình ưu đãi trực tuyến.'
      }
    ]
  },

  // DAY 18 -> TEST 7: Reading & Cybersecurity [Cleaned Duplicate Weather!], Deal with Smoking in Public & Personal Privacy on the Internet
  {
    day: 18,
    testId: 7,
    t1Title: 'Cybersecurity & Digital Habits (Cleaned & Upgraded)',
    t1TitleVi: 'An toàn thông tin & Thói quen số (Đã thay thế phần Weather trùng lặp ở Đề 6)',
    t1Questions: [
      {
        qEn: 'How many hours a day do you usually spend on the internet?',
        qVi: 'Bạn thường dành bao nhiêu tiếng mỗi ngày trên internet?',
        b1: 'I spend about four to five hours a day on the internet—mostly for studying English, reading academic articles, and chatting with my classmates.',
        b1Vi: 'Tôi dành khoảng bốn đến năm tiếng mỗi ngày trên mạng—chủ yếu để học tiếng Anh, đọc tài liệu học thuật và trao đổi bài với bạn cùng lớp.',
        b2c1: 'On average, I spend roughly four hours online daily, primarily utilizing cloud platforms for university research, practicing foreign languages, and coordinating team projects.',
        b2c1Vi: 'Trung bình tôi dành khoảng bốn tiếng mỗi ngày trên mạng, chủ yếu sử dụng các nền tảng đám mây để nghiên cứu đại học, luyện ngoại ngữ và phối hợp dự án nhóm.',
        vocab: ['cloud platforms', 'coordinating', 'utilizing']
      },
      {
        qEn: 'Have you ever received scam calls or phishing emails?',
        qVi: 'Bạn đã bao giờ nhận được cuộc gọi lừa đảo hoặc email giả mạo chưa?',
        b1: 'Yes, I sometimes receive strange calls pretending to be delivery staff or bank officers. I never give them my personal information or OTP codes.',
        b1Vi: 'Có, thỉnh thoảng tôi nhận được các cuộc gọi lạ giả danh nhân viên giao hàng hoặc ngân hàng. Tôi không bao giờ cung cấp thông tin cá nhân hay mã OTP cho họ.',
        b2c1: 'Yes, sophisticated phishing emails and impersonation calls have become increasingly common. I remain vigilant and never disclose confidential credentials or OTP codes.',
        b2c1Vi: 'Có, các email giả mạo tinh vi và cuộc gọi mạo danh ngày càng phổ biến. Tôi luôn cảnh giác cao độ và không bao giờ tiết lộ thông tin bảo mật hay mã OTP.',
        vocab: ['phishing', 'impersonation', 'vigilant']
      },
      {
        qEn: 'Do you think laws against cybercrime should be stricter?',
        qVi: 'Bạn có nghĩ luật pháp xử lý tội phạm mạng nên nghiêm khắc hơn không?',
        b1: 'Yes, definitely. Hackers and online scammers steal money from many innocent people, so strict laws and heavy fines are needed to stop them.',
        b1Vi: 'Có, chắc chắn rồi. Tin tặc và kẻ lừa đảo qua mạng chiếm đoạt tiền của nhiều người vô tội, nên cần luật pháp nghiêm minh và mức phạt nặng để ngăn chặn.',
        b2c1: 'Unquestionably. Enacting stringent cybersecurity legislation and harsh criminal penalties is imperative to deter identity theft and financial fraud.',
        b2c1Vi: 'Không nghi ngờ gì nữa. Ban hành luật an ninh mạng nghiêm ngặt và chế tài hình sự thích đáng là điều cấp bách để răn đe nạn đánh cắp danh tính và lừa đảo tài chính.',
        vocab: ['stringent', 'legislation', 'deter']
      }
    ],
    t2Title: 'Favorite Actors & Cinema',
    t2TitleVi: 'Diễn viên yêu thích & Điện ảnh',
    t2Questions: [
      {
        qEn: 'Who is your favorite actor or actress, and why do you admire them?',
        qVi: 'Nam/nữ diễn viên yêu thích của bạn là ai, và tại sao bạn ngưỡng mộ họ?',
        b1: 'My favorite actor is Cillian Murphy. He is a brilliant actor who works seriously on his roles and keeps a quiet, humble private life away from scandals.',
        b1Vi: 'Nam diễn viên yêu thích của tôi là Cillian Murphy. Ông là một diễn viên tài năng, làm việc nghiêm túc với vai diễn và giữ đời tư giản dị, tránh xa tai tiếng.',
        b2c1: 'I deeply admire Cillian Murphy not only for his extraordinary dramatic versatility on screen but also for his fierce protection of his family’s privacy away from tabloid media.',
        b2c1Vi: 'Tôi vô cùng ngưỡng mộ Cillian Murphy không chỉ bởi khả năng biến hóa diễn xuất xuất sắc trên màn ảnh mà còn vì cách ông bảo vệ sự riêng tư của gia đình khỏi báo chí lá cải.',
        vocab: ['versatility', 'privacy', 'tabloid']
      },
      {
        qEn: 'Do paparazzi and media invade the privacy of actors too much?',
        qVi: 'Thợ săn ảnh và truyền thông có đang xâm phạm quá mức đời tư của diễn viên không?',
        b1: 'Yes, paparazzi often follow actors everywhere and take photos of their children without permission, which is unfair and stressful.',
        b1Vi: 'Có, thợ săn ảnh thường bám theo các diễn viên khắp nơi và chụp ảnh con cái họ mà không xin phép, điều đó rất bất công và gây căng thẳng.',
        b2c1: 'Indeed, intrusive paparazzi culture routinely violates celebrities’ fundamental right to privacy, turning their personal lives into commercial clickbait.',
        b2c1Vi: 'Thực sự vậy, văn hóa săn ảnh xâm phạm thô bạo đang thường xuyên vi phạm quyền riêng tư cơ bản của người nổi tiếng, biến đời tư của họ thành món hàng câu khách.',
        vocab: ['intrusive', 'violates', 'fundamental right']
      },
      {
        qEn: 'Do you prefer watching movies at the cinema or at home?',
        qVi: 'Bạn thích xem phim ở rạp chiếu phim hay ở nhà hơn?',
        b1: 'For big action or historical movies, I like going to the cinema for the giant screen and sound, while on rainy days I enjoy watching movies at home.',
        b1Vi: 'Với các bộ phim hành động hoặc lịch sử lớn, tôi thích ra rạp vì màn hình lớn và âm thanh sống động, còn vào ngày mưa tôi thích xem phim ở nhà.',
        b2c1: 'For cinematic blockbusters, the immersive surround sound of a theater is unbeatable, whereas home streaming offers cozy convenience on quiet evenings.',
        b2c1Vi: 'Đối với các bộ phim bom tấn điện ảnh, âm thanh vòm sống động tại rạp là không gì sánh bằng, trong khi xem tại nhà mang lại sự tiện lợi ấm cúng vào những tối yên tĩnh.',
        vocab: ['blockbusters', 'immersive', 'surround sound']
      }
    ],
    p2Situation: 'The city government wants to reduce the problem of people smoking cigarettes in public places (such as hospitals, schools, and bus stops). Three punishment measures are proposed: (A) Fining violators heavily with money, (B) Requiring violators to do compulsory community service (cleaning streets/parks), or (C) Sending violators to prison. Which measure is the most appropriate?',
    p2SituationVi: 'Chính quyền thành phố muốn xử lý triệt để nạn hút thuốc lá nơi công cộng (bệnh viện, trường học, nhà chờ xe buýt). Có 3 biện pháp chế tài: (A) Phạt tiền thật nặng tại chỗ, (B) Buộc lao động công ích (quét dọn đường phố/công viên), hoặc (C) Bỏ tù người vi phạm. Bạn chọn biện pháp nào?',
    p2Chosen: 'A',
    p2Options: [
      {
        letter: 'A',
        title: 'Fining violators heavily with money (Phạt tiền hành chính thật nặng)',
        descVi: 'Đánh trực tiếp vào túi tiền của người hút thuốc nơi cấm, đồng thời thu ngân sách cho y tế công cộng.',
        prosVi: 'Thực thi nhanh gọn ngay tại chỗ, đánh thẳng vào tài chính khiến người vi phạm xót tiền mà từ bỏ ngay, lại bổ sung ngân sách chống tác hại thuốc lá.',
        consVi: 'Cần lắp camera giám sát và đội ngũ kiểm tra thu phạt nghiêm minh.',
        reasoningEn: 'imposing a hefty on-the-spot financial fine directly hits the offender’s wallet, deters repeat violations immediately, and generates revenue for public healthcare.'
      },
      {
        letter: 'B',
        title: 'Compulsory community service (Lao động công ích bắt buộc)',
        descVi: 'Bắt người hút thuốc đi nhặt rác, quét công viên.',
        prosVi: 'Mang tính giáo dục.',
        consVi: 'Tốn rất nhiều nhân sự quản lý, giám sát người vi phạm đi lao động nên khó áp dụng đại trà.',
        reasoningEn: 'supervising thousands of minor offenders doing street cleanup requires excessive administrative manpower.'
      },
      {
        letter: 'C',
        title: 'Sending violators to prison (Phạt tù giam)',
        descVi: 'Bắt giam hình sự người hút thuốc lá nơi công cộng.',
        prosVi: 'Rất khắt khe.',
        consVi: 'Quá cực đoan và bất hợp lý đối với một lỗi vi phạm hành chính, làm quá tải nhà tù và tốn tiền thuế của dân.',
        reasoningEn: 'imprisonment is disproportionately harsh for an administrative offense and would overcrowd prisons.'
      }
    ],
    p2SpeechB1: 'To stop people from smoking in public places like hospitals and bus stops, I strongly believe fining violators heavily with money is the best measure. First, people care a lot about their money. If someone has to pay a heavy fine of one or two million VND just for smoking one cigarette in a hospital, they will regret it immediately and never do it again. Second, fining is quick to carry out and the money collected can be used to support public hospitals. On the other hand, organizing community service requires too many officers to supervise, while sending smokers to prison is far too harsh and unrealistic for a minor offense. Therefore, heavy financial fines are the most practical solution.',
    p2SpeechB1Vi: 'Để ngăn chặn tình trạng hút thuốc lá ở nơi công cộng như bệnh viện và trạm xe buýt, tôi tin chắc rằng phạt tiền thật nặng là biện pháp hiệu quả nhất. Thứ nhất, ai cũng xót tiền của mình. Nếu một người phải nộp phạt một đến hai triệu đồng chỉ vì hút một điếu thuốc trong bệnh viện, họ sẽ tiếc tiền ngay lập tức và không dám tái phạm. Thứ hai, phạt tiền thực hiện rất nhanh gọn và số tiền thu được có thể đóng góp cho quỹ y tế công cộng. Ngược lại, bắt lao động công ích đòi hỏi quá nhiều cán bộ giám sát, còn bỏ tù người hút thuốc thì quá cực đoan và phi thực tế đối với một lỗi hành chính. Do đó, phạt tiền nặng là giải pháp thiết thực nhất.',
    p2SpeechB2C1: 'When addressing the public health nuisance of smoking in restricted areas such as hospitals and transit hubs, imposing hefty financial fines is unequivocally the most pragmatic and effective policy. First and foremost, behavioral economics shows that immediate monetary penalties act as a powerful deterrent; when offenders face a substantial fine on the spot, the financial pain quickly outweighs the urge to smoke. Furthermore, fines are administratively efficient to enforce via security cameras and generate municipal revenue for anti-smoking campaigns. Conversely, organizing compulsory community service entails costly bureaucratic supervision, while imprisonment is a draconian, disproportionate punishment for a non-violent infraction. Ultimately, strict financial fines strike the right balance between deterrence and feasibility.',
    p2SpeechB2C1Vi: 'Khi giải quyết vấn nạn hút thuốc lá tại các khu vực cấm như bệnh viện và trạm giao thông công cộng, áp dụng mức phạt tiền nặng hoàn toàn là chính sách thực tế và hiệu quả nhất. Trước hết, kinh tế học hành vi chỉ ra rằng các khoản phạt tài chính tức thì đóng vai trò như sự răn đe mạnh mẽ; khi người vi phạm phải nộp khoản tiền phạt lớn ngay tại chỗ, sự xót tiền sẽ nhanh chóng dập tắt ý định hút thuốc. Hơn nữa, phạt tiền rất thuận tiện về mặt hành chính thông qua camera giám sát và tạo nguồn thu cho các chiến dịch y tế công cộng. Ngược lại, tổ chức lao động công ích bắt buộc đòi hỏi bộ máy giám sát tốn kém, trong khi phạt tù giam là hình phạt quá hà khắc và không tương xứng với một vi phạm hành chính. Tóm lại, phạt tiền nghiêm khắc tạo nên sự cân bằng chuẩn xác giữa tính răn đe và tính khả thi.',
    p3Central: 'Personal privacy is increasingly threatened on the internet.',
    p3CentralVi: 'Quyền riêng tư cá nhân đang ngày càng bị đe dọa nghiêm trọng trên không gian mạng.',
    p3Prompts: [
      {
        point: 'Unauthorized collection and sale of personal data',
        pointVi: 'Thu thập và mua bán trái phép dữ liệu cá nhân của người dùng',
        exp: 'Many websites, apps, and data brokers track browsing history, phone numbers, and locations to sell to third-party advertisers without explicit consent.',
        expVi: 'Nhiều trang web, ứng dụng và bên môi giới dữ liệu theo dõi lịch sử duyệt web, số điện thoại và vị trí để bán cho bên quảng cáo thứ ba.'
      },
      {
        point: 'Cybercrime, identity theft, and financial fraud',
        pointVi: 'Tội phạm mạng, đánh cắp danh tính và lừa đảo tài chính',
        exp: 'Hackers exploit leaked personal information to impersonate victims, hijack bank accounts, and conduct sophisticated phishing scams.',
        expVi: 'Tin tặc lợi dụng thông tin cá nhân bị rò rỉ để mạo danh nạn nhân, chiếm đoạt tài khoản ngân hàng và thực hiện các vụ lừa đảo tinh vi.'
      },
      {
        point: 'Cyberbullying, harassment, and public shaming',
        pointVi: 'Bắt nạt qua mạng, quấy rối và xâm phạm hình ảnh đời tư',
        exp: 'Private photos or personal stories shared online can be misused by malicious strangers to harass or defame individuals.',
        expVi: 'Hình ảnh riêng tư hoặc câu chuyện cá nhân chia sẻ trên mạng có thể bị kẻ xấu cắt ghép, phát tán nhằm quấy rối hoặc bôi nhọ danh dự.'
      }
    ],
    p3OwnIdea: {
      point: 'Strengthen data protection laws and user cybersecurity awareness',
      pointVi: 'Cần siết chặt luật bảo vệ dữ liệu cá nhân và nâng cao ý thức tự bảo vệ của người dùng',
      exp: 'Both strict government regulations and individual digital literacy are required to safeguard online privacy.',
      expVi: 'Cần kết hợp cả chế tài pháp luật nghiêm ngặt của nhà nước lẫn kỹ năng an toàn số của mỗi cá nhân để bảo vệ quyền riêng tư.'
    },
    p3SpeechB1: 'In the digital age, personal privacy on the internet is facing serious threats. First, many websites and mobile apps secretly collect our personal data—such as our phone numbers, home addresses, and shopping habits—and sell it to advertising companies. That is why we receive so many annoying spam calls every day. Second, leaked personal information leads to cybercrime and financial scams. Hackers can steal passwords or pretend to be police officers to cheat people out of their savings. Third, private photos can be stolen for cyberbullying. Therefore, governments must pass strict data protection laws, and users must be careful about what they share online.',
    p3SpeechB1Vi: 'Trong kỷ nguyên số, quyền riêng tư cá nhân trên internet đang đối mặt với những mối đe dọa nghiêm trọng. Thứ nhất, nhiều trang web và ứng dụng di động âm thầm thu thập dữ liệu cá nhân của chúng ta—như số điện thoại, địa chỉ nhà và thói quen mua sắm—rồi bán cho các công ty quảng cáo. Đó là lý do chúng ta nhận được rất nhiều cuộc gọi rác phiền phức mỗi ngày. Thứ hai, thông tin cá nhân bị rò rỉ dẫn đến tội phạm mạng và lừa đảo tài chính. Tin tặc có thể đánh cắp mật khẩu hoặc giả danh cơ quan chức năng để lừa tiền tiết kiệm của người dân. Thứ ba, ảnh riêng tư có thể bị lấy cắp để bắt nạt trên mạng. Do đó, chính phủ cần ban hành luật bảo vệ dữ liệu nghiêm ngặt và người dùng phải cẩn trọng khi chia sẻ thông tin.',
    p3SpeechB2C1: 'The erosion of personal privacy in cyberspace has become one of the most alarming challenges of the modern digital era. First and foremost, tech conglomerates and unscrupulous data brokers routinely harvest users’ digital footprints—including geolocation, search history, and biometric data—for commercial profiling without transparent consent. Secondly, massive data breaches fuel rampant cybercrime; cybercriminals weaponize leaked credentials to perpetrate identity theft, deepfake impersonation, and bank fraud. Thirdly, the permanence of digital records exposes individuals to doxxing and cyber-harassment when private photos or conversations are leaked online. Consequently, combating these threats requires a dual approach: enforcing stringent data-privacy legislation and educating citizens in proactive digital hygiene.',
    p3SpeechB2C1Vi: 'Sự xói mòn quyền riêng tư cá nhân trên không gian mạng đã trở thành một trong những thách thức đáng báo động nhất của kỷ nguyên số hiện đại. Trước hết, các tập đoàn công nghệ và bên môi giới dữ liệu thiếu minh bạch thường xuyên thu thập dấu chân kỹ thuật số của người dùng—bao gồm vị trí định vị, lịch sử tìm kiếm và dữ liệu sinh trắc học—để phục vụ mục đích thương mại. Thứ hai, các vụ rò rỉ dữ liệu quy mô lớn tiếp tay cho tội phạm mạng hoành hành; kẻ xấu lợi dụng thông tin bị lộ để đánh cắp danh tính, giả mạo bằng công nghệ deepfake và lừa đảo ngân hàng. Thứ ba, tính lưu trữ vĩnh viễn trên mạng khiến cá nhân dễ bị phát tán thông tin đời tư và quấy rối. Do đó, đẩy lùi mối đe dọa này đòi hỏi kết hợp cả luật bảo vệ dữ liệu nghiêm minh lẫn nâng cao kỹ năng an toàn số cho công dân.',
    p3FollowUps: [
      {
        q: 'Why do many young people willingly share so much private information on social media?',
        qVi: 'Tại sao nhiều người trẻ lại tự nguyện chia sẻ quá nhiều thông tin đời tư lên mạng xã hội?',
        b1: 'Because they want to get likes and attention from friends, and many young people do not fully realize the long-term risks of oversharing.',
        b2c1: 'Many youths engage in oversharing due to a desire for social validation—measured in likes and comments—combined with a lack of awareness regarding long-term digital footprints.',
        vi: 'Nhiều bạn trẻ chia sẻ đời tư quá mức do khao khát được công nhận trên mạng—đo bằng lượt thích và bình luận—kết hợp với sự thiếu nhận thức về hệ lụy lâu dài của dấu chân kỹ thuật số.'
      },
      {
        q: 'Should companies that leak customer data be punished severely?',
        qVi: 'Các công ty làm rò rỉ hoặc bán dữ liệu khách hàng có nên bị xử phạt thật nặng không?',
        b1: 'Yes, definitely. Companies must be fined heavily if they fail to protect customer data or sell it illegally.',
        b2c1: 'Unquestionably. Imposing hefty regulatory fines under strict data-protection laws compels corporations to invest in robust encryption and respect consumer privacy.',
        vi: 'Không còn nghi ngờ gì nữa. Áp dụng các khoản phạt hành chính thật nặng theo luật bảo vệ dữ liệu sẽ buộc các doanh nghiệp phải đầu tư vào hệ thống mã hóa an toàn và tôn trọng quyền riêng tư của khách hàng.'
      },
      {
        q: 'What habits should internet users practice every day to stay safe online?',
        qVi: 'Người dùng internet nên thực hành những thói quen nào mỗi ngày để giữ an toàn trên mạng?',
        b1: 'Users should use strong passwords, enable two-step verification, avoid clicking strange links, and think twice before posting personal photos.',
        b2c1: 'Users should adopt multi-factor authentication, regularly audit app permissions, avoid clicking unverified links, and refrain from posting sensitive personal identifiers publicly.',
        vi: 'Người dùng nên bật xác thực đa yếu tố, thường xuyên kiểm tra quyền truy cập của ứng dụng, không nhấp vào đường dẫn lạ và tránh đăng công khai các thông tin định danh cá nhân.'
      }
    ]
  }
];
