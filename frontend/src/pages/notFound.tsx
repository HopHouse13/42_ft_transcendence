function Notfound(): React.ReactElement {
    return (
        <div className="flex w-full flex-col items-center justify-center py-16">
            <h1 className="text-4xl font-bold mb-8"> Page Not Found</h1>
            <span className="text-lg text-base-content/70">The requested page was not found on this server.</span>
        </div>
    );
};

export default Notfound;