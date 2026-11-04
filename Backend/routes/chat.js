// import express from "express";
// import Threads from "../models/thread.js";
// import { getGeminiAIResponse } from "../utils/openai.js";

// const router = express.Router();

// //----------get all threads-----------
// router.get("/thread", async (req, res) => {
//   try {
//     const threads = await Threads.find({}).sort({ updatedAt: -1 });
//     res.status(201).json({ threads });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Failed to fetch Threads" });
//   }
// });

// //----------get single threads-----------
// router.get("/thread/:threadId", async (req, res) => {
//   const { threadId } = req.params;
//   try {
//     const thread = await Threads.findOne({ threadId });

//     if (!thread) {
//       return res.status(404).json({ error: "Thread not found" });
//     }

//     res.json(thread.messages);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Failed to fetch Thread" });
//   }
// });

// //----------delete a thread-----------
// router.delete("/thread/:threadId", async (req, res) => {
//   const { threadId } = req.params;
//   try {
//     const deletedThread = await Threads.findOneAndDelete({ threadId });

//     if (!deletedThread) {
//       return res.status(404).json({ error: "Thread not found" });
//     }

//     res.status(200).json({ message: "Thread deleted successfully" });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Failed to delete Thread" });
//   }
// });

// //----------post a thread-----------

// router.post("/chat", async (req, res) => {
//   const { threadId, message } = req.body;

//   if (!threadId || !message) {
//     return res.status(400).json({
//       error: "Missing required fields",
//     });
//   }

//   try {
//     let thread = await Threads.findOne({ threadId });

//     if (!thread) {
//       thread = new Threads({
//         threadId,
//         title: message,
//         messages: [{ role: "user", content: message }],
//       });
//     } else {
//       thread.messages.push({
//         role: "user",
//         content: message,
//       });
//     }

//     const aiText = await getGeminiAIResponse(thread.messages);

//     thread.messages.push({
//       role: "assistant",
//       content: aiText,
//     });

//     thread.updatedAt = new Date();

//     await thread.save();

//     return res.status(200).json({
//       aiResponse: aiText,
//       threadId: thread.threadId,
//     });
//   } catch (err) {
//     console.error("Chat error:", err);

//     if (err.status === 503 || err.statusCode === 503) {
//       return res.status(503).json({
//         error: "The AI model is temporarily busy. Please try again shortly.",
//       });
//     }

//     return res.status(500).json({
//       error: "Something went wrong while generating the response.",
//     });
//   }
// });

// export default router;

//----------test-----------
// router.post("/test", async (req, res) => {
//   try {
//     const thread = new Threads({
//       threadId: "xyz",
//       title: "Testing New Thread",
//     });

//     await thread.save();

//     res.status(201).json({
//       message: "Thread saved successfully",
//       thread,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Failed to save in DB" });
//   }
// });
import express from "express";
// Keep YOUR existing import paths for these two:
import Threads from "../models/Thread.js";
import { getGeminiAIResponse } from "../utils/openai.js";

const router = express.Router();

// ...your other routes (get threads, delete thread, etc.) stay as they are...

router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message?.trim()) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    let thread = await Threads.findOne({ threadId });

    if (!thread) {
      thread = new Threads({
        threadId,
        // short title instead of the whole first message
        title: message.length > 40 ? message.slice(0, 40) + "…" : message,
        messages: [{ role: "user", content: message }],
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    // Send the whole conversation (the helper trims it to the last 20),
    // so the model knows what "it" and "that" refer to.
    const aiText = await getGeminiAIResponse(thread.messages);

    thread.messages.push({ role: "assistant", content: aiText });
    thread.updatedAt = new Date();

    // Saved only after a successful reply, so a failed request
    // doesn't leave an orphaned user message in the database.
    await thread.save();

    return res.status(200).json({
      aiResponse: aiText,
      threadId: thread.threadId,
    });
  } catch (err) {
    console.error("Chat error:", err);

    const status = err.status ?? err.statusCode;

    if (status === 429) {
      return res.status(429).json({
        error: "AI usage limit reached. Please try again in a bit.",
      });
    }

    if (status === 502) {
      return res.status(502).json({
        error: "The AI returned an empty response. Please try again.",
      });
    }

    if (status === 503) {
      return res.status(503).json({
        error: "The AI model is temporarily busy. Please try again shortly.",
      });
    }

    return res.status(500).json({
      error: "Something went wrong while generating the response.",
    });
  }
});

export default router;
