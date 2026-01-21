
'use client';

import { useState, useRef, useEffect } from 'react';

interface TermsOfServiceModalProps {
  onContinue: () => void;
  onClose: () => void;
}

const TermsOfServiceModal = ({ onContinue, onClose }: TermsOfServiceModalProps) => {
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const scrollableContentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = scrollableContentRef.current!;
    if (scrollTop + clientHeight >= scrollHeight - 5) { // Add a small buffer
      setIsScrolledToEnd(true);
    }
  };

  useEffect(() => {
    const contentElement = scrollableContentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => {
        contentElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
        </div>
        <div ref={scrollableContentRef} className="p-6 overflow-y-auto max-h-[60vh]">
          <h3 className="text-lg font-semibold mb-2">1. Introduction</h3>
          <p className="mb-4 text-gray-700">
            Welcome to HallBooker. These terms and conditions outline the rules and regulations for the use of HallBooker&apos;s Website, located at hallbooker.com. By accessing this website we assume you accept these terms and conditions. Do not continue to use HallBooker if you do not agree to take all of the terms and conditions stated on this page.
          </p>
          <h3 className="text-lg font-semibold mb-2">2. Intellectual Property Rights</h3>
          <p className="mb-4 text-gray-700">
            Other than the content you own, under these Terms, HallBooker and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.
          </p>
          <h3 className="text-lg font-semibold mb-2">3. Restrictions</h3>
          <p className="mb-4 text-gray-700">
            You are specifically restricted from all of the following: publishing any Website material in any other media; selling, sublicensing and/or otherwise commercializing any Website material; publicly performing and/or showing any Website material; using this Website in any way that is or may be damaging to this Website; using this Website in any way that impacts user access to this Website; using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity.
          </p>
          <h3 className="text-lg font-semibold mb-2">4. Your Content</h3>
          <p className="mb-4 text-gray-700">
            In these Website Standard Terms and Conditions, &ldquo;Your Content&rdquo; shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant HallBooker a non-exclusive, worldwide irrevocable, sub-licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
          </p>
           <h3 className="text-lg font-semibold mb-2">5. No warranties</h3>
          <p className="mb-4 text-gray-700">
           This Website is provided &ldquo;as is,&rdquo; with all faults, and HallBooker express no representations or warranties, of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.
          </p>
          <h3 className="text-lg font-semibold mb-2">6. Limitation of liability</h3>
           <p className="mb-4 text-gray-700">
            In no event shall HallBooker, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. HallBooker, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.
          </p>
        </div>
        <div className="p-6 border-t flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            disabled={!isScrolledToEnd}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${
              isScrolledToEnd
                ? 'bg-primary hover:bg-primary-dark'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServiceModal;
