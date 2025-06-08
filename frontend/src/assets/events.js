import event1 from './image.jpg';
import event2 from './image.jpg';
import event3 from './image.jpg';
import event4 from './image.jpg';
import event5 from './image.jpg';
import event6 from './image.jpg';
import event7 from './image.jpg';
import event8 from './image.jpg';
import event9 from './image.jpg';
import event10 from './image.jpg';
import event11 from './image.jpg';
import event12 from './image.jpg';
import event13 from './image.jpg';
import event14 from './image.jpg';
import team1 from './Dafne.jpg';
import team2 from './Dafne.jpg';
import team3 from './Dafne.jpg';
// ... other imports ...

export const event_list = [
    // Center - Culture & History
    {
        _id: "e1",
        name: "National Museum of Art",
        image: event1,
        cost: 20,
        description: "Explore Romania's largest collection of medieval and modern art in this stunning historical building.",
        reviews: [
            {
                id: "rev1",
                timestamp: "2025-03-15T14:30:00Z",
                userId: "user123",
                userName: "Alexandra Popescu",
                profilePicture: "https://example.com/profiles/alexandra.jpg",
                grade: 5,
                reviewText: "Absolutely stunning collection! The medieval art section was particularly impressive."
            },
            {
                id: "rev2",
                timestamp: "2025-04-02T09:15:00Z",
                userId: "user456",
                userName: "Mihai Ionescu",
                profilePicture: "https://example.com/profiles/mihai.jpg",
                grade: 4,
                reviewText: "Great museum but quite crowded on weekends. The modern art wing is fantastic."
            },
            {
                id: "rev3",
                timestamp: "2025-04-18T16:20:00Z",
                userId: "user789",
                userName: "Elena Dumitrescu",
                profilePicture: "https://example.com/profiles/elena.jpg",
                grade: 5,
                reviewText: "Visited with my art history class - our guide was incredibly knowledgeable!"
            }
        ],
        categories: ["museum", "art"],
        date: "2025-05-18",
        time: "10:00",
        location: {
            exact: "Calea Victoriei 49-53",
            zone: "Center",
            latitude: 44.4377,
            longitude: 26.0975
        }
    },
    {
        _id: "e2",
        name: "Palace of Parliament Tour",
        image: event2,
        cost: 45,
        description: "Guided tour of the world's heaviest building and Romania's most famous landmark.",
       reviews: [
            {
                id: "rev7",
                timestamp: "2025-04-12T22:15:00Z",
                userId: "user678",
                userName: "Victor Enache",
                profilePicture: "https://example.com/profiles/victor.jpg",
                grade: 5,
                reviewText: "Best way to experience Bucharest nightlife! Our guide Alex was amazing."
            },
            {
                id: "rev8",
                timestamp: "2025-04-20T01:30:00Z",
                userId: "user901",
                userName: "Ana Popovici",
                profilePicture: "https://example.com/profiles/ana.jpg",
                grade: 4,
                reviewText: "Great variety of bars, but some were too crowded. Overall a fun experience."
            },
            {
                id: "rev9",
                timestamp: "2025-05-03T23:45:00Z",
                userId: "user234",
                userName: "George Marinescu",
                profilePicture: "https://example.com/profiles/george.jpg",
                grade: 5,
                reviewText: "Met so many interesting people! The craft beer bar was my favorite stop."
            }
        ],
        categories: ["historic", "museum"],
        date: "2025-06-01",
        time: "14:00",
        location: {
            exact: "Strada Izvor 2-4",
            zone: "Center",
            latitude: 44.4279,
            longitude: 26.0872
        }
    },

    // Center - Night Life
    {
        _id: "e3",
        name: "Old Town Pub Crawl",
        image: event3,
        cost: 30,
        description: "Experience Bucharest's vibrant nightlife with a guided tour of the best bars and clubs.",
        review: [],
        categories: ["night life", "events"],
        date: "2025-05-24",
        time: "21:00",
        location: {
            exact: "Meeting point: Universitate Square",
            zone: "Center",
            latitude: 44.4359,
            longitude: 26.1027
        }
    },
    {
        _id: "e4",
        name: "Control Club Live DJ Night",
        image: event4,
        cost: 25,
        description: "Legendary underground venue hosting live DJs, indie bands, and alternative culture events.",
        reviews: [
            {
                id: "rev7",
                timestamp: "2025-04-12T22:15:00Z",
                userId: "user678",
                userName: "Victor Enache",
                profilePicture: "https://example.com/profiles/victor.jpg",
                grade: 5,
                reviewText: "Best way to experience Bucharest nightlife! Our guide Alex was amazing."
            },
            {
                id: "rev8",
                timestamp: "2025-04-20T01:30:00Z",
                userId: "user901",
                userName: "Ana Popovici",
                profilePicture: "https://example.com/profiles/ana.jpg",
                grade: 4,
                reviewText: "Great variety of bars, but some were too crowded. Overall a fun experience."
            },
            {
                id: "rev9",
                timestamp: "2025-05-03T23:45:00Z",
                userId: "user234",
                userName: "George Marinescu",
                profilePicture: "https://example.com/profiles/george.jpg",
                grade: 5,
                reviewText: "Met so many interesting people! The craft beer bar was my favorite stop."
            }
        ],
        categories: ["night life", "music"],
        date: "2025-06-07",
        time: "23:00",
        location: {
            exact: "Strada Constantin Mille 4",
            zone: "Center",
            latitude: 44.4365,
            longitude: 26.1008
        }
    },

    // North - Events & Festivals
    {
        _id: "e5",
        name: "Bucharest International Film Festival",
        image: event5,
        cost: 35,
        description: "Annual showcase of international cinema with premieres and filmmaker Q&As.",
        review: [],
        categories: ["events", "cultural"],
        date: "2025-06-10",
        time: "18:30",
        location: {
            exact: "Cinema Elvire Popesco",
            zone: "North",
            latitude: 44.4605,
            longitude: 26.0932
        }
    },
    {
        _id: "e6",
        name: "BurgerFest 2025",
        image: event6,
        cost: 50,
        description: "Bucharest's biggest burger festival featuring food trucks, contests, and concerts.",
        reviews: [
            {
                id: "rev7",
                timestamp: "2025-04-12T22:15:00Z",
                userId: "user678",
                userName: "Victor Enache",
                profilePicture: "https://example.com/profiles/victor.jpg",
                grade: 5,
                reviewText: "Best way to experience Bucharest nightlife! Our guide Alex was amazing."
            },
            {
                id: "rev8",
                timestamp: "2025-04-20T01:30:00Z",
                userId: "user901",
                userName: "Ana Popovici",
                profilePicture: "https://example.com/profiles/ana.jpg",
                grade: 4,
                reviewText: "Great variety of bars, but some were too crowded. Overall a fun experience."
            },
            {
                id: "rev9",
                timestamp: "2025-05-03T23:45:00Z",
                userId: "user234",
                userName: "George Marinescu",
                profilePicture: "https://example.com/profiles/george.jpg",
                grade: 5,
                reviewText: "Met so many interesting people! The craft beer bar was my favorite stop."
            }
        ],
        categories: ["events", "food"],
        date: "2025-05-17",
        time: "16:00",
        location: {
            exact: "Expoflora, Herăstrău Park",
            zone: "North",
            latitude: 44.4732,
            longitude: 26.0725
        }
    },

    // North - Cafés & Relax
    {
        _id: "e7",
        name: "Therme Bucharest",
        image: event7,
        cost: 90,
        description: "Europe's largest urban wellness center with thermal waters, saunas, and botanical gardens.",
        review: [],
        categories: ["wellness", "spa"],
        date: "2025-05-16",
        time: "09:00",
        location: {
            exact: "Calea Bucureștilor 1K, Otopeni",
            zone: "North",
            latitude: 44.5556,
            longitude: 26.0777
        }
    },
    {
        _id: "e8",
        name: "Origo Coffee Shop",
        image: event8,
        cost: 0,
        description: "Pioneering specialty coffee shop in a minimalist space, perfect for coffee enthusiasts.",
        reviews: [
            {
                id: "rev7",
                timestamp: "2025-04-12T22:15:00Z",
                userId: "user678",
                userName: "Victor Enache",
                profilePicture: "https://example.com/profiles/victor.jpg",
                grade: 5,
                reviewText: "Best way to experience Bucharest nightlife! Our guide Alex was amazing."
            },
            {
                id: "rev8",
                timestamp: "2025-04-20T01:30:00Z",
                userId: "user901",
                userName: "Ana Popovici",
                profilePicture: "https://example.com/profiles/ana.jpg",
                grade: 4,
                reviewText: "Great variety of bars, but some were too crowded. Overall a fun experience."
            },
            {
                id: "rev9",
                timestamp: "2025-05-03T23:45:00Z",
                userId: "user234",
                userName: "George Marinescu",
                profilePicture: "https://example.com/profiles/george.jpg",
                grade: 5,
                reviewText: "Met so many interesting people! The craft beer bar was my favorite stop."
            }
        ],
        categories: ["coffee shop", "cultural"],
        date: "2025-06-03",
        time: "08:00",
        location: {
            exact: "Strada Lipscani 9",
            zone: "North",
            latitude: 44.4321,
            longitude: 26.1033
        }
    },

    // South - Cultural
    {
        _id: "e9",
        name: "Village Museum",
        image: event9,
        cost: 15,
        description: "Open-air museum showcasing traditional Romanian village life with authentic houses from all regions.",
        review: [],
        categories: ["museum", "cultural"],
        date: "2025-05-25",
        time: "11:00",
        location: {
            exact: "Șoseaua Pavel Dimitrievici Kiseleff 28-30",
            zone: "South",
            latitude: 44.4532,
            longitude: 26.0765
        }
    },
    {
        _id: "e10",
        name: "Titan Park Jazz Night",
        image: event10,
        cost: 40,
        description: "Open-air jazz concerts in the beautiful Titan Park every Friday night.",
        reviews: [
            {
                id: "rev7",
                timestamp: "2025-04-12T22:15:00Z",
                userId: "user678",
                userName: "Victor Enache",
                profilePicture: "https://example.com/profiles/victor.jpg",
                grade: 5,
                reviewText: "Best way to experience Bucharest nightlife! Our guide Alex was amazing."
            },
            {
                id: "rev8",
                timestamp: "2025-04-20T01:30:00Z",
                userId: "user901",
                userName: "Ana Popovici",
                profilePicture: "https://example.com/profiles/ana.jpg",
                grade: 4,
                reviewText: "Great variety of bars, but some were too crowded. Overall a fun experience."
            },
            {
                id: "rev9",
                timestamp: "2025-05-03T23:45:00Z",
                userId: "user234",
                userName: "George Marinescu",
                profilePicture: "https://example.com/profiles/george.jpg",
                grade: 5,
                reviewText: "Met so many interesting people! The craft beer bar was my favorite stop."
            }
        ],
        categories: ["music", "cultural"],
        date: "2025-06-06",
        time: "20:00",
        location: {
            exact: "Titan Park, Aleea Circului",
            zone: "South",
            latitude: 44.4112,
            longitude: 26.1333
        }
    },

    // East - Sports
    {
        _id: "e11",
        name: "Bucharest Half Marathon",
        image: event11,
        cost: 120,
        description: "Race through the capital's historic routes with thousands of runners.",
        review: [],
        categories: ["sports", "events"],
        date: "2025-05-19",
        time: "08:00",
        location: {
            exact: "Start: Constitution Square",
            zone: "East",
            latitude: 44.4276,
            longitude: 26.0876
        }
    },
    {
        _id: "e12",
        name: "Football Match: Romania vs Switzerland",
        image: event12,
        cost: 100,
        description: "Friendly match between national teams at Arena Națională.",
        reviews: [
            {
                id: "rev7",
                timestamp: "2025-04-12T22:15:00Z",
                userId: "user678",
                userName: "Victor Enache",
                profilePicture: "https://example.com/profiles/victor.jpg",
                grade: 5,
                reviewText: "Best way to experience Bucharest nightlife! Our guide Alex was amazing."
            },
            {
                id: "rev9",
                timestamp: "2025-05-03T23:45:00Z",
                userId: "user234",
                userName: "George Marinescu",
                profilePicture: "https://example.com/profiles/george.jpg",
                grade: 5,
                reviewText: "Met so many interesting people! The craft beer bar was my favorite stop."
            }
        ],
        categories: ["sports"],
        date: "2025-06-05",
        time: "20:30",
        location: {
            exact: "Arena Națională, Bulevardul Basarabia 37-39",
            zone: "East",
            latitude: 44.4371,
            longitude: 26.1557
        }
    },

    // West - Food
    {
        _id: "e13",
        name: "Bucharest Street Food Festival",
        image: event13,
        cost: 0,
        description: "Huge gathering of food trucks and local producers with live music and entertainment.",
        reviews: [
            {
                id: "rev9",
                timestamp: "2025-05-03T23:45:00Z",
                userId: "user234",
                userName: "George Marinescu",
                profilePicture: "https://example.com/profiles/george.jpg",
                grade: 5,
                reviewText: "Met so many interesting people! The craft beer bar was my favorite stop."
            }
        ],
        categories: ["events", "food"],
        date: "2025-05-30",
        time: "12:00",
        location: {
            exact: "Tineretului Park, Viașului Alley",
            zone: "West",
            latitude: 44.4098,
            longitude: 26.0987
        }
    },
    {
        _id: "e14",
        name: "Wine Tasting Experience",
        image: event14,
        cost: 100,
        description: "Premium Romanian wine tasting with sommelier guidance and cheese pairing.",
        reviews: [
            {
                id: "rev7",
                timestamp: "2025-04-12T22:15:00Z",
                userId: "user678",
                userName: "Victor Enache",
                profilePicture: "https://example.com/profiles/victor.jpg",
                grade: 5,
                reviewText: "Best way to experience Bucharest nightlife! Our guide Alex was amazing."
            },
            {
                id: "rev8",
                timestamp: "2025-04-20T01:30:00Z",
                userId: "user901",
                userName: "Ana Popovici",
                profilePicture: "https://example.com/profiles/ana.jpg",
                grade: 4,
                reviewText: "Great variety of bars, but some were too crowded. Overall a fun experience."
            },
            {
                id: "rev9",
                timestamp: "2025-05-03T23:45:00Z",
                userId: "user234",
                userName: "George Marinescu",
                profilePicture: "https://example.com/profiles/george.jpg",
                grade: 5,
                reviewText: "Met so many interesting people! The craft beer bar was my favorite stop."
            }
        ],
        categories: ["food", "cultural"],
        date: "2025-06-08",
        time: "19:00",
        location: {
            exact: "Calea 13 Septembrie 90",
            zone: "West",
            latitude: 44.4189,
            longitude: 26.0754
        }
    }
];


