namespace("Demo01");

/**
 * Blade constructor - remember the name of this JS type must match the ID of the blade in it's .panel.json manifest
 * @param {} element            // The HTML DOM Element to which this blade model is bound 
 * @param {} configuration      // The configuration passed in from the open blade command
 * @param {} stackModel         // The base blade stack model (contains unique id etc)
 * @returns {} 
 */
Demo01.PMSAuditBlade = function(element, configuration, stackModel)
{
    var self = this;
    var defaults = 
    {
        reference: null    
    };
    var options = $.extend(true, {}, defaults, configuration);

    // Construct the blade model
    self.reference = options.reference;
    self.auditLoaded = ko.observable(false);
    self.audit = [];

    // Store UI concerns
    self.blade = 
    {
        ribbon: null
    };

    self.blade.ribbon = self.createRibbonBar();
};

/**
 * Create the ribbon for the blade
 */
Demo01.PMSAuditBlade.prototype.createRibbonBar = function()
{
    var self = this;

    var ribbon = new Components.Core.RibbonBar.Ribbon(
        {
            alignment: Components.Core.RibbonBar.RibbonAlignment.Right,
            sectionTitles: false
        });

    var section = ribbon.createAddSection("Actions", null, true);
    section.createAddButton("Close", self.discard.bind(self), "btn-danger", "fa-times");
    return ribbon;
};

/**
 * Called by the UI framework when this blade is being unloaded - clean up
 * any subscriptions or references here that would keep this instance alive
 */
Demo01.PMSAuditBlade.prototype.onDestroy = function()
{
    var self = this;
};

/**
 * Called by the UI framework after initial creation and binding to load data
 * into it's model
 */
Demo01.PMSAuditBlade.prototype.loadAndBind = function()
{
    var self = this;
    if( !self.reference ) return;
    
    $ajax.get(`/api/proxy/demo01/_/api/matter/${self.reference}/financials/audit`).then(data =>
    {
        self.audit = data;
        self.auditLoaded(true);
    });
};

/**
 * Called from the ribbon to discard the blade
 */
Demo01.PMSAuditBlade.prototype.discard = function ()
{
    var self = this;
    $ui.stacks.cancel(self);
};
