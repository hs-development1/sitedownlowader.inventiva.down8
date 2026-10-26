const iso = window.ts_iso;
if(iso !== undefined) {
  window.ts_country = {
    iso: iso,
    source: 'ip'
  };
} else {
  const languages = {
    'en': 'US',
    'pt-pt': 'PT',
    'vi': 'VN',
    'uk': 'UA',
    'ru': 'KZ'
  };

  const lang = document.documentElement.lang;
  const iso = languages[lang] !== undefined ? languages[lang] : document.documentElement.lang.toUpperCase();

  window.ts_country = {
    iso: iso,
    source: 'direct'
  };
}