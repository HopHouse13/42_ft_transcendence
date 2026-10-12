import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queries/queryKeys";

export default function useFriendActions()
{
	const 	queryClient = useQueryClient(); // acces au client Query qui est un objet qui donne l acces a l'ensemble du cache (pour les invalider -> refrechir)

	const	sendRequestMutation = useMutation( // genere un objet avec un ensemble de methode mutation;  pas de gestion signal -> modification du back : dangereux d'interrompre le processus
		{
			mutationFn: async ( receiverId: string ) =>
				{
					const	response = await fetch( // appel au back pour la creation de la relation (la demande d'amis)
						`/api/friend/${ receiverId }`,
						{
							method:			'POST',
							credentials:	'include'
						});
					
					if ( !response.ok )
					{
						const	data = await response.json().catch( () => ({}) ); // si erreur, recuperation des info danas data
						throw ( new Error( data.message || 'Failed to send request' ));
					}
				},
			onSuccess:	() => // Query selon le success ou non de mutationFn, appelle onSuccess
				{
					void	queryClient.invalidateQueries({ queryKey: queryKeys.friends.all }); // invalide la branche d'elements lié a nos 3 listes (friends.all) dans le but de les mettre a jour
				}
		});

	return({
		sendRequest:	( receiverId: string ) => sendRequestMutation.mutate( receiverId ), // expose la methode sendRequestMutation a l'exterieur
		sending:		sendRequestMutation.isPending // bool qui indique l'etat de la requete au back: true -> en cours; false -> ne l'est pas (utile pour eviter les spam bouton)
	});
}

// memo
// clic sur la tuile
//  → sendRequest( 'id-de-bob' )		tu appelles la mutation
//  → mutationFn( 'id-de-bob' )			le fetch POST part vers le back
//  → le back crée la demande (204)
//  → onSuccess							la mutation a réussi
//  → invalidateQueries( friends.all )	tu dis : "la liste est périmée"
//  → useQuery refait le GET			la liste est relue
//  → l'écran se met à jour				Bob apparaît dans "sent"

// Une mutation, c’est une action déclenchée par l’utilisateur qui change des données sur le serveur,
// suivie d’une relecture pour afficher le nouvel état. Dis-moi quelle pièce reste floue et je la détaille.