*This project has been created as part of the 42 curriculum by maguerin, pbret*

***DESCRIPTION***

***INSTRUCTIONS***


***RESSOURCES***

![Architecture Conteneurs Othello](sujets/Architecture%20Conteneurs%20Othello.png)

## pour les machine de 42 
**Étape 1 — Démarrer le socket podman**
~~~ bash
systemctl --user start podman.socket
~~~
Vérifie que c'est bien actif :
~~~ bash
systemctl --user status podman.socket
~~~
Puis relance :
~~~ bash
docker-compose up --build
~~~

pour les machine de 42 
in docker-compose.yml change:
~~~
    ports:
      - "8080:80"       # HTTP
      - "8443:443"     # HTTPS (à configurer plus tard)
~~~

