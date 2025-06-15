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

export const harshQuotes: Quote[] = [
  {
    text: "You've been making excuses for days. Your goals are collecting dust while you collect comfort.",
    author: "Reality Check"
  },
  {
    text: "The gym doesn't miss you, but your future self will regret what you're not doing today.",
    author: "Hard Truth"
  },
  {
    text: "Every day you skip is a day your competition gets stronger. What's your excuse this time?",
    author: "Wake Up Call"
  },
  {
    text: "Your body is keeping score of every missed workout. The bill is coming due.",
    author: "Accountability"
  },
  {
    text: "Dreams don't work unless you do. Stop dreaming and start sweating.",
    author: "No Mercy"
  },
  {
    text: "The only thing worse than starting over is wishing you had. Stop wishing, start working.",
    author: "Tough Love"
  },
  {
    text: "Your comfort zone is a beautiful place, but nothing ever grows there. Time to get uncomfortable.",
    author: "Push Forward"
  },
  {
    text: "Everyone has the same 24 hours. Champions just use theirs differently than you do.",
    author: "Time Management"
  },
  {
    text: "Your body can stand almost anything. It's your mind that you have to convince. Stop convincing it to quit.",
    author: "Mental Toughness"
  },
  {
    text: "The voice in your head that says you can't do this is lying. The one that says you won't is telling the truth.",
    author: "Inner Battle"
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

export function getMotivationalQuote(daysSinceLastWorkout: number): Quote {
  // Use harsh quotes if user hasn't worked out for 3+ days
  if (daysSinceLastWorkout >= 3) {
    const today = new Date().toDateString();
    const hash = today.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const index = Math.abs(hash) % harshQuotes.length;
    return harshQuotes[index];
  }
  
  // Use regular quotes for recent activity
  return getDailyQuote();
}
