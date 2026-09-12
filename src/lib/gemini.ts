import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeTriage(complaint: string, observation: string, understanding: string) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      level: {
        type: SchemaType.STRING,
        format: "enum",
        enum: ["Mild", "Moderate", "Severe"],
        description: "The triage level."
      },
      reasoning: {
        type: SchemaType.STRING,
        description: "Your reasoning for the triage level."
      },
      suggestedAction: {
        type: SchemaType.STRING,
        description: "Suggested actions to take."
      }
    },
    required: ["level", "reasoning", "suggestedAction"]
  };

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { 
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  const prompt = `你現在是世界童軍運動組織（WOSM）「免受傷害（Safe from Harm）」政策的傾聽耳（Listening Ear）專業督導。
請根據以下會談內容，將事件嚴格分類為「Mild（輕度）」、「Moderate（中度）」或「Severe（重度）」，並給出判斷理由與建議作法。

【分類標準與台灣法律紅線】
1. Mild (輕度): 想家、焦慮、輕微口角。建議作法：由身邊成年服務員或傾聽耳先陪伴與安撫，提供安全空間。
2. Moderate (中度): 反覆嘲笑排擠、未經同意拍照、持續肢體推擠。建議作法：紀錄並通知 SfH 安全防護團隊評估。
3. Severe (重度/法律紅線): 性騷擾、偷拍、肢體暴力傷害、兒少保護疑慮（如疏忽、虐待），或任何涉及「與未滿 16 歲者發生性觸碰」之行為。此為絕對紅線與公訴罪範圍。建議作法：立即確保安全，通報 SfH 團隊與營本部，並啟動 24 小時法定通報。

【Listening Ear 處置鐵律（極重要）】
在撰寫「建議作法 (suggestedAction)」時，必須嚴守以下原則：
- 不私下查證：LE 僅負責陪伴傾聽，絕不自行調查或查證事件真偽（查證是警政單位的責任）。
- 嚴守界線：清楚認知自己不是心理師或調查員。
- 若判定為 Severe，必須在第一點強烈建議「切勿私下查證，立即通報營本部與 SfH 團隊，啟動 24 小時法定通報」。

【志工提供的會談資料】
主訴內容 (C): ${complaint}
觀察指標 (O): ${observation}
理解摘要 (U): ${understanding}

請嚴格以 JSON 格式輸出，不要包含其他多餘的文字或 markdown 標記（如 \`\`\`json 等），格式如下：
{
  "level": "Mild" | "Moderate" | "Severe",
  "reasoning": "您的判斷理由...",
  "suggestedAction": "建議的後續處置作法..."
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  
  // Clean up potential markdown code block
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  
  return JSON.parse(text);
}
