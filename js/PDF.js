var storageCost;
var securityCost;
var computeCost;
var preparedFor_company;
var preparedFor_note;
var preparedBy_name;
var preparedBy_email;
var preparedBy_phone;

function plug() {

	storageCost = sessionStorage.getItem("StorageCost");
	securityCost = sessionStorage.getItem("SecurityCost");
	computeCost = sessionStorage.getItem("ComputeCost");
	preparedFor_name = sessionStorage.getItem("preparedFor_name");
	preparedFor_company = sessionStorage.getItem("preparedFor_company");
	preparedFor_note = sessionStorage.getItem("preparedFor_note");
	preparedBy_name = sessionStorage.getItem("preparedBy_name");
	preparedBy_email = sessionStorage.getItem("preparedBy_email");
	preparedBy_phone = sessionStorage.getItem("preparedBy_phone");

}

function generate() {
	plug();

	var doc = new jsPDF();
	doc.text(20, 20, 'Hello world.');
	doc.text(20, 80, 'GHDGSHDGSDHGSDHGSDGHS');
	// Empty square
doc.rect(20, 20, 10, 10); 

// Filled square
doc.rect(40, 20, 10, 10, 'F');

// Empty red square
doc.setDrawColor(255,0,0);
doc.rect(60, 20, 10, 10);

// Filled square with red borders
doc.setDrawColor(255,0,0);
doc.rect(80, 20, 10, 10, 'FD'); 

// Filled red square
doc.setDrawColor(0);
doc.setFillColor(255,0,0);
doc.rect(100, 20, 10, 10, 'F'); 

 // Filled red square with black borders
doc.setDrawColor(0);
doc.setFillColor(255,0,0);
doc.rect(120, 20, 10, 10, 'FD');

// Black sqaure with rounded corners
doc.setDrawColor(0);
doc.setFillColor(255, 255, 255);
doc.roundedRect(140, 20, 10, 10, 3, 3, 'FD'); 
	doc.save('Test.pdf');

}