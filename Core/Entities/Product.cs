using System;

namespace Core.Entities;

public class Product : BaseEntity
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public decimal Price { get; set; }
    public required string PictureUrl { get; set; }
    public required string Type { get; set; }
    public required string Brand { get; set; }
    public int QuantityInStock { get; set; }
    //vendor attributes
    public ProductStatus Status { get; set; } = ProductStatus.Approved; 
    public string? VendorId { get; set; } // optional
    public AppUser? Vendor { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Checks if the product is new (created within the last 7 days)
    /// </summary>
    /// <returns>True if the product is new, false otherwise</returns>
    public bool IsNew()
    {
        return CreatedAt >= DateTime.UtcNow.AddDays(-7);
    }
}
public enum ProductStatus
{
    Pending,    // Waiting for admin approval
    Approved,   // Approved by admin (visible to customers)
    Rejected,   // Rejected by admin
    Suspended   // Suspended by admin
}
