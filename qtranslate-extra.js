(function($)
{
  /*
  var old_clone = $.fn.clone;

  $.fn.clone = function()
  {
    this.find('.qTranslateExtra').trigger('click');

    return old_clone.apply(this, arguments);
  }
  */

  $.extend({
    qTranslate: function(options)
    {
      var parent = this;

      this.options = $.extend({
        langs: null,
        inputs: null,
        texts: null,
        current_language: 'en',
        default_language: 'en',
        tag_type: 0
      }, options);

      if (typeof this.options.langs !== 'object')
        throw new Exception('Language definition must be an object');

      if (!this.options.inputs && !this.options.texts)
        throw new Exception('You must specify inputs or texts.');

      if (Object.keys(this.options.langs).length == 0)
        return;

      this.init = function()
      {
        if (this.options.inputs)
          this.resolveElements(this.options.inputs).filter('input[type=text],textarea').each(this.translatableInput);

        if (this.options.texts)
          this.resolveElements(this.options.texts).each(this.filterText);
      }

      // resolve elements to jQuery objects
      this.resolveElements = function(e)
      {
        if (typeof e === 'string')
          return $(e);
        else
        if (typeof e === 'object')
        {
          if (e instanceof $)
            return e;
          else
          if (e instanceof Array)
          {
            var f = $();
            for(var i in e)
              f = f.add(parent.resolveElements(e[i]));

            return f;
          }
          else
          if (e instanceof Element)
            return $(e);
          else
            return e;
        }
        else
          return e;
      }


      this.filterPatterns = [
        '\\[:(.[^\\]]*)\\]((.|\\s)*?)\\[:.[^\\]]*\\]',
        '<!--:(.[^-]*)-->((.|\\s)*?)<!--:-->',
        '&lt;!--:(.[^-]*)--&gt;((.|\\s)*?)&lt;!--:--&gt;'
      ];

      this.filterLanguages = function(text)
      {
        var l = {};
        var ll = {};

        for(var i in this.filterPatterns)
        {
          var a = true;
          while(a)
          {
            var p = new RegExp(this.filterPatterns[i], 'mgi');
            a = p.exec(text);
            if (a)
            {
              l[a[1]] = a[2];
              ll[a[1]] = a[0];
              text = text.replace(a[0], '');
            }
          }

          if (Object.keys(l).length > 0)
            break;
        }

        return {
          'langs': l,
          'langs_fragments': ll
        };

      }


      this.translatableInput = function()
      {
        var $t = $(this);

        if ($t.hasClass('qTranslateExtra') || $t.attr('readonly') || $t.attr('disabled') ||
          $t.hasClass('wp-editor-area'))
          return;

        $t.addClass('qTranslateExtra')

        var $clone = $t.clone();
        var langs;
        var current_lang = parent.options.current_language;
        var t_width = $t.width();
        var t_height = $t.height();

        $t.css('display', 'none');
        //$t.attr('type', 'hidden');

        // create language selector
        var $selector = $('<span></span>').css({
          'position': 'absolute',
          'border': '#999999 1px solid',
          'background-color': '#ffffff',
          'padding': '3px 0px',
          'height': '16px',
          'display': 'none',
          'cursor': 'pointer',
          'z-index': '999',
          'line-height': '0px'
        });

        var select_language = function()
        {
          $selector.find('img').css({
            'border-color': '#ffffff',
            'opacity': 0.3
          });

          $selector.find('img[data-lang=' + current_lang + ']').css('border-color', '#aaaaaa');

          for(var iso_code in langs)
            if (langs.hasOwnProperty(iso_code) && langs[iso_code].length > 0)
              $selector.find('img[data-lang=' + iso_code + ']').css('opacity', 1);
        }

        var fill_langs = function()
        {
          langs = parent.filterLanguages($t.val()).langs;

          if (Object.keys(langs).length == 0)
            langs[parent.options.default_language] = $t.val();

          for(var iso_code in parent.options.langs)
            if (!langs.hasOwnProperty(iso_code))
              langs[iso_code] = '';

          $clone.val(langs[current_lang]);
        }

        // create flags
        for(var iso_code in parent.options.langs)
        {
          var $img = $('<img />').attr({
              'src': parent.options.langs[iso_code],
              'data-lang': iso_code
            }).css({
              'margin-left': '1px',
              'margin-right': '1px',
              'border': '#ffffff 1px solid',
              'padding': '1px'
            });

          // change language
          $img.on('click', function(e)
          {
            e.preventDefault();
            $clone.focus();

            var $i = $(this);
            current_lang = $i.attr('data-lang');
            $clone.val(langs[current_lang]);
            select_language();
            return false;
          });

          $selector.append($img);
        }

        $selector.on('click', function(e)
        {
          e.preventDefault();
          $clone.focus();
          return false;
        });

        // generate language string on change
        $clone.on('change', function()
        {
          langs[current_lang] = $(this).val();

          var lang_string = '';
          var num = 0;
          for(var iso_code in langs)
            if (langs.hasOwnProperty(iso_code) && typeof langs[iso_code] === 'string' && langs[iso_code].length > 0)
            {
              if (parent.options.tag_type == 0)
                lang_string += '[:' + iso_code + ']' + langs[iso_code] + '[:' + iso_code +']';
              else
                lang_string += '<!--:' + iso_code + '-->' + langs[iso_code] + '<!--:-->';
              num++;
            }

          if (num == 1)
          {
            if (parent.options.tag_type == 0)
            {
              var lang_tag = '[:' + parent.options.default_language + ']';
              if (lang_string.indexOf(lang_tag) != -1)
                lang_string = lang_string.replace(lang_tag, '').replace(lang_tag, '');
            }
            else
            {
              var lang_tag = '<!--:' + parent.options.default_language + '-->';
              if (lang_string.indexOf(lang_tag) != -1)
                lang_string = lang_string.replace(lang_tag, '').replace('<!--:-->', '');
            }
          }

          $t.val(lang_string);
        });

        $clone.on('click', function(e)
        {
          e.preventDefault();
          return false;
        });

        $clone.on('focusin', function()
        {
          if ($selector.is(':visible'))
            return;

          $clone = $(this);
          $t = $clone.prev();

          fill_langs();

          var $ts = $(this);
          var off = $ts.offset();

          $selector.css({
            'top': (off.top + $ts.outerHeight() + 2) + 'px',
            'left': (off.left) + 'px'
          });

          select_language();
          $selector.show();
        });


        $clone.on('focusout', function()
        {
          var $t = $(this);
          window.setTimeout(function()
          {
            if ($t.is(':focus'))
              return;

            $selector.hide();
            current_lang = parent.options.current_language;
            $t.val(langs[current_lang]);
            select_language();
          }, 200);
        });

        fill_langs();

        $t.attr('id', '');
        $clone.attr('name', '').insertAfter($t);
        $selector.appendTo('body');
      }




      this.filterText = function()
      {
        var $t = $(this),
          html = $t.html(),
          langs = parent.filterLanguages(html),
          lang = parent.options.current_language,
          langs_keys = Object.keys(langs.langs);

        if (langs_keys.length == 0)
          return;

        if (!langs.langs.hasOwnProperty(lang))
          lang = langs_keys[0];

        for(var i in langs.langs_fragments)
          html = html.replace(langs.langs_fragments[i], i == lang?langs.langs[i]:'');

        $t.html(html);
      }

      this.init();
    }
  });
})(jQuery);