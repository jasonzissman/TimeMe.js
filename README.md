<h3>What is TimeMe.js?</h3>
TimeMe.js is a JavaScript library that accurately tracks how long users interact with a web page.
It disregards time spent on a web page if the user minimizes the browser or 
switches to a different tab.  This means a more accurate reflection of actual 'interaction' time by 
a user is being collected. 

Additionally, TimeMe.js disregards 'idle' time outs.  If the user goes 
idle (no page mouse movement, no page keyboard input) for a customizable period of time,
then TimeMe.js will automatically ignore this time. This means no time will be reported where a web page 
is open but the user isn't actually interacting with it (such as when they temporarily leave the computer).  

Furthermore - TimeMe supports tracking time for specific elements within a page.  This means you
can track and compare usage of different parts of the same web page.  Multiple concurrent timers
are supported.

These components put together create a much more accurate representation of how 
long users are actually using a web page.

<h3>Demo</h3>
You can see a demo of TimeMe.js 
<a target="_blank" href="http://timemejs.com/">here</a>.

<h3>How do I use TimeMe.js?</h3>
First, obtain a copy of timeme.js.  You can do so by pulling from our website 
or installing TimeMe.js via npm or Bower: <br/><br/>
<div class="code-block"><pre><code>// http://timemejs.com/timeme.min.js
npm install timeme.js --save
bower install timeme.js</pre></code></div><br/>
Then, simply include the following lines of code in your page's head element: <br/><br/>
<div class="code-block"><pre><code>&lt;script src="timeme.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript"&gt;
	TimeMe.initialize({
		currentPageName: "my-home-page", // current page
		idleTimeoutInSeconds: 30 // seconds
	});		
&lt;/script&gt;</code></pre>
</div><br/>
Notice that the code sets the idle duration to 30 seconds, which means 30 seconds of user
inactivity (no mouse or keyboard usage on the page) will stop the timer.  Also,
we define a page name (my-home-page) to associate with the current timer.
<br/><br/>
<b>Note</b>: You can time any activity that you want, not just page time.  Simply call the following code.
TimeMe will automatically discount any idle or inactive time.
<div class="code-block"><pre><code>TimeMe.startTimer("my-activity");
// ... some time later
TimeMe.stopTimer("my-activity");
var timeOnActivity = TimeMe.getTimeOnPageInSeconds("my-activity")</code></pre>
</div><br/>
<br/><br/>
See the <a href="#API">API documentation</a> below for
a complete breakdown of all of the available functionality.  The most basic
feature is to retrieve the time spent by the user on the current page:<br/><br/>
<div class="code-block">
	<pre><code>var timeSpentOnPage = TimeMe.getTimeOnCurrentPageInSeconds();</code></pre>
</div>
TimeMe gives you a hook to execute a function after a user has been interacting with your
page for a set period of time.  Simply call TimeMe.callAfterTimeElapsedInSeconds():
<div class="code-block">
<pre><code>TimeMe.callAfterTimeElapsedInSeconds(15, function(){
	console.log("The user has been using the page for 15 seconds! Let's prompt them with something.");
});</code></pre>
</div>
TimeMe also lets you execute code when a user leaves the page (due to switching tabs, inactivity, etc.) and
when he or she returns:
<div class="code-block">
<pre><code>// Executes the first 5 times a user leaves the page
TimeMe.callWhenUserLeaves(function(){
	console.log("The user is not currently viewing the page!");
}, 5);

// Executes every time a user returns
TimeMe.callWhenUserReturns(function(){
	console.log("The user has come back!");
});
</code></pre>
</div>
TimeMe also lets you track how long users are interacting with specific elements.  If the user moves
their mouse over, clicks, or types on an element (or its children), TimeMe will begin tracking that
interaction.  Multiple timers can run concurrently, so this does not impact other times that you've already
set up.
<div class="code-block">
<pre><code>// Start tracking activity on element with id 'area-of-interest-1'
TimeMe.trackTimeOnElement('area-of-interest-1');
// some time later...
var timeSpentOnElement = TimeMe.getTimeOnElementInSeconds('area-of-interest-1');
</code></pre>
</div>

<h3>What do I do with the time I've tracked?</h3>

In most cases you will want to store the time spent on a page for analytic purposes.  You will
likely need to send the time spent on a page to a back-end server. 

<h4>Using WebSockets to send times</h4>
TimeMe.js has websocket reporting built into it.  Your page will establish a websocket connection with your
websocket server.  TimeMe will end the connection and report the user's time when the user leaves. 
Simply provide a few arguments to the initialize() method to enable it:<pre><code>TimeMe.initialize({
	currentPageName: "my-home-page", // current page
	idleTimeoutInSeconds: 30, // seconds 
	websocketOptions: { // optional
		websocketHost: "ws://your_host:your_port",
		appId: "insert-your-made-up-app-id"
	}
});</code></pre>

