<?php

namespace Liquipedia\Extension\Dota2WebApi\Hooks;

use EditPage;
use MediaWiki\Hook\EditPage__showEditForm_initialHook;
use MediaWiki\Hook\MakeGlobalVariablesScriptHook;
use OutputPage;

class MainHookHandler implements
	EditPage__showEditForm_initialHook,
	MakeGlobalVariablesScriptHook
{

	// phpcs:disable MediaWiki.NamingConventions.LowerCamelFunctionsName.FunctionName

	/**
	 * @param EditPage $editor
	 * @param OutputPage $out
	 * @return bool
	 */
	public function onEditPage__showEditForm_initial( $editor, $out ) {
		$out->addModules( 'ext.dota2WebApi.toolbar' );
		return true;
	}

	/**
	 * @param array &$vars
	 * @param OutputPage $out
	 * @return bool
	 */
	public function onMakeGlobalVariablesScript( &$vars, $out ): void {
		$config = $out->getConfig();
		$extensionAssetsPath = $config->get( 'ExtensionAssetsPath' );
		$extensionPath = $config->get( 'ScriptPath' ) . '/extensions';
		if ( isset( $extensionAssetsPath ) && $extensionAssetsPath !== false ) {
			$extensionPath = $extensionAssetsPath;
		}
		$dota2WebApiImagePath = $extensionPath . '/Dota2WebApi/resources/images/';
		$vars[ 'wgDota2WebApiImagePath' ] = $dota2WebApiImagePath;
	}

}
