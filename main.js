//obj de canvas
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');

//objeto nave
var nave = {
	x:100,
	y: canvas.height - 50,
	width:70,
	height:30,
	contador: 0
}
var juego = {
	estado: 'iniciando'
};
var textoRespuesta = {
	contador: -1,
	titulo: '',
	subtitulo: ''
};
var gameover = {};
var teclado = {};
//array de los disparos
var disparos = [];
var disparosEnemigos = [];
//array de los enemigos
var enemigos = [];
//variables para imágenes
var fondo, imgNave, imgEnemigo, imgDisparo, imgDisparoEnemigo, imggameover;
var imagenes = ['nave.png','naveEnemiga.png','fondo.jpg','disparoNave.png','disparoNaveEnemiga.png','gameover.png'];
var preloader;
//definición de funciones
function loadMedia(){
	preloader = new PreloadJS();
	preloader.onProgress = progresoCarga;
	cargar();
}
function cargar(){
	while(imagenes.length > 0){
		var imagen = imagenes.shift();
		preloader.loadFile(imagen);
	}
}
function progresoCarga(){
	console.log(parseInt(preloader.progress*100)+"%");
	if (preloader.progress == 1){
		var interval = window.setInterval(frameLoop,1000/55);
		fondo = new Image();
		fondo.src = 'fondo.jpg';
		imgNave = new Image();
		imgNave.src = 'nave.png';
		imgEnemigo = new Image();
		imgEnemigo.src = 'naveEnemiga.png';
		imgDisparo = new Image();
		imgDisparo.src = 'disparoNave.png';
		imgDisparoEnemigo = new Image();
		imgDisparoEnemigo.src = 'disparoNaveEnemiga.png';
		imggameover = new Image();
		imggameover.src = 'gameover.png';
		sonidoDisparo = document.createElement('audio');
		document.body.appendChild(sonidoDisparo);
		sonidoDisparo.setAttribute('src','laserNave.mp3');
		sonidoDisparoEnemigo = document.createElement('audio');
		document.body.appendChild(sonidoDisparoEnemigo);
		sonidoDisparoEnemigo.setAttribute('src','laserEnemigo.mp3');
		sonidoMuerteEnemigo = document.createElement('audio');
		document.body.appendChild(sonidoMuerteEnemigo);
		sonidoMuerteEnemigo.setAttribute('src','deadInvasor.mp3');
		sonidoMuerteNave = document.createElement('audio');
		document.body.appendChild(sonidoMuerteNave);
		sonidoMuerteNave.setAttribute('src','deadSpaceShip.mp3');
		sonidoFinJuego = document.createElement('audio');
		document.body.appendChild(sonidoFinJuego);
		sonidoFinJuego.setAttribute('src','endGame.mp3');

	}
}

function dibujarEnemigos(){
	for(var i in enemigos){
		var enemigo = enemigos[i];
		ctx.save();
		if (enemigo.estado == 'vivo') ctx.fillStyle = 'red';
		if (enemigo.estado =='muerto') ctx.fillStyle = 'black';
		ctx.drawImage(imgEnemigo,enemigo.x,enemigo.y, enemigo.width,enemigo.height);
		ctx.restore();
	}
}

function dibujarFondo(){
	ctx.drawImage(fondo,0,0);
}

function dibujarNave(){
	//ctx.save();
	ctx.drawImage(imgNave,nave.x,nave.y,nave.width,nave.height);
	//ctx.restore();
}

function agregarEventoTeclado(){
	agregarEvento(document,"keydown", function(e){
		//ponermos en true la tecla presionada
		teclado[e.keyCode] = true;
		/*console.log(e.keyCode); prueba escritorio*/
	});
	agregarEvento(document,"keyup", function(e){
		//ponermos en falso la tecla que dejó de ser presionada
		teclado[e.keyCode] = false;
	});
	function agregarEvento(elemento, nombreEvento, funcion){
		if (elemento.addEventListener) {
			//navegadores modernos
			elemento.addEventListener(nombreEvento,funcion,false);
		}
		else if (elemento.attachEvent) {
			//Internet Explorer
			elemento.attachEvent(nombreEvento,funcion);
		}
	}
}

