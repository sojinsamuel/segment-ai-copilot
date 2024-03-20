import { StreamableValue, readStreamableValue } from 'ai/rsc'
import { useEffect, useState } from 'react'
import { Analytics } from '@segment/analytics-node'
const analytics = new Analytics({ writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY })


export const useStreamableText = (
  content: string | StreamableValue<string>
) => {
  const [rawContent, setRawContent] = useState(
    typeof content === 'string' ? content : ''
  );
  const [streamingComplete, setStreamingComplete] = useState(false);
  
  useEffect(() => {
    let value = '';
    if (typeof content === 'object') {
      (async () => {
        for await (const delta of readStreamableValue(content)) {
          if (typeof delta === 'string') {
            value += delta;
            setRawContent(value);
          }
        }
        setStreamingComplete(true);
      })();
    }
  }, [content]);

  return rawContent;
}
