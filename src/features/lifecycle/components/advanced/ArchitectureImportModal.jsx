import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Terminal, FileJson, ArrowRight, BrainCircuit } from 'lucide-react';

const generatePrompt = (currentModules = []) => {
    const existingList = currentModules.map(m => `- ${m.name}`).join('\n');
    const context = existingList
        ? `\nCURRENT EXISTING MODULES (Do NOT duplicate these):\n${existingList}\n\nIMPORTANT: The above modules already exist. Only generate NEW, supplementary modules to add features or services not listed above.`
        : '';

    return `
You are a Senior System Architect. Analyze the codebase/project requirements provided.
I need a structural breakdown of this project for my "Advanced Development" dashboard.
${context}

Please output a strictly valid JSON object with a single key "modules" containing an array of module objects.
Each "module" object must have:
- "name": String (Concise name, e.g., "Auth Service", "Payment Gateway")
- "description": String (One sentence purpose)
- "category": String (One of: "Frontend", "Backend", "Database", "Core", "Feature", "Integration", "Security", "DevOps")
- "priority": "High" | "Medium" | "Low"

Do NOT include any markdown formatting (like \`\`\`json). Just the raw JSON string.
Break down the system into logical functional units (aim for 5-10 *new* modules to complement the existing ones).
`.trim();
};

const ArchitectureImportModal = ({ isOpen, onClose, onImport, currentModules = [] }) => {
    const [jsonInput, setJsonInput] = useState('');
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const promptText = generatePrompt(currentModules);

    const handleCopy = () => {
        navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleParse = () => {
        try {
            // Clean input (remove potential markdown fences)
            const cleanInput = jsonInput.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanInput);

            if (!parsed.modules || !Array.isArray(parsed.modules)) {
                throw new Error("Invalid JSON structure. Missing 'modules' array.");
            }

            onImport(parsed.modules);
            setError(null);
            setJsonInput('');
            onClose();
        } catch (e) {
            setError(e.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden ring-1 ring-gray-100 flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 pb-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                            <BrainCircuit size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">AI Architect</span>
                        </div>
                        <h2 className="text-2xl font-light text-gray-900">Define System Architecture</h2>
                        <p className="text-gray-400 text-sm mt-1 font-light">
                            Use AI to analyze your vision and generate a modular blueprint.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">

                    {/* Step 1: Prompt */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span>Step 1: Get Layout from AI</span>
                            {copied && <span className="text-emerald-500 flex items-center gap-1"><Check size={12} /> Copied</span>}
                        </div>
                        <div className="relative group">
                            <div className="absolute top-3 right-3">
                                <button
                                    onClick={handleCopy}
                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-md"
                                    title="Copy Prompt"
                                >
                                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <div className="bg-gray-900 text-gray-300 p-4 rounded-xl text-xs font-mono leading-relaxed opacity-90 h-40 overflow-y-auto custom-scrollbar">
                                {promptText}
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">
                            Copy this prompt to ChatGPT, Claude, or Gemini along with your project description.
                        </p>
                    </div>

                    {/* Step 2: JSON Input */}
                    <div className="space-y-3">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Step 2: Paste Blueprint JSON
                        </div>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => { setJsonInput(e.target.value); setError(null); }}
                            className={`w-full h-40 bg-gray-50 border rounded-xl p-4 font-mono text-xs focus:ring-2 outline-none transition-all ${error ? 'border-red-300 ring-red-100' : 'border-gray-200 focus:border-emerald-300 focus:ring-emerald-50'}`}
                            placeholder='{ "modules": [ ... ] }'
                        />
                        {error && (
                            <div className="text-red-500 text-xs flex items-center gap-2">
                                <AlertCircle size={12} />
                                {error}
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleParse}
                        disabled={!jsonInput.trim()}
                        className="px-8 py-3 bg-gray-900 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <span>Generate Blueprint</span>
                        <ArrowRight size={16} />
                    </button>
                </div>

            </motion.div>
        </div>
    );
};

export default ArchitectureImportModal;
