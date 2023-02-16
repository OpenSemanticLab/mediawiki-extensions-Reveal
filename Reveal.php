<?php

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'Reveal' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['Reveal'] = __DIR__ . '/i18n';
	
	$wgExtensionMessagesFiles['RevealMagic'] = __DIR__ . '/Reveal.i18n.magic.php';
	wfWarn(
		'Deprecated PHP entry point used for Reveal extension. Please use wfLoadExtension ' .
		'instead, see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);
	return true;
} else {
	die( 'This version of the Reveal extension requires MediaWiki 1.25+' );
}
