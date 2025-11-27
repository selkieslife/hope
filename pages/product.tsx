import { useState, useEffect } from "react"

const productList = [
  {
    id: 1,
    name: "French Cheese Cake",
    subtitle: "Dark chocolate meets hot dog",
    image: "/images/subscribe/LJCDC.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
  {
    id: 2,
    name: "Japanese Cream Puff",
    subtitle: "Filled with clouds and joy",
    image: "/images/subscribe/JCPC.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
  {
    id: 3,
    name: "Fairy Bread Roll",
    subtitle: "A creamy indulgence",
    image: "/images/subscribe/BCC.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
  {
    id: 4,
    name: "Orange Custard Bread",
    subtitle: "Citrus delight in every bite",
    image: "/images/subscribe/OCB.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
  {
    id: 5,
    name: "Nutella Chocolate",
    subtitle: "Sprinkles of nostalgia",
    image: "/images/subscribe/AFBR.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
  {
    id: 6,
    name: "Chicken roll",
    subtitle: "Buttery layers with nutty bliss",
    image: "/images/subscribe/PC.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
  {
    id: 7,
    name: "Cheesy Chicken Bread",
    subtitle: "Crunch meets cream",
    image: "/images/subscribe/IC.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
  {
    id: 8,
    name: "Chocolate Pop",
    subtitle: "Earthy and fluffy",
    image: "/images/subscribe/MRC.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
  {
    id: 9,
    name: "Tiramisu",
    subtitle: "Coffee-infused elegance",
    image: "/images/subscribe/TS.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
  {
    id: 10,
    name: "Banana Walnut Almond Muffin",
    subtitle: "Classic Parisian indulgence",
    image: "/images/subscribe/FE.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
  {
    id: 11,
    name: "Cherry Chocolate Tart",
    subtitle: "Classic Parisian indulgence",
    image: "/images/subscribe/FE.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
  {
    id: 12,
    name: "Sesame Custard Bread",
    subtitle: "Classic Parisian indulgence",
    image: "/images/subscribe/FE.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
  {
    id: 13,
    name: "Pinacolada Cup Cake",
    subtitle: "Classic Parisian indulgence",
    image: "/images/subscribe/FE.webp",

    taste: "",
    overview: "",
    cuisine: "",
    history: "",
    culture: "",
  },
]

const tabs = [
  { id: "taste", label: "Taste" },
  { id: "overview", label: "Overview" },
  { id: "cuisine", label: "Cuisine" },
  { id: "history", label: "History" },
  { id: "culture", label: "Culture" },
]

export default function Products() {
  const [activeProduct, setActiveProduct] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("taste")
  const [pageLoaded, setPageLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setPageLoaded(true), 150)
  }, [])

  return (
    <div className="min-h-screen bg-[#fffaf5] p-4 font-serif">

      {/* PAGE LOAD FADE-IN */}
      <div className={`transition-all duration-700 ${pageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <h1 className="text-3xl font-bold mb-4 animate-slideDown">Our Products</h1>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {productList.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setActiveProduct(p)
                setActiveTab("taste")
              }}
              className="cursor-pointer transform hover:scale-[1.035] transition-all duration-300"
            >
              <div className="overflow-hidden rounded-lg shadow-md">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-40 object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>

              <h2 className="text-lg mt-2 font-semibold">{p.name}</h2>
              <p className="text-sm text-gray-600">{p.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {activeProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white w-[90%] max-w-lg rounded-xl overflow-hidden shadow-xl p-4 relative animate-modalPop">

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setActiveProduct(null)}
              className="absolute top-3 right-3 text-xl hover:scale-110 transition"
            >
              ✕
            </button>

            {/* ZOOMED IMAGE */}
            <img
              src={activeProduct.image}
              className="w-full h-56 object-cover rounded-lg mb-4 animate-imageZoom"
            />

            {/* TITLE */}
            <h2 className="text-2xl font-bold">{activeProduct.name}</h2>
            <p className="text-gray-600 mb-4">{activeProduct.subtitle}</p>

            {/* TABS */}
            <div className="flex gap-3 border-b mb-4 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`pb-2 text-sm transition-all ${
                    activeTab === t.id
                      ? "border-b-2 border-orange-500 text-orange-600 font-medium"
                      : "text-gray-600 hover:text-orange-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* CONTENT */}
            <div className="text-[#3c2f2f] leading-relaxed text-sm animate-fadeInSlow">
              {activeTab === "taste" && <p>{activeProduct.taste}</p>}
              {activeTab === "overview" && <p>{activeProduct.overview}</p>}
              {activeTab === "cuisine" && <p>{activeProduct.cuisine}</p>}
              {activeTab === "history" && <p>{activeProduct.history}</p>}
              {activeTab === "culture" && <p>{activeProduct.culture}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ANIMATIONS */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        @keyframes modalPop {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-modalPop {
          animation: modalPop 0.35s ease-out forwards;
        }

        @keyframes imageZoom {
          0% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-imageZoom {
          animation: imageZoom 0.5s ease-out;
        }

        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        @keyframes fadeInSlow {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeInSlow {
          animation: fadeInSlow 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
