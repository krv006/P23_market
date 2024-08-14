$(function(){
	var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	
	if ($('.order-info-block').length) {
			if (!isMobile) {
			$('.order-info-block__title').hover(function(){
				$(this).next().show();	
				$('.order-info-block__popup').removeClass('right_popup');
				
				if ($(document).outerWidth() > $(window).outerWidth()) {
	                $(this).next().addClass('right_popup');
	            };
			}, function(e){
				$(this).next().hide();
				$('.order-info-block__popup').removeClass('right_popup');
			});
		} else {
			$('.order-info-block__title').on('click', function(){
				$('.order-info-block__popup').hide();
				$('.order-info-block__popup').removeClass('right_popup');
				$(this).next().show();
				
				if ($(document).outerWidth() > $(window).outerWidth()) {
	                $(this).next().addClass('right_popup');
	            };
			});
			
			$('.order-info-block__close').on('click', function(){
				$('.order-info-block__popup').hide();
				$('.order-info-block__popup').removeClass('right_popup');
			});
		};
	};
})