# What is TimeMe.js?
TimeMe.js is a JavaScript library that accurately tracks how long users interact with a web page. It disregards time spent on a web page if the user minimizes the browser or switches to a different tab. TimeMe.js also disregards 'idle' time: if the user goes idle (no mouse movement, no keyboard input) for a customizable period of time, TimeMe.js will stop tracking. Together, these attributes create a much more accurate representation of how long users are actually using a web page.

# Live Demo
You can see a <a href="https://jasonzissman.github.io/time-me-demo/" target="_blank">live demo of TimeMe.js here</a>.

# How do I use TimeMe.js?
First, obtain a copy of timeme.js. A minified version is bundled in this repository as `timeme.min.js`. Alternatively, you can get a copy by installing TimeMe.js via npm or Bower:

    npm install timeme.js --save
    bower install timeme.js

Once downloaded, simply include the following lines of code in your page:

    <script src="timeme.min.js"></script>
    <script type="text/javascript">
	    // Initialize library and start tracking time
	    TimeMe.initialize({
    	    currentPageName: "my-home-page", // current page
    	    idleTimeoutInSeconds: 30 // seconds
	    });

	    // ... Some time later ...

	    // Retrieve time spent on current page
	    let timeSpentOnPage = TimeMe.getTimeOnCurrentPageInSeconds();
    </script>

Notice that the code sample sets the idle duration to 30 seconds, which means 30 seconds of user inactivity (no mouse or keyboard usage on the page) will stop the timer.  Also, we define a page name (`my-home-page`) to associate with the current timer.

*Note*: You can use TimeMe.js to time any activity that you want, not just page time.  Simply call the following code around the activity of interest. TimeMe.js will automatically discount any idle time or time when viewing another tab or application.

    TimeMe.startTimer("my-activity");
    // ... some time later
    TimeMe.stopTimer("my-activity");
    let timeOnActivity = TimeMe.getTimeOnPageInSeconds("my-activity")

TimeMe gives you a hook to execute a function after a user has been interacting with your page for a set period of time.  Simply call `TimeMe.callAfterTimeElapsedInSeconds()`:

    TimeMe.callAfterTimeElapsedInSeconds(15, function(){
    	console.log("The user has been actively using the page for 15 seconds! Let's prompt them with something.");
    });

TimeMe also lets you execute code when a user leaves the page (due to switching tabs, inactivity, etc.) and executes it when he or she returns:

    // Executes the first 5 times a user leaves the page
    TimeMe.callWhenUserLeaves(function(){
    	console.log("The user is not currently viewing the page!");
    }, 5);
    
    // Executes every time a user returns
    TimeMe.callWhenUserReturns(function(){
    	console.log("The user has come back!");
    });

TimeMe also lets you track how long users are interacting with specific elements.  If the user moves their mouse over, clicks, or types on an element (or its children), TimeMe will begin tracking that interaction.  Multiple timers can run concurrently, so this does not impact other times that you've already set up.

    // Start tracking activity on element with id 'area-of-interest-1'
    TimeMe.trackTimeOnElement('area-of-interest-1');
    // some time later...
    let timeSpentOnElement = TimeMe.getTimeOnElementInSeconds('area-of-interest-1');


# What do I do with the time I've tracked?

In most cases you will want to store the time spent on a page for analytic purposes.  You will likely need to send the time spent on a page to a back-end server. 

## Using WebSockets to send times
TimeMe.js has websocket reporting built into it.  Your page will establish a websocket connection with your websocket server.  TimeMe will end the connection and report the user's time when the user leaves.  Simply provide a few arguments to the initialize() method to enable it:

    TimeMe.initialize({
    	currentPageName: "my-home-page", // current page
    	idleTimeoutInSeconds: 30, // seconds 
    	websocketOptions: { // optional
		    websocketHost: "ws://your_host:your_port",
    		appId: "insert-your-made-up-app-id"
    	}
    });

