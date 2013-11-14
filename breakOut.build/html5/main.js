
//Change this to true for a stretchy canvas!
//
var RESIZEABLE_CANVAS=false;

//Start us up!
//
window.onload=function( e ){

	if( RESIZEABLE_CANVAS ){
		window.onresize=function( e ){
			var canvas=document.getElementById( "GameCanvas" );

			//This vs window.innerWidth, which apparently doesn't account for scrollbar?
			var width=document.body.clientWidth;
			
			//This vs document.body.clientHeight, which does weird things - document seems to 'grow'...perhaps canvas resize pushing page down?
			var height=window.innerHeight;			

			canvas.width=width;
			canvas.height=height;
		}
		window.onresize( null );
	}
	
	game_canvas=document.getElementById( "GameCanvas" );
	
	game_console=document.getElementById( "GameConsole" );

	try{
	
		bbInit();
		bbMain();
		
		if( game_runner!=null ) game_runner();
		
	}catch( err ){
	
		alertError( err );
	}
}

var game_canvas;
var game_console;
var game_runner;

//${CONFIG_BEGIN}
CFG_CONFIG="debug";
CFG_HOST="winnt";
CFG_IMAGE_FILES="*.png|*.jpg";
CFG_LANG="js";
CFG_MOJO_AUTO_SUSPEND_ENABLED="false";
CFG_MUSIC_FILES="*.wav|*.ogg|*.mp3|*.m4a";
CFG_OPENGL_GLES20_ENABLED="false";
CFG_PARSER_FUNC_ATTRS="0";
CFG_SOUND_FILES="*.wav|*.ogg|*.mp3|*.m4a";
CFG_TARGET="html5";
CFG_TEXT_FILES="*.txt|*.xml|*.json";
//${CONFIG_END}

//${METADATA_BEGIN}
var META_DATA="[White_Smile_Block.png];type=image/png;width=36;height=36;\n[background.jpg];type=image/jpg;width=1024;height=768;\n[ball.png];type=image/png;width=48;height=48;\n[brick.png];type=image/png;width=50;height=50;\n[champignons.jpg];type=image/jpg;width=300;height=225;\n[donut_lift.png];type=image/png;width=24;height=21;\n[donut_paddle.png];type=image/png;width=96;height=21;\n[question.png];type=image/png;width=50;height=50;\n[racket.png];type=image/png;width=48;height=48;\n[smb.png];type=image/png;width=512;height=512;\n[ts_font.png];type=image/png;width=256;height=256;\n[mojo_font.png];type=image/png;width=864;height=13;\n";
//${METADATA_END}

function getMetaData( path,key ){
	var i=META_DATA.indexOf( "["+path+"]" );
	if( i==-1 ) return "";
	i+=path.length+2;

	var e=META_DATA.indexOf( "\n",i );
	if( e==-1 ) e=META_DATA.length;

	i=META_DATA.indexOf( ";"+key+"=",i )
	if( i==-1 || i>=e ) return "";
	i+=key.length+2;

	e=META_DATA.indexOf( ";",i );
	if( e==-1 ) return "";

	return META_DATA.slice( i,e );
}

function loadString( path ){
	var xhr=new XMLHttpRequest();
	xhr.open( "GET","data/"+path,false );
	xhr.send( null );
	if( (xhr.status==200) || (xhr.status==0) ) return xhr.responseText;
	return "";
}

function loadImage( path,onloadfun ){
	var ty=getMetaData( path,"type" );
	if( ty.indexOf( "image/" )!=0 ) return null;

	var image=new Image();
	
	image.meta_width=parseInt( getMetaData( path,"width" ) );
	image.meta_height=parseInt( getMetaData( path,"height" ) );
	image.onload=onloadfun;
	image.src="data/"+path;
	
	return image;
}

function loadAudio( path ){
	var audio=new Audio( "data/"+path );
	return audio;
}

//${TRANSCODE_BEGIN}

// Javascript Monkey runtime.
//
// Placed into the public domain 24/02/2011.
// No warranty implied; use at your own risk.

//***** JavaScript Runtime *****

var D2R=0.017453292519943295;
var R2D=57.29577951308232;

var err_info="";
var err_stack=[];

var dbg_index=0;

function push_err(){
	err_stack.push( err_info );
}

function pop_err(){
	err_info=err_stack.pop();
}

function stackTrace(){
	if( !err_info.length ) return "";
	var str=err_info+"\n";
	for( var i=err_stack.length-1;i>0;--i ){
		str+=err_stack[i]+"\n";
	}
	return str;
}

function print( str ){
	if( game_console ){
		game_console.value+=str+"\n";
		game_console.scrollTop = game_console.scrollHeight - game_console.clientHeight;
	}
	if( window.console!=undefined ){
		window.console.log( str );
	}
	return 0;
}

function alertError( err ){
	if( typeof(err)=="string" && err=="" ) return;
	alert( "Monkey Runtime Error : "+err.toString()+"\n\n"+stackTrace() );
}

function error( err ){
	throw err;
}

function debugLog( str ){
	print( str );
}

function debugStop(){
	error( "STOP" );
}

function dbg_object( obj ){
	if( obj ) return obj;
	error( "Null object access" );
}

function dbg_array( arr,index ){
	if( index<0 || index>=arr.length ) error( "Array index out of range" );
	dbg_index=index;
	return arr;
}

function new_bool_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]=false;
	return arr;
}

function new_number_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]=0;
	return arr;
}

function new_string_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]='';
	return arr;
}

function new_array_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]=[];
	return arr;
}

function new_object_array( len ){
	var arr=Array( len );
	for( var i=0;i<len;++i ) arr[i]=null;
	return arr;
}

function resize_bool_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]=false;
	return arr;
}

function resize_number_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]=0;
	return arr;
}

function resize_string_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]="";
	return arr;
}

function resize_array_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]=[];
	return arr;
}

function resize_object_array( arr,len ){
	var i=arr.length;
	arr=arr.slice(0,len);
	if( len<=i ) return arr;
	arr.length=len;
	while( i<len ) arr[i++]=null;
	return arr;
}

function string_compare( lhs,rhs ){
	var n=Math.min( lhs.length,rhs.length ),i,t;
	for( i=0;i<n;++i ){
		t=lhs.charCodeAt(i)-rhs.charCodeAt(i);
		if( t ) return t;
	}
	return lhs.length-rhs.length;
}

function string_replace( str,find,rep ){	//no unregex replace all?!?
	var i=0;
	for(;;){
		i=str.indexOf( find,i );
		if( i==-1 ) return str;
		str=str.substring( 0,i )+rep+str.substring( i+find.length );
		i+=rep.length;
	}
}

function string_trim( str ){
	var i=0,i2=str.length;
	while( i<i2 && str.charCodeAt(i)<=32 ) i+=1;
	while( i2>i && str.charCodeAt(i2-1)<=32 ) i2-=1;
	return str.slice( i,i2 );
}

function string_starts_with( str,substr ){
	return substr.length<=str.length && str.slice(0,substr.length)==substr;
}

function string_ends_with( str,substr ){
	return substr.length<=str.length && str.slice(str.length-substr.length,str.length)==substr;
}

function string_from_chars( chars ){
	var str="",i;
	for( i=0;i<chars.length;++i ){
		str+=String.fromCharCode( chars[i] );
	}
	return str;
}


function object_downcast( obj,clas ){
	if( obj instanceof clas ) return obj;
	return null;
}

function object_implements( obj,iface ){
	if( obj && obj.implments && obj.implments[iface] ) return obj;
	return null;
}

function extend_class( clas ){
	var tmp=function(){};
	tmp.prototype=clas.prototype;
	return new tmp;
}

function ThrowableObject(){
}

ThrowableObject.prototype.toString=function(){ 
	return "Uncaught Monkey Exception"; 
}
var MonkeyTools = new Object();

MonkeyTools.ShowPointer=function()
{
document.getElementById("GameCanvas").style.cursor= 'default';
}

MonkeyTools.HidePointer=function()
{
document.getElementById("GameCanvas").style.cursor = "url('data:image/cur;base64,AAACAAEAICAAAAAAAACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAgBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA55ZXBgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOeWVxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADnllcGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9////////////////////+////////f/////////8%3D'), auto" ;
};
// HTML5 mojo runtime.
//
// Copyright 2011 Mark Sibly, all rights reserved.
// No warranty implied; use at your own risk.

var gl=null;	//global WebGL context - a bit rude!

KEY_LMB=1;
KEY_RMB=2;
KEY_MMB=3;
KEY_TOUCH0=0x180;

function eatEvent( e ){
	if( e.stopPropagation ){
		e.stopPropagation();
		e.preventDefault();
	}else{
		e.cancelBubble=true;
		e.returnValue=false;
	}
}

function keyToChar( key ){
	switch( key ){
	case 8:
	case 9:
	case 13:
	case 27:
	case 32:
		return key;
	case 33:
	case 34:
	case 35:
	case 36:
	case 37:
	case 38:
	case 39:
	case 40:
	case 45:
		return key | 0x10000;
	case 46:
		return 127;
	}
	return 0;
}

//***** gxtkApp class *****

function gxtkApp(){

	if( typeof( CFG_OPENGL_GLES20_ENABLED )!="undefined" && CFG_OPENGL_GLES20_ENABLED=="true" ){
		this.gl=game_canvas.getContext( "webgl" );
		if( !this.gl ) this.gl=game_canvas.getContext( "experimental-webgl" );
	}else{
		this.gl=null;
	}

	this.graphics=new gxtkGraphics( this,game_canvas );
	this.input=new gxtkInput( this );
	this.audio=new gxtkAudio( this );

	this.loading=0;
	this.maxloading=0;

	this.updateRate=0;
	this.startMillis=(new Date).getTime();
	
	this.dead=false;
	this.suspended=false;
	
	var app=this;
	var canvas=game_canvas;
	
	function gxtkMain(){
	
		var input=app.input;
	
		canvas.onkeydown=function( e ){
			input.OnKeyDown( e.keyCode );
			var chr=keyToChar( e.keyCode );
			if( chr ) input.PutChar( chr );
			if( e.keyCode<48 || (e.keyCode>111 && e.keyCode<122) ) eatEvent( e );
		}

		canvas.onkeyup=function( e ){
			input.OnKeyUp( e.keyCode );
		}

		canvas.onkeypress=function( e ){
			if( e.charCode ){
				input.PutChar( e.charCode );
			}else if( e.which ){
				input.PutChar( e.which );
			}
		}

		canvas.onmousedown=function( e ){
			switch( e.button ){
			case 0:input.OnKeyDown( KEY_LMB );break;
			case 1:input.OnKeyDown( KEY_MMB );break;
			case 2:input.OnKeyDown( KEY_RMB );break;
			}
			eatEvent( e );
		}
		
		canvas.onmouseup=function( e ){
			switch( e.button ){
			case 0:input.OnKeyUp( KEY_LMB );break;
			case 1:input.OnKeyUp( KEY_MMB );break;
			case 2:input.OnKeyUp( KEY_RMB );break;
			}
			eatEvent( e );
		}
		
		canvas.onmouseout=function( e ){
			input.OnKeyUp( KEY_LMB );
			input.OnKeyUp( KEY_MMB );
			input.OnKeyUp( KEY_RMB );
			eatEvent( e );
		}

		canvas.onmousemove=function( e ){
			var x=e.clientX+document.body.scrollLeft;
			var y=e.clientY+document.body.scrollTop;
			var c=canvas;
			while( c ){
				x-=c.offsetLeft;
				y-=c.offsetTop;
				c=c.offsetParent;
			}
			input.OnMouseMove( x,y );
			eatEvent( e );
		}

		canvas.onfocus=function( e ){
			if( CFG_MOJO_AUTO_SUSPEND_ENABLED=="true" ){
				app.InvokeOnResume();
			}
		}
		
		canvas.onblur=function( e ){
			if( CFG_MOJO_AUTO_SUSPEND_ENABLED=="true" ){
				app.InvokeOnSuspend();
			}
		}
		
		canvas.ontouchstart=function( e ){
			for( var i=0;i<e.changedTouches.length;++i ){
				var touch=e.changedTouches[i];
				var x=touch.pageX;
				var y=touch.pageY;
				var c=canvas;
				while( c ){
					x-=c.offsetLeft;
					y-=c.offsetTop;
					c=c.offsetParent;
				}
				input.OnTouchStart( touch.identifier,x,y );
			}
			eatEvent( e );
		}
		
		canvas.ontouchmove=function( e ){
			for( var i=0;i<e.changedTouches.length;++i ){
				var touch=e.changedTouches[i];
				var x=touch.pageX;
				var y=touch.pageY;
				var c=canvas;
				while( c ){
					x-=c.offsetLeft;
					y-=c.offsetTop;
					c=c.offsetParent;
				}
				input.OnTouchMove( touch.identifier,x,y );
			}
			eatEvent( e );
		}
		
		canvas.ontouchend=function( e ){
			for( var i=0;i<e.changedTouches.length;++i ){
				input.OnTouchEnd( e.changedTouches[i].identifier );
			}
			eatEvent( e );
		}
		
		window.ondevicemotion=function( e ){
			var tx=e.accelerationIncludingGravity.x/9.81;
			var ty=e.accelerationIncludingGravity.y/9.81;
			var tz=e.accelerationIncludingGravity.z/9.81;
			var x,y;
			switch( window.orientation ){
			case   0:x=+tx;y=-ty;break;
			case 180:x=-tx;y=+ty;break;
			case  90:x=-ty;y=-tx;break;
			case -90:x=+ty;y=+tx;break;
			}
			input.OnDeviceMotion( x,y,tz );
			eatEvent( e );
		}

		canvas.focus();

		app.InvokeOnCreate();
		app.InvokeOnRender();
	}

	game_runner=gxtkMain;
}

var timerSeq=0;

gxtkApp.prototype.SetFrameRate=function( fps ){

	var seq=++timerSeq;
	
	if( !fps ) return;
	
	var app=this;
	var updatePeriod=1000.0/fps;
	var nextUpdate=(new Date).getTime()+updatePeriod;
	
	function timeElapsed(){
		if( seq!=timerSeq ) return;

		var time;		
		var updates=0;

		for(;;){
			nextUpdate+=updatePeriod;

			app.InvokeOnUpdate();
			if( seq!=timerSeq ) return;
			
			if( nextUpdate>(new Date).getTime() ) break;
			
			if( ++updates==7 ){
				nextUpdate=(new Date).getTime();
				break;
			}
		}
		app.InvokeOnRender();
		if( seq!=timerSeq ) return;
			
		var delay=nextUpdate-(new Date).getTime();
		setTimeout( timeElapsed,delay>0 ? delay : 0 );
	}
	
	setTimeout( timeElapsed,updatePeriod );
}

gxtkApp.prototype.IncLoading=function(){
	++this.loading;
	if( this.loading>this.maxloading ) this.maxloading=this.loading;
	if( this.loading==1 ) this.SetFrameRate( 0 );
}

gxtkApp.prototype.DecLoading=function(){
	--this.loading;
	if( this.loading!=0 ) return;
	this.maxloading=0;
	this.SetFrameRate( this.updateRate );
}

gxtkApp.prototype.GetMetaData=function( path,key ){
	return getMetaData( path,key );
}

gxtkApp.prototype.Die=function( err ){
	this.dead=true;
	this.audio.OnSuspend();
	alertError( err );
}

