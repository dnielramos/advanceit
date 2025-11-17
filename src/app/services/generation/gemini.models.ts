// src/app/core/models/gemini.models.ts

export interface GeminiContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  candidateCount?: number;
}

export interface GeminiSafetySettings {
  category: 'HARM_CATEGORY_HARASSMENT' | 'HARM_CATEGORY_HATE_SPEECH' | 'HARM_CATEGORY_SEXUALLY_EXPLICIT' | 'HARM_CATEGORY_DANGEROUS_CONTENT';
  threshold: 'BLOCK_NONE' | 'BLOCK_ONLY_HIGH' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_LOW_AND_ABOVE';
}

export interface GeminiRequestPayload {
  contents: {
    parts: GeminiContentPart[];
  }[];
  generationConfig?: GeminiGenerationConfig;
  safetySettings?: GeminiSafetySettings[];
}

export interface GeminiSafetyRating {
  category: string;
  probability: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface GeminiCandidate {
  content: {
    parts: GeminiContentPart[];
  };
  finishReason: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER' | 'BLOCKLIST' | 'PROHIBITED_CONTENT' | 'SPII' | 'MALICIOUS_CONTENT';
  safetyRatings?: GeminiSafetyRating[];
  citationMetadata?: any;
}

export interface ImageGenerationResponse {
  candidates: GeminiCandidate[];
  promptFeedback?: any;
}

export interface GeneratedImage {
  imageData: string; // Base64
  generatedText: string;
  metadata: {
    model: string;
    promptTokens: number;
    generationTime: string;
    safetyRatings: GeminiSafetyRating[];
  };
}