(function($)
{
  $.extend({
    qTranslate: function(options)
    {
      var parent = this;

      this.options = $.extend({
        langs: null,
        inputs: null,
        texts: null,
        current_language: 'en',
        default_language: 'en'
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


      this.filterLanguages = function(text)
      {
        var l = {};
        var ll = {};
        var a = true;

        function replace()
        {
          l[a[1]] = a[2];
          ll[a[1]] = a[0];
          text = text.replace(a[0], '');
        }

        while(a)
        {
          a = /\[\:(.[^\]]*)\](.*?)\[\:.[^\]]*\]/gi.exec(text);
          if (a) replace();
        }

        // try another type of language definition
        if (Object.keys(l).length == 0)
        {
          a = true;
          while(a)
          {
            a = /<!--:(.[^-]*)-->(.*?)<!--:-->/gi.exec(text);
            if (a) replace();
          }
        }

        // what if are these elements escaped
        if (Object.keys(l).length == 0)
        {
          a = true;
          while(a)
          {
            a = /&lt;!--:(.[^-]*)--&gt;(.*?)&lt;!--:--&gt;/gi.exec(text);
            if (a) replace();
          }
        }


        return {
          'langs': l,
          'langs_fragments': ll
        };
      }

      this.translatableInput = function()
      {
        var $t = $(this);

        if ($t.hasClass('qTranslateExtra'))
          return;

        $t.addClass('qTranslateExtra')

        var $clone = $t.clone();
        var langs = parent.filterLanguages($t.val()).langs;
        var current_lang = parent.options.current_language;

        //$t.attr('type', 'hidden');
        $t.css('display', 'none');

        // create language selector
        var $selector = $('<span></span>').css({
          'position': 'absolute',
          'border': '#999999 1px solid',
          'background-color': '#ffffff',
          'padding': '5px 0px',
          'height': '12px',
          'display': 'none',
          'cursor': 'pointer',
          'z-index': '999'
        });

        if (Object.keys(langs).length == 0)
          langs[parent.options.default_language] = $t.val();

        // fill buffer
        for(var iso_code in parent.options.langs)
        {
          if (!langs.hasOwnProperty(iso_code))
            langs[iso_code] = '';

          var $img = $('<img />').attr({
              'src': parent.options.langs[iso_code],
              'data-lang': iso_code
            }).css({
              'margin-left': '3px',
              'margin-right': '3px'
            });

          // change language
          $img.on('click', function(e)
          {
            var $i = $(this);
            $selector.hide();
            current_lang = $i.attr('data-lang');
            $selector_button.find('img').attr('src', $i.attr('src'));
            $clone.val(langs[current_lang]);
          });

          $selector.append($img);
        }

        var $selector_button = $('<div></div>');
        $selector_button.css({
          'cursor': 'pointer',
          'margin-top': '5px',
          'width': '18px',
          'height': '15px',
          'z-index': '999'
        });

        $selector_button.append($('<img />').css('z-index', '999').attr('src', parent.options.langs[parent.options.current_language]));

        $selector_button.on('click', function(e)
        {
          e.preventDefault();
          $selector.toggle();
          return false;
        });

        $(document).on('click', function()
        {
          $selector.hide();
        });


        // generate language string on change
        $clone.on('change', function()
        {
          langs[current_lang] = $(this).val();

          var lang_string = [];
          var num = 0;
          for(var iso_code in langs)
            if (langs.hasOwnProperty(iso_code) && typeof langs[iso_code] === 'string' && langs[iso_code].length > 0)
            {
              lang_string += '[:' + iso_code + ']' + langs[iso_code] + '[:' + iso_code +']';
              num++;
            }

          if (num == 1)
          {
            var lang_tag = '[:' + parent.options.default_language + ']';
            if (lang_string.indexOf(lang_tag) != -1)
              lang_string = lang_string.replace(lang_tag, '').replace(lang_tag, '');
          }

          $t.val(lang_string);
        });


        $clone.attr('id', '').attr('name', '').attr('value', langs[current_lang]).insertAfter($t);
        $selector_button.appendTo($t.parent());
        $selector.appendTo($t.parent());
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