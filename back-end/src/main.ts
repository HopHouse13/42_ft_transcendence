import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes( new ValidationPipe() );

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
/*
 {
whitelist: true,        // supprime les champs non déclarés dans le DTO
forbidNonWhitelisted: true, // rejette la requête si un champ en trop est envoyé
transform: true,// convertit automatiquement les types (utile si body en JSON strict, moins critique ici)
}
 */
// useGlobalPipes est une methode de l'objet principe qui permets d'enregistrer les objets instances du/des pipes de validation.
// Les methodes de ces objets "pipe" pourront etre appelés automatiquement par Nest lors de la phase des requétes entrantes.
// Le but du pipe de validation est de controler la donnée entrant brute, transformer cette donnée et d'instancier des objets DTO au bon format (les contrats) 
// Lors d'une requéte avec des donnée dans le body, le/les pipe de validation recupère la donnée brute du body et la classe DTO lié a cette donnée brute.
// Il check si la donnée brut correspondent aux rélges de l'objet DTO.
// -> Si tout correspond, il instancie un objet généralement nommé "dto" et le transmet a la methode du controller.
// -> Si erreur, il génére une erreur propre et la renvoit.

// Ces pipes de validation peuvent prendre des arguments pour modifier les comportements globaux du flux de verification de la donnée.
// exemple: `whitelist:true`-> supprime automatiquement du body tout champ non déclaré dans le DTO
// A voir avec Benoit
