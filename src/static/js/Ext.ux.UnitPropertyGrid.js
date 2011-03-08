Ext.ux.UnitPropertyGrid = Ext.extend(Ext.grid.PropertyGrid, {
    title: 'Unit properties',
    unit: null,
    id: 'unit-properties-grid',
    initComponent: function(){
        this.createGroupWindow = new Ext.Window({
            closeAction: 'hide',
            title: 'Create group',
            items: new Ext.ux.CreateGroupForm(),
            modal: true,
            frame: true
        });
        var config = {
            customEditors: {
                'group': new Ext.grid.GridEditor(new Ext.form.ComboBox({
                    mode: 'local',
                    store: Ext.ux.GroupsStore,
                    triggerAction: 'all',
                    selectOnFocus: true,
                    emptyText: 'Select group...',
                    displayField: 'name'
                }))
            },
            tbar: [{
                text: 'Add group',
                handler: this.onAddGroup,
                scope: this
            }]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        Ext.ux.UnitPropertyGrid.superclass.initComponent.call(this);
        this.on('propertychange', this.onPropertyChange, this);
    },
    onPropertyChange: function(source, recordId, value, oldValue){
        this.unit.setProperties(source);
    },
    setUnit: function(unit){
        this.unit = unit;
        this.setSource(unit.getProperties())
    },
    onAddGroup: function(){
        this.createGroupWindow.show();
        /*Ext.Msg.prompt('Create group', 'Please enter group name:', function(btn, text){
            if (text){

            }
        }, this);  */      
    }
});

Ext.ux.CreateGroupForm = Ext.extend(Ext.form.FormPanel, {
    initComponent: function(){
        var config = {
            frame: true,
            items: [{
                fieldLabel: 'name',
                xtype: 'textfield',
                name: 'name'
            },new Ext.form.ColorField({
                filedLabel: 'Color',
                hiddenName:'color',
                showHexValue:true,
                name: 'color'                
            })],
            buttons: [{
                text: 'Save',
                scope: this,
                handler: function(){
                    var form = this.getForm();
                    var values = form.getValues();
                    var group = new Ext.ux.Group(values);
                    Ext.ux.GroupsStore.addGroup(group);
                    form.reset();
                    this.ownerCt.hide();
                }
            }]
        }
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        Ext.ux.CreateGroupForm.superclass.initComponent.call(this);        
    }
});
