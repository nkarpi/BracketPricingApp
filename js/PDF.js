/*
function generate() {
	var img;

html2canvas($("body"), {
   onrendered: function(canvas) {
     var img = canvas.toDataURL()
  },
});

var doc = new jsPDF();
doc.addImage(img, 'JPEG', 15, 40, 180, 160);
doc.save('test.pdf');

/*
var pdf = new jsPDF('p', 'pt', 'letter')

// source can be HTML-formatted string, or a reference
// to an actual DOM element from which the text will be scraped.
var source = $('#testdiv')[0];

// we support special element handlers. Register them with jQuery-style 
// ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
// There is no support for any other type of selectors 
// (class, of compound) at this time.
var specialElementHandlers = {
    // element with id of "bypass" - jQuery style selector
    '#bypassme': function(element, renderer){
        // true = "handled elsewhere, bypass text extraction"
        return true
    }
};

margins = {
  top: 80,
  bottom: 60,
  left: 40,
  width: 522
 };
 // all coords and widths are in jsPDF instance's declared units
 // 'inches' in this case
 pdf.fromHTML(
    source // HTML string or DOM elem ref.
    , margins.left // x coord
    , margins.top // y coord
    , {
        'width': margins.width // max width of content on PDF
        , 'elementHandlers': specialElementHandlers
    },
    function (dispose) {
      // dispose: object with X, Y of the last line add to the PDF 
      //          this allow the insertion of new lines after html
      pdf.save('Test.pdf');
    },
    margins
)
}
*/



