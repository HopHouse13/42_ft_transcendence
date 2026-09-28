import { Injectable } from "@nestjs/common";

import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from "path";

export const	avatarUploadOptions: MulterOptions =
{
	storage: diskStorage(
	{
		destination: join( __dirname, '..', '..', 'uploads', 'avatars' ),
		filename: ( req, file, callback ) =>
		{
			const	extension = extname( file.originalname );
			const	uniqueName = `$`;
		}
	}
	)
}




@Injectable()
export class FileInterceptor
{

}