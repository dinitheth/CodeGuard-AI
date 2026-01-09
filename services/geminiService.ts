import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Issue, Severity } from "../types";

// Helper to fetch file content from GitHub API
async function fetchGithubFile(repoUrl: string): Promise<{ name: string, content: string } | null> {
  try {
    // Extract owner and repo from URL
    // Supports: https://github.com/owner/repo or https://github.com/owner/repo.git
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
    if (!match) return null;

    const owner = match[1];
    const repo = match[2];

    // Try to find a code file in common locations
    const pathsToCheck = ['', 'src', 'lib', 'app', 'api', 'server', 'utils', 'components', 'pages'];
    
    for (const path of pathsToCheck) {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Look for interesting code files
        const codeFile = data.find((f: any) => 
          f.type === 'file' && 
          /\.(py|js|ts|tsx|jsx|go|rs|java|cpp|c|php|rb|html|css|json)$/.test(f.name)
        );

        if (codeFile && codeFile.download_url) {
          const contentResp = await fetch(codeFile.download_url);
          const content = await contentResp.text();
          // Safety check: Don't download massive files for this demo
          if (content.length < 100000) {
            return { name: codeFile.path, content };
          }
        }
      }
    }
    return null;

  } catch (error) {
    console.warn("Failed to fetch from GitHub:", error);
    return null;
  }
}

export const analyzeCodeWithGemini = async (repoUrl: string): Promise<{ issues: Issue[], scannedFileContent: string }> => {
  const apiKey = process.env.API_KEY || '';
  
  if (!apiKey) {
    throw new Error("API Key is missing in environment variables.");
  }

  // Try to fetch real code
  const realFile = await fetchGithubFile(repoUrl);
  
  if (!realFile) {
    throw new Error("Could not find accessible code files in this repository. Please ensure the repository is public and contains supported code files (js, ts, py, etc.).");
  }

  console.log(`Analyzing real file: ${realFile.name}`);
  const codeToAnalyze = realFile.content;
  const filename = realFile.name;

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Analyze the following code for security vulnerabilities, logic bugs, and code smells.
      The file is named '${filename}'.
      
      Return a JSON object containing an array of issues. 
      If no issues are found, return an empty array.
      
      For each issue, include:
      - title (short summary)
      - file (must be '${filename}')
      - line (approximate line number)
      - severity (Critical, High, Medium, Low)
      - type (Security, Bug, Code Smell, Performance)
      - description (detailed technical explanation)
      - suggestedFix (corrected code snippet)
      - originalCode (the specific lines causing the issue)
      
      CODE TO ANALYZE:
      ${codeToAnalyze}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  file: { type: Type.STRING },
                  line: { type: Type.INTEGER },
                  severity: { type: Type.STRING },
                  type: { type: Type.STRING },
                  description: { type: Type.STRING },
                  suggestedFix: { type: Type.STRING },
                  originalCode: { type: Type.STRING },
                },
                required: ["title", "severity", "description", "suggestedFix"]
              }
            }
          }
        }
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from Gemini");
    
    const parsed = JSON.parse(jsonText);
    
    const issues = (parsed.issues || []).map((issue: any, index: number) => ({
      ...issue,
      id: `gen-${index}-${Date.now()}`,
      severity: mapSeverity(issue.severity)
    }));
    
    return { issues, scannedFileContent: codeToAnalyze };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Failed to analyze code with Gemini. Please try again.");
  }
};

export const createChat = (): Chat | null => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) return null;
  
  const ai = new GoogleGenAI({ apiKey });
  
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are an expert software engineer and code security analyst. Help the user with their code, explain bugs, and suggest fixes. Be concise and professional.",
    }
  });
};

export const generatePRDetails = async (issues: Issue[]): Promise<{ title: string; description: string }> => {
  const apiKey = process.env.API_KEY || '';
  
  if (!apiKey || issues.length === 0) {
     return {
        title: "refactor: apply security patches and code improvements",
        description: `## Summary\nThis Pull Request applies automated fixes for ${issues.length} detected issues.\n\n## Changes\n${issues.map(i => `- ${i.title}`).join('\n')}`
     };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are a senior software engineer.
      Create a Pull Request title and description for the following code fixes.
      
      Issues Fixed:
      ${issues.map(i => `- File: ${i.file} | Issue: ${i.title} (${i.severity})`).join('\n')}

      The PR description must be written in Markdown. 
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["title", "description"]
        }
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response");
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("PR Generation Failed:", error);
     return {
        title: "fix: resolve detected security vulnerabilities",
        description: "An error occurred generating the detailed PR description."
     };
  }
};

const mapSeverity = (sev: string): Severity => {
  if (!sev) return Severity.LOW;
  const s = sev.toLowerCase();
  if (s.includes('critical')) return Severity.CRITICAL;
  if (s.includes('high')) return Severity.HIGH;
  if (s.includes('medium')) return Severity.MEDIUM;
  return Severity.LOW;
};
