
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getGameCommentary(board: (string | null)[], lastPlayer: string, winner: string | null) {
  const boardStr = board.map((cell, i) => cell || i).join('|');
  const prompt = `
    You are a witty, slightly sarcastic, and professional Tic-Tac-Toe commentator.
    Current Board State: [${boardStr}]
    Last Move By: ${lastPlayer}
    Winner: ${winner || 'None yet'}
    
    Give a one-sentence commentary on the current game state or the last move. 
    Be creative. If there's a winner, congratulate them with a twist. If it's a draw, mock the staleness.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 100,
      }
    });
    return response.text || "An interesting move indeed.";
  } catch (error) {
    console.error("Gemini Commentary Error:", error);
    return "The silence of the AI is deafening.";
  }
}

export async function getProTip(board: (string | null)[], player: string) {
  const boardStr = board.map((cell, i) => cell || i).join('|');
  const prompt = `
    Analyze this Tic-Tac-Toe board: [${boardStr}]. 
    You are playing as ${player}.
    What is the absolute best tactical advice for the next move?
    Explain why in 15 words or less.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.4,
        maxOutputTokens: 60,
      }
    });
    return response.text || "Secure the corners.";
  } catch (error) {
    return "Focus on the center square.";
  }
}
