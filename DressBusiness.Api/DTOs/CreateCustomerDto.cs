using System.ComponentModel.DataAnnotations;

namespace DressBusiness.Api.DTOs;

public class CreateCustomerDto
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required, Phone, StringLength(15)]
    public string Phone { get; set; } = string.Empty;

    [EmailAddress, StringLength(150)]
    public string? Email { get; set; }

    [StringLength(300)]
    public string? Address { get; set; }
}