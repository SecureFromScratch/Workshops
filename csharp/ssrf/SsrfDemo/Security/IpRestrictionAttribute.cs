using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;

public class AllowedSubnet
{
   public string Base { get; set; } = default!;
   public string Mask { get; set; } = default!;
}

public class IpRestrictionAttribute : ActionFilterAttribute
{
   private readonly List<AllowedSubnet> _subnets;

   public IpRestrictionAttribute(IConfiguration config)
   {
      _subnets = config.GetSection("AllowedSubnets").Get<List<AllowedSubnet>>() ?? new();
   }

   public override void OnActionExecuting(ActionExecutingContext context)
   {
      var remoteIp = context.HttpContext.Connection.RemoteIpAddress;
      Console.WriteLine($"Remote IP: {remoteIp}");

      if (remoteIp == null)
        {
            context.Result = new ContentResult { StatusCode = 403, Content = "Forbidden" };
            return;
        }

      foreach (var subnet in _subnets)
      {
         if (string.IsNullOrWhiteSpace(subnet.Base) || string.IsNullOrWhiteSpace(subnet.Mask))
            continue;

         if (IPAddress.TryParse(subnet.Base, out var baseIp) &&
             IPAddress.TryParse(subnet.Mask, out var maskIp) &&
             IsInSameSubnet(remoteIp, baseIp, maskIp))
            return;
      }

      context.Result = new ContentResult { StatusCode = 403, Content = "Forbidden" };
   }

   private static bool IsInSameSubnet(IPAddress address, IPAddress subnet, IPAddress mask)
   {
      var addrBytes = address.GetAddressBytes();
      var subnetBytes = subnet.GetAddressBytes();
      var maskBytes = mask.GetAddressBytes();
      for (int i = 0; i < addrBytes.Length; i++)
         if ((addrBytes[i] & maskBytes[i]) != (subnetBytes[i] & maskBytes[i]))
            return false;
      return true;
   }
}
