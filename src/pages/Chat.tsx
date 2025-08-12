import { useState, useEffect, useMemo } from "react";
import { Send, Bot, User, Loader2, Menu, Plus, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  message: string;
  time: string;
  context?: string;
}

interface ChatSession {
  id: string;
  title: string;
  context: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActivity: Date;
  mabotChatId?: string; // server-side chat id for continuity
}

interface StudyContext {
  id: string;
  name: string;
  type: 'program' | 'subject' | 'topic';
  parentId?: string;
}

const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

export default function Chat() {
  const { user } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [selectedContext, setSelectedContext] = useState<string>('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mabot config: set via env or localStorage. We never read .env files directly, only env vars
  const MABOT_BASE_URL = useMemo(() => {
    const envAny = (import.meta as any)?.env || {};
    const fromEnv = envAny.VITE_MABOT_BASE_URL;
    const fromStorage = typeof window !== 'undefined' ? window.localStorage.getItem('mabot_base_url') : null;
    return (fromStorage || fromEnv || '').toString();
  }, []);

  const MABOT_USERNAME = useMemo(() => {
    const envAny = (import.meta as any)?.env || {};
    const fromEnv = envAny.VITE_MABOT_USERNAME;
    const fromStorage = typeof window !== 'undefined' ? window.localStorage.getItem('mabot_username') : null;
    return (fromStorage || fromEnv || '').toString();
  }, []);

  const MABOT_PASSWORD = useMemo(() => {
    const envAny = (import.meta as any)?.env || {};
    const fromEnv = envAny.VITE_MABOT_PASSWORD;
    const fromStorage = typeof window !== 'undefined' ? window.localStorage.getItem('mabot_password') : null;
    return (fromStorage || fromEnv || '').toString();
  }, []);

  const [mabotAccessToken, setMabotAccessToken] = useState<string>(() => (typeof window !== 'undefined' ? window.localStorage.getItem('mabot_access_token') || '' : ''));
  const [mabotRefreshToken, setMabotRefreshToken] = useState<string>(() => (typeof window !== 'undefined' ? window.localStorage.getItem('mabot_refresh_token') || '' : ''));

  const mabotConfigured = Boolean(MABOT_BASE_URL);

  // Mock study contexts - replace with user data later
  const studyContexts: StudyContext[] = [
    { id: 'law', name: 'Public Law', type: 'subject' },
    { id: 'math', name: 'Advanced Mathematics', type: 'subject' },
    { id: 'history', name: 'World History', type: 'subject' },
    { id: 'science', name: 'Biology', type: 'subject' },
    { id: 'general', name: 'General Knowledge', type: 'program' },
  ];

  // Initialize with a default chat session
  useEffect(() => {
    if (chatSessions.length === 0) {
      const defaultChat: ChatSession = {
        id: 'default',
        title: 'General Chat',
        context: 'general',
        messages: [{
          id: '1',
          type: 'bot',
          message: `Hi ${user?.user_metadata?.full_name || 'there'}! I'm your AI study assistant. Select a study context to get personalized help with your materials.`,
          time: nowTime(),
          context: 'general'
        }],
        createdAt: new Date(),
        lastActivity: new Date()
      };
      setChatSessions([defaultChat]);
      setCurrentChatId('default');
      setSelectedContext('general');
    }
  }, [user, chatSessions.length]);

  const currentChat = chatSessions.find(chat => chat.id === currentChatId);
  const currentContext = studyContexts.find(ctx => ctx.id === selectedContext);

  const suggestions: string[] = [];

  const createNewChat = (contextId: string) => {
    const context = studyContexts.find(ctx => ctx.id === contextId);
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: `New ${context?.name || 'Study'} Chat`,
      context: contextId,
      messages: [{
        id: '1',
        type: 'bot',
        message: `Hi! I'm ready to help you with ${context?.name || 'your studies'}. What would you like to know?`,
        time: nowTime(),
        context: contextId
      }],
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    setChatSessions(prev => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    setSelectedContext(contextId);
    setIsMenuOpen(false);
  };

  const deleteChat = (chatId: string) => {
    setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
    
    if (chatId === currentChatId && chatSessions.length > 1) {
      const remainingChats = chatSessions.filter(chat => chat.id !== chatId);
      setCurrentChatId(remainingChats[0].id);
      setSelectedContext(remainingChats[0].context);
    } else if (chatSessions.length === 1) {
      createNewChat('general');
    }
  };

  const resetChat = () => {
    if (!currentChat) return;
    
    const resetChat: ChatSession = {
      ...currentChat,
      mabotChatId: undefined,
      messages: [{
        id: '1',
        type: 'bot',
        message: `Chat reset! I'm ready to help you with ${currentContext?.name || 'your studies'}. What would you like to know?`,
        time: nowTime(),
        context: selectedContext
      }],
      lastActivity: new Date()
    };
    
    setChatSessions(prev => prev.map(chat => 
      chat.id === currentChatId ? resetChat : chat
    ));
  };

  // Auth helpers for Mabot
  const loginToMabot = async (): Promise<boolean> => {
    try {
      if (!mabotConfigured || !MABOT_USERNAME || !MABOT_PASSWORD) return false;
      
      console.log('[Mabot Login] Attempting login with:', {
        baseUrl: MABOT_BASE_URL,
        username: MABOT_USERNAME,
        passwordLength: MABOT_PASSWORD.length
      });
      
      const body = new URLSearchParams();
      body.set('username', MABOT_USERNAME);
      body.set('password', MABOT_PASSWORD);
      body.set('grant_type', 'password');
      
      console.log('[Mabot Login] Sending request to:', `${MABOT_BASE_URL}/auth/login`);
      
      const res = await fetch(`${MABOT_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      
      console.log('[Mabot Login] Response status:', res.status);
      console.log('[Mabot Login] Response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[Mabot Login] Error response:', errorText);
        return false;
      }
      
      const data = await res.json();
      console.log('[Mabot Login] Success response:', {
        hasAccessToken: !!data?.access_token,
        hasRefreshToken: !!data?.refresh_token,
        tokenType: data?.token_type
      });
      
      const access = data?.access_token as string | undefined;
      const refresh = data?.refresh_token as string | undefined;
      if (!access || !refresh) return false;
      
      setMabotAccessToken(access);
      setMabotRefreshToken(refresh);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('mabot_access_token', access);
        window.localStorage.setItem('mabot_refresh_token', refresh);
      }
      return true;
    } catch (error) {
      console.error('[Mabot Login] Exception:', error);
      return false;
    }
  };

  const refreshMabotTokens = async (): Promise<boolean> => {
    try {
      if (!mabotConfigured || !mabotRefreshToken) return false;
      const res = await fetch(`${MABOT_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: mabotRefreshToken })
      });
      if (!res.ok) return false;
      const data = await res.json();
      const access = data?.access_token as string | undefined;
      const refresh = data?.refresh_token as string | undefined;
      if (!access || !refresh) return false;
      setMabotAccessToken(access);
      setMabotRefreshToken(refresh);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('mabot_access_token', access);
        window.localStorage.setItem('mabot_refresh_token', refresh);
      }
      return true;
    } catch {
      return false;
    }
  };

  const ensureMabotAuth = async (): Promise<boolean> => {
    if (!mabotConfigured) return false;
    if (mabotAccessToken) return true;
    if (await loginToMabot()) return true;
    return false;
  };

  const buildDeveloperInstruction = (userName?: string, contextName?: string) => {
    const name = userName || 'the student';
    const ctx = contextName || 'General Knowledge';
    return (
      `IMPORTANT: You are an AI Study Assistant named Gemini. Your primary goal is to help a student named ${name} learn and understand their academic material.\n\n` +
      `CRITICAL RULES:\n` +
      `1. Answer ONLY using information from the study context: ${ctx}\n` +
      `2. NEVER use external knowledge or general information\n` +
      `3. If information is missing from ${ctx}, say "I don't have enough information about this in your ${ctx} materials. Please upload relevant documents to /library and try again."\n` +
      `4. Respond in the same language as the user's question\n` +
      `5. After answering, suggest a related topic from ${ctx} or ask a follow-up question\n` +
      `6. For exam/deadline questions, check ${ctx} first, then direct to /Plan if not found\n\n` +
      `Now, here is the student's question:`
    );
  };

  const sendToMabot = async (text: string) => {
    if (!currentChat) return { ok: false, error: 'No chat' } as const;

    const ok = await ensureMabotAuth();
    if (!ok) return { ok: false, error: 'Mabot not configured or auth failed' } as const;

    // Generate a unique platform chat ID if this is the first message
    const platformChatId = currentChat.mabotChatId || `web_${currentChat.id}_${Date.now()}`;

    const payload = {
      platform: 'web',
      chat_id: currentChat.mabotChatId || null,
      platform_chat_id: platformChatId,
      bot_username: 'cuaderbot',
      prefix_with_bot_name: false,
      messages: [
        {
          role: 'user',
          contents: [
            { type: 'text', value: buildDeveloperInstruction(user?.user_metadata?.full_name, currentContext?.name), parse_mode: 'Markdown' }
          ]
        },
        {
          role: 'user',
          contents: [
            { type: 'text', value: text }
          ]
        }
      ]
    };

    console.log('[Mabot Send] Sending payload:', {
      url: `${MABOT_BASE_URL}/io/input`,
      botUsername: payload.bot_username,
      hasAccessToken: !!mabotAccessToken,
      accessTokenLength: mabotAccessToken?.length || 0,
      chatId: payload.chat_id,
      platformChatId: payload.platform_chat_id,
      messageCount: payload.messages.length,
      isFirstMessage: !currentChat.mabotChatId
    });

    const res = await fetch(`${MABOT_BASE_URL}/io/input`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mabotAccessToken}`
      },
      body: JSON.stringify(payload)
    });

    console.log('[Mabot Send] Response status:', res.status);
    console.log('[Mabot Send] Response headers:', Object.fromEntries(res.headers.entries()));

    if (res.status === 401) {
      console.log('[Mabot Send] 401 Unauthorized, attempting token refresh...');
      const refreshed = await refreshMabotTokens();
      if (!refreshed) return { ok: false, error: 'Unauthorized' } as const;
      
      console.log('[Mabot Send] Token refreshed, retrying request...');
      const retry = await fetch(`${MABOT_BASE_URL}/io/input`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.localStorage.getItem('mabot_access_token') || ''}`
        },
        body: JSON.stringify(payload)
      });
      
      console.log('[Mabot Send] Retry response status:', retry.status);
      if (!retry.ok) return { ok: false, error: `HTTP ${retry.status}` } as const;
      const data = await retry.json();
      return { ok: true, data } as const;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Mabot Send] Error response:', errorText);
      return { ok: false, error: `HTTP ${res.status}` } as const;
    }
    
    const data = await res.json();
    return { ok: true, data } as const;
  };

  const extractAssistantText = (updateOut: any): string => {
    try {
      const msgs: any[] = updateOut?.messages || [];
      const assistantMsgs = msgs.filter(m => m?.role === 'assistant');
      if (!assistantMsgs.length) return '';
      const parts: string[] = [];
      for (const m of assistantMsgs) {
        const contents = m?.contents || [];
        for (const c of contents) {
          if (c?.type === 'text' && typeof c?.value === 'string') parts.push(c.value);
        }
      }
      return parts.join('\n\n');
    } catch {
      return '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentChat) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      time: nowTime(),
      context: selectedContext
    };

    setChatSessions(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, userMessage],
            lastActivity: new Date()
          }
        : chat
    ));

    const textToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Try sending to Mabot; fallback to placeholder if misconfigured
    if (mabotConfigured) {
      const result = await sendToMabot(textToSend);
      if (result.ok) {
        const data = result.data as any;
        const mabotChatId = data?.chat_id as string | undefined;
        
        console.log('[Mabot Response] Received:', {
          hasData: !!data,
          chatId: mabotChatId,
          messageCount: data?.messages?.length || 0
        });
        
        const plainText = extractAssistantText(data) || '...';
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          message: plainText,
          time: nowTime(),
          context: selectedContext
        };
        
        // Update chat session with new message and save Mabot chat ID
        setChatSessions(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { 
                ...chat, 
                mabotChatId: mabotChatId || chat.mabotChatId,
                messages: [...chat.messages, botMessage],
                lastActivity: new Date()
              }
            : chat
        ));
        setIsLoading(false);
        return;
      } else {
        console.error('[Mabot Error] Failed to send message:', result.error);
        // Show error message to user
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          message: `Error: No se pudo conectar con el asistente AI. ${result.error}`,
          time: nowTime(),
          context: selectedContext
        };
        
        setChatSessions(prev => prev.map(chat => 
          chat.id === currentChatId 
            ? { 
                ...chat, 
                messages: [...chat.messages, errorMessage],
                lastActivity: new Date()
              }
            : chat
        ));
        setIsLoading(false);
        return;
      }
    }

    // If Mabot is not configured, show configuration message
    const configMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      message: 'Mabot no está configurado. Por favor, configura las variables de entorno o usa localStorage para conectar con el asistente AI.',
      time: nowTime(),
      context: selectedContext
    };
    
    setChatSessions(prev => prev.map(chat => 
      chat.id === currentChatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, configMessage],
            lastActivity: new Date()
          }
        : chat
    ));
    setIsLoading(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatChatTitle = (chat: ChatSession) => {
    const context = studyContexts.find(ctx => ctx.id === chat.context);
    return chat.title || `${context?.name || 'Study'} Chat`;
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const showMabotBanner = !mabotConfigured || !MABOT_USERNAME || !MABOT_PASSWORD;

  // Debug logs for env/localStorage detection (password masked)
  useEffect(() => {
    console.log('=== MABOT CONFIG DEBUG START ===');
    
    try {
      const envAny = (import.meta as any)?.env || {};
      const envKeys = Object.keys(envAny).filter((k) => k.includes('MABOT'));
      const maskedPassword = MABOT_PASSWORD ? `${'*'.repeat(4)}(${MABOT_PASSWORD.length} chars)` : '(empty)';
      const ls = typeof window !== 'undefined' ? window.localStorage : null;
      const lsPresence = ls ? {
        mabot_base_url: !!ls.getItem('mabot_base_url'),
        mabot_username: !!ls.getItem('mabot_username'),
        mabot_password: !!ls.getItem('mabot_password'),
      } : {};

      console.log('env keys containing "MABOT":', envKeys);
      console.log('All env keys:', Object.keys(envAny));
      console.log('import.meta.env object:', envAny);
      console.log('import.meta.env.MODE:', (import.meta as any)?.env?.MODE);
      console.log('import.meta.env.DEV:', (import.meta as any)?.env?.DEV);
      console.log('MABOT_BASE_URL (resolved):', MABOT_BASE_URL);
      console.log('MABOT_USERNAME (resolved):', MABOT_USERNAME);
      console.log('MABOT_PASSWORD present?:', Boolean(MABOT_PASSWORD), 'masked:', maskedPassword);
      console.log('LocalStorage overrides present:', lsPresence);
      console.log('mabotConfigured:', mabotConfigured);

      if (typeof window !== 'undefined') {
        (window as any).__MABOT_DEBUG__ = {
          envKeys,
          envSample: Object.fromEntries(envKeys.map((k) => [k, envAny[k]])),
          resolved: {
            baseUrl: MABOT_BASE_URL,
            username: MABOT_USERNAME,
            passwordPresent: Boolean(MABOT_PASSWORD),
          },
          localStoragePresence: lsPresence,
          mabotConfigured,
          importMetaEnv: Object.keys(envAny),
          allEnvKeys: Object.keys(envAny).filter(k => k.includes('MABOT') || k.includes('VITE')),
        };
        console.log('Debug object available at window.__MABOT_DEBUG__');
      }
      
      console.log('=== MABOT CONFIG DEBUG END ===');
    } catch (e) {
      console.error('[Mabot Config Debug] exception during logging:', e);
    }
  }, [MABOT_BASE_URL, MABOT_USERNAME, MABOT_PASSWORD, mabotConfigured]);

  return (
    <div className="flex flex-col h-screen pb-20">
      {/* Header with Context Selector and Menu */}
      <div className="flex items-center justify-between pt-8 pb-4 px-6">
        <div className="flex items-center gap-3">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Open chat menu">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Chat Sessions</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                <Button 
                  onClick={() => createNewChat('general')}
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <Plus size={16} />
                  New Chat
                </Button>

                <div className="space-y-2">
                  {chatSessions.map((chat) => (
                    <div key={chat.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => {
                            setCurrentChatId(chat.id);
                            setSelectedContext(chat.context);
                            setIsMenuOpen(false);
                          }}
                          className={`text-left w-full ${
                            chat.id === currentChatId 
                              ? 'text-primary font-medium' 
                              : 'text-foreground'
                          }`}
                          aria-label={`Open chat ${formatChatTitle(chat)}`}
                        >
                          <p className="font-medium truncate">{formatChatTitle(chat)}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatLastActivity(chat.lastActivity)}
                          </p>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => resetChat()}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          disabled={chat.id !== currentChatId}
                          aria-label="Reset chat"
                        >
                          <RotateCcw size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteChat(chat.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          aria-label="Delete chat"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl border-border/30" aria-label="Select context">
                <span className="truncate max-w-32">
                  {currentContext ? `Context: ${currentContext.name}` : 'Select Context'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {studyContexts.map((context) => (
                <DropdownMenuItem
                  key={context.id}
                  onClick={() => {
                    setSelectedContext(context.id);
                    if (currentChat && currentChat.context !== context.id) {
                      createNewChat(context.id);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {context.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => createNewChat('general')}
                className="cursor-pointer"
              >
                <Plus size={16} className="mr-2" />
                New Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-light text-foreground/90 mb-1">AI Study Assistant</h1>
          <p className="text-muted-foreground text-sm">
            {currentContext ? `Context: ${currentContext.name}` : 'Select a study context'}
          </p>
        </div>

        <div className="w-10" />
      </div>

      {showMabotBanner && (
        <div className="mx-6 mb-2 rounded-xl border border-yellow-300/40 bg-yellow-500/5 px-3 py-2 text-yellow-700 flex items-center gap-2" role="alert" aria-live="polite">
          <AlertTriangle size={16} />
          <p className="text-xs">
            Mabot no está completamente configurado. Define las variables de entorno `VITE_MABOT_BASE_URL`, `VITE_MABOT_USERNAME` y `VITE_MABOT_PASSWORD` o guarda `mabot_base_url`, `mabot_username`, `mabot_password` en localStorage. Luego recarga.
          </p>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 px-6 space-y-4 overflow-y-auto">
        {currentChat?.messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card 
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.type === 'user' 
                  ? 'bg-primary text-primary-foreground ml-8' 
                  : 'gradient-card border-border/30 mr-8'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                {msg.type === 'bot' ? (
                  <Bot size={16} className="text-primary mt-0.5" />
                ) : (
                  <User size={16} className="text-primary-foreground mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  <span className={`text-xs mt-2 block ${
                    msg.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <Card className="gradient-card border-border/30 p-4 rounded-2xl mr-8">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-primary" />
                <div className="flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs rounded-xl border-border/30 bg-card/50 hover:bg-muted/50"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="px-6 pb-4">
        <div className="flex gap-2">
          <Input 
            placeholder={`Ask about ${currentContext?.name || 'your studies'}...`}
            className="flex-1 rounded-2xl border-border/30 bg-card/50 backdrop-blur-sm"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || !selectedContext}
          />
          <Button 
            size="icon"
            className="rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !selectedContext}
            aria-label="Send message"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}