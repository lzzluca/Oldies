/*
jQuey Picker

* Author:
Luca Lazzarini ( lzzluca@gmail.com http://nerdstuckathome.wordpress.com/ )

* License:
Dual licensed under the MIT (http://mit-license.org/) and GPL (http://www.gnu.org/licenses/gpl.html) licenses.

* On the web:
- https://github.com/lzzluca/MultiSelect/

* Version:
0.9

* Depends:
jQuery framework                 : http://www.jquery.com
jQuery Select2                   : https://github.com/ivaynberg/select2
Bootstrap (for the default style): http://getbootstrap.com/

* Description:
Will follow

* How to build it:
Will follow

* TODO:
Will follow


I wrote it in my current company, WCN (wcn.co.uk), and i was allowed to release it as open source. Thank you (particularly to Jack Hobson)!
*/

/**
 * Usage example:
 *
 * var options = {
 *   closeOnSelect: true    // when true, the dropdown closes when an item is selected
 * };
 *
 * var myList = new $(any_selector_for_a_select).WCN_Picker({ options });
 *
 *
 *
 *
 * Design:
 *
 * The MVC pattern is behind the plugin implementation; the model is the
 * list of items selected on the select2 (so it is an empty list at the 
 * beginning).
 * The views interact with the model, adding or removing items on it.
 * There are: 
 * a view for handle the select2, to add the selected items to the
 *   model and hide them from the select2's dropdown
 * a view for handle the list: the items added to the model are rendered to
 *   the list too. Every item rendered provides also a "Delete" button,
 *   to delete that item from the list and from the model too.
 * a view for handle the "clone select": a select as clone of the "target select"
 *   is generated (as multiple). The options selected on it are the same items
 *   specified on the model. This clone select gets the name of the target one,
 *   to be "confused" as it on the submit.
 * 
 * Views resume:
 * |__ PickerView_select2 => add items onto the model
 * |__ PickerView_list    => delete items on the model
 * |__ PickerView_clone   => doesn't manipulate the model
 */

$.WCN_Picker_mvc = {};

