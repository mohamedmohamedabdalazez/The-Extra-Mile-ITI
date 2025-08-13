// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Text;
// using System.Threading.Tasks;

// namespace Core.Specifications
// {
//     public class ProductSpecParams
//     {
// 		private const int MaxPageSize = 50;
// 		public int PageIndex { get; set; } = 1;
// 		private int _pageSize = 6;

// 		public int PageSize
// 		{
// 			get => _pageSize;
// 			set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
// 		}

// 		private List<string> _brands = [];
// 		public List<string> Brands
// 		{
// 			get => _brands;
// 			set { _brands = value.SelectMany(x=> x.Split(',', StringSplitOptions.RemoveEmptyEntries)).ToList(); }
// 		}

// 		private List<string> _types = [];

// 		public List<string> Types
// 		{
// 			get =>_types; 
// 			set { _types = value.SelectMany(x=>x.Split(',', StringSplitOptions.RemoveEmptyEntries)).ToList(); }
// 		}

//         public string? sort { get; set; }
// 		private string? _search;

// 		public string Search
// 		{
// 			get => _search?? " "; 
// 			set => _search = value.ToLower(); 
// 		}



// 	}
// }
// In Core/Specifications/ProductSpecParams.cs
using System;
using System.Collections.Generic;
using System.Linq;

namespace Core.Specifications
{
    public class ProductSpecParams
    {
        private const int MaxPageSize = 50;

        // BUG FIX 1: The PageIndex from the client is 0-based.
        // It must NOT default to 1. We will let it be 0.
        public int PageIndex { get; set; } = 0; 

        private int _pageSize = 10; // Let's default to 10 to match the client

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
        }

        private List<string> _brands = [];
        public List<string> Brands
        {
            get => _brands;
            set { _brands = value.SelectMany(x => x.Split(',', StringSplitOptions.RemoveEmptyEntries)).ToList(); }
        }

        private List<string> _types = [];
        public List<string> Types
        {
            get => _types;
            set { _types = value.SelectMany(x => x.Split(',', StringSplitOptions.RemoveEmptyEntries)).ToList(); }
        }

        public string? sort { get; set; }
        private string? _search;

        public string? Search // It can be nullable
        {
            get => _search;
            set => _search = value?.ToLower(); // Use null-conditional operator
        }
    }
}