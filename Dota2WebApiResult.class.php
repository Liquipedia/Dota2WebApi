<?php
class Dota2WebApiResult {
	public $picks_bans;
	public $kills;
	public $deaths;
	public $players;
	public $duration;
	public $radiant_win;
	public $teams;
	public $start_time;

	public function __construct() {
		$this->picks_bans = array();
		$this->kills = array();
		$this->deaths = array();
		$this->players = array();
		$this->duration = '';
		$this->radiant_win = false;
		$this->teams = array();
		$this->start_time = 0;
	}
}