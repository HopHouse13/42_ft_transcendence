import { useQuery } from "@tanstack/react-query";

export default function  ()
{
	const	query = useQuery(
		{
			queryKey:	[ 'friends', 'allUsers' ],
			queryFn:	async ({ signal }) =>
			{
				const	response = await fetch(
					'/api/user',
					{
						credentials:	'include',
						signal
					});

				if ( !response.ok )
					throw new Error( 'Failed to load users' );

				return (( await response.json() ) as { id: string; username: string; avatarUrl: string }[] );
			}
		});

	return ({ usersList: query.data ?? [] });
}