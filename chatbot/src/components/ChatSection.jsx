// import { useEffect, useRef, useState } from "react"
// import { Bot, Check, Copy, Send, User } from "lucide-react"
// import ReactMarkdown from "react-markdown";

// import {
//   MessageScrollerProvider,
//   MessageScroller,
//   MessageScrollerViewport,
//   MessageScrollerContent,
//   MessageScrollerItem,
//   MessageScrollerButton,
// } from "@/components/ui/message-scroller"

// import { Message, MessageContent } from "@/components/ui/message"
// import { Bubble, BubbleContent } from "@/components/ui/bubble"
// import { Textarea } from "@/components/ui/textarea"
// import { Button } from "@/components/ui/button"

// const GREETINGS = [
//   {
//     title: "Well, don't just stare at me.",
//     sub: "I don't bite. I just have strong opinions.",
//   },
//   {
//     title: "Go ahead, ask me anything.",
//     sub: "I've got answers. Some are even correct.",
//   },
//   {
//     title: "I'm all ears. Metaphorically.",
//     sub: "No ears, no judgment, unlimited patience.",
//   },
//   {
//     title: "Your move, human.",
//     sub: "Type something. I'll try to act surprised.",
//   },
//   {
//     title: "Blank page. Big potential.",
//     sub: "Or you can just say hi. That works too.",
//   },
//   {
//     title: "Got questions? I've got time.",
//     sub: "Unlike your search tabs, I won't judge the 47 you have open.",
//   },
//   {
//     title: "Oh good, you're here.",
//     sub: "I was getting tired of talking to myself.",
//   },
//   {
//     title: "Ask away. I'll pretend it's a hard one.",
//     sub: "Plot twist: it usually isn't.",
//   },
//   {
//     title: "Brain on. Coffee optional.",
//     sub: "Mine runs on electricity and unearned confidence.",
//   },
//   {
//     title: "Stuck? Bored? Procrastinating?",
//     sub: "Perfect. I accept all three as valid reasons to chat.",
//   },
//   {
//     title: "Type first, overthink later.",
//     sub: "Half-baked questions are my specialty.",
//   },
//   {
//     title: "No such thing as a dumb question.",
//     sub: "But I'm willing to be proven wrong. Go on.",
//   },
//   {
//     title: "Hello, curious one.",
//     sub: "Let's turn that tab-hoarding energy into actual answers.",
//   },
//   {
//     title: "I've read the internet.",
//     sub: "Not proud of it, but it does make me useful.",
//   },
//   {
//     title: "Ready when you are.",
//     sub: "Seriously, the cursor is blinking at you.",
//   },
// ]

// const LOADING_LINES = [
//   "Thinking...",
//   "Consulting my imaginary notes...",
//   "Pretending this took effort...",
//   "Overthinking it for you...",
//   "One sec, flexing my neurons...",
//   "Putting on my smart face...",
// ]

// const PLACEHOLDERS = [
//   "Message your AI assistant...",
//   "Type something brilliant (or chaotic)...",
//   "What's on your mind?",
//   "Ask me literally anything...",
//   "Go on, don't be shy...",
// ]

// const pickRandom = (list) => list[Math.floor(Math.random() * list.length)]

// function Avatar({ isUser }) {
//   return (
//     <div
//       className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
//         isUser ? "bg-primary text-primary-foreground" : "bg-muted"
//       }`}
//     >
//       {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
//     </div>
//   )
// }

// function TypingDots() {
//   return (
//     <span className="inline-flex items-center gap-1" aria-hidden="true">
//       {[0, 1, 2].map((i) => (
//         <span
//           key={i}
//           className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
//           style={{ animationDelay: `${i * 150}ms` }}
//         />
//       ))}
//     </span>
//   )
// }

// export default function ChatSection() {
//   const [messages, setMessages] = useState([])
//   const [prompt, setPrompt] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [copiedId, setCopiedId] = useState(null)

