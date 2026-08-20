/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   test.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tjacquel <tjacquel@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/08/19 19:53:18 by tjacquel          #+#    #+#             */
/*   Updated: 2026/08/19 20:34:31 by tjacquel         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



function MyButton() {
	return (
		<button>I&apos;m a button</button>
	);
}

export default function MyApp() {
	return (
		<div>
			<h1>Welcome to my app</h1>
			<MyButton />
		</div>
	);
}