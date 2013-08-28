jQuery(document).ready(function($)
{
  function translate()
  {
    $.qTranslate({
      langs: QTranslateExtra.langs,
      inputs: ['#blogname', '#blogdescription'],
      texts: '',
      current_language: QTranslateExtra.current_language,
      default_language: QTranslateExtra.default_language
    });
  }

  translate();
  $(document).ajaxStop(translate);
});