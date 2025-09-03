using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;
namespace Infrastructure.Services
{
    public class EmbeddingService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public EmbeddingService(IConfiguration config)
        {
            _httpClient = new HttpClient();
            _apiKey = config["Gemini:ApiKey"];
        }

        public async Task<float[]> GetEmbeddingAsync(string text)
        {
            var requestBody = new
            {
                content = new
                {
                    parts = new[] { new { text = text } }
                }
            };
            var model = "embedding-001";
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri($"https://generativelanguage.googleapis.com/v1beta/models/{model}:embedContent?key={_apiKey}"),
                Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            };

            var response = await _httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"❌ Gemini embedding error: {response.StatusCode}\n{json}");
                throw new Exception("Gemini API call failed for embedding.");
            }

            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("embedding", out var embeddingElement) ||
                !embeddingElement.TryGetProperty("values", out var valuesElement))
            {
                Console.WriteLine("❌ Invalid Gemini response format:");
                Console.WriteLine(json);
                throw new Exception("Unexpected Gemini response: 'embedding.values' not found.");
            }

            return valuesElement.EnumerateArray().Select(x => x.GetSingle()).ToArray();
        }
    }
}
