(function ($) {
	$(document).ready(function() {
		var $body = $('body');
		var $page = $('.creatio-page');

		$(document).on('click', '.language-switcher-language-url .links a', function() {
			var $this = $(this);
			$.cookie('ts_lang', $this.attr('hreflang'), {path: '/'});
		});

		$(document).on('click', '.main-menu-item__link', function() {
			var $this = $(this);
			if($this.hasClass('onHover') && $this.hasClass('main-menu-item__link_expanded')) {
				return false;
			}
		});

		var $menu = $('.creatio-header-menu');
		var $productHead = $('.product-head-inner');
		var topSpacing = parseInt($body.css('padding-top'));
		if($productHead.length) {
			$body.addClass('product-page');
			if($('.product-head-logo_fluid').length) {
        $body.addClass('product-page_fluid');
      }
			$productHead.sticky({
				topSpacing: topSpacing
			});
		} else {
      var $pmHead = $('.pm-head');

		  if($pmHead.length && $pmHead.css('display') !== 'none') {
        $pmHead.sticky({
          topSpacing: topSpacing
        });
      } else {
				const informer = $('body:not(:has(.ts-navigation)) .ts-topline');
				const h = informer.length ? informer.height() : 0;
        $menu.add($('.zone-ua .creatio-mobile-header')).sticky({
          topSpacing: topSpacing + h
        });
      }
		}

    const mobileHeader = $('body:has(.ts-topline) .creatio-mobile-header');
    if(mobileHeader.length) {
      mobileHeader.sticky({
        topSpacing: topSpacing
      });
    }

		if(!$menu.find('.main-menu_creatio').length) {
			$menu.addClass('creatio-header-menu_white');
			$('.field--name-field-header-menu').addClass('right');
		}

		var $timer;
		var $timers = [];
		$(document).on('mouseenter', '.main-menu-item', function() {
      if(!['clip', 'hidden'].includes($page.css('overflow'))) {
        $page.css('overflow', 'clip');
      }
			var $item = $(this);
			$item.find('.main-menu-item__link').addClass('onHover');

			var index = $item.index();
			if(typeof $menu.find('.main-menu').data('index') === 'undefined') {
				$menu.find('.main-menu').data('index', index);
			}

			if($item.find('.main-menu-submenu-banner-bg').length) {
        $item.find('.main-menu-submenu-banner-bg img:not(.loaded)').each(function() {
          var $img = $(this);
          $img.attr('src', $img.data('lazy'));
          $img.attr('srcset', $img.data('srcset'));
          $img.removeAttr('data-lazy').removeAttr('data-srcset').addClass('loaded');
        });
      }

			if($menu.find('.main-menu').data('index') === index) {
				if(!$('.main-menu .main-menu-item__link').hasClass('main-menu-item__link_hover')) {
					setTimeout(function() {
						if(!['clip', 'hidden'].includes($page.css('overflow'))) {
							$page.css('overflow', 'clip');
						}
						$('.creatio-header-logo').addClass('creatio-header-logo_hover');
						$item.find('.main-menu-submenu-content').addClass('main-menu-submenu-content_hover');
						$item.find('.main-menu-item__link').addClass('main-menu-item__link_hover');
						$item.find('.main-menu-item__link').removeClass('onHover');
						if($item.find('.main-menu-submenu-content').length) {
							$menu.addClass('creatio-header-menu_hover');
						}

						var $banner_row = $item.find('.main-menu-submenu-banner-row');
						if($banner_row.length) {
							var wd = 0;
							var $cols = $item.find('.main-menu-submenu-row .main-menu-submenu-col');
							$cols.each(function(i) {
								if(i < $cols.length-1) {
									wd += $(this).outerWidth(true);
								}
							});
							$banner_row.width(wd + $banner_row.find('.main-menu-submenu-banner-image').width());
						}
					}, 50);
					setTimeout(function() {
						$item.find('.main-menu-submenu-content').addClass('main-menu-submenu-content_open');
						if($item.find('.main-menu-submenu-content').length) {
							$menu.addClass('creatio-header-menu_open');
						}
					}, 100);
				}
			} else {
				$timer = setTimeout(function() {
					$('.main-menu .main-menu-submenu-content').removeClass('main-menu-submenu-content_hover').removeClass('main-menu-submenu-content_open');
					$('.main-menu .main-menu-item__link').removeClass('main-menu-item__link_hover');
					if(!$item.find('.main-menu-item__link').hasClass('main-menu-item__link_expanded')) {
						$menu.removeClass('creatio-header-menu_hover').removeClass('creatio-header-menu_open');
					}
					if(!$item.find('.main-menu-item__link').hasClass('main-menu-item__link_hover')) {
						$menu.find('.main-menu').removeData('index');
						$item.trigger('mouseenter');
					}
				}, 200);

				$timers[index] = $timer;
				$.each($timers, function(i) {
					if(typeof $timers[i] !== 'undefined' && i !== index) {
						clearTimeout($timers[i]);
					}
				});
			}

			var matches = $item.find('> a').attr('class').match(new RegExp(/menu-\w+-show/));
			var eventCategory = matches ? matches[0] : '';
			if(eventCategory) {
				dataLayer.push({
					'event': 'GAEvent',
					'eventCategory': eventCategory,
					'eventAction': 'menu_show'
				});
			}
		});

		$(document).on('mouseleave', '.main-menu-item', function() {
			if(typeof $timer !== 'undefined' && typeof $menu.find('.main-menu').data('index') !== 'undefined') {
				clearTimeout($timer);
			}
		});

		$(document).on('mouseleave', '.main-menu', function() {
			$('.main-menu .main-menu-submenu-content').removeClass('main-menu-submenu-content_hover').removeClass('main-menu-submenu-content_open');
			$('.main-menu .main-menu-item__link').removeClass('main-menu-item__link_hover');
			$('.creatio-header-logo').removeClass('creatio-header-logo_hover');
			$menu.removeClass('creatio-header-menu_hover').removeClass('creatio-header-menu_open');

      if(typeof $page.attr('style') !== 'undefined' && !$('.main-menu-submenu-content_open').length) {
        $page.removeAttr('style');
      }
		});

		$(document).on('click', '.search-block-form .search-toggle', function() {
			setTimeout(function () {
				$('.product-head').toggleClass('product-head_low');
			}, 50);
			$(this).closest('.search-block-form').toggleClass('open');
			if($('.creatio-mobile-menu-toggle_open').length) {
				$('.creatio-mobile-menu-toggle').trigger('click');
			}
		});

		$(document).on('click', '.creatio-mobile-menu-toggle', function() {
			$(this).toggleClass('creatio-mobile-menu-toggle_open');
			var $productHeadMobile = $('.product-head-mobile');
			if($productHeadMobile.length) {
				$productHeadMobile.slideToggle(300);
			} else {
        var $pmHead = $('.pm-head');
        if($pmHead.length) {
          $pmHead.slideToggle(300);
        } else {
          $('.creatio-mobile-header-content').slideToggle(300);
        }
			}

		});
		$(document).on('click', '.creatio-mobile-header-menu > ul > .menu-item--expanded', function(e) {
			if(e.target.tagName === 'LI') {
				var $this = $(this);
				var $open = $this.closest('ul').find('.open');
				if($open.length) {
					$open.find('> ul').slideUp(300, function() {
						$open.removeClass('open');
					});
				}

				$this.toggleClass('open');
				if($this.hasClass('open')) {
					$this.find('> ul').slideDown(300);
				} else {
					$this.find('> ul').slideUp(300);
				}
			}
		});

		$(document).on('mouseenter', '.product-head-menu-item', function() {
			var $this = $(this);
			var $link = $this.find('.product-head-menu-item__link');
			$link.addClass('onHover');
			$productHead.data('index', $this.index());

			if($link.hasClass('product-head-menu-item__link_expanded')) {
				$('.product-head-sidebar-top__close').trigger('click');
				$this.addClass('product-head-menu-item_hover');
				$link.addClass('product-head-menu-item__link_hover');
				$this.find('.product-head-submenu').addClass('product-head-submenu_hover');
				$productHead.addClass('product-head-inner_darkest');
				$productHead.addClass('product-head-inner_open');
				setTimeout(function () {
					if($productHead.hasClass('product-head-inner_white')) {
						$this.closest('.product-head').addClass('product-head_hover');
					}
					$link.removeClass('onHover');
					$productHead.addClass('product-head-inner_hover');
				}, 50);
			}
		});

		$(document).on('mousemove', '.product-head-menu-item', function() {
			var $this = $(this);
			$productHead.data('index', $this.index());
		});

		$(document).on('mouseleave', '.product-head-menu-item', function() {
			var $this = $(this);
			$productHead.data('index', -1);
			var $link = $this.find('.product-head-menu-item__link');

			setTimeout(function() {
				if($link.hasClass('product-head-menu-item__link_expanded') && typeof $productHead.data('index') !== 'undefined' && $productHead.data('index') !== $this.index()) {
					$this.find('.product-head-menu-item__link').removeClass('product-head-menu-item__link_hover');
					$this.find('.product-head-submenu').removeClass('product-head-submenu_hover');
					$productHead.removeClass('product-head-inner_hover');
					$this.removeClass('product-head-menu-item_hover');
					$this.find('.product-head-submenu').hide();
					setTimeout(function () {
						$this.find('.product-head-submenu').removeAttr('style');
						$this.closest('.product-head').removeClass('product-head_hover');
						$productHead.removeClass('product-head-inner_open').removeClass('product-head-inner_darkest');
					}, 50);
				}
			}, 200);
		});

		$(document).on('click', '.product-head-menu-item__link', function() {
			var $this = $(this);
			if($this.hasClass('onHover') && $this.hasClass('product-head-menu-item__link_expanded')) {
				return false;
			}
		});

		$(document).on('click', '.product-head-mobile-menu-item_expanded', function(e) {
			if(e.target.tagName === 'LI') {
				var $this = $(this);
				var $open = $this.closest('ul').find('.product-head-mobile-menu-item_open');
				if($open.length) {
					$open.find('.product-head-mobile-submenu').slideUp(300, function() {
						$open.removeClass('product-head-mobile-menu-item_open');
					});
				}

				$this.toggleClass('product-head-mobile-menu-item_open');
				if($this.hasClass('product-head-mobile-menu-item_open')) {
					$this.find('.product-head-mobile-submenu').slideDown(300);
				} else {
					$this.find('.product-head-mobile-submenu').slideUp(300);
				}
			}
		});

		$(document).on('click', '.pm-head-menu__item_expanded', function(e) {
			if(e.target.tagName === 'LI') {
				var $this = $(this);
				var $open = $this.closest('ul').find('.pm-head-menu__item_open');
				if($open.length) {
					$open.find('.pm-head-menu__sublist').slideUp(300, function() {
						$open.removeClass('pm-head-menu__item_open');
					});
				}

				$this.toggleClass('pm-head-menu__item_open');
				if($this.hasClass('pm-head-menu__item_open')) {
					$this.find('.pm-head-menu__sublist').slideDown(300);
				} else {
					$this.find('.pm-head-menu__sublist').slideUp(300);
				}
			}
		});

		$(document).on('click', '.product-head-button span, .start-now', function() {
			$('.product-head-sidebar').addClass('product-head-sidebar_open');
		});
		$(document).on('click', '.product-head-sidebar-top__close', function() {
			$('.product-head-sidebar').removeClass('product-head-sidebar_open');
		});
	});
} (jQuery));
