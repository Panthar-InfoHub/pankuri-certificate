import Image from "next/image"
import { Ballet } from "next/font/google"
import { Island_Moments } from "next/font/google";
import { Weight } from "lucide-react"

const islandMomentsFont = Island_Moments({
  subsets: ["latin"],
  weight: "400", 
});


export default function Certificate(certificateProps) {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-8 md:p-12 lg:p-16 flex items-center justify-center">
      <div className="w-full max-w-4xl border border-gray-300 shadow-lg overflow-hidden relative">
        {/* Top Section - Dark Blue */}
        <div className="bg-[#040159] text-white text-center py-16 px-8 relative z-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif tracking-widest mb-2">ACADMA</h2>
          <h1
            className={` ${islandMomentsFont.className} text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold italic leading-none mb-4 `}
            style={{ fontFamily: "serif" }}
          >
            Certificate
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-serif tracking-widest">OF APPRECIATION</p>
        </div>

        {/* Gold Ribbon Shapes */}
        <div className="relative flex justify-between h-12 -mt-1">
          {" "}
          {/* -mt-1 to slightly overlap for seamless look */}
          <div
            className="bg-[#c8b100] w-[48%] h-full"
            style={{ clipPath: "polygon(0 0, 100% 0, 90% 100%, 0% 100%)" }}
          ></div>
          <div
            className="bg-[#c8b100] w-[48%] h-full"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 10% 100%)" }}
          ></div>
        </div>

        {/* Middle Section - White */}
        <div className="bg-white text-center py-16 px-8">
          <p className="text-xl sm:text-2xl md:text-3xl font-serif mb-8">This certificate is proudly presented to</p>
          <div className="border-b border-gray-400 w-3/4 mx-auto mb-12 h-8">{certificateProps.Name}</div> {/* Line for name */}
          <p className="text-xl sm:text-2xl md:text-3xl font-serif mb-4">For Successful Completion of The Course</p>
          <p className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">{certificateProps.Name}</p>{/*Course name */}
        </div>

        {/* Bottom Section - White with Date, Signature, and Seal */}
        <div className="bg-white py-16 px-8 flex flex-col sm:flex-row items-center justify-around gap-8">
          <div className="flex flex-col items-center">
            <div className="border-b border-gray-400 w-48 mb-2 h-8">{certificateProps.Name}</div>{/*Date*/}
            <p className="text-lg font-serif">Date</p>
          </div>
          <div className="flex-shrink-0">
            <Image
              src="/placeholder.svg?height=150&width=150"
              alt="Award ribbon seal"
              width={150}
              height={150}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-center">
            <div className="border-b border-gray-400 w-48 mb-2 h-8"></div>
            <p className="text-lg font-serif">Signature</p>
          </div>
        </div>
      </div>
    </div>
  )
}


  