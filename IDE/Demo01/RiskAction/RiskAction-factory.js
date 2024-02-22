(function()
{
    var createModel = function(actionModel, actionOptions, wfModel, stepModel)
    {
        // Reference self as the action model we're extending
        var self = actionModel;

        // Setup model defaults and extend from loaded config
        var defaults =
        {
            // Your custom config is passed in this object
            config:
            {
                probabilityVariable: null,
                impactVariable: null
            },
            
            // The list of connections as persisted
            connections: {}
        };
        var options = $.extend(true, {}, defaults, actionOptions);

        // EXAMPLE: Extend the action model with custom model
        self.config.probabilityVariable = ko.observable(options.config.probabilityVariable);
        self.config.impactVariable = ko.observable(options.config.impactVariable);

        // EXAMPLE: Extend the action model validation
        self.validation.probabilityVariable = Validator.required(self, self.config.probabilityVariable, "Specify variable holding probability");
        self.validation.impactVariable = Validator.required(self, self.config.impactVariable, "Specify variable holding impact");

        self.actionModelErrorCount = ko.pureComputed(() =>
        {
            var fails = 0;
            if( self.validation.probabilityVariable()) fails++;
            if( self.validation.impactVariable()) fails++;
            return fails;
        });

        // EXAMPLE: Store non config model properties in the action
        // You normally only need to store things in the action model if you need them outside of the designer widget
        // e.g. to validate the step without the designer widget being loaded
        // self.ui.someThing = true;

        // EXAMPLE: Reference and track variable selections
        // Be aware that variable tracking creates a subscription, so any `trackVariable`'s must be disposed
        self.ui.probabilityVariable = self.trackVariable(self.config.probabilityVariable, "/Number");
        self.ui.impactVariable = self.trackVariable(self.config.impactVariable, "/Number");

        // EXAMPLE: force addition of outlets to an action of this type
        //          NOTE the outlet label can be observable to keep in sync in the diagram
        self.addAvailableOutlet("risk-high", "High risk");
        self.addAvailableOutlet("risk-med", "Medium risk");
        self.addAvailableOutlet("risk-low", "Low risk");
    };

    var dispose = function(actionModel)
    {
        var self = actionModel;
        self.ui.probabilityVariable.dispose();
        self.ui.impactVariable.dispose();
    };

    return {
        createModel: createModel,
        dispose: dispose
    };
})();