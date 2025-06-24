$( () => {
	function sortNumber( a, b ) {
		return a - b;
	}

	function dialogHtml( matchIDs ) {
		const h = mw.html,
			length = matchIDs.length;
		let output = '';

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
		for ( let i = 0; i < matchIDs.length; i++ ) {
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
		output += '<input type="checkbox" id="dota2db-dialog-match2-output" name="dota2db-dialog-match2-output" checked>';
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
		Object.assign( configuration, {
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
		const winningFaction = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'winningFaction' ),
			matchID = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'matchid' ),
			winningTeamName = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .' + winningFaction + '-side' ).text();
		let team1Side, team2Side,
			team1Picks, team2Picks,
			team1Bans, team2Bans;
		let text = '';
		const winningTeam = winningTeamName === params.team1 ? 1 : 2;

		const radiantPicks = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'radiantPicks' );
		const direPicks = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'direPicks' );
		const radiantBans = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'radiantBans' );
		const direBans = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'direBans' );

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

	function processMatchForBracketDetails( vars, i ) {
		// jQuery variables
		const $status = $( '#insert-bracket-match-details-dialog .dota2webapi-result td.status:eq(' + i + ')' ),
			$radiantTeam = $( '#insert-bracket-match-details-dialog .dota2webapi-result td.radiant-team:eq(' + i + ')' ),
			$direTeam = $( '#insert-bracket-match-details-dialog .dota2webapi-result td.dire-team:eq(' + i + ')' ),
			$matchData = $( '#insert-bracket-match-details-dialog .dota2webapi-result td.match-data:eq(' + i + ')' );
		$matchData.data( 'matchid', vars.matchIDs[ i ] );
		$status.text( 'In progress...' )
			.addClass( 'loading' );

		$.ajax( {
			url: mw.util.wikiScript( 'api' ),
			dataType: 'json',
			type: 'POST',
			data: {
				action: 'dota2dbapi',
				matchid: vars.matchIDs[ i ],
				pagename: mw.config.get( 'wgPageName' ),
				format: 'json'
			}
		} )
			.done( ( data ) => {
				if ( data.error !== undefined || data.dota2dbapi.error !== undefined ) {
					$status.text( data.error.info || data.dota2dbapi.error );
					$status.removeClass( 'loading' );
					return;
				}

				let radiantPicks, direPicks,
					radiantBans, direBans,
					end = '';

				const result = data.dota2dbapi;
				let radiant = 'team1';
				let dire = 'team2';
				if ( result.team1.side === 'dire' ) {
					dire = 'team1';
					radiant = 'team2';
				}
				const teamDire = result[ dire ].name;
				const teamRadiant = result[ radiant ].name;
				if ( Object.keys( result.heroVeto ).length !== 0 ) {
					radiantPicks = '';
					for ( let j = 0; j < 5; ++j ) {
						radiantPicks += `|t{r}h${ j + 1 }=`;
						radiantPicks += result.heroVeto[ radiant ].picks[ j ].hero.toLowerCase();
					}
					radiantPicks += '\n';

					radiantBans = '';
					for ( let j = 0; j < 7; ++j ) {
						radiantBans += `|t{r}b${ j + 1 }=`;
						radiantBans += result.heroVeto[ radiant ].bans[ j ].hero.toLowerCase();

					}
					radiantBans += '\n';

					direPicks = '';
					for ( let j = 0; j < 5; ++j ) {
						direPicks += `|t{d}h${ j + 1 }=`;
						direPicks += result.heroVeto[ dire ].picks[ j ].hero.toLowerCase();
					}
					direPicks += '\n';

					direBans = '';
					for ( let j = 0; j < 7; ++j ) {
						direBans += `|t{d}b${ j + 1 }=`;
						direBans += result.heroVeto[ dire ].bans[ j ].hero.toLowerCase();
					}
					direBans += '\n';
				} else {
					radiantPicks = '|t{r}h1= |t{r}h2= |t{r}h3= |t{r}h4= |t{r}h5=\n';
					direPicks = '|t{d}h1= |t{d}h2= |t{d}h3= |t{d}h4= |t{d}h5=\n';
					radiantBans = '|t{r}b1= |t{r}b2= |t{r}b3= |t{r}b4= |t{r}b5= |t{r}b6= |t{r}b7=\n';
					direBans = '|t{d}b1= |t{d}b2= |t{d}b3= |t{d}b4= |t{d}b5= |t{d}b6= |t{d}b7=\n';
				}

				end += '|length=';
				end += result.length;
				end += ' ';
				end += '|win={w}';
				end += '\n';
				end += '}}\n';
				vars.ok = true;
				vars.teams.push( {
					radiant: teamRadiant,
					dire: teamDire
				} );

				$radiantTeam.text( teamRadiant );
				$direTeam.text( teamDire );
				$radiantTeam.addClass( 'radiant-side' );
				$direTeam.addClass( 'dire-side' );
				if ( result.winner === 1 ) {
					$radiantTeam.addClass( 'winning-faction' );
					$matchData.data( 'winningFaction', result.team1.side );
				} else {
					$direTeam.addClass( 'winning-faction' );
					$matchData.data( 'winningFaction', result.team2.side );
				}
				$matchData.data( 'radiantPicks', radiantPicks );
				$matchData.data( 'direPicks', direPicks );
				$matchData.data( 'radiantBans', radiantBans );
				$matchData.data( 'direBans', direBans );
				$matchData.data( 'startTime', result.startTime );
				$matchData.data( 'wikitextEnd', end );

				$status.text( 'Success' );
				$status.removeClass( 'loading' );
			} )
			.fail( ( error ) => {
				$status.text( error.responseJSON.dota2dbapi.error );
			} )
			.always( () => {
				++i;

				if ( i < vars.matchIDs.length ) {
					processMatchForBracketDetails( vars, i );
				} else if ( vars.ok ) {
					const h = mw.html,
						sortedTeams = [ ],
						series = { };
					let $newTr,
						$matchTr,
						rowHtml = '';

					for ( let j = 0; j < vars.teams.length; j++ ) {
						const tmp = [ vars.teams[ j ].radiant, vars.teams[ j ].dire ];
						sortedTeams.push( tmp.sort() );
					}

					for ( let j = 0; j < sortedTeams.length; j++ ) {
						const team1 = sortedTeams[ j ][ 0 ],
							team2 = sortedTeams[ j ][ 1 ];
						if ( series[ team1 ] === undefined ) {
							series[ team1 ] = { };
						}
						if ( series[ team1 ][ team2 ] === undefined ) {
							series[ team1 ][ team2 ] = [ ];
						}
						series[ team1 ][ team2 ].push( j );
					}

					for ( const team1 in series ) {
						for ( const team2 in series[ team1 ] ) {
							$newTr = $( '<tr>' );
							rowHtml = h.element( 'td', { class: 'insert-selection' },
								new h.Raw( h.element( 'input', { type: 'radio', name: 'insert-selection', class: 'series-radio' } ) )
							) +
								h.element( 'td', { colspan: 2 }, 'Entire series' ) +
								h.element( 'td', { colspan: 3, class: 'series-title' },
									new h.Raw(
										h.element( 'span', { class: 'team1' }, team1 ) +
										h.element( 'div', { class: 'switch-teams', title: 'Switch team 1 / team 2' }, '' ) +
										h.element( 'span', { class: 'team2' }, team2 )
									)
								) +
								h.element( 'td', { class: 'match-data' }, series[ team1 ][ team2 ].join( ',' ) );
							$newTr.html( rowHtml )
								.addClass( 'teams' );
							$newTr.appendTo( $( '#insert-bracket-match-details-dialog .dota2webapi-result' ) );

							for ( let k = series[ team1 ][ team2 ].length - 1; k >= 0; --k ) {
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
		let i = 0, match2 = false;
		const matchIDsPars = [ ];
		const selection = context.$textarea.textSelection( 'getSelection' ).replace( /\s+$/, '' ).replace( /^\s+/, '' );

		if ( selection === '' ) {
			/* eslint-disable-next-line no-alert */
			alert( 'No match ID selected' );
			return;
		}

		const matchIDs = selection.split( /\r\n|\n| / );

		for ( i = 0; i < matchIDs.length; i++ ) {
			const matches = matchIDs[ i ].match( /\d{8,}/g );
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
				let wikitext, team1, team2,
					s, sStart = '', sMatchID = '', sEnd = ''; // , replaceText = '';
				let $checked = $( '#insert-bracket-match-details-dialog input[name="insert-selection"]:checked' );
				if ( $checked.length ) {
					$checked = $checked.first();
					wikitext = $checked.parent().siblings( '.match-data' ).text();
					if ( $checked.attr( 'class' ) === 'series-radio' ) {
						const matches = wikitext.split( ',' );
						const date = $( '#insert-bracket-match-details-dialog .dota2webapi-result .match-' + matches[ 0 ] + ' .match-data' ).data( 'startTime' );

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
							const processedGame = processGameForBracketDetails( {
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
						const processedGame = processGameForBracketDetails( {
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

		const vars = {
			matchIDs: matchIDsPars,
			ok: false,
			teams: [ ]
		};

		processMatchForBracketDetails( vars, 0 );
	}

	function processGameForFullDetails( params ) {
		const winningFaction = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'winningFaction' ),
			matchID = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'matchid' ),
			winningTeamName = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .' + winningFaction + '-side' ).text();
		let text = '';
		const winningTeam = winningTeamName === params.team1 ? 1 : 2;

		const radiantSide = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .radiant-team' ).text() === params.team1 ?
			'left' : 'right';

		const radiantScore = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'radiantScore' );
		const direScore = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'direScore' );
		const team1Score = radiantSide === 'left' ? radiantScore : direScore;
		const team2Score = radiantSide === 'left' ? direScore : radiantScore;

		const radiantPicks = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'radiantPicks' );
		const direPicks = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'direPicks' );
		const team1Picks = radiantSide === 'left' ? radiantPicks : direPicks;
		const team2Picks = radiantSide === 'left' ? direPicks : radiantPicks;

		const radiantBans = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'radiantBans' );
		const direBans = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'direBans' );
		const team1Bans = radiantSide === 'left' ? radiantBans : direBans;
		const team2Bans = radiantSide === 'left' ? direBans : radiantBans;

		const radiantRoster = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'radiantRoster' );
		const direRoster = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'direRoster' );
		const team1Roster = radiantSide === 'left' ? radiantRoster : direRoster;
		const team2Roster = radiantSide === 'left' ? direRoster : radiantRoster;

		text += '{{Match series game |radiant=' + radiantSide + '\n';
		text += '|team1=' + params.team1 + ' |team1Kills=' + team1Score + '\n';
		text += '|team2=' + params.team2 + ' |team2Kills=' + team2Score + '\n';
		text += '|winner=' + winningTeam + '}}\n';

		text += $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'wikitextStart' );
		text += '|team1Picks=' + team1Picks.map( ( hero ) => hero.hero ).join( ',' ) + '\n';
		text += '|team2Picks=' + team2Picks.map( ( hero ) => hero.hero ).join( ',' ) + '\n';
		text += '|team1Bans=' + team1Bans.map( ( hero ) => hero.hero ).join( ',' ) + '\n';
		text += '|team2Bans=' + team2Bans.map( ( hero ) => hero.hero ).join( ',' ) + '\n';
		text += '}}\n';
		text += $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'wikitextMiddle' );
		text += team1Roster;
		text += team2Roster;
		text += $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + params.row + ' .match-data' ).data( 'wikitextEnd' );

		return { winningTeam: winningTeam, matchID: matchID, text: text };
	}

	function processMatchForFullDetails( vars, i ) {
		// jQuery variables
		const $status = $( '#insert-full-match-details-dialog .dota2webapi-result td.status:eq(' + i + ')' ),
			$radiantTeam = $( '#insert-full-match-details-dialog .dota2webapi-result td.radiant-team:eq(' + i + ')' ),
			$direTeam = $( '#insert-full-match-details-dialog .dota2webapi-result td.dire-team:eq(' + i + ')' ),
			$matchData = $( '#insert-full-match-details-dialog .dota2webapi-result td.match-data:eq(' + i + ')' );
		$matchData.data( 'matchid', vars.matchIDs[ i ] );

		$status.text( 'In progress...' )
			.addClass( 'loading' );

		$.ajax( {
			url: mw.util.wikiScript( 'api' ),
			dataType: 'json',
			type: 'POST',
			data: {
				action: 'dota2dbapi',
				matchid: vars.matchIDs[ i ],
				pagename: mw.config.get( 'wgPageName' ),
				format: 'json'
			}
		} )
			.done( ( data ) => {
				if ( data.error !== undefined || data.dota2dbapi.error !== undefined ) {
					$status.text( data.error.info || data.dota2dbapi.error );
					$status.removeClass( 'loading' );
					return;
				}

				let end = '',
					start = '{{Match series stats start\n';
				const middle = '{{Match series scoreboard header}}\n';

				start += '|matchID=' + vars.matchIDs[ i ] + ' ';
				const result = data.dota2dbapi;
				let radiant = 'team1';
				let dire = 'team2';
				if ( result.team1.side === 'dire' ) {
					dire = 'team1';
					radiant = 'team2';
				}
				const teamDire = result[ dire ].name;
				const teamRadiant = result[ radiant ].name;
				start += '|VOD=';
				start += '\n';
				const radiantPicks = result.heroVeto[ radiant ].picks,
					direPicks = result.heroVeto[ dire ].picks,
					radiantBans = result.heroVeto[ radiant ].bans,
					direBans = result.heroVeto[ dire ].bans;
				const factions = { R: 'radiant', D: 'dire' };
				const factionRosters = { radiant: '', dire: '' };
				for ( const t in factions ) {
					const getTeam = ( factionKey ) => factionKey === 'R' ? radiant : dire;
					let factionRoster = '{{Match series faction|faction=' + factions[ t ] + '|kills=' + result[ getTeam( t ) + 'Score' ] + '}}\n';
					for ( let j = 0; j < 5; ++j ) {
						const player = result[ getTeam( t ) ].players[ j ];
						factionRoster += '{{Match series player|player=';
						factionRoster += player.name + ' ';
						factionRoster += '|hero=' + player.heroName + ' ';
						factionRoster += '|lvl=' + player.level;
						factionRoster += '|k=' + player.kills;
						factionRoster += '|d=' + player.deaths;
						factionRoster += '|a=' + player.assists;
						factionRoster += '|lh=' + player.lastHits;
						factionRoster += '|den=' + player.denies;
						factionRoster += '|gpm=' + player.goldPerMinute;
						factionRoster += '|xpm=' + player.xpPerMinute;
						factionRoster += '|items=' + player.items.map( ( item ) => item.name ).join( ',' );
						// @TODO LONE DRUID BEAR ITEMS
						factionRoster += '}}\n';
					}
					factionRosters[ factions[ t ] ] = factionRoster;
				}
				end += '{{Match series stats end}}\n';

				vars.ok = true;
				vars.teams.push( {
					radiant: teamRadiant,
					dire: teamDire
				} );

				$radiantTeam.text( teamRadiant );
				$direTeam.text( teamDire );
				$radiantTeam.addClass( 'radiant-side' );
				$direTeam.addClass( 'dire-side' );
				if ( result.winner === 1 ) {
					$radiantTeam.addClass( 'winning-faction' );
					$matchData.data( 'winningFaction', result.team1.side );
				} else {
					$direTeam.addClass( 'winning-faction' );
					$matchData.data( 'winningFaction', result.team2.side );
				}
				$matchData.data( 'radiantScore', result[ radiant + 'Score' ] );
				$matchData.data( 'direScore', result[ dire + 'Score' ] );
				$matchData.data( 'radiantPicks', radiantPicks );
				$matchData.data( 'direPicks', direPicks );
				$matchData.data( 'radiantBans', radiantBans );
				$matchData.data( 'direBans', direBans );
				$matchData.data( 'radiantRoster', factionRosters.radiant );
				$matchData.data( 'direRoster', factionRosters.dire );
				$matchData.data( 'startTime', result.startTime );
				$matchData.data( 'wikitextStart', start );
				$matchData.data( 'wikitextMiddle', middle );
				$matchData.data( 'wikitextEnd', end );
				$status.text( 'Success' );

				$status.removeClass( 'loading' );
			} )
			.fail( ( error ) => {
				$status.text( error.responseJSON.dota2dbapi.error );
			} )
			.always( () => {
				++i;

				if ( i < vars.matchIDs.length ) {
					processMatchForFullDetails( vars, i );
				} else if ( vars.ok ) {
					const h = mw.html,
						sortedTeams = [ ],
						series = { };
					let $newTr,
						$matchTr,
						rowHtml = '';

					for ( let j = 0; j < vars.teams.length; j++ ) {
						const tmp = [ vars.teams[ j ].radiant, vars.teams[ j ].dire ];
						sortedTeams.push( tmp.sort() );
					}

					for ( let j = 0; j < sortedTeams.length; j++ ) {
						const team1 = sortedTeams[ j ][ 0 ],
							team2 = sortedTeams[ j ][ 1 ];
						if ( series[ team1 ] === undefined ) {
							series[ team1 ] = { };
						}
						if ( series[ team1 ][ team2 ] === undefined ) {
							series[ team1 ][ team2 ] = [ ];
						}
						series[ team1 ][ team2 ].push( j );
					}

					for ( const team1 in series ) {
						for ( const team2 in series[ team1 ] ) {
							$newTr = $( '<tr>' );
							rowHtml = h.element( 'td', { class: 'insert-selection' },
								new h.Raw( h.element( 'input', { type: 'radio', name: 'insert-selection', class: 'series-radio' } ) )
							) +
								h.element( 'td', { colspan: 2 }, 'Entire series' ) +
								h.element( 'td', { colspan: 3, class: 'series-title' },
									new h.Raw(
										h.element( 'span', { class: 'team1' }, team1 ) +
										h.element( 'div', { class: 'switch-teams', title: 'Switch team 1 / team 2' }, '' ) +
										h.element( 'span', { class: 'team2' }, team2 )
									)
								) +
								h.element( 'td', { class: 'match-data' }, series[ team1 ][ team2 ].join( ',' ) );
							$newTr.html( rowHtml )
								.addClass( 'teams' );
							$newTr.appendTo( $( '#insert-full-match-details-dialog .dota2webapi-result' ) );

							for ( let j = series[ team1 ][ team2 ].length - 1; j >= 0; --j ) {
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
		const selection = context.$textarea.textSelection( 'getSelection' ).replace( /\s+$/, '' ).replace( /^\s+/, '' ),
			matchIDsPars = [ ];

		if ( selection === '' ) {
			/* eslint-disable-next-line no-alert */
			alert( 'No match ID selected' );
			return;
		}

		const matchIDs = selection.split( /\r\n|\n| / );

		for ( let i = 0; i < matchIDs.length; i++ ) {
			const matches = matchIDs[ i ].match( /\d{8,}/g );
			if ( matches !== null ) {
				matchIDsPars.push( matches[ 0 ] );
			}
		}
		matchIDsPars.sort( sortNumber );

		addInsertDialog( matchIDsPars, {
			title: 'Insert full match details',
			id: 'insert-full-match-details-dialog',
			insertCallback: function() {
				let wikitext, team1, team2,
					s, sStart = '', sEnd = ''; // , replaceText = '';
				let $checked = $( '#insert-full-match-details-dialog input[name="insert-selection"]:checked' );
				if ( $checked.length ) {
					$checked = $checked.first();
					wikitext = $checked.parent().siblings( '.match-data' ).text();
					if ( $checked.attr( 'class' ) === 'series-radio' ) {
						const matches = wikitext.split( ',' );
						const date = $( '#insert-full-match-details-dialog .dota2webapi-result .match-' + matches[ 0 ] + ' .match-data' ).data( 'startTime' );
						let team1Score = 0, team2Score = 0;

						team1 = $checked.parent().siblings( '.series-title' ).find( '.team1' ).text();
						team2 = $checked.parent().siblings( '.series-title' ).find( '.team2' ).text();

						for ( let i = 0; i < matches.length; ++i ) {
							const processedGame = processGameForFullDetails( {
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
						const processedGame = processGameForFullDetails( {
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

		const vars = {
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
		mw.loader.using( 'user.options', () => {
			if ( mw.user.options.get( 'usebetatoolbar' ) ) {
				mw.loader.using( 'ext.wikiEditor', () => {
					$( () => {
						addToToolbarInsertBracketMatchDetails();
						addToToolbarInsertFullMatchDetails();
					} );
				} );
			}
		} );
	}

	$( document ).on( 'click', '.dota2webapi-result .series-title .switch-teams', function() {
		const team1 = $( this ).siblings( '.team1' ).text(),
			team2 = $( this ).siblings( '.team2' ).text();
		$( this ).siblings( '.team1' ).text( team2 );
		$( this ).siblings( '.team2' ).text( team1 );
	} );

	$( document ).on( 'click', '.dota2webapi-result .match-row .switch-teams', function() {
		const team1 = $( this ).siblings( '.radiant-team' ).text(),
			team2 = $( this ).siblings( '.dire-team' ).text();
		$( this ).siblings( '.radiant-team' ).text( team2 );
		$( this ).siblings( '.dire-team' ).text( team1 );
		/* eslint-disable-next-line no-jquery/no-class-state */
		$( this ).siblings( '.radiant-team' ).toggleClass( 'radiant-side dire-side winning-faction' );
		/* eslint-disable-next-line no-jquery/no-class-state */
		$( this ).siblings( '.dire-team' ).toggleClass( 'radiant-side dire-side winning-faction' );
	} );
} );
