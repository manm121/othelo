function othelo(options){

	var self = this;

	//pre-requisite
	self.id = options.id;
	self.utility = new utility();
	self.exception = new exception();
	self.isBUSY = false;

	//check whether container exists or not
	var elem = document.getElementById(self.id);

	if(self.utility.isObjectEmpty(elem)){
		self.exception.error('Could not find container');
	}

	self.rows = 6;
	self.cols = 6;
	self.grid = {};
	self.move = 0;
	self.container = $(self.utility.ensureHash(self.id));
	self.dampContainer ="";
	self.allCells = [];
	self.score = {};

	self.createGrid = function(rows, cols){

			var tbl = $('<table></table>');

			//determine the dimension of each cell
			var containerWidth = self.container.width();
			var containerHeight = self.container.height();

			if(containerHeight == 0){
					containerHeight = $(window).height() - 100;
			}

			var commonDimension = containerWidth;
			if(containerHeight < containerWidth) commonDimension = containerHeight;

			var targetWidth = (commonDimension / rows) - 15;
			var targetHeight = commonDimension / cols;

			for(var row = 0; row < rows; row++){

				//create row
				var tr = $('<tr></tr>');
				tr.attr('id', 'row'+row);

				for(var col = 0; col < cols; col++){

					//create col
					var td = $('<td class="cell"><h5><small>'+ row + col +'</small></h5></td>');
					td.attr('id', 'col'+row.toString() + col.toString());
					tr.append(td);

					var bp = (targetWidth * .55) + 'px ' + (targetHeight * .15) + 'px' ;
					td.css({'height':targetHeight, 'width':targetWidth,'background-position':bp});
				}
				tbl.append(tr);
			}
			return tbl;
	};

	self.init = function(){

		self.container.html('');
		var grid = self.createGrid(self.rows, self.cols);
		grid.addClass('table table-bordered');
		self.container.append(grid);

		//restore all cells
		self.allCells = $('table tr td', self.container);

		//add a damp
		var damp = $('<span><span>');
		var _rand = self.utility.random(100, 999);
		damp.attr('id',['__damp__', _rand].join(''));
		self.container.append(damp);

		self.dampContainer = damp;
	};

	self.standardMarks = function(){

		var meanPosition = parseInt(self.rows/2 + '' + self.cols/2);

		var stdArr = [meanPosition, meanPosition-10, meanPosition-11, meanPosition-1];
		//var stdArr = [45, 44, 54, 55];
		while(stdArr.length > 0){

			var item = stdArr.pop();
			var i = parseInt(item/10);
			var j = parseInt(item%10);
		    var id = "#col"+i+j;
		    self.mark($(id), true);
		}
	};

	self.randomMarks = function(){

		var count=0;
		while(count++<8){
			var _rand = self.utility.random(0, 99);
			var i = parseInt(_rand/10);
			var j = parseInt(_rand%10);
		    var id = "#col"+i+j;
		    self.mark($(id), true);
		}
	};

	self.cpu = new cpu(options);
	function cpu(options){

		var me = this;

		me.isEnabled = false;

		me.settings = {
			enabled:false,
		}

		//merge
		me.settings = $.extend(me.settings, options);

		me.writableCellInfo = function(id){

			var rs = {};
			var cell = self.validity.getCell(id);

			//ideally..it shd never happen
			if($('#' + id).length == 0) return false;

			var val = self.grid[id];
			if(val === self.move || val === 1- self.move) return rs;

			var resultSet = self.movesResultSet(cell.r, cell.c, id);
			for(var o in resultSet){
				if(resultSet[o].isGood){
					rs = resultSet;
					break;
				}
			}

			return rs;
		};

		//lookout for the locations where  user cells are present
		me.makeMove = function(lastCell){

			var rs = [];
			for(var o in self.grid){

					if(self.move === self.grid[o]) continue; //opponent locations only

					//begin scouting all directions of a given opponent cell one by one ..
					var val = self.validity.getCell(o.toString());

					for (var i = 0; i < self.validity.directionMatrix.length; i++) {
							var d = self.validity.directionMatrix[i];
							var newId = d.delta(val.r, val.c);
							rs.push({'txt':d.direction, 'o': me.writableCellInfo(newId),'id':newId});
					};
			}

			//max scoring move
			var optimized = [], p = 0, l = 0, t;
			$.each(rs, function(i,x){
					if(x.o instanceof Array){
						  p = 0;
							$.each(x.o, function(j, y){
									if(y.isGood){
											p += y.cells.length;
											if(p > l){ l = p; t = x;}
									}
							});
					};
			});

			if(t){
						self.mark($('#'+t.id));
			} else{
				self.declareWinner();
			};

		}
	};

	//register cell clicks
	self.container.on('click','table tr td', function(e){

		if(self.isBUSY===true) return;

		self.isBUSY = true;

		var me = this;
		var isGood = self.mark($(me));
		if(isGood){

			var _ms = 7000;
			self.notification.info(self.messages.cpuThinking, _ms);
			self.delayExecute(_ms, self.cpu.makeMove);
		}else{
			self.isBUSY = false;
		}
	});

	self.delayExecute = function(milliseconds, code){//code should be a function

		self.dampContainer.hide(milliseconds, function(){

			code();
			self.dampContainer.show();
			self.isBUSY = false;
		});
	}

	self.evaluate = function(cell){

		var id = cell.attr('id');
		var cell = self.validity.getCell(id);
		var row = cell.r;
		var col = cell.c;

		self.validity.scoutDirections(row, col, id);
	};

	self.mark = function(cell, doNotValidate){
		var id = cell.attr('id');
		var stamp = id.replace('col','');
		var row = parseInt(stamp / 10);
		var col = parseInt(stamp % 10);

		//already claimed
		var cc  = self.grid[id];
		if(cc==0 || cc==1){
			return false;
		}

		var isGood = false;
		if(!doNotValidate){
			var resultSet = self.movesResultSet(row, col, id);

			$.each(resultSet, function(idx, elem){

				if(elem.isGood){

					if(!isGood) isGood = true;
					self.validity.paint(elem.cells);
					self.notification.flyers.add(cell, elem.cells.length);

					if(elem.cells.length > 9){
						self.notification.success(self.messages.success)
					}
				}
			});
		}

		if(isGood || doNotValidate){
			self.grid[id] = self.move;
			self.applyGraphics(cell, self.move);
			self.move = 1 - self.move;
			self.updatePlayerStats();
			cell.data('marked',true);
		}else{

			self.isBUSY = false;
			self.notification.warning(self.messages.invalidMove)
		}

		//see if game is Finished
		if(self.validity.noNewMoves()){
				self.validity.declareWinner();
		}

		return isGood;
	};

	self.imageSwatch = function(move){

		return move==0?'cell-black':'cell-white';
	};

	self.colorSwatch = function(move){

		return move==0?'white':'white';
	};

	self.movesResultSet = function(row, col, id){

		var resultSet = self.validity.scoutDirections(row, col, id);
		return resultSet;
	};

	self.getScore = function(){
		var p1 =0, p2 = 0;
		for(var o in self.grid){

			var val = self.grid[o];

			if(val == 0) p1++;
			else if(val == 1) p2++;
		}

		return {'p1':p1, 'p2':p2};
	};

	self.updatePlayerStats = function(){

		var tbl = $('#playerStats table');

		//whose move?
		$('tr:eq(0) td:eq(1)', tbl).text(self.move==0?'Yours':'CPU');
		//self.applyGraphics($('tr:eq(0) td:eq(1)', tbl), self.move)

		//update score
		self.score = self.getScore();

		//player 1
		$('tr:eq(1) td:eq(0)', tbl).css('backgroundColor', self.colorSwatch(0));
		$('tr:eq(1) td:eq(1)', tbl).text(self.score.p1);

		//player 2
		$('tr:eq(2) td:eq(0)', tbl).css('backgroundColor', self.colorSwatch(1));
		$('tr:eq(2) td:eq(1)', tbl).text(self.score.p2);
	};

	self.applyGraphics = function(cell, move){

		cell.removeClass('cell-black cell-white').addClass(self.imageSwatch(move));
	};

	function validity(){

		var me = this;

		me.paint = function(cells){

			if(self.utility.isObjectEmpty(cells))return;

			$.each(cells, function(idx, elem){
				self.grid[elem.id] = self.move;
				self.applyGraphics(elem.cell, self.move);
			});
		};

		me.directionMatrix = [
			{'direction':'HF', 'boundary':function(i,j){ return j < self.cols; }, 'delta':function(i,j){ return 'col' + i + ++j;}},
			{'direction':'HB', 'boundary':function(i,j){return j > 0;}, 'delta':function(i,j){ return 'col' + i + --j;}},
			{'direction':'VF', 'boundary':function(i,j){return i < self.rows;}, 'delta':function(i,j){ return 'col' + ++i + j;}},
			{'direction':'VB', 'boundary':function(i,j){return  i > 0}, 'delta':function(i,j){ return 'col' + --i + j;}},
			{'direction':'DNE', 'boundary':function(i,j){return i > 0 && j < self.cols;}, 'delta':function(i,j){ return 'col' + --i + ++j;}},
			{'direction':'DNW', 'boundary':function(i,j){return i >0 && j > 0;}, 'delta':function(i,j){ return 'col' + --i + --j;}},
			{'direction':'DSE', 'boundary':function(i,j){return i < self.rows && j < self.cols;}, 'delta':function(i,j){ return 'col' + ++i + ++j;}},
			{'direction':'DSW', 'boundary':function(i,j){return i < self.rows && j > 0 }, 'delta':function(i,j){ return 'col' + ++i + --j;}},
		];

		me.getCell = function(id){

			var stamp = id.replace('col','');
		  var row = parseInt(stamp / 10);
		  var col = parseInt(stamp % 10);
			return {'r':row, 'c':col};
		};

		me.scoutDirections = function(i, j, id){

		  var currentSymbol = self.move;
		  var resultSet = [];
		  for (var idx = 0; idx < me.directionMatrix.length; idx++) {

				  //copy the values
		      var ix = i, jx = j;

		      var counter = 0;
		      var d = me.directionMatrix[idx];
		      var doPaint = false;
		      var trackedCells = [];

		      while(d.boundary(ix,jx)){

							var newId = d.delta(ix,jx);

							//update the values just incremented above, to keep moving..
							var uv = me.getCell(newId);
							ix = uv.r; jx = uv.c;

		          var _sym = self.grid[newId];
		          if(_sym != currentSymbol && _sym != undefined){
		            trackedCells.push({'cell':$('#'+newId), 'id':newId});
		          }
		          else if(counter == 0)
		            break;

		          if(_sym == currentSymbol && _sym != undefined && counter != 0){
		            doPaint = true;
		            break;
		          }
		          counter++;
		      }

		      resultSet.push({'cells':trackedCells, 'isGood':doPaint, 'd':d.direction});
		  }

		  return resultSet;
		};

		me.noNewMoves = function(){

			//see if no empty cell left
			for (var i = 0; i < self.allCells.length; i++) {
					if(!$(self.allCells[i]).data('marked')){return false;};
			}

			//since there are empty cells available, see if no valid move left for the current player
				var emptyCells = self.allCells.filter(function(){ return !$(this).data('marked')});
				for (var i = 0; i < emptyCells.length; i++) {

						if(self.evaluate($(emptyCells[i]))){ return false;}
				};

			//reached this far...there must be no valid move left
			return true;
		};

		me.declareWinner = function(e){

				var msg = [(self.score.p1 > self.score.p2)?'You':'CPU',' won!'].join('');
				self.notification.success(msg, 10000);
		};
	};

	self.validity = new validity();
	self.notification = new notification({'id':options.notificationContainer})
	self.messages = new messages();
};

