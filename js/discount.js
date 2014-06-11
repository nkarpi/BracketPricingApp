function openEstimate() {	

	validateDiscounts();

	sessionStorage.setItem("storagediscount", $("#storagediscount").val()/100);
	sessionStorage.setItem("computediscount", $("#computediscount").val()/100);
	sessionStorage.setItem("securitydiscount", $("#securitydiscount").val()/100);

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
	else if(!isNumber($("#securitydiscount").val())){
		alert("The Security Discount must be a numeric value.");
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