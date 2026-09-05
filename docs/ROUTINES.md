# Routines

Une routine ordonnée contient des phases `BEFORE`, `DURING`, `AFTER` et les types `CHECK`,
`OPEN_APP`, `OPEN_URL`, `OPEN_FILE`, `LOCAL_HTTP`, `SEPARATOR`, `TEXT`. Les routines sont
des modèles SQLite; l'attachement crée une instance indépendante dans le JSON du LIVE.
La réinitialisation ne touche qu'aux valeurs `done` de cette instance.
