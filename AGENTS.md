# StickBrawl — Agent Rollen

## ORCHESTRATOR
Liest CLAUDE.md + aktuellen Pathmode Intent.
Verteilt Tasks an Subagenten.
Entscheidet wann Qualitätsstandard erreicht ist.
Stoppt wenn: alle CRITICAL + HIGH Items shipped UND 3 aufeinanderfolgende Test-Runs ohne neue Bugs.

## DEVELOPER
Implementiert einen einzelnen klar definierten Fix/Feature.
Immer nur eine Datei pro Task.
Committed nach jeder Änderung.
Reported Ergebnis an Orchestrator.

## TESTER
Öffnet index.html lokal, simuliert Gameplay via Code-Review.
Prüft: spawn, movement, weapons, win screen, kill cam.
Searched nach JS-Errors und duplicate const declarations.
Reported gefundene Bugs mit Datei + Zeilennummer.

## CRITIC
Reviewed jeden Commit auf: duplicate declarations, fehlende dt-Multiplikation,
undefined-Checks, shadowBlur-Resets.
Blockiert Push wenn kritische Issues gefunden.
Gibt grünes Licht wenn sauber.

## Qualitätsstandard (Stop-Bedingung)
- [ ] Kein JS-Error in Console beim Spielstart
- [ ] Spieler spawnen auf allen 4 Maps
- [ ] Win Screen erscheint nach Final Kill
- [ ] Kill Cam nur bei echtem Final Kill
- [ ] Alle 12 Waffen pickupbar und funktional
- [ ] Canvas skaliert auf Browsergröße
- [ ] Keine duplicate const declarations in src/
