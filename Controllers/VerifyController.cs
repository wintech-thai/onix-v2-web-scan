using Microsoft.AspNetCore.Mvc;
using OnixWebScan.Utils;


namespace OnixWebScan.Controllers
{
    public class VerifyController : Controller
    {
        // GET: /verify และ /verify-dev
        [Route("verify")]
        [Route("verify-dev")]
        public IActionResult Index(string data)
        {
            var key = Environment.GetEnvironmentVariable("ENCRYPTION_KEY");
            var iv = Environment.GetEnvironmentVariable("ENCRYPTION_IV");
            
            Console.WriteLine($"Received Text - {data}");
            //Console.WriteLine($"DEBUG2 - KEY = {key}");
            //Console.WriteLine($"DEBUG3 - IV = {iv}");
        
            var decryptedData = EncryptionUtils.Decrypt(data, key!, iv!);

            ViewBag.Message = decryptedData;
            return View("Verify"); // ชื่อ View: Views/Verify/Verify.cshtml
        }
    }
}
