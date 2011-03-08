Ext.ns('Ext.game');

Ext.game.GameObject = function(config){
    config = config || {};
    Ext.apply(this, config);
    Ext.game.GameObject.superclass.constructor.call(this);
    this.initComponent();
};

Ext.extend(Ext.game.GameObject, Ext.util.Observable, {
    name: '',
    scene: null,
    id: null,
    el: null,
    group: null,
    center: Point(0, 0),
    radius: 1,
    color: '#EA2A1B',
    selectColor: '#FFEA3B',
    borderWidth: 2,
    enableDD: true,
    initComponent: function(){},
    addToGroup: function(group){
        this.group = group;
    },
    setScene: function(scene){
        this.scene = scene;
    },
    render: function(){
        this.el = this.scene.paper.set();
        var c = this.scene.paper.inch.circle(this.center, this.radius);
        c.attr({'fill': this.color})
        this.el.push(c);
        this.drawBorder();        
        this.initToolTip();
        this.initEvents();
        this.initDD();
    },
    getToolTipConfig: function(){
         return {
             text: this.name
         };
    },
    initDD: function(){
        //I'm not sure that call GameObject.onDragStop and other from Scene is good
        //but this way dragging of all selected object works good
        this.el.drag(
            function(dx, dy){
                this.scene.onDragMove(dx, dy);
            }, function(){
                this.scene.onDragStart();
            }, function(){
                this.scene.onDragStop();
            }, this, this, this);
    },
    onDragStop: function(){
        if ( ! this.enableDD) return;
        this.el.attr({opacity: 1});
        this.el.ocenter = null;
    },
    onDragMove: function(dx, dy){
        if ( ! this.enableDD) return;
        var dxi = this.scene.paper.inch.pxToInch(dx);
        var dyi = this.scene.paper.inch.pxToInch(dy)
        this.center = Point(this.el.ocenter.x+dxi, this.el.ocenter.y+dyi);
        var items = this.el.items;
        for(var i=0,len=items.length; i<len; i++){
            items[i].attr({cx: items[i].ox + dx, cy: items[i].oy + dy});
        }
    },
    onDragStart: function(){
        if ( ! this.enableDD) return;
        var items = this.el.items;
        this.el.ocenter = this.center;
        for(var i=0,len=items.length; i<len; i++){
            items[i].ox = items[i].attr("cx");
            items[i].oy = items[i].attr("cy");
        }
        this.el.attr({opacity: 0.3});
    },
    initToolTip: function(){
        var config = this.getToolTipConfig();
        if (config){
            $(this.el.items[0].node).attr('qtip', config['text']);          
        }
    },
    initEvents: function(){
        this.el.click(this.onClick, this);
        Ext.fly(this.el.items[0].node).on('contextmenu', function(e){
            e.isDirty = true; 
            this.onClick(e);
            this.onContextMenu(e);
        }, this);
    },
    onContextMenu: function(e){
        if (this.menu){
            this.menu.obj = this;
            this.menu.showAt(e.getXY());
        }
    },
    onDblClick: function(e){
        console.log('onDblClick')
        this.group && this.scene.selectGroup(this.group, e.ctrlKey);
    },
    onClick: function(e){
        if (e.shiftKey){
            this.onDblClick(e);
        }else{
            this.scene.setSelected(this, e.ctrlKey);
        }
    },
    drawBorder: function(){
        if (this.group){
            this.el.attr({'stroke': this.group.color, 'stroke-width': this.borderWidth})
        }else{
            this.el.attr({'stroke': 'none'});
        }        
    },    
    onSelect: function(){
        this.el.attr({'stroke': this.selectColor, 'stroke-width': this.borderWidth});        
    },
    onUnselect: function(){
        this.drawBorder();        
    }        
});

Ext.ux.UnitContextMenu = Ext.extend(Ext.menu.Menu, {
    obj: null,
    initComponent: function(){
        var config = {
            items: [{
                iconCls: 'show-detail',
                text: 'Select target',
                handler: function(item, e){
                    var unit = this.parentMenu.obj;
                    unit.scene.setWaitingForTarget(unit);
                }                
            }]            
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        Ext.ux.UnitContextMenu.superclass.initComponent.call(this);        
    }    
});

Ext.game.Unit = Ext.extend(Ext.game.GameObject, {
    moveDistance: 5,
    moveDistanceEl: null,
    menu: new Ext.ux.UnitContextMenu(),
    onSelect: function(){
        Ext.game.Unit.superclass.onSelect.apply(this, arguments);
        this.moveDistanceEl = this.scene.paper.inch.circle(this.center, this.moveDistance);
        this.el.push(this.moveDistanceEl);
        var propGrid = Ext.getCmp('unit-properties-grid');
        propGrid && propGrid.setUnit(this);
    },
    onUnselect: function(){
        Ext.game.Unit.superclass.onUnselect.apply(this, arguments);
        this.el.items.remove(this.moveDistanceEl);
        this.moveDistanceEl.remove();
        this.moveDistanceEl = null;
    },
    onTarget: function(target){
        alert('Traget for '+this.name+' is '+target.name);
    },
    getProperties: function(){
        return {
            'name': this.name,
            'group': this.group && this.group.name || '',
            'enableDD': this.enableDD
        }
    },
    setProperties: function(props){
        this.name = props['name'];
        this.enableDD = props['enableDD'];
        var group = Ext.ux.GroupsStore.getGroupByName(props['group']);
        group && group.add(this);
        this.initToolTip();
    }
});
