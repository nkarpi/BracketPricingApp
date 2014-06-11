var priceData; //parsed JSON price sheet data
var compute1year = 0;
var storage1year = 0;
var security1year = 0;
var TOTAL = 0;

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
	var securitydiscount = sessionStorage.getItem("securitydiscount");

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

		var compute1year_x = uptime * 24 * 365 * (1 - computediscount) * instancePrice_hour;
		var IOPS1year_alone = IOPSPrice_month * 12 * IOPS * (1 - storagediscount);
		var storage1year_alone = storagePrice_month * 12 * storage * (1 - storagediscount); //volume capacity only, price for one year
		var responsetime1year_kicker = (IOPS1year_alone + storage1year_alone) * tierPrice_percentage;
		var activeencryption1year_final = responsetime1year_kicker * dataatrestEncryption_percentage * uptime;
		var responsetime1year_final = responsetime1year_kicker * uptime;
		var IOPS1year_final = IOPS1year_alone * uptime;
		var storage1year_final = storage1year_alone * uptime;
		
		var activestorage1year = responsetime1year_final + IOPS1year_final + storage1year_final + activeencryption1year_final;
		var passivestorage1year_alone = (storage * storagePrice_month * (1 - storagediscount) * (1 - uptime) * 12);
		var passivestorage1year_encryption = passivestorage1year_alone * dataatrestEncryption_percentage;
		var passivestorage1year = passivestorage1year_encryption + passivestorage1year_alone;

		var snapshot1year_alone = storage * storagePrice_month * (1 - storagediscount) * snapshot * 12;
		var snapshot1year_encryption = snapshot1year_alone * dataatrestEncryption_percentage;
		var snapshot1year = snapshot1year_alone + snapshot1year_encryption;

		var storage1year_x = activestorage1year + passivestorage1year + snapshot1year;

		var security1year_x = activeencryption1year_final + passivestorage1year_encryption + snapshot1year_encryption;

		storage1year_x -= security1year_x;

		//account for quantity of instance
		storage1year_x *= quantity;
		compute1year_x *= quantity;
		security1year_x *= quantity;
		//add the _x quantities (instance specific) to the running totals
		storage1year += storage1year_x;
		compute1year += compute1year_x;
		security1year += security1year_x;
	}
	print();
}

function generatePDF() {
	sessionStorage.setItem("SecurityCost", security1year);
	sessionStorage.setItem("StorageCost", storage1year);
	sessionStorage.setItem("ComputeCost", compute1year);

	sessionStorage.setItem("preparedFor_name", $("#preparedFor_name").val());
	sessionStorage.setItem("preparedFor_company", $("#preparedFor_company").val());
	sessionStorage.setItem("preparedFor_note", $("#preparedFor_note").val());
	sessionStorage.setItem("preparedBy_name", $("#preparedBy_name").val());
	sessionStorage.setItem("preparedBy_email", $("#preparedBy_email").val());
	sessionStorage.setItem("preparedBy_phone", $("#preparedBy_phone").val());

	generate();
}

function print() {

	compute1year = Math.round(compute1year);
	storage1year = Math.round(storage1year);
	security1year = Math.round(security1year);

	var page = document.getElementById("page");
	page.innerHTML = "Compute Total: " + compute1year + "</br>";
	page.innerHTML += "Storage Total: " + storage1year + "</br>";
	page.innerHTML += "Security Total: " + security1year + "</br>";
	page.innerHTML += "-----------------------------" + "</br>";
	TOTAL1year = compute1year + security1year + storage1year;
	page.innerHTML += "TOTAL: " + TOTAL1year;

}

