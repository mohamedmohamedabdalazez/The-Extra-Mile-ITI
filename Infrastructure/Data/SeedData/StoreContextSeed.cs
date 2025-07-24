using Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Data.SeedData
{
    public class StoreContextSeed
    {
        public static async Task SeedAsync(StoreContext context)
        {
            if (!context.Products.Any())
            {
                var productData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/products.json");
                var products = JsonSerializer.Deserialize<List<Product>>(productData);
                if (products == null) return;
                context.Products.AddRange(products);
                await context.SaveChangesAsync();
            }
        }
    }
}
