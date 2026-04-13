import Navbar from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Services from "@/components/Services/Services";
import HowItWorks from "@/components/HowItWorks/HowItWorks";
import Stats from "@/components/Stats/Stats";
import WhyUs from "@/components/WhyUs/WhyUs";
import CtaBanner from "@/components/CtaBanner/CtaBanner";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <Stats />
        <WhyUs />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
