import { FAQSupportSection } from "@/components/features/user/faq/FAQSupportSection";
import Faq from './faq'


export default function FaqPage() {
  return (
    <div className="min-h-screen text-white flex flex-col">
      <main className="container mx-auto px-4 py-8 bg-stars flex-grow">
        <div className="max-w-4xl mx-auto space-y-8 flex flex-col ">
          <div className="flex-grow text-center ">
            <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
            <p className="text-gray-300">
              Find answers to common questions below. If you need further assistance, our support team is here to help.
            </p>
          </div>
          <Faq />
          <div className="mt-auto">
            <FAQSupportSection />
          </div>
        </div>
      </main>
    </div>
  );
}