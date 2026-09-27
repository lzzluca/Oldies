var TableGenerator = new Class({

  defaults: {
    nRowsH: 1,                                        // thead rows number
    nRowsB: 100,                                      // tbody rows number
    nRowsF: 0,                                        // tfoot rows number
    nCols: 10,                                        // columns number
    hasRowTitle: false,                               // adds a th as first cell of every rows TODO should be a number like above
    thContent: function(x) { return x; },             // th default text
    tdContent: function(x, y) { return x + " " +y; }, // td default text
    thr: function(y) { return y; },                   // row title default text
    fillParent: false                                 // the table will fill the size of the parent
  },

  initialize: function (settings) {
    if( typeof settings !== "object" || settings === null ) {
      settings = this.defaults;
    }

    for(var i in this.defaults) {
      if(typeof settings[i] === "undefined") {
        settings[i] = this.defaults[i];
      }
    }

    this.settings = settings;
  },

  getHTML: function () {
    return this._generateHTML();
  },

  _generateHTML: function () {
     var optStyle = "";
     if (this.settings.fillParent)
       optStyle += "table-layout: fixed; width: 100%; height: 100%;";
     return "<TABLE class = 'table' style = '" + optStyle + "'>" +
       this._generateHTMLHead() +
       this._generateHTMLBody() +
       this._generateHTMLFoot() +
       "</TABLE>";
  },

  _generateHTMLHead: function() {
    var HTML = "<THEAD class = 'thead'>";

    for (var i = 0; i < this.settings.nRowsH; i++) {

      HTML += "<TR class = 'trh'>"
        if(this.settings.hasRowTitle)
          HTML += "<TH class = 'th corner'>" + this.settings.thContent(i) + "</TH>";
      for (var j = 0; j < this.settings.nCols; j++)
        HTML += "<TH class = 'th'>" + this.settings.thContent(j) + "</TH>";
      HTML += "</TR>";

    }

    return HTML += "</THEAD>";
  },

  _generateHTMLBody: function() {
    var HTML = "<TBODY class = 'tbody'>";

    for (var i = 0; i < this.settings.nRowsB; i++) {

      HTML += "<TR class = 'trb'>"
        if(this.settings.hasRowTitle)
          HTML += "<TH class = 'th'>" + this.settings.thContent(i) + "</TH>";
      for (var j = 0; j < this.settings.nCols; j++) {
        HTML += "<TD class = 'tdb'>" + this.settings.tdContent(i, j) + "</TD>";
      }
      HTML += "</TR>";

    }

    return HTML += "</TBODY>";
  },

  _generateHTMLFoot: function() {
    var HTML = "<TFOOT class = 'tfoot'>";

    for (var i = 0; i < this.settings.nRowsF; i++) {

      HTML += "<TR class = 'trf'>"
        if(this.settings.hasRowTitle)
          HTML += "<TH class = 'th corner'>" + this.settings.settings(i) + "</TH>";
      for (var j = 0; j < this.settings.nCols; j++) {
        HTML += "<TD class = 'tdf'>" + this.settings.tdContent(i, j) + "</TD>";
      }
      HTML += "</TR>";

    }

    return HTML += "</TFOOT>";
  }
});
