// Mock AI Service
// Simulates an LLM analysis of a software idea.

export const analyzeIdea = async (prompt) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: Date.now().toString(),
                summary: `AI Refined: A scalable solution for "${prompt.substring(0, 20)}..." focusing on user retention.`,
                commercial: {
                    score: 'A', // S, A, B, C
                    viability: 'High',
                    monetization: 'Freemium (SaaS) + Enterprise Licensing',
                    targetAudience: 'Small to Medium Businesses',
                },
                tech: {
                    stack: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
                    complexity: 'Medium',
                    estimatedTimeline: '4-6 weeks for MVP',
                },
                steps: [
                    'Define detailed user personas and core value proposition.',
                    'Design database schema for multi-tenant architecture.',
                    'Develop MVP frontend with key "Killer Feature".',
                ],
            });
        }, 2000); // 2 seconds "thinking" time
    });
};
