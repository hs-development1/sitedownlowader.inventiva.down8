(function ($, Drupal) {
  'use strict';
  Drupal.behaviors.tabs = {
    attach: (context, settings) => {}
  };

  $(document).ready(() => {
    const $tabs = $('.region-tabs');
    if($tabs.length) {
      $tabs.append('<div class="toggle-tabs"></div>');
      $tabs.find('.toggle-tabs').bind('click', () => {
        $tabs.toggleClass('open');
      });
    }
  });
} (jQuery, Drupal));
