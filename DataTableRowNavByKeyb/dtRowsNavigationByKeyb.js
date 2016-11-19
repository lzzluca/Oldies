/**
 * rowNavigationByKeyboard4Datatable
 * This plugin provide row navigation by keyboard.
 * Run it like that:
 * // an universal selector would be ".selectable" in a dt with selection enabled
 * $(yourSelectorForTables).rowsNavigationByKeyb({
 *   // here you define the class to apply to the row, to highlight it! It is not the class applied to select a row! That one is "row_selected", by default
 *   selectedClass: "classToApplyToHighLightARow", 
 *   enterBtnCallback: function() { alert("code executed on the <enter> btn keydown") },
 *   upBtnCallback: function() { alert("code executed on the <up> btn keydown") },
 *   downBtnCallback: function() { alert("code executed on the <down> btn keydown") }
 * })
 *
 */

/**
 * TODO investigate more abut how to integrate the plugin with the jQuery Datatable
 * TableTools (http://datatables.net/extras/tabletools/)
 *
 * The TableTools seems interesting; from what I have got, the API provides a method to select a row (that should care about the selection configuration). Check it here: http://datatables.net/extras/tabletools/api#fnSelect .
 * The behaviour I would expect, from that method, is to allow to select many rows when the multi selection is enabled, only one when the single selection is enabled, to do not select anything when there is not selection enabled.
 *
 * TableTools requires an initialization, like the following, on the dataTable configuration object:
 *
 *   (Multi selection init)
 *   http://datatables.net/release-datatables/extras/TableTools/select_multi.html
 *
 * Also, to integrate it in a system compiled by "use strict", I had to add a little patch on the source:
 *
 *   (This example is true for TableTools v. 2.2.0)
 *   row 748: WCN.TableTools = TableTools
 *      
 * The two points above, plus include more js, are the reasons that are making me not use TableTools at the moment; anyway I find it really interesting and it will be a good thing to check it again.
 */

"use strict";

// TODO how to keep a jquery plugin modular? Investigate this more! 
// I would love to keep my plugin modular and I don't like to use a big wrapper, to define all my modules inside of it.
// So I am creating this object as namespace for all the modules... I don't know if I am really happy with this...
$.dtRowsNavigationCollection = {};

/*
 * @class RowsNavigationCore
 * These are the API to navigate the rows in a generic table, in both directions.
 * The isCycle flag allows to make the navigation cycicle: when the end of the table is reached, the navigation restarting from the beginning
 */
(function(host) {

  host.RowsNavigationCore = function(settings) {
    settings = settings || {};
    this.isCycle = settings.isCycle || false;
  };

  host.RowsNavigationCore.prototype.goUp = function(tr) {
    return this.isCycle ? this._goUpCycle(tr) : this._goUp(tr);
  };

  host.RowsNavigationCore.prototype.goDown = function(tr) {
    return this.isCycle ? this._goDownCycle(tr) : this._goDown(tr);
  };

  host.RowsNavigationCore.prototype._goUp = function(tr) {
    return (tr.nodeName && tr.nodeName.toLowerCase() === "tr") ? tr.previousSibling : undefined;
  };

  host.RowsNavigationCore.prototype._goUpCycle = function(tr) {
    var prevTr = this._goUp(tr);
    if(prevTr === undefined) {
      return; // the goUp checks failed (tr is not a DOM element as tr)!
    }
    if(prevTr === null) {
      return tr.parentNode.lastChild; // the first tr of the body is returned
    }
    return prevTr;
  };

  host.RowsNavigationCore.prototype._goDown = function(tr) {
    return (tr.nodeName && tr.nodeName.toLowerCase() === "tr") ? tr.nextSibling : undefined;
  };

  host.RowsNavigationCore.prototype._goDownCycle = function(tr) {
    var nextTr = this._goDown(tr);
    if(nextTr === undefined) {
      return; // the goUp checks failed (tr is not a DOM element as tr)!
    }
    if(nextTr === null) {
      return tr.parentNode.firstChild; // the first tr of the body is returned
    }
    return nextTr;
  };

 })($.dtRowsNavigationCollection);




/*
 * @class RowsNavigationByKeyb
 * This module is the container for all the logic that involves the keyboard: it uses the navigation core to reach the next row (in the direction specified by button).
 * So, here is where the navigation core is runned by keyboard.
 * */
