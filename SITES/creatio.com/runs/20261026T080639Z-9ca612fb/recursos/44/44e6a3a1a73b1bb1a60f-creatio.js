window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }

(function ($, Drupal) {

  let flag = false;

  // Also check for the renamed version in newer core/modules
  if(Drupal.AjaxCommands && Drupal.AjaxCommands.prototype.scrollTop) {
    Drupal.AjaxCommands.prototype.scrollTop = function(ajax, response, status) {};
  }

  Drupal.behaviors.creatio = {
    attach: function (context, settings) {
      if(typeof Drupal.behaviors.form_creatio === 'undefined') {
        if(getCookie('bpmRef')) {
          $('form input[name="field_lead_bpmref"]').val(getCookie('bpmRef'));
        }
        $('form input[name="field_lead_bpmhref"]').val(getCookie('bpmHref'));
        $('form input[name="field_lead_bpmsessionid"]').val(getCookie('bpmTrackingId'));

        const country = $('select[name="field_lead_country"]', context);
        if(country.length && !country.closest('#drupal-modal').length && typeof window.intlTelInputGlobals !== 'undefined') {
          country.once('country_option_each').find('option').each(function() {
            const option = $(this);
            let val = option.val();
            if(val.length) {
              if(val === 'USA') {
                val = 'United States';
              } else if(val === 'UAE') {
                val = 'United Arab Emirates';
              }

              $.each(window.intlTelInputGlobals.getCountryData(), function(index, value) {
                if(value.name.indexOf(val) > -1) {
                  option.attr('data-country-code', value.iso2);
                  option.attr('data-dial-code', value.dialCode);
                }
              });
            }
          });

          country.once('country_change').bind('change', function() {
            const $this = $(this);
            const iti = $('input[name="field_lead_mobilephone"]');
            if(flag) {
              let countryCode = $this.find('option:selected').data('country-code'), val;
              const dialCode = $this.find('option:selected').data('dial-code');
              const input = $this.closest('form').find('input.form-tel');
              if(typeof countryCode === 'undefined' && typeof dialCode === 'undefined') {
                countryCode = '';
                val = '+';
              } else {
                if(typeof iti.intlTelInput('getSelectedCountryData').dialCode === 'undefined') {
                  val = `+${dialCode}`;
                } else {
                  val = input.val().replace(`+${iti.intlTelInput('getSelectedCountryData').dialCode}`, `+${dialCode}`);
                }
              }
              iti.intlTelInput('setCountry', countryCode);
              input.val(val);
            }

            flag = true;
          }).trigger('change');

          $('input.form-tel', context).bind('focus', function() {
            const input = $(this);
            if(!input.val().length && typeof input.intlTelInput('getSelectedCountryData').dialCode !== 'undefined') {
              input.val(`+${input.intlTelInput('getSelectedCountryData').dialCode}`);
            }
          });

          $(document).on('click', '.iti .iti__country', function() {
            const item = $(this);
            let val = $(`select[name="field_lead_country"] option[data-country-code="${item.data('country-code')}"]`).val();
            if(typeof val !== 'undefined') {
              $('select[name="field_lead_country"]').val(val).trigger('change');
            }
          });
        }
      }
    }
  };

  function getCookie(name) {
    var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

	$(document).ready(function() {
    Fancybox.bind('[data-fancybox]', {});

		var $body = $('body');
		var isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
		if(isMac) {
			$body.addClass('is-mac');

      if(navigator.platform === 'iPad') {
        $body.addClass('is-mac_ipad');
      } else if(navigator.platform === 'iPhone') {
        $body.addClass('is-mac_iphone');
      } else {
        $body.addClass('is-macintosh');
      }
		}
    const UserAgent = navigator.userAgent;
		var isIE = UserAgent.indexOf("Trident") > -1;
    var isSafari = (UserAgent.indexOf("Safari") > -1 && UserAgent.indexOf("Chrome") === -1);
		var isEdge = UserAgent.indexOf("Edge") > -1;
		if(isEdge) { $body.addClass('is-Edge'); }
		if(isSafari) { $body.addClass('is-Safari'); }
		if(isIE) {
			$body.addClass('is-IE');
		} else {
			$('.creatio-animation').each(function() {
				$(this).addClass('animation').addClass('creatio-animation_init');
			});
		}

    const id = location.hash;
    if(id.length) {
      const element = $(id);
      if(element.length) {
        $([document.documentElement, document.body]).scrollTop(10000);
        $([document.documentElement, document.body]).scrollTop(0);
        setTimeout(() => {
          let top = element.offset().top - parseInt($body.css('padding-top')) - 32;
          if($('.creatio-header').css('display') !== 'none') {
            top -= $('.creatio-header-menu').height();
          } else {
            top -= $('.creatio-mobile-header-top').height();
          }

          const wm = $('#ts-navigation');
          if(wm.length && wm.css('display') === 'block') {
            top -= wm.height() + parseInt(element.css('margin-top')) - 1;
          }

          $([document.documentElement, document.body]).animate({
            scrollTop: top
          }, {
            duration: 700,
            queue: false
          });
        }, 10);
      }
    }

		const $award = $('.creatio-region-award__text');
		if($award.length) {
      $award.closest('.creatio-region-award__content').height($award.outerHeight(true));
    }

    sectionMenuTitleMultiple();

    setTimeout(function() {
      var st = $(window).scrollTop();
      $(window).scrollTop(st+1);
      $(window).scrollTop(st-1);
    }, 300);

    $(document).on('click', '.creatio-content a, .creatio-content input.form-submit', function() {
			var $this = $(this);
			if(typeof $this.attr('id') !== 'undefined') {
        let action = getAction($this);
        if(typeof ga !== 'undefined') {
          ga('send', {
            'event': 'GAEvent',
            'eventCategory': $this.attr('id'),
            'eventAction': action,
            'eventLabel': $this.attr('href')
          });
        }
			} else if ($this.hasClass('product-pricing-list__link_buy')) {
        let a = $this.parent().parent().find('.product-pricing-list__title').text();
        let c, b;
        $this.parent().parent().find('.product-pricing-list__cost-currency').each(function(){
          if($(this).is(':visible')){
            b = $(this).text();
          }
        });
        $this.parent().parent().find('.product-pricing-list__cost_active .cost').each(function(){
          let v = $(this).text().indexOf(b);
          if($(this).text().indexOf(b) > -1 && $(this).is(':visible')){
            c = $(this).text();
          }
        });
        if(c === undefined){
          c = $this.parent().parent().find('.product-pricing-list__cost_active').text();
        }
        ga('send', {
          'event': 'GAEvent',
          'eventCategory': 'product-pricing-button',
          'eventAction': 'click - Buy now',
          'eventLabel': a,
          'eventValue': c,
        });
      }
		});

    // eventValue
		$(document).on('blur', '.creatio-footer-newsletter input[name="field_lead_email"]', function () {
		  const $this = $(this);
      const $form = $this.closest('form');
		  $form.find('input[name="field_lead_company"]').val($this.val());
    });
		$(document).on('blur', '.webform-submission-newsletter-insights-form input[name="field_lead_name"]', function () {
		  const $this = $(this);
      const $form = $this.closest('form');
		  $form.find('input[name="field_lead_company"]').val($this.val());
    });

		sliderResize();

    const awards = $('.view-block-awards .view-header .view-content');
    const count =  awards.find('.views-row').length - 1;
    let rowsWidth = 0, awardsWidth = awards.outerWidth(true);
    awards.find('.views-row').each((index, item) => {
      rowsWidth += $(item).outerWidth(true);
    });
    let arrows = false, infinite = false, touchMove = false;
    if(rowsWidth > awardsWidth) {
      arrows = true, infinite = true, touchMove = true;
      awards.addClass('slider');
    }

    $(window).on('resize', () => {
      awardsWidth = awards.outerWidth(true);

      if(rowsWidth > awardsWidth && !awards.hasClass('slider')) {
        awards.slick('slickSetOption', {
          arrows: true,
          infinite: true,
          touchMove: true,
        }, true);
        awards.addClass('slider');
      }

      if(rowsWidth < awardsWidth && awards.hasClass('slider')) {
        awards.slick('slickSetOption', {
          arrows: false,
          infinite: false,
          touchMove: false,
        }, true);
        awards.removeClass('slider');
      }
    });

    awards.slick({
      arrows: arrows,
      focusOnSelect: false,
      infinite: infinite,
      slidesToShow: count,
      speed: 300,
      variableWidth: true,
      touchMove: touchMove,
			responsive: [
				{
					breakpoint: 1200,
					settings: {
						arrows: true,
						infinite: true,
						touchMove: true
					}
				},
				{
					breakpoint: 768,
					settings: {
						arrows: true,
						infinite: true,
						slidesToShow: 2,
						variableWidth: false
					}
				}
			]
		}).on('beforeChange', function(event, slick, currentSlide, nextSlide) {
			if($(slick.$slideTrack).css('display') !== 'inline-block') {
				$('.view-block-awards .view-header .slick-slide[data-slick-index="'+nextSlide+'"] .award-logo').trigger('mousedown');
			}
		});

		var $awardContent = $('.view-block-awards .row-content');
		$(document).on('mousedown', '.award-logo', function() {
			var $this = $(this);
			if(!$this.hasClass('active')) {
				var index = $this.data('index');
				$('.award-logo').add($awardContent).removeClass('active');
				$this.add($awardContent.eq(index)).addClass('active');
				if($awardContent.eq(index).find('.slick-slider').length) {
					$awardContent.eq(index).find('.slick-slider').slick('unslick');
				}
				$awardContent.eq(index).find('.item-list ul').slick({
					arrows: false,
					dots: true,
					infinite: false,
					slidesToShow: 1,
					speed: 300
				});
			}
		});
		$('.view-block-awards .slick-active .award-logo[data-index="0"]').trigger('mousedown');

		$('.node--type-customer').each(function() {
			var $this = $(this);
			var $edit = $this.find('.contextual .entitynodeedit-form a');
			if($edit.length) {
				var linkArr = $edit.attr('href').split('?');
				$this.find('.contextual ul').prepend('<li><a href="'+linkArr[0].replace('/edit', '')+'">'+Drupal.t('View')+'</a></li>');
			}
		});

		$(document).on('mouseenter', '.product-pricing-table__help', function() {
		  $(this).addClass('product-pricing-table__help_hover');
    });

		$(document).on('mouseleave', '.product-pricing-table__help', function() {
		  var $this = $(this);
		  setTimeout(function() {
        $this.removeClass('product-pricing-table__help_hover');
      }, 100);
    });

		$(document).on('mouseenter', '.creatio-section-server', function() {
			var $this = $(this);
			var $map = $this.closest('.creatio-section-map');
			$this.find('.creatio-section-server__point').addClass('creatio-section-server__point_hover');
			$map.find('.creatio-section-server__point').addClass('creatio-section-server__point_paused');
			setTimeout(function () {
				$this.addClass('creatio-section-server_hover');
			}, 500);
		});

		$(document).on('mouseleave', '.creatio-section-server', function() {
			var $this = $(this);
			var $map = $this.closest('.creatio-section-map');
			$this.find('.creatio-section-server__point').removeClass('creatio-section-server__point_hover');
			$map.find('.creatio-section-server__point').removeClass('creatio-section-server__point_paused');
			setTimeout(function () {
				$this.removeClass('creatio-section-server_hover');
			}, 500);
		});

    $('.creatio-section-price__description').matchHeight();
		$(document).on('mouseenter', '.creatio-section-price__item', function() {
		  var $this = $(this);
		  if(!$this.hasClass('creatio-section-price__item_active')) {
        var $parent = $this.closest('.creatio-section-price');
        $parent.find('.creatio-section-price__item_active').removeClass('creatio-section-price__item_active');
        $this.addClass('creatio-section-price__item_active');
      }
    });
		$(document).on('mouseleave', '.creatio-section-price', function() {
		  var $defaultItem = $('.creatio-section-price__item[data-default="1"]');
		  if(!$defaultItem.hasClass('creatio-section-price__item_active')) {
        $defaultItem.trigger('mouseenter');
      }
    });

		$('.product-pricing-list__description').matchHeight();
		$(document).on('mouseenter', '.product-pricing-list__item', function() {
		  var $this = $(this);
		  if(!$this.hasClass('product-pricing-list__item_active')) {
        var $parent = $this.closest('.product-pricing-list');
        $parent.find('.product-pricing-list__item_active').removeClass('product-pricing-list__item_active');
        $this.addClass('product-pricing-list__item_active');
      }
    });
		$(document).on('mouseleave', '.product-pricing-list', function() {
		  var $defaultItem = $('.product-pricing-list__item[data-default="1"]');
		  if($defaultItem.length) {
        if(!$defaultItem.hasClass('product-pricing-list__item_active')) {
          $defaultItem.trigger('mouseenter');
        }
      } else {
		    $('.product-pricing-list__item_active').removeClass('product-pricing-list__item_active');
      }
    });

		$(document).on('click', '.digital-events__display-toggle', function() {
		  var href = $(this).closest('.digital-events__display-modes').find('.digital-events__display-mode:not(.digital-events__display-mode_active)').attr('href');
		  window.location = href;
    });

		$(document).on('click', '.creatio-values-menu-items__item', function() {
			var $this = $(this);
			var index = $this.index();
			var $section = $('.creatio-value');
			var top = 0;
			switch(index) {
				case 0:
					top = 0;
					break;
				case 1:
					top = $section.eq(index).closest('.creatio-region').offset().top;
					break;
				default:
					top = $section.eq(index).closest('.creatio-region').offset().top - $(window).height()*0.125;
			}
			$('html, body').animate({scrollTop: top}, {duration: 700, queue: false});
		});

		$(document).on('click', '.creatio-accordion__title', function() {
		  var $this = $(this);
		  $this.toggleClass('creatio-accordion__title_active');
		  $this.closest('.creatio-accordion__row').find('.creatio-accordion__content').slideToggle(300, function() {
        if(!$this.hasClass('creatio-accordion__title_active')) {
          $(window).trigger('scroll');
        }
      });
    });

    if($('.value-content-num').length) {
      new Rellax('.value-content-num', {
        speed: 2.5,
        center: true,
        wrapper: null,
        round: true,
        vertical: true,
        horizontal: false
      });
    }
	});

  $(window).on('load', function() {
		var $customers = $('.field--name-field-customers > .field__item');
		if($customers.length) {
			var arr = [];
			for(var $i = 0; $i < $customers.length; $i++) {
				arr[$i] = $i;
			}
			shuffle(arr);
			for($i = 0; $i < arr.length; $i++) {
				var index = arr[$i];
				$customers.eq(index).css('transition-delay', ($i*0.02)+'s');
			}
		}
    var reload = getUrlParameter('reload');
    if(typeof reload !== 'undefined' && reload == 1){
      if($('#webform-submission-trial-form-add-form').length){
        var $form = $('#webform-submission-trial-form-add-form');
      }else{
        $form = $('#webform-submission-trial-add-form');
      }
      if(typeof $form !== 'undefined') {
        $('html, body').animate({scrollTop: $form.offset().top}, 'slow');
      }
    }
	});

	$(window).on('resize', function() {
		sliderResize();
		setTimeout(function () {
      sectionMenuTitleMultiple();
    }, 300);
	});

	$(window).on('scroll', function() {
		var st = $(window).scrollTop();
		var wh = $(window).height();

    $('.block-system-main-block .lazyloaded.remove-attributes').each(function() {
      var $this = $(this);
      $this.removeAttr('style').removeClass('remove-attributes');
    });

		$('.creatio-animation.animation:not(.animated)').each(function() {
			var $this = $(this);
			var cf = 0.05;
      if(typeof $this.attr('data-height') !== 'undefined') {
        cf = $this.attr('data-height');
      } else if($this.attr('class').indexOf('creatio-animation_queue') > -1) {
				cf = 0.2;
			} else if($this.find('.ts-video').length) {
        cf = 0.3;
      }
			var top = $this.offset().top + wh*cf;
      if($this.attr('class').indexOf('creatio-animation_fh') > -1) {
        top = $this.offset().top + $this.outerHeight(true);
      }
			if(top < st + wh) {
				$this.addClass('animated').removeClass('creatio-animation_init');

				if($this.find('.ts-video').length) {
          videoPlay($this.find('.ts-video video'));
        }

				if($this.find('.creatio-section-tabs').length) {
					var $tabs = $this.find('.creatio-section-tabs');
					if($tabs.find('.creatio-section-tabs-content_carousel').length) {
            $tabs.find('.creatio-section-tabs-content_carousel').on('init', function(event, slick) {
              var prev = slick.slideCount-1;
              var next = 1;
              var $prev = $(slick.$slider).find('.slick-slide[data-slick-index="'+prev+'"]');
              var $next = $(slick.$slider).find('.slick-slide[data-slick-index="'+next+'"]');
              $prev.addClass('slick-slide-prev');
              $next.addClass('slick-slide-next');
              slick.$prev = $prev;
              slick.$next = $next;
            }).once().on('beforeChange', function(event, slick, currentSlide, nextSlide) {
              slick.$prev.removeClass('slick-slide-prev').removeClass('slick-slide-z-1');
              slick.$next.removeClass('slick-slide-next').removeClass('slick-slide-z-1');
              var prev = nextSlide-1;
              var next = nextSlide+1;
              if(prev < 0) {
                prev = slick.slideCount-1;
              }
              if(next === slick.slideCount) {
                next = 0;
              }

              var $prev = $(slick.$slider).find('.slick-slide[data-slick-index="'+prev+'"]');
              var $next = $(slick.$slider).find('.slick-slide[data-slick-index="'+next+'"]');
              $prev.addClass('slick-slide-prev');
              $next.addClass('slick-slide-next');

              if(nextSlide > currentSlide && nextSlide !== slick.slideCount-1) {
                $prev.addClass('slick-slide-z-1');
              }
              if((nextSlide < currentSlide && currentSlide !== slick.slideCount-1) || (currentSlide === 0 && nextSlide === slick.slideCount-1)) {
                $next.addClass('slick-slide-z-1');
              }

              slick.$prev = $prev;
              slick.$next = $next;
            }).slick({
              arrows: false,
              autoplay: true,
              autoplaySpeed: 6000,
              centerMode: true,
              centerPadding: '0',
              focusOnSelect: true,
              pauseOnFocus: false,
              pauseOnHover: false,
              slidesToShow: 1,
              slidesToScroll: 1,
              asNavFor: $tabs.find('.creatio-section-tabs-menu'),
            });
          } else {
					  let adaptiveHeight = false;
					  if(typeof $tabs.find('.creatio-section-tabs-content').data('adaptive-height') !== 'undefined' && $tabs.find('.creatio-section-tabs-content').data('adaptive-height') === true) {
              adaptiveHeight = true;
            }
            $tabs.find('.creatio-section-tabs-content').on('init', function(event, slick) {
              setTimeout(function() {
                if(typeof $(slick.$slider).find('.slick-list').attr('style') !== 'undefined') {
                  $(slick.$slider).find('.slick-list').css('height', $(slick.$slider).find('.slick-slide[data-slick-index="0"]').height());
                }
              }, 150);
            }).slick({
              arrows: false,
              autoplay: true,
              autoplaySpeed: 6000,
              adaptiveHeight: adaptiveHeight,
              fade: true,
              pauseOnFocus: false,
              pauseOnHover: false,
              slidesToShow: 1,
              slidesToScroll: 1,
              asNavFor: $tabs.find('.creatio-section-tabs-menu'),
              responsive: [
                {
                  breakpoint: 992,
                  settings: {
                    adaptiveHeight: true
                  }
                }
              ]
            });
          }
					$tabs.find('.creatio-section-tabs-menu').slick({
						slidesToShow: 5,
						slidesToScroll: 1,
						asNavFor: $tabs.find('.creatio-section-tabs-content'),
						focusOnSelect: true,
						variableWidth: true,
						responsive: [
							{
								breakpoint: 992,
								settings: {
									slidesToShow: 1,
									variableWidth: false
								}
							}
						]
					});
					$tabs.find('.creatio-section-tabs-menu').find('.slick-slide').removeClass('slick-current');
					setTimeout(function() {
						$tabs.find('.creatio-section-tabs-menu').find('.slick-slide[aria-hidden="false"]').first().addClass('slick-current');
					}, 1);
				}

				var $slides = $this.find('.creatio-section-slides');
				if($slides.length) {
					$slides.slick({
						centerMode: true,
						centerPadding: 0,
						focusOnSelect: true,
						slidesToShow: 5,
						slidesToScroll: 1,
						prevArrow: '<button class="slick-prev slick-prev-large" aria-label="Previous" type="button"></button>',
						nextArrow: '<button class="slick-next slick-next-large" aria-label="Next" type="button"></button>',
						responsive: [
							{
								breakpoint: 992,
								settings: {
									slidesToShow: 3
								}
							},
							{
								breakpoint: 767,
								settings: {
									slidesToShow: 1
								}
							}
						]
					});
				}

				var $slider = $this.find('.creatio-section-slider');
				if($slider.length) {
					$slider.slick({
            arrows: false,
            autoplay: true,
            autoplaySpeed: 6000,
            dots: true,
            fade: true,
					});
				}

				var $word = $this.find('.animate-word');
				if($word.length) {
					$word.wordAnimate(80, 3);
				}
				var $text = $this.find('.animate-text');
				if($text.length) {
					$text.textAnimate();
				}
			}
		});

		$('video:not(.no-autoplay):not(.cols-video)').each(function() {
			var $this = $(this);
			var cf = 0.05;

			var top = $this.offset().top + wh*cf;
			if(top < st + wh && typeof $this.attr('autoplay') === 'undefined') {
				 $this[0].play();
         $this.attr('autoplay', '');
			}
		});

		var $values = $('.creatio-values');
		if($values.length) {
			var $menu = $('.creatio-values-menu');
			var hh = $('.creatio-header').height();
			if(st+wh-hh > $values.outerHeight(true)+(wh-hh-$('.creatio-values-menu-items').height())/2) {
				$menu.addClass('creatio-values-menu_hide');
			} else {
				if($menu.hasClass('creatio-values-menu_hide')) {
					$menu.removeClass('creatio-values-menu_hide');
				}
			}

			$('.creatio-values-menu-items__item').each(function() {
				var $this = $(this);
				if($values.offset().top-st <= $this.offset().top-st) {
					$this.addClass('creatio-values-menu-items__item_dark');
				} else {
					if($this.hasClass('creatio-values-menu-items__item_dark')) {
						$this.removeClass('creatio-values-menu-items__item_dark');
					}
				}
			});

			$values.find('.creatio-region').each(function() {
				var $this = $(this);
				var index = $this.index()+1;
				var top = $this.offset().top - wh*0.125 - $this.find('.creatio-value-content').height();
				if(st >= top && st <= top+$this.outerHeight(true)) {
					if(!$menu.find('.creatio-values-menu-items__item').eq(index).hasClass('creatio-values-menu-items__item_active')) {
						$menu.find('.creatio-values-menu-items__item').removeClass('creatio-values-menu-items__item_active');
						$menu.find('.creatio-values-menu-items__item').eq(index).addClass('creatio-values-menu-items__item_active');
					}
				}
			});

			if(st < $values.find('.creatio-region').first().offset().top) {
				if(!$menu.find('.creatio-values-menu-items__item').eq(0).hasClass('creatio-values-menu-items__item_active')) {
					$menu.find('.creatio-values-menu-items__item').removeClass('creatio-values-menu-items__item_active');
					$menu.find('.creatio-values-menu-items__item').eq(0).addClass('creatio-values-menu-items__item_active');
				}
			}
		}
	});

  $(document).on('click', '.ts-video__repeat', (e) => {
    const repeat = $(e.target).closest('.ts-video__repeat');
    const video = repeat.closest('.ts-video').find('video');
    repeat.removeClass('show');
    videoPlay(video);
  });

  const videoPlay = (selector) => {
    const video = selector[0];
    video.play();

    const repeat = selector.closest('.ts-video').find('.ts-video__repeat');
    if(repeat.length) {
      const timer = setInterval(() => {
        if(video.currentTime === video.duration) {
          repeat.addClass('show');
          clearInterval(timer);
        }
      }, 500);
    }
  };

	function sliderResize() {
		var $news = $('.view-news-webinars-creatio .view-content');
		if($news.css('display') === 'block') {
			if(!$news.hasClass('slick-slider')) {
				$news.slick({
					arrows: true,
					dots: true,
					infinite: false,
					slidesToShow: 1,
					speed: 300
				});
			}
		} else {
			if($news.hasClass('slick-slider')) {
				$news.slick('unslick');
			}
		}

		var $customers = $('.block-customers .field--name-field-customers');
		if($customers.css('display') === 'block') {
			if(!$customers.hasClass('slick-slider')) {
				$customers.slick({
					arrows: true,
					dots: true,
					infinite: false,
					rows: 2,
					slidesToShow: 2,
					slidesToScroll: 2,
					speed: 300
				});
			}
		} else {
			if($customers.hasClass('slick-slider')) {
				$customers.slick('unslick');
			}
		}
	}

	function sectionMenuTitleMultiple() {
	  $('.creatio-section-menu-title').textIsMultiple('creatio-section-menu-title');
  }

	function shuffle(arr) {
		var j, temp;
		for(var i = arr.length - 1; i > 0; i--){
			j = Math.floor(Math.random()*(i + 1));
			temp = arr[j];
			arr[j] = arr[i];
			arr[i] = temp;
		}
		return arr;
	}

	function getAction(e){
	  let action = '';
    switch(e.attr('id')){
      case "main-menu-try-it-free":
      case "studio-menu-try-it-free":
        action = "click - Try it free";
        break;
      case "main-menu-request-demo":
      case "product-menu-request-demo":
        action = "click - Request demo";
        break;
      case "product-menu-start-now":
        action = "click - Start now";
        break;
      case "studio-menu-sign-up":
        action = "click - Sign up";
        break;
      case "studio-menu-log-in":
        action = "click - Log in";
        break;
      case "watch-the-video-button":
        action = "click - Testimonial video";
        break;
      case "onpage-cta-button":
        if(e.attr('href').indexOf('//accounts') > -1){
          action = "click - Get started free";
        }
        if($('html').hasClass('path-portal')){
          action = "click - Request demo";
        }
        if(e.attr('href').indexOf('en-studio') > -1 && $('html').hasClass('path-studio')){
          action = "click - Test drive";
        } else if(e.attr('href').indexOf('trial') > -1){
          action = "click - Try it free";
        }
        break;
      case "testimonial-video-button":
        action = "click - Testimonial video";
        break;
      case "product-pricing-button":
        if($('body').hasClass('path-marketing') && e.parents('#ts-buy-calculator-product').length > 0) {
          action = 'click - Buy now';
        } else if($('body').hasClass('path-sales')) {
          action = 'click - Buy now';
        } else if($('body').hasClass('path-service')) {
          action = 'click - Buy now';
        }
        break;
      default:
        action = 'click';
        break;
    }
    return action;
  }

  var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }
  };

} (jQuery, Drupal));

