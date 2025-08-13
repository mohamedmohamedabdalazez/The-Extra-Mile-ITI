// using Core.Entities;
// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Text;
// using System.Threading.Tasks;

// namespace Core.Specifications
// {
//     public class ProductSpecification:BaseSpecification<Product>
//     {
//         public ProductSpecification(ProductSpecParams specParams): base(x =>
//             (String.IsNullOrEmpty(specParams.Search) || x.Name.ToLower().Contains(specParams.Search))&&
//             (specParams.Brands.Count == 0 || specParams.Brands.Contains(x.Brand)) &&
//             (specParams.Types.Count == 0 || specParams.Types.Contains(x.Type))

//         ){
//             ApplyPaging(specParams.PageSize * (specParams.PageIndex - 1), specParams.PageSize);
//             switch (specParams.sort)
//             {
//                 case "priceAsc":
//                     AddOrderBy(x => x.Price);
//                     break;
//                 case "priceDesc":
//                     AddOrderByDesc(x => x.Price); 
//                     break;
//                 default:
//                     AddOrderBy(x => x.Name);
//                     break;
//             }        
//         }
//     }
// }
// In Core/Specifications/ProductSpecification.cs
using Core.Entities;
using System;
using System.Linq;

namespace Core.Specifications
{
    public class ProductSpecification : BaseSpecification<Product>
    {
        public ProductSpecification(ProductSpecParams specParams) : base(x =>
            (string.IsNullOrEmpty(specParams.Search) || x.Name.ToLower().Contains(specParams.Search)) &&
            (!specParams.Brands.Any() || specParams.Brands.Contains(x.Brand)) &&
            (!specParams.Types.Any() || specParams.Types.Contains(x.Type))
        )
        {
            // Add sorting logic
            if (!string.IsNullOrEmpty(specParams.sort))
            {
                switch (specParams.sort)
                {
                    case "priceAsc":
                        AddOrderBy(x => x.Price);
                        break;
                    case "priceDesc":
                        // NOTE: Your method was named AddOrderByDesc, I assume it's a typo for AddOrderByDescending
                        AddOrderByDesc(x => x.Price);
                        break;
                    default:
                        AddOrderBy(x => x.Name);
                        break;
                }
            }
            else
            {
                AddOrderBy(x => x.Name); // Default sort
            }

            // BUG FIX 1 (Part 2): Use the correct formula for a 0-based PageIndex
            ApplyPaging(specParams.PageSize * specParams.PageIndex, specParams.PageSize);
        }
    }
}