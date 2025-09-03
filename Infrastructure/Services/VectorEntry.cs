namespace RAGChatbotApi.Services
{
    internal class VectorEntry
    {
        public string Text { get; set; }
        public float[] Embedding { get; set; }
    }
}