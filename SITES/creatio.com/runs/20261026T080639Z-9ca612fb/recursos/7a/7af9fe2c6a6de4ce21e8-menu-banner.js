(function ($, Drupal) {
  'use strict';

  let timer;
  const timers = [];
  const arrays = [];

  Drupal.behaviors.creatio_component_menu_banner = {
    attach: (context, settings) => {}
  };

  const shuffle = (array) => {
    let currentIndex = array.length;

    while(currentIndex !== 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
  };

  const subMenuWidth = () => {
    const logo = $('.creatio-header-logo');
    const wd = $('.creatio-header .field--name-field-header-menu').width() - logo.width() - parseInt(logo.parent().css('margin-right')) + 15;
    $('.main-menu').attr('style', `--ts-submenu-wd: ${wd}px`);
  };

  const photosUpdate = (menuItemIndex) => {
    const array = arrays[menuItemIndex];
    const photos = $('.main-menu-item').eq(menuItemIndex).find('.ts-photos');
    const time = 1500;
    let currentTime = 0;
    for(let i = 0; i < array.length; i++) {
      if(typeof array[i] !== 'undefined') {
        if(array[i].length > 1) {
          currentTime += time;
        }
        if(typeof timers[menuItemIndex] === 'undefined') {
          timers[menuItemIndex] = [];
        }

        timers[menuItemIndex][timers[menuItemIndex].length] = setTimeout(() => {
          let index, newIndex;
          array[i].forEach((item, key) => {
            if(item.active) {
              index = key;
              newIndex = typeof array[i][index+1] === 'undefined' ? 0 : index+1;
            }
          });

          array[i][index].active = false;
          array[i][newIndex].active = true;

          photos.find('.ts-photos__img').eq(array[i][index].index).removeClass('active');
          photos.find('.ts-photos__img ').eq(array[i][newIndex].index).addClass('active');
        }, currentTime);
      }
    }
    timer = setTimeout(() => {
      photosUpdate(menuItemIndex);
    }, currentTime);
  };

  $(document).on('mouseenter', '.main-menu-item:has(.ts-photos)', (e) => {
    const menuItem = $(e.target).closest('.main-menu-item');
    const menuItemIndex = menuItem.index();

    if(typeof arrays[menuItemIndex] === 'undefined') {
      const photos = menuItem.closest('.main-menu-item').find('.ts-photos');
      const photosImg = photos.find('.ts-photos__img');
      const cols = 4;

      arrays[menuItemIndex] = [];

      photosImg.each((i, el) => {
        const img = $(el);
        const item = img.closest('.ts-photos__item');
        if(!img.hasClass('no-chnage')) {
          const row = (item.css('grid-row-start')-1)*cols;
          const col = item.css('grid-column-start')-1;
          const index = (row + col);
          if(typeof arrays[menuItemIndex][index] === 'undefined') {
            arrays[menuItemIndex][index] = [];
          }
          arrays[menuItemIndex][index].push({index: i, active: img.hasClass('active')});
        }
      });
      shuffle(arrays[menuItemIndex]);
      photosUpdate(menuItemIndex);
    }
  });

  $(document).ready(() => {
    subMenuWidth();
  });

  $(window).on('resize', () => {
    setTimeout(subMenuWidth, 10);
  });

}(jQuery, Drupal));
