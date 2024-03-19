'use client'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { useEffect, useState } from 'react'
import { useUIState, useAIState } from 'ai/rsc'
import { Session } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { Message } from '@/lib/chat/actions'
import { toast } from 'sonner'
import { Analytics } from '@segment/analytics-node'

const analytics = new Analytics({ writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY })

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  session?: Session
  missingKeys: string[]
}

// changed hooks to only fire on load
export function Chat({ id, className, session, missingKeys }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  const [messages] = useUIState()
  const [aiState] = useAIState()
  const isLoading = true

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  useEffect(() => {
    if (session?.user && !path.includes('chat') && messages.length === 1) {
      window.history.replaceState({}, '', `/chat/${id}`);
    }

    const messagesLength = aiState.messages?.length;
    if (messagesLength === 2) {
      router.refresh();
    }

    setNewChatId(id);

    missingKeys.forEach(key => {
      toast.error(`Missing ${key} environment variable!`);
    });
  }, [id, path, session?.user, aiState.messages, router, setNewChatId, missingKeys]);

  // send conversation start to segment if msg queue is empty
  useEffect(() => {
    if (messages.length === 0) {
      analytics.track({
        userId: "123",
        event: "Conversation Started",
        properties: {
          conversationId: id
        }
      });
    }
  }, []);

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel id={id} input={input} setInput={setInput} />
    </>
  )
}
