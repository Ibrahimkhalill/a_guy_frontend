import { Telescope } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudyLandingPage() {
  const navigation = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
            <img src="/logo.svg" alt="" className="h-[42px] w-[42px]" />
          </div>
          <span className=" font-medium text-[30px] text-primary-500">
            A-Guy
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          {/* Icon */}
          <div className=" rounded-full flex items-center justify-center mx-auto mb-8">
            <img src="/logo.svg" alt="" className="h-[104px] w-[104px]" />
          </div>

          {/* Heading */}
          <h1 className="text-[48px] font-medium text-gray-900 mb-4 leading-tight">
            Brainstorm faster
            <br />
            stress less
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-[18px] mb-8 leading-relaxed">
            Your always-ready partner for studying, revising,
            <br />
            and conquering deadlines.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigation("/login")}
            className="bg-primary-500 cursor-pointer hover:bg-primary-300 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto">
            Get started
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
