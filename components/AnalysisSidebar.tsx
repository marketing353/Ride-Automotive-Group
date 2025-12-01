import React from 'react';
import { OutlineItem } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Activity, List, PieChart } from 'lucide-react';

interface AnalysisSidebarProps {
  outline: OutlineItem[];
  wordCount: number;
  keyword: string;
  content: string;
}

export const AnalysisSidebar: React.FC<AnalysisSidebarProps> = ({ outline, wordCount, keyword, content }) => {
  
  // Calculate simple keyword density
  const calculateDensity = () => {
    if (!content || !keyword || wordCount === 0) return 0;
    const regex = new RegExp(keyword, 'gi');
    const matches = content.match(regex);
    return matches ? ((matches.length / wordCount) * 100).toFixed(2) : 0;
  };

  const density = calculateDensity();
  const densityScore = Math.min(100, (Number(density) / 2) * 100); // Normalize assuming 2% is ideal

  // Mock data for radar chart based on content length
  const seoScoreData = [
    { subject: 'Readability', A: Math.min(100, wordCount / 10 + 50), fullMark: 100 },
    { subject: 'Structure', A: outline.length * 10, fullMark: 100 },
    { subject: 'Keywords', A: Number(density) > 0.5 ? 90 : 40, fullMark: 100 },
    { subject: 'Length', A: Math.min(100, wordCount / 20), fullMark: 100 },
    { subject: 'Sentiment', A: 85, fullMark: 100 },
  ];

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shrink-0 z-10 hidden xl:flex overflow-y-auto">
      
      {/* Outline Section */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <List className="w-4 h-4" /> Live Outline
        </h2>
        {outline.length === 0 ? (
            <p className="text-sm text-gray-400 italic pl-2">Structure will appear here...</p>
        ) : (
            <nav className="space-y-2">
                {outline.map((item) => (
                    <a 
                        key={item.id} 
                        href={`#${item.id}`} // Note: anchor jumping inside overflow div requires custom handling usually, keeping simple for now
                        className={`block text-sm text-gray-600 hover:text-indigo-600 truncate transition-colors ${item.level === 3 ? 'pl-4 text-xs' : 'font-medium'}`}
                    >
                        {item.text}
                    </a>
                ))}
            </nav>
        )}
      </div>

      {/* SEO Health Section */}
      <div className="p-6">
        <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Content Health
        </h2>

        <div className="space-y-6">
            
            {/* Density Bar */}
            <div>
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-600 font-medium">Keyword Density</span>
                    <span className={`${Number(density) > 2.5 ? 'text-red-500' : 'text-green-600'} font-bold`}>{density}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ${Number(density) > 2.5 ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.min(100, Number(density) * 40)}%` }} 
                    />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-right">Target: 1.5% - 2.5%</p>
            </div>

            {/* Visual Chart */}
            <div className="h-64 -ml-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={seoScoreData}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="SEO Score"
                            dataKey="A"
                            stroke="#4f46e5"
                            fill="#4f46e5"
                            fillOpacity={0.3}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                        />
                    </RadarChart>
                 </ResponsiveContainer>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-800 uppercase">AI Suggestion</span>
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                    {wordCount < 500 
                        ? "Content is still brief. Aim for at least 1,200 words for deep topic coverage." 
                        : "Great length! Ensure you have sufficient internal links and images to break up the text."}
                </p>
            </div>

        </div>
      </div>
    </aside>
  );
};