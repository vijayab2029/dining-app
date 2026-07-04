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
interface StepCardProps {
  stepNumber: string
  stepTitle: string
  stepDescription: string
}
function StepCard({stepNumber, stepTitle, stepDescription}: StepCardProps) {
  return(
    <div className="bg-white rounded-xl px-6 py-8 shadow-sm flex-1">
      <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4 text-white font-medium">
        {stepNumber}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{stepTitle}</h3>
      <p className="text-gray-500">{stepDescription}</p>
    </div>
  )
}
interface ContainerProps {
  children: React.ReactNode
}
function Container({children}: ContainerProps) {
  return(
    <div className="max-w-6xl mx-auto px-6 border-x border-gray-200">
      {children}
    </div>
  )
}
function Landing() {
  return (
    <main>
      <Container>
        <section className="min-h-screen flex flex-col items-center justify-center py-24 border-b border-gray-200 bg-[url(/stetson_east.jpg)] bg-fixed bg-cover relative">
        <div className="absolute inset-0 bg-green-900/70"></div>
          <h1 className="relative z-10 font-bold text-5xl text-center text-white">
            Browse menus, track nutrition, eat smarter at Northeastern
          </h1>
          <p className="relative z-10 max-w-4xl text-center text-lg text-white/90 mt-4">
            Browse dining hall menus in real time, log your meals, get analytics
            and understand your nutrition
          </p>
          <div className="flex gap-4 mt-8">
            <button className="relative z-10 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-150">
              Sign in
            </button>
            <button className="relative z-10 border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-green-900 transition-colors duration-150">
              Continue as Guest
            </button>
          </div>
        </section>
        <section className="bg-green-600 py-8 text-white text-center">
          <p className="text-lg font-medium">Stats coming soon</p>
        </section>
        <section className="py-24 text-center border-b border-gray-200">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            Our Features
          </h2>
          <div className="flex gap-6">
            <FeatureCard title="Menu Browsing" description="Browse real-time menus across all Northeastern Dining Halls" />
            <FeatureCard title="Nutrition Tracking" description="Log meals and track goals and nutritional intake" />
            <FeatureCard title="Dietary Filters" description="Filter by Vegan, Vegetarian, Halal, Gluten-Free, Allergies and more" />
          </div>
        </section>
        <section className="py-24 text-center">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">How it works</h2>
          <div className="flex gap-6">
            <StepCard stepNumber="1" stepTitle="Browse Menus" stepDescription="View real-time menus across all Northeastern Dining halls"/>
            <StepCard stepNumber="2" stepTitle="Log your meals" stepDescription="Save what you ate with a single tap"/>
            <StepCard stepNumber="3" stepTitle="Track your nutrition" stepDescription="See your daily calories, protein, and macros at a glance."/>
          </div>
        </section>
      </Container>
      <section className="bg-gray-900 pt-6 pb-28 mt-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-white mt-16">Ready to eat smarter at Northeastern?</h2>
          <p className="text-white mt-2">Your menu. Your nutrition.</p>
          <div className="flex justify-center">
            <button className="bg-green-600 text-white px-12 py-3 rounded-lg font-medium mt-8 hover:bg-green-700 transition-colors duration-150">Sign Up</button>
          </div>
        </div>
      </section>
    </main>
  );
}
export default Landing;