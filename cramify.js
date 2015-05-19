/*!
 *  cramify.js v0.1.0, http://git.io/vTcfz
 *  ===============================================
 *  jQuery plugin that dynamically assigns a unique
 *  font-size to each line of text so that it fills the width of the container.
 *
 *
 *  Copyright (c) 2015 Cassian LUP, @cassilup
 *  MIT Licensed
 */

(function($) {

  $.fn.cramify = function(options) {
      if (!options) {
          options = {};
      }

      // Breaks each lines of the div into a <div class='cramify-line'>
      // and breaks each character of a line into a <div class='cramify-char'> as a child of the ".cramify-line" parent.
      var setup = function(wrapperElm) {
          var src = $(wrapperElm).html(),
              lines,
              resultLines = [],
              result;

          // make everything uppercase
          src = src.toUpperCase();
          console.log(src);
          // except <br> elements
          src = src.replace(/<br>/gi, '<br>');
          console.log(src);
          src = src.replace(/<br[/]>/gi, '<br>');

          console.log(src);

          // replace newlines with <br>
          src = src.replace(/(?:\r\n|\r|\n)/g, '<br>');

                  console.log(src);

          // break each line by <br>
          lines = src.split('<br>');


          for (var lineIndex in lines) {
              var line = "";

              // eliminate beginning & ending spaces from line
              lines[lineIndex] = lines[lineIndex].replace(/(^\s+|\s+$)/g, '');

              // eliminate duplicate spaces
              lines[lineIndex] = lines[lineIndex].replace(/ +(?= )/g,'');

              // replace spaces with _
              lines[lineIndex] = lines[lineIndex].replace(/ /g, '•');

              // build line contents
              for (var c in lines[lineIndex]) {
                  line += "<div class='cramify-char" + (lines[lineIndex][c] == "•" ? ' cramify-space' : '') + "'>" + (lines[lineIndex][c] == "•" ? '&nbsp;' : lines[lineIndex][c]) + "</div>";
              }

              // add line to final result
              if (line) {
                  resultLines.push("<div class='cramify-line'>"+line+"</div>");
              }
          }

          // replace the text with a HTML with the .cramify-line (& afferent .cramify-char elements)
          $(wrapperElm).html(resultLines.join(''));
      };

      // for each line, compute the appropriate font size so as to fill the entire width
      var processXAxis = function(wrapperElm) {
          $(wrapperElm).find('.cramify-line').each(function(i, e) {
              processLine($(e));
          });
      };

      // given a line, adjust the font size until it fills the maximum amount of the parent line's element width
      // recursive method
      // Parameters:
      //  • lineElm -- jQuery element,
      //  • offset -- float representing value for adjusting font size, the bigger the value, the smaller the end font-size result,
      //  • originalFontSize -- given that we calculate recursively, we need to retain the original font size for the best calculations
      var processLine = function(lineElm, offset, originalFontSize) {
          offset = (parseFloat(offset, 10) ? parseFloat(offset, 10) : 0);

          if (!originalFontSize) {
              originalFontSize = $(lineElm).css('font-size');
          }

          // prevent infinite loops
          if (offset > .5) { return; }

          // compute line width by adding width of each character
          var lineWidth = 0;
          $(lineElm).find('.cramify-char').each(function(ii, ee) {
            lineWidth += $(ee).width();
          });

          if (options.debug) { console.log(lineWidth + ", " + $(lineElm).width() + ", " + originalFontSize); }

          var contentWidthPercentOfLine = (100*lineWidth / $(lineElm).width());
          var multiplyByToGetAtLineWidth = 100 / contentWidthPercentOfLine;

          // dividing by offset because of minor errors in the computing algorithm

          $(lineElm).css('font-size',
              (
                  parseInt(originalFontSize, 10) *
                  multiplyByToGetAtLineWidth
              ) / 1.01 - offset
          );

          var finalLineWidth = 0;
          $(lineElm).find('.cramify-char').each(function(ii, ee) {
            finalLineWidth += $(ee).width();
          });

          if (options.debug) { console.log(finalLineWidth); }

          if (finalLineWidth > $(lineElm).width() -10) {
              if (options.debug) { console.log('p! -- '+finalLineWidth+ ' >= '+$(lineElm).width()+' ('+$(lineElm).text()+')'); }
              if (options.debug) { console.log('calling processLine with '+$(lineElm).width()+' and '+(offset + .05)); }
              processLine($(lineElm), (offset + .05));
          } else {
              if (options.debug) { console.log('done!'); }
          }
      };

      // center vertically in wrapper div
      var processYAxis = function(wrapperElm) {
          var totalLinesHeight = 0,
              verticalPadding = 0;

          $(wrapperElm).find('.cramify-line').each(function(i, e) {
              if (options.lineSpacing) {
                $(e).css('padding-top', options.lineSpacing);
                $(e).css('padding-bottom', options.lineSpacing);
              }

              totalLinesHeight += $(e).outerHeight();
          });

          verticalPadding = ($(wrapperElm).height() - totalLinesHeight) / 2;

          $(wrapperElm).css('min-height', 'initial');
          $(wrapperElm).css('padding', verticalPadding + 'px 0');
      };

      // initialize
      $(this).each(function(i, e) {
          if (!$(e).data('origHtml')) {
              $(e).data('origHtml', $(e).html());

              // break characters into separate <span> elements
              setup($(e));

              // compute positioning of
              processXAxis($(e));
              processYAxis($(e));
          }
      });
  }
})(window.jQuery);
