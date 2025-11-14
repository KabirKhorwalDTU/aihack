import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { chatService, ChatMessage } from '../../lib/chatService';
import { Topic } from '../../lib/supabase';

const ChatAgentTab = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTopics, setLoadingTopics] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const loadTopics = async () => {
    try {
      const topicsData = await chatService.getActiveTopics();
      setTopics(topicsData);
      if (topicsData.length > 0) {
        setSelectedTopicId(topicsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load topics:', err);
      setError('Failed to load topics. Please refresh the page.');
    } finally {
      setLoadingTopics(false);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !selectedTopicId) {
      return;
    }

    const selectedTopic = topics.find((t) => t.id === selectedTopicId);
    if (!selectedTopic) return;

    const userQuestion = question.trim();
    setQuestion('');
    setLoading(true);
    setError(null);

    try {
      const answer = await chatService.askQuestion(selectedTopicId, userQuestion);

      const newMessage: ChatMessage = {
        id: chatService.generateMessageId(),
        question: userQuestion,
        answer: answer,
        topicId: selectedTopicId,
        topicName: selectedTopic.name,
        timestamp: new Date().toISOString(),
      };

      setChatHistory((prev) => [...prev, newMessage]);
    } catch (err) {
      console.error('Failed to get answer:', err);
      setError('Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleAskQuestion();
    }
  };

  if (loadingTopics) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-gray-500">Loading chat agent...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="text-blue-600" size={28} />
          <h1 className="text-2xl font-semibold text-gray-900">
            Ask Me Anything about Customer Feedback
          </h1>
        </div>
        <p className="text-sm text-gray-500 ml-10">
          Get AI-powered insights from customer reviews and feedback
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No conversations yet
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Select a topic and ask a question to start exploring customer feedback insights
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {chatHistory.map((message) => (
              <div key={message.id} className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-2xl shadow-sm">
                    <div className="text-xs font-medium mb-1 opacity-90">
                      Topic: {message.topicName}
                    </div>
                    <p className="text-sm leading-relaxed">{message.question}</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-3 max-w-2xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="text-blue-600" size={16} />
                      <span className="text-xs font-medium text-gray-600">AI Agent</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {message.answer}
                    </p>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        {loading && (
          <div className="max-w-4xl mx-auto mt-6">
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Loader2 className="text-blue-600 animate-spin" size={20} />
                  <span className="text-sm text-gray-600">Generating response...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <label htmlFor="topic-select" className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <select
                id="topic-select"
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                disabled={loading}
                className="w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              >
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="question-input" className="block text-sm font-medium text-gray-700 mb-2">
                Your Question
              </label>
              <div className="flex gap-3">
                <input
                  id="question-input"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  placeholder="Ask a question, e.g. 'What are people saying about delivery delays?'"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={loading || !question.trim() || !selectedTopicId}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Asking...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Ask</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAgentTab;
