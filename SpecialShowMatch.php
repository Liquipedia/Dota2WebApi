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
		    $output->addHTML($this->sandboxParse( $this->generateWikicode($_result)) );
	    }

    }

    private function generateWikicode($result){
	    $wikicode = "<table class=\"wikitable collapsible collapsed matchseries-table-2\">
						<tr>
							<th colspan=4 class=\"date\">" . $result->start_time . "</th>
						</tr>
						{{Match series game |radiant=left"
		    ."|team1=" . $result->teams['radiant'] . "|team1Kills=" . $result->kills['radiant']
		    ."|team2=" . $result->teams['dire'] . "|team2Kills=" . $result->kills['dire']
		    ."|winner=" . (($result->radiant_win == true)? 1 : 2 ). "}}"
	        ."</table>";


	    return $wikicode;
    }

    private function sandboxParse($wikiText) {
	    global $wgTitle, $wgUser;
	    $myParser = new Parser();
	    $myParserOptions = ParserOptions::newFromUser($wgUser);
	    $result = $myParser->parse($wikiText, $wgTitle, $myParserOptions);
	    return $result->getText();
    }
}