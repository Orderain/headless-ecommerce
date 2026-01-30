"use client";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ name, price }) {
  const phoneNumber = "923327507761";
  const message = encodeURIComponent(
    `Hi, I am interested in buying ${name} priced at $${price}. Is it still available?`,
  );

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group inline-flex items-center justify-center gap-2
        w-full sm:w-auto
        bg-[#25D366] hover:bg-[#1da851]
        text-white font-semibold
        px-4 py-3 sm:px-6 sm:py-3.5
        text-sm sm:text-base
        rounded-xl sm:rounded-full
        transition-all duration-300
        shadow-md hover:shadow-lg
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-[#25D366]/60
      "
    >
      <MessageCircle
        className="
          w-4 h-4 sm:w-5 sm:h-5
          transition-transform duration-300
          group-hover:rotate-12
        "
      />
      <span className="whitespace-nowrap">Order via WhatsApp</span>
    </a>
  );
}
