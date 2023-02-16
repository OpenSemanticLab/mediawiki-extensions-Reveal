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

		//handle css explicitly, see https://www.mediawiki.org/wiki/ResourceLoader/Developing_with_ResourceLoader#CSS_2
		//$out->addModuleStyles( 'ext.reveal.styles' );

		$out->addModules( 'ext.reveal' );

		return true;

	}
}
