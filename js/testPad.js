
me.directionMatrix = [
  {'direction':'horizontalForward', 'boundary':'i < self.row && j < self.col', 'delta':function(i,j){ return 'col' + i + ++j;}},
  {'direction':'horizontalBackward', 'boundary':'j>0', 'delta':function(i,j){ return 'col' + i + --j;}},
  {'direction':'verticalForward', 'boundary':'i < self.row', 'delta':function(i,j){ return 'col' + ++i + j;}},
  {'direction':'verticalBackward', 'boundary':'i > self.row', 'delta':function(i,j){ return 'col' + --i + j;}},
  {'direction':'diagNorthEast', 'boundary':'i > 0 && j < self.col', 'delta':function(i,j){ return 'col' + --i + ++j;}},
  {'direction':'diagNorthWest', 'boundary':'i >0 && j 0', 'delta':function(i,j){ return 'col' + --i + --j;}},
  {'direction':'diagSouthEast', 'boundary':'i < self.row && j < self.col', 'delta':function(i,j){ return 'col' + ++i + ++j;}},
  {'direction':'diagSouthWest', 'boundary':'i < self.row && j < self.col', 'delta':function(i,j){ return 'col' + i + ++j;}},
  {'direction':'horizontalForward', 'boundary':'i < self.row && j > self.col', 'delta':function(i,j){ return 'col' + ++i + --j;}},
];

me.commonMove = function(i, j, id){

  var currentSymbol = self.move;
  var resultSet = {};
  for (var idx = 0; idx < me.directionMatrix.length; idx++) {

      var ix = i, jx = j;
      var counter = 0;
      var d = me.directionMatrix[idx];
      var doPaint = false;
      var trackedCells = [];

      while(eval(d['boundary'])){

          var newId = d.delta(ix,jx);
          var _sym = self.grid[newId];
          if(_sym != currentSymbol && _sym != undefined){
            trackedCells.push({'cell':$('#'+newId),'id':newId});
          }
          else if(counter == 0)
            break;

          if(_sym == currentSymbol && _sym == undefined && counter != 0){
            doPaint = true;
            break;
          }
          counter++;
      }

      resultSet.push({'cells':trackedCells, 'doPaint':doPaint, 'd':d.direction});
  }

  return resultSet;
}

me.horizontalForward = function(i, j, id){

  var currentSymbol = self.move;
  var counter = 0;
  var doPaint = false;
  var trackedCells = [];
  while(i < 10 && j < 10){

    var newId = 'col' + i + ++j;

    var _sym = self.grid[newId];

    if(_sym!=currentSymbol && _sym!==undefined){

      trackedCells.push({'cell':$('#'+newId), 'id':newId});
    }
    else if(counter==0)
      break;

    if(_sym == currentSymbol && _sym!==undefined && counter != 0){
      doPaint = true;
      break;
    }
    counter++;
  };

  //if(doPaint && !self.utility.isObjectEmpty(trackedCells))
  //	me.paint(trackedCells);

  return {'isGood':doPaint, cells:trackedCells};
};

me.horizontalBackward = function(i, j, id){

  var currentSymbol = self.move;
  var counter = 0;
  var doPaint = false;
  var trackedCells = [];

  while(j > 0){

    var newId = 'col' + i + --j;

    var _sym = self.grid[newId];
    if(_sym!=currentSymbol && _sym!==undefined){

      trackedCells.push({'cell':$('#'+newId), 'id':newId});
    }
    else if(counter==0)
      break;

    if(_sym==currentSymbol && _sym!==undefined && counter!=0) {
      doPaint = true;
      break;
    }
    counter++;
  };

  //if(doPaint && !self.utility.isObjectEmpty(trackedCells))
  //	me.paint(trackedCells);

  return {'isGood':doPaint, cells:trackedCells};
};

me.verticalForward = function(i, j, id){

  var currentSymbol = self.move;
  var counter = 0;
  var doPaint = false;
  var trackedCells = [];

  while(i < 10){

    var newId = 'col' + ++i + j;

    var _sym = self.grid[newId];
    if(_sym!=currentSymbol && _sym!==undefined){

      trackedCells.push({'cell':$('#'+newId), 'id':newId});
    }
    else if(counter==0)
      break;

    if(_sym==currentSymbol && _sym!==undefined && counter!=0){
      doPaint = true;
      break;
    }
    counter++;
  };

  //if(doPaint && !self.utility.isObjectEmpty(trackedCells))
  //	me.paint(trackedCells);

  return {'isGood':doPaint, cells:trackedCells};
};

