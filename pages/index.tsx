// pages/index.tsx
import Head from 'next/head'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

export default function Home() {
  return (
    <>
      <Head>
        <title>Selkie’s – Global Bakes</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <header className="hero">
        <nav className="navbar">
          <div>☰</div>
          <div>Selkie’s</div>
          <div>🛒</div>
        </nav>

        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 5000 }}
          loop={true}
          grabCursor={true}
          className="swiper"
        >
          {[
            {
              image: '/images/Long John Cruller - Dark Chocolate.webp',
              title: 'Long John Cruller',
              desc: 'Dark chocolate meet hot dog, wildly addictive'
            },
            {
              image: '/images/Japanese Cream Puff - Chocolate.webp',
              title: 'Japanese Cream Puff',
              desc: 'Filled with clouds and joy'
            },
            {
              image: '/images/Australian Fairy Bread Roll.webp',
              title: 'Fairy Bread Roll',
              desc: 'Sprinkled nostalgia from Down Under'
            },
            {
              image: '/images/Blueberry Cheesecake.webp',
              title: 'Blueberry Cheesecake',
              desc: 'Cheesecake, but grown-up'
            },
            {
              image: '/images/Orange Custard Bread.webp',
              title: 'Orange Custard Bread',
              desc: 'Zest meets crumb in this citrus-laced hit'
            }
          ].map((slide, index) => (
            <SwiperSlide
              key={index}
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh'
              }}
            >
              <div className="slide-content">
                <h2>{slide.title}</h2>
                <p>{slide.desc}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button className="cta-button">Explore Menu</button>
      </header>

      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Georgia', serif;
          background: #fffaf5;
          color: #3c2f2f;
        }
        .navbar {
          position: absolute;
          top: 0;
          width: 100%;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          z-index: 10;
        }
        .hero {
          position: relative;
          width: 100vw;
          height: 100vh;
        }
        .slide-content {
          position: absolute;
          bottom: 15%;
          left: 6%;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          max-width: 80%;
        }
        .slide-content h2 {
          font-size: 1.6rem;
          margin-bottom: 0.4rem;
        }
        .slide-content p {
          font-size: 1rem;
        }
        .cta-button {
          position: absolute;
          bottom: 5%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.1);
          border: 1.5px solid white;
          color: white;
          font-size: 1rem;
          padding: 0.6rem 1.4rem;
          border-radius: 24px;
          cursor: pointer;
          backdrop-filter: blur(6px);
          z-index: 9;
        }
      `}</style>
    </>
  )
}
