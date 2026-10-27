using System.ComponentModel.DataAnnotations;

namespace DressBusiness.Api.DTOs;

public class CreateOrderDto
{
    [Range(1, int.MaxValue)]
    public int CustomerId { get; set; }

    [Required, StringLength(80)]
    public string GarmentType { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? DesignNotes { get; set; }

    [Range(typeof(decimal), "1", "10000000")]
    public decimal QuotedPrice { get; set; }

    [Range(typeof(decimal), "0", "10000000")]
    public decimal AdvancePaid { get; set; }

    public DateTime DeliveryDate { get; set; }
}