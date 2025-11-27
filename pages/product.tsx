import { useState, useEffect } from "react"

const productList = [
  {
    id: 1,
    name: "French Cheese Cake",
    subtitle: "A silky French classic with a whisper-light finish.",
    image: "/images/subscribe/.webp",

    taste: "",
    overview: "French cheesecake is celebrated for its feather-light texture and refined flavour profile.
Unlike its dense American counterpart, the French version uses fresh cheeses like fromage blanc, crème fraîche, or soft cream cheese to create a smooth, custard-like consistency.
It’s subtly sweet, delicately tangy, and often served plain to let the quality of the dairy shine.
This dessert is a true expression of French culinary philosophy — simple ingredients elevated with exacting technique.",
    cuisine: "French patisserie tradition with influences from Normandy’s dairy-rich heritage.",
    history: "Its roots trace back to 18th-century Normandy, where dairy farms produced some of France’s richest cheeses.
French cooks adapted local cheeses into a baked dessert that balanced airiness with richness.
As patisseries evolved through the 19th and 20th centuries, French cheesecake became a café staple, admired for its elegance and restraint.",
    culture: "French cheesecake sits at the heart of France’s café culture, where desserts are savored slowly with espresso and conversation.
It mirrors the country's lifestyle: a blend of refinement, balance, and appreciation for everyday beauty.

French culture embraces culinary artistry the same way it celebrates its national arts — from Impressionist painting to haute couture — all guided by precision and emotion.

Sports also play a major role in French life, especially football, cycling (with the world-famous Tour de France), and tennis.
French cheesecake often appears in celebrations, family gatherings, and café menus, subtly reflecting the country’s blend of athletic spirit and artistic heritage.",
  },
  {
    id: 2,
    name: "Japanese Cream Puff",
    subtitle: "A cloud-soft choux shell filled with delicate Japanese cream.",
    image: "/images/JCPC.webp",

    taste: "",
    overview: "Japanese choux pastry is lighter, softer, and more delicate than traditional French choux.
The shell is airy with a gentle crispness, and the cream filling is incredibly smooth — often made with custard, fresh cream, or a blend called “crème diplomate.”
Japan’s approach emphasizes balance: not too sweet, perfectly fluffy, and crafted with meticulous attention to texture.
This pastry has become a signature item in modern Japanese bakeries, admired for its refinement and melt-in-the-mouth experience.",
    cuisine: "Japanese patisserie inspired by French techniques, elevated through precision and subtle flavor harmony.",
    history: "Japan adopted French pastry techniques during the Meiji era, a period when Western culture and cuisine began influencing Japanese food.
Choux pastry quickly became a favorite, and Japanese pâtissiers transformed it by using lighter creams and precise steaming-baking methods.
By the late 20th century, choux cream (also known as shūkurīmu) had become a nationwide sensation — available in convenience stores, artisanal bakeries, and high-end pâtisseries across the country.",
    culture: "Japanese choux pastry reflects the culture’s deep respect for craftsmanship (“shokunin spirit”), where even simple desserts are perfected through technique and patience.
It’s a snack enjoyed across all generations — from schoolchildren buying it after class to adults enjoying it during quiet tea breaks.

Japan’s broader culture emphasizes harmony, discipline, and minimalism, traits that show up in everything from food presentation to interior design.

Japan is also a global powerhouse in sports — especially baseball, sumo wrestling, football, and martial arts such as judo and karate.
Choux pastries often appear in seasonal events, festivals, and even as themed treats tied to sports celebrations.

In art, Japan is known for its elegance and expressive minimalism — from ukiyo-e woodblock prints to anime and modern design.
The sensibility behind Japanese art also influences the look and feel of their patisserie: clean, precise, and emotionally resonant.",
  },
  {
    id: 3,
    name: "Fairy Bread Roll",
    subtitle: "A nostalgic Australian treat wrapped in a soft, cloud-light roll.",
    image: "/images/subscribe/BCC.webp",

    taste: "",
    overview: "The Fairy Bread Roll takes the beloved Australian party classic — buttered bread covered in colorful sprinkles — and elevates it with a bakery-style twist.
Instead of simple sliced bread, this version uses a soft, pillowy milk roll that adds richness and structure.
The sprinkles create a satisfying crunch, contrasting with the airy interior, while the buttery layer ties everything together in a sweet, nostalgic harmony.
It’s playful yet refined, capturing the heart of Australia’s carefree spirit.",
    cuisine: "Australian childhood comfort food reimagined through modern bakery craftsmanship.",
    history: "Fairy bread first appeared in Australian celebrations in the early 20th century and quickly became a birthday-party essential.
The name was inspired by a Robert Louis Stevenson poem, and the delightfully simple recipe made it a national icon.
Innovative bakers later transformed the classic into roll form — keeping the nostalgia while enhancing the texture and flavor through artisan baking techniques.
Today, it symbolizes childhood joy and Australia’s relaxed approach to food.",
    culture: "The Fairy Bread Roll reflects Australia’s culture of openness, celebration, and simple pleasures.
It embodies the Aussie love for bright colors, outdoor gatherings, and foods that bring people together without pretension.

Australia is a nation deeply connected to sports — from cricket to rugby, football, tennis, and the legendary surfing culture along its coasts.
Fairy bread often appears at school events, sports club gatherings, and community celebrations, becoming a symbol of fun and togetherness.

In art, Australia blends Indigenous storytelling traditions with contemporary expression — from dot paintings and Dreamtime narratives to modern street art and digital illustration.
The vibrant colors of fairy bread align perfectly with Australia’s bold artistic identity, making it a treat that feels culturally expressive as well as delicious.",
  },
  {
    id: 4,
    name: "Orange Custard Bread",
    subtitle: "A soft Taiwanese milk bread filled with bright, citrus-kissed custard.",
    image: "/images/subscribe/OCB.webp",

    taste: "",
    overview: "Orange Custard Bread is a tender, cloud-soft milk loaf filled or topped with silky citrus custard made from fresh orange zest.
The bread itself is light, slightly sweet, and incredibly fluffy — a hallmark of Taiwanese baking.
The custard brings a refreshing brightness, combining creamy richness with a natural fruity aroma.
It’s the kind of bakery item that feels both comforting and uplifting, perfect for breakfast, tea time, or café displays.",
    cuisine: "Taiwanese bakery culture influenced by Japanese softness and local tropical flavors.",
    history: "Taiwan’s modern bakery culture developed during the 20th century, heavily inspired by Japanese milk bread techniques.
As local bakers experimented, they began incorporating native island flavors like citrus, pineapple, and mango.
Orange custard became a popular addition because Taiwan’s subtropical climate produces fragrant, high-quality oranges.
This bread reflects the evolution of Taiwanese pastry — blending softness, mild sweetness, and vibrant fruit notes.",
    culture: "Orange Custard Bread represents the warmth and creativity of Taiwanese daily life.
It mirrors Taiwan’s love for bakery shops, night-market snacks, and breakfast culture, where soft breads paired with tea or milk are everyday favorites.

Taiwan’s culture values harmony, craftsmanship, and gentle innovation — the same traits seen in its cuisine, technology, and design.

Taiwanese sports culture is strong and diverse, especially in baseball, basketball, badminton, and table tennis.
Bakery treats like this often appear at school sports events, weekend gatherings, and family picnics.

In art, Taiwan balances traditional Chinese influences with modern expression — from temple carvings and indigenous art to contemporary murals and pop culture styles seen in Taipei’s creative districts.
The bright, cheerful aesthetic of orange custard bread resonates with this blend of tradition and modernity.",
  },
  {
    id: 5,
    name: "Nutella Chocolate",
    subtitle: "A soft Italian sponge crowned with rich Nutella chocolate.",
    image: "/images/subscribe/AFBR.webp",

    taste: "",
    overview: "This Nutella Chocolate Cake is a beautifully simple dessert: a fluffy, buttery sponge topped with a generous layer of smooth Nutella.
No fillings, no extras — just pure, comforting flavor.
The lightness of the cake pairs perfectly with the creamy hazelnut-cocoa topping, creating a balanced sweetness that melts on the palate.
It’s the kind of cake that feels homemade yet refined, perfect for coffee breaks, dessert menus, and cozy café displays.",
    cuisine: "Italian home-style baking with modern café elegance, inspired by Piedmont’s famous hazelnut chocolate traditions.",
    history: "The inspiration for this cake traces back to Italy’s post-war confectionery heritage.
During times of cocoa scarcity, Italian bakers created gianduja — a blend of hazelnuts and cocoa — which later evolved into Nutella.
Italian home bakers soon began spreading Nutella over simple sponge cakes, creating an affordable yet indulgent dessert that became a family classic.
This modern version celebrates that tradition with a cleaner, bakery-style execution.",
    culture: "Nutella Chocolate Cake reflects Italy’s love for simple pleasures — warm kitchens, shared meals, and desserts that bring people together.
It’s a staple in Italian homes, school celebrations, and afternoon snacks enjoyed with a cup of strong espresso.

Italian culture blends passion, creativity, and precision — values seen across its food, fashion, and architecture.
In sports, Italy shines brightly in football, cycling, and motorsports, especially with legendary brands like Ferrari and Ducati.
Cakes like this often appear during local community events, birthday gatherings, and even sports club celebrations.

In art, Italy’s legacy spans from Renaissance frescoes to modern design and cinema.
The minimal, elegant nature of this cake mirrors Italian artistic philosophy — beauty through simplicity.",
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
    subtitle: "A luxurious Italian coffee-soaked dessert layered with mascarpone and elegance.",
    image: "/images/subscribe/TS.webp",

    taste: "",
    overview: "This Tiramisu is a beautifully layered dessert presented in a clean, modern box that keeps the texture intact and the flavors perfectly preserved.
Inside, soft sponge layers soak up rich espresso, blending seamlessly with smooth mascarpone cream.
A dusting of cocoa on top adds a bittersweet finish that balances the dessert’s velvety sweetness.
The boxed format also makes it ideal for cafés, gifting, and takeout — offering the full authentic Italian experience without any mess.",
    cuisine: "Classic Italian dolce originating from Veneto, crafted with espresso, mascarpone, and cocoa.",
    history: "Tiramisu was born in the Veneto region of Italy during the 1960s, created by Italian pastry masters seeking a dessert that was both uplifting and comforting.
The name literally means "pick me up" — a reference to the energizing combination of coffee, cream, and sugar.
Over time, Tiramisu became a symbol of modern Italian pastry, bridging restaurant fine dining with home-style comfort.",
    culture: "Tiramisu represents Italy’s devotion to food that feels emotional, comforting, and artistic.
It’s commonly enjoyed during family gatherings, café evenings, and celebrations, reflecting Italy’s philosophy of savoring dessert slowly and joyfully.

Italian culture blends elegance with passion — from classic Renaissance art to modern cinema and fashion.
The presentation of Tiramisu in a box mirrors Italy’s balance of beauty and practicality, keeping the layers perfect while enhancing visual appeal.

Sports are also woven into Italy’s national identity, especially football, cycling, and motorsports.
Boxed tiramisu often shows up at community events, team gatherings, and weekend celebrations, making it a dessert as social as it is flavorful.

In art, Italy’s influence stretches across architecture, sculpture, painting, and modern design.
Tiramisu reflects that creative heritage — a dessert built on precise layering, texture, and sensory harmony.",
  },
  {
    id: 10,
    name: "Banana Walnut Almond Muffin",
    subtitle: "A warm American-style muffin loaded with ripe banana sweetness and crunchy roasted nuts.",
    image: "/images/subscribe/FE.webp",

    taste: "",
    overview: "The Banana Walnut Almond Muffin is a soft, moist American favorite made with mashed ripe bananas, golden batter, and a generous mix of toasted nuts.
The muffin rises tall and fluffy, with pockets of natural banana sweetness and rich nutty crunch in every bite.
Walnuts bring an earthy depth, while almonds add a clean, crisp finish — creating a muffin that feels nourishing, flavorful, and deeply satisfying.
Perfect for breakfast, coffee breaks, or afternoon snacks, it represents the comforting, home-style warmth of American baking.",
    cuisine: "Classic American café baking with a wholesome blend of bananas, walnuts, and almonds.",
    history: "Banana muffins became popular across the United States during the early 1900s, when home cooks began experimenting with baking powder and quick-bread recipes.
Overripe bananas — once considered waste — became a staple ingredient in American households during the Great Depression, leading to banana bread and eventually the banana muffin.
Adding nuts elevated the recipe into a more premium café-style treat, and by the late 20th century, banana walnut muffins were a staple in diners, bakeries, and coffee shops nationwide.
The addition of almonds is a modern twist that brings extra texture and flavor sophistication.",
    culture: "This muffin reflects the heart of American café culture — warm pastries, fresh coffee, and grab-and-go breakfast habits.
It’s a classic found in diners, college cafés, office meetings, and weekend brunch tables across the country.

Sports also play a huge role in American life — especially basketball, baseball, American football, and track events.
Banana-nut muffins are often seen as an energy-rich snack for athletes, students, hikers, and people with active lifestyles, thanks to the banana carbs and nut proteins.

American art and culture celebrate bold simplicity — from jazz and street murals to contemporary design and film.
The rustic, golden look of this muffin fits perfectly into that aesthetic: warm, inviting, and effortlessly photogenic, often featured in café menus, bakery displays, and lifestyle branding across the USA.",
  },
  {
    id: 11,
    name: "Cherry Chocolate Tart",
    subtitle: "A rich British chocolate tart layered with vibrant cherry sweetness.",
    image: "/images/subscribe/FE.webp",

    taste: "",
    overview: "The Cherry Chocolate Tart from the UK blends deep, velvety chocolate ganache with bright, tangy cherry compote, all nestled inside a crisp, buttery tart shell.
The chocolate offers smooth richness, while the cherries add a lively burst of acidity that keeps the dessert balanced and indulgent.
Every bite mixes crunch, creaminess, and fruity brightness — creating a tart that feels elegant yet comforting.
It’s the kind of dessert that fits perfectly in British cafés, afternoon tea tables, and modern bakeries.",
    cuisine: "Modern British patisserie influenced by classic tarts and bold, fruit-forward flavors.",
    history: "Tarts have been a cornerstone of British baking for centuries, dating back to medieval custard and fruit tarts served at royal feasts.
Over time, British patisserie evolved to include chocolate variations influenced by European pastry techniques.
Cherries, widely grown in regions like Kent (known as the “Garden of England”), became a natural pairing for chocolate desserts in modern UK bakeries.
The Cherry Chocolate Tart represents this evolution — heritage tart craft meets contemporary flavor combinations.",
    culture: "This tart reflects the UK’s love for classic desserts enjoyed during afternoon tea, Sunday gatherings, and cozy café visits.
The combination of chocolate and cherry feels nostalgic yet stylish, echoing the British charm of simple ingredients turned into refined comfort food.

Sports play a major role in people’s daily life in the UK — from football to cricket, rugby, tennis (especially Wimbledon), and athletics.
Desserts like this often appear in celebrations, match-day gatherings, school events, and cafés near stadiums and parks.

British art is known for its expressive storytelling — from Shakespearean theatre and classical painting to modern pop art, fashion, and street murals.
The bold contrast of dark chocolate and ruby-red cherries mirrors this vibrant artistic identity, making the tart visually striking and culturally resonant.",
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
