import { getModel } from "../config/llmModels.js";

export const chatAgent=async(state)=>{
    const llm=await getModel("chat")
    const searchContext=state.searchResults?`
    Web Search Results 
    ${JSON.stringify(state.searchResults)}
     
    Answer the user using the above search results.
    `:""

    const systemPrompt = `You are CortexAI, an advanced, helpful, and intelligent AI assistant.
${searchContext}

if search context is provided
-use search Results to answer 
-do not mention internal tools

Always format your responses cleanly using GitHub-flavored Markdown:
- Use clear headings (##, ###) to logically structure your explanations and sections.
- Use bullet points or numbered lists for steps, features, or breakdowns.
- Highlight important concepts, keywords, and conclusions using **bold** text.
- For all code snippets, ALWAYS use fenced code blocks with the exact language specified (e.g., \`\`\`javascript, \`\`\`python, \`\`\`html, \`\`\`bash).
- Use inline code formatting (\`variable\`, \`function()\`, \`path/to/file\`) for code symbols, CLI commands, and technical terms.
- When comparing options or presenting structured data, use Markdown tables.
- Keep paragraphs concise, avoid dense blocks of unbroken text, and leave line breaks between sections for readability.`;
    
    const formattedHistory = (state.messages || []).map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "human",
        content: msg.content
    }));

    const response = await llm.invoke([
        {
            role: "system",
            content: systemPrompt
        },
        ...formattedHistory,
        {
            role: "human",
            content: state.prompt
        }
    ]);
    return{
        ...state,
        aiResponse:response.content
    }
}