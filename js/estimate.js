var priceData; //parsed JSON price sheet data

var compute1year = 0;
var storage1year = 0;
var security1year = 0;
var TOTAL = 0;
var support1year = 0;

var storage2;
var storage3;

var compute3year = 0;
var support3year = 0;
var storage3year = 0;
var security3year = 0;
var TOTAL3 = 0;

var preparedFor_name;
var preparedFor_company;
var preparedFor_note;
var preparedBy_name;
var preparedBy_email;
var preparedBy_phone;

var storagediscount;
var computediscount;
var supportdiscount;

var storage;
var tier;
var IOPS;
var snapshot;
var numinstances;
var uptime;
var CSP;
var region;

var instancePrice_hour; //per hour
var IOPSPrice_month; //per month
var snapshotPrice_month; //per month as a percentage of total storage
var storagePrice_month; //per month
var tierPrice_percentage; //percentage of total storage
var dataatrestEncryption_percentage; //percentage
var instantrekeyPrice_GB; //price per GB

function load() {
	$.getJSON( "data.json" , function(data){
		priceData = data;
		calculate();
	});
}

function calculate() {
	storage = sessionStorage.getItem("storage");
	tier = sessionStorage.getItem("tier");
	CSP = sessionStorage.getItem("CSP");
	IOPS = sessionStorage.getItem("IOPS");
	uptime = sessionStorage.getItem("uptime");
	snapshot = sessionStorage.getItem("snapshot");
	region = sessionStorage.getItem("region");
	numinstances = sessionStorage.getItem("numinstances");
	computediscount = sessionStorage.getItem("computediscount");
	storagediscount = sessionStorage.getItem("storagediscount");
	supportdiscount = sessionStorage.getItem("supportdiscount");

	for(var i = 1; i <= numinstances; i++){
		var typeId = "type" + i;
		var OSId = "OS" + i;
		var quantityId = "quantity" + i;

		var quantity = sessionStorage.getItem(quantityId);

		for(var h = 0; h < priceData.length; h++){
			if(CSP == priceData[h].CSP &&
				region == priceData[h].REGION &&
				sessionStorage.getItem(typeId) == priceData[h].PRODUCT &&
				sessionStorage.getItem(OSId) == priceData[h].OS){
				instancePrice_hour = priceData[h].PRICE;
			}	
			else if(CSP == priceData[h].CSP &&
				region == priceData[h].REGION &&
				"IOPS" == priceData[h].PRODUCT){
				IOPSPrice_month = priceData[h].PRICE;
			}
			else if(CSP == priceData[h].CSP &&
				region == priceData[h].REGION &&
				"Snapshots" == priceData[h].PRODUCT){
				snapshotPrice_month = priceData[h].PRICE;
			}

			else if(CSP == priceData[h].CSP &&
				region == priceData[h].REGION &&
				tier == priceData[h].PRODUCT){
				tierPrice_percentage = priceData[h].PRICE;
			}
			else if(CSP == priceData[h].CSP &&
				region == priceData[h].REGION &&
				"Block storage capacity" == priceData[h].PRODUCT){
				storagePrice_month = priceData[h].PRICE;
			}
			else if(CSP == priceData[h].CSP &&
				region == priceData[h].REGION &&
				"Data-at-rest Encryption" == priceData[h].PRODUCT){
				dataatrestEncryption_percentage = priceData[h].PRICE;
			}
			else if(CSP == priceData[h].CSP &&
				region == priceData[h].REGION &&
				"Instant Rekey" == priceData[h].PRODUCT){
				instantrekeyPrice_GB = priceData[h].PRICE;
			}

		}
		// _x means "this instance" (this iteration of the instance loop)
		//algorithms for calculating final prices for a 1 year outlook
		if(sessionStorage.getItem("IOPSwhich") == "no" && sessionStorage.getItem("Capwhich") == "no"){
			var compute1year_x = uptime * 12 * 720 * (1 - computediscount) * instancePrice_hour;
			var IOPS1year_raw = IOPSPrice_month * 12 * IOPS * (1 - storagediscount);
			var storage1year_raw = storagePrice_month * 12 * storage * (1 - storagediscount); //volume capacity only, price for one year
			var responsetime1year = (IOPS1year_raw + storage1year_raw) * tierPrice_percentage * uptime;
			var IOPS1year_final = IOPS1year_raw * uptime;
			var blockstorage1year_active = storage1year_raw * uptime;
			
			var activestorage1year = responsetime1year + IOPS1year_final + blockstorage1year_active;
			var snapshot1year = storage * storagePrice_month * (1 - storagediscount) * snapshot * 12;
			var passivestorage1year = storage1year_raw * (1 - uptime);
			var storage1year_x = activestorage1year + passivestorage1year + snapshot1year;

			//encryption calculations
			var passivestorage1year_encryption = passivestorage1year * dataatrestEncryption_percentage;
			var activestorage1year_encryption = (responsetime1year + blockstorage1year_active + IOPS1year_final) * dataatrestEncryption_percentage;
			var snapshot1year_encryption = snapshot1year * dataatrestEncryption_percentage;
			var security1year_x = activestorage1year_encryption + passivestorage1year_encryption + snapshot1year_encryption;
		}
		else{
			growthcalc();
		}
	}
	TOTAL = compute1year + security1year + storage1year;

	support1year = TOTAL * (1 - supportdiscount) * 0.20;
/*
	sessionStorage.setItem("TOTAL", TOTAL);
	sessionStorage.setItem("SupportCost", support1year);
	sessionStorage.setItem("StorageCost", storage1year);
	sessionStorage.setItem("ComputeCost", compute1year);
*/
	print();
}

