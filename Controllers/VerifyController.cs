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
        public IActionResult Index(string data)
        {
            if (string.IsNullOrWhiteSpace(data))
                return BadRequest("Missing 'data'");

            var key = Environment.GetEnvironmentVariable("ENCRYPTION_KEY");
            var iv  = Environment.GetEnvironmentVariable("ENCRYPTION_IV");
            if (string.IsNullOrWhiteSpace(key) || string.IsNullOrWhiteSpace(iv))
                return StatusCode(500, "Server missing ENCRYPTION_KEY/ENCRYPTION_IV");

            string decrypted;
            try
            {
                decrypted = EncryptionUtils.Decrypt(data, key!, iv!);
            }
            catch (Exception ex)
            {
                return StatusCode(400, $"Decrypt error: {ex.Message}");
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
                "OK"                 => ("vx-badge ok",   "OK"),
                "ALREADY_REGISTERED" => ("vx-badge warn", "Already registered"),
                "ERROR"              => ("vx-badge err",  "Error"),
                _                    => ("vx-badge warn", "Info"),
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
