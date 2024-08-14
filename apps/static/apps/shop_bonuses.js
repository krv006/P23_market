/*Купон*/

shop2.queue.coupon = function () {
	shop2.on('afterCartAddCoupon, afterCartRemoveCoupon', function () {
		document.location.reload();
	});

	$('.coupon-btn').on('click', function (e) {
		var coupon = $('#coupon'),
			code = coupon.val();

		e.preventDefault();

		if (code) {
			shop2.cart.addCoupon(code);
		} else {
			shop2.msg('Введите код купона', $(this));
		}

	});


	$('.coupon-delete').on('click', function (e) {
		var $this = $(this),
			code = $this.data('code');

		e.preventDefault();

		if (code) {
			shop2.cart.removeCoupon(code);
		}
	});
};

/*Купон*/

/*Бонусы*/

shop2.cart.applyBonusPoint = function (bonus_points, func) {

	shop2.trigger('beforeCartApplyBonus');

	$.getJSON(
		'/my/s3/xapi/public/?method=cart/applyBonusPoints', {
			param: {
				hash: shop2.hash.cart,
				bonus_points: bonus_points
			}
		},
		function (d, status) {
			shop2.fire('afterCartApplyBonusPoints', func, d, status);
			shop2.trigger('afterCartApplyBonusPoints', d, status);
		}
	);

	return false;
};

shop2.cart.removeBonusPoint = function (func) {

	shop2.trigger('beforeCartRemoveCartBonusPoints');

	$.getJSON(
		'/my/s3/xapi/public/?method=cart/RemoveBonusPoints', {
			param: {
				hash: shop2.hash.cart
			}
		},
		function (d, status) {
			shop2.fire('afterCartRemoveCartBonusPoints', func, d, status);
			shop2.trigger('afterCartRemoveCartBonusPoints', d, status);
		}
	);
};

shop2.queue.bonus = function () {

	shop2.on('afterCartApplyBonusPoints, afterCartRemoveCartBonusPoints', function () {
		document.location.reload();
	});

	$('.bonus-apply').on('click', function (e) {
		var bonus = $('#bonus-points'),
			points = Number(bonus.val()),
			bonus_user = Number($('.bonus-amount').data('bonus-amount'));

		switch (true) {
			case points == "":

				e.preventDefault();
				
				shop2.msg('Введите значение', $(this));

				break;
				
			case points > bonus_user:
			
				shop2.msg('Вам доступно только '+bonus_user+' бонусов', $(this));
			
				break;
				
			case bonus_user >= points:

				shop2.cart.applyBonusPoint(points);

				break;
		};
	});

	$('.bonus-delete').on('click', function (e) {
		shop2.cart.removeBonusPoint();
	});
	
	$('.cart-bonuses__title label').on('click', function(e){
		e.preventDefault();
        var $check = $(':checkbox', this);
        $check.prop('checked', !$check.prop('checked'));
        
		$('.cart-bonuses__container').toggleClass('show_bonuses');
		
		if (!$check.prop('checked') && $('.cart-total__item.bonus_item').length) {
			shop2.cart.removeBonusPoint();
		};
	});

	$.fn.inputFilter = function (inputFilter) {
		return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function () {
			if (inputFilter(this.value)) {
				this.oldValue = this.value;
				this.oldSelectionStart = this.selectionStart;
				this.oldSelectionEnd = this.selectionEnd;
			} else if (this.hasOwnProperty("oldValue")) {
				this.value = this.oldValue;
				this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
			}
		});
	};

	$("#bonus-points").inputFilter(function (value) {
		return /^\d*$/.test(value);
	});
};

/*Бонусы*/


$(function(){
	
	$(document).off('click.getPromoLink').off('click.promoPagelist');
			
	var gr_promo_info = {};

    $(document).on('click', '.get-promo-link', function (e) {
	    e.preventDefault();
	    var ver_id = $(this).data('ver-id'),
	        cmd = $(this).data('cmd'),
	        hash = shop2.apiHash.getPromoProducts,
	        is_main = $(this).data('is-main'),
	        kind_id = $(this).data('kind-id'),
	        discount_id = $(this).data('discount-id');
	        
	    gr_promo_title = $(this).text(),
        gr_promo_desc =  $(this).parents('.promo-action').find('.promo-action__text').html();
        
	    $.ajax({
	        url: '/my/s3/api/shop2/?ver_id=' + ver_id + '&cmd=' + cmd + '&hash=' + hash + '&kind_id=' + kind_id + '&discount_id=' + discount_id + '&is_main=' + is_main,
	        type: 'POST',
	        dataType: 'json',
	        data: {},
	        success: function (res) {
	            shop2.alert(res.data, 'Закрыть', 'promo-products-list');
	
	            setTimeout(function () {
	            	$('.promo-header__title').html(gr_promo_title);
	            	if (!gr_promo_desc) {
	            		$('.promo-header__desc').hide();
	            	};
	            	$('.promo-header__desc').html(gr_promo_desc);
	            	
	            	if (!$('.promo-products-list .shop-pagelist').length) {
	            		$('.promo-products-list .product-list.list .product-item:last-child').css('border-bottom', 'none');
	            	};
	            	
	            	$('.promo-products-list').click().addClass('custom-scroll scroll-width-thin scroll');
	            	$('.promo-products-list .product-item').each(function() {
						var $flags = $(this).find('.product-flags');
						var $flagsContainer = $(this).find('.product-item__bottom-left');
	
						$flags.prependTo($flagsContainer);
					});
	            
	                $('.product-list .gr_images_lazy_load').each(function () {
	                    $(this).attr('src', $(this).attr('data-src'));
	                });
	                
	                shop2_gr.methods.amountInit();
	            }, 100);
	        }
	    });
	    
	    return gr_promo_info = {
	    	gr_promo_title: gr_promo_title,
	    	gr_promo_desc: gr_promo_desc
	    }
	});
	
	$(document).on('click', '.promo-products-list li', function (e) {
	    e.preventDefault();
	    var url = $(this).find('a').attr('href');
	    
	    $.ajax({
	        url: url,
	        type: 'POST',
	        dataType: 'json',
	        data: {},
	        success: function (res) {
	            shop2.alert(res.data, 'Закрыть', 'promo-products-list');
	            
	            setTimeout(function () {
	            	$('.promo-header__title').html(gr_promo_info.gr_promo_title);
	            	if (!gr_promo_info.gr_promo_desc) {
	            		$('.promo-header__desc').hide();
	            	};
	            	$('.promo-header__desc').html(gr_promo_info.gr_promo_desc);
	            	
	            	$('.promo-products-list').click().addClass('custom-scroll scroll-width-thin scroll');
	            	$('.promo-products-list .product-item').each(function() {
						var $flags = $(this).find('.product-flags');
						var $flagsContainer = $(this).find('.product-item__bottom-left');
	
						$flags.prependTo($flagsContainer);
					});
	            
	                $('.product-list .gr_images_lazy_load').each(function () {
	                    $(this).attr('src', $(this).attr('data-src'));
	                });
	                shop2_gr.methods.amountInit();
	            }, 100);
	        }
	    });
	});
		
});