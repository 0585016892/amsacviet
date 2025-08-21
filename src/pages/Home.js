import React from "react";
import { Collection, GuitarViewer, HomeHero, Slider } from "../components";
const Home = () => {
  return (
    <div>
      <Slider />
      <Collection area="popup" title="SẢN PHẨM MỚI NHẤT" />
      <HomeHero />
      <GuitarViewer />
    </div>
  );
};

export default Home;
