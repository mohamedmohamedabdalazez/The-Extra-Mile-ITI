using Core.Entities;
using Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Data
{
    public class ProductRepository(StoreContext context) : IProductRepository
    {       
        public void AddProduct(Product product)
        {
            context.Products.Add(product);  
        }

        public void DeleteProduct(Product product)
        {
            context.Products.Remove(product);
        }
        public void UpdateProduct(Product product)
        {
            context.Entry(product).State = EntityState.Modified;
        }
        public async Task<IReadOnlyList<Product>> GetProductsAsync(string? brand,
            string? type, string? sort)
        {
            var query = context.Products.AsQueryable();
            if (!string.IsNullOrEmpty(brand))
                query = query.Where(e => e.Brand == brand);
            if (!string.IsNullOrEmpty(type))
                query = query.Where(e => e.Type == type);
            query = sort switch
            {
                "priceDesc" => query.OrderByDescending(e => e.Price),
                "priceAsc" => query.OrderBy(e => e.Price),
                _ => query.OrderBy(e => e.Name)
            };
            return await query.ToListAsync();
        }

        public async Task<Product> GetProductByIdAsync(int id)
        {
            return await context.Products.FindAsync(id);
        }
        public async Task<IReadOnlyList<string>> GetTypesAsync()
        {
            return await context.Products.Select(e => e.Type)
                .Distinct()
                .ToListAsync();

        }
        public async Task<IReadOnlyList<string>> GetBrandsAsync()
        {
            return await context.Products.Select(e => e.Brand)
                .Distinct()
                .ToListAsync();
        }


        public bool ProductExists(int id)
        {
            return context.Products.Any(e=> e.Id == id);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await context.SaveChangesAsync() > 0;
        }

        
    }
}
