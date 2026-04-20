import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import axiosClient from "../utils/axiosClient";
function ChatAi({ problem }) {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [{ text: "Hi 👋 Ask me anything about this DSA problem!" }],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 FORMATTER (CORE PART)
  const formatMessage = (text) => {
    if (!text) return null;

    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // CODE BLOCK
      if (part.startsWith("```") && part.endsWith("```")) {
        let code = part.slice(3, -3).trim();

        let language = "javascript";
        const firstLine = code.split("\n")[0];

        if (firstLine.match(/^(python|cpp|c\+\+|java|javascript)/i)) {
          language = firstLine.toLowerCase();
          code = code.substring(firstLine.length).trim();
        }

        return (
          <div key={index} className="my-4 rounded-xl overflow-hidden border border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center bg-gray-800 px-4 py-2 text-sm text-gray-300">
              <span>{language}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setCopied(index);
                  setTimeout(() => setCopied(null), 1500);
                }}
                className="flex items-center gap-1 text-xs"
              >
                {copied === index ? <Check size={14} /> : <Copy size={14} />}
                {copied === index ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Code */}
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{
                margin: 0,
                padding: "14px",
                background: "#0d1117",
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }

      // NORMAL TEXT
      return (
        <div key={index} className="space-y-2 text-gray-300 leading-relaxed">
          {part.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      );
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      role: "user",
      parts: [{ text: input }],
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axiosClient.post("/ai/chat", {
        messages: updatedMessages,
        title: problem.title,
        description: problem.description,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: res.data.message }],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [{ text: "⚠️ Error fetching response" }],
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-white rounded-xl">

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl shadow ${
                msg.role === "user"
                  ? "bg-green-400 text-black"
                  : "bg-[#1f2937]"
              }`}
            >
              {formatMessage(msg.parts[0].text)}
            </div>
          </div>
        ))}

        {loading && <p className="text-gray-400">Typing...</p>}
        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-gray-700 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your doubt..."
          className="flex-1 p-3 rounded-full bg-[#1f2937] outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-green-400 text-black px-5 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatAi;
