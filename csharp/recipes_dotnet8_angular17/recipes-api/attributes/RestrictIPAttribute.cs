using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;


namespace recipes_api.attributes
{

    public class RestrictIPAttribute : ActionFilterAttribute
    {
        private readonly string _allowedIP;
        private readonly string _blockedIP;

        public RestrictIPAttribute(string allowedIP, string blockedIP)
        {
            _allowedIP = allowedIP;
            _blockedIP = blockedIP;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var requestIP = context.HttpContext.Connection.RemoteIpAddress;

            if (requestIP != null)
            {
                // Check if the request IP matches the blocked IP
                if (requestIP.Equals(IPAddress.Parse(_blockedIP)))
                {
                    context.Result = new ContentResult
                    {
                        Content = "Access from your IP address is blocked.",
                        StatusCode = 403  // Forbidden
                    };
                    return;
                }

                if (!requestIP.Equals(IPAddress.Parse(_allowedIP)))
                {
                    context.Result = new ContentResult
                    {
                        Content = "Access from your IP address is blocked.",
                        StatusCode = 403  // Forbidden
                    };
                    return;
                }
            }

            base.OnActionExecuting(context);
        }
    }

}
