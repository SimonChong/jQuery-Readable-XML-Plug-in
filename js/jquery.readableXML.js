/**
 * Readable XML jQuery Plug-in
 * 
 * Copyright (c) 2011, Simon Chong <simons.mail@gmail.com>
 * 
 * Licensed under The MIT License which can be obtained from <http://www.opensource.org>
 * 
 */
(function ($) {

	function encode (xml) {
		return xml.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function convert (xml, collapsed) {

		var closedClass = '';
		if (collapsed) {
			closedClass = 'r-close';
		}

		/*
		 * I got a lot of practice using REGEX... I could have done it by parsing XML but it seemed to strip some code away depending on what I used.
		 */

		// A tag block
		xml = xml.replace(/(<[^\/!][^>]*?\/>)/mg, "----blockTagL----$1----blockTagR----");

		// CDATA tags
		xml = xml.replace(/(<!\[CDATA\[)/mg, "----openCDataL----$1----openCDataR----");
		xml = xml.replace(/(\]\]>)/mg, "----closeCDataL----$1----closeCDataR----");

		// All tag elements
		xml = xml.replace(/(<[^?\/!][^<>]*?[^\/]>)/mg, "----openTagL----$1----openTagR----");
		// Tag elements with attributes
		xml = xml.replace(/(<[^?\/!][^<>\/]*?)\s([^<>]*?)(\/?>)/mg, "$1 ----openAttrL----$2----openAttrR----$3");
		// Tag element attributes values
		xml = xml.replace(/=(["'].*?["'])/mg, "----openAttrValL----$1----openAttrValR----");

		// Single character tags like <p>
		xml = xml.replace(/(<[^?\/!<>]>)/mg, "----openTagL----$1----openTagR----");

		// All tag contents and Close tags
		xml = xml.replace(/(<[\/].*?>)/mg, "----closeTagL----$1----closeTagR----");

		xml = encode(xml);

		// The xml header
		xml = xml.replace(/(&lt;\?[^?]*\?&gt;)/mg, "<span class='r-oTag'>$1</span>");

		// Replace all place holders
		// It must be done this way because when you encode '<' or '>' it
		// turns into
		// 3 characters which is harder to match.

		xml = xml.replace(/----openCDataL----/mg, "<div class='r-cdata'><div class='r-cdoTag'>");
		xml = xml.replace(/----openCDataR----/mg, "</div>");

		xml = xml.replace(/----closeCDataL----/mg, "<div class='r-cdcTag'>");
		xml = xml.replace(/----closeCDataR----/mg, "</div></div>");

		xml = xml.replace(/----openAttrL----/mg, "<span class='r-attr'>");
		xml = xml.replace(/----openAttrR----/mg, "</span>");

		xml = xml.replace(/----openAttrValL----/mg, "<span class='r-attrVal'>");
		xml = xml.replace(/----openAttrValR----/mg, "</span>");

		xml = xml.replace(/----openTagL----/mg, "<div class='r-cont " + closedClass + "'><div class='r-minus'></div><div class='r-element'><span class='r-oTag'>");
		xml = xml.replace(/----openTagR----/mg, "</span><span class='r-content'>");

		xml = xml.replace(/----closeTagL----/mg, "</span><span class='r-cTag'>");
		xml = xml.replace(/----closeTagR----/mg, "</span></div></div>");

		xml = xml.replace(/----blockTagL----/mg, "<div class='r-element'><div class='r-oTag'>");
		xml = xml.replace(/----blockTagR----/mg, "</div></div>");

		xml = xml.replace(/<\/div>([^<]+?)<\/span>/mg, "</div><div class='r-loose'>$1</div></span>");
		xml = xml.replace(/<\/div>([^<]+?)<div/mg, "</div><div class='r-loose'>$1</div><div");

		return xml;
	}

	$.fn.readableXML = function (XML, newOptions) {

		var options = {
			collapsed : false,
			onClose : function () {
			},
			onOpen : function () {
			}
		};

		if (options && typeof options == "object") {
			$.extend(options, newOptions);
		}

		var newXML = convert(XML, options.collapsed);

		// Clear all the elments ready for the XML
		$(this).each(function () {
			$(this).empty();
			$(this).html('<div class="r-main"><div class="r-mainPad">' + newXML + '</div><div class="r-clear"></div></div>');
		});

		// Bind the collapse event on the minus plus symbols
		$(this).find('.r-minus').click(function () {
			var $element = $(this);

			if ($element.parent().hasClass('r-close')) {
				$element.parent().removeClass('r-close');
				options.onOpen($element.parent());
			} else {
				$element.parent().addClass('r-close');
				options.onClose($element.parent());
			}
		});

		// Bind the collapse event on the opening tag
		$(this).find('.r-oTag').click(function () {
			var $element = $(this);

			if ($element.parent().parent().hasClass('r-close')) {
				$element.parent().parent().removeClass('r-close');
				options.onOpen($element.parent().parent());
			} else {
				$element.parent().parent().addClass('r-close');
				options.onClose($element.parent().parent());
			}
		});

	};

})(jQuery);