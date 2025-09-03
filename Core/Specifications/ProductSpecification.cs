using System;
using Core.Entities;

namespace Core.Specifications;

public class ProductSpecification : BaseSpecification<Product>
{
    public ProductSpecification(ProductSpecParams productParams)
        : base(x =>
            (string.IsNullOrEmpty(productParams.Search)
                || x.Name.ToLower().Contains(productParams.Search)) &&
            (!productParams.Brands.Any() || productParams.Brands.Contains(x.Brand)) &&
            (!productParams.Types.Any() || productParams.Types.Contains(x.Type)) &&
            (productParams.Status == null || x.Status == productParams.Status.Value)
        )
            
    {
        AddInclude(x => x.Vendor);
        ApplyPaging(productParams.PageSize * (productParams.PageIndex - 1), productParams.PageSize);

        switch (productParams.Sort)
        {
            case "priceAsc":
                AddOrderBy(x => x.Price);
                break;
            case "priceDesc":
                AddOrderByDescending(x => x.Price);
                break;
            case "name":
                AddOrderBy(x => x.Name);
                break;
            case "newest":
                AddOrderByDescending(x => x.CreatedAt);
                break;
            case "oldest":
                AddOrderBy(x => x.CreatedAt);
                break;
            default:
                // Default: Show newest products first
                AddOrderByDescending(x => x.CreatedAt);
                break;
        }
    }

    public ProductSpecification(int id) : base(x => x.Id == id)
    {
        AddInclude(x => x.Vendor);
    }
}