function utility(){

	var me = this;

	me.isObjectEmpty = function(val){

		if(val===undefined || val===null || val.length ===0)
			return true;

		return false;
	};

	me.ensureHash = function(id){

	 	return id.indexOf('#') > 0 ? id:'#'+id;
	};

	me.random = function(min, max){
		return Math.round(Math.random() * (max - min) + min);
	};

	function delayRoutines(){

		var that = this;
	};
};

function exception(){

	this.error = function(msg){

		throw new Error(msg);
	};
};

function notification(options){

	var me = this;

	function flyers(){

		var that = this;

		that.raw = function(cell, score){

			var offset = cell.offset();

			var margin = cell.width()/2;
			var html  = $('<span></span>');
			html.text(score);
			html.css({top:offset.top, left:offset.left + margin, position:'absolute'});
			html.addClass('score-flyer');
			return html;
		};

		that.add = function(cell, score){

			var html = that.raw(cell, score);

			$('body').append(html);

			html.animate({top:'0px'},1000, function(){
				html.remove();
			});
		};
	}

	me.settings ={

		closeAfter : 4000
	};

	me.utility = new utility();

	//merge
	me.settings = $.extend(me.settings, me.options);

	me.container = $('#' + options.id);

	me.flyers = new flyers();

	me.raw = function(msg, type, cssClass){

		var div = $('<div></div>');
		var closeBtn = $('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>');

		var msgContainer = $('<span>' + msg +'</span>');

		div.append(closeBtn);
		div.append(msgContainer);
		div.addClass(cssClass + ' alert-dismissible');
		return div;
	}

	me.error = function(msg, _closeAfter){

		if(!_closeAfter)
			_closeAfter = me.settings.closeAfter;

		me.generate(msg, 'Error', 'alert alert-danger', _closeAfter);
	};

	me.success = function(msg, _closeAfter){

		if(!_closeAfter)
			_closeAfter = me.settings.closeAfter;

		me.generate(msg, 'Success', 'alert alert-success', _closeAfter);
	};

	me.warning = function(msg, _closeAfter){

		if(!_closeAfter)
			_closeAfter = me.settings.closeAfter;

		me.generate(msg, 'Warning', 'alert alert-warning', _closeAfter);
	};

	me.info = function(msg, _closeAfter){

		if(!_closeAfter)
			_closeAfter = me.settings.closeAfter;

		me.generate(msg, 'Info', 'alert alert-info', _closeAfter);
	};

	me.activeQueue = [];

	me.generate = function(msg, type, cssClass, _closeAfter){

		var html = me.raw(msg, type, cssClass, _closeAfter);

		var uniqueId = '___notification___' + me.utility.random(10,999);

		html.attr('id', uniqueId);

		me.container.append(html);

		//me.activeQueue.push(uniqueId);

		setTimeout(function(){

			$('#' + uniqueId).fadeOut('slow');

		}, _closeAfter);
	};
};

function messages(){

	var me = this;

	me.won = 'Game Finished. {0} won';

	me.invalidMove = '<strong>Warning!</strong> You need to be more wise than that! Click a cell which might yield atleast a score of plus one!';

	me.success = '<strong>Yuhuuu!</strong> You nicked a jackpot there! Great move.';

	me.gameOver = '<strong>K.O.! No more valid moves left. </strong>';

	me.cpuThinking = 'Computer is thinking..';
};
