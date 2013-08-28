<?php
/*
Plugin Name: qTranslate Extra
Plugin URI: http://www.example.com
Description: qTranslate Extra adds ability to translate Widgets, Menus and more...
Author: Martin Sudolsky
Version: 0.0.2
Author URI: http://martinsuly.eu
Text Domain: qtranslate-extra
License: GPLv2
*/

if (!defined('ABSPATH')) die();

class QTranslateExtra
{
  const ld = 'qtranslate-extra';
  const version = '0.0.2';
  const nonce = 'qtranslate-extra-nonce';

  protected $_url, $_path, $_flags_path, $_site_url, $_qInstalled;

  protected $supported_pages = array(
    'index.php',
    'widgets.php',
    'nav-menus.php',
    'post.php',
    'post-new.php',
    'options-general.php'
  );

  public function __construct()
  {
    // paths
    $this->_url = plugins_url('', __FILE__);
    $this->_path = dirname(__FILE__);

    // load domain language on plugins_loaded action
    add_action('plugins_loaded', array($this, 'plugins_loaded'));

    // check if qTranslate is installed and active
    $active_plugins = get_option('active_plugins', false);
    $this->_qInstalled = in_array('qtranslate/qtranslate.php', $active_plugins);

    if (is_admin())
    {
      if ($this->_qInstalled)
      {
        $this->_flags_path = plugins_url('qtranslate/flags');

        // enqueue scripts and styles
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));

        // add options page
        add_action('admin_menu', array($this, 'admin_menu'));

        // handle save action for options page
        add_action('admin_init', array($this, 'options_save'));
      }

      add_filter('plugin_action_links_'.plugin_basename(__FILE__), array($this, 'filter_plugin_actions'), 10, 2);
    }
    else
    if ($this->_qInstalled)
    {
      $this->_site_url = get_site_url();

      // should convert also archive links
      add_filter('post_type_archive_link', 'qtrans_convertURL');

      add_filter('wp_setup_nav_menu_item', array($this, 'wp_setup_nav_menu_item'));

      // global handler to replace content by language
      add_action('init', array($this, 'init_lang_replace'), 0);
    }

    // on activation/uninstallation hooks
    register_activation_hook(__FILE__, array($this, 'activation'));
    register_uninstall_hook(__FILE__, array(__class__, 'uninstall'));
  }

  // load localization text domain
  public function plugins_loaded()
  {
    load_plugin_textdomain(self::ld, false, dirname(plugin_basename(__FILE__)).'/languages/');
  }

  public function filter_plugin_actions($l, $file)
  {
    if ($this->_qInstalled)
      $link = '<a href="options-general.php?page='.__class__.'">'.__('Settings').'</a>';
    else
      $link = '<span style="color: #bc0b0b">'.__('qTranslate is not installed.', self::ld).'</span>';

    array_unshift($l, $link);
    return $l;
  }

  // on activation
  public function activation()
  {
    add_option(__class__.'_enabled_pages', $this->supported_pages);
    add_option(__class__.'_options', array());
  }

  // on uninstallation
  static function uninstall()
  {
    delete_option(__class__.'_enabled_pages');
    delete_option(__class__.'_options');
  }

  // add options page
  public function admin_menu()
  {
    add_options_page(__('qTranslate Extra', self::ld), __('qTranslate Extra', self::ld), 'manage_options', __class__, array($this, 'options_page'));
    add_filter('plugin_action_links_'.plugin_basename(__FILE__), array($this, 'filter_plugin_actions'), 10, 2);
  }

  public function options_save()
  {
    $page = isset($_GET['page'])?$_GET['page']:false;
    if ($page != __class__) return;

    // save options
    if (isset($_POST['save_options']) && $_POST['save_options'])
    {
      if (!wp_verify_nonce($_POST['_wpnonce'], self::nonce))
        die(__('Whoops! There was a problem with the data you posted. Please go back and try again.', self::ld));

      $options = array(
        'filter_all' => isset($_POST['qte_filter_all']) && $_POST['qte_filter_all']?1:0
      );

      update_option(__class__.'_options', $options);
      update_option(__class__.'_enabled_pages', isset($_POST['qte_menu'])?$_POST['qte_menu']:array());

      $options_url = admin_url('options-general.php?page='.__class__);
      wp_redirect(add_query_arg(array('message' => 'saved'), $options_url));
      exit;
    }
  }

  // options page
  public function options_page()
  {
    $options_url = admin_url('options-general.php?page='.__class__);
    $message = isset($_GET['message'])?$_GET['message']:false;

    if ($message == 'saved')
      echo '<div class="updated"><p>'.__('Settings were sucessfully saved.', self::ld).'</p></div>';

    $options = get_option(__class__.'_options', array());
    if (!is_array($options)) $options = array();

    $enabled_pages = get_option(__class__.'_enabled_pages', array());
    if (!is_array($enabled_pages)) $enabled_pages = array();

    require_once $this->_path.'/admin/top.php';
    require_once $this->_path.'/admin/options.php';
  }


  // global handler to replace all language tags
  public function callback_lang_replace($buffer)
  {
    global $q_config;
    $lang = $q_config['language'];
    return preg_replace('/(\[:'.$lang.'\](.[^\]]*)\[:'.$lang.'\])|(\[:((?!'.$lang.').)[^\]]*\].[^\]]*\[:((?!'.$lang.').)[^\]]*\])/i', '$2', $buffer);
  }

  public function init_lang_replace()
  {
    ob_start(array($this, 'callback_lang_replace'));
  }


  public function wp_setup_nav_menu_item($menu_item)
  {
    // convert local URLs in custom menu items
    if ($menu_item->type == 'custom' && stripos($menu_item->url, $this->_site_url) !== false)
      $menu_item->url = qtrans_convertURL($menu_item->url);

    return $menu_item;
  }

  // enqueue scripts and styles in the admin
  public function admin_enqueue_scripts($hook)
  {
    global $q_config;

    $langs = array();
    foreach ($q_config['enabled_languages'] as $iso_code)
      $langs[$iso_code] = $this->_flags_path . '/' . $q_config['flag'][$iso_code];

    wp_enqueue_style(__class__, $this->_url.'/qtranslate-extra.css', array(), self::version, 'all');
    wp_enqueue_script(__class__, $this->_url.'/qtranslate-extra.js', array('jquery'), self::version);
    wp_localize_script(__class__, __class__, array(
      'langs' => $langs,
      'default_language' => $q_config['default_language'],
      'current_language' => $q_config['language']
    ));

    if ($hook == 'settings_page_QTranslateExtra')
      wp_enqueue_style(__class__.'_options', $this->_url.'/admin/options.css', array(), self::version, 'all');


    $enabled_pages = get_option(__class__.'_enabled_pages', array());
    if (!is_array($enabled_pages)) $enabled_pages = array();

    if (isset($enabled_pages[$hook]))
    {
      if (in_array($hook, $this->supported_pages))
        $part = $hook.'.js';
      else
        $part = 'global.js';

      wp_enqueue_script(__class__.'_part', $this->_url.'/pages/'.$part, array(), self::version);
    }
  }
}

new QTranslateExtra();