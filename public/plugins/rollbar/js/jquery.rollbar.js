/*
  
  RollBar - jQuery ScrollBar Plugin
  -----------------------------------------------
  
  @author   flGravity
  @created  4/4/12
  @version  1.6
  @site     http://codecanyon.net/user/flGravity
  
*/

(function($){
  	//RollBar constructor
  	function RollBar(c,s){
  		this.container = $(c);
  		this.settings = s;
  		this.timer = 0;
  		this.before = {'v':0,'h':0};
  		this.touch = {}; //touch point
  		this.pressed = 0; //1-vertical, 2-horizontal, 0-off
    	this.vslider = $('<div/>',{'class':'rollbar-handle'});
    	this.vpath = $('<div/>',{'class':'rollbar-path-vertical'});
    	this.hslider = $('<div/>',{'class':'rollbar-handle'});
    	this.hpath = $('<div/>',{'class':'rollbar-path-horizontal'});
    	this.sliders = this.vslider.add(this.hslider);

		//wrap content into "rollbar-content" div
    	this.container.css({'position':'relative','overflow':'hidden'}).
    	contents().filter(this.settings.contentFilter).wrapAll('<div class="rollbar-content"></div>');
    	this.content = this.container.children('.rollbar-content').
    	css({'position':'relative','top':0,'left':0,'overflow':'hidden'});
    	
    	//create scrollbars
    	if(this.settings.scroll == 'horizontal'){
    		this.container.prepend(this.hpath.append(this.hslider));
    	}else if(this.settings.scroll == 'vertical'){
    		this.container.prepend(this.vpath.append(this.vslider));
    	}else{
    		this.container.prepend(this.vpath.append(this.vslider),this.hpath.append(this.hslider));
    	}
		    	
    	//configure sliders and paths
    	this.vpath.add(this.hpath).css({'z-index':this.settings.zIndex,'display':'none'});	
    	this.vslider.css({'height':this.settings.sliderSize,'opacity':this.settings.sliderOpacity});
    	this.hslider.css({'width':this.settings.sliderSize,'opacity':this.settings.sliderOpacity});
    	
    	//configure slider mousehover effects
    	if(this.settings.sliderOpacity){
    		this.sliders.hover(this.fixFn(function(){
    				this.sliders.stop().fadeTo(this.settings.sliderOpacityTime,1);
    			}),this.fixFn(function(){
    				if(!this.pressed){
    					this.sliders.stop().fadeTo(this.settings.sliderOpacityTime,this.settings.sliderOpacity);
    				}
    		}));
    	}
    	    	
    	//init
    	this.init();
    	
       	//set initial scrollbars size
       	this.pathSize();
       	    	
    	//when all images are loaded run checkScroll 
    	this.bindEvent($(window),'load',function(){
    		setTimeout(this.fixFn(this.checkScroll),10);
    	});
    	
    	//check if scrollbars are needed for lazy content (like ajax)
    	if(this.settings.lazyCheckScroll > 0){
    		setInterval(this.fixFn(function(){
    			this.checkScroll();
    			this.pathSize();
    		}),this.settings.lazyCheckScroll);
    	}
  	}
  	
  	
  	//check if scrollbars are required (second time is called on window.load)
  	RollBar.prototype.checkScroll  = function(){
  		//get initial dimentions (change during window resize)
    	this.vtrack = this.vpath.height()-this.vslider.height();
		this.htrack = this.hpath.width()-this.hslider.width();
		this.vdiff = this.content.height()-this.container.height();
		this.hdiff = this.content.width()-this.container.width();
						
		//return if scrollbars should be always visible
		if(!this.settings.autoHide) return; 
		
		//show/hide vertical scrollbar
		if(this.vdiff > 0){
			this.vpath.fadeIn(this.settings.autoHideTime);
		}else{
			this.vpath.fadeOut(this.settings.autoHideTime);
		}
		
		//show/hide horizontal scrollbar
		if(this.hdiff > 0){
			this.hpath.fadeIn(this.settings.autoHideTime);
		}else{
			this.hpath.fadeOut(this.settings.autoHideTime);
		}
	};
	
	
	//adjust path size and paddings
	RollBar.prototype.pathSize = function(){
		var pad = parseInt(this.settings.pathPadding,10);
		this.vpath.css({'top':pad+'px','height':this.container.height()-2*pad+'px'});
		this.hpath.css({'left':pad+'px','width':this.container.width()-2*pad+'px'}); 
	};
	
	
	// main scroll method (v,h are absolute slider positions, e is event) 
	RollBar.prototype.scroll = function(v,h,e){

		var hs = 0; var vs = 0;
		//vertical slider scroll
		if(v < 0){ v = 0; }
		if(v > this.vtrack){ v = this.vtrack; }
		this.vslider.css('top',v+'px');
		
		//horizontal slider scroll
		if(h < 0){ h = 0; }
		if(h > this.htrack ){ h = this.htrack; }
		this.hslider.css('left',h+'px');
		
		//vertical content scroll
		if(this.vdiff > 0){
    		vs = v/this.vtrack;
		  	this.content.css('top',Math.round(-this.vdiff*vs));
		  	//prevent defaults on mouse wheel 
		  	if(e && (v && v != this.vtrack)){
		  		e.stopPropagation();
				e.preventDefault();
		  	}
	  	}
	  	
	  	//horizontal content scroll
	  	if(this.hdiff > 0){
		  	hs = h/this.htrack;
		  	this.content.css('left',Math.round(-this.hdiff*hs));
		  	//prevent defaults on mouse wheel 
		  	if(e && (h && h != this.htrack)){
		  		e.stopPropagation();
				e.preventDefault();
		  	}
	  	}
	  		  	
	  	//callback functions
	  	if(this.before.v != vs || this.before.h != hs){
	  		if(typeof this.settings.onscroll == 'function'){
	  			this.settings.onscroll.call(this.container.get(0),vs,hs);
	  		}
	  		this.before.v=vs; this.before.h=hs;
	  	}
	};
    
    
    //adds easing to the scroll() method (v,h are offset from current slider position)
    RollBar.prototype.easeScroll = function(v,h){
		var n = 0;
		var steps = Math.floor(this.settings.scrollTime/this.settings.scrollInterval);
		var vs = this.vslider.position().top; 
		var hs = this.hslider.position().left;				
		var easing = $.easing[this.settings.scrollEasing] || $.easing.linear;
		this.sliders.stop().fadeTo(this.settings.sliderOpacityTime,1);
		window.clearInterval(this.timer);
		//var start = (new Date).getTime();
		this.timer = window.setInterval(this.fixFn(function(){
			this.scroll(vs+easing(n/steps,n,0,1,steps)*v,hs+easing(n/steps,n,0,1,steps)*h);
			if(++n > steps){ 
				//console.logs('Time: '+((new Date).getTime()-start)+' / '+this.settings.scrollTime);
				window.clearInterval(this.timer); 
				this.sliders.stop().fadeTo(this.settings.sliderOpacityTime,this.settings.sliderOpacity);
			}
		}),this.settings.scrollInterval);
	};
	
	
	//replaces 'this' keyword in function to the RollBar object
	RollBar.prototype.fixFn = function(f,s){
		var scope = this;
		return function(){
			f.apply(s||scope,Array.prototype.slice.call(arguments));
		}
	};
	
	
	//wrapper for jQuery .bind() function using fixFn
	RollBar.prototype.bindEvent = function(t,e,f,s){
		return t.bind(e,this.fixFn(f,s));
	};
	
	
	//init event listeners
	RollBar.prototype.init = function(){
		var document = $(window.document);		
    	//slider drag with mouse
    	this.bindEvent(this.sliders,'mousedown',function(e){
    		this.pressed = (e.target === this.vslider.get(0))?1:2;
    		var hclick = e.pageX;
    		var vclick = e.pageY;
    		var vtop = this.vslider.position().top; 
    		var hleft = this.hslider.position().left;
    		this.bindEvent(document,'mousemove',function(e){
    			if(this.pressed == 1){
    				this.scroll(vtop + (e.pageY - vclick), hleft);
    			}else{
    				this.scroll(vtop, hleft + (e.pageX - hclick));
    			}
       		});
    		//prevent selection while moving slider
    		this.bindEvent(document,'selectstart',function(e){e.preventDefault()});
    	});
    	
    	
    	this.bindEvent(document,'mouseup',function(e){
    		//change opacity of slider only if we released mouse outside of it    		
    		if(this.pressed == 1 && e.target !== this.vslider.get(0)){
    			this.vslider.fadeTo(this.settings.sliderOpacityTime,this.settings.sliderOpacity);
    		}else if(this.pressed == 2 && e.target !== this.hslider.get(0)){
    			this.hslider.fadeTo(this.settings.sliderOpacityTime,this.settings.sliderOpacity);
    		}
    		this.pressed = 0;
    		document.unbind('mousemove');
    		document.unbind('selectstart');
    	});
    	
    	
    	//Android & iOS touch events  	
	   	this.bindEvent(this.container,'touchstart',function(e){
	   		var event = e.originalEvent;
	   		var touch = event.changedTouches[0];
	   		this.touch.sx = touch.pageX;
	   		this.touch.sy = touch.pageY;
	   		this.touch.sv = this.vslider.position().top;
	   		this.touch.sh = this.hslider.position().left;
	   		this.sliders.stop().fadeTo(this.settings.sliderOpacityTime,1);
	   		if(this.settings.blockGlobalScroll && (this.vdiff || this.hdiff)){
	   			event.stopPropagation();
	   		}
    	});
    	
    	this.bindEvent(this.container,'touchmove',function(e){
    		var event = e.originalEvent;
    		var touch = event.targetTouches[0];
    		this.scroll(this.touch.sv+(this.touch.sy-touch.pageY)*this.settings.touchSpeed,
    					this.touch.sh+(this.touch.sx-touch.pageX)*this.settings.touchSpeed,e);
    		if(this.settings.blockGlobalScroll && (this.vdiff || this.hdiff)){
	    		event.preventDefault();
	    		event.stopPropagation();
    		}
    	});
    	
    	this.bindEvent(this.container,'touchend touchcancel',function(e){
    		var event = e.originalEvent;
	   		var touch = event.changedTouches[0];
    		this.sliders.stop().fadeTo(this.settings.sliderOpacityTime,this.settings.sliderOpacity);
    		if(this.settings.blockGlobalScroll && (this.vdiff || this.hdiff)){
	   			event.stopPropagation();
	   		}
    	});
    	
    	
    	//slider position adjustments during window resize     	
		var vtrack = this.vpath.height(), htrack = this.hpath.width();
    	this.bindEvent($(window),'resize',function(){

    	   	this.pathSize(); //adjust path size first
    	   	this.checkScroll(); //calculate diffs    	   	
    	   	
    	   	if(this.vdiff <= 0) {
    	   		this.content.css('top',0);
    	   	}
    	   	
    	   	if(this.hdiff <= 0){
    	   		this.content.css('left',0);
    	   	}
    	   	
    	   	this.scroll(Math.round(parseInt(this.vslider.css('top'),10)*this.vpath.height()/vtrack),
    	   				Math.round(parseInt(this.hslider.css('left'),10)*this.hpath.width()/htrack));
    		
    		vtrack = this.vpath.height();
    		htrack = this.hpath.width();
    	}); 
    	
    	//slider move on mousewheel
    	this.bindEvent(this.container,'mousewheel',function(e,delta,deltaX,deltaY){
    		//don't scroll container if mouse is within "textarea" or "select" elements
    		var targetNode = e.target.nodeName;
    		if(targetNode == 'TEXTAREA' || (targetNode == 'SELECT' || targetNode == 'OPTION')) {
    			e.stopPropagation();
    			return;
    		}
    		//scroll content
    		this.scroll(this.vslider.position().top - this.settings.wheelSpeed * deltaY, 
    			   		this.hslider.position().left + this.settings.wheelSpeed * deltaX, e);
    		//highlight scroll handle
    		this.sliders.stop().fadeTo(this.settings.sliderOpacityTime,1);
			window.clearTimeout(this.timer);
			this.timer = window.setTimeout(this.fixFn(function(){
				this.sliders.stop().fadeTo(this.settings.sliderOpacityTime,this.settings.sliderOpacity);
			}),this.settings.sliderOpacityDelay);
			//always prevent global page scroll if we scroll within container
			if(this.settings.blockGlobalScroll && (this.vdiff || this.hdiff)){
				e.preventDefault();
				e.stopPropagation();
			}
    	});
    	
    	
    	//keypress scroll with easing
    	this.bindEvent(document,'keydown',function(e){
    		var hkey=0, vkey=0;
    		//38-key up, 40-key down, 39-key right, 37-key left
    		vkey = (e.keyCode == 38)?-this.settings.keyScroll:vkey;
    		vkey = (e.keyCode == 40)?this.settings.keyScroll:vkey;
    		hkey = (e.keyCode == 37)?-this.settings.keyScroll:hkey;
    		hkey = (e.keyCode == 39)?this.settings.keyScroll:hkey;
			if(vkey || hkey){
				this.easeScroll(vkey,hkey);
    		}
    		// prevent page scroll
    		//e.preventDefault();
    	});

    	
    	//block "drag" events in FireFox
    	this.bindEvent(this.container,"dragstart",function(e){
    		e.preventDefault();
    	});
    	
    	
    	//create custom 'rollbar' event handler 
    	this.bindEvent(this.container,'rollbar',function(e,v,h,px){
    		//stop event propagation
    		e.stopPropagation();
    		//special (reset) code
    		if(v === 'reset'){
    			this.container.find('.rollbar-content, .rollbar-handle').css({top:0,left:0});
    			return;
    		}
    		//translate position in document to slider offset 
    		//required by easeScroll() function
    		v = v || 0; h = h || 0;
    		if(/^[-\d\.]+$/.test(v)){
	    		v = parseFloat(v);
	    		if(Math.abs(v) <= 1 && !px){
	    			v *= this.vtrack;
	    		}else{
	    			//slider position
	    			v = v + v*(this.vtrack/this.vdiff-1);
	    		}
    		}
    		
    		if(/^[-\d\.]+$/.test(h)){
	    		h = parseFloat(h);
	    		if(Math.abs(h) <= 1 && !px){
	    			h *= this.htrack;
	    		}else{
	    			//slider position
	    			h = h + h*(this.htrack/this.hdiff-1);
	    		}
    		}
    		//scroll
    		this.easeScroll(v,h);
       	});
   	};


  //jquery plugin
  $.fn.rollbar = function(s){
  	//defaults
  	var settings = {
  		scroll: 'both',				// add 'vertical', 'horizontal' scrolling or 'both'
  		autoHide: true,				// automatically hide scrollbars if not needed 
  		autoHideTime: 'fast',		// time to hide scrollbars
  		lazyCheckScroll: 1000,		// check content size every NN milliseconds
  		blockGlobalScroll: false,	// always prevent global page scroll from container
  		contentFilter: '*',			// jquery selector to filter elements for scroll
  		sliderSize: '30%',			// % or pixel value for slider size
  		sliderOpacity: 0.5,			// initial opacity for sliders
  		sliderOpacityTime: 200,		// sliders mouse hover time in ms
  		sliderOpacityDelay: 1000,	// delay before opacity change during mouse wheel
  		wheelSpeed: 20,				// content scroll speed on mouse wheel (0 to 100)
  		touchSpeed: 0.3,			// Android/iOS speed multiplier
  		pathPadding: '20px',		// scrollbar path padding 
  		keyScroll: 100,				// amount of pixels to scroll when key is pressed
  		scrollTime: 500,			// scroll time (keypress, touch, "rollbar" ) in ms
  		scrollInterval: 15,			// scroll easing interval in ms (~fps)	
  		scrollEasing: 'swing',		// any valid easing (default linear)
  		zIndex: 100,				// scrollbars css z-index stacking number
  		onscroll: function(){}		// onscroll callback function (vs, hs)
  	};

  	//extend defaults with external settings
  	$.extend(settings,s);
  	
  	//create RollBar object for every element in list
    return this.each(function(){    	
    	new RollBar(this,settings);
    }); 
  }; //end plugin
  
})(jQuery);

