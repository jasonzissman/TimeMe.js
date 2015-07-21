QUnit.module("Basic Tests", {
	beforeEach: function() {
		TimeMe.resetAllRecordedPageTimes();
	},
	afterEach: function() {
		TimeMe.resetAllRecordedPageTimes();
	}  
});

QUnit.test("getTimeOnPage() returns undefined if timer not started.", function( assert ) {
	var actualTime = TimeMe.getTimeOnCurrentPageInSeconds();
	var expectedTime = undefined;
	assert.equal(actualTime, expectedTime, "Should return undefined if timer not started" );
});

QUnit.test("getTimeOnAllPagesInSeconds() returns empty array by default.", function( assert ) {
	var actualTimes = TimeMe.getTimeOnAllPagesInSeconds();
	var numberEntriesActualTimes = Object.keys(actualTimes).length;
	assert.equal(numberEntriesActualTimes, 0, "Should return empty array." );	
});

QUnit.test("startTimer() and stopTimer() keeps track of time spent.", function( assert ) {
	TimeMe.startTimer();
	TimeMe.stopTimer();
	var actualTime = TimeMe.getTimeOnCurrentPageInSeconds();
	assert.ok(actualTime !== undefined, "Should not be undefined since timer started/stopped." );
	assert.notOk(isNaN(actualTime), "Should be a number.");	
	assert.ok(actualTime >= 0, "Should be greater than or equals to 0." );
});