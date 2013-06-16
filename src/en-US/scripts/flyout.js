/**********************************************
 *	Filename:	flyout.js
 *	Author:		Cristian Patrasciuc
 *	Email:		cristian.patrasciuc@gmail.com
 *	Date:		17-July-2007
 **********************************************/
 
/* Retrieves the content that must be displayed in the flyout */
function initFlyout()
{
	var ctom = /&lt;([^&]*)&gt;/g;
	var news = System.Gadget.document.parentWindow.news;
	var i = System.Gadget.document.parentWindow.flyoutIndex;
	flyoutTitle.innerHTML = news.items[i].title;
	flyoutDescription.innerHTML = news.items[i].description;
	flyoutPubDate.innerHTML = "Published on: " + (news.items[i].pubDate==null ? "undefined" : news.items[i].pubDate);
	flyoutLink.href = news.items[i].link;
	self.focus();
}