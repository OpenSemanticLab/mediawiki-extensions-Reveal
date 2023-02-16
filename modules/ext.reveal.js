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
	var recursion_object = {};
	
	searchParams = new URLSearchParams(window.location.search);
	var requested = searchParams.has('reveal') && searchParams.get('reveal') === 'true';
	var req_animate = searchParams.has('animate') && searchParams.get('reveal') === 'true';
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
	).done( async function () {
		console.log("Reveal init");
		
		var reveal_body = $('<body>\
		<div class="reveal" id="reveal">\
		</div></body>');
		//display title and authors
		var contributors;
		var contributor_names = "";
		await fetch(`/w/api.php?action=query&prop=contributors&titles=${mw.config.get( 'wgPageName' )}&format=json`)
		  .then(res => res.json())
		  .then(data => {
		  	contributors = data.query.pages[Object.keys(data.query.pages)[0]].contributors;
		  	contributors.forEach(function(contributor){
			  contributor_names += contributor.name + ", ";
			  
			});
		  	contributor_names = contributor_names.slice(0, -2);
		  });

		var reveal_slides = $(`\
		    <div class="slides" id=reveal-slides">\
				<section style="top: 40%; font-size: 2em;"><div>${mw.config.get( 'wgPageName' )}</div><div style="font-size: 0.5em; padding-left: 10%; padding-right: 10%;">${contributor_names}</div></section>\
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
		var section_template_left = '<div class="div-left"></div>';
		var section_template_center = '<div class="div-center"></div>';
		var section_template_right = '<div class="div-right"></div>';
		var section_template_top = '<div class="div-top"></div>';
		$section = $(section_template);
		$section_container = $(section_template_container);
		$section_left = $(section_template_left);
		$section_center = $(section_template_center);
		$section_right = $(section_template_right);
		$section_top = $(section_template_top);
		
		//init section elements
		$section_container.append($section_left, $section_top, $section_center, $section_right);
		$section.append($section_container);
		$(reveal_slides).append($section);
		
		const elements = $('#mw-content-text').children('.mw-parser-output').children().toArray();
		for(let element of elements) {
			if(req_animate){
			$(element).find('ul').css({
				"opacity":"0.0"
			});
			if($(element).prop('nodeName') === 'UL'){
				$(element).css({
					"opacity":"0.0"
				});
			}}
    		//console.log(i + ": " + $(element).prop('nodeName'));
    		if ($(element).prop('nodeName') === 'H2'){
    			$(reveal_slides).append($section);
    			//reinit section elements
    			$section = $(section_template);
    			$section_container = $(section_template_container);
    			$section_left = $(section_template_left);
				$section_center = $(section_template_center);
				$section_right = $(section_template_right);
				$section_top = $(section_template_top);
    			$section_container.append($section_left, $section_top, $section_center, $section_right);
    			$section.append(element);
				$section.append($section_container);
    			//move id attr
    			$section.attr('id', $(element).children('span').attr('id')); //move id to section for navigation
    			$(element).children('span').removeAttr('id');
    		}
    		else if ($(element).find('a.image').length == 1) $section_right.append(element); //single images to the right
    		else if ($(element).find('.gallerybox').length > 0) $section_top.append(element); //gallery to the top
    		else if ($(element).hasClass( "SvgEdit" )) {$section_top.append(element);} //svgedit to the top
    		else $section_center.append(element); //everything else to the center
		}
		$(reveal_slides).append($section); //append last slide
		
		//Reveal.initialize();
		await Reveal.initialize({
			disableLayout: true,
			center: false,
			controls: true,
			controlsTutorial: true, 
			overview: true, 
			touch: true,
			width: "100%",
			height: "100%",
			margin: 0,
			//minScale: 1,
			//maxScale: 1,
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
		

		//Checks if only one of the set <div>s is not empty in the container
		function allOtherDivsEmpty(){
			var count_divs = 0;
			if($($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).children().length == 4){
				var grid_children_length = $($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).children().length;
				var grid_children = $($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).children()
				for(var i = 0; i < grid_children_length; i++){
					if(grid_children[i].innerHTML == ""){
						count_divs += 1;
					}
				}
				
			};
			if(count_divs == 3){
				return true;
			}else{
				return false;
			}
			
		}
		//Deletes empty <div>s in container and changes css if there is only a div-center class with text.
		var div_center_only = "";
		function deleteEmptyDivs(){
			if($($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).children().length == 4){
				var grid_children_length = $($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).children().length;
				var grid_children = $($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).children()
				for(var i = 0; i < grid_children_length; i++){
					if(grid_children[i].innerHTML == ""){
						$(grid_children[i]).remove();
					}else{
						div_center_only += $(grid_children[i]).attr('class') + " ";
					}
				}
				var ul_inside = $($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).find('ul').length;
				var no_toc = $($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).find('#toc').length;
				if(div_center_only.includes('div-center') && !div_center_only.includes('div-top') && !div_center_only.includes('div-left') && !div_center_only.includes('div-right') && ul_inside > 0 && no_toc == 0){
					$($($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).children()[0]).attr('class', "");
					$($($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).children()[0]).attr('class', "div-left");
					$($($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).children()[0]).css({
						"text-align": "left",
						"padding-left": "10px"
					});
					
				}
				div_center_only = "";
			};
		}
		
		//Changes font-size to fit it in the slide
		var font_size_content = 1.0;
		var rec_count = 0;
		function calculateFontSize(current){
			return;
			var current_old = current;

			if(!(current_old in recursion_object) || rec_count > 350){console.log("stop", Reveal.getCurrentSlide()); rec_count = 0; return;}
			rec_count++;
			deleteEmptyDivs();
			if($($(Reveal.getCurrentSlide()).find("h2")[0]).length > 0){
			var body_height = $('body')[0].getBoundingClientRect().height - $(Reveal.getCurrentSlide()).find("h2")[0].getBoundingClientRect().height;
			var content_height = $(Reveal.getCurrentSlide()).find(".column-container-grid")[0].getBoundingClientRect().height + 50;}
			
			if($($($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).find(".div-center")[0]).find("ul").length == 1 && $($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).find(".div-top").length == 0){
				var content_ul_height = $($($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).find(".div-center")[0]).find("ul")[0].getBoundingClientRect().height;
				if(body_height < content_ul_height){
					$($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).css('font-size', font_size_content + "em");
					font_size_content -= 0.01;
					calculateFontSize(current);
				}else if(body_height > content_ul_height && (body_height - content_ul_height) > 50){
					$($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).css('font-size', font_size_content + "em");
					font_size_content += 0.01;
					calculateFontSize(current);
				}else{
					font_size_content = 1.0;
					rec_count = 0;
					return;
				}
				
			}else{
				if(body_height < content_height){
					$($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).css('font-size', font_size_content + "em");
					font_size_content -= 0.01;
					calculateFontSize(current);
				}else if(body_height > content_height && (body_height - content_height) > 100){
					$($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).css('font-size', font_size_content + "em");
					font_size_content += 0.01;
					calculateFontSize(current);
				}else{
					font_size_content = 1.0;
					rec_count = 0;
					return;
				}

			}
			
		
		}
		//Changes size of images in the div-right class
		function resizeImages(){
			var images_count = $(Reveal.getCurrentSlide()).find(".column-container-grid").find(".tright").length;
			if($($(Reveal.getCurrentSlide()).find("h2")[0]).length > 0){
			var max_height = $('body')[0].getBoundingClientRect().height - $(Reveal.getCurrentSlide()).find("h2")[0].getBoundingClientRect().height - 50 - (10*images_count);}
			var image_max_height = max_height/images_count;
			
			if($(Reveal.getCurrentSlide()).find(".column-container-grid").find(".tright").length > 0){
				$(Reveal.getCurrentSlide()).find(".column-container-grid").css({
						"grid-template-areas": `"c c r" "c c r"`
					});
				for(var i = 0; i < $(Reveal.getCurrentSlide()).find(".column-container-grid").find(".tright").length; i++ ){
					$($(Reveal.getCurrentSlide()).find(".column-container-grid").find(".tright")[i]).css({
						"height": "" + image_max_height + "px",
						"margin-bottom": "10px"
					});
					$($($(Reveal.getCurrentSlide()).find(".column-container-grid").find(".tright")[i]).find(".thumbinner")).css({
						"height": "" + image_max_height + "px"
					});
					
					$($($(Reveal.getCurrentSlide()).find(".column-container-grid").find(".tright")[i]).find(".thumbcaption")).css({
						"font-size": "" + image_max_height/15 + "px"
					});
					
					$($($(Reveal.getCurrentSlide()).find(".column-container-grid").find(".tright")[i]).find(".thumbimage")).attr("height", "70%");
					
				}
			}
		}
		//Changes size of all possible content
		function functionality(current_page){
			document.body.style.zoom = (window.innerWidth / window.outerWidth);
			/*if(window.devicePixelRatio > 1){
				document.body.style.zoom = window.devicePixelRatio - 1;
			}else{
				document.body.style.zoom = window.devicePixelRatio + (1 - window.devicePixelRatio);
			}*/

			if($($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).children().length > 1){
			$(Reveal.getCurrentSlide()).find(".column-container-grid").css({
				"grid-template-areas": `"t t t" "l c r"`
			});
			}
			if($($(Reveal.getCurrentSlide()).find(".column-container-grid").find("[id^=drawio-img-]")[0]).length > 0){
				$($($(Reveal.getCurrentSlide()).find(".column-container-grid").find("[id^=drawio-img-]")[0]).find('img')).css({
					"max-width": ""
				});
				
			}else if($($(Reveal.getCurrentSlide()).find(".column-container-grid").find("[id^=map_]")[0]).length > 0){
				if($($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).children().length > 1){
					var max_height_map = $('body')[0].getBoundingClientRect().height - $(Reveal.getCurrentSlide()).find("h2")[0].getBoundingClientRect().height - 50;
					deleteEmptyDivs();
					$($(Reveal.getCurrentSlide()).find(".column-container-grid").find("[id^=map_]")[0]).css({
						"width": "100%",
						"height": "" + max_height_map + "px"
					});
					$(Reveal.getCurrentSlide()).find(".column-container-grid").css({
						"grid-template-areas": `"t t t" "c c c"`
					});
				}
			}else if($($(Reveal.getCurrentSlide()).find(".column-container-grid").find("[id^=chemViewer_]")[0]).length > 0){
				if($($(Reveal.getCurrentSlide()).find(".column-container-grid")[0]).children().length > 1){
					var max_height_map = $('body')[0].getBoundingClientRect().height - $(Reveal.getCurrentSlide()).find("h2")[0].getBoundingClientRect().height - 50;
					deleteEmptyDivs();
					$($(Reveal.getCurrentSlide()).find(".column-container-grid").find("[id^=chemViewer_]")[0]).css({
						"width": "100%",
						"height": "" + max_height_map + "px"
					});
					$(Reveal.getCurrentSlide()).find(".column-container-grid").css({
						"grid-template-areas": `"t t t" "c c c"`
					});
				}
				
			}else if($($(Reveal.getCurrentSlide()).find(".column-container-grid").find("#toc")[0]).length > 0){
				$(Reveal.getCurrentSlide()).find(".column-container-grid").find("#toc")[0].classList.add("center");
				deleteEmptyDivs();
				calculateFontSize(current_page);
			}else if($($(Reveal.getCurrentSlide()).find(".column-container-grid").find("object")[0]).length > 0){
				deleteEmptyDivs();
				var max_height_pdf = $('body')[0].getBoundingClientRect().height - $(Reveal.getCurrentSlide()).find("h2")[0].getBoundingClientRect().height - 50;
				var max_width_pdf = $('body')[0].getBoundingClientRect().width - 100;
				$($(Reveal.getCurrentSlide()).find(".column-container-grid").find("object")[0]).attr("width", ""+max_width_pdf+"px");
				$($(Reveal.getCurrentSlide()).find(".column-container-grid").find("object")[0]).attr("height", ""+max_height_pdf+"px");
			}else if($(Reveal.getCurrentSlide()).find(".column-container-grid").find("video").length > 0){
				deleteEmptyDivs();
				var max_height_video = $('body')[0].getBoundingClientRect().height - $(Reveal.getCurrentSlide()).find("h2")[0].getBoundingClientRect().height - 50;
				var max_width_video = $('body')[0].getBoundingClientRect().width - 100;
				
				$($(Reveal.getCurrentSlide()).find(".column-container-grid").find("video")[0]).css({
					"width": ""+max_width_video + "px",
					"height": ""+(max_height_video - 200) + "px"
				});
				$($(Reveal.getCurrentSlide()).find(".column-container-grid").find("video").parent()[0]).css({
					"width": ""+max_width_video + "px",
					"height": ""+(max_height_video - 200) + "px"
				});
				$($(Reveal.getCurrentSlide()).find(".column-container-grid").find("video").parent().parent()[0]).css({
					"width": ""+max_width_video + "px",
					"height": ""+max_height_video + "px"
				});
			}else if($($(Reveal.getCurrentSlide()).find(".column-container-grid")).find(".thumb").length > 0 && allOtherDivsEmpty()){
				deleteEmptyDivs();
				$(Reveal.getCurrentSlide()).find(".column-container-grid").find(".thumb").parent()[0].className = "";
				$(Reveal.getCurrentSlide()).find(".column-container-grid").find(".thumb").parent()[0].className = "div-center";
				calculateFontSize(current_page);
			}else if($($(Reveal.getCurrentSlide()).find(".column-container-grid")).find(".gallerybox").length > 0){
				$(Reveal.getCurrentSlide()).find(".column-container-grid").css({
					"grid-template-areas": `"t t t" "c c c"`
				});
				$($($(Reveal.getCurrentSlide()).find(".column-container-grid")).find(".div-center")[0]).css({
					"text-align": "left",
					"padding-left": "10px"
					
				});
				deleteEmptyDivs();
				calculateFontSize(current_page);
				
			}else if($($(Reveal.getCurrentSlide()).find(".column-container-grid").find("[href*='talk']")[0]).length > 0){
				deleteEmptyDivs();
			}else if($($(Reveal.getCurrentSlide()).find(".column-container-grid").find("[id^=svgedit]")[0]).length > 0){
				deleteEmptyDivs();
				$(Reveal.getCurrentSlide()).find(".column-container-grid").css({
					"grid-template-areas": `"t t t" "c c c"`
				});
				$(Reveal.getCurrentSlide()).find(".column-container-grid").find('.mw-svgedit').css({
					"padding-right": "5%"
				});
				if($(Reveal.getCurrentSlide()).find(".column-container-grid").children().length > 1){
					$($(Reveal.getCurrentSlide()).find(".column-container-grid").find('.SvgEdit')).css({
						"height": "50%"
						
					});
					$($(Reveal.getCurrentSlide()).find(".column-container-grid").find('img')).css({
						"max-width":"35%"
					});
					
					calculateFontSize(current_page);
				}else{
					$($(Reveal.getCurrentSlide()).find(".column-container-grid").find('img')).css({
						"max-width":"50%"
					});
				}
			}else if($($(Reveal.getCurrentSlide()).find(".column-container-grid")).find(".InteractiveSemanticGraph").length > 0){
				$($($(Reveal.getCurrentSlide()).find(".column-container-grid")).find(".InteractiveSemanticGraph")[0]).css({
					"width": "" + $('body')[0].getBoundingClientRect().width + "px"
				});
				calculateFontSize(current_page);
			}else{
				deleteEmptyDivs();
				calculateFontSize(current_page);
				resizeImages();
			}
		}
		//Sets animation for lists
		function animateLists() {
			return new Promise( function(resolve){
				if($(Reveal.getCurrentSlide()).find(".column-container-grid").find("ul").length > 0){
				for(j=0; j < $(Reveal.getCurrentSlide()).find(".column-container-grid").find("ul").length; j++){
				var list_elements = $($(Reveal.getCurrentSlide()).find(".column-container-grid").find('ul')[j]).find('li');
				
				for(var i=0;i < list_elements.length; i++){
					$(list_elements[i]).addClass('fragment');
				}
				}};
				resolve(true);
			});
			
		}
		
		
		
		/*function animateLists(){
			
			if($(Reveal.getCurrentSlide()).find(".column-container-grid").find("ul").length > 0){
				for(j=0; j < $(Reveal.getCurrentSlide()).find(".column-container-grid").find("ul").length; j++){
				var list_elements = $($(Reveal.getCurrentSlide()).find(".column-container-grid").find('ul')[j]).find('li');
				
				for(var i=0;i < list_elements.length; i++){
					$(list_elements[i]).addClass('fragment');
				}
			}}
			
		}
		function animateLists(ele){
			if($(ele).prop('nodeName') === 'UL'){
				$(ele).find('li').addClass('fragment');
				//$(list_elements[i]).addClass('fragment');
				}
		}*/
		
		//Executes script on url change
		var opacity_counter = 0;
		window.addEventListener('popstate',  function (event) {
			console.log(req_animate);
			var current_href = window.location.href;
			recursion_object = {};
			recursion_object[""+ current_href] = "";
			functionality(current_href);
			//animateLists();
			async function setOpacity(){
				await animateLists().then(function(response){
					Reveal.on( 'fragmentshown', event => {
					 $(event.fragment).parent().css({
					 	"opacity": "1.0"
					 });
					} );
		    });
				
			}
			if(req_animate){
			setOpacity();}
		});
	});
});