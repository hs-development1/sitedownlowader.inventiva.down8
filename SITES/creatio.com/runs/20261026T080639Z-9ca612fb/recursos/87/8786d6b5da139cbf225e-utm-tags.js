(function ($) {

  function GetUrlGetParams(UtmStr) {
    const params = [];
    let UtmVars = UtmStr.split('&');
    let UtmNewStr = '';
    for(var i = 0; i < UtmVars.length; i++) {
      let hash = UtmVars[i].split('=');
      if(!params.includes(hash[0]) && ['activity', 'partner', 'gclid', 'gbraid', 'wbraid'].includes(hash[0]) || hash[0].indexOf('utm') !== -1 ) {
        params.push(hash[0]);
        UtmNewStr = UtmNewStr + (UtmNewStr !== '' ? '&' : '') + UtmVars[i];
      }
    }
    return UtmNewStr;
  }

  function setHref(e ,Href, UtmNewStr) {
    if(Href.indexOf(UtmNewStr) < 0) {
      if(Href.indexOf('?') > -1) {
        const url = new URL(Href);
        const searchParams = new URLSearchParams(UtmNewStr);

        for(const [key, value] of searchParams) {
          if(url.searchParams.has(key)) {
            url.searchParams.delete(key);
          }
        }

        const urlString = url.toString();
        if(urlString.indexOf('?') > -1) {
          e.prop('href', urlString + '&' + UtmNewStr);
        } else {
          e.prop('href', urlString + '?' + UtmNewStr);
        }
      } else {
        e.prop('href', Href + '?' + UtmNewStr);
      }
    }
  }

  function setPageLinks(e, UtmNewStr) {
    let hostname = e.prop('hostname');
    if(!hostname || hostname.indexOf('terrasoft') !== -1 || hostname.indexOf('creatio') !== -1 || hostname.indexOf('bank.ai') !== -1) {
      let Href = e.prop('href');
      if(UtmNewStr !== '') {
        if(Href.indexOf('/0/ClientApp') > -1) {
          setHref(e, Href, UtmNewStr);
        } else if(Href.indexOf('#') === -1 && Href.indexOf('tel:') === -1 && Href.indexOf('mailto:') === -1) {
          if(Href.indexOf('?') !== -1) {
            if(Href.indexOf('?page=') > -1 || Href.indexOf('&page=') > -1) {
              let num_page = Href.split('page=')[1];
              let new_param;
              if(e.prop('href').indexOf(UtmNewStr) < 0) {
                new_param = location.pathname + '?page=' + num_page + '&' + UtmNewStr;
              }
              if(Href.indexOf('type=') > -1) {
                let type = $.urlParam('type');
                if(e.prop('href').indexOf(UtmNewStr) < 0) {
                  new_param +='&type='+type;
                }
              }
              e.prop('href', new_param);
            } else if(Href.indexOf('?type=') > -1) {
              let type = Href.split('type=')[1];
              if(e.prop('href').indexOf(UtmNewStr) < 0) {
                e.prop('href', location.pathname + '?type=' + type + '&' + UtmNewStr);
              }
            } else if(Href.indexOf('?product=') > -1) {
              let HrefParts = Href.split('?');
              let product = Href.split('product=')[1];
              if(e.prop('href').indexOf(UtmNewStr) < 0) {
                e.prop('href', HrefParts[0] + '?product=' + product + '&' + UtmNewStr);
              }
            } else {
              setHref(e, Href, UtmNewStr);
            }
          } else {
            setHref(e, Href, UtmNewStr);
          }
        }
      }
    }
  }

  $(document).on('mouseup', "a", function() {
    let url = window.location.href;
    if(url.indexOf('?') !== -1) {
      let UtmStr = url.slice(window.location.href.indexOf('?') + 1);
      let GetParamsStr = GetUrlGetParams(UtmStr);
      setPageLinks($(this), GetParamsStr);
    }
  });

  $(document).on('mouseup', ".view-virtual-events .form-radios label", function() {
    let url = window.location.href;
    if(url.indexOf('?') !== -1) {
      let utm_str = url.slice(window.location.href.indexOf('?')+ 1);
      let vars = GetUrlGetParams(utm_str);
      localStorage.setItem('utm', vars);
    }
  });

  $(document).ready(function(){
    let utm = localStorage.getItem('utm');
    if(utm && (window.location.search.indexOf('digital-events') || window.location.search.indexOf('accelerate-online')) && window.location.search.indexOf('utm') < 0){
      let utm = localStorage.getItem('utm');
      let queryParams = new URLSearchParams(window.location.search);
      if(utm.indexOf('&')) {
        utm = utm.split('&');
        for(var i in utm) {
          let splitted = utm[i].split('=')
          queryParams.set(splitted[0], splitted[1]);
        }
      } else {
        utm = utm.split('=');
        queryParams.set(utm[0], utm[1]);
      }
      history.replaceState(null, null, "?"+queryParams.toString());
      localStorage.removeItem('utm');
    }
  });

  $.urlParam = function(name) {
    let results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) { return null; }
    return decodeURI(results[1]) || 0;
  };
})(jQuery);
