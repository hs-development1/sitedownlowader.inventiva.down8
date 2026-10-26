(function ($, Drupal) {
  'use strict';

  const allowedFields = [
    'field_lead_firstname',
    'field_lead_lastname',
    'field_lead_email',
    'field_lead_company_website',
    'field_lead_mobilephone',
    'field_lead_job_title'
  ];

  Drupal.behaviors.form_autofill = {
    attach: function (context, settings) {
      if(typeof Drupal.webform !== 'undefined' && typeof Drupal.webform.intlTelInput !== 'undefined' && typeof Drupal.webform.intlTelInput.options !== 'undefined') {
        //Drupal.webform.intlTelInput.options.excludeCountries = ['BY', 'CU', 'ER', 'RU', 'IR', 'LY', 'KP', 'SO', 'SD', 'SS', 'SY', 'VE', 'YE', 'ZW'];
        Drupal.webform.intlTelInput.options.onlyCountries = [
          'AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD',
          'BB', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BV', 'BR', 'IO', 'BN', 'BG', 'BF', 'BI', 'KH',
          'CM', 'CA', 'CV', 'KY', 'CF', 'TD', 'CL', 'CN', 'CC', 'CO', 'KM', 'CD', 'CG', 'CK', 'CR', 'CI', 'HR', 'CU',
          'CW', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'FK', 'FJ', 'FI', 'FR',
          'GF', 'PF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GN', 'GW', 'GY', 'HT',
          'HM', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ',
          'KE', 'KI', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MK', 'MG', 'MW', 'MY',
          'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA',
          'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'KP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG',
          'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'XK', 'RO', 'RW', 'BL', 'KN', 'LC', 'PM', 'VC', 'WS', 'SM',
          'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'KR', 'SS', 'ES', 'LK',
          'SD', 'SR', 'SJ', 'SZ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN', 'TR', 'TM',
          'TC', 'VI', 'UG', 'UA', 'AE', 'GB', 'US', 'UM', 'UY', 'UZ', 'VU', 'VA', 'VE', 'VN', 'WF', 'EH', 'YE', 'ZM', 'ZW'
        ];
      }

      $('form .form-submit', context).once().bind('mousedown', function() {
        var $form = $(this).closest('form');
        var $name = $form.find('input[name="field_lead_firstname"]:not(.no-autofill)');
        if($name.length && $name.val().trim().length) {
          var name = $name.val().trim();
          var data = JSON.parse(localStorage.getItem('form_autofill'));
          if(data === null) {
            data = Object();
          } else {
            var keys = Object.keys(data);
            if(keys.length === 3 && keys.indexOf(name) === -1) {
              var key = Object.keys(data).shift();
              delete data[key];
            }
          }
          $form.find('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], select').each(function() {
            const $this = $(this);
            const key = $this.attr('name');
            if(typeof key !== 'undefined' && key !== $name.attr('name') && allowedFields.includes(key)) {
              if(typeof data[name] === 'undefined') {
                data[name] = Object();
              }
              data[name][key] = $this.val();
            }
          });
          localStorage.setItem('form_autofill', JSON.stringify(data));
        }
      });

      $('input[name="field_lead_firstname"]:not(.no-autofill)').once().bind('blur', function() {
        var $this = $(this);
        var $form = $this.closest('form');
        var data = JSON.parse(localStorage.getItem('form_autofill'));
        if(data !== null) {
          var name = $this.val().trim();
          if(typeof data[name] !== 'undefined') {
            $.each(data[name], function(key, value) {
              if(allowedFields.includes(key)) {
                var $elem = $form.find('[name="'+key+'"]');
                if($elem.length) {
                  if($elem.prop('tagName') === 'SELECT') {
                    if($form.find('[name="'+key+'"] option[value="'+value+'"]').length) {
                      $form.find('[name="'+key+'"]').val(value);
                      $elem.trigger('change');
                    }
                  } else {
                    if(value.length) {
                      if(key === 'field_lead_mobilephone') {
                        $elem.intlTelInput('setNumber', value);
                      } else {
                        $form.find('[name="'+key+'"]').val(value);
                      }
                      $form.find('[name="'+key+'"]').trigger('change');
                      $form.find('[name="'+key+'"]').closest('.form-item').addClass('focus');
                    }
                    if($elem.attr('type') !== 'undefined' && $elem.attr('type') === 'tel' && typeof data[name]['field_lead_country'] !== 'undefined') {
                      var country = data[name]['field_lead_country'];
                      var code = $('.country-list li[data-country="'+country+'"]').data('country-code');
                      if(code !== 'undefined') {
                        $elem.intlTelInput('setCountry', code);
                      }
                    }
                  }
                }
              }
            });
          }
        }
      });

      $(document).on('focus', '.select2-selection.select2-selection--single', function(e) {
        $(this).closest(".select2-container").siblings('select:enabled').select2('open');
      });
      $('select.select2').on('select2:closing', function (e) {
        $(e.target).data("select2").$selection.one('focus focusin', function(e) {
          e.stopPropagation();
        });
      });
    }
  };

  const SetCountry = (TargetField) => {
    if(!$(TargetField).hasClass('no-auto-change') || ($(TargetField).hasClass('no-auto-change') && !$(TargetField).val())) {
      let ISO = window.ts_country.iso;
      const tel = $(TargetField).closest('form').find('input[type="tel"][data-webform-telephone-international-initial-country]');
      if(window.ts_country.source === 'direct' && tel.length) {
        ISO = tel.data('webform-telephone-international-initial-country');
      }
      let CountryOption = $(TargetField).find('option[data-country-code='+ISO.toLowerCase()+']');
      if(CountryOption.length > 0) {
        $(TargetField).val(CountryOption.attr('value')).trigger('change');
      }
    }
  };
  $(document).on('countrychange', '[name="field_lead_mobilephone"]', function() {
    let item = $(this);
    let val = item.parents('form').find('select[name="field_lead_country"] option[data-country-code='+item.intlTelInput('getSelectedCountryData').iso2+']').val();
    if(typeof val !== 'undefined') {
      item.parents('form').find('select[name="field_lead_country"]').val(val).trigger('change');
    }
  });
  $(document).on('click', '.iti .iti__country', function() {
    const item = $(this);
    let val = item.parents('form').find('select[name="field_lead_country"] option[data-country-code='+item.data('country-code')+']').val();
    if(typeof val !== 'undefined') {
      item.parents('form').find('select[name="field_lead_country"]').val(val).trigger('change');
    }
  });
  $(document).ready(function() {
    let ObservedSelects = [];

    const Observer = new MutationObserver(() => {
      $('select[name="field_lead_country"]').each((SelectIndex, SelectItem) => {
        if(ObservedSelects.find(i => i.isSameNode(SelectItem)) === undefined) {
          SetCountry(SelectItem);
          ObservedSelects.push(SelectItem);
        }
      });
    });
    Observer.observe(document, { attributes: false, childList: true, subtree: true });
  });

} (jQuery, Drupal));
