import {
  Navbar,
  Hero,
  FeatureCards,
  HowItWorks,
  CodeExample,
  Testimonials,
  Pricing,
  Footer,
} from "./features";
// import { useAuth } from "@/hooks/useAuth";
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

export default function Home() {
  // const { user } = useAuth();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   // Redirect authenticated users to dashboard
  //   if (user) {
  //     navigate("/dashboard");
  //   }
  // }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <FeatureCards />
        <HowItWorks />
        <CodeExample />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
