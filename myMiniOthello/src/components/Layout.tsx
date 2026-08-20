import React, { ReactNode } from "react";

interface LayoutProps{
	children: ReactNode;
}

export default function Layout({children}: LayoutProps) {
	return (
		<div className="game-layout">
			<header className="game-header">
				<h1>OTHELLO</h1>
				<p>
					Jeu de strategie Resversi
				</p>
			</header>

			<main className="game-main">{children}</main>

			<footer className="game-footer">
				<span>Mini-Othello powered with love © {new Date().getFullYear()}</span>
			</footer>
		</div>
	);
}
