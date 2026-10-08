
const RULES_BLOCK = [
    {
        title: "Set Up",
        description: ["The game starts with four pawns on the four central cells placed as shown."],
        img: "/Rules/setup.png",
    },
    {
        title: "Make a Move",
        description: ["To place a pawn, you need to capture at least one of your opponent's pawns. If you can't, you have to skip your turn."],
        img: "/Rules/move.png",
    },
    {
        title: "Capture",
        description: ["The capture occurs when one or more opponent pawns are caught in a straight line (horizontal, vertical or diagonal) between one of your pawns and the one you just placed.",
            "Then, they all flip to your color."],
        img: "/Rules/capture.png",
    },
    {
        title: "End of Game",
        description: ["The game ends when the last cell is filled or when no valid move is available for either player.",
            "The player with the most pawns wins."
        ] ,
        img: "/Rules/end_of_game.png",
    },
];

const RulesCard = ({rule}: {rule: (typeof RULES_BLOCK)[number] }) => (
    <div className="flex bg-base-200 p-4 items-center">
        <figure>
            <img src={rule.img} className="max-w-50 aspect-square "/>
        </figure>
        <div className="gap-1 p-4">
            <h3 className="text-lg font-semibold mb-1">{rule.title}</h3>
            {rule.description.map((_, i) =>
                <p className="grow-0 text-sm text-base-content/70">
                    {rule.description[i]}
                </p>
            )}
        </div>
    </div>
);

const Rules = (): React.ReactElement => (
    <div className="flex w-full flex-col items-center justify-center px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Rules</h1>
        <p className="text-xl text-base-content/70 mb-10">
            Let's discover how to play to Othello !
        </p>
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-10">
            {RULES_BLOCK.map((rule) => (
                <RulesCard key={rule.title} rule={rule} />
            ))}
        </div>
    </div>
);

export default Rules;