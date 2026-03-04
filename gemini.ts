import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const nameConstellation = async (words: string[]) => {
  const prompt = `你是一位古老的天文学家。我在这片星海中连接了以下几个词汇：${words.join('、')}。
请根据这些词汇的意境，为这个新发现的星座命名（例如“沧海赤子座”、“余烬回声座”等），并用一段简短、充满诗意和宇宙感的话（约50字）描述它的含义。
请严格返回 JSON 格式，包含 "name" 和 "description" 两个字段。`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          description: { type: "STRING" }
        },
        required: ["name", "description"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateEpilogue = async (constellations: {name: string, words: string[]}[]) => {
  const prompt = `你是一位宇宙的观测者。一位旅人刚刚结束了他在“信号彼端”的探索。
他在这片星海中创造了以下星座：
${constellations.map(c => `- ${c.name} (由词汇组成：${c.words.join('、')})`).join('\n')}

请根据他创造的这些星座，为他的这趟旅程写一段独一无二的结语（约150字）。
这段话应该充满仪式感、哲学意味和对宇宙的敬畏，升华他的探索之旅。`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text;
};
