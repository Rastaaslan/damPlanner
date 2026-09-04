# Configuration Google

1. Dans Google Cloud Console, créer/sélectionner un projet, activer **Google Calendar API** et configurer l'écran de consentement.
2. Créer un client OAuth de type **Application de bureau**. Ne jamais créer de secret « Web » pour DamPlanner.
3. Télécharger le JSON puis l'importer avec **Réglages → Importer les credentials Desktop**. DamPlanner extrait le client ID/secret et les conserve dans `safeStorage`; le chemin et le contenu ne sont pas exposés au renderer.
4. Autoriser `calendar.events`, `calendar.calendarlist.readonly` et `calendar.freebusy`.
5. La connexion ouvre le navigateur système et reçoit le code sur un callback loopback éphémère `127.0.0.1` avec PKCE/state.

Choisir ensuite l'agenda de publication par défaut et les agendas de disponibilité. Déconnexion supprime les jetons locaux. Valider create/get/update/delete et révocation avec le smoke test ; les tests automatisés n'utilisent que le fake.
