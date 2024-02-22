using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/api/test")]
public class TestController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return new JsonResult(new
        {
            Message = $"Hello {User.Identity?.Name ?? "null"} at {DateTime.Now.ToString("r")}"
        });
    }    
}
