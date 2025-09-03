using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;

namespace Infrastructure.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiService(IConfiguration config)
        {
            _httpClient = new HttpClient();
            _apiKey = config["Gemini:ApiKey"];
        }
        public async Task<string> GenerateAnswerAsync(string query, List<string> context)
        {
            var prompt = $"You are a product assistant. Respond using markdown with bullet points, bold prices, and product names. If the answer is not found, say 'I don’t know'.\n\n{string.Join("\n\n", context)}\n\nQuestion: {query}";

            Console.WriteLine("\n🧩 Context retrieved:");
            foreach (var item in context)
                Console.WriteLine("- " + item);

            Console.WriteLine("\n🧠 Prompt sent to Gemini:");
            Console.WriteLine(prompt);

            var body = new
            {
                contents = new[]
                {
                  new
                  { 
                    parts = new[] { new { text = prompt } }
                  }
                }
            };

            var response = await _httpClient.PostAsync(
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}",
                new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
            );

            var json = await response.Content.ReadAsStringAsync();
            Console.WriteLine("\n📩 Gemini raw response:");
            Console.WriteLine(json);

            if ((int)response.StatusCode == 429)
                throw new Exception("📛 Rate limit exceeded (429): Please wait and try again.");

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Gemini API error ({response.StatusCode}): {json}");

            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("candidates", out var candidates))
                throw new Exception("Gemini response missing 'candidates'.");

            var content = candidates[0].GetProperty("content");
            if (!content.TryGetProperty("parts", out var parts) || parts.GetArrayLength() == 0)
                throw new Exception("Gemini response missing 'parts'.");

            var answer = parts[0].GetProperty("text").GetString();
            return answer ?? "I don't know.";
        }



    }
}
