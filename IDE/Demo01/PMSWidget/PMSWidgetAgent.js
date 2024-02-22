namespace("Demo01");

/**
 * Agent for accessing the APIs to obtain data for this widget
 */
Demo01.PMSWidgetAgent = function()
{
    /**
     * Example of using findByQuery API to load work item
     * by it's ID, and enrich with specific parameters
     */
    var loadWorkItem = function(id)
    {
        var promise = $.Deferred();

        var request = {

            // Simple search - get by id
            search:
            {
                workItemIds: [id]
            },

            // Enrich with fields from data composer - use data composer
            // screen in modeller to browse around the data graph and find
            // the fields you might need
            enrich:
            [
                // Some basic details
                { path: "form-demo01pms.demo01PmsReference" }
            ]
        };

        $ajax.post("/api/v1/public/workItem/findByQuery", request).then(function(data)
        {
            if (!data || data.totalCount < 1 || data.results.length < 1)
            {
                promise.reject("Not found");
            }
            else
            {
                promise.resolve(
                    {
                        pmsReference: data.results[0].data["form-demo01pms.demo01PmsReference"]
                    });
            }
        });

        return promise;
    }

    /**
     * Example of using an external API to get additional data not held in sharedo.
     * Note - this is using https://dummyapi.io - you'll need to sign up (it's free)
     * and get an app id for this call to work - set the app id below;
     */
    var getBalances = function(ref)
    {
        var promise = $.Deferred();
        
        $ajax.get(`/api/proxy/demo01/_/api/matter/${ref}/financials`).then(data =>
        {
            promise.resolve({ balance: data.balance });
            
        });
        
        return promise;
    };
    
    var sendToPms = function(id, body)
    {
        var promise = $.Deferred();
        
        // Send it to the PMS via the proxy
        $ajax.post(`/api/proxy/demo01/_/api/matter`, body).then(data =>
        {
            if( !data || !data.pmsReference )
            { 
                promise.resolve(null);
                return;
            }
            
            // Store the pms reference field back
            $ajax.post(`/api/v1/public/workItem/${id}/attributes/demo01PmsReference`, { value: data.pmsReference } ).then(() =>
            {
                promise.resolve(data);
            });
        });
        
        return promise;
    }
    
    var sendDelta = function(ref, deltaAmount)
    {
        var promise = $.Deferred();
        
        var body = { delta: deltaAmount };
        
        // Send it to the PMS via the proxy
        $ajax.post(`/api/proxy/demo01/_/api/matter/${ref}/financials`, body).then(data =>
        {
            promise.resolve({ balance: data.balance });
        });
        
        return promise;        
    };
    
    var clearPms = function(id)
    {
        // Clear  the pms reference field back
        return $ajax.post(`/api/v1/public/workItem/${id}/attributes/demo01PmsReference`, { value: null } );
    }
    
    return {
        loadWorkItem: loadWorkItem,
        getBalances: getBalances,
        sendToPms: sendToPms,
        sendDelta: sendDelta,
        clearPms: clearPms
    };
}();