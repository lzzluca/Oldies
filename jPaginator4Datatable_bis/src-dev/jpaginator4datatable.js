/*
* jPaginator4Datatable - the jPaginator plugin (http://remylab.github.com/jpaginator/) as paginator for Datatable (http://www.datatables.net/)
*
* Author:
* Luca Lazzarini ( lzzluca@gmail.com http://nerdstuckathome.wordpress.com/ )
*
* Dual licensed under the MIT (MIT-LICENSE.txt)
* and GPL (GPL-LICENSE.txt) licenses.
*
* On the web:
* https://github.com/lzzluca/jPaginator4Datatable/
*
* Version:
* 1.0
*
* Depends:
* jQuery Datatable: https://github.com/lzzluca/jPaginator4Datatable/
* jPaginator: https://github.com/lzzluca/jPaginator4Datatable/
* jQuery framework: http://www.jquery.com/
* Jquery UI (components: core, widget, mouse, slider): http://jqueryui.com
*
* Todo:
* Will follow
*
*
* I built it in my current company, it is WCN (wcn.co.uk), and i was allowed to release it as open source. Thanks (particularly to Jack Hobson)!
*/

/**
 * jpag_and_full plugin
 * The plugin is designed to get, as Datatable's paginator, a mix between the jPaginator plugin and the full_number paginator (the default one); the first will appear on the top, the second on the bottom of the Datatable.
 * The mixed paginator is composed by two classes: $.fn.dataTableExt.oPagination.jpag_and_full (to extend the Datatable paginators list) and jPaginator (as support class). Check the comments of the those classes to know more. 
 * TODO If the class jPaginator could be useful in other parts of the system it should be a standalone file, otherwise it should be a type of $.fn.dataTableExt.oPagination.jpag_and_full!
 */

/**
 * @class jPaginator
 * The class pilots the jPaginator plugin; it changes the behaviour of the "action buttons", making it the same of the full_number's buttons (check the constructor).
 * It also adds one feature: the class is able to calculate the maximum width needed by the "page number cells" (the cells you click on, to move between pages), to display the full number of pages (when you get high numbers like 10000, the number is cutted in the original plugin); check the method _calculateCellWidth.
 * All the other methods are involved in jPaginator HTML generation and setting.
 */

/**
 * @constructor
 * Inside the constructor is defined the var settings, to set the default values, the HTML is generated and the behaviour of the bottons is modified to be the same of the full_number paginator.
 */

var jPaginator = function (oSettings, nPaging, fnCallbackDraw) {

  // i see the object settings more as a property of the "class" jPaginator but the function onPageClicked needs the oSettings object
  // another way is to make a property of oSettings and setting (then you are allowed to read oSettings inside settings) 

  var settings = {
    selectedPage: null,
    nbPages:5, 
    nbVisible: 5,
    minSlidesForSlider: 2, 
    //these properties are valorized in following assignments 
    widthPx: this._minCellW, // this is only an init
    //maxBtnLeft: null,
    //maxBtnRight: null,
    onPageClicked: function(a, num) {
      if ( num - 1 == Math.ceil ( oSettings._iDisplayStart / oSettings._iDisplayLength)) {
        return;
      }
      oSettings._iDisplayStart = ( num - 1) * oSettings._iDisplayLength;
      fnCallbackDraw ( oSettings);
    }
  };

  this._DOMRef = this._getHTML(); // reference to the jPaginator's container (as DOM element)
  $(nPaging).prepend ( this._DOMRef );

  settings.maxBtnLeft = this._DOMRef.find("#m_left");
  settings.maxBtnRight = this._DOMRef.find("#m_right");

  this._DOMRef.jPaginator(settings).addClass( 'jPaginator' );

  // the standard behaviour of the bottons is adjusted here, to align it to the full_number paginator's behaviour

  this._DOMRef.find("#o_left").click(function(){
    if ( oSettings.oApi._fnPageChange( oSettings, "previous" ) ) {
      fnCallbackDraw( oSettings );
    }
  });
  this._DOMRef.find("#o_right").click(function(){
    if ( oSettings.oApi._fnPageChange( oSettings, "next" ) ) {
      fnCallbackDraw( oSettings );
    }
  });
  this._DOMRef.find("#m_left").click(function(){
    if ( oSettings.oApi._fnPageChange( oSettings, "first" ) ) {
      fnCallbackDraw( oSettings );
    }
  });
  this._DOMRef.find("#m_right").click(function(){
    if ( oSettings.oApi._fnPageChange( oSettings, "last" ) ) {
      fnCallbackDraw( oSettings );
    }
  });

};

