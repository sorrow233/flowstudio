import React, { useState } from 'react';
import { Send, MessageSquare, Heart, Bookmark, Trash2 } from 'lucide-react';

const InspirationModule = () => {
    const [thoughts, setThoughts] = useState([
        {
            id: 1,
            user: '无序',
            date: '29 天前',
            content: '不知道为何，我此刻对就职的路线不断感到恶心，就好像身体整个本能都在告诉我这样不对。但理性有告诉我，这就是最正确的道路',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
        },
        {
            id: 2,
            user: '无序',
            date: '2025 年 12 月 8 日 星期一',
            content: '当一个人切断了与外界顶尖大脑的交流，他的大脑就成了一个回音室。他听到的只有自己的回声，越是错误的想法，在孤独的自我强化下，反而变得越坚不可摧',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
        }
    ]);

    const [input, setInput] = useState('');

    return (
        <div className="max-w-4xl mx-auto py-8">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-bold mb-4 text-slate-900">思考</h1>
                <p className="text-xl text-slate-700">谢谢你听我诉说</p>
            </div>

            {/* Input Area */}
            <div className="relative mb-12">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <textarea
                        className="w-full bg-transparent border-none focus:ring-0 text-lg text-slate-700 min-h-[120px] resize-none"
                        placeholder="此刻在想什么？"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="flex justify-end mt-4">
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Thoughts List */}
            <div className="space-y-8">
                {thoughts.map((thought) => (
                    <div key={thought.id} className="flex gap-4">
                        <img
                            src={thought.avatar}
                            alt="avatar"
                            className="w-12 h-12 rounded-full border border-slate-200"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-slate-900">{thought.user}</span>
                                <span className="text-xs text-slate-400">{thought.date}</span>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 text-slate-700 leading-relaxed mb-3 border border-slate-100">
                                {thought.content}
                            </div>
                            <div className="flex items-center gap-8 text-slate-400">
                                <button className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                                    <MessageSquare size={16} />
                                    <span className="text-xs font-medium">0</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                                    <Heart size={16} />
                                    <span className="text-xs font-medium">0</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-slate-600 transition-colors">
                                    <Bookmark size={16} />
                                    <span className="text-xs font-medium">0</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-pink-400 transition-colors ml-auto">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InspirationModule;