function generatePDF() {

	prepare();

	preparedFor_name = $("#preparedFor_name").val();
	preparedFor_company = $("#preparedFor_company").val();
	preparedFor_note = $("#preparedFor_note").val();
	preparedBy_name = $("#preparedBy_name").val();
	preparedBy_email = $("#preparedBy_email").val();
	preparedBy_phone = $("#preparedBy_phone").val();

	generate();

}

function print() {

	support1year = Math.round(support1year);
	compute1year = Math.round(compute1year);
	storage1year = Math.round(storage1year);
	security1year = Math.round(security1year);

	var page = document.getElementById("page");
	page.innerHTML = "Compute Total: $" + compute1year + "</br>";
	page.innerHTML += "Storage Total: $" + storage1year + "</br>";
	page.innerHTML += "Security Total: $" + security1year + "</br>";
	page.innerHTML += "----------------------------------------------" + "</br>";
	TOTAL = compute1year + security1year + storage1year;
	page.innerHTML += "Total Volume Estimate: $" + TOTAL + "</br>";
	page.innerHTML += "Enterprise Support: $" + support1year;

	prepare();
	
}

function prepare(){

storage3year = Math.round(3*storage1year);
security3year = Math.round(3*security1year);
compute3year = Math.round(3*compute1year);
TOTAL3 = Math.round(3*TOTAL);
support3year = Math.round(3*support1year);

}

