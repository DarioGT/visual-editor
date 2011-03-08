Ext.ns('Ext.game');

function Point(x, y){
    return {
        x: x,
        y: y,
        move: function(dx, dy){
            this.x += dx;
            this.y += dy;
        }
    }
};

Raphael.fn.inch = {
    size: 1,
    setSize: function(val){
        this.inch.size = val
    },
    circle: function(c, r){
        var s = this.inch.size;
        return this.circle(c.x*s, c.y*s, r*s);
    },
    rect: function(t, w, h){
        var s = this.inch.size;
        return this.rect(t.x*s, t.y*s, w*s, h*s);
    },
    point: function(t){
        var s = this.inch.size;
        return this.rect(t.x*s, t.y*s, 1, 1);        
    },
    getPointForCoorinates: function(x, y){
        var offset = $(this.canvas).offset();
        return Point((x-offset.left) / this.inch.size, (y-offset.top) / this.inch.size)
    },
    pxToInch: function(val){
        return val / this.inch.size;
    }
};

Ext.game.Scene = function(container, width, height, config){
    config = config || {};
    this.width = width;
    this.height = height;
    this.paper = Raphael(container.dom, container.getWidth(), container.getHeight());
    Ext.apply(this, config);
    Ext.game.Scene.superclass.constructor.call(this);
    this.initComponent();
};

Ext.ux.SceneContextMenu = Ext.extend(Ext.menu.Menu, {
    scene: null,
    initComponent: function(){
        var config = {
            items: [{
                iconCls: 'show-detail',
                text: 'Set inch size',
                handler: function(item, e){
                    Ext.Msg.prompt('Set size', 'Please enter inch size in pixels:', function(btn, text){
                        var size = text-0;
                        size && this.parentMenu.scene.setInchSize(size);
                    }, this);
                }                
            },{
                text: 'Create',
                handler: function(item, e){
                    var scene = this.parentMenu.scene;
                    var center = scene.paper.inch.getPointForCoorinates(e.xy[0], e.xy[1]);

                    Ext.Msg.prompt('Enter name of unit', 'Please enter name:', function(btn, text){
                        var u = new Ext.game.Unit({
                            center: center,
                            name: text,
                            borderWidth: false
                        });                        
                        scene.add(u);
                        u.render();
                    }, this);
                }
            }]            
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        Ext.ux.SceneContextMenu.superclass.initComponent.call(this);        
    }    
});

Ext.ux.GroupsStore = new Ext.data.ArrayStore({
    id: 0,
    storeId: 'groups-store',
    fields: [
        'obj',
        'name'
    ],
    addGroup: function(group){
        this.add(new this.recordType({
            'obj': group,
            'name': group.name
        }, group.name));
    },
    getGroupByName: function(name){
        var i = this.find('name', name);
        if (i !== -1){
            return this.getAt(i).get('obj')
        }
        return null;
    }
});

Ext.extend(Ext.game.Scene, Ext.util.Observable, {
    inchSize: 10,
    top: Point(0, 0),
    objects: new Ext.util.MixedCollection(),
    selectedObj: new Ext.util.MixedCollection(),
    waitForTarget: null,
    menuConstructor: Ext.ux.SceneContextMenu,
    initComponent: function(){
        this.menu = new this.menuConstructor({
            'scene': this
        });
        
        this.setTop(this.top);
        this.setInchSize(this.inchSize);
        
        Ext.fly(this.paper.canvas).on('contextmenu', this.onConetextMenu, this);
    },
    setWaitingForTarget: function(obj){
        this.waitForTarget = obj;
    },
    onConetextMenu: function(e){
        this.setWaitingForTarget(null);
        if ( ! e.isDirty){
            ( ! this.selectedObj.getCount()) && this.menu.showAt(e.getXY());
            this.setSelected(null);
        }
        e.isDirty = false;
        e.preventDefault();
    },
    onDragStop: function(){
        this.selectedObj.each(function(item){
            item.onDragStop();   
        });
    },
    onDragMove: function(dx, dy){
        this.selectedObj.each(function(item){
            item.onDragMove(dx, dy);
        });
    },
    onDragStart: function(){
        this.selectedObj.each(function(item){
            item.onDragStart();
        });        
    },    
    clearSelect: function(){
        this.selectedObj.each(function(item){
            item.onUnselect();
        });
        this.selectedObj.clear();
    },
    selectGroup: function(group, append){
        ( ! append) && this.clearSelect();

        group.objects.each(function(item){
            this.setSelected(item, true);
        }, this);
    },
    setSelected: function(obj, append){
        append = append || false;
        
        if ( ! obj ){
            this.clearSelect();
            return;
        }
        
        
        if (this.selectedObj.contains(obj)) {
            if (append){
                this.selectedObj.remove(obj);
                obj.onUnselect();
            }
            return;
        }
        
        if (this.waitForTarget) {
            this.waitForTarget.onTarget(obj);
        }else {
            this.setWaitingForTarget(null);
            ( ! append) && this.clearSelect();
            this.selectedObj.add(obj);
            obj.onSelect();
        };
    },
    setRealSize: function(){
        this.paper.setSize(this.width * this.inchSize, this.height * this.inchSize);
    },
    setTop: function(point){
        this.top = point;
        $(this.paper.canvas).css('marginTop', this.top.x).css('marginLeft', this.top.y);
    },
    add: function(obj){
        this.objects.add(obj.id, obj);
        obj.setScene(this);
    },
    setInchSize: function(val){
        this.inchSize = val;
        this.paper.inch.setSize(val);
        this.setRealSize();
        this.render();
    },
    render: function(){
        this.setWaitingForTarget(null);
        this.setSelected(null);
        this.paper.clear();
        this.renderGrid();
        this.objects.each(function(item, index, length){
            item.render();
        }, this);  
    },
    renderGrid: function(){
        for (var i=0; i < this.width; i+=10){
            for (var j=0; j < this.height; j+=10){
                var p = this.paper.inch.point(Point(i, j));
                p.attr({'opacity': 0.4});
            }            
        }
    }    
});

Ext.ux.Group = function(config){
    config = config || {};
    Ext.apply(this, config);
    Ext.ux.Group.superclass.constructor.call(this);
    this.initComponent();
};

Ext.ux.Group = Ext.extend(Ext.ux.Group, Ext.util.Observable, {
    name: '',
    color: '#00f',
    initComponent: function(){
        this.objects = new Ext.util.MixedCollection();
    },
    add: function(){
        for (var i=0,len=arguments.length; i<len; i++){
            if ( ! this.objects.contains(arguments[i])){
                this.objects.add(arguments[i]);
                arguments[i].addToGroup(this);                
            }
        }
    }
});
