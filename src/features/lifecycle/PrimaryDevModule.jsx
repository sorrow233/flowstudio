import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, ExternalLink, Trash2, Check, Rocket } from 'lucide-react';
import { STORAGE_KEYS, DEV_STAGES } from '../../utils/constants';

// Import New Modular Components
import StageNavigation from './components/primary/StageNavigation';
import TaskList from './components/primary/TaskList';
import ProjectWorkspaceHeader from './components/primary/ProjectWorkspaceHeader';
import ImportCommandModal from './components/primary/ImportCommandModal';

const PrimaryDevModule = () => {
    // --- Global State ---
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    // --- UI/Interaction State ---
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

    // --- Edit Mode State ---
    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editForm, setEditForm] = useState({});

    // --- Task/Command State ---
    const [newTaskInput, setNewTaskInput] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('general');
    const [commandModalOpen, setCommandModalOpen] = useState(false);

    // --- Undo State (Optional Enhancement) ---
    const [recentlyDeleted, setRecentlyDeleted] = useState(null);

    // --- Data Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.PRIMARY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure migration for stages
            const migrated = parsed.map(p => {
                const currentStage = p.subStage || 1;
                return {
                    ...p,
                    subStage: currentStage,
                    tasks: (p.tasks || []).map(t => ({
                        ...t,
                        stage: t.stage || currentStage
                    }))
                };
            });
            setProjects(migrated);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.PRIMARY, JSON.stringify(projects));
    }, [projects]);

    // --- Project Handlers ---
    const handleDeleteProject = (e, id) => {
        e.stopPropagation();
        if (confirm('Delete project?')) {
            setProjects(projects.filter(p => p.id !== id));
            if (selectedProject?.id === id) setSelectedProject(null);
        }
    };

    const handleUpdateProject = (id, updates) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        if (selectedProject?.id === id) {
            setSelectedProject(prev => ({ ...prev, ...updates }));
        }
    };

    // --- Edit Handlers ---
    const startEditing = () => {
        setEditForm({
            title: selectedProject.title,
            desc: selectedProject.desc,
            link: selectedProject.link || '',
            bgImage: selectedProject.bgImage || ''
        });
        setIsEditingProject(true);
    };

    const saveEditing = () => {
        handleUpdateProject(selectedProject.id, editForm);
        setIsEditingProject(false);
    };

    // --- Task Handlers ---
    const handleAddTask = (projectId) => {
        if (!newTaskInput.trim()) return;
        const project = projects.find(p => p.id === projectId);
        const newTasks = [...(project.tasks || []), {
            id: Date.now(),
            text: newTaskInput,
            done: false,
            category: newTaskCategory,
            stage: project.subStage || 1
        }];
        handleUpdateProject(projectId, { tasks: newTasks });
        setNewTaskInput('');
    };

    const handleDeleteTask = (projectId, taskId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const updatedTasks = project.tasks.filter(t => t.id !== taskId);
        handleUpdateProject(projectId, { tasks: updatedTasks });
    };

    const handleToggleTask = (projectId, taskId) => {
        const project = projects.find(p => p.id === projectId);
        const updatedTasks = project.tasks.map(t =>
            t.id === taskId ? { ...t, done: !t.done } : t
        );
        handleUpdateProject(projectId, { tasks: updatedTasks });
    };

    // --- Command Import Handler ---
    const handleLinkCommand = (command, tag = null) => {
        const project = projects.find(p => p.id === selectedProject.id);
        const currentStage = project.subStage || 1;

        const newTasks = [...(project.tasks || []), {
            id: Date.now(),
            text: command.title,
            done: false,
            isCommand: true,
            commandContent: command.content,
            commandUrl: command.url,
            commandId: command.id,
            commandType: command.type || 'utility',
            commandTags: command.tags || [],
            stage: currentStage
        }];

        handleUpdateProject(selectedProject.id, { tasks: newTasks });
        setCommandModalOpen(false);

        if (tag) {
            navigator.clipboard.writeText(tag.value || command.content);
        }
    };

    // --- Stage Handler ---
    const handleStageSelect = (stageId) => {
        handleUpdateProject(selectedProject.id, { subStage: stageId });
    };

    return (
        <div className="max-w-7xl mx-auto pt-10 px-6 pb-20">
            {/* Dashboard Header */}
            <div className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-tight">Active Projects</h2>
                    <p className="text-gray-400 text-sm font-light tracking-wide">Primary Development Phase</p>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-thin text-gray-900">{projects.length}</span>
                    <span className="text-gray-400 text-xs uppercase tracking-widest ml-2">Active</span>
                </div>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <motion.div
                        layoutId={`card-${project.id}`}
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className="group bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all cursor-pointer relative h-[360px] flex flex-col ring-1 ring-transparent hover:ring-gray-100"
                    >
                        {/* Card Background */}
                        <div className="absolute inset-0 z-0 h-48">
                            {project.bgImage ? (
                                <div className="w-full h-full relative">
                                    <img src={project.bgImage} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white" />
                            )}
                        </div>

                        <div className="p-8 relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-white/80 backdrop-blur text-gray-900 rounded-2xl flex items-center justify-center shadow-sm border border-white/50 group-hover:scale-105 transition-transform">
                                    <Code2 size={24} strokeWidth={1.5} />
                                </div>
                                {project.link && (
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2 text-gray-500 hover:text-gray-900 transition-colors bg-white/50 backdrop-blur rounded-full hover:bg-white">
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>

                            <div className="mt-8">
                                <h3 className="text-2xl font-light text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-900 transition-colors">{project.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5em] leading-relaxed">{project.desc || 'No description provided.'}</p>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-100/50">
                                {/* Mini Stage Visualization */}
                                <div className="flex items-center gap-1.5 mb-3">
                                    {[1, 2, 3, 4, 5].map(step => (
                                        <div
                                            key={step}
                                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= (project.subStage || 1) ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-gray-100'}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between items-center text-xs font-mono text-gray-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>Stage {project.subStage || 1}</span>
                                    </div>
                                    <span className="text-gray-900 font-medium">{DEV_STAGES[(project.subStage || 1) - 1]?.label}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Empty State */}
                {projects.length === 0 && (
                    <div className="col-span-full border-2 border-dashed border-gray-100 rounded-[2rem] p-12 flex flex-col items-center justify-center text-gray-300 min-h-[400px]">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 opacity-50 animate-pulse">
                            <Rocket size={40} className="text-gray-400" strokeWidth={1} />
                        </div>
                        <span className="text-xl font-light text-gray-900 mb-2">Ready for Liftoff?</span>
                        <span className="text-sm text-gray-400 max-w-sm text-center leading-relaxed">Your primary command center is waiting. Graduate a project from the 'Pending' phase to begin development.</span>
                    </div>
                )}
            </div>

            {/* Project Workspace Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 backdrop-blur-md pointer-events-auto"
                            onClick={() => { setSelectedProject(null); setIsEditingProject(false); }}
                        />
                        <motion.div
                            layoutId={`card-${selectedProject.id}`}
                            className="w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden relative pointer-events-auto h-[90vh] flex flex-col ring-1 ring-gray-100"
                        >
                            <ProjectWorkspaceHeader
                                project={selectedProject}
                                activeStage={selectedProject.subStage || 1}
                                isCollapsed={isHeaderCollapsed}
                                isEditing={isEditingProject}
                                editForm={editForm}
                                setEditForm={setEditForm}
                                onStartEdit={startEditing}
                                onSaveEdit={saveEditing}
                                onCancelEdit={() => setIsEditingProject(false)}
                                onClose={() => setSelectedProject(null)}
                                onDelete={(e) => handleDeleteProject(e, selectedProject.id)}
                                onImportCommand={() => setCommandModalOpen(true)}
                            />

                            <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50/30">
                                {/* Left Sidebar: Stage Navigation */}
                                <StageNavigation
                                    activeStage={selectedProject.subStage || 1}
                                    currentStage={selectedProject.subStage || 1}
                                    onStageSelect={handleStageSelect}
                                />

                                {/* Right Content: Task List */}
                                <div className="flex-1 flex flex-col relative w-full overflow-hidden">
                                    <TaskList
                                        tasks={selectedProject.tasks}
                                        projectId={selectedProject.id}
                                        activeStage={selectedProject.subStage || 1}
                                        onToggle={handleToggleTask}
                                        onDelete={handleDeleteTask}
                                        onAddTask={handleAddTask}
                                        newTaskInput={newTaskInput}
                                        setNewTaskInput={setNewTaskInput}
                                        newTaskCategory={newTaskCategory}
                                        setNewTaskCategory={setNewTaskCategory}
                                        onScroll={(e) => {
                                            const scrollTop = e.currentTarget.scrollTop;
                                            if (scrollTop > 50 && !isHeaderCollapsed) {
                                                setIsHeaderCollapsed(true);
                                            } else if (scrollTop === 0 && isHeaderCollapsed) {
                                                setIsHeaderCollapsed(false);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ImportCommandModal
                isOpen={commandModalOpen}
                onClose={() => setCommandModalOpen(false)}
                onImport={handleLinkCommand}
            />
        </div>
    );
};

export default PrimaryDevModule;
