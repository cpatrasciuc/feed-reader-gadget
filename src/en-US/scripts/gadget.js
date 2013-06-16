/**********************************************
 *	Filename:	gadget.js
 *	Author:		Cristian Patrasciuc
 *	Email:		cristian.patrasciuc@gmail.com
 *	Date:		29-June-2007
 **********************************************/

/* Set the event handlers */
System.Gadget.settingsUI = "Settings.html";
System.Gadget.onSettingsClosed = settingsClosed;
System.Gadget.onDock = resizeGadget;
System.Gadget.onUndock = resizeGadget;

/* Refresh feed when Settings dialog is closed */
function settingsClosed(event)
{
	if (event.closeAction == event.Action.commit) 
	{
		loadTheme();
		currentFeed = 0;
		getNews();
	}
}

/* Rezise gadget when docked/undocked */
function resizeGadget() 
{
	var themeName = System.Gadget.Settings.read('theme');
	noItems = System.Gadget.Settings.read('noItems');
	
	if ( noItems == "" ) noItems = 4;
	if ( themeName == "" ) themeName = "default";
	
	switch( noItems ) {
		case 4: 
			document.body.style.height = '209px'; 
			message.style.height = '142px';
			break;
		case 6: 
			document.body.style.height = '278px'; 
			message.style.height = '200px';
			break;
		case 8: 
			document.body.style.height = '348px'; 
			message.style.height = '280px';
			break;
	}
	
	for ( var i = 0; i < noItems; i++ ) document.getElementById(i+'').style.display = 'block';
	for ( var i = noItems; i < 8; i++ ) document.getElementById(i+'').style.display = 'none';
	
	if ( System.Gadget.docked == true )
	{
		try { document.body.style.background = "url('../themes/" + themeName + "/background" + noItems + ".png') no-repeat"; } catch(e) {}
		for ( var i = 0; i < noItems; i++ )
			document.getElementById(i+'').className = "feedItemDocked";	
		message.style.width = '120px';
		navigation.style.marginLeft = '8px';
		titleLink.style.width = '72px';
		document.body.style.width = '132px';
	}
	else
	{
		try { document.body.style.background = "url('../themes/" + themeName + "/background-large" + noItems + ".png') no-repeat"; } catch(e) {}
		for ( var i = 0; i < noItems; i++ )
			document.getElementById(i+'').className = "feedItemUndocked";
		message.style.width = '355px'; 
		navigation.style.marginLeft = '127px';
		titleLink.style.width = '308px';
		document.body.style.width = '368px';
	}
}

/* Create a new RSS item object */
function RSS2Item(itemxml)
{
	this.title;
	this.link;
	this.description;
	this.pubDate;

	var properties = new Array("title", "link", "description", "pubDate");
	var tmpElement = null;
	for (var i=0; i<properties.length; i++)
	{
		tmpElement = itemxml.getElementsByTagName(properties[i])[0];
		if ( tmpElement != null )
			if ( tmpElement.childNodes != null )
				if ( tmpElement.childNodes[0] != null )
					if ( tmpElement.childNodes[0].nodeValue != null )
						eval("this."+properties[i]+"=tmpElement.childNodes[0].nodeValue");
	}
}

/* Create a new RSS channel object */
function RSS2Channel(rssxml)
{
	this.items = new Array();
	var itemElements = rssxml.getElementsByTagName("item");
	for (var i=0; i<itemElements.length; i++)
	{
		Item = new RSS2Item(itemElements[i]);
		this.items.push(Item);
	}
}

/* Creates a new Atom feed entry object */
function AtomItem(itemxml)
{
	this.title;
	this.link;
	this.description;
	this.pubDate;

	try { this.title = itemxml.getElementsByTagName("title")[0].childNodes[0].nodeValue; }
	catch (e) { this.title = "(no title)"; }
	
	try { this.pubDate = itemxml.getElementsByTagName("published")[0].childNodes[0].nodeValue; }
	catch (e) { this.pubDate = null; }
	
	try { this.description = itemxml.getElementsByTagName("summary")[0].childNodes[0].nodeValue; }
	catch (e) { this.description = null; }
	
	if ( this.description == null ) 
	{
		try { this.description = itemxml.getElementsByTagName("content")[0].childNodes[0].nodeValue; }
		catch (e) { this.description = "(no summary)"; }
	}
	
	try 
	{
		var links = itemxml.getElementsByTagName("link");
		for ( var i = 0; i < links.length; i++ ) 
		{
			try { if ( links[i].attributes.getNamedItem("rel").value == "alternate" ) this.link = links[i].attributes.getNamedItem("href").value }
			catch (e) {}
		}
	} catch(e) {}
}

/* Create a new Atom feed channel object */
function AtomChannel(atomxml)
{
	this.items = new Array();
	var itemElements;
	try { itemElements = atomxml.getElementsByTagName("feed")[0].getElementsByTagName("entry"); } catch (e) { return false; }

	for ( var i=0; i<itemElements.length; i++ )
	{
		Item = new AtomItem(itemElements[i]);
		this.items.push(Item);
	}	
}

