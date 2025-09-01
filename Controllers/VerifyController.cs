using Microsoft.AspNetCore.Mvc;

namespace OnixWebScan.Controllers
{
    public class VerifyController : Controller
    {
        // GET: /verify และ /verify-dev
        [Route("verify")]
        [Route("verify-dev")]
        public IActionResult Index(string data)
        {
            ViewBag.Message = data;
            return View("Verify"); // ชื่อ View: Views/Verify/Verify.cshtml
        }
    }
}
