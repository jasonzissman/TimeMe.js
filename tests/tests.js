QUnit.module("Basic Tests", {
	beforeEach: function () {
		TimeMe.resetAllRecordedPageTimes();
	},
	afterEach: function () {
		TimeMe.resetAllRecordedPageTimes();
	}
});

QUnit.test("getTimeOnCurrentPage() scenario 1", function (assert) {

	// Assume one timer has been created for page "test-home-page". It was
	// started once at date=1500000000000 ms, and stopped at date=1500000001000 ms.

	var pageName = "test-home-page";
	TimeMe.startTimer(pageName, new Date(1500000000000));
	TimeMe.stopTimer(pageName, new Date(1500000001000));

	assert.equal(TimeMe.getTimeOnPageInSeconds(pageName), 1, "1s has elapsed");
	assert.equal(TimeMe.getTimeOnPageInMilliseconds(pageName), 1000, "1000ms have elapsed");
});

QUnit.test("getTimeOnCurrentPage() scenario 2", function (assert) {

	// Assume two overlapping timers have been created for page "test-home-page-1" 
	// and "test-home-page-2".

	var pageName1 = "test-home-page-1";
	var pageName2 = "test-home-page-2";
	TimeMe.startTimer(pageName1, new Date(1500000000000));
	TimeMe.startTimer(pageName2, new Date(1500000000000));
	TimeMe.stopTimer(pageName2, new Date(1500000003000));
	TimeMe.stopTimer(pageName1, new Date(1500000005000));

	assert.equal(TimeMe.getTimeOnPageInSeconds(pageName1), 5, "5s have elapsed");
	assert.equal(TimeMe.getTimeOnPageInMilliseconds(pageName1), 5000, "5000ms have elapsed");

	assert.equal(TimeMe.getTimeOnPageInSeconds(pageName2),3, "3s have elapsed");
	assert.equal(TimeMe.getTimeOnPageInMilliseconds(pageName2), 3000, "3000ms have elapsed");
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
	assert.ok(actualTime >= 0, "Should record time based on initialized point");
});

QUnit.test("startTimer() and stopTimer() reset the 'active' and 'idle' states", function (assert) {

	// Default state is not idle and not active
	assert.equal(TimeMe.active, false);
	assert.equal(TimeMe.idle, false);

	// When timer starts, should be active but not idle
	TimeMe.startTimer();	
	assert.equal(TimeMe.active, true);
	assert.equal(TimeMe.idle, false);

	// When timer stops, should not be active and not be idle
	TimeMe.stopTimer();
	assert.equal(TimeMe.active, false);
	assert.equal(TimeMe.idle, false);

	// When user goes idle, startTimer() should reset active back to true and idle back to false 
	TimeMe.idle = true; 
	TimeMe.startTimer();	
	assert.equal(TimeMe.active, true);
	assert.equal(TimeMe.idle, false);

	// When timer stops, should not be active and not be idle
	TimeMe.stopTimer();
	assert.equal(TimeMe.active, false);
	assert.equal(TimeMe.idle, false);
});

QUnit.test("startTimer() can accept an initialized startTime", function (assert) {
	var initTime = new Date() - 10000;
	TimeMe.startTimer(undefined, initTime);
	TimeMe.stopTimer();
	var actualTime = TimeMe.getTimeOnCurrentPageInSeconds();
	assert.ok(actualTime !== undefined, "Should not be undefined since timer started/stopped.");
	assert.ok(actualTime >= 10, "Should be greater than or equal to 10.");
});

QUnit.test("startTimer(): an initialized startTime should only be associated with a single 'page'", function (assert) {
	var pageName1 = "page-1";
	var pageName2 = "page-2";
	var initTime1 = new Date() - 10000;	

	TimeMe.startTimer(pageName1, initTime1);
	TimeMe.stopTimer(pageName1);
	TimeMe.startTimer(pageName2);
	TimeMe.stopTimer(pageName2);
	TimeMe.stopTimer(pageName2);
	var page1Time = TimeMe.getTimeOnPageInSeconds(pageName1);
	var page2Time = TimeMe.getTimeOnPageInSeconds(pageName2);

	assert.ok(page1Time !== undefined, "Should not be undefined since timer started/stopped.");
	assert.ok(page1Time >= 10, "Should be greater than or equal to 10s since an initTime was provided");
	assert.ok(page2Time !== undefined, "Should not be undefined since timer started/stopped.");
	assert.ok(page2Time < 10, "Should be less than 10s since we immediately started and stopped it.");
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
