shop2.facets.search.wrapper = "";
shop2.options.msgTime = 2000;

shop2.queue.kindAvailable = function(){
    var sentAjax_preorder = function(data, callback){
        $.ajax({
            url: '/my/s3/xapi/public/?method=shop2/addKindEmailNotification',
            method: 'post',
            xhrFields: {
                withCredentials: true
            },
            data: data,
            success: function(result) {
                callback(result);
            }
        });
    };
    
    var object_preorder = {};
    $(document).on('click', '.preorder-btn-js', function(e) {
        e.preventDefault();
        object_preorder.data = {};
        
        object_preorder.jQbtn = $(this);
        object_preorder.data.kind_id = object_preorder.jQbtn.data('product-kind_id');
        object_preorder.data.email = object_preorder.jQbtn.data('user-email') || 0;
        
        if( object_preorder.data.email ){
            var temp_email = `
            <div class="preorder-field preorder-email tpl-field type-email field-required">
                <span class="preorder-email_text">
                    ${shop2.my.preorder_email_text||'Данный email указан при регистрации.'}
                </span>
                <div class="preorder-email-input">
                    <div class="preorder-field-title field-title">E-mail: <span class="field-required-mark">*</span></div>
                    <div class="preorder-field-value">
                        <input type="text" name="email" required value="${object_preorder.data.email}">
                    </div>
                </div>
            </div>
            `;

        }else {
            var temp_email = `
            <div class="preorder-field preorder-email tpl-field type-email field-required">
                <div class="preorder-email-input">
                    <div class="preorder-field-title field-title">E-mail: <span class="field-required-mark">*</span></div>
                    <div class="preorder-field-value">
                        <input type="text" name="email" required value="">
                    </div>
                </div>
            </div>
            `;
        }
        
        let temp_html = `
                    <div class="preorder-form-wrap preorder-block">
                        <form class="preorder_body" action="/my/s3/xapi/public/?method=shop2/addKindEmailNotification" method="get">
                            <div class="preorder-title tpl-anketa__title">
                                ${shop2.my.preorder_form_title||'Узнать о поступлении'}
                            </div>
                            <div class="preorder_text preorder-field type-html tpl-field type-html">
                                ${shop2.my.preorder_form_text||'Оставьте почту и мы напишем вам, когда товар появится в наличии.'}
                            </div>
                            ${temp_email}
                            <input type="hidden" name="kind_id" value="${object_preorder.data.kind_id}">
                            
                            <div class="preorder-field tpl-field tpl-field-button">
                                <button type="submit" class="tpl-form-button">${shop2.my.preorder_form_submitt||'Отправить'}</button>
                            </div>
                            
                        </form>
                        <div class="block-recaptcha"></div>
                    </div>
                        `;
                        
        let this_remodal = $('.remodal[data-remodal-id="buy-one-click"]');
        
        this_remodal.find('.preorder-form-wrap').add( this_remodal.find('.tpl-anketa') ).remove();
        
        this_remodal.append(temp_html);
        
        this_remodal.remodal().open();
		
		this_remodal.on('closed.preorder', function(e){
			
			this_remodal.find('.preorder-form-wrap').remove();
			this_remodal.off('closed.preorder');
		});
    });
    
    $(document).on('submit', '.block-recaptcha form', function(e) {
        e.preventDefault();
        
        var serializeArray = $(this).serializeArray();
        
        for(let i = 0; i < serializeArray.length; i++){
            if( serializeArray[i]['name'] == '_sitekey' ){ object_preorder.data['_sitekey'] = serializeArray[i]['value'];}
            if( serializeArray[i]['name'] == 'g-recaptcha-response' ){ object_preorder.data['g-recaptcha-response'] = serializeArray[i]['value'];}
        };

        sentAjax_preorder( object_preorder.data, (data)=>{
        	
            object_preorder.jQbtn.addClass('disabled').get(0).setAttribute('disabled', 'disabled');

            $('.preorder-form-wrap').html(`
				<div class="preorder_success tpl-anketa__right tpl-anketa__posted">
					<div class="tpl-anketa-success-note">${shop2.my.preorder_form_success||'Спасибо!'}</div>
				</div>
            `);
            
            if( object_preorder.jQbtn.closest('form').length ){
            	let $favorite_btn = object_preorder.jQbtn.closest('form').find('.gr-favorite-btn');
            	
            	if( $favorite_btn.length && !$favorite_btn.is(":hidden") ){
            		$favorite_btn.trigger('click');
            	};
            };
        });
        
    });
    
    shop2.on('afterFavoriteAddItem', function(){
		if ($('.preorder-form-wrap').length) {
			$('#shop2-msg').hide();
		};
	});
    
    $(document).on('submit', '.preorder_body', function(e) {
        e.preventDefault();
        var $form = $(this);
        
        object_preorder.data.email = this.email.value;
        const _regexEmeil = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
        
        let valid = _regexEmeil.test(object_preorder.data.email);
        
        if (valid){
            $.get( '/my/s3/xapi/public/?method=shop2/addKindEmailNotification', function( data ) {
            	console.log(object_preorder);

                const _regexBody = new RegExp(/<body[^>]*>(.*?)<\/body>/ig);
                
                let body = data.result.html.match( _regexBody );
                
                $form.parent('.preorder-block').find('.block-recaptcha').html( body );
              });
        }else {
            
            if( !$form.find('.preorder-email').hasClass('field-error') )
                $form
                    .find('.preorder-email')
                    .addClass('field-error')
                    .find('.preorder-email-input .preorder-field-value')
                    .before(`<div class="error-message">Неверный формат адреса электронной почты</div>`);
        }

    });
};

shop2.msg = function(text, obj) {
    var selector = '#shop2-msg',
        msg = $(selector),
        offset = obj.offset(),
        width = obj.outerWidth(true),
        height = obj.outerHeight(true);

    if (!msg.get(0)) {
        msg = $('<div id="shop2-msg">');
        $(document.body).append(msg);
        msg = $(selector);
    }

    msg.html(text).fadeIn(150);

    var msgWidth = msg.outerWidth();
    var msgHeight = msg.outerHeight();
    var left = offset.left + width;
    var top = offset.top + height;

    if (left + msgWidth > $(window).width()) {
        left = offset.left - msgWidth;
    }

    msg.css({
        left: 50 + '%',
        top: 50 + '%',
        'position': 'fixed',
        'margin-left': msgWidth / 2 * -1,
        'margin-top': msgHeight / 2 * -1
    });
    
    $.s3throttle('msg', function() {
		msg.hide();
    }, shop2.options.msgTime);

    $(document).on('click', '#shop2-msg', function() {
        $(this).fadeOut(150);
    });
};

shop2.queue.compare = function() {

	var popup_data;
	var compare_arrow = '<i><svg class="gr-svg-icon"><use xlink:href="#icon_shop_notify_arr"></use></svg></i>';
	if (shop2.my.gr_popup_compare) {
		popup_data = ' data-remodal-target="compare-preview-popup"';
	};
	
	let $document = $(document);
	if ($('html').attr('lang') == 'ru') {
		var compareBtn = '<a href="' + shop2.uri + '/compare" class="go-to-compare-btn"'+popup_data+' target="_blank">к сравнению</a>';
		var compareBtn2 = '<a href="' + shop2.uri + '/compare" class="go-to-compare-btn"'+popup_data+' target="_blank">Перейти к сравнению</a>';
	} else {
		var compareBtn = '<a href="' + shop2.uri + '/compare" class="go-to-compare-btn"'+popup_data+' target="_blank">сompare</a>';
		var compareBtn2 = '<a href="' + shop2.uri + '/compare" class="go-to-compare-btn"'+popup_data+' target="_blank">Compare</a>';
	};

	function update(el, res) {

		$('input[type=checkbox][value=' + el.val() + ']').closest('.product-compare').replaceWith(res.data);
		$('.product-compare-added a span').html(res.count);
		$('.gr-compare-btn .gr-compare-btn-amount').html(res.count);
		
		
		if (+$('.gr-compare-btn .gr-compare-btn-amount').text() == '0') {
		    $('.gr-compare-btn').removeClass('active');
		} else {
		    $('.gr-compare-btn').addClass('active');
		};

		
		if (!$('.compare-remodal').hasClass('remodal-is-opened')) {
			if ($('html').attr('lang') == 'ru') {
				shop2.msg('Товар добавлен ' + compareBtn + '&nbsp;&nbsp;' + res.count, $('body'));
			} else {
				shop2.msg('Added to ' + compareBtn + '&nbsp;&nbsp;' + res.count, $('body'));
			};
		};

		if (res.panel) {
			$('#shop2-panel').replaceWith(res.panel);
		};

	}

	$document.on('click', '.product-compare input:checkbox', function() {
		var $this = $(this),
			action = $this.attr('checked') ? 'del' : 'add';
			
		shop2.compare.action(action, $this.val(), function(res, status) {
			if (status == 'success') {
				

				if (res.errstr) {
					if (!$('.compare-remodal').hasClass('remodal-is-opened')) {
						shop2.msg(res.errstr + '&nbsp;<br>' + compareBtn2, $('body'));
					}
					$this.prop('checked', false);
				} else {
					update($this, res);
					
					if (action == 'del' && !$('.compare-remodal').hasClass('remodal-is-opened')) {
						if ($('html').attr('lang') == 'ru') {
							shop2.msg('Товар удален из сравнения', $('body'));
						} else {
							shop2.msg('Product removed from comparison', $('body'));
						};
					}
				}
				
			}
		});
	});
};

shop2.product.getProductListItem = function(product_id, kind_id, func) {
    var gr_images_size = $('.product-list').data('images-size');
    var gr_images_view = $(".product-list").data("images-view");
    var gr_mode_catalog = $(".product-list").data("mode-catalog");
	var url = "/my/s3/api/shop2/?cmd=getProductListItem&hash=" + shop2.apiHash.getProductListItem + "&ver_id=" + shop2.verId + "&gr_images_view=" + gr_images_view + "&gr_images_size=" + gr_images_size + "&gr_mode_catalog=" + gr_mode_catalog;
	
    shop2.trigger('beforeGetProductListItem', kind_id);

    $.post(
        url, {
            product_id: product_id,
            kind_id: kind_id
        },
        function(d, status) {
            shop2.fire('afterGetProductListItem', func, d, status);
            shop2.trigger('afterGetProductListItem', d, status);
        }
    );
};

shop2.queue.lazyLoad = function() {

    var $document = $(document),
        $window = $(window),
        blocked = false,
        products = $('.product-list');

    function path(url, param, value) {
        return url + (~url.indexOf("?") ? "&" : "?") + param + "=" + value;
    }
    
    if (shop2.my.lazy_load_subpages && products.get(0)) {
        $document.on('click', '.lazy-pagelist-btn', function(e){
        	
        	e.preventDefault();
        	
            var pagelist = $('.shop-pagelist');
            var next = pagelist.find('.active-num').next().find('a');

            if (!next.length) {
                return;
            }

            if (!blocked && next.get(0)) {
                blocked = true;
              
                $.get(path(next.attr('href'), 'products_only', 1), function(data) {
                	var productsHtml = $(data).filter('.product-list').html();
                	var $lazyLoad = $(data).filter('.lazy-pagelist');
                	
                	$('.lazy-pagelist').remove();
                	
                	$('.product-list').append(productsHtml);
                	$('.product-list').after($lazyLoad);
                	
                	$('.product-list .gr_images_lazy_load').each(function(){
				   		$(this).attr('src', $(this).attr('data-src'));
					});
					
					$('.quick-view-trigger').elemToolTip({
				    	text: 'Быстрый просмотр',
				    	margin: 12
				    });
				    
				    $('.product-additional__top-right').matchHeight();
				    $('.product-list.thumbs .product-item .product-price').matchHeight();
                	
                	/*viewLots();
                	amountInit();*/
                	shop2_gr.methods.viewLots();
                	shop2_gr.methods.amountInit();
				    
				    pagelist = $('.shop-pagelist');
				    
                    pagelist.find('a').each(function() {
                        var $this = $(this),
                            href = $this.attr('href');
                        $this.attr('href', href.replace(/[&|\?]*products_only=[^&]/, ""));
                    });

                    blocked = false;
                });
            }
        });
    }

};

shop2.queue.addToCart = function() {
	$(document).on('click', '.shop-product-btn', function(e) {

		var $this = $(this),
			$form = $this.closest('form'),
			form = $form.get(0),
			adds = $form.find('.additional-cart-params'),
			len = adds.length,
			i, el,
			a4 = form.amount.value,
			kind_id = form.kind_id.value;
	
		e.preventDefault();

		if (len) {
			a4 = {
				amount: a4
			};

			for (i = 0; i < len; i += 1) {
				el = adds[i];
				if (el.value) {
					a4[el.name] = el.value;
				}
			}
		}
		
		shop2.cart.add(kind_id, a4, function(d) {
			$('#shop2-cart-preview').replaceWith(d.data);
			
			var totalCartAmount = +$(d.data).find('.gr-cart-total-amount').text();
			var totalCartSum = $(d.data).find('.gr-cart-total-sum').data('total-price');
			
			if (totalCartAmount>0) {
				$('.gr-cart-popup-btn').removeClass('pointer_events_none');
				$('.gr-cart-total-amount').text(totalCartAmount);
				$('.gr-cart-total-sum ins').text(totalCartSum);
				$('.gr-cart-total-amount').removeClass('hide');
			} else{
				$('.gr-cart-popup-btn').addClass('pointer_events_none');
				$('.gr-cart-total-amount').text('0');
				$('.gr-cart-total-sum ins').text('0');
				$('.gr-cart-total-amount').addClass('hide');
			};

			if (d.errstr) {
				shop2.msg(d.errstr, $this);
			} else {
				var $text = window._s3Lang.JS_SHOP2_ADD_CART_WITH_LINK;
				
				shop2.msg($text.replace("%s", shop2.uri + "/cart"), $this);
			}

			if (d.panel) {
				$('#shop2-panel').replaceWith(d.panel);
			};
		});
	});
};

shop2.filter.sort = function(name, elem) {
    var re = new RegExp(this.escape('s[sort_by]') + '=([^&]*)'),
        params = this.str.match(re),
        desc = name + ' desc',
        asc = name + ' asc',
        isDesc = (elem.is('.sort-param-desc'));


    params = (params && params.length > 1) ? params[1] : "";
    
    params = (isDesc) ? desc : asc;

    this.remove('s[sort_by]');
    this.add('s[sort_by]', params);
    return this;
};

shop2.queue.sort = function() {
    var wrap = $('.sorting');

    wrap.find('.sort-param').on('click', function(e) {
        var $this = $(this),
            name = $this.data('name');

        e.preventDefault();
        shop2.filter.sort(name, $this);
        shop2.filter.go();
    });

    wrap.find('.sort-reset').on('click', function(e) {
        e.preventDefault();
        shop2.filter.remove('s[sort_by]');
        shop2.filter.go();
    });
};

