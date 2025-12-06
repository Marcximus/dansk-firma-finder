
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
            <div className="h-[250px] sm:h-[350px] md:h-[400px] flex items-center justify-center">
              <h1 className="text-center text-white text-8xl sm:text-9xl md:text-[12rem] font-bold drop-shadow-[0_0_30px_rgba(97,220,163,0.5)] animate-pulse">
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

