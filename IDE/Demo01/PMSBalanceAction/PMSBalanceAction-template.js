let config = $model.Configuration;;

function getParameters()
{
    if( !config.pmsReferenceVariable )
    {
        log.Warning("No input variable was specified for PMS reference");
        return null;
    }

    let reference = ctx[config.pmsReferenceVariable];
    if( !reference )
    {
        log.Warning("Empty PMS reference");
        return null;
    }
    
    let delta = config.deltaAmount;
    if( !delta )
    {
        log.Warning("Delta amount is 0 - not calling PMS API");
        return null;
    }
    
    return { 
        reference:reference, 
        delta:delta
    };
}

function sendToAPI()
{
    let parameters = getParameters();
    if( !parameters ) return;
    
    let payload =
    {
        delta: parameters.delta
    };

    let httpResult = sharedo.http.post("/api/proxy/demo01/_/api/matter/" + parameters.reference + "/financials", payload);
    if( !httpResult.success )
    {
        throw "Failed to update matter balance in PMS. API returned '" + httpResult.status + "'";
    }

    log.Information("PMS API Call success - offset " + parameters.reference + " by " + parameters.delta);
}

sendToAPI();