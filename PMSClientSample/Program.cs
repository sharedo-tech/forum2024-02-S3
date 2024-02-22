using System.Net.Http.Json;
using System.Text.Json;

// **************** Tests
Console.WriteLine("--- Incepting matter");
var matterRef = await Test.InceptMatter(10, false, "No-win, No-fee");
Console.WriteLine($"    New reference={matterRef}");

Console.WriteLine("--- Setting balance to 123.45");
await Test.AdjustBalance(matterRef, 123.45m);

Console.WriteLine("--- Getting and updating balance");
var balanceBefore = await Test.GetBalance(matterRef);
Console.WriteLine($"    Before = {balanceBefore}");

var balanceAfter = await Test.AdjustBalance(matterRef, 11.0m);
Console.WriteLine($"    Added +11 to balance");
Console.WriteLine($"    After = {balanceAfter}");

Console.WriteLine("--- Getting and updating balances for CUMULATIVE_1");
var cumulativeBefore = await Test.GetBalance("CUMULATIVE_1");
Console.WriteLine($"    Before = {cumulativeBefore}");

var cumulativeAfter = await Test.AdjustBalance("CUMULATIVE_1", 11.0m);
Console.WriteLine($"    Added +11 to balance");
Console.WriteLine($"    After = {cumulativeAfter}");

Console.WriteLine("--- Getting audit for CUMULATIVE_1");
var audit = await Test.GetAudit("CUMULATIVE_1");
if( !audit.Any() ) Console.WriteLine("    No audit info");
foreach( var item in audit )
{
    Console.WriteLine($"    {item.TimeStamp} {item.Delta} {item.Balance}");
}

// **************** Test class
public static class Test
{
    private static JsonSerializerOptions JsonOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public static async Task<List<TxAuditDto>> GetAudit(string matterRef)
    {
        var responseBody = await Api
        (
            HttpMethod.Get,
            $"https://localhost:5001/api/matter/{matterRef}/financials/audit"
        );

        if( responseBody == null ) return new List<TxAuditDto>();

        var result = JsonSerializer.Deserialize<List<TxAuditDto>>(responseBody, JsonOptions);
        return result ?? new List<TxAuditDto>();
    }

    public class TxAuditDto
    {
        public DateTimeOffset TimeStamp{ get; set; }
        public decimal? Delta{ get; set; }
        public decimal? Balance{ get; set; }
    }

    public static async Task<decimal> GetBalance(string matterRef)
    {
        var responseBody = await Api
        (
            HttpMethod.Get,
            $"https://localhost:5001/api/matter/{matterRef}/financials"
        );

        if( responseBody == null ) return 0.0m;

        var result = JsonSerializer.Deserialize<MatterBalanceDto>(responseBody, JsonOptions);
        return result?.Balance ?? 0.0m;
    }

    public static async Task<decimal> AdjustBalance(string matterRef, decimal delta)
    {
        var responseBody = await Api
        (
            HttpMethod.Post,
            $"https://localhost:5001/api/matter/{matterRef}/financials",
            new 
            {
                Delta = delta
            }
        );

        if( responseBody == null ) return 0.0m;

        var result = JsonSerializer.Deserialize<MatterBalanceDto>(responseBody, JsonOptions);
        return result?.Balance ?? 0.0m;
    }

    internal class MatterBalanceDto
    {
        public decimal Balance{ get; set; }
    }

    public static async Task<string> InceptMatter(int priority, bool confidential, string billingArrangements)
    {
        var responseBody = await Api
        (
            HttpMethod.Post,
            "https://localhost:5001/api/matter",
            new 
            {
                Priority = priority,
                Confidential = confidential,
                BillingArrangements = billingArrangements
            }
        );

        if( responseBody == null )
        {
            throw new InvalidOperationException("Response was null");
        }

        var result = JsonSerializer.Deserialize<InceptMatterDto>(responseBody, JsonOptions);
        
        if( string.IsNullOrWhiteSpace(result?.PMSReference))
        {
            throw new InvalidOperationException("Response contains no reference");
        }

        return result.PMSReference;
    }

    internal class InceptMatterDto
    {
        public string PMSReference { get; set; } = "NONE";
    }

    internal static async Task<string?> Api(HttpMethod method, string url, object? json = null)
    {
        var request = new HttpRequestMessage(method, url)
        {
            Headers = 
            {
                { "API_KEY", "abcd1234" },
            },
            Content = json != null
                ? JsonContent.Create(json)
                : null
        };

        using var client = new HttpClient();

        var response = await client.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"Call to {method} {url} FAILED {response.StatusCode}");
            if (response.Content != null)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"BODY={errorBody}");
            }

            // Surface error
            response.EnsureSuccessStatusCode();
            return null;
        }

        var body = await response.Content.ReadAsStringAsync();
        return body;
    }
}