/**
 * @property {object} _debug The flag to execute the code in debug mode: debug mode allow you to show on the jPaginator the desidered number of pages. Thanks to that, you can check the jPaginator behaviour with high number pages even where you are working with a small pages number Datatable.
 * Properties:
 * - on              : set it as true to work in debug mode 
 * - finals          : here are defined all the final vars
 * - highPagesNumber : set it as true to set the number of page as this.finals.N_PAGES (useful when you need to test the behaviour with a big amount of pages)
 * @type object 
 */

jPaginator.prototype._debug = {
  finals: {
    N_PAGES: 100000
  },
  on: false,
  highPagesNumber: true // set the total number of pages to this.finals.N_PAGES
};

/**
 * @property {object} _ids The ids of the HTML buttons as string; IF YOU GET TWO DATATABLE ON THE SAME PAGES, THE JPAGINATOR NUMBERS WILL HAVE THE SAME ID! TODO
 */

jPaginator.prototype._ids = {
    M_LEFT: "m_left", 
    O_LEFT: "o_left", 
    O_RIGHT: "o_right",
    M_RIGHT: "m_right"
};

/**
 * @property {number} _minCellW The minimum width, in pixel, of the cells (the link that contains the page number)
 */

jPaginator.prototype._minCellW = 18;

/**
 * @property {DOMel} _DOMRef Reference to the root jPaginator's DOM element
 */

jPaginator.prototype._DOMRef = null;

/**
 * @method Update
 * Public
 * Triggers the reset event for the jPaginator. It is supposed to be called at the Datatable fnUpdate, when the Datatable knows the total number of pages. The reset event is a default event of jPaginator.
 */

jPaginator.prototype.Update = function (oSettings, oPaging, fnCallbackDraw, w) {
  /* I am not sure about this condition
  if (!oSettings.aanFeatures.p) {
    return;
  }
  */
  $(this._DOMRef).trigger('reset', { widthPx: w, nbVisible: 5, selectedPage: oPaging.iPage + 1, nbPages: oPaging.iTotalPages});
};

/**
 * @method _getHTML
 * Private
 * Generates the HTML needed to the jPaginator plugin
 * @returns {DOMEl} The root DOM element of the jPaginator
 */

jPaginator.prototype._getHTML = function() {
  return $('<span></span>').html(
                          '<div id="' + this._ids.M_LEFT + '">First</div>' +
                          '<div id="' + this._ids.O_LEFT + '">Prev</div>' +
                          '<div class="paginator_p_wrap">' +
                          '  <div class="paginator_p_bloc">' +
                          '    <!--<a class="paginator_p"></a>-->' + 
                          '  </div>' +
                          '</div>' +
                          '<div id="' + this._ids.O_RIGHT + '">Next</div>' +
                          '<div id="' + this._ids.M_RIGHT + '">Last</div>' +
                          '<div class="paginator_slider ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all">' +
                          '  <a class="ui-slider-handle ui-state-default ui-corner-all" href="#"></a>' +
                          '</div>' ); 
};

/**
 * @method _calculateCellWidth
 * Private
 * Calculates the width needed to do not cut the page number for all the pages (#13684): it happens for high number pages, like 1000. 
 * @returns {DOMEl} The root DOM element of the jPaginator
 */

jPaginator.prototype._calculateCellWidth = function(iTotalPages) {

  var $cell = $( this._DOMRef.find(".paginator_p_bloc").children().get(1) ), // cell it is the first cell but could be a random one
      w_bkp = $cell.width(),
      ret;

  // check the max width for the cell (it is the width of the cell that contains the bigger page number) and store it inside ret

  $cell.html(iTotalPages);
  $cell.width("auto");
  ret = $cell.width();

  // end

  if (ret < this._minCellW) {
    ret = this._minCellW;  
  }

  return ret;
}


// API method to get paging information (needed by the following object)
 
