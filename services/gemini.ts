import { GoogleGenAI, Type } from "@google/genai";
import { AISuggestionRequest } from "../types";

const apiKey = process.env.API_KEY || '';

// Safely initialize GenAI only if key is present (handled in UI if missing)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateWishes = async (request: AISuggestionRequest): Promise<string[]> => {
  if (!ai) {
    console.error("API Key missing");
    return ["Vui lòng cấu hình API Key để sử dụng tính năng này."];
  }

  const prompt = `
    Bạn là một trợ lý nhân sự chuyên nghiệp. Hãy viết 5 lời chúc ngắn gọn (dưới 30 từ mỗi lời chúc) bằng tiếng Việt cho mục đích: ${request.type === 'birthday' ? 'Chúc mừng sinh nhật' : 'Khen thưởng thành tích'}.
    
    Người nhận: ${request.recipientName || 'Bạn'}.
    Ngữ cảnh thêm: ${request.context || 'Không có'}.
    
    Yêu cầu:
    - Văn phong: Chuyên nghiệp, ấm áp, khích lệ.
    - Trả về kết quả dưới dạng JSON Array chứa các chuỗi string (lời chúc).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const wishes = JSON.parse(jsonText) as string[];
    return wishes;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return ["Không thể tạo lời chúc lúc này. Vui lòng thử lại sau."];
  }
};