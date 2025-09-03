using API.Extensions;
using API.RequestHelpers;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using API.DTOs;
using API.Services;

namespace API.Controllers;

public class ProductsController(IUnitOfWork unit, IFileUploadService fileUploadService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetProducts([FromQuery]ProductSpecParams productParams)
    {
        // Force status to be Approved for public shop
        productParams.Status = ProductStatus.Approved;
        
        var spec = new ProductSpecification(productParams);

        var result = await CreatePagedResult(unit.Repository<Product>(), spec,
            productParams.PageIndex, productParams.PageSize);

        // Add debug logging
        Console.WriteLine($"GetProducts called - Status filter: {productParams.Status}");
        
        return result;
    }

    [Cached(300)]
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var spec = new ProductSpecification(id);
        var product = await unit.Repository<Product>().GetEntityWithSpec(spec);

        if (product == null) return NotFound();

        // Only show approved products to public
        if (product.Status != ProductStatus.Approved) return NotFound();

        return product;
    }

    [InvalidateCache("api/products|")]
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct([FromForm] CreateProductWithFileDto productDto, IFormFile? file, UserManager<AppUser> userManager)
    {
        try
        {
            // Validate required fields
            if (string.IsNullOrEmpty(productDto.Name))
                return BadRequest("Product name is required");
            if (string.IsNullOrEmpty(productDto.Description))
                return BadRequest("Product description is required");
            if (productDto.Price <= 0)
                return BadRequest("Product price must be greater than 0");
            if (string.IsNullOrEmpty(productDto.Type))
                return BadRequest("Product type is required");
            if (string.IsNullOrEmpty(productDto.Brand))
                return BadRequest("Product brand is required");
            if (productDto.QuantityInStock <= 0)
                return BadRequest("Product quantity must be greater than 0");

            string pictureUrl = string.Empty;
            
            // Handle file upload if provided
            if (file != null)
            {
                pictureUrl = await fileUploadService.UploadProductImageAsync(file);
            }
            else if (!string.IsNullOrEmpty(productDto.PictureUrl))
            {
                // Check if it's a data URL (starts with "data:")
                if (productDto.PictureUrl.StartsWith("data:"))
                {
                    // Save data URL to file system
                    pictureUrl = await fileUploadService.UploadProductImageFromDataUrlAsync(productDto.PictureUrl);
                }
                else
                {
                    // If it's a regular URL, use it as is
                    pictureUrl = productDto.PictureUrl;
                }
            }
            else
            {
                return BadRequest("Product image is required");
            }

            // Find the ExtraMile vendor - try by username first, then by email
            var vendor = await userManager.FindByNameAsync("ExtraMile");
            if (vendor == null)
            {
                vendor = await userManager.FindByEmailAsync("extramile@test.com");
            }
            
            if (vendor == null)
            {
                return BadRequest("ExtraMile vendor not found. Please ensure the vendor is seeded in the database.");
            }

            var product = new Product
            {
                Name = productDto.Name,
                Description = productDto.Description,
                Price = productDto.Price,
                PictureUrl = pictureUrl,
                Type = productDto.Type,
                Brand = productDto.Brand,
                QuantityInStock = productDto.QuantityInStock,
                Status = ProductStatus.Approved, // Admin products are approved by default
                VendorId = vendor.Id,
                CreatedAt = DateTime.UtcNow
            };

            unit.Repository<Product>().Add(product);

            if (await unit.Complete())
            {
                return CreatedAtAction("GetProduct", new { id = product.Id }, product);
            }

            return BadRequest("Problem creating product");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest($"Problem creating product: {ex.Message}");
        }
    }


    [InvalidateCache("api/products|")]
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id || !ProductExists(id)) return BadRequest("Cannot update this product");

        unit.Repository<Product>().Update(product);

        if (await unit.Complete())
        {
            return NoContent();
        };

        return BadRequest("Problem updating the product");
    }

    [InvalidateCache("api/products|")]
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await unit.Repository<Product>().GetByIdAsync(id);

        if (product == null) return NotFound();

        unit.Repository<Product>().Remove(product);

        if (await unit.Complete())
        {
            return NoContent();
        };

        return BadRequest("Problem deleting the product");
    }

    [Cached(100000)]
    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
    {
        var spec = new BrandListSpecification();

        return Ok(await unit.Repository<Product>().ListAsync(spec));
    }
    
    [Cached(100000)]
    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
    {
        var spec = new TypeListSpecification();

        return Ok(await unit.Repository<Product>().ListAsync(spec));
    }

    
    private bool ProductExists(int id)
    {
        return unit.Repository<Product>().Exists(id);
    }
}

