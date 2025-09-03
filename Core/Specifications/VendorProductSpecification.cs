using Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Specifications
{
    public class VendorProductSpecification : BaseSpecification<Product>
    {
        public VendorProductSpecification() { 
            IsPagingEnabled = false;
        }
        // Get all products for a specific vendor
        public VendorProductSpecification(string vendorId) : base(x => x.VendorId == vendorId)
        {
            AddInclude(x => x.Vendor);
            AddOrderByDescending(x => x.CreatedAt); // Sort by newest first
        }
        public VendorProductSpecification(string vendorId, ProductSpecParams productParams)
        : base(x => x.VendorId == vendorId &&
                   (string.IsNullOrEmpty(productParams.Search)
                        || x.Name.ToLower().Contains(productParams.Search)) &&
                   (!productParams.Brands.Any() || productParams.Brands.Contains(x.Brand)) &&
                   (!productParams.Types.Any() || productParams.Types.Contains(x.Type)))
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
                case "newest":
                    AddOrderByDescending(x => x.CreatedAt);
                    break;
                case "oldest":
                    AddOrderBy(x => x.CreatedAt);
                    break;
                case "statusAsc":
                    AddOrderBy(x => x.Status);
                    break;
                case "statusDesc":
                    AddOrderByDescending(x => x.Status);
                    break;
                default:
                    AddOrderBy(x => x.Name);
                    break;
            }
        }
        public VendorProductSpecification(string vendorId, int productId)
        : base(x => x.VendorId == vendorId && x.Id == productId)
        {
            AddInclude(x => x.Vendor);
        }
    }
}
