//This is still work in progress
/*
Please report any bugs to nicomwaks@gmail.com

i have added console.log on line 48 




 */
'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token')
	}
})

const myID = 1867029276817111;

// to post data
app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
	    let event = req.body.entry[0].messaging[i]
	    let sender = event.sender.id

	    if (event.message && event.message.text && sender != myID) {
	    	let text = event.message.text
			request({
			    url: 'https://chatbot-flask-server.herokuapp.com/100',
			    method: 'POST',
			    body: {"message" : text.substring(0, 200)},
			    headers: {'User-Agent': 'request'},
				json: true 
			}, function(error, response, body) {
				sendTextMessage(sender, response.body)
			})
	    }
    }
    res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
const token = process.env.FB_PAGE_ACCESS_TOKEN
//const token = "<FB_PAGE_ACCESS_TOKEN>"

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
		json: {
		    recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
		    console.log('Error sending messages: ', error)
		} else if (response.body.error) {
		    console.log('Error: ', response.body.error)
	    }
    })
}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
