(function($){	
	//
	$.fn.banner = function( method )
	{
		//
		var defaults =
		{
			time							: 3,
			timeFade						: .5,
			overHandler						: false,//	pausar banner ao passar o mouse por cima
			//métodos
			onSlideChange					: function(){}
		};
		
		var methods =
		{
			init :												function( options ){ 			return this.each(function(){	setConfig(this, options);});},
			stopBanner :										function( options ){ 			return this.each(function(){	pauseBanner();});},
			playBanner :										function( options ){ 			return this.each(function(){	playBanner();});},
			nextBanner :										function( options ){ 			return this.each(function(){	nextBanner();});},
			previousBanner :									function( options ){ 			return this.each(function(){	previousBanner();});}
		};
		
		var overHandler;
		var time;
		var timeFade;
		var statusTransition;
		var slider_timer;
		var itemAtivo;
		var $containerBanner;
		var $contentBanner;
		var $containerNav;
		var $contentNav;
		var $btNext;
		var $btPrevious;
		var plugin_settings;
		var plugin_element;
		
		// Method calling logic
		if ( methods[method] )//caso exista um método, esse método é chamado
		{
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		}
		else if ( typeof method === 'object' || ! method )//caso não exista um método ou seja apenas passado o objeto
		{
			return methods.init.apply( this, arguments );
		}
		else//caso o método não exista
		{
		  $.error( 'Method ' +  method + ' does not exist on jQuery.banner' );
		} 
			
		function setConfig($this, options)
		{
			plugin_element 						= $($this);
			plugin_settings 					= $.extend({},defaults, options);	
						
			if(plugin_element.size()>0){	init();}
		}//	fim setConfig
		
		//-------------------------------------------------------------------------
		//--
		//-------------------------------------------------------------------------
		function init()
		{
			time = plugin_settings.time; 
			timeFade = plugin_settings.timeFade; 
			statusTransition = plugin_settings.statusTransition; 
			overHandler = plugin_settings.overHandler;
			progressBar = plugin_settings.progressBar;
			
			$containerBanner = plugin_element;
			$contentBanner = $('> .item', $containerBanner);
			$containerNav = $('.box-nav',$containerBanner);
			$contentNav = $('a.bullet', $containerNav);
			$btNext = $('.setaDir', $containerNav);
			$btPrevious = $('.setaEsq', $containerNav);
			
			itemAtivo = 0;
			setFirstItemAtivo(itemAtivo);
			
			if($contentBanner.size()>1){
				autoBanner();
			}else{
				$containerNav.hide();
			}
			
			initNav ();
			//se a propriedade overHandler for igual a /true/ libera os 
			//eventos para quando se passar o mouse por cima do banner
			if(overHandler && $contentBanner.size()>1){
				//pausa o banner com o mouse por cima dele
				$($contentBanner).mouseenter(function(){
                    if($contentBanner.size()>1) {
                        pauseBanner();
                        $(".pause-msg", $containerBanner).fadeIn(400);
                    }
				});
				
				//inicia o banner ao sair com o mouse sobre ele
				$($contentBanner).mouseleave(function(){
                    if($contentBanner.size()>1) {
                        playBanner();
                        $(".pause-msg", $containerBanner).fadeOut(400);
                    }
				});
			}
				
		}//	fim init
			
		//-------------------------------------------------------------------------
		//-- inicia o banner
		//-------------------------------------------------------------------------
		function autoBanner () {
			pauseBanner ();//	remove o timer
			//	checa se existe o time específico do item
			var _timeItem = ($('.ativo', $containerBanner).attr('data-time')) ? $('.ativo', $containerBanner).attr('data-time') - timeFade : time;
			var _miliseconds = Number(_timeItem) * 1000;//	converte em milisegundos
			slider_timer = setTimeout(timerHandler, _miliseconds);
			
		}//	fim autoBanner
			
		//--------------
		//	temporizador do slider
		function timerHandler () {
			changeBanner('next');
		}
		//	fim timerHandler
		
		//--------------
		//	responsável pela mudança dos itens
		function changeBanner(type) {
			var _new;
			var _current = $contentBanner.index($('> .ativo', $containerBanner));
			var _total = $contentBanner.size();
			
			switch (type) {
				case "next":
					_new = (_current == _total - 1) ? 0 : _current + 1;
					break;
				case "previous":
					_new = (_current == 0) ? _total - 1 : _current - 1;
					break;
			}
			
			plugin_settings.onSlideChange.call(this, {current:_new});
			
			itemAtivo = _new;
	
			bannerTransition(_new);
		}//	fim changeBanner
		
		function bannerTransition(n) {
			statusTransition = true;
			
			if($contentNav.size()>0){
				$contentNav.removeClass('ativo');
				$contentNav.eq(n).addClass('ativo');
			}
	
			$('> .ativo', $containerBanner).css({'display': 'block', 'z-index': '11'});
			$('> .ativo', $containerBanner).fadeOut(1000 * timeFade);
			$('> .ativo', $containerBanner).removeClass('ativo');
			
			$contentBanner.eq(n).addClass('ativo');
			$contentBanner.eq(n).css({'display': 'none', 'z-index': '10'});
			
			$contentBanner.eq(n).delay(100).fadeIn(1000 * timeFade,
				function () {
					statusTransition = false;
					autoBanner();
				}
			);
		}//	fim bannerTransition
		
		//adiciona a classe ativo ao primeiro item
		function setFirstItemAtivo (n){
			$contentNav.eq(n).addClass('ativo');
			$contentBanner.eq(n).addClass('ativo');
			$contentBanner.eq(n).css({'display': 'block', 'z-index': '11'});
		}//	fim setFirstItemAtivo
		
		//-------------------------------------------------------------------------
		//-- setas
		//-------------------------------------------------------------------------
		function initNav() {
			
			if($contentNav.size()>0){
				$contentNav.click
				(
					function () {
						if (!$(this).hasClass('ativo') && !statusTransition) {
							pauseBanner ();
							bannerTransition($contentNav.index($(this)));
						}
		
						return false;
					}
				);
			}
			
			if($btNext.size()>0){
				$btNext.click
				(
					function () {
						if (!statusTransition) {
							pauseBanner ();
							changeBanner('next');
						}
						return false;
					}
				);
			}
			
			if($btPrevious.size()>0){
				$btPrevious.click
				(
					function () {
						if (!statusTransition) {
							pauseBanner ();
							changeBanner('previous');
						}
						return false;
					}
				);
			}
		}//	fim initNav
		
		//--------------
		//pausa o banner
		function pauseBanner () {
			clearTimeout(slider_timer);
		}//	fim pauseBanner
		
		//--------------
		//	inicia o banner
		function playBanner () {
			autoBanner();
		}//	fim playBanner
	
		//--------------
		//pausa o slider
		function nextBanner () {
			pauseBanner ();//	remove o timer
			changeBanner('next');
		}//	fim nextBanner
	
		//--------------
		//pausa o slider
		function previousBanner () {
			pauseBanner ();//	remove o timer
			changeBanner('previous');
		}
   
	};
	
	//-------------------------------------------------------------------------
	//--
	//-------------------------------------------------------------------------
})(jQuery);