shop2.queue.colorPopup = function() {
	var handle;

	$(document).on('click', '.shop2-color-ext-list li', function() {
		var caption = $(this);
		var wrap = caption.closest('.shop2-color-ext-popup');
		var ul = wrap.find('.shop2-color-ext-list');
		var offset = caption.offset();
		var $this = $(this);
		var data = $this.data();
		var input = $this.parent().find('input.additional-cart-params');
		var isSelected = $this.is('.shop2-color-ext-selected');

		colors = ul.children('li');

		if (typeof data.kinds !== 'undefined' || input.length) {
			$this.addClass('shop2-color-ext-selected').siblings().removeClass('shop2-color-ext-selected');

			if (input.length) {
				input.val(data.value);
			} else {
				if (!isSelected) {
					shop2.product._reload(this);
				}
			}

		} else {
			var index = $this.index();
			
			colors.eq(index).toggleClass('shop2-color-ext-selected');
			shop2.filter.toggle(data.name, data.value);
			shop2.filter.count();

			var offsetTop = $(this).position().top;

			$('.result-popup').css({
				'top': offsetTop,
				'visibility': 'visible',
				'opacity': '1',
				'display': 'block'
			});

		}
		return false;
	});
};
/*gr_plugins_load().then(function() {*/
	(function($, myObject) {
		
		var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
			isApple = /iPod|iPad|iPhone/i.test(navigator.userAgent),
			$doc = $(document),
			$win = $(window),
			$html = $(document.documentElement);
			
		var shop2_gr = {
			queue: {},
			methods : {},
			init: function() {
	
				$(function() {
	
					let queue = shop2_gr.queue;
	
					if (isMobile) $html.addClass('mobile');
	
					for (key in queue) {
						let f = queue[key];
						if (typeof f === 'function') {
							f();
						};
					}
					
				});
	
			}
		};
	
		shop2_gr.queue = {
	
			ajaxRequestsComplete: function() {
	
				/*$.ajaxSetup({
					complete: function() {
						
					}
				});*/
	
				shop2.on('afterProductReloaded', function(){
					setTimeout(function(){
						/*viewLots();
						amountInit();*/
						shop2_gr.methods.viewLots();
						shop2_gr.methods.amountInit();
	
						$('.shop2-product-item .buy-one-click').attr('data-api-url', $('.product-list').data('popup-form'));
	
						$('.product-list .gr_images_lazy_load').each(function(){
						    $(this).attr('src', $(this).attr('data-src'));
						});
	
						$('.quick-view-trigger').elemToolTip({
					    	text: 'Быстрый просмотр',
					    	margin: 12
					    });
					    
					    $('#shop2-tooltip').hide();
					    $('.main-blocks .product-list.thumbs .product-item__bottom').matchHeight();
					});
					$.fn.matchHeight._update();
				});
	
			}, /*Обновление скриптов при аякс-запросах*/
			
			
			ajaxCompare: function(){
				if (shop2.mode=="") {
					var url = document.location.origin;
					$.ajax({
						url: url,
							success: function(data){
							var html = $(data).find('.gr-compare-btn');
							$('.gr-compare-btn').replaceWith(html);
						}
					});	
				}
			},
	
	
			checkboxes: function() {
				$('#orderForm input[name="personal_data"]').parents('label').next('a').appendTo($('#orderForm input[name="personal_data"]').parents('label'));
				
				$('.shop2-order-form input[type="checkbox"]:not(.gr-fixed-checkbox), .shop2-order-form input[type="radio"], .comments-block .tpl-field.checkbox input, .tpl-field-reg input, .gr-authorization-checkbox, .shop2-order-options.shop2-payment-options .payment_methods-column input[type="radio"], #orderForm input[name="personal_data"]').mgStyler();
				
				$('#orderForm .mg-styler-label--checkbox a').on('click', function(e){
					let $label = $(this).parent();
					let $input = $(this).parents('label').find('input');
					let href = $(this).attr('href');
					window.open(href, '_blank');
					
					if ($('.mg-styler-label--checkbox input').is(':checked')) {
						setTimeout(function(){
							$input.prop('checked', true);
							$label.addClass('checked');
						}, 10);
					} else {
						setTimeout(function(){
							$input.prop('checked', false);
							$label.removeClass('checked');
						}, 10);
					}
				});
	
				$(document).on('click', '.shop2-edost-variant > label', function(){
					if ($('.shop2-edost-variant > label > .shop2-edost-control input[type="radio"]:checked')) {
						$('.shop2-edost-variant > label > .shop2-edost-control').removeClass("active");
						$('.shop2-edost-variant > label > .shop2-edost-control input[type="radio"]:checked').parent().addClass('active');
					}
					
					if ($('.shop2-edost-office > label > .shop2-edost-control input[type="radio"]:checked')) {
						$('.shop2-edost-office > label > .shop2-edost-control').removeClass("active");
						$('.shop2-edost-office > label > .shop2-edost-control input[type="radio"]:checked').parent().addClass('active');
					}
				});
	
				$(document).on("click", ".shop2-edost-office > label", function(){
					if ($('.shop2-edost-office > label > .shop2-edost-control input[type="radio"]:checked')) {
						$('.shop2-edost-office > label > .shop2-edost-control').removeClass("active");
						$('.shop2-edost-office > label > .shop2-edost-control input[type="radio"]:checked').parent().addClass('active');
					}
				});
			}, /*Чекбоксы*/
	
	
			colorSelect: function() {
	
				$(document).on('click', '.shop-search-color-select li', function(){
					var $input = $(this).find('input');
					var value = $(this).data('value');
	
					if ($(this).hasClass('shop2-color-ext-selected')) {
						$input.val("");
						$(this).removeClass('shop2-color-ext-selected');
					} else {
						$(this).addClass('shop2-color-ext-selected');
						$input.val(value);
					}
					
					var url = '/my/s3/api/shop2/?cmd=getSearchMatches&hash=' +
				        shop2.apiHash.getSearchMatches +
				        '&ver_id=' + shop2.verId + '&',
				    	fullUrl = url + $(shop2.facets.search.wrapper).serialize();
				
					shop2.facets.getDataSearch(fullUrl);
				});
	
			},
			
			sortingPanel: function() {
	
				$('.sorting-block__body').on('click', function(){
					$(this).next().stop().slideToggle(250);
					$(this).parent().toggleClass('active');
				});
	
				$('.shop-view').on('click', '.shop-view__btn', function(){
					$(this).parents('.shop-view__inner').toggleClass('active');
				});
	
				$(document).on('click', function(e){
				    if (!$(e.target).closest('.shop-view .shop-view__btn').length) {
				    	$('.shop-view .shop-view__inner').removeClass('active');
				    };
	
				    if (!$(e.target).closest('.sorting-block__body').length) {
				    	$('.sorting-block__inner').removeClass('active');
				    	$('.sorting-block__popup').slideUp(250);
				    }
				});
	
				shop2_gr.methods.viewLots();
				
			}, /*Сортировка и виды*/
	
	
			searchBlock: function() {
	
				$(document).on('click', '.search-form .row-title', function(){
					$(this).toggleClass('active');
					$(this).next().slideToggle(250);
				});
				
				function searchMoreFields() {
					var hideText         = $('html').attr('lang') == 'ru' ? 'Свернуть' : 'Hide';
	                var currentText  	 = $('html').attr('lang') == 'ru' ? shop2.my.gr_filter_select_btn || 'Показать ещё' : shop2.my.gr_filter_select_btn || 'Show more';
	                
					$('.search-rows__row').each(function() {
			            var $this            = $(this);
			            var $btn             = $this.find('.gr-filter-more__btn');
			            
			            $btn.find('.gr-filter-more__text').text(currentText);
		
						$btn.off('click').on('click', function(){
				            var $hiddenCkeckbox  = $this.find('ul li:hidden');
		
				            $hiddenCkeckbox.addClass('hidden_item');
		
							if ($this.find('.hidden_item').hasClass('active')) {
								$btn.find('.gr-filter-more__text').text(currentText);
								$this.find('.hidden_item').removeClass('active');
							} else {
								$btn.find('.gr-filter-more__text').text(hideText);
								$this.find('.hidden_item').addClass('active');
							};
							
							setTimeout(function(){
								$('.search-rows__row').matchHeight();
							});
						});
					});
				};
				
				searchMoreFields();
				
				shop2.on('afterGetFolderCustomFields', function(){
					searchMoreFields();
					
					var url = '/my/s3/api/shop2/?cmd=getSearchMatches&hash=' +
				        shop2.apiHash.getSearchMatches +
				        '&ver_id=' + shop2.verId + '&',
				    	fullUrl = url + $(shop2.facets.search.wrapper).serialize();
				
					shop2.facets.getDataSearch(fullUrl);
				});
	
			},
			
			
			filterBlock: function() {
	
				$('.shop2-filter__title').on('click', function(){
					$(this).toggleClass('active');
					$(this).next().slideToggle(250);
				});
	
	
				$('.shop2-filter__item').each(function() {
		            var $this            = $(this);
		            var $btn             = $this.find('.gr-filter-more__btn');
		            var hideText         = $('html').attr('lang') == 'ru' ? 'Свернуть' : 'Hide';
	
					$btn.on('click', function(){
			            var $hiddenCkeckbox  = $this.find('.shop2-filter__checkbox:hidden');
			            var $hiddenColor     = $this.find('.shop2-color-ext-list__item:hidden');
						var currentText  = $btn.data('text');
	
			            $hiddenCkeckbox.addClass('hidden_item');
			            $hiddenColor.addClass('hidden_item');
	
						if ($this.find('.hidden_item').hasClass('active')) {
							$btn.find('.gr-filter-more__text').text(currentText);
							$this.find('.hidden_item').removeClass('active');
						} else {
							$btn.find('.gr-filter-more__text').text(hideText);
							$this.find('.hidden_item').addClass('active');
						};
					});
				});
	
			}, /*Фильтр*/
			
			
			productsBlock: function() {
	
				$(document).on('click', '.gr-options-more__btn', function(){
					var $parent     = $(this).parents('.gr-product-options');
					var $params     = $parent.find('.gr-options-container');
					var currentText = $(this).data('text');
					var hideText    = $('html').attr('lang') == 'ru' ? 'Свернуть' : 'Hide';
	
					if ($(this).hasClass('active')) {
						$(this).removeClass('active');
						$(this).find('ins').text(currentText);
					} else {
						$(this).addClass('active');
						$(this).find('ins').text(hideText);
					};
	
					$params.stop().slideToggle(250);
				});
				if (shop2.mode == 'product') {
					$('.shop-product-share').insertBefore('.collections');
				}
	
				$('.shop2-color-ext-select .shop2-color-ext-options').on('click', function() {
					if ($(this).closest('.shop2-color-ext-select').hasClass('active')) {
						$(this).closest('.shop2-color-ext-select').removeClass('active');
					} else {
						$(this).closest('.shop2-color-ext-select').addClass('active');
					}
				});
	
				$('#shop2-color-ext-select').on('click', function() {
					$('.shop2-color-ext-select').removeClass('active');
				});
	
	
	
				$(document).on('click', '.shop2-color-ext-select', function() {
					if ($(this).parents('.product-item').length>0) {
						$('#shop2-color-ext-select').addClass('product_item_color');
					}
	
					if ($(this).parents('.shop2-product').length>0) {
						$('#shop2-color-ext-select').addClass('shop_product_color');
					}
				});
	
				$(document).on('click', '#shop2-color-ext-select', function() {
					$(this).removeClass('product_item_color');
					$(this).removeClass('shop_product_color');
				});
				$(document).on('click', function(e){
				    if (!$(e.target).closest('#shop2-color-ext-select').length) {
				    	$('#shop2-color-ext-select').removeClass('product_item_color');
				    	$('#shop2-color-ext-select').removeClass('shop_product_color');
				    }
				});
	
			}, /*Товар*/
			
			
			cardPage: function(){
	
				if (shop2.mode == 'product'){
					var sprite = '<div class="hide"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><symbol viewBox="0 0 30 30" id="icon_shop_adv_search" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.874 11A4.002 4.002 0 013 10a4 4 0 017.874-1H24a1 1 0 110 2H10.874zm8.252 8A4.002 4.002 0 0127 20a4 4 0 01-7.874 1H6a1 1 0 110-2h13.126zM23 22a2 2 0 100-4 2 2 0 000 4zM7 12a2 2 0 100-4 2 2 0 000 4z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_adv_search_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 9a4 4 0 113.874-5H16a1 1 0 110 2H8.874A4.002 4.002 0 015 9zm10 2a4 4 0 11-3.874 5H4a1 1 0 110-2h7.126c.444-1.725 2.01-3 3.874-3zm0 6a2 2 0 100-4 2 2 0 000 4zM5 7a2 2 0 100-4 2 2 0 000 4z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_available" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 15C3 8.373 8.373 3 15 3s12 5.373 12 12-5.373 12-12 12S3 21.627 3 15zM15 5C9.477 5 5 9.477 5 15s4.477 10 10 10 10-4.477 10-10S20.523 5 15 5zm5.364 6.636a1 1 0 010 1.414l-5.657 5.657a1 1 0 01-1.414 0l-2.829-2.828a1 1 0 111.415-1.415L14 16.587l4.95-4.95a1 1 0 011.414 0z" opacity=".2"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_available_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 10a9 9 0 1118 0 9 9 0 01-18 0zm9-7a7 7 0 100 14 7 7 0 000-14zm3.707 4.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L9 10.586l3.293-3.293a1 1 0 011.414 0z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_bonus" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 4a8 8 0 107.993 8.339 6 6 0 11-7.654 7.654 8.109 8.109 0 01-2.136-.196 8 8 0 109.595-9.595A8.003 8.003 0 0012 4zm-6 8a6 6 0 1112 0 6 6 0 01-12 0z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_bonus_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 2a6 6 0 00-1.743 11.743 6 6 0 107.486-7.486A6.003 6.003 0 008 2zm5.978 6.522a6.002 6.002 0 01-5.456 5.456 4 4 0 105.455-5.455zM4 8a4 4 0 118 0 4 4 0 01-8 0z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_cabinet" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M24 24a1 1 0 11-2 0v-2a3 3 0 00-3-3h-8a3 3 0 00-3 3v2a1 1 0 11-2 0v-2a5 5 0 015-5h8a5 5 0 015 5v2zm-9-9a5 5 0 110-10 5 5 0 010 10zm0-2a3 3 0 100-6 3 3 0 000 6z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_cabinet_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 2a5 5 0 100 10 5 5 0 000-10zM7 7a3 3 0 116 0 3 3 0 01-6 0zM4 17a2 2 0 012-2h8a2 2 0 012 2v1a1 1 0 102 0v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1a1 1 0 102 0v-1z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_card_next" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.293 20.293L17.586 15l-5.293-5.293a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_card_next_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.293 15.293L12.586 10 7.293 4.707a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_card_prev" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.707 20.293a1 1 0 01-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L12.414 15l5.293 5.293z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_card_prev_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.707 15.293a1 1 0 01-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L7.414 10l5.293 5.293z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_card_sl_next" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.293 23.293a1 1 0 101.414 1.414l9-9a1 1 0 000-1.414l-9-9a1 1 0 00-1.414 1.414L17.586 15l-8.293 8.293z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_card_sl_next_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.293 15.293L12.586 10 7.293 4.707a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_card_sl_prev" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.707 23.293a1 1 0 01-1.414 1.414l-9-9a1 1 0 010-1.414l9-9a1 1 0 111.414 1.414L11.414 15l8.293 8.293z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_card_sl_prev_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.707 15.293a1 1 0 01-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L7.414 10l5.293 5.293z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_cart" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.848 9.988a1 1 0 11.304-1.976l13 2a1 1 0 01.818 1.23l-1.59 6.343A2.995 2.995 0 0121.4 20H10.7a3 3 0 01-3-2.414L5.34 5.804A1 1 0 004.361 5H2a1 1 0 010-2h2.36a3 3 0 012.942 2.411l2.359 11.784c.094.475.516.814 1.019.805h10.74c.483.01.905-.33 1.01-.853l1.333-5.325-11.915-1.834zM21 27a2 2 0 110-4 2 2 0 010 4zm-11 0a2 2 0 110-4 2 2 0 010 4z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_cart_add" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 11.586V8a1 1 0 112 0v3.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a.997.997 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L15 11.586zM2 5a1 1 0 010-2h2.36a3 3 0 012.942 2.411l2.359 11.784c.094.475.516.814 1.019.805h10.74c.483.01.905-.33 1.01-.853l1.6-6.39a1 1 0 011.94.486l-1.59 6.342A2.995 2.995 0 0121.4 20H10.7a3 3 0 01-3-2.414L5.34 5.804A1 1 0 004.361 5H2zm19 22a2 2 0 110-4 2 2 0 010 4zm-11 0a2 2 0 110-4 2 2 0 010 4z"/></symbol><symbol viewBox="0 0 40 40" id="icon_shop_cart_add_big" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20 16.586V13a1 1 0 112 0v3.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a.997.997 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L20 16.586zM7 10a1 1 0 010-2h2.36a3 3 0 012.942 2.411l2.359 11.784c.094.475.516.814 1.019.805h10.74c.483.01.905-.33 1.01-.853l1.6-6.39a1 1 0 011.94.486l-1.59 6.342A2.995 2.995 0 0126.4 25H15.7a3 3 0 01-3-2.414l-2.36-11.782A1 1 0 009.36 10H7zm19 22a2 2 0 110-4 2 2 0 010 4zm-11 0a2 2 0 110-4 2 2 0 010 4z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_cart_add_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2a1 1 0 011-1h1.202a2 2 0 011.95 1.557l1.97 8.665a1 1 0 00.974.778h7.813a1 1 0 00.974-.775l1.143-4.95a1 1 0 011.948.45l-1.142 4.95A3 3 0 0114.91 14H7.096a3 3 0 01-2.925-2.335L2.201 3H1a1 1 0 01-1-1zm6.5 14a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 3a1 1 0 10-2 0v3.586l-.293-.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L12 6.586V3z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_cart_not" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 5a1 1 0 010-2h2.36a3 3 0 012.942 2.411l2.359 11.784c.094.475.516.814 1.019.805h10.74c.483.01.905-.33 1.01-.853l1.6-6.39a1 1 0 011.94.486l-1.59 6.342A2.995 2.995 0 0121.4 20H10.7a3 3 0 01-3-2.414L5.34 5.804A1 1 0 004.361 5H2zm19 22a2 2 0 110-4 2 2 0 010 4zm-11 0a2 2 0 110-4 2 2 0 010 4z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M17.414 11l2.293 2.293a1 1 0 01-1.414 1.414L16 12.414l-2.293 2.293a1 1 0 01-1.414-1.414L14.586 11l-2.293-2.293a1 1 0 011.414-1.414L16 9.586l2.293-2.293a1 1 0 111.414 1.414L17.414 11z"/></symbol><symbol viewBox="0 0 40 40" id="icon_shop_cart_not_big" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 10a1 1 0 010-2h2.36a3 3 0 012.942 2.411l2.359 11.784c.094.475.516.814 1.019.805h10.74c.483.01.905-.33 1.01-.853l1.6-6.39a1 1 0 011.94.486l-1.59 6.342A2.995 2.995 0 0126.4 25H15.7a3 3 0 01-3-2.414l-2.36-11.782A1 1 0 009.36 10H7zm19 22a2 2 0 110-4 2 2 0 010 4zm-11 0a2 2 0 110-4 2 2 0 010 4z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M22.414 16l2.293 2.293a1 1 0 01-1.414 1.414L21 17.414l-2.293 2.293a1 1 0 01-1.414-1.414L19.586 16l-2.293-2.293a1 1 0 011.414-1.414L21 14.586l2.293-2.293a1 1 0 011.414 1.414L22.414 16z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_cart_not_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 2a1 1 0 011-1h1.202a2 2 0 011.95 1.557l1.97 8.665a1 1 0 00.974.778h7.813a1 1 0 00.974-.775l1.143-4.95a1 1 0 011.948.45l-1.142 4.95A3 3 0 0114.91 14H7.096a3 3 0 01-2.925-2.335L2.201 3H1a1 1 0 01-1-1zm6.5 14a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM9.707 4.293a1 1 0 00-1.414 1.414L9.586 7 8.293 8.293a1 1 0 001.414 1.414L11 8.414l1.293 1.293a1 1 0 001.414-1.414L12.414 7l1.293-1.293a1 1 0 00-1.414-1.414L11 5.586 9.707 4.293z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_cart_small" xmlns="http://www.w3.org/2000/svg"><path d="M1 1a1 1 0 000 2h1.202l1.97 8.665A3 3 0 007.095 14h7.813a3 3 0 002.923-2.325l1.142-4.95a1 1 0 00-.833-1.215l-10.5-1.5a1 1 0 00-.282 1.98l9.422 1.346-.898 3.889a1 1 0 01-.974.775H7.096a1 1 0 01-.975-.778L4.152 2.557A2 2 0 002.202 1H1zm4 16.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm9 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_close" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 13.586l7.293-7.293a1 1 0 111.414 1.414L16.414 15l7.293 7.293a1 1 0 01-1.414 1.414L15 16.414l-7.293 7.293a1 1 0 01-1.414-1.414L13.586 15 6.293 7.707a1 1 0 011.414-1.414L15 13.586z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_close_mini" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 011.414-1.414L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_close_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_color_check" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M22.293 9.293a1 1 0 111.414 1.414l-9 9a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L14 17.586l8.293-8.293z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_color_check_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.293 13.707l-4-4a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 111.414 1.414l-7 7a.997.997 0 01-1.414 0z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_compare" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 5.91C6 5.406 6.448 5 7 5s1 .407 1 .91v18.18c0 .503-.448.91-1 .91s-1-.407-1-.91V5.91zm8 4c0-.503.448-.91 1-.91s1 .407 1 .91v14.18c0 .503-.448.91-1 .91s-1-.407-1-.91V9.91zm8 6c0-.503.448-.91 1-.91s1 .407 1 .91v8.18c0 .503-.448.91-1 .91s-1-.407-1-.91v-8.18z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_compare_add" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 5.91C6 5.406 6.448 5 7 5s1 .407 1 .91v18.18c0 .503-.448.91-1 .91s-1-.407-1-.91V5.91zm8 5c0-.503.448-.91 1-.91s1 .407 1 .91v13.18c0 .503-.448.91-1 .91s-1-.407-1-.91V10.91zm8 7c0-.503.448-.91 1-.91s1 .407 1 .91v6.18c0 .503-.448.91-1 .91s-1-.407-1-.91v-6.18zM24 8h2a1 1 0 110 2h-2v2a1 1 0 11-2 0v-2h-2a1 1 0 110-2h2V6a1 1 0 112 0v2z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_compare_add_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 2.91C3 2.406 3.448 2 4 2s1 .407 1 .91v14.18c0 .503-.448.91-1 .91s-1-.407-1-.91V2.91zm6 4c0-.503.448-.91 1-.91s1 .407 1 .91v10.18c0 .503-.448.91-1 .91s-1-.407-1-.91V6.91zm6 5c0-.503.448-.91 1-.91s1 .407 1 .91v5.18c0 .503-.448.91-1 .91s-1-.407-1-.91v-5.18zM17 4h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 112 0v1z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_compare_added" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6 5.91C6 5.406 6.448 5 7 5s1 .407 1 .91v18.18c0 .503-.448.91-1 .91s-1-.407-1-.91V5.91zm8 4c0-.503.448-.91 1-.91s1 .407 1 .91v14.18c0 .503-.448.91-1 .91s-1-.407-1-.91V9.91zm8 6c0-.503.448-.91 1-.91s1 .407 1 .91v8.18c0 .503-.448.91-1 .91s-1-.407-1-.91v-8.18z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_compare_added_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 2.91C3 2.406 3.448 2 4 2s1 .407 1 .91v14.18c0 .503-.448.91-1 .91s-1-.407-1-.91V2.91zm6 4c0-.503.448-.91 1-.91s1 .407 1 .91v10.18c0 .503-.448.91-1 .91s-1-.407-1-.91V6.91zm6 4c0-.503.448-.91 1-.91s1 .407 1 .91v6.18c0 .503-.448.91-1 .91s-1-.407-1-.91v-6.18z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_compare_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 2.91C3 2.406 3.448 2 4 2s1 .407 1 .91v14.18c0 .503-.448.91-1 .91s-1-.407-1-.91V2.91zm6 4c0-.503.448-.91 1-.91s1 .407 1 .91v10.18c0 .503-.448.91-1 .91s-1-.407-1-.91V6.91zm6 4c0-.503.448-.91 1-.91s1 .407 1 .91v6.18c0 .503-.448.91-1 .91s-1-.407-1-.91v-6.18z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_del" xmlns="http://www.w3.org/2000/svg"><path d="M17 9h-4a1 1 0 110-2h4a1 1 0 110 2z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8 10h14a1 1 0 110 2h-1.087l-.752 8.272A3 3 0 0117.174 23h-4.348a3 3 0 01-2.987-2.728L9.087 12H8a1 1 0 110-2zm3.83 10.09L11.096 12h7.81l-.736 8.09a1 1 0 01-.995.91h-4.348a1 1 0 01-.995-.91z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_del_cart" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.414 15l2.293 2.293a1 1 0 01-1.414 1.414L15 16.414l-2.293 2.293a1 1 0 01-1.414-1.414L13.586 15l-2.293-2.293a1 1 0 011.414-1.414L15 13.586l2.293-2.293a1 1 0 011.414 1.414L16.414 15z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_del_cart_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 011.414-1.414L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_del_small" xmlns="http://www.w3.org/2000/svg"><path d="M12 4H8a1 1 0 010-2h4a1 1 0 110 2z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M3 5h14a1 1 0 110 2h-1.087l-.752 8.272A3 3 0 0112.174 18H7.826a3 3 0 01-2.987-2.728L4.087 7H3a1 1 0 010-2zm3.83 10.09L6.096 7h7.81l-.736 8.09a1 1 0 01-.995.91H7.826a1 1 0 01-.995-.91z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_favorite" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.801 7.931c2.432-2.575 6.4-2.575 8.833 0L15 8.32l.366-.388c2.433-2.575 6.4-2.575 8.833 0 2.401 2.543 2.401 6.643 0 9.186l-.016.017-8.472 8.569a1 1 0 01-1.422 0l-8.472-8.57-.016-.016c-2.401-2.543-2.401-6.643 0-9.186zm7.379 1.374c-1.643-1.74-4.282-1.74-5.925 0-1.67 1.769-1.673 4.658-.007 6.431L15 23.578l7.752-7.842c1.666-1.773 1.664-4.662-.007-6.431-1.643-1.74-4.282-1.74-5.925 0l-1.093 1.157a1 1 0 01-1.454 0L13.18 9.305z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_favorite_add" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.801 7.931c2.432-2.575 6.4-2.575 8.833 0L15 8.32l.366-.388c2.433-2.575 6.4-2.575 8.833 0 2.401 2.543 2.401 6.643 0 9.186l-.016.017-8.472 8.569a1 1 0 01-1.422 0l-8.472-8.57-.016-.016c-2.401-2.543-2.401-6.643 0-9.186zm7.379 1.374c-1.643-1.74-4.282-1.74-5.925 0-1.67 1.769-1.673 4.658-.007 6.431L15 23.578l7.752-7.842c1.666-1.773 1.664-4.662-.007-6.431-1.643-1.74-4.282-1.74-5.925 0l-1.093 1.157a1 1 0 01-1.454 0L13.18 9.305z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_favorite_add_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.495 3.608c2.025-2.144 5.333-2.144 7.357 0l.148.156.148-.156c2.024-2.144 5.332-2.144 7.357 0 1.994 2.111 1.994 5.512 0 7.623l-.016.017-6.778 6.855a1 1 0 01-1.422 0L2.51 11.247l-.016-.016C.502 9.12.502 5.72 2.495 3.608zM8.398 4.98c-1.235-1.308-3.213-1.308-4.448 0-1.264 1.339-1.267 3.53-.008 4.87L10 15.978l6.058-6.128c1.259-1.341 1.256-3.531-.008-4.869-1.235-1.308-3.213-1.308-4.448 0l-.875.926a1 1 0 01-1.454 0l-.875-.926z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_favorite_added" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.801 7.931c2.432-2.575 6.4-2.575 8.833 0L15 8.32l.366-.388c2.433-2.575 6.4-2.575 8.833 0 2.401 2.543 2.401 6.643 0 9.186l-.016.017-8.472 8.569a1 1 0 01-1.422 0l-8.472-8.57-.016-.016c-2.401-2.543-2.401-6.643 0-9.186z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_favorite_added_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.495 4.608c2.025-2.144 5.333-2.144 7.357 0l.148.156.148-.156c2.024-2.144 5.332-2.144 7.357 0 1.994 2.111 1.994 5.512 0 7.623l-.016.017-6.778 6.855a1 1 0 01-1.422 0L2.51 12.247l-.016-.016C.502 10.12.502 6.72 2.495 4.608z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_favorite_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.495 3.608c2.025-2.144 5.333-2.144 7.357 0l.148.156.148-.156c2.024-2.144 5.332-2.144 7.357 0 1.994 2.111 1.994 5.512 0 7.623l-.016.017-6.778 6.855a1 1 0 01-1.422 0L2.51 11.247l-.016-.016C.502 9.12.502 5.72 2.495 3.608zM8.398 4.98c-1.235-1.308-3.213-1.308-4.448 0-1.264 1.339-1.267 3.53-.008 4.87L10 15.978l6.058-6.128c1.259-1.341 1.256-3.531-.008-4.869-1.235-1.308-3.213-1.308-4.448 0l-.875.926a1 1 0 01-1.454 0l-.875-.926z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_file" xmlns="http://www.w3.org/2000/svg"><path d="M11 17h8a1 1 0 100-2h-8a1 1 0 100 2zm6 4h-6a1 1 0 110-2h6a1 1 0 110 2z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 3h10.414L25 8.586V23a4 4 0 01-4 4H9a4 4 0 01-4-4V7a4 4 0 014-4zm0 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V11h-3a3 3 0 01-3-3V5H9zm10 .414V8a1 1 0 001 1h2.586L19 5.414z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_file_small" xmlns="http://www.w3.org/2000/svg"><path d="M13 15a1 1 0 100-2H7a1 1 0 100 2h6zm1-5a1 1 0 01-1 1H7a1 1 0 110-2h6a1 1 0 011 1zM9 7a1 1 0 000-2H7a1 1 0 000 2h2z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4 19a2 2 0 01-2-2V3a2 2 0 012-2h8.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V17a2 2 0 01-2 2H4zM16 7v10H4V3h8v3.002c0 .552.447.998 1 .998h3z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_filter" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.874 11A4.002 4.002 0 013 10a4 4 0 017.874-1H24a1 1 0 110 2H10.874zm8.252 8A4.002 4.002 0 0127 20a4 4 0 01-7.874 1H6a1 1 0 110-2h13.126zM23 22a2 2 0 100-4 2 2 0 000 4zM7 12a2 2 0 100-4 2 2 0 000 4z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_filter_minus" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 10a1 1 0 01-1 1H6a1 1 0 110-2h8a1 1 0 011 1z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_filter_plus" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11 9h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 012 0v3z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_filter_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 9a4 4 0 113.874-5H16a1 1 0 110 2H8.874A4.002 4.002 0 015 9zm10 2a4 4 0 11-3.874 5H4a1 1 0 110-2h7.126c.444-1.725 2.01-3 3.874-3zm0 6a2 2 0 100-4 2 2 0 000 4zM5 7a2 2 0 100-4 2 2 0 000 4z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_gift" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 8c0 .729.195 1.412.535 2H5a2 2 0 00-2 2v3a2 2 0 002 2v6a3 3 0 003 3h14a3 3 0 003-3v-6a2 2 0 002-2v-3a2 2 0 00-2-2h-3.535A4 4 0 0015 5.354 4 4 0 008 8zm-3 4v3h20v-3H5zm9-2V8a2 2 0 10-2 2h2zm4 0a2 2 0 10-2-2v2h2zm-2 14h6a1 1 0 001-1v-6h-7v7zm-2-7v7H8a1 1 0 01-1-1v-6h7z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_gift_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M18 5h-3.17A3 3 0 0010 1.764 3 3 0 005.17 5H2a1 1 0 00-1 1v4a1 1 0 001 1v7a1 1 0 001 1h14a1 1 0 001-1v-7a1 1 0 001-1V6a1 1 0 00-1-1zm-7 6v6h5v-6h-5zm-2 6H4v-6h5v6zM3 9V7h14v2H3zm6-5a1 1 0 10-1 1h1V4zm2 0v1h1a1 1 0 10-1-1z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_lazy_btn" xmlns="http://www.w3.org/2000/svg"><path d="M14 7a1 1 0 112 0v7h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H6.818A.818.818 0 016 15.182v-.364c0-.452.366-.818.818-.818H14V7z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_lazy_btn_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11 9h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 012 0v3z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_minus" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20 15a1 1 0 01-1 1h-8a1 1 0 110-2h8a1 1 0 011 1z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_minus_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15 10a1 1 0 01-1 1H6a1 1 0 110-2h8a1 1 0 011 1z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_not_available" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 15C3 8.373 8.373 3 15 3s12 5.373 12 12-5.373 12-12 12S3 21.627 3 15zM15 5C9.477 5 5 9.477 5 15s4.477 10 10 10 10-4.477 10-10S20.523 5 15 5zm3.707 6.293a1 1 0 010 1.414L16.414 15l2.293 2.293a1 1 0 01-1.414 1.414L15 16.414l-2.293 2.293a1 1 0 01-1.414-1.414L13.586 15l-2.293-2.293a1 1 0 011.414-1.414L15 13.586l2.293-2.293a1 1 0 011.414 0z" opacity=".2"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_not_available_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 1a9 9 0 100 18 9 9 0 000-18zm-7 9a7 7 0 1114 0 7 7 0 01-14 0zm9.707-2.707a1 1 0 010 1.414L11.414 10l1.293 1.293a1 1 0 01-1.414 1.414L10 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L8.586 10 7.293 8.707a1 1 0 011.414-1.414L10 8.586l1.293-1.293a1 1 0 011.414 0z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_onrequest" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3 15C3 8.373 8.373 3 15 3s12 5.373 12 12-5.373 12-12 12S3 21.627 3 15zM15 5C9.477 5 5 9.477 5 15s4.477 10 10 10 10-4.477 10-10S20.523 5 15 5zm5.698 4.384a1 1 0 01-.011 1.415l-3.752 3.692a2 2 0 11-3.867-.01l-2.775-2.774a1 1 0 111.414-1.414l2.775 2.775a2.006 2.006 0 011.045.002l3.757-3.697a1 1 0 011.414.011z"/></symbol><symbol viewBox="0 0 40 40" id="icon_shop_onrequest_big" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 20c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12S8 26.627 8 20zm12-10c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm5.698 4.384a1 1 0 01-.011 1.415l-3.752 3.692a2 2 0 11-3.867-.01l-2.775-2.774a1 1 0 011.414-1.414l2.775 2.775a2.006 2.006 0 011.045.002l3.757-3.697a1 1 0 011.414.011z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_onrequest_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 1a9 9 0 100 18 9 9 0 000-18zm-7 9a7 7 0 1114 0 7 7 0 01-14 0zm10.707-1.793a1 1 0 00-1.414-1.414L10 9.086 8.207 7.293a1 1 0 10-1.414 1.414l2.5 2.5a1 1 0 001.414 0l3-3z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_options_down" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.293 6.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 011.414-1.414L10 11.586l5.293-5.293z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_options_down_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.293 12.707l-3-3a1 1 0 011.414-1.414L10 10.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a.997.997 0 01-1.414 0z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_options_up" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.293 13.707L10 8.414l-5.293 5.293a1 1 0 01-1.414-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_options_up_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.293 7.293a.997.997 0 011.414 0l3 3a1 1 0 01-1.414 1.414L10 9.414l-2.293 2.293a1 1 0 01-1.414-1.414l3-3z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_pagelist_dots" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.5 16.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5.5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7-1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_pagelist_dots_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.5 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm5.5 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7-1.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_pagelist_first" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.707 21.707a1 1 0 000-1.414L10.414 15l5.293-5.293a1 1 0 00-1.414-1.414l-6 6a1 1 0 000 1.414l6 6a1 1 0 001.414 0zm6 0a1 1 0 000-1.414L16.414 15l5.293-5.293a1 1 0 00-1.414-1.414l-6 6a1 1 0 000 1.414l6 6a1 1 0 001.414 0z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_pagelist_first_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.707 16.707a1 1 0 000-1.414L5.414 10l5.293-5.293a1 1 0 00-1.414-1.414l-6 6a1 1 0 000 1.414l6 6a1 1 0 001.414 0zm6 0a1 1 0 000-1.414L11.414 10l5.293-5.293a1 1 0 00-1.414-1.414l-6 6a1 1 0 000 1.414l6 6a1 1 0 001.414 0z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_pagelist_last" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.586 15l-5.293 5.293a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414l-6-6a1 1 0 00-1.414 1.414L13.586 15zm6 0l-5.293 5.293a1 1 0 001.414 1.414l6-6a1 1 0 000-1.414l-6-6a1 1 0 10-1.414 1.414L19.586 15z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_pagelist_last_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.586 10l-5.293 5.293a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414l-6-6a1 1 0 00-1.414 1.414L8.586 10zm6 0l-5.293 5.293a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414l-6-6a1 1 0 00-1.414 1.414L14.586 10z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_pagelist_next" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.293 20.293L17.586 15l-5.293-5.293a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_pagelist_next_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.293 15.293L12.586 10 7.293 4.707a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_pagelist_prev" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.707 20.293a1 1 0 01-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L12.414 15l5.293 5.293z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_pagelist_prev_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.707 15.293a1 1 0 01-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L7.414 10l5.293 5.293z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_plus" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 14h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3h-3a1 1 0 110-2h3v-3a1 1 0 112 0v3z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_plus_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11 9h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 012 0v3z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_pre_order" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.848 9.988a1 1 0 11.304-1.976l13 2a1 1 0 01.818 1.23l-1.59 6.343A2.995 2.995 0 0121.4 20H10.7a3 3 0 01-3-2.414L5.34 5.804A1 1 0 004.361 5H2a1 1 0 010-2h2.36a3 3 0 012.942 2.411l2.359 11.784c.094.475.516.814 1.019.805h10.74c.483.01.905-.33 1.01-.853l1.333-5.325-11.915-1.834zM21 27a2 2 0 110-4 2 2 0 010 4zm-11 0a2 2 0 110-4 2 2 0 010 4z" opacity=".2"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_pre_order_small" xmlns="http://www.w3.org/2000/svg"><path d="M1 1a1 1 0 000 2h1.202l1.97 8.665A3 3 0 007.095 14h7.813a3 3 0 002.923-2.325l1.142-4.95a1 1 0 00-.833-1.215l-10.5-1.5a1 1 0 00-.282 1.98l9.422 1.346-.898 3.889a1 1 0 01-.974.775H7.096a1 1 0 01-.975-.778L4.152 2.557A2 2 0 002.202 1H1zm4 16.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm9 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_preview" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M27.127 15.488C23.94 9.783 19.92 7 15 7c-4.777 0-8.706 2.624-11.848 8 3.142 5.376 7.071 8 11.848 8 3.808 0 7.058-1.66 9.816-5.04a1 1 0 111.55 1.263C23.24 23.054 19.43 25 15 25c-5.708 0-10.355-3.217-13.873-9.512L.854 15l.273-.488C4.645 8.217 9.292 5 15 5s10.355 3.217 13.873 9.512a1 1 0 11-1.746.976zM15 20a5 5 0 100-10 5 5 0 000 10zm0-2a3 3 0 110-6 3 3 0 010 6z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_preview_small" xmlns="http://www.w3.org/2000/svg"><path d="M16.59 10.414C15.076 7.084 12.915 5.5 10 5.5c-2.792 0-4.892 1.453-6.394 4.5 1.502 3.047 3.602 4.5 6.394 4.5 1.898 0 3.452-.666 4.727-2.021a1 1 0 011.457 1.37C14.529 15.61 12.447 16.5 10 16.5c-3.751 0-6.59-2.082-8.41-6.086L1.402 10l.188-.414C3.41 5.582 6.249 3.5 10 3.5c3.751 0 6.59 2.082 8.41 6.086a1 1 0 11-1.82.828z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10 13a3 3 0 100-6 3 3 0 000 6zm0-2a1 1 0 110-2 1 1 0 010 2z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_pricelist" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 8a1 1 0 000 2h20a1 1 0 100-2H5zm0 8a1 1 0 100 2h20a1 1 0 100-2H5zm-1 5a1 1 0 011-1h20a1 1 0 110 2H5a1 1 0 01-1-1zm1-9a1 1 0 100 2h20a1 1 0 100-2H5z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_pricelist_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 11a1 1 0 011 1v3.992a1 1 0 01-1 1L4 17a1 1 0 01-1-1v-4a1 1 0 011-1h12zm1-3.007a1 1 0 01-1 1L4 8.999a1 1 0 01-1-1V4a1 1 0 011-1h12a1 1 0 011 1v3.993z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_quick_view_next" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.293 23.293a1 1 0 101.414 1.414l9-9a1 1 0 000-1.414l-9-9a1 1 0 00-1.414 1.414L17.586 15l-8.293 8.293z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_quick_view_next_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.47 3.47a.75.75 0 011.06 0l6 6a.75.75 0 010 1.06l-6 6a.75.75 0 01-1.06-1.06L11.94 10 6.47 4.53a.75.75 0 010-1.06z" opacity=".2"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_quick_view_prev" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.707 23.293a1 1 0 01-1.414 1.414l-9-9a1 1 0 010-1.414l9-9a1 1 0 111.414 1.414L11.414 15l8.293 8.293z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_quick_view_prev_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.53 3.47a.75.75 0 010 1.06L8.06 10l5.47 5.47a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z" opacity=".2"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_refresh" xmlns="http://www.w3.org/2000/svg"><path d="M8.292 17.295l-1.286 1.29v-3.271c-.1-2.774 1.26-5.372 3.607-6.92a8.55 8.55 0 017.999-.728 1 1 0 10.776-1.843 10.55 10.55 0 00-9.876.9c-2.927 1.93-4.63 5.188-4.506 8.627v3.236l-2.3-2.293a1 1 0 10-1.412 1.416l3.947 3.935a.998.998 0 00.765.356h.003a.997.997 0 00.71-.294l2.99-2.999a1 1 0 10-1.417-1.412zm12.001-4.589a1 1 0 001.415 0l1.286-1.29v3.27c.1 2.774-1.26 5.373-3.607 6.92a8.55 8.55 0 01-7.999.728 1 1 0 10-.776 1.843 10.55 10.55 0 009.876-.9c2.927-1.93 4.63-5.188 4.506-8.627v-3.24l2.3 2.296a1 1 0 101.412-1.415l-4.005-3.999a.995.995 0 00-.7-.292h-.007a.997.997 0 00-.72.307l-2.982 2.985a1 1 0 00.001 1.414z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_refresh_small" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#dlclip0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 4a6 6 0 00-6 6v2.586l.293-.293a1 1 0 011.414 1.414l-2 2-.707.707-.707-.707-2-2a1 1 0 111.414-1.414l.293.293V10a8 8 0 0111-7.418 1 1 0 11-.75 1.854A5.98 5.98 0 0010 4zm8 3.414l.293.293a1 1 0 101.414-1.414l-2-2L17 3.586l-.707.707-2 2a1 1 0 001.414 1.414L16 7.414V10a6 6 0 01-8.25 5.564A1 1 0 007 17.418 8 8 0 0018 10V7.414z"/></g><defs><clipPath id="dlclip0"><path d="M0 0h20v20H0z"/></clipPath></defs></symbol><symbol viewBox="0 0 30 30" id="icon_shop_return" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.293 14.293l4-4a1 1 0 111.414 1.414L13.414 15l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a.997.997 0 010-1.414z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_return_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.293 9.293l4-4a1 1 0 111.414 1.414L8.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a.997.997 0 010-1.414z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_sale" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.5 9a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm-.5 2.5a.5.5 0 111 0 .5.5 0 01-1 0zm5 7a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zm2.5-.5a.5.5 0 100 1 .5.5 0 000-1z"/><path d="M19.707 11.707a1 1 0 00-1.414-1.414l-8 8a1 1 0 001.414 1.414l8-8z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M16.893 3.251a3 3 0 00-3.786 0l-.683.556a1 1 0 01-.79.211l-.87-.14a3 3 0 00-3.278 1.894l-.314.822a1 1 0 01-.578.578l-.822.314a3 3 0 00-1.894 3.279l.14.87a1 1 0 01-.212.789l-.555.683a3 3 0 000 3.786l.555.683a1 1 0 01.212.79l-.14.869a3 3 0 001.894 3.279l.822.314a1 1 0 01.578.578l.314.822a3 3 0 003.279 1.894l.87-.14a1 1 0 01.789.212l.683.555a3 3 0 003.786 0l.683-.555a1 1 0 01.79-.212l.869.14a3 3 0 003.279-1.894l.314-.822a1 1 0 01.578-.578l.822-.314a3 3 0 001.893-3.279l-.14-.87a1 1 0 01.212-.789l.556-.683a3 3 0 000-3.786l-.556-.683a1 1 0 01-.211-.79l.14-.869a3 3 0 00-1.894-3.279l-.822-.314a1 1 0 01-.578-.578l-.314-.822a3 3 0 00-3.28-1.894l-.868.14a1 1 0 01-.79-.211l-.683-.556zM14.37 4.802a1 1 0 011.262 0l.683.556a3 3 0 002.369.635l.87-.14a1 1 0 011.092.631l.314.823a3 3 0 001.734 1.734l.823.314a1 1 0 01.63 1.093l-.139.869a3 3 0 00.635 2.369l.556.683a1 1 0 010 1.262l-.556.683a3 3 0 00-.635 2.37l.14.868a1 1 0 01-.631 1.093l-.823.314a3 3 0 00-1.734 1.734l-.314.823a1 1 0 01-1.093.63l-.869-.139a3 3 0 00-2.37.635l-.682.556a1 1 0 01-1.262 0l-.683-.556a3 3 0 00-2.37-.635l-.868.14a1 1 0 01-1.093-.631l-.314-.823a3 3 0 00-1.734-1.734l-.823-.314a1 1 0 01-.63-1.093l.139-.869a3 3 0 00-.635-2.369l-.556-.683a1 1 0 010-1.262l.556-.683a3 3 0 00.635-2.369l-.14-.87a1 1 0 01.631-1.092l.823-.314A3 3 0 009.04 7.307l.314-.823a1 1 0 011.093-.63l.869.139a3 3 0 002.369-.635l.683-.556z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_sale_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.397 3.573c-.511.511-1.403.75-2.101.563l-.783-.21c-.014-.003-.245.803-.245.803-.187.698-.84 1.352-1.539 1.539l-.781.21c-.016.004.188.818.188.818.187.697-.052 1.59-.563 2.1L3 9.97c-.01.011.573.615.573.615.51.51.75 1.402.563 2.1l-.21.783c-.004.015.803.246.803.246.698.186 1.351.84 1.538 1.538l.21.782c.004.015.818-.189.818-.189.698-.187 1.59.052 2.101.563l.573.573c.011.01.614-.573.614-.573.51-.51 1.403-.75 2.101-.563l.782.21c.015.004.246-.803.246-.803.187-.698.84-1.351 1.538-1.538l.782-.21c.015-.004-.188-.818-.188-.818-.187-.698.051-1.59.563-2.101l.572-.573c.011-.011-.572-.614-.572-.614-.511-.51-.75-1.403-.563-2.101l.21-.783c.003-.014-.804-.245-.804-.245-.697-.187-1.35-.84-1.538-1.539l-.21-.781c-.004-.016-.818.188-.818.188-.698.187-1.59-.052-2.101-.563L10.01 3c-.011-.01-.614.573-.614.573zm1.782-2.085l.602.602c.125.125.461.215.63.17l.824-.221c.89-.238 1.804.29 2.042 1.18l.22.822c.046.17.292.416.462.461l.823.221a1.668 1.668 0 011.18 2.042l-.222.823c-.045.17.045.506.17.63l.602.603a1.67 1.67 0 010 2.358l-.602.603c-.125.124-.215.46-.17.63l.221.823c.238.89-.29 1.804-1.18 2.042l-.822.22c-.17.046-.416.292-.461.462l-.221.823a1.668 1.668 0 01-2.042 1.18l-.823-.222c-.17-.045-.506.045-.63.17l-.603.602a1.67 1.67 0 01-2.358 0l-.603-.602c-.124-.125-.46-.215-.63-.17l-.823.221a1.668 1.668 0 01-2.042-1.18l-.22-.822c-.046-.17-.293-.416-.462-.461l-.823-.221a1.668 1.668 0 01-1.18-2.042l.222-.823c.045-.17-.045-.506-.17-.63l-.602-.603a1.668 1.668 0 010-2.358l.602-.603c.125-.124.215-.46.17-.63l-.221-.823a1.668 1.668 0 011.179-2.042l.823-.22c.17-.046.416-.292.461-.462l.221-.823a1.668 1.668 0 012.042-1.18l.823.222c.17.045.506-.045.63-.17l.603-.602a1.668 1.668 0 012.358 0zm1.114 4.805a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414-1.414l6-6zM7.5 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_search" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.032 19.618l3.675 3.675a1 1 0 01-1.414 1.414l-3.675-3.675a9 9 0 111.414-1.414zm-1.99-.762a7 7 0 10-.185.185.998.998 0 01.184-.185z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_search_action" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.032 19.618l3.675 3.675a1 1 0 01-1.414 1.414l-3.675-3.675a9 9 0 111.414-1.414zm-1.99-.762a7 7 0 10-.185.185.998.998 0 01.184-.185z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_search_action_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 16a7 7 0 115.606-2.808l3.101 3.1a1 1 0 01-1.414 1.415l-3.1-3.1A6.97 6.97 0 019 16zm0-2A5 5 0 109 4a5 5 0 000 10z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_search_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 16a7 7 0 115.606-2.808l3.101 3.1a1 1 0 01-1.414 1.415l-3.1-3.1A6.97 6.97 0 019 16zm0-2A5 5 0 109 4a5 5 0 000 10z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_simple" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M25 16a1 1 0 011 1v3.992a1 1 0 01-1 1L5 22a1 1 0 01-1-1v-4a1 1 0 011-1h20zm1-3.008a1 1 0 01-1 1L5 14a1 1 0 01-1-1V9a1 1 0 011-1h20a1 1 0 011 1v3.992z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_simple_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 3a1 1 0 011 1v7.988a1 1 0 01-.999 1l-12 .011a1 1 0 01-1.001-1V4a1 1 0 011-1h12zm1 12.999a.999.999 0 01-.999.998l-12 .003A1 1 0 114 15h12c.552 0 .999.447.999.999z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_slider_next" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.293 20.293L17.586 15l-5.293-5.293a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_slider_next_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.293 15.293L12.586 10 7.293 4.707a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_slider_prev" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.707 20.293a1 1 0 01-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L12.414 15l5.293 5.293z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_slider_prev_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.707 15.293a1 1 0 01-1.414 1.414l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L7.414 10l5.293 5.293z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_sort" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.71 8.293l3 3c.63.63.183 1.707-.708 1.707h-6c-.89 0-1.337-1.077-.707-1.707l3-3a1 1 0 011.414 0zm0 13.414l3-3c.63-.63.183-1.707-.708-1.707h-6c-.89 0-1.337 1.077-.707 1.707l3 3a1 1 0 001.414 0z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_sort_asc" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M26 21a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1h20a1 1 0 001-1v-1zm-7-6a1 1 0 00-1-1l-13 .001a1 1 0 00-1 1V16a1 1 0 001 1h13a1 1 0 001-1v-1zm-8-7a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1h6z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_sort_asc_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M18 15a1 1 0 00-1-1H3a1 1 0 100 2h14a1 1 0 001-1zm-4-5a1 1 0 00-1-1H3a1 1 0 000 2h10a1 1 0 001-1zM7 4a1 1 0 110 2H3a1 1 0 010-2h4z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_sort_desc" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M26 10a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1h20a1 1 0 011 1v1zm-7 6a1 1 0 01-1 1l-13-.001a1 1 0 01-1-1V15a1 1 0 011-1h13a1 1 0 011 1v1zm-8 7a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1h6z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_sort_desc_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M18 5a1 1 0 01-1 1H3a1 1 0 010-2h14a1 1 0 011 1zm-4 5a1 1 0 01-1 1H3a1 1 0 010-2h10a1 1 0 011 1zm-7 6a1 1 0 100-2H3a1 1 0 100 2h4z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_sort_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.71 3.293l3 3c.63.63.183 1.707-.708 1.707h-6c-.89 0-1.337-1.077-.707-1.707l3-3a1 1 0 011.414 0zm0 13.414l3-3c.63-.63.183-1.707-.708-1.707h-6c-.89 0-1.337 1.077-.707 1.707l3 3a1 1 0 001.414 0z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_tabs_down" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.293 11.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L15 16.586l5.293-5.293z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_tabs_down_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.293 6.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 011.414-1.414L10 11.586l5.293-5.293z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_tabs_up" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.293 18.707L15 13.414l-5.293 5.293a1 1 0 01-1.414-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_tabs_up_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.293 13.707L10 8.414l-5.293 5.293a1 1 0 01-1.414-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_tag_arr" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.707 14.293a.997.997 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L16.586 15l-3.293-3.293a1 1 0 011.414-1.414l4 4z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_tag_arr_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.707 9.293a.997.997 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L11.586 10 8.293 6.707a1 1 0 011.414-1.414l4 4z"/></symbol><symbol viewBox="0 0 30 30" id="icon_shop_thumbs" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 8a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1h4zm8 0a1 1 0 011 1v12a1 1 0 01-1 1h-3.992a1 1 0 01-1-1L12 9a1 1 0 011-1h4zm4 14a1 1 0 01-1-1V9a1 1 0 011-1h4a1 1 0 011 1v12a1 1 0 01-1 1h-4z"/></symbol><symbol viewBox="0 0 20 20" id="icon_shop_thumbs_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 3a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h4zm8 0a1 1 0 011 1v12a1 1 0 01-1 1h-3.992a1 1 0 01-1-1L11 4a1 1 0 011-1h4z"/></symbol><symbol viewBox="0 0 2 12" id="icon_shop_timer_dots" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 1a1 1 0 11-2 0 1 1 0 012 0zm0 10a1 1 0 11-2 0 1 1 0 012 0z"/></symbol><symbol viewBox="0 0 2 12" id="icon_shop_timer_dots_small" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 1a1 1 0 11-2 0 1 1 0 012 0zm0 10a1 1 0 11-2 0 1 1 0 012 0z"/></symbol></svg></div>';
	
					$('body').append(sprite);
				};
	
				var $cardHiddenOptions = $('.card-page .shop2-product .gr-product-options .option-item:hidden');
				
				if ($cardHiddenOptions.length>0) {
					$('.shop2-product .gr-product-options-more').addClass('show_more_btn');
				};
	
				$(document).on('click', '.card-page .shop2-product .gr-product-options-more__btn', function(){
					var currentText = $(this).data('text');
					var hideText    = $('html').attr('lang') == 'ru' ? 'Свернуть' : 'Hide';
	
					if ($(this).hasClass('active')) {
						$(this).removeClass('active');
						$(this).find('ins').text(currentText);
					} else {
						$(this).addClass('active');
						$(this).find('ins').text(hideText);
					};
	
					$cardHiddenOptions.stop().slideToggle(250);
				});
	
	
				if ($('.card-slider__thumbs-slider').length>0) {
		 			var vslider = tns({
					    container: '.card-slider__items-slider',
					    slideBy: 1,
					    mode: 'gallery',
					    axis: 'horizontal',
					    autoplay: false,
					    mouseDrag: true,
					    center: true,
					    autoWidth: false,
					    loop: false,
					    rewind: true,
					    swipeAngle: false,
					    preventActionWhenRunning: true,
						controls: true,
					    nav: true,
						navPosition: 'bottom',
					    controlsText: shop2_gr.settings.sliderControls,
	                    responsive: {
	                        320: {
	                            controls: false,
					    		nav: false
	                        },
	                        768: {
	                            controls: false,
					    		nav: false
	                        }
	                    }
				  	});
	
					var small_slider = tns({
						container: '.card-slider__thumbs-slider',
						loop: false,
						gutter: 20,
						center:false,
						mouseDrag: true,
						nav: false,
						controls: false,
						axis: 'horizontal',
						navPosition: 'bottom',
						preventActionWhenRunning: true,
						
	                    responsive: {
	                        320: {
	                            items: 3
	                        }
	                    }
					});
					
					var navIndex = $('.card-slider__items .tns-nav-active').index();
		  			$('.card-slider__thumbs-slider .card-slider__thumb').removeClass('tns-nav-active');
		  			$('.card-slider__thumbs-slider .card-slider__thumb').eq(navIndex).addClass('tns-nav-active');
					
					
	
				  	$(document).on('click', '.card-slider__thumbs-slider .card-slider__thumb', function(){
				  		var thisIndex = $(this).index();
				  		$('.card-slider__items .tns-nav button').eq(thisIndex).click();
				  		var navIndex = thisIndex;
			  			$('.card-slider__thumbs-slider .card-slider__thumb').removeClass('tns-nav-active');
			  			$('.card-slider__thumbs-slider .card-slider__thumb').eq(navIndex).addClass('tns-nav-active');
				  	});
	
					vslider.events.on('indexChanged', function(){
						small_slider.goTo(vslider.getInfo().index);
				  	});
	
					/*if ($('.card-slider__items').siblings('.card-slider__thumbs')) {
						$('.shop2-product__left').addClass('sibling-slider');
					}*/

					
	
				  	
				};
				
				if (!isMobile && jQuery().zoom) {
					$('.gr-image-zoom').zoom({
						magnify: 1,
						duration: 10,
						onZoomIn: function(){
							$(this).parent().addClass('hide_small_pic');
						},
						onZoomOut: function(){
							$(this).parent().removeClass('hide_small_pic');
						},
						callback: function(){
							var $zoomImg = $(this);
							var containerHeight = $zoomImg.parent().outerHeight();
							var containerWidth = $zoomImg.parent().outerWidth();
							var zoomImgHeight = Math.floor($zoomImg.height());
							var zoomImgWidth = Math.floor($zoomImg.width());
							var floatHeight = Math.floor(20 * zoomImgHeight / 100);
							var floatWidth = Math.floor(20 * zoomImgWidth / 100);
							var prevWidth = Math.floor($(this).prev().outerWidth());
							var prevHeight = Math.floor($(this).prev().outerHeight());
							
							var zoomFloatHeight = zoomImgHeight + floatHeight;
							var zoomFloatWidth = zoomImgWidth + floatWidth;
							var finalHeight = prevHeight+floatHeight;
							var finalWidth = prevWidth+floatWidth;
							
							if (zoomFloatHeight<=prevHeight-floatHeight || zoomFloatWidth<=prevWidth-floatWidth) {
								$(this).parent().addClass('hide_big_pic');
							};
							
							if (zoomImgHeight<=prevHeight || zoomImgWidth <=prevWidth) {
								$zoomImg.css({
									'width': finalWidth,
									'height': finalHeight
								});
							}
							
							if (finalHeight<=containerHeight && finalWidth<=containerWidth) {
								$(this).parent().addClass('hide_zoom_pic');
							}
						}
					});
				};
				
				if (shop2.mode == 'product') {
					shop2_gr.methods.grLazyFunc('.shop-product-share', function(){
						
						var url_1 = 'https://yastatic.net/es5-shims/0.0.2/es5-shims.min.js';
						var url_2 = 'https://yastatic.net/share2/share.js';
						
						$('.shop-product-share').append('<script src="'+url_1+'"></script><script src="'+url_2+'"></script>');
						$('#product-yashare-noscript').remove();
				    });
				};
	
			}, /*Слайдер в карточке товара*/
			
			
			responsiveTabs: function() {
	            if ($('#product-tabs').length) {
	                $('.shop-product-data__nav li, .r-tabs-accordion-title').on('click', function(e){
	                    e.preventDefault();
	                    let href = $(this).find('a').attr('href');
	                    let $descArea = $(href);
	                
	                    if ($descArea.is(':hidden')) {
	                        $('.shop-product-data__nav li, .r-tabs-accordion-title').removeClass('r-tabs-state-active');
	                        $('.shop-product-data__desc .desc-area').stop().slideUp(300);
	                    };
	                    
	                    if (window.matchMedia("(min-width: 768px)").matches) {
	                        $('#product-tabs a[href="'+ href +'"]').parent().addClass('r-tabs-state-active');
	                        $descArea.stop().slideDown(300);
	                    } else {
	                        $('#product-tabs a[href="'+ href +'"]').parent().toggleClass('r-tabs-state-active');
	                        $descArea.stop().slideToggle(300);
	                        if ($('.r-tabs-accordion-title.r-tabs-state-active').length) {
	                            setTimeout(function(){
	                                $('html, body').stop().animate({
	                                    scrollTop: $('.r-tabs-accordion-title.r-tabs-state-active').offset().top - 70   
	                                }, 500);
	                            }, 301);
	                        };
	                    };
	                });
	            };
	
	        }, /*Табы*/
	
	
			commentsBlock: function() {
				$('.comments-form__btn').on('click', function(){
					$(this).next().slideToggle(200);	
				});
			}, /*Комментарии*/
	
	
			/*rangeSlider: function() {
	
				rangeSliderInit('.filter-block .input_range_slider');
				rangeSliderInit('.search-form .input_range_slider', false);
	
			}, *//*Бегунки*/
	
	
			/*amountBlock: function() {
	
				amountInit();
	
			},*/
			amountBlock: function() {
				var lazyAmount = false;
				
				shop2_gr.methods.grLazyFunc('.shop2-product-amount', function() {
					if (!lazyAmount) {
		                shop2_gr.methods.amountInit();
					};
	                return lazyAmount = true;
	            });
			}, /*Количество*//*Количество*/
			timerBlock: function() {
				$(window).one('scroll', function() {
				    var grTimerTemplate = function(wrap) {
				        var timerBlocksFirst = $(wrap + '.gr-timer'),
				            $htmlLang = window._s3Lang.code;
				        if ($htmlLang == 'de' || $htmlLang == 'en') {
				            timerDays = 'days';
				            timerHours = 'hours';
				            timerMinutes = 'minutes';
				            timerSeconds = 'seconds'
				        } else {
				            timerDays = 'Дней';
				            timerHours = 'Часов';
				            timerMinutes = 'Минут';
				            timerSeconds = 'Секунд'
				        };
		
				        var outputFormat = '<span class="gr-timer-elem gr-timer-days"> <span class="gr-timer-number">%d </span> <em>' + timerDays + '</em> </span> <span class="gr-timer-delim"><svg class="gr-svg-icon"><use xlink:href="#icon_shop_timer_dots"></use></svg><svg class="gr-svg-icon gr_small_icon"><use xlink:href="#icon_shop_timer_dots_small"></use></svg></span> <span class="gr-timer-elem"> <span class="gr-timer-number">%h </span> <em>' + timerHours + '</em> </span> <span class="gr-timer-delim"><svg class="gr-svg-icon"><use xlink:href="#icon_shop_timer_dots"></use></svg><svg class="gr-svg-icon gr_small_icon"><use xlink:href="#icon_shop_timer_dots_small"></use></svg></span> <span class="gr-timer-elem"> <span class="gr-timer-number">%m </span> <em>' + timerMinutes + '</em> </span> <span class="gr-timer-delim"><svg class="gr-svg-icon"><use xlink:href="#icon_shop_timer_dots"></use></svg><svg class="gr-svg-icon gr_small_icon"><use xlink:href="#icon_shop_timer_dots_small"></use></svg></span> <span class="gr-timer-elem"> <span class="gr-timer-number">%s </span> <em>' + timerSeconds + '</em> </span>';
		
				        if (timerBlocksFirst.length) {
				            timerBlocksFirst.timer({
				                format_in: "%d.%M.%y %h:%m:%s",
				                format_out: outputFormat,
				                wrapChar: 'ins class="timerWrapChar"',
				                language: $htmlLang,
				                update_time: 1000,
				                onEnd: function() {
				                    $(this).hide();
				                },
				                onTimeChange: function() {
				                    $('.about-shares__timer-body .gr-timer-days').each(function() {
				                        var $first = $(this).find('.timerWrapChar:first-child');
				                        var $last = $(this).find('.timerWrapChar:last-child');
		
				                        if (+$first.text() == 0 && +$last.text() == 0) {
				                            $(this).hide();
				                            $(this).next().hide();
				                        }
				                    });
				                }
				            });
				        }
				    };
				    
			    	grTimerTemplate('.about-shares__timer-body');
		
				    $('.about-shares__timer-body .gr-timer-days').each(function() {
				        var $first = $(this).find('.timerWrapChar:first-child');
				        var $last = $(this).find('.timerWrapChar:last-child');
		
				        if (+$first.text() == 0 && +$last.text() == 0) {
				            $(this).hide();
				            $(this).next().hide();
				        }
				    });
				});
			}, /*Таймер*/
	
	
			buyOneClick: function() {
	
				$(document).on('click', '.buy-one-click:not(.preorder-btn-js):not(.buy-one-click-js)', function(e) {
					var productName = $(this).data('product-name');
					var productLink = $(this).data('product-link');
					
					if (shop2.mode == 'product' && $(this).parents('.kind-item').length<1) {
						var productAmount = $(this).parents('.shop2-product').find('.shop2-product-amount input').val();
					} else if ($('.product-quick-view').length>0 && $(this).parents('.kind-item').length<1) {
						var productAmount = $(this).parents('.shop2-product').find('.shop2-product-amount input').val();
					} else if ($(this).parents('.kind-item').length>0) {
						var productAmount = $(this).parents('.kind-item').find('.shop2-product-amount input').val();
					} else {
						var productAmount = $(this).parents('.shop2-product-item').find('.shop2-product-amount input').val();
					}
					
					$.ajax({
						url: $(this).data('api-url'),
						dataType: 'json',
						success: function(response) {
							if (!response.result.error) {
								
								$('.remodal[data-remodal-id="buy-one-click"] .tpl-anketa').remove();
								$(response.result.html).appendTo('.remodal[data-remodal-id="buy-one-click"]');
								
								var nameValue = productName  + ', количество - ' + productAmount;
								
								$('.remodal[data-remodal-id="buy-one-click"] .tpl-field__product-link input').val(productLink);
								$('.remodal[data-remodal-id="buy-one-click"] .tpl-field__product-name input').val(nameValue);
	
								s3From.initForms($('.remodal[data-remodal-id="buy-one-click"]'), function(){
									$('.remodal[data-remodal-id="buy-one-click"] .tpl-field__product-link input').val(productLink);
									$('.remodal[data-remodal-id="buy-one-click"] .tpl-field__product-name input').val(nameValue);
								});
								grFormDatePicker.init();
								
							}
						}
					});
				});
							
			}, /*Купить в 1 клик*/
	
	
			actionsBlock: function() {
				var actionEventName = 'mouseenter';
				if (isMobile) {
					actionEventName = 'click';
				};
				$(document).on(actionEventName, '.shop2-product-actions dt:not(.promo-action)', function(){
				    $('.shop2-product-actions dt').removeClass('dt_hover');
				    $('.shop2-product-actions dd').css('left', 'auto');
	
				    if (!isMobile) {
					    $(this).addClass('dt_hover');
					};
	
				    $(this).next().css('left', $(this).position().left);
				    $(this).next().css('top', $(this).position().top - $(this).next().outerHeight());
	
				    var nextLeft = $(this).next().offset().left;
				    var nextWidth = $(this).next().outerWidth();
				    var offsetSum = nextLeft + nextWidth;
				    var winWidth = $(window).width();
	
				    if ((offsetSum) > winWidth) {
				    	$(this).next().css('left', $(this).position().left - (offsetSum - winWidth))
				    }
				});
	
				$(document).on('mouseleave', '.shop2-product-actions dl', function(){
				    $('.shop2-product-actions dt').removeClass('dt_hover');
				    $('.shop2-product-actions dd').css('left', 'auto');
				});
	
			},
			
			
			cartPreview: function(){
				
				$(document).on('click', '.gr_order_one_page', function(e){
					eraseCookie('gr_delivery_scroll');
		    		createCookie('gr_delivery_scroll', 1, 30);
				});
				
				if (readCookie('gr_delivery_scroll') == '1') {
					eraseCookie('gr_delivery_scroll');
					
					setTimeout(function(){
						$('html, body').animate({
							scrollTop: $('.shop2-delivery').offset().top - 30
						}, 800);
					}, 1000);
				};
					
			},
	
	
			cartPage: function() {
	
				$(document).on('click', '.cart-params__more-btn', function(){
					var $parent     = $(this).parents('.cart-params');
					var $params     = $parent.find('.cart-params__body');
					var currentText = $(this).data('text');
					var hideText    = $('html').attr('lang') == 'ru' ? 'Свернуть' : 'Hide';
	
					if ($(this).hasClass('active')) {
						$(this).removeClass('active');
						$(this).find('ins').text(currentText);
					} else {
						$(this).addClass('active');
						$(this).find('ins').text(hideText);
					};
	
					$params.stop().slideToggle(250);
				});
	
	
				if (shop2.mode=='cart') {
					$('.shop2-warning').prependTo('.cart-page__left');		
				};
				
				/*Автопересчет в корзине*/
				if (shop2.mode=='cart') {
					var cartURL = shop2.uri + "/cart",
				        ajax, $idd, hash = {
						    del: shop2.apiHash.cartRemoveItem,
						    up: shop2.apiHash.cartUpdate
						},
				        shopCartDiv = $('.cart-page'),
				        cartPreloader = '<div class="gr-preloader-holder"><div class="gr-preloader"><svg xmlns="http://www.w3.org/2000/svg" width="34" height="26" viewBox="0 0 120 30" fill="#fff"><script xmlns=""></script> <circle cx="15" cy="15" r="15"> <animate attributeName="r" from="15" to="15" begin="0s" dur="0.8s" values="15;9;15" calcMode="linear" repeatCount="indefinite"></animate> <animate attributeName="fill-opacity" from="1" to="1" begin="0s" dur="0.8s" values="1;.5;1" calcMode="linear" repeatCount="indefinite"></animate> </circle> <circle cx="60" cy="15" r="9" fill-opacity="0.3"> <animate attributeName="r" from="9" to="9" begin="0s" dur="0.8s" values="9;15;9" calcMode="linear" repeatCount="indefinite"></animate> <animate attributeName="fill-opacity" from="0.5" to="0.5" begin="0s" dur="0.8s" values=".5;1;.5" calcMode="linear" repeatCount="indefinite"></animate> </circle> <circle cx="105" cy="15" r="15"> <animate attributeName="r" from="15" to="15" begin="0s" dur="0.8s" values="15;9;15" calcMode="linear" repeatCount="indefinite"></animate> <animate attributeName="fill-opacity" from="1" to="1" begin="0s" dur="0.8s" values="1;.5;1" calcMode="linear" repeatCount="indefinite"></animate> </circle></svg></div></div>';
				        
				    $('.shop2-order-form ~ .form-item.form-item-submit button.shop2-btn').append(cartPreloader);
				
				    shop2.on("afterCartAddItem", function(d, status) {
			            if (!d.errstr.length) {
			                getCart();
			            };
			        });
				    
				    $(document).on('click', '#shop2-color-ext-select li.param-value:not(.shop2-color-ext-selected)', function() {
						clearTimeout($idd);
				        $idd = setTimeout(updateForm, 500);
				        $('.shop2-cart-update').hide();
					});
				
				    function getCart() {
				        if (ajax) ajax.abort();
				        ajax = $.ajax({
				            url: cartURL + "?cart_only=1",
				            async: false,
				            success: function(data) {
				            	var $shopWarning = $(data).filter('.shop2-warning').clone();
	
				                $('.cart-page__top').html($(data).find('.cart-page__top').html());
				                $('.cart-page__bottom').html($(data).find('.cart-page__bottom').html());
				                
				                $shopWarning.prependTo('.cart-page__left');
				                initCart(shopCartDiv);
				                
				                $('.shop2-order-form ~ .form-item.form-item-submit button.shop2-btn').removeClass('gr-preloader-active');
				            }
				        });
				    };
				    
				    function initDelivery() {
				    	if ($('.shop2-order-form ~ .form-item.form-item-submit button.shop2-btn').find('.gr-preloader-holder').length<1) {
				    		$('.shop2-order-form ~ .form-item.form-item-submit button.shop2-btn').append(cartPreloader);
				    	};
				    	
				    	/*Код из shop2.queue.cart*/
				    	$('#shop2-deligate-calc').on('click', function(e) {
						    var data = {},
						        delivery = $('#shop2-order-delivery'),
						        tabs = delivery.find('.shop2-delivery--item__tab');
						
						    $('#shop2-perfect-form').find('input, textearea, select').each(function() {
						        var $this = $(this);
						        if (this.tagName === 'INPUT' && this.type === 'checkbox') {
						            if (this.checked) {
						                data[this.name] = 'on';
						            }
						        } else {
						            data[this.name] = $(this).val();
						        }
						    });
						
						    e.preventDefault();
						    tabs.removeClass('active-tab');
						    tabs.removeClass('point');
						    delivery.addClass('preloader');
						    $('#shop2-delivery-wait').show();
						    $('input#address').blur();
						    $('#shop2-deligate-calc').hide();
						
						    $.ajax({
						        url: '/my/s3/xapi/public/?method=deligate/calc&param[get_vars][]',
						        type: 'post',
						        dataType: 'json',
						        data: data,
						        success: function(result) {
						            delivery.removeClass('preloader');
						            $('#shop2-delivery-wait').hide();
						            $('#shop2-order-delivery').html(result.result.html);
						            $('#shop2-order-delivery').append('<div class="preloader"><div class="spinner"></div></div>');
						            $('#shop2-order-delivery').find('.delivery-items').each(function() {
						                var $this = $(this);
						                if ($.trim($this.text()) == "") {
						                    $this.parents('.shop2-delivery--item__tab:first').addClass('disabled');
						                }
						            });
						            if (result.result.error) {
						                shop2.alert(result.result.error);
						            } else {
						
						                var dadataJson = $.parseJSON($('#dadata').val()),
						                    coordsCenter = [dadataJson.geo_lat, dadataJson.geo_lon];
						
						                shop2.queue.edost2();
						                $('#shop2-ems-calc, #shop2-edost-calc').on('click', function(e) {
						                    var $this = $(this);
						                    var attach_id = $this.data('attach-id');
						                    var to = $('select[name=' + attach_id + '\\[to\\]]');
						                    var zip = $('input[name=' + attach_id + '\\[zip\\]]');
						                    var order_value = $('input[name=' + attach_id + '\\[order_value\\]]');
						
						                    if (to.length == 0) {
						                        to = $('#shop2-edost2-to');
						                    }
						
						                    e.preventDefault();
						
						                    to = to.get(0) ? to.val() : '';
						                    zip = zip.get(0) ? zip.val() : '';
						                    order_value = order_value.prop("checked") ? 'on' : '';
						
						                    shop2.delivery.calc(attach_id, 'to=' + to + '&zip=' + zip + '&order_value=' + order_value, function(d) {
						                        if (!d.data && d.errstr) {
						                            shop2.alert(d.errstr);
						                            $('#delivery-' + attach_id + '-cost').html(0);
						                        } else {
						                            $('#delivery-' + attach_id + '-cost').html(d.data.cost);
						
						                            if (d.data.html) {
						                                $('#delivery-' + attach_id + '-html').html(d.data.html);
						                                shop2.queue.edost();
						                            }
						                        }
						                    });
						
						                });
						                $('#shop2-deligate-calc').hide();
						            }
						        }
						    });
						});	
						/*Код из shop2.queue.cart*/
						
						/*Код из shop2.queue.delivery*/
						$('#shop2-order-delivery').find('.delivery-items').each(function() {
						    var $this = $(this);
						    if ($.trim($this.text()) == "") {
						        $this.parents('.shop2-delivery--item__tab:first').addClass('disabled');
						    }
						});
						$('#shop2-ems-calc, #shop2-edost-calc').on('click', function(e) {
						    var $this = $(this);
						    var attach_id = $this.data('attach-id');
						    var to = $('select[name=' + attach_id + '\\[to\\]]');
						    var zip = $('input[name=' + attach_id + '\\[zip\\]]');
						    var order_value = $('input[name=' + attach_id + '\\[order_value\\]]');
						
						    if (to.length == 0) {
						        to = $('#shop2-edost2-to');
						    }
						
						    e.preventDefault();
						
						    to = to.get(0) ? to.val() : '';
						    zip = zip.get(0) ? zip.val() : '';
						    order_value = order_value.prop("checked") ? 'on' : '';
						
						    shop2.delivery.calc(attach_id, 'to=' + to + '&zip=' + zip + '&order_value=' + order_value, function(d) {
						        if (!d.data && d.errstr) {
						            shop2.alert(d.errstr);
						            $('#delivery-' + attach_id + '-cost').html(0);
						        } else {
						            $('#delivery-' + attach_id + '-cost').html(d.data.cost);
						
						            if (d.data.html) {
						                $('#delivery-' + attach_id + '-html').html(d.data.html);
						                shop2.queue.edost();
						            }
						        }
						    });
						
						});
						/*Код из shop2.queue.delivery*/
				    };
				
				    function initCart($div) {
				        var $form = $div.find("#shop2-cart"),
				            $inp = $form.find("input:text"),
				            $item = $form.find(".cart-products__item"),
				            $recalc = $("a.shop2-cart-update"),
				            $minus = $form.find(".amount-minus"),
				            $plus = $form.find(".amount-plus");
				
				        if (!$form.length) return;
				        
				        shop2_gr.methods.amountInit();
				        
				        if (shop2.mode=='cart') {
							$('.shop2-warning').prependTo('.cart-page__left');		
						};
				        
				        $('.cart-total-checkout, .cart-total-order-checkout, .cart-registration-btn').append(cartPreloader);
				        
				        $('[data-remodal-id="cart-auth-remodal"]').remodal({
							hashTracking: false
						});
						
						$('[data-remodal-id="coupon-remodal"]').remodal({
							hashTracking: false
						});
				        
				        $('#shop2-cart .cart-delete a').off('click');
				        
				        $item.each(function(){
				        	var $del = $(this).find(".cart-delete a");
				        	var $input = $(this).find(".shop2-product-amount input");
				        	var $button = $(this).find(".shop2-product-amount button");
				        	var $select = $(this).find("select.param-value");
				        	
							
							$select.on('change', function() {
								clearTimeout($idd);
						        $idd = setTimeout(updateForm, 500);
						        $('.shop2-cart-update').hide();
							});
				        	
				        	$input.on('change', function() {
						        clearTimeout($idd);
					            $idd = setTimeout(updateForm, 1000);
					            $('.shop2-cart-update').hide();
					            
					            $('.cart-total-checkout, .cart-total-order-checkout, .cart-registration-btn, .shop2-order-form ~ .form-item.form-item-submit button.shop2-btn').addClass('gr-preloader-active');
						    });
						    
						    $button.on('click', function() {
						        clearTimeout($idd);
					            $idd = setTimeout(updateForm, 1000);
					            $('.shop2-cart-update').hide();
					            
					            $('.cart-total-checkout, .cart-total-order-checkout, .cart-registration-btn, .shop2-order-form ~ .form-item.form-item-submit button.shop2-btn').addClass('gr-preloader-active');
						    });
				        	
				        	$del.on("click", function(e) {
					        	var $this = $(this),
					                kind_id = $this.data('id');
					                
								e.preventDefault();
								
								$('.cart-total-checkout, .cart-total-order-checkout, .cart-registration-btn, .shop2-order-form ~ .form-item.form-item-submit button.shop2-btn').addClass('gr-preloader-active');
					
					            kind_id = kind_id.toString().replace(/\"/g, '\\"').replace(/\'/g, '"');
					            kind_id = $.parseJSON(kind_id);
					
					            shop2.trigger('beforeCartRemoveItem');
					
					            $.ajax({
					                url: '/my/s3/api/shop2/?cmd=cartRemoveItem',
					                async: false,
					                dataType: "json",
					                data: {
					                    hash: hash.del,
					                    ver_id: shop2.verId,
					                    kind_id: kind_id
					                },
					                success: function (d, status) {
					                    sessionStorage.setItem('cart-reload', 1);
					                    getCart();
					                    
					                    $('.gr-cart-total-amount').text($('#shop2-cart').data('cart-amount') || '0');
					                    
					                    if (d.data.cart.length == 0) {
											document.location = shop2.uri + "?mode=cart&action=cleanup";
					                    };
					                }
					            });
					
					            return false;
					        });
				        });
				
				        $recalc.on("click", function(e) {
				            e.preventDefault();
				            updateForm();
				            return false;
				        });
				        
				        
				        shop2.on('afterCartAddCoupon, afterCartRemoveCoupon', function() {
						    document.location.reload();
						});
						
						$('.coupon-btn').on('click', function(e) {
						    var coupon = $('#coupon'),
						        code = coupon.val();
						
						    e.preventDefault();
						
						    if (code) {
						
						        shop2.cart.addCoupon(code);
						
						    }
						
						});
						
						
						$('.coupon-delete').on('click', function(e) {
						    var $this = $(this),
						        code = $this.data('code');
						
						    e.preventDefault();
						
						    if (code) {
						
						        shop2.cart.removeCoupon(code);
						
						    }
						});
				    };
				    
				    function updateForm() {
			        	var data = $("#shop2-cart").serialize();
			        	
			            shop2.trigger('beforeCartUpdate');
			
			            $.ajax({
			                type: "POST",
			                url: 
			                '/my/s3/api/shop2/?cmd=cartUpdate' +
			                '&ver_id=' + shop2.verId +
			                '&hash=' + hash.up +
			                '&' + data,
			                async: false,
			                success: function (d, status) {
			                    sessionStorage.setItem('cart-reload', 1);
			                    getCart();
			                    shop2.trigger('afterCartUpdated');
			                    $('.gr-cart-total-amount').text($('#shop2-cart').data('cart-amount') || '0');
			                    $('.gr-cart-total-sum ins').text($('.last_item .cart-total__body').data('total-price'));
			                    setTimeout(function(){
                                  shop2.queue.edost2();
                                }, 100);
			                    initDelivery();
			                }
			            });
			
			            return false;
			        };
				    
				    initCart(shopCartDiv);
				};
			    /*Автопересчет в корзине*/
				
			}, /*Корзина*/
			
			
			specialPopup: function(){
				
				let specialRemodal = $('[data-remodal-id=special-popup]').remodal();
				let showSpecOnReturn = true;
				
				function init() {
				    if (document.layers) document.captureEvents(Event.MOUSEMOVE);
				    document.onmousemove = mousemove;
				}
				function mousemove(event) {
				    var mouse_y = 0;
				    if (document.attachEvent != null) {
				        mouse_y = window.event.clientY;
				    } else if (!document.attachEvent && document.addEventListener) {
				        mouse_y = event.clientY;
				    }
				    
				    let showSpecOn = function () {
				    	setTimeout(function(){ 
				    		
				    		//specialRemodal.open();
				    		
			    			showSpecOnReturn = false ;
				    	}, 300);
			    		
			    	}
			    	if (mouse_y <= 10 && showSpecOnReturn != false ) {
				    	showSpecOn()
			    	}
				}
				init();
					
			},
			
	
			lightGallery: function() {
	
				$('.card-slider__items').lightGallery({
					thumbnail: false,
				    download: true,
				    loop: false,
				    counter: false,
				    share: false,
				    getCaptionFromTitleOrAlt: true,
					selector: '.card-slider__image a'
			    });
	
			    $('.gr_cart_param_img').lightGallery({
					thumbnail: false,
				    download: true,
				    loop: false,
				    counter: false,
				    share: false,
				    getCaptionFromTitleOrAlt: true,
					selector: 'a'
			    });
	
			}, /*Галерея*/
	
	
			toolTips: function(){
	
			    $('.shop-view .shop-view__item.thumbs').elemToolTip({
			    	position: 'top',
			    	text: 'Витрина',
			    	margin: 12
			    });
	
			    $('.shop-view .shop-view__item.simple').elemToolTip({
			    	position: 'top',
			    	text: 'Простой',
			    	margin: 12
			    });
	
			    $('.shop-view .shop-view__item.pricelist').elemToolTip({
			    	position: 'top',
			    	text: 'Прайс-лист',
			    	margin: 12
			    });
	
			    $('.quick-view-trigger').elemToolTip({
			    	position: 'top',
			    	text: 'Быстрый просмотр',
			    	margin: 12
			    });
	
			},
			
			call_form: function() {
				
				if(shop2.my.gr_new_form_method){
			
					var $callButton = $('.phone-popup'),
						$callMeForm = $('.remodal[data-remodal-id="phone-popup"]');
						
					$callButton.on('click', function(e) {
						
						$.ajax({
				            url: $callButton.data('api-url'),
				            dataType: 'json',
				            success: function(response) {
				                if (!response.result.error) {
				                	
				                	$('.remodal[data-remodal-id="phone-popup"] .tpl-anketa').remove();
				                    $callMeForm.append($(response.result.html));
				
				                    s3From.initForms();
				                    grFormDatePicker.init();
				                    
				                    $callButton.removeClass('ajax-form');
				                }
				            }
				        });	
					});
				
				}
			},
			
			call_form_Sec: function() {
				
				if(shop2.my.gr_new_form_method){
			
					var $callButton = $('.about-shares__popup'),
						$callMeForm = $('.remodal[data-remodal-id="about-shares__popup"]');
						
					$callButton.on('click', function(e) {
						
						$.ajax({
				            url: $callButton.data('api-url'),
				            dataType: 'json',
				            success: function(response) {
				                if (!response.result.error) {
				                	
				                	$('.remodal[data-remodal-id="about-shares__popup"] .tpl-anketa').remove();
				                    $callMeForm.append($(response.result.html));
				
				                    s3From.initForms();
				                    grFormDatePicker.init();
				                    
				                    $callButton.removeClass('ajax-form');
				                }
				            }
				        });	
					});
				}
			},
	
			alignElements : function() {
	
				function blocksMatchHeight(arr) {
					for (var i = 0; i< arr.length; i++) {
						$(arr[i]).matchHeight();
					}
				}
	
				shop2_gr.methods.grLazyFunc('.kinds-block', function(){
					'.kinds-block__items.kinds_slider .kind-item__top',
					'.kinds-block__items.kinds_slider .kind-price',
					'.kinds-block__items.kinds_slider .kind-additional__top',
					'.mods_block .kinds-block__items .kind-item__top',
					'.mods_block .kinds-block__items .kind-price',
					'.kinds-block .kind-additional__btns',
					'.kinds-block .kind-item__bottom'
				});
				shop2_gr.methods.grLazyFunc('.product-list.thumbs', function(){
					'.product-list.thumbs .product-item .product-price',
					'.main-blocks .product-list.thumbs .product-item__bottom',
					'.product-list.thumbs .product-item .product-additional__top-right'
				});
				shop2_gr.methods.grLazyFunc('.recent-block', function(){
					'.recent-block .recent-item .gr-recent-name'
				});
				shop2_gr.methods.grLazyFunc('.category-menu', function(){
					'.category-menu__inner li a'
				});
				
				
				
				window.addEventListener('orientationchange', function() {
					setTimeout(function(){
						$.fn.matchHeight._update();
					}, 300);
				}, false);
				
				var lazyFuncTime, lazyFuncScroll = false;
				$(window).on('scroll', function() {
			        if (lazyFuncTime) {
			            clearTimeout(lazyFuncTime);
			        };
					
			        lazyFuncTime = setTimeout(function() {
			        	
			        	if (!lazyFuncScroll) {
			        		
							shop2_gr.methods.grLazyFunc('.product-list.thumbs', function(){
								
								if (!$('.main-blocks').length) {
							    	$('.product-list.thumbs .product-item .product-price').matchHeight();
							    	$('.product-list.thumbs .product-item .product-additional__top-right').matchHeight();
								};
						    });
			        	};
			        	
			        	return lazyFuncScroll = true;
			        }, 50);
			        
			        return lazyFuncScroll;
			    });

		
			}, /*Выравнивание блоков по высоте*/
	
			/*1553*/
	
			categoryMenu : function(){
				$('.category-menu__inner li.sublevel a.hasArrow .arrow').each(function(){
					$(this).on('click', function(e){
						e.preventDefault();
						if($(this).closest('.hasArrow').siblings('ul').hasClass('active')) {
							$(this).closest('.hasArrow').siblings('ul').removeClass('active');
							$(this).closest('.sublevel').removeClass('opened');
						}
						else {
							$(this).closest('.sublevel').siblings('.opened').find('ul').removeClass('active');
							$(this).closest('.sublevel').siblings('.opened').removeClass('opened');
							$(this).closest('.hasArrow').siblings('ul').addClass('active');
							$(this).closest('.sublevel').addClass('opened');
						}
					});
				});
				if($('.site').hasClass('.category-append')) {
					$('.category-menu').appendTo('main-top__category');
				}
				
			},
	
			topSlider: function() {
				
			    var sliders = document.querySelectorAll('.my-slider');
			    shop2_gr.methods.forEach(sliders, function(index, value) {
			        var sliderAutoplay = +sliders[index].getAttribute('data-autoplay');
			        var multislider = tns({
			            loop: false,
			            rewind: true,
			            container: value,
			            slideBy: 1,
			            items: 1,
			            autoplayHoverPause: true,
			            mode: 'carousel',
			            axis: 'horizontal',
			            autoplayButtonOutput: false,
			            mouseDrag: true,
			            center: false,
			            autoWidth: false,
			            nav: true,
			            swipeAngle: 50,
			            controls: true,
			            controlsText: shop2_gr.settings.sliderControls,
			            lazyload: true,
			            navPosition: 'bottom',
			            preventActionWhenRunning: false,
			            responsive: {
			                320: {
			                    autoHeight: true,
			                    autoplay: false
			                },
			                768: {
			                    autoHeight: true,
			                    autoplay: false
			                },
			                1024: {
			                    autoHeight: false,
			                    autoplay: false
			                },
			                1261: {
			                    autoHeight: false,
			                    autoplay: sliderAutoplay
			                }
			            }
			        });
			
			        shop2_gr.methods.arrowsPosition('.site-top-slider__items', '.site-top-slider__pic');
			    });
			}, /*Слайдер в шапке*/
	
			mainCategory : function(){
				if (window.matchMedia("(max-width: 480px)").matches) {
					$('.shop-folders').each(function(e){
				  		if($(this).find('.shop-folders__category > li').length < 3) {
				  			$('.main-category__but').css('display','none');
				  			$('.shop-folders__btn').css('display','none');
				  		}
				  		else {
				  			$('.shop-folders__btn').on('click', function(e){
								if($(this).hasClass('opened')){
									$(this).removeClass('opened').find('span').text("Смотреть все");
									$('.shop-folders').removeClass('open');
								}
								else {
									$(this).addClass('opened').find('span').text("Закрыть");
									$('.shop-folders').addClass('open');
								}
							});	
				  		}
					});
				} else if (window.matchMedia("(max-width: 768px)").matches){
					$('.shop-folders').each(function(e){
				  		if($(this).find('.shop-folders__category > li').length < 5) {
				  			$('.main-category__but').css('display','none');
				  			$('.shop-folders__btn').css('display','none');
				  		}
				  		else {
				  			$('.shop-folders__btn').on('click', function(e){
								if($(this).hasClass('opened')){
									$(this).removeClass('opened').find('span').text("Смотреть все");
									$('.shop-folders').removeClass('open');
								}
								else {
									$(this).addClass('opened').find('span').text("Закрыть");
									$('.shop-folders').addClass('open');
								}
							});	
				  		}
					});
				} else{
					$('.shop-folders').each(function(e){
				  		if($(this).find('.shop-folders__category > li').length < 7) {
				  			$('.main-category__but').css('display','none');
				  			$('.shop-folders__btn').css('display','none');
				  		}
				  		else {
				  			$('.shop-folders__btn').on('click', function(e){
								if($(this).hasClass('opened')){
									$(this).removeClass('opened').find('span').text("Смотреть все");
									$('.shop-folders').removeClass('open');
								}
								else {
									$(this).addClass('opened').find('span').text("Закрыть");
									$('.shop-folders').addClass('open');
								}
							});	
				  		}
					});
				};
				
				$('.main-top__category-title').on('click', function(){
					if($(".category-menu").hasClass('active')) {
						$(".category-menu").removeClass('active');
					}else {
						$(".category-menu").addClass('active');
					}
				});
				if ( window.matchMedia('(min-width : 1025px)').matches ){
					if ($('.cat-menu').find('>li').length > 9) {
						$('.cat-menu').addClass('large-number');
						$('.cat-menu').addClass('colyc');
					}
					$('.more-folders').on('click', function(){
			        	
						var $currentText = $(this).data('text');
						var $hideText = $('html').attr('lang') == 'ru' ? 'Скрыть' : 'Hide';
						
						if ($(this).hasClass('active')) {
							$(this).siblings('.cat-menu').addClass('colyc');
							$(this).removeClass('active');
							$(this).find('span').text($currentText);
						} else {
							$(this).siblings('.cat-menu').removeClass('colyc');
							$(this).addClass('active');
							$(this).find('span').text($hideText);
						};
					});
					}
				$(document).on('click', function(e){
						if( $(e.target).closest($('.main-top__category-title')).length || $(e.target).closest($('.category-menu')).length) 
				          return;
						if($('.category-menu').hasClass('active')) {
							$('.category-menu').removeClass('active');
						}
				});
	
			},
			topMenu : function() {
				if ( window.matchMedia('(min-width : 1025px)').matches ){ 
					setTimeout(function(){
					$('.menu-top__inner').rowMenu({
					    "moreText":"...",
					    "moreWidth": 100
					});
					if (isMobile) {
						$('.menu-top__inner li a').one('click', function(e){
							if ($(this).closest('li').find('ul').length > 0){
								e.preventDefault();	
							}
						});
						
					}
					if (!isMobile) {
						$('.menu-top__inner ul').parent().each(function() {
						    var o = $(this);
						    var s = o.find('>ul');
						    var l = o.parents('ul').length;
						    var k = false;
						    o.hover(
						        function() {
						            o.find('>a').addClass('active').removeClass('normal');
						            for (i = $('.menu-top__inner ul').length; i >= 0; i--) {
						                o.parent().find('>li').not(o).find('ul').eq(i).hide();
						            }
						            k = true;
									
						            s.show();
						            
						            var fixedMenuWidth = Math.ceil(o.offset().left) + o.find('>ul').outerWidth() + o.outerWidth();
									
									if (fixedMenuWidth > $(window).outerWidth()) {
						                o.find('>ul').addClass('right_level');
						            };
						            
						            if ($(document).outerWidth() > $(window).outerWidth()) {
						                o.find('>ul').addClass('right_level');
						            };
						        },
						        function() {
						            o.find('>a').removeClass('active').addClass('normal');
						            k = false;
						            window.setTimeout(function() {
						                if (!k) {
						                    s.hide()
						                    o.find('>ul').removeClass('right_level');
						                };
						            }, 500);
						        }
						    );
						});
					};
				}, 200);
				}
				if ( window.matchMedia('(max-width : 1024px)').matches ){
					$('.menu-top__inner li a').each(function(){
						$(this).one('click', function(e){
							if ($(this).siblings('ul').length > 0){
								e.preventDefault();	
								$(this).siblings('ul').addClass('opened');
							}						
						});
					});
					
				}
	
			},
	
			
			resizeBlock : function() {
				var $this = $('.site__wrapper'),
					$leftBar = $this.find('.left-bar'),
					$catMenu = $this.find('.category-menu'),
					$siteMain = $this.find('.site-main'),
					$mainTop = $this.find('.main-top'),
					$menuTop = $this.find('.menu-top'),
					$addressTop = $this.find('.site-header__first-column'),
					$searchBlock = $this.find('.search-block__wrap');
					$contactMore = $this.find('.site-header .contact-more'),
					$phonesTop = $this.find('.site-header__second-column'),
					$filterBtn = $this.find('.sorting-panel__btn-wrap'),
					$filterBody = $this.find('.filter-block'),
					$filterRemodal = $this.find('.filter-popup-btn'),
					$messengar = $this.find('.site-contacts__left')
					
					/*$searchApp = $this.find('#search-app');
					$searchAppWrap = $this.find('.main-top__search-panel')*/
				
				resizeController([1025, Infinity], function() {
					if($('.site').hasClass('category-append')) {
						$catMenu.appendTo('.main-top__category');
					}else{
						$catMenu.prependTo('.left-bar');
					}
					$leftBar.insertBefore($siteMain);
					$menuTop.prependTo('.site-header__top');
					$filterBtn.appendTo('.left-bar');
					$filterRemodal.removeAttr('data-remodal-target');
					$('.filter-block').appendTo('.left-bar');	
				});
				resizeController([1024, Infinity], function() {
					$addressTop.prependTo('.site-header__bottom-right');
					$messengar.prependTo('.site-contacts');
				});
				
				resizeController([320, 1024], function() {
					$leftBar.insertAfter($siteMain);
					$menuTop.appendTo('.mobile-panel__nav_menu');
					$catMenu.prependTo('.mobile-panel__nav_cat_mp');
					$filterBtn.prependTo('.sorting-panel__body');
					$filterRemodal.attr('data-remodal-target', 'filter-popup');
					$('.filter-block').appendTo('.remodal[data-remodal-id="filter-popup"]');
					
				});
				if (!$('.remodal[data-remodal-id="other-contact"] .site-header__second-column').length) {
					$phonesTop.clone().insertAfter('.remodal[data-remodal-id="other-contact"] .title-contacts');
				}
				resizeController([320, 1023], function() {
					$addressTop.insertBefore('.remodal[data-remodal-id="other-contact"] .footer-info__social-body');
					$messengar.insertBefore($addressTop);
					$('.remodal .site-contacts__right > span').insertBefore('.remodal .footer-info__social-body');
				});
				
				
				resizeController([641, Infinity], function() {
					//$phonesTop.appendTo('.site-header__bottom-right');
					$mainTop.prependTo('.site-container__inner');
					//$contactMore.appendTo('.site-header__second-column');
					$searchBlock.prependTo('.main-top__search-panel');
				});
				resizeController([320, 640], function() {
					//$phonesTop.insertAfter('.remodal[data-remodal-id="other-contact"] .title-contacts');
					$mainTop.appendTo('.site-header__top');
					//$contactMore.clone().prependTo('.main-top__panels');
					$searchBlock.prependTo('.mobile-panel__search ');
					
				});
			},
	
			mobilePanel : function() {
				setTimeout(function(){
					var  $button = $('.mobile-panel__btn'),
						$closeBut = $('.mobile-panel__cloce_mp');
		
					$button.on('click', function(){
						$('.mobile-panel').addClass('active');
						$('body').addClass('locked');
					});
					$closeBut.on('click', function(){
						$('.mobile-panel').removeClass('active');
						$('body').removeClass('locked');
					});
					
					var waSlideLang = ($html.attr('lang') == 'en' || $html.attr('lang') == 'de') ? 'back' : 'Назад';
					$('.mobile-panel__nav_cat_mp').waSlideMenu({
						backOnTop: true,
						scrollToTopSpeed: 100,
						minHeightMenu: 0,
						slideSpeed: 100,
						backLinkContent: waSlideLang
					});
					
				}, 20);
				
			},
			/*burgerMenu : function(){
				setTimeout(function(){
				$('.burger-btn').on('click', function(){
					$('.mobile-panel').addClass('active');
				});
	
				$('.mobile-panel__cloce_mp').on('click', function(){
					$('.mobile-panel').removeClass('active');				
				});
				
				
				var waSlideLang = ($html.attr('lang') == 'en' || $html.attr('lang') == 'de') ? 'back' : 'Назад';
				$('.mobile-panel__nav_cat_mp').waSlideMenu({
					backOnTop: true,
					scrollToTopSpeed: 100,
					minHeightMenu: 0,
					slideSpeed: 100,
					backLinkContent: waSlideLang
				});
				},20);
			},*/ 
			
			fixed_panel: function(){
				var js_fixed_panel = document.querySelector('.fixed-panel__wrap');
				if(!!js_fixed_panel) {
					var pivot_panel_wrap = document.querySelector('.main-top');		
					if( pivot_panel_wrap.getBoundingClientRect().top + pivot_panel_wrap.clientHeight < 0  ) {
						js_fixed_panel.classList.add('open_panel');
						js_fixed_panel.classList.remove('no_open');
					}
					document.addEventListener('scroll', function(e){
						var $this = $('.site__wrapper'),
							$searchBlock = $this.find('.search-block__inner');
						if( pivot_panel_wrap.getBoundingClientRect().top + pivot_panel_wrap.clientHeight < 0  ) {
							if( !js_fixed_panel.classList.contains('open_panel' ) ){
								js_fixed_panel.classList.add('open_panel');
								js_fixed_panel.classList.remove('no_open');
							}
							/*if (window.matchMedia("(min-width: 641px)").matches) {
								$searchBlock.insertAfter('.remodal .search-form__header');
							}*/
						}else {
							if( js_fixed_panel.classList.contains('open_panel' ) ){
								js_fixed_panel.classList.remove('open_panel');
								js_fixed_panel.classList.add('no_open');
							}
							/*if (window.matchMedia("(min-width: 641px)").matches) {
								$('.search-block__inner').prependTo('.search-block__wrap');	
							}*/
						}
					})
				}
			},
			
			foldersBlockPopup: function(){
				var $foldersPopupBtn = $('.header-catalog-btn');
				var $foldersPopupClose = $('.folders-popup-close');
				var $foldersPopup = $('.folders-popup-wrapper');
	
				setTimeout(function(){
					$foldersPopupBtn.on('click', function(){
						$foldersPopup.addClass('opened');
					});
					$foldersPopupClose.on('click', function() {
						$foldersPopup.removeClass('opened').removeClass('opened_shop_search');
						/*$shopSearch.removeClass('opened');*/
					});
				}, 150);
					
			},
			
			otherScripts : function() {
				
				$('body').removeClass('gr_hide_onload');

				$('.gr-select-wrapper').each(function(){
					if ($(this).siblings('select').length < 0) {
						$(this).on('click', function(){
							$(this).siblings('select').trigger('click');
						});
					}
				});
				$(window).on('scroll', function() {
					var scrollCords = window.scrollY;
					
					if (scrollCords > 1000) {
						$('.to-top').addClass('active');
					} else {
						$('.to-top').removeClass('active');
					}
				});
				
				//Кнопка наверх
				 $('.to-top').click(function () {
		            $('body,html').animate({
		                scrollTop: 0
		            }, 1000);
		            return false;
		        });
		        
		        // menu
		        setTimeout(function(){
		        	$('.menu-top').removeClass('hideOverflow');
		        	$('.menu-top__inner').removeClass('hide-first-window');
		        }, 200);
	
				$('table').wrap('<div class="table-wrapper"></div>');
	
				// Нажатие на клавишу Esc
					$(document).on('keyup.esc_keyup', function(keyUp){
					    if (keyUp.keyCode 
					    	== 27) {
					    	
								$('.sorting-block').removeClass('active');
								$('.shop2-color-ext-select').removeClass('active');
	
					        return false;
					    };
					});
				// Нажатие на клавишу Esc
	
			    // Клик по документу
				$(document).on('click', function(e){
	
					if (!$(e.target).closest('.mobile-panel__inner_mp').length && !$(e.target).closest('.mobile-panel__btn').length) {
				    	$('.mobile-panel').removeClass('active');
				    	$('body').removeClass('locked');
				    };
	
				    if (!$(e.target).closest('.sorting-block').length && !$(e.target).closest('.sorting-button').length) {
				    	$('.sorting-block').removeClass('active');
				    };
	
				    if (!$(e.target).closest('.shop2-color-ext-select .shop2-color-ext-options, #shop2-color-ext-select').length) {
				    	$('.shop2-color-ext-select').removeClass('active');
				    };
	
				    setTimeout(function(){
				    	$('#shop2-alert-ok').html('<span><svg class="gr-svg-icon gr_big_icon"><use xlink:href="#icon_site_close"></use></svg><svg class="gr-svg-icon"><use xlink:href="#icon_site_close_small"></use></svg><svg class="gr-svg-icon gr_small_icon"><use xlink:href="#icon_site_close_mini"></use></svg></span>');
				    }, 250);
				    
				});
			    // Клик по документу
			    shop2_gr.methods.grLazyLoad();
			    
			    shop2_gr.methods.grLazyLoad({
			    	selector: 'gr_lazy_load_block'
			    });
			}
			/*1553*/
	
		};
		
		shop2_gr.settings = {
			imageObserver: null,
			searchIcon: '<i class="search-block__icon"><svg class="gr-svg-icon"><use xlink:href="#icon_shop_search"></use></svg></i>',
			sliderControls: ['<svg class="gr-svg-icon"><use xlink:href="#icon_shop_slider_prev"></use></svg><svg class="gr-svg-icon gr_small_icon"><use xlink:href="#icon_shop_slider_prev_small"></use></svg>', '<svg class="gr-svg-icon"><use xlink:href="#icon_shop_slider_next"></use></svg><svg class="gr-svg-icon gr_small_icon"><use xlink:href="#icon_shop_slider_next_small"></use></svg>']
		};
	
		shop2_gr.methods = {
			
			grLazyFunc: function(selector, callback) {
				var elem = selector;
				var defaultMargin = '10px';
				
				let options = {
		            rootMargin: defaultMargin
		        };
		        
		        const imageObserver = new IntersectionObserver((entries, imgObserver) => {
		            entries.forEach((entry) => {
		                if (entry.isIntersecting) {
		                    const lazyItem = entry.target // Текущий элемент
		                    
		                    if (callback) {
		                    	callback();
		                    };
		                    
		                    imgObserver.unobserve(lazyItem);
		                }
		            })
		        }, options);
				
				if (typeof selector == 'string') {
			        const arr = document.querySelectorAll(elem);
		            arr.forEach((v) => {
		                imageObserver.observe(v);
		            });
				} else {
					imageObserver.observe(elem);
				};
			},
			
			grLazyLoad: function(params) {
				var elem = 'gr_images_lazy_load';
				var defaultMargin = '10px';
				var initMargin = '100px';
				
				if (params) {
					if (params.selector) {
						elem = params.selector;	
					};
					
					if (params.margin) {
						defaultMargin = params.margin;	
					};
					
					if (params.initMargin) {
						initMargin = params.initMargin;	
					};
				};
				
		        var rootMarginVal = defaultMargin;
		        
		        if (shop2.mode == 'main') {
		            if (readCookie('rootMarginCookie')) {
		                var rootMarginVal = initMargin;
		
		            } else {
		                var rootMarginVal = defaultMargin;
		            }
		            createCookie('rootMarginCookie', 1, 1);
		        };
		
		        let options = {
		            rootMargin: rootMarginVal
		        };
		        shop2_gr.settings.imageObserver = new IntersectionObserver((entries, imgObserver) => {
		            entries.forEach((entry) => {
		                if (entry.isIntersecting) {
		                    const lazyImage = entry.target // Текущий элемент
		                    
		                    if (lazyImage.tagName == 'IMG') { // для обычных картинок
		                        if (lazyImage.dataset.srcset) {
		                            // Чтобы загружать картинки маленьких размеров с помощью srcset
		                            lazyImage.srcset = lazyImage.dataset.srcset // Адрес картинки data-srcset=""
		                            lazyImage.classList.remove(elem);
		                            imgObserver.unobserve(lazyImage);
		                        } else {
		                            lazyImage.src = lazyImage.dataset.src // Адрес картинки data-src=""
		                            lazyImage.classList.remove(elem); 
		                            imgObserver.unobserve(lazyImage); 
		                        }
		                    } else if (lazyImage.dataset.bg) {
		                        if (window.innerWidth <= 768 && lazyImage.dataset.minbg) {
		                            lazyImage.style.backgroundImage = 'url(' + lazyImage.dataset.minbg + ')';
		                            lazyImage.classList.remove(elem);
		                            imgObserver.unobserve(lazyImage);
		                        } else {
		                            lazyImage.style.backgroundImage = 'url(' + lazyImage.dataset.bg + ')';
		                            lazyImage.classList.remove(elem);
		                            imgObserver.unobserve(lazyImage);
		                        }
		                    } else if (lazyImage.dataset.func) { // Если элемент содержит data-func
		                        if (typeof shop2_gr.methods[lazyImage.dataset.func] == 'function') {
		                            shop2_gr.methods[lazyImage.dataset.func](lazyImage); // Вызов функции
		                            lazyImage.classList.remove(elem);
		                            imgObserver.unobserve(lazyImage);
		                        }
		                    } else {
		                        lazyImage.classList.remove(elem);
		                        imgObserver.unobserve(lazyImage);
		                    }
		                }
		            })
		        }, options);
	
		        const arr = document.querySelectorAll('.' + elem);
		        
	            arr.forEach((v) => {
	                shop2_gr.settings.imageObserver.observe(v);
	            });
			},
			forEach: function(array, callback, scope) {
				for (var i = 0; i < array.length; i++) {
			        callback.call(scope, i, array[i]);
			    };
			},
			aboutStock: function(lazyElem) {
			},
			leftBar: function(lazyElem) {
			},
			popupFolders: function(lazyElem) {
			},
			smartSearch: function(lazyElem) {
			},
			advantage: function(lazyElem) {
			},
			folderRemodal: function(lazyElem) {
			},
			
			/*popupFolderFix: function(lazyElem) {
			},*/
			
			mainBlocks: function(lazyElem) {
				
			    if (shop2.mode == 'main' && $('.main-products').length) {
			        $('.product-list').removeClass('simple').removeClass('list').addClass('thumbs');
			    }
			    var slider = lazyElem.querySelector('.main_blocks_list');
			    var main_items = slider.getAttribute('data-main-items');
			    var respSettings = {};
			
			    var gr_images_size = slider.dataset["imagesSize"];
			    var gr_images_view = slider.dataset["imagesView"];
			    var gr_mode_catalog = slider.dataset["modeCatalog"];
			    var url = '/my/s3/xapi/public/?method=shop2/getProductsBySearchMatches';
			
			    if (gr_images_view) {
			        url += "&gr_images_view=" + gr_images_view;
			    };
			
			    if (gr_images_size) {
			        url += "&gr_images_size=" + gr_images_size;
			    };
			
			    if (gr_mode_catalog) {
			        url += "&gr_mode_catalog=" + gr_mode_catalog;
			    };
			
			    if (main_items == 5) {
			        var main_items_1280 = 5,
			            main_items_1024 = 4,
			            main_items_768 = 3,
			            main_items_480 = 2,
			            main_items_320 = 1;
			    } else if (main_items == 4) {
			        var main_items_1280 = 4,
			            main_items_1024 = 3,
			            main_items_768 = 3,
			            main_items_480 = 2,
			            main_items_320 = 1;
			    } else if (main_items == 3) {
			        var main_items_1280 = 3,
			            main_items_1024 = 3,
			            main_items_768 = 3,
			            main_items_480 = 2,
			            main_items_320 = 1;
			    } else if (main_items == 2) {
			        var main_items_1280 = 2,
			            main_items_1024 = 2,
			            main_items_768 = 2,
			            main_items_480 = 2,
			            main_items_320 = 1;
			    };
			
			    respSettings = {
			        320: {
			            controls: false,
			            items: main_items_320,
			            gutter: 12
			        },
			        480: {
			            controls: true,
			            items: main_items_480,
			            gutter: 20
			        },
			        768: {
			            controls: true,
			            items: main_items_768,
			            gutter: 20
			        },
			        1024: {
			            controls: true,
			            items: main_items_1024,
			            gutter: 20
			        },
			        1281: {
			            controls: true,
			            items: main_items_1280,
			            gutter: 20
			        }
			    };
				
			    if ($(slider).length) {
			        var sliderAutoplay = +slider.getAttribute('data-autoplay');
			        var multislider = tns({
			            loop: false,
			            rewind: true,
			            container: slider,
			            slideBy: 1,
			            autoplayHoverPause: true,
			            mode: 'carousel',
			            axis: 'horizontal',
			            autoplay: sliderAutoplay,
			            autoplayButtonOutput: false,
			            mouseDrag: true,
			            center: false,
			            autoWidth: false,
			            nav: true,
			            swipeAngle: 50,
			            controlsText: shop2_gr.settings.sliderControls,
			            navPosition: 'bottom',
			            preventActionWhenRunning: true,
			            responsive: respSettings
			        });
			        setTimeout(function() {
			            shop2_gr.methods.arrowsPosition($(lazyElem).find('.main_blocks_list'), '.gr-product-image');
			        }, 10);
			
					
			        if (shop2.my.gr_main_blocks_ajax) {
			            var empty_products = slider.querySelectorAll('.gr_empty_product');
			            var active_products = slider.querySelectorAll('.tns-slide-active');
			            var active_array = [];
			
			            Array.prototype.forEach.call(active_products, function(item, i) {
			                active_array[i] = item.dataset['mainProductId'];
			            });
			
			            shop2_gr.methods.getMainProducts(url, active_array, empty_products, function() {
			                shop2_gr.methods.arrowsPosition($(lazyElem).find('.main_blocks_list'), '.gr-product-image');
			                $(lazyElem).find('.product-item__bottom').matchHeight();
			                $(slider).find('.gr_images_lazy_load').each(function() {
			                    $(this).attr('src', $(this).attr('data-src'));
			                });
			                $(lazyElem).addClass('main_products_loaded');
			                $(slider).find('.buy-one-click').attr('data-api-url', $(slider).data('popup-form'));
			                shop2_gr.methods.viewLots($(lazyElem).find('.product-list'));
			                shop2_gr.methods.amountInit($(lazyElem).find('.shop2-product-item'));
			            });
			
			
			            function slider_handler(current_slider) {
			                if (!current_slider.container.classList.contains('all_products_done')) {
			                    var simple_products = current_slider.container.querySelectorAll('.gr_empty_product');
			
			                    if (simple_products[0]) {
			                        var active_array = [];
			
			                        Array.prototype.forEach.call(simple_products, function(simple_product, i) {
			                            active_array[i] = simple_product.dataset['mainProductId'];
			                        });
			
			                        shop2_gr.methods.getMainProducts(url, active_array, simple_products, function() {
			                            shop2_gr.methods.arrowsPosition($(current_slider.container).find('.main_blocks_list'), '.gr-product-image');
			                            $(current_slider.container).find('.product-item__bottom').matchHeight();
			                            $(current_slider.container).find('.gr_images_lazy_load').each(function() {
			                                $(this).attr('src', $(this).attr('data-src'));
			                            });
			                            $(lazyElem).addClass('main_products_loaded');
			                            $(current_slider.container).find('.buy-one-click').attr('data-api-url', $(current_slider.container).data('popup-form'));
			                            shop2_gr.methods.viewLots($(current_slider).find('.product-list'));
			                            shop2_gr.methods.amountInit($(current_slider).find('.shop2-product-item'));
			                        });
			
			                        current_slider.container.classList.add('all_products_done');
			                    };
			                } else {
			                    return;
			                };
			            };
			
			            multislider.events.on('indexChanged', slider_handler);
			            multislider.events.on('newBreakpointEnd', slider_handler);
			        };
			
			
			
			        var mainLazyFuncTime, mainLazyFuncScroll = false;
			        $(window).on('scroll', function() {
			            if (mainLazyFuncTime) {
			                clearTimeout(mainLazyFuncTime);
			            };
			            mainLazyFuncTime = setTimeout(function() {
			                if (!mainLazyFuncScroll) {
			                    shop2_gr.methods.grLazyFunc(lazyElem, function() {
			                        $(lazyElem).find('.product-additional__top-right').matchHeight();
			                        $(lazyElem).find('.product-list.thumbs .product-item .product-price').matchHeight();
			                        $(lazyElem).find('.product-item__bottom').matchHeight();
			                    });
			                };
			
			                return mainLazyFuncScroll = true;
			            }, 50);
			            return mainLazyFuncScroll;
			        });
			    };
			
			},/*Блоки на главной*/
			
			kindsBlock: function(lazyElem) {
				
			    if ($('.kinds-block__items.kinds_slider').length > 0) {
			        var slider = lazyElem.querySelector('.kinds-block__items.kinds_slider');
			        var kind_items = slider.getAttribute('data-kind-items');
			        var respSettings = {};
			        var sliderAutoplay = $('.kinds-block__items.kinds_slider').data('autoplay');
			
			        if (kind_items == 5) {
			            $('.kinds-block.collections_block').addClass('kind_columns_5');
			            var kind_items_1500 = 5,
			                kind_items_1280 = 5,
			                kind_items_1024 = 4,
			                kind_items_768 = 3,
			                kind_items_480 = 2;
			            kind_items_320 = 1;
			        } else if (kind_items == 4) {
			            $('.kinds-block.collections_block').addClass('kind_columns_4');
			            var kind_items_1500 = 4,
			                kind_items_1280 = 4,
			                kind_items_1024 = 4,
			                kind_items_768 = 3,
			                kind_items_480 = 2;
			            kind_items_320 = 1;
			        } else if (kind_items == 3) {
			            $('.kinds-block.collections_block').addClass('kind_columns_3');
			            var kind_items_1500 = 3,
			                kind_items_1280 = 3,
			                kind_items_1024 = 3,
			                kind_items_768 = 3,
			                kind_items_480 = 2;
			            kind_items_320 = 1;
			        } else if (kind_items == 2) {
			            $('.kinds-block.collections_block').addClass('kind_columns_2');
			            var kind_items_1500 = 2,
			                kind_items_1280 = 2,
			                kind_items_1024 = 2,
			                kind_items_768 = 2,
			                kind_items_480 = 2;
			            kind_items_320 = 1;
			        }
			        
		            respSettings = {
		                320: {
		                    controls: false,
		                    items: kind_items_320,
		                    gutter: 12
		                },
		                480: {
		                    controls: false,
		                    items: kind_items_480,
		                    gutter: 20
		                },
		                768: {
		                    controls: false,
		                    items: kind_items_768,
		                    gutter: 20
		                },
		                1024: {
		                    controls: false,
		                    items: kind_items_1024,
		                    gutter: 20
		                },
		                1280: {
		                    controls: true,
		                    items: kind_items_1280,
		                    gutter: 20
		                },
		                1500: {
		                    controls: true,
		                    items: kind_items_1500,
		                    gutter: 20
		                }
		            }
		            
			        if ($(slider).length) {
			            var sliderAutoplay = +slider.getAttribute('data-autoplay');
			
			            var multislider = tns({
			                loop: false,
			                rewind: true,
			                container: slider,
			                slideBy: 1,
			                autoplayHoverPause: true,
			                mode: 'carousel',
			                axis: 'horizontal',
			                autoplay: sliderAutoplay,
			                autoplayButtonOutput: false,
			                mouseDrag: true,
			                center: false,
			                autoWidth: false,
			                nav: true,
			                swipeAngle: 50,
			                controlsText: shop2_gr.settings.sliderControls,
			                navPosition: 'bottom',
			                preventActionWhenRunning: false,
			                responsive: respSettings
			            });
			
			            setTimeout(function() {
			                shop2_gr.methods.arrowsPosition($(lazyElem).find('.kinds-block__items.kinds_slider'), '.kind-image');
			            }, 10);
			
			            var kindLazyFuncTime, kindLazyFuncScroll = false;
			            $(window).on('scroll', function() {
			                if (kindLazyFuncTime) {
			                    clearTimeout(kindLazyFuncTime);
			                };
			                kindLazyFuncTime = setTimeout(function() {
			                    if (!kindLazyFuncScroll) {
			                        shop2_gr.methods.grLazyFunc(lazyElem, function() {
			                            $(lazyElem).find('.kinds-block__items.kinds_slider .kind-item__top').matchHeight();
			                            $(lazyElem).find('.kinds-block__items.kinds_slider .kind-price').matchHeight();
			                            $(lazyElem).find('.kinds-block__items.kinds_slider .kind-additional__top').matchHeight();
			                            $(lazyElem).find('.kinds-block__items.kinds_slider .kind-additional__btns').matchHeight();
			                            $(lazyElem).find('.kinds-block__items.kinds_slider .kind-item__bottom').matchHeight();
			                        });
			                    };
			
			                    return kindLazyFuncScroll = true;
			                }, 50);
			                return kindLazyFuncScroll;
			            });
			        };
			        
			    }
			}, /*Коллекции*/
			
			getMainProducts: function (url, active_array_id, empty_products, callback){
				$.ajax({
					url: url,
					dataType: "JSON",
					data: {
						param: {
							s: {
								product_id: active_array_id
							},
							limit: (active_array_id.length + 1),
							template: "global:shop2.2.130-product-list.tpl"
						}
					},
					error: (error) => {
						alert(error);
						console.warn(error);
						return false;
					},
					success: (response) => {
						if( response.error ){
							console.warn('Ошибка аякса: ', response);
						}else if (response.result.success) {
							
							$(response.result.html).find('.shop2-product-item').each(function(){
								var _this_item = this;
								var id_product = _this_item.querySelector('[name="product_id"]').value
								Array.prototype.forEach.call(empty_products, function(item, i){
									if( +item.dataset['mainProductId'] == +id_product ){
										item.innerHTML = '';
										item.appendChild(_this_item.cloneNode(true));
										
										if (gr_compare_kind_id[item.querySelector('[name="kind_id"]').value]) {
											product_compare = item.querySelector('.product-compare');
											product_compare.classList.add( 'product-compare-added' );
											product_compare.innerHTML = `<label class="gr-compare-checkbox">
								<input type="checkbox" value="`+item.querySelector('[name="kind_id"]').value+`" checked="true" autocomplete="off"></label>
			<a class="link-reset custom-underlined-link" data-remodal-target="compare-preview-popup" href="/magazin/compare" target="_blank">Cравнить&nbsp;<span>`+Object.keys(gr_compare_kind_id).length+`</span></a>
					</div>`;
										};
										item.classList.remove('gr_empty_product');
									};
								});
							});
							
							if (callback) {
								callback();
							};
						}
					}
				});
			},
			
			viewLots: function(elem) {
				if (elem) {
					var $productList 		= $(elem);
					var	$productItem 		= $productList.find('.product-item');
					var loadedValue = $('.shop-view__item.active-view').data('value');
				} else {
					var $productList 		= $('.product-list');
					var	$productItem 		= $('.product-item');
					var loadedValue = $('.shop-view__item.active-view').data('value');
				};
				
				if ( loadedValue == 'thumbs' ) {
					$('.product-list-titles').addClass('hide');
	
					$productItem.each(function() {
						var $flags = $(this).find('.product-flags');
						var $flagsContainer = $(this).find('.product-item__top');
	
						$flags.appendTo($flagsContainer);
					});
				} else if ( loadedValue == 'simple' ) {
					$('.product-list-titles').addClass('hide');
	
					$productItem.each(function() {
						var $flags = $(this).find('.product-flags');
						var $flagsContainer = $(this).find('.product-item__top');
	
						$flags.appendTo($flagsContainer);
					});
				} else if ( loadedValue == 'list' ) {
					$('.product-list-titles').removeClass('hide');
	
					$productItem.each(function() {
						var $flags = $(this).find('.product-flags');
						var $flagsContainer = $(this).find('.product-item__bottom-left');
	
						$flags.prependTo($flagsContainer);
					});
				};
	
				$('.shop-view .shop-view__item').on('click', function(e) {
					var $this 			= $(this),
						value 			= $this.data('value');
	
					if ( value == 'thumbs' ) {
						$('.product-list-titles').addClass('hide');
	
						$productItem.each(function() {
							var $flags = $(this).find('.product-flags');
							var $flagsContainer = $(this).find('.product-item__top');
	
							$flags.appendTo($flagsContainer);
						});
					} else if ( value == 'simple' ) {
						$('.product-list-titles').addClass('hide');
	
						$productItem.each(function() {
							var $flags = $(this).find('.product-flags');
							var $flagsContainer = $(this).find('.product-item__top');
	
							$flags.appendTo($flagsContainer);
						});
					} else if ( value == 'list' ) {
						$('.product-list-titles').removeClass('hide');
	
						$productItem.each(function() {
							var $flags = $(this).find('.product-flags');
							var $flagsContainer = $(this).find('.product-item__bottom-left');
	
							$flags.prependTo($flagsContainer);
						});
					};
	
					$this
						.addClass('active-view')
						.siblings()
						.removeClass('active-view');
	
					if ($productList.length>0) {
						$productList
							.removeClass($productList.attr('class').replace( /[a-zA-Z0-9_-]+(?=\s)/, "" ))
							.addClass(value);
					};
	
					$(this).parents('.shop-view__inner').removeClass('active');
	
					createCookie('views', value, 30);
	
					setTimeout(function() {
				 		$.fn.matchHeight._update();
					}, 300);
					
					e.preventDefault();
	
					return false;
				});
			}, 
			remodalForm: function(elem){
	    	
		    	if(!shop2.my.gr_new_form_method){
				
			    	var form_block = elem.querySelector('.remodal-phone_popup');
					var url = form_block.dataset['formGet'];
					if(url){
							
						$.ajax({
							url: url,
							dataType: 'json',
							success: function(response) {
								if (!response.result.error) {
									
									form_block.innerHTML = response.result.html;
									s3From.initForms($(form_block));
									grFormDatePicker.init();
									
									
								}
							}
						});
					}else {
						return;
					}
				}
		    },
		    remodalFormSec: function(elem){
	    	
		    	if(!shop2.my.gr_new_form_method){
	    	
			    	var form_block = elem.querySelector('.remodal-about_shares');
					var url = form_block.dataset['formGet'];
					if(url){
							
						$.ajax({
							url: url,
							dataType: 'json',
							success: function(response) {
								if (!response.result.error) {
									
									form_block.innerHTML = response.result.html;
									s3From.initForms($(form_block));
									grFormDatePicker.init();
								}
							}
						});
					}else {
						return;
					}
		    	}
		    },
			formSubBlock: function(elem){
	    	
		    	if(shop2.my.gr_new_form_method){
				
					function blockForm() {
						
						$.ajax({
				            url: $('.form-subscription__form').data('api-url'),
				            dataType: 'json',
				            success: function(response) {
				                if (!response.result.error) {
				                	
				                	$('.form-subscription__form .tpl-anketa').remove();
				                	$(response.result.html).appendTo('.form-subscription__form');
				
				                    s3From.initForms();
				                    grFormDatePicker.init();
				                }
				            }
				        });	
					};
					
					blockForm();
				
				} else{
	    	
			    	var form_block = elem.querySelector('.form-subscription__form');
					var url = form_block.dataset['formGet'];
					if(url){
							
						$.ajax({
							url: url,
							dataType: 'json',
							success: function(response) {
								if (!response.result.error) {
									
									form_block.innerHTML = response.result.html;
									s3From.initForms($(form_block));
									grFormDatePicker.init();
								}
							}
						});
					}else {
						return;
					}
				}
		    },
			bottomForm: function(elem){
	    	
		    	if(shop2.my.gr_new_form_method){
				
					function blockForm() {
						
						$.ajax({
				            url: $('.footer-info__form-right').data('api-url'),
				            dataType: 'json',
				            success: function(response) {
				                if (!response.result.error) {
				                	
				                	$('.footer-info__form-right .tpl-anketa').remove();
				                	$(response.result.html).appendTo('.footer-info__form-right');
				
				                    s3From.initForms();
				                    grFormDatePicker.init();
				                }
				            }
				        });	
					};
					
					blockForm();
				
				} else{
	    	
			    	var form_block = elem.querySelector('.footer-info__form-right');
					var url = form_block.dataset['formGet'];
					if(url){
							
						$.ajax({
							url: url,
							dataType: 'json',
							success: function(response) {
								if (!response.result.error) {
									
									form_block.innerHTML = response.result.html;
									s3From.initForms($(form_block));
									grFormDatePicker.init();
									
									
								}
							}
						});
					}else {
						return;
					}
				}
		    },
	
			amountInit: function(elem) {
				var items = '.cart-products__item, .shop2-product-item, .shop2-product, .kind-item, .popup-product';
				if (elem) {
					var items = elem;
				};
				$(items).each(function() {
					var $this       = $(this);
					var $amountWrap = $this.find('.shop2-product-amount');
					var $input      = $amountWrap.find('input[type="text"]');
					var $buttons    = $amountWrap.find('button');
					var $minus      = $amountWrap.find('button.amount-minus');
					var $plus       = $amountWrap.find('button.amount-plus');
					var min 		= $amountWrap.find('input').data('min');
					var inputVal    = +$input.val();
					
	
					if (inputVal<=min) {
						$minus.attr('disabled', 'disabled');
					}
					
					$buttons.on('click', function(){
						var parent = $(this).parent();
						var input  = parent.find('input');
	
						setTimeout(function(){
							var inputVal = +input.val();
							
							if (inputVal<=min) {
								$minus.attr('disabled', 'disabled');
							} else {
								$minus.removeAttr('disabled');
							}
						}, 100);
					});
					
					$input.on('change', function(e) {
			        	var curVal = +$(this).val();
			        	
			        	if (curVal < min) {
			        		$(this).val(min);
			        	} else if (curVal == min) {
			        		$minus.attr('disabled', 'disabled');
			        	} else if (curVal > min) {
			        		$minus.removeAttr('disabled');
			        	}
			        });
				});
			},
	
			insertTinyDots: function(itemContainer, itemNav) {
				if ($(itemContainer).length) {
					var item = document.querySelectorAll(itemContainer);
		
		        	for (var i = item.length - 1; i >= 0; i--) {
		        		var nav = item[i].querySelector('.tns-nav');
		        		var navContainer = item[i].querySelector(itemNav);
		
		        		if (nav != null) {
		    				navContainer.insertAdjacentElement('afterbegin', nav);
		    			};
		        	};
				};
			},
	
			arrowsPosition: function(slider, item) {
				if ($(slider).length){
				    var arrows_timeout;
				    
				    $(slider).each(function() {
				        var $this = $(this);
				        var $image = $this.find(item);
				        var $controls = $this.parents('.tns-outer').find('.tns-controls');
				        var imgHeight = $image.outerHeight();
				        
				    });
		
				    $(window).on('resize', function() {
				        if (arrows_timeout) {
				            clearTimeout(arrows_timeout);
				        };
		
				        arrows_timeout = setTimeout(function() {
				            $(slider).each(function() {
				                var $this = $(this);
				                var $image = $this.find(item);
				                var $controls = $this.parents('.tns-outer').find('.tns-controls');
				                var imgHeight = $image.outerHeight();
				            });
				        }, 50);
				    });
				};
			}
			
			
		}
		shop2_gr.init();
		myObject.shop2_gr = shop2_gr;
	
	})(jQuery, window);

	
	function setEqualHeight(columns, callback) {
	    var tallestcolumn = 0;
	    var itemsLength = columns.length;
	    var itemsCounter = 0;
	    var hasCallback = callback == undefined;
	
	    columns.removeAttr('style');
	    columns.each(function(){
	        currentHeight = $(this).height();
	        if(currentHeight > tallestcolumn) {
	            tallestcolumn = currentHeight;
	        }
	        itemsCounter++;
	
	    });
	    columns.height(tallestcolumn);
	
	    if (itemsLength == itemsCounter && !hasCallback) {
		    callback();
	    }
	};
	
	function resizeController() {
		var $win = $(window),
			winWidth = window.innerWidth,
			range = [],
			func = [],
			toggleState = [undefined, undefined];
	
		if (!!arguments.length) {
			for (var i = 0; i <= arguments.length-1; i++) {
				
				if ($.isArray(arguments[i])) {
					range = arguments[i];
				} else if ($.isNumeric(arguments[i])) {
					range.push(arguments[i]);
				} else if ($.isFunction(arguments[i])) {
					func.push(arguments[i]);
				} 
			};
		}
	
		$win.resize(function(event) {
			winWidth = window.innerWidth;
			
			if (range.length > 1) {
				if (winWidth >= range[0] && winWidth <= range[range.length-1] && typeof toggleState[0] === 'undefined') {
					func[0]();
					toggleState[0] = true;
					toggleState[1] = undefined;												
				} else if ((winWidth < range[0] || winWidth > range[range.length-1]) && typeof toggleState[1] === 'undefined') {						
					toggleState[0] = undefined;
					toggleState[1] = true;
	
					if ($.isFunction(func[1])) {
						func[1]();
					}
				}
			} else if (range.length == 1) {
				if (winWidth <= range[0] && typeof toggleState[0] === 'undefined') {
					func[0]();
					toggleState[0] = true;
					toggleState[1] = undefined;
				} else if (winWidth > range[0] && typeof toggleState[1] === 'undefined') {
					toggleState[0] = undefined;
					toggleState[1] = true;
	
					if ($.isFunction(func[1])) {
						func[1]();
					}
				}
			}
		}).trigger('resize');
	};
/*}).catch(console.log());*/