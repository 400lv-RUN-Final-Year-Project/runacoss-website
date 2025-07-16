import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

const faqs = [
  {
    question:
      "What is the Redeemer’s University Association of Computer Science Students (RUNACOSS)?",
    answer:
      "RUNACOSS is the official student body representing Computer Science students at Redeemer’s University. It fosters academic excellence, networking, and tech innovation.",
  },
  {
    question: "How do I become a member of RUNACOSS?",
    answer:
      "As a registered student in the Computer Science department, you’re already a member!",
  },
  {
    question: "Is there a way to contact lecturers through this platform?",
    answer:
      "Not yet. This platform currently supports student academic resources only.",
  },
  {
    question: "Can I interact with other students on this platform?",
    answer: "Yes, we’re building forums and study groups — stay tuned!",
  },
  {
    question: "Can I suggest new features for the platform?",
    answer: "Absolutely. Use the contact form to share your ideas.",
  },
  {
    question: "Can I use the materials on this platform?",
    answer:
      "Yes, but only for academic purposes. Redistribution is discouraged.",
  },
  {
    question: "What are the objectives of RUNACOSS?",
    answer:
      "To equip students with tech skills, promote innovation, and build industry-ready graduates.",
  },
];

const Contact = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    const templateParams = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      question: formData.get("question") as string,
      attachment: (formData.get("attachment") as string) || "No link provided",
    };

    const sendUser = emailjs.send(
      "service_an10dme",
      "template_i72tung",
      templateParams,
      "op4dKIqZYm-JB-njj"
    );

    const sendAdmin = emailjs.send(
      "service_an10dme",
      "template_75hh347",
      templateParams,
      "op4dKIqZYm-JB-njj"
    );

    Promise.all([sendUser, sendAdmin])
      .then(() => {
        alert("Your message has been sent!");
        formRef.current?.reset();
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        alert("Something went wrong. Please try again.");
      });
  };

  return (
    <>
      <div className="px-6 md:px-20 pb-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* FAQ Section */}
        <div>
          <h1 className="text-2xl font-extrabold text-primary mb-6">FAQs</h1>
          <p className="font-semibold mb-6">
            Have a question? Check below before reaching out!
          </p>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b-2 border-gray-200">
                <button
                  className="w-full text-left py-4 flex justify-between items-center"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  <span className="text-xl">
                    {activeIndex === index ? "−" : "+"}
                  </span>
                </button>
                {activeIndex === index && faq.answer && (
                  <div className="px-4 pb-4 text-sm text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-primary text-white p-6 md:p-10 rounded-md space-y-5">
          <h2 className="text-xl font-bold mb-4">Ask Your Questions</h2>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm">
                Name
              </label>
              <input
                name="name"
                id="name"
                type="text"
                required
                className="w-full p-3 rounded-md text-black"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm">
                Email *
              </label>
              <input
                name="email"
                id="email"
                type="email"
                required
                className="w-full p-3 rounded-md text-black"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="subject" className="text-sm">
                Subject
              </label>
              <input
                name="subject"
                id="subject"
                type="text"
                className="w-full p-3 rounded-md text-black"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="question" className="text-sm">
                Question *
              </label>
              <textarea
                name="question"
                id="question"
                required
                className="w-full p-3 rounded-md h-28 text-black"
              ></textarea>
            </div>

            <div className="space-y-1 !mb-4">
              <label htmlFor="attachment" className="text-sm">
                Attachment Link (optional)
              </label>
              <input
                name="attachment"
                id="attachment"
                type="text"
                placeholder="Paste file link here"
                className="w-full p-3 rounded-md text-black"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-secondary text-primary font-semibold px-6 py-3 rounded-3xl shadow-md text-base"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Contact;
