import { Quote } from "@shared/schema";

export const quotes: Quote[] = [
  {
    text: "The worst thing I can be is the same as everybody else. I hate that.",
    author: "Arnold Schwarzenegger"
  },
  {
    text: "Success isn't given. It's earned. On the track, on the field, in the gym. With blood, sweat, and the occasional tear.",
    author: "Nike"
  },
  {
    text: "Champions keep playing until they get it right.",
    author: "Billie Jean King"
  },
  {
    text: "The body achieves what the mind believes.",
    author: "Napoleon Hill"
  },
  {
    text: "Strength does not come from physical capacity. It comes from an indomitable will.",
    author: "Mahatma Gandhi"
  },
  {
    text: "The successful warrior is the average man with laser-like focus.",
    author: "Bruce Lee"
  },
  {
    text: "If you want something you've never had, you must be willing to do something you've never done.",
    author: "Thomas Jefferson"
  },
  {
    text: "The pain you feel today will be the strength you feel tomorrow.",
    author: "Unknown"
  },
  {
    text: "Don't limit your challenges, challenge your limits.",
    author: "Unknown"
  },
  {
    text: "A champion is someone who gets up when they can't.",
    author: "Jack Dempsey"
  }
];

export function getRandomQuote(): Quote {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function getDailyQuote(): Quote {
  // Use current date as seed for consistent daily quote
  const today = new Date().toDateString();
  const hash = today.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const index = Math.abs(hash) % quotes.length;
  return quotes[index];
}
