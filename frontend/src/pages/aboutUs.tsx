const AboutUs = (): React.ReactElement => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl font-bold mb-8">Something About Us</h1>
            <p className="text-lg leading-relaxed">
                It might not be the right time<br />
                I might not be the right one<br />
                But there's something about us I want to say<br />
                'Cause there's something between us anyway<br />
                <br />
                I might not be the right one<br />
                It might not be the right time<br />
                But there's something about us I've got to do<br />
                Some kind of secret I will share with you<br />
                <br />
                I need you more than anything in my life<br />
                I want you more than anything in my life<br />
                I'll miss you more than anyone in my life<br />
                I love you more than anyone in my life <br />
                <br />
            </p>
            <p className="opacity-70">
                Authors: Guy Manuel Homem Christo & Thomas Bangalter
            </p>
        </div>
    );
};

export default AboutUs;