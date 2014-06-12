var priceData; //parsed JSON price sheet data
var compute1year = 0;
var storage1year = 0;
var security1year = 0;
var TOTAL = 0;
var support1year = 0;

function load() {
	$.getJSON( "data.json" , function(data){
		priceData = data;
		calculate();
	});
}

function calculate() {
	var storage = sessionStorage.getItem("storage");
	var tier = sessionStorage.getItem("tier");
	var CSP = sessionStorage.getItem("CSP");
	var IOPS = sessionStorage.getItem("IOPS");
	var uptime = sessionStorage.getItem("uptime");
	var snapshot = sessionStorage.getItem("snapshot");
	var region = sessionStorage.getItem("region");
	var numinstances = sessionStorage.getItem("numinstances");
	var computediscount = sessionStorage.getItem("computediscount");
	var storagediscount = sessionStorage.getItem("storagediscount");
	var supportdiscount = sessionStorage.getItem("supportdiscount");

	var instancePrice_hour; //per hour
	var IOPSPrice_month; //per month
	var snapshotPrice_month; //per month as a percentage of total storage
	var storagePrice_month; //per month
	var tierPrice_percentage; //percentage of total storage
	var dataatrestEncryption_percentage; //percentage
	var instantrekeyPrice_GB; //price per GB

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
	TOTAL = compute1year + security1year + storage1year;

	support1year = TOTAL * (1 - supportdiscount) * 0.20;

	sessionStorage.setItem("TOTAL", TOTAL);
	sessionStorage.setItem("SupportCost", support1year);
	sessionStorage.setItem("StorageCost", storage1year);
	sessionStorage.setItem("ComputeCost", compute1year);
	print();
}

function generatePDF() {

	sessionStorage.setItem("preparedFor_name", $("#preparedFor_name").val());
	sessionStorage.setItem("preparedFor_company", $("#preparedFor_company").val());
	sessionStorage.setItem("preparedFor_note", $("#preparedFor_note").val());
	sessionStorage.setItem("preparedBy_name", $("#preparedBy_name").val());
	sessionStorage.setItem("preparedBy_email", $("#preparedBy_email").val());
	sessionStorage.setItem("preparedBy_phone", $("#preparedBy_phone").val());

	generate();
}

function print() {

	support1year = Math.round(100*support1year)/100;
	compute1year = Math.round(100*compute1year)/100;
	storage1year = Math.round(100*storage1year)/100;
	security1year = Math.round(100*security1year)/100;

	var page = document.getElementById("page");
	page.innerHTML = "Compute Total: $" + compute1year + "</br>";
	page.innerHTML += "Storage Total: $" + storage1year + "</br>";
	page.innerHTML += "Security Total: $" + security1year + "</br>";
	page.innerHTML += "----------------------------------------------" + "</br>";
	TOTAL = compute1year + security1year + storage1year;
	page.innerHTML += "Total Volume Estimate: $" + TOTAL + "</br>";
	page.innerHTML += "Enterprise Support: $" + support1year;
	
}