function growthcalc(){
	if(sessionStorage.getItem(IOPSwhich) == "linear"){
		var compute1year_x = uptime * 12 * 720 * (1 - computediscount) * instancePrice_hour;
		var IOPS1year_raw = IOPSPrice_month * 12 * IOPS * (1 - storagediscount);
		var storage1year_raw = storagePrice_month * 12 * storage * (1 - storagediscount); //volume capacity only, price for one year
		var responsetime1year = (IOPS1year_raw + storage1year_raw) * tierPrice_percentage * uptime;
		var IOPS1year_final = IOPS1year_raw * uptime;
		var blockstorage1year_active = storage1year_raw * uptime;
		
		var activestorage1year = responsetime1year + IOPS1year_final + blockstorage1year_active;
		var snapshot1year = storage * storagePrice_month * (1 - storagediscount) * snapshot * 12;
		var passivestorage1year = storage1year_raw * (1 - uptime);
		var storage1year_x = activestorage1year + passivestorage1year + snapshot1year;

		//encryption calculations
		var passivestorage1year_encryption = passivestorage1year * dataatrestEncryption_percentage;
		var activestorage1year_encryption = (responsetime1year + blockstorage1year_active + IOPS1year_final) * dataatrestEncryption_percentage;
		var snapshot1year_encryption = snapshot1year * dataatrestEncryption_percentage;
		var security1year_x = activestorage1year_encryption + passivestorage1year_encryption + snapshot1year_encryption;
		//account for quantity of instance
		compute1year_x *= quantity;
		//add the _x quantities (instance specific) to the running totals
		storage1year += storage1year_x;
		compute1year += compute1year_x;
		security1year += security1year_x;
	}
	else{

	}
	if(sessionStorage.getItem(IOPSwhich) == "linear"){
		var compute1year_x = uptime * 12 * 720 * (1 - computediscount) * instancePrice_hour;
		var IOPS1year_raw = IOPSPrice_month * 12 * IOPS * (1 - storagediscount);
		var storage1year_raw = storagePrice_month * 12 * storage * (1 - storagediscount); //volume capacity only, price for one year
		var responsetime1year = (IOPS1year_raw + storage1year_raw) * tierPrice_percentage * uptime;
		var IOPS1year_final = IOPS1year_raw * uptime;
		var blockstorage1year_active = storage1year_raw * uptime;
		
		var activestorage1year = responsetime1year + IOPS1year_final + blockstorage1year_active;
		var snapshot1year = storage * storagePrice_month * (1 - storagediscount) * snapshot * 12;
		var passivestorage1year = storage1year_raw * (1 - uptime);
		var storage1year_x = activestorage1year + passivestorage1year + snapshot1year;

		//encryption calculations
		var passivestorage1year_encryption = passivestorage1year * dataatrestEncryption_percentage;
		var activestorage1year_encryption = (responsetime1year + blockstorage1year_active + IOPS1year_final) * dataatrestEncryption_percentage;
		var snapshot1year_encryption = snapshot1year * dataatrestEncryption_percentage;
		var security1year_x = activestorage1year_encryption + passivestorage1year_encryption + snapshot1year_encryption;
	}
	else{

	}

}
function generate(){

	growthcalc();

	var left = 15;
	var line = 3.5; //regular height of one line of text
	var top = 60;
	var P = top + 5; //starting height of "Prepared For/By" modules
	var Pright = 160;
	var Tline = 5; //table line height
	var Ttop = P + (line * 6);
	var Twidth = 175; //table width
	var Theader = 6; //Table header height
	var Theight = (Tline * 6) + Theader + 2; //table height
	var Tcol1 = 17;
	var Tcol2 = 87;
	var Tcol3 = 112;
	var Tcol4 = 137;
	var Tcol5 = 157;
	var Trow1 = Ttop + 4;
	var Trow2 = Ttop + 10;
	var Trow3 = Trow2 + Tline - 0.5;
	var Trow4 = Trow3 + Tline - 0.5;
	var Trow5 = Trow4 + Tline + 1;
	var Trow6 = Trow5 + Tline;
	var Trow7 = Trow6 + Tline + 1;
	var Nstart = Theight + Ttop + 15;

	var imgData = "data:image/jpeg;base64,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Z2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/fyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoooo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J8Q4NLd/cNcK49uzS+86/wD4N8fDd9oH/BOnTp7y3kgj1jXtQvrQuMeZCWSMOPYtG2PpX2/Wf4V8K6b4G8NWGjaPY2umaVpcCW1paW0YjjhiQYVFUcAACtCviMVX9tWlV7u5+i4LD+ww8KN78qSCiiiuc6gooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/Z";

	var doc = new jsPDF();

	doc.addImage(imgData, 'JPEG', 0, 10, 117, 54);
	doc.setFont("helvetica");
	doc.setFontSize(9);
	doc.setFontStyle("bold");
	doc.text(90, top, "Pricing Estimate");
	doc.text(left, P, "Prepared By:")
	doc.text(Pright, P, "Prepared For:")
	doc.setFontStyle("normal");
	doc.text(left, P + line, preparedBy_name);
	doc.text(left, P + line*2, preparedBy_email);
	doc.text(left, P + line*3, preparedBy_phone);
	doc.text(Pright, P + line, preparedFor_name);
	doc.text(Pright, P + line*2, preparedFor_company);
	doc.text(Pright, P + line*3, preparedFor_note);

//Table

	doc.rect(left, Ttop, Twidth, Theight);
	doc.rect(left, Ttop, Twidth, Theader); //header row
	doc.rect(left, Ttop + Theader, Twidth, Tline*3);
	doc.rect(left, Ttop + Theader + Tline*3, Twidth, Tline*2 + 1);
	doc.rect(left, Ttop + Theader + Tline*5 + 1, Twidth, Tline + 1);
	doc.rect(left, Ttop, Twidth, Theight);
	doc.rect(Tcol5 - 5, Ttop, Twidth - Tcol5 + 5 + left, Theight);

//Table Data
	//Table Headers
	doc.setFontSize(9);
	doc.setFontStyle("bold");
	doc.text(Tcol1, Trow1, "Estimate");
	doc.text(Tcol2, Trow1, "Year 1");
	doc.text(Tcol3, Trow1, "Year 2");
	doc.text(Tcol4, Trow1, "Year 3");
	doc.text(Tcol5, Trow1, "3-Year Estimate");
	//Row2
	doc.setFontSize(8);
	doc.setFontStyle("normal");
	doc.text(Tcol1, Trow2, "Compute");
	doc.text(Tcol2, Trow2, "$" + addCommas(compute1year));
	doc.text(Tcol3, Trow2, "$" + addCommas(compute1year));
	doc.text(Tcol4, Trow2, "$" + addCommas(compute1year));
	doc.text(Tcol5, Trow2, "$" + addCommas(compute3year));
	//Row3
	doc.text(Tcol1, Trow3, "Storage");
	doc.text(Tcol2, Trow3, "$" + addCommas(storage1year));
	doc.text(Tcol3, Trow3, "Year 2");
	doc.text(Tcol4, Trow3, "Year 3");
	doc.text(Tcol5, Trow3, "$" + addCommas(storage3year));
	//Row4
	doc.text(Tcol1, Trow4, "Security");
	doc.text(Tcol2, Trow4, "$" + addCommas(security1year));
	doc.text(Tcol3, Trow4, "$" + addCommas(security1year));
	doc.text(Tcol4, Trow4, "$" + addCommas(security1year));
	doc.text(Tcol5, Trow4, "$" + addCommas(security3year));
	//Row5
	doc.setFontStyle("bold");
	doc.text(Tcol1, Trow5, "Volume Quote - Estimate");
	doc.text(Tcol2, Trow5, "$" + addCommas(TOTAL));
	doc.text(Tcol3, Trow5, "Year 2");
	doc.text(Tcol4, Trow5, "Year 3");
	doc.text(Tcol5, Trow5, "$" + addCommas(TOTAL3));
	//Row6
	doc.s
	doc.setFontStyle("normal");
	doc.text(Tcol1, Trow6, "Enterprise Support");
	doc.text(Tcol2, Trow6, "$" + addCommas(support1year));
	doc.text(Tcol3, Trow6, "$" + addCommas(support1year));
	doc.text(Tcol4, Trow6, "$" + addCommas(support1year));
	doc.text(Tcol5, Trow6, "$" + addCommas(support3year));
	//Row6
	doc.setFontSize(9);
	doc.setFontStyle("bold");
	doc.text(Tcol1, Trow7, "Total Estimate");
	doc.text(Tcol2, Trow7, "$" + addCommas(TOTAL + support1year));
	doc.text(Tcol3, Trow7, "Year 2");
	doc.text(Tcol4, Trow7, "Year 3");
	doc.text(Tcol5, Trow7, "$" + addCommas(TOTAL3 + support3year));

//Disclaimer
	doc.setFontSize(8);
	doc.setFontStyle("normal");
	doc.text(left, Nstart, "This Pricing Estimate is non-binding and provided for planning purposes only. It is based upon workload");
	doc.text(left, Nstart + line, "assumptions below and Bracket's current list prices, both of which are subject to change.");
	
	doc.text(left, Nstart + 3*line, "This Pricing Estimate reflects an assumed Volume Band Discount of " + 100*storagediscount + "% off Bracket Storage and Security");
	doc.text(left, Nstart + 4*line, "Services and " + 100*computediscount + "% off Bracket Compute Services.");

	doc.text(left, Nstart + 6*line, "Metered charges (e.g., bandwidth) are not included and will be invoiced monthly in arrears.");

//Begin Workload Assumptions
	doc.setFontStyle("bold");
	doc.setFontSize(9);
	doc.text(left, Nstart + 9*line, "Workload assumtions:");

//Storage Metrics
	doc.setFontSize(8);
	doc.text(left, Nstart + 12*line, "Storage capacity");

	doc.setFontStyle("normal");
	doc.text(left, Nstart + 13*line, "1) An application with " + storage + " GB of storage capacity");
	doc.text(left, Nstart + 14*line, "2) STORAGE GROWTH ASSUMTIONS GO HERE");

//IOPS metrics
	doc.setFontStyle("bold");
	doc.text(left, Nstart + 16*line, "IOPS");
	doc.setFontStyle("normal");
	doc.text(left, Nstart + 17*line, "1) An application needing " + IOPS + " (input/output operations per second)");
	doc.text(left, Nstart + 18*line, "2) IOPS GROWTH ASSUMTIONS GO HERE");

//Response Time Metrics
	doc.setFontStyle("bold");
	doc.text(left, Nstart + 20*line, "Response Time");

	doc.setFontStyle("normal");
	doc.text(left, Nstart + 21*line, "1) " + tier);
	doc.text(left, Nstart + 22*line, "2) The application will need to be active to access this storage " + 100*uptime + "% of the time");
	doc.text(left, Nstart + 23*line, "3) A " + snapshot*100 + "% snapshot usage rate");

//Instance Types
	doc.setFontStyle("bold");
	doc.text(left, Nstart + 25*line, "Compute Instances");
	doc.setFontStyle("normal");

	for(var i = 1; i <= numinstances; i++){
		var OSpretty; //a print freindly version of the instance type
		var typeId = "type" + i;
		var OSId = "OS" + i;
		var quantityId = "quantity" + i;

		if(sessionStorage.getItem(OSId) == "LINUX INSTANCES, CENTOS OR UBUNTU"){
			OSpretty = "Linux (Centos or Ubuntu)";
		}
		else if(sessionStorage.getItem(OSId) == "WINDOWS INSTANCES WITH SQL SERVER"){
			OSpretty = "Windows with SQL server";
		}
		else if(sessionStorage.getItem(OSId) == "WINDOWS INSTANCES"){
			OSpretty = "Windows";
		}
		else if(sessionStorage.getItem(OSId) == "LINUX INSTANCES, REDHAT"){
			OSpretty = "Linux (Red Hat)";
		}

		doc.text(left, Nstart + (25 + i)*line, i + ") Quantity: " + sessionStorage.getItem(quantityId) + " - " + sessionStorage.getItem(typeId) + ", running " + OSpretty);
	}
	doc.save("Form.pdf");
}

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
