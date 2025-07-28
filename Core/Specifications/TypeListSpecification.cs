using Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Specifications
{
    public class TypeListSpecification:BaseSpecification<Product, string>
    {
        public TypeListSpecification()
        {
            AddSelect(e => e.Type);
            ApplyDistinct();
        }
    }
}
