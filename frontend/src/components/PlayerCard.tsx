import type React from "react"
import type { PlayerCardProps } from "../types/gameTypes"

// check if there already is a /api prefix or not for the avatarUrl
const resolveAvatar = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('/api')) return url; // Already safe
    return `/api${url.startsWith('/') ? '' : '/'}${url}`; // Missing prefix
};

const PlayerCard = ({ player, isTurn, side, username, elo, avatarUrl }: PlayerCardProps): React.ReactElement => {
    const isRight = side === 'right';
    const isBlack = player.color === 'BLACK';
    const stripeShade = isBlack
        ? 'shadow-[inset_2px_0_3px_rgba(255,255,255,0.35),inset_-2px_0_3px_rgba(0,0,0,0.9)]'
        : 'shadow-[inset_2px_0_3px_rgba(255,255,255,0.9),inset_-2px_0_3px_rgba(0,0,0,0.45)]';

    const safeAvatar = resolveAvatar(avatarUrl);

return (
        <div className={`w-full ${isTurn ? 'aura aura-sm aura-silver' : ''}`}>

            <div className={`card card-md bg-base-100 w-full flex items-center p-2 gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>

                { avatarUrl &&
                    <div className="avatar">
                        <div
                            className={`h-10 w-10 rounded-full ring-1 ${isBlack ? 'ring-black' : 'ring-white'} ring-offset-base-100 ring-offset-2 outline outline-1 outline-base-300 outline-offset-3`}
                            title={isBlack ? 'Black' : 'White'}
                        >
                            <img
                                src={safeAvatar}
                                alt={`${username} avatar`}
                            />
                        </div>
                    </div>
                }
                <div className={`grow min-w-0 ${isRight ? 'text-right' : 'text-left'}`}>
                    <div className="text-base md:text-xl font-semibold truncate" title={username}>
                        {username}
                    </div>
                    {/* <div className={`flex items-center gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}> */}
                      {/* Only render this gap if ELO exists so we don't create empty margin space */}
                        { elo &&
                          <div className={`flex items-center gap-2 mt-1 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* added whitespace-nowrap to avoid text wrapping to newline when shriking window size  */}
                            <div className="badge badge-xs badge-success whitespace-nowrap opacity-80">
                              ELO {elo}
                            </div>
                          </div>
                        }
                    {/* </div> */}
                </div>
                {/* Lisere de couleur, cote oppose (bord interieur, vers le score) :
                    dernier enfant du flex, le flex-row-reverse l'inverse automatiquement */}
                <div
                    className={`w-1.5 rounded-full self-stretch ${isBlack ? 'bg-black' : 'bg-white'} ${stripeShade}`}
                    title={isBlack ? 'Black' : 'White'}
                    aria-hidden="true"
                />
            </div>
        </div>
    )
}

export default PlayerCard;
