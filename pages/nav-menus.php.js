jQuery(document).ready(function($)
{
  function translate()
  {
    $.qTranslate({
      langs: QTranslateExtra.langs,
      inputs: ['.edit-menu-item-title', '.edit-menu-item-attr-title', '.edit-menu-item-description'],
      texts: '#nav-menu-meta .menu-item-title, #post-body-content .menu-item-title, #post-body-content .link-to-original',
      current_language: QTranslateExtra.current_language,
      default_language: QTranslateExtra.default_language
    });
  }

  translate();
  $(document).ajaxStop(translate);
});