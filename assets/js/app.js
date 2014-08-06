var app = function() {
	var nickname = ''
		socket = null;

	this.init = function() {
		var self = this;

		var isWriting = false,
				writingPoll = 500,
				writeTimer;

		$('.writing form input.form-control').keypress(function(){
			if(!writeTimer){
				writeTimer = setInterval(emitWritingStatus, writingPoll);
			}
			isWriting = Date.now();
		});

		var emitWritingStatus = function(){
			if(isWriting != false && isWriting + writingPoll > Date.now()){
				self.socket.emit('user is writing', self.nickname);
			}else{
				self.socket.emit('user stopped writing', self.nickname);
				window.clearInterval(writeTimer);
				writeTimer = undefined;
				isWriting = false;
			}
		}

		$('.intro form').submit(function(e) {
			e.preventDefault();

			var nickname = $(this).find('.nickname').val();
			if (nickname.length < 1) {
				alert('Enter a nickname');
				return;
			}

			self.initIo();

			self.nickname = nickname;

			$('h5 span').text(nickname);
			$('.intro').fadeOut('fast', function() {
				$('.chat').fadeIn('fast');
				$('.writing input').focus();
			});

			self.socket.emit('user connect', self.nickname);		

		});

		$('.writing form').submit(function(e) {
			e.preventDefault();

			var message = $(this).find('input');
			if (message.length < 1) {
				alert('Enter a message');
				return;
			}

			self.socket.emit('chat message', message.val(), self.nickname);
			message.val('');
		});
	}

	this.initIo = function() {
		var self = this;
		this.socket = io();

		this.socket.on('chat message', function(msg, nickname) {
			$('.room ul').append('<li><cite>' + nickname + '</cite> <span>' + msg + '</span></li>');

			var room = $('.room');
			room.scrollTop(room[0].scrollHeight);
		});

		this.socket.on('user disconnect', function(nick) {
			$('.room ul').append('<li class="system">' + nick + ' has gone</li>');
			$('.userlist ul li#nick-'+ nick).remove();
		});

		this.socket.on('user connect', function(nick) {
			$('.room ul').append('<li class="system">' + nick + ' has joined</li>');
		});

		this.socket.on('user list', function(userlist){
			for(ui in userlist){
				var user = userlist[ui];
				if($('.userlist ul li#nick-'+ user).length == 0){
					$('.userlist ul').append('<li id="nick-'+ user +'">' + user + '</li>');
				}
			}
			sortUnorderedList('userlist');
		});

		this.socket.on('user is writing', function(nick) {
			if(nick == self.nickname){
				return;
			}
			$('.userlist ul li#nick-'+nick).addClass('isWriting');
		});

		this.socket.on('user stopped writing', function(nick) {
			$('.userlist ul li#nick-'+nick).removeClass('isWriting');
		});

	}

	this.init();
};

function sortUnorderedList(list){
	var $theList = $('#' + list + ' ul');
	console.log($theList);
	$theList.sort(function(a,b){
		var an = a.html(),
			bn = b.html();

		if(an > bn) {
			return 1;
		}
		if(an < bn) {
			return -1;
		}
		return 0;
	});
	console.log($theList);
}

$(document).ready(app);