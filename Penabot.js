// Greet the user 
var builder = require('botbuilder');

var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://api.projectoxford.ai/luis/v1/application?id=c413b2ef-382c-45bd-8ff0-f76d60e2a821&subscription-key=a3f39b84a0d34c70a220081bf6e3b5df&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });


/*
bot.dialog('/', [
    function(session) {
	        session.send("Hi, I'm Pena bot; I'm here to help you keep track of your hours. \n");
		  },
    function(session) {	
        builder.Prompts.text(session, "Hi, I'm Pena bot; I'm here to help you keep track of your hours. \n What's your name?");
    },
    function (session, results) {
	session.userData.name = results.response;
	session.send(" Ok, your name is %s ", session.userData.name);
    }             ], dialog);
*/

bot.dialog('/', dialog);

// Add intent handlers
/*dialog.matches('builtin.intent.alarm.set_alarm', builder.DialogAction.send('Creating Alarm'));
dialog.matches('builtin.intent.alarm.delete_alarm', builder.DialogAction.send('Deleting Alarm'));
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only create & delete alarms."));
*/

dialog.matches('builtin.intent.calendar.create_calendar_entry', 
	       [ function (session, args, next) {
		       // Resolve and store any entities passed from LUIS.
		       var title = builder.EntityRecognizer.findEntity(args.entities, 'builtin.calendar.title');
		       var time = builder.EntityRecognizer.resolveTime(args.entities);
		   
		       var calendar = session.dialogData.calendar = {
			   title : title ? title.entity : null,
			   timestamp : time ? time.getTime() : null
		       }

		       
		   // Prompt for title
		   if (!calendar.title) {
		       builder.Prompts.text(session, 'What kind of time was this (focused time, wasted time) ');
		   } else {
		       next();
		   }
	   },
	   function (session, results, next) {
		var calendar = session.dialogData.calendar;
		       if (results.response) {
			   calendar.title = results.response;
		       }
		       
		       // Prompt for time (title will be blank if the user said cancel)
		       if ( calendar.title && !calendar.timestamp) {
			   builder.Prompts.time(session, "What time are you recording about?");
		       } else {
			   next();
		       }
	   },
	   function (session, results) {
	       var calendar = session.dialogData.calendar;
	       if (results.response) {
		   var time = builder.EntityRecognizer.resolveTime([results.response]);
		   calendar.timestamp = time ? time.getTime() : null;
	       }

	       // Set the calendar entry (if title or timestamp is balnk the user said cancel)
	       if (calendar.title && calendar.timestamp) {
		   
		   // automatic array creation?
		   calendar_entries[calendar.title] = calendar; 

		   // Send confirmation to user
		   var date = new Date(calendar.timestamp);
		   var isAM = date.getHours() < 12;
		   session.send('Recording calendar entry named "%s" for %d/%d/%d %d:%02d%s',
				calendar.title,
				date.getMonth() + 1, date.getDate(), date.getFullYear(),
				isAM ? date.getHours() : date.getHours() - 12, date.getMinutes(),
				isAM ? 'am' : 'pm');
	       } else {
		   session.send('Ok... no problem.');
	       }

	   }]);
		
// show my calendar
// display my weekly calendar

dialog.matches('builtin.intent.calendar.find_calendar_entry', 
	       [ function (session, args, next) { 
		       // Resolve entities passed from LUIS.
		       var title;
		       var entity = builder.EntityRecognizer.findEntity( args.entities, 'builtin.calendar.title');
		       if (entity) {
			   // Verify its in our set of calendar entries.
			   title = builder.EntityRecognizer.findBestMatch(calendars, entity.entity);
		       }

		       // Prompt for calendar entry
		       if (!title) {
			   builder.Prompts.choice(session, 'Calendar entry not here!  Which one?', calendar_entries);
		       } else {
			   next({ response: title });
		       }
		   },
		   function (session, results) {
		       // If response is null the user canceled the task
		       if (results.response) {
			   session.send("Here is the calendar entry: '%s' ", results.response.entity);
		       } else {
			   session.send('Ok.  No problem.');
		       }
		   }
		   ]);
	     
// how long is my next meeting
// how many minutes long is my meeting this afternoon

dialog.matches('builtin.intent.calendar.find_duration',
	       [ function ( session, args, next) {
		       // Resolve entities passed from LUIS
		       var title;
		       var duration_t = builder.EntityRecognizer.findEntity( args.entities, 'builtin.calendar.duration');
		       var entity = builder.EntityRecognizer.findEntity( args.entities, 'builtin.calendar.title'); 
		       
		       if (entity) {
			   // Verify its in our set of calendar entries.
			   title = builder.EntityRecognizer.findBestMatch(calendars, entity.entity) ;
		       }

		       // Prompt for calendar entry
		       if (!title) {
			   builder.Prompts.choice(session, 'Calendar entry not here! Which one', calendar_entries);
		       } else {
			   next({ response: title });
		       }
		   },
		   function (session, results) {
		       // If response is null the user canceled the task
		       if (results.response) {
			   session.send("Here is the calendar entry: '%s' and the duration : '%s' ", results.response.entity, duration_t);
		       } else {
			   session.send("Ok.  No problem.");
		       }
		   }
		   ]);


// Very simple calendar entries 
var calendar_entries = {};
		       

