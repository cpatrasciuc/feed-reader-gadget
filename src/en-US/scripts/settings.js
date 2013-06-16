/**********************************************
 *	Filename:	settings.js
 *	Author:		Cristian Patrasciuc
 *	Email:		cristian.patrasciuc@gmail.com
 *	Date:		29-June-2007
 **********************************************/

/* Set the event handlers */
System.Gadget.onSettingsClosing = settingsClosing;

/* Saves the settings when Settings dialog is closed */
function settingsClosing(event)
{
    if (event.closeAction == event.Action.commit)
    {
        System.Gadget.Settings.write( "refresh", feedRefresh.options[feedRefresh.selectedIndex].value );
        System.Gadget.Settings.write( "theme", feedTheme.options[feedTheme.selectedIndex].value );
		System.Gadget.Settings.write( "noItems", noItems.options[noItems.selectedIndex].value );
		System.Gadget.Settings.write( "autoScroll", ((autoScrollCheckBox.checked == true) ? 1 : 0 ) );
        event.cancel = false;
    }
}

/* Loads the existing settings when the Settings dialog is shown */
function loadSettings() 
{
	var refresh = System.Gadget.Settings.read("refresh");
	var theme = System.Gadget.Settings.read("theme");

	switch ( refresh ) {
		case 60000:
			feedRefresh[0].selected = "1";
			break;
		case 900000:
			feedRefresh[1].selected = "1";
			break;
		case 1800000:
			feedRefresh[2].selected = "1";
			break;
		case 3600000:
			feedRefresh[3].selected = "1";
			break;
		default:
			feedRefresh[4].selected = "1";
	}	
	
	for ( var i=0; i<4; i++ ) if ( feedTheme[i].value == theme ) feedTheme[i].selected = "1";
	updatePreview();

	buildFeedList();
	var current = System.Gadget.Settings.read("currentFeed");
	if ( current == "" ) current = 0;
	feeds.options[current].selected = "1";
	
	var isAutoScroll = System.Gadget.Settings.read( "autoScroll" );
	autoScrollCheckBox.checked = (isAutoScroll == 1);
	var items = System.Gadget.Settings.read("noItems");
	if ( items == "" ) items = 4;
	noItems.options[items/2-2].selected = "1";
}

/* Updates the preview image when theme is switched */
function updatePreview()
{
	previewImage.src = "/themes/" + feedTheme.options[feedTheme.selectedIndex].value + "/preview.png";
}

/* Builds the feed list */
function buildFeedList()
{
	var n;
	var aux = System.Gadget.Settings.read("noFeeds");
	if ( aux == "" ) n = 0; else n = aux;
	
	for ( var i = 0; i < feeds.options.length; i++ ) feeds.options[i] = null;
	
	for ( var i = 0; i < n; i++ )
	{
		var text = System.Gadget.Settings.read("feedName"+i);
		feeds.options[i] = new Option(text,i+'');
	}
}

/* Add a new feed */
function addNewFeed( name, url )
{
	if ( url == "" )
	{
		if ( feedURL.value.replace(/^\s+|\s+$/, '') == "" ) 
		{
			errorMessage.innerHTML = "URL is empty.";
			return true;
		}
		if ( feedName.value.replace(/^\s+|\s+$/, '') == "" )
		{
			errorMessage.innerHTML = "Name is empty.";
			return true;
		}
		url = feedURL.value;
		name = feedName.value;
	}
	
	var n;
	var aux = System.Gadget.Settings.read("noFeeds");
	if ( aux == "" ) n = 0; else n = aux;

	System.Gadget.Settings.write( "feedName"+n, name );	
	System.Gadget.Settings.write( "feedURL"+n, url );	

	n++;
	System.Gadget.Settings.write("noFeeds",n);
	
	feedName.value = "";
	feedURL.value = "";
	errorMessage.innerHTML = "";
	
	buildFeedList();
	feeds.options[feeds.options.length-1].selected = "1";
}

/* Deletes an existing feed */
function deleteExistingFeed()
{
	var n;
	var aux = System.Gadget.Settings.read("noFeeds");
	if ( aux == "" ) n = 0; else n = aux;
	
	for ( var i = feeds.selectedIndex; i < n; i++ )	
	{
		var URL = System.Gadget.Settings.read("feedURL"+(i+1));
		var name = System.Gadget.Settings.read("feedName"+(i+1));
		System.Gadget.Settings.write("feedURL"+i, URL);
		System.Gadget.Settings.write("feedName"+i, name);
	}
	
	if ( n > 0 ) n--; else n = 0;
	System.Gadget.Settings.write("noFeeds",n);
	
	buildFeedList();
}

/* Import feeds from Internet Explorer 7, using Vista feed platform */
function importFeedsFromIE7() 
{
	var feedManager = null;
	try
	{
		feedManager = new ActiveXObject( "Microsoft.FeedsManager" );
		if ( feedManager == null ) return false;
		searchAndAddFeed( feedManager.RootFolder );
	} catch(e) {}
}

/* Recursively search and add feeds from vista feed platform */
function searchAndAddFeed( folder ) 
{
	var feeds = folder.Feeds;
	for ( var i = 0; i < feeds.Count; i++ )	addNewFeed( feeds.Item(i).Name, feeds.Item(i).Url );
	
	var subFolders = folder.Subfolders;
	for ( var i = 0; i < subFolders.Count; i++ ) searchAndAddFeed( subFolders.Item(i) );
}

/* Export feeds into IE/Vista feed platform */
function exportFeeds()
{
	var feedManager = null;
	try
	{
		feedManager = new ActiveXObject( "Microsoft.FeedsManager" );
		if ( feedManager == null ) return false;
	} catch(e) {}
	
	var folder = feedManager.RootFolder.CreateSubfolder( "Feed Reader Gadget Feeds" );
	var n;
	var aux = System.Gadget.Settings.read("noFeeds");
	if ( aux == "" ) n = 0; else n = aux;
	
	for ( var i = 0; i < n; i++ )
	{
		var name = System.Gadget.Settings.read("feedName"+i);
		var url = System.Gadget.Settings.read("feedURL"+i);
		folder.CreateFeed( name, url );
	}
}

/* Shows a specified table in the settings dialog */
function showTable( table )
{
	feedsTable.style.display = 'none';
	aboutTable.style.display = 'none';
	optionsTable.style.display = 'none';
	table.style.display = 'block';
}
