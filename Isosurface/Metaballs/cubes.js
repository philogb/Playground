//paralelization index
var n = 1,
//number of workers
    nWorkers = Math.pow(8, n), 
//ratio to divide the grid
    den = n + 1,
//number of particles
    nBalls = 10,
//balls
    balls,
//worker group
    workerGroup,
//3D context object
    gl,
    scene,
    glData;

//called when HMTL page is loaded
this.load = function() {
  //initialize balls
  balls = new Balls(nBalls, Grid);
  //initialize workers
  workerGroup = new WorkerGroup('WorkerMarchingCube.js', nWorkers);
  //initialize WebGL stuff
  glData = initWebGL();
  
  gl = glData.ctx;
  
  scene = {
    camera: new THREE.Camera(75, gl.viewportWidth / gl.viewportHeight, 0.01, 6),
    lighting: {
      enable: true,
      ambient: [0.6, 0.6, 0.6],
      directional: {
        color: [0.9, 0.5, 0.0],
        direction: [ Math.sin(Math.PI/4), 
                     Math.cos(Math.PI/4),
                     Math.sin(Math.PI/4) ]
      }
    },
    viewMatrix: new THREE.Matrix4,
    elMatrix: new THREE.Matrix4
  };
  //update camera position
  scene.camera.position.z = 3;
  
  //
  mapReduce();
};

function mapReduce() {
  var x = Grid.x,
      xfrom = x.from,
      xto = x.to,
      xstep = x.step,
      nx = ((xto - xfrom) / den),
      y = Grid.y,
      yfrom = y.from,
      yto = y.to,
      ystep = y.step,
      ny = ((yto - yfrom) / den),
      z = Grid.z,
      zfrom = z.from,
      zto = z.to,
      zstep = z.step,
      nz = ((zto - zfrom) / den);
  
  workerGroup.map(function(nb) {
    var idx = nb % den,
        idy = ((nb / den) >> 0) % den,
        idz = ((nb / den / den) >> 0) % den;
    var o = {
      grid: {
        x: {
          from: xfrom + idx * nx,
          to: xfrom + idx * nx + nx,
          step: xstep
        },
        y: {
          from: yfrom + idy * ny,
          to: yfrom + idy * ny + ny,
          step: ystep
        },
        z: {
          from: zfrom + idz * nz,
          to: zfrom + idz * nz + nz,
          step: zstep
        }
      },
      isolevel: 10,
      balls: balls.ballsArray
    };
    return o;
  });
  var indexAcum = 0, initialValue = {
    vertices: [],
    normals: [],
    indices: []
  };

  workerGroup.reduce({
    reduceFn: function (x, y) {
      var l = y.vertices.length /3;
      x.vertices = x.vertices.concat(y.vertices);
      x.normals = x.normals.concat(y.normals);
      while (l--) {
        x.indices.push(indexAcum++);
      }
      return x;
    },
    initialValue: initialValue,
    onComplete: complete
  });
}

//called once all workers information has been aggregated
function complete(data) {
  var vertices = data.vertices,
      normals = data.normals,
      indices = data.indices,
      viewMatrix = scene.viewMatrix,
      elMatrix = scene.elMatrix,
      camera = scene.camera,
      vertexBuffer = glData.vertexBuffer,
      normalBuffer = glData.normalBuffer,
      indexBuffer = glData.indexBuffer,
      program = glData.program,
      gl = glData.ctx,
      lighting = scene.lighting;
  
  //draw scene
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  //update camera position
  camera.updateMatrix();
  
  viewMatrix.multiply(camera.matrix, elMatrix);
  
  //send matrices
  gl.uniformMatrix4fv(program.viewMatrix, false, viewMatrix.flatten());
  gl.uniformMatrix4fv(program.projectionMatrix, false, camera.projectionMatrix.flatten());
  
  //send normal matrix for lighting
  var normalMatrix = THREE.Matrix4.makeInvert(viewMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(program.normalMatrix, false, normalMatrix.flatten());

  //will probably be changed when we add that awesome silver material ;)
  gl.uniform4f(program.color, 0.5, 0.5, 0.5, 1.0);
  
  //send lighting data
  gl.uniform1i(program.enableLighting, lighting.enable);
  if(lighting.enable) {
    //set ambient light color
    if(lighting.ambient) {
      var acolor = lighting.ambient;
      gl.uniform3f(program.ambientColor, acolor[0], acolor[1], acolor[2]);
    }
    //set directional light
    if(lighting.directional) {
      var dir = lighting.directional,
          color = dir.color,
          pos = dir.direction,
          vd = new THREE.Vector3(pos[0], pos[1], pos[2]).normalize();
      gl.uniform3f(program.lightingDirection, vd.x, vd.y, vd.z);
      gl.uniform3f(program.directionalColor, color[0], color[1], color[2]);
    }
  }
  
  //send vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(program.position, 3, gl.FLOAT, false, 0, 0);
  
  //send normals
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.vertexAttribPointer(program.normal, 3, gl.FLOAT, false, 0, 0);
  
  //send indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  
  //update all balls positions
  balls.update();
  //call the mapReduce to recalculate vertices and re-render the scene!
  setTimeout(mapReduce, 1000/60);
}


