jQuery(document).ready(function($)
{
  function translate()
  {
    $.qTranslate({
      langs: QTranslateExtra.langs,
      inputs: ['#dashboard_quick_press input[name=post_title]', '#dashboard_quick_press #content'],
      current_language: QTranslateExtra.current_language,
      default_language: QTranslateExtra.default_language,
      tag_type: 1
    });
  }

  translate();
  $(document).ajaxStop(translate);
});