/* Download (request) the feed from the URL */
function getNews()
{
	clear();
	var URL = System.Gadget.Settings.read("feedURL"+currentFeed);
	if ( URL == "" ) 
	{
		titleLink.innerHTML = "Feed Reader";
		showMessage( "No Feed" );
		return true;
	}
	showMessage( "Fetching ..." );
	currentPosition = 0;
	
 	var xmlDocument = new ActiveXObject('Microsoft.XMLDOM');
	xmlDocument.onreadystatechange = function () {
		if (xmlDocument.readyState == 4) {
			if ( xmlDocument.getElementsByTagName("item") != null ) news = new RSS2Channel(xmlDocument);
			else news = new AtomChannel(xmlDocument);
			showNews(news);
		}
	};
	xmlDocument.load(URL);
	
	var refreshTime = System.Gadget.Settings.read('refresh');
	if ( refreshTime > 0 ) setTimeout( "getNews();", refreshTime );
	var isAutoScroll = System.Gadget.Settings.read( "autoScroll" );
	if ( isAutoScroll == 1 ) setTimeout( "autoScroll();", 30000 );
	return;
}

/* Display the current 4 items in the news */
function showNews(news)
{
	var name = System.Gadget.Settings.read( "feedName"+currentFeed );
	
	if ( name != "" ) titleLink.innerHTML = name;
	else titleLink.innerHTML = 'Feed Reader';
	
	for ( var i = currentPosition; (i < currentPosition+noItems) && (i < news.items.length); i++ ) 
	{
		item_html = '<a ';
		item_html += (news.items[i].link == null) ? "" : 'href="javascript:void(0)" onclick="flyoutIndex = ' + i + '; showFlyout()">';
		item_html += (news.items[i].title == null ) ? "(no title)</a>" : news.items[i].title + "</a>";
		item_html += (news.items[i].description == null) ? "" : "<br>" + decodeHTML(news.items[i].description);
		document.getElementById( (i-currentPosition) + '' ).innerHTML = item_html;
	}
	
	var posText = (currentPosition + 1) + '-' + ((currentPosition + noItems)>news.items.length?news.items.length:(currentPosition + noItems)) + '/' + news.items.length;
	position.innerHTML = posText;

	System.Gadget.Settings.write("currentFeed", currentFeed);
	showMessage("");
	return true;
}

/* Display a message to the user */
function showMessage( msg )
{
	message.style.visibility = "visible";
	messageText.innerHTML = msg;
	if ( msg == "" ) message.style.visibility = "hidden";
}

/* Loads the current theme or the default one */
function loadTheme()
{
	var themeName = System.Gadget.Settings.read('theme');
	if ( themeName == "" ) themeName = "default";
	document.styleSheets(1).href = 'themes/' + themeName + '/style.css';
	resizeGadget();	
}

/* Show the flyout when mouse is over an item */
function showFlyout()
{
	if ( flyoutIndex >= news.items.length )
	{
		System.Gadget.Flyout.show = false;
		return true;
	}
	System.Gadget.Flyout.file = "Flyout.html";
	System.Gadget.Flyout.show = true;
}

/* Clear the contents of the gadget */
function clear()
{
	for ( var i = 0; i < 8; i++ )
		document.getElementById(i+'').innerHTML = '';
}

/* Displays the next feed when clicking the top right arrow */
function getNextFeed()
{
	var noFeeds = System.Gadget.Settings.read("noFeeds");
	if ( noFeeds == "" || noFeeds < 2 ) return true;
	currentFeed = (currentFeed+1) % noFeeds;
	getNews();	
}

/* Displays the previous feed when clicking the top left arrow */
function getPreviousFeed()
{
	var noFeeds = System.Gadget.Settings.read("noFeeds");
	if ( noFeeds == "" || noFeeds < 2 ) return true;
	currentFeed--;
	if ( currentFeed < 0 ) currentFeed = noFeeds-1;
	getNews();	
}

/* Converts &lt; and &gt; into < and > */
function decodeHTML(text)
{
	var ctom = /&lt;([^&]*)&gt;/g;
    return text.replace(ctom,"<$1>");
}

/* Scroll one page up */
function previousPage()
{
	currentPosition = (currentPosition - noItems >= 0) ? currentPosition - noItems : ((news.items.length - news.items.length%noItems)); 
	if ( currentPosition >= news.items.length ) currentPosition -= noItems;
	clear();
	showNews(news);
}

/* Scroll one page down */
function nextPage()
{
	currentPosition = (currentPosition + noItems) >= news.items.length ? 0 : (currentPosition + noItems); 
	clear();
	showNews(news);
}

/* Navigates through the feeds automatically */
function autoScroll()
{
	nextPage();
	if ( currentPosition == 0 ) getNextFeed();
	else setTimeout( "autoScroll();", 30000 );
}

/* Current position in the feed */
var currentPosition = 0;

/* The index of the item that must be displayed in the flyout */
var flyoutIndex = 0;

/* The news items */
var news;

/* The index of the current feed in the list */
var currentFeed = ( (System.Gadget.Settings.read("currentFeed") == "" ) ? 0 : System.Gadget.Settings.read("currentFeed") );

/* Number of items to display on a page */
var noItems = ( (System.Gadget.Settings.read("noItems") == "" ) ? 4 : System.Gadget.Settings.read("noItems") );



