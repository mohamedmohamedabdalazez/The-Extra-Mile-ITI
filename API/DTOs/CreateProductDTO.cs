using System.ComponentModel.DataAnnotations;

namespace The_Extra_Mile.DTOs
{
    public class CreateProductDTO
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Description { get; set; }
        [Range(0.01, int.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }
        [Required]
        public string PictureUrl { get; set; }
        [Required]
        public string Type { get; set; }
        [Required]
        public string Brand { get; set; }
        [Range(1, int.MaxValue, ErrorMessage ="Quantity in stock must be at least 1")]
        public int QuantityInStock { get; set; }
    }
}
