import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps{
	children: ReactNode;
}

export default function Layout({children}: LayoutProps) {
	return (
		<div className="flex flex-col flex-1 min-w-full min-h-screen">
			<Header />
			{children}
			<Footer />
		</div>
	);
}