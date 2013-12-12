<?php if (!defined('ABSPATH')) die(); ?>

<form action="<?php echo $options_url; ?>" method="post">
  <?php wp_nonce_field(self::nonce); ?>


  <h3><?php _e('Global options', self::ld); ?></h3>

  <label for="qte_filter_all">
    <input type="checkbox" name="qte_filter_all" id="qte_filter_all" value="1"<?php echo (isset($options['filter_all']) && $options['filter_all']?' checked':''); ?> /> <?php _e('Filter all language tags via output buffer', self::ld); ?>
  </label>
  <br />
  <i>
    <?php _e('You can enable this option if you want use language filtering on texts which are not directly supported. Eg. 3rd party plugins, etc.', self::ld); ?>
  </i>

  <?php submit_button(__('Save All Changes', self::ld), 'primary', 'save_options', true); ?>

  <h3><?php _e('Enable translatable inputs for pages', self::ld); ?></h3>

  <ul class="qte-pages">
  <?php
  global $menu, $submenu;

  foreach($menu as $k => $v)
  {
    if (!$v[0] || $v[2] == 'edit-comments.php')
      continue;

    $hook = $v[2];
    if ($h = get_plugin_page_hook($v[2], 'admin.php'))
      $hook = $h;

    $hook = str_replace('&amp;', '&', $hook);

    echo '<li><label class="qte-menu" for="qte_menu_'.$k.'">';

    if (!isset($submenu[$v[2]]))
      echo '<input type="checkbox" id="qte_menu_'.$k.'" name="qte_menu[]" value="'.$hook.'"'.(in_array($hook, $enabled_pages)?' checked':'').' />';

    echo ' '.$v[0].(isset($this->supported_pages[$hook]) && !isset($submenu[$v[2]])?' ('.__('supported', self::ld).')':'').'</label>';

    if (isset($submenu[$v[2]]))
    {
      echo '<ul>';
      $submenu_ = $submenu[$v[2]];

      reset($submenu_);
      while(list($sk, $sv) = @each($submenu_))
      {
        if ($sv[2] == 'QTranslateExtra' || $sv[2] == 'qtranslate' || $sv[2] == 'update-core.php')
          continue;

        $hook = $sv[2];
        if ($h = get_plugin_page_hook($sv[2], $v[2]))
          $hook = $h;

        $hook = str_replace('&amp;', '&', $hook);

        echo '<li><label for="qte_submenu_'.$k.'_'.$sk.'"><input type="checkbox" id="qte_submenu_'.$k.'_'.$sk.'" name="qte_menu[]" value="'.$hook.'"'.(in_array($hook, $enabled_pages)?' checked':'').' /> '.$sv[0].(isset($this->supported_pages[$hook])?' ('.__('supported', self::ld).')':'').'</label></li>';

        // posts and custom post types
        $pu = parse_url($hook, PHP_URL_QUERY);
        if (stripos($hook, 'edit.php') !== false)
          $submenu_[] = array(__('Edit', self::ld).' '.$sv[0], '', 'post.php'.($pu?'?'.$pu:''));

      }
      echo '</ul>';
    }

    echo '</li>';
  }
  ?>
  </ul>

  <?php submit_button(__('Save All Changes', self::ld), 'primary', 'save_options', true); ?>
</form>