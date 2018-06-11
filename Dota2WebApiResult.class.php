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
		$this->picks_bans = [];
		$this->kills = [];
		$this->deaths = [];
		$this->players = [];
		$this->duration = '';
		$this->radiant_win = false;
		$this->teams = [];
		$this->start_time = 0;
	}

}
