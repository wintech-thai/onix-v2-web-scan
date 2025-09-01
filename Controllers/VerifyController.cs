using Microsoft.AspNetCore.Mvc;

namespace MyWebApp.Controllers
{
    public class VerifyController : Controller
    {
        // GET: /verify และ /verify-dev
        [Route("verify")]
        [Route("verify-dev")]
        public IActionResult Index()
        {
            ViewBag.Message = "This is the verify page!";
            return View("Verify"); // ชื่อ View: Views/Verify/Verify.cshtml
        }
    }
}
