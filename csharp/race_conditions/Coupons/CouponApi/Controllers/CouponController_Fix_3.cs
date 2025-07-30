// CouponController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

[ApiController]
[Route("fix_3_coupon")]
public class CouponController_fix_3 : ControllerBase
{
    private static readonly object _lock = new();
    private const string ConnString = "Data Source=coupons.db";

    [HttpPost("apply")]
    public IActionResult ApplyCoupon([FromBody] ApplyCouponRequest request)
    {

        using var conn = new SqliteConnection(ConnString);
        conn.Open();

        using var tx = conn.BeginTransaction();

        // atomic coupon update
        var applyCoupon = conn.CreateCommand();
        applyCoupon.Transaction = tx;
        applyCoupon.CommandText = @"
            UPDATE Coupons
            SET IsUsed = 1
            WHERE Code = @code AND IsUsed = 0
        ";
        applyCoupon.Parameters.AddWithValue("@code", request.CouponCode);

        if (applyCoupon.ExecuteNonQuery() == 0)
            return BadRequest("Invalid or already used coupon");

        // atomic order update
        var updateOrder = conn.CreateCommand();
        updateOrder.Transaction = tx;
        updateOrder.CommandText = "UPDATE Orders SET Amount = Amount / 2 WHERE Id = @id";
        updateOrder.Parameters.AddWithValue("@id", request.OrderId);
        updateOrder.ExecuteNonQuery();

        tx.Commit();
        return Ok("Coupon applied");

    }

}

