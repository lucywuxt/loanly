import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, X, Minimize2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatWidgetProps {
  selectedProjectId?: number;
  selectedWithdrawalId?: number;
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({ selectedProjectId, selectedWithdrawalId }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelBadge, setModelBadge] = useState('gemini-3.6-flash');
  const [contextSummary, setContextSummary] = useState('Live Client Connection Context');
  const [suggestions, setSuggestions] = useState<string[]>([
    "What's the status of my latest withdrawal application?",
    'Which expenditure category does consultant travel fall under?',
    'What is the difference between an IBRD Loan, IDA Credit, and IDA Grant?',
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Welcome to the **Loanly Client Connection Operations Assistant** (powered by **Gemini 3.6 Flash**). Ask me about your active project ceilings, Withdrawal Application statuses, expenditure categories (Works, Goods, ConsultingServices, Training, OperatingCosts), or IBRD/IDA instruments.',
    },
  ]);

  if (!user) return null;

  const handleSend = async (promptText?: string) => {
    const text = (promptText ?? input).trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    if (!promptText) setInput('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage({
        message: text,
        selectedProjectId,
        selectedWithdrawalId,
        history: nextMessages.slice(-6),
      });
      setMessages([...nextMessages, { role: 'assistant', content: response.reply }]);
      setModelBadge(response.modelUsed);
      setContextSummary(response.contextSummary);
      if (response.suggestedFollowUps?.length) {
        setSuggestions(response.suggestedFollowUps);
      }
    } catch (err) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content:
            err instanceof Error
              ? `Error communicating with assistant: ${err.message}`
              : 'Unable to reach the assistant right now.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          title="Open Gemini 3.6 Flash Operations Assistant"
          className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-100 shadow-lg transition-colors hover:border-emerald-500/60"
        >
          <Sparkles className="h-4 w-4 text-emerald-400" />
          Client Connection AI
          <MessageSquare className="h-4 w-4" />
        </button>
      ) : (
        <div className="flex h-[520px] w-[360px] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-800 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-100">Client Connection Assistant</div>
                <div className="text-[10px] text-zinc-500">
                  {modelBadge} • {contextSummary}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                title="Minimize"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  'rounded-lg border p-2.5 text-xs leading-relaxed',
                  m.role === 'assistant'
                    ? 'border-zinc-800 bg-zinc-800/50 text-zinc-200'
                    : 'ml-6 border-emerald-500/20 bg-emerald-500/10 text-zinc-100'
                )}
              >
                <div className="mb-1 text-[10px] font-medium text-zinc-500">
                  {m.role === 'assistant' ? 'WB Operations AI' : user.name}
                </div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-2.5 text-xs text-zinc-400">
                Analyzing live portfolio &amp; IPF guidelines…
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-zinc-800 p-2">
            {suggestions.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                disabled={loading}
                className="rounded-full border border-zinc-800 bg-zinc-800/50 px-2.5 py-1 text-[10px] text-zinc-400 transition-colors hover:border-emerald-500/40 hover:text-zinc-200 disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2 border-t border-zinc-800 p-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about expenditure categories, WAs, or project ceilings..."
              disabled={loading}
              className="h-8 flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500/50"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
