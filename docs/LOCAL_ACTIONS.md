# Actions locales et sécurité

Le renderer ne reçoit aucune primitive Node et ne transmet à l'exécution qu'un UUID. Le main
charge la cible persistée et validée par Zod. `OPEN_APP` utilise `spawn(path, [], {shell:false})` :
aucune commande, argument ou shell libre n'est accepté. `OPEN_FILE` passe par `shell.openPath`.
`OPEN_URL` accepte exclusivement HTTP(S).

`LOCAL_HTTP` accepte seulement `localhost`, `127.0.0.1` ou `::1`, avec méthode GET/POST,
timeout de trois secondes et redirections interdites. Les chemins sont sélectionnés par le
dialogue natif avant persistance. Ne jamais stocker de jeton ou secret dans une cible.
