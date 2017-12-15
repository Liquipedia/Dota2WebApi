<?php

class Dota2WebApiHooks {
	public static function makeGlobalVariablesScript( &$vars ) {
		global $wgExtensionAssetsPath;
		$extensionPath = (!isset($wgExtensionAssetsPath) || $wgExtensionAssetsPath === false) ? $wgScriptPath . '/extensions' : $wgExtensionAssetsPath;
		$wgDota2WebApiImagePath = $extensionPath . '/Dota2WebApi/modules/images/';

		$vars['wgDota2WebApiImagePath'] = $wgDota2WebApiImagePath;
		return true;
	}
	
	public static function Dota2WebApiAddButtons() {
		global $wgOut;
		$wgOut->addModules('ext.dota2WebApi.toolbar');

		return true;
	}
}