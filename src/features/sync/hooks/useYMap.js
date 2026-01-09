import { useState, useEffect } from 'react';

// Hook to subscribe to Y.Map changes in React
export const useYMap = (doc) => {
    const [data, setData] = useState({});

    useEffect(() => {
        if (!doc) return;
        const map = doc.getMap('data');
        const handleChange = () => setData(map.toJSON());

        handleChange();
        map.observeDeep(handleChange);
        return () => map.unobserveDeep(handleChange);
    }, [doc]);

    return data;
};
