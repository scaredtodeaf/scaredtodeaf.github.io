var SND_OBJ = new Audio(); // Audio Object
SND_OBJ.volume = 0.6;

// Load a Sound and play it.
function PLAY_SOUND(TRACK_ID, AUD_TYPE){
	var CCT_LNK = ''; // Concatenated Link to Load.
	if (SND_OBJ.paused == false){
		SND_OBJ.pause();
	};
	
	SND_OBJ.currentTime = 0; // Put the Current Time back to 0.

    if (AUD_TYPE == 0){
        CCT_LNK = CCT_LNK.concat('sounds/', TRACK_ID, '.wav'); // Concatenate the TRACK_ID into a Readable Link.
    } else if (AUD_TYPE == 1){
        CCT_LNK = CCT_LNK.concat('sounds/', TRACK_ID, '.mp3'); // Concatenate the TRACK_ID into a Readable Link.
    } else if (AUD_TYPE == 2){
        CCT_LNK = CCT_LNK.concat('sounds/', TRACK_ID, '.ogg'); // Concatenate the TRACK_ID into a Readable Link.
    };
	
	SND_OBJ.src = CCT_LNK; // Load that file into the Audio Object.
	SND_OBJ.load(); // Reload the Audio Object.
    SND_OBJ.play(); // Play the sound.
};

