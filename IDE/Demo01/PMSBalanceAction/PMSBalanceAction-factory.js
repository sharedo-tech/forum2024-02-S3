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
                deltaAmount: 0,
                pmsReferenceVariable: null
            },
            
            // The list of connections as persisted
            connections: {}
        };
        var options = $.extend(true, {}, defaults, actionOptions);

        // EXAMPLE: Extend the action model with custom model
        self.config.deltaAmount = ko.observable(options.config.deltaAmount);
        self.config.pmsReferenceVariable = ko.observable(options.config.pmsReferenceVariable);

        // EXAMPLE: Extend the action model validation
        self.validation.pmsReferenceVariable = Validator.required(self, self.config.pmsReferenceVariable, "Choose variable holding PMS reference");

        self.actionModelErrorCount = ko.pureComputed(() =>
        {
            var fails = 0;
            if (self.validation.pmsReferenceVariable()) fails++;
            return fails;
        });

        // EXAMPLE: Store non config model properties in the action
        // You normally only need to store things in the action model if you need them outside of the designer widget
        // e.g. to validate the step without the designer widget being loaded
        // self.ui.someThing = true;

        // EXAMPLE: Reference and track variable selections
        // Be aware that variable tracking creates a subscription, so any `trackVariable`'s must be disposed
        self.ui.pmsReferenceVariable = self.trackVariable(self.config.pmsReferenceVariable, "/String");
    };

    var dispose = function(actionModel)
    {
        var self = actionModel;
        self.ui.pmsReferenceVariable.dispose();
    };

    return {
        createModel: createModel,
        dispose: dispose
    };
})();