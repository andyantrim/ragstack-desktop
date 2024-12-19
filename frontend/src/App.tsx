import { useState, useRef, useEffect } from 'react';
import { Ask, SelectFile } from "../wailsjs/go/main/App";
import { InputForm } from './ChatInput';
import { MessageList} from './ChatMessages';
import { FolderOpen, Upload } from 'lucide-react';

interface Message {
    text: string;
    sender: 'user' | 'llm';
    timestamp: string;
}

function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [file, setFile] = useState('No file selected');
    const [isFileSelected, setIsFileSelected] = useState(false);
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

    const handleFile = async () => {
        const filename = await SelectFile()
        if (filename === '') {
            setFile('No file selected');
            setIsFileSelected(false);
            return
        }
        setFile(filename);
        setIsFileSelected(true);
    }

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

    // Extract filename from path for cleaner display
    const displayFilename = isFileSelected ? file.split(/[\/\\]/).pop() : null;

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="bg-white shadow-sm px-8 py-6">
                <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-600 min-w-0 flex-1">
                        {isFileSelected ? (
                            <>
                                <FolderOpen className="w-6 h-6 text-blue-500 flex-shrink-0" />
                                <span className="text-lg font-medium whitespace-nowrap">Current file:</span>
                                <span className="text-lg text-gray-900 truncate">{displayFilename}</span>
                            </>
                        ) : (
                            <span className="text-lg text-gray-500">No file selected</span>
                        )}
                    </div>
                    
                    <button
                        onClick={handleFile}
                        className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg 
                                 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ml-6 text-lg font-medium"
                    >
                        <Upload className="w-6 h-6" />
                        <span>
                            {isFileSelected ? "Select another file to talk to" : "Select a file to talk to"}
                        </span>
                    </button>
                </div>
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