$.fn.dataTableExt.oApi.jpag_and_full_fnPagingInfo = function ( oSettings) {
  
  if ( oSettings) {
    return {
      "iStart": oSettings._iDisplayStart,
      "iEnd": oSettings.fnDisplayEnd (),
      "iLength": oSettings._iDisplayLength,
      "iTotal": oSettings.fnRecordsTotal (),
      "iFilteredTotal": oSettings.fnRecordsDisplay (),
      "iPage": Math.ceil ( oSettings._iDisplayStart / oSettings._iDisplayLength),
       "iTotalPages": Math.ceil ( oSettings.fnRecordsDisplay () / oSettings._iDisplayLength)};
  } else {
    return {
      "iStart": 0,
      "th.ceil ( oSettings.fnRecordsDisplay () / oSettings._iDisplayLength)iEnd": 0,
      "iLength": 0,
      "iTotal": 0,
      "iFilteredTotal": 0,
      "iPage": 0,
      "iTotalPages": 0
    }
  }

};




// Extends DataTable paginator list with the new paginator
/**
 * @class $.fn.dataTableExt.oPagination.jpag_and_full
 * The object is designed to include the jPaginator as paginator on the top and keep the default one (full_number) as paginator on the bottom.
 * The object extends the DataTable paginators list with the new paginator; every paginator plugin for Datatable has the standard interface:
 * fnInit  : function()
 * fnUpdate: function()
 */

$.fn.dataTableExt.oPagination.jpag_and_full = {
  DATA_STORING_LABEL: "jpag_and_full_jPagDOMRef",
  nPaginators: 0, // numbers of paginators: by the sDom setting of Datatable, users can set from 0, 1 or more paginators
  fnInit: function (oSettings, nPaging, fnCallbackDraw) {

    // as first, the paginator's container is hidden

    $(nPaging).hide();

    // jPaginator init

    if( !$.data(oSettings.nTable, this.DATA_STORING_LABEL) ) {

      this.nPaginators = 1;
      $.data(oSettings.nTable, this.DATA_STORING_LABEL, new jPaginator(oSettings, nPaging, fnCallbackDraw) );

    } else {

    // full_number init

      this.nPaginators++;
      jQuery.fn.dataTableExt.oPagination.full_numbers.fnInit(oSettings, nPaging, fnCallbackDraw);

    }
  },
  fnUpdate: function(oSettings, fnCallbackDraw) {
    var jPaginator = $.data(oSettings.nTable, this.DATA_STORING_LABEL),
        oPaging = oSettings.oInstance.jpag_and_full_fnPagingInfo();
        
    // paginator is hidden when there are no pages

    if(!jPaginator || !oPaging.iTotalPages) {
      $(oSettings.nTableWrapper).find(".dataTables_paginate").hide();
      return;
    }

    var showPaginator = true;

    // debug setting (only for jPaginator; full_number doesn't have a debug mode)

    jPaginator._debug.on && jPaginator._debug.highPagesNumber && (oPaging.iTotalPages = jPaginator._debug.finals.N_PAGES);

    // calculates the max cell width to display all the page number for every page (the goal is to do not cut it)

    var w = jPaginator._calculateCellWidth(oPaging.iTotalPages);

    // jPaginator update

    jPaginator.Update(oSettings, oPaging, fnCallbackDraw, w); 
    
    // full_number update
    // the following array is supposed to be an array of arrays inside the full_number.fnUpdate function.
    // I AM CALLING METHODS FROM THE FULL_NUMBER PLUGINS: IF IT WILL GET CHANGES IN THE FUTURE, THE CHECKS OR THE METHODS COULD DO NOT WORK ANYMORE! I don't love that but actually it works good.

    if(oSettings.aanFeatures.p.length > 1) {
      oSettings.aanFeatures.p = [].concat( oSettings.aanFeatures.p[1] );
    }
    try {

       // if the number of paginators setted is only 1, that will be the jPaginator
       
       (this.nPaginators > 1) && jQuery.fn.dataTableExt.oPagination.full_numbers.fnUpdate(oSettings, fnCallbackDraw);

    } catch(e) {
      showPaginator = false;
    }

    // the paginator is showed when needed

    if(showPaginator) {
      $(oSettings.nTableWrapper).find(".dataTables_paginate").show()
    } else {
      $(oSettings.nTableWrapper).find(".dataTables_paginate").hide();
    }
  }

};
