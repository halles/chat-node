var express = require('express'),
	app = express(),
	http = require('http'),

	server = http.Server(app),
	io = require('socket.io').listen(server);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/assets'));
app.locals.pretty = true;

app.get('/', function(request, response) {
	response.render('index', {
		title: 'Chat eClass'
	});
});

var userlist = [];

io.on('connection', function(socket){
	
	console.log('se conecto un usuario');

	socket.on('chat message', function(msg, nick) {
		io.emit('chat message', msg, nick);
	});

	socket.on('disconnect', function() {
		console.log(userlist);
		for(i in userlist){
			console.log(socket.nick);
			if(userlist[i] == socket.nick){
				userlist.splice(i,1);
			}
		}
		console.log(userlist);
		io.emit('user list', userlist);
		io.emit('user disconnect', socket.nick);
	});

	socket.on('user connect', function(nick) {
		socket.nick = nick;
		userlist.push(nick);
		console.log(userlist);
		io.emit('user list', userlist);
		io.emit('user connect', socket.nick);
	});

	socket.on('user is writing', function(nick){
		console.log(nick + 'is writing');
		io.emit('user is writing', socket.nick);
	});

	socket.on('user stopped writing', function(nick){
		console.log(nick + 'stopped writing');
		io.emit('user stopped writing', socket.nick);
	});

});


server.listen(3000, function() {
    console.log('Escuchando en el puerto %d', server.address().port);
});