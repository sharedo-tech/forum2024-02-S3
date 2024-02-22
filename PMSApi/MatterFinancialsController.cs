using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("/api/matter/{id}/financials")]
public class MatterFinancialsController : ControllerBase
{
    public class TxAudit
    {
        public DateTimeOffset TimeStamp{ get; set; }
        public decimal? Delta{ get; set; }
        public decimal? Balance{ get; set; }
    }
    
    // Not even remotely thread safe!
    private static Dictionary<string, decimal> Balances = new Dictionary<string, decimal>();
    private static Dictionary<string, List<TxAudit>> Audit = new Dictionary<string, List<TxAudit>>();

    [Authorize]
    [HttpPost]
    public IActionResult AdjustBalance(string id, DeltaDto dto)
    {
        var balance = 0.0m;
        var audit = new List<TxAudit>();

        if( Balances.ContainsKey(id)) balance = Balances[id];
        
        if( Audit.ContainsKey(id)) audit = Audit[id];
        else Audit[id] = audit;

        balance += dto.Delta;
        
        Balances[id] = balance;
        
        audit.Add(new TxAudit{
            TimeStamp = DateTimeOffset.Now,
            Delta = dto.Delta,
            Balance = balance
        });

        return new JsonResult(new{ balance });
    }

    public class DeltaDto
    {
        public decimal Delta{ get; set; }
    }

    [Authorize]
    [HttpGet]
    public IActionResult GetBalance(string id)
    {
        var balance = 0.0m;
        
        if( Balances.ContainsKey(id)) balance = Balances[id];

        return new JsonResult(new{ balance });
    }

    [Authorize]
    [HttpGet("audit")]
    public IActionResult GetAudit(string id)
    {
        var audit = new List<TxAudit>();
                
        if( Audit.ContainsKey(id)) audit = Audit[id];

        return new JsonResult(audit);
    }
}
