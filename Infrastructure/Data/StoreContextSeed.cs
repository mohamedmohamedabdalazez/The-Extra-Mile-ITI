using System;
using System.Reflection;
using System.Text.Json;
using Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Data;

public class StoreContextSeed
{
    public static async Task SeedAsync(StoreContext context, UserManager<AppUser> userManager)
    {
        if (!userManager.Users.Any(x => x.UserName == "admin@test.com"))
        {
            var user = new AppUser
            {
                UserName = "admin@test.com",
                Email = "admin@test.com"
            };

            await userManager.CreateAsync(user, "Pa$$w0rd");
            await userManager.AddToRoleAsync(user, "Admin");
        }
        //adding ExtraMile vendor as Vendor of the system        
        if (!userManager.Users.Any(u => u.UserName == "ExtraMile"))
        {
            var vendor = new AppUser
            {
                FirstName = "Extra",
                LastName = "Mile",
                UserName = "ExtraMile",
                Email = "extramile@test.com",
                //EmailConfirmed = true
            };

            await userManager.CreateAsync(vendor, "Extra@1"); // strong default password
            await userManager.AddToRoleAsync(vendor, "Vendor");
        }
        
        // Adding Vendor2 for testing
        if (!userManager.Users.Any(u => u.Email == "Vendor2@gmail.com"))
        {
            var vendor2 = new AppUser
            {
                FirstName = "Vendor",
                LastName = "Two",
                UserName = "Vendor2",
                Email = "Vendor2@gmail.com",
                //EmailConfirmed = true
            };

            await userManager.CreateAsync(vendor2, "Vendor2@gmail.com");
            await userManager.AddToRoleAsync(vendor2, "Vendor");
        }
        
        var path = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);

        if (!context.Products.Any())
        {
            var productsData = await File.ReadAllTextAsync(path + @"/Data/SeedData/products.json");
            var products = JsonSerializer.Deserialize<List<Product>>(productsData);

            if (products == null) return;

            context.Products.AddRange(products);

            await context.SaveChangesAsync();
        }

        if (!context.DeliveryMethods.Any())
        {
            var dmData = await File.ReadAllTextAsync(path + @"/Data/SeedData/delivery.json");
            var methods = JsonSerializer.Deserialize<List<DeliveryMethod>>(dmData);

            if (methods == null) return;

            context.DeliveryMethods.AddRange(methods);

            await context.SaveChangesAsync();
        }
    }
}
