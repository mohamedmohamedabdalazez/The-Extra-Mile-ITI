using API.DTOs;
using API.Extensions;
using API.RequestHelpers;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Numerics;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController(IUnitOfWork unit, IPaymentService paymentService, UserManager<AppUser> userManager) : BaseApiController
{
    [HttpGet("orders")]
    public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrders([FromQuery] OrderSpecParams specParams)
    {
        var spec = new OrderSpecification(specParams);

        return await CreatePagedResult(unit.Repository<Order>(),
            spec, specParams.PageIndex, specParams.PageSize, o => o.ToDto());
    }

    [HttpGet("orders/{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(int id)
    {
        var spec = new OrderSpecification(id);

        var order = await unit.Repository<Order>().GetEntityWithSpec(spec);

        if (order == null) return BadRequest("No order with that Id");

        return order.ToDto();
    }

    [HttpPost("orders/refund/{id:int}")]
    public async Task<ActionResult<OrderDto>> RefundOrder(int id)
    {
        var spec = new OrderSpecification(id);

        var order = await unit.Repository<Order>().GetEntityWithSpec(spec);

        if (order == null) return BadRequest("No order with that Id");

        if (order.Status == OrderStatus.Pending)
            return BadRequest("Payment not received for this order");

        var result = await paymentService.RefundPayment(order.PaymentIntentId);

        if (result == "succeeded")
        {
            order.Status = OrderStatus.Refunded;

            await unit.Complete();

            return order.ToDto();
        }

        return BadRequest("Problem refunding order");
    }

    [HttpGet("products")]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetAllProducts([FromQuery] ProductSpecParams specParams)
    {
        var spec = new ProductSpecification(specParams); // null = all statuses

        return await CreatePagedResult(unit.Repository<Product>(), spec,
            specParams.PageIndex, specParams.PageSize);
    }

    [InvalidateCache("api/products|")]
    [HttpPost("products/{id:int}/approve")]
    public async Task<ActionResult<Product>> ApproveProduct(int id)
    {
        var product = await unit.Repository<Product>().GetByIdAsync(id);

        if (product == null) return NotFound();

        product.Status = ProductStatus.Approved;

        unit.Repository<Product>().Update(product);

        if (await unit.Complete())
        {
            return product;
        }

        return BadRequest("Problem approving product");
    }

    [InvalidateCache("api/products|")]
    [HttpPost("products/{id:int}/reject")]
    public async Task<ActionResult<Product>> RejectProduct(int id)
    {
        var product = await unit.Repository<Product>().GetByIdAsync(id);

        if (product == null) return NotFound();

        product.Status = ProductStatus.Rejected;

        unit.Repository<Product>().Update(product);

        if (await unit.Complete())
        {
            return product;
        }

        return BadRequest("Problem rejecting product");
    }

    [InvalidateCache("api/products|")]
    [HttpPost("products/{id:int}/suspend")]
    public async Task<ActionResult<Product>> SuspendProduct(int id)
    {
        var product = await unit.Repository<Product>().GetByIdAsync(id);

        if (product == null) return NotFound();

        product.Status = ProductStatus.Suspended;

        unit.Repository<Product>().Update(product);

        if (await unit.Complete())
        {
            return product;
        }

        return BadRequest("Problem suspending product");
    }

    [InvalidateCache("api/products|")]
    [HttpPut("products/{id:int}")]
    public async Task<ActionResult<Product>> UpdateProduct(int id, [FromBody] UpdateProductDto productDto)
    {
        var product = await unit.Repository<Product>().GetByIdAsync(id);

        if (product == null) return NotFound();

        // Update product properties
        product.Name = productDto.Name;
        product.Description = productDto.Description;
        product.Price = productDto.Price;
        product.Type = productDto.Type;
        product.Brand = productDto.Brand;
        product.QuantityInStock = productDto.QuantityInStock;

        // Only update picture URL if provided
        if (!string.IsNullOrEmpty(productDto.PictureUrl))
        {
            product.PictureUrl = productDto.PictureUrl;
        }

        unit.Repository<Product>().Update(product);

        if (await unit.Complete())
        {
            return product;
        }

        return BadRequest("Problem updating product");
    }

    [HttpGet("products/extra-mile/count")]
    public async Task<ActionResult<object>> GetExtraMileProductsCount()
    {
        var extraMileVendor = await userManager.FindByNameAsync("ExtraMile");
        if (extraMileVendor == null)
        {
            return Ok(new { count = 0 });
        }

        var spec = new VendorProductSpecification(extraMileVendor.Id);
        var products = await unit.Repository<Product>().ListAsync(spec);
        var count = products.Count;

        return Ok(new { count });
    }

    [HttpGet("products/extra-mile")]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetExtraMileProducts([FromQuery] ProductSpecParams specParams)
    {
        var extraMileVendor = await userManager.FindByNameAsync("ExtraMile");
        if (extraMileVendor == null)
        {
            return Ok(new List<Product>());
        }

        var spec = new VendorProductSpecification(extraMileVendor.Id, specParams);
        return await CreatePagedResult(unit.Repository<Product>(), spec, specParams.PageIndex, specParams.PageSize);
    }

    [HttpGet("vendors/count")]
    public async Task<ActionResult<object>> GetVendorsCount()
    {
        var totalVendors = (await userManager.GetUsersInRoleAsync("Vendor")).Count;
        return Ok(new { totalVendors });
    }

    [HttpGet("vendors")]
    public async Task<ActionResult<object>> GetVendors()
    {
        var vendors = await userManager.GetUsersInRoleAsync("Vendor");
        
        var vendorList = vendors.Select(v => new
        {
            id = v.Id,
            email = v.Email,
            firstName = v.FirstName,
            lastName = v.LastName,
            userName = v.UserName
        }).ToList();

        return Ok(vendorList);
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardDto>> GetDashboard()
    {
        var specParams = new ProductSpecParams();
        var productSpec = new ProductSpecification(specParams);
        productSpec.IsPagingEnabled = false; // We only need counts, not paged results
        // Count products directly in DB
        var totalProducts = await unit.Repository<Product>().CountAsync(productSpec);

        // Count pending products
        specParams.Status = ProductStatus.Pending;
        var pendingSpec = new ProductSpecification(specParams) { IsPagingEnabled = false };
        var pendingCount = await unit.Repository<Product>()
            .CountAsync(pendingSpec);

        // Count Approved Products
        specParams.Status = ProductStatus.Approved;
        var approvedSpec = new ProductSpecification(specParams) { IsPagingEnabled = false };
        var approvedCount = await unit.Repository<Product>()
            .CountAsync(approvedSpec);

        // Count Rejected
        specParams.Status = ProductStatus.Rejected;
        var rejectedSpec = new ProductSpecification(specParams) { IsPagingEnabled = false };
        var rejectedCount = await unit.Repository<Product>()
            .CountAsync(rejectedSpec);
        // Count Suspended
        specParams.Status = ProductStatus.Suspended;
        var suspendedSpec = new ProductSpecification(specParams) { IsPagingEnabled = false };
        var suspendedCount = await unit.Repository<Product>()
            .CountAsync(suspendedSpec);

        // Count vendors directly
        var totalVendors = (await userManager.GetUsersInRoleAsync("Vendor")).Count;

        // Count total orders
        var orderSpecParams = new OrderSpecParams { PageSize = 1, PageIndex = 1 };
        var orderSpec = new OrderSpecification(orderSpecParams);
        orderSpec.IsPagingEnabled = false;
        var totalOrders = await unit.Repository<Order>().CountAsync(orderSpec);

        // Calculate revenue from only PaymentReceived orders
        var orders = await unit.Repository<Order>().ListAsync(orderSpec);
        var totalRevenue = orders
            .Where(o => o.Status == OrderStatus.PaymentReceived)
            .Sum(o => o.GetTotal());

        // Count admin published products (ExtraMile vendor)
        var extraMileVendor = await userManager.FindByNameAsync("ExtraMile");
        int adminPublishedProducts = 0;
        if (extraMileVendor != null)
        {
            var adminProductSpec = new VendorProductSpecification(extraMileVendor.Id);
            adminProductSpec.IsPagingEnabled = false;
            adminPublishedProducts = await unit.Repository<Product>().CountAsync(adminProductSpec);
        }

        var dashboard = new AdminDashboardDto
        {
            TotalOrders = totalOrders,
            TotalProducts = totalProducts,
            PendingProducts = pendingCount,
            ApprovedProducts = approvedCount,
            RejectedProducts = rejectedCount,
            SuspendedProducts = suspendedCount,
            VendorCount = totalVendors,
            TotalRevenue = (int)totalRevenue,
            AdminPublishedProducts = adminPublishedProducts
        };

        return dashboard;
    }

    [HttpGet("sales-over-time")]
    public async Task<ActionResult<object>> GetSalesOverTime()
    {
        // Get all orders with PaymentReceived status
        var orderSpecParams = new OrderSpecParams { PageSize = 1000, PageIndex = 1 };
        var orderSpec = new OrderSpecification(orderSpecParams);
        orderSpec.IsPagingEnabled = false;
        
        var orders = await unit.Repository<Order>().ListAsync(orderSpec);
        var paymentReceivedOrders = orders.Where(o => o.Status == OrderStatus.PaymentReceived).ToList();

        // Generate sales data for the current year (January to December)
        var salesData = new List<object>();
        var currentYear = DateTime.Now.Year;
        
        for (int month = 1; month <= 12; month++)
        {
            var monthDate = new DateTime(currentYear, month, 1);
            var monthName = monthDate.ToString("MMMM");
            var monthStart = new DateTime(currentYear, month, 1);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);

            var monthOrders = paymentReceivedOrders
                .Where(o => o.OrderDate >= monthStart && o.OrderDate <= monthEnd)
                .ToList();

            var monthRevenue = monthOrders.Sum(o => o.GetTotal());

            salesData.Add(new
            {
                name = monthName,
                value = (int)monthRevenue
            });
        }

        return Ok(salesData);
    }
}
