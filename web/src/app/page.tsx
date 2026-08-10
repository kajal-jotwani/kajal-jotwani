import Nav from "@/components/Nav";
import Playhead from "@/components/Playhead";
import ArtBg from "@/components/ArtBg";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Timeline from "@/components/Timeline";
import Projects from "@/components/Projects";
import Blog from "@/components/Blog";
import Ama from "@/components/Ama";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";

export default function Home() {
  return (
    <>
      <ArtBg />
      <Playhead />
      <Nav />
      <main>
        <Hero />
        <About />
        <Timeline />
        <Projects />
        <Blog />
        <section data-section id="chat" className="mx-auto max-w-5xl px-5 py-24">
          <SectionTitle title="say hi" />
          <div className="grid gap-6 md:grid-cols-2">
            <Ama />
            <Booking />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
