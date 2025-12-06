// apiService.ts - OpenAI 互換 API を使用するバージョン
import { InquiryData } from '../types';
import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    const apiKey = (window as any).__GEMINI_API_KEY__;
    if (!apiKey) {
      throw new Error('API key is not set');
    }
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return openaiClient;
};

export const parseInquiryText = async (text: string): Promise<InquiryData> => {
  console.log('Parsing inquiry text with OpenAI-compatible API...');

  const prompt = `
あなたは化粧品OEMの企画開発エキスパートです。
以下のクライアントからの問い合わせテキスト（日本語）を分析し、指定されたJSONスキーマに従って情報を抽出・整理してください。
各項目について、内容（value）と、テキストからどれだけ明確に抽出できたかの自信度（confidence）を0.0から1.0の数値で示してください。
情報が見つからない項目は、値（value）を空（""や[]）にし、自信度（confidence）を0.0に設定してください。

問い合わせテキスト:
---
${text}
---

以下のJSON形式で回答してください:
{
  "product_type": { "value": "製品タイプ", "confidence": 0.9 },
  "purpose_goals": { "value": ["目的1", "目的2"], "confidence": 0.8 },
  "target_audience": { "value": "ターゲット層", "confidence": 0.7 },
  "hero_ingredients_preference": { "value": "希望主成分", "confidence": 0.6 },
  "claims_must": { "value": "必須訴求", "confidence": 0.5 },
  "certifications": { "value": ["認証1"], "confidence": 0.4 },
  "allergens_restrictions": { "value": "アレルゲン", "confidence": 0.3 },
  "sensory": { "value": "使用感", "confidence": 0.2 },
  "markets": { "value": "販売国", "confidence": 0.1 },
  "lot_size": { "value": "ロットサイズ", "confidence": 0.0 },
  "budget_band": { "value": "予算", "confidence": 0.0 },
  "lead_time_expectation": { "value": "納期", "confidence": 0.0 },
  "package_preferences": { "value": "パッケージ", "confidence": 0.0 },
  "sustainability": { "value": "サステナビリティ", "confidence": 0.0 },
  "brand_story_tone": { "value": "ブランドコンセプト", "confidence": 0.0 },
  "references": { "value": "参考情報", "confidence": 0.0 },
  "contact_info_internal": { "value": "担当者情報", "confidence": 0.0 }
}
`;

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from API');
    }

    const extractedData = JSON.parse(content);
    return { source: 'form', ...extractedData };
  } catch (error) {
    console.error('OpenAI API call failed for text parsing:', error);
    throw new Error('AIによるテキストの解析に失敗しました。');
  }
};

// 他の関数はダミー実装
export const ingestFileOrUrl = async (input: File | string): Promise<InquiryData> => {
  throw new Error('File/URL ingestion is not implemented yet');
};
