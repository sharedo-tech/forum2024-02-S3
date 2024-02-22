let config = $model.Configuration;;
let connections = $model.Connections;;
let risk = 0;

if( config.probabilityVariable && config.impactVariable )
{
    let probability = ctx[config.probabilityVariable] || 0;
    let impact = ctx[config.impactVariable] || 0;
    
    log.Information("Probability is: " + probability);
    log.Information("Impact is: " + impact);
    
    risk = probability * impact;
    log.Information("Risk is: " + risk + "%");
}
else
{
    log.Warning("Not probabilit/impact variables specified - assuming risk is 0")
}

if( risk <= 30 ) follow("risk-low");
if( risk > 30 && risk < 70 ) follow("risk-med");
if( risk >= 70 ) follow("risk-high");

// Do no further processing within this step;
return;

function follow(outlet)
{
    targetStep = connections[outlet];
    if( targetStep )
    {
        log.Information("Outlet " + outlet + " is configured - triggering " + targetStep.step);
        trigger.SubProcess(targetStep.step).Now();
    }
    else
    {
        log.Warning("Outlet " + outlet + " is not configured - stopping");
    }
}
