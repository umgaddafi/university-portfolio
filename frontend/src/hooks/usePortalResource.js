import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getErrorMessage } from '../utils/formatters';

export function usePortalResource(endpoint) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function load() {
        setLoading(true);
        setError('');

        try {
            const result = await api(endpoint);
            setData(result);
            return { ok: true, result };
        } catch (loadError) {
            setData(null);
            setError(getErrorMessage(loadError));
            return { ok: false, error: loadError };
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, [endpoint]);

    return { data, loading, error, load };
}
