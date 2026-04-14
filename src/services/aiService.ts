import { SYSTEM_PROMPT_GUIDELINES, cleanGeneratedText } from "../constants";
import { isDemoMode, DEMO_POST_TEXT, DEMO_SVG } from "../demoData";
import { edhecLogoSvgGroup } from "../edhecLogo";

export function getLengthBounds(lengthTarget: string): { min: number; max: number } {
  const t = (lengthTarget || '').toLowerCase();
  if (t.startsWith('short')) return { min: 150, max: 300 };
  if (t.startsWith('long')) return { min: 800, max: 1500 };
  return { min: 300, max: 800 };
}

// Hard char + token caps per length tier (LinkedIn-friendly).
export function getLengthCaps(lengthTarget: string): { maxChars: number; maxTokens: number } {
  const t = (lengthTarget || '').toLowerCase();
  if (t.startsWith('short')) return { maxChars: 500, maxTokens: 200 };
  if (t.startsWith('long')) return { maxChars: 2000, maxTokens: 800 };
  return { maxChars: 1200, maxTokens: 500 };
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function truncateToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

// Simulate typing effect: reveal text character by character over ~2.5s
const simulateStreaming = async (text: string, onChunk: (chunk: string) => void): Promise<string> => {
  const chars = text.split('');
  const totalTime = 2500; // 2.5 seconds
  const interval = totalTime / chars.length;
  for (let i = 0; i < chars.length; i++) {
    onChunk(chars[i]);
    // Batch in groups of 3-5 chars with a small delay for natural feel
    if (i % 4 === 0) {
      await new Promise(r => setTimeout(r, interval * 4));
    }
  }
  return text;
};

export const generatePost = async (params: {
  voiceName: string;
  systemPromptFragment: string;
  platform: string;
  contentType: string;
  lengthTarget: string;
  charLimit: number;
  language: string;
  topic: string;
  stats: string;
  link?: string;
  cta?: string;
  hashtags: string;
  draftInput?: string;
  mode: 'generate' | 'refine';
  cible?: string;
  additionalRules?: string;
  contextSources?: { title: string; content: string }[];
  onChunk?: (chunk: string) => void;
}) => {
  const cibleLine = params.cible ? `- Target audience (cible): ${params.cible}. Adapt vocabulary, depth, and tone to this audience.` : '';
  const contextBlock = (params.contextSources && params.contextSources.length > 0)
    ? `\n\nReference material the post should draw from:\n${params.contextSources.map((s, i) => `[${i + 1}] ${s.title}\n${s.content}`).join('\n\n')}\n`
    : '';
  const { min: minWords, max: maxWords } = getLengthBounds(params.lengthTarget);
  const { maxChars, maxTokens } = getLengthCaps(params.lengthTarget);
  const charLimit = Math.min(params.charLimit || maxChars, maxChars);
  const lengthRule = `STRICT LENGTH RULE: the post must be between ${minWords} and ${maxWords} words AND under ${charLimit} characters. Do not exceed either limit under any circumstances. Count words and characters before responding.
You MUST stay under the character limit. Count carefully. LinkedIn posts should be punchy and scannable, not essays. Use short paragraphs, line breaks, and emojis strategically. Never exceed ${charLimit} characters total.`;
  const linkedInRule = params.platform === 'LinkedIn'
    ? `LINKEDIN POST FORMAT (mandatory):
- Open with a one-line hook on its own line.
- Use short paragraphs of 1 to 3 lines, separated by a blank line.
- No markdown headers, no bullet asterisks. Use line breaks and emojis sparingly for structure.
- Hashtags grouped on the final line, never inline.
- Plain text only. No surrounding quotes.`
    : '';

  const system = params.mode === 'generate'
    ? `You are a content assistant for the EDHEC Management in Innovative Health Chair, a French business school research chair focused on healthcare innovation, digital health, and AI in healthcare.

You are writing a ${params.platform} post on behalf of ${params.voiceName}. ${params.systemPromptFragment}

${SYSTEM_PROMPT_GUIDELINES}
${params.additionalRules || ''}
${contextBlock}

Guidelines:
- Match the language setting: ${params.language}
- Content type is: ${params.contentType}
- Target length: ${params.lengthTarget} (${minWords} to ${maxWords} words)
- Character limit: ${charLimit} : stay under it
${lengthRule}
${linkedInRule}
${cibleLine}
- If FR+EN: write the French version first, then "---" as separator, then the English version
- Append these hashtags at the end: ${params.hashtags}

The post is about: ${params.topic}
Key data points to include: ${params.stats}
Link to include: ${params.link || 'None'}
Desired CTA: ${params.cta || 'None'}

Write the post now. No preamble, no explanation. Just the post.`
    : `You are a content assistant for the EDHEC Management in Innovative Health Chair.

You are refining a draft ${params.platform} post to be published on behalf of ${params.voiceName}. ${params.systemPromptFragment}

${SYSTEM_PROMPT_GUIDELINES}
${params.additionalRules || ''}
${contextBlock}

The user has provided a rough draft or idea below. Rewrite it fully in ${params.voiceName}'s voice while preserving their core intent, key facts, and any specific phrases they clearly want to keep.

Guidelines:
- Match the language setting: ${params.language}
- Target length: ${params.lengthTarget} (${minWords} to ${maxWords} words)
- Character limit: ${charLimit} : stay under it
${lengthRule}
${linkedInRule}
${cibleLine}
- Append these hashtags at the end: ${params.hashtags}

User's draft / idea:
${params.draftInput}

Rewrite this now. No preamble, no explanation. Just the rewritten post.`;

  const userMessage = params.mode === 'generate' ? `Topic: ${params.topic}` : `Draft: ${params.draftInput}`;

  // Demo mode: return hardcoded content with simulated streaming
  if (isDemoMode()) {
    if (params.onChunk) {
      return await simulateStreaming(DEMO_POST_TEXT, params.onChunk);
    }
    return DEMO_POST_TEXT;
  }

  if (params.onChunk) {
    // Try streaming first; fall back to non-streaming if it fails
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, userMessage, stream: true, maxTokens }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Server error');
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream')) {
        // Server returned JSON instead of SSE (streaming not supported)
        const data = await res.json();
        const text = data.content?.[0]?.text || '';
        const cleaned = cleanGeneratedText(text);
        params.onChunk(cleaned);
        return cleaned;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) throw new Error(data.error);
              fullText += data.text;
              params.onChunk(data.text);
            } catch (parseErr: any) {
              if (parseErr.message && !parseErr.message.includes('JSON')) throw parseErr;
              // skip malformed lines
            }
          }
        }
      }

      return cleanGeneratedText(fullText);
    } catch (streamError: any) {
      // Fallback: try non-streaming request
      console.warn('Streaming failed, falling back to non-streaming:', streamError.message);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, userMessage, stream: false, maxTokens }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Server error');
      }

      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      const cleaned = cleanGeneratedText(text);
      params.onChunk(cleaned);
      return cleaned;
    }
  } else {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, userMessage, stream: false, maxTokens }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Server error');
    }

    const data = await res.json();
    const text = data.content[0]?.text || '';
    return cleanGeneratedText(text);
  }
};

