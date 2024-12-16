import { useState, useRef, useEffect } from 'react';
import { Ask } from "../wailsjs/go/main/App";
import { InputForm } from './ChatInput';
import { MessageList} from './ChatMessages';
import { SettingsPanel, ChatSettings } from './Settings'; 

interface Message {
    text: string;
    sender: 'user' | 'llm';
    timestamp: string;
}

function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settings, setSettings] = useState<ChatSettings>({
        model: 'gpt-3.5-turbo',
        temperature: 1,
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage: Message = {
            text: inputText,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');

        try {
            const response = await Ask(inputText);
            const llmMessage: Message = {
                text: response,
                sender: 'llm',
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, llmMessage]);
        } catch (error) {
            const errorMessage: Message = {
                text: 'Sorry, there was an error processing your request.',
                sender: 'llm',
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="bg-white shadow-sm p-4 flex justify-end">
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <SettingsPanel 
                        isOpen={isSettingsOpen}
                        onSave={() => setIsSettingsOpen(false)}
                        onClose={() => setIsSettingsOpen(false)}
                        settings={settings}
                    />
                </button>
            </div>
            <MessageList 
                messages={messages} 
                messagesEndRef={messagesEndRef}
            />
            <InputForm 
                inputText={inputText}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

export default App;
