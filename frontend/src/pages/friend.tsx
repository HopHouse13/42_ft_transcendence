import useFriendDisplay from '../hooks/useFriendDisplay';
import useFriendActions from '../hooks/useFriendActions';
import FriendCard from '../components/FriendCard'; // export default -> pas de {}
import useFriendSearch from '../hooks/useFriendSearch';
import { useState } from 'react';
import Loader from './loader';

export default function Friend() // une page = une fonction avec un retour avec la page construite 
{
	const	{ lists, presence, loading, error } = useFriendDisplay(); // le hook récupère les listes et le cache de présence des amis
	const	{ sendRequest, acceptFriend, removeFriend } = useFriendActions(); // hook pour les actions sur les listes
	const [ searchName, setSearchName ] = useState( '' ); // represnete la memoire de searchName pour React: il met a jour l affichage avec cette nouvelle valeur et stocke la valeur dans searchName
	const	{ searchResult } = useFriendSearch( searchName );

	if ( loading )
		return ( <Loader />);
	
	if ( error )
		return ( <p>{ error }</p> );

	return (
		<div className = 'w-full max-w-md lg:max-w-4xl max-h-130 mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4'> 
			<section className = 'card flex flex-col bg-base-200 border border-base-300 p-4 gap-2 lg:col-span-2'>
				<h2 className = 'text-xl text-center font-bold p-2'>
					Friends
				</h2>
				{lists?.friends.length === 0 ? (
					<span className="opacity-60">
						You have no friend yet.
					</span>
				) : (
					<div className='flex-1 min-h-0 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-2 content-start'>
						{ lists?.friends.map(( user ) => (
							<FriendCard key = { user.id } user = { user } isFriend = { true } isOnline = { presence[user.id] }>
								<button
									className = 'btn btn-xs btn-error opacity-50 transition-opacity hover:opacity-100' 
									onClick = { () => removeFriend( user.id )}>
									REMOVE
								</button>
							</FriendCard>
						))}
					</div>
				)}
			</section>

			<section className = 'card bg-base-200 border border-base-300 p-4 gap-2 max-h-130'>

				<h2 className = 'text-xl text-center font-bold p-2'>
					Search
				</h2>

				<input
					type = 'text'
					className = 'input input-bordered w-full mb-1'
					placeholder = 'Search an user...'
					value = { searchName }
					onChange = { ( event ) => setSearchName( event.target.value )}/>
				<div className = 'flex-1 min-h-0 overflow-y-auto flex flex-col gap-2'>
					{searchResult?.map(( user ) => (
						<FriendCard key = { user.id } user = { user }>
							<button
								className = 'btn btn-xs btn-success opacity-60 transition-opacity hover:opacity-100'
								onClick = { () => sendRequest( user.id )}>
								ADD
							</button>
						</FriendCard>
					))}
				</div>
			</section>

			<section className = 'card max-h-130 bg-base-200 border border-base-300 p-4 gap-2'>
				<h2 className = 'text-xl text-center font-bold p-2'>
					Requests
				</h2>
				{lists?.received.length === 0 && lists?.sent.length === 0 ? (
					<span className="opacity-60">
						You have no friend request yet.
					</span>
				) : (
					<div className = 'flex-1 min-h-0 overflow-y-auto flex flex-col gap-2'>
						{ lists?.received.map(( user ) => (
							<FriendCard key = { user.id } user = { user }>
								<button
									className = 'btn btn-xs btn-success opacity-60 transition-opacity hover:opacity-100'
									onClick = { () => acceptFriend( user.id ) }>
									ACCEPT
								</button>
								<button
									className = 'btn btn-xs btn-error opacity-50 transition-opacity hover:opacity-100'
									onClick = { () => removeFriend( user.id )}>
									REFUSE
								</button>
							</FriendCard>
						))}
						{ lists?.sent.map(( user ) =>(
							<FriendCard key = { user.id } user = { user }>
								<div className = 'italic animate-pulse text-xs text-center '>
										Waiting
								</div>
								<button
									className = 'btn btn-xs btn-warning opacity-50 transition-opacity hover:opacity-100'
									onClick = { () => removeFriend( user.id )}>
									CANCEL
								</button>
							</FriendCard>
						))}
					</div>
				)}
			</section>
		</div>
	);
}