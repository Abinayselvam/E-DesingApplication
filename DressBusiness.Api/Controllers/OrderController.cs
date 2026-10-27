using DressBusiness.Api.Data;
using DressBusiness.Api.DTOs;
using DressBusiness.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DressBusiness.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public OrdersController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _db.Orders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                o.CustomerId,
                CustomerName = o.Customer!.Name,
                o.GarmentType,
                o.DesignNotes,
                o.QuotedPrice,
                o.AdvancePaid,
                BalanceDue = o.QuotedPrice - o.AdvancePaid,
                o.DeliveryDate,
                o.Status,
                o.CreatedAt
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderDto dto)
    {
        if (dto.AdvancePaid > dto.QuotedPrice)
        {
            return BadRequest(new
            {
                message = "Advance cannot exceed the quoted price."
            });
        }

        if (dto.DeliveryDate.Date < DateTime.UtcNow.Date)
        {
            return BadRequest(new
            {
                message = "Delivery date cannot be in the past."
            });
        }

        var customerExists = await _db.Customers
            .AnyAsync(c => c.Id == dto.CustomerId);

        if (!customerExists)
        {
            return BadRequest(new
            {
                message = "The selected customer does not exist."
            });
        }

        var order = new Order
        {
            OrderNumber = $"DR-{Guid.NewGuid():N}"[..13].ToUpperInvariant(),
            CustomerId = dto.CustomerId,
            GarmentType = dto.GarmentType.Trim(),
            DesignNotes = dto.DesignNotes?.Trim(),
            QuotedPrice = dto.QuotedPrice,
            AdvancePaid = dto.AdvancePaid,
            DeliveryDate = dto.DeliveryDate,
            Status = dto.AdvancePaid >= dto.QuotedPrice * 0.5m
                ? "Confirmed"
                : "AwaitingAdvance"
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAll),
            new { id = order.Id },
            new
            {
                order.Id,
                order.OrderNumber,
                order.CustomerId,
                order.GarmentType,
                order.QuotedPrice,
                order.AdvancePaid,
                BalanceDue = order.BalanceDue,
                order.DeliveryDate,
                order.Status
            });
    }
}