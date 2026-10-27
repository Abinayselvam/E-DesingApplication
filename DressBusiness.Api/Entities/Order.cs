using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DressBusiness.Api.Entities;

public class Order
{
    public int Id { get; set; }

    [Required, StringLength(30)]
    public string OrderNumber { get; set; } = string.Empty;

    public int CustomerId { get; set; }

    public Customer? Customer { get; set; }

    [Required, StringLength(80)]
    public string GarmentType { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? DesignNotes { get; set; }

    [Column(TypeName = "decimal(12,2)")]
    public decimal QuotedPrice { get; set; }

    [Column(TypeName = "decimal(12,2)")]
    public decimal AdvancePaid { get; set; }

    public DateTime DeliveryDate { get; set; }

    [Required, StringLength(30)]
    public string Status { get; set; } = "AwaitingAdvance";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public decimal BalanceDue => QuotedPrice - AdvancePaid;
}