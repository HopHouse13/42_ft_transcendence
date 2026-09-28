import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({ // decorateur Module permet de definir les metadonnées qui vont regir ce module
	imports: [ ServeStaticModule.forRoot({ // importe et configure une instance qui gere des ressources statiques
		rootPath: join( __dirname, '..', '..', 'uploads' ), // constitue le path du repertoire où se trouve la ressource statique
		serveRoot: '/uploads' // defini le prefixe de l'url qui sera catché pour renvoyer la ressource statique
	}) ],
	providers: [ UserService ], // defini les services metier de ce module
	controllers: [ UserController ], // defini les controllers de ce module
	exports: [ UserService ] // defini les services metier que les autres modules pourront injecter, avec `import` `UserModule`
})
export class UserModule {} // classe vide, sert uniquement de support aux métadonnées du décorateur @Module