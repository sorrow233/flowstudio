import { useMemo, useRef } from 'react';

const UNTITLED_WRITING_DOC = '无标题文档';
const ENTRY_SEPARATOR = '\u001f';
const FIELD_SEPARATOR = '\u001e';

export const useWritingDocTitleMap = (allProjects = []) => {
    const cacheRef = useRef({
        signature: '',
        titleMap: new Map(),
    });

    return useMemo(() => {
        const entries = (Array.isArray(allProjects) ? allProjects : [])
            .filter((project) => project?.stage === 'writing' && project?.id)
            .map((project) => [
                String(project.id),
                String(project.title || UNTITLED_WRITING_DOC),
            ])
            .sort(([leftId], [rightId]) => leftId.localeCompare(rightId));

        const signature = entries
            .map(([id, title]) => `${id}${FIELD_SEPARATOR}${title}`)
            .join(ENTRY_SEPARATOR);

        if (cacheRef.current.signature === signature) {
            return cacheRef.current.titleMap;
        }

        const titleMap = new Map(entries);
        cacheRef.current = { signature, titleMap };
        return titleMap;
    }, [allProjects]);
};
