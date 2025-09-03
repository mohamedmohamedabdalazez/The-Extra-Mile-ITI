using Core.Entities;

namespace API.DTOs
{
    public class AdminDashboardDto
    {
        public int TotalOrders { get; set; }
        public int TotalProducts { get; set; }
        public int PendingProducts { get; set; }
        public int ApprovedProducts { get; set; }
        public int RejectedProducts { get; set; }
        public int SuspendedProducts { get; set; }
        public int VendorCount { get; set; }
        public int TotalRevenue { get; set; }
        public int AdminPublishedProducts { get; set; }
    }
}