
import { InquiryData, ScoredProposal, FullProposal, Material, ClientResearch } from '../types';

// Declare ai and genAIModule variables to hold the lazily-loaded library and its instance.
let ai: any = null;
let genAIModule: any = null;

// In-memory cache to store generated proposals so they can be retrieved for full detail generation
// Since this is a client-side demo, this resets on reload.
const proposalCache = new Map<string, { basic: ScoredProposal, inquiry: InquiryData }>();

// This function dynamically imports the @google/genai library and initializes the
// GoogleGenAI client the first time it's called. On subsequent calls, it returns
// the already loaded module and client instance.
const getAiClientAndModule = async () => {
  if (!ai) {
    // Dynamically import the module.
    genAIModule = await import('@google/genai');
    // Get API key from browser window object (injected by server) or environment variable
    let apiKey = (window as any).__GEMINI_API_KEY__ || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Google Gemini API key is not set. Please set VITE_GEMINI_API_KEY environment variable.');
    }
    ai = new genAIModule.GoogleGenAI({ apiKey });
  }
  return { ai, genAIModule };
};


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper function to define the JSON schema for Gemini. It now takes `Type` as an argument.
const getInquiryDataSchema = (Type: any) => ({
  type: Type.OBJECT,
  properties: {
    product_type: { 
      type: Type.OBJECT, 
      properties: { 
        value: { type: Type.STRING, description: "製品タイプ (例: 化粧水, 美容液)" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    purpose_goals: { 
      type: Type.OBJECT,
      properties: {
        value: { type: Type.ARRAY, items: { type: Type.STRING }, description: "目的・ゴール (例: 保湿, エイジングケア)" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    target_audience: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "ターゲット層 (例: 20代女性、敏感肌)" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    hero_ingredients_preference: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "希望主成分・避けたい成分" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    claims_must: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "必須訴求 (例: 95%オーガニック)" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    certifications: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.ARRAY, items: { type: Type.STRING }, description: "希望認証 (例: COSMOS, Vegan)" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    allergens_restrictions: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "アレルゲン・NG成分" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    sensory: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "使用感・香り・色" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    markets: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "想定販売国・地域" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    lot_size: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "想定ロットサイズ" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    budget_band: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "想定予算" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    lead_time_expectation: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "希望納期" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    package_preferences: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "パッケージ希望" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    sustainability: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "サステナビリティ要件" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    brand_story_tone: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "ブランドコンセプト・トーン" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    references: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "参考製品" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
    contact_info_internal: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.STRING, description: "社内担当者・顧客名" },
        confidence: { type: Type.NUMBER, description: "抽出の信頼度スコア (0.0-1.0)" }
      }
    },
  }
});


export const ingestFormData = async (data: InquiryData): Promise<{ success: boolean }> => {
  console.log('Ingesting form data:', data);
  await delay(500);
  return { success: true };
};

// Helper to convert File to Base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

export const ingestFileOrUrl = async (fileOrUrl: File | string): Promise<InquiryData> => {
  const { ai: localAi, genAIModule: localGenAIModule } = await getAiClientAndModule();

  try {
    if (typeof fileOrUrl === 'string') {
      console.log('Ingesting URL with Gemini:', fileOrUrl);
      // URL processing
      const prompt = `
        あなたは化粧品OEMの企画開発エキスパートです。
        以下のURL（またはURL文字列）から推測される化粧品の製品企画内容を分析し、指定されたJSONスキーマに従って情報を整理してください。
        URL: ${fileOrUrl}
        
        URLの文字列や文脈から、ブランドの方向性、製品タイプ、ターゲット層などを可能な限り推測してください。
      `;
      
      const response = await localAi.models.generateContent({ 
        model: 'gemini-2.5-flash', 
        contents: prompt, 
        config: { 
          responseMimeType: 'application/json',
          responseSchema: getInquiryDataSchema(localGenAIModule.Type),
        } 
      });
      
      const text = response.text.trim();
      const jsonStr = text.startsWith('```json') ? text.substring(7, text.length - 3) : text;
      return { source: 'file', ...JSON.parse(jsonStr) };

    } else {
      // File processing (Actual PDF/Image analysis)
      console.log(`Ingesting File with Gemini: ${fileOrUrl.name} (${fileOrUrl.type})`);
      const base64Data = await fileToBase64(fileOrUrl);

      const prompt = `
        あなたは化粧品OEMの企画開発エキスパートです。
        添付されたドキュメント（PDF等）を詳細に読み込み、クライアントが要望している化粧品の企画内容を分析してください。
        分析結果を、指定されたJSONスキーマに従って抽出・整理してください。
        
        抽出ルール:
        1. ドキュメント内に明記されている具体的な情報（製品タイプ、成分、ターゲット、予算、ロット数など）を優先的に抽出し、confidenceを高く(1.0に近く)設定してください。
        2. 具体的な記載がないが文脈から強く推測できる場合は、その内容を提案し、confidenceを0.5〜0.8程度に設定してください。
        3. ドキュメントの内容と関係のない情報は捏造せず、不明な場合は空欄にし、confidenceを0.0に設定してください。
      `;

      const response = await localAi.models.generateContent({ 
        model: 'gemini-2.5-flash', 
        contents: {
          parts: [
            { 
              inlineData: { 
                mimeType: fileOrUrl.type || 'application/pdf', 
                data: base64Data 
              } 
            },
            { text: prompt }
          ]
        },
        config: { 
          responseMimeType: 'application/json',
          responseSchema: getInquiryDataSchema(localGenAIModule.Type),
        } 
      });
      
      const text = response.text.trim();
      const jsonStr = text.startsWith('```json') ? text.substring(7, text.length - 3) : text;
      return { source: 'file', ...JSON.parse(jsonStr) };
    }
  } catch (error) {
    console.error("Gemini API call failed for file/URL ingestion:", error);
    throw new Error("AIによる情報の抽出に失敗しました。ファイル形式や内容をご確認ください。");
  }
};

export const parseInquiryText = async (text: string): Promise<InquiryData> => {
  console.log('Parsing inquiry text with Gemini...');

  const prompt = `
    あなたは化粧品OEMの企画開発エキスパートです。
    以下のクライアントからの問い合わせテキスト（日本語）を分析し、指定されたJSONスキーマに従って情報を抽出・整理してください。
    各項目について、内容（value）と、テキストからどれだけ明確に抽出できたかの自信度（confidence）を0.0から1.0の数値で示してください。
    情報が見つからない項目は、値（value）を空（""や[]）にし、自信度（confidence）を0.0に設定してください。

    問い合わせテキスト:
    ---
    ${text}
    ---
  `;

  try {
    const { ai: localAi, genAIModule: localGenAIModule } = await getAiClientAndModule();
    const response = await localAi.models.generateContent({ 
      model: 'gemini-2.5-flash', 
      contents: prompt, 
      config: { 
        responseMimeType: 'application/json',
        responseSchema: getInquiryDataSchema(localGenAIModule.Type),
       } 
    });
    const responseText = response.text.trim();
    const jsonStr = responseText.startsWith('```json') ? responseText.substring(7, responseText.length - 3) : responseText;
    const extractedData = JSON.parse(jsonStr);

    return { source: 'form', ...extractedData };
  } catch(error) {
    console.error("Gemini API call failed for text parsing:", error);
    throw new Error("AIによるテキストの解析に失敗しました。");
  }
};

export const parseMaterialData = async (input: File | string, type: 'text' | 'file' | 'url'): Promise<Omit<Material, 'id'>> => {
    console.log(`Parsing material data from ${type}...`);
    const { ai: localAi, genAIModule: localGenAIModule } = await getAiClientAndModule();
    const Type = localGenAIModule.Type;

    const materialSchema = {
        type: Type.OBJECT,
        properties: {
            tradeName: { type: Type.STRING, description: "製品名・商品名" },
            inciName: { type: Type.STRING, description: "INCI名・表示名称" },
            manufacturer: { type: Type.STRING, description: "メーカー名" },
            description: { type: Type.STRING, description: "製品の詳細説明" },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "効果効能・メリット" },
            category: { type: Type.STRING, description: "カテゴリ (例: 保湿剤, 界面活性剤)" },
            recommendedConcentration: { type: Type.STRING, description: "推奨濃度" },
            costLevel: { type: Type.STRING, description: "コスト感 (High, Medium, Low)" },
            price: { type: Type.STRING, description: "価格情報 (例: 15,000円/kg)" },
            origin: { type: Type.STRING, description: "原料の産地 (例: 北海道, ブルガリア)" },
            country: { type: Type.STRING, description: "原産国 (例: 日本, フランス)" },
            sustainability: { type: Type.STRING, description: "サステナビリティ情報 (認証など)" }
        }
    };

    let contents: any = "";
    let promptText = "提供された情報から化粧品原料のスペックを抽出してください。不明な情報は空文字にしてください。";

    if (type === 'file' && input instanceof File) {
        const base64Data = await fileToBase64(input);
        contents = {
            parts: [
                { inlineData: { mimeType: input.type || 'application/pdf', data: base64Data } },
                { text: promptText }
            ]
        };
    } else if (type === 'url') {
        // URL の場合はサーバーから内容を取得
        try {
            const response = await fetch(`/api/fetch-url?url=${encodeURIComponent(input as string)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch URL content');
            }
            const data = await response.json();
            promptText += `\n\n入力データ:\n${data.content}`;
            contents = promptText;
        } catch (error) {
            console.error('Error fetching URL:', error);
            throw new Error('URLからのコンテンツ取得に失敗しました。');
        }
    } else {
        // text
        promptText += `\n\n入力データ:\n${input}`;
        contents = promptText;
    }

    try {
        const response = await localAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: 'application/json',
                responseSchema: materialSchema,
            }
        });
        const text = response.text.trim();
        const jsonStr = text.startsWith('```json') ? text.substring(7, text.length - 3) : text;
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Failed to parse material data:", error);
        throw new Error("原料情報の抽出に失敗しました。");
    }
};

export const performClientResearch = async (companyName: string, url: string = ""): Promise<ClientResearch> => {
    console.log(`Researching client: ${companyName}`);
    const { ai: localAi } = await getAiClientAndModule();

    // Use Google Search Grounding to get recent info
    const prompt = `
      以下の企業について、最近のニュース、SNSでの話題、公式発表などをリサーチしてください。
      
      企業名: ${companyName}
      ${url ? `URL: ${url}` : ''}

      以下の点に注目して情報を収集し、**300文字程度で簡潔に要約（サマリー）**してください：
      1. 最近の活動内容、新製品発売、プレスリリース
      2. SNS等でのブランドの雰囲気、顧客層の反応
      3. 企業としての戦略的な注力分野（例：サステナビリティ、エイジングケア、特定の成分など）

      出力は箇条書きを活用し、一目で状況が把握できるようにしてください。
    `;

    try {
        const response = await localAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }] // Enable Google Search
            }
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const extractedUrls = groundingChunks
            .map((chunk: any) => chunk.web?.uri)
            .filter((uri: string) => uri);

        const summary = response.text;

        return {
            companyName,
            websiteUrl: url,
            summary: summary,
            recentTopics: ["要約を参照"],
            brandVibe: "調査結果を参照",
            extractedUrls: extractedUrls
        };
    } catch (error) {
        console.error("Client research failed:", error);
        throw new Error("企業リサーチに失敗しました。");
    }
};


export const getMatchingProposals = async (data: InquiryData, availableMaterials: Material[] = []): Promise<ScoredProposal[]> => {
    console.log('Getting matching proposals for:', data);
    console.log('Available internal materials:', availableMaterials.length);
    
    const { ai: localAi, genAIModule: localGenAIModule } = await getAiClientAndModule();
    const Type = localGenAIModule.Type;

    // Construct material context
    let materialContext = "";
    if (availableMaterials.length > 0) {
        materialContext = `
        【重要：自社原料データベース】
        以下のJSONデータは、自社が保有する利用可能な原料リストです。
        提案を作成する際は、クライアントの要望に合致する限り、**可能な限りこのリスト内の原料を優先して**使用してください。
        自社原料を使用した場合は、scoringReasonsにその旨を記載して加点してください。

        自社原料リスト:
        ${JSON.stringify(availableMaterials, null, 2)}
        `;
    }

    // Construct client research context
    let researchContext = "";
    if (data.clientResearch) {
        researchContext = `
        【クライアント企業リサーチ情報】
        以下の情報は、クライアント企業「${data.clientResearch.companyName}」に関する最新のWebリサーチ結果です。
        提案を作成する際は、これらの情報（最近の動向、ブランドの雰囲気、注力分野）を考慮し、
        「クライアントの現在の状況や戦略に寄り添った」提案内容にしてください。

        リサーチ概要:
        ${data.clientResearch.summary}
        `;
    }

    const prompt = `
      あなたは化粧品OEMの熟練プランナーです。
      クライアントから以下の要件（InquiryData）を受け取りました。
      この要件に最も合致する、魅力的で実現性の高い製品提案を3つ作成してください。

      InquiryData:
      ${JSON.stringify(data, null, 2)}

      ${materialContext}

      ${researchContext}

      提案作成のルール:
      1. クライアントの要望（製品タイプ、成分、予算など）を最大限尊重してください。
      2. 「ランク1」は要望に最も忠実な「ベストマッチ」案にしてください。
      3. 「ランク2」と「ランク3」は、少し視点を変えた提案（例：コスト重視、トレンド重視、機能性重視）を混ぜてバリエーションを出してください。
      4. 自社原料リストにある成分を使用した場合は、scoringReasonsに「自社原料活用」として加点理由を含めてください。
      5. クライアントリサーチ情報がある場合は、その内容（最近のニュースやSNSの話題）に触れ、なぜこの提案が今のクライアントに適しているかの理由を含めてください。
      6. スコア(score)は0-100点で評価してください。

      出力形式:
      JSON配列で返してください。各要素は以下のスキーマに従ってください。
    `;

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "提案ID (ユニークな文字列)" },
          rank: { type: Type.INTEGER, description: "順位 (1, 2, 3)" },
          score: { type: Type.NUMBER, description: "マッチングスコア (0-100)" },
          productNameSuggestion: { type: Type.STRING, description: "製品名の提案 (日本語名 / 英語名 の形式。例: 'ボタニカル化粧水 / Botanical Toner')" },
          conceptSummary: { type: Type.STRING, description: "コンセプト概要 (50-100文字程度)" },
          keyFeatures: { type: Type.ARRAY, items: { type: Type.STRING }, description: "主な特徴3点" },
          scoringReasons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                feature: { type: Type.STRING },
                reason: { type: Type.STRING },
                scoreEffect: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    };

    try {
      const response = await localAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        }
      });

      const text = response.text.trim();
      const jsonStr = text.startsWith('```json') ? text.substring(7, text.length - 3) : text;
      const proposals: ScoredProposal[] = JSON.parse(jsonStr);

      // Cache proposals so we can generate details later
      proposals.forEach(p => {
        proposalCache.set(p.id, { basic: p, inquiry: data });
      });

      return proposals;

    } catch (error) {
      console.error("Gemini API failed to generate matching proposals:", error);
      // Fallback to mock data if AI fails
      const fallbackType = data.product_type.value || "化粧品";
      return [
        {
            id: 'fallback-1',
            rank: 1,
            score: 80,
            productNameSuggestion: `${fallbackType} 提案 A / ${fallbackType} Proposal A`,
            conceptSummary: 'AI生成に一時的に失敗しましたが、要件に基づいた標準的な提案です。',
            keyFeatures: ['要件準拠', '短納期', 'コストパフォーマンス'],
            scoringReasons: [],
        }
      ];
    }
};