<h4>Using standard http requests to send time</h4>
Alternatively you can issue an HTTP request to your back end server to report time.
Note: the following example sends an HTTP request during the the window.onbeforeunload event.
This approach may not work in all browsers as there is no guarantee that the request
will complete before the browser terminates it.<br/><br/>
<div class="code-block">
<pre><code>window.onbeforeunload = function (event) {
	xmlhttp=new XMLHttpRequest();
	xmlhttp.open("POST","ENTER_URL_HERE", true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	var timeSpentOnPage = TimeMe.getTimeOnCurrentPageInSeconds();
	xmlhttp.send(timeSpentOnPage);
};</code></pre>
</div><br/>
Using 'onbeforeunload' is by no means a requirement.  You can hook into any other event
or logical point in your application to send the time spent information to the server.
<br/><br/>
If using a Single Page Application (SPA) design, TimeMe.js can have its timer stopped,
page name switched, and the timer resumed (for the new page) with the following calls:<br/><br/>
<div class="code-block">
<pre><code>TimeMe.stopTimer();
// ... Now might be a good time to upload the time spent on the page to your server!
// ... load up new page
TimeMe.setCurrentPageName("new-page-name");
TimeMe.startTimer();</code></pre>
</div><br/>
All page times are tracked in TimeMe.js, so you can review total aggregate time
spent on each page for a particular user's session:<br/><br/>
<div class="code-block">
<pre><code>var timeSpentReport = TimeMe.getTimeOnAllPagesInSeconds();</code></pre>
</div><br/>
This call will return an array of objects of page names and the corresponding aggregate
time spent on that page.
</div>		
<div>
<h3>What browsers are supported?</h3>
All major desktop and mobile browsers.
</div>
<div>
<h3>How do I run the unit tests?</h3>		
You'll need to install QUnit, which should be packaged with TimeMe.js if you
performed a Bower install of TimeMe.js.  Once you have installed QUnit, you can simply
open the test files to execute the tests.
</div>
<div>
<div>
<a name="API"></a>
<h3>API</h3>
<div class="code-block">
<pre><code>TimeMe.initialize(options);
// options.currentPageName // - Name of the page (home, about, etc.)
// options.idleTimeoutInSeconds // - how much inactive time before user considered idle
// options.websocketOptions: { // Turn on websocket reporting
// 	 websocketHost: "ws://your_host:your_port",
// 	 appId: "insert-your-made-up-app-id"
// }</code></pre>
Initializes the timer.  Should only be called when first importing the
library and beginning to time page usage. All options are optional.
<br/><br/>
</div><br/>
<div class="code-block">
<pre><code>var timeInSeconds = TimeMe.getTimeOnCurrentPageInSeconds();</code></pre>
Retrieves the time spent (in seconds) on the current page.
<br/><br/>
</div><br/>
<div class="code-block">
<pre><code>var timeInSeconds = TimeMe.getTimeOnPageInSeconds(pageName);</code></pre>
Retrieves the time spent (in seconds) on the indicated page.
<br/><br/>
</div><br/>
<div class="code-block">
<pre><code>TimeMe.callAfterTimeElapsedInSeconds(timeInSeconds, callback);</code></pre>
Sets up a handler that executes after the user has spent the specified time interacting with the page.
<br/><br/>
</div><br/>
<div class="code-block">
<pre><code>TimeMe.callWhenUserLeaves(callback, [[numberOfInvocations]]);</code></pre>
Sets up a handler that executes when the user is no longer interacting with the page due to inactivity,
switching tabs, or switching apps.  You can optionally provide numberOfInvocations to limit how many times this executes.
</div><br/>
<div class="code-block">
<pre><code>TimeMe.callWhenUserReturns(callback, [[numberOfInvocations]]);</code></pre>
Sets up a handler that executes when the user returns to the page after inactivity,
switching tabs, or switching apps.  You can optionally provide numberOfInvocations to limit how many times this executes.<br/><br/>
</div><br/>
<div class="code-block">
<pre><code>TimeMe.trackTimeOnElement(elementId);</code></pre>
Start timing all user activity on a certain element.  A timer will be created that tracks how long
the user typed, clicked, moused over, or otherwised focused on this element.<br/><br/>
</div><br/>
<div class="code-block">
<pre><code>TimeMe.getTimeOnElementInSeconds(elementId);</code></pre>
Retrieve the time spent by a user on a specific element.<br/><br/>
</div><br/>
<div class="code-block">
<pre><code>TimeMe.setCurrentPageName(newPageName);</code></pre>
Sets the page name to be associated with any future calls to timer. 
<br/><br/>
</div><br/>			
<div class="code-block">
<pre><code>TimeMe.setIdleDurationInSeconds(durationInSeconds);</code></pre>
Sets the time (in seconds) that a user is idle before the timer is
turned off.  Set this value to -1 to disable idle time outs.
<br/><br/>
</div><br/>		
<div class="code-block">
<pre><code>var timeSpentInfo = TimeMe.getTimeOnAllPagesInSeconds();</code></pre>
Retrieves the time spent on all pages that have been recorded using TimeMe.js.
Notice this only works for Single Page Applications (SPAs) where TimeMe.js is
only initialized once.
<br/><br/>
</div><br/>	
<div class="code-block">
<pre><code>TimeMe.startTimer();</code></pre>
Manually starts the timer for the current page.  Notice this only works if the
timer is currently stopped.
<br/><br/>
</div><br/>	
<div class="code-block">
<pre><code>TimeMe.stopTimer();</code></pre>
Manually stops the timer.  Notice this only works if the timer is currently running.
<br/><br/>
</div><br/>
<div class="code-block">
<pre><code>TimeMe.resetRecordedPageTime(pageName);</code></pre>
Clears the recorded time for the indicated page name.
<br/><br/>
</div><br/>	
<div class="code-block">
<pre><code>TimeMe.resetAllRecordedPageTimes();</code></pre>
Clears all recorded times for all pages.
<br/><br/>
</div><br/>				
</div>		
<h3>Build Tools</h3>
To minify the code, run the following:
<div class="code-block">
<pre><code>npm install uglify-js -g
uglifyjs timeme.js --mangle --compress --support-ie8 --output timeme.min.js</code></pre>
<br/><br/>
</div><br/>	