(function(host) {

  host.RowsNavigationByKeyb = function(settings) {
    host.RowsNavigationCore.apply(this, [settings]);

    settings = settings || {};

    // here are defined the callback executed after a keyboard button is pressed
    this._callbacks = {
      upBtnCallback: ( typeof settings.upBtnCallback === "function" ? settings.upBtnCallback : function(){} ),
      downBtnCallback: ( typeof settings.downBtnCallback === "function" ? settings.downBtnCallback : function(){} ),
      enterBtnCallback: ( typeof settings.enterBtnCallback === "function" ? settings.enterBtnCallback : function(){} )
    };
  };

  host.RowsNavigationByKeyb.prototype = new host.RowsNavigationCore();
  
  host.RowsNavigationByKeyb.prototype._keyMap = {
    ARROW_UP: 38,
    ARROW_DOWN: 40,
    ENTER: 13
  };

  host.RowsNavigationByKeyb.prototype.navigate = function(btnsPressed, target) { // target is only for future use
    var keyMap = this._keyMap,
        ret;

    switch (btnsPressed.keyCode) {
      case keyMap.ARROW_UP:
        ret = this.goUp( this._lastSelected );
        this._callbacks.upBtnCallback(ret);
        return ret;
        break;
      case keyMap.ARROW_DOWN:
        ret = this.goDown( this._lastSelected );
        this._callbacks.downBtnCallback(ret);
        return ret;
        break;
      case keyMap.ENTER:
        this._callbacks.enterBtnCallback( this._lastSelected );
        break;
      default:
    } 
  };

})($.dtRowsNavigationCollection);
  



 
/*
 * @class RowsSelection
 * This module is the container for the logic that involves the selection: the target table, the last selected row, the css class to apply to the selected row.
 * For a future, an eventual RowsNavigationByMouse would share the target table, the last selected row, etc. here, with the RowsNavigationByKeyb (or others).
 * Think about this module as the one where the selection happens.
 * */
