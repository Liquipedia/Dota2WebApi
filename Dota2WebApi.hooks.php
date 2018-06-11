<?php

class Dota2WebApiHooks {

	public static function onMakeGlobalVariablesScript( &$vars, OutputPage $out ) {
		$extensionAssetsPath = $out->getConfig()->get( 'ExtensionAssetsPath' );
		$extensionPath = (!isset( $wgExtensionAssetsPath ) || $wgExtensionAssetsPath === false) ? $wgScriptPath . '/extensions' : $wgExtensionAssetsPath;
		$wgDota2WebApiImagePath = $extensionPath . '/Dota2WebApi/modules/images/';
		$vars[ 'wgDota2WebApiImagePath' ] = $wgDota2WebApiImagePath;
		return true;
	}

	public static function onEditPage_showEditForm_initial( EditPage &$editPage, OutputPage &$output ) {
		$output->addModules( 'ext.dota2WebApi.toolbar' );
		return true;
	}

	public static function onLoadExtensionSchemaUpdates( DatabaseUpdater $updater ) {
		$updater->addExtensionTable( 'dota2webapicache', __DIR__ . '/dota2webapicache.sql' );
	}

}
