using System.Net;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using OnixWebScan.Models;
using OnixWebScan.Utils;

namespace OnixWebScan.Controllers
{
    public class VerifyController : Controller
    {
        [Route("verify")]
        [Route("verify-dev")]
        public IActionResult Index()
        {
            var queryParams = HttpContext.Request.Query;

            // Case 1: ไม่มี query parameter เลย
            if (!queryParams.Any())
            {
                var vm1 = new VerifyViewModel
                {
                    RawJson = "",
                    Payload = new VerifyPayload { Status = "PARAMETER_MISSING" },
                    StatusCss = "vx-badge err",
                    StatusText = "PARAMETER_MISSING",
                    TtlDisplay = "-"
                };
                return View("Verify", vm1);
            }

            // Case 2: มี query parameter แต่ไม่ใช่ "data"
            if (!queryParams.ContainsKey("data"))
            {
                var vm2 = new VerifyViewModel
                {
                    RawJson = "",
                    Payload = new VerifyPayload { Status = "PARAM_MISSING" },
                    StatusCss = "vx-badge err",
                    StatusText = "PARAM_MISSING",
                    TtlDisplay = "-"
                };
                return View("Verify", vm2);
            }

            var data = queryParams["data"].ToString();

            // Case 3: มี ?data= แต่ไม่มีค่า (empty string)
            if (string.IsNullOrEmpty(data) || data.Trim() == "")
            {
                var vm3 = new VerifyViewModel
                {
                    RawJson = "",
                    Payload = new VerifyPayload { Status = "NO_DATA" },
                    StatusCss = "vx-badge err",
                    StatusText = "NO_DATA",
                    TtlDisplay = "-"
                };
                return View("Verify", vm3);
            }

            var key = Environment.GetEnvironmentVariable("ENCRYPTION_KEY");
            var iv  = Environment.GetEnvironmentVariable("ENCRYPTION_IV");
            if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(iv))
            {
                var vmConfig = new VerifyViewModel
                {
                    RawJson = "",
                    Payload = new VerifyPayload { Status = "FAILED" },
                    StatusCss = "vx-badge err",
                    StatusText = "FAILED / Server Configuration Error",
                    TtlDisplay = "-"
                };
                return View("Verify", vmConfig);
            }

            // Case 4: มี data แต่ decrypt ไม่ผ่าน
            string decrypted;
            try
            {
                decrypted = EncryptionUtils.Decrypt(data, key!, iv!);
            }
            catch (Exception ex)
            {
                var vm4 = new VerifyViewModel
                {
                    RawJson = $"Decrypt Error: {ex.Message}",
                    Payload = new VerifyPayload { Status = "DECRYPT_FAIL" },
                    StatusCss = "vx-badge err",
                    StatusText = "DECRYPT_FAIL",
                    TtlDisplay = "-"
                };
                return View("Verify", vm4);
            }

