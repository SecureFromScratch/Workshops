public class ApplyCouponRequest
{
    public int OrderId { get; set; }
    public string CouponCode { get; set; } = string.Empty;
}
