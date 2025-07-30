// CouponController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

[ApiController]
[Route("vulnerable_coupon")]
public class CouponController_vulnerable : ControllerBase
{
    private static readonly object _lock = new();
    private const string ConnString = "Data Source=coupons.db";

    [HttpPost("apply")]
    public IActionResult ApplyCoupon([FromBody] ApplyCouponRequest request)
    {

        using var conn = new SqliteConnection(ConnString);
        conn.Open();

        var getCoupon = conn.CreateCommand();
        getCoupon.CommandText = "SELECT IsUsed FROM Coupons WHERE Code = @code";
        getCoupon.Parameters.AddWithValue("@code", request.CouponCode);
        var isUsed = Convert.ToInt32(getCoupon.ExecuteScalar() ?? -1);

        if (isUsed == -1)
            return BadRequest("Invalid coupon");
        if (isUsed > 0)
            return BadRequest("Coupon already used");

        var updateOrder = conn.CreateCommand();
        updateOrder.CommandText = "UPDATE Orders SET Amount = Amount / 2 WHERE Id = @id";
        updateOrder.Parameters.AddWithValue("@id", request.OrderId);
        updateOrder.ExecuteNonQuery();

        var markUsed = conn.CreateCommand();
        markUsed.CommandText = "UPDATE Coupons SET IsUsed = IsUsed + 1 WHERE Code = @code";
        markUsed.Parameters.AddWithValue("@code", request.CouponCode);
        markUsed.ExecuteNonQuery();

        return Ok("Coupon applied");
    }

}

