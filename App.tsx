import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ArticleView } from './components/ArticleView';
import { AnalysisSidebar } from './components/AnalysisSidebar';
import { ArticleConfig, OutlineItem } from './types';
import { generateSEOArticleStream } from './services/geminiService';
import { PenTool } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<ArticleConfig>({
    keyword: '',
    intent: 'informational',
    audience: 'beginners',
    length: 'standard',
    language: 'English',
    tone: 'professional',
    clickbait: false
  });

  const [content, setContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [metaData, setMetaData] = useState({ title: '', desc: '' });
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [wordCount, setWordCount] = useState(0);

  // Parse content to extract metadata and outline
  useEffect(() => {
    // 1. Word Count (strip HTML tags)
    const text = content.replace(/<[^>]*>/g, ' ');
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    setWordCount(words);

    // 2. Extract Title (H1)
    const h1Match = content.match(/<h1>(.*?)<\/h1>/);
    const title = h1Match ? h1Match[1] : '';

    // 3. Extract Meta Description
    // Looking for the div id="meta-desc" or "meta-description"
    const metaMatch = content.match(/<div id="meta-description"[^>]*>(.*?)<\/div>/) || content.match(/<div id="meta-desc"[^>]*>(.*?)<\/div>/);
    const desc = metaMatch ? metaMatch[1] : '';

    if (title || desc) {
        setMetaData({ title, desc });
    }

    // 4. Build Outline (H2 and H3)
    const outlineItems: OutlineItem[] = [];
    const headingRegex = /<(h[23])[^>]*>(.*?)<\/\1>/g;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      outlineItems.push({
        id: `heading-${outlineItems.length}`, // We would normally inject IDs into HTML, for now just tracking
        text: match[2].replace(/<[^>]*>/g, ''), // Strip inner tags
        level: parseInt(match[1].charAt(1))
      });
    }
    setOutline(outlineItems);

  }, [content]);

  const handleGenerate = useCallback(async () => {
    if (!config.keyword) return;

    setIsGenerating(true);
    setContent('');
    setMetaData({ title: '', desc: '' });
    
    try {
      await generateSEOArticleStream(config, (chunk) => {
        setContent(prev => prev + chunk);
      });
    } catch (error) {
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [config]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white text-gray-900 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm relative">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white w-9 h-9 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
                <PenTool className="w-5 h-5" />
            </div>
            <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">SEO-Matic <span className="text-indigo-600">Pro</span></h1>
                <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">AI Content Forge</span>
            </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-gray-500">
            <span>v2.7.0</span>
            <div className="h-4 w-px bg-gray-300"></div>
            <span className="text-indigo-600">Pro Plan Active</span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
            config={config} 
            setConfig={setConfig} 
            isGenerating={isGenerating} 
            onGenerate={handleGenerate} 
            wordCount={wordCount}
        />
        
        <ArticleView 
            content={content} 
            isGenerating={isGenerating} 
            metaData={metaData}
        />
        
        <AnalysisSidebar 
            outline={outline} 
            wordCount={wordCount} 
            keyword={config.keyword} 
            content={content}
        />
      </div>
    </div>
  );
};

export default App;