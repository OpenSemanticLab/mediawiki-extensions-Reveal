/*@nomin*/

( function () {

	/**
	 * @class mw.reveal
	 * @singleton
	 */
	mw.reveal = {
	};

}() );

$(document).ready(function () {
	if ($('#p-cactions').length === 0) return; //check if tool bar exists
	$menu_entry = $('#p-cactions').find('ul').children().first().clone(); //find "more" page menu and clone first entry
	if ($menu_entry.length === 0) return; //check if entry exists
	$menu_entry.find('a').attr('href', mw.config.get( 'wgArticlePath' ).replace('$1', mw.config.get( 'wgPageName' ) ) + '?reveal=true');
	$menu_entry.attr('id', 'ca-reveal');
	$menu_entry.find('a').text('Slideshow');
	$menu_entry.find('a').attr('title', 'View this page as a slideshow [Alt+Shift+s]');
	$menu_entry.find('a').attr('accesskey', 's');
	$('#p-cactions').find('ul').append($menu_entry); //insert entry
});

$(document).ready(function () {
	searchParams = new URLSearchParams(window.location.search);
	var requested = searchParams.has('reveal') && searchParams.get('reveal') === 'true';
	if (!requested) return;
	mw.loader.load("//repolab.github.io/reveal.js/dist/reveal.css", "text/css");
	mw.loader.load("//repolab.github.io/reveal.js/dist/theme/white.css", "text/css");
	$.when(
		$.getScript("//repolab.github.io/reveal.js/dist/reveal.js"),
		$.getScript("//repolab.github.io/reveal.js/plugin/zoom/zoom.js"),
		$.getScript("//repolab.github.io/reveal.js/plugin/notes/notes.js"),
		$.getScript("//repolab.github.io/reveal.js/plugin/search/search.js"),
		$.Deferred(function (deferred) {
			$(deferred.resolve);
		})
	).done(function () {
		console.log("Reveal init");
		
		var reveal_body = $('<body>\
		<div class="reveal" id="reveal">\
		</div></body>');
		//ToDo: Use page display title and authors
		var reveal_slides = $(`\
		    <div class="slides" id=reveal-slides">\
				<section>${mw.config.get( 'wgPageName' )}</section>\
			</div>`);
		$(reveal_body).append(reveal_slides);
		
		//remove original page
		var original_page = $('body').children().detach();
		//create hidden div
		$('body').append('<div id="original-page" style="display:none"></div>');
		//move original page content to hidden div
		$(original_page).appendTo("#original-page");
		$('body').append(reveal_body); //insert new content
		
		//insert close and print link
		$print_link = $('<a class="reveal-print"><i class="fa fa-caret-right" style="position: fixed; right: 140px; bottom: 30px; z-index: 30; font-size: 24px;">🖨</i></a>');
		$print_link.on('click', function(){var url = new window.URL(window.location); url.searchParams.append('print-pdf', true); window.location=url;});
		$close_link = $('<a class="reveal-close"><i class="fa fa-caret-right" style="position: fixed; right: 180px; bottom: 30px; z-index: 30; font-size: 24px;">🚪</i></a>');
		$close_link.on('click', function(){var url = new window.URL(window.location); url.searchParams.delete('reveal'); window.location=url;});
		$('body').append($close_link, $print_link); //insert links
		
		//template
		var section_template = '<section class="reveal-section"></section>';
		var section_template_container = '<div class="column-container-grid"></div>';
		var section_template_left = '<div></div>';
		var section_template_center = '<div></div>';
		var section_template_right = '<div></div>';
		$section = $(section_template);
		$section_container = $(section_template_container);
		$section_left = $(section_template_left);
		$section_center = $(section_template_center);
		$section_right = $(section_template_right);
		
		//init section elements
		$section_container.append($section_left, $section_center, $section_right);
		$section.append($section_container);
		$(reveal_slides).append($section);

		const elements = $('#mw-content-text').children('.mw-parser-output').children().toArray();
		for(let element of elements) {
    		//console.log(i + ": " + $(element).prop('nodeName'));
    		if ($(element).prop('nodeName') === 'H2'){
    			$(reveal_slides).append($section);
    			//reinit section elements
    			$section = $(section_template);
    			$section_container = $(section_template_container);
    			$section_left = $(section_template_left);
				$section_center = $(section_template_center);
				$section_right = $(section_template_right);
    			$section_container.append($section_left, $section_center, $section_right);
    			$section.append(element);
				$section.append($section_container);
    			//move id attr
    			$section.attr('id', $(element).children('span').attr('id')); //move id to section for navigation
    			$(element).children('span').removeAttr('id');
    		}
    		else if ($(element).find('a.image').length == 1) $section_right.append(element); //single images to the left
    		else $section_center.append(element); //everything else to the center
		}
		$(reveal_slides).append($section); //append last slide
		
		//Reveal.initialize();
		Reveal.initialize({
			center: false,
			controls: true,
			controlsTutorial: true, 
			overview: true, 
			touch: true,
			width: "100%",
			height: "100%",
			margin: 0,
			minScale: 0.1,
			maxScale: 10,
			slideNumber: true,
			showSlideNumber: 'all', //all, print, speaker
			hashOneBasedIndex: true, //Use 1 based indexing for # links 
			hash: true, //Add the current slide number to the URL hash
			respondToHashChanges: true, // Flags if we should monitor the hash and change slides accordingly
			history: true, // Push each slide change to the browser history.  Implies `hash: true`
			plugins: [ RevealSearch, RevealNotes, RevealZoom ],
		});
		
		//override conflicting bootstrap css, temporary remove hidden attribute
		Reveal.addEventListener( 'overviewshown', function( event ) { $('.reveal-section.past, .reveal-section.future').removeAttr('hidden'); } );
		Reveal.addEventListener( 'overviewhidden', function( event ) { $('.reveal-section.past, .reveal-section.future').attr('hidden', ''); } );
		mw.util.addCSS( '.reveal table { font-size: 50% !important; }'); //override large table css
		mw.util.addCSS( '.column-container-flex{ display: flex;} .col {flex: 1;} '); //two column layout
		mw.util.addCSS( '.column-container-grid{ display: grid; grid-auto-flow: column;} '); //two column layout

	});
});
