# Live Cockpit

Le Cockpit accompagne un LIVE sans tenter de remplacer OBS. L'état opérationnel est
indépendant du brouillon : `PLANNED → PREPARING → READY → LIVE → FINISHED`. Les corrections
manuelles restent possibles. Le passage à `LIVE` enregistre `actualStartAt`; `FINISHED`
enregistre `actualEndAt`, ce qui permet de comparer durée prévue et réelle.

Chaque événement reçoit une copie de sa routine. Les cases sont donc persistées avec
l'événement et une modification ultérieure du modèle ne les réécrit pas. La progression ne
compte que les étapes `CHECK`. Marquer prêt reste possible après confirmation lorsque des
étapes manquent. La section après-live conserve une humeur et une note locale.
