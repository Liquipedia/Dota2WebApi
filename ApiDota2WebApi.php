<?php


//TODO: Refactor request generation and response parsing into own class
class ApiDota2WebApi extends ApiBase {
	private $_result;

	public function execute() {
		$this->_result = new Dota2WebApiResult();
		$matchInfo = new Dota2WebApiMatchInfo();
		$error = false;
		try {
			$this->_result = $matchInfo->getMatchInfo($this->extractRequestParams());
		} catch (Exception $e) {
			$error = true;
			$this->_result = array(
				'error' => $e->getMessage()
			);
		}

		$this->getResult()->addValue(null, $this->getModuleName(),
			array('isresult' => !$error ? 1 : 0));
		$this->getResult()->addValue(null, $this->getModuleName(),
			array('result' => $this->_result));

		return true;
	}



	// Description
	public function getDescription() {
		return wfMessage('dota2webapi-api-description')->text();
	}

	// Face parameter.
	public function getAllowedParams() {
		return array(
			'matchid' => array (
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_REQUIRED => true
			),
			'data' => array(				
				ApiBase::PARAM_ISMULTI => true,
				ApiBase::PARAM_DFLT => 'picks_bans|duration|radiant_win',
				ApiBase::PARAM_TYPE => array(
					'picks_bans',
					'kills_deaths',
					'players',
					'duration',
					'radiant_win',
					'teams',
					'start_time'
				)
			)
		);
	}

	// Describe the parameter
	public function getParamDescription() {
		return array(
			'matchid' => wfMessage('dota2webapi-api-matchid-description')->text(),
			'data' => wfMessage('dota2webapi-api-data-description')->text()
		);
	}

	// Get examples
	public function getExamples() {
		return array(
			'api.php?action=dota2webapi&matchid=117762656&data=picks_bans|players|kills_deaths&format=json',
		);
	}
}
