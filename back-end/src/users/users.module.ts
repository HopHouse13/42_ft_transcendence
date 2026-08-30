import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({ // decorateur Module permet de definir les metadonnées qui vont regir ce module
	providers: [UsersService], // defini les services metier de ce module
	controllers: [UsersController], // defini les controllers de ce module
	exports: [UsersService] // defini les services metier que les autres modules pourront injecter, avec `import` `UsersModule`
})
export class UsersModule {} // classe vide, sert uniquement de support aux métadonnées du décorateur @Module