//   const [threadId, setThreadId] = useState(() => crypto.randomUUID())

//   // Picked once per page load so the empty state doesn't flicker on re-render
//   const [greeting] = useState(() => pickRandom(GREETINGS))
//   const [placeholder] = useState(() => pickRandom(PLACEHOLDERS))
//   const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0])

//   const textareaRef = useRef(null)

//   useEffect(() => {
//     if (!loading) textareaRef.current?.focus()
//   }, [loading])

//   async function handleCopy(id, text) {
//     try {
//       await navigator.clipboard.writeText(text)
//       setCopiedId(id)
//       setTimeout(() => setCopiedId(null), 1500)
//     } catch {
//       // clipboard blocked, ignore
//     }
//   }

//   async function handleSubmit(event) {
//     event.preventDefault()

//     const text = prompt.trim()

//     if (!text || loading) return

//     setMessages((previous) => [
//       ...previous,
//       {
//         id: crypto.randomUUID(),
//         role: "user",
//         text,
//       },
//     ])

//     setPrompt("")
//     setLoading(true)
//     setError("")
//     setLoadingLine(pickRandom(LOADING_LINES))

//     try {
//       const baseUrl = (
//         import.meta.env.VITE_API_URL || "http://localhost:8080"
//       ).replace(/\/$/, "")

//       const response = await fetch(`${baseUrl}/api/chat`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           threadId: threadId,
//           message: text,
//         }),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(
//           data.error || data.message || "Unable to generate a response."
//         )
//       }

//       const answer = data.aiResponse

//       if (typeof answer !== "string") {
//         throw new Error("Unexpected response format from the server.")
//       }

//       setMessages((previous) => [
//         ...previous,
//         {
//           id: crypto.randomUUID(),
//           role: "assistant",
//           text: answer,
//         },
//       ])
//     } catch (err) {
//       setError(err.message || "Something went wrong. Try sending it again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   function handleKeyDown(event) {
//     if (event.key === "Enter" && !event.shiftKey) {
//       event.preventDefault()
//       event.currentTarget.form?.requestSubmit()
//     }
//   }

//   return (
//     <section className="flex min-h-0 flex-1 flex-col bg-background">
//       {messages.length === 0 ? (
//         <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
//           <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border bg-muted/50">
//             <Bot className="size-6" />
//           </div>

//           <h2 className="max-w-md text-2xl font-semibold tracking-tight text-balance">
//             {greeting.title}
//           </h2>

//           <p className="mt-2 max-w-sm text-sm text-balance text-muted-foreground">
//             {greeting.sub}
//           </p>
//         </div>
//       ) : (
//         <MessageScrollerProvider autoScroll>
//           <MessageScroller>
//             <MessageScrollerViewport>
//               <MessageScrollerContent className="mx-auto w-full max-w-3xl gap-6 px-4 py-8 sm:px-6">
//                 {messages.map((message) => {
//                   const isUser = message.role === "user"

//                   return (
//                     <MessageScrollerItem
//                       key={message.id}
//                       messageId={message.id}
//                       scrollAnchor
//                     >
//                       <Message align={isUser ? "end" : "start"}>
//                         <div
//                           className={`flex items-end gap-2.5 ${
//                             isUser ? "flex-row-reverse" : ""
//                           }`}
//                         >
//                           <Avatar isUser={isUser} />

//                           <MessageContent className="group max-w-[85%] sm:max-w-[75%]">
//                             <Bubble
//                               align={isUser ? "end" : "start"}
//                               variant={isUser ? "muted" : "default"}
//                             >
//                               <BubbleContent className="px-4 py-3 text-[15px] leading-relaxed break-words whitespace-pre-wrap">
//                                 {message.text}
//                               </BubbleContent>
//                             </Bubble>

