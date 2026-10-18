import { NavLink } from "react-router";
import { ChatRoom } from "../components/Chat"

interface MyCardProps {
  title: string;
  text: string;
  route: string;
};

function MyCarousel() {

  return (
    <div className="hover-3d">
      <div className="aura aura-glow rounded-2xl">
        <div className="carousel carousel-vertical rounded-2xl h-40 w-full overflow-y-auto bg-transparent" >

          <div className="carousel-item h-full" >
            <div className="card bg-stone-200/60 text-primary-content w-96">
              <div className="card-body">

                <h2 className="card-title">🤖 Partie Botello</h2>
                <p>Entraîne-toi face au Bot Othello.. </p>

                <div className="card-actions justify-end">
                  <NavLink className="btn btn-soft" to={"/botGame"}> Play now !! </NavLink>
                </div>

              </div>
            </div>
          </div>

          <div className="carousel-item h-full" >
            <div className="card bg-stone-200/60 text-primary-content w-96">
              <div className="card-body">

                <h2 className="card-title">📺 Stream Bot TV</h2>
                <p>Regarde une partie entre deux IA en direct.</p>

                <div className="card-actions justify-end">
                  <NavLink className="btn btn-soft" to="/streamBotGame"> Play now !! </NavLink>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

function MyCard({ title, text, route }: MyCardProps) {

  return (
    <>
    <div className="hover-3d">
      <div className="aura aura-glow rounded-2xl">
        <div className="card bg-stone-200/60 text-primary-content w-96 rounded-2xl">
          <div className="card-body">

            <h2 className="card-title">{title}</h2>
            <p>{text}</p>

            <div className="card-actions justify-end">
              <NavLink className="btn btn-soft" to={route}> Play now !! </NavLink>
            </div>

          </div>
        </div>
      </div>
    </div>

    </>
  );
};


export default function Game() {

  return (
    <div className="flex justify-center items-center">
      {/* Conteneur principal 2 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl items-center">

        {/* Colonne de gauche : Menu des modes de jeu */}
        <div className="flex flex-col gap-4">
          <MyCard title="🎮 Partie Locale" text="Joue en local sur le même écran." route="/LocalGame" />
          <MyCarousel />
          <MyCard title="🛜 Partie Online" text="Affronte des joueurs du monde entier." route="/onlineGame" />
        </div>

        {/* Colonne de droite : Chat global / d'attente */}
        <div className="flex justify-center md:justify-end w-full">
          <ChatRoom />
        </div>

      </div>
    </div>
  );
};
