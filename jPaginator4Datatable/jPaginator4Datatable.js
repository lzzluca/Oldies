/**
 * jQuery DataTables jPaginator v1.0 (https://github.com/lzzluca/jPaginator4Datatable)
 *
 * Author:
 * Luca Lazzarini ( lzzluca@gmail.com  http://nerdstuckathome.wordpress.com/ )
 *
 * A fork from:
 * jQuery DataTables jPaginator plugin v1.0
 * by Ernani Azevedo <azevedo@intellinews.com.br>
 *
 * The fork was born from this topic:
 * http://datatables.net/forums/discussion/12319/paginator-like-httpremylab.github.comjpaginator
 *
 * Licensed under GPL v3.0.
 *
 * http://nerdstuckathome.wordpress.com/2012/11/06/jpaginator-as-paginator-for-the-jquery-datatable-plugin/
 * https://github.com/lzzluca/jPaginator4Datatable
 *
 * Version:
 * 1.0
 *
 * Depends:
 * jQuery
 * jQuery DataTables (http://datatables.net/)
 * jPaginator (http://remylab.github.com/jpaginator/)
 *
 * Todo:
 * Merge my fork and the original plugin, making the number of paginator on the screen settable.
 *
 *
 * I built it in my current company, it is WCN (wcn.co.uk), and i was allowed to release it as open source. Thanks (particularly to Jack Hobson)!
 */

// API method to get paging information (Got idea from Twitter Bootstrap plugin):

$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings)
{
  if ( oSettings)
  {
    return {
      "iStart":         oSettings._iDisplayStart,
      "iEnd":           oSettings.fnDisplayEnd (),
      "iLength":        oSettings._iDisplayLength,
      "iTotal":         oSettings.fnRecordsTotal (),
      "iFilteredTotal": oSettings.fnRecordsDisplay (),
      "iPage":          Math.ceil ( oSettings._iDisplayStart / oSettings._iDisplayLength),
      "iTotalPages":    Math.ceil ( oSettings.fnRecordsDisplay () / oSettings._iDisplayLength)};
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

// Extends DataTable to support jPaginator pagination style:

$.fn.dataTableExt.oPagination.jPaginator = {
  paginatorTop: null,
  paginatorBottom: null,
  settings: {
    selectedPage: null,
    nbPages: 6,
    nbVisible: 10,
    minSlidesForSlider: 5 
  },
  'getPaginatorHTML': function() {
      var m_left_id = "m_left", 
          o_left_id = "o_left", 
          o_right_id = "o_right", 
          m_right_id = "m_right";
      if(this.topAdded) {
        m_left_id += "1", 
        o_left_id += "1", 
        o_right_id += "1", 
        m_right_id += "1";
      }
      return $('<span>').html ( '<div id="' + m_left_id + '"></div>' +
                                '<div id="' + o_left_id + '"></div>' +
                                '<div class="paginator_p_wrap">' +
                                '  <div class="paginator_p_bloc">' +
                                '    <!--<a class="paginator_p"></a>-->' + 
                                '  </div>' +
                                '</div>' +
                                '<div id="' + o_right_id + '"></div>' +
                                '<div id="' + m_right_id + '"></div>' +
                                '<div class="paginator_slider ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all">' +
                                '  <a class="ui-slider-handle ui-state-default ui-corner-all" href="#"></a>' +
                                '</div>');
  },
  'fnInit': function ( oSettings, nPaging, fnCallbackDraw) {

    // setted here because it needs the oSettings var

    this.settings.onPageClicked = function(a, num) {
      if ( num - 1 == Math.ceil ( oSettings._iDisplayStart / oSettings._iDisplayLength)) {
        return;
      }
      oSettings._iDisplayStart = ( num - 1) * oSettings._iDisplayLength;
      fnCallbackDraw ( oSettings);
    };

    // setted here because they depends from this.topAdded

    this.settings.overBtnLeft = this.topAdded ? '#o_left1' : '#o_left';
    this.settings.overBtnRight = this.topAdded ? '#o_right1' : '#o_right';
    this.settings.maxBtnLeft = this.topAdded ? '#m_left1' : '#m_left';
    this.settings.maxBtnRight = this.topAdded ? '#m_right1' : '#m_right';

    // executed at the first call: paginator on top 

    if( typeof this.topAdded == "undefined" ) {
      this.paginatorTop = this.getPaginatorHTML();
      $(nPaging).prepend ( this.paginatorTop );    
      this.paginatorTop.jPaginator(this.settings).addClass( 'jPaginator' );
      this.topAdded = true;
    }else{ 

    // second call: paginator on the bottom

      this.paginatorBottom = this.getPaginatorHTML();
      $(nPaging).prepend ( this.paginatorBottom );    
      this.paginatorBottom.jPaginator(this.settings).addClass( 'jPaginator' );
      //this.bottomAdded = true;
    }
  },
  'fnUpdate': function ( oSettings, fnCallbackDraw) {
    if ( ! oSettings.aanFeatures.p) {
      return;
    }
    var oPaging = oSettings.oInstance.fnPagingInfo ();
    $(this.paginatorTop).trigger ( 'reset', { nbVisible: 6, selectedPage: oPaging.iPage + 1, nbPages: oPaging.iTotalPages});
    $(this.paginatorBottom).trigger ( 'reset', { nbVisible: 6, selectedPage: oPaging.iPage + 1, nbPages: oPaging.iTotalPages});
  }
};