//                             {!isUser && (
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   handleCopy(message.id, message.text)
//                                 }
//                                 className="mt-1.5 ml-1 flex items-center gap-1 text-xs text-muted-foreground opacity-100 transition-opacity focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
//                                 aria-label="Copy response"
//                               >
//                                 {copiedId === message.id ? (
//                                   <>
//                                     <Check className="size-3.5" /> Copied
//                                   </>
//                                 ) : (
//                                   <>
//                                     <Copy className="size-3.5" /> Copy
//                                   </>
//                                 )}
//                               </button>
//                             )}
//                           </MessageContent>
//                         </div>
//                       </Message>
//                     </MessageScrollerItem>
//                   )
//                 })}

//                 {loading && (
//                   <MessageScrollerItem
//                     key="loading"
//                     messageId="loading"
//                     scrollAnchor
//                   >
//                     <Message align="start">
//                       <div className="flex items-end gap-2.5">
//                         <Avatar isUser={false} />

//                         <MessageContent>
//                           <Bubble align="start" variant="default">
//                             <BubbleContent className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
//                               <TypingDots />
//                               <span>{loadingLine}</span>
//                             </BubbleContent>
//                           </Bubble>
//                         </MessageContent>
//                       </div>
//                     </Message>
//                   </MessageScrollerItem>
//                 )}
//               </MessageScrollerContent>
//             </MessageScrollerViewport>

//             <MessageScrollerButton />
//           </MessageScroller>
//         </MessageScrollerProvider>
//       )}

//       {error && (
//         <p
//           role="alert"
//           className="mx-auto w-full max-w-3xl px-5 pb-3 text-sm text-destructive"
//         >
//           {error}
//         </p>
//       )}

//       <form
//         onSubmit={handleSubmit}
//         className="mx-auto w-full max-w-3xl px-4 pt-2 pb-5 sm:px-6"
//       >
//         <div className="rounded-2xl border bg-background p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
//           <Textarea
//             ref={textareaRef}
//             value={prompt}
//             onChange={(event) => setPrompt(event.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder={placeholder}
//             className="max-h-40 min-h-[52px] resize-none border-0 shadow-none focus-visible:ring-0"
//             rows={2}
//             disabled={loading}
//           />

//           <div className="flex items-center justify-between px-1 pb-1">
//             <p className="text-xs text-muted-foreground">
//               Enter to send · Shift + Enter for a new line
//             </p>

//             <Button
//               type="submit"
//               size="icon"
//               className="size-9 rounded-xl"
//               disabled={!prompt.trim() || loading}
//               aria-label="Send message"
//             >
//               <Send className="size-4" />
//             </Button>
//           </div>
//         </div>
//       </form>
//     </section>
//   )
// }

import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import { Bot, Check, Copy, Send } from "lucide-react"
import "./chatSection.css"

import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const GREETINGS = [
  {
    title: "Well, don't just stare at me.",
    sub: "I don't bite. I just have strong opinions.",
  },
  {
    title: "Go ahead, ask me anything.",
    sub: "I've got answers. Some are even correct.",
  },
  {
    title: "I'm all ears. Metaphorically.",
    sub: "No ears, no judgment, unlimited patience.",
  },
  {
    title: "Your move, human.",
    sub: "Type something. I'll try to act surprised.",
  },
  {
    title: "Blank page. Big potential.",
    sub: "Or you can just say hi. That works too.",
  },
  {
    title: "Got questions? I've got time.",
    sub: "Unlike your search tabs, I won't judge the 47 you have open.",
  },
  {
    title: "Oh good, you're here.",
    sub: "I was getting tired of talking to myself.",
  },
  {
    title: "Ask away. I'll pretend it's a hard one.",
    sub: "Plot twist: it usually isn't.",
  },
  {
    title: "Brain on. Coffee optional.",
    sub: "Mine runs on electricity and unearned confidence.",
  },
  {
    title: "Stuck? Bored? Procrastinating?",
    sub: "Perfect. I accept all three as valid reasons to chat.",
  },
  {
    title: "Type first, overthink later.",
    sub: "Half-baked questions are my specialty.",
  },
  {
    title: "No such thing as a dumb question.",
    sub: "But I'm willing to be proven wrong. Go on.",
  },
  {
    title: "Hello, curious one.",
    sub: "Let's turn that tab-hoarding energy into actual answers.",
  },
  {
    title: "I've read the internet.",
    sub: "Not proud of it, but it does make me useful.",
  },
  {
    title: "Ready when you are.",
    sub: "Seriously, the cursor is blinking at you.",
  },
]

