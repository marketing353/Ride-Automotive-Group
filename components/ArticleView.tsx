import React, { useRef, useEffect, useState } from 'react';
import { Copy, Check, FileText, Download } from 'lucide-react';

interface ArticleViewProps {
  content: string;
  isGenerating: boolean;
  metaData: { title: string; desc: string };
}

export const ArticleView: React.FC<ArticleViewProps> = ({ content, isGenerating, metaData }) => {
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fallback: If AI ignores rules and outputs markdown, force convert to HTML
  const processedContent = React.useMemo(() => {
    if (!content) return '';
    
    let cleaned = content;

    // 1. Fix Headers (### Title -> <h3>Title</h3>) to prevent markdown headers
    cleaned = cleaned.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    cleaned = cleaned.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');

    // 2. Fix Bold (** text ** or **text**)
    // Uses \s* to handle any amount of whitespace inside the asterisks
    cleaned = cleaned.replace(/\*\*\s*([^*]+?)\s*\*\*/g, '<strong>$1</strong>');

    // 3. Fix Italics (* text *)
    // Uses lookbehind/lookahead to avoid matching unordered list bullets (* Item)
    // Matches *text* but not * at the start of a line
    cleaned = cleaned.replace(/(?<!^\s*)\*\s*([^*]+?)\s*\*(?!\*)/gm, '<em>$1</em>');

    // 4. Cleanup: Remove any double tags if regex over-matched
    cleaned = cleaned
      .replace(/<strong><strong>/g, '<strong>')
      .replace(/<\/strong><\/strong>/g, '</strong>')
      .replace(/<em><em>/g, '<em>')
      .replace(/<\/em><\/em>/g, '</em>');

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

  return (
    <main className="flex-1 bg-gray-100 relative flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-20">
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
      <div className="flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth">
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
                <>
                    <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                    <div ref={bottomRef} className="h-4" />
                </>
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