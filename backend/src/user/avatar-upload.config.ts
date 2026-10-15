import { diskStorage } from "multer";
import { extname, join } from 'path';
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { BadRequestException } from "@nestjs/common";

// Objet de configuration du multer qui gene les les requetes de type multipart/form-data (format pour transferer des fichier dans le protocole http)
export const avatarUploadOptions: MulterOptions = 
{
	storage: diskStorage(
	{
		destination: join( __dirname, '..', '..', 'uploads', 'avatars' ), // spécifie l'emplacement ou va etre stocké le fichier 
		
		filename: (req, file, callback ) => // specifie le nom du fichier: req -> renseigné par jwtGuard; file -> renseigné par multer (metadonnée du fichier); callback -> fonction fourni par multer qui est la fonction de retour avec le status et le nom du fichier
		{
			const	extension = extname( file.originalname );
			const	uniqueName = `${( req.user as { id: string })?.id }-${ Date.now() }${ extension }`;
			callback ( null, uniqueName );
		}
	}),
	
	fileFilter: (req, file, callback ) => // check si le fichier est au bon type
	{
		const	allowedTypes = [ 'image/png', 'image/jpeg' ]; // convention web (type MIME) pour definir un type : "categorie"/"format"

		if ( !allowedTypes.includes( file.mimetype ) )
			return ( callback (  new BadRequestException( 'invalid file type, only png/jpeg allowed' ), false )); // return serre a stopper la fonction
	
		callback ( null, true );
	},

	limits:
	{
		fileSize: 2000000 // 2Mo
	}
}