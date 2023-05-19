<?php
/**
 * Hooks for Reveal extension
 *
 * @file
 * @ingroup Extensions
 */

class RevealHooks {

	public static function onParserFirstCallInit( Parser &$parser ) {
		$parser->setFunctionHook( 'REVEAL', 'RevealHooks::doSomething' );
	}

	public static function doSomething( Parser &$parser )
	{
		// Called in MW text like this: {{#something: }}

		// For named parameters like {{#something: foo=bar | apple=orange | banana }}
		// See: https://www.mediawiki.org/wiki/Manual:Parser_functions#Named_parameters

		return "This text will be shown when calling this in MW text.";
	}

	public static function onBeforePageDisplay( $out ) {

		$requested = $out->getRequest()->getCheck( 'reveal' );

		//handle css explicitly, see https://www.mediawiki.org/wiki/ResourceLoader/Developing_with_ResourceLoader#CSS_2
		//$out->addModuleStyles( 'ext.reveal.styles' );

		//loading animation (adapted from https://loading.io/css/, CCO)
		$css = <<<EOD
		#mw-wrapper { display: none; }
		.lds-dual-ring {
			display: inline-block;
			width: 80px;
			height: 80px;
			position: fixed;
			left: 50%;
			top: 50%;
			text-align: center;
		  }
		  .lds-dual-ring:before {
			content: " ";
			display: block;
			width: 64px;
			height: 64px;
			margin: 8px;
			border-radius: 50%;
			border: 6px solid #fff;
			border-color: #fff transparent #fff transparent;
			animation: lds-dual-ring 1.2s linear infinite;
		  }
		  @keyframes lds-dual-ring {
			0% {
			  transform: rotate(0deg);
			}
			100% {
			  transform: rotate(360deg);
			}
		  }
		EOD;

		$js = <<<EOD
		let div = document.createElement('div');
		div.classList.add('lds-dual-ring');
		let text = document.createTextNode('Loading...');
		div.appendChild(text);
		document.body.appendChild(div)
		EOD;

		if ( $requested ) {
			$out->addInlineStyle( $css ); //inject as early as possible
			$out->addInlineScript( $js ); //inject as early as possible
			$out->addModules( 'ext.reveal' );
		}

		return true;

	}

	/**
	 * Hook: Called by Skin when building the toolbox array and
	 * returning it for the skin to output.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SidebarBeforeOutput
	 */
	public static function onSidebarBeforeOutput( $skin, &$sidebar )
	{
		$sidebar["TOOLBOX"]["reveal"] = [
			'text' => $skin->msg( 'reveal-menu-entry' )->text(),
			'href' => $skin->makeInternalOrExternalUrl($skin->getTitle()) . '?reveal=true&useskin=timeless',
			'id'   => 't-reveal'
		];
	}
}