export const location_zones = [
    "Center",
    "North",
    "South",
    "East",
    "West",
    "Otopeni",
    "Baneasa",
    "Titan",
    "Drumul Taberei"
];

export function getAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.grade, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
}

export const event_categories = [
    {
        category_name: "Culture & History",
        category_image: event12,
        tags: ["museum", "historic", "cultural"]
    },
    {
        category_name: "Night Life",
        category_image: event5,
        tags: ["night life", "bars", "clubs"]
    },
    {
        category_name: "Events & Festivals",
        category_image: event2,
        tags: ["events", "festivals", "music"]
    },
    {
        category_name: "Cafés & Relax",
        category_image: event8,
        tags: ["coffee shop", "wellness", "spa"]
    },
    {
        category_name: "Sports",
        category_image: event11,
        tags: ["sports"]
    },
    {
        category_name: "Food & Drinks",
        category_image: event13,
        tags: ["food", "wine"]
    }
];

// ... teamMembers array remains the same ...

export const teamMembers = [
  {
    id: 1,
    name: "Alex Popescu",
    role: "Founder & CEO",
    bio: "Nightlife enthusiast with a passion for bringing people together",
    image: team1,
    email: "alex@gobucharest.com"
  },
  {
    id: 2,
    name: "Maria Ionescu",
    role: "Head of Events",
    bio: "Knows every hidden gem in Bucharest's party scene",
    image: team2,
    email: "alex@gobucharest.com"
  },
  {
    id: 3,
    name: "Andrei Vasile",
    role: "Tech Lead",
    bio: "Makes sure the platform works flawlessly for your night out",
    image: team3,
    email: "alex@gobucharest.com"
  }
];