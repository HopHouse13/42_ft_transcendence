import useFriendDisplay from '../hooks/useFriendDisplay';
import useFriendActions from '../hooks/useFriendActions';
import FriendCard from '../components/FriendCard'; // export default -> pas de {}
import useFriendSearch from '../hooks/useFriendSearch';
import { useState } from 'react';

export default function Friend() // une page = une fonction avec un retour avec la page construite 
{
	const	{ lists, loading, error } = useFriendDisplay(); // le hook qui recupere la donnée des 3 listes pour pouvoir actualiser les listes
	const	{ sendRequest, acceptFriend, removeFriend } = useFriendActions(); // hook pour les actions sur les listes
	const [ searchName, setSearchName ] = useState( '' ); // represnete la memoire de searchName pour React: il met a jour l affichage avec cette nouvelle valeur et stocke la valeur dans searchName
	const	{ searchResult } = useFriendSearch( searchName );

	if ( loading )
		return ( <p>Loading...</p> );
	
	if ( error )
		return ( <p>{ error }</p> );

	return (
		<div
	 className = 'w-full max-w-md lg:max-w-4xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4'> 
			<section className = 'card bg-base-200 border border-base-300 p-4 min-h-120 gap-2 lg:col-span-2'>

				<h2 className = 'text-xl text-center font-bold p-2'>
					Friends
				</h2>
				<div className='grid lg:grid-cols-2 gap-2'>
				{
					lists?.friends.map(( user ) =>
						{
							return (
								<FriendCard key = { user.id } user = { user } isFriend = { true }>
									<button
										className = 'btn btn-xs btn-error opacity-50 transition-opacity hover:opacity-100' 
										onClick = { () => removeFriend( user.id )}>
										REMOVE
									</button>
								</FriendCard>
							)
						}
					)
				}
				</div>

			</section>
			<section className = 'card bg-base-200 border border-base-300 p-4 min-h-120 gap-2'>

				<h2 className = 'text-xl text-center font-bold p-2'>
					Search
				</h2>

				<input
					type = 'text'
					className = 'input input-bordered w-full gap-2'
					placeholder = 'search a user ...'
					value = { searchName }
					onChange = { ( event ) => setSearchName( event.target.value )}>
				</input>

				{
					searchResult?.map(( user ) =>
						{
							return(
								<FriendCard key = { user.id } user = { user }
									/*onClick = {() => sendRequest( user.id )}*/>
									<button
										className = 'btn btn-xs btn-success opacity-60 transition-opacity hover:opacity-100'
										onClick = { () => sendRequest( user.id )}>
										ADD
									</button>
								</FriendCard>
							)
						})
				}

			</section>

			<section className = 'card bg-base-200 border border-base-300 p-4 min-h-120 gap-2'>

				<h2 className = 'text-xl text-center font-bold p-2'>
					Requests
				</h2>
				{
					lists?.received.map(( user ) =>
						{
							return (
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
							);
						})
				}
{/*				<h3 className = 'text-sm font-semibold opacity-60'>
					Sent
				</h3>*/}
				{
					lists?.sent.map(( user ) =>
						{
							return (
								<FriendCard key = { user.id } user = { user }>
									<span className = 'badge italic opacity-50'>
										waiting
									</span>
									<button
										className = 'btn btn-xs btn-warning opacity-50 transition-opacity hover:opacity-100'
										onClick = { () => removeFriend( user.id )}>
										CANCEL
									</button>
								</FriendCard>
							);
						})
				}

			</section>


		</div>
	);
}