using System.Diagnostics;
using System.Text;
using System.Text.Json;
using Serilog;

namespace OnixWebScan.AuditLogs
{
    public class AuditLogMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly HttpClient _httpClient;

        public AuditLogMiddleware(RequestDelegate next, IHttpClientFactory httpClientFactory)
        {
            _next = next;
            _httpClient = httpClientFactory.CreateClient();
        }

        private string? GetValue(HttpContext context, string key, string defaultValue)
        {
            var value = context.Items[key];
            if (value == null)
            {
                return defaultValue;
            }

            return value.ToString();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();

            var originalBodyStream = context.Response.Body;
            using var memoryStream = new MemoryStream();
            context.Response.Body = memoryStream;

            var scheme = context.Request.Scheme;
            var method = context.Request.Method;
            var host = context.Request.Headers["X-Forwarded-Host"].ToString();
            var path = context.Request.Path;
            var query = context.Request.QueryString.ToString();
            var fullUrl = $"{method} {path}{query}";
            var requestSize = context.Request.ContentLength ?? 0;
            var userAgent = context.Request.Headers["User-Agent"].ToString();

            var cfClientIp = "";
            if (context.Request.Headers.ContainsKey("CF-Connecting-IP"))
            {
                cfClientIp = context.Request.Headers["CF-Connecting-IP"].ToString();
            }

            var clientIp = "";
            if (context.Request.Headers.TryGetValue("X-Original-Forwarded-For", out var xForwardedFor))
            {
                clientIp = xForwardedFor.ToString().Split(',')[0].Trim();
            }

            await _next(context); // call next middleware

            var custStatus = "";
            if (context.Response.Headers.TryGetValue("CUST_STATUS", out var customStatus))
            {
                custStatus = customStatus;
            }

            var responseSize = memoryStream.Length;
            var statusCode = context.Response.StatusCode;
  
            memoryStream.Seek(0, SeekOrigin.Begin);
            await memoryStream.CopyToAsync(originalBodyStream);
            context.Response.Body = originalBodyStream;

            var statusDesc = "";
            if (statusCode != 200)
            {
                memoryStream.Seek(0, SeekOrigin.Begin);
                var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();
                statusDesc = responseBody;
            }

            stopwatch.Stop();

            var latencyMs = stopwatch.ElapsedMilliseconds;

            // === Build log JSON ===
            var logObject = new AuditLog()
            {
                Host = host,
                HttpMethod = method,
                StatusCode = statusCode,
                Path = path,
                QueryString = query,
                UserAgent = userAgent,
                RequestSize = requestSize,
                ResponseSize = responseSize,
                LatencyMs = latencyMs,
                Scheme = scheme,
                ClientIp = clientIp,
                CfClientIp = cfClientIp,
                CustomStatus = custStatus,
                CustomDesc = statusDesc,
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),

                userInfo = new UserInfo(),
            };

            if (path == "/health")
            {
                //No need for audit log
                return;
            }

            var logJson = JsonSerializer.Serialize(logObject);
            Log.Information(logJson);

            await SendAuditLog(logJson);
        }

        private async Task SendAuditLog(string logJson)
        {
            var endPoint = Environment.GetEnvironmentVariable("LOG_ENDPOINT");
            if (endPoint == null)
            {
                return;
            }
            
            try
            {
                var content = new StringContent(logJson, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(endPoint, content);

                if (!response.IsSuccessStatusCode)
                {
                    Log.Warning($"Failed to send audit log, status code = [{response.StatusCode}]");
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
            }
        }
    }
}
