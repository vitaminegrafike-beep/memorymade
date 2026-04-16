/* ═══════════════════════════════════════════════
   MEMORYMADE — Configuration
   ═══════════════════════════════════════════════ */

const CONFIG = {
    gameDuration:    120,                   // seconds (2 minutes)
    warnAt:          40,                    // timer turns yellow
    dangerAt:        15,                    // timer turns red + pulses
    flipBackDelay:   700,                   // ms before wrong cards flip back
    sessionKey:      'memorymadeResult',
    playerKey:       'memorymadePlayer',
    leaderboardKey:  'memorymadeLeaderboard',
    maxLeaderboard:  50,                    // max stored entries
};

/* All colleagues — all 24 are used each game (48 cards total) */
const COLLEAGUES = [
    { id: 'alessio',     file: 'Alessio.jpg',     name: 'Alessio'     },
    { id: 'anita',       file: 'Anita.jpg',        name: 'Anita'       },
    { id: 'barbara',     file: 'Barbara.jpg',      name: 'Barbara'     },
    { id: 'bianca',      file: 'Bianca.jpg',       name: 'Bianca'      },
    { id: 'chiara',      file: 'chiara.jpg',       name: 'Chiara'      },
    { id: 'chiara2',     file: 'Chiara_2.jpg',     name: 'Chiara 2'    },
    { id: 'cinzia',      file: 'Cinzia.jpg',       name: 'Cinzia'      },
    { id: 'consuelo',    file: 'Consuelo.jpg',     name: 'Consuelo'    },
    { id: 'daniele',     file: 'Daniele.jpg',      name: 'Daniele'     },
    { id: 'eleonora',    file: 'Eleonora.jpg',     name: 'Eleonora'    },
    { id: 'francesca',   file: 'Francesca.jpg',    name: 'Francesca'   },
    { id: 'gianfilippo', file: 'Gianfilippo.jpg',  name: 'Gianfilippo' },
    { id: 'gianluca',    file: 'Gianluca.jpg',     name: 'Gianluca'    },
    { id: 'gianni',      file: 'Gianni.jpg',       name: 'Gianni'      },
    { id: 'gloria',      file: 'Gloria.jpg',       name: 'Gloria'      },
    { id: 'ilaria',      file: 'Ilaria.jpg',       name: 'Ilaria'      },
    { id: 'leyla',       file: 'Leyla.jpg',        name: 'Leyla'       },
    { id: 'martina',     file: 'Martina.jpg',      name: 'Martina'     },
    { id: 'massimo',     file: 'Massimo.jpg',      name: 'Massimo'     },
    { id: 'mattia',      file: 'Mattia.jpg',       name: 'Mattia'      },
    { id: 'nadia',       file: 'Nadia.jpg',        name: 'Nadia'       },
    { id: 'renato',      file: 'Renato.jpg',       name: 'Renato'      },
    { id: 'tommaso',     file: 'Tommaso.jpg',      name: 'Tommaso'     },
    { id: 'william',     file: 'William.jpg',      name: 'William'     },
];