            VerifyPayload? payload = null;
            try
            {
                payload = JsonSerializer.Deserialize<VerifyPayload>(
                    decrypted,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch
            {
                // Case 4: decrypt ได้แต่ parse JSON ไม่ได้
                var vm4 = new VerifyViewModel
                {
                    RawJson = decrypted,
                    Payload = new VerifyPayload { Status = "INVALID" },
                    StatusCss = "vx-badge err",
                    StatusText = "INVALID / JSON Parse Error",
                    TtlDisplay = "-"
                };
                return View("Verify", vm4);
            }

            var (cls, text) = MapStatus(payload?.Status);
            var ttlDisplay  = BuildTtl(payload?.DataGeneratedDate, payload?.TtlMinute);

            var vm = new VerifyViewModel
            {
                RawJson    = decrypted,
                Payload    = payload,
                StatusCss  = cls,
                StatusText = $"{text} / {payload?.Status ?? "INFO"}",
                TtlDisplay = ttlDisplay
            };


            // logging vm as JSON
            try
            {
                var logJson = JsonSerializer.Serialize(vm, new JsonSerializerOptions { WriteIndented = true });
                Console.WriteLine($"VerifyViewModel: {logJson}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"VerifyViewModel log error: {ex.Message}");
            }

            return View("Verify", vm);
        }


        /// <summary>
        /// เปิดลิงก์ภายนอกโดยให้หลังบ้าน redirect (ไม่ให้หน้า View ยิงตรง)
        /// พารามิเตอร์ u = Base64(UTF8(url)) แล้ว URL-encode อีกชั้น
        /// </summary>
        [HttpGet("verify/open")]
        public IActionResult OpenExternal(string? u)
        {
            if (string.IsNullOrWhiteSpace(u)) return NotFound();

            string url;
            try
            {
                var raw = WebUtility.UrlDecode(u);
                url = Encoding.UTF8.GetString(Convert.FromBase64String(raw!));
            }
            catch
            {
                return BadRequest("Invalid parameter.");
            }

            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
                return BadRequest("Invalid url.");

            var scheme = uri.Scheme.ToLowerInvariant();
            if (scheme != "http" && scheme != "https" && scheme != "mailto")
                return BadRequest("Unsupported scheme.");

            return Redirect(url);
        }

        /// <summary>
        /// เปิดเมลถึงทีมซัพพอร์ต พร้อม subject/body ใส่ข้อมูลช่วยตรวจสอบ
        /// </summary>
        [HttpGet("verify/support")]
        public IActionResult ContactSupport(string? serial, string? pin, string? brand)
        {
            var to = "support@example.com";
            var subject = Uri.EscapeDataString($"ช่วยตรวจความแท้ - Serial {serial ?? "-"}");
            var body = Uri.EscapeDataString(
                $"รบกวนช่วยตรวจสินค้าให้หน่อยครับ/ค่ะ\n\n" +
                $"แบรนด์: {brand ?? "-"}\n" +
                $"Serial: {serial ?? "-"}\n" +
                $"PIN: {pin ?? "-"}\n" +
                $"\nขอบคุณครับ/ค่ะ");

            var mailto = $"mailto:{to}?subject={subject}&body={body}";
            return Redirect(mailto);
        }

        /// <summary>
        /// กรณีมี RedirectUrl ใน payload ให้เรียกผ่านหลังบ้าน
        /// </summary>
        [HttpGet("verify/redirect")]
        public IActionResult OpenRedirect(string? u)
        {
            // ใช้พารามิเตอร์แบบเดียวกับ OpenExternal
            return OpenExternal(u);
        }

        // ===== Utilities =====

        private static (string cls, string text) MapStatus(string? status)
        {
            return status switch
            {
                "OK" or "SUCCESS" or "VALID"   => ("vx-badge ok",   "OK"),
                "ALREADY_REGISTERED"           => ("vx-badge warn", "Already registered"),
                "NOTFOUND"                     => ("vx-badge err",  "Not found"),
                "PARAM_MISSING"                => ("vx-badge err",  "Parameter missing"),
                "PARAMETER_MISSING"            => ("vx-badge err",  "Parameter missing"),
                "NO_DATA"                      => ("vx-badge err",  "No data"),
                "DECRYPT_FAIL"                 => ("vx-badge err",  "Decrypt failed"),
                "DECRYPT_ERROR"                => ("vx-badge err",  "Decrypt error"),
                "INVALID"                      => ("vx-badge err",  "Invalid"),
                "FAILED"                       => ("vx-badge err",  "Failed"),
                "ERROR"                        => ("vx-badge err",  "Error"),
                _                              => ("vx-badge warn", "Info"),
            };
        }

        private static string BuildTtl(DateTimeOffset? gen, int? ttlMin)
        {
            if (gen is null || ttlMin is null || ttlMin <= 0) return "-";
            var exp = gen.Value.AddMinutes(ttlMin.Value);
            var now = DateTimeOffset.UtcNow;
            if (exp <= now) return "หมดอายุแล้ว";
            var left = exp - now;
            var m = (int)Math.Floor(left.TotalMinutes);
            var s = left.Seconds;
            return $"{m} นาที {s} วินาที";
        }
    }
}
