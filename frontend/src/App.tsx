import React from 'react';
import { BrowserRouter } from 'react-router';
import Layout from './components/Layout.tsx';
import AppRouter from './routes/router.tsx';
import { PresenceConnection } from './hooks/usePresence';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui/ToastProvider.tsx';

const queryClient = new QueryClient();

const App = (): React.ReactElement =>(
	<QueryClientProvider client={queryClient}>
		<PresenceConnection />
		<BrowserRouter>
			<ToastProvider>
				<Layout>
					<main className="w-full min-w-0 max-w-full flex flex-col flex-1 items-center justify-center bg-base-100 py-2 overflow-x-auto">
						<AppRouter />
					</main>
				</Layout>
			</ToastProvider>
		</BrowserRouter>
	</QueryClientProvider>
);

export default App;
