/* ═══════════════════════════════════════════════
   MEMORYMADE — Configuration
   ═══════════════════════════════════════════════ */

const CONFIG = {
    gameDuration:    120,                   // seconds (2 minutes)
    warnAt:          40,                    // timer turns yellow
    dangerAt:        15,                    // timer turns red + pulses
    flipBackDelay:   1500,                  // ms before wrong cards flip back (longer = easier to memorize)
    pairsPerGame:    18,                    // 18 random pairs → 6×6 grid
    sessionKey:      'memorymadeResult',
    playerKey:       'memorymadePlayer',
    leaderboardKey:  'memorymadeLeaderboard',
    maxLeaderboard:  50,                    // max stored entries (localStorage fallback)

    /* ── Firebase Realtime Database ──────────────────────────────────
       Abilita la classifica condivisa in tempo reale su più dispositivi.
       1. Vai su https://console.firebase.google.com
       2. Crea un progetto → Realtime Database → crea database
       3. Nelle regole del database imposta:
              { "rules": { ".read": true, ".write": true } }
       4. Copia qui la configurazione del tuo progetto
       5. Metti  useFirebase: true
    ─────────────────────────────────────────────────────────────── */
    useFirebase: false,
    firebase: {
        apiKey:            "YOUR_API_KEY",
        authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
        databaseURL:       "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
        projectId:         "YOUR_PROJECT_ID",
        storageBucket:     "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId:             "YOUR_APP_ID",
    },
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