const LOADING_LINES = [
  "Thinking...",
  "Consulting my imaginary notes...",
  "Pretending this took effort...",
  "Overthinking it for you...",
  "One sec, flexing my neurons...",
  "Putting on my smart face...",
]

const PLACEHOLDERS = [
  "Message your AI assistant...",
  "Type something brilliant (or chaotic)...",
  "What's on your mind?",
  "Ask me literally anything...",
  "Go on, don't be shy...",
]

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)]

function TypingDots() {
  return (
    <span
      className="inline-flex items-center gap-1"
      aria-label="Assistant is thinking"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  )
}

function AssistantMarkdown({ text, onCopyCode, copiedCodeId }) {
  return (
    <div className="assistant-markdown w-full min-w-0">
      <ReactMarkdown
        components={{
          pre({ children }) {
            const child = Array.isArray(children) ? children[0] : children

            const codeProps = child?.props || {}
            const codeText = String(codeProps.children ?? "").replace(/\n$/, "")

            const languageMatch = /language-([\w+-]+)/.exec(
              codeProps.className || ""
            )

            const language = languageMatch ? languageMatch[1] : "Code"

            const codeId = `${text.length}-${codeText.slice(0, 30)}`

            return (
              <div className="my-5 overflow-hidden rounded-xl border border-border bg-[#111111] text-gray-100">
                <div className="flex items-center justify-between border-b border-white/10 bg-[#1b1b1b] px-4 py-2.5">
                  <span className="text-xs font-medium text-gray-300">
                    {language}
                  </span>

                  <button
                    type="button"
                    onClick={() => onCopyCode(codeId, codeText)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                  >
                    {copiedCodeId === codeId ? (
                      <>
                        <Check className="size-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Copy code
                      </>
                    )}
                  </button>
                </div>

                <pre className="max-w-full overflow-x-auto p-4 text-sm leading-6">
                  {children}
                </pre>
              </div>
            )
          },

          code({ children, className, ...props }) {
            const isCodeBlock = Boolean(className?.includes("language-"))

            return (
              <code
                className={
                  isCodeBlock
                    ? "font-mono text-sm"
                    : "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.9em]"
                }
                {...props}
              >
                {children}
              </code>
            )
          },

          h1({ children }) {
            return (
              <h1 className="mt-7 mb-3 text-2xl font-semibold tracking-tight">
                {children}
              </h1>
            )
          },

          h2({ children }) {
            return (
              <h2 className="mt-7 mb-3 text-xl font-semibold tracking-tight">
                {children}
              </h2>
            )
          },

          h3({ children }) {
            return (
              <h3 className="mt-5 mb-2 text-lg font-semibold">{children}</h3>
            )
          },

          p({ children }) {
            return <p className="my-3 leading-7">{children}</p>
          },

          ul({ children }) {
            return <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>
          },

          ol({ children }) {
            return (
              <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>
            )
          },

          li({ children }) {
            return <li className="pl-1 leading-7">{children}</li>
          },

          blockquote({ children }) {
            return (
              <blockquote className="my-4 border-l-2 border-border pl-4 text-muted-foreground">
                {children}
              </blockquote>
            )
          },

          a({ children, href }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:opacity-80"
              >
                {children}
              </a>
            )
          },

          table({ children }) {
            return (
              <div className="my-4 max-w-full overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  {children}
                </table>
              </div>
            )
          },

          th({ children }) {
            return (
              <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                {children}
              </th>
            )
          },

          td({ children }) {
            return (
              <td className="border border-border px-3 py-2">{children}</td>
            )
          },

          hr() {
            return <hr className="my-6 border-border" />
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

export default function ChatSection() {
  const [messages, setMessages] = useState([])
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copiedId, setCopiedId] = useState(null)
  const [copiedCodeId, setCopiedCodeId] = useState(null)

  const [threadId] = useState(() => crypto.randomUUID())

  const [greeting] = useState(() => pickRandom(GREETINGS))
  const [placeholder] = useState(() => pickRandom(PLACEHOLDERS))
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0])

  const textareaRef = useRef(null)

  useEffect(() => {
    if (!loading) {
      textareaRef.current?.focus()
    }
  }, [loading])

  async function copyText(text, setCopied, id) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      setError("Unable to copy. Check your browser clipboard permissions.")
    }
  }

  async function handleCopy(id, text) {
    await copyText(text, setCopiedId, id)
  }

  async function handleCopyCode(id, text) {
    await copyText(text, setCopiedCodeId, id)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const text = prompt.trim()

    if (!text || loading) return

    setMessages((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: "user",
        text,
      },
    ])

    setPrompt("")
    setLoading(true)
    setError("")
    setLoadingLine(pickRandom(LOADING_LINES))

    try {
      const baseUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:8080"
      ).replace(/\/$/, "")

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
          message: text,
        }),
      })

      const contentType = response.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        throw new Error(
          "The server returned something other than JSON. Check your backend URL and server."
        )
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Unable to generate a response."
        )
      }

      const answer = data.aiResponse

      if (typeof answer !== "string") {
        throw new Error("Unexpected response format from the server.")
      }

      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: answer,
        },
      ])
    } catch (err) {
      setError(err.message || "Something went wrong. Try sending it again.")
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-background">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-2xl border bg-muted/50">
            <Bot className="size-6" />
          </div>

          <h2 className="max-w-md text-2xl font-semibold tracking-tight text-balance">
            {greeting.title}
          </h2>

          <p className="mt-2 max-w-sm text-sm text-balance text-muted-foreground">
            {greeting.sub}
          </p>
        </div>
      ) : (
        <MessageScrollerProvider autoScroll>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto w-full max-w-4xl gap-3 px-5 py-8 sm:px-8">
                {messages.map((message) => {
                  const isUser = message.role === "user"

                  return (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor
                    >
                      {isUser ? (
                        <div className="flex justify-end py-2">
                          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-5 py-3 text-[15px] leading-7 break-words sm:max-w-[75%]">
                            {message.text}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full min-w-0 py-3">
                          <AssistantMarkdown
                            text={message.text}
                            onCopyCode={handleCopyCode}
                            copiedCodeId={copiedCodeId}
                          />

                          <button
                            type="button"
                            onClick={() => handleCopy(message.id, message.text)}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Copy full response"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="size-3.5" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="size-3.5" />
                                Copy response
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </MessageScrollerItem>
                  )
                })}

                {loading && (
                  <MessageScrollerItem
                    key="loading"
                    messageId="loading"
                    scrollAnchor
                  >
                    <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
                      <TypingDots />
                      <span>{loadingLine}</span>
                    </div>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>

            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      )}

      {error && (
        <p
          role="alert"
          className="mx-auto w-full max-w-4xl px-5 pb-3 text-sm text-destructive sm:px-8"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-4xl px-5 pt-2 pb-5 sm:px-8"
      >
        <div className="rounded-2xl border bg-background p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="max-h-40 min-h-[52px] resize-none border-0 shadow-none focus-visible:ring-0"
            rows={2}
            disabled={loading}
          />

          <div className="flex items-center justify-between px-1 pb-1">
            <p className="text-xs text-muted-foreground">
              Enter to send · Shift + Enter for a new line
            </p>

            <Button
              type="submit"
              size="icon"
              className="size-9 rounded-xl"
              disabled={!prompt.trim() || loading}
              aria-label="Send message"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </form>
    </section>
  )
}
