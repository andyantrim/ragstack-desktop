import React from 'react';

interface InputFormProps {
    inputText: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ inputText, onInputChange, onSubmit }) => {
    return (
        <div className="border-t bg-white p-4">
            <form onSubmit={onSubmit} className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={inputText}
                        onChange={onInputChange}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 bg-gray-50 hover:bg-white transition-colors"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                 transition-colors font-medium"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};
