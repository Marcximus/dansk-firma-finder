
"use client";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import LetterGlitch from "@/components/ui/LetterGlitch";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="relative font-serif min-h-screen flex items-center justify-center overflow-hidden">
      {/* LetterGlitch Background */}
      <div className="absolute inset-0 z-0">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>
      
      {/* Content */}
      <div className="container mx-auto relative z-10">
        <div className="flex justify-center">
          <div className="w-full sm:w-10/12 md:w-8/12 text-center">
            <div
              className="bg-[url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)] h-[250px] sm:h-[350px] md:h-[400px] bg-center bg-no-repeat bg-contain"
              aria-hidden="true"
            >
              <h1 className="text-center text-white text-6xl sm:text-7xl md:text-8xl pt-6 sm:pt-8 drop-shadow-lg">
                404
              </h1>
            </div>

            <div className="mt-[-50px]">
              <h3 className="text-2xl text-white sm:text-3xl font-bold mb-4 drop-shadow-lg">
                Det ser ud til, at du er faret vild
              </h3>
              <p className="mb-6 text-white/90 sm:mb-5 drop-shadow">
                Den side, du leder efter, er ikke tilgængelig!
              </p>

              <Button
                variant="default"
                onClick={() => navigate("/")}
                className="my-5 bg-green-600 hover:bg-green-700"
              >
                Gå til forsiden
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

