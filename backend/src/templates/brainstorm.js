import { COLORS, CONTENT_X, introCards, note } from "./helpers.js";

const FRAME = "b-frame";

export const brainstormTemplate = {
    nodes: [
        ...introCards(
            "b",
            "Brainstorm",
            "Add One Idea Per Sticky Note, Then Group Similar Ideas And Vote On The Best Ones.",
        ),

        {
            id: FRAME,
            type: "frame",
            position: { x: CONTENT_X, y: 0 },
            data: { label: "Brainstorm", color: "#FFFFFF" },
            width: 960,
            height: 560,
            zIndex: -1,
        },

        {
            id: "b-topic",
            type: "shape",
            parentId: FRAME,
            position: { x: 280, y: 40 },
            data: {
                label: "What Should We Build Next?",
                shape: "rectangle",
                color: COLORS.black,
            },
            width: 400,
            height: 70,
        },

        note("b-n1", "Onboarding Checklist", COLORS.noteYellow, 60, 150, FRAME),
        note("b-n2", "AI Summaries", COLORS.noteYellow, 230, 150, FRAME),
        note("b-n3", "Dark Mode", COLORS.notePink, 400, 150, FRAME),
        note("b-n4", "Slack Integration", COLORS.noteYellow, 570, 150, FRAME),
        note("b-n5", "Templates Gallery", COLORS.noteBlue, 740, 150, FRAME),

        note("b-n6", "Mobile App", COLORS.noteYellow, 60, 330, FRAME),
        note("b-n7", "Comments On Shapes", COLORS.noteBlue, 230, 330, FRAME),
        note("b-n8", "Export To PDF", COLORS.noteYellow, 400, 330, FRAME),
        note("b-n9", "Keyboard Shortcuts", COLORS.notePink, 570, 330, FRAME),
        note("b-n10", "Team Analytics", COLORS.noteYellow, 740, 330, FRAME),
    ],
    edges: [],
};
