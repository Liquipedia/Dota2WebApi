<?php
class ApiDota2WebApiException extends Exception { }

class ApiDota2WebApi extends ApiBase {
	private $_url;
	private $_match_id;
	private $_match_details;
	private $_player_summaries;
	private $_player_names;
	private $_result;

	private $cond_picks_bans = false, $cond_kills_deaths = false, $cond_players = false,
		$cond_duration = false, $cond_radiant_win = false, $cond_teams = false,
		$cond_start_time = false;
	const match_details_url    = 'https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/v001/';
	const player_summaries_url = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/';

	public function execute() {
		$this->_result = new Dota2WebApiResult();
		$this->getParams();

		$error = false;
		try {
			if ($this->_match_id <= 0) {
				throw new ApiDota2WebApiException(wfMessage('dota2webapi-error-non-strictly-positive-match-id')->text());
			}
			$this->getMatchInfo();
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

	private function getParams() {
		$params = $this->extractRequestParams();
		$this->_match_id = $params['matchid'];

		$cond = array_flip($params['data']);
		$this->cond_picks_bans = isset($cond['picks_bans']);
		$this->cond_kills_deaths = isset($cond['kills_deaths']);
		$this->cond_deaths = isset($cond['deaths']);
		$this->cond_players = isset($cond['players']);
		$this->cond_duration = isset($cond['duration']);
		$this->cond_radiant_win = isset($cond['radiant_win']);
		$this->cond_teams = isset($cond['teams']);
		$this->cond_start_time = isset($cond['start_time']);
	}

	private function getMatchInfo() {
		global $wgDota2WebApiKey;
		
		$this->checkApiKey();
		$this->sendMatchDetailsRequest();
		$this->checkMatchDetailsResult();
		$this->getMatchData();

		return true;
	}

	private function checkApiKey() {
		global $wgDota2WebApiKey;

		if (!$wgDota2WebApiKey) {
			throw new ApiDota2WebApiException(wfMessage('dota2webapi-error-missing-api-key')->text());
		}
	}

	private function sendMatchDetailsRequest() {
		global $wgDota2WebApiKey;

		$this->_url = self::requestUrl(self::match_details_url, array(
			'key' => $wgDota2WebApiKey,
			'match_id' => $this->_match_id
		));
		$this->_match_details = $this->sendRequest();
	}
	
	private function checkMatchDetailsResult() {
		if ($this->_match_details == null) {
			throw new ApiDota2WebApiException(wfMessage('dota2webapi-error-no-valve-api-data')->text());
		} else if (isset($this->_match_details->result->error)) {
			throw new ApiDota2WebApiException(wfMessage('dota2webapi-error-message-from-valve-api')->text()
				. "\n" . $this->_match_details->result->error);
		}
	}

	private function getMatchData() {
		if ($this->cond_picks_bans) {
			self::getPicksAndBans();
		}
		if ($this->cond_kills_deaths) {
			self::getKillsAndDeaths();
		}
		if ($this->cond_players) {
			self::getPlayerNames();
			self::getPlayers();	
		}
		if ($this->cond_duration) {
			self::getDuration();
		}
		if ($this->cond_radiant_win) {
			self::getRadiantWin();
		}
		if ($this->cond_teams) {
			self::getTeams();
		}
		if ($this->cond_start_time) {
			self::getStartTime();
		}
	}

	private function requestUrl($base, $params) {
		$q = array();
		foreach ($params as $key => $value) {
			$q[] = $key . '=' . $value;
		}

		return $base . '?' . implode('&', $q);
	}

	private function sendRequest() {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $this->_url);
		curl_setopt($ch, CURLOPT_ENCODING , 'gzip');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);

		$res = curl_exec($ch);
		curl_close($ch);
		return json_decode($res);
	}

	private function getPicksAndBans() {
		$picks_bans_count = array(
			'radiant' => array(
				'pick' => 0,
				'ban' => 0
			),
			'dire' => array(
				'pick' => 0,
				'ban' => 0
			)
		);
		$this->_result->picks_bans = array(
			'radiant' => array(),
			'dire' => array()
		);
		if ( isset($this->_match_details->result->picks_bans) ) {
			foreach ($this->_match_details->result->picks_bans as $pick_ban) {
				if ($pick_ban->team == 0) {
					$team = 'radiant';
				} else {
					$team = 'dire';
				}
				if ($pick_ban->is_pick) {
					$type = 'pick';
				} else {
					$type = 'ban';
				}
				$count = ++$picks_bans_count[$team][$type];
				$this->_result->picks_bans[$team][$type . '_' . $count] = $pick_ban->hero_id;
			}
		}
	}

	private function getKillsAndDeaths() {
		$this->_result->kills = array(
			'radiant' => 0,
			'dire' => 0
		);
		$this->_result->deaths = $this->_result->kills;
		foreach ($this->_match_details->result->players as $player) {
			if ($player->player_slot < 128) {
				$team = 'radiant';
			} else {
				$team = 'dire';
			}
			$this->_result->kills[$team] += $player->kills;
			$this->_result->deaths[$team] += $player->deaths;
		}
	}

	private function getPlayerNames() {
		global $wgDota2WebApiKey;

		$steam_ids = array();
		foreach ($this->_match_details->result->players as $player) {
			if ($player->account_id != Dota2WebApiPlayer::ANONYMOUS) {
				$steam_ids[] = Dota2WebApiPlayer::convertId($player->account_id);
			}
		}

		$this->_url = self::requestUrl(self::player_summaries_url, array(
			'key' => $wgDota2WebApiKey,
			'steamids' => implode(',', $steam_ids)
		));
		$this->_player_summaries = $this->sendRequest();

		$this->_persona_names = array();
		foreach ($this->_player_summaries->response->players as $player) {
			$this->_persona_names[$player->steamid] = $player->personaname;
		}
	}

	private function getPlayers() {
		$this->_result->players = array(
			'radiant' => array(),
			'dire' => array()
		);
		foreach ($this->_match_details->result->players as $player) {
			if ($player->player_slot < 128) {
				$team = 'radiant';
				$team_slot = $player->player_slot + 1;
			} else {
				$team = 'dire';
				$team_slot = $player->player_slot - 127;
			}

			$this->_result->players[$team]['player_' . $team_slot] = $this->getPlayerDetails($player);
		}
	}

	private function getPlayerDetails($player) {
		$playerDetails = new Dota2WebApiPlayer();
		$playerDetails->setPersonaNames($this->_persona_names);
		$playerDetails->setData($player);
		return $playerDetails;
	}

    private function getDuration() {
		$duration = $this->_match_details->result->duration;
		$this->_result->duration = sprintf('%02d:%02d', $duration / 60, $duration % 60);
	}

	private function getRadiantWin() {
		$this->_result->radiant_win = $this->_match_details->result->radiant_win;
	}

	private function getTeams() {
		$this->_result->teams = array(
			'radiant' => isset($this->_match_details->result->radiant_name) ?
				$this->_match_details->result->radiant_name : 'tbd',
			'dire' => isset($this->_match_details->result->dire_name) ?
				$this->_match_details->result->dire_name : 'tbd',
		);
	}

	private function getStartTime() {
		$this->_result->start_time = gmdate('j F Y, H:i \U\T\C', $this->_match_details->result->start_time);
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