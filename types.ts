
export interface ArticleConfig {
  keyword: string;
  intent: 'informational' | 'transactional' | 'listicle';
  audience: 'beginners' | 'experts' | 'business';
  length: 'short' | 'standard' | 'long';
  language: 'English' | 'Spanish' | 'French';
  tone: 'professional' | 'casual' | 'enthusiastic' | 'witty' | 'authoritative' | 'empathetic';
  clickbait: boolean;
}

export interface GeneratedContent {
  title: string;
  metaDescription: string;
  htmlContent: string;
  wordCount: number;
  readingTime: number;
}

export interface OutlineItem {
  id: string;
  text: string;
  level: number;
}

export interface SeoMetric {
  name: string;
  score: number;
  fullMark: number;
}