function RECEIVE_CALL(FILE_ID){
	// Copy to Clipboard still.
	 navigator.clipboard.writeText(FILE_ID);
	
	// The 7th Guest
	if (FILE_ID == '!FilmAt11'){
		PLAY_SOUND('7th Guest/FilmAt11', 2);
	} else if (FILE_ID == '!ObiWan'){
		PLAY_SOUND('7th Guest/ObiWan', 2);
	} else if (FILE_ID == '!StaufLaugh'){
		PLAY_SOUND('7th Guest/StaufLaugh', 2);
	} else if (FILE_ID == '!blocks'){
		PLAY_SOUND('7th Guest/blocks', 2);
	} else if (FILE_ID == '!chilli'){
		PLAY_SOUND('7th Guest/chilli', 2);
	} else if (FILE_ID == '!lobotomy'){
		PLAY_SOUND('7th Guest/lobotomy', 2);
	} else if (FILE_ID == '!looneytunes'){
		PLAY_SOUND('7th Guest/looneytunes', 2);
	} else if (FILE_ID == '!solitaire'){
		PLAY_SOUND('7th Guest/solitaire', 2);
	} else if (FILE_ID == '!lonely'){
		PLAY_SOUND('7th Guest/feeling-lonely', 2);
	};
	
    // Banjo-Kazooie
	if (FILE_ID == '!guhguh'){
		PLAY_SOUND('Banjo/Banjo \'GUH-HUH\' - Sound Effect', 2);
	} else if (FILE_ID == '!getjiggywithit'){
		PLAY_SOUND('Banjo/Collect Jiggy (Long, Unused) - Banjo-Kazooie Music', 2);
	};
	
	// Castlevania: Symphony of the Night
    if (FILE_ID == '!man'){
		PLAY_SOUND('CastleVania SOTN/Castlevania - SotN (Playstation) What is a man', 2);
	};
	
    // Daytona
    if (FILE_ID == '!daytona'){
		PLAY_SOUND('Daytona/DAYTONA', 2);
	};

	// Duke Nukem Series
    if (FILE_ID == '!chewgum'){
		PLAY_SOUND('DukeNukem/Duke Nukem Line - It\'s Time To Kick Ass And Chew Bubblegum', 2);
	} else if (FILE_ID == '!ripehead'){
		PLAY_SOUND('DukeNukem/I\'ll rip your head off and shit down your neck', 2);
	} else if (FILE_ID == '!youreugly'){
		PLAY_SOUND('DukeNukem/Damn you\'re ugly', 2);
	} else if (FILE_ID == '!pissmeoff'){
		PLAY_SOUND('DukeNukem/DUKE THIS REALLY PISSES ME OFF', 2);
	};
	
    // Kung Fu Panda
    if (FILE_ID == '!monke'){
		PLAY_SOUND('KungFuPanda/Mmm, Monkey...', 2);
	};

    // Mass Effect Series
    if (FILE_ID == '!favstore'){
		PLAY_SOUND('MassEffect/I\'m Commander Shepard, and this is my favorite store on the Citadel!', 2);
	};

    // Mario
    if (FILE_ID == '!mariogameover'){
		PLAY_SOUND('Mario/Super Mario Bros. Music - Lose a Life', 2);
	} else if (FILE_ID == '!ArentIDoneYet'){
		PLAY_SOUND('Mario/ArentIDoneYet', 2);
	} else if (FILE_ID == '!GameOver64'){
		PLAY_SOUND('Mario/GameOver', 2);
	} else if (FILE_ID == '!HereWeGo'){
		PLAY_SOUND('Mario/HereWeGo', 2);
	} else if (FILE_ID == '!TheHorror'){
		PLAY_SOUND('Mario/TheHorror', 2);
	};

    // Muppets
    if (FILE_ID == '!thankyou1'){
		PLAY_SOUND('Muppets/Fozie-Thank-You', 2);
	} else if (FILE_ID == '!yay'){
		PLAY_SOUND('Muppets/Yay! Kermit Arm Flail', 2);
	};

    // The Office
    if (FILE_ID == '!ohgod'){
		PLAY_SOUND('Office/OhGodNo', 2);
	} else if (FILE_ID == '!michael'){
		PLAY_SOUND('Office/Michael', 2);
	} else if (FILE_ID == '!parkour'){
		PLAY_SOUND('Office/Parkour', 2);
	} else if (FILE_ID == '!thankyou2'){
		PLAY_SOUND('Office/Thankyou', 2);
	} else if (FILE_ID == '!twss'){
		PLAY_SOUND('Office/ThatswhatSheSaid', 2);
	} else if (FILE_ID == '!ohmygod'){
		PLAY_SOUND('Office/Itshappening', 2);
	} else if (FILE_ID == '!identity'){
		PLAY_SOUND('Office/identitytheft', 2);
	};

    // Portal 1 & 2
    if (FILE_ID == '!smoothjazz'){
		PLAY_SOUND('Portal/PortalSmoothJazz', 2);
	} else if (FILE_ID == '!different'){
		PLAY_SOUND('Portal/ImDifferent', 2);
	} else if (FILE_ID == '!lemons'){
		PLAY_SOUND('Portal/Lemons', 2);
	} else if (FILE_ID == '!stillthere'){
		PLAY_SOUND('Portal/portal-turret-are-you-still-there_pGWToTI', 2);
	} else if (FILE_ID == '!thinking'){
		PLAY_SOUND('Portal/portal-thinking-with-portals', 2);
	} else if (FILE_ID == '!thankyou3'){
		PLAY_SOUND('Portal/turret-thankyou', 2);
	} else if (FILE_ID == '!youmonster'){
		PLAY_SOUND('Portal/you-monster', 2);
	};

    // Sega Rally
    if (FILE_ID == '!gameover'){
		PLAY_SOUND('SegaRalley/Game Over Yeah!', 2);
	};

    // Twitch Streamers
    if (FILE_ID == '!donkeyfucker'){
		PLAY_SOUND('TwitchStreamers/DonkeyFxcker', 2);
	} else if (FILE_ID == '!goregasm'){
		PLAY_SOUND('TwitchStreamers/MonoGoreGasm', 2);
	} else if (FILE_ID == '!depressedrussian'){
		PLAY_SOUND('TwitchStreamers/DepressedRussianMonolith', 2);
	} else if (FILE_ID == '!thatcunt'){
		PLAY_SOUND('TwitchStreamers/IsitThatCunt', 2);
	} else if (FILE_ID == '!dontlikeit'){
		PLAY_SOUND('TwitchStreamers/dontwatchit-online-audio-converter', 2);
	} else if (FILE_ID == '!button'){
		PLAY_SOUND('TwitchStreamers/button', 2);
	} else if (FILE_ID == '!weewoo'){
		PLAY_SOUND('WeeWooWee', 2);
	};

    // Random Sound Clips
    if (FILE_ID == '!traction'){
		PLAY_SOUND('Random/Shit, did you see that He must have a foot like a traction engine (Alan Partridge)', 2);
	} else if (FILE_ID == '!pacgameover'){
		PLAY_SOUND('Random/Pacman - Game Over Sound Effect (HD)', 2);
	} else if (FILE_ID == '!miixp'){
		PLAY_SOUND('Meme/MiiXP', 2);
	} else if (FILE_ID == '!sadtrom'){
		PLAY_SOUND('Meme/Sad Trombone - Gaming Sound Effect (HD)', 2);
	} else if (FILE_ID == '!nothingleft'){
		PLAY_SOUND('Random/IveGotNothingLeft', 2);
	} else if (FILE_ID == '!oof'){
		PLAY_SOUND('Meme/Roblox Death Sound - Sound Effect (HD)', 2);
	} else if (FILE_ID == '!wow'){
		PLAY_SOUND('Meme/Wow Owen Wilson Sound Effect (download)', 2);
	} else if (FILE_ID == '!exoticbutters'){
		PLAY_SOUND('Exotic Butters Sound Effect', 2);
	} else if (FILE_ID == '!MintyRage'){
		PLAY_SOUND('MintyRage', 2);
	};

    // YouTube
    if (FILE_ID == '!haiya'){
		PLAY_SOUND('Youtube/uncle roger Haiya', 2);
	} else if (FILE_ID == '!fuiyoh'){
		PLAY_SOUND('Youtube/Uncle Roger Explain HAIYAA vs FUIYOH (Animated Shorts)', 2);
	};

    // Zelda
	if (FILE_ID == '!excuseme'){
		PLAY_SOUND('Zelda-TV/[SFM] Well, excuse me, princess!', 2);
	} else if (FILE_ID == '!morshu'){
		PLAY_SOUND('Zelda-CDI/Lamp Oil, Rope, Bombs You Want It It\'s Yours My Friend As Long As You Have Enough Rubies', 2);
	} else if (FILE_ID == '!morshu2'){
		PLAY_SOUND('Zelda-CDI/ComeBack', 2);
	} else if (FILE_ID == '!good'){
		PLAY_SOUND('Zelda-CDI/hsbka3_640x360p_qvbr', 2);
	} else if (FILE_ID == '!light'){
		PLAY_SOUND('Zelda-CDI/You Dare Bring A Light To My Lair! You Must Die!!!', 2);
	} else if (FILE_ID == '!heylisten'){
		PLAY_SOUND('Zelda-CDI/zelda-navi-listen', 2);
	} else if (FILE_ID == '!ItemGet'){
		PLAY_SOUND('Zelda-CDI/ItemGet', 2);
	} else if (FILE_ID == '!uhoh'){
		PLAY_SOUND('Zelda-CDI/nfuqhi_640x360p_qvbr', 2);
	};
};

