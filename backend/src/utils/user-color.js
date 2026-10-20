const CURSOR_COLORS = [
    "#FFD21F",
    "#F472B6",
    "#60A5FA",
    "#34D399",
    "#A78BFA",
    "#FBBF24",
    "#F87171",
    "#2DD4BF",
];

export const getUserColor = (userId) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = (hash * 31 + userId.charCodeAt(i)) | 0;
    }
    return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
};
