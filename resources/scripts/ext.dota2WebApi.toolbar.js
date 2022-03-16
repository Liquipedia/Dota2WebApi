$( function() {
	/* eslint-disable block-scoped-var */
	function sortNumber( a, b ) {
		return a - b;
	}

	function dialogHtml( matchIDs ) {
		var h = mw.html,
			length = matchIDs.length,
			output = '';

		output += mw.message( 'dota2webapi-detected-matchid-number', length ).text();
		if ( length > 5 ) {
			output += ' Only the first 5 match IDs will be processed.';
			matchIDs = matchIDs.slice( 0, 5 );
		}

		output += '<table class="dota2webapi-result">';
		output += '<tr>';
		output += '<th class="insert-selection"></th>';
		output += '<th class="match-id">Match ID</th>';
		output += '<th class="status">Status</th>';
		output += '<th class="radiant-team">Team 1</th>';
		output += '<th class="switch-teams"></th>';
		output += '<th class="dire-team">Team 2</th>';
		output += '<th class="match-data">Match data</th>';
		output += '</tr>';
		for ( var i = 0; i < matchIDs.length; i++ ) {
			output += h.element( 'tr', { class: 'match-row match-' + parseInt( i ) },
				new h.Raw(
					h.element( 'td', { class: 'insert-selection' },
						new h.Raw( h.element( 'input', { type: 'radio', name: 'insert-selection', class: 'match-radio', rel: i } ) )
					) +
					h.element( 'td', { class: 'match-id' }, String( matchIDs[ i ] ) ) +
					h.element( 'td', { class: 'status' }, 'Waiting...' ) +
					h.element( 'td', { class: 'radiant-team' }, '-' ) +
					h.element( 'td', { class: 'switch-teams', title: 'Switch team 1 / team 2' } ) +
					h.element( 'td', { class: 'dire-team' }, '-' ) +
					h.element( 'td', { class: 'match-data' }, '' )
				)
			);
		}
		output += '</table><br>';
		output += '<input type="checkbox" id="dota2db-dialog-match2-output" name="dota2db-dialog-match2-output">';
		output += '<label for="dota2db-dialog-match2-output">' + mw.message( 'dota2db-dialog-match2-output' ).text() + '</label><br>';

		return output;
	}

	function createDialogElement( dialogId ) {
		if ( $( '#' + dialogId ).length === 0 ) {
			$( '<div>' )
				.attr( 'id', dialogId )
				.appendTo( $( 'body' ) );
		}
	}

	function addInsertDialog( matchIDs, configuration ) {
		$.extend( configuration, {
			width: '700px',
			modal: true,
			buttons: [
				{
					text: 'Insert',
					click: configuration.insertCallback
				},
				{
					text: 'Cancel',
					click: function() {
						$( this ).dialog( 'close' );
					}
				}
			]
		} );

		createDialogElement( configuration.id );

		$( '#' + configuration.id )
			.html( dialogHtml( matchIDs ) );
		$( '#' + configuration.id ).dialog( configuration );
		$( '#' + configuration.id + ' .dota2webapi-result tr:even' ).addClass( 'even' );
		$( '#' + configuration.id + ' .dota2webapi-result tr:odd' ).addClass( 'odd' );
	}

	function processGameForBracketDetails( params, match2 ) {
		var winningFaction = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'winningFaction' ),
			matchID = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'matchid' ),
			winningTeamName = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .' + winningFaction + '-side' ).text(),
			winningTeam,
			team1Side, team2Side,
			team1Picks, team2Picks,
			team1Bans, team2Bans;
		var text = '';
		winningTeam = winningTeamName === params.team1 ? 1 : 2;

		var radiantPicks = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'radiantPicks' );
		var direPicks = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'direPicks' );
		var radiantBans = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'radiantBans' );
		var direBans = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'direBans' );

		if ( $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .radiant-side' ).text() === params.team1 ) {
			team1Side = 'radiant';
			team2Side = 'dire';
			team1Picks = radiantPicks.replace( /\{r\}/g, 1 );
			team2Picks = direPicks.replace( /\{d\}/g, 2 );
			team1Bans = radiantBans.replace( /\{r\}/g, 1 );
			team2Bans = direBans.replace( /\{d\}/g, 2 );
		} else {
			team1Side = 'dire';
			team2Side = 'radiant';
			team1Picks = direPicks.replace( /\{d\}/g, 1 );
			team2Picks = radiantPicks.replace( /\{r\}/g, 2 );
			team1Bans = direBans.replace( /\{d\}/g, 1 );
			team2Bans = radiantBans.replace( /\{r\}/g, 2 );
		}

		if ( match2 ) {
			text += '|map' + params.matchIndex + '={{Map\n';
		} else {
			text += '|match' + params.matchIndex + '={{Match\n';
		}

		text += '|team1side=' + team1Side + '\n';
		text += team1Picks;
		text += team1Bans;
		text += '|team2side=' + team2Side + '\n';
		text += team2Picks;
		text += team2Bans;
		if ( match2 ) {
			text += $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' )
				.data( 'wikitextEnd' ).replace( 'win', 'winner' ).replace( '{w}', winningTeam );
		} else {
			text += $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' )
				.data( 'wikitextEnd' ).replace( '{w}', winningTeam );
		}

		return { winningTeam: winningTeam, matchID: matchID, text: text };
	}

	function getHeroesData() {
		var data = JSON.parse( mw.message( 'dota2webapi-heroes.json' ).plain() ).heroes,
			heroes = { };
		for ( var i = 0; i < data.length; ++i ) {
			heroes[ data[ i ].id ] = data[ i ].localized_name.replace( '\'', '' );
		}
		return heroes;
	}

	function processMatchForBracketDetails( vars, i ) {
		// jQuery variables
		var $status = $( '#insert-bracket-match-details-dialog .dota2webapi-result td.status:eq(' + i + ')' ),
			$radiantTeam = $( '#insert-bracket-match-details-dialog .dota2webapi-result td.radiant-team:eq(' + i + ')' ),
			$direTeam = $( '#insert-bracket-match-details-dialog .dota2webapi-result td.dire-team:eq(' + i + ')' ),
			$matchData = $( '#insert-bracket-match-details-dialog .dota2webapi-result td.match-data:eq(' + i + ')' ),
			heroes = getHeroesData();
		$matchData.data( 'matchid', vars.matchIDs[ i ] );

		$status.text( 'In progress...' )
			.addClass( 'loading' );

		$.ajax( {
			url: mw.util.wikiScript( 'api' ),
			dataType: 'json',
			data: {
				action: 'dota2dbapi',
				matchid: vars.matchIDs[ i ],
				data: 'picks_bans|duration|radiant_win|teams|start_time',
				pagename: mw.config.get( 'wgPageName' ),
				format: 'json'
			}
		} )
			.done( function( data ) {
				var radiantPicks, direPicks,
					radiantBans, direBans,
					end = '';

				if ( data.dota2dbapi.isresult ) {
					var result = data.dota2dbapi.result;

					if ( result.picks_bans.radiant.pick_1 !== undefined ) {
						radiantPicks = '';
						var heroId;
						for ( var j = 1; j <= 5; ++j ) {
							radiantPicks += '|t{r}h' + j + '=';
							if ( ( heroId = result.picks_bans.radiant[ 'pick_' + j ] ) !== null ) {
								if ( heroes[ heroId ] !== undefined ) {
									radiantPicks += heroes[ heroId ].toLowerCase();
								}
							}
						}
						radiantPicks += '\n';

						radiantBans = '';
						for ( var j = 1; j <= 7; ++j ) {
							radiantBans += '|t{r}b' + j + '=';
							if ( ( heroId = result.picks_bans.radiant[ 'ban_' + j ] ) !== null ) {
								if ( heroes[ heroId ] !== undefined ) {
									radiantBans += heroes[ heroId ].toLowerCase();
								}
							}
						}
						radiantBans += '\n';

						direPicks = '';
						for ( var j = 1; j <= 5; ++j ) {
							direPicks += '|t{d}h' + j + '=';
							if ( ( heroId = result.picks_bans.dire[ 'pick_' + j ] ) !== null ) {
								if ( heroes[ heroId ] !== undefined ) {
									direPicks += heroes[ heroId ].toLowerCase();
								}
							}
						}
						direPicks += '\n';

						direBans = '';
						for ( var j = 1; j <= 7; ++j ) {
							direBans += '|t{d}b' + j + '=';
							if ( ( heroId = result.picks_bans.dire[ 'ban_' + j ] ) !== null ) {
								if ( heroes[ heroId ] !== undefined ) {
									direBans += heroes[ heroId ].toLowerCase();
								}
							}
						}
						direBans += '\n';
					} else {
						radiantPicks = '|t{r}h1= |t{r}h2= |t{r}h3= |t{r}h4= |t{r}h5=\n';
						direPicks = '|t{d}h1= |t{d}h2= |t{d}h3= |t{d}h4= |t{d}h5=\n';
						radiantBans = '|t{r}b1= |t{r}b2= |t{r}b3= |t{r}b4= |t{r}b5= |t{r}b6= |t{r}b7=\n';
						direBans = '|t{d}b1= |t{d}b2= |t{d}b3= |t{d}b4= |t{d}b5= |t{d}b6= |t{d}b7=\n';
					}

					end += '|length=';
					end += result.duration;
					end += ' ';
					end += '|win={w}';
					end += '\n';
					end += '}}\n';

					vars.ok = true;
					vars.teams.push( {
						radiant: result.teams.radiant,
						dire: result.teams.dire
					} );

					$radiantTeam.text( result.teams.radiant );
					$direTeam.text( result.teams.dire );
					$radiantTeam.addClass( 'radiant-side' );
					$direTeam.addClass( 'dire-side' );
					if ( result.radiant_win !== undefined ) {
						$radiantTeam.addClass( 'winning-faction' );
						$matchData.data( 'winningFaction', 'radiant' );
					} else {
						$direTeam.addClass( 'winning-faction' );
						$matchData.data( 'winningFaction', 'dire' );
					}
					$matchData.data( 'radiantPicks', radiantPicks );
					$matchData.data( 'direPicks', direPicks );
					$matchData.data( 'radiantBans', radiantBans );
					$matchData.data( 'direBans', direBans );
					$matchData.data( 'startTime', result.start_time );
					$matchData.data( 'wikitextEnd', end );
					$status.text( 'Success' );
				} else {
					$status.text( data.dota2dbapi.result.error );
				}

				$status.removeClass( 'loading' );
			} )
			.fail( function( error ) {
				$status.text( error );
			} )
			.always( function() {
				++i;

				if ( i < vars.matchIDs.length ) {
					processMatchForBracketDetails( vars, i );
				} else if ( vars.ok ) {
					var h = mw.html,
						sortedTeams = [ ],
						series = { },
						$newTr,
						$matchTr,
						rowHtml = '';

					for ( var j = 0; j < vars.teams.length; j++ ) {
						var tmp = [ vars.teams[ j ].radiant, vars.teams[ j ].dire ];
						sortedTeams.push( tmp.sort() );
					}

					for ( var j = 0; j < sortedTeams.length; j++ ) {
						var team1 = sortedTeams[ j ][ 0 ],
							team2 = sortedTeams[ j ][ 1 ];
						if ( series[ team1 ] === undefined ) {
							series[ team1 ] = { };
						}
						if ( series[ team1 ][ team2 ] === undefined ) {
							series[ team1 ][ team2 ] = [ ];
						}
						series[ team1 ][ team2 ].push( j );
					}

					for ( var team1 in series ) {
						for ( var team2 in series[ team1 ] ) {
							$newTr = $( '<tr>' );
							rowHtml = h.element( 'td', { class: 'insert-selection' },
								new h.Raw( h.element( 'input', { type: 'radio', name: 'insert-selection', class: 'series-radio' } ) )
							) +
								h.element( 'td', { colspan: 2 }, 'Entire series' ) +
								h.element( 'td', { colspan: 3, class: 'series-title' },
									new h.Raw(
										h.element( 'span', { class: 'team1' }, team1 ) +
										h.element( 'div', { class: 'switch-teams', title: 'Switch team 1 / team 2' } ) +
										h.element( 'span', { class: 'team2' }, team2 )
									)
								) +
								h.element( 'td', { class: 'match-data' }, series[ team1 ][ team2 ].join( ',' ) );
							$newTr.html( rowHtml )
								.addClass( 'teams' );
							$newTr.appendTo( $( '#insert-bracket-match-details-dialog .dota2webapi-result' ) );

							for ( var k = series[ team1 ][ team2 ].length - 1; k >= 0; --k ) {
								$matchTr = $( '#insert-bracket-match-details-dialog tr.match-' + series[ team1 ][ team2 ][ k ] );
								$matchTr.detach();
								$newTr.after( $matchTr );
							}
						}
					}
					$( '#insert-bracket-match-details-dialog input[name="insert-selection"]' ).first().attr( 'checked', 'checked' );
				}
			} );
	}

	// Bracket
	function insertBracketMatchDetails( context ) {
		var selection,
			matchIDs,
			matchIDsPars = [ ],
			vars, i = 0, match2 = false;
		selection = context.$textarea.textSelection( 'getSelection' ).replace( /\s+$/, '' ).replace( /^\s+/, '' );

		if ( selection === '' ) {
			/* eslint-disable-next-line no-alert */
			alert( 'No match ID selected' );
			return;
		}

		matchIDs = selection.split( /\r\n|\n| / );

		for ( i = 0; i < matchIDs.length; i++ ) {
			var matches = matchIDs[ i ].match( /\d{8,}/g );
			if ( matches !== null ) {
				matchIDsPars.push( matches[ 0 ] );
			}
		}
		matchIDsPars.sort( sortNumber );

		addInsertDialog( matchIDsPars, {
			title: 'Insert bracket match details',
			id: 'insert-bracket-match-details-dialog',
			insertCallback: function() {
				if ( $( '#dota2db-dialog-match2-output' ).is( ':checked' ) ) {
					match2 = true;
				}
				var wikitext, team1, team2,
					s, sStart = '', sMatchID = '', sEnd = ''; // , replaceText = '';
				var $checked = $( '#insert-bracket-match-details-dialog input[name="insert-selection"]:checked' );
				if ( $checked.length ) {
					$checked = $checked.first();
					wikitext = $checked.parent().siblings( '.match-data' ).text();
					if ( $checked.attr( 'class' ) === 'series-radio' ) {
						matches = wikitext.split( ',' );
						var date = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + matches[ 0 ] + ' .match-data' ).data( 'startTime' );

						team1 = $checked.parent().siblings( '.series-title' ).find( '.team1' ).text();
						team2 = $checked.parent().siblings( '.series-title' ).find( '.team2' ).text();

						if ( !match2 ) {
							sStart = '{{BracketMatchSummary\n';
						} else {
							sStart = '';
						}
						sStart += '|date=';
						sStart += date;
						sStart += '\n';
						sStart += '|finished=true';
						sStart += '\n';

						for ( i = 0; i < matches.length; ++i ) {
							var processedGame = processGameForBracketDetails( {
								team1: team1,
								team2: team2,
								matchIndex: i + 1,
								row: matches[ i ]
							}, match2 );

							// replaceText += processedGame.matchID + '\n';

							sStart += '|vodgame' + ( i + 1 ) + '=\n';
							sMatchID += '|matchid' + ( i + 1 ) + '=' + matchIDsPars[ i ] + '\n';
							sEnd += processedGame.text;
						}

						if ( !match2 ) {
							sEnd += '}}';
						} else {
							sEnd = String( sEnd );
						}

						s = sStart + sMatchID + sEnd;
					} else if ( $checked.attr( 'class' ) === 'match-radio' ) {
						team1 = $checked.parent().siblings( '.radiant-team' ).text();
						team2 = $checked.parent().siblings( '.dire-team' ).text();
						var processedGame = processGameForBracketDetails( {
							team1: team1,
							team2: team2,
							matchIndex: 1,
							row: $checked.attr( 'rel' )
						}, match2 );
						s = processedGame.text;
						// replaceText += processedGame.matchID + '\n';
					}
				}
				$.wikiEditor.modules.toolbar.fn.doAction(
					context,
					{
						type: 'replace',
						options: {
							peri: s
						}
					},
					$( this )
				);
				$( this ).dialog( 'close' );
			}
		} );

		vars = {
			matchIDs: matchIDsPars,
			ok: false,
			teams: [ ]
		};

		processMatchForBracketDetails( vars, 0 );
	}

	function processGameForFullDetails( params ) {
		var winningFaction = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'winningFaction' ),
			matchID = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'matchid' ),
			winningTeamName = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .' + winningFaction + '-side' ).text(),
			winningTeam,
			radiantScore, direScore,
			radiantPicks, direPicks,
			radiantBans, direBans,
			radiantRoster, direRoster,
			team1Score, team2Score,
			team1Picks, team2Picks,
			team1Bans, team2Bans,
			team1Roster, team2Roster,
			radiantSide,
			text = '';
		winningTeam = winningTeamName === params.team1 ? 1 : 2;

		radiantSide = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .radiant-team' ).text() === params.team1 ?
			'left' : 'right';

		radiantScore = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'radiantScore' );
		direScore = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'direScore' );
		team1Score = radiantSide === 'left' ? radiantScore : direScore;
		team2Score = radiantSide === 'left' ? direScore : radiantScore;

		radiantPicks = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'radiantPicks' );
		direPicks = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'direPicks' );
		team1Picks = radiantSide === 'left' ? radiantPicks : direPicks;
		team2Picks = radiantSide === 'left' ? direPicks : radiantPicks;

		radiantBans = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'radiantBans' );
		direBans = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'direBans' );
		team1Bans = radiantSide === 'left' ? radiantBans : direBans;
		team2Bans = radiantSide === 'left' ? direBans : radiantBans;

		radiantRoster = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'radiantRoster' );
		direRoster = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'direRoster' );
		team1Roster = radiantSide === 'left' ? radiantRoster : direRoster;
		team2Roster = radiantSide === 'left' ? direRoster : radiantRoster;

		text += '{{Match series game |radiant=' + radiantSide + '\n';
		text += '|team1=' + params.team1 + ' |team1Kills=' + team1Score + '\n';
		text += '|team2=' + params.team2 + ' |team2Kills=' + team2Score + '\n';
		text += '|winner=' + winningTeam + '}}\n';

		text += $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'wikitextStart' );
		text += '|team1Picks=' + team1Picks.join( ',' ) + '\n';
		text += '|team2Picks=' + team2Picks.join( ',' ) + '\n';
		text += '|team1Bans=' + team1Bans.join( ',' ) + '\n';
		text += '|team2Bans=' + team2Bans.join( ',' ) + '\n';
		text += '}}\n';
		text += $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'wikitextMiddle' );
		text += team1Roster;
		text += team2Roster;
		text += $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'wikitextEnd' );

		return { winningTeam: winningTeam, matchID: matchID, text: text };
	}

	function getItemsData() {
		var data = JSON.parse( mw.message( 'dota2webapi-items.json' ).plain() ).items,
			itemName, items = { };
		for ( var i = 0; i < data.length; ++i ) {
			itemName = data[ i ].name.replace( '_', ' ' );
			if ( itemName.indexOf( 'recipe' ) === 0 ) {
				itemName = 'recipe';
			}
			items[ data[ i ].id ] = itemName;
		}

		items[ 18 ] = 'band of elvenskin';
		items[ 26 ] = 'morbid mask';
		items[ 106 ] = 'necro1';
		items[ 141 ] = 'daedalus';
		items[ 149 ] = 'crystalys';
		items[ 152 ] = 'shadow blade';
		items[ 185 ] = 'drums';
		items[ 193 ] = 'necro2';
		items[ 194 ] = 'necro3';
		items[ 196 ] = 'diffusal2';

		return items;
	}

	function processMatchForFullDetails( vars, i ) {
		// jQuery variables
		var $status = $( '#insert-full-match-details-dialog .dota2webapi-result td.status:eq(' + i + ')' ),
			$radiantTeam = $( '#insert-full-match-details-dialog .dota2webapi-result td.radiant-team:eq(' + i + ')' ),
			$direTeam = $( '#insert-full-match-details-dialog .dota2webapi-result td.dire-team:eq(' + i + ')' ),
			$matchData = $( '#insert-full-match-details-dialog .dota2webapi-result td.match-data:eq(' + i + ')' ),
			heroes = getHeroesData(),
			items = getItemsData();
		$matchData.data( 'matchid', vars.matchIDs[ i ] );

		$status.text( 'In progress...' )
			.addClass( 'loading' );

		$.ajax( {
			url: mw.util.wikiScript( 'api' ),
			dataType: 'json',
			data: {
				action: 'dota2dbapi',
				matchid: vars.matchIDs[ i ],
				data: 'picks_bans|kills_deaths|players|radiant_win|teams|start_time',
				pagename: mw.config.get( 'wgPageName' ),
				format: 'json'
			}
		} )
			.done( function( data ) {
				var radiantPicks, direPicks, radiantBans, direBans,
					start = '{{Match series stats start\n',
					middle = '{{Match series scoreboard header}}\n',
					end = '';

				start += '|matchID=' + vars.matchIDs[ i ] + ' ';
				if ( data.dota2dbapi.isresult ) {
					var result = data.dota2dbapi.result;

					start += '|VOD=';
					start += '\n';

					if ( result.picks_bans.radiant.pick_1 !== undefined ) {
						// radiantPicks = "{{MatchSeries/Picks";
						radiantPicks = [ ];
						var heroId;
						for ( var j = 1; j <= 5; ++j ) {
							if ( ( heroId = result.picks_bans.radiant[ 'pick_' + j ] ) !== null ) {
								radiantPicks.push( heroes[ heroId ] !== undefined ? heroes[ heroId ].toLowerCase() : '' );
							} else {
								radiantPicks.push( '' );
							}
						}
						// radiantPicks += "}}\n";

						// direPicks = "{{MatchSeries/Picks";
						direPicks = [ ];
						for ( var j = 1; j <= 5; ++j ) {
							if ( ( heroId = result.picks_bans.dire[ 'pick_' + j ] ) !== null ) {
								direPicks.push( heroes[ heroId ] !== undefined ? heroes[ heroId ].toLowerCase() : '' );
							} else {
								direPicks.push( '' );
							}
						}
						// direPicks += "}}\n";

						// radiantBans = "{{MatchSeries/Bans";
						radiantBans = [ ];
						for ( var j = 1; j <= 7; ++j ) {
							if ( ( heroId = result.picks_bans.radiant[ 'ban_' + j ] ) !== null ) {
								radiantBans.push( heroes[ heroId ] !== undefined ? heroes[ heroId ].toLowerCase() : '' );
							} else {
								radiantBans.push( '' );
							}
						}
						// radiantBans += "}}\n";

						// direBans = "{{MatchSeries/Bans";
						direBans = [ ];
						for ( var j = 1; j <= 7; ++j ) {
							if ( ( heroId = result.picks_bans.dire[ 'ban_' + j ] ) !== null ) {
								direBans.push( heroes[ heroId ] !== undefined ? heroes[ heroId ].toLowerCase() : '' );
							} else {
								direBans.push( '' );
							}
						}
						// direBans += "}}\n";
					} else {
						radiantPicks = [ '', '', '', '', '' ];
						direPicks = [ '', '', '', '', '' ];
						radiantBans = [ '', '', '', '', '', '' ];
						direBans = [ '', '', '', '', '', '' ];
					}

					// start += '|radiantKills=' + result.kills.radiant + ' ';
					// start += '|direKills=' + result.kills.dire + '\n';

					var factions = { R: 'radiant', D: 'dire' };
					var factionRosters = { radiant: '', dire: '' };
					for ( var t in factions ) {
						var factionRoster = '{{Match series faction|faction=' + factions[ t ] + '|kills=' + result.kills[ factions[ t ] ] + '}}\n';
						for ( var j = 1; j <= 5; ++j ) {
							var player = result.players[ factions[ t ] ][ 'player_' + j ];
							factionRoster += '{{Match series player|player=';
							factionRoster += player.name + ' ';
							factionRoster += '|hero=' + ( heroes[ player.hero ] !== undefined ? heroes[ player.hero ].toLowerCase() : '' ) + ' ';
							factionRoster += '|lvl=' + player.level;
							factionRoster += '|k=' + player.kills;
							factionRoster += '|d=' + player.deaths;
							factionRoster += '|a=' + player.assists;
							factionRoster += '|lh=' + player.last_hits;
							factionRoster += '|den=' + player.denies;
							factionRoster += '|gpm=' + player.gold_per_min;
							factionRoster += '|xpm=' + player.xp_per_min;
							factionRoster += '|items=';
							for ( var k = 1; k <= 6; ++k ) {
								if ( items[ player[ 'item_' + k ] ] !== undefined ) {
									factionRoster += items[ player[ 'item_' + k ] ];
								}
								if ( k < 6 ) {
									factionRoster += ',';
								}
							}
							if ( player.hero === 'Lone Druid' ) {
								factionRoster += '|bearitems=';
								for ( var k = 1; k <= 6; ++k ) {
									if ( items[ player[ 'bearitem_' + k ] ] !== undefined ) {
										factionRoster += items[ player[ 'bearitem_' + k ] ];
									}
									if ( k < 6 ) {
										factionRoster += ',';
									}
								}
							}
							factionRoster += '}}\n';
						}
						factionRosters[ factions[ t ] ] = factionRoster;
					}

					end += '{{Match series stats end}}\n';

					vars.ok = true;
					vars.teams.push( {
						radiant: result.teams.radiant,
						dire: result.teams.dire
					} );

					$radiantTeam.text( result.teams.radiant );
					$direTeam.text( result.teams.dire );
					$radiantTeam.addClass( 'radiant-side' );
					$direTeam.addClass( 'dire-side' );
					if ( result.radiant_win !== undefined ) {
						$radiantTeam.addClass( 'winning-faction' );
						$matchData.data( 'winningFaction', 'radiant' );
					} else {
						$direTeam.addClass( 'winning-faction' );
						$matchData.data( 'winningFaction', 'dire' );
					}
					$matchData.data( 'radiantScore', result.deaths.dire );
					$matchData.data( 'direScore', result.deaths.radiant );
					$matchData.data( 'radiantPicks', radiantPicks );
					$matchData.data( 'direPicks', direPicks );
					$matchData.data( 'radiantBans', radiantBans );
					$matchData.data( 'direBans', direBans );
					$matchData.data( 'radiantRoster', factionRosters.radiant );
					$matchData.data( 'direRoster', factionRosters.dire );
					$matchData.data( 'startTime', result.start_time );
					$matchData.data( 'wikitextStart', start );
					$matchData.data( 'wikitextMiddle', middle );
					$matchData.data( 'wikitextEnd', end );
					$status.text( 'Success' );
				} else {
					$status.text( data.dota2dbapi.result.error );
				}

				$status.removeClass( 'loading' );
			} )
			.fail( function( error ) {
				$status.text( error );
			} )
			.always( function() {
				++i;

				if ( i < vars.matchIDs.length ) {
					processMatchForFullDetails( vars, i );
				} else if ( vars.ok ) {
					var h = mw.html,
						sortedTeams = [ ],
						series = { },
						$newTr,
						$matchTr,
						rowHtml = '';

					for ( var j = 0; j < vars.teams.length; j++ ) {
						var tmp = [ vars.teams[ j ].radiant, vars.teams[ j ].dire ];
						sortedTeams.push( tmp.sort() );
					}

					for ( var j = 0; j < sortedTeams.length; j++ ) {
						var team1 = sortedTeams[ j ][ 0 ],
							team2 = sortedTeams[ j ][ 1 ];
						if ( series[ team1 ] === undefined ) {
							series[ team1 ] = { };
						}
						if ( series[ team1 ][ team2 ] === undefined ) {
							series[ team1 ][ team2 ] = [ ];
						}
						series[ team1 ][ team2 ].push( j );
					}

					for ( var team1 in series ) {
						for ( var team2 in series[ team1 ] ) {
							$newTr = $( '<tr>' );
							rowHtml = h.element( 'td', { class: 'insert-selection' },
								new h.Raw( h.element( 'input', { type: 'radio', name: 'insert-selection', class: 'series-radio' } ) )
							) +
								h.element( 'td', { colspan: 2 }, 'Entire series' ) +
								h.element( 'td', { colspan: 3, class: 'series-title' },
									new h.Raw(
										h.element( 'span', { class: 'team1' }, team1 ) +
										h.element( 'div', { class: 'switch-teams', title: 'Switch team 1 / team 2' } ) +
										h.element( 'span', { class: 'team2' }, team2 )
									)
								) +
								h.element( 'td', { class: 'match-data' }, series[ team1 ][ team2 ].join( ',' ) );
							$newTr.html( rowHtml )
								.addClass( 'teams' );
							$newTr.appendTo( $( '#insert-full-match-details-dialog .dota2webapi-result' ) );

							for ( var j = series[ team1 ][ team2 ].length - 1; j >= 0; --j ) {
								$matchTr = $( '#insert-full-match-details-dialog tr.match-' + series[ team1 ][ team2 ][ j ] );
								$matchTr.detach();
								$newTr.after( $matchTr );
							}
						}
					}
					$( '#insert-full-match-details-dialog input[name="insert-selection"]' ).first().attr( 'checked', 'checked' );
				}
			} );
	}

	function insertFullMatchDetails( context ) {
		var selection,
			matchIDs,
			matchIDsPars = [ ],
			vars, i = 0;
		selection = context.$textarea.textSelection( 'getSelection' ).replace( /\s+$/, '' ).replace( /^\s+/, '' );

		if ( selection === '' ) {
			/* eslint-disable-next-line no-alert */
			alert( 'No match ID selected' );
			return;
		}

		matchIDs = selection.split( /\r\n|\n| / );

		for ( i = 0; i < matchIDs.length; i++ ) {
			var matches = matchIDs[ i ].match( /\d{8,}/g );
			if ( matches !== null ) {
				matchIDsPars.push( matches[ 0 ] );
			}
		}
		matchIDsPars.sort( sortNumber );

		addInsertDialog( matchIDsPars, {
			title: 'Insert full match details',
			id: 'insert-full-match-details-dialog',
			insertCallback: function() {
				var wikitext, team1, team2,
					s, sStart = '', sEnd = ''; // , replaceText = '';
				var $checked = $( '#insert-full-match-details-dialog input[name="insert-selection"]:checked' );
				if ( $checked.length ) {
					$checked = $checked.first();
					wikitext = $checked.parent().siblings( '.match-data' ).text();
					if ( $checked.attr( 'class' ) === 'series-radio' ) {
						matches = wikitext.split( ',' );
						var date = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + matches[ 0 ] + ' .match-data' ).data( 'startTime' ),
							team1Score = 0, team2Score = 0;

						team1 = $checked.parent().siblings( '.series-title' ).find( '.team1' ).text();
						team2 = $checked.parent().siblings( '.series-title' ).find( '.team2' ).text();

						for ( i = 0; i < matches.length; ++i ) {
							var processedGame = processGameForFullDetails( {
								team1: team1,
								team2: team2,
								matchIndex: i + 1,
								row: matches[ i ]
							} );

							// replaceText += processedGame.matchID + '\n';

							sEnd += '\n' + processedGame.text;

							if ( processedGame.winningTeam === 1 ) {
								team1Score++;
							} else {
								team2Score++;
							}
						}

						sStart = '{{Match series start\n';
						sStart += '|team1=' + team1 + ' |team1score=' + team1Score + '\n';
						sStart += '|team2=' + team2 + ' |team2score=' + team2Score + '\n';
						sStart += '|date=' + date + '\n';
						sStart += '}}\n';
						sEnd += '{{Match series end}}\n';

						s = sStart + sEnd;
					} else if ( $checked.attr( 'class' ) === 'match-radio' ) {
						team1 = $checked.parent().siblings( '.radiant-team' ).text();
						team2 = $checked.parent().siblings( '.dire-team' ).text();
						var processedGame = processGameForFullDetails( {
							team1: team1,
							team2: team2,
							matchIndex: 1,
							row: $checked.attr( 'rel' )
						} );
						s = processedGame.text;
						// replaceText += processedGame.matchID + '\n';
					}
				}
				$.wikiEditor.modules.toolbar.fn.doAction(
					context,
					{
						type: 'replace',
						options: {
							peri: s
						}
					},
					$( this )
				);
				$( this ).dialog( 'close' );
			}
		} );

		vars = {
			matchIDs: matchIDsPars,
			ok: false,
			teams: [ ]
		};

		processMatchForFullDetails( vars, 0 );
	}

	function addToToolbarInsertBracketMatchDetails() {
		$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
			section: 'advanced',
			groups: {
				'insert-match-details': {
					type: 'toolbar',
					label: 'Match details'
				}
			}
		} );
		$( '.wikiEditor-ui-toolbar .group-insert' ).css( 'border-right', 'solid 1px #DDDDDD' );
		$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
			section: 'advanced',
			group: 'insert-match-details',
			tools: {
				'matchdetails-bracket': {
					label: 'Match details', // or use labelMsg for a localized label, see above
					type: 'button',
					icon: mw.config.get( 'wgDota2WebApiImagePath' ) + 'cog.svg',
					action: {
						type: 'callback',
						execute: function( context ) {
							insertBracketMatchDetails( context );
						}
					}
				}
			}
		} );
	}

	function addToToolbarInsertFullMatchDetails() {
		$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
			section: 'advanced',
			group: 'insert-match-details',
			tools: {
				'matchdetails-full': {
					label: 'Full match details', // or use labelMsg for a localized label, see above
					type: 'button',
					icon: mw.config.get( 'wgDota2WebApiImagePath' ) + 'cogs.svg',
					action: {
						type: 'callback',
						execute: function( context ) {
							insertFullMatchDetails( context );
						}
					}
				}
			}
		} );
	}

	/*
	 * Check if view is in edit mode and that the required
	 * modules are available. Then, customize the toolbar...
	 */
	if ( [ 'edit', 'submit' ].indexOf( mw.config.get( 'wgAction' ) ) !== -1 ) {
		mw.loader.using( 'user.options', function() {
			if ( mw.user.options.get( 'usebetatoolbar' ) ) {
				mw.loader.using( 'ext.wikiEditor', function() {
					$( function() {
						addToToolbarInsertBracketMatchDetails();
						addToToolbarInsertFullMatchDetails();
					} );
				} );
			}
		} );
	}

	$( document ).on( 'click', '.dota2webapi-result .series-title .switch-teams', function() {
		var team1 = $( this ).siblings( '.team1' ).text(),
			team2 = $( this ).siblings( '.team2' ).text();
		$( this ).siblings( '.team1' ).text( team2 );
		$( this ).siblings( '.team2' ).text( team1 );
	} );

	$( document ).on( 'click', '.dota2webapi-result .match-row .switch-teams', function() {
		var team1 = $( this ).siblings( '.radiant-team' ).text(),
			team2 = $( this ).siblings( '.dire-team' ).text();
		$( this ).siblings( '.radiant-team' ).text( team2 );
		$( this ).siblings( '.dire-team' ).text( team1 );
		/* eslint-disable-next-line no-jquery/no-class-state */
		$( this ).siblings( '.radiant-team' ).toggleClass( 'radiant-side dire-side winning-faction' );
		/* eslint-disable-next-line no-jquery/no-class-state */
		$( this ).siblings( '.dire-team' ).toggleClass( 'radiant-side dire-side winning-faction' );
	} );
} );
