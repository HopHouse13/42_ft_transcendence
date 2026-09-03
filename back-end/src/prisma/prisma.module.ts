import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // class custom

@Global() 						// décorateur: "ce module est global"(injectable sans import)
@Module({						// décorateur: "voici ce que je fournis/partage"
	providers:[PrismaService],	// ce module a comme service PrismaService
	exports: [PrismaService]	// rend PrismaService injectable dans d'autres modules sans devoir ecrire "imports:"
})
export class PrismaModule {}	// la classe est juste un "porte-manteau" vide qui porte des decorateurs (@Globale/@Module)
