using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Infrastructure;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using The_Extra_Mile.Controllers;
using The_Extra_Mile.RequestHelpers;
namespace API.Controllers;

public class ProductsController(IGenericRepository<Product> repo) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetProducts([FromQuery]ProductSpecParams specParams)
    {
        var spec = new ProductSpecification(specParams);
        
        return await CreatePagedResult(repo,spec,specParams.PageIndex, specParams.PageSize); 
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await repo.GetByIdAsync(id);

        if (product == null)
        {
            return NotFound();
        }

        return product;
    }
    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
    {        
        var spec = new BrandListSpecification();
        return Ok(await repo.ListAsync(spec));
    }

    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
    {        
        var spec = new TypeListSpecification();
        return Ok(await repo.ListAsync(spec));
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        repo.Add(product);

        if (await repo.SaveAllAsync())
            return CreatedAtAction("GetProduct", new { id = product.Id }, product);
        else
            return BadRequest("Problem Creating Product");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id || !ProductExists(id)) 
            return BadRequest("Cannot update this product");

        repo.Update(product);

        if (await repo.SaveAllAsync())
            return NoContent();
        return BadRequest("Problem Updating Product");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await repo.GetByIdAsync(id);

        if (product == null) return NotFound();

        repo.Remove(product);
        if (await repo.SaveAllAsync())        
            return NoContent();
        return BadRequest("Problem Deleting Product");
    }

    private bool ProductExists(int id)
    {
        return repo.Exists(id);
    }
}