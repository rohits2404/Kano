import { COLORS, CONTENT_X, introCards, note } from "./helpers.js";

const quarter = (id, label, color, index) => ({
    id,
    type: "frame",
    position: { x: CONTENT_X + index * 320, y: 0 },
    data: { label, color },
    width: 280,
    height: 620,
    zIndex: -1,
});

export const roadmapTemplate = {
    nodes: [
        ...introCards(
            "r",
            "Roadmap",
            "Add a Note For Each Milestone And Drag It Into The Quarter It Ships In.",
        ),

        quarter("r-q1", "Q1", "#DBEAFE", 0),
        quarter("r-q2", "Q2", "#FCE7F3", 1),
        quarter("r-q3", "Q3", "#D1FAE5", 2),

        note("r-1a", "Research", COLORS.noteBlue, 50, 30, "r-q1", 180),
        note("r-1b", "Define Scope", COLORS.noteYellow, 50, 230, "r-q1", 180),
        note(
            "r-1c",
            "User Interviews",
            COLORS.noteYellow,
            50,
            430,
            "r-q1",
            180,
        ),

        note("r-2a", "Design", COLORS.notePink, 50, 30, "r-q2", 180),
        note("r-2b", "Prototype", COLORS.noteYellow, 50, 230, "r-q2", 180),
        note("r-2c", "Beta Testing", COLORS.noteYellow, 50, 430, "r-q2", 180),

        note("r-3a", "Launch", COLORS.noteGreen, 50, 30, "r-q3", 180),
        note("r-3b", "Marketing Push", COLORS.noteYellow, 50, 230, "r-q3", 180),
        note("r-3c", "Iterate", COLORS.noteYellow, 50, 430, "r-q3", 180),
    ],
    edges: [],
};
