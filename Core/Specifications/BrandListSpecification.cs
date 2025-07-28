using Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Specifications
{
    public class BrandListSpecification:BaseSpecification<Product, string>
    {
        public BrandListSpecification()
        {
            AddSelect(e => e.Brand);
            ApplyDistinct();
        }
    }
}
