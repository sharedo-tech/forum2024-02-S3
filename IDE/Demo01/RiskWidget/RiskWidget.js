namespace("Demo01");

/**
 * Constructor for your widget - remember the name of this JS type must match the ID of the widget in it's .widget.json manifest
 * @param {} element            The Html DOM element to which this widget will bind
 * @param {} configuration      The configuration passed in from the designer/config
 * @param {} baseModel          The base widget model (contains unique id etc)
 * @returns {} 
 */
Demo01.RiskWidget = function(element, configuration, baseModel)
{
    var self = this;
    var defaults =
    {
        // id can be passed as a param during widget creation, or will default to the current sharedo Id if not set
        id: null,

        // Model items from the designer widget
        todoMessage: null
    };
    
    var options = $.extend(true, {}, defaults, configuration);

    // Default the ID from the current sharedo portal if not passed in
    if (!options.id && $ui && $ui.pageContext && $ui.pageContext.sharedoId)
    {
        options.id = $ui.pageContext.sharedoId();
    }

    // Setup the local model
    self.model =
    {
        // Remember, only things that might change need to be observable!
        id: options.id,
        todoMessage: options.todoMessage,
        probability: ko.observable(0),
        impact: ko.observable(0),
        risk: ko.pureComputed(() =>
        {
            return self.model.impact() * self.model.probability()
        })
    };
    
    self.ui =
    {
        riskLabel: ko.pureComputed(() =>
        {
            let risk = self.model.risk();
            if( risk <= 30 ) return `Risk is low (${risk}%)`;
            if( risk > 30 && risk < 70 ) return `Risk is medium (${risk}%)`;
            return `Risk is high (${risk}%)`;
        }),
        riskLabelCss: ko.pureComputed(() =>
        {
            let risk = self.model.risk();
            if( risk <= 30 ) return "risk-green";
            if( risk > 30 && risk < 70 ) return "risk-amber";
            return "risk-red";
        })
    };
    
    // Things I need to clean up
    self.subscriptions =
    [
        $ui.events.subscribe("sharedo.updated", ev =>
        {
            if( ev.id === self.model.id ) self.loadAndBind();
        })
    ];
};

/**
 * Called by the UI framework when this widget is being unloaded - clean up
 * any subscriptions or references here that would keep this instance alive
 */
Demo01.RiskWidget.prototype.onDestroy = function()
{
    var self = this;
    _.each(self.subscriptions, s => $ui.events.unsubscribe(s));
};

/**
 * Called by the UI framework after initial creation and binding to load data
 * into it's model
 */
Demo01.RiskWidget.prototype.loadAndBind = function()
{
    var self = this;

    Demo01.RiskWidgetAgent.loadWorkItem(self.model.id).then(function(data)
    {
        self.model.probability(data.probability);
        self.model.impact(data.impact);
    });
};