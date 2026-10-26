(function ($, Drupal) {
  'use strict';
  /**
   * Behavior description.
   */

  Drupal.behaviors.creatio_element_link_anchor = {
    attach: (context, settings) => {
      const body = $('body');

      $(document).once('linkAnchorClick').on('click', '.link-anchor', (e) => {
        const link = $(e.target).closest('.link-anchor');
        if(typeof link.attr('href') !== 'undefined') {
          const elem = $(link.attr('href'));
          if(elem.length) {
            setTimeout(() => {
              let top = elem.offset().top - parseInt(body.css('padding-top'));
              const header = $('.creatio-header');
              if(header.length) {
                if(header.css('display') !== 'none') {
                  top -= $('.creatio-header-menu').height();
                } else {
                  top -= $('.creatio-mobile-header-top').height();
                }
              }

              const wm = $('#ts-navigation');
              if(wm.length && wm.css('display') === 'block') {
                top -= wm.height() - 1;
              }
              top -= parseInt(elem.css('margin-top'));

              if(elem.closest('.ts-toc-content').length) {
                top -= parseInt(elem.closest('.ts-toc-content').css('padding-top'));
              }

              $([document.documentElement, document.body]).animate({
                scrollTop: top
              }, {
                duration: 700,
                queue: false
              });
            }, 50);
          }
        }

        return false;
      });
    }
  };

} (jQuery, Drupal));
