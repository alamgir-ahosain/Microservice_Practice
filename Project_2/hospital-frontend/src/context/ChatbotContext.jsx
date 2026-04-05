// src/context/ChatbotContext.jsx
import { createContext, useContext, useState } from "react";

const ChatbotContext = createContext(null);

export function ChatbotProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const open   = () => setIsOpen(true);
  const close  = () => setIsOpen(false);
  const toggle = () => setIsOpen(o => !o);
  return (
    <ChatbotContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error("useChatbot must be used inside <ChatbotProvider>");
  return ctx;
}
