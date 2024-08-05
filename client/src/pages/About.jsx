import React from "react";
import { JobImg } from "../assets";

const About = () => {
  return (
    <div className='container mx-auto flex flex-col gap-8 2xl:gap-14 py-6 '>
      <div className='w-full flex flex-col-reverse md:flex-row gap-10 items-center p-5'>
        <div className='w-full md:2/3 2xl:w-2/4'>
          <h1 className='text-3xl text-blue-600 font-bold mb-5'>About Us</h1>
          <p className='text-justify leading-7'>
          We are a biotechnology company that has created an innovative vaccine production platform technology designed to make veterinary vaccines easily accessible and affordable. At Iraka Biotech, we believe in creating more than our clients can consume, which is why our innovative manufacturing process focuses on sustainability. Our technology was created to enhance the local production of veterinary vaccines to ensure that you have access to high-quality and effective vaccines for pets and animal patients alike, no matter where you are. It doesn’t matter if you’re a veterinarian, farmer, or pet owner. Our vaccines are readily available when you need them.
          </p>
        </div>
        <img src={JobImg} alt='About' className='w-auto h-[300px]' />
      </div>

      <div className='leading-8 px-5 text-justify'>
        <p>
        We are a biotechnology company that has created an innovative vaccine production platform technology designed to make veterinary vaccines easily accessible and affordable. At Iraka Biotech, we believe in creating more than our clients can consume, which is why our innovative manufacturing process focuses on sustainability. Our technology was created to enhance the local production of veterinary vaccines to ensure that you have access to high-quality and effective vaccines for pets and animal patients alike, no matter where you are. It doesn’t matter if you’re a veterinarian, farmer, or pet owner. Our vaccines are readily available when you need them.
        </p>
      </div>
    </div>
  );
};

export default About;
