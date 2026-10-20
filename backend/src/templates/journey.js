import { COLORS, CONTENT_X, introCards, note } from "./helpers.js";

const FRAME = "j-frame";

const stage = (id, label, color, x) => ({
    id,
    type: "shape",
    parentId: FRAME,
    position: { x, y: 40 },
    data: { label, shape: "oval", color },
    width: 180,
    height: 72,
});

export const journeyTemplate = {
    nodes: [
        ...introCards(
            "j",
            "User journey",
            "Add What The User Does And Feels At Each Stage, Then Mark The Pain Points.",
        ),

        {
            id: FRAME,
            type: "frame",
            position: { x: CONTENT_X, y: 0 },
            data: { label: "User Journey", color: "#FFFFFF" },
            width: 1000,
            height: 540,
            zIndex: -1,
        },

        stage("j-s1", "Discover", COLORS.yellow, 60),
        stage("j-s2", "Sign Up", COLORS.blue, 410),
        stage("j-s3", "Onboard", COLORS.purple, 760),

        note(
            "j-d1",
            "Finds Kano On YouTube",
            COLORS.noteYellow,
            75,
            150,
            FRAME,
        ),
        note("j-d2", "Watches a Demo", COLORS.noteYellow, 75, 330, FRAME),
        note("j-d3", "Creates An Account", COLORS.noteBlue, 425, 150, FRAME),
        note("j-d4", "Sets Up a Workspace", COLORS.noteBlue, 425, 330, FRAME),
        note("j-d5", "Creates First Board", COLORS.notePurple, 775, 150, FRAME),
        note("j-d6", "Invites The Team", COLORS.notePurple, 775, 330, FRAME),
    ],
    edges: [
        {
            id: "j-e1",
            source: "j-s1",
            sourceHandle: "right",
            target: "j-s2",
            targetHandle: "left",
        },
        {
            id: "j-e2",
            source: "j-s2",
            sourceHandle: "right",
            target: "j-s3",
            targetHandle: "left",
        },
    ],
};
