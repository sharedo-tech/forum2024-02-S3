namespace("Demo01");

/**
 * Agent for accessing the APIs to obtain data for this widget
 */
Demo01.RiskWidgetAgent = function()
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
                { path: "form-demo01risk.demo01probability" },
                { path: "form-demo01risk.demo01impact" }
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
                        probability: data.results[0].data["form-demo01risk.demo01probability"],
                        impact: data.results[0].data["form-demo01risk.demo01impact"]
                    });
            }
        });

        return promise;
    }

    
    return {
        loadWorkItem: loadWorkItem
    };
}();