// import "dotenv/config";
// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// export async function getGeminiAIResponse(promptText) {
//   try {
//     const response = await ai.models.generateContent({
//       model: "gemini-3.6-flash", // Using a stable, current model version
//       contents: promptText,
//     });

//     return response.text;
//   } catch (error) {
//     console.error("Error in getGeminiAIResponse:", error);
//     throw error;
//   }
// }

// export const getGeminiAIResponse = async (message) => {
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-goog-api-key": process.env.GEMINI_API_KEY,
//     },

//     body: JSON.stringify({
//       contents: [
//         {
//           parts: [{ text: message }],
//         },
//       ],
//     }),
//   };

//   try {
//     const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
//     const response = await fetch(url, options);

//     if (!response.ok) {
//       throw new Error(`API returned status: ${response.status}`);
//     }
//     const data = await response.json();
//     return data.candidates[0].content.parts[0].text;
//   } catch (err) {
//     console.log(err);
//     throw err;
//   }
// };

//=================SDK Libraray code====================//
// const getGeminiAIResponse = async (message) => {
//   app.post("/generate", async (req, res) => {
//     try {
//       const { prompt } = req.body;

//       if (!prompt) {
//         return res.status(400).json({ error: "Please provide a prompt!" });
//       }

//       const response = await ai.models.generateContent({
//         model: "gemini-3.6-flash",
//         contents: prompt,
//       });

//       const text = response.text;

//       return res.json({
//         success: true,
//         response: text,
//       });
//     } catch (error) {
//       console.error("Gemini API Error:", error);
//       res.status(500).json({
//         error: "failed to generate response",
//       });
//     }
//   });
// };

// export default getGeminiAIResponse;

// import "dotenv/config";
// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// export async function getGeminiAIResponse(promptText) {
//   const maxRetries = 3;

//   for (let attempt = 0; attempt <= maxRetries; attempt++) {
//     try {
//       const response = await ai.models.generateContent({
//         model: "gemini-3-flash-preview",
//         contents: promptText,
//       });

//       return response.text;
//     } catch (error) {
//       const status = error.status ?? error.statusCode;

//       console.error(
//         `Gemini attempt ${attempt + 1} failed:`,
//         status,
//         error.message,
//       );

//       // Retry only temporary server or overload errors
//       if (![429, 500, 502, 503, 504].includes(status)) {
//         throw error;
//       }

//       // Stop after the final attempt
//       if (attempt === maxRetries) {
//         throw error;
//       }

//       const delay = 1000 * Math.pow(2, attempt);
//       console.log(`Retrying in ${delay / 1000} seconds...`);

//       await sleep(delay);
//     }
//   }
// }

// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// export async function getGeminiAIResponse(messages) {
//   const contents = messages.map((m) => ({
//     role: m.role === "assistant" ? "model" : "user",
//     parts: [{ text: m.content }],
//   }));

//   const response = await ai.models.generateContent({
//     model: "gemini-2.0-flash", // keep whatever model you already use
//     contents,
//     config: {
//       systemInstruction: `You are a helpful assistant. Today's date is ${new Date().toLocaleString(
//         "en-IN",
//         {
//           timeZone: "Asia/Kolkata",
//           dateStyle: "full",
//           timeStyle: "short",
//         },
//       )}.`,
//     },
//   });

//   return response.text;
// }

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from your .env file.");
}

const ai = new GoogleGenAI({ apiKey });

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";

const ENABLE_SEARCH = process.env.ENABLE_SEARCH !== "false";

const MAX_HISTORY = 20;
const MAX_RETRIES = 2;
const SEARCH_COOLDOWN_MS = 10 * 60 * 1000;

let searchDisabledUntil = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function toGeminiContents(messages) {
  let recent = messages
    .filter((m) => typeof m.content === "string" && m.content.trim())
    .slice(-MAX_HISTORY);

  while (recent.length && recent[0].role !== "user") {
    recent = recent.slice(1);
  }

  return recent.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

function buildSystemInstruction(withSearch) {
  const now = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  const base = `You are a helpful, accurate AI assistant.
The current date and time is ${now} IST.

Never invent facts, dates, events, citations, or sources.
Distinguish verified information from uncertainty.
If you cannot verify a recent event, say so clearly.
Do not pretend to have searched the web when you have not.`;

  if (withSearch) {
    return `${base}

Google Search is available. Use it for current events, recent news,
changing facts, and time-sensitive questions.
Base factual claims on search results when relevant.
Prefer authoritative and recent sources.
If search results do not establish an answer, explain the uncertainty.`;
  }

  return `${base}

You do not have web search available in this request.
Answer using your existing knowledge for stable topics.
For current events or information that may have changed,
clearly state that you could not verify the latest information.
Never present an unverified current claim as confirmed.`;
}

function extractText(response) {
  const parts = response?.candidates?.[0]?.content?.parts ?? [];

  return parts
    .filter((part) => typeof part.text === "string" && !part.thought)
    .map((part) => part.text)
    .join("")
    .trim();
}

function getStatus(error) {
  return Number(error?.status ?? error?.statusCode ?? 0);
}

function isRetryable(status) {
  return [500, 502, 503, 504].includes(status);
}

function canTryNextModel(status) {
  return [400, 404, 429, 500, 502, 503, 504].includes(status);
}

async function callModel({ model, contents, withSearch }) {
  const config = {
    systemInstruction: buildSystemInstruction(withSearch),
  };

  if (withSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });

      const text = extractText(response);

      if (text) {
        return text;
      }

      const error = new Error("Gemini returned an empty response.");
      error.status = 502;
      error.empty = true;
      throw error;
    } catch (error) {
      if (error.empty) {
        throw error;
      }

      const status = getStatus(error);

      console.error(
        `Gemini [${model}${withSearch ? "+search" : ""}] ` +
          `attempt ${attempt + 1} failed: ${status} ` +
          `${error.message?.slice(0, 180)}`,
      );

      if (!isRetryable(status) || attempt === MAX_RETRIES) {
        throw error;
      }

      await sleep(1000 * 2 ** attempt);
    }
  }

  throw new Error(`Gemini failed to respond using ${model}.`);
}

export async function getGeminiAIResponse(messages) {
  const contents = toGeminiContents(messages);

  if (!contents.length) {
    throw new Error("No valid messages were provided to Gemini.");
  }

  const attempts = [];
  const searchAvailable = ENABLE_SEARCH && Date.now() >= searchDisabledUntil;

  if (searchAvailable) {
    attempts.push({ model: MODEL, withSearch: true });
  }

  attempts.push({ model: MODEL, withSearch: false });

  if (FALLBACK_MODEL !== MODEL) {
    attempts.push({ model: FALLBACK_MODEL, withSearch: false });
  }

  let lastError;

  for (const attempt of attempts) {
    try {
      const result = await callModel({
        ...attempt,
        contents,
      });

      if (!attempt.withSearch && searchAvailable) {
        console.warn(
          "Gemini answered without search. Current facts may be unverified.",
        );
      }

      return result;
    } catch (error) {
      lastError = error;

      const status = getStatus(error);

      if (attempt.withSearch && status === 429) {
        searchDisabledUntil = Date.now() + SEARCH_COOLDOWN_MS;
        console.warn("Search quota exceeded. Search disabled temporarily.");
      }

      if (!canTryNextModel(status)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("All Gemini model attempts failed.");
}
