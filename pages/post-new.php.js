jQuery(document).ready(function($)
{
  function translate()
  {
    $.qTranslate({
      langs: QTranslateExtra.langs,
      inputs: ['#attachment_caption', '#attachment_alt', '#attachment_content', '#newmeta textarea', '#list-table textarea'],
      texts: '',
      current_language: QTranslateExtra.current_language,
      default_language: QTranslateExtra.default_language
    });
  }

  translate();
  $(document).ajaxStop(translate);
});