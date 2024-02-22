namespace("Demo01");

/**
 * Constructor for your widget - remember the name of this JS type must match the ID of the widget in it's .widget.json manifest
 * @param {} element            The Html DOM element to which this widget will bind
 * @param {} configuration      The configuration passed in from the designer/config
 * @param {} baseModel          The base widget model (contains unique id etc)
 * @returns {} 
 */
Demo01.PMSWidget = function(element, configuration, baseModel)
{
    var self = this;
    var defaults =
    {
        // id can be passed as a param during widget creation, or will default to the current sharedo Id if not set
        id: null
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
        id: options.id,
        pmsReference: ko.observable(),
        balance: ko.observable(0)
    };
    
    self.ui =
    {
        balanceFormatted: ko.pureComputed(() =>
        {
            let balance = self.model.balance() || 0;
            return `£${balance.toFixed(2)}`;
        })
    }
};

/**
 * Called by the UI framework when this widget is being unloaded - clean up
 * any subscriptions or references here that would keep this instance alive
 */
Demo01.PMSWidget.prototype.onDestroy = function()
{
    var self = this;
};

/**
 * Called by the UI framework after initial creation and binding to load data
 * into it's model
 */
Demo01.PMSWidget.prototype.loadAndBind = function()
{
    var self = this;

    Demo01.PMSWidgetAgent.loadWorkItem(self.model.id).then(function(data)
    {
        if( !data || !data.pmsReference ) return;
        
        self.model.pmsReference(data.pmsReference);
        
        Demo01.PMSWidgetAgent.getBalances(data.pmsReference).then(function(data)
        {
            self.model.balance(data.balance);
        });
    });
};

Demo01.PMSWidget.prototype.sendToPms = function()
{
    var self = this;
    if( self.model.pmsReference() ) return;
    
    Demo01.PMSWidgetAgent.sendToPms
    (
        self.model.id, 
        { priority: 10, confidential: true, billingArrangements: "No-win, No-fee"}
    ).then(function(data)
    {
        if( !data || !data.pmsReference ) return;
        
        self.model.pmsReference(data.pmsReference);
    });
};

Demo01.PMSWidget.prototype.clearPms = function()
{
    var self = this;
    if( !self.model.pmsReference() ) return;
    
    Demo01.PMSWidgetAgent.clearPms(self.model.id).then(function()
    {
        self.model.pmsReference(null);
        self.model.balance(0);
    });
};

Demo01.PMSWidget.prototype.delta = function(d)
{
    var self = this;
    if( !self.model.pmsReference() || !d ) return;
    
    Demo01.PMSWidgetAgent.sendDelta(self.model.pmsReference(), d).then(data =>
    {
        self.model.balance(data.balance);
    });
};

Demo01.PMSWidget.prototype.viewAudit = function()
{
    var self = this;
    if( !self.model.pmsReference() ) return;
    
    $ui.stacks.cancelAll();
    $ui.stacks.openPanel("Demo01.PMSAuditBlade", { reference: self.model.pmsReference() });
};