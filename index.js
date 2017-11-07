
var http = require('http');
var config = require('./config.json');
var url=require('url');
var jenkinsapi = require('jenkins-api');

// no auth
//var jenkins = jenkinsapi.init("http://jenkins.yoursite.com");

// username/password
//var jenkins = jenkinsapi.init("http://username:password@jenkins.yoursite.com");



var treeParams = '/api/json?pretty=true&tree=jobs[name,lastBuild[number,timestamp,result,changeSet[items[author[fullName]]]]]';
var jenkinsUrl = 'http://192.169.173.36/jenkins/job/Test/build?token=inder4';
var username = config.jenkinsUser;
var apiKey = config.jenkinsApiToken;
var jobName = config.jenkinsJobName;
var jenkinsPort = config.jenkinsPort;

// API Token
//var jenkins = jenkinsapi.init('https://'+':'+apiKey+'@'+jenkinsUrl);

exports.handler = function (event, context) {
    console.log("START function");
    console.log("event.session.application.applicationId=" + event.session.application.applicationId);

    try {
        if(event.request.type === "IntentRequest") {
            onIntent(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
                context.succeed(buildResponse(sessionAttributes, speechletResponse));
            });
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

function onIntent(intentRequest, session, callback){
    console.log("onIntent requestId=" + intentRequest.requestId + ", sessionId=" + session.sessionId);
    if ("TakeTheBuild" === intentRequest.intent.name) {        
        whoBrokeTheBuild(intentRequest.intent, session, callback);
    }
}

function whoBrokeTheBuild(intent, session, callback){

console.log("On TakeTheBuild");

var urlObject=url.parse(jenkinsUrl);
var http=require(url.parse(jenkinsUrl).protocol.replace(':',''));
    var req = http.get({
        method: 'GET',
        host: urlObject.hostname,
        port: urlObject.port,
        path: urlObject.path,
        auth: username + ':' + apiKey,
        headers:{
            'Content-Type':'application/json'
        }
    }, function(res) {
console.log(res);
        console.log("Returned response from jenkins");


       
            var cardTitle = intent.name;
        var repromptText = "";
        var sessionAttributes = {};
        var shouldEndSession = true;
        var speechOutput = "";
          
                speechOutput = "The build has started";
            return callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

      
    });

    req.on('error', function(){
        throw "Failed to contact jenkins";
    });

    req.end();
}

function getDesiredJob(jenkinsJson){
    var jobs = jenkinsJson['jobs'];
    var desiredJob = null;
    jobs.forEach(function(job){
        if(job.name === jobName){
            desiredJob = job;
            return;
        }
    });
    return desiredJob;
}

function getAuthorFromLastBuild(lastBuild){
    var changeSetItems = lastBuild.changeSet.items;
    if(changeSetItems.length > 0){
        var author = changeSetItems[0].author;
        return author.fullName;
    }
    return null;
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    }
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }
}