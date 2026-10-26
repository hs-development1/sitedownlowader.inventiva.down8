(function ($, Drupal) {
	$.fn.wordAnimate = function(delay, count) {
		return this.each(function() {
			var $this = $(this);
			var text = $this.text();
			var length = text.length;
			var counter = 0;
			$this.text('');

			var timer = setInterval(function () {
				var symbol = text[counter];
				var symbols = getSymbols(symbol, count);

				var i = 0;
				var duration = Math.floor(delay/symbols.length/10)*10;
				var timer2 = setInterval(function() {
					if(!i) {
						var html = $this.html();
						html += '<span style="opacity: 0;"></span>';
						$this.html(html);
					}
					var $span = $this.find('span').last();

					i++;
					if(i === symbols.length) {
						clearInterval(timer2);
						$span.text(symbol);
						$span.css('opacity', 1);
					} else {
						$span.text(symbols[i]);
						$span.css('opacity', 1/(symbols.length-i));
					}
				}, duration);

				counter++;
				if(counter === length) {
					clearInterval(timer);
					if(typeof timer2 !== 'undefined') {
						clearInterval(timer2);
					}
					$this.html(text);
				}
			}, delay);
		});
	};

	$.fn.textAnimate = function() {
		return this.each(function() {
			var $this = $(this);
			var height = $this.height();
			var lineHeight = parseFloat($this.css('line-height'));
			var rows = height / lineHeight;
			var html = '';
			var delay = 0;
			for(var i = 0; i < rows; i++) {
				html += '<div class="text-row" style="height: '+(lineHeight-2)+'px; animation-delay: '+delay+'s;"></div>';
				delay += 0.5;
			}
			$this.append('<div class="text-rows">'+html+'</div>');
			setTimeout(function() {
				$this.find('.text-rows').remove();
			}, rows*500);
		});
	};

  $.fn.textIsMultiple = function(className) {
    return this.each(function() {
      var $this = $(this);
      $this.removeClass(className+'_multiple');
      var height = $this.height();
      var lineHeight = parseFloat($this.css('line-height'));
      var rows = height / lineHeight;
      if(rows > 1) {
        $this.addClass(className+'_multiple');
        if($this.find('br').length) {
          $this.find('span').css('left', $this.find('br').offset().left-$this.offset().left);
        } else {
          $this.append('<span class="'+className+'__hidden" style="padding: 0;"></span>');
          var $row = $this.find('.'+className+'__hidden');
          var words = $this.html().replace(/(<([^>]+)>)/ig, '').trim().split(' ');
          words.forEach(function(word) {
            $row.html($row.html().trim()+' '+word);
            if($row.height() > lineHeight) {
              $row.html($row.html().replace(word, ''));
              $this.find('span:not(.creatio-section-menu-title__hidden)').css('left', $row.width());
              $row.remove();
            }
          });

        }
      }
    });
  };

	$.fn.fitText = function(generate) {
		return this.each(function() {
			const elem = $(this);
			if(generate) {
				const lines = elem.html().split('<br>');
				elem.html('<span>' + lines.join('</span><span>') + '</span>');
			} else {
				elem.find('> span').removeAttr('style');
			}
			elem.find('> span').each((index, item) => {
				let size = parseInt(elem.css('font-size'));
				while($(item).width() < elem.width()) {
					$(item).css('font-size', size+'px');
					size += 0.25;
				}
			});
		});
	};

	function getSymbols(symbol, count) {
		var symbols = [];
		var string = '';
		switch(drupalSettings.path.currentLanguage) {
			case 'ru':
				break;
			case 'uk':
				break;
			default:
				string = 'abcdefghiklmnopqrstvxyz';
		}
		string = string.replace(symbol.toLowerCase(), '');

		for(var i = 0; i < count; i++) {
			var index = Math.floor((Math.random() * string.length-1) + 1);
			symbols[i] = string[index];
		}
		symbols[symbols.length] = symbol;

		return symbols;
	}
} (jQuery, Drupal));
