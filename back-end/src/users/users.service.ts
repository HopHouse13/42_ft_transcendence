import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'; // décorateur qui rend cette classe injectable
import { PrismaService } from '../prisma/prisma.service'; // la class PrismaService qui encapsule PrismaClient
import { Prisma } from '@prisma/client'; // Pour obetenir la classe des exception a lever coté prisma
import { UpdateUserDto } from './dto/update-user.dto';
import { UserData } from './interfaces/user-data.interface';
import { AuthData } from './interfaces/auth-data.interface';
import { AuthUser } from './interfaces/auth-user.interface';

@Injectable() // cette classe peut être injectée
export class UsersService
{
	// Le constructeur declare/initialiser Prisma avec l'injection de PrismaService (instance de PrismaService)
	// il faut voir ca un peu comme la ligne d'initialisation des attributs du class en c++
	// prisma devient un attribut privé avec la valeur (du pointeur) de l'objet PrismaService (instancié en debut de programme)
	constructor( private readonly prisma: PrismaService ) {}

	/////

	async findAll() // renvoie un tableau de l'ensemble des users inscrient dans la db
	{
		const	users = await this.prisma.user.findMany(
		{
			select: // ne retourne que les champs listés à true
			{
				id:			true,
				username:	true,
				email:		true,
				avatarUrl:	true,
				createdAt:	true,
			}
		});
		return ( users ); // users est un tableau d'objets, un objet = un user ; Si 0 user dans la db -> envoi d'un tableau vide []
	}

	/////

	async findOne( id: string )
	{
		const	user = await this.prisma.user.findUnique(
		{
			where:
			{
				id
			},
			select:
			{
				id:			true,
				username:	true,
				email:		true,
				avatarUrl:	true,
				createdAt:	true,
			}
		}
		);

		if ( !user ) // findUnique renvoit null si il n'a pas trouvé de user
			throw (new NotFoundException( `User ${id} non-existent` )); // expection Nest levée si le user n'exsite pas (catch par Nest via Expection Filter)
		return ( user );
	}

	/////

	// usage interne uniquement (appelé que par AuthService)
	// les données sont déjà validées par AuthService
	async create( userData: UserData, authData: AuthData ) // renvoie un nouveau user avec ses données verifiées
	{
		let	passwordHash: string | undefined;
		let	providerId: string | undefined;

		if ( authData.authMode ===  'LOCAL' ) // selon le mode d'auth, les deux variable prennent la valeur correspondante de authData
			passwordHash = authData.passwordHash;
		else
			providerId = authData.providerId;

		try
		{
			const	newUser = await this.prisma.user.create(
			{
				data: // rempli uniquement les champs cités dans data
				{
					username:		userData.username.toLowerCase(), // stock toujours les ussrname en minuscule pour eviter 2 comptes distint comme "Bob" et "bob"
					email:			userData.email,
					authMode:		authData.authMode,
					passwordHash:	passwordHash, // peut être undefined car champ optionnel dans le schema prisma
					providerId:		providerId  // peut être undefined car champ optionnel dans le schema prisma
				}
			});
			return ( newUser ); // newUser est un objet de type User
		}
		catch ( err )
		{
			if ( err instanceof Prisma.PrismaClientKnownRequestError )
			{
				switch ( err.code )
				{
					case ( 'P2002' ): // si doublon
						throw (new ConflictException( `Data already used` ));
				}
			}
			throw ( err );
		}
	}

	/////

	async update( userId: string, dto: UpdateUserDto ) // 2 params -> id pour identifier quel user va etre update et dto deja instancié par Nest
	{
		try
		{
			const	updateUser = await this.prisma.user.update(
			{
				where: // filtre pour selectionner le user avec le bon id pour pouvoir modifier ses champs
				{
					id: userId
				},
				data: // data signifi que les clés:valeurs a l'interieurs seront pris en compte pour modifier la db de ce user
				{
					username: dto.username?.toLowerCase(),
					email: dto.email
				}
			});
			return ( updateUser ); // updateUser est un objet complet de type User du user qui a été update
		}
		catch ( err )
		{
			if ( err instanceof Prisma.PrismaClientKnownRequestError )
			{
				switch ( err.code )
				{
					case ( 'P2025' ): // si le user n'existe pas
						throw (new NotFoundException( `user ${userId} non-existent` ));
					case ( 'P2002' ): // erreur d'unicité de la donnée
						throw (new ConflictException( `Data already used` ));
				}
			}
			throw ( err );
		}
	}

	/////

	async	remove( id: string ) // reçoit l'id du user à supprimer (transmis par le controller)
	{
		try
		{
			const	deleteUser = await this.prisma.user.delete(
			{
				where:
				{
					id // raccouri ES6 qui conssite a declarer la variable recherchée exactement le meme nom que celui du champ ou on veut chercher
				},
				select: // ne retourne que les champs listés à true par mesure de sécurité
				{
					id:			true,
					username:	true,
					avatarUrl:	true,
					createdAt:	true,
				},
			});

			return ( { message: `User ${id} has indeed been deleted` , user: deleteUser } ); // message de confirmation + infos filtrées du user supprimé
		}
		catch ( err )
		{
			if ( err instanceof Prisma.PrismaClientKnownRequestError )
			{
				switch ( err.code )
				{
					case ( 'P2025' ):
						throw (new NotFoundException( `user ${id} non-existent` ));
				}
			}
			throw ( err );
		}
	}

	///

	// trouve un user à partir de son username, renvoie les données nécessaires à la validation de l'authenticité
	// renvoie null si non trouvé. validationUser() géra le cas
	async findForAuth( username: string ): Promise< AuthUser | null >
	{
		const	authUser =  await this.prisma.user.findUnique(
		{
			where:
			{
				username: username.toLowerCase()
			},
			select:
			{
				id:				true,
				authMode:		true,
				passwordHash:	true
			}

		});

		return ( authUser );
	}

}

