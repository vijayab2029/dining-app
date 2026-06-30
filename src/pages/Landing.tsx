interface FeatureCardProps {
    title: string
    description: string
}

function FeatureCard({title, description}: FeatureCardProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500">{description}</p>
        </div>
    )
}

function Landing() {
  return (
    <main className="max-w-5xl mx-auto px-6">
      <section className="min-h-screen flex flex-col items-center justify-center py-24">
        <h1 className="font-bold text-5xl text-center">
          Browse menus, track nutrition, eat smarter at Northeastern
        </h1>
        <p className="max-w-4xl text-center text-lg text-gray-500 mt-4">
          Browse dining hall menus in real time, log your meals, get analytics
          and understand your nutrition
        </p>
        <div className="flex gap-4 mt-8">
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium">
            Sign in
          </button>
          <button className="border border-gray-300 text-gray-600 px-6 py-3 rounded-lg font-medium">
            Continue as Guest
          </button>
        </div>
      </section>
      <section className="py-24 text-center">
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
          Our Features
        </h2>
        <div className="flex gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm flex-1">
            <FeatureCard title="Menu Browsing" description="Browse real-time menus across all Northeastern Dining Halls" />
            <FeatureCard title="Nutrition Tracking" description="Log meals and track goals and nutritional intake" />
            <FeatureCard title="Dietary Filters" description="Filter by Vegan, Vegetarian, Halal, Gluten-Free, Allergies and more" />
          </div>
        </div>
      </section>
      <section>
        <h2>How it works</h2>
        <div>
          <h3>1. Browse Menus</h3>
          <p>View real-time menus across all Northeastern Dining halls.</p>
        </div>
        <div>
          <h3>2. Log your meals</h3>
          <p>Save what you ate with a single tap</p>
        </div>
        <div>
          <h3>3. Track your nutrition</h3>
          <p>See your daily calories, protein, and macros at a glance.</p>
        </div>
      </section>
      <section>
        <h2>Ready to eat smarter at Northeastern?</h2>
        <button>Sign In</button>
        <button>Continue as Guest</button>
      </section>
    </main>
  );
}

export default Landing;
