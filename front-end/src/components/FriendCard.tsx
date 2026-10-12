import type { ReactNode } from 'react'; // type qui accepte tous les elements que react peut afficher
import type { FriendUser } from '../types/friendTypes';

interface FriendCardProps
{
	user: 		FriendUser;
	children?:	ReactNode; // optionnel
	onClick?:	() => void; // permet de rendre la tuile clicable
};

export default function FriendCard( props: FriendCardProps )
{
	return (
		<div onClick={ props.onClick } className={ `card card-md bg-base-100 w-full flex flex-row items-center p-2 gap-3 ${ props.onClick ? 'cursor-pointer' : '' }` }> {/* carte de daisy taille medium, centrée, le bg a 100, tuile prend toute la largeur de la colonne, marge interieur et espacemeemnt des elements -> 2 */}
			{/* bloc avatar */}
			<div className="avatar avatar-online"> {/* element avatar de daisy */}
				<div className="w-10 rounded-full">
					<img
						src={ `/api${ props.user?.avatarUrl || '/uploads/avatars/default.png' }` }
						alt={ `${ props.user?.username } avatar` }
					/>
				</div>
			</div>
			{/* bloc texte */}
			<div className='grow min-w-0'>
				<div className='text-md font-semibold truncate' title={ props.user.username }>
					{ props.user.username }
				</div>
				<div className="badge badge-neutral text-xs opacity-80">
					Elo {props.user.elo}
				</div>
			</div>
			{/* bloc boutons */}
			<div className='flex flex-col gap-2'>
				{ props.children }
			</div>
		</div>
	);
} 