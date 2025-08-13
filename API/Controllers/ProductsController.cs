using API.RequestHelpers;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ProductsController(IGenericRepository<Product> repo) : BaseApiController
{
    // [HttpGet]
    // public async Task<ActionResult<IReadOnlyList<Product>>> GetProducts([FromQuery]ProductSpecParams specParams)
    // {
    //     var spec = new ProductSpecification(specParams);

    //     return await CreatePagedResult(repo,spec,specParams.PageIndex, specParams.PageSize); 
    // }
    // In API/Controllers/ProductsController.cs

[HttpGet]
public async Task<ActionResult<Pagination<Product>>> GetProducts([FromQuery] ProductSpecParams specParams)
{
    // 1. Create the main specification for filtering, sorting, and paging
    var spec = new ProductSpecification(specParams);

    // 2. Create a separate specification just for counting the total items
    //    This one should only have the filtering (Where clause)
    var countSpec = new ProductWithFiltersForCountSpecification(specParams);

    // 3. Execute the count query to get the total number of items
    var totalItems = await repo.CountAsync(countSpec);

    // 4. Execute the main query to get the paged list of data
    var products = await repo.ListAsync(spec);

    // 5. Create the final Pagination object and return it
    return new Pagination<Product>(specParams.PageIndex, specParams.PageSize, totalItems, products);
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