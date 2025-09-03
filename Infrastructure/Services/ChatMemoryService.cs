using System.Collections.Concurrent;

namespace Infrastructure.Services
{
    public class ChatMemoryService
    {
        private readonly ConcurrentDictionary<string, List<string>> _memory = new();

        public void AddToMemory(string sessionId, string userMessage, string botReply)
        {
            if (!_memory.ContainsKey(sessionId))
                _memory[sessionId] = new List<string>();

            _memory[sessionId].Add($"User: {userMessage}");
            _memory[sessionId].Add($"Bot: {botReply}");
        }

        public string GetConversationHistory(string sessionId, int maxTurns = 6)
        {
            if (!_memory.ContainsKey(sessionId)) return "";

            return string.Join("\n", _memory[sessionId].TakeLast(maxTurns));
        }
    }
}