gxtkApp.prototype.InvokeOnCreate=function(){
	if( this.dead ) return;
	
	try{
		gl=this.gl;
		this.OnCreate();
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

gxtkApp.prototype.InvokeOnUpdate=function(){
	if( this.dead || this.suspended || !this.updateRate || this.loading ) return;
	
	try{
		gl=this.gl;
		this.input.BeginUpdate();
		this.OnUpdate();		
		this.input.EndUpdate();
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

gxtkApp.prototype.InvokeOnSuspend=function(){
	if( this.dead || this.suspended ) return;
	
	try{
		gl=this.gl;
		this.suspended=true;
		this.OnSuspend();
		this.audio.OnSuspend();
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

gxtkApp.prototype.InvokeOnResume=function(){
	if( this.dead || !this.suspended ) return;
	
	try{
		gl=this.gl;
		this.audio.OnResume();
		this.OnResume();
		this.suspended=false;
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

gxtkApp.prototype.InvokeOnRender=function(){
	if( this.dead || this.suspended ) return;
	
	try{
		gl=this.gl;
		this.graphics.BeginRender();
		if( this.loading ){
			this.OnLoading();
		}else{
			this.OnRender();
		}
		this.graphics.EndRender();
		gl=null;
	}catch( ex ){
		this.Die( ex );
	}
}

//***** GXTK API *****

gxtkApp.prototype.GraphicsDevice=function(){
	return this.graphics;
}

gxtkApp.prototype.InputDevice=function(){
	return this.input;
}

gxtkApp.prototype.AudioDevice=function(){
	return this.audio;
}

gxtkApp.prototype.AppTitle=function(){
	return document.URL;
}

gxtkApp.prototype.LoadState=function(){
	var state=localStorage.getItem( ".mojostate@"+document.URL );
	if( state ) return state;
	return "";
}

gxtkApp.prototype.SaveState=function( state ){
	localStorage.setItem( ".mojostate@"+document.URL,state );
}

gxtkApp.prototype.LoadString=function( path ){
	return loadString( path );
}

gxtkApp.prototype.SetUpdateRate=function( fps ){
	this.updateRate=fps;
	
	if( !this.loading ) this.SetFrameRate( fps );
}

gxtkApp.prototype.MilliSecs=function(){
	return ((new Date).getTime()-this.startMillis)|0;
}

gxtkApp.prototype.Loading=function(){
	return this.loading;
}

gxtkApp.prototype.OnCreate=function(){
}

gxtkApp.prototype.OnUpdate=function(){
}

gxtkApp.prototype.OnSuspend=function(){
}

gxtkApp.prototype.OnResume=function(){
}

gxtkApp.prototype.OnRender=function(){
}

gxtkApp.prototype.OnLoading=function(){
}

//***** gxtkGraphics class *****

function gxtkGraphics( app,canvas ){
	this.app=app;
	this.canvas=canvas;
	this.gc=canvas.getContext( '2d' );
	this.tmpCanvas=null;
	this.r=255;
	this.b=255;
	this.g=255;
	this.white=true;
	this.color="rgb(255,255,255)"
	this.alpha=1;
	this.blend="source-over";
	this.ix=1;this.iy=0;
	this.jx=0;this.jy=1;
	this.tx=0;this.ty=0;
	this.tformed=false;
	this.scissorX=0;
	this.scissorY=0;
	this.scissorWidth=0;
	this.scissorHeight=0;
	this.clipped=false;
}

gxtkGraphics.prototype.BeginRender=function(){
	if( this.gc ) this.gc.save();
}

gxtkGraphics.prototype.EndRender=function(){
	if( this.gc ) this.gc.restore();
}

gxtkGraphics.prototype.Mode=function(){
	if( this.gc ) return 1;
	return 0;
}

gxtkGraphics.prototype.Width=function(){
	return this.canvas.width;
}

gxtkGraphics.prototype.Height=function(){
	return this.canvas.height;
}

gxtkGraphics.prototype.LoadSurface=function( path ){
	var app=this.app;
	
	function onloadfun(){
		app.DecLoading();
	}

	app.IncLoading();

	var image=loadImage( path,onloadfun );
	if( image ) return new gxtkSurface( image,this );

	app.DecLoading();
	return null;
}

gxtkGraphics.prototype.CreateSurface=function( width,height ){

	var canvas=document.createElement( 'canvas' );
	
	canvas.width=width;
	canvas.height=height;
	canvas.meta_width=width;
	canvas.meta_height=height;
	canvas.complete=true;
	
	var surface=new gxtkSurface( canvas,this );
	
	surface.gc=canvas.getContext( '2d' );
	
	return surface;
}

gxtkGraphics.prototype.SetAlpha=function( alpha ){
	this.alpha=alpha;
	this.gc.globalAlpha=alpha;
}

gxtkGraphics.prototype.SetColor=function( r,g,b ){
	this.r=r;
	this.g=g;
	this.b=b;
	this.white=(r==255 && g==255 && b==255);
	this.color="rgb("+(r|0)+","+(g|0)+","+(b|0)+")";
	this.gc.fillStyle=this.color;
	this.gc.strokeStyle=this.color;
}

gxtkGraphics.prototype.SetBlend=function( blend ){
	switch( blend ){
	case 1:
		this.blend="lighter";
		break;
	default:
		this.blend="source-over";
	}
	this.gc.globalCompositeOperation=this.blend;
}

gxtkGraphics.prototype.SetScissor=function( x,y,w,h ){
	this.scissorX=x;
	this.scissorY=y;
	this.scissorWidth=w;
	this.scissorHeight=h;
	this.clipped=(x!=0 || y!=0 || w!=this.canvas.width || h!=this.canvas.height);
	this.gc.restore();
	this.gc.save();
	if( this.clipped ){
		this.gc.beginPath();
		this.gc.rect( x,y,w,h );
		this.gc.clip();
		this.gc.closePath();
	}
	this.gc.fillStyle=this.color;
	this.gc.strokeStyle=this.color;
	if( this.tformed ) this.gc.setTransform( this.ix,this.iy,this.jx,this.jy,this.tx,this.ty );
}

gxtkGraphics.prototype.SetMatrix=function( ix,iy,jx,jy,tx,ty ){
	this.ix=ix;this.iy=iy;
	this.jx=jx;this.jy=jy;
	this.tx=tx;this.ty=ty;
	this.gc.setTransform( ix,iy,jx,jy,tx,ty );
	this.tformed=(ix!=1 || iy!=0 || jx!=0 || jy!=1 || tx!=0 || ty!=0);
}

gxtkGraphics.prototype.Cls=function( r,g,b ){
	if( this.tformed ) this.gc.setTransform( 1,0,0,1,0,0 );
	this.gc.fillStyle="rgb("+(r|0)+","+(g|0)+","+(b|0)+")";
	this.gc.globalAlpha=1;
	this.gc.globalCompositeOperation="source-over";
	this.gc.fillRect( 0,0,this.canvas.width,this.canvas.height );
	this.gc.fillStyle=this.color;
	this.gc.globalAlpha=this.alpha;
	this.gc.globalCompositeOperation=this.blend;
	if( this.tformed ) this.gc.setTransform( this.ix,this.iy,this.jx,this.jy,this.tx,this.ty );
}

gxtkGraphics.prototype.DrawPoint=function( x,y ){
	if( this.tformed ){
		var px=x;
		x=px * this.ix + y * this.jx + this.tx;
		y=px * this.iy + y * this.jy + this.ty;
		this.gc.setTransform( 1,0,0,1,0,0 );
		this.gc.fillRect( x,y,1,1 );
		this.gc.setTransform( this.ix,this.iy,this.jx,this.jy,this.tx,this.ty );
	}else{
		this.gc.fillRect( x,y,1,1 );
	}
}

gxtkGraphics.prototype.DrawRect=function( x,y,w,h ){
	if( w<0 ){ x+=w;w=-w; }
	if( h<0 ){ y+=h;h=-h; }
	if( w<=0 || h<=0 ) return;
	//
	this.gc.fillRect( x,y,w,h );
}

gxtkGraphics.prototype.DrawLine=function( x1,y1,x2,y2 ){
	if( this.tformed ){
		var x1_t=x1 * this.ix + y1 * this.jx + this.tx;
		var y1_t=x1 * this.iy + y1 * this.jy + this.ty;
		var x2_t=x2 * this.ix + y2 * this.jx + this.tx;
		var y2_t=x2 * this.iy + y2 * this.jy + this.ty;
		this.gc.setTransform( 1,0,0,1,0,0 );
	  	this.gc.beginPath();
	  	this.gc.moveTo( x1_t,y1_t );
	  	this.gc.lineTo( x2_t,y2_t );
	  	this.gc.stroke();
	  	this.gc.closePath();
		this.gc.setTransform( this.ix,this.iy,this.jx,this.jy,this.tx,this.ty );
	}else{
	  	this.gc.beginPath();
	  	this.gc.moveTo( x1,y1 );
	  	this.gc.lineTo( x2,y2 );
	  	this.gc.stroke();
	  	this.gc.closePath();
	}
}

gxtkGraphics.prototype.DrawOval=function( x,y,w,h ){
	if( w<0 ){ x+=w;w=-w; }
	if( h<0 ){ y+=h;h=-h; }
	if( w<=0 || h<=0 ) return;
	//
  	var w2=w/2,h2=h/2;
	this.gc.save();
	this.gc.translate( x+w2,y+h2 );
	this.gc.scale( w2,h2 );
  	this.gc.beginPath();
	this.gc.arc( 0,0,1,0,Math.PI*2,false );
	this.gc.fill();
  	this.gc.closePath();
	this.gc.restore();
}

gxtkGraphics.prototype.DrawPoly=function( verts ){
	if( verts.length<6 ) return;
	this.gc.beginPath();
	this.gc.moveTo( verts[0],verts[1] );
	for( var i=2;i<verts.length;i+=2 ){
		this.gc.lineTo( verts[i],verts[i+1] );
	}
	this.gc.fill();
	this.gc.closePath();
}

gxtkGraphics.prototype.DrawSurface=function( surface,x,y ){
	if( !surface.image.complete ) return;
	
	if( this.white ){
		this.gc.drawImage( surface.image,x,y );
		return;
	}
	
	this.DrawImageTinted( surface.image,x,y,0,0,surface.swidth,surface.sheight );
}

gxtkGraphics.prototype.DrawSurface2=function( surface,x,y,srcx,srcy,srcw,srch ){
	if( !surface.image.complete ) return;

	if( srcw<0 ){ srcx+=srcw;srcw=-srcw; }
	if( srch<0 ){ srcy+=srch;srch=-srch; }
	if( srcw<=0 || srch<=0 ) return;

	if( this.white ){
		this.gc.drawImage( surface.image,srcx,srcy,srcw,srch,x,y,srcw,srch );
		return;
	}
	
	this.DrawImageTinted( surface.image,x,y,srcx,srcy,srcw,srch  );
}

gxtkGraphics.prototype.DrawImageTinted=function( image,dx,dy,sx,sy,sw,sh ){

	if( !this.tmpGC ){
		this.tmpCanvas=document.createElement( "canvas" );
		this.tmpGC=this.tmpCanvas.getContext( "2d" );
		this.tmpGC.globalCompositeOperation="copy";
	}

	if( sw>this.tmpCanvas.width || sh>this.tmpCanvas.height ){
		this.tmpCanvas.width=Math.max( sw,this.tmpCanvas.width );
		this.tmpCanvas.height=Math.max( sh,this.tmpCanvas.height );
	}
	
	this.tmpGC.drawImage( image,sx,sy,sw,sh,0,0,sw,sh );
	
	var imgData=this.tmpGC.getImageData( 0,0,sw,sh );
	
	var p=imgData.data,sz=sw*sh*4,i;
	
	for( i=0;i<sz;i+=4 ){
		p[i]=p[i]*this.r/255;
		p[i+1]=p[i+1]*this.g/255;
		p[i+2]=p[i+2]*this.b/255;
	}
	
	this.tmpGC.putImageData( imgData,0,0 );
	
	this.gc.drawImage( this.tmpCanvas,0,0,sw,sh,dx,dy,sw,sh );
}

gxtkGraphics.prototype.ReadPixels=function( pixels,x,y,width,height,offset,pitch ){

	var imgData=this.gc.getImageData( x,y,width,height );
	
	var p=imgData.data,i=0,j=offset,px,py;
	
	for( py=0;py<height;++py ){
		for( px=0;px<width;++px ){
			pixels[j++]=(p[i+3]<<24)|(p[i]<<16)|(p[i+1]<<8)|p[i+2];
			i+=4;
		}
		j+=pitch-width;
	}
}

gxtkGraphics.prototype.WritePixels2=function( surface,pixels,x,y,width,height,offset,pitch ){

	if( !surface.gc ){
		if( !surface.image.complete ) return;
		var canvas=document.createElement( "canvas" );
		canvas.width=surface.swidth;
		canvas.height=surface.sheight;
		surface.gc=canvas.getContext( "2d" );
		surface.gc.globalCompositeOperation="copy";
		surface.gc.drawImage( surface.image,0,0 );
		surface.image=canvas;
	}

	var imgData=surface.gc.createImageData( width,height );

	var p=imgData.data,i=0,j=offset,px,py,argb;
	
	for( py=0;py<height;++py ){
		for( px=0;px<width;++px ){
			argb=pixels[j++];
			p[i]=(argb>>16) & 0xff;
			p[i+1]=(argb>>8) & 0xff;
			p[i+2]=argb & 0xff;
			p[i+3]=(argb>>24) & 0xff;
			i+=4;
		}
		j+=pitch-width;
	}
	
	surface.gc.putImageData( imgData,x,y );
}

//***** gxtkSurface class *****

function gxtkSurface( image,graphics ){
	this.image=image;
	this.graphics=graphics;
	this.swidth=image.meta_width;
	this.sheight=image.meta_height;
}

//***** GXTK API *****

gxtkSurface.prototype.Discard=function(){
	if( this.image ){
		this.image=null;
	}
}

gxtkSurface.prototype.Width=function(){
	return this.swidth;
}

gxtkSurface.prototype.Height=function(){
	return this.sheight;
}

gxtkSurface.prototype.Loaded=function(){
	return this.image.complete;
}

//***** Class gxtkInput *****

function gxtkInput( app ){
	this.app=app;
	this.keyStates=new Array( 512 );
	this.charQueue=new Array( 32 );
	this.charPut=0;
	this.charGet=0;
	this.mouseX=0;
	this.mouseY=0;
	this.joyX=0;
	this.joyY=0;
	this.joyZ=0;
	this.touchIds=new Array( 32 );
	this.touchXs=new Array( 32 );
	this.touchYs=new Array( 32 );
	this.accelX=0;
	this.accelY=0;
	this.accelZ=0;
	
	var i;
	
	for( i=0;i<512;++i ){
		this.keyStates[i]=0;
	}
	
	for( i=0;i<32;++i ){
		this.touchIds[i]=-1;
		this.touchXs[i]=0;
		this.touchYs[i]=0;
	}
}

gxtkInput.prototype.BeginUpdate=function(){
}

gxtkInput.prototype.EndUpdate=function(){
	for( var i=0;i<512;++i ){
		this.keyStates[i]&=0x100;
	}
	this.charGet=0;
	this.charPut=0;
}

gxtkInput.prototype.OnKeyDown=function( key ){
	if( (this.keyStates[key]&0x100)==0 ){
		this.keyStates[key]|=0x100;
		++this.keyStates[key];
		//
		if( key==KEY_LMB ){
			this.keyStates[KEY_TOUCH0]|=0x100;
			++this.keyStates[KEY_TOUCH0];
		}else if( key==KEY_TOUCH0 ){
			this.keyStates[KEY_LMB]|=0x100;
			++this.keyStates[KEY_LMB];
		}
		//
	}
}

gxtkInput.prototype.OnKeyUp=function( key ){
	this.keyStates[key]&=0xff;
	//
	if( key==KEY_LMB ){
		this.keyStates[KEY_TOUCH0]&=0xff;
	}else if( key==KEY_TOUCH0 ){
		this.keyStates[KEY_LMB]&=0xff;
	}
	//
}

gxtkInput.prototype.PutChar=function( chr ){
	if( this.charPut-this.charGet<32 ){
		this.charQueue[this.charPut & 31]=chr;
		this.charPut+=1;
	}
}

gxtkInput.prototype.OnMouseMove=function( x,y ){
	this.mouseX=x;
	this.mouseY=y;
	this.touchXs[0]=x;
	this.touchYs[0]=y;
}

gxtkInput.prototype.OnTouchStart=function( id,x,y ){
	for( var i=0;i<32;++i ){
		if( this.touchIds[i]==-1 ){
			this.touchIds[i]=id;
			this.touchXs[i]=x;
			this.touchYs[i]=y;
			this.OnKeyDown( KEY_TOUCH0+i );
			return;
		} 
	}
}

gxtkInput.prototype.OnTouchMove=function( id,x,y ){
	for( var i=0;i<32;++i ){
		if( this.touchIds[i]==id ){
			this.touchXs[i]=x;
			this.touchYs[i]=y;
			if( i==0 ){
				this.mouseX=x;
				this.mouseY=y;
			}
			return;
		}
	}
}

gxtkInput.prototype.OnTouchEnd=function( id ){
	for( var i=0;i<32;++i ){
		if( this.touchIds[i]==id ){
			this.touchIds[i]=-1;
			this.OnKeyUp( KEY_TOUCH0+i );
			return;
		}
	}
}

gxtkInput.prototype.OnDeviceMotion=function( x,y,z ){
	this.accelX=x;
	this.accelY=y;
	this.accelZ=z;
}

//***** GXTK API *****

gxtkInput.prototype.SetKeyboardEnabled=function( enabled ){
	return 0;
}

gxtkInput.prototype.KeyDown=function( key ){
	if( key>0 && key<512 ){
		return this.keyStates[key] >> 8;
	}
	return 0;
}

gxtkInput.prototype.KeyHit=function( key ){
	if( key>0 && key<512 ){
		return this.keyStates[key] & 0xff;
	}
	return 0;
}

gxtkInput.prototype.GetChar=function(){
	if( this.charPut!=this.charGet ){
		var chr=this.charQueue[this.charGet & 31];
		this.charGet+=1;
		return chr;
	}
	return 0;
}

gxtkInput.prototype.MouseX=function(){
	return this.mouseX;
}

gxtkInput.prototype.MouseY=function(){
	return this.mouseY;
}

gxtkInput.prototype.JoyX=function( index ){
	return this.joyX;
}

gxtkInput.prototype.JoyY=function( index ){
	return this.joyY;
}

gxtkInput.prototype.JoyZ=function( index ){
	return this.joyZ;
}

gxtkInput.prototype.TouchX=function( index ){
	return this.touchXs[index];
}

gxtkInput.prototype.TouchY=function( index ){
	return this.touchYs[index];
}

gxtkInput.prototype.AccelX=function(){
	return this.accelX;
}

gxtkInput.prototype.AccelY=function(){
	return this.accelY;
}

gxtkInput.prototype.AccelZ=function(){
	return this.accelZ;
}


//***** gxtkChannel class *****
function gxtkChannel(){
	this.sample=null;
	this.audio=null;
	this.volume=1;
	this.pan=0;
	this.rate=1;
	this.flags=0;
	this.state=0;
}

//***** gxtkAudio class *****
function gxtkAudio( app ){
	this.app=app;
	this.okay=typeof(Audio)!="undefined";
	this.nextchan=0;
	this.music=null;
	this.channels=new Array(33);
	for( var i=0;i<33;++i ){
		this.channels[i]=new gxtkChannel();
	}
}

gxtkAudio.prototype.OnSuspend=function(){
	var i;
	for( i=0;i<33;++i ){
		var chan=this.channels[i];
		if( chan.state==1 ) chan.audio.pause();
	}
}

gxtkAudio.prototype.OnResume=function(){
	var i;
	for( i=0;i<33;++i ){
		var chan=this.channels[i];
		if( chan.state==1 ) chan.audio.play();
	}
}

gxtkAudio.prototype.LoadSample=function( path ){
	var audio=loadAudio( path );
	if( audio ) return new gxtkSample( audio );
	return null;
}

gxtkAudio.prototype.PlaySample=function( sample,channel,flags ){
	if( !this.okay ) return;

	var chan=this.channels[channel];

	if( chan.state!=0 ){
		chan.audio.pause();
		chan.state=0;
	}
	
	for( var i=0;i<33;++i ){
		var chan2=this.channels[i];
		if( chan2.state==1 && chan2.audio.ended && !chan2.audio.loop ) chan.state=0;
		if( chan2.state==0 && chan2.sample ){
			chan2.sample.FreeAudio( chan2.audio );
			chan2.sample=null;
			chan2.audio=null;
		}
	}

	var audio=sample.AllocAudio();
	if( !audio ) return;
	
	audio.loop=(flags&1)!=0;
	audio.volume=chan.volume;
	audio.play();

	chan.sample=sample;
	chan.audio=audio;
	chan.flags=flags;
	chan.state=1;
}

gxtkAudio.prototype.StopChannel=function( channel ){
	var chan=this.channels[channel];
	
	if( chan.state!=0 ){
		chan.audio.pause();
		chan.state=0;
	}
}

gxtkAudio.prototype.PauseChannel=function( channel ){
	var chan=this.channels[channel];
	
	if( chan.state==1 ){
		if( chan.audio.ended && !chan.audio.loop ){
			chan.state=0;
		}else{
			chan.audio.pause();
			chan.state=2;
		}
	}
}

gxtkAudio.prototype.ResumeChannel=function( channel ){
	var chan=this.channels[channel];
	
	if( chan.state==2 ){
		chan.audio.play();
		chan.state=1;
	}
}

gxtkAudio.prototype.ChannelState=function( channel ){
	var chan=this.channels[channel];
	if( chan.state==1 && chan.audio.ended && !chan.audio.loop ) chan.state=0;
	return chan.state;
}

gxtkAudio.prototype.SetVolume=function( channel,volume ){
	var chan=this.channels[channel];
	if( chan.state!=0 ) chan.audio.volume=volume;
	chan.volume=volume;
}

gxtkAudio.prototype.SetPan=function( channel,pan ){
	var chan=this.channels[channel];
	chan.pan=pan;
}

gxtkAudio.prototype.SetRate=function( channel,rate ){
	var chan=this.channels[channel];
	chan.rate=rate;
}

gxtkAudio.prototype.PlayMusic=function( path,flags ){
	this.StopMusic();
	
	this.music=this.LoadSample( path );
	if( !this.music ) return;
	
	this.PlaySample( this.music,32,flags );
}

gxtkAudio.prototype.StopMusic=function(){
	this.StopChannel( 32 );

	if( this.music ){
		this.music.Discard();
		this.music=null;
	}
}

gxtkAudio.prototype.PauseMusic=function(){
	this.PauseChannel( 32 );
}

gxtkAudio.prototype.ResumeMusic=function(){
	this.ResumeChannel( 32 );
}

gxtkAudio.prototype.MusicState=function(){
	return this.ChannelState( 32 );
}

gxtkAudio.prototype.SetMusicVolume=function( volume ){
	this.SetVolume( 32,volume );
}

//***** gxtkSample class *****

function gxtkSample( audio ){
	this.audio=audio;
	this.free=new Array();
	this.insts=new Array();
}

gxtkSample.prototype.Discard=function(){
}

gxtkSample.prototype.FreeAudio=function( audio ){
	this.free.push( audio );
}

gxtkSample.prototype.AllocAudio=function(){
	var audio;
	while( this.free.length ){
		audio=this.free.pop();
		try{
			audio.currentTime=0;
			return audio;
		}catch( ex ){
			print( "AUDIO ERROR1!" );
		}
	}
	
	//Max out?
	if( this.insts.length==8 ) return null;
	
	audio=new Audio( this.audio.src );
	
	//yucky loop handler for firefox!
	//
	audio.addEventListener( 'ended',function(){
		if( this.loop ){
			try{
				this.currentTime=0;
				this.play();
			}catch( ex ){
				print( "AUDIO ERROR2!" );
			}
		}
	},false );

	this.insts.push( audio );
	return audio;
}

var fantomengine = new Object();

fantomengine.DeviceName=function(){
	return "";
};

fantomengine.Hardware=function(){
	return "";
};

fantomengine.Product=function(){
	return "";
};

fantomengine.Serial=function(){
	return "";
};

fantomengine.User=function(){
	return "";
};



fantomengine.GetBrowserName=function(){
//Based on code from here: h t t p://stackoverflow.com/questions/2400935/browser-detection-in-javascript
	var ret = "";
	if (navigator.userAgent.search("MSIE") >= 0){
	    ret = "MS Internet Explorer";
	}
	else if (navigator.userAgent.search("Chrome") >= 0){
	    ret = "Google Chrome";
	}
	else if (navigator.userAgent.search("Firefox") >= 0){
		ret = "Mozilla Firefox";
	}
	else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0){
	    ret = "Apple Safari";
	}
	else if (navigator.userAgent.search("Opera") >= 0){
	    ret = "Opera";
	}
	else{
	    ret = "Other";
	}


	return ret;
};

fantomengine.GetBrowserVersion=function(){
	var ret = "";
	if (navigator.userAgent.search("MSIE") >= 0){
	    var position = navigator.userAgent.search("MSIE") + 5;
	    var end = navigator.userAgent.search("; Windows");
	    var version = navigator.userAgent.substring(position,end);
	    ret = version;
	}
	else if (navigator.userAgent.search("Chrome") >= 0){
	    var position = navigator.userAgent.search("Chrome") + 7;
	    var end = navigator.userAgent.search(" Safari");
	    var version = navigator.userAgent.substring(position,end);
	    ret = version;
	}
	else if (navigator.userAgent.search("Firefox") >= 0){
	    var position = navigator.userAgent.search("Firefox") + 8;
	    var version = navigator.userAgent.substring(position);
	    ret = version;
	}
	else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0){//<< Here
	    var position = navigator.userAgent.search("Version") + 8;
	    var end = navigator.userAgent.search(" Safari");
	    var version = navigator.userAgent.substring(position,end);
	    ret = version;
	}
	else if (navigator.userAgent.search("Opera") >= 0){
	    var position = navigator.userAgent.search("Version") + 8;
	    var version = navigator.userAgent.substring(position);
	    ret = version;
	}
	else{
	    ret = "";
	}
	return ret;
};

fantomengine.GetBrowserPlatform=function(){
	return navigator.platform;
};

fantomengine.MaximizeCanvas=function(){
	var canvas = document.getElementById("GameCanvas");
	if (canvas)
	{
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		canvas.ontouchmove = function(ev){  
                 // we don't want to have the default iphone scrolling behaviour ontouchmove  
                 ev.preventDefault();  
             };	
	}
	var console = document.getElementById("GameConsole");
	if (console)
	{
		console.style.width = "0px";
		console.style.height = "0px";
	}
};
function bb_app_App(){
	Object.call(this);
}
function bb_app_App_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<105>";
	bb_app_device=bb_app_AppDevice_new.call(new bb_app_AppDevice,this);
	pop_err();
	return this;
}
bb_app_App.prototype.m_OnCreate=function(){
	push_err();
	pop_err();
	return 0;
}
bb_app_App.prototype.m_OnUpdate=function(){
	push_err();
	pop_err();
	return 0;
}
bb_app_App.prototype.m_OnSuspend=function(){
	push_err();
	pop_err();
	return 0;
}
bb_app_App.prototype.m_OnResume=function(){
	push_err();
	pop_err();
	return 0;
}
bb_app_App.prototype.m_OnRender=function(){
	push_err();
	pop_err();
	return 0;
}
bb_app_App.prototype.m_OnLoading=function(){
	push_err();
	pop_err();
	return 0;
}
function bb_breakOut_game(){
	bb_app_App.call(this);
	this.f_eng=null;
	this.f_cw=.0;
	this.f_ch=.0;
	this.f_font1=null;
	this.f_sndBreakBlock=null;
	this.f_sndLostLife=null;
	this.f_sndCoin=null;
	this.f_sndGameOver=null;
	this.f_sndBounce=null;
	this.f_sndWin=null;
	this.f_layerBackGround=null;
	this.f_layerGame=null;
	this.f_layerInfo=null;
	this.f_layerTitle=null;
	this.f_life=0;
	this.f_txtLife=null;
	this.f_txtWin=null;
	this.f_txtLose=null;
	this.f_imgLife=null;
	this.f_isSuspended=false;
	this.f_gameMode=8;
	this.f_blockCount=0;
	this.f_raquette=null;
	this.f_debug=false;
	this.f_ball=null;
	this.f_moving=false;
	this.f_speed=.0;
}
bb_breakOut_game.prototype=extend_class(bb_app_App);
function bb_breakOut_game_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<30>";
	bb_app_App_new.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<30>";
	pop_err();
	return this;
}
bb_breakOut_game.prototype.m_LoadSounds=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<150>";
	this.f_sndBreakBlock=this.f_eng.m_LoadSound("break",false);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<151>";
	this.f_sndLostLife=this.f_eng.m_LoadSound("smw_lost_a_life",false);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<152>";
	this.f_sndCoin=this.f_eng.m_LoadSound("smw_coin",false);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<153>";
	this.f_sndGameOver=this.f_eng.m_LoadSound("smw_game_over",false);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<154>";
	this.f_sndBounce=this.f_eng.m_LoadSound("stomp",false);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<155>";
	this.f_sndWin=this.f_eng.m_LoadSound("smw_keyhole_exit",false);
	pop_err();
}
bb_breakOut_game.prototype.m_CreateLayers=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<201>";
	this.f_layerBackGround=this.f_eng.m_GetDefaultLayer();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<202>";
	this.f_layerGame=this.f_eng.m_CreateLayer(null);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<203>";
	this.f_layerInfo=this.f_eng.m_CreateLayer(null);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<204>";
	this.f_layerTitle=this.f_eng.m_CreateLayer(null);
	pop_err();
}
bb_breakOut_game.prototype.m_CreateBackGroundScreen=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<289>";
	this.f_eng.m_SetDefaultLayer(this.f_layerBackGround);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<290>";
	var t_obj=this.f_eng.m_CreateImage("background.jpg",this.f_cw/2.0,this.f_ch/2.0,null);
	pop_err();
}
bb_breakOut_game.prototype.m_CreateInfoText=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<294>";
	this.f_eng.m_SetDefaultLayer(this.f_layerInfo);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<295>";
	this.f_txtLife=this.f_eng.m_CreateText(this.f_font1,"Life : "+String(this.f_life),10.0,this.f_ch-30.0,0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<296>";
	this.f_txtLife.m_SetScale(0.5,0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<297>";
	this.f_txtWin=this.f_eng.m_CreateText(this.f_font1,"Win! Press 'ESC' to return to the title screen",this.f_cw/2.0,this.f_ch/4.0*3.0,3);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<298>";
	this.f_txtWin.m_SetScale(0.70,0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<299>";
	this.f_txtLose=this.f_eng.m_CreateText(this.f_font1,"Lose! Press 'ESC' to return to the title screen",this.f_cw/2.0,this.f_ch/4.0*3.0,3);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<300>";
	this.f_txtLose.m_SetScale(0.70,0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<301>";
	this.f_imgLife=this.f_eng.m_CreateImage("racket.png",this.f_txtLife.m_GetWidth()+30.0,this.f_ch-15.0,null);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<302>";
	this.f_imgLife.m_SetScale(0.20,0);
	pop_err();
}
bb_breakOut_game.prototype.m_CreateTitleScreen=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<306>";
	this.f_eng.m_SetDefaultLayer(this.f_layerTitle);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<307>";
	var t_box=this.f_eng.m_CreateBox(this.f_cw,this.f_ch,this.f_cw/2.0,this.f_ch/2.0,null);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<308>";
	t_box.m_SetColor(255.0,0.0,0.0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<309>";
	var t_box2=this.f_eng.m_CreateBox(this.f_cw-40.0,this.f_ch-40.0,this.f_cw/2.0,this.f_ch/2.0,null);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<310>";
	var t_img=this.f_eng.m_CreateImage("champignons.jpg",this.f_cw/2.0,this.f_ch/2.0-50.0,null);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<311>";
	t_img.m_SetScale(0.7,0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<312>";
	var t_tx1=this.f_eng.m_CreateText(this.f_font1,"MushRoom Breakout",this.f_cw/2.0,this.f_ch/5.0,3);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<313>";
	var t_tx2=this.f_eng.m_CreateText(this.f_font1,"Click to play!",this.f_cw/2.0,this.f_ch/5.0*3.0,3);
	pop_err();
}
bb_breakOut_game.prototype.m_OnCreate=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<91>";
	bb_app_SetUpdateRate(60);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<92>";
	this.f_eng=bb_breakOut_engine_new.call(new bb_breakOut_engine);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<94>";
	this.f_cw=dbg_object(this.f_eng).f_canvasWidth;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<95>";
	this.f_ch=dbg_object(this.f_eng).f_canvasHeight;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<97>";
	this.f_font1=this.f_eng.m_LoadFont("smb");
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<99>";
	this.m_LoadSounds();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<100>";
	this.m_CreateLayers();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<101>";
	this.m_CreateBackGroundScreen();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<102>";
	this.m_CreateInfoText();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<103>";
	this.m_CreateTitleScreen();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<104>";
	pop_err();
	return 0;
}
bb_breakOut_game.prototype.m_CreateRaquette=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<160>";
	this.f_raquette=this.f_eng.m_CreateImage("donut_paddle.png",this.f_cw/2.0,this.f_ch/6.0*5.0,null);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<161>";
	this.f_raquette.m_SetHeight(16.0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<162>";
	this.f_raquette.m_SetWidth(100.0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<164>";
	this.f_raquette.m_SetColGroup(3);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<166>";
	this.f_raquette.m_SetID(1);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<167>";
	this.f_raquette.m_SetLayer(this.f_layerGame);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<168>";
	if(this.f_debug==true){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<169>";
		var t_circle=this.f_eng.m_CreateCircle(5.0,dbg_object(this.f_raquette).f_xPos,dbg_object(this.f_raquette).f_yPos,null);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<170>";
		t_circle.m_SetParent(this.f_raquette);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<171>";
		t_circle.m_SetColor(255.0,0.0,0.0);
	}
	pop_err();
}
bb_breakOut_game.prototype.m_CreateBall=function(t_x,t_y){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<177>";
	this.f_ball=this.f_eng.m_CreateImage("ball.png",t_x,t_y-60.0,null);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<178>";
	this.f_ball.m_SetRadius(24.0,0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<179>";
	this.f_ball.m_SetColor(255.0,255.0,255.0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<180>";
	this.f_ball.m_SetScale(0.5,0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<181>";
	this.f_ball.m_SetColGroup(4);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<182>";
	this.f_ball.m_SetColWith2(3,1);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<183>";
	this.f_ball.m_SetColWith2(5,1);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<184>";
	this.f_ball.m_SetID(2);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<185>";
	this.f_ball.m_SetMaxSpeed(20.0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<186>";
	this.f_ball.m_SetLayer(this.f_layerGame);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<187>";
	this.f_ball.m_SetParent(this.f_raquette);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<188>";
	if(this.f_debug==true){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<193>";
		var t_circle=this.f_eng.m_CreateCircle(this.f_ball.m_GetRadius(),dbg_object(this.f_ball).f_xPos,dbg_object(this.f_ball).f_yPos,null);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<194>";
		t_circle.m_SetParent(this.f_ball);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<195>";
		t_circle.m_SetColor(255.0,0.0,0.0);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<196>";
		t_circle.m_SetAlpha(0.7,0);
	}
	pop_err();
}
bb_breakOut_game.prototype.m_CreateBlocks=function(t_x,t_y,t_blockType){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<230>";
	if(t_blockType==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<231>";
		var t_block=this.f_eng.m_CreateImage("brick.png",t_x*40.0,t_y*40.0,null);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<232>";
		t_block.m_SetLayer(this.f_layerGame);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<233>";
		t_block.m_SetScale(0.8,0);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<234>";
		t_block.m_SetColGroup(5);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<235>";
		t_block.m_SetColWith2(4,1);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<237>";
	if(t_blockType==2){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<238>";
		var t_block2=this.f_eng.m_CreateImage("question.png",t_x*40.0,t_y*40.0,null);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<239>";
		t_block2.m_SetLayer(this.f_layerGame);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<240>";
		t_block2.m_SetScale(0.8,0);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<241>";
		t_block2.m_SetColGroup(5);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<242>";
		t_block2.m_SetColWith2(4,1);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<244>";
	this.f_blockCount+=1;
	pop_err();
}
bb_breakOut_game.prototype.m_LoadBlocks=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<250>";
	var t_levelText=bb_app_LoadString("level1.txt");
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<252>";
	var t_lines=t_levelText.split(String.fromCharCode(10));
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<254>";
	var t_ly=t_lines.length;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<256>";
	var t_level=[];
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<257>";
	t_level=resize_number_array(t_level,255);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<258>";
	var t_levelTile=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<259>";
	var t_lx=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<260>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<260>";
	var t_=t_lines;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<260>";
	var t_2=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<260>";
	while(t_2<t_.length){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<260>";
		var t_line=dbg_array(t_,t_2)[dbg_index];
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<260>";
		t_2=t_2+1;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<261>";
		t_line=string_trim(t_line);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<262>";
		if(t_line==""){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<262>";
			continue;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<263>";
		var t_leveldata=t_line.split(";");
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<264>";
		t_lx=t_leveldata.length;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<265>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<265>";
		var t_3=t_leveldata;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<265>";
		var t_4=0;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<265>";
		while(t_4<t_3.length){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<265>";
			var t_tile=dbg_array(t_3,t_4)[dbg_index];
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<265>";
			t_4=t_4+1;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<266>";
			t_levelTile+=1;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<267>";
			dbg_array(t_level,t_levelTile)[dbg_index]=parseInt((string_trim(t_tile)),10)
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<271>";
	t_levelTile=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<272>";
	for(var t_h=0;t_h<=11;t_h=t_h+1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<273>";
		for(var t_w=0;t_w<=15;t_w=t_w+1){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<274>";
			t_levelTile+=1;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<275>";
			var t_5=dbg_array(t_level,t_levelTile)[dbg_index];
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<276>";
			if(t_5==0){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<277>";
				continue;
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<278>";
				if(t_5==1){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<279>";
					this.m_CreateBlocks((t_w),(t_h),1);
				}else{
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<280>";
					if(t_5==2){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<281>";
						this.m_CreateBlocks((t_w),(t_h),2);
					}
				}
			}
		}
	}
	pop_err();
}
bb_breakOut_game.prototype.m_StartNewGame=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<317>";
	this.f_life=3;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<318>";
	this.f_blockCount=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<319>";
	this.f_layerTitle.m_SetActive(false);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<320>";
	this.f_layerGame.m_RemoveAllObjects();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<321>";
	this.f_eng.m_SetDefaultLayer(this.f_layerGame);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<322>";
	this.m_CreateRaquette();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<323>";
	this.m_CreateBall(this.f_raquette.m_GetPosX(),this.f_raquette.m_GetPosY());
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<324>";
	this.m_LoadBlocks();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<325>";
	this.f_gameMode=6;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<326>";
	this.f_txtLife.m_SetActive(true);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<327>";
	this.f_imgLife.m_SetActive(true);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<328>";
	this.f_txtWin.m_SetActive(false);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<329>";
	this.f_txtLose.m_SetActive(false);
	pop_err();
}
bb_breakOut_game.prototype.m_OnUpdate=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<109>";
	var t_d=(this.f_eng.m_CalcDeltaTime())/60.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<110>";
	if(this.f_isSuspended==false){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<111>";
		var t_=this.f_gameMode;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<112>";
		if(t_==6){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<113>";
			this.f_eng.m_Update(t_d);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<114>";
			this.f_eng.m_CollisionCheck2(this.f_layerGame);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<115>";
			this.f_txtLife.m_SetText("Life : "+String(this.f_life));
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<116>";
			if(t_==8){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<117>";
				if((bb_input_MouseHit(0))!=0){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<118>";
					this.m_StartNewGame();
				}
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<120>";
				if(t_==7){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<121>";
					if((bb_input_KeyHit(27))!=0){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<122>";
						this.f_gameMode=8;
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<123>";
						this.f_layerTitle.m_SetActive(true);
					}
				}
			}
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<128>";
	pop_err();
	return 0;
}
bb_breakOut_game.prototype.m_OnRender=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<132>";
	bb_graphics_Cls(0.0,0.0,0.0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<133>";
	this.f_eng.m_Render();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<134>";
	pop_err();
	return 0;
}
bb_breakOut_game.prototype.m_OnResume=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<138>";
	this.f_isSuspended=false;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<139>";
	bb_app_SetUpdateRate(60);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<140>";
	pop_err();
	return 0;
}
bb_breakOut_game.prototype.m_OnSuspend=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<144>";
	this.f_isSuspended=true;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<145>";
	bb_app_SetUpdateRate(5);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<146>";
	pop_err();
	return 0;
}
function bb_app_AppDevice(){
	gxtkApp.call(this);
	this.f_app=null;
	this.f_updateRate=0;
}
bb_app_AppDevice.prototype=extend_class(gxtkApp);
function bb_app_AppDevice_new(t_app){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<45>";
	dbg_object(this).f_app=t_app;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<46>";
	bb_graphics_SetGraphicsContext(bb_graphics_GraphicsContext_new.call(new bb_graphics_GraphicsContext,this.GraphicsDevice()));
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<47>";
	bb_input_SetInputDevice(this.InputDevice());
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<48>";
	bb_audio_SetAudioDevice(this.AudioDevice());
	pop_err();
	return this;
}
function bb_app_AppDevice_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<42>";
	pop_err();
	return this;
}
bb_app_AppDevice.prototype.OnCreate=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<52>";
	bb_graphics_SetFont(null,32);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<53>";
	var t_=this.f_app.m_OnCreate();
	pop_err();
	return t_;
}
bb_app_AppDevice.prototype.OnUpdate=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<57>";
	var t_=this.f_app.m_OnUpdate();
	pop_err();
	return t_;
}
bb_app_AppDevice.prototype.OnSuspend=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<61>";
	var t_=this.f_app.m_OnSuspend();
	pop_err();
	return t_;
}
bb_app_AppDevice.prototype.OnResume=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<65>";
	var t_=this.f_app.m_OnResume();
	pop_err();
	return t_;
}
bb_app_AppDevice.prototype.OnRender=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<69>";
	bb_graphics_BeginRender();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<70>";
	var t_r=this.f_app.m_OnRender();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<71>";
	bb_graphics_EndRender();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<72>";
	pop_err();
	return t_r;
}
bb_app_AppDevice.prototype.OnLoading=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<76>";
	bb_graphics_BeginRender();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<77>";
	var t_r=this.f_app.m_OnLoading();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<78>";
	bb_graphics_EndRender();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<79>";
	pop_err();
	return t_r;
}
bb_app_AppDevice.prototype.SetUpdateRate=function(t_hertz){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<83>";
	gxtkApp.prototype.SetUpdateRate.call(this,t_hertz);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<84>";
	this.f_updateRate=t_hertz;
	pop_err();
	return 0;
}
function bb_graphics_GraphicsContext(){
	Object.call(this);
	this.f_device=null;
	this.f_defaultFont=null;
	this.f_font=null;
	this.f_firstChar=0;
	this.f_matrixSp=0;
	this.f_ix=1.0;
	this.f_iy=.0;
	this.f_jx=.0;
	this.f_jy=1.0;
	this.f_tx=.0;
	this.f_ty=.0;
	this.f_tformed=0;
	this.f_matDirty=0;
	this.f_color_r=.0;
	this.f_color_g=.0;
	this.f_color_b=.0;
	this.f_alpha=.0;
	this.f_blend=0;
	this.f_scissor_x=.0;
	this.f_scissor_y=.0;
	this.f_scissor_width=.0;
	this.f_scissor_height=.0;
	this.f_matrixStack=new_number_array(192);
}
function bb_graphics_GraphicsContext_new(t_device){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<239>";
	dbg_object(this).f_device=t_device;
	pop_err();
	return this;
}
function bb_graphics_GraphicsContext_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<236>";
	pop_err();
	return this;
}
var bb_graphics_context;
function bb_graphics_SetGraphicsContext(t_gc){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<282>";
	bb_graphics_context=t_gc;
	pop_err();
	return 0;
}
var bb_input_device;
function bb_input_SetInputDevice(t_dev){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/input.monkey<40>";
	bb_input_device=t_dev;
	pop_err();
	return 0;
}
var bb_audio_device;
function bb_audio_SetAudioDevice(t_dev){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<60>";
	bb_audio_device=t_dev;
	pop_err();
	return 0;
}
var bb_app_device;
var bb_breakOut_g;
function bbMain(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<503>";
	bb_breakOut_g=bb_breakOut_game_new.call(new bb_breakOut_game);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<504>";
	pop_err();
	return 0;
}
function bb_graphics_Image(){
	Object.call(this);
	this.f_surface=null;
	this.f_width=0;
	this.f_height=0;
	this.f_frames=[];
	this.f_flags=0;
	this.f_tx=.0;
	this.f_ty=.0;
	this.f_source=null;
}
var bb_graphics_Image_DefaultFlags;
function bb_graphics_Image_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<70>";
	pop_err();
	return this;
}
bb_graphics_Image.prototype.m_SetHandle=function(t_tx,t_ty){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<116>";
	dbg_object(this).f_tx=t_tx;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<117>";
	dbg_object(this).f_ty=t_ty;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<118>";
	dbg_object(this).f_flags=dbg_object(this).f_flags&-2;
	pop_err();
	return 0;
}
bb_graphics_Image.prototype.m_ApplyFlags=function(t_iflags){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<209>";
	this.f_flags=t_iflags;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<211>";
	if((this.f_flags&2)!=0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<212>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<212>";
		var t_=this.f_frames;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<212>";
		var t_2=0;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<212>";
		while(t_2<t_.length){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<212>";
			var t_f=dbg_array(t_,t_2)[dbg_index];
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<212>";
			t_2=t_2+1;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<213>";
			dbg_object(t_f).f_x+=1;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<215>";
		this.f_width-=2;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<218>";
	if((this.f_flags&4)!=0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<219>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<219>";
		var t_3=this.f_frames;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<219>";
		var t_4=0;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<219>";
		while(t_4<t_3.length){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<219>";
			var t_f2=dbg_array(t_3,t_4)[dbg_index];
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<219>";
			t_4=t_4+1;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<220>";
			dbg_object(t_f2).f_y+=1;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<222>";
		this.f_height-=2;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<225>";
	if((this.f_flags&1)!=0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<226>";
		this.m_SetHandle((this.f_width)/2.0,(this.f_height)/2.0);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<229>";
	if(this.f_frames.length==1 && dbg_object(dbg_array(this.f_frames,0)[dbg_index]).f_x==0 && dbg_object(dbg_array(this.f_frames,0)[dbg_index]).f_y==0 && this.f_width==this.f_surface.Width() && this.f_height==this.f_surface.Height()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<230>";
		this.f_flags|=65536;
	}
	pop_err();
	return 0;
}
bb_graphics_Image.prototype.m_Load=function(t_path,t_nframes,t_iflags){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<164>";
	this.f_surface=dbg_object(bb_graphics_context).f_device.LoadSurface(t_path);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<165>";
	if(!((this.f_surface)!=null)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<165>";
		pop_err();
		return null;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<167>";
	this.f_width=((this.f_surface.Width()/t_nframes)|0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<168>";
	this.f_height=this.f_surface.Height();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<170>";
	this.f_frames=new_object_array(t_nframes);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<172>";
	for(var t_i=0;t_i<t_nframes;t_i=t_i+1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<173>";
		dbg_array(this.f_frames,t_i)[dbg_index]=bb_graphics_Frame_new.call(new bb_graphics_Frame,t_i*this.f_width,0)
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<176>";
	this.m_ApplyFlags(t_iflags);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<177>";
	pop_err();
	return this;
}
bb_graphics_Image.prototype.m_Grab=function(t_x,t_y,t_iwidth,t_iheight,t_nframes,t_iflags,t_source){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<182>";
	dbg_object(this).f_source=t_source;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<183>";
	this.f_surface=dbg_object(t_source).f_surface;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<185>";
	this.f_width=t_iwidth;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<186>";
	this.f_height=t_iheight;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<188>";
	this.f_frames=new_object_array(t_nframes);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<190>";
	var t_ix=t_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<190>";
	var t_iy=t_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<192>";
	for(var t_i=0;t_i<t_nframes;t_i=t_i+1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<193>";
		if(t_ix+this.f_width>dbg_object(t_source).f_width){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<194>";
			t_ix=0;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<195>";
			t_iy+=this.f_height;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<197>";
		if(t_ix+this.f_width>dbg_object(t_source).f_width || t_iy+this.f_height>dbg_object(t_source).f_height){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<198>";
			error("Image frame outside surface");
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<200>";
		dbg_array(this.f_frames,t_i)[dbg_index]=bb_graphics_Frame_new.call(new bb_graphics_Frame,t_ix+dbg_object(dbg_array(dbg_object(t_source).f_frames,0)[dbg_index]).f_x,t_iy+dbg_object(dbg_array(dbg_object(t_source).f_frames,0)[dbg_index]).f_y)
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<201>";
		t_ix+=this.f_width;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<204>";
	this.m_ApplyFlags(t_iflags);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<205>";
	pop_err();
	return this;
}
bb_graphics_Image.prototype.m_GrabImage=function(t_x,t_y,t_width,t_height,t_frames,t_flags){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<111>";
	if(dbg_object(this).f_frames.length!=1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<111>";
		pop_err();
		return null;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<112>";
	var t_=(bb_graphics_Image_new.call(new bb_graphics_Image)).m_Grab(t_x,t_y,t_width,t_height,t_frames,t_flags,this);
	pop_err();
	return t_;
}
bb_graphics_Image.prototype.m_Height=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<87>";
	pop_err();
	return this.f_height;
}
bb_graphics_Image.prototype.m_Width=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<83>";
	pop_err();
	return this.f_width;
}
bb_graphics_Image.prototype.m_Frames=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<95>";
	var t_=this.f_frames.length;
	pop_err();
	return t_;
}
function bb_graphics_Frame(){
	Object.call(this);
	this.f_x=0;
	this.f_y=0;
}
function bb_graphics_Frame_new(t_x,t_y){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<62>";
	dbg_object(this).f_x=t_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<63>";
	dbg_object(this).f_y=t_y;
	pop_err();
	return this;
}
function bb_graphics_Frame_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<57>";
	pop_err();
	return this;
}
function bb_graphics_LoadImage(t_path,t_frameCount,t_flags){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<309>";
	var t_=(bb_graphics_Image_new.call(new bb_graphics_Image)).m_Load(t_path,t_frameCount,t_flags);
	pop_err();
	return t_;
}
function bb_graphics_LoadImage2(t_path,t_frameWidth,t_frameHeight,t_frameCount,t_flags){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<317>";
	var t_atlas=(bb_graphics_Image_new.call(new bb_graphics_Image)).m_Load(t_path,1,0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<318>";
	if((t_atlas)!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<318>";
		var t_=t_atlas.m_GrabImage(0,0,t_frameWidth,t_frameHeight,t_frameCount,t_flags);
		pop_err();
		return t_;
	}
	pop_err();
	return null;
}
function bb_graphics_SetFont(t_font,t_firstChar){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<596>";
	if(!((t_font)!=null)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<597>";
		if(!((dbg_object(bb_graphics_context).f_defaultFont)!=null)){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<598>";
			dbg_object(bb_graphics_context).f_defaultFont=bb_graphics_LoadImage("mojo_font.png",96,2);
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<600>";
		t_font=dbg_object(bb_graphics_context).f_defaultFont;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<601>";
		t_firstChar=32;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<603>";
	dbg_object(bb_graphics_context).f_font=t_font;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<604>";
	dbg_object(bb_graphics_context).f_firstChar=t_firstChar;
	pop_err();
	return 0;
}
var bb_graphics_renderDevice;
function bb_graphics_SetMatrix(t_ix,t_iy,t_jx,t_jy,t_tx,t_ty){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<367>";
	dbg_object(bb_graphics_context).f_ix=t_ix;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<368>";
	dbg_object(bb_graphics_context).f_iy=t_iy;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<369>";
	dbg_object(bb_graphics_context).f_jx=t_jx;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<370>";
	dbg_object(bb_graphics_context).f_jy=t_jy;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<371>";
	dbg_object(bb_graphics_context).f_tx=t_tx;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<372>";
	dbg_object(bb_graphics_context).f_ty=t_ty;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<373>";
	dbg_object(bb_graphics_context).f_tformed=((t_ix!=1.0 || t_iy!=0.0 || t_jx!=0.0 || t_jy!=1.0 || t_tx!=0.0 || t_ty!=0.0)?1:0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<374>";
	dbg_object(bb_graphics_context).f_matDirty=1;
	pop_err();
	return 0;
}
function bb_graphics_SetMatrix2(t_m){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<363>";
	bb_graphics_SetMatrix(dbg_array(t_m,0)[dbg_index],dbg_array(t_m,1)[dbg_index],dbg_array(t_m,2)[dbg_index],dbg_array(t_m,3)[dbg_index],dbg_array(t_m,4)[dbg_index],dbg_array(t_m,5)[dbg_index]);
	pop_err();
	return 0;
}
function bb_graphics_SetColor(t_r,t_g,t_b){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<322>";
	dbg_object(bb_graphics_context).f_color_r=t_r;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<323>";
	dbg_object(bb_graphics_context).f_color_g=t_g;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<324>";
	dbg_object(bb_graphics_context).f_color_b=t_b;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<325>";
	dbg_object(bb_graphics_context).f_device.SetColor(t_r,t_g,t_b);
	pop_err();
	return 0;
}
function bb_graphics_SetAlpha(t_alpha){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<333>";
	dbg_object(bb_graphics_context).f_alpha=t_alpha;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<334>";
	dbg_object(bb_graphics_context).f_device.SetAlpha(t_alpha);
	pop_err();
	return 0;
}
function bb_graphics_SetBlend(t_blend){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<342>";
	dbg_object(bb_graphics_context).f_blend=t_blend;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<343>";
	dbg_object(bb_graphics_context).f_device.SetBlend(t_blend);
	pop_err();
	return 0;
}
function bb_graphics_DeviceWidth(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<301>";
	var t_=dbg_object(bb_graphics_context).f_device.Width();
	pop_err();
	return t_;
}
function bb_graphics_DeviceHeight(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<305>";
	var t_=dbg_object(bb_graphics_context).f_device.Height();
	pop_err();
	return t_;
}
function bb_graphics_SetScissor(t_x,t_y,t_width,t_height){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<351>";
	dbg_object(bb_graphics_context).f_scissor_x=t_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<352>";
	dbg_object(bb_graphics_context).f_scissor_y=t_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<353>";
	dbg_object(bb_graphics_context).f_scissor_width=t_width;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<354>";
	dbg_object(bb_graphics_context).f_scissor_height=t_height;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<355>";
	dbg_object(bb_graphics_context).f_device.SetScissor(((t_x)|0),((t_y)|0),((t_width)|0),((t_height)|0));
	pop_err();
	return 0;
}
function bb_graphics_BeginRender(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<286>";
	if(!((dbg_object(bb_graphics_context).f_device.Mode())!=0)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<286>";
		pop_err();
		return 0;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<287>";
	bb_graphics_renderDevice=dbg_object(bb_graphics_context).f_device;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<288>";
	dbg_object(bb_graphics_context).f_matrixSp=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<289>";
	bb_graphics_SetMatrix(1.0,0.0,0.0,1.0,0.0,0.0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<290>";
	bb_graphics_SetColor(255.0,255.0,255.0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<291>";
	bb_graphics_SetAlpha(1.0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<292>";
	bb_graphics_SetBlend(0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<293>";
	bb_graphics_SetScissor(0.0,0.0,(bb_graphics_DeviceWidth()),(bb_graphics_DeviceHeight()));
	pop_err();
	return 0;
}
function bb_graphics_EndRender(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<297>";
	bb_graphics_renderDevice=null;
	pop_err();
	return 0;
}
function bb_app_SetUpdateRate(t_hertz){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<141>";
	var t_=bb_app_device.SetUpdateRate(t_hertz);
	pop_err();
	return t_;
}
function bb_cftEngine_ftEngine(){
	Object.call(this);
	this.f_defaultLayer=null;
	this.f_layerList=bb_list_List2_new.call(new bb_list_List2);
	this.f_defaultScene=null;
	this.f_sceneList=bb_list_List3_new.call(new bb_list_List3);
	this.f_screenWidth=.0;
	this.f_screenHeight=.0;
	this.f_canvasWidth=.0;
	this.f_canvasHeight=.0;
	this.f_lastMillisecs=bb_app_Millisecs();
	this.f_timeScale=1.0;
	this.f_engineTime=0.0;
	this.f_time=0;
	this.f_lastTime=0;
	this.f_swiper=null;
	this.f_imgMng=null;
	this.f_fontList=bb_list_List4_new.call(new bb_list_List4);
	this.f_soundList=bb_list_List5_new.call(new bb_list_List5);
	this.f_defaultActive=true;
	this.f_defaultVisible=true;
	this.f_deltaTime=0;
	this.f_timerList=bb_list_List7_new.call(new bb_list_List7);
	this.f_isPaused=false;
	this.f_delta=1.0;
	this.f_red=255.0;
	this.f_green=255.0;
	this.f_blue=255.0;
	this.f_autofitX=0;
	this.f_autofitY=0;
	this.f_scaleX=1.0;
	this.f_scaleY=1.0;
	this.f_lastLayerAngle=0.0;
	this.f_lastLayerScale=1.0;
	this.f_alpha=1.0;
	this.f_blendMode=0;
	this.f_camX=0.0;
	this.f_camY=0.0;
	this.f_maxSoundChannel=32;
	this.f_firstSoundChannel=0;
	this.f_nextSoundChannel=99;
	this.f_volumeSFX=1.0;
	this.f_volumeMUS=1.0;
}
bb_cftEngine_ftEngine.prototype.m_GetTime=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1752>";
	var t_newMilliSecs=bb_app_Millisecs();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1753>";
	dbg_object(this).f_engineTime+=(t_newMilliSecs-dbg_object(this).f_lastMillisecs)*dbg_object(this).f_timeScale;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1755>";
	dbg_object(this).f_lastMillisecs=t_newMilliSecs;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1756>";
	var t_=((this.f_engineTime)|0);
	pop_err();
	return t_;
}
function bb_cftEngine_ftEngine_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1912>";
	dbg_object(this).f_defaultLayer=bb_cftLayer_ftLayer_new.call(new bb_cftLayer_ftLayer);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1913>";
	dbg_object(dbg_object(this).f_defaultLayer).f_engine=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1914>";
	this.f_layerList.m_AddLast2(dbg_object(this).f_defaultLayer);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1916>";
	dbg_object(this).f_defaultScene=bb_cftScene_ftScene_new.call(new bb_cftScene_ftScene);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1917>";
	dbg_object(dbg_object(this).f_defaultScene).f_engine=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1918>";
	this.f_sceneList.m_AddLast3(dbg_object(this).f_defaultScene);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1920>";
	this.f_screenWidth=(bb_graphics_DeviceWidth());
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1921>";
	this.f_screenHeight=(bb_graphics_DeviceHeight());
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1922>";
	this.f_canvasWidth=this.f_screenWidth;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1923>";
	this.f_canvasHeight=this.f_screenHeight;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1924>";
	this.f_time=this.m_GetTime();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1925>";
	this.f_lastTime=this.f_time;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1927>";
	dbg_object(this).f_swiper=bb_cftSwipe_ftSwipe_new.call(new bb_cftSwipe_ftSwipe);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1928>";
	dbg_object(dbg_object(this).f_swiper).f_engine=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1930>";
	dbg_object(this).f_imgMng=bb_cftImageMng_ftImageManager_new.call(new bb_cftImageMng_ftImageManager);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1931>";
	dbg_object(dbg_object(this).f_imgMng).f_engine=this;
	pop_err();
	return this;
}
bb_cftEngine_ftEngine.prototype.m_LoadFont=function(t_filename){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1820>";
	var t_font=bb_cftFont_ftFont_new.call(new bb_cftFont_ftFont);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1821>";
	t_font.m_Load2(t_filename);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1822>";
	this.f_fontList.m_AddLast4(t_font);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1823>";
	pop_err();
	return t_font;
}
bb_cftEngine_ftEngine.prototype.m_LoadSound=function(t_filename,t_loopFlag){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1877>";
	var t_snd=bb_cftSound_ftSound_new.call(new bb_cftSound_ftSound);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1878>";
	dbg_object(t_snd).f_engine=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1879>";
	dbg_object(t_snd).f_name=t_filename;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1880>";
	dbg_object(t_snd).f_loop=t_loopFlag;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1881>";
	dbg_object(t_snd).f_isMusic=false;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1882>";
	if(t_filename.lastIndexOf(".")<1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1886>";
		dbg_object(t_snd).f_sound=bb_audio_LoadSound(t_filename+".ogg");
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1899>";
		dbg_object(t_snd).f_sound=bb_audio_LoadSound(t_filename);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1901>";
	dbg_object(t_snd).f_soundNode=dbg_object(this).f_soundList.m_AddLast5(t_snd);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1903>";
	pop_err();
	return t_snd;
}
bb_cftEngine_ftEngine.prototype.m_GetDefaultLayer=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1659>";
	pop_err();
	return this.f_defaultLayer;
}
bb_cftEngine_ftEngine.prototype.m_CreateLayer=function(t__ucla){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<814>";
	var t_layer=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<815>";
	if(t__ucla==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<816>";
		t_layer=bb_cftLayer_ftLayer_new.call(new bb_cftLayer_ftLayer);
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<818>";
		t_layer=object_downcast((t__ucla),bb_cftLayer_ftLayer);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<822>";
	dbg_object(t_layer).f_engine=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<823>";
	dbg_object(t_layer).f_engineNode=this.f_layerList.m_AddLast2(t_layer);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<825>";
	dbg_object(this).f_defaultScene.m_AddLayer(t_layer);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<826>";
	pop_err();
	return t_layer;
}
bb_cftEngine_ftEngine.prototype.m_SetDefaultLayer=function(t_layer){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2329>";
	this.f_defaultLayer=t_layer;
	pop_err();
}
bb_cftEngine_ftEngine.prototype.m_CreateImage=function(t_filename,t_xpos,t_ypos,t__ucob){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<589>";
	var t_obj=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<590>";
	if(t__ucob==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<591>";
		t_obj=bb_cftObject_ftObject_new.call(new bb_cftObject_ftObject);
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<593>";
		t_obj=object_downcast((t__ucob),bb_cftObject_ftObject);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<595>";
	dbg_object(t_obj).f_engine=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<596>";
	dbg_object(t_obj).f_xPos=t_xpos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<597>";
	dbg_object(t_obj).f_yPos=t_ypos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<598>";
	dbg_object(t_obj).f_type=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<599>";
	dbg_object(t_obj).f_objImg=dbg_object(this).f_imgMng.m_LoadImage2(t_filename,1,1);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<600>";
	if(dbg_object(t_obj).f_objImg==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<600>";
		error("Image "+t_filename+" not found!");
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<603>";
	dbg_object(t_obj).f_radius=(bb_math_Max(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Height(),dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Width()))/2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<604>";
	dbg_object(t_obj).f_w=(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Width());
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<605>";
	dbg_object(t_obj).f_h=(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Height());
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<607>";
	dbg_object(t_obj).f_rw=dbg_object(t_obj).f_w;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<608>";
	dbg_object(t_obj).f_rh=dbg_object(t_obj).f_h;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<610>";
	t_obj.m_SetLayer(dbg_object(this).f_defaultLayer);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<611>";
	t_obj.m_SetActive(dbg_object(this).f_defaultActive);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<612>";
	t_obj.m_SetVisible(dbg_object(this).f_defaultVisible);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<613>";
	dbg_object(t_obj).f_collType=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<614>";
	t_obj.m_internal_RotateSpriteCol(t_obj);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<615>";
	pop_err();
	return t_obj;
}
bb_cftEngine_ftEngine.prototype.m_CreateImage2=function(t_image,t_xpos,t_ypos,t__ucob){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<624>";
	var t_obj=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<625>";
	if(t__ucob==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<626>";
		t_obj=bb_cftObject_ftObject_new.call(new bb_cftObject_ftObject);
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<628>";
		t_obj=object_downcast((t__ucob),bb_cftObject_ftObject);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<630>";
	dbg_object(t_obj).f_engine=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<631>";
	dbg_object(t_obj).f_xPos=t_xpos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<632>";
	dbg_object(t_obj).f_yPos=t_ypos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<633>";
	dbg_object(t_obj).f_type=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<634>";
	dbg_object(t_obj).f_objImg=this.f_imgMng.m_LoadImage(t_image);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<637>";
	dbg_object(t_obj).f_radius=(bb_math_Max(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Height(),dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Width()))/2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<638>";
	dbg_object(t_obj).f_w=(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Width());
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<639>";
	dbg_object(t_obj).f_h=(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Height());
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<641>";
	dbg_object(t_obj).f_rw=dbg_object(t_obj).f_w;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<642>";
	dbg_object(t_obj).f_rh=dbg_object(t_obj).f_h;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<644>";
	t_obj.m_SetLayer(dbg_object(this).f_defaultLayer);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<645>";
	t_obj.m_SetActive(dbg_object(this).f_defaultActive);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<646>";
	t_obj.m_SetVisible(dbg_object(this).f_defaultVisible);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<647>";
	dbg_object(t_obj).f_collType=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<648>";
	t_obj.m_internal_RotateSpriteCol(t_obj);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<649>";
	pop_err();
	return t_obj;
}
bb_cftEngine_ftEngine.prototype.m_CreateImage3=function(t_atlas,t_x,t_y,t_width,t_height,t_xpos,t_ypos,t__ucob){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<658>";
	var t_obj=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<659>";
	if(t__ucob==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<660>";
		t_obj=bb_cftObject_ftObject_new.call(new bb_cftObject_ftObject);
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<662>";
		t_obj=object_downcast((t__ucob),bb_cftObject_ftObject);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<664>";
	dbg_object(t_obj).f_engine=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<665>";
	dbg_object(t_obj).f_xPos=t_xpos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<666>";
	dbg_object(t_obj).f_yPos=t_ypos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<667>";
	dbg_object(t_obj).f_type=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<668>";
	dbg_object(t_obj).f_objImg=this.f_imgMng.m_GrabImage3(t_atlas,t_x,t_y,t_width,t_height,1,1);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<671>";
	dbg_object(t_obj).f_radius=(bb_math_Max(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Height(),dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Width()))/2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<672>";
	dbg_object(t_obj).f_w=(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Width());
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<673>";
	dbg_object(t_obj).f_h=(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Height());
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<675>";
	dbg_object(t_obj).f_rw=dbg_object(t_obj).f_w;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<676>";
	dbg_object(t_obj).f_rh=dbg_object(t_obj).f_h;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<678>";
	t_obj.m_SetLayer(dbg_object(this).f_defaultLayer);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<679>";
	t_obj.m_SetActive(dbg_object(this).f_defaultActive);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<680>";
	t_obj.m_SetVisible(dbg_object(this).f_defaultVisible);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<681>";
	dbg_object(t_obj).f_collType=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<682>";
	t_obj.m_internal_RotateSpriteCol(t_obj);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<683>";
	pop_err();
	return t_obj;
}
bb_cftEngine_ftEngine.prototype.m_CreateImage4=function(t_atlas,t_dataFileName,t_subImageName,t_xpos,t_ypos,t__ucob){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<696>";
	var t_obj=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<697>";
	if(t__ucob==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<698>";
		t_obj=bb_cftObject_ftObject_new.call(new bb_cftObject_ftObject);
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<700>";
		t_obj=object_downcast((t__ucob),bb_cftObject_ftObject);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<704>";
	var t_tpStringFromFile=bb_app_LoadString(t_dataFileName);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<705>";
	var t_tpAllStrings=t_tpStringFromFile.split(String.fromCharCode(10));
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<706>";
	var t_tpXPos=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<707>";
	var t_tpYPos=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<708>";
	var t_tpWidth=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<709>";
	var t_tpHeight=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<710>";
	var t_aslen=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<711>";
	if(t_dataFileName.toLowerCase().indexOf(".txt",0)>0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<712>";
		t_aslen=t_tpAllStrings.length;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<713>";
		for(var t_count=0;t_count<=t_aslen-1;t_count=t_count+1){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<714>";
			if(dbg_array(t_tpAllStrings,t_count)[dbg_index].toLowerCase()==t_subImageName.toLowerCase()){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<716>";
				var t_strRot=dbg_array(t_tpAllStrings,t_count+1)[dbg_index];
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<717>";
				t_strRot=string_trim(string_replace(t_strRot,"rotate:",""));
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<718>";
				if(t_strRot.toLowerCase()=="true"){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<718>";
					dbg_object(t_obj).f_offAngle=-90.0;
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<720>";
				var t_strXY=dbg_array(t_tpAllStrings,t_count+2)[dbg_index];
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<721>";
				t_strXY=string_trim(string_replace(t_strXY,"xy:",""));
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<722>";
				var t_strXYsplit=t_strXY.split(",");
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<723>";
				t_tpXPos=parseInt((dbg_array(t_strXYsplit,0)[dbg_index]),10);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<724>";
				t_tpYPos=parseInt((dbg_array(t_strXYsplit,1)[dbg_index]),10);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<727>";
				var t_strWH=dbg_array(t_tpAllStrings,t_count+3)[dbg_index];
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<728>";
				t_strWH=string_trim(string_replace(t_strWH,"size:",""));
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<729>";
				var t_strWHsplit=t_strWH.split(",");
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<730>";
				t_tpWidth=parseInt((dbg_array(t_strWHsplit,0)[dbg_index]),10);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<731>";
				t_tpHeight=parseInt((dbg_array(t_strWHsplit,1)[dbg_index]),10);
			}
		}
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<735>";
		t_aslen=t_tpAllStrings.length;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<736>";
		for(var t_count2=0;t_count2<=t_aslen-1;t_count2=t_count2+1){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<737>";
			var t_s=string_trim(dbg_array(t_tpAllStrings,t_count2)[dbg_index].toLowerCase());
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<739>";
			if(t_s.indexOf(string_from_chars([34])+t_subImageName.toLowerCase()+string_from_chars([34]))!=-1){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<740>";
				print(t_s);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<742>";
				t_s=string_replace(t_s,string_from_chars([34]),"");
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<743>";
				print(t_s);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<745>";
				t_s=string_replace(t_s,"<subtexture ","");
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<746>";
				print(t_s);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<747>";
				t_s=string_replace(t_s,"/>","");
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<748>";
				print(t_s);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<750>";
				var t_strSplit=t_s.split(" ");
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<759>";
				var t_strX=dbg_array(t_strSplit,1)[dbg_index];
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<760>";
				var t_strXsplit=t_strX.split("=");
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<761>";
				t_tpXPos=parseInt((dbg_array(t_strXsplit,1)[dbg_index]),10);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<763>";
				var t_strY=dbg_array(t_strSplit,2)[dbg_index];
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<764>";
				var t_strYsplit=t_strY.split("=");
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<765>";
				t_tpYPos=parseInt((dbg_array(t_strYsplit,1)[dbg_index]),10);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<767>";
				var t_strW=dbg_array(t_strSplit,3)[dbg_index];
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<768>";
				var t_strWsplit=t_strW.split("=");
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<769>";
				t_tpWidth=parseInt((dbg_array(t_strWsplit,1)[dbg_index]),10);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<771>";
				var t_strH=dbg_array(t_strSplit,4)[dbg_index];
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<772>";
				var t_strHsplit=t_strH.split("=");
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<773>";
				t_tpHeight=parseInt((dbg_array(t_strHsplit,1)[dbg_index]),10);
			}
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<781>";
	dbg_object(t_obj).f_engine=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<782>";
	dbg_object(t_obj).f_xPos=t_xpos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<783>";
	dbg_object(t_obj).f_yPos=t_ypos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<784>";
	dbg_object(t_obj).f_type=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<785>";
	dbg_object(t_obj).f_objImg=this.f_imgMng.m_GrabImage3(t_atlas,t_tpXPos,t_tpYPos,t_tpWidth,t_tpHeight,1,1);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<788>";
	dbg_object(t_obj).f_radius=(bb_math_Max(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Height(),dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Width()))/2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<789>";
	if(dbg_object(t_obj).f_offAngle<0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<790>";
		dbg_object(t_obj).f_h=(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Width());
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<791>";
		dbg_object(t_obj).f_w=(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Height());
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<793>";
		dbg_object(t_obj).f_w=(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Width());
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<794>";
		dbg_object(t_obj).f_h=(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Height());
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<796>";
	dbg_object(t_obj).f_rw=(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Width());
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<797>";
	dbg_object(t_obj).f_rh=(dbg_object(dbg_object(t_obj).f_objImg).f_img.m_Height());
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<799>";
	t_obj.m_SetLayer(dbg_object(this).f_defaultLayer);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<800>";
	t_obj.m_SetActive(dbg_object(this).f_defaultActive);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<801>";
	t_obj.m_SetVisible(dbg_object(this).f_defaultVisible);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<802>";
	dbg_object(t_obj).f_collType=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<803>";
	t_obj.m_internal_RotateSpriteCol(t_obj);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<804>";
	pop_err();
	return t_obj;
}
bb_cftEngine_ftEngine.prototype.m_CreateText=function(t_font,t_txt,t_xpos,t_ypos,t_textmode){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1054>";
	var t_obj=bb_cftObject_ftObject_new.call(new bb_cftObject_ftObject);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1055>";
	dbg_object(t_obj).f_objFont=t_font;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1056>";
	dbg_object(t_obj).f_engine=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1067>";
	dbg_object(t_obj).f_textMode=t_textmode;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1068>";
	dbg_object(t_obj).f_xPos=t_xpos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1069>";
	dbg_object(t_obj).f_yPos=t_ypos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1070>";
	dbg_object(t_obj).f_type=1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1079>";
	t_obj.m_SetText(t_txt);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1081>";
	t_obj.m_SetLayer(dbg_object(this).f_defaultLayer);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1082>";
	t_obj.m_SetActive(dbg_object(this).f_defaultActive);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1083>";
	t_obj.m_SetVisible(dbg_object(this).f_defaultVisible);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1084>";
	dbg_object(t_obj).f_collType=2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1085>";
	t_obj.m_internal_RotateSpriteCol(t_obj);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1086>";
	pop_err();
	return t_obj;
}
bb_cftEngine_ftEngine.prototype.m_CreateBox=function(t_width,t_height,t_xpos,t_ypos,t__ucob){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<525>";
	var t_obj=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<526>";
	if(t__ucob==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<527>";
		t_obj=bb_cftObject_ftObject_new.call(new bb_cftObject_ftObject);
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<529>";
		t_obj=object_downcast((t__ucob),bb_cftObject_ftObject);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<531>";
	dbg_object(t_obj).f_engine=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<532>";
	dbg_object(t_obj).f_xPos=t_xpos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<533>";
	dbg_object(t_obj).f_yPos=t_ypos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<534>";
	dbg_object(t_obj).f_type=3;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<536>";
	dbg_object(t_obj).f_radius=bb_math_Max2(t_width,t_height)/2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<537>";
	dbg_object(t_obj).f_w=t_width;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<538>";
	dbg_object(t_obj).f_h=t_height;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<540>";
	dbg_object(t_obj).f_rw=dbg_object(t_obj).f_w;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<541>";
	dbg_object(t_obj).f_rh=dbg_object(t_obj).f_h;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<543>";
	t_obj.m_SetLayer(dbg_object(this).f_defaultLayer);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<544>";
	t_obj.m_SetActive(dbg_object(this).f_defaultActive);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<545>";
	t_obj.m_SetVisible(dbg_object(this).f_defaultVisible);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<546>";
	dbg_object(t_obj).f_collType=2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<547>";
	t_obj.m_internal_RotateSpriteCol(t_obj);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<548>";
	pop_err();
	return t_obj;
}
bb_cftEngine_ftEngine.prototype.m_CalcDeltaTime=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<205>";
	this.f_deltaTime=this.m_GetTime()-this.f_lastTime;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<206>";
	this.f_lastTime+=this.f_deltaTime;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<207>";
	pop_err();
	return this.f_deltaTime;
}
bb_cftEngine_ftEngine.prototype.m_OnTimer=function(t_timerId){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2071>";
	pop_err();
	return 0;
}
bb_cftEngine_ftEngine.prototype.m_OnObjectTimer=function(t_timerId,t_obj){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1993>";
	pop_err();
	return 0;
}
bb_cftEngine_ftEngine.prototype.m_OnObjectTransition=function(t_transId,t_obj){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2007>";
	pop_err();
	return 0;
}
bb_cftEngine_ftEngine.prototype.m_OnLayerTransition=function(t_transId,t_layer){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1940>";
	pop_err();
	return 0;
}
bb_cftEngine_ftEngine.prototype.m_OnObjectUpdate=function(t_obj){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2016>";
	pop_err();
	return 0;
}
bb_cftEngine_ftEngine.prototype.m_OnLayerUpdate=function(t_layer){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1947>";
	pop_err();
	return 0;
}
bb_cftEngine_ftEngine.prototype.m_OnObjectDelete=function(t_obj){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1962>";
	pop_err();
	return 0;
}
bb_cftEngine_ftEngine.prototype.m_Update=function(t_speed){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2509>";
	this.f_time=this.m_GetTime();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2510>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2510>";
	var t_=this.f_timerList.m_Backwards().m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2510>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2510>";
		var t_timer=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2511>";
		t_timer.m_Update3();
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2514>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2514>";
	var t_2=this.f_layerList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2514>";
	while(t_2.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2514>";
		var t_layer=t_2.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2515>";
		if(dbg_object(t_layer).f_isActive){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2515>";
			t_layer.m_Update(t_speed);
		}
	}
	pop_err();
}
bb_cftEngine_ftEngine.prototype.m_Update2=function(t_layer,t_speed){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2525>";
	this.f_time=this.m_GetTime();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2526>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2526>";
	var t_=this.f_timerList.m_Backwards().m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2526>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2526>";
		var t_timer=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2527>";
		t_timer.m_Update3();
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2529>";
	if(dbg_object(t_layer).f_isActive){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2529>";
		t_layer.m_Update(t_speed);
	}
	pop_err();
}
bb_cftEngine_ftEngine.prototype.m_OnObjectCollision=function(t_obj,t_obj2){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1954>";
	pop_err();
	return 0;
}
bb_cftEngine_ftEngine.prototype.m_CollisionCheck=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<219>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<219>";
	var t_=this.f_layerList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<219>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<219>";
		var t_layer=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<220>";
		if(dbg_object(t_layer).f_isActive){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<220>";
			t_layer.m_CollisionCheck();
		}
	}
	pop_err();
}
bb_cftEngine_ftEngine.prototype.m_CollisionCheck2=function(t_layer){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<229>";
	if(dbg_object(t_layer).f_isActive){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<229>";
		t_layer.m_CollisionCheck();
	}
	pop_err();
}
bb_cftEngine_ftEngine.prototype.m_CollisionCheck3=function(t_obj){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<237>";
	if(dbg_object(dbg_object(t_obj).f_layer).f_isActive){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<237>";
		dbg_object(t_obj).f_layer.m_CollisionCheck3(t_obj);
	}
	pop_err();
}
bb_cftEngine_ftEngine.prototype.m_CreateCircle=function(t_radius,t_xpos,t_ypos,t__ucob){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<556>";
	var t_obj=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<557>";
	if(t__ucob==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<558>";
		t_obj=bb_cftObject_ftObject_new.call(new bb_cftObject_ftObject);
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<560>";
		t_obj=object_downcast((t__ucob),bb_cftObject_ftObject);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<562>";
	dbg_object(t_obj).f_engine=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<563>";
	dbg_object(t_obj).f_xPos=t_xpos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<564>";
	dbg_object(t_obj).f_yPos=t_ypos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<565>";
	dbg_object(t_obj).f_type=2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<567>";
	dbg_object(t_obj).f_radius=t_radius;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<568>";
	dbg_object(t_obj).f_w=dbg_object(t_obj).f_radius*2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<569>";
	dbg_object(t_obj).f_h=dbg_object(t_obj).f_radius*2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<571>";
	dbg_object(t_obj).f_rw=dbg_object(t_obj).f_w;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<572>";
	dbg_object(t_obj).f_rh=dbg_object(t_obj).f_h;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<574>";
	t_obj.m_SetLayer(dbg_object(this).f_defaultLayer);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<575>";
	t_obj.m_SetActive(dbg_object(this).f_defaultActive);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<576>";
	t_obj.m_SetVisible(dbg_object(this).f_defaultVisible);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<577>";
	dbg_object(t_obj).f_collType=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<578>";
	t_obj.m_internal_RotateSpriteCol(t_obj);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<579>";
	pop_err();
	return t_obj;
}
bb_cftEngine_ftEngine.prototype.m_GetCanvasWidth=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1650>";
	var t_=((this.f_canvasWidth)|0);
	pop_err();
	return t_;
}
bb_cftEngine_ftEngine.prototype.m_GetCanvasHeight=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1641>";
	var t_=((this.f_canvasHeight)|0);
	pop_err();
	return t_;
}
bb_cftEngine_ftEngine.prototype.m_OnObjectRender=function(t_obj){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<1971>";
	pop_err();
	return 0;
}
bb_cftEngine_ftEngine.prototype.m_Render=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2162>";
	dbg_object(this).f_red=255.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2163>";
	dbg_object(this).f_green=255.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2164>";
	dbg_object(this).f_blue=255.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2165>";
	bb_graphics_SetColor(255.0,255.0,255.0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2167>";
	bb_graphics_PushMatrix();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2168>";
	bb_graphics_Translate((this.f_autofitX),(this.f_autofitY));
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2169>";
	bb_graphics_Scale(this.f_scaleX,this.f_scaleY);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2170>";
	bb_graphics_SetScissor((this.f_autofitX),(this.f_autofitY),this.f_canvasWidth*this.f_scaleX,this.f_canvasHeight*this.f_scaleY);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2171>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2171>";
	var t_=this.f_layerList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2171>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2171>";
		var t_layer=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2172>";
		if(dbg_object(t_layer).f_isVisible && dbg_object(t_layer).f_isActive){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2172>";
			t_layer.m_Render();
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2174>";
	bb_graphics_PopMatrix();
	pop_err();
}
bb_cftEngine_ftEngine.prototype.m_Render2=function(t_layer){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2182>";
	dbg_object(this).f_red=255.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2183>";
	dbg_object(this).f_green=255.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2184>";
	dbg_object(this).f_blue=255.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2185>";
	bb_graphics_SetColor(255.0,255.0,255.0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2187>";
	bb_graphics_PushMatrix();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2188>";
	bb_graphics_Translate((this.f_autofitX),(this.f_autofitY));
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2189>";
	bb_graphics_Scale(this.f_scaleX,this.f_scaleY);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2190>";
	bb_graphics_SetScissor((this.f_autofitX),(this.f_autofitY),this.f_canvasWidth*this.f_scaleX,this.f_canvasHeight*this.f_scaleY);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2192>";
	if(dbg_object(t_layer).f_isVisible && dbg_object(t_layer).f_isActive){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2192>";
		t_layer.m_Render();
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftEngine.monkey<2193>";
	bb_graphics_PopMatrix();
	pop_err();
}
function bb_breakOut_engine(){
	bb_cftEngine_ftEngine.call(this);
}
bb_breakOut_engine.prototype=extend_class(bb_cftEngine_ftEngine);
function bb_breakOut_engine_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<335>";
	bb_cftEngine_ftEngine_new.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<335>";
	pop_err();
	return this;
}
bb_breakOut_engine.prototype.m_OnObjectCollision=function(t_obj,t_obj2){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<338>";
	if(t_obj.m_GetColGroup()==4 && t_obj2.m_GetColGroup()==3){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<339>";
		var t_ball=t_obj;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<340>";
		var t_raquette=t_obj2;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<341>";
		dbg_object(bb_breakOut_g).f_sndBounce.m_Play(-1);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<343>";
		if(dbg_object(t_ball).f_xPos>=dbg_object(t_raquette).f_xPos-12.5 && dbg_object(t_ball).f_xPos<=dbg_object(t_raquette).f_xPos+12.5 && dbg_object(t_ball).f_yPos+12.0>dbg_object(t_raquette).f_yPos-8.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<344>";
			t_ball.m_SetSpeedY(-t_ball.m_GetSpeedY());
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<347>";
		if(dbg_object(t_ball).f_xPos<=dbg_object(t_raquette).f_xPos+25.0 && dbg_object(t_ball).f_xPos>dbg_object(t_raquette).f_xPos+12.5 && dbg_object(t_ball).f_yPos+12.0>dbg_object(t_raquette).f_yPos-8.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<348>";
			t_ball.m_SetSpeedAngle(77.5);
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<352>";
		if(dbg_object(t_ball).f_xPos<=dbg_object(t_raquette).f_xPos+37.5 && dbg_object(t_ball).f_xPos>dbg_object(t_raquette).f_xPos+25.0 && dbg_object(t_ball).f_yPos+12.0>dbg_object(t_raquette).f_yPos-8.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<353>";
			t_ball.m_SetSpeedAngle(45.0);
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<357>";
		if(dbg_object(t_ball).f_xPos<=dbg_object(t_raquette).f_xPos+50.0 && dbg_object(t_ball).f_xPos>dbg_object(t_raquette).f_xPos+37.5 && dbg_object(t_ball).f_yPos+12.0>dbg_object(t_raquette).f_yPos-8.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<358>";
			t_ball.m_SetSpeedAngle(12.5);
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<363>";
		if(dbg_object(t_ball).f_xPos>=dbg_object(t_raquette).f_xPos-25.0 && dbg_object(t_ball).f_xPos<dbg_object(t_raquette).f_xPos-12.5 && dbg_object(t_ball).f_yPos+12.0>dbg_object(t_raquette).f_yPos-8.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<364>";
			t_ball.m_SetSpeedAngle(-77.5);
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<368>";
		if(dbg_object(t_ball).f_xPos>=dbg_object(t_raquette).f_xPos-37.5 && dbg_object(t_ball).f_xPos<dbg_object(t_raquette).f_xPos-25.0 && dbg_object(t_ball).f_yPos+12.0>dbg_object(t_raquette).f_yPos-8.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<369>";
			t_ball.m_SetSpeedAngle(-45.0);
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<373>";
		if(dbg_object(t_ball).f_xPos>=dbg_object(t_raquette).f_xPos-50.0 && dbg_object(t_ball).f_xPos<dbg_object(t_raquette).f_xPos-37.5 && dbg_object(t_ball).f_yPos+12.0>dbg_object(t_raquette).f_yPos-8.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<374>";
			t_ball.m_SetSpeedAngle(-12.5);
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<377>";
		print("Collision : "+String(dbg_object(t_ball).f_yPos));
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<378>";
		print("Raquette : "+String(dbg_object(t_raquette).f_yPos));
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<381>";
	if(t_obj.m_GetColGroup()==5){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<382>";
		var t_block=t_obj;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<383>";
		var t_ball2=t_obj2;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<384>";
		var t_removeBlock=false;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<385>";
		var t_x=((dbg_object(t_block).f_xPos+t_block.m_GetWidth()/2.0-(dbg_object(t_ball2).f_xPos+t_ball2.m_GetRadius()))|0);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<386>";
		var t_y=((dbg_object(t_block).f_yPos+t_block.m_GetWidth()/2.0-(dbg_object(t_ball2).f_yPos+t_ball2.m_GetRadius()))|0);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<388>";
		if(bb_math_Abs(t_x)>bb_math_Abs(t_y)){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<389>";
			t_ball2.m_SetSpeedX(-t_ball2.m_GetSpeedX());
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<390>";
			t_block.m_Remove(false);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<391>";
			t_removeBlock=true;
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<393>";
			t_ball2.m_SetSpeedY(-t_ball2.m_GetSpeedY());
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<394>";
			t_block.m_Remove(false);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<395>";
			t_removeBlock=true;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<415>";
		if(t_removeBlock==true){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<416>";
			dbg_object(bb_breakOut_g).f_blockCount-=1;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<418>";
		dbg_object(bb_breakOut_g).f_sndBreakBlock.m_Play(-1);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<420>";
	pop_err();
	return 0;
}
bb_breakOut_engine.prototype.m_OnObjectTimer=function(t_timerId,t_obj){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<424>";
	pop_err();
	return 0;
}
bb_breakOut_engine.prototype.m_OnObjectTransition=function(t_transId,t_obj){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<432>";
	pop_err();
	return 0;
}
bb_breakOut_engine.prototype.m_OnObjectUpdate=function(t_obj){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<436>";
	if(t_obj.m_GetID()==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<437>";
		t_obj.m_SetPosX(bb_input_MouseX(),0);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<444>";
		if(((bb_input_MouseHit(0))!=0) && dbg_object(bb_breakOut_g).f_moving==false){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<445>";
			dbg_object(bb_breakOut_g).f_ball.m_SetParent(null);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<446>";
			dbg_object(bb_breakOut_g).f_speed=-20.0;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<447>";
			dbg_object(bb_breakOut_g).f_ball.m_SetSpeedY(dbg_object(bb_breakOut_g).f_speed);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<448>";
			dbg_object(bb_breakOut_g).f_moving=true;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<450>";
		if(dbg_object(t_obj).f_xPos<t_obj.m_GetWidth()/2.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<451>";
			t_obj.m_SetPosX(t_obj.m_GetWidth()/2.0,0);
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<453>";
		if(dbg_object(t_obj).f_xPos>dbg_object(bb_breakOut_g).f_cw-t_obj.m_GetWidth()/2.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<454>";
			t_obj.m_SetPosX(dbg_object(bb_breakOut_g).f_cw-t_obj.m_GetWidth()/2.0,0);
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<457>";
	if(t_obj.m_GetID()==2){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<458>";
		if(dbg_object(t_obj).f_yPos<t_obj.m_GetRadius() && t_obj.m_GetSpeedY()<0.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<459>";
			t_obj.m_SetSpeedY(-t_obj.m_GetSpeedY());
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<462>";
		if(t_obj.m_GetPosX()<dbg_object(bb_breakOut_g).f_ball.m_GetRadius()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<463>";
			t_obj.m_SetSpeedX(-t_obj.m_GetSpeedX());
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<466>";
		if(t_obj.m_GetPosX()>dbg_object(bb_breakOut_g).f_cw-dbg_object(bb_breakOut_g).f_ball.m_GetRadius()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<467>";
			t_obj.m_SetSpeedX(-t_obj.m_GetSpeedX());
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<470>";
		if(dbg_object(t_obj).f_yPos>dbg_object(bb_breakOut_g).f_ch){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<471>";
			t_obj.m_Remove(false);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<472>";
			bb_breakOut_g.m_CreateBall(dbg_object(dbg_object(bb_breakOut_g).f_raquette).f_xPos,dbg_object(dbg_object(bb_breakOut_g).f_raquette).f_yPos);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<473>";
			dbg_object(bb_breakOut_g).f_moving=false;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<474>";
			dbg_object(bb_breakOut_g).f_life-=1;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<475>";
			dbg_object(bb_breakOut_g).f_sndLostLife.m_Play(-1);
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<479>";
	pop_err();
	return 0;
}
bb_breakOut_engine.prototype.m_OnLayerTransition=function(t_transId,t_layer){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<483>";
	pop_err();
	return 0;
}
bb_breakOut_engine.prototype.m_OnLayerUpdate=function(t_layer){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<487>";
	if(dbg_object(bb_breakOut_g).f_blockCount<=0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<488>";
		dbg_object(bb_breakOut_g).f_txtWin.m_SetActive(true);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<489>";
		dbg_object(bb_breakOut_g).f_gameMode=7;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<490>";
		dbg_object(bb_breakOut_g).f_sndGameOver.m_Play(-1);
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<491>";
		if(dbg_object(bb_breakOut_g).f_life<=0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<492>";
			dbg_object(bb_breakOut_g).f_txtLose.m_SetActive(true);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<493>";
			dbg_object(bb_breakOut_g).f_gameMode=7;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<494>";
			dbg_object(bb_breakOut_g).f_sndLostLife.m_Stop(-1);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<495>";
			dbg_object(bb_breakOut_g).f_sndGameOver.m_Play(-1);
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/bananas/moerin/megamanTest/breakOut.monkey<497>";
	pop_err();
	return 0;
}
function bb_cftLayer_ftLayer(){
	Object.call(this);
	this.f_objList=bb_cftLayer_lObjList_new.call(new bb_cftLayer_lObjList);
	this.f_engine=null;
	this.f_engineNode=null;
	this.f_isActive=true;
	this.f_inUpdate=false;
	this.f_transitionList=bb_list_List8_new.call(new bb_list_List8);
	this.f_xPos=0.0;
	this.f_yPos=0.0;
	this.f_scale=1.0;
	this.f_alpha=1.0;
	this.f_inTouch=false;
	this.f_isVisible=true;
	this.f_angle=0.0;
	this.f_isGUI=false;
}
function bb_cftLayer_ftLayer_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<152>";
	dbg_object(this.f_objList).f_layer=this;
	pop_err();
	return this;
}
bb_cftLayer_ftLayer.prototype.m_SetPos=function(t_x,t_y,t_relative){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<385>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<386>";
		this.f_xPos=this.f_xPos+t_x;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<387>";
		this.f_yPos=this.f_yPos+t_y;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<389>";
		this.f_xPos=t_x;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<390>";
		this.f_yPos=t_y;
	}
	pop_err();
}
bb_cftLayer_ftLayer.prototype.m_SetScale=function(t_scaleFactor,t_relative){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<414>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<415>";
		this.f_scale+=t_scaleFactor;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<417>";
		this.f_scale=t_scaleFactor;
	}
	pop_err();
}
bb_cftLayer_ftLayer.prototype.m_SetAlpha=function(t_newAlpha,t_relative){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<353>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<354>";
		this.f_alpha+=t_newAlpha;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<356>";
		this.f_alpha=t_newAlpha;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<358>";
	if(this.f_alpha<0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<358>";
		this.f_alpha=0.0;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<359>";
	if(this.f_alpha>1.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<359>";
		this.f_alpha=1.0;
	}
	pop_err();
}
bb_cftLayer_ftLayer.prototype.m_CleanupLists=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<58>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<58>";
	var t_=this.f_transitionList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<58>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<58>";
		var t_trans=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<59>";
		if(dbg_object(t_trans).f_deleted){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<59>";
			t_trans.m_Cancel();
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<61>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<61>";
	var t_2=this.f_objList.m_Backwards().m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<61>";
	while(t_2.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<61>";
		var t_obj=t_2.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<62>";
		if(dbg_object(t_obj).f_deleted){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<62>";
			t_obj.m_Remove(true);
		}
	}
	pop_err();
}
bb_cftLayer_ftLayer.prototype.m_Update=function(t_speed){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<463>";
	this.f_inUpdate=true;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<464>";
	dbg_object(dbg_object(this).f_engine).f_delta=t_speed;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<465>";
	if(dbg_object(this.f_engine).f_isPaused==false){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<466>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<466>";
		var t_=this.f_transitionList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<466>";
		while(t_.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<466>";
			var t_trans=t_.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<467>";
			t_trans.m_Update3();
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<471>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<471>";
	var t_2=this.f_objList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<471>";
	while(t_2.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<471>";
		var t_obj=t_2.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<472>";
		if(dbg_object(t_obj).f_parentObj==null){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<472>";
			t_obj.m_Update(t_speed);
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<475>";
	if(dbg_object(this.f_engine).f_isPaused==false){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<475>";
		this.f_engine.m_OnLayerUpdate(this);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<476>";
	this.m_CleanupLists();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<477>";
	if(this.f_inTouch==false){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<477>";
		this.m_CleanupLists();
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<478>";
	this.f_inUpdate=false;
	pop_err();
}
bb_cftLayer_ftLayer.prototype.m_CollisionCheck=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<73>";
	var t_obj=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<74>";
	var t_obj2=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<75>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<75>";
	var t_=this.f_objList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<75>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<75>";
		t_obj=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<77>";
		if(dbg_object(t_obj).f_isActive==true){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<78>";
			if(dbg_object(t_obj).f_collGroup>0 && dbg_object(t_obj).f_colCheck==true){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<79>";
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<79>";
				var t_2=this.f_objList.m_ObjectEnumerator();
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<79>";
				while(t_2.m_HasNext()){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<79>";
					t_obj2=t_2.m_NextObject();
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<80>";
					if(t_obj!=t_obj2){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<81>";
						if(t_obj.m_CheckCollision(t_obj2)){
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<81>";
							this.f_engine.m_OnObjectCollision(t_obj,t_obj2);
						}
					}
				}
			}
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<87>";
	this.m_CleanupLists();
	pop_err();
}
bb_cftLayer_ftLayer.prototype.m_CollisionCheck3=function(t_obj){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<95>";
	var t_obj2=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<96>";
	if(dbg_object(t_obj).f_isActive==true){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<97>";
		if(dbg_object(t_obj).f_collGroup>0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<98>";
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<98>";
			var t_=this.f_objList.m_ObjectEnumerator();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<98>";
			while(t_.m_HasNext()){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<98>";
				t_obj2=t_.m_NextObject();
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<99>";
				if(t_obj!=t_obj2){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<100>";
					if(t_obj.m_CheckCollision(t_obj2)){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<100>";
						this.f_engine.m_OnObjectCollision(t_obj,t_obj2);
					}
				}
			}
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<104>";
		if(dbg_object(t_obj).f_deleted==true){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<104>";
			t_obj.m_Remove(true);
		}
	}
	pop_err();
}
bb_cftLayer_ftLayer.prototype.m_SetActive=function(t_activeFlag){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<348>";
	this.f_isActive=t_activeFlag;
	pop_err();
}
bb_cftLayer_ftLayer.prototype.m_RemoveAllObjects=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<289>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<289>";
	var t_=this.f_objList.m_Backwards().m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<289>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<289>";
		var t_obj=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<290>";
		if(this.f_inUpdate || this.f_inTouch){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<291>";
			t_obj.m_Remove(false);
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<293>";
			t_obj.m_Remove(true);
		}
	}
	pop_err();
}
bb_cftLayer_ftLayer.prototype.m_Render=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<318>";
	bb_graphics_PushMatrix();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<325>";
	if(dbg_object(this).f_angle!=0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<326>";
		bb_cftMisc_RotateDisplay((this.f_engine.m_GetCanvasWidth())/2.0,(this.f_engine.m_GetCanvasHeight())/2.0,-this.f_angle);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<328>";
	dbg_object(this.f_engine).f_lastLayerAngle=this.f_angle;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<330>";
	if(this.f_scale!=dbg_object(this.f_engine).f_lastLayerScale){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<331>";
		bb_graphics_Scale(this.f_scale,this.f_scale);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<332>";
		dbg_object(this.f_engine).f_lastLayerScale=this.f_scale;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<334>";
	if(this.f_isVisible==true){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<335>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<335>";
		var t_=this.f_objList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<335>";
		while(t_.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<335>";
			var t_obj=t_.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<336>";
			if(dbg_object(this).f_isGUI==true){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<337>";
				if(dbg_object(t_obj).f_isVisible && dbg_object(t_obj).f_isActive && dbg_object(t_obj).f_parentObj==null){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<337>";
					t_obj.m_Render3(dbg_object(this).f_xPos,dbg_object(this).f_yPos);
				}
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<339>";
				if(dbg_object(t_obj).f_isVisible && dbg_object(t_obj).f_isActive && dbg_object(t_obj).f_parentObj==null){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<339>";
					t_obj.m_Render3(dbg_object(this).f_xPos-dbg_object(this.f_engine).f_camX,dbg_object(this).f_yPos-dbg_object(this.f_engine).f_camY);
				}
			}
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<343>";
	bb_graphics_PopMatrix();
	pop_err();
}
function bb_cftObject_ftObject(){
	Object.call(this);
	this.f_engine=null;
	this.f_xPos=0.0;
	this.f_yPos=0.0;
	this.f_type=0;
	this.f_objImg=null;
	this.f_radius=1.0;
	this.f_w=0.0;
	this.f_h=0.0;
	this.f_rw=0.0;
	this.f_rh=0.0;
	this.f_layer=null;
	this.f_layerNode=null;
	this.f_isActive=true;
	this.f_isVisible=true;
	this.f_collType=0;
	this.f_handleX=0.5;
	this.f_scaleX=1.0;
	this.f_hOffX=0.0;
	this.f_handleY=0.5;
	this.f_scaleY=1.0;
	this.f_hOffY=0.0;
	this.f_angle=0.0;
	this.f_offAngle=0.0;
	this.f_collScale=1.0;
	this.f_isFlipV=false;
	this.f_isFlipH=false;
	this.f_x1c=0.0;
	this.f_y1c=0.0;
	this.f_x2c=0.0;
	this.f_y2c=0.0;
	this.f_x3c=0.0;
	this.f_y3c=0.0;
	this.f_x4c=0.0;
	this.f_y4c=0.0;
	this.f_objFont=null;
	this.f_textMode=0;
	this.f_text="";
	this.f_childObjList=bb_list_List_new.call(new bb_list_List);
	this.f_red=255.0;
	this.f_green=255.0;
	this.f_blue=255.0;
	this.f_parentObj=null;
	this.f_alpha=1.0;
	this.f_deleted=false;
	this.f_isAnimated=false;
	this.f_animTime=0.0;
	this.f_frameEnd=0.0;
	this.f_frameTime=10.0;
	this.f_frameLength=0.0;
	this.f_speed=0.0;
	this.f_friction=0.0;
	this.f_speedAngle=0.0;
	this.f_speedX=0.0;
	this.f_speedY=0.0;
	this.f_speedSpin=0.0;
	this.f_isWrappingX=false;
	this.f_isWrappingY=false;
	this.f_transitionList=bb_list_List8_new.call(new bb_list_List8);
	this.f_timerList=bb_list_List7_new.call(new bb_list_List7);
	this.f_onUpdateEvent=true;
	this.f_parentNode=null;
	this.f_marker=null;
	this.f_markerNode=null;
	this.f_onDeleteEvent=false;
	this.f_collGroup=0;
	this.f_colCheck=false;
	this.f_collWith=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	this.f_id=0;
	this.f_speedMax=9999.0;
	this.f_blendMode=0;
	this.f_verts=[];
	this.f_frameCount=1.0;
	this.f_rox=0.0;
	this.f_roy=0.0;
	this.f_tileModSX=0.0;
	this.f_tileModSY=0.0;
	this.f_tileSizeX=0;
	this.f_tileSizeY=0;
	this.f_tileCountX=0;
	this.f_tileMap=[];
	this.f_tileCountY=0;
	this.f_onRenderEvent=false;
}
function bb_cftObject_ftObject_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<20>";
	pop_err();
	return this;
}
bb_cftObject_ftObject.prototype.m_SetLayer=function(t_newLayer){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1791>";
	if(dbg_object(this).f_layer!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1793>";
		dbg_object(this).f_layerNode.m_Remove2();
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1796>";
	if(t_newLayer!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1797>";
		dbg_object(this).f_layerNode=dbg_object(t_newLayer).f_objList.m_AddLast(this);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1799>";
	dbg_object(this).f_layer=t_newLayer;
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetActive=function(t_activeFlag){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1576>";
	this.f_isActive=t_activeFlag;
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetVisible=function(t_visible){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2282>";
	this.f_isVisible=t_visible;
	pop_err();
}
bb_cftObject_ftObject.prototype.m_internal_RotateSpriteCol=function(t_pSprite){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3036>";
	var t_cx=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3037>";
	var t_cy=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3038>";
	var t_SinVal=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3039>";
	var t_CosVal=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3040>";
	var t_xSinVal=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3041>";
	var t_ySinVal=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3042>";
	var t_xCosVal=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3043>";
	var t_yCosVal=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3044>";
	var t_ang=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3046>";
	dbg_object(this).f_hOffX=(0.5-dbg_object(this).f_handleX)*this.f_w*dbg_object(this).f_scaleX;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3047>";
	dbg_object(this).f_hOffY=(0.5-dbg_object(this).f_handleY)*this.f_h*dbg_object(this).f_scaleY;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3053>";
	t_ang=(dbg_object(t_pSprite).f_angle+dbg_object(t_pSprite).f_offAngle)*0.0174533;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3054>";
	t_SinVal=Math.sin(t_ang);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3055>";
	t_CosVal=Math.cos(t_ang);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3059>";
	t_cx=-dbg_object(t_pSprite).f_w/2.0*dbg_object(t_pSprite).f_scaleX*dbg_object(t_pSprite).f_collScale;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3061>";
	if(dbg_object(this).f_isFlipV==true){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3061>";
		t_cy=t_cy*-1.0;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3062>";
	t_cy=dbg_object(t_pSprite).f_h/2.0*dbg_object(t_pSprite).f_scaleY*dbg_object(t_pSprite).f_collScale;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3065>";
	if(dbg_object(this).f_isFlipH==true){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3065>";
		t_cx=t_cx*-1.0;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3091>";
	t_xCosVal=t_cx*t_CosVal;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3092>";
	t_yCosVal=t_cy*t_CosVal;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3093>";
	t_xSinVal=t_cx*t_SinVal;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3094>";
	t_ySinVal=t_cy*t_SinVal;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3096>";
	dbg_object(t_pSprite).f_x1c=t_xCosVal-t_ySinVal+dbg_object(this).f_hOffX;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3097>";
	dbg_object(t_pSprite).f_y1c=t_yCosVal+t_xSinVal+dbg_object(this).f_hOffY;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3100>";
	dbg_object(t_pSprite).f_x2c=-t_xCosVal-t_ySinVal+dbg_object(this).f_hOffX;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3101>";
	dbg_object(t_pSprite).f_y2c=t_yCosVal+-t_xSinVal+dbg_object(this).f_hOffY;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3104>";
	dbg_object(t_pSprite).f_x3c=-t_xCosVal- -t_ySinVal+dbg_object(this).f_hOffX;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3105>";
	dbg_object(t_pSprite).f_y3c=-t_yCosVal+-t_xSinVal+dbg_object(this).f_hOffY;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3108>";
	dbg_object(t_pSprite).f_x4c=t_xCosVal- -t_ySinVal+dbg_object(this).f_hOffX;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3109>";
	dbg_object(t_pSprite).f_y4c=-t_yCosVal+t_xSinVal+dbg_object(this).f_hOffY;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3111>";
	pop_err();
	return 0;
}
bb_cftObject_ftObject.prototype.m_SetText=function(t_t){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2103>";
	var t_linLen=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2104>";
	this.f_text=t_t;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2105>";
	var t_lines=t_t.split("\n");
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2106>";
	t_linLen=t_lines.length;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2107>";
	if(dbg_object(this).f_type==1 || dbg_object(this).f_type==7){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2109>";
		if(t_linLen<=1 && dbg_object(this).f_type==1){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2110>";
			this.f_w=(dbg_object(this).f_objFont.m_Length(t_t));
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2112>";
			dbg_object(this).f_type=7;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2113>";
			dbg_object(this).f_w=0.0;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2114>";
			for(var t__y=1;t__y<=t_linLen;t__y=t__y+1){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2115>";
				this.f_w=bb_math_Max2(dbg_object(this).f_w,(dbg_object(this).f_objFont.m_Length(dbg_array(t_lines,t__y-1)[dbg_index])));
			}
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2118>";
		dbg_object(this).f_h=(dbg_object(dbg_object(this).f_objFont).f_lineHeight*t_linLen);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2119>";
		dbg_object(this).f_rh=dbg_object(this).f_h;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2120>";
		dbg_object(this).f_rw=dbg_object(this).f_w;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2121>";
		dbg_object(this).f_radius=bb_math_Max2(dbg_object(this).f_h,dbg_object(this).f_w)/2.0;
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetScale=function(t_newScale,t_relative){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1943>";
	var t_sd=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1944>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1945>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1945>";
		var t_=this.f_childObjList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1945>";
		while(t_.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1945>";
			var t_child=t_.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1946>";
			t_child.m_SetScale(t_newScale,t_relative);
		}
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1949>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1949>";
		var t_2=this.f_childObjList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1949>";
		while(t_2.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1949>";
			var t_child2=t_2.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1950>";
			t_sd=dbg_object(this).f_scaleX-dbg_object(t_child2).f_scaleX;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1951>";
			t_child2.m_SetScale(t_newScale-t_sd,t_relative);
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1954>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1955>";
		this.f_scaleX+=t_newScale;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1956>";
		this.f_scaleY+=t_newScale;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1958>";
		this.f_scaleX=t_newScale;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1959>";
		this.f_scaleY=t_newScale;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1961>";
	this.m_internal_RotateSpriteCol(this);
	pop_err();
}
bb_cftObject_ftObject.prototype.m_GetWidth=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1178>";
	var t_=this.f_w*this.f_scaleX;
	pop_err();
	return t_;
}
bb_cftObject_ftObject.prototype.m_SetColor=function(t_cRed,t_cGreen,t_cBlue){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1659>";
	dbg_object(this).f_red=t_cRed;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1660>";
	dbg_object(this).f_green=t_cGreen;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1661>";
	dbg_object(this).f_blue=t_cBlue;
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetPos=function(t_x,t_y,t_relative){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1832>";
	var t_xd=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1833>";
	var t_yd=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1834>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1835>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1835>";
		var t_=this.f_childObjList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1835>";
		while(t_.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1835>";
			var t_child=t_.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1836>";
			t_child.m_SetPos(t_x,t_y,t_relative);
		}
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1839>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1839>";
		var t_2=this.f_childObjList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1839>";
		while(t_2.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1839>";
			var t_child2=t_2.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1840>";
			t_xd=dbg_object(this).f_xPos-dbg_object(t_child2).f_xPos;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1841>";
			t_yd=dbg_object(this).f_yPos-dbg_object(t_child2).f_yPos;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1842>";
			t_child2.m_SetPos(t_x-t_xd,t_y-t_yd,t_relative);
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1845>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1846>";
		this.f_xPos=this.f_xPos+t_x;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1847>";
		this.f_yPos=this.f_yPos+t_y;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1849>";
		this.f_xPos=t_x;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1850>";
		this.f_yPos=t_y;
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_GetTargetAngle=function(t_targetObj,t_relative){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<807>";
	var t_xdiff=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<808>";
	var t_ydiff=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<809>";
	var t_ang=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<811>";
	t_xdiff=dbg_object(t_targetObj).f_xPos-this.f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<812>";
	t_ydiff=dbg_object(t_targetObj).f_yPos-this.f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<814>";
	t_ang=(Math.atan2(t_ydiff,t_xdiff)*R2D)+90.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<815>";
	if(t_ang<0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<816>";
		t_ang=360.0+t_ang;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<818>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<819>";
		t_ang-=dbg_object(this).f_angle;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<820>";
		if(t_ang>180.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<821>";
			t_ang-=360.0;
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<822>";
			if(t_ang<-180.0){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<823>";
				t_ang+=360.0;
			}
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<826>";
	pop_err();
	return t_ang;
}
bb_cftObject_ftObject.prototype.m_GetRadius=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<736>";
	var t_=this.f_radius*this.f_scaleX;
	pop_err();
	return t_;
}
bb_cftObject_ftObject.prototype.m_GetTargetDist=function(t_targetObj,t_useRadius){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<835>";
	var t_xdiff=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<836>";
	var t_ydiff=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<837>";
	var t_dist=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<839>";
	t_xdiff=dbg_object(t_targetObj).f_xPos-this.f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<840>";
	t_ydiff=dbg_object(t_targetObj).f_yPos-this.f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<842>";
	t_dist=Math.sqrt(t_xdiff*t_xdiff+t_ydiff*t_ydiff);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<843>";
	if(t_useRadius==true){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<844>";
		t_dist=t_dist-this.m_GetRadius()-t_targetObj.m_GetRadius();
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<847>";
	pop_err();
	return t_dist;
}
bb_cftObject_ftObject.prototype.m_GetVector=function(t_vecDistance,t_vecAngle,t_relative){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1117>";
	var t_v=new_number_array(2);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1118>";
	var t_a=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1119>";
	if(t_relative==true){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1120>";
		t_a=this.f_angle+t_vecAngle;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1122>";
		t_a=t_vecAngle;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1124>";
	dbg_array(t_v,0)[dbg_index]=this.f_xPos+Math.sin((t_a)*D2R)*t_vecDistance
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1125>";
	dbg_array(t_v,1)[dbg_index]=this.f_yPos-Math.cos((t_a)*D2R)*t_vecDistance
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1126>";
	pop_err();
	return t_v;
}
bb_cftObject_ftObject.prototype.m_internal_OrbitChild=function(t_angDiff){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2917>";
	var t_parObj=dbg_object(this).f_parentObj;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2918>";
	var t_childAngle=t_parObj.m_GetTargetAngle(this,0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2919>";
	var t_childDist=t_parObj.m_GetTargetDist(this,false);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2920>";
	var t_vec=t_parObj.m_GetVector(t_childDist,t_childAngle+t_angDiff,false);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2921>";
	this.m_SetPos(dbg_array(t_vec,0)[dbg_index],dbg_array(t_vec,1)[dbg_index],0);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2922>";
	pop_err();
	return 0;
}
bb_cftObject_ftObject.prototype.m_SetAngle=function(t_newAngle,t_relative){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1592>";
	var t_angDiff=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1593>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1594>";
		t_angDiff=t_newAngle;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1595>";
		this.f_angle=this.f_angle+t_newAngle;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1597>";
		t_angDiff=t_newAngle-this.f_angle;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1598>";
		this.f_angle=t_newAngle;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1600>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1600>";
	var t_=this.f_childObjList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1600>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1600>";
		var t_child=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1601>";
		t_child.m_internal_OrbitChild(t_angDiff);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1602>";
		t_child.m_SetAngle(t_newAngle,t_relative);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1604>";
	if(dbg_object(this).f_angle>360.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1604>";
		dbg_object(this).f_angle=dbg_object(this).f_angle-360.0;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1605>";
	if(dbg_object(this).f_angle<0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1605>";
		dbg_object(this).f_angle=dbg_object(this).f_angle+360.0;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1606>";
	this.m_internal_RotateSpriteCol(this);
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetAlpha=function(t_newAlpha,t_relative){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1581>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1582>";
		this.f_alpha+=t_newAlpha;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1584>";
		this.f_alpha=t_newAlpha;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1586>";
	if(this.f_alpha<0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1586>";
		this.f_alpha=0.0;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1587>";
	if(this.f_alpha>1.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1587>";
		this.f_alpha=1.0;
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetPosX=function(t_x,t_relative){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1856>";
	var t_xd=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1857>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1858>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1858>";
		var t_=this.f_childObjList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1858>";
		while(t_.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1858>";
			var t_child=t_.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1859>";
			t_child.m_SetPosX(t_x,t_relative);
		}
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1862>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1862>";
		var t_2=this.f_childObjList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1862>";
		while(t_2.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1862>";
			var t_child2=t_2.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1863>";
			t_xd=dbg_object(this).f_xPos-dbg_object(t_child2).f_xPos;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1864>";
			t_child2.m_SetPosX(t_x-t_xd,t_relative);
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1867>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1868>";
		this.f_xPos=this.f_xPos+t_x;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1870>";
		this.f_xPos=t_x;
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetPosY=function(t_y,t_relative){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1876>";
	var t_yd=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1877>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1878>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1878>";
		var t_=this.f_childObjList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1878>";
		while(t_.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1878>";
			var t_child=t_.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1879>";
			t_child.m_SetPosY(t_y,t_relative);
		}
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1882>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1882>";
		var t_2=this.f_childObjList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1882>";
		while(t_2.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1882>";
			var t_child2=t_2.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1883>";
			t_yd=dbg_object(this).f_yPos-dbg_object(t_child2).f_yPos;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1884>";
			t_child2.m_SetPosY(t_y-t_yd,t_relative);
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1887>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1888>";
		this.f_yPos=this.f_yPos+t_y;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1890>";
		this.f_yPos=t_y;
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_WrapScreenX=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2296>";
	if(this.f_xPos<0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2296>";
		this.m_SetPos(dbg_object(this.f_engine).f_canvasWidth,0.0,1);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2297>";
	if(this.f_xPos>dbg_object(this.f_engine).f_canvasWidth){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2297>";
		this.m_SetPos(-dbg_object(this.f_engine).f_canvasWidth,0.0,1);
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_WrapScreenY=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2301>";
	if(this.f_yPos<0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2301>";
		this.m_SetPos(0.0,dbg_object(this.f_engine).f_canvasHeight,1);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2302>";
	if(this.f_yPos>dbg_object(this.f_engine).f_canvasHeight){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2302>";
		this.m_SetPos(0.0,-dbg_object(this.f_engine).f_canvasHeight,1);
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_CleanupLists=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<371>";
	var t_a="";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<372>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<372>";
	var t_=dbg_object(this).f_transitionList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<372>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<372>";
		var t_trans=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<373>";
		if(dbg_object(t_trans).f_deleted){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<373>";
			t_trans.m_Cancel();
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<376>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<376>";
	var t_2=dbg_object(this).f_timerList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<376>";
	while(t_2.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<376>";
		var t_timer=t_2.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<381>";
		if(dbg_object(t_timer).f_deleted){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<381>";
			t_timer.m_RemoveTimer();
		}
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_Update=function(t_delta){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2309>";
	if(this.f_isActive==true && this.f_deleted==false){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2310>";
		if(dbg_object(this.f_engine).f_isPaused==false){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2311>";
			if(this.f_isAnimated==true){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2312>";
				dbg_object(this).f_animTime+=t_delta*dbg_object(this.f_engine).f_timeScale;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2313>";
				if(dbg_object(this).f_animTime>dbg_object(this).f_frameEnd*dbg_object(this).f_frameTime){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2313>";
					dbg_object(this).f_animTime-=dbg_object(this).f_frameLength*dbg_object(this).f_frameTime;
				}
			}
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2317>";
			var t_currSpeed=this.f_speed;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2318>";
			var t_currFriction=this.f_friction*t_delta*dbg_object(this.f_engine).f_timeScale;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2319>";
			if(t_currSpeed>=0.0){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2320>";
				t_currSpeed=t_currSpeed-t_currFriction;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2321>";
				if(t_currSpeed<t_currFriction){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2321>";
					t_currSpeed=0.0;
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2323>";
				this.f_speed=t_currSpeed;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2324>";
				this.f_speedX=Math.sin((this.f_speedAngle)*D2R)*t_currSpeed;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2325>";
				this.f_speedY=-Math.cos((this.f_speedAngle)*D2R)*t_currSpeed;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2326>";
				if(this.f_speed!=0.0){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2326>";
					this.m_SetPos(this.f_speedX*t_delta*dbg_object(this.f_engine).f_timeScale,this.f_speedY*t_delta*dbg_object(this.f_engine).f_timeScale,1);
				}
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2328>";
				t_currSpeed=t_currSpeed+t_currFriction;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2329>";
				if(t_currSpeed>t_currFriction){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2329>";
					t_currSpeed=0.0;
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2331>";
				this.f_speed=t_currSpeed;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2332>";
				this.f_speedX=Math.sin((this.f_speedAngle)*D2R)*t_currSpeed;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2333>";
				this.f_speedY=-Math.cos((this.f_speedAngle)*D2R)*t_currSpeed;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2334>";
				if(this.f_speed!=0.0){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2334>";
					this.m_SetPos(this.f_speedX*t_delta*dbg_object(this.f_engine).f_timeScale,this.f_speedY*t_delta*dbg_object(this.f_engine).f_timeScale,1);
				}
			}
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2336>";
			if(this.f_speedSpin!=0.0){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2337>";
				var t_absSpeedSpin=this.f_speedSpin;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2338>";
				if(t_absSpeedSpin<0.0){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2338>";
					t_absSpeedSpin=t_absSpeedSpin*-1.0;
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2339>";
				if(t_absSpeedSpin<t_currFriction){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2340>";
					this.f_speedSpin=0.0;
				}else{
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2342>";
					if(this.f_speedSpin>0.0){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2343>";
						this.f_speedSpin=this.f_speedSpin-t_currFriction;
					}else{
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2345>";
						this.f_speedSpin=this.f_speedSpin+t_currFriction;
					}
				}
			}
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2350>";
			if(this.f_speedSpin!=0.0){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2350>";
				this.m_SetAngle(this.f_speedSpin*t_delta*dbg_object(this.f_engine).f_timeScale,1);
			}
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2352>";
			if(dbg_object(this).f_isWrappingX){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2352>";
				this.m_WrapScreenX();
			}
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2353>";
			if(dbg_object(this).f_isWrappingY){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2353>";
				this.m_WrapScreenY();
			}
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2355>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2355>";
		var t_=this.f_childObjList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2355>";
		while(t_.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2355>";
			var t_child=t_.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2356>";
			if(dbg_object(t_child).f_isActive){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2356>";
				t_child.m_Update(t_delta);
			}
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2358>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2358>";
		var t_2=this.f_transitionList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2358>";
		while(t_2.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2358>";
			var t_trans=t_2.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2359>";
			t_trans.m_Update3();
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2361>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2361>";
		var t_3=this.f_timerList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2361>";
		while(t_3.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2361>";
			var t_timer=t_3.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2362>";
			t_timer.m_Update3();
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2364>";
		if(dbg_object(this.f_engine).f_isPaused==false){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2365>";
			if(dbg_object(this).f_onUpdateEvent==true){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2365>";
				this.f_engine.m_OnObjectUpdate(this);
			}
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2368>";
	this.m_CleanupLists();
	pop_err();
}
bb_cftObject_ftObject.prototype.m_Remove=function(t_directFlag){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1198>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1198>";
	var t_=this.f_childObjList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1198>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1198>";
		var t_child=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1199>";
		t_child.m_Remove(t_directFlag);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1201>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1201>";
	var t_2=this.f_transitionList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1201>";
	while(t_2.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1201>";
		var t_trans=t_2.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1202>";
		t_trans.m_Cancel();
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1204>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1204>";
	var t_3=this.f_timerList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1204>";
	while(t_3.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1204>";
		var t_timer=t_3.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1205>";
		t_timer.m_RemoveTimer();
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1207>";
	if(t_directFlag==true){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1208>";
		if(dbg_object(this).f_parentObj!=null){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1210>";
			dbg_object(this).f_parentNode.m_Remove2();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1211>";
			dbg_object(this).f_parentObj=null;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1214>";
		if(dbg_object(this).f_layer!=null){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1215>";
			dbg_object(this).f_layerNode.m_Remove2();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1216>";
			dbg_object(this).f_layer=null;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1218>";
		if(dbg_object(this).f_marker!=null){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1219>";
			dbg_object(this).f_markerNode.m_Remove2();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1220>";
			dbg_object(this).f_marker=null;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1222>";
		if(dbg_object(this).f_onDeleteEvent==true){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1222>";
			this.f_engine.m_OnObjectDelete(this);
		}
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1224>";
		dbg_object(this).f_deleted=true;
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_internal_PointToPointDist=function(t_x1,t_y1,t_x2,t_y2){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3025>";
	var t_dx=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3025>";
	var t_dy=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3026>";
	t_dx=t_x1-t_x2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3027>";
	t_dy=t_y1-t_y2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3028>";
	var t_=Math.sqrt(t_dx*t_dx+t_dy*t_dy);
	pop_err();
	return t_;
}
bb_cftObject_ftObject.prototype.m_internal_Line2Circle=function(t_x1,t_y1,t_x2,t_y2,t_px,t_py,t_r){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2823>";
	var t_sx=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2824>";
	var t_sy=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2825>";
	var t_cx=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2826>";
	var t_cy=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2827>";
	var t_q=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2829>";
	t_sx=t_x2-t_x1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2830>";
	t_sy=t_y2-t_y1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2831>";
	t_q=((t_px-t_x1)*(t_x2-t_x1)+(t_py-t_y1)*(t_y2-t_y1))/(t_sx*t_sx+t_sy*t_sy);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2833>";
	if(t_q<0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2833>";
		t_q=0.0;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2834>";
	if(t_q>1.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2834>";
		t_q=1.0;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2836>";
	t_cx=(1.0-t_q)*t_x1+t_q*t_x2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2837>";
	t_cy=(1.0-t_q)*t_y1+t_q*t_y2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2839>";
	var t_=this.m_internal_PointToPointDist(t_px,t_py,t_cx,t_cy)<t_r;
	pop_err();
	return t_;
}
bb_cftObject_ftObject.prototype.m_internal_Circle2LineObj=function(t_sp1,t_sp2){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2581>";
	var t_rf=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2582>";
	var t_bp1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2583>";
	var t_bp2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2585>";
	var t_sp1X=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2585>";
	var t_sp1Y=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2586>";
	t_sp1X=dbg_object(t_sp1).f_xPos+dbg_object(t_sp1).f_hOffX;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2587>";
	t_sp1Y=dbg_object(t_sp1).f_yPos+dbg_object(t_sp1).f_hOffY;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2589>";
	t_rf=dbg_object(t_sp1).f_radius*dbg_object(t_sp1).f_scaleX*dbg_object(t_sp1).f_collScale;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2591>";
	dbg_object(t_bp1).f_x=dbg_object(t_sp2).f_x1c+dbg_object(t_sp2).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2592>";
	dbg_object(t_bp1).f_y=dbg_object(t_sp2).f_y1c+dbg_object(t_sp2).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2594>";
	dbg_object(t_bp2).f_x=dbg_object(t_sp2).f_x2c+dbg_object(t_sp2).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2595>";
	dbg_object(t_bp2).f_y=dbg_object(t_sp2).f_y2c+dbg_object(t_sp2).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2597>";
	if(this.m_internal_Line2Circle(dbg_object(t_bp1).f_x,dbg_object(t_bp1).f_y,dbg_object(t_bp2).f_x,dbg_object(t_bp2).f_y,t_sp1X,t_sp1Y,t_rf)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2597>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2598>";
	pop_err();
	return false;
}
bb_cftObject_ftObject.prototype.m_internal_PointInsidePolygon=function(t_sp,t_px,t_py){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2999>";
	var t_cx=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2999>";
	var t_cy=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3000>";
	var t_SinVal=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3000>";
	var t_CosVal=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3001>";
	var t_t=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3001>";
	var t_b=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3001>";
	var t_l=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3001>";
	var t_r=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3006>";
	t_SinVal=Math.sin(-dbg_object(t_sp).f_angle);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3007>";
	t_CosVal=Math.cos(-dbg_object(t_sp).f_angle);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3009>";
	t_cx=t_px-dbg_object(t_sp).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3010>";
	t_cy=t_py-dbg_object(t_sp).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3012>";
	t_px=t_cx*t_CosVal-t_cy*t_SinVal+dbg_object(t_sp).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3013>";
	t_py=t_cy*t_CosVal+t_cx*t_SinVal+dbg_object(t_sp).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3015>";
	t_l=dbg_object(t_sp).f_xPos+dbg_object(t_sp).f_hOffX-dbg_object(t_sp).f_w*dbg_object(t_sp).f_scaleX*dbg_object(t_sp).f_collScale/2.0+1.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3016>";
	t_r=t_l+dbg_object(t_sp).f_w*(dbg_object(t_sp).f_scaleX*dbg_object(t_sp).f_collScale)-2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3017>";
	t_t=dbg_object(t_sp).f_yPos+dbg_object(t_sp).f_hOffY-dbg_object(t_sp).f_h*dbg_object(t_sp).f_scaleY*dbg_object(t_sp).f_collScale/2.0+1.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3018>";
	t_b+=t_t+dbg_object(t_sp).f_h*(dbg_object(t_sp).f_scaleY*dbg_object(t_sp).f_collScale)-2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3020>";
	if(t_px<t_l || t_px>t_r || t_py<t_t || t_py>t_b){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3020>";
		pop_err();
		return false;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3021>";
	pop_err();
	return true;
}
bb_cftObject_ftObject.prototype.m_internal_Circle2Box=function(t_sp1,t_sp2){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2514>";
	var t_rf=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2515>";
	var t_bp1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2516>";
	var t_bp2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2517>";
	var t_bp3=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2518>";
	var t_bp4=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2520>";
	var t_sp1X=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2520>";
	var t_sp1Y=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2521>";
	t_sp1X=dbg_object(t_sp1).f_xPos+dbg_object(t_sp1).f_hOffX;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2522>";
	t_sp1Y=dbg_object(t_sp1).f_yPos+dbg_object(t_sp1).f_hOffY;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2524>";
	if(this.m_internal_PointInsidePolygon(t_sp2,t_sp1X,t_sp1Y)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2524>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2526>";
	t_rf=dbg_object(t_sp1).f_radius*dbg_object(t_sp1).f_scaleX*dbg_object(t_sp1).f_collScale;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2528>";
	dbg_object(t_bp1).f_x=dbg_object(t_sp2).f_x1c+dbg_object(t_sp2).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2529>";
	dbg_object(t_bp1).f_y=dbg_object(t_sp2).f_y1c+dbg_object(t_sp2).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2531>";
	dbg_object(t_bp2).f_x=dbg_object(t_sp2).f_x2c+dbg_object(t_sp2).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2532>";
	dbg_object(t_bp2).f_y=dbg_object(t_sp2).f_y2c+dbg_object(t_sp2).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2534>";
	dbg_object(t_bp3).f_x=dbg_object(t_sp2).f_x3c+dbg_object(t_sp2).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2535>";
	dbg_object(t_bp3).f_y=dbg_object(t_sp2).f_y3c+dbg_object(t_sp2).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2537>";
	dbg_object(t_bp4).f_x=dbg_object(t_sp2).f_x4c+dbg_object(t_sp2).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2538>";
	dbg_object(t_bp4).f_y=dbg_object(t_sp2).f_y4c+dbg_object(t_sp2).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2540>";
	if(this.m_internal_Line2Circle(dbg_object(t_bp1).f_x,dbg_object(t_bp1).f_y,dbg_object(t_bp2).f_x,dbg_object(t_bp2).f_y,t_sp1X,t_sp1Y,t_rf)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2540>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2541>";
	if(this.m_internal_Line2Circle(dbg_object(t_bp2).f_x,dbg_object(t_bp2).f_y,dbg_object(t_bp3).f_x,dbg_object(t_bp3).f_y,t_sp1X,t_sp1Y,t_rf)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2541>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2542>";
	if(this.m_internal_Line2Circle(dbg_object(t_bp3).f_x,dbg_object(t_bp3).f_y,dbg_object(t_bp4).f_x,dbg_object(t_bp4).f_y,t_sp1X,t_sp1Y,t_rf)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2542>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2543>";
	if(this.m_internal_Line2Circle(dbg_object(t_bp4).f_x,dbg_object(t_bp4).f_y,dbg_object(t_bp1).f_x,dbg_object(t_bp1).f_y,t_sp1X,t_sp1Y,t_rf)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2543>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2544>";
	pop_err();
	return false;
}
bb_cftObject_ftObject.prototype.m_internal_Circle2Circle=function(t_sp1,t_sp2){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2549>";
	var t_xf=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2549>";
	var t_yf=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2549>";
	var t_rf=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2551>";
	t_xf=dbg_object(t_sp1).f_xPos+dbg_object(t_sp1).f_hOffX-(dbg_object(t_sp2).f_xPos+dbg_object(t_sp2).f_hOffX);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2552>";
	t_xf*=t_xf;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2553>";
	t_yf=dbg_object(t_sp1).f_yPos+dbg_object(t_sp1).f_hOffY-(dbg_object(t_sp2).f_yPos+dbg_object(t_sp2).f_hOffY);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2554>";
	t_yf*=t_yf;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2555>";
	t_rf=dbg_object(t_sp1).f_radius*dbg_object(t_sp1).f_scaleX*dbg_object(t_sp1).f_collScale+dbg_object(t_sp2).f_radius*dbg_object(t_sp2).f_scaleX*dbg_object(t_sp2).f_collScale;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2556>";
	t_rf*=t_rf;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2558>";
	if(t_xf+t_yf<t_rf){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2558>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2560>";
	pop_err();
	return false;
}
bb_cftObject_ftObject.prototype.m_internal_Box2Circle=function(t_sp2,t_sp1){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2786>";
	var t_rf=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2787>";
	var t_bp1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2788>";
	var t_bp2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2789>";
	var t_bp3=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2790>";
	var t_bp4=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2792>";
	var t_sp1X=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2792>";
	var t_sp1Y=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2793>";
	t_sp1X=dbg_object(t_sp1).f_xPos+dbg_object(t_sp1).f_hOffX;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2794>";
	t_sp1Y=dbg_object(t_sp1).f_yPos+dbg_object(t_sp1).f_hOffY;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2796>";
	if(this.m_internal_PointInsidePolygon(t_sp2,t_sp1X,t_sp1Y)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2796>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2798>";
	t_rf=dbg_object(t_sp1).f_radius*dbg_object(t_sp1).f_scaleX;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2800>";
	dbg_object(t_bp1).f_x=dbg_object(t_sp2).f_x1c+dbg_object(t_sp2).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2801>";
	dbg_object(t_bp1).f_y=dbg_object(t_sp2).f_y1c+dbg_object(t_sp2).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2803>";
	dbg_object(t_bp2).f_x=dbg_object(t_sp2).f_x2c+dbg_object(t_sp2).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2804>";
	dbg_object(t_bp2).f_y=dbg_object(t_sp2).f_y2c+dbg_object(t_sp2).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2806>";
	dbg_object(t_bp3).f_x=dbg_object(t_sp2).f_x3c+dbg_object(t_sp2).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2807>";
	dbg_object(t_bp3).f_y=dbg_object(t_sp2).f_y3c+dbg_object(t_sp2).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2809>";
	dbg_object(t_bp4).f_x=dbg_object(t_sp2).f_x4c+dbg_object(t_sp2).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2810>";
	dbg_object(t_bp4).f_y=dbg_object(t_sp2).f_y4c+dbg_object(t_sp2).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2812>";
	if(this.m_internal_Line2Circle(dbg_object(t_bp1).f_x,dbg_object(t_bp1).f_y,dbg_object(t_bp2).f_x,dbg_object(t_bp2).f_y,t_sp1X,t_sp1Y,t_rf)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2812>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2813>";
	if(this.m_internal_Line2Circle(dbg_object(t_bp2).f_x,dbg_object(t_bp2).f_y,dbg_object(t_bp3).f_x,dbg_object(t_bp3).f_y,t_sp1X,t_sp1Y,t_rf)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2813>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2814>";
	if(this.m_internal_Line2Circle(dbg_object(t_bp3).f_x,dbg_object(t_bp3).f_y,dbg_object(t_bp4).f_x,dbg_object(t_bp4).f_y,t_sp1X,t_sp1Y,t_rf)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2814>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2815>";
	if(this.m_internal_Line2Circle(dbg_object(t_bp4).f_x,dbg_object(t_bp4).f_y,dbg_object(t_bp1).f_x,dbg_object(t_bp1).f_y,t_sp1X,t_sp1Y,t_rf)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2815>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2817>";
	pop_err();
	return false;
}
bb_cftObject_ftObject.prototype.m_internal_Circle2CircleInBox=function(t_sp1,t_sp2){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2565>";
	var t_xf=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2565>";
	var t_yf=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2565>";
	var t_rf=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2567>";
	t_xf=dbg_object(t_sp1).f_xPos+dbg_object(t_sp1).f_hOffX-(dbg_object(t_sp2).f_xPos+dbg_object(t_sp2).f_hOffX);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2568>";
	t_xf*=t_xf;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2569>";
	t_yf=dbg_object(t_sp1).f_yPos+dbg_object(t_sp1).f_hOffY-(dbg_object(t_sp2).f_yPos+dbg_object(t_sp2).f_hOffY);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2570>";
	t_yf*=t_yf;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2571>";
	t_rf=(dbg_object(t_sp1).f_radius*dbg_object(t_sp1).f_scaleX+dbg_object(t_sp2).f_radius*dbg_object(t_sp2).f_scaleX)*1.42;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2572>";
	t_rf*=t_rf;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2574>";
	if(t_xf+t_yf<t_rf){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2574>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2576>";
	pop_err();
	return false;
}
bb_cftObject_ftObject.prototype.m_internal_Vec2DotProduct=function(t_v1,t_v2){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<3116>";
	var t_=dbg_object(t_v1).f_x*dbg_object(t_v2).f_x+dbg_object(t_v1).f_y*dbg_object(t_v2).f_y;
	pop_err();
	return t_;
}
bb_cftObject_ftObject.prototype.m_internal_between=function(t_v,t_l,t_h){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2375>";
	if(t_v>=t_l && t_v<=t_h){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2375>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2376>";
	pop_err();
	return false;
}
bb_cftObject_ftObject.prototype.m_internal_Collided_IsIn=function(t_p,t_a,t_b,t_d){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2494>";
	var t_v=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2495>";
	var t_v1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2496>";
	var t_v2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2498>";
	dbg_object(t_v).f_x=dbg_object(t_p).f_x-dbg_object(t_a).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2499>";
	dbg_object(t_v).f_y=dbg_object(t_p).f_y-dbg_object(t_a).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2501>";
	dbg_object(t_v1).f_x=dbg_object(t_b).f_x-dbg_object(t_a).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2502>";
	dbg_object(t_v1).f_y=dbg_object(t_b).f_y-dbg_object(t_a).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2503>";
	dbg_object(t_v2).f_x=dbg_object(t_d).f_x-dbg_object(t_a).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2504>";
	dbg_object(t_v2).f_y=dbg_object(t_d).f_y-dbg_object(t_a).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2506>";
	if(this.m_internal_between(this.m_internal_Vec2DotProduct(t_v,t_v1),0.0,this.m_internal_Vec2DotProduct(t_v1,t_v1)) && this.m_internal_between(this.m_internal_Vec2DotProduct(t_v,t_v2),0.0,this.m_internal_Vec2DotProduct(t_v2,t_v2))){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2506>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2507>";
	pop_err();
	return false;
}
bb_cftObject_ftObject.prototype.m_internal_Collided_CrossDistance=function(t_l1,t_l2,t_safetyZone){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2382>";
	var t_result=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2383>";
	var t_q2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2384>";
	var t_t2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2385>";
	var t_p1start=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2386>";
	var t_p1end=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2387>";
	var t_p2start=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2388>";
	var t_p2end=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2389>";
	var t_t=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2390>";
	var t_k1=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2391>";
	var t_k2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2392>";
	var t_xp=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2393>";
	var t_yp=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2394>";
	var t_minx1=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2395>";
	var t_maxx1=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2396>";
	var t_miny1=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2397>";
	var t_maxy1=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2398>";
	var t_minx2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2399>";
	var t_maxx2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2400>";
	var t_miny2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2401>";
	var t_maxy2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2402>";
	var t_tmp=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2403>";
	var t_q1=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2405>";
	t_result=-1.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2406>";
	dbg_object(t_p1start).f_x=dbg_object(dbg_object(t_l1).f_p1).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2407>";
	dbg_object(t_p1start).f_y=dbg_object(dbg_object(t_l1).f_p1).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2409>";
	dbg_object(t_p1end).f_x=dbg_object(dbg_object(t_l1).f_p2).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2410>";
	dbg_object(t_p1end).f_y=dbg_object(dbg_object(t_l1).f_p2).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2412>";
	dbg_object(t_p2start).f_x=dbg_object(dbg_object(t_l2).f_p1).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2413>";
	dbg_object(t_p2start).f_y=dbg_object(dbg_object(t_l2).f_p1).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2415>";
	dbg_object(t_p2end).f_x=dbg_object(dbg_object(t_l2).f_p2).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2416>";
	dbg_object(t_p2end).f_y=dbg_object(dbg_object(t_l2).f_p2).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2418>";
	t_t=dbg_object(t_p1end).f_x-dbg_object(t_p1start).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2421>";
	if(t_t!=0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2422>";
		t_k1=(dbg_object(t_p1end).f_y-dbg_object(t_p1start).f_y)/t_t;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2424>";
		t_k1=100000.0;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2426>";
	t_q1=dbg_object(t_p1start).f_x-t_k1*dbg_object(t_p1start).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2428>";
	t_t=dbg_object(t_p2end).f_x-dbg_object(t_p2start).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2431>";
	if(t_t!=0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2432>";
		t_k2=(dbg_object(t_p2end).f_y-dbg_object(t_p2start).f_y)/t_t;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2434>";
		t_k2=100000.0;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2437>";
	t_q2=dbg_object(t_p2start).f_y-t_k2*dbg_object(t_p2start).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2438>";
	t_t2=t_k2-t_k1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2441>";
	if(bb_math_Abs2(t_t2)<0.0001){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2442>";
		t_yp=100000.0;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2443>";
		t_xp=100000.0;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2445>";
		t_yp=(t_q1*t_k2-t_q2*t_k1)/t_t2;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2446>";
		t_xp=(t_q1-t_q2)/t_t2;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2450>";
	if(dbg_object(t_p1end).f_x-dbg_object(t_p1start).f_x==0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2451>";
		t_xp=dbg_object(t_p1start).f_x;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2452>";
		t_yp=t_k2*t_xp+t_q2;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2455>";
	if(dbg_object(t_p2end).f_x-dbg_object(t_p2start).f_x==0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2456>";
		t_xp=dbg_object(t_p2start).f_x;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2457>";
		t_yp=t_k1*t_xp+t_q1;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2461>";
	t_minx1=bb_math_Min2(dbg_object(t_p1start).f_x,dbg_object(t_p1end).f_x);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2462>";
	t_maxx1=bb_math_Max2(dbg_object(t_p1start).f_x,dbg_object(t_p1end).f_x);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2463>";
	t_miny1=bb_math_Min2(dbg_object(t_p1start).f_y,dbg_object(t_p1end).f_y);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2464>";
	t_maxy1=bb_math_Max2(dbg_object(t_p1start).f_y,dbg_object(t_p1end).f_y);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2465>";
	t_minx2=bb_math_Min2(dbg_object(t_p2start).f_x,dbg_object(t_p2end).f_x);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2466>";
	t_maxx2=bb_math_Max2(dbg_object(t_p2start).f_x,dbg_object(t_p2end).f_x);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2467>";
	t_miny2=bb_math_Min2(dbg_object(t_p2start).f_y,dbg_object(t_p2end).f_y);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2468>";
	t_maxy2=bb_math_Max2(dbg_object(t_p2start).f_y,dbg_object(t_p2end).f_y);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2478>";
	if(t_xp+t_safetyZone<t_minx1 || t_xp-t_safetyZone>t_maxx1 || t_yp+t_safetyZone<t_miny1 || t_yp-t_safetyZone>t_maxy1 || t_xp+t_safetyZone<t_minx2 || t_xp-t_safetyZone>t_maxx2 || t_yp+t_safetyZone<t_miny2 || t_yp-t_safetyZone>t_maxy2){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2480>";
		t_result=-1.0;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2483>";
		t_tmp=Math.pow(t_xp-dbg_object(t_p1start).f_x,2.0);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2484>";
		t_tmp=t_tmp+Math.pow(t_yp-dbg_object(t_p1start).f_y,2.0);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2485>";
		t_tmp=Math.sqrt(t_tmp);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2486>";
		t_result=t_tmp;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2489>";
	pop_err();
	return t_result;
}
bb_cftObject_ftObject.prototype.m_internal_Box2Box=function(t_pSpriteA,t_pSpriteB){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2628>";
	var t_ap1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2629>";
	var t_ap2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2630>";
	var t_ap3=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2631>";
	var t_ap4=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2632>";
	var t_bp1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2633>";
	var t_bp2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2634>";
	var t_bp3=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2635>";
	var t_bp4=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2637>";
	var t_a1p1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2638>";
	var t_a1p2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2639>";
	var t_a2p1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2640>";
	var t_a2p2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2641>";
	var t_a3p1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2642>";
	var t_a3p2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2643>";
	var t_a4p1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2644>";
	var t_a4p2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2646>";
	var t_b1p1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2647>";
	var t_b1p2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2648>";
	var t_b2p1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2649>";
	var t_b2p2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2650>";
	var t_b3p1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2651>";
	var t_b3p2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2652>";
	var t_b4p1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2653>";
	var t_b4p2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2656>";
	var t_a=[bb_cftMisc_tLine2D_new.call(new bb_cftMisc_tLine2D),bb_cftMisc_tLine2D_new.call(new bb_cftMisc_tLine2D),bb_cftMisc_tLine2D_new.call(new bb_cftMisc_tLine2D),bb_cftMisc_tLine2D_new.call(new bb_cftMisc_tLine2D)];
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2657>";
	var t_b=[bb_cftMisc_tLine2D_new.call(new bb_cftMisc_tLine2D),bb_cftMisc_tLine2D_new.call(new bb_cftMisc_tLine2D),bb_cftMisc_tLine2D_new.call(new bb_cftMisc_tLine2D),bb_cftMisc_tLine2D_new.call(new bb_cftMisc_tLine2D)];
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2658>";
	var t_la=bb_cftMisc_tLine2D_new.call(new bb_cftMisc_tLine2D);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2660>";
	var t_lb=bb_cftMisc_tLine2D_new.call(new bb_cftMisc_tLine2D);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2661>";
	if(this.m_internal_Circle2CircleInBox(t_pSpriteA,t_pSpriteB)==false){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2661>";
		pop_err();
		return false;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2666>";
	dbg_object(t_ap1).f_x=dbg_object(t_pSpriteA).f_x1c+dbg_object(t_pSpriteA).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2667>";
	dbg_object(t_ap1).f_y=dbg_object(t_pSpriteA).f_y1c+dbg_object(t_pSpriteA).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2669>";
	dbg_object(t_ap2).f_x=dbg_object(t_pSpriteA).f_x2c+dbg_object(t_pSpriteA).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2670>";
	dbg_object(t_ap2).f_y=dbg_object(t_pSpriteA).f_y2c+dbg_object(t_pSpriteA).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2672>";
	dbg_object(t_ap3).f_x=dbg_object(t_pSpriteA).f_x3c+dbg_object(t_pSpriteA).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2673>";
	dbg_object(t_ap3).f_y=dbg_object(t_pSpriteA).f_y3c+dbg_object(t_pSpriteA).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2675>";
	dbg_object(t_ap4).f_x=dbg_object(t_pSpriteA).f_x4c+dbg_object(t_pSpriteA).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2676>";
	dbg_object(t_ap4).f_y=dbg_object(t_pSpriteA).f_y4c+dbg_object(t_pSpriteA).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2680>";
	dbg_object(t_bp1).f_x=dbg_object(t_pSpriteB).f_x1c+dbg_object(t_pSpriteB).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2681>";
	dbg_object(t_bp1).f_y=dbg_object(t_pSpriteB).f_y1c+dbg_object(t_pSpriteB).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2683>";
	dbg_object(t_bp2).f_x=dbg_object(t_pSpriteB).f_x2c+dbg_object(t_pSpriteB).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2684>";
	dbg_object(t_bp2).f_y=dbg_object(t_pSpriteB).f_y2c+dbg_object(t_pSpriteB).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2686>";
	dbg_object(t_bp3).f_x=dbg_object(t_pSpriteB).f_x3c+dbg_object(t_pSpriteB).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2687>";
	dbg_object(t_bp3).f_y=dbg_object(t_pSpriteB).f_y3c+dbg_object(t_pSpriteB).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2689>";
	dbg_object(t_bp4).f_x=dbg_object(t_pSpriteB).f_x4c+dbg_object(t_pSpriteB).f_xPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2690>";
	dbg_object(t_bp4).f_y=dbg_object(t_pSpriteB).f_y4c+dbg_object(t_pSpriteB).f_yPos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2694>";
	if(this.m_internal_Collided_IsIn(t_bp1,t_ap1,t_ap2,t_ap4)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2694>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2695>";
	if(this.m_internal_Collided_IsIn(t_bp2,t_ap1,t_ap2,t_ap4)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2695>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2696>";
	if(this.m_internal_Collided_IsIn(t_bp3,t_ap1,t_ap2,t_ap4)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2696>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2697>";
	if(this.m_internal_Collided_IsIn(t_bp4,t_ap1,t_ap2,t_ap4)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2697>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2699>";
	if(this.m_internal_Collided_IsIn(t_ap1,t_bp1,t_bp2,t_bp4)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2699>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2700>";
	if(this.m_internal_Collided_IsIn(t_ap2,t_bp1,t_bp2,t_bp4)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2700>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2701>";
	if(this.m_internal_Collided_IsIn(t_ap3,t_bp1,t_bp2,t_bp4)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2701>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2702>";
	if(this.m_internal_Collided_IsIn(t_ap4,t_bp1,t_bp2,t_bp4)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2702>";
		pop_err();
		return true;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2706>";
	t_a1p1=dbg_object(dbg_array(t_a,0)[dbg_index]).f_p1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2707>";
	t_a1p2=dbg_object(dbg_array(t_a,0)[dbg_index]).f_p2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2709>";
	t_a2p1=dbg_object(dbg_array(t_a,1)[dbg_index]).f_p1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2710>";
	t_a2p2=dbg_object(dbg_array(t_a,1)[dbg_index]).f_p2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2712>";
	t_a3p1=dbg_object(dbg_array(t_a,2)[dbg_index]).f_p1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2713>";
	t_a3p2=dbg_object(dbg_array(t_a,2)[dbg_index]).f_p2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2715>";
	t_a4p1=dbg_object(dbg_array(t_a,3)[dbg_index]).f_p1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2716>";
	t_a4p2=dbg_object(dbg_array(t_a,3)[dbg_index]).f_p2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2718>";
	t_b1p1=dbg_object(dbg_array(t_b,0)[dbg_index]).f_p1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2719>";
	t_b1p2=dbg_object(dbg_array(t_b,0)[dbg_index]).f_p2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2721>";
	t_b2p1=dbg_object(dbg_array(t_b,1)[dbg_index]).f_p1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2722>";
	t_b2p2=dbg_object(dbg_array(t_b,1)[dbg_index]).f_p2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2724>";
	t_b3p1=dbg_object(dbg_array(t_b,2)[dbg_index]).f_p1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2725>";
	t_b3p2=dbg_object(dbg_array(t_b,2)[dbg_index]).f_p2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2727>";
	t_b4p1=dbg_object(dbg_array(t_b,3)[dbg_index]).f_p1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2728>";
	t_b4p2=dbg_object(dbg_array(t_b,3)[dbg_index]).f_p2;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2731>";
	dbg_object(t_a1p1).f_x=dbg_object(t_ap1).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2732>";
	dbg_object(t_a1p1).f_y=dbg_object(t_ap1).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2733>";
	dbg_object(t_a1p2).f_x=dbg_object(t_ap2).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2734>";
	dbg_object(t_a1p2).f_y=dbg_object(t_ap2).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2736>";
	dbg_object(t_a2p1).f_x=dbg_object(t_ap2).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2737>";
	dbg_object(t_a2p1).f_y=dbg_object(t_ap2).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2738>";
	dbg_object(t_a2p2).f_x=dbg_object(t_ap3).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2739>";
	dbg_object(t_a2p2).f_y=dbg_object(t_ap3).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2741>";
	dbg_object(t_a3p1).f_x=dbg_object(t_ap3).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2742>";
	dbg_object(t_a3p1).f_y=dbg_object(t_ap3).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2743>";
	dbg_object(t_a3p2).f_x=dbg_object(t_ap4).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2744>";
	dbg_object(t_a3p2).f_y=dbg_object(t_ap4).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2746>";
	dbg_object(t_a4p1).f_x=dbg_object(t_ap4).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2747>";
	dbg_object(t_a4p1).f_y=dbg_object(t_ap4).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2748>";
	dbg_object(t_a4p2).f_x=dbg_object(t_ap1).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2749>";
	dbg_object(t_a4p2).f_y=dbg_object(t_ap1).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2752>";
	dbg_object(t_b1p1).f_x=dbg_object(t_bp1).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2753>";
	dbg_object(t_b1p1).f_y=dbg_object(t_bp1).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2754>";
	dbg_object(t_b1p2).f_x=dbg_object(t_bp2).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2755>";
	dbg_object(t_b1p2).f_y=dbg_object(t_bp2).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2757>";
	dbg_object(t_b2p1).f_x=dbg_object(t_bp2).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2758>";
	dbg_object(t_b2p1).f_y=dbg_object(t_bp2).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2759>";
	dbg_object(t_b2p2).f_x=dbg_object(t_bp3).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2760>";
	dbg_object(t_b2p2).f_y=dbg_object(t_bp3).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2762>";
	dbg_object(t_b3p1).f_x=dbg_object(t_bp3).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2763>";
	dbg_object(t_b3p1).f_y=dbg_object(t_bp3).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2764>";
	dbg_object(t_b3p2).f_x=dbg_object(t_bp4).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2765>";
	dbg_object(t_b3p2).f_y=dbg_object(t_bp4).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2767>";
	dbg_object(t_b4p1).f_x=dbg_object(t_bp4).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2768>";
	dbg_object(t_b4p1).f_y=dbg_object(t_bp4).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2769>";
	dbg_object(t_b4p2).f_x=dbg_object(t_bp1).f_x;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2770>";
	dbg_object(t_b4p2).f_y=dbg_object(t_bp1).f_y;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2773>";
	for(var t_i=0;t_i<=3;t_i=t_i+1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2774>";
		for(var t_j=0;t_j<=3;t_j=t_j+1){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2775>";
			t_la=dbg_array(t_a,t_i)[dbg_index];
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2776>";
			t_lb=dbg_array(t_b,t_j)[dbg_index];
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2777>";
			if(this.m_internal_Collided_CrossDistance(t_la,t_lb,0.0)!=-1.0){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2778>";
				pop_err();
				return true;
			}
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2782>";
	pop_err();
	return false;
}
bb_cftObject_ftObject.prototype.m_internal_Bound2Bound=function(t_sp1,t_sp2){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2603>";
	var t_left1=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2603>";
	var t_left2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2603>";
	var t_right1=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2603>";
	var t_right2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2603>";
	var t_top1=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2603>";
	var t_top2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2603>";
	var t_bottom1=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2603>";
	var t_bottom2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2603>";
	var t_h=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2603>";
	var t_w=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2606>";
	t_left1=dbg_object(t_sp1).f_xPos+dbg_object(t_sp1).f_hOffX-dbg_object(t_sp1).f_w*dbg_object(t_sp1).f_scaleX*dbg_object(t_sp1).f_collScale/2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2607>";
	t_right1=t_left1+dbg_object(t_sp1).f_w*dbg_object(t_sp1).f_scaleX;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2609>";
	t_top1=dbg_object(t_sp1).f_yPos+dbg_object(t_sp1).f_hOffY-dbg_object(t_sp1).f_h*dbg_object(t_sp1).f_scaleY*dbg_object(t_sp1).f_collScale/2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2610>";
	t_bottom1=t_top1+dbg_object(t_sp1).f_h*dbg_object(t_sp1).f_scaleY;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2612>";
	t_left2=dbg_object(t_sp2).f_xPos+dbg_object(t_sp2).f_hOffX-dbg_object(t_sp2).f_w*dbg_object(t_sp2).f_scaleX*dbg_object(t_sp2).f_collScale/2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2613>";
	t_right2=t_left2+dbg_object(t_sp2).f_w*dbg_object(t_sp2).f_scaleX;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2615>";
	t_top2=dbg_object(t_sp2).f_yPos+dbg_object(t_sp2).f_hOffY-dbg_object(t_sp2).f_h*dbg_object(t_sp2).f_scaleY*dbg_object(t_sp2).f_collScale/2.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2616>";
	t_bottom2=t_top2+dbg_object(t_sp2).f_h*dbg_object(t_sp2).f_scaleY;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2619>";
	if(t_bottom1<t_top2){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2619>";
		pop_err();
		return false;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2620>";
	if(t_top1>t_bottom2){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2620>";
		pop_err();
		return false;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2621>";
	if(t_right1<t_left2){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2621>";
		pop_err();
		return false;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2622>";
	if(t_left1>t_right2){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2622>";
		pop_err();
		return false;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2623>";
	pop_err();
	return true;
}
bb_cftObject_ftObject.prototype.m_CheckCollision=function(t_sp2){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<242>";
	if(dbg_object(t_sp2).f_deleted==false && dbg_object(this).f_deleted==false){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<243>";
		if(dbg_object(t_sp2).f_collGroup>0 && dbg_object(t_sp2).f_isActive){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<244>";
			if(dbg_array(dbg_object(this).f_collWith,dbg_object(t_sp2).f_collGroup-1)[dbg_index]>0){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<245>";
				var t_=dbg_object(this).f_collType;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<246>";
				if(t_==0){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<247>";
					var t_2=dbg_object(t_sp2).f_collType;
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<248>";
					if(t_2==3){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<249>";
						var t_3=this.m_internal_Circle2LineObj(this,t_sp2);
						pop_err();
						return t_3;
					}else{
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<250>";
						if(t_2==1 || t_2==2){
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<251>";
							var t_4=this.m_internal_Circle2Box(this,t_sp2);
							pop_err();
							return t_4;
						}else{
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<253>";
							var t_5=this.m_internal_Circle2Circle(this,t_sp2);
							pop_err();
							return t_5;
						}
					}
				}else{
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<255>";
					if(t_==1){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<256>";
						var t_6=dbg_object(t_sp2).f_collType;
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<257>";
						if(t_6==0){
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<258>";
							var t_7=this.m_internal_Box2Circle(this,t_sp2);
							pop_err();
							return t_7;
						}else{
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<261>";
							var t_8=this.m_internal_Box2Box(this,t_sp2);
							pop_err();
							return t_8;
						}
					}else{
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<263>";
						if(t_==2){
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<264>";
							var t_9=dbg_object(t_sp2).f_collType;
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<265>";
							if(t_9==0){
								err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<266>";
								var t_10=this.m_internal_Box2Circle(this,t_sp2);
								pop_err();
								return t_10;
							}else{
								err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<267>";
								if(t_9==1 || t_9==3){
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<268>";
									var t_11=this.m_internal_Box2Box(this,t_sp2);
									pop_err();
									return t_11;
								}else{
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<270>";
									var t_12=this.m_internal_Bound2Bound(this,t_sp2);
									pop_err();
									return t_12;
								}
							}
						}else{
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<272>";
							if(t_==3){
								err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<273>";
								var t_13=dbg_object(t_sp2).f_collType;
								err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<274>";
								if(t_13==0){
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<275>";
									var t_14=this.m_internal_Circle2LineObj(t_sp2,this);
									pop_err();
									return t_14;
								}else{
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<277>";
									var t_15=this.m_internal_Box2Box(this,t_sp2);
									pop_err();
									return t_15;
								}
							}else{
								err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<280>";
								var t_16=this.m_internal_Circle2Circle(this,t_sp2);
								pop_err();
								return t_16;
							}
						}
					}
				}
			}
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<285>";
	pop_err();
	return false;
}
bb_cftObject_ftObject.prototype.m_SetHeight=function(t_height){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1780>";
	dbg_object(this).f_h=t_height/this.f_scaleY;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1781>";
	this.m_internal_RotateSpriteCol(this);
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetWidth=function(t_width){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2290>";
	dbg_object(this).f_w=t_width/this.f_scaleX;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2291>";
	this.m_internal_RotateSpriteCol(this);
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetColGroup=function(t_collisionGroup){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1652>";
	var t_cc=dbg_object(this).f_collWith.length;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1653>";
	if(t_collisionGroup<0 || t_collisionGroup>t_cc){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1653>";
		error("\n\nError in file fantomEngine.cftObject, Method ftObject.SetColGroup(collisionGroup:Int):\n\nUsed index is wrong. Bounds are 0-"+String(t_cc)+".");
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1654>";
	dbg_object(this).f_collGroup=t_collisionGroup;
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetID=function(t_i){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1786>";
	dbg_object(this).f_id=t_i;
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetParent=function(t_newParent){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1819>";
	if(dbg_object(this).f_parentObj!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1821>";
		dbg_object(this).f_parentNode.m_Remove2();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1822>";
		dbg_object(this).f_parentNode=null;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1824>";
	if(t_newParent!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1825>";
		dbg_object(this).f_parentNode=dbg_object(t_newParent).f_childObjList.m_AddLast(this);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1827>";
	dbg_object(this).f_parentObj=t_newParent;
	pop_err();
}
bb_cftObject_ftObject.prototype.m_GetPosX=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<721>";
	pop_err();
	return this.f_xPos;
}
bb_cftObject_ftObject.prototype.m_GetPosY=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<726>";
	pop_err();
	return this.f_yPos;
}
bb_cftObject_ftObject.prototype.m_SetRadius=function(t_newRadius,t_relative){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1916>";
	if(t_relative==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1917>";
		this.f_radius+=t_newRadius/this.f_scaleX;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1919>";
		this.f_radius=t_newRadius/this.f_scaleX;
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetColWith=function(t_startIndex,t_endIndex,t_boolFlag){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1689>";
	var t_cc=dbg_object(this).f_collWith.length;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1690>";
	if(t_startIndex<1 || t_endIndex>t_cc || t_startIndex>t_endIndex){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1690>";
		error("\n\nError in file fantomEngine.cftObject, Method ftObject.SetColWith(startIndex:Int, endIndex:Int, boolFlag:Bool):\n\nUsed index is wrong. Bounds are 1-"+String(t_cc)+".");
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1691>";
	for(var t_i=t_startIndex-1;t_i<=t_endIndex-1;t_i=t_i+1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1692>";
		dbg_array(dbg_object(this).f_collWith,t_i)[dbg_index]=((t_boolFlag)?1:0)
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1694>";
	if(t_boolFlag==true){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1695>";
		dbg_object(this).f_colCheck=true;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1697>";
		dbg_object(this).f_colCheck=false;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1698>";
		for(var t_i2=0;t_i2<=t_cc;t_i2=t_i2+1){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1699>";
			if(dbg_array(this.f_collWith,t_i2)[dbg_index]==1){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1700>";
				dbg_object(this).f_colCheck=true;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1701>";
				break;
			}
		}
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetColWith2=function(t_index,t_boolFlag){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1713>";
	var t_cc=dbg_object(this).f_collWith.length;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1714>";
	if(t_index<1 || t_index>t_cc){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1714>";
		error("\n\nError in file fantomEngine.cftObject, Method ftObject.SetColWith(index, boolFlag):\n\nUsed index ("+String(t_index)+") is out of bounds (1-"+String(t_cc)+")");
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1715>";
	dbg_array(this.f_collWith,t_index-1)[dbg_index]=t_boolFlag
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1716>";
	if(t_boolFlag==1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1717>";
		dbg_object(this).f_colCheck=true;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1719>";
		dbg_object(this).f_colCheck=false;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1720>";
		for(var t_i=0;t_i<=t_cc-1;t_i=t_i+1){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1721>";
			if(dbg_array(this.f_collWith,t_i)[dbg_index]==1){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1722>";
				dbg_object(this).f_colCheck=true;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1723>";
				break;
			}
		}
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetMaxSpeed=function(t_maxSpeed){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1804>";
	dbg_object(this).f_speedMax=t_maxSpeed;
	pop_err();
}
bb_cftObject_ftObject.prototype.m_Render3=function(t_xoff,t_yoff){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1234>";
	var t_txOff=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1235>";
	var t_tyOff=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1236>";
	var t_mAlpha=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1237>";
	var t_tempScaleX=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1238>";
	var t_tempScaleY=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1239>";
	var t_tilePos=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1240>";
	var t_tileIDx=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1241>";
	var t_tlxPos=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1242>";
	var t_tlyPos=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1243>";
	var t_tlW=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1244>";
	var t_tlH=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1245>";
	var t_tlW2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1246>";
	var t_tlH2=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1247>";
	var t_ytY=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1248>";
	var t_ytX=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1249>";
	var t__y=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1250>";
	var t_px=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1251>";
	var t_py=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1252>";
	var t_tmpFrame=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1253>";
	var t_drawAngle=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1254>";
	var t__cw=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1255>";
	var t__ch=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1258>";
	if(this.f_deleted==false){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1261>";
		t_mAlpha=dbg_object(this).f_alpha*dbg_object(this.f_layer).f_alpha;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1262>";
		if(dbg_object(this.f_engine).f_alpha!=t_mAlpha){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1263>";
			bb_graphics_SetAlpha(t_mAlpha);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1264>";
			dbg_object(this.f_engine).f_alpha=t_mAlpha;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1268>";
		if(dbg_object(this.f_engine).f_red!=dbg_object(this).f_red || dbg_object(this.f_engine).f_green!=dbg_object(this).f_green || dbg_object(this.f_engine).f_blue!=dbg_object(this).f_blue){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1269>";
			bb_graphics_SetColor(dbg_object(this).f_red,dbg_object(this).f_green,dbg_object(this).f_blue);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1270>";
			dbg_object(this.f_engine).f_red=dbg_object(this).f_red;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1271>";
			dbg_object(this.f_engine).f_green=dbg_object(this).f_green;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1272>";
			dbg_object(this.f_engine).f_blue=dbg_object(this).f_blue;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1276>";
		if(dbg_object(this.f_engine).f_blendMode!=dbg_object(this).f_blendMode){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1277>";
			bb_graphics_SetBlend(dbg_object(this).f_blendMode);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1278>";
			dbg_object(this.f_engine).f_blendMode=dbg_object(this).f_blendMode;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1281>";
		if(dbg_object(this).f_isFlipV){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1282>";
			t_tempScaleY=dbg_object(this).f_scaleY*-1.0;
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1284>";
			t_tempScaleY=dbg_object(this).f_scaleY;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1286>";
		if(dbg_object(this).f_isFlipH){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1287>";
			t_tempScaleX=dbg_object(this).f_scaleX*-1.0;
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1289>";
			t_tempScaleX=dbg_object(this).f_scaleX;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1292>";
		var t_=this.f_type;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1295>";
		if(t_==8){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1297>";
			bb_graphics_DrawPoint(this.f_xPos+t_xoff,this.f_yPos+t_yoff);
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1298>";
			if(t_==9){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1299>";
				bb_graphics_PushMatrix();
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1300>";
				bb_graphics_Translate(this.f_xPos+t_xoff,this.f_yPos+t_yoff);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1301>";
				bb_graphics_Rotate(360.0-this.f_angle);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1302>";
				bb_graphics_Scale(dbg_object(this).f_scaleX,dbg_object(this).f_scaleY);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1303>";
				bb_graphics_DrawCircle(-this.f_w*dbg_object(this).f_handleX+4.0,-this.f_h*dbg_object(this).f_handleY+4.0,4.0);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1304>";
				bb_graphics_DrawLine(-this.f_w*dbg_object(this).f_handleX+4.0,-this.f_h*dbg_object(this).f_handleY+6.0,-this.f_w*dbg_object(this).f_handleX+4.0,-this.f_h*dbg_object(this).f_handleY+25.0);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1305>";
				bb_graphics_DrawLine(-this.f_w*dbg_object(this).f_handleX+4.0,-this.f_h*dbg_object(this).f_handleY+14.0,-this.f_w*dbg_object(this).f_handleX+8.0,-this.f_h*dbg_object(this).f_handleY+18.0);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1306>";
				bb_graphics_DrawLine(-this.f_w*dbg_object(this).f_handleX+4.0,-this.f_h*dbg_object(this).f_handleY+25.0,-this.f_w*dbg_object(this).f_handleX,-this.f_h*dbg_object(this).f_handleY+29.0);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1307>";
				bb_graphics_DrawLine(-this.f_w*dbg_object(this).f_handleX+4.0,-this.f_h*dbg_object(this).f_handleY+25.0,-this.f_w*dbg_object(this).f_handleX+8.0,-this.f_h*dbg_object(this).f_handleY+29.0);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1308>";
				bb_graphics_PopMatrix();
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1309>";
				if(t_==10){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1310>";
					bb_graphics_PushMatrix();
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1311>";
					bb_graphics_Translate(this.f_xPos+t_xoff,this.f_yPos+t_yoff);
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1312>";
					bb_graphics_Rotate(360.0-this.f_angle);
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1314>";
					bb_graphics_DrawOval(-this.f_w*dbg_object(this).f_handleX,-this.f_h*dbg_object(this).f_handleY,this.f_w,this.f_h);
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1315>";
					bb_graphics_PopMatrix();
				}else{
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1316>";
					if(t_==11){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1317>";
						bb_graphics_PushMatrix();
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1318>";
						bb_graphics_Translate(this.f_xPos+t_xoff,this.f_yPos+t_yoff);
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1319>";
						bb_graphics_Rotate(360.0-this.f_angle+90.0);
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1321>";
						bb_graphics_DrawLine(-this.f_w*dbg_object(this).f_handleX,0.0,this.f_w-this.f_w*dbg_object(this).f_handleX,0.0);
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1322>";
						bb_graphics_PopMatrix();
					}else{
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1323>";
						if(t_==12){
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1324>";
							bb_graphics_PushMatrix();
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1325>";
							bb_graphics_Translate(this.f_xPos+t_xoff,this.f_yPos+t_yoff);
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1326>";
							bb_graphics_Rotate(360.0-this.f_angle);
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1327>";
							bb_graphics_Scale(dbg_object(this).f_scaleX,dbg_object(this).f_scaleY);
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1328>";
							bb_graphics_DrawPoly(this.f_verts);
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1329>";
							bb_graphics_PopMatrix();
						}else{
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1331>";
							if(t_==0){
								err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1332>";
								t_px=dbg_object(this).f_hOffX+this.f_xPos+t_xoff;
								err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1333>";
								t_py=dbg_object(this).f_hOffY+this.f_yPos+t_yoff;
								err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1334>";
								if(this.f_isAnimated==true){
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1335>";
									if(t_px+this.f_w/2.0>=0.0 && t_px-this.f_w/2.0<=(this.f_engine.m_GetCanvasWidth())){
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1336>";
										if(t_py+this.f_h/2.0>=0.0 && t_py-this.f_h/2.0<=(this.f_engine.m_GetCanvasHeight())){
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1347>";
											t_tmpFrame=((bb_math_Min2(this.f_frameCount-1.0,dbg_object(this).f_animTime/dbg_object(this).f_frameTime))|0);
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1348>";
											bb_graphics_DrawImageRect2(dbg_object(dbg_object(this).f_objImg).f_img,t_px,t_py,((this.f_rox)|0),((this.f_roy)|0),((this.f_rw)|0),((this.f_rh)|0),360.0-this.f_angle+this.f_offAngle,t_tempScaleX,t_tempScaleY,bb_math_Min(t_tmpFrame,dbg_object(dbg_object(this).f_objImg).f_img.m_Frames()-1));
										}
									}
								}else{
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1352>";
									if(t_px+this.f_w/2.0>=0.0 && t_px-this.f_w/2.0<=dbg_object(this.f_engine).f_canvasWidth){
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1353>";
										if(t_py+this.f_h/2.0>=0.0 && t_py-this.f_h/2.0<=dbg_object(this.f_engine).f_canvasHeight){
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1354>";
											bb_graphics_DrawImageRect2(dbg_object(dbg_object(this).f_objImg).f_img,t_px,t_py,((this.f_rox)|0),((this.f_roy)|0),((this.f_rw)|0),((this.f_rh)|0),360.0-this.f_angle+this.f_offAngle,t_tempScaleX,t_tempScaleY,0);
										}
									}
								}
							}else{
								err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1359>";
								if(t_==6){
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1360>";
									t__cw=(this.f_engine.m_GetCanvasWidth());
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1361>";
									t__ch=(this.f_engine.m_GetCanvasHeight());
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1362>";
									t_tempScaleX=t_tempScaleX+dbg_object(this).f_tileModSX;
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1363>";
									t_tempScaleY=t_tempScaleY+dbg_object(this).f_tileModSY;
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1365>";
									t_tlW=(dbg_object(this).f_tileSizeX)*dbg_object(this).f_scaleX;
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1366>";
									t_tlH=(dbg_object(this).f_tileSizeY)*dbg_object(this).f_scaleY;
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1367>";
									t_tlW2=t_tlW/2.0;
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1368>";
									t_tlH2=t_tlH/2.0;
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1369>";
									t_drawAngle=360.0-dbg_object(this).f_angle;
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1372>";
									var t_xFirst=1;
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1373>";
									var t_xLast=dbg_object(this).f_tileCountX;
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1375>";
									for(t_ytX=1;t_ytX<=dbg_object(this).f_tileCountX;t_ytX=t_ytX+1){
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1376>";
										t_tlxPos=t_xoff+this.f_xPos+dbg_object(dbg_array(dbg_object(this).f_tileMap,t_ytX-1)[dbg_index]).f_xOff*dbg_object(this).f_scaleX;
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1377>";
										if(t_tlxPos+t_tlW2>=0.0 && t_tlxPos-t_tlW2<=t__cw){
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1378>";
											t_xFirst=t_ytX;
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1379>";
											break;
										}
									}
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1384>";
									for(t_ytX=t_xFirst+1;t_ytX<=dbg_object(this).f_tileCountX;t_ytX=t_ytX+1){
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1385>";
										t_tlxPos=t_xoff+this.f_xPos+dbg_object(dbg_array(dbg_object(this).f_tileMap,t_ytX-1)[dbg_index]).f_xOff*dbg_object(this).f_scaleX;
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1387>";
										if(t_tlxPos+t_tlW2<0.0 || t_tlxPos-t_tlW2>t__cw){
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1389>";
											t_xLast=t_ytX-1;
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1390>";
											break;
										}
									}
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1395>";
									var t_yFirst=1;
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1396>";
									var t_yLast=dbg_object(this).f_tileCountY;
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1398>";
									for(t_ytY=1;t_ytY<=dbg_object(this).f_tileCountY;t_ytY=t_ytY+1){
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1399>";
										t_tilePos=(t_ytY-1)*dbg_object(this).f_tileCountX;
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1400>";
										t_tlyPos=t_yoff+this.f_yPos+dbg_object(dbg_array(dbg_object(this).f_tileMap,t_tilePos)[dbg_index]).f_yOff*dbg_object(this).f_scaleY;
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1401>";
										if(t_tlyPos+t_tlH2>=0.0 && t_tlyPos-t_tlH2<=t__ch){
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1402>";
											t_yFirst=t_ytY;
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1403>";
											break;
										}
									}
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1408>";
									for(t_ytY=t_yFirst+1;t_ytY<=dbg_object(this).f_tileCountY;t_ytY=t_ytY+1){
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1409>";
										t_tilePos=(t_ytY-1)*dbg_object(this).f_tileCountX;
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1410>";
										t_tlyPos=t_yoff+this.f_yPos+dbg_object(dbg_array(dbg_object(this).f_tileMap,t_tilePos)[dbg_index]).f_yOff*dbg_object(this).f_scaleY;
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1412>";
										if(t_tlyPos+t_tlH2<0.0 || t_tlyPos-t_tlH2>t__ch){
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1414>";
											t_yLast=t_ytY-1;
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1415>";
											break;
										}
									}
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1420>";
									for(t_ytY=t_yFirst;t_ytY<=t_yLast;t_ytY=t_ytY+1){
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1422>";
										for(t_ytX=t_xFirst;t_ytX<=t_xLast;t_ytX=t_ytX+1){
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1423>";
											t_tilePos=t_ytX-1+(t_ytY-1)*dbg_object(this).f_tileCountX;
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1424>";
											t_tileIDx=dbg_object(dbg_array(dbg_object(this).f_tileMap,t_tilePos)[dbg_index]).f_tileID;
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1426>";
											if(t_tileIDx!=-1){
												err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1427>";
												t_tlxPos=t_xoff+this.f_xPos+dbg_object(dbg_array(dbg_object(this).f_tileMap,t_tilePos)[dbg_index]).f_xOff*dbg_object(this).f_scaleX;
												err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1428>";
												t_tlyPos=t_yoff+this.f_yPos+dbg_object(dbg_array(dbg_object(this).f_tileMap,t_tilePos)[dbg_index]).f_yOff*dbg_object(this).f_scaleY;
												err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1433>";
												bb_graphics_DrawImageRect2(dbg_object(dbg_object(this).f_objImg).f_img,t_tlxPos,t_tlyPos,((this.f_rox)|0),((this.f_roy)|0),((this.f_rw)|0),((this.f_rh)|0),t_drawAngle,t_tempScaleX,t_tempScaleY,t_tileIDx);
											}
										}
									}
								}else{
									err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1446>";
									if(t_==2){
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1447>";
										bb_graphics_PushMatrix();
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1448>";
										bb_graphics_Translate(this.f_xPos+t_xoff,this.f_yPos+t_yoff);
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1449>";
										bb_graphics_Rotate(360.0-this.f_angle);
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1451>";
										bb_graphics_DrawCircle(-this.f_w*(dbg_object(this).f_handleX-0.5),-this.f_h*(dbg_object(this).f_handleY-0.5),this.f_radius*dbg_object(this).f_scaleX);
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1452>";
										bb_graphics_PopMatrix();
									}else{
										err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1453>";
										if(t_==3){
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1454>";
											bb_graphics_PushMatrix();
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1455>";
											bb_graphics_Translate(this.f_xPos+t_xoff,this.f_yPos+t_yoff);
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1456>";
											bb_graphics_Rotate(360.0-this.f_angle);
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1457>";
											bb_graphics_Scale(dbg_object(this).f_scaleX,dbg_object(this).f_scaleY);
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1459>";
											bb_graphics_DrawRect(-this.f_w*dbg_object(this).f_handleX,-this.f_h*dbg_object(this).f_handleY,this.f_w,this.f_h);
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1460>";
											bb_graphics_PopMatrix();
										}else{
											err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1461>";
											if(t_==1){
												err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1462>";
												bb_graphics_PushMatrix();
												err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1463>";
												bb_graphics_Translate(this.f_xPos+t_xoff,this.f_yPos+t_yoff);
												err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1464>";
												bb_graphics_Rotate(360.0-this.f_angle);
												err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1465>";
												bb_graphics_Scale(dbg_object(this).f_scaleX,dbg_object(this).f_scaleY);
												err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1466>";
												var t_2=dbg_object(this).f_textMode;
												err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1467>";
												if(t_2==0){
													err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1468>";
													t_txOff=0.0;
													err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1469>";
													t_tyOff=0.0;
												}else{
													err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1470>";
													if(t_2==1){
														err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1471>";
														t_txOff=-((dbg_object(this).f_objFont.m_Length(dbg_object(this).f_text))/2.0);
														err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1472>";
														t_tyOff=0.0;
													}else{
														err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1473>";
														if(t_2==2){
															err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1474>";
															t_txOff=(-dbg_object(this).f_objFont.m_Length(dbg_object(this).f_text));
															err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1475>";
															t_tyOff=0.0;
														}else{
															err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1477>";
															if(t_2==7){
																err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1478>";
																t_txOff=0.0;
																err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1479>";
																t_tyOff=-((dbg_object(this).f_objFont.m_Height())/2.0);
															}else{
																err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1480>";
																if(t_2==3){
																	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1481>";
																	t_txOff=-((dbg_object(this).f_objFont.m_Length(dbg_object(this).f_text))/2.0);
																	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1482>";
																	t_tyOff=-((dbg_object(this).f_objFont.m_Height())/2.0);
																}else{
																	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1483>";
																	if(t_2==4){
																		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1484>";
																		t_txOff=(-dbg_object(this).f_objFont.m_Length(dbg_object(this).f_text));
																		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1485>";
																		t_tyOff=-((dbg_object(this).f_objFont.m_Height())/2.0);
																	}else{
																		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1487>";
																		if(t_2==8){
																			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1488>";
																			t_txOff=0.0;
																			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1489>";
																			t_tyOff=-(dbg_object(this).f_objFont.m_Height());
																		}else{
																			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1490>";
																			if(t_2==5){
																				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1491>";
																				t_txOff=-((dbg_object(this).f_objFont.m_Length(dbg_object(this).f_text))/2.0);
																				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1492>";
																				t_tyOff=-(dbg_object(this).f_objFont.m_Height());
																			}else{
																				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1493>";
																				if(t_2==6){
																					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1494>";
																					t_txOff=(-dbg_object(this).f_objFont.m_Length(dbg_object(this).f_text));
																					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1495>";
																					t_tyOff=-(dbg_object(this).f_objFont.m_Height());
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
												err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1497>";
												this.f_objFont.m_Draw(this.f_text,t_txOff,t_tyOff);
												err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1498>";
												bb_graphics_PopMatrix();
											}else{
												err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1499>";
												if(t_==7){
													err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1500>";
													bb_graphics_PushMatrix();
													err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1501>";
													bb_graphics_Translate(this.f_xPos+t_xoff,this.f_yPos+t_yoff);
													err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1502>";
													bb_graphics_Rotate(360.0-this.f_angle);
													err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1503>";
													bb_graphics_Scale(dbg_object(this).f_scaleX,dbg_object(this).f_scaleY);
													err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1504>";
													var t_lines=dbg_object(this).f_text.split("\n");
													err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1505>";
													var t_objFontHeight=(dbg_object(this).f_objFont.m_Height());
													err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1506>";
													var t_linesCount=t_lines.length;
													err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1508>";
													for(t__y=1;t__y<=t_linesCount;t__y=t__y+1){
														err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1510>";
														var t_3=dbg_object(this).f_textMode;
														err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1511>";
														if(t_3==0){
															err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1512>";
															t_txOff=0.0;
															err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1513>";
															t_tyOff=0.0+t_objFontHeight*(t__y-1);
														}else{
															err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1515>";
															if(t_3==1){
																err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1516>";
																t_txOff=-((dbg_object(this).f_objFont.m_Length(dbg_array(t_lines,t__y-1)[dbg_index]))/2.0);
																err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1517>";
																t_tyOff=0.0+t_objFontHeight*(t__y-1);
															}else{
																err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1519>";
																if(t_3==2){
																	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1520>";
																	t_txOff=(-dbg_object(this).f_objFont.m_Length(dbg_array(t_lines,t__y-1)[dbg_index]));
																	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1521>";
																	t_tyOff=0.0+t_objFontHeight*(t__y-1);
																}else{
																	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1523>";
																	if(t_3==7){
																		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1524>";
																		t_txOff=0.0;
																		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1525>";
																		t_tyOff=-(t_objFontHeight*(t_linesCount)/2.0)+t_objFontHeight*(t__y-1);
																	}else{
																		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1527>";
																		if(t_3==3){
																			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1528>";
																			t_txOff=-((dbg_object(this).f_objFont.m_Length(dbg_array(t_lines,t__y-1)[dbg_index]))/2.0);
																			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1529>";
																			t_tyOff=-(t_objFontHeight*(t_linesCount)/2.0)+t_objFontHeight*(t__y-1);
																		}else{
																			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1531>";
																			if(t_3==4){
																				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1532>";
																				t_txOff=(-dbg_object(this).f_objFont.m_Length(dbg_array(t_lines,t__y-1)[dbg_index]));
																				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1533>";
																				t_tyOff=-(t_objFontHeight*(t_linesCount)/2.0)+t_objFontHeight*(t__y-1);
																			}else{
																				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1535>";
																				if(t_3==8){
																					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1536>";
																					t_txOff=0.0;
																					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1537>";
																					t_tyOff=-(t_objFontHeight*(t_linesCount))+t_objFontHeight*(t__y-1);
																				}else{
																					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1539>";
																					if(t_3==5){
																						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1540>";
																						t_txOff=-((dbg_object(this).f_objFont.m_Length(dbg_array(t_lines,t__y-1)[dbg_index]))/2.0);
																						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1541>";
																						t_tyOff=-(t_objFontHeight*(t_linesCount))+t_objFontHeight*(t__y-1);
																					}else{
																						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1543>";
																						if(t_3==6){
																							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1544>";
																							t_txOff=(-dbg_object(this).f_objFont.m_Length(dbg_array(t_lines,t__y-1)[dbg_index]));
																							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1545>";
																							t_tyOff=-(t_objFontHeight*(t_linesCount))+t_objFontHeight*(t__y-1);
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
														err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1548>";
														this.f_objFont.m_Draw(dbg_array(t_lines,t__y-1)[dbg_index],t_txOff,t_tyOff);
													}
													err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1550>";
													bb_graphics_PopMatrix();
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1552>";
		if(dbg_object(this).f_onRenderEvent==true){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1552>";
			this.f_engine.m_OnObjectRender(this);
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1553>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1553>";
		var t_4=this.f_childObjList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1553>";
		while(t_4.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1553>";
			var t_child=t_4.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1554>";
			if(dbg_object(t_child).f_isVisible && dbg_object(t_child).f_isActive){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<1554>";
				t_child.m_Render3(t_xoff,t_yoff);
			}
		}
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_GetColGroup=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<581>";
	pop_err();
	return this.f_collGroup;
}
bb_cftObject_ftObject.prototype.m_GetSpeedY=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<789>";
	pop_err();
	return this.f_speedY;
}
bb_cftObject_ftObject.prototype.m_SetSpeedY=function(t_newSpeed){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2072>";
	var t_a=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2073>";
	this.f_speedY=bb_math_Min2(t_newSpeed,this.f_speedMax);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2074>";
	t_a=(Math.atan2(this.f_speedY,this.f_speedX)*R2D)+90.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2075>";
	if(t_a<0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2076>";
		t_a=t_a+360.0;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2078>";
		if(t_a>360.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2079>";
			t_a=t_a-360.0;
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2082>";
	this.f_speedAngle=t_a;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2083>";
	this.f_speed=Math.sqrt(this.f_speedX*this.f_speedX+this.f_speedY*this.f_speedY);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2084>";
	if(this.f_speed>this.f_speedMax){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2084>";
		this.f_speed=this.f_speedMax;
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_SetSpeedAngle=function(t_newAngle){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2041>";
	if(t_newAngle<0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2042>";
		t_newAngle=t_newAngle+360.0;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2044>";
		if(t_newAngle>360.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2045>";
			t_newAngle=t_newAngle-360.0;
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2048>";
	this.f_speedX=Math.sin((t_newAngle)*D2R)*dbg_object(this).f_speed;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2049>";
	this.f_speedY=-Math.cos((t_newAngle)*D2R)*dbg_object(this).f_speed;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2050>";
	this.f_speedAngle=t_newAngle;
	pop_err();
}
bb_cftObject_ftObject.prototype.m_GetSpeedX=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<776>";
	pop_err();
	return this.f_speedX;
}
bb_cftObject_ftObject.prototype.m_SetSpeedX=function(t_newSpeed){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2055>";
	var t_a=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2056>";
	this.f_speedX=bb_math_Min2(t_newSpeed,this.f_speedMax);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2057>";
	t_a=(Math.atan2(this.f_speedY,this.f_speedX)*R2D)+90.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2058>";
	if(t_a<0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2059>";
		t_a=t_a+360.0;
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2061>";
		if(t_a>360.0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2062>";
			t_a=t_a-360.0;
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2065>";
	this.f_speedAngle=t_a;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2066>";
	this.f_speed=Math.sqrt(this.f_speedX*this.f_speedX+this.f_speedY*this.f_speedY);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2067>";
	if(this.f_speed>this.f_speedMax){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<2067>";
		this.f_speed=this.f_speedMax;
	}
	pop_err();
}
bb_cftObject_ftObject.prototype.m_GetID=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftObject.monkey<669>";
	pop_err();
	return this.f_id;
}
function bb_list_List(){
	Object.call(this);
	this.f__head=(bb_list_HeadNode_new.call(new bb_list_HeadNode));
}
function bb_list_List_new(){
	push_err();
	pop_err();
	return this;
}
bb_list_List.prototype.m_AddLast=function(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<120>";
	var t_=bb_list_Node_new.call(new bb_list_Node,this.f__head,dbg_object(this.f__head).f__pred,t_data);
	pop_err();
	return t_;
}
function bb_list_List_new2(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_=t_data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_2=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	while(t_2<t_.length){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		var t_t=dbg_array(t_,t_2)[dbg_index];
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		t_2=t_2+1;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<14>";
		this.m_AddLast(t_t);
	}
	pop_err();
	return this;
}
bb_list_List.prototype.m_ObjectEnumerator=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<124>";
	var t_=bb_list_Enumerator2_new.call(new bb_list_Enumerator2,this);
	pop_err();
	return t_;
}
bb_list_List.prototype.m_Backwards=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<128>";
	var t_=bb_list_BackwardsList2_new.call(new bb_list_BackwardsList2,this);
	pop_err();
	return t_;
}
function bb_cftLayer_lObjList(){
	bb_list_List.call(this);
	this.f_layer=null;
}
bb_cftLayer_lObjList.prototype=extend_class(bb_list_List);
function bb_cftLayer_lObjList_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<22>";
	bb_list_List_new.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftLayer.monkey<22>";
	pop_err();
	return this;
}
function bb_list_Node(){
	Object.call(this);
	this.f__succ=null;
	this.f__pred=null;
	this.f__data=null;
}
function bb_list_Node_new(t_succ,t_pred,t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<199>";
	this.f__succ=t_succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<200>";
	this.f__pred=t_pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<201>";
	dbg_object(this.f__succ).f__pred=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<202>";
	dbg_object(this.f__pred).f__succ=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<203>";
	this.f__data=t_data;
	pop_err();
	return this;
}
function bb_list_Node_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<196>";
	pop_err();
	return this;
}
bb_list_Node.prototype.m_Remove2=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<212>";
	if(dbg_object(this.f__succ).f__pred!=this){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<212>";
		error("Illegal operation on removed node");
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<214>";
	dbg_object(this.f__succ).f__pred=this.f__pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<215>";
	dbg_object(this.f__pred).f__succ=this.f__succ;
	pop_err();
	return 0;
}
function bb_list_HeadNode(){
	bb_list_Node.call(this);
}
bb_list_HeadNode.prototype=extend_class(bb_list_Node);
function bb_list_HeadNode_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<248>";
	bb_list_Node_new2.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<249>";
	this.f__succ=(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<250>";
	this.f__pred=(this);
	pop_err();
	return this;
}
function bb_list_List2(){
	Object.call(this);
	this.f__head=(bb_list_HeadNode2_new.call(new bb_list_HeadNode2));
}
function bb_list_List2_new(){
	push_err();
	pop_err();
	return this;
}
bb_list_List2.prototype.m_AddLast2=function(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<120>";
	var t_=bb_list_Node2_new.call(new bb_list_Node2,this.f__head,dbg_object(this.f__head).f__pred,t_data);
	pop_err();
	return t_;
}
function bb_list_List2_new2(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_=t_data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_2=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	while(t_2<t_.length){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		var t_t=dbg_array(t_,t_2)[dbg_index];
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		t_2=t_2+1;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<14>";
		this.m_AddLast2(t_t);
	}
	pop_err();
	return this;
}
bb_list_List2.prototype.m_ObjectEnumerator=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<124>";
	var t_=bb_list_Enumerator3_new.call(new bb_list_Enumerator3,this);
	pop_err();
	return t_;
}
function bb_list_Node2(){
	Object.call(this);
	this.f__succ=null;
	this.f__pred=null;
	this.f__data=null;
}
function bb_list_Node2_new(t_succ,t_pred,t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<199>";
	this.f__succ=t_succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<200>";
	this.f__pred=t_pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<201>";
	dbg_object(this.f__succ).f__pred=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<202>";
	dbg_object(this.f__pred).f__succ=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<203>";
	this.f__data=t_data;
	pop_err();
	return this;
}
function bb_list_Node2_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<196>";
	pop_err();
	return this;
}
function bb_list_HeadNode2(){
	bb_list_Node2.call(this);
}
bb_list_HeadNode2.prototype=extend_class(bb_list_Node2);
function bb_list_HeadNode2_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<248>";
	bb_list_Node2_new2.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<249>";
	this.f__succ=(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<250>";
	this.f__pred=(this);
	pop_err();
	return this;
}
function bb_cftScene_ftScene(){
	Object.call(this);
	this.f_engine=null;
	this.f_layerList=bb_list_List2_new.call(new bb_list_List2);
}
function bb_cftScene_ftScene_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftScene.monkey<25>";
	pop_err();
	return this;
}
bb_cftScene_ftScene.prototype.m_AddLayer=function(t_layer){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftScene.monkey<42>";
	this.f_layerList.m_AddLast2(t_layer);
	pop_err();
}
function bb_list_List3(){
	Object.call(this);
	this.f__head=(bb_list_HeadNode3_new.call(new bb_list_HeadNode3));
}
function bb_list_List3_new(){
	push_err();
	pop_err();
	return this;
}
bb_list_List3.prototype.m_AddLast3=function(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<120>";
	var t_=bb_list_Node3_new.call(new bb_list_Node3,this.f__head,dbg_object(this.f__head).f__pred,t_data);
	pop_err();
	return t_;
}
function bb_list_List3_new2(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_=t_data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_2=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	while(t_2<t_.length){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		var t_t=dbg_array(t_,t_2)[dbg_index];
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		t_2=t_2+1;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<14>";
		this.m_AddLast3(t_t);
	}
	pop_err();
	return this;
}
function bb_list_Node3(){
	Object.call(this);
	this.f__succ=null;
	this.f__pred=null;
	this.f__data=null;
}
function bb_list_Node3_new(t_succ,t_pred,t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<199>";
	this.f__succ=t_succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<200>";
	this.f__pred=t_pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<201>";
	dbg_object(this.f__succ).f__pred=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<202>";
	dbg_object(this.f__pred).f__succ=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<203>";
	this.f__data=t_data;
	pop_err();
	return this;
}
function bb_list_Node3_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<196>";
	pop_err();
	return this;
}
function bb_list_HeadNode3(){
	bb_list_Node3.call(this);
}
bb_list_HeadNode3.prototype=extend_class(bb_list_Node3);
function bb_list_HeadNode3_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<248>";
	bb_list_Node3_new2.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<249>";
	this.f__succ=(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<250>";
	this.f__pred=(this);
	pop_err();
	return this;
}
function bb_app_Millisecs(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<149>";
	var t_=bb_app_device.MilliSecs();
	pop_err();
	return t_;
}
function bb_cftSwipe_ftSwipe(){
	Object.call(this);
	this.f_startX=new_number_array(10);
	this.f_startY=new_number_array(10);
	this.f_endX=new_number_array(10);
	this.f_endY=new_number_array(10);
	this.f_diffX=new_number_array(10);
	this.f_diffY=new_number_array(10);
	this.f_startTime=new_number_array(10);
	this.f_endTime=new_number_array(10);
	this.f_diffTime=new_number_array(10);
	this.f_touchActive=new_bool_array(10);
	this.f_angle=new_number_array(10);
	this.f_dist=new_number_array(10);
	this.f_speed=new_number_array(10);
	this.f_engine=null;
}
function bb_cftSwipe_ftSwipe_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<45>";
	for(var t_i=0;t_i<=9;t_i=t_i+1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<46>";
		dbg_array(this.f_startX,t_i)[dbg_index]=0.0
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<47>";
		dbg_array(this.f_startY,t_i)[dbg_index]=0.0
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<48>";
		dbg_array(this.f_endX,t_i)[dbg_index]=0.0
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<49>";
		dbg_array(this.f_endY,t_i)[dbg_index]=0.0
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<50>";
		dbg_array(this.f_diffX,t_i)[dbg_index]=0.0
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<51>";
		dbg_array(this.f_diffY,t_i)[dbg_index]=0.0
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<52>";
		dbg_array(this.f_startTime,t_i)[dbg_index]=0
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<53>";
		dbg_array(this.f_endTime,t_i)[dbg_index]=0
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<54>";
		dbg_array(this.f_diffTime,t_i)[dbg_index]=0
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<55>";
		dbg_array(this.f_touchActive,t_i)[dbg_index]=false
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<56>";
		dbg_array(this.f_angle,t_i)[dbg_index]=0.0
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<57>";
		dbg_array(this.f_dist,t_i)[dbg_index]=0.0
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSwipe.monkey<58>";
		dbg_array(this.f_speed,t_i)[dbg_index]=0.0
	}
	pop_err();
	return this;
}
function bb_cftImageMng_ftImageManager(){
	Object.call(this);
	this.f_engine=null;
	this.f_imageList=bb_list_List6_new.call(new bb_list_List6);
}
function bb_cftImageMng_ftImageManager_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<72>";
	pop_err();
	return this;
}
bb_cftImageMng_ftImageManager.prototype.m_LoadImage=function(t_image){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<144>";
	var t_tmpImg=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<145>";
	var t_newImage=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<147>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<147>";
	var t_=dbg_object(this).f_imageList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<147>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<147>";
		var t_tmpImgNode=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<148>";
		if(dbg_object(t_tmpImgNode).f_img==t_image){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<149>";
			t_newImage=t_tmpImgNode;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<150>";
			break;
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<154>";
	if(t_newImage==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<155>";
		t_newImage=bb_cftImageMng_ftImage_new.call(new bb_cftImageMng_ftImage);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<156>";
		dbg_object(t_newImage).f_engine=dbg_object(this).f_engine;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<157>";
		dbg_object(t_newImage).f_path="";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<158>";
		dbg_object(t_newImage).f_flags=bb_graphics_Image_DefaultFlags;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<159>";
		dbg_object(t_newImage).f_frameCount=1;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<161>";
		dbg_object(t_newImage).f_img=t_image;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<162>";
		dbg_object(t_newImage).f_imageNode=dbg_object(this).f_imageList.m_AddLast6(t_newImage);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<165>";
	pop_err();
	return t_newImage;
}
bb_cftImageMng_ftImageManager.prototype.m_LoadImage2=function(t_path,t_frameCount,t_flags){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<173>";
	var t_tmpImg=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<174>";
	var t_newImage=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<176>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<176>";
	var t_=dbg_object(this).f_imageList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<176>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<176>";
		var t_tmpImgNode=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<177>";
		if(dbg_object(t_tmpImgNode).f_path==t_path){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<178>";
			t_newImage=t_tmpImgNode;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<179>";
			break;
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<183>";
	if(t_newImage==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<184>";
		t_newImage=bb_cftImageMng_ftImage_new.call(new bb_cftImageMng_ftImage);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<185>";
		dbg_object(t_newImage).f_engine=dbg_object(this).f_engine;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<186>";
		dbg_object(t_newImage).f_path=t_path;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<187>";
		dbg_object(t_newImage).f_flags=t_flags;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<188>";
		dbg_object(t_newImage).f_frameCount=t_frameCount;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<190>";
		t_tmpImg=bb_graphics_LoadImage(t_path,t_frameCount,t_flags);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<191>";
		if(t_tmpImg==null){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<191>";
			error("ftImageManager.LoadImage\n\nCould not load image\n\n"+t_path);
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<192>";
		dbg_object(t_newImage).f_img=t_tmpImg;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<193>";
		dbg_object(t_newImage).f_imageNode=dbg_object(this).f_imageList.m_AddLast6(t_newImage);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<196>";
	pop_err();
	return t_newImage;
}
bb_cftImageMng_ftImageManager.prototype.m_LoadImage3=function(t_path,t_frameWidth,t_frameHeight,t_frameCount,t_flags){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<204>";
	var t_tmpImg=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<205>";
	var t_newImage=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<207>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<207>";
	var t_=dbg_object(this).f_imageList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<207>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<207>";
		var t_tmpImgNode=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<208>";
		if(dbg_object(t_tmpImgNode).f_path==t_path){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<209>";
			t_newImage=t_tmpImgNode;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<210>";
			break;
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<214>";
	if(t_newImage==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<215>";
		t_newImage=bb_cftImageMng_ftImage_new.call(new bb_cftImageMng_ftImage);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<216>";
		dbg_object(t_newImage).f_engine=dbg_object(this).f_engine;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<217>";
		dbg_object(t_newImage).f_path=t_path;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<218>";
		dbg_object(t_newImage).f_flags=t_flags;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<219>";
		dbg_object(t_newImage).f_frameCount=t_frameCount;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<220>";
		dbg_object(t_newImage).f_frameHeight=t_frameHeight;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<221>";
		dbg_object(t_newImage).f_frameWidth=t_frameWidth;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<222>";
		t_tmpImg=bb_graphics_LoadImage2(t_path,t_frameWidth,t_frameHeight,t_frameCount,t_flags);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<223>";
		if(t_tmpImg==null){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<223>";
			error("ftImageManager.LoadImage\n\nCould not load image\n\n"+t_path);
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<224>";
		dbg_object(t_newImage).f_img=t_tmpImg;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<225>";
		dbg_object(t_newImage).f_imageNode=dbg_object(this).f_imageList.m_AddLast6(t_newImage);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<228>";
	pop_err();
	return t_newImage;
}
bb_cftImageMng_ftImageManager.prototype.m_GrabImage2=function(t_atlas,t_frameStartX,t_frameStartY,t_frameWidth,t_frameHeight,t_frameCount,t_flags){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<77>";
	var t_tmpImg=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<78>";
	var t_newImage=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<80>";
	if(t_newImage==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<81>";
		t_newImage=bb_cftImageMng_ftImage_new.call(new bb_cftImageMng_ftImage);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<82>";
		dbg_object(t_newImage).f_engine=dbg_object(this).f_engine;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<83>";
		dbg_object(t_newImage).f_atlas=t_atlas;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<84>";
		dbg_object(t_newImage).f_flags=t_flags;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<85>";
		dbg_object(t_newImage).f_frameCount=t_frameCount;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<86>";
		dbg_object(t_newImage).f_frameHeight=t_frameHeight;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<87>";
		dbg_object(t_newImage).f_frameWidth=t_frameWidth;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<88>";
		dbg_object(t_newImage).f_frameStartX=t_frameStartX;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<89>";
		dbg_object(t_newImage).f_frameStartY=t_frameStartY;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<90>";
		dbg_object(t_newImage).f_isGrabed=true;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<93>";
		dbg_object(t_atlas).f_isAtlas=true;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<94>";
		t_tmpImg=dbg_object(t_atlas).f_img.m_GrabImage(t_frameStartX,t_frameStartY,t_frameWidth,t_frameHeight,t_frameCount,t_flags);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<96>";
		if(t_tmpImg==null){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<96>";
			error("ftImageManager.GrabImage\n\nCould not grab image from atlas\n\n");
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<97>";
		dbg_object(t_newImage).f_img=t_tmpImg;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<98>";
		dbg_object(t_newImage).f_imageNode=dbg_object(this).f_imageList.m_AddLast6(t_newImage);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<101>";
	pop_err();
	return t_newImage;
}
bb_cftImageMng_ftImageManager.prototype.m_GrabImage3=function(t_atlas,t_frameStartX,t_frameStartY,t_frameWidth,t_frameHeight,t_frameCount,t_flags){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<106>";
	var t_tmpImg=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<107>";
	var t_newImage=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<109>";
	if(t_newImage==null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<110>";
		t_newImage=bb_cftImageMng_ftImage_new.call(new bb_cftImageMng_ftImage);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<111>";
		dbg_object(t_newImage).f_engine=dbg_object(this).f_engine;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<113>";
		dbg_object(t_newImage).f_flags=t_flags;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<114>";
		dbg_object(t_newImage).f_frameCount=t_frameCount;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<115>";
		dbg_object(t_newImage).f_frameHeight=t_frameHeight;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<116>";
		dbg_object(t_newImage).f_frameWidth=t_frameWidth;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<117>";
		dbg_object(t_newImage).f_frameStartX=t_frameStartX;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<118>";
		dbg_object(t_newImage).f_frameStartY=t_frameStartY;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<119>";
		dbg_object(t_newImage).f_isGrabed=true;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<122>";
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<122>";
		var t_=dbg_object(this).f_imageList.m_ObjectEnumerator();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<122>";
		while(t_.m_HasNext()){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<122>";
			var t_tmpImgNode=t_.m_NextObject();
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<123>";
			if(dbg_object(t_tmpImgNode).f_img==t_atlas){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<124>";
				dbg_object(t_tmpImgNode).f_isAtlas=true;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<125>";
				dbg_object(t_newImage).f_atlas=t_tmpImgNode;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<126>";
				break;
			}
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<129>";
		t_tmpImg=t_atlas.m_GrabImage(t_frameStartX,t_frameStartY,t_frameWidth,t_frameHeight,t_frameCount,t_flags);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<131>";
		if(t_tmpImg==null){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<131>";
			error("ftImageManager.GrabImage\n\nCould not grab image from atlas\n\n");
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<132>";
		dbg_object(t_newImage).f_img=t_tmpImg;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<133>";
		dbg_object(t_newImage).f_imageNode=dbg_object(this).f_imageList.m_AddLast6(t_newImage);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<136>";
	pop_err();
	return t_newImage;
}
function bb_cftFont_ftFont(){
	Object.call(this);
	this.f_lineHeight=0;
	this.f_pageCount=0;
	this.f_pages=[];
	this.f_filename="";
	this.f_charMap=bb_map_IntMap_new.call(new bb_map_IntMap);
}
function bb_cftFont_ftFont_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<38>";
	pop_err();
	return this;
}
bb_cftFont_ftFont.prototype.m_Load2=function(t_url){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<90>";
	var t_iniText="";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<91>";
	var t_pageNum=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<92>";
	var t_idnum=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<93>";
	var t_path="";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<94>";
	var t_tmpChar=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<95>";
	var t_plLen=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<97>";
	if(t_url.indexOf("/",0)>-1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<98>";
		var t_pl=t_url.split("/");
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<99>";
		t_plLen=t_pl.length;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<100>";
		for(var t_pi=0;t_pi<=t_plLen-2;t_pi=t_pi+1){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<101>";
			t_path=t_path+dbg_array(t_pl,t_pi)[dbg_index]+"/";
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<104>";
	var t_ts=t_url.toLowerCase();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<105>";
	if(t_ts.indexOf(".txt",0)>0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<106>";
		t_iniText=bb_app_LoadString(t_url);
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<108>";
		t_iniText=bb_app_LoadString(t_url+".txt");
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<111>";
	var t_lines=t_iniText.split(String.fromCharCode(10));
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<113>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<113>";
	var t_=t_lines;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<113>";
	var t_2=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<113>";
	while(t_2<t_.length){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<113>";
		var t_line=dbg_array(t_,t_2)[dbg_index];
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<113>";
		t_2=t_2+1;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<115>";
		t_line=string_trim(t_line);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<116>";
		if(string_starts_with(t_line,"info") || t_line==""){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<116>";
			continue;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<117>";
		if(string_starts_with(t_line,"padding")){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<117>";
			continue;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<118>";
		if(string_starts_with(t_line,"common")){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<119>";
			var t_commondata=t_line.split(String.fromCharCode(32));
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<120>";
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<120>";
			var t_3=t_commondata;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<120>";
			var t_4=0;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<120>";
			while(t_4<t_3.length){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<120>";
				var t_common=dbg_array(t_3,t_4)[dbg_index];
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<120>";
				t_4=t_4+1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<122>";
				if(string_starts_with(t_common,"lineHeight=")){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<123>";
					var t_lnh=t_common.split("=");
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<124>";
					dbg_array(t_lnh,1)[dbg_index]=string_trim(dbg_array(t_lnh,1)[dbg_index])
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<125>";
					dbg_object(this).f_lineHeight=parseInt((dbg_array(t_lnh,1)[dbg_index]),10);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<128>";
				if(string_starts_with(t_common,"pages=")){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<129>";
					var t_lnh2=t_common.split("=");
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<130>";
					dbg_array(t_lnh2,1)[dbg_index]=string_trim(dbg_array(t_lnh2,1)[dbg_index])
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<131>";
					dbg_object(this).f_pageCount=parseInt((dbg_array(t_lnh2,1)[dbg_index]),10);
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<132>";
					dbg_object(this).f_pages=new_object_array(dbg_object(this).f_pageCount);
				}
			}
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<138>";
		if(string_starts_with(t_line,"page")){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<139>";
			var t_pagedata=t_line.split(String.fromCharCode(32));
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<140>";
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<140>";
			var t_5=t_pagedata;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<140>";
			var t_6=0;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<140>";
			while(t_6<t_5.length){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<140>";
				var t_data=dbg_array(t_5,t_6)[dbg_index];
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<140>";
				t_6=t_6+1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<141>";
				if(string_starts_with(t_data,"file=")){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<142>";
					var t_fn=t_data.split("=");
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<143>";
					dbg_array(t_fn,1)[dbg_index]=string_trim(dbg_array(t_fn,1)[dbg_index])
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<144>";
					dbg_object(this).f_filename=dbg_array(t_fn,1)[dbg_index];
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<145>";
					if(this.f_filename.charCodeAt(0)==34){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<146>";
						dbg_object(this).f_filename=this.f_filename.slice(1,this.f_filename.length-1);
					}
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<148>";
					dbg_object(this).f_filename=t_path+string_trim(this.f_filename);
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<150>";
					dbg_array(dbg_object(this).f_pages,t_pageNum)[dbg_index]=bb_graphics_LoadImage(dbg_object(this).f_filename,1,bb_graphics_Image_DefaultFlags)
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<151>";
					if(dbg_array(dbg_object(this).f_pages,t_pageNum)[dbg_index]==null){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<151>";
						error("Error in method ftFont.Load\n\nCan not load page image: "+dbg_object(this).f_filename);
					}
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<152>";
					t_pageNum=t_pageNum+1;
				}
			}
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<157>";
		if(string_starts_with(t_line,"chars")){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<157>";
			continue;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<159>";
		if(string_starts_with(t_line,"char")){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<160>";
			t_tmpChar=bb_cftFont_ftChar_new.call(new bb_cftFont_ftChar);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<161>";
			var t_linedata=t_line.split(String.fromCharCode(32));
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<162>";
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<162>";
			var t_7=t_linedata;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<162>";
			var t_8=0;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<162>";
			while(t_8<t_7.length){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<162>";
				var t_data2=dbg_array(t_7,t_8)[dbg_index];
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<162>";
				t_8=t_8+1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<163>";
				if(string_starts_with(t_data2,"id=")){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<164>";
					var t_idc=t_data2.split("=");
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<165>";
					dbg_array(t_idc,1)[dbg_index]=string_trim(dbg_array(t_idc,1)[dbg_index])
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<166>";
					dbg_object(t_tmpChar).f_id=parseInt((dbg_array(t_idc,1)[dbg_index]),10);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<168>";
				if(string_starts_with(t_data2,"x=")){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<169>";
					var t_xc=t_data2.split("=");
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<170>";
					dbg_array(t_xc,1)[dbg_index]=string_trim(dbg_array(t_xc,1)[dbg_index])
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<171>";
					dbg_object(t_tmpChar).f_x=parseInt((dbg_array(t_xc,1)[dbg_index]),10);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<173>";
				if(string_starts_with(t_data2,"y=")){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<174>";
					var t_yc=t_data2.split("=");
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<175>";
					dbg_array(t_yc,1)[dbg_index]=string_trim(dbg_array(t_yc,1)[dbg_index])
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<176>";
					dbg_object(t_tmpChar).f_y=parseInt((dbg_array(t_yc,1)[dbg_index]),10);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<178>";
				if(string_starts_with(t_data2,"width=")){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<179>";
					var t_wc=t_data2.split("=");
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<180>";
					dbg_array(t_wc,1)[dbg_index]=string_trim(dbg_array(t_wc,1)[dbg_index])
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<181>";
					dbg_object(t_tmpChar).f_width=parseInt((dbg_array(t_wc,1)[dbg_index]),10);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<183>";
				if(string_starts_with(t_data2,"height=")){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<184>";
					var t_hc=t_data2.split("=");
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<185>";
					dbg_array(t_hc,1)[dbg_index]=string_trim(dbg_array(t_hc,1)[dbg_index])
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<186>";
					dbg_object(t_tmpChar).f_height=parseInt((dbg_array(t_hc,1)[dbg_index]),10);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<188>";
				if(string_starts_with(t_data2,"xoffset=")){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<189>";
					var t_xoc=t_data2.split("=");
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<190>";
					dbg_array(t_xoc,1)[dbg_index]=string_trim(dbg_array(t_xoc,1)[dbg_index])
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<191>";
					dbg_object(t_tmpChar).f_xoff=parseInt((dbg_array(t_xoc,1)[dbg_index]),10);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<193>";
				if(string_starts_with(t_data2,"yoffset=")){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<194>";
					var t_yoc=t_data2.split("=");
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<195>";
					dbg_array(t_yoc,1)[dbg_index]=string_trim(dbg_array(t_yoc,1)[dbg_index])
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<196>";
					dbg_object(t_tmpChar).f_yoff=parseInt((dbg_array(t_yoc,1)[dbg_index]),10);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<198>";
				if(string_starts_with(t_data2,"xadvance=")){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<199>";
					var t_advc=t_data2.split("=");
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<200>";
					dbg_array(t_advc,1)[dbg_index]=string_trim(dbg_array(t_advc,1)[dbg_index])
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<201>";
					dbg_object(t_tmpChar).f_xadv=parseInt((dbg_array(t_advc,1)[dbg_index]),10);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<203>";
				if(string_starts_with(t_data2,"page=")){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<204>";
					var t_advc2=t_data2.split("=");
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<205>";
					dbg_array(t_advc2,1)[dbg_index]=string_trim(dbg_array(t_advc2,1)[dbg_index])
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<206>";
					dbg_object(t_tmpChar).f_page=parseInt((dbg_array(t_advc2,1)[dbg_index]),10);
				}
			}
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<209>";
			dbg_object(this).f_charMap.m_Add(dbg_object(t_tmpChar).f_id,t_tmpChar);
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<211>";
		continue;
	}
	pop_err();
}
bb_cftFont_ftFont.prototype.m_Length=function(t_t){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<74>";
	var t_currx=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<75>";
	var t_c=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<76>";
	var t_len=t_t.length;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<77>";
	var t_tmpChar=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<78>";
	for(var t_i=1;t_i<=t_len;t_i=t_i+1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<79>";
		t_c=t_t.charCodeAt(t_i-1);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<80>";
		t_tmpChar=dbg_object(this).f_charMap.m_Get(t_c);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<81>";
		if(t_tmpChar!=null){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<82>";
			t_currx+=dbg_object(t_tmpChar).f_xadv;
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<85>";
	pop_err();
	return t_currx;
}
bb_cftFont_ftFont.prototype.m_Height=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<69>";
	pop_err();
	return this.f_lineHeight;
}
bb_cftFont_ftFont.prototype.m_Draw=function(t_t,t_xpos,t_ypos){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<47>";
	var t_currx=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<48>";
	var t_curry=.0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<49>";
	var t_c=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<50>";
	var t_tmpChar=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<52>";
	var t_len=t_t.length;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<53>";
	t_currx=t_xpos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<54>";
	t_curry=t_ypos;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<56>";
	for(var t_i=1;t_i<=t_len;t_i=t_i+1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<57>";
		t_c=t_t.charCodeAt(t_i-1);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<58>";
		t_tmpChar=dbg_object(this).f_charMap.m_Get(t_c);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<59>";
		if(t_tmpChar!=null){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<60>";
			bb_graphics_DrawImageRect(dbg_array(dbg_object(this).f_pages,dbg_object(t_tmpChar).f_page)[dbg_index],t_currx+(dbg_object(t_tmpChar).f_xoff),t_curry+(dbg_object(t_tmpChar).f_yoff),dbg_object(t_tmpChar).f_x,dbg_object(t_tmpChar).f_y,dbg_object(t_tmpChar).f_width,dbg_object(t_tmpChar).f_height,0);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<61>";
			t_currx=t_currx+(dbg_object(t_tmpChar).f_xadv);
		}
	}
	pop_err();
}
function bb_cftFont_ftChar(){
	Object.call(this);
	this.f_id=0;
	this.f_x=0;
	this.f_y=0;
	this.f_width=0;
	this.f_height=0;
	this.f_xoff=0;
	this.f_yoff=0;
	this.f_xadv=0;
	this.f_page=0;
}
function bb_cftFont_ftChar_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftFont.monkey<23>";
	pop_err();
	return this;
}
function bb_app_LoadString(t_path){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/app.monkey<137>";
	var t_=bb_app_device.LoadString(t_path);
	pop_err();
	return t_;
}
function bb_map_Map(){
	Object.call(this);
	this.f_root=null;
}
function bb_map_Map_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<7>";
	pop_err();
	return this;
}
bb_map_Map.prototype.m_Compare=function(t_lhs,t_rhs){
}
bb_map_Map.prototype.m_RotateLeft=function(t_node){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<251>";
	var t_child=dbg_object(t_node).f_right;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<252>";
	dbg_object(t_node).f_right=dbg_object(t_child).f_left;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<253>";
	if((dbg_object(t_child).f_left)!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<254>";
		dbg_object(dbg_object(t_child).f_left).f_parent=t_node;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<256>";
	dbg_object(t_child).f_parent=dbg_object(t_node).f_parent;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<257>";
	if((dbg_object(t_node).f_parent)!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<258>";
		if(t_node==dbg_object(dbg_object(t_node).f_parent).f_left){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<259>";
			dbg_object(dbg_object(t_node).f_parent).f_left=t_child;
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<261>";
			dbg_object(dbg_object(t_node).f_parent).f_right=t_child;
		}
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<264>";
		this.f_root=t_child;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<266>";
	dbg_object(t_child).f_left=t_node;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<267>";
	dbg_object(t_node).f_parent=t_child;
	pop_err();
	return 0;
}
bb_map_Map.prototype.m_RotateRight=function(t_node){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<271>";
	var t_child=dbg_object(t_node).f_left;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<272>";
	dbg_object(t_node).f_left=dbg_object(t_child).f_right;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<273>";
	if((dbg_object(t_child).f_right)!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<274>";
		dbg_object(dbg_object(t_child).f_right).f_parent=t_node;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<276>";
	dbg_object(t_child).f_parent=dbg_object(t_node).f_parent;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<277>";
	if((dbg_object(t_node).f_parent)!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<278>";
		if(t_node==dbg_object(dbg_object(t_node).f_parent).f_right){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<279>";
			dbg_object(dbg_object(t_node).f_parent).f_right=t_child;
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<281>";
			dbg_object(dbg_object(t_node).f_parent).f_left=t_child;
		}
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<284>";
		this.f_root=t_child;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<286>";
	dbg_object(t_child).f_right=t_node;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<287>";
	dbg_object(t_node).f_parent=t_child;
	pop_err();
	return 0;
}
bb_map_Map.prototype.m_InsertFixup=function(t_node){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<212>";
	while(((dbg_object(t_node).f_parent)!=null) && dbg_object(dbg_object(t_node).f_parent).f_color==-1 && ((dbg_object(dbg_object(t_node).f_parent).f_parent)!=null)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<213>";
		if(dbg_object(t_node).f_parent==dbg_object(dbg_object(dbg_object(t_node).f_parent).f_parent).f_left){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<214>";
			var t_uncle=dbg_object(dbg_object(dbg_object(t_node).f_parent).f_parent).f_right;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<215>";
			if(((t_uncle)!=null) && dbg_object(t_uncle).f_color==-1){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<216>";
				dbg_object(dbg_object(t_node).f_parent).f_color=1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<217>";
				dbg_object(t_uncle).f_color=1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<218>";
				dbg_object(dbg_object(t_uncle).f_parent).f_color=-1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<219>";
				t_node=dbg_object(t_uncle).f_parent;
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<221>";
				if(t_node==dbg_object(dbg_object(t_node).f_parent).f_right){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<222>";
					t_node=dbg_object(t_node).f_parent;
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<223>";
					this.m_RotateLeft(t_node);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<225>";
				dbg_object(dbg_object(t_node).f_parent).f_color=1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<226>";
				dbg_object(dbg_object(dbg_object(t_node).f_parent).f_parent).f_color=-1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<227>";
				this.m_RotateRight(dbg_object(dbg_object(t_node).f_parent).f_parent);
			}
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<230>";
			var t_uncle2=dbg_object(dbg_object(dbg_object(t_node).f_parent).f_parent).f_left;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<231>";
			if(((t_uncle2)!=null) && dbg_object(t_uncle2).f_color==-1){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<232>";
				dbg_object(dbg_object(t_node).f_parent).f_color=1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<233>";
				dbg_object(t_uncle2).f_color=1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<234>";
				dbg_object(dbg_object(t_uncle2).f_parent).f_color=-1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<235>";
				t_node=dbg_object(t_uncle2).f_parent;
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<237>";
				if(t_node==dbg_object(dbg_object(t_node).f_parent).f_left){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<238>";
					t_node=dbg_object(t_node).f_parent;
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<239>";
					this.m_RotateRight(t_node);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<241>";
				dbg_object(dbg_object(t_node).f_parent).f_color=1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<242>";
				dbg_object(dbg_object(dbg_object(t_node).f_parent).f_parent).f_color=-1;
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<243>";
				this.m_RotateLeft(dbg_object(dbg_object(t_node).f_parent).f_parent);
			}
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<247>";
	dbg_object(this.f_root).f_color=1;
	pop_err();
	return 0;
}
bb_map_Map.prototype.m_Add=function(t_key,t_value){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<61>";
	var t_node=this.f_root;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<62>";
	var t_parent=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<62>";
	var t_cmp=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<64>";
	while((t_node)!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<65>";
		t_parent=t_node;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<66>";
		t_cmp=this.m_Compare(t_key,dbg_object(t_node).f_key);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<67>";
		if(t_cmp>0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<68>";
			t_node=dbg_object(t_node).f_right;
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<69>";
			if(t_cmp<0){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<70>";
				t_node=dbg_object(t_node).f_left;
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<72>";
				pop_err();
				return false;
			}
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<76>";
	t_node=bb_map_Node_new.call(new bb_map_Node,t_key,t_value,-1,t_parent);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<78>";
	if((t_parent)!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<79>";
		if(t_cmp>0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<80>";
			dbg_object(t_parent).f_right=t_node;
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<82>";
			dbg_object(t_parent).f_left=t_node;
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<84>";
		this.m_InsertFixup(t_node);
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<86>";
		this.f_root=t_node;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<88>";
	pop_err();
	return true;
}
bb_map_Map.prototype.m_FindNode=function(t_key){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<157>";
	var t_node=this.f_root;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<159>";
	while((t_node)!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<160>";
		var t_cmp=this.m_Compare(t_key,dbg_object(t_node).f_key);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<161>";
		if(t_cmp>0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<162>";
			t_node=dbg_object(t_node).f_right;
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<163>";
			if(t_cmp<0){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<164>";
				t_node=dbg_object(t_node).f_left;
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<166>";
				pop_err();
				return t_node;
			}
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<169>";
	pop_err();
	return t_node;
}
bb_map_Map.prototype.m_Get=function(t_key){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<101>";
	var t_node=this.m_FindNode(t_key);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<102>";
	if((t_node)!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<102>";
		pop_err();
		return dbg_object(t_node).f_value;
	}
	pop_err();
	return null;
}
function bb_map_IntMap(){
	bb_map_Map.call(this);
}
bb_map_IntMap.prototype=extend_class(bb_map_Map);
function bb_map_IntMap_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<534>";
	bb_map_Map_new.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<534>";
	pop_err();
	return this;
}
bb_map_IntMap.prototype.m_Compare=function(t_lhs,t_rhs){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<537>";
	var t_=t_lhs-t_rhs;
	pop_err();
	return t_;
}
function bb_map_Node(){
	Object.call(this);
	this.f_key=0;
	this.f_right=null;
	this.f_left=null;
	this.f_value=null;
	this.f_color=0;
	this.f_parent=null;
}
function bb_map_Node_new(t_key,t_value,t_color,t_parent){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<364>";
	dbg_object(this).f_key=t_key;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<365>";
	dbg_object(this).f_value=t_value;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<366>";
	dbg_object(this).f_color=t_color;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<367>";
	dbg_object(this).f_parent=t_parent;
	pop_err();
	return this;
}
function bb_map_Node_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/map.monkey<361>";
	pop_err();
	return this;
}
function bb_list_List4(){
	Object.call(this);
	this.f__head=(bb_list_HeadNode4_new.call(new bb_list_HeadNode4));
}
function bb_list_List4_new(){
	push_err();
	pop_err();
	return this;
}
bb_list_List4.prototype.m_AddLast4=function(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<120>";
	var t_=bb_list_Node4_new.call(new bb_list_Node4,this.f__head,dbg_object(this.f__head).f__pred,t_data);
	pop_err();
	return t_;
}
function bb_list_List4_new2(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_=t_data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_2=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	while(t_2<t_.length){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		var t_t=dbg_array(t_,t_2)[dbg_index];
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		t_2=t_2+1;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<14>";
		this.m_AddLast4(t_t);
	}
	pop_err();
	return this;
}
function bb_list_Node4(){
	Object.call(this);
	this.f__succ=null;
	this.f__pred=null;
	this.f__data=null;
}
function bb_list_Node4_new(t_succ,t_pred,t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<199>";
	this.f__succ=t_succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<200>";
	this.f__pred=t_pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<201>";
	dbg_object(this.f__succ).f__pred=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<202>";
	dbg_object(this.f__pred).f__succ=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<203>";
	this.f__data=t_data;
	pop_err();
	return this;
}
function bb_list_Node4_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<196>";
	pop_err();
	return this;
}
function bb_list_HeadNode4(){
	bb_list_Node4.call(this);
}
bb_list_HeadNode4.prototype=extend_class(bb_list_Node4);
function bb_list_HeadNode4_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<248>";
	bb_list_Node4_new2.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<249>";
	this.f__succ=(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<250>";
	this.f__pred=(this);
	pop_err();
	return this;
}
function bb_cftSound_ftSound(){
	Object.call(this);
	this.f_engine=null;
	this.f_name="";
	this.f_loop=false;
	this.f_isMusic=false;
	this.f_sound=null;
	this.f_soundNode=null;
	this.f_channel=0;
	this.f_volume=1.0;
	this.f_pan=0.0;
	this.f_rate=1.0;
	this.f_isPaused=false;
}
function bb_cftSound_ftSound_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<21>";
	pop_err();
	return this;
}
bb_cftSound_ftSound.prototype.m_GetFreeSoundChannel=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<38>";
	var t_msc=dbg_object(this.f_engine).f_maxSoundChannel;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<39>";
	var t_fsc=dbg_object(this.f_engine).f_firstSoundChannel;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<40>";
	for(var t_i=t_fsc;t_i<=t_msc-1;t_i=t_i+1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<41>";
		if(bb_audio_ChannelState(t_i)==0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<42>";
			pop_err();
			return t_i;
		}
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<46>";
	dbg_object(this.f_engine).f_nextSoundChannel+=1;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<47>";
	if(dbg_object(this.f_engine).f_nextSoundChannel>=t_msc){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<47>";
		dbg_object(this.f_engine).f_nextSoundChannel=t_fsc;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<48>";
	pop_err();
	return dbg_object(this.f_engine).f_nextSoundChannel;
}
bb_cftSound_ftSound.prototype.m_Play=function(t_c){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<95>";
	if(dbg_object(this).f_isMusic==false){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<96>";
		if(t_c==-1){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<96>";
			t_c=this.m_GetFreeSoundChannel();
		}
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<97>";
		this.f_channel=t_c;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<98>";
		if(this.f_sound!=null){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<100>";
			bb_audio_PlaySound(this.f_sound,t_c,((this.f_loop)?1:0));
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<101>";
			bb_audio_SetChannelVolume(this.f_channel,dbg_object(this).f_volume*dbg_object(this.f_engine).f_volumeSFX);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<102>";
			bb_audio_SetChannelPan(this.f_channel,dbg_object(this).f_pan);
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<103>";
			bb_audio_SetChannelRate(this.f_channel,dbg_object(this).f_rate);
		}
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<106>";
		bb_audio_PlayMusic(this.f_name,((this.f_loop)?1:0));
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<107>";
		bb_audio_SetMusicVolume(this.f_volume*dbg_object(this.f_engine).f_volumeMUS);
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<109>";
	dbg_object(this).f_isPaused=false;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<110>";
	pop_err();
	return this.f_channel;
}
bb_cftSound_ftSound.prototype.m_Stop=function(t_c){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<152>";
	if(t_c==-1){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<152>";
		t_c=this.f_channel;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<153>";
	if(dbg_object(this).f_isMusic==false){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<154>";
		bb_audio_StopChannel(t_c);
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<156>";
		bb_audio_StopMusic();
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftSound.monkey<158>";
	dbg_object(this).f_isPaused=false;
	pop_err();
}
function bb_audio_Sound(){
	Object.call(this);
	this.f_sample=null;
}
function bb_audio_Sound_new(t_sample){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<45>";
	dbg_object(this).f_sample=t_sample;
	pop_err();
	return this;
}
function bb_audio_Sound_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<42>";
	pop_err();
	return this;
}
function bb_audio_LoadSound(t_path){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<64>";
	var t_sample=bb_audio_device.LoadSample(t_path);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<65>";
	if((t_sample)!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<65>";
		var t_=bb_audio_Sound_new.call(new bb_audio_Sound,t_sample);
		pop_err();
		return t_;
	}
	pop_err();
	return null;
}
function bb_list_List5(){
	Object.call(this);
	this.f__head=(bb_list_HeadNode5_new.call(new bb_list_HeadNode5));
}
function bb_list_List5_new(){
	push_err();
	pop_err();
	return this;
}
bb_list_List5.prototype.m_AddLast5=function(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<120>";
	var t_=bb_list_Node5_new.call(new bb_list_Node5,this.f__head,dbg_object(this.f__head).f__pred,t_data);
	pop_err();
	return t_;
}
function bb_list_List5_new2(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_=t_data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_2=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	while(t_2<t_.length){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		var t_t=dbg_array(t_,t_2)[dbg_index];
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		t_2=t_2+1;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<14>";
		this.m_AddLast5(t_t);
	}
	pop_err();
	return this;
}
function bb_list_Node5(){
	Object.call(this);
	this.f__succ=null;
	this.f__pred=null;
	this.f__data=null;
}
function bb_list_Node5_new(t_succ,t_pred,t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<199>";
	this.f__succ=t_succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<200>";
	this.f__pred=t_pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<201>";
	dbg_object(this.f__succ).f__pred=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<202>";
	dbg_object(this.f__pred).f__succ=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<203>";
	this.f__data=t_data;
	pop_err();
	return this;
}
function bb_list_Node5_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<196>";
	pop_err();
	return this;
}
function bb_list_HeadNode5(){
	bb_list_Node5.call(this);
}
bb_list_HeadNode5.prototype=extend_class(bb_list_Node5);
function bb_list_HeadNode5_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<248>";
	bb_list_Node5_new2.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<249>";
	this.f__succ=(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<250>";
	this.f__pred=(this);
	pop_err();
	return this;
}
function bb_cftImageMng_ftImage(){
	Object.call(this);
	this.f_img=null;
	this.f_engine=null;
	this.f_path="";
	this.f_flags=bb_graphics_Image_DefaultFlags;
	this.f_frameCount=-1;
	this.f_imageNode=null;
	this.f_frameHeight=-1;
	this.f_frameWidth=-1;
	this.f_atlas=null;
	this.f_frameStartX=-1;
	this.f_frameStartY=-1;
	this.f_isGrabed=false;
	this.f_isAtlas=false;
}
function bb_cftImageMng_ftImage_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftImageMng.monkey<25>";
	pop_err();
	return this;
}
function bb_list_List6(){
	Object.call(this);
	this.f__head=(bb_list_HeadNode6_new.call(new bb_list_HeadNode6));
}
function bb_list_List6_new(){
	push_err();
	pop_err();
	return this;
}
bb_list_List6.prototype.m_AddLast6=function(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<120>";
	var t_=bb_list_Node6_new.call(new bb_list_Node6,this.f__head,dbg_object(this.f__head).f__pred,t_data);
	pop_err();
	return t_;
}
function bb_list_List6_new2(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_=t_data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_2=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	while(t_2<t_.length){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		var t_t=dbg_array(t_,t_2)[dbg_index];
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		t_2=t_2+1;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<14>";
		this.m_AddLast6(t_t);
	}
	pop_err();
	return this;
}
bb_list_List6.prototype.m_ObjectEnumerator=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<124>";
	var t_=bb_list_Enumerator_new.call(new bb_list_Enumerator,this);
	pop_err();
	return t_;
}
function bb_list_Node6(){
	Object.call(this);
	this.f__succ=null;
	this.f__pred=null;
	this.f__data=null;
}
function bb_list_Node6_new(t_succ,t_pred,t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<199>";
	this.f__succ=t_succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<200>";
	this.f__pred=t_pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<201>";
	dbg_object(this.f__succ).f__pred=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<202>";
	dbg_object(this.f__pred).f__succ=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<203>";
	this.f__data=t_data;
	pop_err();
	return this;
}
function bb_list_Node6_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<196>";
	pop_err();
	return this;
}
function bb_list_HeadNode6(){
	bb_list_Node6.call(this);
}
bb_list_HeadNode6.prototype=extend_class(bb_list_Node6);
function bb_list_HeadNode6_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<248>";
	bb_list_Node6_new2.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<249>";
	this.f__succ=(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<250>";
	this.f__pred=(this);
	pop_err();
	return this;
}
function bb_list_Enumerator(){
	Object.call(this);
	this.f__list=null;
	this.f__curr=null;
}
function bb_list_Enumerator_new(t_list){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<264>";
	this.f__list=t_list;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<265>";
	this.f__curr=dbg_object(dbg_object(t_list).f__head).f__succ;
	pop_err();
	return this;
}
function bb_list_Enumerator_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<261>";
	pop_err();
	return this;
}
bb_list_Enumerator.prototype.m_HasNext=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<269>";
	while(dbg_object(dbg_object(this.f__curr).f__succ).f__pred!=this.f__curr){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<270>";
		this.f__curr=dbg_object(this.f__curr).f__succ;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<272>";
	var t_=this.f__curr!=dbg_object(this.f__list).f__head;
	pop_err();
	return t_;
}
bb_list_Enumerator.prototype.m_NextObject=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<276>";
	var t_data=dbg_object(this.f__curr).f__data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<277>";
	this.f__curr=dbg_object(this.f__curr).f__succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<278>";
	pop_err();
	return t_data;
}
function bb_math_Max(t_x,t_y){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<56>";
	if(t_x>t_y){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<56>";
		pop_err();
		return t_x;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<57>";
	pop_err();
	return t_y;
}
function bb_math_Max2(t_x,t_y){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<83>";
	if(t_x>t_y){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<83>";
		pop_err();
		return t_x;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<84>";
	pop_err();
	return t_y;
}
function bb_list_Enumerator2(){
	Object.call(this);
	this.f__list=null;
	this.f__curr=null;
}
function bb_list_Enumerator2_new(t_list){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<264>";
	this.f__list=t_list;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<265>";
	this.f__curr=dbg_object(dbg_object(t_list).f__head).f__succ;
	pop_err();
	return this;
}
function bb_list_Enumerator2_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<261>";
	pop_err();
	return this;
}
bb_list_Enumerator2.prototype.m_HasNext=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<269>";
	while(dbg_object(dbg_object(this.f__curr).f__succ).f__pred!=this.f__curr){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<270>";
		this.f__curr=dbg_object(this.f__curr).f__succ;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<272>";
	var t_=this.f__curr!=dbg_object(this.f__list).f__head;
	pop_err();
	return t_;
}
bb_list_Enumerator2.prototype.m_NextObject=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<276>";
	var t_data=dbg_object(this.f__curr).f__data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<277>";
	this.f__curr=dbg_object(this.f__curr).f__succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<278>";
	pop_err();
	return t_data;
}
function bb_cftTimer_ftTimer(){
	Object.call(this);
	this.f_deleted=false;
	this.f_duration=0;
	this.f_currTime=0;
	this.f_engine=null;
	this.f_isPaused=false;
	this.f_obj=null;
	this.f_id=0;
	this.f_loop=0;
	this.f_timerNode=null;
	this.f_intervall=0;
}
bb_cftTimer_ftTimer.prototype.m_RemoveTimer=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<48>";
	if(dbg_object(this).f_timerNode!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<48>";
		dbg_object(this).f_timerNode.m_Remove2();
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<49>";
	dbg_object(this).f_timerNode=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<50>";
	dbg_object(this).f_obj=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<51>";
	dbg_object(this).f_engine=null;
	pop_err();
}
bb_cftTimer_ftTimer.prototype.m_Update3=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<62>";
	var t_oldCurrTime=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<63>";
	var t_diffTime=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<64>";
	if(this.f_deleted==false){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<65>";
		if(dbg_object(this).f_duration>0){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<66>";
			t_oldCurrTime=this.f_currTime;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<67>";
			this.f_currTime=dbg_object(this.f_engine).f_time;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<68>";
			t_diffTime=this.f_currTime-t_oldCurrTime;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<69>";
			if(dbg_object(this).f_isPaused!=true && dbg_object(this.f_engine).f_isPaused!=true){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<70>";
				this.f_duration-=t_diffTime;
			}
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<73>";
			if(this.f_duration<=0){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<74>";
				if(dbg_object(this).f_obj==null){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<75>";
					this.f_engine.m_OnTimer(this.f_id);
				}else{
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<77>";
					this.f_engine.m_OnObjectTimer(this.f_id,this.f_obj);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<79>";
				if(this.f_loop==0){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<82>";
					if(dbg_object(this).f_obj==null){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<83>";
						this.m_RemoveTimer();
					}else{
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<85>";
						dbg_object(this).f_deleted=true;
					}
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<88>";
				if(this.f_loop==-1){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<88>";
					this.f_duration+=this.f_intervall;
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<89>";
				if(this.f_loop>0){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<90>";
					this.f_duration+=this.f_intervall;
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<91>";
					this.f_loop-=1;
				}
			}
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTimer.monkey<96>";
			dbg_object(this).f_deleted=true;
		}
	}
	pop_err();
}
function bb_list_List7(){
	Object.call(this);
	this.f__head=(bb_list_HeadNode7_new.call(new bb_list_HeadNode7));
}
function bb_list_List7_new(){
	push_err();
	pop_err();
	return this;
}
bb_list_List7.prototype.m_AddLast7=function(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<120>";
	var t_=bb_list_Node7_new.call(new bb_list_Node7,this.f__head,dbg_object(this.f__head).f__pred,t_data);
	pop_err();
	return t_;
}
function bb_list_List7_new2(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_=t_data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_2=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	while(t_2<t_.length){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		var t_t=dbg_array(t_,t_2)[dbg_index];
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		t_2=t_2+1;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<14>";
		this.m_AddLast7(t_t);
	}
	pop_err();
	return this;
}
bb_list_List7.prototype.m_Backwards=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<128>";
	var t_=bb_list_BackwardsList_new.call(new bb_list_BackwardsList,this);
	pop_err();
	return t_;
}
bb_list_List7.prototype.m_ObjectEnumerator=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<124>";
	var t_=bb_list_Enumerator6_new.call(new bb_list_Enumerator6,this);
	pop_err();
	return t_;
}
function bb_list_Node7(){
	Object.call(this);
	this.f__succ=null;
	this.f__pred=null;
	this.f__data=null;
}
function bb_list_Node7_new(t_succ,t_pred,t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<199>";
	this.f__succ=t_succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<200>";
	this.f__pred=t_pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<201>";
	dbg_object(this.f__succ).f__pred=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<202>";
	dbg_object(this.f__pred).f__succ=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<203>";
	this.f__data=t_data;
	pop_err();
	return this;
}
function bb_list_Node7_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<196>";
	pop_err();
	return this;
}
bb_list_Node7.prototype.m_Remove2=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<212>";
	if(dbg_object(this.f__succ).f__pred!=this){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<212>";
		error("Illegal operation on removed node");
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<214>";
	dbg_object(this.f__succ).f__pred=this.f__pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<215>";
	dbg_object(this.f__pred).f__succ=this.f__succ;
	pop_err();
	return 0;
}
function bb_list_HeadNode7(){
	bb_list_Node7.call(this);
}
bb_list_HeadNode7.prototype=extend_class(bb_list_Node7);
function bb_list_HeadNode7_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<248>";
	bb_list_Node7_new2.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<249>";
	this.f__succ=(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<250>";
	this.f__pred=(this);
	pop_err();
	return this;
}
function bb_list_BackwardsList(){
	Object.call(this);
	this.f__list=null;
}
function bb_list_BackwardsList_new(t_list){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<291>";
	this.f__list=t_list;
	pop_err();
	return this;
}
function bb_list_BackwardsList_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<288>";
	pop_err();
	return this;
}
bb_list_BackwardsList.prototype.m_ObjectEnumerator=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<295>";
	var t_=bb_list_BackwardsEnumerator_new.call(new bb_list_BackwardsEnumerator,this.f__list);
	pop_err();
	return t_;
}
function bb_list_BackwardsEnumerator(){
	Object.call(this);
	this.f__list=null;
	this.f__curr=null;
}
function bb_list_BackwardsEnumerator_new(t_list){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<307>";
	this.f__list=t_list;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<308>";
	this.f__curr=dbg_object(dbg_object(t_list).f__head).f__pred;
	pop_err();
	return this;
}
function bb_list_BackwardsEnumerator_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<304>";
	pop_err();
	return this;
}
bb_list_BackwardsEnumerator.prototype.m_HasNext=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<312>";
	while(dbg_object(dbg_object(this.f__curr).f__pred).f__succ!=this.f__curr){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<313>";
		this.f__curr=dbg_object(this.f__curr).f__pred;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<315>";
	var t_=this.f__curr!=dbg_object(this.f__list).f__head;
	pop_err();
	return t_;
}
bb_list_BackwardsEnumerator.prototype.m_NextObject=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<319>";
	var t_data=dbg_object(this.f__curr).f__data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<320>";
	this.f__curr=dbg_object(this.f__curr).f__pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<321>";
	pop_err();
	return t_data;
}
function bb_list_Enumerator3(){
	Object.call(this);
	this.f__list=null;
	this.f__curr=null;
}
function bb_list_Enumerator3_new(t_list){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<264>";
	this.f__list=t_list;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<265>";
	this.f__curr=dbg_object(dbg_object(t_list).f__head).f__succ;
	pop_err();
	return this;
}
function bb_list_Enumerator3_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<261>";
	pop_err();
	return this;
}
bb_list_Enumerator3.prototype.m_HasNext=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<269>";
	while(dbg_object(dbg_object(this.f__curr).f__succ).f__pred!=this.f__curr){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<270>";
		this.f__curr=dbg_object(this.f__curr).f__succ;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<272>";
	var t_=this.f__curr!=dbg_object(this.f__list).f__head;
	pop_err();
	return t_;
}
bb_list_Enumerator3.prototype.m_NextObject=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<276>";
	var t_data=dbg_object(this.f__curr).f__data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<277>";
	this.f__curr=dbg_object(this.f__curr).f__succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<278>";
	pop_err();
	return t_data;
}
function bb_cftTrans_ftTrans(){
	Object.call(this);
	this.f_deleted=false;
	this.f_currTime=0;
	this.f_engine=null;
	this.f_isPaused=false;
	this.f_duration=0;
	this.f_entryList=bb_list_List9_new.call(new bb_list_List9);
	this.f_tween=null;
	this.f_finishID=0;
	this.f_obj=null;
	this.f_layer=null;
	this.f_transNode=null;
}
bb_cftTrans_ftTrans.prototype.m_Update3=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<396>";
	var t_oldCurrTime=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<397>";
	var t_deltaTime=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<399>";
	if(this.f_deleted==false){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<400>";
		t_oldCurrTime=this.f_currTime;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<401>";
		this.f_currTime=dbg_object(this.f_engine).f_time;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<403>";
		t_deltaTime=this.f_currTime-t_oldCurrTime;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<405>";
		if(dbg_object(this.f_engine).f_isPaused!=true && dbg_object(this).f_isPaused!=true){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<406>";
			this.f_duration-=t_deltaTime;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<407>";
			if(this.f_duration<=0){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<408>";
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<408>";
				var t_=this.f_entryList.m_ObjectEnumerator();
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<408>";
				while(t_.m_HasNext()){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<408>";
					var t_entry=t_.m_NextObject();
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<409>";
					t_entry.m_Update4(-1,dbg_object(this).f_tween);
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<411>";
				if(this.f_finishID!=0){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<412>";
					if(this.f_obj!=null){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<413>";
						this.f_engine.m_OnObjectTransition(this.f_finishID,this.f_obj);
					}else{
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<415>";
						this.f_engine.m_OnLayerTransition(this.f_finishID,this.f_layer);
					}
				}
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<418>";
				dbg_object(this).f_deleted=true;
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<420>";
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<420>";
				var t_2=this.f_entryList.m_ObjectEnumerator();
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<420>";
				while(t_2.m_HasNext()){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<420>";
					var t_entry2=t_2.m_NextObject();
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<421>";
					t_entry2.m_Update4(t_deltaTime,dbg_object(this).f_tween);
				}
			}
		}
	}
	pop_err();
}
bb_cftTrans_ftTrans.prototype.m_Clear=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<271>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<271>";
	var t_=this.f_entryList.m_ObjectEnumerator();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<271>";
	while(t_.m_HasNext()){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<271>";
		var t_entry=t_.m_NextObject();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<272>";
		dbg_object(t_entry).f_obj=null;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<273>";
		dbg_object(t_entry).f_layer=null;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<275>";
	this.f_entryList.m_Clear();
	pop_err();
}
bb_cftTrans_ftTrans.prototype.m_Cancel=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<262>";
	this.m_Clear();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<263>";
	dbg_object(this).f_transNode.m_Remove2();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<264>";
	dbg_object(this).f_transNode=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<265>";
	dbg_object(this).f_obj=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<266>";
	dbg_object(this).f_engine=null;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<267>";
	dbg_object(this).f_layer=null;
	pop_err();
}
function bb_list_List8(){
	Object.call(this);
	this.f__head=(bb_list_HeadNode8_new.call(new bb_list_HeadNode8));
}
function bb_list_List8_new(){
	push_err();
	pop_err();
	return this;
}
bb_list_List8.prototype.m_AddLast8=function(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<120>";
	var t_=bb_list_Node8_new.call(new bb_list_Node8,this.f__head,dbg_object(this.f__head).f__pred,t_data);
	pop_err();
	return t_;
}
function bb_list_List8_new2(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_=t_data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_2=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	while(t_2<t_.length){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		var t_t=dbg_array(t_,t_2)[dbg_index];
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		t_2=t_2+1;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<14>";
		this.m_AddLast8(t_t);
	}
	pop_err();
	return this;
}
bb_list_List8.prototype.m_ObjectEnumerator=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<124>";
	var t_=bb_list_Enumerator4_new.call(new bb_list_Enumerator4,this);
	pop_err();
	return t_;
}
function bb_list_Node8(){
	Object.call(this);
	this.f__succ=null;
	this.f__pred=null;
	this.f__data=null;
}
function bb_list_Node8_new(t_succ,t_pred,t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<199>";
	this.f__succ=t_succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<200>";
	this.f__pred=t_pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<201>";
	dbg_object(this.f__succ).f__pred=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<202>";
	dbg_object(this.f__pred).f__succ=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<203>";
	this.f__data=t_data;
	pop_err();
	return this;
}
function bb_list_Node8_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<196>";
	pop_err();
	return this;
}
bb_list_Node8.prototype.m_Remove2=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<212>";
	if(dbg_object(this.f__succ).f__pred!=this){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<212>";
		error("Illegal operation on removed node");
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<214>";
	dbg_object(this.f__succ).f__pred=this.f__pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<215>";
	dbg_object(this.f__pred).f__succ=this.f__succ;
	pop_err();
	return 0;
}
function bb_list_HeadNode8(){
	bb_list_Node8.call(this);
}
bb_list_HeadNode8.prototype=extend_class(bb_list_Node8);
function bb_list_HeadNode8_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<248>";
	bb_list_Node8_new2.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<249>";
	this.f__succ=(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<250>";
	this.f__pred=(this);
	pop_err();
	return this;
}
function bb_list_Enumerator4(){
	Object.call(this);
	this.f__list=null;
	this.f__curr=null;
}
function bb_list_Enumerator4_new(t_list){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<264>";
	this.f__list=t_list;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<265>";
	this.f__curr=dbg_object(dbg_object(t_list).f__head).f__succ;
	pop_err();
	return this;
}
function bb_list_Enumerator4_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<261>";
	pop_err();
	return this;
}
bb_list_Enumerator4.prototype.m_HasNext=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<269>";
	while(dbg_object(dbg_object(this.f__curr).f__succ).f__pred!=this.f__curr){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<270>";
		this.f__curr=dbg_object(this.f__curr).f__succ;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<272>";
	var t_=this.f__curr!=dbg_object(this.f__list).f__head;
	pop_err();
	return t_;
}
bb_list_Enumerator4.prototype.m_NextObject=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<276>";
	var t_data=dbg_object(this.f__curr).f__data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<277>";
	this.f__curr=dbg_object(this.f__curr).f__succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<278>";
	pop_err();
	return t_data;
}
function bb_cftTrans_ftTransEntry(){
	Object.call(this);
	this.f_timeLapsed=0.0;
	this.f_obj=null;
	this.f_typ=0;
	this.f_e_x=.0;
	this.f_e_y=.0;
	this.f_e_rot=.0;
	this.f_e_scale=.0;
	this.f_e_alpha=.0;
	this.f_s_x=.0;
	this.f_duration=.0;
	this.f_s_y=.0;
	this.f_rot=.0;
	this.f_scale=.0;
	this.f_alpha=.0;
	this.f_layer=null;
	this.f_x=.0;
	this.f_y=.0;
}
bb_cftTrans_ftTransEntry.prototype.m_Update4=function(t_delta,t_tween){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<48>";
	this.f_timeLapsed=this.f_timeLapsed+(t_delta);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<49>";
	if(this.f_obj!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<51>";
		if(t_delta==-1){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<52>";
			var t_=this.f_typ;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<53>";
			if(t_==1){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<54>";
				this.f_obj.m_SetPos(this.f_e_x,this.f_e_y,0);
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<55>";
				if(t_==2){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<56>";
					this.f_obj.m_SetAngle(this.f_e_rot,0);
				}else{
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<57>";
					if(t_==3){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<58>";
						this.f_obj.m_SetScale(this.f_e_scale,0);
					}else{
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<59>";
						if(t_==4){
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<60>";
							this.f_obj.m_SetAlpha(this.f_e_alpha,0);
						}
					}
				}
			}
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<63>";
			var t_2=this.f_typ;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<64>";
			if(t_2==1){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<67>";
				this.f_obj.m_SetPosX(dbg_object(t_tween).f_equation.m_Call(this.f_timeLapsed,this.f_s_x,this.f_e_x-this.f_s_x,this.f_duration),0);
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<68>";
				this.f_obj.m_SetPosY(dbg_object(t_tween).f_equation.m_Call(this.f_timeLapsed,this.f_s_y,this.f_e_y-this.f_s_y,this.f_duration),0);
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<69>";
				if(t_2==2){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<70>";
					this.f_obj.m_SetAngle(this.f_rot*(t_delta),1);
				}else{
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<71>";
					if(t_2==3){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<72>";
						this.f_obj.m_SetScale(this.f_scale*(t_delta),1);
					}else{
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<73>";
						if(t_2==4){
							err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<74>";
							this.f_obj.m_SetAlpha(this.f_alpha*(t_delta),1);
						}
					}
				}
			}
		}
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<78>";
		if(t_delta==-1){
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<79>";
			var t_3=this.f_typ;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<80>";
			if(t_3==1){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<81>";
				this.f_layer.m_SetPos(this.f_e_x,this.f_e_y,0);
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<84>";
				if(t_3==3){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<85>";
					this.f_layer.m_SetScale(this.f_e_scale,0);
				}else{
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<86>";
					if(t_3==4){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<87>";
						this.f_layer.m_SetAlpha(this.f_e_alpha,0);
					}
				}
			}
		}else{
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<90>";
			var t_4=this.f_typ;
			err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<91>";
			if(t_4==1){
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<92>";
				this.f_layer.m_SetPos(this.f_x*(t_delta),this.f_y*(t_delta),1);
			}else{
				err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<95>";
				if(t_4==3){
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<96>";
					this.f_layer.m_SetScale(this.f_scale*(t_delta),1);
				}else{
					err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<97>";
					if(t_4==4){
						err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftTrans.monkey<98>";
						this.f_layer.m_SetAlpha(this.f_alpha*(t_delta),1);
					}
				}
			}
		}
	}
	pop_err();
}
function bb_list_List9(){
	Object.call(this);
	this.f__head=(bb_list_HeadNode9_new.call(new bb_list_HeadNode9));
}
function bb_list_List9_new(){
	push_err();
	pop_err();
	return this;
}
bb_list_List9.prototype.m_AddLast9=function(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<120>";
	var t_=bb_list_Node9_new.call(new bb_list_Node9,this.f__head,dbg_object(this.f__head).f__pred,t_data);
	pop_err();
	return t_;
}
function bb_list_List9_new2(t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_=t_data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	var t_2=0;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
	while(t_2<t_.length){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		var t_t=dbg_array(t_,t_2)[dbg_index];
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<13>";
		t_2=t_2+1;
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<14>";
		this.m_AddLast9(t_t);
	}
	pop_err();
	return this;
}
bb_list_List9.prototype.m_ObjectEnumerator=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<124>";
	var t_=bb_list_Enumerator5_new.call(new bb_list_Enumerator5,this);
	pop_err();
	return t_;
}
bb_list_List9.prototype.m_Clear=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<36>";
	dbg_object(this.f__head).f__succ=this.f__head;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<37>";
	dbg_object(this.f__head).f__pred=this.f__head;
	pop_err();
	return 0;
}
function bb_list_Node9(){
	Object.call(this);
	this.f__succ=null;
	this.f__pred=null;
	this.f__data=null;
}
function bb_list_Node9_new(t_succ,t_pred,t_data){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<199>";
	this.f__succ=t_succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<200>";
	this.f__pred=t_pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<201>";
	dbg_object(this.f__succ).f__pred=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<202>";
	dbg_object(this.f__pred).f__succ=this;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<203>";
	this.f__data=t_data;
	pop_err();
	return this;
}
function bb_list_Node9_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<196>";
	pop_err();
	return this;
}
function bb_list_HeadNode9(){
	bb_list_Node9.call(this);
}
bb_list_HeadNode9.prototype=extend_class(bb_list_Node9);
function bb_list_HeadNode9_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<248>";
	bb_list_Node9_new2.call(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<249>";
	this.f__succ=(this);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<250>";
	this.f__pred=(this);
	pop_err();
	return this;
}
function bb_list_Enumerator5(){
	Object.call(this);
	this.f__list=null;
	this.f__curr=null;
}
function bb_list_Enumerator5_new(t_list){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<264>";
	this.f__list=t_list;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<265>";
	this.f__curr=dbg_object(dbg_object(t_list).f__head).f__succ;
	pop_err();
	return this;
}
function bb_list_Enumerator5_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<261>";
	pop_err();
	return this;
}
bb_list_Enumerator5.prototype.m_HasNext=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<269>";
	while(dbg_object(dbg_object(this.f__curr).f__succ).f__pred!=this.f__curr){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<270>";
		this.f__curr=dbg_object(this.f__curr).f__succ;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<272>";
	var t_=this.f__curr!=dbg_object(this.f__list).f__head;
	pop_err();
	return t_;
}
bb_list_Enumerator5.prototype.m_NextObject=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<276>";
	var t_data=dbg_object(this.f__curr).f__data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<277>";
	this.f__curr=dbg_object(this.f__curr).f__succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<278>";
	pop_err();
	return t_data;
}
function bb_cftTween_Tween(){
	Object.call(this);
	this.f_equation=null;
}
function bb_cftTween_TweenEquationCall(){
	Object.call(this);
}
bb_cftTween_TweenEquationCall.prototype.m_Call=function(t_t,t_b,t_c,t_d){
}
function bb_list_Enumerator6(){
	Object.call(this);
	this.f__list=null;
	this.f__curr=null;
}
function bb_list_Enumerator6_new(t_list){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<264>";
	this.f__list=t_list;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<265>";
	this.f__curr=dbg_object(dbg_object(t_list).f__head).f__succ;
	pop_err();
	return this;
}
function bb_list_Enumerator6_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<261>";
	pop_err();
	return this;
}
bb_list_Enumerator6.prototype.m_HasNext=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<269>";
	while(dbg_object(dbg_object(this.f__curr).f__succ).f__pred!=this.f__curr){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<270>";
		this.f__curr=dbg_object(this.f__curr).f__succ;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<272>";
	var t_=this.f__curr!=dbg_object(this.f__list).f__head;
	pop_err();
	return t_;
}
bb_list_Enumerator6.prototype.m_NextObject=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<276>";
	var t_data=dbg_object(this.f__curr).f__data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<277>";
	this.f__curr=dbg_object(this.f__curr).f__succ;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<278>";
	pop_err();
	return t_data;
}
function bb_list_BackwardsList2(){
	Object.call(this);
	this.f__list=null;
}
function bb_list_BackwardsList2_new(t_list){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<291>";
	this.f__list=t_list;
	pop_err();
	return this;
}
function bb_list_BackwardsList2_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<288>";
	pop_err();
	return this;
}
bb_list_BackwardsList2.prototype.m_ObjectEnumerator=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<295>";
	var t_=bb_list_BackwardsEnumerator2_new.call(new bb_list_BackwardsEnumerator2,this.f__list);
	pop_err();
	return t_;
}
function bb_list_BackwardsEnumerator2(){
	Object.call(this);
	this.f__list=null;
	this.f__curr=null;
}
function bb_list_BackwardsEnumerator2_new(t_list){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<307>";
	this.f__list=t_list;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<308>";
	this.f__curr=dbg_object(dbg_object(t_list).f__head).f__pred;
	pop_err();
	return this;
}
function bb_list_BackwardsEnumerator2_new2(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<304>";
	pop_err();
	return this;
}
bb_list_BackwardsEnumerator2.prototype.m_HasNext=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<312>";
	while(dbg_object(dbg_object(this.f__curr).f__pred).f__succ!=this.f__curr){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<313>";
		this.f__curr=dbg_object(this.f__curr).f__pred;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<315>";
	var t_=this.f__curr!=dbg_object(this.f__list).f__head;
	pop_err();
	return t_;
}
bb_list_BackwardsEnumerator2.prototype.m_NextObject=function(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<319>";
	var t_data=dbg_object(this.f__curr).f__data;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<320>";
	this.f__curr=dbg_object(this.f__curr).f__pred;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/list.monkey<321>";
	pop_err();
	return t_data;
}
function bb_cftWaypoints_ftMarker(){
	Object.call(this);
}
function bb_cftMisc_tPointS(){
	Object.call(this);
	this.f_x=.0;
	this.f_y=.0;
}
function bb_cftMisc_tPointS_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftMisc.monkey<50>";
	pop_err();
	return this;
}
function bb_cftMisc_tLine2D(){
	Object.call(this);
	this.f_p1=null;
	this.f_p2=null;
}
function bb_cftMisc_tLine2D_new(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftMisc.monkey<60>";
	this.f_p1=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftMisc.monkey<61>";
	this.f_p2=bb_cftMisc_tPointS_new.call(new bb_cftMisc_tPointS);
	pop_err();
	return this;
}
function bb_math_Abs(t_x){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<46>";
	if(t_x>=0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<46>";
		pop_err();
		return t_x;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<47>";
	var t_=-t_x;
	pop_err();
	return t_;
}
function bb_math_Abs2(t_x){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<73>";
	if(t_x>=0.0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<73>";
		pop_err();
		return t_x;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<74>";
	var t_=-t_x;
	pop_err();
	return t_;
}
function bb_math_Min(t_x,t_y){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<51>";
	if(t_x<t_y){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<51>";
		pop_err();
		return t_x;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<52>";
	pop_err();
	return t_y;
}
function bb_math_Min2(t_x,t_y){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<78>";
	if(t_x<t_y){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<78>";
		pop_err();
		return t_x;
	}
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/monkey/math.monkey<79>";
	pop_err();
	return t_y;
}
function bb_input_MouseHit(t_button){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/input.monkey<104>";
	var t_=bb_input_device.KeyHit(1+t_button);
	pop_err();
	return t_;
}
function bb_input_KeyHit(t_key){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/input.monkey<77>";
	var t_=bb_input_device.KeyHit(t_key);
	pop_err();
	return t_;
}
function bb_graphics_DebugRenderDevice(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<269>";
	if(!((bb_graphics_renderDevice)!=null)){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<269>";
		error("Rendering operations can only be performed inside OnRender");
	}
	pop_err();
	return 0;
}
function bb_graphics_Cls(t_r,t_g,t_b){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<426>";
	bb_graphics_DebugRenderDevice();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<428>";
	bb_graphics_renderDevice.Cls(t_r,t_g,t_b);
	pop_err();
	return 0;
}
function bb_graphics_PushMatrix(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<382>";
	var t_sp=dbg_object(bb_graphics_context).f_matrixSp;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<383>";
	dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+0)[dbg_index]=dbg_object(bb_graphics_context).f_ix
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<384>";
	dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+1)[dbg_index]=dbg_object(bb_graphics_context).f_iy
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<385>";
	dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+2)[dbg_index]=dbg_object(bb_graphics_context).f_jx
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<386>";
	dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+3)[dbg_index]=dbg_object(bb_graphics_context).f_jy
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<387>";
	dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+4)[dbg_index]=dbg_object(bb_graphics_context).f_tx
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<388>";
	dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+5)[dbg_index]=dbg_object(bb_graphics_context).f_ty
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<389>";
	dbg_object(bb_graphics_context).f_matrixSp=t_sp+6;
	pop_err();
	return 0;
}
function bb_graphics_Transform(t_ix,t_iy,t_jx,t_jy,t_tx,t_ty){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<403>";
	var t_ix2=t_ix*dbg_object(bb_graphics_context).f_ix+t_iy*dbg_object(bb_graphics_context).f_jx;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<404>";
	var t_iy2=t_ix*dbg_object(bb_graphics_context).f_iy+t_iy*dbg_object(bb_graphics_context).f_jy;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<405>";
	var t_jx2=t_jx*dbg_object(bb_graphics_context).f_ix+t_jy*dbg_object(bb_graphics_context).f_jx;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<406>";
	var t_jy2=t_jx*dbg_object(bb_graphics_context).f_iy+t_jy*dbg_object(bb_graphics_context).f_jy;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<407>";
	var t_tx2=t_tx*dbg_object(bb_graphics_context).f_ix+t_ty*dbg_object(bb_graphics_context).f_jx+dbg_object(bb_graphics_context).f_tx;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<408>";
	var t_ty2=t_tx*dbg_object(bb_graphics_context).f_iy+t_ty*dbg_object(bb_graphics_context).f_jy+dbg_object(bb_graphics_context).f_ty;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<409>";
	bb_graphics_SetMatrix(t_ix2,t_iy2,t_jx2,t_jy2,t_tx2,t_ty2);
	pop_err();
	return 0;
}
function bb_graphics_Transform2(t_m){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<399>";
	bb_graphics_Transform(dbg_array(t_m,0)[dbg_index],dbg_array(t_m,1)[dbg_index],dbg_array(t_m,2)[dbg_index],dbg_array(t_m,3)[dbg_index],dbg_array(t_m,4)[dbg_index],dbg_array(t_m,5)[dbg_index]);
	pop_err();
	return 0;
}
function bb_graphics_Translate(t_x,t_y){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<413>";
	bb_graphics_Transform(1.0,0.0,0.0,1.0,t_x,t_y);
	pop_err();
	return 0;
}
function bb_graphics_Scale(t_x,t_y){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<417>";
	bb_graphics_Transform(t_x,0.0,0.0,t_y,0.0,0.0);
	pop_err();
	return 0;
}
function bb_graphics_Rotate(t_angle){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<421>";
	bb_graphics_Transform(Math.cos((t_angle)*D2R),-Math.sin((t_angle)*D2R),Math.sin((t_angle)*D2R),Math.cos((t_angle)*D2R),0.0,0.0);
	pop_err();
	return 0;
}
function bb_cftMisc_RotateDisplay(t_X,t_Y,t_angle){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftMisc.monkey<41>";
	bb_graphics_Translate(t_X,t_Y);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftMisc.monkey<42>";
	bb_graphics_Rotate(t_angle);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/fantomEngine/cftMisc.monkey<43>";
	bb_graphics_Translate(-t_X,-t_Y);
	pop_err();
}
function bb_graphics_ValidateMatrix(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<262>";
	if((dbg_object(bb_graphics_context).f_matDirty)!=0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<263>";
		dbg_object(bb_graphics_context).f_device.SetMatrix(dbg_object(bb_graphics_context).f_ix,dbg_object(bb_graphics_context).f_iy,dbg_object(bb_graphics_context).f_jx,dbg_object(bb_graphics_context).f_jy,dbg_object(bb_graphics_context).f_tx,dbg_object(bb_graphics_context).f_ty);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<264>";
		dbg_object(bb_graphics_context).f_matDirty=0;
	}
	pop_err();
	return 0;
}
function bb_graphics_DrawPoint(t_x,t_y){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<433>";
	bb_graphics_DebugRenderDevice();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<435>";
	bb_graphics_ValidateMatrix();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<436>";
	bb_graphics_renderDevice.DrawPoint(t_x,t_y);
	pop_err();
	return 0;
}
function bb_graphics_DrawCircle(t_x,t_y,t_r){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<465>";
	bb_graphics_DebugRenderDevice();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<467>";
	bb_graphics_ValidateMatrix();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<468>";
	bb_graphics_renderDevice.DrawOval(t_x-t_r,t_y-t_r,t_r*2.0,t_r*2.0);
	pop_err();
	return 0;
}
function bb_graphics_DrawLine(t_x1,t_y1,t_x2,t_y2){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<449>";
	bb_graphics_DebugRenderDevice();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<451>";
	bb_graphics_ValidateMatrix();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<452>";
	bb_graphics_renderDevice.DrawLine(t_x1,t_y1,t_x2,t_y2);
	pop_err();
	return 0;
}
function bb_graphics_PopMatrix(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<393>";
	var t_sp=dbg_object(bb_graphics_context).f_matrixSp-6;
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<394>";
	bb_graphics_SetMatrix(dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+0)[dbg_index],dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+1)[dbg_index],dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+2)[dbg_index],dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+3)[dbg_index],dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+4)[dbg_index],dbg_array(dbg_object(bb_graphics_context).f_matrixStack,t_sp+5)[dbg_index]);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<395>";
	dbg_object(bb_graphics_context).f_matrixSp=t_sp;
	pop_err();
	return 0;
}
function bb_graphics_DrawOval(t_x,t_y,t_w,t_h){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<457>";
	bb_graphics_DebugRenderDevice();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<459>";
	bb_graphics_ValidateMatrix();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<460>";
	bb_graphics_renderDevice.DrawOval(t_x,t_y,t_w,t_h);
	pop_err();
	return 0;
}
function bb_graphics_DrawPoly(t_verts){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<481>";
	bb_graphics_DebugRenderDevice();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<483>";
	bb_graphics_ValidateMatrix();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<484>";
	bb_graphics_renderDevice.DrawPoly(t_verts);
	pop_err();
	return 0;
}
function bb_graphics_DrawImageRect(t_image,t_x,t_y,t_srcX,t_srcY,t_srcWidth,t_srcHeight,t_frame){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<545>";
	bb_graphics_DebugRenderDevice();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<547>";
	var t_f=dbg_array(dbg_object(t_image).f_frames,t_frame)[dbg_index];
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<549>";
	if((dbg_object(bb_graphics_context).f_tformed)!=0){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<550>";
		bb_graphics_PushMatrix();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<553>";
		bb_graphics_Translate(-dbg_object(t_image).f_tx+t_x,-dbg_object(t_image).f_ty+t_y);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<555>";
		bb_graphics_ValidateMatrix();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<557>";
		dbg_object(bb_graphics_context).f_device.DrawSurface2(dbg_object(t_image).f_surface,0.0,0.0,t_srcX+dbg_object(t_f).f_x,t_srcY+dbg_object(t_f).f_y,t_srcWidth,t_srcHeight);
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<559>";
		bb_graphics_PopMatrix();
	}else{
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<561>";
		bb_graphics_ValidateMatrix();
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<563>";
		dbg_object(bb_graphics_context).f_device.DrawSurface2(dbg_object(t_image).f_surface,-dbg_object(t_image).f_tx+t_x,-dbg_object(t_image).f_ty+t_y,t_srcX+dbg_object(t_f).f_x,t_srcY+dbg_object(t_f).f_y,t_srcWidth,t_srcHeight);
	}
	pop_err();
	return 0;
}
function bb_graphics_DrawImageRect2(t_image,t_x,t_y,t_srcX,t_srcY,t_srcWidth,t_srcHeight,t_rotation,t_scaleX,t_scaleY,t_frame){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<569>";
	bb_graphics_DebugRenderDevice();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<571>";
	var t_f=dbg_array(dbg_object(t_image).f_frames,t_frame)[dbg_index];
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<573>";
	bb_graphics_PushMatrix();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<575>";
	bb_graphics_Translate(t_x,t_y);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<576>";
	bb_graphics_Rotate(t_rotation);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<577>";
	bb_graphics_Scale(t_scaleX,t_scaleY);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<578>";
	bb_graphics_Translate(-dbg_object(t_image).f_tx,-dbg_object(t_image).f_ty);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<580>";
	bb_graphics_ValidateMatrix();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<582>";
	dbg_object(bb_graphics_context).f_device.DrawSurface2(dbg_object(t_image).f_surface,0.0,0.0,t_srcX+dbg_object(t_f).f_x,t_srcY+dbg_object(t_f).f_y,t_srcWidth,t_srcHeight);
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<584>";
	bb_graphics_PopMatrix();
	pop_err();
	return 0;
}
function bb_cftTileMap_ftMapTile(){
	Object.call(this);
	this.f_xOff=.0;
	this.f_yOff=.0;
	this.f_tileID=0;
}
function bb_graphics_DrawRect(t_x,t_y,t_w,t_h){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<441>";
	bb_graphics_DebugRenderDevice();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<443>";
	bb_graphics_ValidateMatrix();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/graphics.monkey<444>";
	bb_graphics_renderDevice.DrawRect(t_x,t_y,t_w,t_h);
	pop_err();
	return 0;
}
function bb_audio_ChannelState(t_channel){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<85>";
	var t_=bb_audio_device.ChannelState(t_channel);
	pop_err();
	return t_;
}
function bb_audio_PlaySound(t_sound,t_channel,t_flags){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<69>";
	if((dbg_object(t_sound).f_sample)!=null){
		err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<69>";
		bb_audio_device.PlaySample(dbg_object(t_sound).f_sample,t_channel,t_flags);
	}
	pop_err();
	return 0;
}
function bb_audio_SetChannelVolume(t_channel,t_volume){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<89>";
	bb_audio_device.SetVolume(t_channel,t_volume);
	pop_err();
	return 0;
}
function bb_audio_SetChannelPan(t_channel,t_pan){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<93>";
	bb_audio_device.SetPan(t_channel,t_pan);
	pop_err();
	return 0;
}
function bb_audio_SetChannelRate(t_channel,t_rate){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<97>";
	bb_audio_device.SetRate(t_channel,t_rate);
	pop_err();
	return 0;
}
function bb_audio_PlayMusic(t_path,t_flags){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<101>";
	var t_=bb_audio_device.PlayMusic(t_path,t_flags);
	pop_err();
	return t_;
}
function bb_audio_SetMusicVolume(t_volume){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<121>";
	bb_audio_device.SetMusicVolume(t_volume);
	pop_err();
	return 0;
}
function bb_input_MouseX(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/input.monkey<92>";
	var t_=bb_input_device.MouseX();
	pop_err();
	return t_;
}
function bb_audio_StopChannel(t_channel){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<73>";
	bb_audio_device.StopChannel(t_channel);
	pop_err();
	return 0;
}
function bb_audio_StopMusic(){
	push_err();
	err_info="C:/Users/Seb/Documents/Programmation/Monkey/modules/mojo/audio.monkey<105>";
	bb_audio_device.StopMusic();
	pop_err();
	return 0;
}
function bbInit(){
	bb_graphics_context=null;
	bb_input_device=null;
	bb_audio_device=null;
	bb_app_device=null;
	bb_breakOut_g=null;
	bb_graphics_Image_DefaultFlags=0;
	bb_graphics_renderDevice=null;
}
//${TRANSCODE_END}
