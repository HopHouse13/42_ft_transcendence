import type React from "react"
import type { PlayerCardProps } from "../types/gameTypes"

const PlayerCard = ({ player, isTurn, side, username, elo, avatarUrl }: PlayerCardProps): React.ReactElement => {
    const isRight = side === 'right';
    const isBlack = player.color === 'BLACK';
    const stripeShade = isBlack
        ? 'shadow-[inset_2px_0_3px_rgba(255,255,255,0.35),inset_-2px_0_3px_rgba(0,0,0,0.9)]'
        : 'shadow-[inset_2px_0_3px_rgba(255,255,255,0.9),inset_-2px_0_3px_rgba(0,0,0,0.45)]';

    return (
        <div className={isTurn ? 'aura aura-sm aura-silver w-full' : 'w-full'}>
            <div className={`card card-md bg-base-100 w-full flex items-center p-2 gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="avatar">
                    <div
                        className={`h-10 w-10 rounded-full ring-1 ${isBlack ? 'ring-black' : 'ring-white'} ring-offset-base-100 ring-offset-2 outline outline-1 outline-base-300 outline-offset-3`}
                        title={isBlack ? 'Black' : 'White'}
                    >
                        <img
                            src={avatarUrl ?? '/api/uploads/avatars/default.png'}
                            alt={`${username} avatar`}
                        />
                    </div>
                </div>
                <div className={`grow min-w-0 ${isRight ? 'text-right' : 'text-left'}`}>
                    <div className="text-xl font-semibold truncate" title={username}>
                        {username}
                    </div>
                    <div className={`flex items-center gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="badge badge-xs badge-success">
                            {elo !== null ? `ELO ${elo}` : 'ELO --'}
                        </div>
                    </div>
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

export default PlayerCard
