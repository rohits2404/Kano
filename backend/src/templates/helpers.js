export const COLORS = {
    blue: "#93C5FD",
    yellow: "#FDE047",
    purple: "#B8A4FF",
    orange: "#FFA94D",
    pink: "#F9A8D4",
    green: "#86EFAC",
    black: "#1F1F1F",
    noteYellow: "#FFF59D",
    notePink: "#FFCCF0",
    noteBlue: "#B3CEFF",
    notePurple: "#BBA8FF",
    noteGreen: "#D2EFA1",
    noteOrange: "#FFB067",
};

export const CONTENT_X = 360;

export const introCards = (id, title, tips) => [
    {
        id: `${id}-title`,
        type: "shape",
        position: { x: 0, y: 0 },
        data: {
            label: `${title}\nCreate a ${title.toLowerCase()} with Kano`,
            shape: "rectangle",
            color: COLORS.yellow,
        },
        width: 300,
        height: 120,
    },
    {
        id: `${id}-tips`,
        type: "shape",
        position: { x: 0, y: 150 },
        data: { label: `Tips\n${tips}`, shape: "rectangle", color: "#F4F4F5" },
        width: 300,
        height: 140,
    },
];

export const note = (id, label, color, x, y, parentId, size = 150) => ({
    id,
    type: "note",
    position: { x, y },
    data: { label, color },
    width: size,
    height: size,
    ...(parentId ? { parentId } : {}),
});
