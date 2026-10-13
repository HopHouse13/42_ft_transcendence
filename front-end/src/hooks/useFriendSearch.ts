import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queries/queryKeys";
import { useAuthContext } from "./useAuthContext";
import type { FriendUser } from "../types/friendTypes";

export default function  useFriendSearch( searchName: string )
{
	const	{ user } = useAuthContext(); // recupere les info de la session active avec api/auth/me
	const	searchNameTrimmed = searchName.trim(); // supprime les espace avant et apres le contenu de la string (cela alège la mise en cache des recherches)

	const	query = useQuery(
		{
			queryKey:	queryKeys.friends.search( user?.id ?? '', searchNameTrimmed ), // defini sous quelle l'etiquette la donnée (retour de queryFn) va etre en cache 
			enabled:	Boolean( user ) && searchNameTrimmed.length > 0, // condition pour lancer queryFn
			queryFn:	async ({ signal }): Promise< FriendUser[] > =>
			{
				const	response = await fetch(
					`/api/friend/search?query=${ encodeURIComponent( searchNameTrimmed )}`, // encodeURIComponent securise les données placé en URI en remplaçant les char sensibles
					{
						credentials:	'include',
						signal
					}	
				);

				if ( ! response.ok )
					throw new Error( 'Failed to search users' );

				return (( await response.json() ) as FriendUser[] ); // le retour de queryFn est stocké dans query.data
			}
		}
	);

	return ({ searchResult: query.data ?? [] }); // retourne un tableau de FriendUser; resultat de la requete
}