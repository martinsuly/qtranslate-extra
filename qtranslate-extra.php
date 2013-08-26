<?php
/*
Plugin Name: qTranslate Extra
Plugin URI: http://www.example.com
Description: qTranslate Extra adds ability to translate Widgets, Menus
Author: Martin Sudolsky
Version: 0.0.1
Author URI: http://martinsuly.eu
Text Domain: qtranslate-extra
License: GPLv2
*/

if (!defined('ABSPATH')) die();

class QTranslateExtra
{
  const ld = 'qtranslate-extra';
  const version = '0.0.1';
  const nonce = 'qtranslate-extra-nonce';

  protected $_url, $_path, $_flags_path;

  public function __construct()
  {
    // paths
    $this->_url = plugins_url('', __FILE__);
    $this->_path = dirname(__FILE__);

    // load domain language on plugins_loaded action
    add_action('plugins_loaded', array($this, 'plugins_loaded'));

    if (is_admin())
    {
      // check if qTranslate is active
      $active_plugins = get_option('active_plugins', false);
      if (in_array('qtranslate/qtranslate.php', $active_plugins))
      {
        $this->_flags_path = plugins_url('qtranslate/flags');

        // enqueue scripts and styles
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
      }
      else
      {
        add_filter('plugin_action_links_'.plugin_basename(__FILE__), array($this, 'filter_plugin_actions'), 10, 2);
      }
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
    array_unshift($l, '<span style="color: #bc0b0b">'.__('qTranslate is not installed.', self::ld).'</span>');
    return $l;
  }

  // on activation
  public function activation()
  {
    // nothing yet
  }

  // on uninstallation
  static function uninstall()
  {
    // :)
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

    echo $hook;

    $part = false;
    switch($hook)
    {
      case 'widgets.php':
        $part = 'widgets.js';
        break;

      case 'nav-menus.php':
        $part = 'nav-menus.js';
        break;

      case 'post.php':
        $part = 'post.js';
        break;

      case 'index.php':
        $part = 'index.js';
        break;
    }

    if ($part)
      wp_enqueue_script(__class__.'_part', $this->_url.'/parts/'.$part, array(), self::version);
  }
}

new QTranslateExtra();