function moverNave(){
	//movimiento a la izquierda
	if (teclado[37]) {
		nave.x -= 7;
		if (nave.x < 0) nave.x = 0;
	}
	//

	//movimiento a la derecha
	if (teclado[39]) {
		var limite = canvas.width - nave.width;
		nave.x += 7;
		if (nave.x > limite) nave.x = limite;
	}

	if (teclado[32]){
		if (!teclado.fire) {
			fire();
			teclado.fire = true;
		}
	}

	if (!teclado[32]) teclado.fire = false;
	if (nave.estado == 'hit'){
		nave.contador++;
		if (nave.contador >= 20){
			nave.contador = 0;
			nave.estado = 'muerto';
			juego.estado = 'perdido';
			gameover;
			textoRespuesta.titulo = 'Mala Alimentacion';
			textoRespuesta.subtitulo = 'Presiona la tecla R para dejar de consumir chatarra';
			textoRespuesta.contador = 0;
		}
	}
}

function dibujarDisparosEnemigos(){
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		ctx.save();
		ctx.fillStyle = 'yellow';
		ctx.drawImage(imgDisparoEnemigo,disparo.x, disparo.y, disparo.width, disparo.height);
		ctx.restore();
	}
}

function moverDisparosEnemigos(){
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		disparo.y += 3;
	}
	disparosEnemigos = disparosEnemigos.filter(function(disparo){
		return disparo.y < canvas.height;
	});
}

function actualizaEnemigos(){
	function agregarDisparosEnemigos(enemigo){
		return{
			x: enemigo.x,
			y: enemigo.y,
			width: 15,
			height: 40,
			contador: 0
		}
	}
	if(juego.estado == 'iniciando') {
		for (var i = 0; i < 10; i++) {
			enemigos.push({
				x:10 + (i * 50),
				y:0,
				width:40,
				height: 40,
				estado:'vivo',
				contador:0
			});
		}
		juego.estado = 'jugando';
	}
	//eliminar líneas enemigas
	for(var i in enemigos){
		var enemigo = enemigos[i];
		if (!enemigo) continue;
		if (enemigo && enemigo.estado == 'vivo') {
			enemigo.contador++;
			enemigo.x += Math.sin(enemigo.contador * Math.PI/90)*5;

			if (aleatorio(0,enemigos.length * 10) == 4){
				sonidoDisparoEnemigo.pause();
				sonidoDisparoEnemigo.currentTime = 0;
				sonidoDisparoEnemigo.play();
				disparosEnemigos.push(agregarDisparosEnemigos(enemigo));
			}
   		}
   		if (enemigo && enemigo.estado == 'hit') {
   			enemigo.contador++;
   			if (enemigo.contador >= 20) {
   				enemigo.estado = 'muerto';
   				enemigo.contador = 0;
   			}
   		}
	}
	enemigos = enemigos.filter(function(e){
		if (enemigo && enemigo.estado != 'muerto') return true;
		return false;
	});
	//
}

function moverDisparos(){
	for (var i in disparos){
		var disparo = disparos[i];
		disparo.y -= 4;
	}
	//eliminar disparos que se salen de la pantalla
	disparos = disparos.filter(function(disparo){
		return disparo.y > 0;
	});
	//
}

function fire(){
	sonidoDisparo.pause();
	sonidoDisparo.currentTime = 0;
	sonidoDisparo.play();
	disparos.push({
		x: nave.x + 30,
		y: nave.y - 10,
		width: 15,
		height: 40
	});
}

function dibujarDisparos(){
	ctx.save();
	ctx.fillStyle = 'white';
	for(var i in disparos){
		var disparo = disparos[i];
		ctx.drawImage(imgDisparo,disparo.x, disparo.y, disparo.width, disparo.height);
	}
	ctx.restore();
}

