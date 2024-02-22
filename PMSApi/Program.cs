using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Services
    .AddAuthentication(
    o =>
    {
        o.DefaultAuthenticateScheme = "shared-secret";
        o.DefaultChallengeScheme = "shared-secret";
    })
    .AddScheme<SharedSecretOptions, SharedSecretHandler>
    (
        "shared-secret",
        "shared-secret",
        o => { }
    );

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public class SharedSecretOptions : AuthenticationSchemeOptions
{
}

public class SharedSecretHandler : AuthenticationHandler<SharedSecretOptions>
{
    public SharedSecretHandler
    (
        IOptionsMonitor<SharedSecretOptions> options, 
        ILoggerFactory logger, 
        UrlEncoder encoder, 
        ISystemClock clock
    )
    : base(options, logger, encoder, clock)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // No auth header
        if (!Request.Headers.ContainsKey("API_KEY"))
        {
            Console.WriteLine("**** Auth header not present");
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        // Empty auth header
        var token = Request.Headers["API_KEY"].ToString();
        if (string.IsNullOrWhiteSpace(token))
        {
            Console.WriteLine($"**** Auth header is empty: {token}");
            return Task.FromResult(AuthenticateResult.NoResult());
        }
        
        if( token != "abcd1234")
        {
            Console.WriteLine("**** Token not as expected");
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var claims = new List<Claim>
        {
            new Claim("name", "Bearer user")
        };

        var identity = new ClaimsIdentity(claims, "shared-secret", "name", "role");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "shared-secret");
        
        Console.WriteLine("**** Auth success");
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}