(function(host) {

  "use strict";




  // --- observer pattern implementation, needed for the MVC pattern     --- //
  // --- @See https://github.com/petermichaux/uMVC/blob/master/uMVC.js   --- //
  var uMVC = {};

  uMVC.Model = function() {
    this._observers = [];
  };
  uMVC.Model.prototype.observe = function(observer) {
    this._observers.push(observer);
  };
  uMVC.Model.prototype.notify = function(data) {
    var observers = this._observers.slice(0);
    for (var i = 0, ilen = observers.length; i < ilen; i++) {
      observers[i].update(data);
    }
  };

  host.uMVC = uMVC;




  // --- the model for the Picker                                        --- //
  var PickerModel = function() {
    this._list = []; 
    uMVC.Model.call(this);  
  };
  PickerModel.prototype = new uMVC.Model();

  PickerModel.prototype.add = function(item) {
    if( typeof item !== "object" ) {
      item = {};
    }

    for(var i = 0, it, all = this.getAll(), isAlreadyThere = false; (it = all[i]); i++) {
      // TODO JSON is not cross-browser!!
      if( JSON.stringify( it ) === JSON.stringify( item ) ) {
        isAlreadyThere = true;
        return;
      }
    }

    this._list.push( item );
    this.notify();
    return item;
  };

  PickerModel.prototype.remove = function(item) {
    if( typeof item !== "object" ) {
      return;
    }

    for(var i = 0, it; (it = this._list[i]); i++) {
      if( item === it ) {
        this._list.splice(i, 1);
        this.notify();
        return item;
      }
    }
  };

  PickerModel.prototype.getAll = function() {
    return [].concat( this._list );
  };

  host.PickerModel = PickerModel;




  // --- the controller for the Picker                                   --- //
  var PickerController = function(model, view) {
    if( !(model instanceof host.PickerModel) ) {
      model = new host.PickerModel();
    }
    if( !(view instanceof host.PickerView_list) && !(view instanceof host.PickerView_select2) && !(view instanceof host.PickerView_clone)) {
      throw new Error("WCN_Picker->PickerController: the parameter view is not what expected");
    }

    this._model = model;
    this._view = model;
  };

  PickerController.prototype.addItem = function(item) {
    return this._model.add( item );
  };
  
  PickerController.prototype.removeItem = function(item) {
    return this._model.remove( item );
  };

  host.PickerController = PickerController;




  // --- the Picker's view to delete items from the model                --- //
  var PickerView_list = function(model, rootEl) {
    if( !(model instanceof host.PickerModel) ) {
      model = new host.PickerModel();
    }

    var $rootEl = $(rootEl);
    if( typeof $rootEl.get(0).tagName === "undefined" ) {
      throw new Error("WCN_Picker->PickerView_list: the specified root element is not a DOM element");
    }

    // view's properties
    this._model = model;
    this._controller = new PickerController(this._model, this);
    this._$listRoot = $rootEl.append("<div class='wcn_picker_list_container'></div>").children(":last");

    var _this = this;
    // I could move this into the method update but I like to have all the
    // events handlers listed here.Anyway not the best for performances...
    this._$listRoot.on("button.wcn_picker_delbtn").click( function(e) {
      var $row = $(e.target.parentNode);
      var item = $row.data("wcn_picker_item");
      _this._controller.removeItem( item );
    });
  };

  PickerView_list.prototype.update = function(updItems) {
    this._$listRoot.html("");

    for(var i = 0, $rowEl, item, all = this._model.getAll(); (item = all[i]); i++) {
      $rowEl = $( "<div "
                +   "class='list-group-item wcn_picker_row wcn_picker_row_" + (i%2 ? "even" : "odd") + "'"
                +   "data-value = '" + item.id + "'"  
                + ">"
                +   "<div>" + (item.label) + "</div>"
                +   "<button type='button' class='close wcn_picker_delbtn'> <span aria-hidden='true'>×</span> </button>"
                + "</div>");

      $rowEl.data("wcn_picker_item", item);

      this._$listRoot.append( $rowEl );
    }
  };

  host.PickerView_list = PickerView_list;




  // --- the Picker's view to add items to the model (by the select2)    --- //
  var PickerView_select2 = function(model, rootEl, closeOnSelect) {
    if( !(model instanceof host.PickerModel) ) {
      model = new host.PickerModel();
    }

    var $rootEl = $(rootEl);
    if( typeof $rootEl.get(0).tagName === "undefined" ) {
      throw new Error("WCN_Picker->PickerView_select2: the specified root element is not a DOM element");
    }

    this._model = model;
    this._controller = new PickerController(this._model, this);
    this._$select2 = $rootEl.find("select");
    this._closeOnSelect = (typeof closeOnSelect === "boolean") ? closeOnSelect : true;

    var select2_defaultOptions = {
      closeOnSelect: this._closeOnSelect,
      placeholder  : "Select an option"
    };
    this._$select2.removeAttr("multiple");
    this._$select2.select2( $.extend( {}, select2_defaultOptions, WCN.baseConfig.select2) );

    // events handlers
    var _this = this;

    this._$select2.on("change", function(e) { 
      _this._$select2.select2("val", "");
    });

    this._$select2.on("select2-selecting", function(e) {
      var $opt = $( e.object.element[0] );
      var opt_lbl = $opt.prop("label"); 
      var optgrp_lbl = $opt.parent().prop("label"); 
      // add the item to the model
      _this._controller.addItem({
        id        : $opt.parent().attr("id") + "_" + $opt.attr("id"),
        label     : optgrp_lbl.length > 0 ? optgrp_lbl + " --> " + opt_lbl : opt_lbl,
        index     : $opt.prop("index")
      });

      if( !_this._closeOnSelect) {
        // this seems to prevent the dropdown to close...
        // TODO double check why!
        e.preventDefault();
      }
    });
  };

  // this view is the one that adds items to the model: because of that,
  // the update method (called when the model is updated) wasn't really
  // necessary. Anyway I think like that, it is "uniformed" with the other
  // views
  PickerView_select2.prototype.update = function() {
    // reset the select's selection: I would like this select to be not
    // submitted, so I keep its options not selected
    this._$select2.prop("selectedIndex", "-1");
    this._$select2.find(".wcn_picker_hide").removeClass("wcn_picker_hide");
    
    var allItems = this._model.getAll();
    var allOpts = this._$select2.find("option");

    for(var i = 0, item, $opt; (item = allItems[i]); i++) {
      $opt = $( allOpts[ item.index ] );
      $opt.addClass("wcn_picker_hide");
    }
  }

  host.PickerView_select2 = PickerView_select2;




  // --- the view for the Picker (the clone select - as the copy of the 
  //     original one - that gets submitted                              --- //
  var PickerView_clone = function(model, target) {
    if( !(model instanceof host.PickerModel) ) {
      model = new host.PickerModel();
    }

    var $target = $(target);
    if( typeof $target.get(0).tagName !== "string" || $target.get(0).tagName.toLowerCase() !== "select" ) {
      throw new Error("WCN_Picker->PickerView_clone: the specified target is not a select");
    }

    // view's properties
    this._model = model;
    this._$target = $target;

    // generates the clone select as copy of the this._$target one
    var id = this._$target.attr("id") + "_clone";
    var name = this._$target.attr("name");
    this._$clone = $("<select id=" + id + " name=" + name + " multiple ></select>")
      .hide()
      .insertAfter( this._$target )
      .html( this._$target.html() );
    this._$target.attr( "name", this._$target.attr("name") + "_not_submitted" );
  };

  PickerView_clone.prototype.update = function(updItems) {
    // reset the selection
    this._$clone.find("option:selected").removeAttr("selected");

    var allItems = this._model.getAll();
    var allOpts = this._$clone.find("option");

    for(var i = 0, item, $opt; (item = allItems[i]); i++) {
      $opt = $( allOpts[ item.index ] );
      $opt.attr("selected", "true");
    }
  };

  host.PickerView_clone = PickerView_clone;




  // --- the final object                                                --- //
  // @See the jQuery plugin - that follows as next - calls this object for 
  // every element from the selector
  var WCN_Picker = function(config) {
    if( typeof config !== "object" ) {
      config = {};
    }
 
    var $target = $(config.target);
    if( typeof $target.get(0).tagName === "undefined" || $target.get(0).tagName.toLowerCase() !== "select" ) {
      throw new Error("WCN_Picker: the target must be a select element!");
    }

    if( $target.data("wcn_picker_applied") ) {
      // TODO console.log is not cross-browser
      console.log( "WCN_Picker: attemp to apply again WCN_Picker to the item: ", $target.get(0) );
      return;
    }

    // inside of here will be built the HTML for the picker
    this._$rootEl = $target.wrap("<div class='wcn_picker_main_container'></div>").parent();

    this.model = new host.PickerModel();
    this.view_list  = new host.PickerView_list(this.model, this._$rootEl, config.showAddBtn, config.AddBtnLabel);
    this.view_select2  = new PickerView_select2(this.model, this._$rootEl, config.closeOnSelect);
    this.view_clone  = new host.PickerView_clone(this.model, this.view_select2._$select2);
    this.model.observe(this.view_list);
    this.model.observe(this.view_select2);
    this.model.observe(this.view_clone);

    $target.data("wcn_picker_applied", true);
  };

  host.WCN_Picker_mvc = WCN_Picker;




  // --- the jQuery plugin                                               --- //
  ;(function($){
    $.fn.extend({
      WCN_Picker_mvc: function(options) {
        this.defaultOptions = {
          closeOnSelect: true 
        };

        var _this = this;
        return this.each(function() {
          var settings = $.extend({target: this}, _this.defaultOptions, options);
          host.WCN_Picker_mvc(settings);
        });
      }
    });
  })(jQuery);




})($.WCN_Picker_mvc);
