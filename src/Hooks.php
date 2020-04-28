<?php

namespace Liquipedia\Dota2WebApi;

use EditPage;
use OutputPage;

class Hooks {

	/**
	 * @param array &$vars
	 * @param OutputPage $out
	 * @return bool
	 */
	public static function onMakeGlobalVariablesScript( &$vars, OutputPage $out ) {
		$config = $out->getConfig();
		$extensionAssetsPath = $config->get( 'ExtensionAssetsPath' );
		$extensionPath = $config->get( 'ScriptPath' ) . '/extensions';
		if ( isset( $extensionAssetsPath ) && $extensionAssetsPath !== false ) {
			$extensionPath = $extensionAssetsPath;
		}
		$wgDota2WebApiImagePath = $extensionPath . '/Dota2WebApi/resources/images/';
		$vars[ 'wgDota2WebApiImagePath' ] = $wgDota2WebApiImagePath;
		return true;
	}

	/**
	 * @param EditPage &$editPage
	 * @param OutputPage &$output
	 * @return bool
	 */
	public static function onEditPageShowEditFormInitial( EditPage &$editPage, OutputPage &$output ) {
		$output->addModules( 'ext.dota2WebApi.toolbar' );
		return true;
	}

}