export const analyseTone = async (params: {
  posts?: string[];
  images?: { data: string; mimeType: string }[];
}) => {
  const systemInstruction = `You are a writing style analyst. Analyse the provided LinkedIn posts (either as text or images) and return a JSON object with these exact fields:
- styleTags: array of 4-6 short style descriptors (e.g. 'Data-driven', 'Conversational', 'Strategic', 'Personal', 'Provocative', 'Empathetic')
- structurePattern: array of 3-5 steps describing their typical post structure (e.g. ['Hook with stat', 'Context', 'Insight', 'CTA'])
- formalityScore: number 1-10 (1=very casual, 10=very formal)
- emojiUsage: 'none' | 'minimal' | 'moderate' | 'heavy'
- languageNotes: string describing specific vocabulary tendencies, sentence length, paragraph style (max 2 sentences)
- sampleSentence: a single example sentence written in this person's voice on the topic of healthcare innovation
- systemPromptFragment: a 3-4 sentence description of this person's voice suitable for injecting into an AI writing prompt

IMPORTANT: If images are provided, read the text from the screenshots first, then perform the analysis. Return ONLY the JSON object.`;

  // Demo mode: return a sample tone analysis
  if (isDemoMode()) {
    await new Promise(r => setTimeout(r, 1500));
    return {
      styleTags: ['Data-driven', 'Strategic', 'Empathetic', 'Institutional', 'Conversational'],
      structurePattern: ['Hook with stat', 'Key data points', 'Insight / question', 'Call to action'],
      formalityScore: 6,
      emojiUsage: 'moderate' as const,
      languageNotes: 'Uses short impactful sentences mixed with data points. Balances formal institutional tone with accessible language.',
      sampleSentence: "L'innovation en sante n'est pas une option, c'est un imperatif strategique pour l'equite d'acces aux soins.",
      systemPromptFragment: 'Write in a confident, data-informed voice that balances institutional credibility with warmth and accessibility. Use statistics as hooks and pose rhetorical questions to engage the reader. Keep paragraphs short and punchy.',
    };
  }

  const content: any[] = [];

  if (params.posts && params.posts.length > 0) {
    content.push({
      type: 'text',
      text: `Analyze the tone from these text posts:\n\n${params.posts.join("\n\n---\n\n")}`
    });
  }

  if (params.images && params.images.length > 0) {
    params.images.forEach((img, idx) => {
      content.push({
        type: 'text',
        text: `Post Screenshot #${idx + 1}:`
      });
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mimeType,
          data: img.data,
        },
      });
    });
  }

  const res = await fetch('/api/tone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system: systemInstruction, content }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Server error');
  }

  const data = await res.json();
  const responseContent = data.content[0];
  if (responseContent.type === 'text') {
    const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(responseContent.text);
  }
  throw new Error("Unexpected response format");
};

