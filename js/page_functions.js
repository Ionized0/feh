function createHeader() {
	
}

function createFooter() {
	var sFooterId = "#idFooter";
	var oFooter = $(sFooterId);

	var sAuthor = "Jonathan Vukim"
	var sDate = getFormattedDate();
	var oAuthor = $("<div>", {
		html: sAuthor,
		class: "col",
		style: "text-align: left"
	});
	var oDate = $("<div>", {
		html: sDate,
		class: "col",
		style: "text-align: right"
	});
	oFooter.append(oAuthor);
	oFooter.append(oDate);
}

function getFormattedDate() {
	var oDate = new Date();
	var iDate = oDate.getDate();
	var iMonth = oDate.getMonth() + 1;
	var iYear = oDate.getFullYear();
	return iDate + "/" + iMonth + "/" + iYear;
}