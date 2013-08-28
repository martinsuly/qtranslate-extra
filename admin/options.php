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

  $hidden_subpages = array(
    'edit.php' => array(
      array(__('Edit Post', self::ld), '', 'post.php')
    )
  );

  foreach($menu as $k => $v)
  {
    if (!$v[0])
      continue;

    $hook = $v[2];
    if ($h = get_plugin_page_hook($v[2], 'admin.php'))
      $hook = $h;


    echo '<li><label class="qte-menu" for="qte_menu_'.$k.'">';

    if (!isset($submenu[$v[2]]))
      echo '<input type="checkbox" id="qte_menu_'.$k.'" name="qte_menu['.$hook.']" value="1"'.(isset($enabled_pages[$hook])?' checked':'').' />';

    echo ' '.$v[0].(in_array($v[2], $this->supported_pages) && !isset($submenu[$v[2]])?' ('.__('supported', self::ld).')':'').'</label>';
    if (isset($submenu[$v[2]]))
    {
      echo '<ul>';
      $submenu_ = $submenu[$v[2]];

      if (isset($hidden_subpages[$v[2]]))
        $submenu_ = array_merge($submenu_, $hidden_subpages[$v[2]]);


      foreach($submenu_ as $sk => $sv)
      {
        if ($sv[2] == 'QTranslateExtra' || $sv[2] == 'qtranslate') continue;

        if ($h = get_plugin_page_hook($sv[2], $v[2]))
          $sv[2] = $h;

        echo '<li><label for="qte_submenu_'.$k.'_'.$sk.'"><input type="checkbox" id="qte_submenu_'.$k.'_'.$sk.'" name="qte_menu['.$sv[2].']" value="1"'.(isset($enabled_pages[$sv[2]])?' checked':'').' /> '.$sv[0].(in_array($sv[2], $this->supported_pages)?' ('.__('supported', self::ld).')':'').'</label></li>';
      }
      echo '</ul>';
    }

    echo '</li>';
  }
  ?>
  </ul>

  <?php submit_button(__('Save All Changes', self::ld), 'primary', 'save_options', true); ?>
</form>