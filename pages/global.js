jQuery(document).ready(function($)
{
  function translate()
  {
    $.qTranslate({
      langs: QTranslateExtra.langs,
      inputs: [
        'input[type=text]',
        'textarea'
      ],
      texts: false,
      current_language: QTranslateExtra.current_language,
      default_language: QTranslateExtra.default_language
    });
  }

  translate();
  window.setTimeout(translate, 500);
  $(document).ajaxStop(translate);
});