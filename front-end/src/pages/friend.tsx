import useFriendDisplay from '../hooks/useFriendDisplay';
import useFriendActions from '../hooks/useFriendActions';
import useAllUsers from '../hooks/useAllUsers'; // aSupp
import FriendCard from '../components/FriendCard'; // export default -> pas de {}

export default function Friend() // une page = une fonction avec un retour avec la page construite 
{
	const	{ lists, loading, error } = useFriendDisplay(); // le hook qui recupere la donnée des 3 listes pour pouvoir actualiser les listes
	const	{ usersList } = useAllUsers(); // hook qui recupere la list des users
	const	{ sendRequest } = useFriendActions(); // hook pour les actions sur les listes 

	if ( loading )
		return ( <p>Loading...</p> );
	
	if ( error )
		return ( <p>{ error }</p> );

	return (
		<div className='w-full max-w-md lg:max-w-4xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-2'> {/* décrit l 'element: element d'une taille max, centré, marge interieur. L'element sera composé d'une grille de 3 colonnes ou une si phone */}
			
			<section className='card bg-base-200 border border-base-300 p-4 min-h-120 gap-2'> {/* section represente une des 3 colonnes annoncé au dessus, `card` est un composant daisyUI(librairie de composants), `bg`-> le fond, `border` -> contour, `p-4` -> marge interieur*/}
				<h2 className='text-xl text-center font-bold'> {/* h2 -> header2, text-lg -> le test prendre plus de place, bold -> gras */}
					Search
				</h2>

				{
					usersList?.map(( user ) =>
						{
							return(
								<FriendCard key = { user.id } user = {{ ...user, elo: 0 }} onClick={ () => sendRequest( user.id ) }>
								<button className='btn btn-xs btn-success opacity-60 transition-opacity hover:opacity-100'>
								ADD
								</button>
								</FriendCard>
							)
						})
				}
				<FriendCard user = {{ id: '1', username: 'Benoit', avatarUrl: '', elo: 1200 }} onClick={ () => console.log( 'click' ) }>
					<button className='btn btn-xs btn-success opacity-60 transition-opacity hover:opacity-100'>
						ADD
					</button>
				</FriendCard>
				<FriendCard user = {{ id: '1', username: 'Mael', avatarUrl: '', elo: 1200 }}>
					<button className='btn btn-xs btn-success opacity-60 transition-opacity hover:opacity-100'>
						ADD
					</button>
				</FriendCard>
				<FriendCard user = {{ id: '1', username: 'Thomas', avatarUrl: '', elo: 1200 }}>
					<button className='btn btn-xs btn-success opacity-60 transition-opacity hover:opacity-100'>
						ADD
					</button>
				</FriendCard>

			</section>
			<section className='card bg-base-200 border border-base-300 p-4 min-h-120 gap-2'>
				<h2 className='text-xl text-center font-bold'>
					Requests
				</h2>
				<FriendCard user = {{ id: '1', username: 'Cheveulu', avatarUrl: '', elo: 1200 }}>
					<button className='btn btn-xs btn-success opacity-60 transition-opacity hover:opacity-100'>
						ACCEPT
					</button>
					<button className='btn btn-xs btn-error opacity-50 transition-opacity hover:opacity-100'>
						REMOVE
					</button>
				</FriendCard>
				<FriendCard user = {{ id: '1', username: 'Cheveulu', avatarUrl: '', elo: 1200 }}>
					<button className='btn btn-xs' disabled>
						WAITING
					</button>
				</FriendCard>

			</section>
			<section className='card bg-base-200 border border-base-300 p-4 min-h-120 gap-2'>
				<h2 className='text-xl text-center font-bold'>
					Friends
				</h2>
				{
					lists?.friends.map(( friend ) =>
						{
							return (
								<FriendCard key = { friend.id } user = { friend }> {/* React, lors d'affichages de liste a besoin du key pour identifier chaque element de la liste */}
									<button className='btn btn-xs btn-error opacity-50 transition-opacity hover:opacity-100'>
										REMOVE
									</button>
								</FriendCard>
							)
						})
				}
				<FriendCard user = { {id: '1', username: 'CheveuluBoss', avatarUrl: '', elo: 6200 }}>
					<button className='btn btn-xs btn-error opacity-50 transition-opacity hover:opacity-100'>
						REMOVE
					</button>
				</FriendCard>
			</section>

		</div>
	);
}