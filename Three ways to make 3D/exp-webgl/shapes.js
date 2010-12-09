var Shape = {
	MengerSponge: function(objs, opts) {
		var n = 0,
			itr = opts.itr || 3,
			s = opts.s || 200,
			x = opts.x || 0,
			y = opts.y || 0,
			z = opts.z || 0;
		
		function gen(itr, s, x, y, z) {
			if(itr--) {
				s /= 3;
				for(var i=-1; i < 2; i++) {
					for(var j=-1; j<2; j++) {
						for(var k=-1; k<2; k++) {
							if(!(i == 0 && j == 0
								|| i == 0 && k == 0
								|| j == 0 && k ==0))
								gen(itr, s, x + i*s, y + j*s, z + k*s);
						}
					}
				}
				return;
			}
			//center of box and not box vertices
			var obj = objs[n] || {
				pos: new THREE.Vector4()
			};
			objs[n++] = obj;
			if(!obj.mengersponge) {
				obj.mengersponge = new THREE.Vector4();
			}
			var pos = obj.pos, sponge = obj.mengersponge;
			pos.x = sponge.x = x;
			pos.y = sponge.y = y;
			pos.z = sponge.z = z;
		}
		
		gen(itr, s, x, y, z);
		
		//round robin extra-balls
		for(var bound = n, l=objs.length; bound<l; bound++) {
			var obj = objs[bound],
				orig = objs[bound % n];
			if(!obj.mengersponge) {
				obj.mengersponge = new THREE.Vector4();
			}
			var pos = obj.pos, 
				sponge = obj.mengersponge,
				op = orig.pos,
				x = op.x,
				y = op.y,
				z = op.z;
			pos.x = sponge.x = x;
			pos.y = sponge.y = y;
			pos.z = sponge.z = z;
		}
	},
	
	Sierpinski: function(objs, opts) {
		var n = 0,
			itr = opts.itr || 3,
			s = opts.s || 200,
			x = opts.x || 0,
			y = opts.y || 0,
			z = opts.z || 0;
		
		function gen(itr, s, x, y, z){
			if (itr) {
				itr--;
				s /= 2;
				gen(itr, s, x+s, y+s, z+s);
				gen(itr, s, x+s, y-s, z-s);
				gen(itr, s, x-s, y-s, z+s);
				gen(itr, s, x-s, y+s, z-s);
				return;
			}

			//center of box and not box vertices
			var obj = objs[n] || {
				pos: new THREE.Vector4()
			};
			objs[n++] = obj;
			if(!obj.sierpinski) {
				obj.sierpinski = new THREE.Vector4();
			}
			var pos = obj.pos, ski = obj.sierpinski;
			pos.x = ski.x = x;
			pos.y = ski.y = y;
			pos.z = ski.z = z;
		}
		
		gen(itr, s, x, y, z);
		
		//round robin extra-balls
		for(var bound = n, l=objs.length; bound<l; bound++) {
			var obj = objs[bound],
				orig = objs[bound % n];
			if(!obj.sierpinski) {
				obj.sierpinski = new THREE.Vector4();
			}
			var pos = obj.pos, 
				ski = obj.sierpinski,
				op = orig.pos,
				x = op.x,
				y = op.y,
				z = op.z;
			pos.x = ski.x = x;
			pos.y = ski.y = y;
			pos.z = ski.z = z;
		}
	},
	
	Sphere: function(objs, opts) {
		var s = opts.s || 200,
			atan2 = Math.atan2,
			cos = Math.cos,
			acos = Math.acos,
			sin = Math.sin,
			sqrt = Math.sqrt;
		
		for(var i=0, l=objs.length; i<l; i++) {
			var obj = objs[i],
				pos = obj.pos,
				x = pos.x,
				y = pos.y,
				z = pos.z,
				r = x * x + y * y + z * z,
				theta = acos(z / sqrt(r)),
				phi = atan2(y, (x || 1));

			if(!obj.sphere) {
				obj.sphere = new THREE.Vector4();
			}
			var pos = obj.pos, sphere = obj.sphere;
			pos.x = sphere.x = s * sin(theta) * cos(phi);
			pos.y = sphere.y = s * sin(theta) * sin(phi);
			pos.z = sphere.z = s * cos(theta);
		}
	},
	
	Tube: function(objs, opts) {
		var i = 0,
			s = opts.s || 200,
			offset = opts.offset || 20,
			atan = Math.atan,
			cos = Math.cos,
			sin = Math.sin,
			sqrt = Math.sqrt,
			abs = Math.abs;
			
		for(var i=0, l=objs.length; i<l; i++) {
			var obj = objs[i],
				pos = obj.pos,
				x = pos.x,
				y = pos.y,
				z = pos.z,
				theta = atan(z / (x || 1)),
				r = sqrt(x * x + z * z),
				quot = (abs(y) + offset) / (s + offset);

			if(!obj.tube) {
				obj.tube = new THREE.Vector4();
			}
			var pos = obj.pos, tube = obj.tube;
			pos.x = tube.x = r * sin(theta) * quot;
			pos.y = tube.y = y;
			pos.z = tube.z = r * cos(theta) * quot;
		}
	}

};

