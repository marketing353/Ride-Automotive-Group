
import React, { useRef, useEffect, useState } from 'react';
import { Copy, Check, FileText, Download, Image as ImageIcon, Search, Loader2 } from 'lucide-react';
import { generateImage } from '../services/geminiService';

interface ArticleViewProps {
  content: string;
  isGenerating: boolean;
  metaData: { title: string; desc: string };
}

// Sub-component for interactive image blocks
const ImageBlock: React.FC<{ prompt: string }> = ({ prompt }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const data = await generateImage(prompt);
    if (data) setImageUrl(data);
    setLoading(false);
  };

  const handleGoogleSearch = () => {
    window.open(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(prompt)}`, '_blank');
  };

  if (imageUrl) {
    return (
      <figure className="my-8">
        <img src={imageUrl} alt={prompt} className="w-full h-auto rounded-lg shadow-md" />
        <figcaption className="text-center text-sm text-gray-500 mt-2 italic">{prompt}</figcaption>
      </figure>
    );
  }

  return (
    <div className="my-8 p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center gap-4 text-center transition-all hover:border-indigo-300">
      <div className="bg-white p-3 rounded-full shadow-sm">
        <ImageIcon className="w-6 h-6 text-indigo-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 max-w-md mx-auto mb-1">
            Visual Idea: {prompt}
        </p>
        <p className="text-xs text-gray-400">Generate a unique AI image or find one on Google</p>
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
          {loading ? 'Generating...' : 'Generate AI Image'}
        </button>
        <button 
          onClick={handleGoogleSearch}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-md hover:bg-gray-50 transition shadow-sm"
        >
          <Search className="w-3 h-3" />
          Search Google Images
        </button>
      </div>
    </div>
  );
};

export const ArticleView: React.FC<ArticleViewProps> = ({ content, isGenerating, metaData }) => {
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fallback: If AI ignores rules and outputs markdown, force convert to HTML
  const processedContent = React.useMemo(() => {
    if (!content) return '';
    
    let cleaned = content;

    // 1. Fix Headers (### Title -> <h3>Title</h3>)
    cleaned = cleaned.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    cleaned = cleaned.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    cleaned = cleaned.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // 2. Fix Bold (** text ** or **text**) - Aggressive
    // Handles multiline bolding which sometimes happens in long gens
    cleaned = cleaned.replace(/\*\*\s?([^*]+?)\s?\*\*/g, '<strong>$1</strong>');

    // 3. Fix Italics (* text *)
    cleaned = cleaned.replace(/(?<!^\s*)\*\s*([^*]+?)\s*\*(?!\*)/gm, '<em>$1</em>');

    // 4. Cleanup lists if markdown lists slipped through
    cleaned = cleaned.replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>');

    return cleaned;
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(processedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([processedContent], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = `article-${Date.now()}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Auto-scroll logic during generation
  useEffect(() => {
    if (isGenerating && bottomRef.current) {
        const scrollContainer = bottomRef.current.parentElement;
        if (scrollContainer) {
            const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 200;
            if (isNearBottom) {
                 bottomRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
  }, [processedContent, isGenerating]);

  // Content Parser: Splits HTML by Image Placeholders to render React Components
  const renderContent = () => {
    if (!processedContent) return null;

    // Regex matches the placeholder div and captures the data-prompt attribute value
    // Format: <div class="image-placeholder" data-prompt="THE_PROMPT">...</div>
    const parts = processedContent.split(/(<div class="image-placeholder"[^>]*data-prompt="[^"]*"[^>]*>.*?<\/div>)/g);
    
    return parts.map((part, index) => {
        // Check if this part is a placeholder
        const match = part.match(/data-prompt="([^"]*)"/);
        
        if (match && match[1]) {
            return <ImageBlock key={`img-${index}`} prompt={match[1]} />;
        }
        
        // Otherwise render as HTML
        return <div key={`text-${index}`} dangerouslySetInnerHTML={{ __html: part }} className="inline" />;
    });
  };

  return (
    <main className="flex-1 bg-gray-100 relative flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-20 shadow-sm">
         <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
            {isGenerating ? 'AI Engine Active' : 'Ready'}
         </div>
         <div className="flex gap-2">
            {content && (
                <>
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Download
                </button>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied HTML' : 'Copy HTML'}
                </button>
                </>
            )}
         </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-gray-100">
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl min-h-[800px] flex flex-col border border-gray-200 ring-1 ring-black/5">
          
          {/* Metadata Display */}
          {(metaData.title || metaData.desc) && (
              <div className="bg-slate-50 border-b border-gray-100 p-6 rounded-t-xl space-y-3">
                  {metaData.title && (
                      <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">SEO Title Tag</span>
                          <div className="text-blue-600 font-medium text-sm mt-1">{metaData.title}</div>
                      </div>
                  )}
                  {metaData.desc && (
                      <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Meta Description</span>
                          <div className="text-gray-600 text-sm mt-1 leading-snug">{metaData.desc}</div>
                      </div>
                  )}
              </div>
          )}

          {/* Content Body */}
          <div className="p-12 prose-editor flex-1">
            {!processedContent ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-6 opacity-60 min-h-[400px]">
                    <FileText className="w-24 h-24 stroke-1" />
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-500">Ready to Write</h3>
                        <p className="max-w-xs mx-auto mt-2 text-sm text-gray-400">Configure your topic on the left and hit generate to create a professional article.</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col">
                    {renderContent()}
                    <div ref={bottomRef} className="h-4" />
                </div>
            )}
          </div>
          
          <div className="bg-gray-50 border-t border-gray-200 p-4 text-center text-xs text-gray-400 rounded-b-xl">
             Generated by SEO-Matic Engine 2025 • Gemini 2.5 Flash
          </div>
        </div>
        <div className="h-20" /> {/* Bottom spacer */}
      </div>
    </main>
  );
};
