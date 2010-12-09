var rx = Math.PI/4, 
	ry = Math.PI/4, 
	r = 180,
	g = 10,
	b = 10,
	shape = 0,
	parts = [],
	canvas = null,
	ctx = null,
	width = null,
	height = null,
    s = 300,
	first = true,
	mx = THREE.Matrix4.rotationXMatrix(rx),
	my = THREE.Matrix4.rotationYMatrix(ry),
	shapes = ['MengerSponge', 
			  'Sphere', 
			  'MengerSponge', 
			  'Sierpinski'];

function load() {
	init();
	setInterval(loop, 1000/40);
}

function init() {
	canvas = document.getElementById('viz');
	width = canvas.width;
	height = canvas.height;
	ctx = canvas.getContext('2d');
	//create shapes
	Shape.MengerSponge(parts, {
		itr: 2,
		s: s
	});
	Shape.Sphere(parts, {
		s: s/1.5
	});
	Shape.Sierpinski(parts, {
		itr: 4,
		s: s/2
	});
	//set tween options
	tween.set({
		loops: 60,
		loopsDelay: 0,
		transition: Trans.Elastic.easeOut,
		compute: function(delta) {
			for(var i=0, l=parts.length; i<l; i++) {
				var p = parts[i],
					begin = p.begin || { x:0, y:0, z:0 },
					end = p.end || { x:0, y:0, z:0 };
				p.pos = {
					x: begin.x + (end.x - begin.x) * delta,
					y: begin.y + (end.y - begin.y) * delta,
					z: begin.z + (end.z - begin.z) * delta
				};
			}
		},
		complete: function() {
			nextShape();
		}
	});
	for(var i=0, l=parts.length; i<l; i++) {
		var p = parts[i];
		p.pos = new THREE.Vector4();
	}	
	nextShape();
}

function nextShape() {
	for(var i=0, l=parts.length; i<l; i++) {
		var p = parts[i];
		p.begin = p.pos;
		p.end = p[shapes[shape].toLowerCase()];
	}
	shape = (shape + 1) % shapes.length;
	tween.set({
		loop: 0,
        loopsDelay: first? 0 : 60
	});
	first = false;
}

function loop() {
	tween.step();
	
	rx += 0.03;
	ry += 0.01;
	mx = THREE.Matrix4.rotationXMatrix(rx);
	my = THREE.Matrix4.rotationYMatrix(ry);
	r = 180 + 40 * (Math.sin(ry));
	g = 10 + 100 * (1 - Math.sin(rx));
	b = 10 + 100 * (1 - Math.cos(ry));
	
	
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, width, height);
	ctx.save();
	ctx.translate(width/2, height/2);
	ctx.fillStyle = 'rgb(' + (r >> 0)	+ ', ' + (g >> 0) + ', ' + (b >> 0) + ')';
	for(var i=0, l=parts.length; i<l; i++) {
		var p = parts[i],
			pos = {
				x: p.pos.x,
				y: p.pos.y,
				z: p.pos.z
			};
		mx.transform(pos);
		my.transform(pos);
		ctx.globalAlpha = (Math.min(1, Math.max(0.5, (pos.z  + s/2) / s)));
		var arc = 6 * ctx.globalAlpha;
		ctx.beginPath();
		ctx.fillRect(pos.x - arc/2, pos.y - arc/2, arc, arc);
		ctx.fill();
		ctx.closePath();
	}
	ctx.restore();
}