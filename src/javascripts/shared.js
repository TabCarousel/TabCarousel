
export const LS = {
    getAllItems: () => chrome.storage.local.get(),
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({ [key]: val }),
    removeItems: keys => chrome.storage.local.remove(keys),
};

export const defaults = {
            flipWait_ms: 15 * 1000,
            reloadWait_ms: 5 * 60 * 1000
};