(function ($, Drupal) {
  'use strict';

  const none = '(none)';

  const lsName = 'ts_traffic_source';

  const baseParam = 'gclid';

  const utmParams = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ];

  const otherParams = [
    'gbraid',
    'wbraid',
  ];

  const searchEngines = {
    '360.cn': '360.cn',
    'alice.com': 'alice',
    'aliceadsl.fr': 'alice',
    'alltheweb.com': 'alltheweb',
    'altavista.com': 'altavista',
    'aol.com': 'aol',
    'ask.com': 'ask',
    'search.aol.': 'ask',
    'alicesuche.aol.': 'ask',
    'search.auone.jp': 'auone',
    'isearch.avg.com': 'avg',
    'search.babylon.com': 'babylon',
    'baidu.com': 'baidu',
    'biglobe.ne.jp': 'biglobe',
    'bing.com': 'bing',
    'search.centrum.cz': 'centrum.cz',
    'search.comcast.net': 'comcast',
    'search.conduit.com': 'Conduit',
    'cnn.com': 'cnn',
    'daum.net': 'daum',
    'duckduckgo.com': 'duckduckgo',
    'ecosia.org': 'ecosia',
    'ekolay.net': 'ekolay',
    'eniro.se': 'eniro',
    'globo.com': 'globo',
    'go.mail.ru': 'go.mail.ru',
    'google.': 'google',
    'goo.ne.jp': 'goo.ne',
    'haosou.com': 'haosou.com',
    'search.incredimail.com': 'incredimail',
    'kvasir.no': 'kvasir',
    'lycos.com': 'lycos',
    'search.lycos.': 'lycos',
    'mamma.com': 'mamma',
    'msn.com': 'msn',
    'mynet.com': 'mynet',
    'najdi.si': 'najdi',
    'naver.com': 'naver',
    'netscape.com': 'netscape',
    'szukaj.onet.pl': 'onet',
    'ozu.es': 'ozu',
    'qwant.com': 'qwant',
    'rakuten.co.jp': 'rakuten',
    'rambler.ru': 'rambler',
    'search-results.com': 'search-results',
    'search.smt.docomo.ne.jp': 'search.smt.docomo',
    'sesam.no': 'sesam',
    'seznam.cz': 'seznam',
    'so.com': 'so.com',
    'sogou.com': 'sogou',
    'startsiden.no': 'startsiden',
    'szukacz.pl': 'szukacz',
    'buscador.terra.com.br': 'terra',
    'search.tut.by': 'tut.by',
    'search.ukr.net': 'ukr',
    'search.virgilio.it': 'virgilio',
    'voila.fr': 'voila',
    'wp.pl': 'wirtualna polska',
    'yahoo.': 'yahoo',
    'yandex.': 'yandex',
    'yam.com': 'yam',
  };

  const setTempTraffic = (traffic) => {
    traffic['tmp_source'] = traffic.utm_source;
    traffic['tmp_medium'] = traffic.utm_medium ?? none;

    return traffic;
  };

  const getTraffic = (searchParams) => {
    let traffic = {};
    if(searchParams.has(baseParam)) {
      traffic = {
        utm_source: 'google',
        utm_medium: 'cpc',
      };

      utmParams.forEach((key) => {
        if(traffic[key] === undefined) {
          traffic[key] = searchParams.has(key) ? searchParams.get(key) : none;
        }
      });

      Object.entries(traffic).forEach(([key, value]) => {
        traffic[`first_${key}`] = value;
      });

      setTempTraffic(traffic);

      traffic[baseParam] = searchParams.get(baseParam);
    } else {
      let count = 0;
      utmParams.forEach((key) => {
        if(searchParams.has(key)) {
          count++;
        }
      });

      if(count) {
        utmParams.forEach((key) => {
          traffic[key] = searchParams.has(key) ? searchParams.get(key) : none;
        });

        setTempTraffic(traffic);
      } else {
        const referrer = document.referrer;
        const domain = referrer.length ? new URL(referrer).hostname : '';
        if(domain.indexOf('.creatio.com') === -1) {
          if(domain) {
            Object.entries(searchEngines).forEach(([key, value]) => {
              if(domain.includes(key)) {
                traffic = {
                  utm_source: value,
                  utm_medium: 'organic',
                };

                return;
              }
            });

            if(!Object.keys(traffic).length) {
              traffic = {
                utm_source: domain,
                utm_medium: 'referral',
              };
            }

            setTempTraffic(traffic);
          } else {
            traffic = {
              utm_source: '(direct)',
            };
          }
        } else {
          const lsTraffic = localStorage.getItem(lsName) === null ? {} : JSON.parse(localStorage.getItem(lsName));
          if(Object.keys(lsTraffic).length && lsTraffic.tmp_source !== undefined) {
            traffic = {
              utm_source: lsTraffic.tmp_source,
              utm_medium: lsTraffic.tmp_medium
            };
          } else {
            traffic = {
              utm_source: '(direct)',
            };
          }
        }

        utmParams.forEach((key) => {
          if(traffic[key] === undefined) {
            traffic[key] = none;
          }
        });
      }

      Object.entries(traffic).forEach(([key, value]) => {
        traffic[`first_${key}`] = value;
      });

      traffic[baseParam] = null;
    }

    return traffic;
  };

  const setTraffic = () => {
    let traffic = {};
    const lsTraffic = localStorage.getItem(lsName) === null ? {} : JSON.parse(localStorage.getItem(lsName));
    const searchParams = new URLSearchParams(window?.location?.search || '');
    if(Object.keys(lsTraffic).length) {
      traffic = JSON.parse(localStorage.getItem(lsName));
      const currentTraffic = getTraffic(searchParams);
      if(currentTraffic.tmp_source !== undefined) {
        utmParams.forEach((key) => {
          traffic[key] = currentTraffic[key];
        });
      }

      [baseParam, 'tmp_source', 'tmp_medium'].forEach((key) => {
        if(currentTraffic[key] !== undefined) {
          traffic[key] = currentTraffic[key];
        }
      });
    } else {
      traffic = getTraffic(searchParams);
    }

    otherParams.forEach((key) => {
      traffic[key] = searchParams.has(key) ? searchParams.get(key) : null;
    });

    if(JSON.stringify(traffic) !== JSON.stringify(lsTraffic)) {
      localStorage.setItem(lsName, JSON.stringify(traffic));
    }
  };

  $(document).ready(() => {
    setTraffic();
  });

  window.addEventListener('CookiebotOnAccept', (e) => {
    setTraffic();
  });

  window.addEventListener('CookiebotOnDecline', (e) => {
    setTraffic();
  });

  $(document).on('blur', 'input[name="field_lead_firstname"]', (e) => {
    if(typeof Cookiebot !== 'undefined' && Cookiebot?.consent?.statistics) {
      const form = $(e.target).closest('form');
      const lsTraffic = localStorage.getItem(lsName) === null ? {} : JSON.parse(localStorage.getItem(lsName));
      Object.entries(lsTraffic).forEach(([key, value]) => {
        const name = key.startsWith('utm_') ? `field_lead_${key.replace('utm_', 'utm')}` : `field_lead_${key}`;
        const field = form.find(`input[name="${name}"]`);
        if(field.length && value !== null) {
          field.val(value);
        }
      });

      if(form.find('input[name="field_lead_ga_client_id"]').length && $.cookie('_ga') !== undefined) {
        const parts = $.cookie('_ga').split('.');
        parts.shift();
        parts.shift();
        form.find('input[name="field_lead_ga_client_id"]').val(parts.join('.'));
      }

      if(form.find('input[name="field_lead_user_agent"]').length) {
        form.find('input[name="field_lead_user_agent"]').val(navigator.userAgent);
      }

      const cookies = {
        '_ga_BGNNESGLC6' : 'field_lead_ga_session_id',
        'li_fat_id': 'field_lead_li_fat_id',
        'CookieConsent': 'field_lead_cookie_consent',
        '_fbp': 'field_fbp',
        '_fbc': 'field_fbc'
      };

      Object.entries(cookies).forEach(([cookie, name]) => {
        if(form.find(`input[name="${name}"]`).length && $.cookie(cookie) !== undefined) {
          form.find(`input[name="${name}"]`).val($.cookie(cookie));
        }
      });

      if(window._creatio_vid && form.find('input[name="field_creatio_vid"]').length) {
        form.find('input[name="field_creatio_vid"]').val(window._creatio_vid);
      }

      if(form.find('input[name="field_lead_commentary"]').length && drupalSettings.path.currentPath.indexOf('landings/') === 0) {
        const searchParams = new URLSearchParams(window?.location?.search || '');
        if(searchParams.has('visitor_id')) {
          const visitor_id = searchParams.get('visitor_id');
          if(visitor_id.length) {
            form.find('input[name="field_lead_commentary"]').val(`visitor_id: ${visitor_id}`);
          }
        }
      }
    }
  });

} (jQuery, Drupal));
