Ext.ux.MainViewport = Ext.extend(Ext.Viewport, {
    renderTo: Ext.getBody(),
    initComponent: function(){
        var config = {
            layout: 'border',
            defaults: {
                frame: true
            },
            items: [{
                region: 'center',
                id: 'game-panel',
                autoScroll: true,
                html: ''
            },{
                region: 'east',
                layout: 'vbox',
                items: [{
                        html: ('This is demo of base for project for visual editing some diagrams and schemas. '+
                        'I created this to use for one mu idea, so it can do what I need and can\'t waht I don\'t need. '+
                        'These are ExtJs with jQuery adapter and Rafael. '+
                        'All values are in "inch". You can set in with context menu on canvas.'+
                        'You can select item, create, edit, select multiple with CTRL. '+
                        'You can group objects and select all group with SHIFT. '+
                        'With right click on empty you can unselect items or exit from "Select target mode". '+
                        'Also you can drag-n-drop selected items. '+
                        'And the main feature - you can catch bug!'),
                        flex: 1
                    }, new Ext.ux.UnitPropertyGrid({
                        flex: 1
                })],
                width: 250
            }]
        }
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        Ext.ux.MainViewport.superclass.initComponent.apply(this, arguments);
    }//initComponent
});