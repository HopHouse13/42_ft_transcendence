import type { ReactNode } from 'react'; // type qui accepte tous les elements que react peut afficher
import type { FriendUser } from '../types/friendTypes';
import { useNavigate } from 'react-router';

interface FriendCardProps
{
	user: 		FriendUser;
	children?:	ReactNode;
	isFriend?:	boolean;
	isOnline?:	boolean;
};

export default function FriendCard( props: FriendCardProps )
{
	const navigate = useNavigate();
	return (
		<div
			className = { `card card-md bg-base-100 w-full flex flex-row border border-base-300 items-center p-2 gap-3 hover:bg-base-200 hover:border-base-100 transition-colors ${ props.isFriend ? 'cursor-pointer': '' }` }
			onClick = { props.isFriend ? () => navigate( `/profile/${ props.user.id }` ) : undefined }>
			{/* bloc avatar */}
			<div
				className = { `avatar ${ props.isFriend && props.isOnline !== undefined ? ( props.isOnline ? 'avatar-online' : 'avatar-offline' ) : '' }` }
				aria-label = { props.isFriend ? ( props.isOnline === undefined ? 'Presence unavailable' : props.isOnline ? 'Online' : 'Offline' ) : undefined }>
				<div className = "w-10 rounded-full">
					<img
						src = { `/api${ props.user?.avatarUrl || '/uploads/avatars/default.png' }` }
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
				onClick = { ( click ) => click.stopPropagation() }>
				{ props.children }
			</div>
		</div>
	);
} 