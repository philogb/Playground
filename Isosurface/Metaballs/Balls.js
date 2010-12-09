function Balls(n, grid) {
  var ballsArray = this.ballsArray = [];
  this.grid = grid;
  var rand = Math.random,
      x = grid.x,
      xfrom = x.from,
      xto = x.to,
      y = grid.y,
      yfrom = y.from,
      yto = y.to,
      z = grid.z,
      zfrom = z.from,
      zto = z.to;
  

  for (var i = 0; i < n; i++) {
    ballsArray.push({
      pos: {
        x: (xfrom + rand() * (xto - xfrom)) / 1.5,
        y: (yfrom + rand() * (yto - yfrom)) / 1.5,
        z: (zfrom + rand() * (zto - zfrom)) / 1.5
      },
      vec: {
        x: (2 * rand() -1) * (xto - xfrom) / 80,
        y: (2 * rand() -1) * (yto - yfrom) / 80,
        z: (2 * rand() -1) * (zto - zfrom) / 80
      }
    });
  }
}

Balls.prototype= {
  update: function() {
    var balls = this.ballsArray,
        grid = this.grid;
    for (var i = 0, l = balls.length; i < l; i++) {
      var ball = balls[i],
          pos = ball.pos,
          vec = ball.vec;
      for (var prop in pos) {
        var p = pos[prop],
            v = vec[prop],
            g = grid[prop];
        if (p + v < g.from/1.5 || p + v > g.to/1.5) {
          vec[prop] *= -1;
          v *= -1;
        }
        pos[prop] = p + v;
      }
    }
  },
  
  each: function(callback) {
    var balls = this.ballsArray;
    for (var i = 0, l = balls.length; i < l; i++) {
      callback(balls[i], i);
    }
  }
};
