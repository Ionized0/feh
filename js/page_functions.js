function createHeader() {
	var sHeaderId = "#idHeader";
	var oHeader = $(sHeaderId);
	var sTitle = "Fire Emblem Heroes - Data Visualisation";
	var oTitle = $("<h2>", {
		html: sTitle,
		class: "col"
	});
	oHeader.append(oTitle);
}

function createFooter() {
	var sFooterId = "#idFooter";
	var oFooter = $(sFooterId);

	// var sAuthor = "Jonathan Vukim;"
	var sAuthor = "https://github.com/Ionized0/feh_visualisation";
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