me.verticalBackward = function(i, j, id){

  var currentSymbol = self.move;
  var counter = 0;
  var doPaint = false;
  var trackedCells = [];

  while(i > 0){

    var newId = 'col' + --i + j;

    var _sym = self.grid[newId];
    if(_sym!=currentSymbol && _sym!==undefined){

      trackedCells.push({'cell':$('#'+newId), 'id':newId});
    }
    else if(counter==0)
      break;

    if(_sym==currentSymbol && _sym!==undefined && counter!=0){
      doPaint = true;
      break;
    }
    counter++;
  };

  //if(doPaint && !self.utility.isObjectEmpty(trackedCells))
  //	me.paint(trackedCells);

  return {'isGood':doPaint, cells:trackedCells};
};

me.diagNorthEast = function(i, j, id){

  var currentSymbol = self.move;
  var counter = 0;
  var doPaint = false;
  var trackedCells = [];

  while(i > 0 && j<10){

    var newId = 'col' + --i + ++j;

    var _sym = self.grid[newId];
    if(_sym!=currentSymbol && _sym!==undefined){

      trackedCells.push({'cell':$('#'+newId), 'id':newId});
    }
    else if(counter==0)
      break;

    if(_sym==currentSymbol  && _sym!==undefined && counter!=0){
      doPaint = true;
      break;
    }
    counter++;
  };

  //if(doPaint && !self.utility.isObjectEmpty(trackedCells))
  //	me.paint(trackedCells);

  return {'isGood':doPaint, cells:trackedCells};
};

me.diagNorthWest = function(i, j, id){

  var currentSymbol = self.move;
  var counter = 0;
  var doPaint = false;
  var trackedCells = [];

  while(i > 0 && j > 0){

    var newId = 'col' + --i + --j;

    var _sym = self.grid[newId];
    if(_sym!=currentSymbol && _sym!==undefined){

      trackedCells.push({'cell':$('#'+newId), 'id':newId});
    }
    else if(counter==0)
      break;

    if(_sym==currentSymbol && _sym!==undefined && counter!=0){
      doPaint = true;
      break;
    }
    counter++;
  };

  //if(doPaint && !self.utility.isObjectEmpty(trackedCells))
  //	me.paint(trackedCells);

  return {'isGood':doPaint, cells:trackedCells};
};

me.diagSouthEast = function(i, j, id){

  var currentSymbol = self.move;
  var counter = 0;
  var doPaint = false;
  var trackedCells = [];

  while(i < 10 && j<10){

    var newId = 'col' + ++i + ++j;

    var _sym = self.grid[newId];
    if(_sym!=currentSymbol && _sym!==undefined){

      trackedCells.push({'cell':$('#'+newId), 'id':newId});
    }
    else if(counter==0)
      break;

    if(_sym==currentSymbol && _sym!==undefined && counter!=0){
      doPaint = true;
      break;
    }
    counter++;

  };

  //if(doPaint && !self.utility.isObjectEmpty(trackedCells))
  //	me.paint(trackedCells);

  return {'isGood':doPaint, cells:trackedCells};
};

me.diagSouthWest = function(i, j, id){

  var currentSymbol = self.move;
  var counter = 0;
  var doPaint = false;
  var trackedCells = [];

  while(i < 10 && j > 0){

    var newId = 'col' + ++i + --j;

    var _sym = self.grid[newId];
    if(_sym!=currentSymbol && _sym!==undefined){

      trackedCells.push({'cell':$('#'+newId), 'id':newId});
    }
    else if(counter==0)
      break;

    if(_sym==currentSymbol && _sym!==undefined && counter!=0){
      doPaint = true;
      break;
    }

    counter++;
  };

  //if(doPaint && !self.utility.isObjectEmpty(trackedCells))
  //	me.paint(trackedCells);

  return {'isGood':doPaint, cells:trackedCells};
};
