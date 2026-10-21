import type { ReactNode } from 'react'; // type qui accepte tous les elements que react peut afficher
import type { FriendUser } from '../types/friendTypes';
import { useNavigate } from 'react-router';
import { resolveAvatar } from '../utils/resolveAvatar';

interface FriendCardProps
{
	user: 		FriendUser;
	children?:	ReactNode; // optionnel
	isFriend?:	boolean;
	isOnline?:	boolean;
	//onClick?:	() => void;
};

export default function FriendCard( props: FriendCardProps )
{
	const navigate = useNavigate();
  const safeAvatar = resolveAvatar(props.user.avatarUrl);

	return (
		<div
			className = { `card card-md bg-base-100 w-full flex flex-row border border-base-300 items-center p-2 gap-3 hover:bg-base-200 hover:border-base-100 transition-colors ${ props.isFriend ? 'cursor-pointer': '' }` }
			onClick = { props.isFriend ? () => navigate( `/profile/${ props.user.id }` ) : undefined }>
			{/* bloc avatar */}
			{/* Le statut est affiché uniquement pour les amis acceptés ; undefined signifie que la présence est inconnue. */}
			<div
				className = { `avatar ${ props.isFriend && props.isOnline !== undefined ? ( props.isOnline ? 'avatar-online' : 'avatar-offline' ) : '' }` }
				aria-label = { props.isFriend ? ( props.isOnline === undefined ? 'Presence unavailable' : props.isOnline ? 'Online' : 'Offline' ) : undefined }>
				<div className = "w-10 rounded-full">
					<img
						src = {safeAvatar}
						alt = { `${ props.user?.username } avatar` }
					/>
				</div>
			</div>
			{/* bloc texte */}
			<div className = 'grow min-w-0'>
				<div className = 'text-md font-semibold truncate' title = { props.user.username }>
					{ props.user.username }
				</div>
				<div className = "badge badge-xs badge-success opacity-80">
					Elo {props.user.elo}
				</div>
			</div>
			{/* bloc boutons */}
			<div
				className = 'flex flex-col gap-2 p-2'
				onClick = { ( click ) => click.stopPropagation() }> {/* permet de bloquer le clic a ce bouton, pas jusau'au onClick du parent*/}
				{ props.children }
			</div>
		</div>
	);
}