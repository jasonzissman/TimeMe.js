/*Copyright (c) 2017 Jason Zissman
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// TODO!!! Create helper function that simply calls down this code
// instead of telling users to put it in their code up front.

(function () {
	(function (root, factory) {
		if (typeof module !== 'undefined' && module.exports) {
			// CommonJS
			return module.exports = factory();
		} else if (typeof define === 'function' && define.amd) {
			// AMD
			define([], function () {
				return (root.TimeMe = factory());
			});
		} else {
			// Global Variables
			return root.TimeMe = factory();
		}
	})(this, function () {
		var TimeMe = {
			startStopTimes: {},
			idleTimeoutMs: 60 * 1000,
			currentIdleTimeMs: 0,
			checkIdleRateMs: 500,
			idle: false,
			currentPageName: "default-page-name",

			startTimer: function () {
				var pageName = TimeMe.currentPageName;

				if (TimeMe.startStopTimes[pageName] === undefined) {
					TimeMe.startStopTimes[pageName] = [];
				} else {
					var arrayOfTimes = TimeMe.startStopTimes[pageName];
					var latestStartStopEntry = arrayOfTimes[arrayOfTimes.length - 1];
					if (latestStartStopEntry !== undefined && latestStartStopEntry.stopTime === undefined) {
						// Can't start new timer until previous finishes.
						return;
					}
				}
				TimeMe.startStopTimes[pageName].push({
					"startTime": new Date(),
					"stopTime": undefined
				});
			},

			stopTimer: function () {
				var pageName = TimeMe.currentPageName;
				var arrayOfTimes = TimeMe.startStopTimes[pageName];
				if (arrayOfTimes === undefined || arrayOfTimes.length === 0) {
					// Can't stop timer before you've started it.
					return;
				}
				if (arrayOfTimes[arrayOfTimes.length - 1].stopTime === undefined) {
					arrayOfTimes[arrayOfTimes.length - 1].stopTime = new Date();
				}

			},

			getTimeOnCurrentPageInSeconds: function () {
				return TimeMe.getTimeOnPageInSeconds(TimeMe.currentPageName);
			},

			getTimeOnPageInSeconds: function (pageName) {
				var timeInMs = TimeMe.getTimeOnPageInMilliseconds(pageName);
				if (timeInMs === undefined) {
					return undefined;
				} else {
					return TimeMe.getTimeOnPageInMilliseconds(pageName) / 1000;
				}
			},

			getTimeOnCurrentPageInMilliseconds: function () {
				return TimeMe.getTimeOnPageInMilliseconds(TimeMe.currentPageName);
			},

			getTimeOnPageInMilliseconds: function (pageName) {

				var totalTimeOnPage = 0;

				var arrayOfTimes = TimeMe.startStopTimes[pageName];
				if (arrayOfTimes === undefined) {
					// Can't get time on page before you've started the timer.
					return;
				}

				var timeSpentOnPageInSeconds = 0;
				for (var i = 0; i < arrayOfTimes.length; i++) {
					var startTime = arrayOfTimes[i].startTime;
					var stopTime = arrayOfTimes[i].stopTime;
					if (stopTime === undefined) {
						stopTime = new Date();
					}
					var difference = stopTime - startTime;
					timeSpentOnPageInSeconds += (difference);
				}

				totalTimeOnPage = Number(timeSpentOnPageInSeconds);
				return totalTimeOnPage;
			},

			getTimeOnAllPagesInSeconds: function () {
				var allTimes = [];
				var pageNames = Object.keys(TimeMe.startStopTimes);
				for (var i = 0; i < pageNames.length; i++) {
					var pageName = pageNames[i];
					var timeOnPage = TimeMe.getTimeOnPageInSeconds(pageName);
					allTimes.push({
						"pageName": pageName,
						"timeOnPage": timeOnPage
					});
				}
				return allTimes;
			},

			setIdleDurationInSeconds: function (duration) {
				var durationFloat = parseFloat(duration);
				if (isNaN(durationFloat) === false) {
					TimeMe.idleTimeoutMs = TimeMe.idleTimeout * 1000;
				} else {
					throw {
						name: "InvalidDurationException",
						message: "An invalid duration time (" + duration + ") was provided."
					};
				}
			},

			setCurrentPageName: function (pageName) {
				TimeMe.currentPageName = pageName;
			},

			resetRecordedPageTime: function (pageName) {
				delete TimeMe.startStopTimes[pageName];
			},

			resetAllRecordedPageTimes: function () {
				var pageNames = Object.keys(TimeMe.startStopTimes);
				for (var i = 0; i < pageNames.length; i++) {
					TimeMe.resetRecordedPageTime(pageNames[i]);
				}
			},

			resetIdleCountdown: function () {
				if (TimeMe.idle) {
					TimeMe.startTimer();
				}
				TimeMe.idle = false;
				TimeMe.currentIdleTimeMs = 0;
			},

			checkIdleState: function () {
				if (TimeMe.idle === false && TimeMe.currentIdleTimeMs > TimeMe.idleTimeoutMs) {
					TimeMe.idle = true;
					TimeMe.stopTimer();
				} else {
					TimeMe.currentIdleTimeMs += TimeMe.checkIdleRateMs;
				}
			},

			visibilityChangeEventName: undefined,
			hiddenPropName: undefined,

			listenForVisibilityEvents: function () {

				if (typeof document.hidden !== "undefined") {
					TimeMe.hiddenPropName = "hidden";
					TimeMe.visibilityChangeEventName = "visibilitychange";
				} else if (typeof doc.mozHidden !== "undefined") {
					TimeMe.hiddenPropName = "mozHidden";
					TimeMe.visibilityChangeEventName = "mozvisibilitychange";
				} else if (typeof document.msHidden !== "undefined") {
					TimeMe.hiddenPropName = "msHidden";
					TimeMe.visibilityChangeEventName = "msvisibilitychange";
				} else if (typeof document.webkitHidden !== "undefined") {
					TimeMe.hiddenPropName = "webkitHidden";
					TimeMe.visibilityChangeEventName = "webkitvisibilitychange";
				}

				document.addEventListener(TimeMe.visibilityChangeEventName, function () {
					if (document[TimeMe.hiddenPropName]) {
						TimeMe.stopTimer();
					} else {
						TimeMe.startTimer();
					}
				}, false);

				document.addEventListener("mousemove", function () { TimeMe.resetIdleCountdown(); });
				document.addEventListener("keyup", function () { TimeMe.resetIdleCountdown(); });
				document.addEventListener("touchstart", function () { TimeMe.resetIdleCountdown(); });
				window.addEventListener("scroll", function () { TimeMe.resetIdleCountdown(); });

				setInterval(function () {
					TimeMe.checkIdleState();
				}, TimeMe.checkIdleRateMs);
			},

			websocket: undefined,
			websocketHost: undefined,
			appId: undefined,
			isBadAppId: function(appId) {
				return /[^a-z0-9\-_]/gi.test(appId);
			},
			setUpWebsocket: function (options) {
				if (options && !options.disableWebsockets) {
					if (!options.appId) {
						if (console) {
							console.error("A valid alphanumeric appId must be provided as an option to TimeMe.initialize() in order to leverage websockets. " + 
							"For trial purposes, you can provide any alphanumeric appId (with underscore or hyphen) of your choosing.  To see usage statistics, go to <TODO!!!>.  " +
							"To disable websockets and this message, provide a valid appId or call TimeMe.initialize() with disableWebsockets: true");
						}
					} else if (TimeMe.isBadAppId(options.appId)) {
						if (console) {
							console.error("A valid alphanumeric appId must be provided as an option to TimeMe.initialize(). " + 
							"The provided appId was invalid: " + options.appId);
						}
					} else {
						var websocketHost = options.websocketHost || "ws://bittermanjs.com:3008"; // TODO - real value!
						TimeMe.appId = options.appId;
						TimeMe.websocket = new WebSocket(websocketHost);
						window.onbeforeunload = function (event) {
							TimeMe.sendCurrentTime();
						};
						TimeMe.websocket.onopen = function(){
							TimeMe.sendInitWsRequest();
						}
						TimeMe.websocket.onerror = function(error) {
							if (console) {
								console.log("Error occurred in websocket connection: " + error);
							}
						}
						TimeMe.websocket.onmessage = function (event) {
							if (console) {
								console.log(event.data);
							}
						}	
					}
				}
			},
			websocketSend: function (data) {
				TimeMe.websocket.send(JSON.stringify(data));
			},
			sendCurrentTime: function () {
				var timeSpentOnPage = TimeMe.getTimeOnCurrentPageInMilliseconds();
				var data = {
					type: "INSERT_TIME",
					appId: TimeMe.appId,
					timeOnPageMs: timeSpentOnPage,
					pageName: TimeMe.currentPageName
				};
				TimeMe.websocketSend(data);
			},
			sendInitWsRequest: function() {
				var data = {
					type: "INIT",
					appId: TimeMe.appId
				};
				TimeMe.websocketSend(data);
			},
			initialize: function (options) {
				if (options && options.idleTimeoutInSeconds) {
					if (isNaN(options.idleTimeoutInSeconds) && options.idleTimeoutInSeconds < 1) {
						throw { 
							name: "InvalidTimeoutException", 
							message: "Any provided timeouts must be a valid integer greater than 0." }
					}
					TimeMe.idleTimeoutMs = options.idleTimeoutInSeconds * 1000;
				}
				TimeMe.listenForVisibilityEvents();
				TimeMe.startTimer();
				TimeMe.setUpWebsocket(options);				
			}
		};
		return TimeMe;
	});
}).call(this);