let config = $model.Configuration;;

let payload =
{
    priority: 10,
    confidential: true,
    billingArrangements: "No win, no fee"
};

let httpResult = sharedo.http.post("/api/proxy/demo01/_/api/matter", payload);

if( !httpResult.success )
{
    throw "Failed to onboard matter in PMS. API returned '" + httpResult.status + "'";
}

let result = httpResult.body;

log.Information("PMS API Call success - result is: " + JSON.stringify(result));

if( !config.outputVariable )
{
    log.Warning("No output variable set to store PMS Reference");
}

if( !result.pmsReference )
{
    log.Warning("PMS reference returned is empty!");
}

if( config.outputVariable && result.pmsReference )
{
    log.Information("Storing " + result.pmsReference + "into ctx." + config.outputVariable);
    ctx[config.outputVariable] = result.pmsReference;
}
