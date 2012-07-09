/*
 *  Script to track my work hours automatically.
 *  Set up a 500m radius border around my workplace, and measuring the time spent within the area.
 *
 *  Testing on my way to work tomorrow :-)
 */


var myEmail = "mail@example.com";

var workplace = device.regions.createRegion({
	name:"Rotvoll", 
	latitude:  63.43915607186877, 
	longitude: 10.480849756066846, 
	radius:    500
});

var dailyWorkplaceCounter = 0;

var workplaceEntry = new Date(0);

device.regions.on("enter", function(signal) {
	dailyWorkplaceCounter += 1;
	workplaceEntry = new Date();
	var notification = device.notifications.createNotification("Entering workplace for the " + dailyWorkplaceCounter + ". time today. Enjoy!");
	notification.show();
});

device.regions.on("exit", function(signal) {
	var now = new Date();
	var remainingSeconds = (now.getTime() - workplaceEntry.getTime())/1000;
	var hours = remainingSeconds / (60*60) >> 0;
	remainingSeconds %= 60*60;
	var minutes = remainingSeconds / 60 >> 0;
	remainingSeconds %= 60;
	var seconds = remainingSeconds;

	var durationString = "" + hours + ":" + minutes + ":" + seconds;

	var notification = device.notifications.createNotification("Left work, you stayed for " + durationString);
	notification.show();

	// And send mail
	device.messaging.sendMail(
		{
			to: myEmail,
			subject: 'AUTO:WORKHOURS',
			body: "Arrived work at " + workplaceEntry.toString() + ".\nLeft work at " + now.toString() + ".\n\nTime spent: " + durationString
		},
		function (err) {
			console.log(err || 'mail was sent successfully');
		}
	);
});

var now = new Date();
var timerStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
var timerAction = function() {
	dailyWorkplaceCounter = 0;
};

device.scheduler.setTimer(
	{
		name : "midnightResetTimer",
		time : timerStart.getTime(),
		interval : "day",
		repeat : true,
		exact : false
	}, 
	timerAction);

device.regions.startMonitoring(workplace);