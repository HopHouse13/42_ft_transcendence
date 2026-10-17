import React from 'react';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from './contexts/AuthProvider.tsx';
import Layout from './components/Layout.tsx';
import AppRouter from './routes/router.tsx';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; {/*DEBUG*/}

const queryClient = new QueryClient();

const App = (): React.ReactElement =>(
	<QueryClientProvider client={queryClient}>
		<AuthProvider>
			<BrowserRouter>
				<Layout>
					<main className="flex flex-col flex-grow items-center justify-center bg-base-100 py-2">
						<AppRouter />
					</main>
				</Layout>
			</BrowserRouter>
		</AuthProvider>
		<ReactQueryDevtools /> {/*DEBUG*/}
	</QueryClientProvider>
);

export default App;
