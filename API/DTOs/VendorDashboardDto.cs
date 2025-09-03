using Core.Entities;

namespace API.DTOs
{
    public class VendorDashboardDto
    {
        public int TotalProducts { get; set; }
        public int PendingProducts { get; set; }
        public int ApprovedProducts { get; set; }
        public int RejectedProducts { get; set; }

        public IReadOnlyList<Product> Products { get; set; } = new List<Product>();
    }
}
