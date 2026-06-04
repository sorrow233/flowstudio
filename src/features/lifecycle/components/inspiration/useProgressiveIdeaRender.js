import { useCallback, useEffect, useRef, useState } from 'react';

const INITIAL_IDEA_RENDER_LIMIT = 18;
const IDEA_RENDER_BATCH_SIZE = 18;

const scheduleIdleWork = (callback) => {
    if (typeof window === 'undefined') {
        callback();
        return () => { };
    }

    let cancelled = false;
    const run = () => {
        if (!cancelled) callback();
    };

    if (typeof window.requestIdleCallback === 'function') {
        const idleId = window.requestIdleCallback(run, { timeout: 180 });
        return () => {
            cancelled = true;
            window.cancelIdleCallback?.(idleId);
        };
    }

    const timeoutId = window.setTimeout(run, 48);
    return () => {
        cancelled = true;
        window.clearTimeout(timeoutId);
    };
};

const getInitialRenderLimit = (totalCount) => (
    Math.min(INITIAL_IDEA_RENDER_LIMIT, Math.max(0, totalCount))
);

export const useProgressiveIdeaRender = ({ listKey, totalCount }) => {
    const sentinelRef = useRef(null);
    const [renderLimit, setRenderLimit] = useState(() => getInitialRenderLimit(totalCount));

    useEffect(() => {
        setRenderLimit(getInitialRenderLimit(totalCount));
    }, [listKey]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        setRenderLimit((currentLimit) => {
            const initialLimit = getInitialRenderLimit(totalCount);
            if (currentLimit === 0) return initialLimit;
            return Math.min(Math.max(currentLimit, initialLimit), totalCount);
        });
    }, [totalCount]);

    const hasMore = renderLimit < totalCount;

    const loadNextBatch = useCallback(() => {
        setRenderLimit((currentLimit) => (
            Math.min(totalCount, currentLimit + IDEA_RENDER_BATCH_SIZE)
        ));
    }, [totalCount]);

    useEffect(() => {
        if (!hasMore) return undefined;

        const node = sentinelRef.current;
        if (!node) return undefined;

        if (typeof IntersectionObserver !== 'function') {
            return scheduleIdleWork(loadNextBatch);
        }

        let cancelScheduledWork = null;
        const observer = new IntersectionObserver((entries) => {
            const shouldLoadMore = entries.some((entry) => entry.isIntersecting);
            if (!shouldLoadMore) return;

            cancelScheduledWork?.();
            cancelScheduledWork = scheduleIdleWork(loadNextBatch);
        }, {
            root: null,
            rootMargin: '900px 0px',
            threshold: 0,
        });

        observer.observe(node);

        return () => {
            cancelScheduledWork?.();
            observer.disconnect();
        };
    }, [hasMore, loadNextBatch, renderLimit]);

    return {
        hasMore,
        renderLimit,
        sentinelRef,
    };
};
