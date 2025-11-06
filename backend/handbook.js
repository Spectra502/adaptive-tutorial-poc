{
  "Aktivierung": {
    "texts": [
      "Der Status der Automation wird durch das Automationssymbol im Display angezeigt. Erscheint das Symbol grau, ist das teilautomatisierte Fahren nicht verfügbar.",
      "Wenn das Automationssymbol weiß im Display aufleuchtet, ist das teilautomatisierte Fahren verfügbar. Bei Bedingungen, wie zum Beispiel schlechtem Wetter, kann es unter Umständen nicht verfügbar sein.",
      "Drücken Sie die Aktivierungstaste, um das teilautomatisierte Fahren zu aktivieren.",
      "Bei erfolgreicher Aktivierung, leuchtet das Automationssymbol grün im Display auf.",
      "Zudem leuchten die Lenkradlichter grün.",
      "Es sind nun alle Fahrerassistenzsysteme aktiv und das Fahrzeug fährt teilautomatisiert. Richten Sie Ihren Blick weiterhin auf die Straße und nehmen Sie die Füße von den Pedalen. Ihre Hände können Sie während der automatisierten Fahrt vom Lenkrad nehmen oder am Lenkrad belassen, ohne zu lenken."
    ],
    "media": [
      {
        "tag": "Aktivierung_Status_Grau",
        "path": "/HMI_GIFs/1neu1.gif",
        "description": "Zeigt das graue Automationssymbol im Display (teilautomatisiertes Fahren nicht verfügbar)."
      },
      {
        "tag": "Aktivierung_Status_Weiss",
        "path": "/HMI_GIFs/1neu2.gif",
        "description": "Zeigt das weiß leuchtende Automationssymbol im Display (teilautomatisiertes Fahren verfügbar)."
      },
      {
        "tag": "Aktivierung_Taste_Druecken",
        "path": "/HMI_GIFs/1-2.gif",
        "description": "Animation des Drückens der Aktivierungstaste am Lenkrad."
      },
      {
        "tag": "Aktivierung_Status_Gruen",
        "path": "/HMI_GIFs/1neu3.gif",
        "description": "Zeigt das grün leuchtende Automationssymbol im Display (erfolgreich aktiviert)."
      },
      {
        "tag": "Aktivierung_Lenkradlichter_Gruen",
        "path": "/HMI_GIFs/1-4.gif",
        "description": "Animation der grün leuchtenden Lenkradlichter."
      },
      {
        "tag": "Aktivierung_Fahrer_Blick",
        "path": "/HMI_GIFs/4-3.jpg",
        "description": "Fahrer blickt auf die Straße, während das Fahrzeug teilautomatisiert fährt."
      }
    ],
    "questions": [
      {
        "questionText": "Wie können Sie als Fahrer*in das teilautomatisierte Fahren aktivieren?",
        "possibleAnswers": [
          "Durch das Drücken des Bremspedals",
          "Durch das Drücken der Aktivierungstaste",
          "Durch das Loslassen des Lenkrads",
          "Durch einen Doppelklick auf die Set-Taste"
        ],
        "correctAnswerIndex": 1
      },
      {
        "questionText": "Leuchtet das Automationssymbol in weiß, ist das teilautomatisierte Fahren verfügbar.",
        "possibleAnswers": [
          "Richtig",
          "Falsch"
        ],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "In welcher Farbe leuchtet das Automationssymbol bei erfolgreicher Aktivierung des teilautomatisierten Fahrens?",
        "possibleAnswers": [
          "Blau",
          "Rot",
          "Gelb",
          "Grün"
        ],
        "correctAnswerIndex": 3
      }
    ]
  },
  "Verkehrszeichen": {
    "texts": [
      "Das Fahrzeug erkennt Tempolimits.",
      "Das erkannte Tempolimit wird im Display angezeigt. Bei einem neuen Tempolimit wird die erkannte Geschwindigkeit automatisch übernommen.",
      "Drücken Sie den Hebel nach oben oder unten, um die Geschwindigkeit individuell zu erhöhen (oben) oder zu verringern (unten)",
      "Ihre individuell eingestellte Geschwindigkeit wird im Display angezeigt."
    ],
    "media": [
      {
        "tag": "VZO_Erkennung",
        "path": "/HMI_GIFs/2neu1.gif",
        "description": "Fahrzeug nähert sich einem Tempolimit-Schild und erkennt dieses."
      },
      {
        "tag": "VZO_Anzeige_Uebernahme",
        "path": "/HMI_GIFs/2neu2.gif",
        "description": "Display zeigt das erkannte Tempolimit an; die Geschwindigkeit wird automatisch übernommen."
      },
      {
        "tag": "VZO_Manuelle_Anpassung_Hebel",
        "path": "/HMI_GIFs/2-4.gif",
        "description": "Animation des Hebels zur individuellen Erhöhung oder Verringerung der Geschwindigkeit."
      },
      {
        "tag": "VZO_Anzeige_Individuell",
        "path": "/HMI_GIFs/2neu3.gif",
        "description": "Display zeigt die individuell eingestellte Geschwindigkeit."
      }
    ],
    "questions": [
      {
        "questionText": "Bei einem neuen Tempolimit wird die erkannte Geschwindigkeit automatisch übernommen.",
        "possibleAnswers": [
          "Richtig",
          "Falsch"
        ],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Wo wird Ihnen als Fahrer*in das erkannte Tempolimit angezeigt?",
        "possibleAnswers": [
          "Im Seitenspiegel",
          "Im Display ",
          "Auf dem Lenkrad",
          "Im Rückspiegel"
        ],
        "correctAnswerIndex": 1
      },
      {
        "questionText": "Können Sie als Fahrer*in die Geschwindigkeit während der teilautomatisierten Fahrt (nach der Übernahme) manuell anpassen?",
        "possibleAnswers": [
          "Ja",
          "Nein"
        ],
        "correctAnswerIndex": 0
      }
    ]
  },
  "Abstand": {
    "texts": [
      "Das Fahrzeug hält den Abstand zum Vorderfahrzeug automatisch. Es bremst oder beschleunigt, falls nötig.",
      "Drücken Sie die Abstandstasten, um den Abstand zum Vorderfahrzeug individuell zu erhöhen (rechts) oder zu verringern (links).",
      "Der individuell eingestellte Abstand wird im Display symbolisch angezeigt. Die Striche vor dem Fahrzeug visualisieren den Abstand – je mehr Striche, desto größer der eingestellte Abstand."
    ],
    "media": [
      {
        "tag": "Abstand_Automatisch_Halten",
        "path": "/HMI_GIFs/3-2.gif",
        "description": "Animation, die zeigt, wie das Fahrzeug automatisch Abstand zum vorausfahrenden Fahrzeug hält (bremst/beschleunigt)."
      },
      {
        "tag": "Abstand_Manuelle_Anpassung_Tasten",
        "path": "/HMI_GIFs/3-3.gif",
        "description": "Animation der Abstandstasten am Lenkrad zur individuellen Einstellung des Abstands."
      },
      {
        "tag": "Abstand_Anzeige_Display",
        "path": "/HMI_GIFs/3neu1.gif",
        "description": "Display-Anzeige des symbolisch eingestellten Abstands (visualisiert durch Striche)."
      }
    ],
    "questions": [
      {
        "questionText": "Ist das teilautomatisierte Fahren aktiviert, hält das Fahrzeug automatisch den Abstand zum Vorderfahrzeug.",
        "possibleAnswers": [
          "Richtig",
          "Falsch"
        ],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Für Sie als Fahrer*in ist es nicht möglich, den Abstand zum Vorderfahrzeug individuell anzupassen.",
        "possibleAnswers": [
          "Richtig",
          "Falsch"
        ],
        "correctAnswerIndex": 1
      },
      {
        "questionText": "Wie wird der eingestellte Abstand zum Vorderfahrzeug im Display symbolisch dargestellt?",
        "possibleAnswers": [
          "Durch ein rotes Lenkrad",
          "Durch Blinken des Automationssymbols",
          "Durch Striche vor dem Fahrzeug",
          "Durch ein weißes Dreieck"
        ],
        "correctAnswerIndex": 2
      }
    ]
  },
  "Ampelerkennung": {
    "texts": [
      "Das Fahrzeug erkennt Ampeln und bremst bei roten Ampeln automatisch bis zum Stillstand ab.",
      "Im Stillstand müssen Sie übernehmen und manuell anfahren. Das teilautomatisierte Fahren kann wieder aktiviert werden, sobald das Symbol weiß im Display aufleuchtet."
    ],
    "media": [
      {
        "tag": "Ampel_Rot_Bremst",
        "path": "/HMI_GIFs/4neu1.gif",
        "description": "Fahrzeug erkennt eine rote Ampel und bremst automatisch bis zum Stillstand ab."
      },
      {
        "tag": "Ampel_Stillstand_Manuell",
        "path": "/HMI_GIFs/4neu2.gif",
        "description": "Nach dem Stillstand an der Ampel muss der Fahrer manuell anfahren (Display-Anzeige)."
      }
    ],
    "questions": [
      {
        "questionText": "Erkennt das Fahrzeug Ampeln, wenn das teilautomatisierte Fahren aktiv ist?",
        "possibleAnswers": [
          "Richtig",
          "Falsch"
        ],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Das Fahrzeug bremst automatisch, wenn es eine rote Ampel erkannt hat.",
        "possibleAnswers": [
          "Richtig",
          "Falsch"
        ],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Im Stillstand erkennt das Fahrzeug grüne Ampeln und fährt automatisch wieder los.",
        "possibleAnswers": [
          "Richtig",
          "Falsch"
        ],
        "correctAnswerIndex": 1
      }
    ]
  },
  "Spurführung": {
    "texts": [
      "Das Fahrzeug hält automatisch die Spur, wenn das teilautomatisierte Fahren aktiv ist.",
      "Das Fahrzeug wechselt auf mehrspurigen Straßen automatisch die Spur, wenn Sie den Blinker antippen und es der Verkehr zulässt. Es beobachtet dabei selbstständig die Umgebung."
    ],
    "media": [
      {
        "tag": "Spur_Halten_Automatisch",
        "path": "/HMI_GIFs/6-2.gif",
        "description": "Animation des Fahrzeugs, das automatisch die Spur hält."
      },
      {
        "tag": "Spur_Wechsel_Blinker_1",
        "path": "/HMI_GIFs/1-2.gif",
        "description": "Animation zum automatischen Spurwechsel nach Blinker-Antippen (Teil 1)."
      },
      {
        "tag": "Spur_Wechsel_Blinker_2",
        "path": "/HMI_GIFs/9-3.gif",
        "description": "Animation zum automatischen Spurwechsel nach Blinker-Antippen (Teil 2)."
      }
    ],
    "questions": [
      {
        "questionText": "Ist das teilautomatisierte Fahren aktiv, hält das Fahrzeug die Spur selbstständig.",
        "possibleAnswers": [
          "Richtig",
          "Falsch"
        ],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Können Sie als Fahrer*in das Lenkrad loslassen, wenn das teilautomatisierte Fahren aktiv ist?",
        "possibleAnswers": [
          "Ja",
          "Nein"
        ],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Das Fahrzeug schlägt eigenständig Spurwechsel vor, auch wenn es die Verkehrssituation nicht zulässt.",
        "possibleAnswers": [
          "Richtig",
          "Falsch"
        ],
        "correctAnswerIndex": 1
      }
    ]
  },
  "Notbremsung": {
    "texts": [
      "Das Fahrzeug erkennt Hindernisse. Bevor es zum Zusammenstoß mit einem Hindernis, einer Person oder einem weiteren Fahrzeug kommt, bremst das Fahrzeug bis zum Stillstand ab",
      "Im Stillstand müssen Sie übernehmen und manuell anfahren. Das teilautomatisierte Fahren kann wieder aktiviert werden, sobald das Symbol weiß im Display aufleuchtet."
    ],
    "media": [
      {
        "tag": "Notbremse_Hindernis",
        "path": "/HMI_GIFs/8-2.gif",
        "description": "Fahrzeug führt eine Notbremsung vor einem Hindernis (Person/Fahrzeug) bis zum Stillstand durch."
      },
      {
        "tag": "Notbremse_Stillstand_Manuell",
        "path": "/HMI_GIFs/6neu1.gif",
        "description": "Nach der Notbremsung muss der Fahrer im Stillstand übernehmen und manuell anfahren."
      }
    ],
    "questions": [
      {
        "questionText": "Funktioniert der Notbremsassistent nur bei statischen Hindernissen?",
        "possibleAnswers": [
          "Ja",
          "Nein"
        ],
        "correctAnswerIndex": 1
      },
      {
        "questionText": "In welcher Situation greift der Notbremsassistent ein?",
        "possibleAnswers": [
          "Wenn der Fahrer eine Warnung durch die Set-Taste bestätigt",
          "Nur in bestimmten Verkehrssituationen",
          "Wenn eine Kollision mit einem Hindernis, einer Person oder einem Fahrzeug droht",
          "Nur bei niedrigen Geschwindigkeiten unter 30 km/h"
        ],
        "correctAnswerIndex": 2
      },
      {
        "questionText": "Was passiert, wenn der Notbremsassistent eine Kollisionsgefahr registriert?",
        "possibleAnswers": [
          "Der Fahrer wird dazu aufgefordert, selbst zu bremsen",
          "Das Fahrzeug bremst automatisch bis zum Stillstand",
          "Das Fahrzeug reagiert gar nicht.",
          "Der Fahrer erhält nur eine visuelle Warnung"
        ],
        "correctAnswerIndex": 1
      }
    ]
  },
  "Deaktivierung": {
    "texts": [
      "Drücken Sie die Aktivierungstaste erneut, um das teilautomatisierte Fahren zu beenden.",
      "Es wird auch beendet, wenn Sie manuell Lenken oder das Bremspedal drücken.",
      "Bei erfolgreicher Deaktivierung, erlöschen die Lenkradlichter und das Automationssymbol im Display erscheint wieder weiß."
    ],
    "media": [
      {
        "tag": "Deaktivierung_Taste",
        "path": "/HMI_GIFs/1-2.gif",
        "description": "Deaktivierung durch erneutes Drücken der Aktivierungstaste."
      },
      {
        "tag": "Deaktivierung_Lenken",
        "path": "/HMI_GIFs/9-3.gif",
        "description": "Deaktivierung durch manuelles Lenken."
      },
      {
        "tag": "Deaktivierung_Bremse",
        "path": "/HMI_GIFs/9-2.gif",
        "description": "Deaktivierung durch Drücken des Bremspedals."
      },
      {
        "tag": "Deaktivierung_Anzeige_Weiss",
        "path": "/HMI_GIFs/7neu1.gif",
        "description": "Anzeige der Deaktivierung: Lenkradlichter erlöschen und Automationssymbol wird weiß."
      }
    ],
    "questions": [
      {
        "questionText": "Wie kann das teilautomatisierte Fahren deaktiviert werden?",
        "possibleAnswers": [
          "Durch langes Drücken der Set-Taste",
          "Durch kurzes Antippen des Blinkers",
          "Durch erneutes Drücken der Aktivierungstaste",
          "Durch manuelles Einstellen des Abstands über die Abstandstasten"
        ],
        "correctAnswerIndex": 2
      },
      {
        "questionText": "Kann das teilautomatisierte Fahren durch manuelles Eingreifen (z.B. Lenken oder Bremsen) durch Sie als Fahrer*in deaktiviert werden?",
        "possibleAnswers": [
          "Ja",
          "Nein"
        ],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Wie wird angezeigt, dass das teilautomatisierte Fahren deaktiviert wurde?",
        "possibleAnswers": [
          "Durch ein rotes Ausrufezeichen im Display",
          "Durch ein akustisches Signal und eine Vibration im Lenkrad",
          "Durch das Erlöschen der Lenkradlichter und das weiße Automationssymbol",
          "Durch eine Warnmeldung im Head-Up-Display"
        ],
        "correctAnswerIndex": 2
      }
    ]
  },
  "Risiken/Verantwortung": {
    "texts": [
      "Das teilautomatisierte Fahren entbindet Sie nicht von der Verantwortung als Fahrer*in. Es funktioniert in den meisten Fällen sehr gut, kann jedoch nicht alle Fahrsituationen abdecken. Kommt das System an seine Grenzen, warnt es Sie und fordert zur Übernahme auf.",
      "Es kann jedoch vorkommen, dass das Fahrzeug Fehler macht, ohne vorher zu warnen. Achten Sie deshalb immer auf den Verkehr und die Umgebung. Sie müssen jederzeit sofort eingreifen können. Im Folgenden einige Beispiele für mögliche Fehler:",
      "Das Fahrzeug erkennt einen Kreisverkehr nicht und lenkt falsch.",
      "Das Fahrzeug erkennt die Fahrspur nicht wegen einer Baustelle.",
      "Das Fahrzeug bremst bei einer roten Ampel trotz Betätigung der SET-Taste nicht ab.",
      "Das Fahrzeug erkennt beim Spurwechsel umliegende Fahrzeuge nicht."
    ],
    "media": [
      {
        "tag": "Risiko_Uebernahme_Warnung",
        "path": "/HMI_GIFs/8neu1.gif",
        "description": "Anzeige einer Übernahmeaufforderung / Warnung, wenn das System an seine Grenzen kommt."
      },
      {
        "tag": "Risiko_Fehler_Kreisverkehr",
        "path": "/HMI_GIFs/10-1_anim.gif",
        "description": "Beispiel für Systemfehler: Fahrzeug lenkt in einem Kreisverkehr falsch."
      },
      {
        "tag": "Risiko_Fehler_Baustelle",
        "path": "/GIFs/10-2.gif",
        "description": "Beispiel für Systemfehler: Fahrzeug erkennt die Fahrspur in einer Baustelle nicht."
      },
      {
        "tag": "Risiko_Fehler_Ampel_Rot",
        "path": "/GIFs/10-3.gif",
        "description": "Beispiel für Systemfehler: Fahrzeug bremst nicht bei einer roten Ampel."
      },
      {
        "tag": "Risiko_Fehler_Spurwechsel",
        "path": "/GIFs/10-4.gif",
        "description": "Beispiel für Systemfehler: Fahrzeug erkennt ein anderes Fahrzeug beim Spurwechsel nicht."
      }
    ],
    "questions": [
      {
        "questionText": "Das teilautomatisierte Fahren entbindet Sie als Fahrer*in von der Verantwortung, sodass Sie nicht mehr aufmerksam sein müssen.",
        "possibleAnswers": [
          "Richtig",
          "Falsch"
        ],
        "correctAnswerIndex": 1
      },
      {
        "questionText": "Müssen Sie als Fahrer*in jederzeit auf unvorhersehbare Situationen vorbereitet sein?",
        "possibleAnswers": [
          "Ja",
          "Nein"
        ],
        "correctAnswerIndex": 0
      },
      {
        "questionText": "Warum dürfen Sie sich als Fahrer*in nicht vollständig auf die Assistenzsysteme verlassen?",
        "possibleAnswers": [
          "Weil die Systeme zu langsam reagieren",
          "Weil das teilautomatisierte Fahrzeug immer 10 km/h schneller fährt als erlaubt",
          "Weil die Systeme Fehler machen können, ohne Sie als Fahrer*in zu warnen",
          "Weil das teilautomatisierte Fahren nur auf Autobahnen nutzbar ist"
        ],
        "correctAnswerIndex": 2
      }
    ]
  }
}