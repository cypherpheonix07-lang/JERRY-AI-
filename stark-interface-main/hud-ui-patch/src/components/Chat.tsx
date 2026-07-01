/**
 * Chat message bubble component
 */
import React from 'react';
import { motion } from 'framer-motion';
import type { ConversationMessage } from '@/types';

interface ChatMessageProps {
  message: ConversationMessage;
  isLatest?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLatest = false }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end mb-3 gap-3`}
    >
      {!isUser && (
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-800/60 text-sky-300 flex items-center justify-center text-xs font-semibold">
          AI
        </div>
      )}

      <div
        className={`max-w-full rounded-3xl border px-4 py-3 text-sm leading-relaxed shadow-[0_8px_24px_rgba(0,0,0,0.15)] backdrop-blur-xl ${
          isUser
            ? 'bg-gradient-to-r from-sky-600/12 to-sky-400/6 border-sky-400/30 text-gradient-hud ring-1 ring-sky-400/10'
            : 'bg-slate-900/85 border-slate-700/70 text-slate-300'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <span className="mt-2 block text-[11px] uppercase tracking-[0.35em] text-slate-500">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {isUser && (
        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-sky-700/20 text-sky-200 flex items-center justify-center text-xs font-semibold">
          U
        </div>
      )}
    </motion.div>
  );
};

interface ChatContainerProps {
  messages: ConversationMessage[];
  isLoading?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ messages, isLoading = false }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto rounded-[32px] border border-slate-700/70 bg-slate-950/80 p-4 shadow-[inset_0_0_45px_rgba(0,0,0,0.55)]"
    >
      {messages.length === 0 ? (
        <div className="flex h-full min-h-[220px] items-center justify-center text-center text-slate-500">
          <p className="max-w-xs text-[12px] uppercase tracking-[0.35em] leading-6 text-slate-500">
            Awaiting neural command... system status and responses will display here.
          </p>
        </div>
      ) : (
        <>
          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLatest={idx === messages.length - 1}
            />
          ))}
          {isLoading && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-3 flex items-center gap-2 text-sky-300"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-pulse delay-150" />
              <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-pulse delay-300" />
              <span className="text-xs uppercase tracking-[0.35em] text-slate-500">Processing...</span>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};
