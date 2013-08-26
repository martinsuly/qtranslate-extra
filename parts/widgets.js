jQuery(document).ready(function($)
{
  function translate()
  {
    $.qTranslate({
      langs: QTranslateExtra.langs,
      inputs: $('#widgets-right input[type=text], .inactive-sidebar input[type=text]'),
      texts: '#widgets-right .in-widget-title, .inactive-sidebar .in-widget-title',
      current_language: QTranslateExtra.current_language,
      default_language: QTranslateExtra.default_language
    });
  }

  translate();
  window.setTimeout(translate, 500);
  $(document).ajaxStop(translate);
});