<?php

/**
 * Created by IntelliJ IDEA.
 * User: Marco Ammon (Clubfan)
 * Date: 21.03.2017
 * Time: 16:54
 */
class SpecialShowMatch extends SpecialPage
{

	public function __construct() {
		parent::__construct('ShowMatch');
		$this->mIncludable = true;
	}

	function execute( $matchId ) {
		$request = $this->getRequest();
		$output = $this->getOutput();
		$this->setHeaders();

		$_result = new Dota2WebApiResult();

		$params = array("matchid" => $matchId ,"data" => array("picks_bans", "kills_deaths", "players", "radiant_win", "teams", "start_time"));
		$matchInfo = new Dota2WebApiMatchInfo();
		$error = false;
		try {
			$_result = $matchInfo->getMatchInfo($params);
		} catch (Exception $e) {

			$error = true;
			$_result = array(
				'error' => $e->getMessage()
			);
		}
		if ($error){

			$output->addWikiText( "An error occured!: " . $_result['error'] );
		} else {
			$wikitext = $this->generateWikicode($_result, $matchId);
			$output->addHTML($this->sandboxParse( $wikitext) );
		}

	}

	private function generateWikicode($result, $matchId) {
		$sides = array("radiant", "dire");
		$player_stats = array("name", "hero", "level", "kills", "deaths", "assists", "last_hits",
			"denies", "gold_per_min", "xp_per_min");
		$items = array("item", "bearitem");
		$template = "{{Detailed game stats";
		$pick_bans = array("pick", "ban");
		$template .= "|date=" . $result->start_time . " ";
		$template .= "|winner=" . (($result->radiant_win == true) ? 1 : 2) . " ";
		$template .= "|matchid=" . $matchId . " ";
		foreach ($sides as $side) {
			$template .= "|" . $side . "_team=" . $result->teams[$side] . " ";
			$picks_bans_values = $result->picks_bans[$side];
			foreach ($pick_bans as $stat) {
				for ($i = 1; $i <= 5; $i++) {
					$template .= "|" . $side . "_" . $stat . "_" . $i . "=" . $picks_bans_values[$stat . "_" . $i] . " ";
				}
			}
			$kills = $result->kills[$side];
			$template .= "|" . $side . "_" . "kills=" . $kills . " ";
			$deaths = $result->deaths[$side];
			$template .= "|" . $side . "_" . "deaths=" . $deaths . " ";
			$player_values = $result->players[$side];
			for ($i = 1; $i <= 5; $i++) {
				foreach ($player_stats as $stat) {
					$template .= "|" . $side . "_" . $stat . "_" . $i . "=" . $player_values["player_" . $i]->$stat . " ";
				}
				foreach ($items as $item){
					for ($j = 1; $j <= 6; $j++) {
						$template .= "|" . $side . "_" . $i . "_" . $item . "_" . $j . "=" . $player_values["player_" . $i]->{$item . "_" . $j} . " ";
					}
				}
			}
		}
		$template .= "}}";
		return $template;
	}

	private function sandboxParse($wikiText) {
		$myParser = new Parser();
		$myParserOptions = ParserOptions::newFromUser($this->getUser());
		$result = $myParser->parse($wikiText, $this->getTitle(), $myParserOptions);
		return $result->getText();
	}
}