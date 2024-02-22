using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/api/matter")]
public class MatterInceptionController : ControllerBase
{
    public class MatterRequest
    {
        public int Priority{ get; set; }
        public bool Confidential{ get; set; }
        public string BillingArrangements{ get; set; } = string.Empty;

        public override string ToString()
        {
            return $"P: {Priority} CONF:{Confidential} ARR: {BillingArrangements}";
        }
    }

    public class MatterResponse
    {
        public string PMSReference{ get; set; }

        public MatterResponse()
        {
            PMSReference = $"MTR_{DateTime.Now:yyMMddHHmmss}";            
        }
    }

    [Authorize]
    [HttpPost]
    public IActionResult CreateMatter(MatterRequest dto)
    {
        if( dto.Priority < 5 )
        {
            DumpRequest(dto, ConsoleColor.Red, "FAILED - BELOW PRIORITY 5");
            return BadRequest("Can only incept matters with priority 5 or above in PMS");
        }
        
        var response = new MatterResponse();
        DumpRequest(dto, ConsoleColor.Cyan, response.PMSReference);
        return new JsonResult(response);
    }

    private void DumpRequest(MatterRequest dto, ConsoleColor colour, string result)
    {       
        Console.ForegroundColor = colour;
        Console.WriteLine($"****************************************************************");
        Console.WriteLine($"* MATTER INCEPTION REQUEST: {DateTime.Now:r}");
        Console.WriteLine($"*                 Priority: {dto.Priority}");
        Console.WriteLine($"*             Confidential: {dto.Confidential}");
        Console.WriteLine($"*                  Billing: {dto.BillingArrangements}");
        Console.WriteLine($"*");
        Console.WriteLine($"*                   RESULT: {result}");
        Console.WriteLine($"****************************************************************");
        Console.ResetColor();
    }

    
}
