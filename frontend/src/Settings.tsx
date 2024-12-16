import React from 'react';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    settings: ChatSettings;
    onSave: (settings: ChatSettings) => void;
}

export interface ChatSettings {
    apiKey?: string;
    model?: string;
    temperature?: number;
}

export const SettingsPanel: React.FC<SettingsProps> = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = React.useState<ChatSettings>(settings);

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Key
                        </label>
                        <input
                            type="password"
                            value={localSettings.apiKey || ''}
                            onChange={(e) => setLocalSettings(prev => ({...prev, apiKey: e.target.value}))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Model
                        </label>
                        <select
                            value={localSettings.model || 'gpt-3.5-turbo'}
                            onChange={(e) => setLocalSettings(prev => ({...prev, model: e.target.value}))}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="gpt-4">GPT-4</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Temperature ({localSettings.temperature})
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={localSettings.temperature || 1}
                            onChange={(e) => setLocalSettings(prev => ({...prev, temperature: parseFloat(e.target.value)}))}
                            className="w-full"
                        />
                    </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
