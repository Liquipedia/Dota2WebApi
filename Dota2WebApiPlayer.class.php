<?php
class Dota2WebApiPlayer {
	public $name;
	public $hero;
	public $level;
	public $kills;
	public $deaths;
	public $assists;
	public $last_hits;
	public $denies;
	public $gold_per_min;
	public $xp_per_min;
	public $item_1;
	public $item_2;
	public $item_3;
	public $item_4;
	public $item_5;
	public $item_6;
	public $bearitem_1;
	public $bearitem_2;
	public $bearitem_3;
	public $bearitem_4;
	public $bearitem_5;
	public $bearitem_6;

	private $_player;
	/*private $_heroes;
	private $_items;*/
	private $_persona_names;

	const ANONYMOUS = 4294967295;

	public function __construct() {}

	public function setPersonaNames($persona_names) {
		$this->_persona_names = $persona_names;
	}

	public function setData($player) {
		$this->_player = $player;
		$this->setDataGeneral();
		$this->setDataItems();
	}
	
	private function setDataGeneral() {
		$this->name = self::getPlayerPersonaName($this->_player->account_id);
		$this->hero = $this->_player->hero_id;
		$this->level = $this->_player->level;
		$this->kills = $this->_player->kills;
		$this->deaths = $this->_player->deaths;
		$this->assists = $this->_player->assists;
		$this->last_hits = $this->_player->last_hits;
		$this->denies = $this->_player->denies;
		$this->gold_per_min = $this->_player->gold_per_min;
		$this->xp_per_min = $this->_player->xp_per_min;
	}

	private function getPlayerPersonaName($account_id) {
		if ($account_id == self::ANONYMOUS) {
			return 'Anonymous';
		} else {
			return $this->_persona_names[self::convertId($account_id)];
		}
	}

	public static function convertId($id) {
		if (strlen($id) === 17) {
			$converted = substr($id, 3) - 61197960265728;
		} else {
			$converted = '765'.($id + 61197960265728);
		}
		return (string) $converted;
	}

	private function setDataItems() {
		for ($i = 0; $i < 6; $i++) {
			if ($this->_player->{'item_' . $i} != 0) {
				$this->{'item_' . ($i + 1)} = $this->_player->{'item_' . $i};
			} else {
				$this->{'item_' . ($i + 1)} = '';
			}
		}
		// burr items
		if ($this->_player->hero_id == 80) {
			for ($i = 0; $i < 6; $i++) {
				if ($this->_player->additional_units[0]->{'item_' . $i} != 0) {
					$this->{'bearitem_' . ($i + 1)} = $this->_player->additional_units[0]->{'item_' . $i};
				} else {
					$this->{'bearitem_' . ($i + 1)} = '';
				}
			}
		}
	}
}