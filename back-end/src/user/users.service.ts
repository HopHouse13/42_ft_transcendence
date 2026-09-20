import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common'; // décorateur qui rend cette classe injectable
import { PrismaService } from '../prisma/prisma.service'; // la class PrismaService qui encapsule PrismaClient
import { Prisma } from '@prisma/client'; // namespace Prisma pour obetenir la classe des exception a lever coté prisma
import { UserPublic, UserPrivate, UserCreate, UserProfil, UserUpdate } from './interfaces/user.interface';

@Injectable() // cette classe peut être injectée
export class UsersService
{
	// Le constructeur declare/initialiser Prisma avec l'injection de PrismaService (instance de PrismaService)
	// il faut voir ca un peu comme la ligne d'initialisation des attributs du class en c++
	// prisma devient un attribut privé avec la valeur (du pointeur) de l'objet PrismaService (instancié en debut de programme)
	constructor( private readonly prisma: PrismaService ) {}

	///

	async findAll(): Promise< UserPublic[] >// renvoie un tableau de l'ensemble des users inscrient dans la db
	{
		const	users: UserPublic[] = await this.prisma.user.findMany(
		{
			select: // ne retourne que les champs listés à true
			{
				id:			true,
				username:	true,
				avatarUrl:	true,
				createdAt:	true,
				updatedAt:	true
			}
		});
		return( users ); // users est un tableau d'objets, un objet = un user ; Si 0 user dans la db -> envoi d'un tableau vide []
	}

	///

	async findOne( id: string ): Promise< UserPublic >
	{
		const	user: UserPublic | null = await this.prisma.user.findUnique(
		{
			where:
			{
				id
			},
			select:
			{
				id:			true,
				username:	true,
				avatarUrl:	true,
				createdAt:	true,
				updatedAt:	true
			}
		}
		);

		if ( !user ) // findUnique renvoit null si il n'a pas trouvé de user
			throw (new NotFoundException( `User ${id} non-existent` )); // expection Nest levée si le user n'exsite pas (catch par Nest via Expection Filter)
		return( user );
	}

	///

	async findByEmail( email: string ): Promise< UserPrivate | null >
	{
		const	user: UserPrivate | null = await this.prisma.user.findUnique(
		{
			where:
			{
				email
			},
			select:
			{
				id:						true,
				username:				true,
				email:					true,
				avatarUrl:				true,
				createdAt:				true,
				updatedAt:				true,

				passwordHash:			true,
				googleId:				true,
				gitId:					true,

				tokenPassword:			true,
				tokenPasswordExpiresAt:	true
			}
		});

		return( user );
	}

	///

	async findByResetToken( tokenHash: string ): Promise< UserPrivate | null >
	{
		const	user: UserPrivate | null = await this.prisma.user.findUnique(
		{
			where:
			{
				tokenPassword: tokenHash
			},
			select:
			{
				id:						true,
				username:				true,
				email:					true,
				avatarUrl:				true,
				createdAt:				true,
				updatedAt:				true,

				passwordHash:			true,
				googleId:				true,
				gitId:					true,

				tokenPassword:			true,
				tokenPasswordExpiresAt:	true
			}
		});

		return( user );
	}

	///

	async updatePassword( id: string, newPasswordHash: string ): Promise< UserPrivate >
	{
		const	user: UserPrivate = await this.prisma.user.update(
		{
			where:
			{
				id
			},
			data:
			{
				passwordHash:			newPasswordHash,
				tokenPassword:			null,
				tokenPasswordExpiresAt:	null
			},
			select:
			{
				id:						true,
				username:				true,
				email:					true,
				avatarUrl:				true,
				createdAt:				true,
				updatedAt:				true,

				passwordHash:			true,
				googleId:				true,
				gitId:					true,

				tokenPassword:			true,
				tokenPasswordExpiresAt:	true
			}
		});
		return( user );
	}

	///