## Using standard http requests to send time
Alternatively you can issue an HTTP request to your back end server to report time. *Note*: the following example sends an HTTP request during the the `window.onbeforeunload` event. This approach may not work in all browsers as there is no guarantee that the request will complete before the browser terminates it.

    window.onbeforeunload = function (event) {
    	xmlhttp=new XMLHttpRequest();
    	xmlhttp.open("POST","ENTER_URL_HERE", true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    	let timeSpentOnPage = TimeMe.getTimeOnCurrentPageInSeconds();
    	xmlhttp.send(timeSpentOnPage);
    };

Using `onbeforeunload` is by no means a requirement.  You can hook into any other event or logical point in your application to send the time spent information to the server.

If using a Single Page Application (SPA) design, TimeMe.js can have its timer stopped, page name switched, and the timer resumed (for the new page) with the following calls:

    TimeMe.stopTimer();
    // ... Now might be a good time to upload the time spent on the page to your server!
    // ... load up new page
    TimeMe.setCurrentPageName("new-page-name");
    TimeMe.startTimer();
	
All page times are tracked in TimeMe.js, so you can review total aggregate time spent on each page for a particular user's session:

    let timeSpentReport = TimeMe.getTimeOnAllPagesInSeconds();
	
This call will return an array of objects of page names and the corresponding aggregate
time spent on that page.

# What browsers are supported?
All major desktop and mobile browsers.

# How do I run the unit tests?
You'll need to install QUnit, which should be packaged with TimeMe.js if you performed a Bower install of TimeMe.js.  Once you have installed QUnit, you can simply open the test HTML files in a browser to execute the tests.

# API

### `TimeMe.initialize(options);`
    // options.currentPageName // - Optional. Name of the page (home, about, etc.).
    // options.idleTimeoutInSeconds // - Optional. How long before user is considered idle. Default is 30s.
    // options.initialStartTime // - Optional. Indicates start time for timer manually. Must be of type Date(). Default is *now*.
	// options.trackWhenUserLeavesPage // Optional. Must be type boolean. Default is true.
	// options.trackWhenUserGoesIdle // Optional. Must be type boolean. Default is true.
    // options.websocketOptions: { // Optional. Turn on websocket reporting.
    // 	 websocketHost: "ws://your_host:your_port",
    // 	 appId: "insert-your-made-up-app-id"
    // }

Initializes and starts first timer. Should only be called when first importing the library and beginning to time page usage. All config items are optional.



### `TimeMe.getTimeOnCurrentPageInSeconds();`
Retrieves the time spent (in seconds) on the current page.



### `TimeMe.getTimeOnPageInSeconds(pageName);`
Retrieves the time spent (in seconds) on the indicated page.



### `TimeMe.callAfterTimeElapsedInSeconds(timeInSeconds, callback);`
Sets up a handler that executes after the user has spent the specified time interacting with the page.



### `TimeMe.callWhenUserLeaves(callback, [[numberOfInvocations]]);`
Sets up a handler that executes when the user is no longer interacting with the page due to inactivity, switching tabs, or switching apps.  You can optionally provide numberOfInvocations to limit how many times this executes.


### `TimeMe.callWhenUserReturns(callback, [[numberOfInvocations]]);`
Sets up a handler that executes when the user returns to the page after inactivity, switching tabs, or switching apps.  You can optionally provide numberOfInvocations to limit how many times this executes.


### `TimeMe.trackTimeOnElement(elementId);`
Start timing all user activity on a certain element.  A timer will be created that tracks how long the user typed, clicked, moused over, or otherwised focused on this element. Must pass in the ID of the HTML element.

### `TimeMe.getTimeOnElementInSeconds(elementId);`
Retrieve the time spent by a user on a specific element. Must pass in the ID of the HTML element.

### `TimeMe.setCurrentPageName(newPageName);`
Sets the page name to be associated with any future calls to timer. 

### `TimeMe.setIdleDurationInSeconds(durationInSeconds);`
Sets the time (in seconds) that a user is idle before the timer is
turned off.  Set this value to -1 to disable idle time outs.

### `TimeMe.getTimeOnAllPagesInSeconds();`
Retrieves the time spent on all pages that have been recorded using TimeMe.js. Notice this only works for Single Page Applications (SPAs) where TimeMe.js is
only initialized once.

### `TimeMe.startTimer();`
Manually starts the timer for the current page.  Notice this only works if the timer is currently stopped.

### `TimeMe.stopTimer();`
Manually stops the timer.  Notice this only works if the timer is currently running.

### `TimeMe.resetRecordedPageTime(pageName);`
Clears the recorded time for the indicated page name.

### `TimeMe.resetAllRecordedPageTimes();`
Clears all recorded times for all pages.

				
# Build Tools
To minify the code, run the following:

    # install babel-minify if not already available
    npm install babel-minify -g
	
	# Minify the code    
    minify timeme.js --out-file timeme.min.js
	
