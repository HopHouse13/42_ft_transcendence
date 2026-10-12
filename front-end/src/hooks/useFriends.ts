import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "./useAuthContext";
import { queryKeys } from "../queries/queryKeys";
import type { FriendLists } from "../types/friendTypes";

export function useFriends()
{
	const 	{ user }  = useAuthContext(); // recupere uniquement le user si session active

	// query represente le retour du hook 'useQuery'. Ce hook fait partie de la librairie Query qui gère la donnée au niveau du navigateur
	const	query = useQuery(
		{
			queryKey:	queryKeys.friends.list( user?.id ?? '' ), // pose l'etiquette definie dans queryKeys.ts, l'arbre de la gestion des caches
			enabled:	Boolean( user ), // s'active seulement si un user existe (session active)
			queryFn:	async ({ signal }): Promise< FriendLists > => // queryFn -> champ de recuperation de la donnée du back; param signal est une destructuration de l'objet transmis par Query
			{
				const	response = await fetch( // methode pour appeler le back via un endpoint et récupérer sa reponse
				'/api/friend', // endpoint du back
				{
					credentials: 'include', // force le navigateur a poser les cookies d'auth dans la requete
					signal // annule la requete en cours si la page disparait ou si la clé change ( systeme de signaux -> AbortSignal )
				});

				if ( !response.ok ) // vérification si le processus de récupération de la donnée s'est correctement exécuté
					throw new Error( 'Failed to load friends.' );

				return ( await response.json() ) as FriendLists; // retourne le json de la reponse du back et le type comme FriendLists
			}
		});
	return ({
		lists:		query.data ?? null, // lists prend le retour de queryFn, cad le json avec nos 3 listes
		loading:	query.isLoading, // indique si le chargement de data est en cours ou fini
		error:		query.error instanceof Error ? query.error.message : null // recupere l'erreur de Query ou null s'il n'y en a pas
		});
}