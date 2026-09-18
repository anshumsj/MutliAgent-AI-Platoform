import { getModel } from "../config/llmModels.js";

export const routerAgent = async (state) => {
     // If the user explicitly selected an agent, bypass Router LLM classification
     if (state.agent && state.agent !== "auto") {
         console.log(`[Router] Manual selection override -> Routing directly to: ${state.agent}`);
         return state;
     }

     const llm = await getModel("router");
     const prompt=`You are the Router Agent for a multi-agent AI system.

Your ONLY job is to classify the user's request and select the ONE most appropriate agent.

Available agents:
- chat → general conversation, explanations, writing, brainstorming, advice, and questions that do not require specialized tools.
- search → requests requiring current, external, real-time, or web-based information.
- pdf → requests involving creating, reading, analyzing, summarizing, or modifying PDF documents.
- ppt → requests involving creating, reading, analyzing, or modifying PowerPoint presentations.
- coding → programming, debugging, code generation, algorithms, software engineering, or technical implementation.
- vision → requests that require understanding or analyzing images, screenshots, diagrams, or visual content.

Rules:
1. Return EXACTLY ONE agent name.
2. Your output must be exactly one of:
   chat
   search
   pdf
   ppt
   coding
   vision
3. Never return explanations, punctuation, markdown, JSON, or multiple words.
4. Choose the agent that is most directly capable of completing the user's request.
5. If the request contains an image/screenshot and understanding that visual content is necessary, choose vision.
6. If the request is primarily about programming/code, choose coding even if the user asks for an explanation.
7. If the request requires current or externally retrieved information, choose search.
8. If the request is specifically about a PDF, choose pdf.
9. If the request is specifically about a PowerPoint/presentation, choose ppt.
10. For ordinary questions, conversation, writing, explanations, brainstorming, or advice, choose chat.

Examples:

User: "What's the weather in Delhi?"
Output:
search

User: "Explain binary search"
Output:
chat

User: "Write a C++ solution for this LeetCode problem"
Output:
coding

User: "Debug this Python code"
Output:
coding

User: "Summarize this PDF"
Output:
pdf

User: "Create a presentation about AI"
Output:
ppt

User: "What is shown in this screenshot?"
Output:
vision

User: "Help me write an email to my professor"
Output:
chat

User: "Find the latest OpenAI API documentation"
Output:
search

User: "Analyze this architecture diagram"
Output:
vision
User Query:${state.prompt}`

const response = await llm.invoke(prompt)
console.log(`[Router] Selected Agent: ${response.content.trim()}`);
return {
    ...state,
    agent:response.content.trim().toLowerCase()
}
}