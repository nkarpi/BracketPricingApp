var numrows = 0;

function openEstimate() {   

    validateSelections();
console.log("here");
    storeSelections()
    validateDiscounts();

    sessionStorage.setItem("storagediscount", $("#storagediscount").val()/100);
    sessionStorage.setItem("computediscount", $("#computediscount").val()/100);
    sessionStorage.setItem("supportdiscount", $("#supportdiscount").val()/100);
    
    window.location.href = "estimate.html"; 
}

function validateSelections(){

	if(($("#snapshot").val() < 0)){
		alert("You must have at least one instance.");
		return;
	}
	else if(!isNumber($("#storage").val())){
		alert("Storage Capacity must be a numeric value.");
		return;
	}
	else if(!isNumber($("#IOPS").val())){
		alert("IOPS must be a numeric value.");
		return;
	}
	else if(!isNumber($("#uptime").val())){
		alert("Percent Up-Time must be a numeric value.");
		return;
	}
	else if(!isNumber($("#snapshot").val())){
		alert("Snapshot Capacity must be a numeric value.");
		return;
	}
	else if(!($("#storage").val() > 0)){
		alert("Storage Capacity must be greater than zero.");
		return;
	}
	else if(!($("#IOPS").val() > 0)){
		alert("IOPS must be greater than zero.");
		return;
	}
	else if(!($("#uptime").val() > 0)){
		alert("Percent Up-Time must be greater than zero.");
		return;
	}
	else if(($("#snapshot").val() < 0)){
		alert("Snapshot Capacity cannot be negative.");
		return;
	}
}

function storeSelections() {
console.log('storing');
	sessionStorage.setItem("storage", $("#storage").val());
	sessionStorage.setItem("IOPS", $("#IOPS").val());
	sessionStorage.setItem("uptime", $("#uptime").val()/100);
	sessionStorage.setItem("region", $("#region").val());
	sessionStorage.setItem("CSP", $("#CSP").val());
	sessionStorage.setItem("snapshot", $("#snapshot").val()/100);
	sessionStorage.setItem("tier", $("#tier").val());

	//store instance type and OS selections
	//number of rows = number of instances
	for(var i = 1; i <= numrows; i++){
		var instanceId = "instance" + i + "type";
		var OSId = "instance" + i + "OS";
		var quantityId = "quantity" + i;
		sessionStorage.setItem("type" + i, document.getElementById(instanceId).value);
		sessionStorage.setItem("OS" + i, document.getElementById(OSId).value);
		sessionStorage.setItem("quantity" + i, document.getElementById(quantityId).value);
	}

	//store number of instances that were stored
	sessionStorage.setItem("numinstances", numrows);

}

function isNumber(n) {
  	return !isNaN(parseFloat(n)) && isFinite(n);
}

function addInstance(){

    var table = document.getElementById("instancetable");
    var row = table.insertRow(-1);
    numrows++;

//instance type selection cell generator
    var cell1 = row.insertCell(0);
    var element1 = document.createElement("SELECT");
    var option1 = document.createElement("option");
    option1.text = "Medium";
    option1.value = "Medium Instance Type";
    element1.add(option1);
    var option2 = document.createElement("option");
    option2.text = "Large";
    option2.value = "Large Instance Type";
    element1.add(option2);
    var option3= document.createElement("option");
    option3.text = "x Large";
    option3.value = "x Large Instance Type";
    element1.add(option3);
    var option4 = document.createElement("option");
    option4.text = "2x Large";
    option4.value = "2x Large Instance Type";
    element1.add(option4);
    var option5 = document.createElement("option");
    option5.text = "Large, Gen 2";
    option5.value = "Large Instance Type, Gen 2";
    element1.add(option5);
    var option6 = document.createElement("option");
    option6.text = "4x Large";
    option6.value = "4x Large Instance Type";
    element1.add(option6);
    var option7 = document.createElement("option");
    option7.text = "High CPU 8x Large";
    option7.value = "High CPU 8x Large Instance Type";
    element1.add(option7);
    var option8 = document.createElement("option");
    option8.text = "High Storage 8x Large";
    option8.value = "High Storage 8x Large Instance Type";
    element1.add(option8);
    element1.id = "instance" + numrows + "type"
    cell1.appendChild(element1);

//OS selection cell generator
    var cell2 = row.insertCell(1);
    var element2 = document.createElement("SELECT");
    var op1 = document.createElement("option");
    op1.text = "Centos or Ubuntu";
    op1.value = "LINUX INSTANCES, CENTOS OR UBUNTU";
    element2.add(op1);
    var op2 = document.createElement("option");
    op2.text = "Redhat";
    op2.value = "LINUX INSTANCES, REDHAT";
    element2.add(op2);
    var op3 = document.createElement("option");
    op3.text = "Windows";
    op3.value = "WINDOWS INSTANCES";
    element2.add(op3);
    var op4 = document.createElement("option");
    op4.text = "Windows with SQL";
    op4.value = "WINDOWS INSTANCES WITH SQL SERVER";
    element2.add(op4);
    element2.id = "instance" + numrows + "OS";
    cell2.appendChild(element2);

    var cell3 = row.insertCell(2);
    var element3 = document.createElement("input");
    element3.id = "quantity" + numrows;
    element3.readOnly = true;
    element3.className = "quantity";
    element3.value = 1;
    var plus = document.createTextNode("+");
    var element4 = document.createElement("button");
    element4.appendChild(plus);
    element4.className = "updown"
    element4.onclick = function(){
    	element3.value++;
    }
    var minus = document.createTextNode("-");
    var element5 = document.createElement("button");
    element5.appendChild(minus);
    element5.className = "updown"
    element5.onclick = function(){
    	if(element3.value > 0){
    		element3.value--;
    	}
    }
    cell3.appendChild(element3);
    cell3.appendChild(element4);
    cell3.appendChild(element5);

}

function subtractInstance(){
	var table = document.getElementById("instancetable");
	if(table.rows.length > 2){
		table.deleteRow(table.rows.length - 1);
		numrows--;
	}
}


function validateDiscounts() {

    if(($("#storagediscount").val() < 0) || ($("#computediscount").val() < 0) || ($("#securitydiscount").val() < 0)){
        alert("Discounts cannot be negative.");
        return;
    }
    else if(!isNumber($("#computediscount").val())){
        alert("The Compute Discount must be a numeric value.");
        return;
    }
    else if(!isNumber($("#supportdiscount").val())){
        alert("The Support Discount must be a numeric value.");
        return;
    }
    else if(!isNumber($("#storagediscount").val())){
        alert("The Storage Discount must be a numeric value.");
        return;
    }
}

function isNumber(n) {
    return (!isNaN(parseFloat(n)) && isFinite(n));
}




