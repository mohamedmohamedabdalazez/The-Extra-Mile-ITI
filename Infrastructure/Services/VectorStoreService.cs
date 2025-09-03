using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using System.Text.Json;
namespace Infrastructure.Services
{
        public class VectorStoreService(EmbeddingService _embeddingService, IUnitOfWork unit)
        {
            private readonly List<(string ChunkText, float[] Embedding)> _chunks = new();

        public async Task LoadChunksAsync()
        {
            ProductSpecParams productParams = new ProductSpecParams() { Status = ProductStatus.Approved };
            var spec = new ProductSpecification(productParams);
            spec.IsPagingEnabled = false;
            var products = await unit.Repository<Product>().ListAsync(spec);

            foreach (var product in products)
            {
                var chunk = $"{product.Name}. Brand: {product.Brand}. Type: {product.Type}. Price: {product.Price}. Description: {product.Description}";
                var embedding = await _embeddingService.GetEmbeddingAsync(chunk);
                _chunks.Add((chunk, embedding));
            }
        }
        public async Task<IReadOnlyList<Product>> GetAllProductsAsync()
        {
            return await unit.Repository<Product>().ListAllAsync();
        }
        public async Task<List<string>> SearchAsync(string query, int topK = 5)
            {
                await LoadChunksAsync();
                var queryEmbedding = await _embeddingService.GetEmbeddingAsync(query);
                return _chunks
                    .Select(c => new { c.ChunkText, Score = CosineSimilarity(queryEmbedding, c.Embedding) })
                    .OrderByDescending(x => x.Score)
                    .Take(topK)
                    .Select(x => x.ChunkText)
                    .ToList();
            }
            private float CosineSimilarity(float[] a, float[] b)
            {
                float dot = 0, normA = 0, normB = 0;
                for (int i = 0; i < a.Length; i++)
                {
                    dot += a[i] * b[i];
                    normA += a[i] * a[i];
                    normB += b[i] * b[i];
                }
                return dot / (float)(Math.Sqrt(normA) * Math.Sqrt(normB));
            }
            public int GetProductCount()
            {
                return _chunks.Count;
            }
        }
}
