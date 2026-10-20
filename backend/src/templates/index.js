import { brainstormTemplate } from "./brainstorm.js";
import { flowchartTemplate } from "./flowchart.js";
import { journeyTemplate } from "./journey.js";
import { launchTemplate } from "./launch.js";
import { roadmapTemplate } from "./roadmap.js";

export const BOARD_TEMPLATE_KEYS = [
    "blank",
    "brainstorm",
    "flowchart",
    "roadmap",
    "journey",
    "launch",
];

const TEMPLATES = {
    brainstorm: brainstormTemplate,
    flowchart: flowchartTemplate,
    roadmap: roadmapTemplate,
    journey: journeyTemplate,
    launch: launchTemplate,
};

export const getBoardTemplate = (key) => TEMPLATES[key] ?? null;
