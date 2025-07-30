public static class FakeStore
{
    public static Dictionary<int, Order> Orders = new();
    public static Dictionary<string, Coupon> Coupons = new();

    static FakeStore()
    {
        Orders[1] = new Order { Id = 1, TotalPrice = 100 };
        Coupons["SAVE50"] = new Coupon { Code = "SAVE50" };
    }
}
