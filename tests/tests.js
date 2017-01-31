QUnit.module("Basic Tests", {
	beforeEach: function () {
		TimeMe.resetAllRecordedPageTimes();
	},
	afterEach: function () {
		TimeMe.resetAllRecordedPageTimes();
	}
});

QUnit.test("getTimeOnPage() returns undefined if timer not started.", function (assert) {
	var actualTime = TimeMe.getTimeOnCurrentPageInSeconds();
	var expectedTime = undefined;
	assert.equal(actualTime, expectedTime, "Should return undefined if timer not started");
});

QUnit.test("getTimeOnAllPagesInSeconds() returns empty array by default.", function (assert) {
	var actualTimes = TimeMe.getTimeOnAllPagesInSeconds();
	var numberEntriesActualTimes = Object.keys(actualTimes).length;
	assert.equal(numberEntriesActualTimes, 0, "Should return empty array.");
});

QUnit.test("startTimer() and stopTimer() keeps track of time spent.", function (assert) {
	TimeMe.startTimer();
	TimeMe.stopTimer();
	var actualTime = TimeMe.getTimeOnCurrentPageInSeconds();
	assert.ok(actualTime !== undefined, "Should not be undefined since timer started/stopped.");
	assert.notOk(isNaN(actualTime), "Should be a number.");
	assert.ok(actualTime >= 0, "Should be greater than or equal to 0.");
});

QUnit.test("startTimer() and stopTimer() keeps track of time spent on specific pages.", function (assert) {
	TimeMe.setCurrentPageName("first page");
	TimeMe.startTimer();
	TimeMe.stopTimer();

	TimeMe.setCurrentPageName("second page");
	TimeMe.startTimer();
	TimeMe.stopTimer();

	var actualTimes = TimeMe.getTimeOnAllPagesInSeconds();
	var expectedNumberOfEntries = 2;
	assert.equal(actualTimes.length, expectedNumberOfEntries, "Should have two entries, one for each page");

	assert.equal(actualTimes[0].pageName, "first page", "First response should be first page");
	assert.equal(actualTimes[1].pageName, "second page", "Second response should be second page");
});

QUnit.test("resetAllRecordedPageTimes() should clear out all times.", function (assert) {
	TimeMe.setCurrentPageName("first page");
	TimeMe.startTimer();
	TimeMe.stopTimer();

	TimeMe.setCurrentPageName("second page");
	TimeMe.startTimer();
	TimeMe.stopTimer();

	var actualTimes = TimeMe.getTimeOnAllPagesInSeconds();
	assert.equal(actualTimes.length, 2, "Should have two entries.");

	TimeMe.resetAllRecordedPageTimes();
	var actualTimes = TimeMe.getTimeOnAllPagesInSeconds();
	var expectedNumberOfEntries = 0;
	assert.equal(actualTimes.length, expectedNumberOfEntries, "Should have no entries since we cleared them out.");
});

QUnit.test("startTimer() is ignored the second time when called twice without stopping.", function (assert) {
	TimeMe.startTimer();
	TimeMe.startTimer();
	TimeMe.stopTimer();
	var actualTime = TimeMe.getTimeOnCurrentPageInSeconds();
	assert.ok(actualTime !== undefined, "Should not be undefined since timer started/stopped.");
	assert.ok(actualTime >= 0, "Should be greater than or equal to 0.");
});

QUnit.test("stopTimer() is ignored the second time when called twice without stopping.", function (assert) {
	TimeMe.startTimer();
	TimeMe.stopTimer();
	TimeMe.stopTimer();
	var actualTime = TimeMe.getTimeOnCurrentPageInSeconds();
	assert.ok(actualTime !== undefined, "Should not be undefined since timer started/stopped.");
	assert.ok(actualTime >= 0, "Should be greater than or equal to 0.");
});

QUnit.test("initialize() should start timer", function (assert) {
	TimeMe.initialize();
	TimeMe.stopTimer();
	var actualTime = TimeMe.getTimeOnCurrentPageInSeconds();
	assert.ok(actualTime !== undefined, "Should not be undefined since timer started/stopped.");
	assert.ok(actualTime >= 0, "Should be greater than or equal to 0.");
});

QUnit.test("callWhenUserLeaves() should execute only once if indicated", function (assert) {
	var counter = 0;
	TimeMe.callWhenUserLeaves(function () {
		counter++;
	}, 1);
	assert.equal(counter, 0);

	TimeMe.active = true;
	TimeMe.triggerUserHasLeftPage();
	assert.equal(counter, 1);

	TimeMe.active = true;
	TimeMe.triggerUserHasLeftPage();
	assert.equal(counter, 1);

	TimeMe.active = true;
	TimeMe.triggerUserHasLeftPage();
	assert.equal(counter, 1);
});
QUnit.test("callWhenUserLeaves() should execute repeatedly if no limit specified", function (assert) {
	var counter = 0;
	TimeMe.callWhenUserLeaves(function () {
		counter++;
	});
	assert.equal(counter, 0);

	TimeMe.active = true;
	TimeMe.triggerUserHasLeftPage();
	assert.equal(counter, 1);

	TimeMe.active = true;
	TimeMe.triggerUserHasLeftPage();
	assert.equal(counter, 2);

	TimeMe.active = true;
	TimeMe.triggerUserHasLeftPage();
	assert.equal(counter, 3);
});
QUnit.test("callWhenUserReturns() should execute only once if indicated", function (assert) {
	var counter = 0;
	TimeMe.callWhenUserReturns(function () {
		counter++;
	}, 1);
	assert.equal(counter, 0);

	TimeMe.active = false;
	TimeMe.triggerUserHasReturned();
	assert.equal(counter, 1);

	TimeMe.active = false;
	TimeMe.triggerUserHasReturned();
	assert.equal(counter, 1);

	TimeMe.active = false;
	TimeMe.triggerUserHasReturned();
	assert.equal(counter, 1);
});
QUnit.test("callWhenUserReturns() should execute repeatedly if no limit specified", function (assert) {
	var counter = 0;
	TimeMe.callWhenUserReturns(function () {
		counter++;
	});
	assert.equal(counter, 0);

	TimeMe.active = false;
	TimeMe.triggerUserHasReturned();
	assert.equal(counter, 1);

	TimeMe.active = false;
	TimeMe.triggerUserHasReturned();
	assert.equal(counter, 2);

	TimeMe.active = false;
	TimeMe.triggerUserHasReturned();
	assert.equal(counter, 3);
});
QUnit.test("stopAllTimers() should stop all timers", function (assert) {
	var done = assert.async();

	TimeMe.startTimer("my-1st-timer");
	TimeMe.startTimer("my-2nd-timer");
	TimeMe.startTimer("my-3rd-timer");

	setTimeout(function () {

		TimeMe.stopAllTimers();

		var originalTime1 = TimeMe.getTimeOnPageInMilliseconds("my-1st-timer");
		var originalTime2 = TimeMe.getTimeOnPageInMilliseconds("my-2nd-timer");
		var originalTime3 = TimeMe.getTimeOnPageInMilliseconds("my-3rd-timer");

		assert.ok(originalTime1 > 9);
		assert.ok(originalTime2 > 9);
		assert.ok(originalTime3 > 9);

		setTimeout(function () {
			assert.equal(TimeMe.getTimeOnPageInMilliseconds("my-1st-timer"), originalTime1);
			assert.equal(TimeMe.getTimeOnPageInMilliseconds("my-2nd-timer"), originalTime2);
			assert.equal(TimeMe.getTimeOnPageInMilliseconds("my-3rd-timer"), originalTime3);
			done();
		}, 10);

	}, 10);

	
});