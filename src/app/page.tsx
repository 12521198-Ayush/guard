import { Container } from "@/components/Landing_page_comp/Container";
import { Hero } from "@/components/Landing_page_comp/Hero";
import { SectionTitle } from "@/components/Landing_page_comp/SectionTitle";
import { Benefits } from "@/components/Landing_page_comp/Benefits";
import { Video } from "@/components/Landing_page_comp/Video";
import { Testimonials } from "@/components/Landing_page_comp/Testimonials";
import { Faq } from "@/components/Landing_page_comp/Faq";
import { Cta } from "@/components/Landing_page_comp/Cta";
import { Navbar } from "@/components/Landing_page_comp/Navbar";
import { Footer } from "@/components/Landing_page_comp/Footer";

import { benefitOne, benefitTwo } from "@/components/Landing_page_comp/data";
export default function Home() {
  return (
    <>
      <Navbar />

      <Container>
        <Hero />
        <SectionTitle
          preTitle="SERVIZING"
          title=" Why should you use this landing page"
        >
          A world class technology to make your daily life more convenient
          and safe.
        </SectionTitle>

        <Benefits data={benefitOne} />
        <Benefits imgPos="right" data={benefitTwo} />

        <SectionTitle
          preTitle="Watch a video"
          title="Learn how to fullfil your needs"
        >
         A world class technology to make your daily life more convenient
         and safe.
        </SectionTitle>

        <Video videoId="fZ0D0cnR88E" />

        <SectionTitle
          preTitle="Testimonials"
          title="Here's what our customers said"
        >
          Testimonials is a great way to increase the brand trust and awareness.
          Use this section to highlight your popular customers.
        </SectionTitle>

        <Testimonials />

        <SectionTitle preTitle="FAQ" title="Frequently Asked Questions">
          Answer your customers possible questions here, it will increase the
          conversion rate as well as support or chat requests.
        </SectionTitle>

        <Faq />
        <Cta />
      </Container>

      <Footer />
    </>


  );
}
