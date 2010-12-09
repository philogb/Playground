/*
	Copyright (c)  Nicolas Garcia Belmonte http://blog.thejit.org/
*/

/*
     An object containing multiple type of transitions 
*/

var Trans = {
  linear: function(p){
    return p;
  }
};

(function(){

  var makeTrans = function(transition, params){
    params = typeof params == "array"? params : [params];
    var trans = {
      easeIn: function(pos){
        return transition(pos, params);
      },
      easeOut: function(pos){
        return 1 - transition(1 - pos, params);
      },
      easeInOut: function(pos){
        return (pos <= 0.5)? transition(2 * pos, params) / 2 : (2 - transition(
            2 * (1 - pos), params)) / 2;
      }
    };
	for(var p in trans) {
		transition[p] = trans[p];
	}
	return transition;
  };

  var transitions = {

    Pow: function(p, x){
      return Math.pow(p, x[0] || 6);
    },

    Expo: function(p){
      return Math.pow(2, 8 * (p - 1));
    },

    Circ: function(p){
      return 1 - Math.sin(Math.acos(p));
    },

    Sine: function(p){
      return 1 - Math.sin((1 - p) * Math.PI / 2);
    },

    Back: function(p, x){
      x = x[0] || 1.618;
      return Math.pow(p, 2) * ((x + 1) * p - x);
    },

    Bounce: function(p){
      var value;
      for ( var a = 0, b = 1; 1; a += b, b /= 2) {
        if (p >= (7 - 4 * a) / 11) {
          value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
          break;
        }
      }
      return value;
    },

    Elastic: function(p, x){
      return Math.pow(2, 10 * --p)
          * Math.cos(20 * p * Math.PI * (x[0] || 1) / 3);
    }

  };

  for(var p in transitions) {
	Trans[p] = makeTrans(transitions[p]);
  }

  for(var i=0, pows=['Quad', 'Cubic', 'Quart', 'Quint']; i<4; i++) {
	Trans[pows[i]] = makeTrans(function(p) {
		return Math.pow(p, [ i + 2 ]);
	});
  }

})();

var tween = {
  
  opt: {
	  transition: Trans.linear,
	  compute: function() {},
	  complete: function() {},
	  loop: 0,
	  loops: 0,
	  loopsDelay: 0
  },
  
  set: function(opt){
	for(var p in this.opt) {
		if(p in opt) this.opt[p] = opt[p];
	}
  },

  step: function(){
    var opt = this.opt;
	if(opt.loop <= opt.loopsDelay) {
		opt.loop++;
		return;
	}
    if (opt.loop <= opt.loops + opt.loopsDelay) {
      var delta = opt.transition((opt.loop - opt.loopsDelay) / opt.loops);
      opt.compute(delta);
	  opt.loop++;
    } else {
      opt.complete();
    }
  }

};
