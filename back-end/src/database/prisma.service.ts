import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	// connexion forcée au démarrage
	async	onModuleInit() {
		await	this.$connect(); // methode PrismaService
	}

	// déconnexion propre avant l'arrêt de l'appli 
	async	onModuleDestroy() {
		await	this.$disconnect();
	}
}


// `implements` -> garantit à la compilation que les méthodes ci-dessous existent bien
// `OnModuleInit, OnModuleDestroy`-> Interfaces de cycle de vie NestJS :
// signatures vides, à implémenter dans un provider(service). 
// Nest appelle la méthode correspondante au bon moment, dans cet ordre :
// `OnModuleInit`				-> après la construction du module et de ses providers
// `OnApplicationBootstrap`		-> après que TOUS les modules de l'appli sont initialisés
//   ... l'appli tourne ...
// `BeforeApplicationShutdown`	-> juste au début du processus d'arrêt
// `OnModuleDestroy`			-> juste avant la destruction du module

// `PrismaService` -> 1 seule instance de PrismaClient, partagée dans toute l'app via l'injection de dépendances.

// `extends PrismaClient` -> class enfant que PrismaService herite