	// usage interne uniquement (appelé que par AuthService)
	// les données sont déjà validées par AuthService
	async	create( dataCreate: UserCreate ): Promise < UserPrivate > // renvoie un nouveau user avec ses données verifiées
	{
		if ( dataCreate.passwordHash == null && dataCreate.googleId == null && dataCreate.gitId == null )
			throw ( new BadRequestException( 'at least one authentication method required' ));

		try
		{
			const	user: UserPrivate = await this.prisma.user.create(
			{
				data:
				{
					username:		dataCreate.username,
					email:			dataCreate.email,
					passwordHash:	dataCreate.passwordHash,
					googleId:		dataCreate.googleId,
					gitId:			dataCreate.gitId
				},
				select:
				{
					id:						true,
					username:				true,
					email:					true,
					avatarUrl:				true,
					createdAt:				true,
					updatedAt:				true,

					passwordHash:			true,
					googleId:				true,
					gitId:					true,

					tokenPassword:			true,
					tokenPasswordExpiresAt:	true
				}
			});
			return( user );
		}
		catch ( err )
		{
			if ( err instanceof Prisma.PrismaClientKnownRequestError )
			{
				switch ( err.code )
				{
					case ( 'P2002' ): // si doublon
						throw ( new ConflictException( `Data already used` ));
				}
			}
			throw ( err );
		}
	}

	///

	async update( id: string, data: UserUpdate ): Promise < UserPublic >
	{
		try
		{
			const	updateUser: UserPublic = await this.prisma.user.update(
			{
				where:
				{
					id
				},
				data:
				{
					username:	data.username,
					email:		data.email,
					avatarUrl:	data.avatarUrl
				},
				select:
				{
					id:			true,
					username:	true,
					avatarUrl:	true,
					createdAt:	true,
					updatedAt:	true
				}
			});
			return( updateUser );
		}
		catch ( err )
		{
			if ( err instanceof Prisma.PrismaClientKnownRequestError )
			{
				switch ( err.code )
				{
					case ( 'P2025' ): // si le user n'existe pas
						throw (new NotFoundException( `user ${id} non-existent` ));
					case ( 'P2002' ): // erreur d'unicité de la donnée
						throw (new ConflictException( `Data already used` ));
				}
			}
			throw ( err );
		}
	}

	///

	async remove( id: string ): Promise <{ message: string, deleteUser: UserPublic }>
	{
		try
		{
			const	deleteUser: UserPublic = await this.prisma.user.delete(
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
					updatedAt:	true
				},
			});

			return({ message: `User ${id} has indeed been deleted` , deleteUser }); // message de confirmation + infos filtrées du user supprimé
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

	async findByGoogleId( googleId: string ) : Promise< UserPrivate | null >
	{
		const	authUserGoogle: UserPrivate | null = await this.prisma.user.findUnique(
		{
			where: 
			{
				googleId
			},
			select:
			{
					id:						true,
					username:				true,
					email:					true,
					avatarUrl:				true,
					createdAt:				true,
					updatedAt:				true,

					passwordHash:			true,
					googleId:				true,
					gitId:					true,

					tokenPassword:			true,
					tokenPasswordExpiresAt:	true
			}
		});

		return( authUserGoogle ); // renvoie un objet user avec les données UserPrivate
	}

	///

	async setResetTokenPassword( id: string, tokenPassword: string, tokenPasswordExpiresAt: Date ): Promise< UserPrivate >
	{
		const user: UserPrivate = await this.prisma.user.update(
		{
			where:
			{
				id
			},
			data:
			{
				tokenPassword,
				tokenPasswordExpiresAt
			},
			select:
			{
					id:						true,
					username:				true,
					email:					true,
					avatarUrl:				true,
					createdAt:				true,
					updatedAt:				true,

					passwordHash:			true,
					googleId:				true,
					gitId:					true,

					tokenPassword:			true,
					tokenPasswordExpiresAt:	true
			}
		});

		return( user );
	}

	///

	async addGoogleId( id: string, googleId: string ): Promise< UserPrivate >
	{
		const	user: UserPrivate = await this.prisma.user.update(
		{
			where:
			{
				id
			},
			data:
			{
				googleId
			},
			select:
			{
					id:						true,
					username:				true,
					email:					true,
					avatarUrl:				true,
					createdAt:				true,
					updatedAt:				true,

					passwordHash:			true,
					googleId:				true,
					gitId:					true,

					tokenPassword:			true,
					tokenPasswordExpiresAt:	true
			}
		});

		return ( user );
	}
}