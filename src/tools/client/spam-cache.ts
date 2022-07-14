function cache_timeout_dealloc(cache: Map<string, number>, per_this_much_time: number) {
    return (id: string, repetitions: number) => {
        setTimeout(() => {
            const cache_val = cache.get(id);
            if (cache_val && cache_val > 1) {
                cache.set(id, cache_val - 1);
            } else if (cache_val) {
                cache.delete(id);
            }
        }, per_this_much_time * 60 * repetitions);
    };
}

export default function get_spam_cache(limit: number, per_this_many_secs: number) {
    const cache = new Map<string, number>();
    const cache_timeout = cache_timeout_dealloc(cache, per_this_many_secs);
    return (id: string) => {
        const cache_val = cache.get(id);
        const new_val = cache_val ? cache_val + 1 : 1;
        cache.set(id, new_val);
        cache_timeout(id, new_val);
        if (new_val < limit) {
            return;
        }
        return new_val;
    };
}
