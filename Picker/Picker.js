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
 */

$.WCN_Picker = {};

(function(host) {

  "use strict";




  // --- the constructor called from the jQuery plugin                   --- //
  var WCN_Picker = function(settings) {
    this._$select2 = $(settings.target);
    this._$rootEl = this._$select2.wrap("<div class='wcn_picker_main_container'></div>").parent();
    this._$listRoot = this._$rootEl.append("<div class='wcn_picker_list_container'></div>").children(":last");
    this._$clone = this._cloneSelect();
    this._closeOnSelect = (typeof settings.closeOnSelect === "boolean") ? settings.closeOnSelect : true;

    var select2_defaultOptions = {
      closeOnSelect: this._closeOnSelect,
      placeholder  : "Select an option"
    };
    this._$select2.select2( $.extend( {}, select2_defaultOptions,  WCN.baseConfig.select2) );

    // events handlers
    var _this = this;

    this._$select2.on("change", function(e) { 
      _this._$select2.select2("val", "");
    });

    this._$select2.on("select2-selecting", function(e) {
      var $opt = $( e.object.element[0] );
      var $opt_clone = _this._findCorrispectiveOnClone($opt);

      // renders the selected item onto the list
      var opt_id = $opt.attr("id");
      var opt_lbl = $opt.prop("label");
      var $optgrp = $opt.parent();
      var optgrp_id = $optgrp.attr("id");
      var optgrp_lbl = $optgrp.prop("label");

      var item = {
        id        : optgrp_id ? optgrp_id + "_" + opt_id : opt_id,
        label     : optgrp_lbl.length > 0 ? optgrp_lbl + " --> " + opt_lbl : opt_lbl,
        $opt      : $opt,
        $optgrp   : $optgrp,
      };
      
      var isAlreadyThere = _this._isAlreadyInTheList( item );

      if( !isAlreadyThere ) {
        _this._addItemToList( item );

        // the selected item gets hidden in the select2's dropdown
        $opt.addClass("wcn_picker_hide");

        // the clone's option is selected
        $opt_clone.attr("selected", "selected");      
      }

      if( !_this._closeOnSelect) {
        // this seems to prevent the dropdown to close...
        // TODO double check why!
        e.preventDefault();
      }
    });

    // TODO I could move this into the method _addItemToList but I like to
    // have all the events handlers listed here.
    // Anyway on is not the best for performances...
    this._$listRoot.on("button.wcn_picker_delbtn").click( function(e) {
      var $row = $(e.target.parentNode);
      var $opt = $row.data("wcn_picker_item").$opt;
      var $opt_clone = _this._findCorrispectiveOnClone($opt);

      // removes the item rendered on the list
      $row.remove();
      // show back the option in the select2's drop down
      $opt.removeClass("wcn_picker_hide");
      // deselect the option in the clone select
      $opt_clone.removeAttr("selected");

      // updates the css class applied to even/odd rows
      for(var i = 0, all = _this._$listRoot.children(), $item; ($item = all[i]); i++) {
        $item = $( $item );
        $item.removeClass("wcn_picker_row_even wcn_picker_row_odd");
        $item.addClass( "wcn_picker_row_" + (i%2 ? "odd" : "even") );
      }
    });

  };

  WCN_Picker.prototype._isAlreadyInTheList = function( item ) {
    var all = this._$listRoot.children();
    var isAlreadyThere = false;

    for(var i = 0, it; (it = all[i]); i++) {
      it = $.data(it, "wcn_picker_item");
      // TODO JSON is not crossbrowser
      if( JSON.stringify( item ) === JSON.stringify( it ) ) {
        return true;
      }
    }
    return false;
  };
  
  WCN_Picker.prototype._addItemToList = function(item) {
    var $rowEl = $( 
          "<div "
        +   "class='list-group-item wcn_picker_row wcn_picker_row_" + (this._$listRoot.children().length%2 ? "even" : "odd") + "'"
        +   "data-id = '" + item.id + "'"  
        + ">"
        +   "<div>" + item.label + "</div>"
        +   "<button type='button' class='close wcn_picker_delbtn'> <span aria-hidden='true'>×</span> </button>"
        + "</div>");

    $rowEl.data("wcn_picker_item", item);

    this._$listRoot.append( $rowEl );
  };

  WCN_Picker.prototype._cloneSelect = function() {

    var id = this._$select2.attr("id") + "_clone";
    var name = this._$select2.attr("name");
    var $clone = $("<select id=" + id + " name=" + name + " multiple ></select>")
      .hide()
      .insertAfter( this._$select2 )
      .html( this._$select2.html() );
    this._$select2.attr( "name", this._$select2.attr("name") + "_not_submitted" );

    return $clone;
  };

  WCN_Picker.prototype._findCorrispectiveOnClone = function($opt) {
    return $( this._$clone.find("option")[ $opt.index() ] );
  }

  host.WCN_Picker = WCN_Picker;




  // --- the jQuery plugin                                               --- //
  ;(function($){
    $.fn.extend({
      WCN_Picker: function(options) {
        if( typeof options !== "object" ) {
          options = {};
        }

        var defaultOptions = {
          closeOnSelect: true 
        };

        return this.each(function() {
          var $this = $(this);
          var settings = $.extend({target: $this}, defaultOptions, options);
          new host.WCN_Picker(settings);
        });
      }
    });
  })(host);




})( jQuery );
