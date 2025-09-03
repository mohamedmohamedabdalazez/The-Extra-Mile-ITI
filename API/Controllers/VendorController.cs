using API.DTOs;
using API.Extensions;
using API.RequestHelpers;
using API.Services;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Vendor")]
public class VendorController(IUnitOfWork unit, IFileUploadService fileUploadService) : BaseApiController
{
    [HttpGet("products")]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetVendorProducts([FromQuery] ProductSpecParams productParams)
    {
        var vendorId = User.GetUserId();
        var spec = new VendorProductSpecification(vendorId, productParams);

        return await CreatePagedResult(unit.Repository<Product>(), spec,
            productParams.PageIndex, productParams.PageSize);
    }

    [HttpGet("products/{id}")]
    public async Task<ActionResult<Product>> GetVendorProduct(int id)
    {
        var vendorId = User.GetUserId();
        var spec = new VendorProductSpecification(vendorId, id);
        var product = await unit.Repository<Product>().GetEntityWithSpec(spec);

        if (product == null) return NotFound();

        return product;
    }

    [HttpPost("products")]
    public async Task<ActionResult<Product>> CreateProduct([FromForm] CreateProductWithFileDto productDto, IFormFile? file)
    {
        try
        {
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

            var product = new Product
            {
                Name = productDto.Name,
                Description = productDto.Description,
                Price = productDto.Price,
                PictureUrl = pictureUrl,
                Type = productDto.Type,
                Brand = productDto.Brand,
                QuantityInStock = productDto.QuantityInStock,
                Status = ProductStatus.Pending,
                VendorId = User.GetUserId(),
                CreatedAt = DateTime.UtcNow
            };

            unit.Repository<Product>().Add(product);

            if (await unit.Complete())
            {
                return CreatedAtAction("GetVendorProduct", new { id = product.Id }, product);
            }

            return BadRequest("Problem creating product");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception)
        {
            return BadRequest("Problem creating product");
        }
    }

    [HttpPut("products/{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromForm] CreateProductWithFileDto productDto, IFormFile? file)
    {
        try
        {
            var vendorId = User.GetUserId();
            var spec = new VendorProductSpecification(vendorId, id);
            var product = await unit.Repository<Product>().GetEntityWithSpec(spec);

            if (product == null) return NotFound();

            // Handle file upload if a new file is provided
            if (file != null)
            {
                // Delete old image if it exists
                if (!string.IsNullOrEmpty(product.PictureUrl))
                {
                    fileUploadService.DeleteProductImageAsync(product.PictureUrl);
                }
                
                // Upload new image
                var pictureUrl = await fileUploadService.UploadProductImageAsync(file);
                product.PictureUrl = pictureUrl;
            }
            else if (!string.IsNullOrEmpty(productDto.PictureUrl))
            {
                // Check if it's a data URL (starts with "data:")
                if (productDto.PictureUrl.StartsWith("data:"))
                {
                    // Save data URL to file system
                    var pictureUrl = await fileUploadService.UploadProductImageFromDataUrlAsync(productDto.PictureUrl);
                    product.PictureUrl = pictureUrl;
                }
                else
                {
                    // If it's a regular URL, use it as is
                    product.PictureUrl = productDto.PictureUrl;
                }
            }

            product.Name = productDto.Name;
            product.Description = productDto.Description;
            product.Price = productDto.Price;
            product.Type = productDto.Type;
            product.Brand = productDto.Brand;
            product.QuantityInStock = productDto.QuantityInStock;

            // Reset status to pending for all updates (including approved products)
            product.Status = ProductStatus.Pending;
            
            unit.Repository<Product>().Update(product);

            if (await unit.Complete())
            {
                return NoContent();
            }

            return BadRequest("Problem updating the product");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception)
        {
            return BadRequest("Problem updating the product");
        }
    }

    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var vendorId = User.GetUserId();
        var spec = new VendorProductSpecification(vendorId, id);
        var product = await unit.Repository<Product>().GetEntityWithSpec(spec);

        if (product == null) return NotFound();

        // Delete the associated image file
        if (!string.IsNullOrEmpty(product.PictureUrl))
        {
            fileUploadService.DeleteProductImageAsync(product.PictureUrl);
        }

        unit.Repository<Product>().Remove(product);

        if (await unit.Complete())
        {
            return NoContent();
        }

        return BadRequest("Problem deleting the product");
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<VendorDashboardDto>> GetDashboard()
    {
        var vendorId = User.GetUserId();
        var spec = new VendorProductSpecification(vendorId);
        var products = await unit.Repository<Product>().ListAsync(spec);

        var dashboard = new VendorDashboardDto
        {
            TotalProducts = products.Count,
            PendingProducts = products.Count(p => p.Status == ProductStatus.Pending),
            ApprovedProducts = products.Count(p => p.Status == ProductStatus.Approved),
            RejectedProducts = products.Count(p => p.Status == ProductStatus.Rejected),
            Products = products
        };

        return dashboard;
    }
}