(function(host) {

  host.RowsSelection = function(settings) {
    host.RowsNavigationByKeyb.apply(this, [settings]);
    settings = settings || {};

    this.$targetTable = $(settings.targetTable);
    this.targetTable = this.$targetTable.get(0);

    if(!this.targetTable || this.targetTable.nodeName.toLowerCase() !== "table") {
      throw new Error("KeyTableByRows - init: the target DOM element specified is not a table.");
    }

    // setting up properties

    this._selectedClass = " " + (settings.selectedClass || "selected");
    // reference to the (eventual) previously selected tr TODO should be the first, the last...?
    this._lastSelected = this.targetTable.getElementsByClassName( this._selectedClass  )[0] || this.targetTable.tBodies[0].firstChild; 

    if( this._lastSelected === this.targetTable.tBodies[0].firstChild ) {
      this._lastSelected.className =+ " " + this._selectedClass;
    }

    this._initialize();
  };

  host.RowsSelection.prototype = new host.RowsNavigationByKeyb();

  host.RowsSelection.prototype._initialize = function() {
    var _this = this;
    
    // HTML table settings and event handlers attaching
 
    this.targetTable.tabIndex = 0; // this is required to make the DOM table listen to the keyboard (for example in FireFox)

    // TODO keydown shouldn't be cross browser!
    this.$targetTable.keydown(function(e) { 
      _this._actions.onKeyDown.apply(_this, [e]);
    });

    this.$targetTable.click(function(e) {
      _this._actions.onClick.apply(_this, [e]);
    });

    this.$targetTable.click(function(e) {
      _this.targetTable.focus();
    });

    // the table needs the focus to listen to the keydown!
    this.targetTable.focus();
  };

  // IMPORTANT
  // actions, as event handlers, for the table DOM element.
  // They are designed to be attached to the listeners like this: 
  // DOMEl.click( function(e) {
  //   this._actions.myAction.apply(this, [e]);
  // });
  // In that way "this" is the object's instance
  host.RowsSelection.prototype._actions = {
    onKeyDown: function(e) {
      var candidate = this.navigate( this._getButtonsPressed(e), e.target || e.targetElement );
      this.selectRow(candidate);
    },
    // TODO the idea of click is to set up the clicked row as _lastSelected and also to give the focus to the table... to be continued
    onClick: function(e) {
      //this._lastSelected = e.target || e.targetElement;
      this.targetTable.focus();
    }
  };

  host.RowsSelection.prototype.selectRow = function(candidate) {
    if(!candidate || !candidate.nodeName || candidate.nodeName.toLowerCase() !== "tr") {
      return;
    }

    if(this._lastSelected) {
      // remove the selection from the previous visited cell
      this._lastSelected.className = this._lastSelected.className.replace( new RegExp(this._selectedClass, 'g'), "" );
    }

    // update the reference with the current visited cell
    this._lastSelected = candidate;

    // selection toggling
    if( this._lastSelected.className.match(this._selectedClass) ) {  
      this._lastSelected.className = this._lastSelected.className.replace( new RegExp(this._selectedClass, 'g'), "" );
    } else {
      this._lastSelected.className += this._selectedClass;   
    }

    this._centerSelection();
  };

  /**
   * This method purpose is to keep the selected row visible to the user: the scroll could hide it.
   * Now... there are many ways to do that; probably the first idea is to pilot the scroll, to center the selection accordingly. But how to know which element is scrolling? The scroll could be on the grid container (or even on the tbody, for a not crossbrowser case), on the window, on a different container. Maybe there is no scroll. Too many options and I also think would be a pain to write it, even knowing the scrolling element. That, plus my laziness, I am looking for other ways.
   * My favourite option would be the browser iteself to center the selection, without write any code for it. So, the first thing that comes in my mind is to use the focus: if I could get an input element inside a row's children, I could focus it and get the scroll centered. Anyway I cannot be sure to find an input element in that position, so I would avoid that; I don't want to add it manually. 
   * The way I have choosen is to focus the first td element of the row: I am sure to find at least one in a row (if not, that row is - I assume - not something that the user would select). TODO Check if the solution is crossbrowser, I don't think so.
   * Here follows all the trials I have done for the scroll:
   * - this._lastSelected.scrollIntoView(true); // the scroll jumps too much, doesn't look nice.
   *
   * - // this solution is a layout broken! I cannot hide the input by "display: none"
   *   var ciao = this._lastSelected.firstChild.appendChild( document.createElement("input") );
   *   ciao.style.cssText = "width: 1px; height: 1px;";
   *   WCN.ciao.focus();
   *
   * - // the scroll jumps too much to center the view, doesn't look nice. 
   *   WCN.ciao.name = "ciao";
   *   WCN.ciao.href = "#ciao";
   *   window.location = String(window.location).split("#ciao")[0]; // emm... well... it was just as demo purpose
   *   window.location = window.location + "#ciao"
   *
   * - $(window).scrollTop( $(this._lastSelected).offset().top ); // I was following an asnwer from stackoverflow but the problem wasn't really the same of mine... maybe deserves more investigation? 
   *
   *   Good to have this method as something "not melt" in the rest of the code because I think it will keep being a kind of work around. Good to be able to quickly change it when the good solution will come.
   */
  host.RowsSelection.prototype._centerSelection = function() {
    this._lastSelected.firstChild.tabIndex = "1";
    this._lastSelected.firstChild.focus();
  };
  
  host.RowsSelection.prototype._getButtonsPressed = function(e) {
    if( typeof e !== "object" || e === null ) {
      e = {};
    }
    return {keyCode: e.keyCode, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey};
  };

})($.dtRowsNavigationCollection);




/**
 * Here runs the checks for the plugin; also, if you want to run any pre - loading operation, this is the right place.
 * This is the only piece of the plugin that goes on $.fn .
 */
(function(host, namespace){

  host.dtRowsNavigationByKeyb = function(settings) {

    if( typeof settings !== "object" || settings === null ) {
      settings = {};
    }

    return this.each(function() {
      var $this = $(this);

      var isTable = $this.get(0) && $this.get(0).nodeName.toLowerCase === "table";
      
      if(!isTable) {
        new Error("KeyTableByRows - rowsSelectionByKeyb: the specified target is not a table."); 
      }

      // in the end, this just run the plugin pre - setted for the jQuery Datatable
      return new namespace.RowsSelection({
        targetTable: $this,
        selectedClass: settings.selectedClass,
        upBtnCallback: settings.upBtnCallback,
        downBtnCallback: settings.downBtnCallback,
        enterBtnCallback: settings.enterBtnCallback
      });

    });

  };

})($.fn, $.dtRowsNavigationCollection);
