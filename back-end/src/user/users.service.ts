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
			where:
			{
				isDelete:	false
			},
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
				id,
				isDelete:	false
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
				email,
				isDelete:				false
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

				passwordToken:			true,
				passwordTokenExpiresAt:	true,
				
				refreshToken:			true,
				refreshTokenExpiresAt:	true
			}
		});

		return( user );
	}

	///

	async findByGoogleId( googleId: string ) : Promise< UserPrivate | null >
	{
		const	user: UserPrivate | null = await this.prisma.user.findUnique(
		{
			where: 
			{
				googleId,
				isDelete:					false
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

					passwordToken:			true,
					passwordTokenExpiresAt:	true,

					refreshToken:			true,
					refreshTokenExpiresAt:	true
			}
		});

		return( user ); // renvoie un objet user avec les données UserPrivate
	}

	///

	async findByGitId( gitId: string ): Promise< UserPrivate | null >
	{
		const	user: UserPrivate | null = await this.prisma.user.findUnique(
		{
			where: 
			{
				gitId,
				isDelete:					false
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

					passwordToken:			true,
					passwordTokenExpiresAt:	true,

					refreshToken:			true,
					refreshTokenExpiresAt:	true
			}
		});

		return( user ); // renvoie un objet userPrivate
	}

	///

	async findByPasswordToken( tokenHash: string ): Promise< UserPrivate | null >
	{
		const	user: UserPrivate | null = await this.prisma.user.findUnique(
		{
			where:
			{
				passwordToken:			tokenHash,
				isDelete:				false
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

				passwordToken:			true,
				passwordTokenExpiresAt:	true,

				refreshToken:			true,
				refreshTokenExpiresAt:	true
			}
		});

		return( user );
	}

	///

	async findByRefreshToken( refreshToken: string ): Promise< UserPrivate | null >
	{
		const	user: UserPrivate | null = await this.prisma.user.findUnique(
		{
			where:
			{
				refreshToken,
				isDelete:				false
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

				passwordToken:			true,
				passwordTokenExpiresAt:	true,

				refreshToken:			true,
				refreshTokenExpiresAt:	true
			}
		});

		return( user );
	}

	///

	async setPassword( id: string, newPasswordHash: string ): Promise< UserPrivate >
	{
		const	user: UserPrivate = await this.prisma.user.update(
		{
			where:
			{
				id,
				isDelete:				false
			},
			data:
			{
				passwordHash:			newPasswordHash,
				passwordToken:			null,
				passwordTokenExpiresAt:	null
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

				passwordToken:			true,
				passwordTokenExpiresAt:	true,

				refreshToken:			true,
				refreshTokenExpiresAt:	true
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
					username:				dataCreate.username,
					email:					dataCreate.email,
					passwordHash:			dataCreate.passwordHash,
					googleId:				dataCreate.googleId,
					gitId:					dataCreate.gitId
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

					passwordToken:			true,
					passwordTokenExpiresAt:	true,

					refreshToken:			true,
					refreshTokenExpiresAt:	true
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
					id,
					isDelete:	false
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

	async setPasswordToken( id: string, passwordToken: string, passwordTokenExpiresAt: Date ): Promise< UserPrivate >
	{
		const user: UserPrivate = await this.prisma.user.update(
		{
			where:
			{
				id,
				isDelete:					false
			},
			data:
			{
				passwordToken,
				passwordTokenExpiresAt
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

					passwordToken:			true,
					passwordTokenExpiresAt:	true,

					refreshToken:			true,
					refreshTokenExpiresAt:	true
			}
		});

		return( user );
	}

	///

	async setGoogleId( id: string, googleId: string ): Promise< UserPrivate >
	{
		const	user: UserPrivate = await this.prisma.user.update(
		{
			where:
			{
				id,
				isDelete:					false
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

					passwordToken:			true,
					passwordTokenExpiresAt:	true,

					refreshToken:			true,
					refreshTokenExpiresAt:	true
			}
		});

		return ( user );
	}

	///

	async setGitId( id: string, gitId: string ): Promise< UserPrivate >
	{
		const	user: UserPrivate = await this.prisma.user.update(
		{
			where:
			{
				id,
				isDelete:					false
			},
			data:
			{
				gitId
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

					passwordToken:			true,
					passwordTokenExpiresAt:	true,

					refreshToken:			true,
					refreshTokenExpiresAt:	true
			}
		});

		return ( user );
	}

	///

	async setRefreshToken( id: string, refreshToken: string, refreshTokenExpiresAt: Date ): Promise< UserPrivate >
	{
		const	user: UserPrivate = await this.prisma.user.update(
		{
			where:
			{
				id,
				isDelete:				false
			},
			data:
			{
				refreshToken,
				refreshTokenExpiresAt
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

				passwordToken:			true,
				passwordTokenExpiresAt:	true,

				refreshToken:			true,
				refreshTokenExpiresAt:	true
			}
		});

		return ( user );
	}

	///

	async remove( id: string ): Promise <{ message: string, deleteUser: UserPublic }>
	{
		try
		{
			const	deleteUser: UserPublic = await this.prisma.user.update(
			{
				where:
				{
					id, // raccouri ES6 qui conssite a declarer la variable recherchée exactement le meme nom que celui du champ ou on veut chercher
					isDelete:	false
				},
				data:
				{
					isDelete:	true,
					username:	`removed_player_${ id.slice( -8 ) }`,
					email:		`removed_player_${ id.slice( -8 ) }`
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

	async clearRefreshToken( id:string ): Promise< UserPublic >
	{
		const	user = await this.prisma.user.update(
		{
			where:
			{
				id,
				isDelete:				false
			},
			data:
			{
				refreshToken:			null,
				refreshTokenExpiresAt:	null
			},
			select:
			{
				id:						true,
				username:				true,
				avatarUrl:				true,
				createdAt:				true,
				updatedAt:				true
			}
		});

		return( user );
	}
}

