
import React from 'react';
import { ArticleConfig } from '../types';
import { Settings2, Zap, Target, Users, Type, Globe, MessageSquare, Flame, Image as ImageIcon, HelpCircle } from 'lucide-react';

interface SidebarProps {
  config: ArticleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ArticleConfig>>;
  isGenerating: boolean;
  onGenerate: () => void;
  wordCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, isGenerating, onGenerate, wordCount }) => {
  
  // Initialize default values
  React.useEffect(() => {
    setConfig(prev => ({
      ...prev,
      language: prev.language || 'English',
      tone: prev.tone || 'professional',
      clickbait: prev.clickbait ?? false,
      includeImages: prev.includeImages ?? true,
      includeFAQ: prev.includeFAQ ?? true,
      secondaryKeywords: prev.secondaryKeywords || ''
    }));
  }, []);

  const handleChange = (field: keyof ArticleConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const readingTime = Math.ceil(wordCount / 200);

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 z-10 flex-col">
      <div className="p-6 flex-1 overflow-y-auto">
        <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          Configuration
        </h2>

        <div className="space-y-6">
          {/* Main Keyword */}
          <div className="group">
            <label className="text-sm font-bold text-gray-700 mb-2 block group-focus-within:text-indigo-600 transition-colors">
              Main Keyword
            </label>
            <input
              type="text"
              value={config.keyword}
              onChange={(e) => handleChange('keyword', e.target.value)}
              placeholder="e.g. SaaS Marketing Trends"
              className="w-full rounded-lg border-gray-300 bg-gray-50 border p-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              disabled={isGenerating}
            />
          </div>

          {/* Secondary Keywords */}
          <div className="group">
            <label className="text-sm font-bold text-gray-700 mb-2 block flex justify-between">
              <span>LSI / Secondary Keywords</span>
              <span className="text-xs text-gray-400 font-normal">Optional</span>
            </label>
            <textarea
              value={config.secondaryKeywords}
              onChange={(e) => handleChange('secondaryKeywords', e.target.value)}
              placeholder="Comma separated (e.g. B2B growth, content strategy, lead gen)"
              className="w-full rounded-lg border-gray-300 bg-gray-50 border p-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all h-20 resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Toggles Grid */}
          <div className="space-y-3">
             {/* Clickbait Toggle */}
            <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Flame className={`w-4 h-4 ${config.clickbait ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-700">Clickbait Title</span>
                </div>
                <button 
                    onClick={() => handleChange('clickbait', !config.clickbait)}
                    className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${config.clickbait ? 'bg-orange-500' : 'bg-gray-300'}`}
                    disabled={isGenerating}
                >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${config.clickbait ? 'left-5' : 'left-1'}`}></div>
                </button>
            </div>

            {/* Images Toggle */}
            <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ImageIcon className={`w-4 h-4 ${config.includeImages ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-700">Image Ideas</span>
                </div>
                <button 
                    onClick={() => handleChange('includeImages', !config.includeImages)}
                    className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${config.includeImages ? 'bg-blue-500' : 'bg-gray-300'}`}
                    disabled={isGenerating}
                >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${config.includeImages ? 'left-5' : 'left-1'}`}></div>
                </button>
            </div>

             {/* FAQ Toggle */}
             <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HelpCircle className={`w-4 h-4 ${config.includeFAQ ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-700">Auto-FAQ</span>
                </div>
                <button 
                    onClick={() => handleChange('includeFAQ', !config.includeFAQ)}
                    className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${config.includeFAQ ? 'bg-green-500' : 'bg-gray-300'}`}
                    disabled={isGenerating}
                >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${config.includeFAQ ? 'left-5' : 'left-1'}`}></div>
                </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Intent */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-400" /> Article Intent
            </label>
            <select
              value={config.intent}
              onChange={(e) => handleChange('intent', e.target.value)}
              className="w-full rounded-lg border-gray-300 bg-gray-50 border p-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
              disabled={isGenerating}
            >
              <option value="informational">Ultimate Guide (Informational)</option>
              <option value="transactional">Product Comparison (Transactional)</option>
              <option value="listicle">Numbered List (Listicle)</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" /> Language
            </label>
            <select
              value={config.language || 'English'}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full rounded-lg border-gray-300 bg-gray-50 border p-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
              disabled={isGenerating}
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>

          {/* Tone */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400" /> Tone of Voice
            </label>
            <select
              value={config.tone || 'professional'}
              onChange={(e) => handleChange('tone', e.target.value)}
              className="w-full rounded-lg border-gray-300 bg-gray-50 border p-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
              disabled={isGenerating}
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual & Friendly</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="witty">Witty & Fun</option>
              <option value="authoritative">Authoritative</option>
              <option value="empathetic">Empathetic</option>
            </select>
          </div>

          {/* Audience */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" /> Target Audience
            </label>
            <select
              value={config.audience}
              onChange={(e) => handleChange('audience', e.target.value)}
              className="w-full rounded-lg border-gray-300 bg-gray-50 border p-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
              disabled={isGenerating}
            >
              <option value="beginners">Beginners</option>
              <option value="experts">Industry Experts</option>
              <option value="business">Business Owners</option>
            </select>
          </div>

          {/* Length */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
              <Type className="w-4 h-4 text-gray-400" /> Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['short', 'standard', 'long'] as const).map((len) => (
                <button
                  key={len}
                  onClick={() => handleChange('length', len)}
                  disabled={isGenerating}
                  className={`py-2 px-1 text-xs font-medium rounded-md border transition-all capitalize ${
                    config.length === len
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
           <span>Est. Words</span>
           <span className="font-bold text-gray-900">{wordCount}</span>
        </div>
        <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
           <span>Read Time</span>
           <span className="font-bold text-gray-900">{readingTime} min</span>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating || !config.keyword}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all transform active:scale-95 ${
            isGenerating
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Writing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-current" />
              Generate Article
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
