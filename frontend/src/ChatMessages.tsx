import React from 'react';
import { MessageSquare, User } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface Message {
    text: string;
    sender: 'user' | 'llm';
    timestamp: string;
}

interface MessageListProps {
    messages: Message[];
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

// Configure marked options
marked.setOptions({
    breaks: true,  // Convert \n to <br>
    gfm: true,     // GitHub Flavored Markdown
});

export const MessageList: React.FC<MessageListProps> = ({ messages, messagesEndRef }) => {
    // Function to safely render markdown
    const renderMarkdown = (text: string) => {
        // Convert markdown to HTML and sanitize
        const rawHtml = marked(text, {async: false});
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        return { __html: cleanHtml };
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 w-1/2">
            {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">Start a conversation...</p>
                </div>
            )}
            {messages.map((message, index) => (
                <div 
                    key={index}
                    className={`flex items-start gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                    {/* Avatar */}
                    <div className={`flex-shrink-0 rounded-full p-2 ${
                        message.sender === 'user' 
                            ? 'bg-blue-100' 
                            : 'bg-gray-100'
                    }`}>
                        {message.sender === 'user' 
                            ? <User className="w-6 h-6 text-blue-600" /> 
                            : <MessageSquare className="w-6 h-6 text-gray-600" />
                        }
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-full`}>
                        <div className={`px-4 py-3 rounded-2xl ${
                            message.sender === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white text-gray-800'
                        } shadow-md overflow-hidden break-words w-full`}>
                            <div 
                                className={`prose prose-sm ${
                                    message.sender === 'user'
                                        ? 'prose-invert' 
                                        : 'prose-gray'
                                } markdown-content break-words whitespace-pre-wrap`}
                                dangerouslySetInnerHTML={renderMarkdown(message.text)}
                            />
                        </div>
                        <span className="text-xs text-gray-500 mt-1 px-2">
                            {message.timestamp}
                        </span>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};
