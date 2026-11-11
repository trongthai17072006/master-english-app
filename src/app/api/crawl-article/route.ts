import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targetUrl } = body;

    if (!targetUrl) {
      return NextResponse.json({ error: 'Thiếu đường dẫn URL bài báo.' }, { status: 400 });
    }

    // 1. GỌI WATERCRAWL ĐỂ LẤY VĂN BẢN SẠCH (MARKDOWN)
    const crawlRes = await fetch('https://api.watercrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WATERCRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url: targetUrl,
        format: 'markdown', 
      }),
    });

    if (!crawlRes.ok) {
      throw new Error('Lỗi khi cào dữ liệu từ WaterCrawl');
    }

    const crawlData = await crawlRes.json();
    const markdownContent = crawlData.markdown || crawlData.data?.markdown || '';

    if (!markdownContent) {
       throw new Error('WaterCrawl không trả về nội dung.');
    }

    // 2. GỌI GOOGLE GEMINI ĐỂ PHÂN TÍCH TỪ VỰNG VÀ TẠO BÀI TẬP
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const prompt = `
      Bạn là chuyên gia IELTS. Đọc bài báo dạng Markdown sau và thực hiện 2 việc:
      1. Trích xuất 5 từ vựng/cụm từ học thuật (C1-C2) xuất sắc nhất có trong bài.
      2. Tóm tắt ngữ cảnh chứa các từ đó.
      
      TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SAU, KHÔNG GIẢI THÍCH GÌ THÊM:
      {
        "articleSummary": "Tóm tắt bài báo bằng tiếng Việt",
        "extractedVocab": [
          {
            "word": "từ vựng",
            "meaning": "nghĩa tiếng việt",
            "contextSentence": "câu tiếng Anh chứa từ này trích từ bài báo"
          }
        ]
      }

      Bài báo:
      ${markdownContent}
    `;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      }),
    });

    if (!geminiRes.ok) {
      throw new Error('Lỗi khi gọi Google Gemini');
    }

    const geminiData = await geminiRes.json();
    const finalResult = JSON.parse(geminiData.candidates[0].content.parts[0].text);

    // 3. TRẢ KẾT QUẢ VỀ CHO WEB
    return NextResponse.json({ 
      success: true, 
      sourceUrl: targetUrl,
      data: finalResult 
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
