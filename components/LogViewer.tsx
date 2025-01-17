import React, { useRef, useEffect } from 'react';

interface LogViewerProps {
  messages: string[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ messages }) => {
  const logsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={logsRef} className="h-full overflow-y-auto p-2 bg-gray-100 rounded-lg">
      {messages.map((message, index) => (
        <p key={`message-${index}`} className="mb-2 p-2 bg-white rounded">{message}</p>
      ))}
    </div>
  );
};

