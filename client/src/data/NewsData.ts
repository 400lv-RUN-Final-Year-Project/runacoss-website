export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  image: string;
  category: string;
  date: string;
  time: string;
  author: string;
  position: string;
  content: string;
};

export const newsData: NewsItem[] = [
  {
    id: "001",
    title: "Bakeitcute will be live at the Signout Day!!!",
    slug: "bakeitcute-signout-day",
    image: "/assets/news/bakeItCute.jpg",
    category: "Memo",
    date: "12-07-25",
    time: "11:00am",
    author: "Bakeitcute",
    position: "Vendor",
    content: `From rich, creamy cakes to parfaits, Bakeitcute is set to serve delicious treats at the Signout Day! 
Menu includes Foil Cakes, Parfaits, Sign-out Bento Cakes, Cake Loaf, Small Chops, and Sharwarma. 
Visit the Bakeitcute stand at the Main Field and enjoy finger-licking goodness!`,
  },
  {
    id: "002",
    title: "Clash of Faculties — An Epic Showdown!",
    slug: "clash-of-faculties-2025",
    image: "/assets/news/clashOfTitans.jpg",
    category: "Event",
    date: "11-07-25",
    time: "1:00pm",
    author: "Kellogg’s",
    position: "Event Sponsor",
    content: `Join us for the exciting Clash of Faculties with games like Squid Game (Water Gun Edition), Flag Football, Face Painting, Karaoke, Tug of War, and more! 
Faculty color codes are assigned, and refreshments will be available. It's a showdown you don't want to miss!`,
  },
  {
    id: "003",
    title: "FYB WEEK: Payment Notice",
    slug: "fyb-week-payment-notice",
    image: "/assets/news/fybPayment.jpg",
    category: "Finance",
    date: "08-07-25",
    time: "Anytime",
    author: "RUNACOSS",
    position: "FYB Committee",
    content: `All final-year students are to make payment of ₦10,000 for FYB Week. 
Payment deadline is July 8. 
Account Name: Redeemer’s University Student Association, 
Account No: 0160047224 (Premium Trust Bank). 
Send your receipt to your course rep for documentation.`,
  },
  {
    id: "004",
    title: "Sign Out Celebration — Let’s Go Out in Style!",
    slug: "signout-day-announcement",
    image: "/assets/news/signOutTime.jpg",
    category: "Event",
    date: "12-07-25",
    time: "11:00am",
    author: "Kellogg’s",
    position: "Sponsor",
    content: `Signout Day is here! Join us at the Main Field for Squid Game (Water Gun Edition), Face Painting, Karaoke, Tug of War, and lots more. 
Time: 11 AM | Date: 12th July | Venue: Main Field. 
Come celebrate and sign out in style!`,
  },
  {
    id: "005",
    title: "Pleasure Travels: Travel Back Home in Comfort",
    slug: "travel-home-pleasure-travels",
    image: "/assets/news/transport.jpg",
    category: "Transport",
    date: "20-06-25",
    time: "5:00am–6:00am",
    author: "Pleasure Travels",
    position: "Transport Coordinator",
    content: `Book a fully air-conditioned Sienna or bus with refreshments for a comfortable ride back home.
Departure runs from 20th June to 18th July.
Pickup: Boys & Girls Hostel. 
Abuja departs 5:00am (Jabi – ₦35,000).
Lagos departs 6:00am (multiple drop points from ₦15,000–₦18,000). 
Call 09044445700 or any contact on the flyer to book.`,
  },
  {
    id: "006",
    title: "Kellogg’s 'Feel the Crunch' Challenge",
    slug: "kelloggs-crunch-challenge",
    image: "/assets/news/kellogs.jpg",
    category: "Competition",
    date: "11-07-25",
    time: "1:00pm",
    author: "Kellogg's Nigeria",
    position: "Brand Partner",
    content: `Are you ready to crunch your way to ₦50,000 + 3 months’ supply of Kellogg’s goodies? 
    Create a creative video and tag @kelloggsnigeria with the hashtag #KelloggsFeelTheCrunchRUN. 
    Most creative video wins!`
  },
  {
    id: "007",
    title: "RUNSA Election Dates Announced",
    slug: "runsa-election-2025",
    image: "/assets/news/runsaElection.jpg",
    category: "Politics",
    date: "13-06-25",
    time: "8:00am",
    author: "RUNSA",
    position: "Election Committee",
    content: `2025/2026 RUNSA Election: Manifesto Day – June 13, Election Day – June 14. 
    Students are encouraged to participate and vote.`
  },
  {
    id: "008",
    title: "Final Year Thanksgiving - 09 Days to Go!",
    slug: "final-year-thanksgiving",
    image: "/assets/news/thanksgiving.jpg",
    category: "Thanksgiving",
    date: "13-07-25",
    time: "7:50am",
    author: "Agalliao Planning Committee",
    position: "Final Year Committee",
    content: `Final Year Thanksgiving at the Redeemer’s University Chapel. 
    All graduating students are expected to be seated by 7:50 AM sharp.`
  }
];

