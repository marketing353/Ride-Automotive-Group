import { GoogleGenAI } from "@google/genai";
import { ArticleConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const generateSEOArticleStream = async (
  config: ArticleConfig, 
  onChunk: (text: string) => void
): Promise<void> => {
  
  const lengthDetails = {
    short: "around 600-800 words, concise",
    standard: "around 1200-1500 words, depth",
    long: "over 2500 words, exhaustive"
  };

  const titleInstruction = config.clickbait
    ? "The H1 Title MUST be highly clickbait, using power words (e.g., 'Shocking', 'Ultimate', 'Insane'), and psychologically compelling the user to click."
    : "The H1 Title MUST be SEO-optimized, clear, and professional.";

  // Heavily optimized for Readability and Flow
  const systemInstruction = `You are an expert copywriter who specializes in HIGH READABILITY content.
  Your goal is to write content that flows like water, keeping the reader glued to the screen.
  
  CRITICAL READABILITY RULES:
  1. **Short Sentences**: Keep sentences under 20 words where possible.
  2. **Short Paragraphs**: STRICT LIMIT of 3-4 sentences per paragraph. Wall of text = Fail.
  3. **Simple Vocabulary**: Write at an 8th-grade reading level. Use "use" instead of "utilize".
  4. **Active Voice**: Avoid passive voice. Say "You can do X" not "X can be done".
  5. **Transitional Phrases**: Use "Bucket Brigades" and transitional words to connect ideas smoothly.
     - Examples: "Here's the deal:", "But that's not all.", "However,", "On the other hand,", "Consequently,".
  
  CRITICAL FORMATTING RULES:
  1. Output ONLY raw HTML. No \`\`\` code blocks.
  2. STRICTLY NO MARKDOWN. NO **bold** or *italics* or ## headers.
  3. Use ONLY: <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>.
  4. ALWAYS use <strong> tag for bold text. NEVER use **text**.
  5. LISTS MUST BE HTML: Use <ul><li>...</li></ul>. DO NOT use hyphens (- item) or asterisks (* item) for lists.
  6. The first element MUST be an <h1> tag. ${titleInstruction}
  7. The second element MUST be a hidden <div> with id="meta-description" containing the meta description.
  
  Tone: ${config.tone}. Language: ${config.language}.
  `;

  const prompt = `
    Write a ${config.length} article (${lengthDetails[config.length]}) about "${config.keyword}".
    
    Intent: ${config.intent}. Target Audience: ${config.audience}.
    
    Structure Instructions:
    1. H1 Title (${config.clickbait ? 'CLICKBAIT/HIGH-CTR' : 'Standard SEO'}).
    2. Hidden Meta Description.
    3. Introduction: Start with a Hook. Address the user's pain point immediately.
    4. Body: Use H2s and H3s. Break up text with Bullet Points (<ul>) frequently.
    5. Conclusion.
    
    Writing Style Checklist:
    - [ ] Did I use short paragraphs?
    - [ ] Did I use transitional words (e.g., "Furthermore", "In contrast", "Simply put")?
    - [ ] Is the content easy to scan?
    
    Ensure the content is optimized for the keyword "${config.keyword}".
    
    IMPORTANT: Do NOT output Markdown. Use HTML tags only. Use <strong> for bold. Use <ul><li> for lists.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85, // Higher temp for more natural/human flow
      }
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};