export const generateFullProposal = async (proposalId: string, availableMaterials: Material[] = []): Promise<FullProposal> => {
    console.log('Generating full proposal for:', proposalId);
    
    const cacheHit = proposalCache.get(proposalId);
    const { ai: localAi, genAIModule: localGenAIModule } = await getAiClientAndModule();
    const Type = localGenAIModule.Type;

    // Construct material context
    let materialContext = "";
    if (availableMaterials.length > 0) {
        materialContext = `
        【自社原料データベース (詳細提案用)】
        以下のJSONデータは、自社が保有する利用可能な原料リストです。
        成分表(mainIngredients)を作成する際、これらの原料名(tradeName)やINCI名を使用し、
        自社原料を使用した場合は isInternalMaterial: true を設定してください。

        自社原料リスト:
        ${JSON.stringify(availableMaterials, null, 2)}
        `;
    }

    // Construct client research context
    let researchContext = "";
    if (cacheHit && cacheHit.inquiry.clientResearch) {
        researchContext = `
        【クライアント企業リサーチ情報】
        概要: ${cacheHit.inquiry.clientResearch.summary}
        
        メールの下書き(emailDrafts)やコンセプト詳細を作成する際は、
        「御社の最近の〇〇というニュースを拝見し...」や「SNSでの〇〇というトレンドを踏まえ...」といった
        具体的な言及を入れて、パーソナライズされた内容にしてください。
        `;
    }
    
    let promptContext = "";
    if (cacheHit) {
      promptContext = `
        以下の製品提案(Basic Proposal)と、元のクライアント要件(InquiryData)に基づいて、詳細な製品仕様書(Full Proposal)を作成してください。

        InquiryData:
        ${JSON.stringify(cacheHit.inquiry, null, 2)}

        Basic Proposal:
        ${JSON.stringify(cacheHit.basic, null, 2)}
      `;
    } else {
      promptContext = `
        提案ID: ${proposalId} の詳細な製品仕様書を作成してください。
        コンテキストが見つからないため、一般的な高品質な化粧品OEM提案として作成してください。
      `;
    }

    const prompt = `
      あなたは化粧品OEMのエキスパートです。
      ${promptContext}

      ${materialContext}

      ${researchContext}

      以下のJSONスキーマに従って、日本語で詳細な提案書を出力してください。
      (処理速度向上のため、英語の生成は不要です)
      
      【重要：メール下書き(emailDrafts)について】
      メールはそのまま顧客に送信できる品質が必要です。以下の点に特に注意してください：
      1. レイアウト: **可読性を最優先してください**。
         - 段落の間には必ず空白行（改行2回）を入れてください。
         - 詰まった文章は絶対に避けてください。
         - 重要なポイントは箇条書きにしてください。
      2. バリエーション: 相手や状況に合わせて使い分けられるよう、3つのパターン（Standard, Formal, Casual）を生成してください。
         - Standard: バランスの取れた標準的なビジネスメール。
         - Formal: 礼儀正しく、堅実な印象を与えるフォーマルなメール。
         - Casual: 既存顧客やベンチャー企業向けなど、少し親しみやすさを出したメール。
      3. 内容: 提案のハイライトを含め、ネクストアクションを促す内容にしてください。

      【重要：エグゼクティブサマリー(executiveSummary)について】
      提案書の冒頭に配置するため、この提案の魅力、クライアントにとってのメリット、差別化ポイントを150文字程度で簡潔かつ強力にまとめてください。
    `;

    const contentSchema = {
      type: Type.OBJECT,
      properties: {
        executiveSummary: { type: Type.STRING, description: "提案書全体の要約。提案の魅力とメリットを150文字程度で簡潔に。" }, 
        productNameSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        tagline: { type: Type.STRING },
        conceptSummary: { type: Type.STRING },
        mainIngredients: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT, 
            properties: {
              inci: { type: Type.STRING },
              commonName: { type: Type.STRING },
              percentageRange: { type: Type.STRING },
              isInternalMaterial: { type: Type.BOOLEAN, description: "自社原料リストにある原料の場合true" }
            }
          } 
        },
        expectedFunctions: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT, 
            properties: {
              func: { type: Type.STRING },
              evidence: { type: Type.STRING }
            }
          } 
        },
        packageProposals: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              capacity: { type: Type.STRING },
              material: { type: Type.STRING },
              moq: { type: Type.STRING },
              leadTime: { type: Type.STRING },
              decoration: { type: Type.STRING },
              costRange: { type: Type.STRING }
            }
          }
        },
        manufacturingEstimate: {
          type: Type.OBJECT,
          properties: {
            lotSize: { type: Type.STRING },
            leadTime: { type: Type.STRING },
            schedule: { type: Type.STRING }
          }
        },
        costRange: {
          type: Type.OBJECT,
          properties: {
            materials: { type: Type.STRING },
            filling: { type: Type.STRING },
            container: { type: Type.STRING },
            printing: { type: Type.STRING },
            total: { type: Type.STRING }
          }
        },
        regulatoryNotes: { type: Type.STRING },
        risksAndUncertainties: { type: Type.STRING },
        nextActions: { type: Type.ARRAY, items: { type: Type.STRING } },
        emailDrafts: {
          type: Type.OBJECT,
          properties: {
            standard: { type: Type.STRING, description: "標準的なビジネスメール。段落間に空白行を入れる。" },
            formal: { type: Type.STRING, description: "堅めの丁寧なビジネスメール。段落間に空白行を入れる。" },
            casual: { type: Type.STRING, description: "親しみやすいトーンのメール。段落間に空白行を入れる。" }
          }
        }
      }
    };

    try {
      const response = await localAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: contentSchema, // Use content schema directly, not wrapped in { jp, en }
        }
      });

      const text = response.text.trim();
      const jsonStr = text.startsWith('```json') ? text.substring(7, text.length - 3) : text;
      const content = JSON.parse(jsonStr);
      
      // Inject client research data from cache if available
      if (cacheHit && cacheHit.inquiry.clientResearch) {
          content.clientResearch = cacheHit.inquiry.clientResearch;
      }

      // Backward compatibility mapping for emailDraft
      if (content.emailDrafts) content.emailDraft = content.emailDrafts.standard;

      // Duplicate content for both jp and en to satisfy the interface without double generation
      return {
        id: proposalId,
        jp: content,
        en: content 
      };

    } catch (error) {
      console.error("Gemini API failed to generate full proposal:", error);
      throw new Error("詳細提案書の生成に失敗しました。");
    }
};
