/*Copyright (c) 2015 Jason Zissman
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

/* 
	Notice!  This project requires ifvisible.js to run.  You can get a copy from
	the ifvisible.js github (https://github.com/serkanyersen/ifvisible.js) or
	by running "bower install timeme.js", which will install both TimeMe.js and ifvisible.js.
*/
(function () {
	(function (root, factory) {
		if (typeof module !== 'undefined' && module.exports) {
			// CommonJS
			return module.exports = factory(require('ifvisible.js'));
		} else if (typeof define === 'function' && define.amd) {
			// AMD
			define(['ifvisible'], function (ifvisible) {
				return (root.TimeMe = factory(ifvisible));
			});
		} else {
			// Global Variables
			return root.TimeMe = factory(root.ifvisible);
		}
	})(this, function (ifvisible) {
		var TimeMe = {
			startStopTimes: {},

			idleTimeout: 60,

			TimerID: "default",

			getIfVisibleHandle: function () {
				if (typeof ifvisible === 'object') {
					return ifvisible;
				} else {
					if (typeof console !== "undefined") {
						console.log("Required dependency (ifvisible.js) not found.  Make sure it has been included.");
					}
					throw {
						name: "MissingDependencyException",
						message: "Required dependency (ifvisible.js) not found.  Make sure it has been included."
					};
				}
			},

			startTimer: function (a) {
				if (typeof a == "undefined") {
					var TimerID = TimeMe.TimerID;
				} else {
					var TimerID = a;
				}
				if (TimeMe.startStopTimes[TimerID] === undefined) {
					TimeMe.startStopTimes[TimerID] = [];
					console.log("Timer(" + TimerID + ") has started.");

				} else {
					var arrayOfTimes = TimeMe.startStopTimes[TimerID];
					var latestStartStopEntry = arrayOfTimes[arrayOfTimes.length - 1];
					if (latestStartStopEntry !== undefined && latestStartStopEntry.stopTime === undefined) {
						// Can't start new timer until previous finishes.
						console.log("Can't start new timer(" + TimerID + ") until previous finishes.");
					}
				}
				TimeMe.startStopTimes[TimerID].push({
					"startTime": new Date(),
					"stopTime": undefined
				});
			},

			stopTimer: function (a) {
				if (typeof a == "undefined") {
					var TimerID = TimeMe.TimerID;
				} else {
					var TimerID = a.toString();
				}
				var arrayOfTimes = TimeMe.startStopTimes[TimerID];
				if (arrayOfTimes === undefined || arrayOfTimes.length === 0) {
					// Can't stop timer before you've started it.
					console.log("Can't stop timer(" + TimerID + ") before you've started it.");
				}
				if (arrayOfTimes[arrayOfTimes.length - 1].stopTime === undefined) {
					arrayOfTimes[arrayOfTimes.length - 1].stopTime = new Date();
					console.log("Timer(" + TimerID + ") has stopped.");
				}
			},
			// Get default time;
			getDefaultTimer: function () {
				var TimerID = TimeMe.TimerID;
				return TimeMe.getTimer(TimeMe.TimerID);
			},

			getTimer: function (a) {
				if (typeof a == "undefined") {
					var TimerID = TimeMe.TimerID;
				} else {
					var TimerID = a;
				}
				var totalTimeOnPage = 0;

				var arrayOfTimes = TimeMe.startStopTimes[TimerID];
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
					timeSpentOnPageInSeconds += (difference / 1000);
				}

				totalTimeOnPage = Number(timeSpentOnPageInSeconds);
				return totalTimeOnPage;
			},
			getAll: function () {
				var allTimes = [];
				var TimerIDs = Object.keys(TimeMe.startStopTimes);
				for (var i = 0; i < TimerIDs.length; i++) {
					var TimerID = TimerIDs[i];
					var timeOnPage = TimeMe.getTimer(TimerID);
					allTimes.push({
						"TimerID": TimerID,
						"timeOnPage": timeOnPage
					});
				}
				return allTimes;
			},

			setIdleDurationInSeconds: function (duration) {
				var durationFloat = parseFloat(duration);
				if (isNaN(durationFloat) === false) {
					TimeMe.getIfVisibleHandle().setIdleDuration(durationFloat);
					TimeMe.idleTimeout = durationFloat;
				} else {
					throw {
						name: "InvalidDurationException",
						message: "An invalid duration time (" + duration + ") was provided."
					};
				}
			},

			resetRecordedTimer: function (a) {
				if (typeof a == "undefined") {
					var TimerID = TimeMe.TimerID;
				} else {
					var TimerID = a;
				}
				delete TimeMe.startStopTimes[TimerID];
				TimeMe.startTimer(TimerID);
			},
			resetAllRecordedTimers: function () {
				var TimerIDs = Object.keys(TimeMe.startStopTimes);
				for (var i = 0; i < TimerIDs.length; i++) {
					TimeMe.resetRecordedTimer(TimerIDs[i]);
					TimeMe.startTimer(TimerIDs[i]);
				}
			},
			setDefaultID: function (a) {
				TimeMe.TimerID = a;
			},
			listenForVisibilityEvents: function (a) {
				if (typeof a == "undefined") {
					var TimerID = TimeMe.TimerID;
				} else {
					var TimerID = a;
				}
				TimeMe.getIfVisibleHandle().on("blur", function () {
					TimeMe.stopTimer(TimerID);
				});

				TimeMe.getIfVisibleHandle().on("focus", function () {
					TimeMe.startTimer(TimerID);
				});

				TimeMe.getIfVisibleHandle().on("idle", function () {
					if (TimeMe.idleTimeout > 0) {
						TimeMe.stopTimer(TimerID);
					}
				});

				TimeMe.getIfVisibleHandle().on("wakeup", function () {
					if (TimeMe.idleTimeout > 0) {
						TimeMe.startTimer(TimerID);
					}
				});
			},

			initialize: function (a) {
				if (typeof a == "undefined") {
					var TimerID = TimeMe.TimerID;
				} else {
					var TimerID = a;
				}

				TimeMe.listenForVisibilityEvents(TimerID);
				TimeMe.startTimer(TimerID);
			}
		};
		return TimeMe;
	});
}).call(this);
