import { chatAgent } from "../agents/chat.agent.js";
import { routerAgent } from "./router.js";
import { agentState } from "./state.js";
import { StateGraph, START, END } from "@langchain/langgraph";
import { codingAgent } from "../agents/coding.agent.js";
import { pptAgent } from "../agents/ppt.agent.js";
import { searchAgent } from "../agents/search.agent.js";
import { visionAgent } from "../agents/vision.agent.js";
import { pdfAgent } from "../agents/pdf.agent.js";

const workflow = new StateGraph(agentState);

workflow.addNode("router", routerAgent);
workflow.addNode("chat", chatAgent);
workflow.addNode("search", searchAgent);
workflow.addNode("ppt", pptAgent);
workflow.addNode("coding", codingAgent);
workflow.addNode("vision", visionAgent);
workflow.addNode("pdf", pdfAgent);

workflow.addEdge(START, "router");
workflow.addConditionalEdges("router", (state) => {
    switch (state.agent) {
        case "chat": return "chat";
        case "search": return "search";
        case "ppt": return "ppt";
        case "coding": return "coding";
        case "vision":
        case "image": return "vision";
        case "pdf": return "pdf";
        default: return "chat";
    }
}, {
    chat: "chat",
    search: "search",
    ppt: "ppt",
    coding: "coding",
    vision: "vision",
    pdf: "pdf"
});

workflow.addEdge("search", "chat");
workflow.addEdge("chat", END);
workflow.addEdge("ppt", END);
workflow.addEdge("coding", END);
workflow.addEdge("vision", END);
workflow.addEdge("pdf", END);

export const graph = workflow.compile();