function dibujaTexto(){
	if (textoRespuesta.contador == -1) return;
	var alpha = textoRespuesta.contador/50.0;
	if (alpha > 1){
		for(var i in enemigos){
			delete enemigos[i];
		}
	}
	ctx.save();
	ctx.globalAlpha = alpha;
	if (juego.estado == 'perdido'){
		ctx.fillStyle = 'white';
		ctx.font = 'Bold 40pt Arial';
		ctx.fillText(textoRespuesta.titulo, 140, 200);
		ctx.font = '14pt Arial';
		ctx.fillText(textoRespuesta.subtitulo, 190, 250);
	}
	if (juego.estado == 'victoria'){
		ctx.fillStyle = 'white';
		ctx.font = 'Bold 40pt Arial';
		ctx.fillText(textoRespuesta.titulo, 140, 200);
		ctx.font = '14pt Arial';
		ctx.fillText(textoRespuesta.subtitulo, 190, 250);
	}
}

function actualizarEstadoJuego(){
	if (juego.estado == 'jugando' && enemigos.length == 0){
		juego.estado = 'victoria';

		textoRespuesta.titulo = 'Derrotaste a los enemigos';
		textoRespuesta.subtitulo = 'presiona la tecla R para reiniciar';
		textoRespuesta.contador = 0;
	}
	if (textoRespuesta.contador >= 0){
		textoRespuesta.contador++;
	}
	if ((juego.estado == 'perdido' || juego.estado == 'victoria') && teclado[82]){
		juego.estado = 'iniciando';
		nave.estado = 'vivo';
		textoRespuesta.contador = -1;
	}
}

//algoritmo de colisiones
function hit(a,b)
{
	var hit = false;
	//Colsiones horizontales
	if(b.x + b.width >= a.x && b.x < a.x + a.width)
	{
		//Colisiones verticales
		if(b.y + b.height >= a.y && b.y < a.y + a.height)
			hit = true;
	}
	//Colisión de a con b
	if(b.x <= a.x && b.x + b.width >= a.x + a.width)
	{
		if(b.y <= a.y && b.y + b.height >= a.y + a.height)
			hit = true;
	}
	//Colisión b con a
	if(a.x <= b.x && a.x + a.width >= b.x + b.width)
	{
		if(a.y <= b.y && a.y + a.height >= b.y + b.height)
			hit = true;
	}
	return hit;
}
//

function verificarContacto(){
	for(var i in disparos){
		var disparo = disparos[i];
		for(j in enemigos){
			var enemigo = enemigos[j];
			if(hit(disparo,enemigo)){
				sonidoMuerteEnemigo.pause();
				sonidoMuerteEnemigo.currentTime = 0;
				sonidoMuerteEnemigo.play();
				delete enemigos[j];
				enemigo.estado = 'hit';
				enemigo.contador = 0;
			}
		}
	}
	if (nave.estado == 'hit' || nave.estado == 'muerto')return;
		for(var i in disparosEnemigos){
			var disparo = disparosEnemigos[i];
			if (hit(disparo,nave)){
				sonidoFinJuego.currentTime = 0;
				sonidoFinJuego.play();
				nave.estado = 'hit';
				console.log('contacto');
			}
		}
}

function aleatorio(inferior,superior){
	var posibilidades = superior - inferior;
	var a = Math.random() * posibilidades;
	a = Math.floor(a);
	return parseInt(inferior) + a;
}

function frameLoop(){
	actualizarEstadoJuego();
	moverNave();
	actualizaEnemigos();
	moverDisparos();
	verificarContacto();
	dibujarFondo();
	dibujarEnemigos();
	dibujarDisparosEnemigos();
	moverDisparosEnemigos();
	dibujarDisparos();
	dibujaTexto();
	dibujarNave();
}

window.addEventListener('load',init);
function init(){	
agregarEventoTeclado();
loadMedia();
}
