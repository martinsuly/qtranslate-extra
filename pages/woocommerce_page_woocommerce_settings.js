jQuery(document).ready(function($)
{
  function translate()
  {
    $.qTranslate({
      langs: QTranslateExtra.langs,
      inputs: [
        'input[name=woocommerce_flat_rate_title]',
        'input[name=woocommerce_free_shipping_title]',
        'input[name=woocommerce_international_delivery_title]',
        'input[name=woocommerce_local_delivery_title]',
        'input[name=woocommerce_local_pickup_title]',
        'input[name=woocommerce_bacs_title]',
        'input[name=woocommerce_cheque_title]',
        'input[name=woocommerce_cod_title]',
        'input[name=woocommerce_mijireh_checkout_title]',
        'input[name=woocommerce_paypal_title]',
        'textarea[name=woocommerce_bacs_description]',
        'textarea[name=woocommerce_cheque_description]',
        'textarea[name=woocommerce_cod_description]',
        'textarea[name=woocommerce_cod_instructions]',
        'textarea[name=woocommerce_mijireh_checkout_description]',
        'textarea[name=woocommerce_paypal_description]',
        'textarea[name=woocommerce_email_footer_text]'
      ],
      texts: '',
      current_language: QTranslateExtra.current_language,
      default_language: QTranslateExtra.default_language
    });
  }

  translate();
  $(document).ajaxStop(translate);
});