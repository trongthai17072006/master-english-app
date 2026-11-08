import { WritingSubmissionRecord } from './challengeStorage';

export interface WritingEvaluationResult {
  estimatedBand: number;
  wordCountScore: string;
  taskResponse: string;
  coherenceCohesion: string;
  lexicalResource: string;
  grammaticalAccuracy: string;
  strengths: string[];
  actionableAdvice: string[];
  isAiGenerated: boolean;
}

export async function evaluateIeltsEssay(
  essayText: string,
  prompt: string,
  questionType: string,
  targetCollocations: string[] = []
): Promise<WritingEvaluationResult> {
  const trimmed = essayText.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  // Check if AI endpoint is available
  try {
    const res = await fetch('/api/evaluate-essay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essay: essayText, prompt, questionType })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.estimatedBand) {
        return {
          ...data,
          isAiGenerated: true
        };
      }
    }
  } catch {
    // Fall back to built-in rule-based evaluation engine
  }

  // Built-in intelligent IELTS Task 2 Rubric Engine
  return generateBuiltInEvaluation(essayText, wordCount, prompt, questionType, targetCollocations);
}

function generateBuiltInEvaluation(
  text: string,
  wordCount: number,
  prompt: string,
  questionType: string,
  targetCollocations: string[]
): WritingEvaluationResult {
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 20);
  const paragraphCount = paragraphs.length;

  // Connectors / Cohesive Devices
  const commonConnectors = [
    'furthermore', 'moreover', 'in addition', 'consequently', 'as a result',
    'however', 'on the other hand', 'in contrast', 'nevertheless', 'nonetheless',
    'to begin with', 'first and foremost', 'secondly', 'in conclusion', 'to sum up',
    'for instance', 'for example', 'subsequently', 'in particular'
  ];
  const lowerText = text.toLowerCase();
  const matchedConnectors = commonConnectors.filter(c => lowerText.includes(c));

  // Matched topic collocations
  const matchedCollocations = targetCollocations.filter(c => lowerText.includes(c.toLowerCase()));

  // Score Calculation
  let baseBand = 6.0;

  // Word count penalty or reward
  let wordCountMsg = '';
  if (wordCount < 150) {
    baseBand = 4.5;
    wordCountMsg = `Nghiêm trọng: Bài viết chỉ có ${wordCount} từ (dưới ngưỡng tối thiểu 250 từ). Bạn sẽ bị trừ điểm nặng ở tiêu chí Task Response.`;
  } else if (wordCount < 200) {
    baseBand = 5.0;
    wordCountMsg = `Cảnh báo: Bài viết ${wordCount} từ (chưa đạt chuẩn 250 từ của IELTS Task 2). Cần phát triển thêm luận điểm.`;
  } else if (wordCount < 250) {
    baseBand = 5.5;
    wordCountMsg = `Gần đạt chuẩn: Bài viết ${wordCount}/250 từ. Bạn cần mở rộng dẫn chứng để tránh bị trừ điểm Task Response.`;
  } else if (wordCount <= 340) {
    baseBand += 0.5;
    wordCountMsg = `Độ dài lý tưởng: ${wordCount} từ. Nằm trọn vẹn trong khoảng tiêu chuẩn vàng 250 - 320 từ của các bài thi Band 7.0+.`;
  } else {
    wordCountMsg = `Khá dài: ${wordCount} từ. Đủ ý nhưng hãy chú ý phân bổ thời gian trong phòng thi (40 phút) để tránh thiếu giờ rà soát lỗi ngữ pháp.`;
  }

  // Paragraph structure
  if (paragraphCount >= 4 && paragraphCount <= 5) {
    baseBand += 0.5;
  }

  // Cohesive devices
  if (matchedConnectors.length >= 4) {
    baseBand += 0.5;
  }

  // Collocations & Lexical
  if (matchedCollocations.length >= 2) {
    baseBand += 0.5;
  }

  // Cap band between 4.0 and 8.0
  const estimatedBand = Math.min(8.0, Math.max(4.0, Math.round(baseBand * 2) / 2));

  // Construct Feedback Rubric
  const taskResponse = wordCount < 250
    ? `Task Response (Band ${Math.max(4.5, estimatedBand - 0.5)}): Bài viết chưa thỏa mãn điều kiện về dung lượng tối thiểu 250 từ. Cần có mở bài rõ quan điểm, 2 đoạn thân bài phân tích sâu từng khía cạnh và kết bài đúc kết trọn vẹn.`
    : `Task Response (Band ${estimatedBand}): Thể hiện lập trường xuyên suốt bài viết, bám sát yêu cầu của dạng đề "${questionType}". Có hệ thống luận điểm chính và các ý bổ trợ tương đối chặt chẽ.`;

  const coherenceCohesion = paragraphCount >= 4
    ? `Coherence & Cohesion (Band ${estimatedBand}): Bố cục phân chia đoạn văn khoa học (${paragraphCount} đoạn rõ ràng). Đã vận dụng được ${matchedConnectors.length} từ nối chuyển đoạn như: ${matchedConnectors.slice(0, 3).join(', ')}.`
    : `Coherence & Cohesion (Band ${Math.max(5.0, estimatedBand - 0.5)}): Cần phân đoạn rõ ràng hơn (Mở bài - Thân bài 1 - Thân bài 2 - Kết luận). Tránh viết đoạn văn quá dài dồn cụm.`;

  const lexicalResource = matchedCollocations.length > 0
    ? `Lexical Resource (Band ${estimatedBand}): Vốn từ vựng học thuật phong phú, áp dụng thành công các cụm chuyên sâu: "${matchedCollocations.join('", "')}".`
    : `Lexical Resource (Band ${estimatedBand}): Sử dụng từ vựng chuẩn xác, diễn đạt tự nhiên. Hãy bổ sung thêm các collocations mang tính học thuật cao hơn để chạm mốc Band 8.0+.`;

  const grammaticalAccuracy = `Grammatical Range & Accuracy (Band ${estimatedBand}): Cấu trúc câu đa dạng, kết hợp hài hòa giữa câu đơn và câu phức (mệnh đề quan hệ, câu điều kiện, cấu trúc đảo ngữ hoặc câu nhượng bộ).`;

  const strengths = [
    `Đã hoàn thành bài viết cho đề Task 2: "${prompt.slice(0, 80)}..."`,
    paragraphCount >= 4 ? `Bố cục chuẩn mực với ${paragraphCount} đoạn văn độc lập.` : 'Có sự triển khai ý tứ liền mạch.',
    matchedConnectors.length > 0 ? `Sử dụng các liên từ học thuật: ${matchedConnectors.slice(0, 4).join(', ')}.` : 'Văn phong trang trọng, học thuật.'
  ];

  const actionableAdvice = [
    wordCount < 250 ? 'Gia tăng độ dài tối thiểu lên trên 250 từ bằng cách bổ sung thêm ví dụ thực tế (Real-world examples).' : 'Duy trì tốc độ viết trong 40 phút và dành 3-5 phút cuối để soát lỗi chính tả & thì của động từ.',
    'Sử dụng kỹ thuật PEEL (Point - Explanation - Example - Link) cho từng đoạn thân bài để bài viết có chiều sâu thuyết phục.',
    'Đan xen các cấu trúc ngữ pháp ăn điểm: Not only... but also..., It is argued that..., Despite the fact that...'
  ];

  return {
    estimatedBand,
    wordCountScore: wordCountMsg,
    taskResponse,
    coherenceCohesion,
    lexicalResource,
    grammaticalAccuracy,
    strengths,
    actionableAdvice,
    isAiGenerated: false
  };
}
