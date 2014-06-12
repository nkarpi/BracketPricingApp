function openEstimate() {	

	validateDiscounts();

	sessionStorage.setItem("storagediscount", $("#storagediscount").val()/100);
	sessionStorage.setItem("computediscount", $("#computediscount").val()/100);
	sessionStorage.setItem("supportdiscount", $("#supportdiscount").val()/100);
	
	window.location.href = "estimate.html";	
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