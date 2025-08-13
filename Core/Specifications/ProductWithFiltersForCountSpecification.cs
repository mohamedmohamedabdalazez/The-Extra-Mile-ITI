using System.Linq;
using Core.Entities;

namespace Core.Specifications
{
    public class ProductWithFiltersForCountSpecification : BaseSpecification<Product>
    {
        public ProductWithFiltersForCountSpecification(ProductSpecParams productParams) 
            : base(x =>
                // Search filter (if search term exists)
                (string.IsNullOrEmpty(productParams.Search) || x.Name.ToLower().Contains(productParams.Search.ToLower())) &&

                // Brands filter (if any brands are selected)
                (!productParams.Brands.Any() || productParams.Brands.Contains(x.Brand)) &&

                // Types filter (if any types are selected)
                (!productParams.Types.Any() || productParams.Types.Contains(x.Type))
            )
        {
            // This specification is ONLY for counting.
            // It does NOT include sorting or paging.
        }
    }
}
