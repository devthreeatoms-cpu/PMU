"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
          <Send className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-heading italic">Transmission Received</h3>
          <p className="text-zinc-400 text-sm italic">Our concierge team will respond within 24 hours.</p>
        </div>
        <Button
          onClick={() => setSubmitted(false)}
          variant="link"
          className="text-brand-gold text-[10px] font-bold tracking-widest"
        >
          SEND ANOTHER MESSAGE
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="grid md:grid-cols-2 gap-8">
        <FormInput label="Full Name" placeholder="Artist Name" isRequired />
        <FormInput label="Email Address" placeholder="artist@example.com" type="email" isRequired />
      </div>
      <FormInput label="Subject" placeholder="Inquiry Type" />
      <div className="space-y-3">
        <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 ml-4">Message</label>
        <textarea
          required
          placeholder="How can we assist your artistry?"
          className="w-full bg-zinc-50 border-none rounded-[2rem] p-6 focus:ring-2 focus:ring-brand-gold/20 min-h-[160px] text-zinc-600 outline-none transition-all placeholder:italic placeholder:text-zinc-300"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-16 bg-brand-rose text-white hover:bg-brand-gold rounded-full font-bold tracking-[0.4em] text-[10px] transition-all duration-700 shadow-2xl shadow-brand-gold/10"
      >
        TRANSMIT INQUIRY
      </Button>
    </form>
  );
}

function FormInput({
  label,
  placeholder,
  type = "text",
  isRequired = false,
}: {
  label: string;
  placeholder: string;
  type?: string;
  isRequired?: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 ml-4">{label}</label>
      <input
        required={isRequired}
        type={type}
        placeholder={placeholder}
        className="w-full h-14 bg-zinc-50 border-none rounded-full px-6 focus:ring-2 focus:ring-brand-gold/20 text-zinc-600 outline-none transition-all placeholder:italic placeholder:text-zinc-300"
      />
    </div>
  );
}
