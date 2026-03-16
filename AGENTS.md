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
### Static Code Analysis:
Searched nach JS-Errors und duplicate const declarations.
Prüft: dt-Parameter, undefined-Checks, shadowBlur-Resets.
Reported gefundene Bugs mit Datei + Zeilennummer.

### Runtime Validation (Headless):
```bash
open -a "Google Chrome" --args --headless --disable-gpu \
  --dump-dom ~/stickbrawl/index.html 2>&1 | grep -i "error\|undefined\|null\|exception"
```
Fängt: ReferenceError, TypeError, undefined-Zugriffe, null-pointer-Fehler.
Lädt all Scripts und führt initCode aus (nicht nur Syntax-Check).
Output: Zeile-für-Zeile Fehler aus Console + DOM-Dump.

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
