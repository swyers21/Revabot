'use strict';

// Imports
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});

// Close dialog with the customer, reporting fulfillmentState of Failed or Fulfilled ("Thanks, your pizza will arrive in 20 minutes")
function ask(type, sessionAttributes, fulfillmentState, message, responseCard) {
    var json = {
        sessionAttributes,
        dialogAction: {
            type: type,
            fulfillmentState,
            message,
			responseCard,
        },
    };
	console.log(json);
	return json;
}
 
// Global Variables
var msg, user_resp;
var zip1, zip2;
var bedrooms, bathrooms, area;
var user_email, user_phone;

// Contexts
var yes_no_context = false;

// --------------- Events -----------------------
function dispatch(intentRequest, callback) {
    msg = "Sorry Sir, I didn't get what you said.";
	user_resp = intentRequest.inputTranscript;
    
	const sessionAttributes = intentRequest.sessionAttributes;
	const slots = intentRequest.currentIntent.slots;
	
	switch(intentRequest.currentIntent.name){
		case "welcomeIntent":
			msg = "Great, how may I assist you?";
			user_phone = slots.phone;
			break;
			
		case "get_zip_codes":
			msg = "Thanks, what’s important to you? (Square footage, bedrooms, bathrooms)?";
			zip1 = slots.zip_code_a;
			zip2 = slots.zip_code_b;
			
			//console.log(zip1);
			//console.log(zip2);
		
			break;
			
		case "get_important_info":
			msg = "Got it, what’s a good email address to have the list sent over to?";
			bedrooms 	= slots.bedrooms;
			bathrooms 	= slots.bathrooms;
			area 		= slots.area;
			
			break;
			
		case "getEmailAddress":
			msg = "You want to live in " + zip1 + " , " + zip2 + ", and are looking for a home with " + area + " sqft, " + bedrooms + " bedrooms, and " + bathrooms + " bathrooms. Is this Correct? I just want to be sure. Let me look and see how many homes are in that area.";
			user_email = slots.custEmailAddress;
			
			yes_no_context = true;
			
			//console.log(user_email);
			break;
			
		case "fallback_intent":
			console.log(yes_no_context);
			
			if(yes_no_context){
				if(user_resp.toLowerCase() == "yes"){
					msg = "ok I'll get your list over to you shortly.";
					// Store into the DB
					add_to_db();
				}
				else if(user_resp.toLowerCase() == "no"){
					msg = "What needs to be changed?";
				}
				
				yes_no_context = false;
			}
			break;
			
	}
	
	
	if(msg == "Sorry Sir, I didn't get what you said."){
		console.log("User Response: " + user_resp);
		console.log("Bot Response: " + msg);
	}
	
	
	//console.log(msg);
    callback(ask('Close', sessionAttributes, 'Fulfilled', {'contentType': 'PlainText', 'content': msg}));
    
}
 
// --------------- Main handler -----------------------
 
// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    //console.log(event);
    //console.log(context);
    //console.log(callback);
	
	
    
    try {
        dispatch(event,
            (response) => {
                callback(null, response);
            });
    } catch (err) {
        callback(err);
    }
};


function add_to_db(){
	/* This example adds a new item to the Music table. */

	var params = {
		Item: {
			id: Date.now(),
			"Zip_Code_A": zip1,
			"Zip_Code_B": zip2,
			"Bedrooms": bedrooms,
			"Bathrooms": bedrooms,
			"Area": area,
			"Email": user_email,
			"Phone Number": user_phone,
		}, 
		
		TableName: "Marketing_Data"
	};
	docClient.put(params, function(err, data) {
		if (err) 
			console.log(err, err.stack); // an error occurred
		else     
			console.log(data);           // successful response
	});
	
}

