import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-space-dark relative overflow-hidden">
      <div className="stars absolute inset-0 z-0"></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-display font-bold mb-4 text-space-highlight">Starbelter</h1>
          <p className="text-xl max-w-2xl mx-auto text-gray-300">
            Embark on an epic tabletop role-playing adventure across the cosmos. Create characters,
            explore strange new worlds, and forge your own path among the stars.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            title="Create a Character"
            description="Design and customize your own space explorer, from intrepid human astronauts to exotic alien species."
            linkText="Get Started"
            linkTo="/characters/create"
          />

          <FeatureCard
            title="Find Adventures"
            description="Browse through a collection of ready-to-play adventures or create your own cosmic stories."
            linkText="Explore"
            linkTo="/adventures"
          />

          <FeatureCard
            title="Start a Game"
            description="Begin a new gaming session, invite friends, and set off on your interstellar adventure."
            linkText="Launch"
            linkTo="/game"
          />
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-display font-bold mb-6 text-space-highlight">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              number={1}
              title="Create Your Character"
              description="Design your space explorer with unique skills, background, and equipment."
            />
            <StepCard
              number={2}
              title="Choose an Adventure"
              description="Pick from existing cosmic quests or create a new storyline for your crew."
            />
            <StepCard
              number={3}
              title="Explore the Galaxy"
              description="Make choices, roll dice, and experience the story as it unfolds."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  linkText: string;
  linkTo: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, linkText, linkTo }) => (
  <Link
    to={linkTo}
    className="bg-space-gray rounded-lg p-6 transition-transform hover:scale-105 block"
  >
    <h2 className="text-2xl font-bold mb-2 text-space-highlight">{title}</h2>
    <p className="text-gray-400 mb-4">{description}</p>
    <div className="text-space-highlight font-semibold">{linkText} →</div>
  </Link>
);

interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => (
  <div>
    <div className="h-24 w-24 rounded-full bg-space-accent flex items-center justify-center mx-auto mb-4">
      <span className="text-3xl font-bold">{number}</span>
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

export default Home;