export const generateVisualSvg = async (params: {
  categoryLabel: string;
  headline: string;
  subtitle: string;
  statsArray: string;
  aspectRatio: '1:1' | '4:5' | '9:16';
  additionalRules?: string;
}) => {
  // Demo mode: return sample SVG
  if (isDemoMode()) {
    await new Promise(r => setTimeout(r, 1500));
    return DEMO_SVG;
  }

  const viewBox = params.aspectRatio === '1:1' ? "0 0 1080 1080" : params.aspectRatio === '4:5' ? "0 0 1080 1350" : "0 0 1080 1920";

  // EDHEC logo SVG snippet to embed in the bottom right of every visual
  const logoSnippet = edhecLogoSvgGroup(parseInt(viewBox.split(' ')[2]) - 260, parseInt(viewBox.split(' ')[3]) - 120, 0.35);

  const prompt = `Generate a complete, valid SVG infographic (viewBox="${viewBox}") using the EDHEC Management in Innovative Health visual identity.

Design rules:
- Background: #FAF8F4 (warm off-white)
- Primary heading font: Playfair Display, color #6B1E2E (bordeaux)
- Body font: DM Sans
- Accent colors: coral #D4614A and teal #2A7D6B
- Corner brackets: thin 2px bordeaux lines in top-left and bottom-right corners (decorative, 40px length)
- EDHEC logo: You MUST include the following SVG group in the bottom right corner of the visual. Copy it EXACTLY as provided, do not modify it:
${logoSnippet}
- Source attribution: bottom left, small DM Sans, color #888

${SYSTEM_PROMPT_GUIDELINES}
${params.additionalRules || ''}

Content to include:
- Category label: "${params.categoryLabel}" : small caps, coral, DM Sans, 13px
- Main headline: "${params.headline}" : Playfair Display, bordeaux, 42px, max 2 lines
- Subtitle: "${params.subtitle}" : DM Sans, #555, 18px
- Stats/data callouts: ${params.statsArray} : display as large bold Playfair Display numerals (80px) with labels below in DM Sans 14px. Use coral for one set, teal for another.
- If comparative bar chart data: render horizontal bars, coral for first group, teal for second
- CTA bar (if event/webinar type): full-width dark navy (#1A1F3C) rectangle at bottom, white text, event date prominent
- Generous white space throughout : nothing cramped

Generate clean, valid, complete SVG code only. No explanation. The SVG must render perfectly.`;

  const res = await fetch('/api/visual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Server error');
  }

  const data = await res.json();
  const content = data.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  throw new Error("Unexpected response format");
};
