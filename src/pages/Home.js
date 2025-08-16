import React from "react";
import { Collection, Footer, HomeHero, Slider } from "../components";
const Home = () => {
  return (
    <div>
      <Slider />
      <Collection area="popup" title="SẢN PHẨM MỚI NHẤT" />
      <HomeHero />
    </div>
  );
};

export default Home;
